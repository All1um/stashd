import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') ?? '';
const SERPAPI_KEY    = Deno.env.get('SERPAPI_KEY')    ?? '';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// ── Stealth header rotation ──────────────────────────────────

const USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
];

function stealthHeaders(): Record<string, string> {
  const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  return {
    'User-Agent':                ua,
    'Accept':                    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language':           'en-CA,en;q=0.9',
    'Accept-Encoding':           'gzip, deflate, br',
    'Cache-Control':             'no-cache',
    'Pragma':                    'no-cache',
    'Sec-Fetch-Dest':            'document',
    'Sec-Fetch-Mode':            'navigate',
    'Sec-Fetch-Site':            'none',
    'Upgrade-Insecure-Requests': '1',
  };
}

// ── Types ────────────────────────────────────────────────────

interface ProductExtract {
  name:        string | null;
  price:       number | null;
  image_url:   string | null;
  images:      string[];
  description: string | null;
  store_name:  string | null;
}

interface CrossStorePrice {
  store_name: string;
  price:      number;
  store_url:  string;
}

// ── Utility: absolute URL resolution ────────────────────────

function toAbsolute(src: string, base: string): string {
  if (!src) return src;
  try {
    return new URL(src, base).href;
  } catch {
    return src;
  }
}

// ── Tier 1: JSON-LD parser ───────────────────────────────────
// Extracts structured product data from <script type="application/ld+json"> blocks.

function parseJsonLd(html: string, baseUrl: string): Partial<ProductExtract> | null {
  const scriptRe = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;

  while ((match = scriptRe.exec(html)) !== null) {
    try {
      const raw = match[1].trim();
      const parsed = JSON.parse(raw);
      const nodes: unknown[] = Array.isArray(parsed)
        ? parsed
        : parsed['@graph']
        ? parsed['@graph']
        : [parsed];

      for (const node of nodes) {
        const obj = node as Record<string, unknown>;
        const type = String(obj['@type'] ?? '');
        if (!type.includes('Product')) continue;

        // Price — may be nested in offers
        let price: number | null = null;
        const offers = obj['offers'] as Record<string, unknown> | undefined;
        if (offers) {
          const rawPrice = offers['price'] ?? offers['lowPrice'];
          price = rawPrice !== undefined ? parseFloat(String(rawPrice)) : null;
          if (isNaN(price as number)) price = null;
        }

        // Images — image can be string, object, or array
        const rawImages = obj['image'];
        const imageArr: string[] = [];
        if (typeof rawImages === 'string') {
          imageArr.push(toAbsolute(rawImages, baseUrl));
        } else if (Array.isArray(rawImages)) {
          for (const img of rawImages) {
            if (typeof img === 'string') imageArr.push(toAbsolute(img, baseUrl));
            else if (img && typeof img === 'object' && 'url' in img) {
              imageArr.push(toAbsolute(String((img as Record<string,unknown>)['url']), baseUrl));
            }
          }
        } else if (rawImages && typeof rawImages === 'object' && 'url' in rawImages) {
          imageArr.push(toAbsolute(String((rawImages as Record<string,unknown>)['url']), baseUrl));
        }

        const description = obj['description']
          ? String(obj['description']).slice(0, 1000)
          : null;

        const name = obj['name'] ? String(obj['name']) : null;
        const brand = obj['brand'];
        const brandName = brand && typeof brand === 'object'
          ? String((brand as Record<string,unknown>)['name'] ?? '')
          : typeof brand === 'string' ? brand : null;

        if (name || price) {
          return {
            name,
            price,
            image_url:   imageArr[0] ?? null,
            images:      imageArr,
            description,
            store_name:  brandName,
          };
        }
      }
    } catch {
      // malformed JSON-LD — continue to next block
    }
  }
  return null;
}

// ── Tier 2: OpenGraph parser ─────────────────────────────────

