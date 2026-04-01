# STASHD — PHASE 0: PRODUCT DEFINITION

**Date:** 2026-03-31
**Status:** Foundation document. Feeds directly into Base44 (Phase 1) and Claude Code/Cursor (Phase 2).
**Rule:** Nothing gets designed or coded that isn't defined here first.

---

## 1. PRODUCT REQUIREMENTS DOCUMENT (PRD)

### 1.1 What Is Stashd?
A web app (and future mobile app) where people save products from ANY online store into one universal wishlist, track prices across multiple retailers automatically, get alerts when prices drop, and find the cheapest place to buy anything — all in one clean, dark, premium interface.

### 1.2 The Problem
People shopping online currently:
- Have wishlists scattered across 10+ stores (Amazon, Target, Walmart, Best Buy, IKEA, Etsy...)
- Manually check 4-5 websites to compare prices for a single product
- Use screenshots, browser tabs, and notes apps as makeshift shopping lists
- Don't know if a "sale" is a real deal or a fake discount
- Lost trust in Honey (class action lawsuit, 8M users lost) and can't find an alternative
- CamelCamelCamel only tracks Amazon. Keepa costs $35/month. Nothing works across all stores.

### 1.3 The Solution
One app. Save anything from any store. See the cheapest price across all retailers instantly. Get alerts when prices actually drop. Organize everything in clean lists. Buy at the best price in one tap.

### 1.4 Target Users

| Persona | Description | What They Want |
|---------|-------------|----------------|
| **The Deal Hunter** | 20-40, actively shops for deals, browses r/Frugal and r/deals. Checks multiple stores before buying anything. | "Tell me where this is cheapest right now." |
| **The Wishlist Hoarder** | Any age, saves everything they like but never organizes it. Has 200+ items across bookmarks, screenshots, and store wishlists. | "One place for everything I want to buy eventually." |
| **The Budget Planner** | 25-45, plans purchases around paychecks and sales. Tracks spending carefully. | "Alert me when I can afford it — when the price hits my target." |
| **The Gift Planner** | Any age, saves gift ideas for family/friends throughout the year. Needs to share lists. | "Save ideas all year, share my list when someone asks what I want." |

### 1.5 Core Value Proposition
"Save anything. Track everything. Buy at the best price."

### 1.6 Success Metrics (First 90 Days)
- 1,000+ registered users
- 10,000+ products saved across all users
- 500+ price alerts set
- 2,000+ affiliate link clicks
- $100-500 in affiliate revenue
- Featured on Product Hunt (target: 600+ upvotes)
- Chrome extension: 500+ installs

### 1.7 Platform Priority
1. **Web app (MVP)** — responsive, mobile-first design
2. **Chrome extension** — "Save to Stashd" button on any website
3. **PWA** — add-to-homescreen for mobile users
4. **Native iOS** — Capacitor wrap or React Native rebuild (Phase 3+)

---

## 2. FEATURE SET

### 2.1 MVP Features (Phase 1 — Build This First)

**Universal Save:**
- Save any product by pasting a URL
- Auto-extract: product name, image, price, store name from the URL
- Manual add (name + price + optional image) for stores that resist scraping
- Chrome extension: right-click or toolbar button → "Save to Stashd"

**Smart Lists:**
- Create unlimited wishlists (Tech Wishlist, Gift Ideas, Home Upgrades, etc.)
- Default "All Items" list shows everything
- Drag to reorder items within a list
- Move items between lists
- Each list shows total cost of all items

**Price Tracking:**
- Track price changes for saved products (Amazon, Walmart, Best Buy, Target supported at launch)
- Price history chart per product (line graph, last 30/60/90 days)
- Current price vs. saved price comparison (green if dropped, red if increased)
- "Best price right now" badge showing which retailer is cheapest

**Price Alerts:**
- Set a target price per product ("Alert me when this drops below $X")
- Set percentage-based alerts ("Alert me when this drops 20%+")
- Email notifications (Phase 1)
- Push notifications (Phase 2, after PWA)
- Alert dashboard: see all active alerts and their status

**Cross-Store Price Comparison:**
- For any saved product, show the price across all major retailers
- Google Shopping API integration for broad price data
- Side-by-side comparison view
- "Buy at Best Price" button → affiliate link to cheapest retailer

**Authentication:**
- Google OAuth (one-tap sign in)
- Email + password
- Guest mode: save up to 10 items without signing up (stored in localStorage, migrated on signup)

**Dashboard / Home:**
- Recent price drops across all saved items
- "Deals for you" section: items that dropped significantly
- Quick stats: total items saved, total value, total potential savings
- Recent activity feed

### 2.2 Phase 2 Features (After MVP Validated)

- Shared wishlists (send a link, others can view/add)
- Browser extension for Firefox and Safari
- Product recommendations ("People who saved this also saved...")
- AI assistant: "Find me the best laptop under $1000 CAD"
- Coupon/promo code integration
- Budget goals: "I want to spend under $500 this month on my tech list"
- Import from Amazon Wishlist, other platforms
- Barcode scanner (mobile: scan in-store, compare online prices)

### 2.3 Phase 3 Features (Growth)

- Social feed: see what trending products people are saving
- Retailer partnerships: exclusive deals for Stashd users
- Price prediction: "This product typically drops 30% on Black Friday"
- Multi-currency support for international shoppers
- API for developers (embed Stashd price data)

---

## 3. USER FLOWS

### 3.1 Flow A — Save a Product (Core Loop)

