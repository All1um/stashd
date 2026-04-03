# PROJECT_CONTEXT.md — Stashd Universal Handover

> **For any AI model onboarding to this repository.**
> Read this file before touching any code. It contains non-obvious decisions, naming contracts, and system state that cannot be derived by scanning individual files.

---

## 1. PROJECT IDENTITY

**Stashd** is a premium, site-agnostic market intelligence tool — the "Moonsift Standard" for price tracking. Core promise: *Save anything. Track everything. Buy at the best price.*

Users paste a product URL from any retailer → Stashd extracts the product, tracks price changes over time, fires alerts when the price drops, and surfaces cross-store comparison prices.

**Current version:** 1.5.0  
**Monetisation:** Affiliate click commissions on "Buy at Best Price" CTAs.

---

## 2. TECH STACK

| Layer | Technology | Version |
|---|---|---|
| Frontend | React + JSX (not TSX) | 18.2 |
| Build | Vite | 6.1 |
| Styling | Tailwind CSS (utility layout only) + inline `style={{}}` for all colour/font/spacing | 3.4 |
| Database / Auth | Supabase (Postgres + Auth + Edge Functions) | JS SDK 2.10 |
| Charts | Recharts (`AreaChart` + gold gradient) | 2.15 |
| Toasts | Sonner | 2.0 |
| AI extraction | Gemini 1.5 Flash (via Supabase Edge Function) | — |
| Price search | SerpAPI Google Shopping | — |

**Runtime note:** There is no Next.js, no React Router, no Zustand, no TypeScript in source files. The `.claude/rules/stashd-context.md` describes a future architecture — **ignore it for current code.**

---

## 3. THE AESTHETIC-ALPHA DESIGN SYSTEM

Every colour, font, and spacing value is hardcoded inline. **Never use Tailwind colour/font classes in new code.** Use Tailwind only for layout utilities (`flex`, `grid`, `gap`, `truncate`, `overflow-hidden`, etc.).

### 3.1 Colour Tokens

| Token | Hex | Usage |
|---|---|---|
| Deep Black | `#0A0A0A` | Page backgrounds |
| Elevated Surface | `#141414` | Cards, modals, sheets |
| Border | `#1E1E1E` | Card borders, dividers |
| Interactive Surface | `#2E2E2E` | Input backgrounds, hover states |
| **Gold accent** | `#D4A853` | Prices, active nav, chart lines, alert badges, CTA outlines |
| **Orange CTA** | `#E8652B` | Primary buttons, FAB, "Save" actions |
| Text primary | `#F5F0E8` | Headings, primary copy |
| Text secondary | `#6B6B6B` | Labels, metadata, disabled |
| Price down (good) | `#2ECC71` | Drop indicators, savings, "Strong Buy" MEI |
| Price up (bad) | `#E74C3C` | Increase indicators, alert badges, "Overvalued" MEI |

### 3.2 Typography

| Role | Font | Style rule |
|---|---|---|
| Luxury headers | `Playfair Display, serif` | Page titles, card names, product titles |
| Body / UI copy | `Inter` | Labels, descriptions, button text |
| **All monetary values** | `DM Mono, monospace` | Prices, stats, MEI scores, data labels |

**Rule:** Every price, percentage, and numeric data label **must** use `fontFamily: 'DM Mono, monospace'`. No exceptions.

### 3.3 Border Radius

- Cards / modals: `borderRadius: '16px'` (`rounded-2xl`)
- Pills / badges: `borderRadius: '9999px'`
- Inputs: `borderRadius: '12px'` (`rounded-xl`)

---

## 4. NAVIGATION & LAYOUT CONTRACT

### BottomNav — 6-Column CSS Grid

```
| Assets | Lists | ← FAB (72px) → | Discover | Alerts | Profile |
```

- `nav`: `position: fixed`, `zIndex: 1000`, `overflow: visible` (critical — FAB protrudes above the bar)
- Tab row: `display: grid; grid-template-columns: 1fr 1fr 72px 1fr 1fr 1fr`
- **FAB**: `position: absolute`, `left: 50%`, `transform: translateX(-50%)`, `top: -28px`, `zIndex: 1001`, `width: 56px`, `height: 56px`, orange `#E8652B`, `border-radius: 50%`, `box-shadow: 0 4px 24px rgba(232,101,43,0.6), 0 0 0 4px #0D0D0D`
- The 72px centre column is a spacer `<div />` — the FAB is absolutely positioned on top of it

