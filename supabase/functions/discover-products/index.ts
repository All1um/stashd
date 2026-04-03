import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') ?? '';
const SERPAPI_KEY    = Deno.env.get('SERPAPI_KEY')    ?? '';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// ── Country → SerpAPI geo params ──────────────────────────

const GEO: Record<string, { gl: string; hl: string }> = {
  CA: { gl: 'ca', hl: 'en' },
  US: { gl: 'us', hl: 'en' },
  GB: { gl: 'gb', hl: 'en' },
  AU: { gl: 'au', hl: 'en' },
  DE: { gl: 'de', hl: 'de' },
  FR: { gl: 'fr', hl: 'fr' },
  JP: { gl: 'jp', hl: 'ja' },
  NZ: { gl: 'nz', hl: 'en' },
};

const DEFAULT_GEO = { gl: 'ca', hl: 'en' };

// ── Types ────────────────────────────────────────────────

interface ShoppingResult {
  title:       string;
  price:       number;
  currency:    string;
  store:       string;
  image_url:   string;
  product_url: string;
  is_best:     boolean;
}

// ── SerpAPI search ───────────────────────────────────────

async function searchShopping(
  query: string,
  country_code: string,
  currency: string,
): Promise<ShoppingResult[]> {
  if (!SERPAPI_KEY) return [];

  const geo = GEO[country_code.toUpperCase()] ?? DEFAULT_GEO;

  const params = new URLSearchParams({
    engine:  'google_shopping',
    q:       query,
    api_key: SERPAPI_KEY,
    gl:      geo.gl,
    hl:      geo.hl,
    num:     '12',
  });

  const res = await fetch(`https://serpapi.com/search?${params}`);
  if (!res.ok) return [];

  const data = await res.json();
  const raw  = (data.shopping_results ?? []) as Record<string, unknown>[];

  const results: ShoppingResult[] = raw
    .slice(0, 12)
    .map((item) => {
      const rawPrice = String(item.price ?? '').replace(/[^0-9.]/g, '');
      return {
        title:       String(item.title    ?? ''),
        price:       parseFloat(rawPrice) || 0,
        currency,
        store:       String(item.source   ?? ''),
        image_url:   String(item.thumbnail ?? ''),
        product_url: String(item.link      ?? ''),
        is_best:     false,
      };
    })
    .filter((r) => r.price > 0 && r.title);

  // Mark the cheapest result
  if (results.length > 0) {
    const minPrice = Math.min(...results.map((r) => r.price));
    const best = results.find((r) => r.price === minPrice);
    if (best) best.is_best = true;
  }

  return results;
}

// ── Gemini AI regional advice ────────────────────────────

async function getGeminiAdvice(
  query: string,
  region: string,
  country_code: string,
  currency: string,
  topResults: ShoppingResult[],
): Promise<string> {
  if (!GEMINI_API_KEY || topResults.length === 0) return '';

  const snippet = topResults
    .slice(0, 4)
    .map((r) => `${r.store}: ${currency} ${r.price.toFixed(2)}`)
    .join(', ');

  const prompt = [
    `You are a concise regional shopping assistant.`,
    `The user in ${region}, ${country_code} is searching for "${query}".`,
    `Current prices: ${snippet}.`,
    `Give ONE short sentence of actionable regional advice (max 18 words).`,
    `Include the best store name and price in ${currency}. Be specific to the region.`,
    `Example: "Best price in Vancouver is at Best Buy for CA$279 — ships same day."`,
  ].join(' ');

  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 60 },
    }),
  });

  if (!res.ok) return '';
  const data = await res.json();
  return (data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '').trim();
}

// ── Handler ──────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const {
      query        = '',
      country_code = 'CA',
      region       = 'Canada',
      currency     = 'CAD',
    } = await req.json();

    if (!query.trim()) {
      return new Response(
        JSON.stringify({ error: 'query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (!SERPAPI_KEY) {
      return new Response(
        JSON.stringify({ error: 'SERPAPI_KEY is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Fetch shopping results once, then use them for Gemini advice
    const shoppingResults = await searchShopping(query, country_code, currency);
    const geminiAdvice    = await getGeminiAdvice(query, region, country_code, currency, shoppingResults);

    return new Response(
      JSON.stringify({ shoppingResults, geminiAdvice }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