```
[Dashboard / Any Screen]
    │
    ├── Tap "+" floating action button (bottom-right)
    │
    ▼
[Add Product Modal]
    │
    ├── Paste URL field (primary, auto-focused)
    │   ├── User pastes a product URL
    │   ├── App auto-fetches: name, image, price, store
    │   ├── User sees preview card with extracted data
    │   ├── User can edit name/price if needed
    │   ├── Select which list to save to (dropdown, default: "All Items")
    │   ├── Optional: set price alert ("Alert me below $X")
    │   └── Tap "Save to Stashd" → item saved
    │
    ├── OR "Add Manually" toggle
    │   ├── Product name (required)
    │   ├── Price (required)
    │   ├── Store name (optional)
    │   ├── Image URL or upload (optional)
    │   ├── Product URL (optional)
    │   └── Tap "Save" → item saved
    │
    ▼
[Dashboard updates]
    ├── New item appears at top of list
    ├── Total value recalculates
    └── If alert was set, alert badge appears on item
```

### 3.2 Flow B — Browse & Manage Lists

```
[Lists Screen]
    │
    ├── See all lists in a grid/list view
    │   ├── Each list card shows: name, item count, total value, thumbnail collage
    │   ├── Tap a list → opens list detail
    │   └── "+" button → create new list (name + optional emoji icon)
    │
    ▼
[List Detail Screen]
    │
    ├── List name as header (editable)
    ├── Sort options: Date Added | Price Low→High | Price High→Low | Name
    ├── Filter: All | Dropped | Increased | Alerted
    │
    ├── Item cards (vertical scroll):
    │   ├── Product image (left)
    │   ├── Product name + store badge (center)
    │   ├── Current price in gold (right)
    │   │   ├── If price dropped: green arrow ↓ + percentage + original price strikethrough
    │   │   ├── If price increased: red arrow ↑ + percentage
    │   │   └── If unchanged: just the price
    │   ├── Tap card → opens Product Detail
    │   ├── Swipe left → Delete from list
    │   └── Swipe right → Move to another list
    │
    ├── Bottom: "Total: $X,XXX" in gold DM Mono
    └── Share button (Phase 2)
```

### 3.3 Flow C — Product Detail & Price Comparison

```
[Product Detail Screen]
    │
    ├── Product image (large, top)
    ├── Product name (Playfair Display)
    ├── Store badge + "Saved on [date]"
    │
    ├── Price Section:
    │   ├── Current price (large, gold, DM Mono)
    │   ├── Price when saved (strikethrough if different)
    │   ├── Change indicator: "↓ 15% since you saved it" or "↑ 8%"
    │   └── "Lowest price seen: $X on [date]"
    │
    ├── Price History Chart:
    │   ├── Line chart (30/60/90 day toggle)
    │   ├── Gold line on dark background
    │   ├── Dots marking significant drops
    │   └── Current price marker
    │
    ├── Cross-Store Comparison:
    │   ├── "Compare Prices" section header
    │   ├── List of retailers with this product:
    │   │   ├── Amazon: $X [Buy button]
    │   │   ├── Walmart: $X [Buy button]
    │   │   ├── Best Buy: $X [Buy button]
    │   │   └── (cheapest gets a gold "Best Price" badge)
    │   └── Powered by Google Shopping data
    │
    ├── Alert Section:
    │   ├── Current alert status (if set)
    │   ├── "Set Price Alert" button → opens alert config
    │   │   ├── Target price slider or manual entry
    │   │   ├── OR percentage drop selector (10%, 20%, 30%, custom)
    │   │   └── Notification preference (email, push)
    │   └── "Remove Alert" if already set
    │
    ├── Actions:
    │   ├── "Buy at Best Price →" (large CTA, burnt orange, affiliate link)
    │   ├── "Move to List" → list selector
    │   ├── "Delete" → confirmation → remove
    │   └── "Share" (Phase 2)
    │
    └── Back to list
```

### 3.4 Flow D — Price Alerts Dashboard

```
[Alerts Screen]
    │
    ├── Active Alerts tab:
    │   ├── List of all products with active alerts
    │   ├── Each shows: product name, current price, target price, progress bar
    │   │   (how close current price is to target)
    │   ├── Tap → goes to Product Detail
    │   └── Swipe left → remove alert
    │
    ├── Triggered Alerts tab:
    │   ├── Products that hit their target price
    │   ├── Each shows: product name, alert price, current price, "Buy Now" CTA
    │   ├── Gold highlight/glow on triggered items
    │   └── "Buy at Best Price →" button per item
    │
    └── Alert Settings:
        ├── Email notifications: on/off
        ├── Push notifications: on/off (Phase 2)
        ├── Alert frequency: instant / daily digest / weekly digest
        └── Quiet hours: don't send between X-Y
```

### 3.5 Flow E — Authentication

```
[Auth triggers when user tries to:]
    ├── Save more than 10 items (guest limit)
    ├── Set a price alert
    ├── Create a second list
    ├── Access profile/settings
    └── Share a list

[Auth Modal]
    │
    ├── "Continue with Google" (primary, one-tap)
    ├── OR email + password form
    │   ├── Sign Up tab
    │   └── Log In tab
    │
    ├── On success:
    │   ├── Modal closes
    │   ├── Guest items migrate to account
    │   ├── Original action completes
    │   └── Profile created in Supabase
    │
    └── Supabase Auth handles:
        ├── Session management (JWT)
        ├── Google OAuth flow
        ├── Password hashing
        └── Email verification (OFF for MVP)
```

### 3.6 Flow F — Profile & Settings

```
[Profile Screen]
    │
    ├── User info: avatar (Google or default), display name, email
    ├── Stats: X items saved, Y alerts active, Z lists, total value tracked
    │
    ├── Tabs:
    │   ├── "Activity" — recent saves, price changes, triggered alerts
    │   ├── "Settings":
    │   │   ├── Default list for new saves
    │   │   ├── Alert preferences (email, frequency)
    │   │   ├── Currency preference (CAD/USD default)
    │   │   ├── Dark mode (always on, no light mode)
    │   │   └── Logout
    │   └── "About" — version, links, privacy policy
    │
    └── "Export My Data" button (CSV download of all saved products)
```