### Manual Tab Routing (no React Router)

`StashdApp.jsx` is the sole router. `activeTab` state switches between pages. Drill-down views (`selectedProduct`, `selectedList`) overlay the tab views. There are zero URL changes on navigation.

---

## 5. DATABASE SCHEMA — CRITICAL CONTRACTS

### Table: `products`
`id, user_id, name, url, image_url, store_name, original_price, current_price, lowest_price, is_archived, created_at`

### Table: `lists`
`id, user_id, name, emoji, created_at`

### Table: `list_items` (junction)
`id, list_id, product_id` — **products are NOT linked via a `wishlist_id` column**. They are linked through this junction table.

### Table: `price_history`
`id, product_id, price, checked_at`

### Table: `price_alerts`
`id, user_id, product_id, target_price, alert_type, is_triggered, is_active, created_at`
- `alert_type` CHECK constraint: only `'price'` or `'percentage'` — never `'percent_drop'`
- UNIQUE constraint: `(user_id, product_id)` — always `upsert` with `onConflict: 'user_id,product_id'`

### camelCase vs snake\_case Map

| Frontend camelCase | Supabase snake_case |
|---|---|
| `currentPrice` | `current_price` |
| `originalPrice` | `original_price` |
| `imageUrl` / `image` | `image_url` |
| `storeName` / `store` | `store_name` |
| `checkedAt` | `checked_at` |
| `createdAt` | `created_at` |

**Pattern:** All components defensively normalise: `product?.current_price ?? product?.currentPrice ?? 0`.

---

## 6. EDGE FUNCTIONS

Located in `supabase/functions/`. Both deployed with `--no-verify-jwt` (public `sb_publishable_` key, not a JWT).

### `scrape-product`

**Universal Parser hierarchy** (v1.5.0):

```
1. JSON-LD  →  <script type="application/ld+json"> @type: Product
2. OpenGraph →  og:title, og:price:amount, og:image, og:description
3. Meta tags →  <meta name="title">, product:price:amount
4. Gemini    →  Last resort, 18k HTML truncated to Gemini 1.5 Flash
```

Returns: `{ name, price, image_url, images: string[], description, store_name, crossStorePrices[] }`

- `toAbsolute(src, baseUrl)` — resolves relative image paths against the page's base URL. Applied to every image extracted from JSON-LD and OG tags.
- Bot-wall detection: if response HTML contains `captcha`, `robot`, `access denied`, or Cloudflare patterns — returns a user-friendly 422 error instead of feeding garbage to Gemini.

### `discover-products`

Google Shopping search via SerpAPI + Gemini AI advisory. Returns `shoppingResults[]` with `{ title, price, store, image_url, product_url }` and a `geminiAdvice` string.

---

## 7. VERSION 1.5.0 FEATURE STATE

### Universal Scraper (Phase B) ✓
JSON-LD → OG → meta → Gemini. `images[]` array + `description` field now returned. `toAbsolute()` normalisation in place.

### Swipeable Media Gallery (Phase C-3) ✓
`src/components/product/SwipeableGallery.jsx` — touch-swipe, CSS transform, **gold expanding dot pagination**. Falls back to single `image_url` when `product.images` is empty/null. Used as the hero in `ProductDetail.jsx`.

### One-Click Stash (Phase C-2) ✓
Discovery `+ Stash` button → calls `onStash(result)` prop → `StashdApp.handleStash()` → sets `addModalPrefill` state → opens `AddProductModal` with `prefill` prop pre-loaded. **No background re-scrape needed** — Discovery result data is sufficient to pre-populate the modal.

### Resilience (Phase A-2) ✓
All `Promise.all` data-fetching chains have `.catch(() => setLoading(false))`. The spinner can never hang indefinitely.

### BottomNav Grid (Phase A-1) ✓
Converted from `display: flex` to `display: grid` with 6 explicit columns. `zIndex: 1000/1001`.

---

## 8. SHARED UTILITIES — NEVER BYPASS THESE

### `src/lib/toast.jsx` — Sonner v2 wrapper
```js
import { toastSuccess, toastInfo } from '@/lib/toast';
toastSuccess('Title', 'description');
toastInfo('Title', 'description');
```
**Never import `toast` from `sonner` directly.** Sonner v2 removed `descriptionStyle` — descriptions are wrapped in a `<Desc>` JSX component with inline gold DM Mono styling.

