# Stashd — Project Context for Claude Code

## What This Is
Stashd is a universal wishlist and price tracker. Users save products from ANY online store into organized lists, track price changes automatically, compare prices across retailers, get alerts when prices drop, and buy at the cheapest price through affiliate links.

## Core Promise
"Save anything. Track everything. Buy at the best price."

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** Supabase (Postgres + Auth + Storage + Edge Functions)
- **State:** Zustand
- **Charts:** Recharts
- **Animations:** Framer Motion
- **AI:** Claude Haiku for product recommendations
- **Scraping:** Puppeteer / Cheerio (via Supabase Edge Functions)
- **Price API:** SerpAPI / Google Shopping API
- **Email:** Resend
- **Deployment:** Vercel (free tier)

## Design Tokens (ALWAYS follow these)
- Background: `#0A0A0A`
- Surface/Cards: `#141414` with `#1E1E1E` borders
- Gold accent: `#D4A853` (prices, active states, chart lines, "best price" badges)
- Orange CTA: `#E8652B` (primary buttons, interactive elements)
- Text primary: `#F5F0E8`
- Text secondary: `#6B6B6B`
- Price down: `#2ECC71` (green)
- Price up: `#E74C3C` (red)
- Fonts: Playfair Display (headings), Inter (body), DM Mono (prices/numbers)
- Border radius: 12-16px cards, 9999px pills
- All dark theme. No light backgrounds anywhere.

## Database Tables
- `products` — user-saved products (name, url, image_url, store_name, original_price, current_price, lowest_price)
- `lists` — user wishlists (name, emoji, is_default)
- `list_items` — junction: products ↔ lists (many-to-many)
- `price_history` — every price check logged (product_id, price, checked_at)
- `price_alerts` — user price targets (target_price, target_percentage, is_triggered)
- `cross_store_prices` — cached prices from other retailers for same product
- `affiliate_clicks` — tracks every buy click for revenue

## Key Screens
1. Dashboard (home) — stats, recent drops, recent saves, floating + button
2. My Lists — grid of list cards with emoji, name, count, total value
3. List Detail — product cards with price change indicators, sort/filter
4. Product Detail — large image, price history chart, cross-store comparison, alert config
5. Alerts — active alerts with progress bars, triggered alerts with Buy Now CTA
6. Add Product Modal — paste URL → auto-extract → select list → save

## Key Components
- `BottomNav` — 5 tabs: Home, Lists, Add (+), Alerts, Profile
- `ProductCard` — image, name, store badge, current price, change indicator
- `PriceChart` — Recharts line chart, gold line, 30/60/90 day toggle
- `CrossStoreComparison` — list of stores with prices, "Best Price" gold badge
- `AlertCard` — product, current→target price, progress bar
- `AddProductModal` — URL paste → auto-extract preview → save
- `FloatingAddButton` — orange circle, + icon, bottom-right
- `QuickStats` — 2x2 grid of stat cards on dashboard
- `DropCard` — horizontal scroll card showing price drop

## File Structure Convention
- Pages: `src/app/[route]/page.tsx`
- Components: `src/components/[feature]/ComponentName.tsx`
- API routes: `src/app/api/[endpoint]/route.ts`
- Store: `src/store/useStashdStore.ts`
- Lib: `src/lib/supabase.ts`, `src/lib/utils.ts`, `src/lib/scraper.ts`
- Config: `src/config/theme.json`
- Types: `src/lib/types.ts`

## Code Rules
- Always TypeScript, never plain JS
- Always Tailwind classes, never inline styles
- Always use the design tokens above — never default shadcn colors
- Components must be small and focused — one component, one job
- Zustand for shared state, React useState for local UI state
- All Supabase queries go through lib/supabase.ts
- Affiliate links: always log click to affiliate_clicks table BEFORE opening URL in new tab
- Mobile-first: design for 390px, scale up
- Price scraping: batch process, not sequential. Check 500 products in parallel.
- Alerts: only send when genuine (>5% drop or below target). No spam.

## Monetization
- Affiliate commissions on every "Buy at Best Price" click (Amazon Associates, Best Buy, Walmart)
- Future: freemium premium tier ($4.99/mo for unlimited products, advanced alerts, price predictions)

## PRD Location
Full product requirements, user flows, database schema, component tree, JSON config, API routes, Zustand store, and Base44 prompt are in `docs/PHASE-0-PRD.md`