### 3.7 Flow G — Chrome Extension

```
[User is on any product page (e.g., Amazon, Best Buy)]
    │
    ├── Clicks Stashd extension icon in toolbar
    │   OR right-clicks → "Save to Stashd"
    │
    ▼
[Extension Popup]
    │
    ├── Auto-extracted: product name, image, price, store
    ├── Select list (dropdown)
    ├── Optional: set price alert checkbox + target price
    ├── "Save to Stashd" button
    │
    ├── On save:
    │   ├── Popup shows "Saved ✓" confirmation
    │   ├── Item appears in web app on next visit
    │   └── If not logged in: prompts sign-in first
    │
    └── [Extension badge shows total saved items count]
```

---

## 4. DATA SCHEMA (Supabase)

### 4.1 Tables

#### `products`
Every product a user saves. This is user-specific — each user has their own product entries.

```sql
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT,
  image_url TEXT,
  store_name TEXT,
  store_domain TEXT,
  original_price DECIMAL(10,2) NOT NULL,
  current_price DECIMAL(10,2),
  lowest_price DECIMAL(10,2),
  lowest_price_date TIMESTAMPTZ,
  currency TEXT DEFAULT 'CAD',
  category TEXT,
  notes TEXT,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_user ON products(user_id);
CREATE INDEX idx_products_store ON products(store_domain);
CREATE INDEX idx_products_created ON products(created_at DESC);
```

#### `lists`
User-created wishlists/collections.

```sql
CREATE TABLE lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'My Wishlist',
  emoji TEXT DEFAULT '📦',
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lists_user ON lists(user_id);
```

#### `list_items`
Junction table: which products are in which lists. A product can be in multiple lists.

```sql
CREATE TABLE list_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID REFERENCES lists(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(list_id, product_id)
);

CREATE INDEX idx_list_items_list ON list_items(list_id);
CREATE INDEX idx_list_items_product ON list_items(product_id);
```

#### `price_history`
Every price check logged for historical charts.

```sql
CREATE TABLE price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  store_domain TEXT,
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_price_history_product ON price_history(product_id);
CREATE INDEX idx_price_history_date ON price_history(checked_at DESC);
```

#### `price_alerts`
User-defined price targets.

```sql
CREATE TABLE price_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  target_price DECIMAL(10,2),
  target_percentage INTEGER,
  alert_type TEXT CHECK (alert_type IN ('price', 'percentage')) DEFAULT 'price',
  is_triggered BOOLEAN DEFAULT false,
  triggered_at TIMESTAMPTZ,
  notification_method TEXT CHECK (notification_method IN ('email', 'push', 'both')) DEFAULT 'email',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_alerts_user ON price_alerts(user_id);
CREATE INDEX idx_alerts_active ON price_alerts(is_active) WHERE is_active = true;
CREATE INDEX idx_alerts_product ON price_alerts(product_id);
```

#### `cross_store_prices`
Cached price data from other retailers for the same product.

```sql
CREATE TABLE cross_store_prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL,
  store_url TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'CAD',
  affiliate_url TEXT,
  last_checked TIMESTAMPTZ DEFAULT NOW(),
  is_available BOOLEAN DEFAULT true
);

CREATE INDEX idx_cross_prices_product ON cross_store_prices(product_id);
```

#### `affiliate_clicks`
Tracks every click on a buy/affiliate link.

```sql
CREATE TABLE affiliate_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  user_id UUID REFERENCES auth.users(id),
  store_name TEXT,
  source TEXT CHECK (source IN ('product_detail', 'list_view', 'alert', 'comparison', 'extension')),
  affiliate_url TEXT,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clicks_product ON affiliate_clicks(product_id);
CREATE INDEX idx_clicks_date ON affiliate_clicks(clicked_at);
```

### 4.2 Row Level Security (RLS)

```sql
-- Products: users own their data
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own products" ON products FOR ALL USING (auth.uid() = user_id);

-- Lists: users own their data
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own lists" ON lists FOR ALL USING (auth.uid() = user_id);

-- List items: through list ownership
ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage items in own lists" ON list_items FOR ALL
  USING (list_id IN (SELECT id FROM lists WHERE user_id = auth.uid()));

-- Price history: read through product ownership
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own product history" ON price_history FOR SELECT
  USING (product_id IN (SELECT id FROM products WHERE user_id = auth.uid()));

-- Price alerts: users own their alerts
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own alerts" ON price_alerts FOR ALL USING (auth.uid() = user_id);

-- Cross store prices: readable by product owner
ALTER TABLE cross_store_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read cross prices for own products" ON cross_store_prices FOR SELECT
  USING (product_id IN (SELECT id FROM products WHERE user_id = auth.uid()));

-- Affiliate clicks: insert by anyone (tracking), read by admin
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert clicks" ON affiliate_clicks FOR INSERT WITH CHECK (true);
```

### 4.3 Supabase Auth Config
- **Providers:** Email/Password + Google OAuth
- **Email confirmation:** OFF for MVP
- **Auto-confirm:** ON
- **Minimum password:** 6 characters
- **Site URL:** https://stashd.app (or Vercel URL)
- **Redirect URLs:** https://stashd.app/auth/callback

### 4.4 Supabase Storage
- **Bucket: `product-images`** — user write, public read (for manually uploaded product images)

### 4.5 Supabase Edge Functions
- **`scrape-product`** — receives a URL, extracts product data (name, image, price, store), returns JSON
- **`check-prices`** — cron job, runs every 6 hours, checks all tracked products for price changes
- **`send-alerts`** — triggered by check-prices, sends email notifications for triggered alerts

---

## 5. COMPONENT LIST (Full Hierarchy)

### 5.1 Component Tree