function parseMeta(html: string, baseUrl: string): Partial<ProductExtract> {
  function getMeta(property: string): string | null {
    // Matches both property= and name= variants
    const re = new RegExp(
      `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
      'i',
    );
    const m = re.exec(html);
    if (m) return m[1];
    // Also try content= before property=
    const re2 = new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
      'i',
    );
    const m2 = re2.exec(html);
    return m2 ? m2[1] : null;
  }

  const name  = getMeta('og:title') ?? getMeta('twitter:title') ?? getMeta('title') ?? null;
  const image = getMeta('og:image') ?? getMeta('twitter:image') ?? null;
  const desc  = getMeta('og:description') ?? getMeta('description') ?? null;

  // Price: product:price:amount or og:price:amount
  const priceStr = getMeta('product:price:amount') ?? getMeta('og:price:amount') ?? null;
  const price    = priceStr ? parseFloat(priceStr.replace(/[^0-9.]/g, '')) : null;

  const imageAbs = image ? toAbsolute(image, baseUrl) : null;

  return {
    name:        name?.slice(0, 300) ?? null,
    price:       price && !isNaN(price) ? price : null,
    image_url:   imageAbs,
    images:      imageAbs ? [imageAbs] : [],
    description: desc?.slice(0, 1000) ?? null,
    store_name:  null,
  };
}

// ── Tier 3: Gemini extraction (last resort) ──────────────────

async function extractWithGemini(html: string, baseUrl: string): Promise<ProductExtract> {
  const truncated = html.slice(0, 18_000);

  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: [
            'Extract product information from the HTML below.',
            'Return ONLY a raw JSON object — no markdown, no code fences.',
            'Required fields:',
            '  name        (string)         — full product title',
            '  price       (number)         — numeric price, no currency symbol (e.g. 329.99)',
            '  image_url   (string)         — absolute URL of the main product image',
            '  images      (string[])       — array of all product image URLs found (max 8)',
            '  description (string | null)  — retailer product description, max 500 chars',
            '  store_name  (string)         — retailer name (e.g. "Amazon", "Best Buy")',
            'Use null for any field you cannot find. images should be an empty array if none found.',
            `Base URL for resolving relative paths: ${baseUrl}`,
            '',
            'HTML:',
            truncated,
          ].join('\n'),
        }],
      }],
      generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini error ${res.status}: ${body}`);
  }

  const data = await res.json();
  const raw  = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';

  try {
    const parsed = JSON.parse(raw);
    return {
      name:        parsed.name        ?? null,
      price:       parsed.price       ?? null,
      image_url:   parsed.image_url   ?? null,
      images:      Array.isArray(parsed.images) ? parsed.images : [],
      description: parsed.description ?? null,
      store_name:  parsed.store_name  ?? null,
    };
  } catch {
    return { name: null, price: null, image_url: null, images: [], description: null, store_name: null };
  }
}

// ── Universal Parser: JSON-LD → OG → Gemini ─────────────────

async function universalParse(html: string, baseUrl: string): Promise<ProductExtract> {
  // Tier 1: JSON-LD
  const jsonLd = parseJsonLd(html, baseUrl);
  if (jsonLd?.name && jsonLd?.price) {
    // JSON-LD found complete data — fill any gaps with OG meta
    const og = parseMeta(html, baseUrl);
    return {
      name:        jsonLd.name,
      price:       jsonLd.price,
      image_url:   jsonLd.image_url ?? og.image_url ?? null,
      images:      jsonLd.images?.length ? jsonLd.images : (og.images ?? []),
      description: jsonLd.description ?? og.description ?? null,
      store_name:  jsonLd.store_name ?? null,
    };
  }

  // Tier 2: OpenGraph / meta tags
  const og = parseMeta(html, baseUrl);
  if (og.name && og.price) {
    return {
      name:        og.name,
      price:       og.price,
      image_url:   og.image_url ?? null,
      images:      og.images ?? [],
      description: og.description ?? null,
      store_name:  og.store_name ?? null,
    };
  }

  // Tier 3: Gemini fallback — only if API key is configured
  if (!GEMINI_API_KEY) {
    return {
      name:        og.name ?? jsonLd?.name ?? null,
      price:       og.price ?? jsonLd?.price ?? null,
      image_url:   og.image_url ?? jsonLd?.image_url ?? null,
      images:      og.images ?? jsonLd?.images ?? [],
      description: og.description ?? jsonLd?.description ?? null,
      store_name:  jsonLd?.store_name ?? null,
    };
  }

  const gemini = await extractWithGemini(html, baseUrl);
  // Merge: prefer gemini for missing fields, keep og where gemini is null
  return {
    name:        gemini.name        ?? og.name        ?? jsonLd?.name        ?? null,
    price:       gemini.price       ?? og.price       ?? jsonLd?.price       ?? null,
    image_url:   gemini.image_url   ?? og.image_url   ?? jsonLd?.image_url   ?? null,
    images:      gemini.images?.length ? gemini.images : (og.images?.length ? og.images : (jsonLd?.images ?? [])),
    description: gemini.description ?? og.description ?? jsonLd?.description ?? null,
    store_name:  gemini.store_name  ?? jsonLd?.store_name ?? null,
  };
}

