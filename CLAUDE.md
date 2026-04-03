# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (Vite)
npm run build        # Production build
npm run lint         # Check for lint errors (quiet mode)
npm run lint:fix     # Auto-fix lint errors
npm run preview      # Preview production build
```

There are no tests configured. `npm run typecheck` runs tsc but the project uses `.jsx` files, not `.tsx`, so type coverage is limited.

## Architecture

**This is NOT the Next.js/Supabase stack described in `.claude/rules/stashd-context.md`.** The actual implementation is a **Vite + React 18 SPA** with **Supabase** (Postgres + Auth + Edge Functions) as the live backend. The PRD in `docs/` describes future architecture; ignore it for current code.

### Routing — manual tab switching, not React Router
`App.jsx` renders `Home.jsx`, which renders `StashdApp.jsx`. Navigation is entirely `useState` — `activeTab` controls which page renders; `selectedProduct`/`selectedList` control drill-down views. No URL-based routing for sub-pages.

### Data — live Supabase backend
All data comes from Supabase. Key tables: `products`, `lists`, `list_items` (junction), `price_history`, `price_alerts`. Auth via `src/lib/AuthContext.jsx` (provides `user` + `profile`). All queries use `src/lib/supabase.js`.

Supabase Edge Functions live in `supabase/functions/`:
- `scrape-product` — fetches a URL, extracts product data via JSON-LD → OG → meta → Gemini fallback, returns cross-store prices via SerpAPI
- `discover-products` — Google Shopping search via SerpAPI + Gemini AI advice
- Both deployed with `--no-verify-jwt` (use `sb_publishable_` key, not a JWT)

### Component structure
- `src/pages/` — full-screen views: `Dashboard`, `Lists`, `ListDetail`, `ProductDetail`, `Alerts`, `Profile`, `Discovery`, `Onboarding`
- `src/components/` — `BottomNav`, `AddProductModal`, `ProductImage`, `StashdPlaceholder`; feature subdirs `dashboard/` and `product/`
- `src/components/ui/` — shadcn/ui primitives (do not lint-check these)
- `src/utils/marketLogic.js` — `meiFromPrices(currentPrice, pricesArray)` returns `{ score, label, color }`
- `src/lib/toast.jsx` — unified Sonner v2 helpers: `toastSuccess(title, desc)` / `toastInfo(title, desc)`. **Use these everywhere — never import `toast` from `sonner` directly.** Sonner v2 does not support `descriptionStyle`; descriptions are JSX elements.
- State passed via props from `StashdApp.jsx`; no global store

### Image handling
Always use `<ProductImage src={url} alt={...} size="sm|md|lg" />` — never bare `<img>`. It swaps to `<StashdPlaceholder>` on error or missing src. Size `lg` renders a full-width hero (220px tall).

### Environment setup
Create `.env.local`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

## Design tokens (always use these, never defaults)

| Token | Value |
|---|---|
| Background | `#0A0A0A` |
| Cards/Surface | `#141414`, border `#1E1E1E` |
| Gold accent | `#D4A853` |
| Orange CTA | `#E8652B` |
| Text primary | `#F5F0E8` |
| Text secondary | `#6B6B6B` |
| Price down | `#2ECC71` |
| Price up | `#E74C3C` |

Fonts: `fontFamily: 'Playfair Display, serif'` headings, `fontFamily: 'Inter'` body, `fontFamily: 'DM Mono, monospace'` all prices/numbers/data labels.

All styling is inline `style={{}}` objects — no Tailwind for color/font/spacing in new code (Tailwind used only for layout utilities like `flex`, `grid`, `gap`, `truncate`).

## ESLint scope

Lint only applies to `src/components/**` and `src/pages/**`. `src/lib/**` and `src/components/ui/**` are excluded. Key enforced rules: no unused imports (`error`), unused vars (`warn`), hooks rules (`error`). `react/prop-types` is off.