```
<App>
├── <RootLayout>                              [src/app/layout.tsx]
│   ├── <ThemeProvider>                       [providers/ThemeProvider.tsx]
│   ├── <AuthProvider>                        [providers/AuthProvider.tsx]
│   ├── <Toaster>                             [shadcn toast notifications]
│   └── <BottomNav>                           [components/BottomNav.tsx]
│
├── <DashboardPage>                           [src/app/page.tsx]
│   ├── <DashboardHeader>                     [components/dashboard/DashboardHeader.tsx]
│   │   ├── "Stashd" logo text (Playfair Display)
│   │   ├── Search bar (search saved products)
│   │   └── Profile avatar (links to /profile)
│   ├── <QuickStats>                          [components/dashboard/QuickStats.tsx]
│   │   ├── Total items saved
│   │   ├── Total value tracked
│   │   ├── Active alerts
│   │   └── Price drops this week
│   ├── <RecentDrops>                         [components/dashboard/RecentDrops.tsx]
│   │   └── <DropCard> × N                    [components/dashboard/DropCard.tsx]
│   │       ├── Product image (small)
│   │       ├── Product name
│   │       ├── Price change (green ↓ or red ↑)
│   │       ├── Current price (gold)
│   │       └── "Buy" button (small, orange)
│   ├── <RecentSaves>                         [components/dashboard/RecentSaves.tsx]
│   │   └── <ProductRow> × N
│   └── <FloatingAddButton>                   [components/FloatingAddButton.tsx]
│       └── "+" icon → opens AddProductModal
│
├── <ListsPage>                               [src/app/lists/page.tsx]
│   ├── <ListsHeader>                         [components/lists/ListsHeader.tsx]
│   │   ├── "My Lists" title
│   │   └── "New List" button
│   ├── <ListGrid>                            [components/lists/ListGrid.tsx]
│   │   └── <ListCard> × N                    [components/lists/ListCard.tsx]
│   │       ├── Emoji icon
│   │       ├── List name
│   │       ├── Item count
│   │       ├── Total value (gold)
│   │       └── Thumbnail collage (4 product images)
│   └── <FloatingAddButton>
│
├── <ListDetailPage>                          [src/app/lists/[id]/page.tsx]
│   ├── <ListDetailHeader>                    [components/lists/ListDetailHeader.tsx]
│   │   ├── List name (editable)
│   │   ├── Sort dropdown
│   │   ├── Filter chips (All, Dropped, Increased, Alerted)
│   │   └── Total cost (gold)
│   ├── <ProductList>                         [components/products/ProductList.tsx]
│   │   └── <ProductCard> × N                 [components/products/ProductCard.tsx]
│   │       ├── Product image (left)
│   │       ├── Product name + store badge (center)
│   │       ├── Current price + change indicator (right)
│   │       ├── Alert icon (if alert active)
│   │       ├── Swipe left: delete
│   │       └── Swipe right: move to list
│   └── <FloatingAddButton>
│
├── <ProductDetailPage>                       [src/app/product/[id]/page.tsx]
│   ├── <ProductImage>                        [components/product/ProductImage.tsx]
│   ├── <ProductInfo>                         [components/product/ProductInfo.tsx]
│   │   ├── Product name (Playfair Display)
│   │   ├── Store badge
│   │   ├── Current price (large, gold, DM Mono)
│   │   ├── Price change indicator
│   │   └── "Saved on [date]"
│   ├── <PriceChart>                          [components/product/PriceChart.tsx]
│   │   ├── Line chart (Recharts)
│   │   ├── 30/60/90 day toggle
│   │   └── Gold line on dark background
│   ├── <CrossStoreComparison>                [components/product/CrossStoreComparison.tsx]
│   │   └── <StorePrice> × N                  [components/product/StorePrice.tsx]
│   │       ├── Store logo/name
│   │       ├── Price
│   │       ├── "Best Price" badge (gold, on cheapest)
│   │       └── "Buy" button (affiliate link)
│   ├── <AlertConfig>                         [components/product/AlertConfig.tsx]
│   │   ├── Target price input
│   │   ├── Percentage selector
│   │   ├── Alert status
│   │   └── Enable/disable toggle
│   └── <ProductActions>                      [components/product/ProductActions.tsx]
│       ├── "Buy at Best Price →" (large CTA, orange)
│       ├── "Move to List"
│       └── "Delete"
│
├── <AlertsPage>                              [src/app/alerts/page.tsx]
│   ├── <AlertsTabs>                          [components/alerts/AlertsTabs.tsx]
│   │   ├── "Active" tab
│   │   └── "Triggered" tab
│   ├── <AlertList>                           [components/alerts/AlertList.tsx]
│   │   └── <AlertCard> × N                   [components/alerts/AlertCard.tsx]
│   │       ├── Product name + image
│   │       ├── Current price → target price
│   │       ├── Progress bar (how close)
│   │       ├── "Buy Now" (if triggered, glowing gold)
│   │       └── Swipe left: remove alert
│   └── <AlertSettings>                       [components/alerts/AlertSettings.tsx]
│
├── <ProfilePage>                             [src/app/profile/page.tsx]
│   ├── <ProfileHeader>                       [components/profile/ProfileHeader.tsx]
│   │   ├── Avatar + display name
│   │   └── Stats row
│   ├── <ActivityFeed>                        [components/profile/ActivityFeed.tsx]
│   └── <SettingsForm>                        [components/profile/SettingsForm.tsx]
│
├── <AddProductModal>                         [components/modals/AddProductModal.tsx]
│   ├── URL paste field (auto-focused)
│   ├── <ProductPreview>                      [components/modals/ProductPreview.tsx]
│   │   ├── Extracted image
│   │   ├── Extracted name (editable)
│   │   ├── Extracted price (editable)
│   │   └── Store badge
│   ├── List selector dropdown
│   ├── Alert toggle + target price
│   ├── "Save to Stashd" button (orange)
│   └── "Add Manually" toggle → manual form
│
├── <AuthModal>                               [components/auth/AuthModal.tsx]
│   ├── <GoogleAuthButton>
│   ├── <EmailAuthForm>
│   │   ├── Email input
│   │   ├── Password input
│   │   └── Submit button
│   └── Sign Up / Log In toggle
│
└── <BottomNav>                               [components/BottomNav.tsx]
    ├── Home (grid icon) → /
    ├── Lists (layers icon) → /lists
    ├── Add (+) (center, prominent) → opens AddProductModal
    ├── Alerts (bell icon) → /alerts
    └── Profile (user icon) → /profile
```