// ── SerpAPI cross-store prices ───────────────────────────────

const GEO: Record<string, { gl: string; hl: string }> = {
  CA: { gl: 'ca', hl: 'en' },
  US: { gl: 'us', hl: 'en' },
  GB: { gl: 'gb', hl: 'en' },
  AU: { gl: 'au', hl: 'en' },
  DE: { gl: 'de', hl: 'de' },
  FR: { gl: 'fr', hl: 'fr' },
};

async function fetchCrossStorePrices(
  productName: string,
  country_code = 'CA',
): Promise<CrossStorePrice[]> {
  if (!SERPAPI_KEY || !productName) return [];

  const geo = GEO[country_code.toUpperCase()] ?? { gl: 'ca', hl: 'en' };

  const url = new URL('https://serpapi.com/search');
  url.searchParams.set('engine',  'google_shopping');
  url.searchParams.set('q',       productName);
  url.searchParams.set('api_key', SERPAPI_KEY);
  url.searchParams.set('gl',      geo.gl);
  url.searchParams.set('hl',      geo.hl);
  url.searchParams.set('num',     '5');

  const res = await fetch(url.toString());
  if (!res.ok) return [];

  const data    = await res.json();
  const results: CrossStorePrice[] = [];

  for (const item of (data.shopping_results ?? []).slice(0, 5)) {
    const rawPrice = String(item.price ?? '').replace(/[^0-9.]/g, '');
    const price    = parseFloat(rawPrice);
    if (!isNaN(price)) {
      results.push({
        store_name: item.source ?? 'Unknown',
        price,
        store_url:  item.link ?? '',
      });
    }
  }

  return results;
}

// ── Captcha / bot-wall detection ─────────────────────────────

function looksLikeCaptcha(html: string): boolean {
  const lower = html.toLowerCase();
  return (
    lower.includes('captcha') ||
    lower.includes('robot') ||
    lower.includes('are you human') ||
    lower.includes('access denied') ||
    (lower.includes('cloudflare') && lower.length < 8000)
  );
}

// ── Handler ──────────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { url, country_code = 'CA' } = await req.json();

    if (!url || typeof url !== 'string') {
      return new Response(
        JSON.stringify({ error: 'url is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 1. Fetch product page with stealth headers
    const pageRes = await fetch(url, { headers: stealthHeaders() });

    if (!pageRes.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch page: ${pageRes.status}` }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const html = await pageRes.text();

    // 2. Bot-wall check
    if (looksLikeCaptcha(html)) {
      return new Response(
        JSON.stringify({ error: 'This retailer blocks automated access. Try pasting product details manually.' }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 3. Universal parse: JSON-LD → OG → Gemini
    const product = await universalParse(html, url);

    // 4. Cross-store prices via SerpAPI (best-effort)
    const crossStorePrices = product.name
      ? await fetchCrossStorePrices(product.name, country_code)
      : [];

    return new Response(
      JSON.stringify({ ...product, crossStorePrices }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
