# Stashd

**Universal Wisdom for Smart Shopping.**

Save products from any online store, track price changes automatically, compare prices across retailers, and buy at the best price.

## Stack

- **Frontend:** Vite + React 18 (JSX)
- **Backend:** Supabase (Postgres + Auth + Edge Functions)
- **AI:** Gemini 1.5 Flash (product extraction + regional advice)
- **Search:** SerpAPI Google Shopping (geo-aware)
- **Styling:** Tailwind CSS + DM Mono / Playfair Display / Inter

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.env.local`:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the Supabase migrations in `docs/supabase/`
5. Deploy Edge Functions: `supabase functions deploy`
6. Start dev server: `npm run dev`

## Commands

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run lint      # Lint check
npm run lint:fix  # Auto-fix lint errors
```