### 5.2 Component Props Reference

| Component | Key Props | State |
|-----------|-----------|-------|
| `ProductCard` | `product: Product`, `onDelete: () => void`, `onMove: (listId) => void` | Swipe gesture |
| `ProductList` | `products: Product[]`, `sortBy: string`, `filterBy: string` | — |
| `PriceChart` | `priceHistory: PricePoint[]`, `timeRange: 30\|60\|90` | Range toggle |
| `CrossStoreComparison` | `productId: string` | Fetches cross-store prices |
| `AlertCard` | `alert: PriceAlert`, `onRemove: () => void` | — |
| `AlertConfig` | `productId: string`, `currentPrice: number`, `onSave: (alert) => void` | Form state |
| `ListCard` | `list: List`, `onClick: () => void` | — |
| `AddProductModal` | `isOpen: boolean`, `onClose: () => void`, `defaultListId?: string` | URL parse state |
| `QuickStats` | `stats: DashboardStats` | — |
| `DropCard` | `product: Product`, `priceChange: PriceChange` | — |
| `BottomNav` | — | Reads current route |
| `AuthModal` | `isOpen: boolean`, `onClose: () => void`, `onSuccess: () => void` | Auth form state |
| `FloatingAddButton` | `onClick: () => void` | — |

---

## 6. JSON CONFIG SKELETON (Theming)

### 6.1 Theme Config: `config/theme.json`

```json
{
  "meta": {
    "app_name": "Stashd",
    "tagline": "Save anything. Track everything. Buy at the best price.",
    "version": "1.0.0"
  },
  "colors": {
    "primary": "#D4A853",
    "secondary": "#E8652B",
    "background": "#0A0A0A",
    "surface": "#141414",
    "surfaceHover": "#1E1E1E",
    "text": {
      "primary": "#F5F0E8",
      "secondary": "#6B6B6B",
      "accent": "#D4A853"
    },
    "status": {
      "success": "#2ECC71",
      "warning": "#E74C3C",
      "info": "#3498DB",
      "priceDown": "#2ECC71",
      "priceUp": "#E74C3C"
    },
    "border": {
      "default": "#1E1E1E",
      "active": "#D4A853",
      "muted": "#141414"
    },
    "gradient": {
      "blob1": "rgba(180, 130, 255, 0.15)",
      "blob2": "rgba(255, 150, 120, 0.12)",
      "blob3": "rgba(255, 100, 80, 0.08)"
    }
  },
  "typography": {
    "display": {
      "family": "Playfair Display",
      "weight": 700,
      "size": "32px",
      "lineHeight": 1.2
    },
    "heading": {
      "family": "Playfair Display",
      "weight": 500,
      "size": "22px",
      "lineHeight": 1.3
    },
    "body": {
      "family": "Inter",
      "weight": 400,
      "size": "16px",
      "lineHeight": 1.5
    },
    "caption": {
      "family": "Inter",
      "weight": 400,
      "size": "13px",
      "lineHeight": 1.4
    },
    "price": {
      "family": "DM Mono",
      "weight": 600,
      "size": "20px",
      "lineHeight": 1.2
    },
    "priceSmall": {
      "family": "DM Mono",
      "weight": 500,
      "size": "14px",
      "lineHeight": 1.2
    }
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px",
    "2xl": "48px"
  },
  "radii": {
    "sm": "8px",
    "md": "12px",
    "lg": "16px",
    "pill": "9999px"
  },
  "shadows": {
    "sm": "0 1px 2px rgba(0,0,0,0.2)",
    "md": "0 2px 8px rgba(0,0,0,0.3)",
    "lg": "0 4px 16px rgba(0,0,0,0.4)"
  },
  "layout": {
    "maxWidth": "480px",
    "navHeight": "64px",
    "floatingButtonSize": "56px"
  },
  "affiliate": {
    "amazon_ca": {
      "tag": "stashd-20",
      "base_url": "https://www.amazon.ca/dp/"
    },
    "bestbuy": {
      "partner_id": "",
      "base_url": "https://www.bestbuy.ca/"
    },
    "walmart": {
      "partner_id": "",
      "base_url": "https://www.walmart.ca/"
    }
  },
  "features": {
    "price_tracking": true,
    "cross_store_comparison": true,
    "chrome_extension": false,
    "shared_lists": false,
    "ai_assistant": false,
    "push_notifications": false,
    "google_auth": true,
    "guest_mode": true,
    "guest_item_limit": 10,
    "dark_mode_only": true
  },
  "seo": {
    "title": "Stashd — Save Anything. Track Everything. Buy at the Best Price.",
    "description": "The universal wishlist and price tracker. Save products from any store, track price drops, compare prices across retailers, and never overpay again.",
    "og_image": "/og-default.png",
    "keywords": ["price tracker", "universal wishlist", "price comparison", "deal finder", "price alert", "shopping list", "save products"]
  }
}
```

---

## 7. GLOBAL STATE (Zustand Store)

### 7.1 Store Shape: `store/useStashdStore.ts`

