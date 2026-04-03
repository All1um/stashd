-- ============================================================
-- STASHD — Full Schema
-- Paste this entire file into the Supabase SQL Editor and run.
-- ============================================================

-- ── TABLES ──────────────────────────────────────────────────

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

CREATE INDEX idx_products_user    ON products(user_id);
CREATE INDEX idx_products_store   ON products(store_domain);
CREATE INDEX idx_products_created ON products(created_at DESC);

-- ────────────────────────────────────────────────────────────

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

-- ────────────────────────────────────────────────────────────

CREATE TABLE list_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID REFERENCES lists(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(list_id, product_id)
);

CREATE INDEX idx_list_items_list    ON list_items(list_id);
CREATE INDEX idx_list_items_product ON list_items(product_id);

-- ────────────────────────────────────────────────────────────

CREATE TABLE price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  store_domain TEXT,
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_price_history_product ON price_history(product_id);
CREATE INDEX idx_price_history_date    ON price_history(checked_at DESC);

-- ────────────────────────────────────────────────────────────

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

CREATE INDEX idx_alerts_user    ON price_alerts(user_id);
CREATE INDEX idx_alerts_active  ON price_alerts(is_active) WHERE is_active = true;
CREATE INDEX idx_alerts_product ON price_alerts(product_id);

-- ────────────────────────────────────────────────────────────

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

-- ────────────────────────────────────────────────────────────

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
CREATE INDEX idx_clicks_date    ON affiliate_clicks(clicked_at);

-- ── ROW LEVEL SECURITY ───────────────────────────────────────

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own products" ON products
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own lists" ON lists
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage items in own lists" ON list_items
  FOR ALL USING (list_id IN (SELECT id FROM lists WHERE user_id = auth.uid()));

ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own product history" ON price_history
  FOR SELECT USING (product_id IN (SELECT id FROM products WHERE user_id = auth.uid()));

ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own alerts" ON price_alerts
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE cross_store_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read cross prices for own products" ON cross_store_prices
  FOR SELECT USING (product_id IN (SELECT id FROM products WHERE user_id = auth.uid()));

ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert clicks" ON affiliate_clicks
  FOR INSERT WITH CHECK (true);