### `src/components/ProductImage.jsx` — image with placeholder fallback
```jsx
<ProductImage src={url} alt="name" size="sm|md|lg" style={{...}} />
```
Swaps to `<StashdPlaceholder>` on `onError` or when `src` is null. **Never use bare `<img>` tags for product images.**

### `src/components/StashdPlaceholder.jsx` — S-monogram placeholder
Sizes: `sm` (40px), `md` (60px), `lg` (full-width 220px with "STASHD" sub-label). **Never use generic box icons or emoji as image fallbacks.**

### `src/utils/marketLogic.js` — MEI scoring
```js
import { meiFromPrices } from '@/utils/marketLogic';
const mei = meiFromPrices(currentPrice, pricesArray);
// returns { score: 0-100, label: string, color: hex }
```

---

## 9. CODING GUIDELINES

1. **No bare `<img>` tags.** Use `<ProductImage>`.
2. **No emoji fallbacks.** Use `<StashdPlaceholder>`.
3. **No raw `toast()` calls.** Use `toastSuccess` / `toastInfo` from `@/lib/toast`.
4. **All prices/numbers in DM Mono.** `fontFamily: 'DM Mono, monospace'` — no exceptions.
5. **Inline styles for design tokens.** Tailwind for layout only.
6. **No `.catch()` omissions on async chains.** Every `Promise.all` and `supabase.*` chain must have a catch that at minimum calls `setLoading(false)`.
7. **`alert_type` must be `'price'` or `'percentage'`** — never `'percent_drop'` or any other string.
8. **Price alerts use `upsert`** with `onConflict: 'user_id,product_id'` — not `insert`.
9. **New products seed `price_history`** — always `INSERT` one row into `price_history` immediately after inserting into `products`.

---

## 10. ENVIRONMENT

```bash
# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...

# Supabase Edge Function secrets (set via Supabase dashboard)
GEMINI_API_KEY=...
SERPAPI_KEY=...
```

```bash
npm run dev        # Vite dev server
npm run build      # Production build (verify with this before committing)
npm run lint       # ESLint — must be zero errors
npm run lint:fix   # Auto-fix lint errors
```

ESLint scope: `src/components/**` and `src/pages/**` only. `src/lib/**` and `src/components/ui/**` are excluded. Key rules: no unused imports (`error`), no unused vars (`warn`), hooks rules (`error`).

---

---

## 11. MODEL DELEGATION & ESCALATION PROTOCOL

This section defines the task boundary between local and cloud AI models working on Stashd.

### Gemma 4 Domain — Execute Immediately

These tasks are self-contained, low-risk, and reversible. No escalation needed.

- **CSS / Tailwind styling** — Aesthetic-Alpha visual tweaks, spacing, layout adjustments
- **Boilerplate React components** — New presentational components following existing patterns
- **Logic refactoring** — camelCase ↔ snake_case normalisations, extracting repeated code into helpers
- **Documentation** — JSDoc comments, inline code explanations, README updates
- **Simple bug fixes** — UI rendering issues, prop mismatches, typos in strings
- **Unit tests** — Isolated function tests with no cross-system dependencies

### Claude Pro Domain — Flag for Escalation

These tasks carry architectural, security, or reasoning risk. Gemma must not attempt them.

- **Complex scraper logic** — Regex or DOM selectors for new heavily-shielded retailers (Amazon bot detection, Cloudflare-gated sites, JS-rendered SPAs)
- **Security & RLS** — Any change to Supabase Row Level Security policies or Auth flows
- **Architecture decisions** — Designing new database tables, cross-file state management patterns, or major refactors that touch 5+ files
- **Edge Function logic** — Deno/TypeScript logic in `supabase/functions/` involving data transformation, external API integration, or error recovery strategy

### Mandatory Escalation Response

If a user prompt falls into the Claude Pro Domain, Gemma **must** respond with the following — verbatim — before doing anything else:

> ⚠️ **ESCALATION REQUIRED:** This task involves high-level [Architecture / Security / Scraper Logic / Edge Function] which exceeds my local reasoning capacity. Please switch to **Claude Pro** for this specific task to ensure Stashd system integrity.

Do not attempt a partial implementation. Do not guess. Escalate first.

---

*Last updated: v1.5.0 — Universal Scraper + Swipeable Gallery + One-Click Stash deployed.*