```typescript
interface StashdStore {
  // Products
  products: Product[];
  selectedProduct: Product | null;

  // Lists
  lists: List[];
  activeListId: string | null;

  // Alerts
  alerts: PriceAlert[];

  // UI
  isAddModalOpen: boolean;
  isAuthModalOpen: boolean;
  searchQuery: string;
  sortBy: 'date' | 'price_asc' | 'price_desc' | 'name';
  filterBy: 'all' | 'dropped' | 'increased' | 'alerted';

  // Actions — Products
  addProduct: (product: NewProduct) => void;
  removeProduct: (id: string) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  setSelectedProduct: (product: Product | null) => void;

  // Actions — Lists
  createList: (name: string, emoji: string) => void;
  deleteList: (id: string) => void;
  renameList: (id: string, name: string) => void;
  addToList: (listId: string, productId: string) => void;
  removeFromList: (listId: string, productId: string) => void;
  moveToList: (productId: string, fromListId: string, toListId: string) => void;
  setActiveList: (id: string | null) => void;

  // Actions — Alerts
  setAlert: (productId: string, config: AlertConfig) => void;
  removeAlert: (productId: string) => void;

  // Actions — UI
  openAddModal: () => void;
  closeAddModal: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: StashdStore['sortBy']) => void;
  setFilterBy: (filter: StashdStore['filterBy']) => void;

  // Computed
  totalValue: () => number;
  totalSavings: () => number;
  recentDrops: () => Product[];
  triggeredAlerts: () => PriceAlert[];
}
```

### 7.2 Types: `lib/types.ts`

```typescript
interface Product {
  id: string;
  user_id: string;
  name: string;
  url: string | null;
  image_url: string | null;
  store_name: string | null;
  store_domain: string | null;
  original_price: number;
  current_price: number | null;
  lowest_price: number | null;
  lowest_price_date: string | null;
  currency: string;
  category: string | null;
  notes: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  // Computed on frontend
  price_change_percent?: number;
  price_direction?: 'down' | 'up' | 'same';
}

interface List {
  id: string;
  user_id: string;
  name: string;
  emoji: string;
  description: string | null;
  is_default: boolean;
  sort_order: number;
  item_count?: number;
  total_value?: number;
  created_at: string;
}

interface ListItem {
  id: string;
  list_id: string;
  product_id: string;
  sort_order: number;
  added_at: string;
  product?: Product; // joined
}

interface PriceHistory {
  id: string;
  product_id: string;
  price: number;
  store_domain: string | null;
  checked_at: string;
}

interface PriceAlert {
  id: string;
  user_id: string;
  product_id: string;
  target_price: number | null;
  target_percentage: number | null;
  alert_type: 'price' | 'percentage';
  is_triggered: boolean;
  triggered_at: string | null;
  notification_method: 'email' | 'push' | 'both';
  is_active: boolean;
  created_at: string;
  product?: Product; // joined
}

interface CrossStorePrice {
  id: string;
  product_id: string;
  store_name: string;
  store_url: string | null;
  price: number;
  currency: string;
  affiliate_url: string | null;
  last_checked: string;
  is_available: boolean;
}

interface DashboardStats {
  total_items: number;
  total_value: number;
  active_alerts: number;
  drops_this_week: number;
  total_savings: number;
}

type AlertConfig = {
  target_price?: number;
  target_percentage?: number;
  alert_type: 'price' | 'percentage';
  notification_method: 'email' | 'push' | 'both';
};

type NewProduct = {
  name: string;
  url?: string;
  image_url?: string;
  store_name?: string;
  price: number;
  list_id?: string;
  alert?: AlertConfig;
};
```

---

## 8. API ROUTES

### 8.1 Route Map

| Route | Method | Purpose | Auth Required |
|-------|--------|---------|---------------|
| `/api/products` | GET | List user's saved products | Yes |
| `/api/products` | POST | Save a new product | Yes |
| `/api/products/[id]` | GET | Single product detail + price history | Yes |
| `/api/products/[id]` | PATCH | Update product (name, notes, etc.) | Yes |
| `/api/products/[id]` | DELETE | Remove a product | Yes |
| `/api/scrape` | POST | Extract product data from a URL | Yes |
| `/api/lists` | GET | List user's lists | Yes |
| `/api/lists` | POST | Create a new list | Yes |
| `/api/lists/[id]` | PATCH | Update list (rename, reorder) | Yes |
| `/api/lists/[id]` | DELETE | Delete a list | Yes |
| `/api/lists/[id]/items` | POST | Add product to list | Yes |
| `/api/lists/[id]/items/[productId]` | DELETE | Remove product from list | Yes |
| `/api/alerts` | GET | List user's alerts | Yes |
| `/api/alerts` | POST | Create price alert | Yes |
| `/api/alerts/[id]` | DELETE | Remove alert | Yes |
| `/api/compare/[productId]` | GET | Get cross-store prices | Yes |
| `/api/affiliate/click` | POST | Log affiliate click | No |

### 8.2 Scrape Endpoint Detail

```typescript
// POST /api/scrape
// Request:
{ "url": "https://www.amazon.ca/dp/B0BVJHPC6B" }

// Response:
{
  "name": "LG 27GP850-B 27\" Ultragear QHD IPS Gaming Monitor",
  "price": 449.99,
  "currency": "CAD",
  "image_url": "https://m.media-amazon.com/images/I/...",
  "store_name": "Amazon.ca",
  "store_domain": "amazon.ca",
  "success": true
}
```

### 8.3 Compare Endpoint Detail

```typescript
// GET /api/compare/[productId]
// Response:
{
  "product_name": "LG 27GP850-B",
  "prices": [
    { "store": "Amazon.ca", "price": 449.99, "url": "...", "affiliate_url": "...", "is_cheapest": true },
    { "store": "Best Buy", "price": 479.99, "url": "...", "affiliate_url": "...", "is_cheapest": false },
    { "store": "Walmart.ca", "price": 469.99, "url": "...", "affiliate_url": "...", "is_cheapest": false }
  ]
}
```

---

## 9. TECH STACK & TOOLS

### 9.1 Development Stack

| Layer | Tool | Cost |
|-------|------|------|
| Frontend | Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui | Free |
| Charts | Recharts | Free |
| Animations | Framer Motion | Free |
| State | Zustand | Free |
| Database | Supabase (free tier) | Free |
| Auth | Supabase Auth (Google OAuth + email) | Free |
| Hosting | Vercel (free tier) | Free |
| Scraping | Puppeteer / Cheerio on Supabase Edge Functions | Free |
| Price API | Google Shopping via SerpAPI (free 100 searches/mo) | Free |
| Email | Resend (free tier: 3,000 emails/mo) | Free |
| AI | Claude Haiku (via existing Pro sub) | Free |
| Cron Jobs | Supabase pg_cron or Vercel Cron | Free |
| Extension | Chrome Manifest V3 | Free |
| Domain | stashd.app or stashd.io | ~$15 CAD |
| **Total** | | **~$15 CAD** |

### 9.2 Development Tools

| Tool | Purpose | Cost |
|------|---------|------|
| **Base44** | Phase 1: Generate initial skeleton/scaffold | Free |
| **Cursor + Claude** OR **Claude Pro Desktop** | Phase 2: Build the soul (80% of real code) | Free (Claude Pro sub) |
| **GitHub** | Version control | Free |
| **Supabase Dashboard** | Database management, auth config | Free |
| **Vercel Dashboard** | Deployment, domains, analytics | Free |
| **Chrome DevTools** | Testing, debugging | Free |

---

## 10. CLAUDE PRO DESKTOP APP vs CURSOR — HONEST COMPARISON

### Claude Pro Desktop (Claude Code)
**What it is:** A terminal-based agent. You type `claude` in your project folder and talk to it. It reads files, writes code, runs commands, creates components.

**Strengths:**
- Directly runs in your terminal — no IDE overhead
- Can execute bash commands (npm install, git commit, run tests)
- Reads your entire project tree for context
- `.claude/rules/` files auto-load as permanent context
- Great for big structural changes ("create the entire alerts system")
- Included in your existing Claude Pro subscription
- Can work autonomously on multi-file tasks

**Weaknesses:**
- No inline code suggestions as you type
- No syntax highlighting in the conversation
- You don't see code diffs visually (it just edits files)
- Harder to do quick one-line fixes
- Terminal-based — if you prefer visual IDE, it feels raw

### Cursor (with Claude)
**What it is:** A full IDE (forked from VS Code) with Claude built into every interaction. Inline completions, chat sidebar, multi-file edits with visual diffs.

**Strengths:**
- Inline code completion as you type (Tab to accept)
- `Cmd+K` for inline edits within any file
- `Cmd+L` for chat sidebar with full project context
- Visual diffs — see exactly what Claude wants to change before accepting
- All your VS Code extensions still work
- Better for small, targeted edits ("fix this one function")
- `.cursorrules` file for project context

**Weaknesses:**
- Free tier has limited Claude usage (you may hit caps)
- Pro is $20/month (additional cost on top of Claude Pro)
- Sometimes slower than Claude Code for big structural tasks
- Can't run terminal commands for you (you do that separately)

### My Recommendation
**Use both.** They're not competing — they serve different moments:

- **Claude Code** for big moves: "Create the entire price tracking system," "Set up Supabase schema," "Build the Chrome extension scaffold," "Refactor the alerts module." It's better for multi-file, structural work.

- **Cursor** for precision work: fixing bugs, tweaking UI, adjusting component props, writing a single function, quick inline edits. It's better for the day-to-day coding flow.

**If you can only pick one:** Start with **Claude Code** (free with your Pro sub). It'll handle 70% of what you need. Add Cursor later if you find yourself wanting inline completions and visual diffs. Don't pay $20/month for Cursor until the app is generating revenue.

**The workflow:** Claude Code builds the foundation → you open the project in Cursor (or VS Code) for visual review and fine-tuning → Claude Code for the next big feature.

---

## 11. SEED DATA PLAN

40 real products across common shopping categories:

| Category | Products | Example |
|----------|----------|---------|
| Tech / Monitors | 5 | LG 27GP850-B, Samsung Odyssey G5, Dell S2722DGM |
| Tech / Peripherals | 5 | Keychron K8 Pro, Logitech MX Master 3S, SteelSeries Arctis Nova 7 |
| Tech / Laptops | 5 | MacBook Air M3, ThinkPad X1 Carbon, ASUS ROG Zephyrus |
| Audio | 5 | Sony WH-1000XM5, AirPods Pro 2, Sennheiser HD 560S |
| Home / Furniture | 5 | IKEA ALEX Drawer, Secretlab Titan Evo, IKEA MALM Desk |
| Fashion / Shoes | 5 | Nike Air Force 1, New Balance 550, adidas Samba OG |
| Fashion / Clothing | 5 | Carhartt WIP Hoodie, Nike Tech Fleece, Uniqlo Ultra Light Down |
| Kitchen / Appliances | 5 | Ninja Creami, Stanley Quencher, Brita Water Filter |

All seeded with real Amazon.ca prices, real product images, real affiliate URLs.

---

## 12. BASE44 PROMPT

Copy everything below the line and paste into Base44:

---

Build me a mobile-first responsive web app called **Stashd** — a universal wishlist and price tracker.

### What It Does
Users save products from any online store into organized wishlists, track price changes over time, compare prices across retailers, set alerts for price drops, and buy at the cheapest price through affiliate links.

### Design Language

**Overall Feel:** Dark, premium, confident. Like the mymind app meets a luxury shopping tool. Clean, warm, no clutter.

**Colors:**
- Background: `#0A0A0A` (near-black)
- Surface/Cards: `#141414` with `#1E1E1E` borders
- Primary accent (gold): `#D4A853` — prices, active states, chart lines, "best price" badges
- CTA accent (burnt orange): `#E8652B` — all primary buttons ("Save to Stashd", "Buy at Best Price")
- Text primary: `#F5F0E8` (warm white)
- Text secondary: `#6B6B6B` (muted grey)
- Price down: `#2ECC71` (green)
- Price up: `#E74C3C` (red)
- On the dashboard, use a subtle blurred gradient blob (purple/peach, very faint) as a decorative background element behind the stats section.

**Typography:**
- Headlines: Playfair Display (serif, bold)
- Body: Inter (clean sans-serif)
- Prices/numbers: DM Mono (monospace, gold)

**Border Radius:** 12-16px on cards. Pill (9999px) on chips/tags/badges.
**Spacing:** Generous. 16-24px padding inside cards. Never crowded.
**Icons:** Lucide React icons.

### Screens to Build

#### Screen 1: Dashboard (Home)
- Top: "Stashd" logo in Playfair Display (left), search icon + profile avatar (right)
- Quick stats row: 4 mini cards in a 2x2 grid showing "Items Saved", "Total Value" (gold), "Active Alerts", "Drops This Week" (green if > 0)
- "Recent Price Drops" section: horizontal scroll of small cards, each showing product image, name, old price strikethrough, new price in green with ↓ arrow, small "Buy" button
- "Recently Saved" section: vertical list of product rows (image, name, store badge, price)
- Floating "+" button (bottom right, burnt orange circle, 56px, shadow) — opens add modal

#### Screen 2: My Lists
- "My Lists" header with "+ New List" button
- Grid of list cards (2 columns). Each card: emoji icon, list name, "X items", total value in gold, thumbnail collage of 4 product images
- Tap a card → list detail

#### Screen 3: List Detail
- List name as header (with edit pencil icon), total cost in gold below
- Sort dropdown (Date, Price Low, Price High, Name)
- Filter chips: All | Dropped | Increased | Alerted (pill shaped, gold active state)
- Product cards (vertical scroll): product image (left, 60x60 rounded), product name + store badge in grey (center), current price in gold + change percentage in green/red (right)
- Products with active alerts show a small bell icon

#### Screen 4: Product Detail
- Large product image at top (full width, 200px height, rounded bottom corners)
- Product name in Playfair Display below image
- Store badge + "Saved [date]" in muted text
- Current price large in gold DM Mono. Below it: "Was $X when saved" in strikethrough. Change percentage badge.
- "Lowest seen: $X on [date]" in small muted text
- Price History section: line chart (gold line on dark background) with 30/60/90 day toggle buttons
- Compare Prices section: list of stores with prices. Cheapest store gets a gold "Best Price" badge. Each row has store name, price, and small "Buy" button
- Set Alert section: target price input, or percentage dropdown (10%, 20%, 30%, custom), enable/disable toggle
- Bottom sticky: "Buy at Best Price →" large orange CTA button

#### Screen 5: Alerts
- Two tabs at top: "Active" and "Triggered"
- Active: list of alert cards showing product name, product image, current price → target price, progress bar (gold fill showing how close current is to target)
- Triggered: list with gold glow/highlight, showing product name, triggered price, "Buy Now →" orange button
- Settings gear icon → alert preferences

#### Screen 6: Add Product Modal (overlay/sheet)
- Slides up from bottom
- URL paste field at top (auto-focused, placeholder: "Paste product URL...")
- After pasting: shows preview card with extracted product image, name, price, store (loading spinner while fetching)
- Below preview: "Save to" list selector dropdown
- "Set price alert" toggle → reveals target price input
- "Save to Stashd" button (full width, burnt orange)
- "Add Manually" text link → reveals manual form (name, price, store, image URL)

#### Bottom Navigation (visible on all screens except modal)
- 5 items: Home (grid icon), Lists (layers icon), Add (+ in orange circle, larger/raised), Alerts (bell icon, badge count for triggered), Profile (user icon)
- Active: orange icon + label
- Inactive: muted grey

### Technical Requirements
- Mobile-first: design for 390px width
- All data hardcoded/mock for now
- Create realistic mock data: 20 products across tech, fashion, home, audio categories with real-sounding names and prices
- Include 4 mock lists: "Tech Wishlist" (8 items), "Gift Ideas" (5 items), "Home Upgrades" (4 items), "Fashion" (3 items)
- Include mock price history data (arrays of price points over 30 days) for at least 5 products
- Include mock cross-store price comparison data for at least 3 products
- Include 3 mock active alerts and 1 triggered alert
- State management: React useState for now
- Smooth animations on: modal open/close, price change numbers, chart rendering
- Clean component structure — every section is its own component

### Fonts
Import Google Fonts: Playfair Display (400, 500, 700), Inter (400, 500, 600), DM Mono (400, 500)

### What NOT to Do
- No light/white backgrounds
- No default component library colors — override everything with the palette above
- No gradients on buttons or cards — gradients ONLY for subtle background blobs on dashboard
- No clutter — when in doubt, more spacing
- No features not listed above
- Don't make it look generic

---

## 13. NEXT STEPS (In Order)

1. **Check domain availability:** stashd.app, stashd.io, getstashd.com
2. **Paste the Base44 prompt** → get the visual skeleton
3. **Review and iterate in Base44** until layout and flow feel right
4. **Export to GitHub** (or manually create repo and copy code)
5. **Set up Claude Code context** (copy `.claude/rules/stashd-context.md` into the repo)
6. **Connect Supabase** — create project, run SQL schema, configure auth
7. **Build the scrape endpoint** — URL → product data extraction
8. **Wire up real state with Zustand** — replace all mock data
9. **Build price checking cron** — automated price monitoring
10. **Build Chrome extension** — "Save to Stashd" from any page
11. **Deploy to Vercel** — go live
12. **Launch content** — "I Built This Because Honey Lied To Us" YouTube video
13. **Product Hunt launch** — target 600+ upvotes
14. **Reddit seeding** — genuine value posts in r/Frugal, r/deals
