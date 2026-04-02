# Visual Intelligence (v1.2.0) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Stashd from a functional database into a living market intelligence tool by fixing the price chart data pipeline, adding an Alerts Active dashboard tile, standardising toast feedback, and making all product images resilient with a branded fallback.

**Architecture:** 9 tasks executed in dependency order. Tasks 1–2 create shared primitives (`toast.js`, `StashdPlaceholder`, `ProductImage`) consumed by all later tasks. Tasks 3–6 fix data and chart logic. Tasks 7–8 apply the primitives across every image location and toast call site. Task 9 hardens BottomNav CSS and verifies the build.

**Tech Stack:** Vite + React 18 (JSX), Supabase JS v2, Recharts v2.15.4, Sonner (toast), Tailwind CSS, Aesthetic-Alpha design tokens.

> **Note:** This project has no test suite (`npm run build` and `npm run lint` are the verification commands). Each task includes a build step to catch regressions immediately.

---

### Task 1: Create `src/lib/toast.js` — unified toast helper

**Files:**
- Create: `src/lib/toast.js`

- [ ] **Step 1.1: Create the file**

```js
// src/lib/toast.js
import { toast } from 'sonner';

const baseStyle = {
  background: '#141414',
  border: '1px solid #1E1E1E',
  color: '#F5F0E8',
  fontFamily: 'Inter, sans-serif',
};

const descStyle = {
  fontFamily: 'DM Mono, monospace',
  color: '#D4A853',
};

export const toastSuccess = (title, description) =>
  toast(title, { description, style: baseStyle, descriptionStyle: descStyle });

export const toastInfo = (title, description) =>
  toast(title, { description, style: baseStyle, descriptionStyle: descStyle });
```

- [ ] **Step 1.2: Verify build passes**

```bash
npm run build 2>&1 | tail -5
```
Expected: `✓ built in` with no errors.

- [ ] **Step 1.3: Commit**

```bash
git add src/lib/toast.js
git commit -m "feat: add unified toast helper (gold Aesthetic-Alpha style)"
```

---

### Task 2: Create `StashdPlaceholder` and `ProductImage` components

**Files:**
- Create: `src/components/StashdPlaceholder.jsx`
- Create: `src/components/ProductImage.jsx`

- [ ] **Step 2.1: Create `StashdPlaceholder.jsx`**

```jsx
// src/components/StashdPlaceholder.jsx
// Size map: sm=40px thumbnail, md=60px list item, lg=full-width hero (220px tall)
const SIZE_MAP = {
  sm: { dim: 40,    circle: 18, letter: 14, sub: false },
  md: { dim: 60,    circle: 24, letter: 18, sub: false },
  lg: { dim: '100%', height: 220, circle: 36, letter: 28, sub: true  },
};

export default function StashdPlaceholder({ size = 'md', className, style }) {
  const s = SIZE_MAP[size] ?? SIZE_MAP.md;
  return (
    <div
      className={className}
      style={{
        width:           s.dim,
        height:          s.height ?? s.dim,
        background:      '#141414',
        display:         'flex',
        flexDirection:   'column',
        alignItems:      'center',
        justifyContent:  'center',
        gap:             '6px',
        flexShrink:      0,
        ...style,
      }}
    >
      <div style={{
        width:        s.circle * 2,
        height:       s.circle * 2,
        borderRadius: '50%',
        background:   'rgba(212,168,83,0.08)',
        border:       '1px solid rgba(212,168,83,0.2)',
        display:      'flex',
        alignItems:   'center',
        justifyContent: 'center',
      }}>
        <span style={{
          fontFamily: 'Playfair Display, Georgia, serif',
          fontSize:   s.letter,
          color:      '#D4A853',
          fontWeight: 700,
          lineHeight: 1,
          userSelect: 'none',
        }}>
          S
        </span>
      </div>
      {s.sub && (
        <span style={{
          fontFamily:    'DM Mono, monospace',
          fontSize:      8,
          color:         '#6B6B6B',
          letterSpacing: '0.15em',
          userSelect:    'none',
        }}>
          STASHD
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 2.2: Create `ProductImage.jsx`**

This component handles `onError` internally so every call-site is clean JSX.

```jsx
// src/components/ProductImage.jsx
import { useState } from 'react';
import StashdPlaceholder from './StashdPlaceholder';

export default function ProductImage({ src, alt = '', size = 'md', className, style }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <StashdPlaceholder size={size} className={className} style={style} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={className}
      style={style}
    />
  );
}
```

- [ ] **Step 2.3: Verify build passes**

```bash
npm run build 2>&1 | tail -5
```
Expected: `✓ built in` with no errors.

- [ ] **Step 2.4: Commit**

```bash
git add src/components/StashdPlaceholder.jsx src/components/ProductImage.jsx
git commit -m "feat: add StashdPlaceholder (S monogram) and ProductImage with onError"
```

---

### Task 3: Dashboard — swap PRICE DROPS for ALERTS ACTIVE

**Files:**
- Modify: `src/pages/Dashboard.jsx`

- [ ] **Step 3.1: Add `alertsActive` state and parallel fetch**

In `Dashboard.jsx`, replace the existing `useEffect` (lines ~136–149) with a `Promise.all` that fires both queries simultaneously:

```jsx
// Add to state declarations (after line ~133):
const [alertsActive, setAlertsActive] = useState(0);

// Replace the useEffect body:
useEffect(() => {
  if (!user) { setLoading(false); return; }

  Promise.all([
    supabase
      .from('products')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_archived', false)
      .order('created_at', { ascending: false }),
    supabase
      .from('price_alerts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_active', true)
      .eq('is_triggered', false),
  ]).then(([{ data: productsData }, { count }]) => {
    setProducts(productsData ?? []);
    setAlertsActive(count ?? 0);
    setLoading(false);
  });
}, [user]);
```

- [ ] **Step 3.2: Update the stats array**

Replace the existing `stats` array (lines ~159–164):

```jsx
const stats = [
  { label: 'POSITIONS',     value: String(products.length),         mono: false                             },
  { label: 'PORTFOLIO',     value: `$${portfolioValue.toFixed(0)}`, mono: true,  gold: true                },
  { label: 'ALERTS ACTIVE', value: String(alertsActive),            mono: false, gold: alertsActive > 0   },
  { label: 'TOTAL SAVINGS', value: `$${totalSavings.toFixed(0)}`,   mono: true,  green: totalSavings > 0  },
];
```

The stat tile renderer already supports `s.gold` and `s.green` color flags — no change needed there.

- [ ] **Step 3.3: Verify build passes**

```bash
npm run build 2>&1 | tail -5
```
Expected: `✓ built in` with no errors.

- [ ] **Step 3.4: Commit**

```bash
git add src/pages/Dashboard.jsx
git commit -m "feat: dashboard — swap Price Drops tile for Alerts Active (live count)"
```

---

### Task 4: Fix price history data pipeline in `ProductDetail.jsx`

**Files:**
- Modify: `src/pages/ProductDetail.jsx`

- [ ] **Step 4.1: Add imports and state**

At the top of `ProductDetail.jsx`, add the missing imports:

```jsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
```

Add state declarations inside the component (after the existing variable normalisation block):

```jsx
const [priceHistory,    setPriceHistory]    = useState([]);
const [historyLoading,  setHistoryLoading]  = useState(true);
```

- [ ] **Step 4.2: Add `useEffect` to fetch `price_history`**

Add after the state declarations:

```jsx
useEffect(() => {
  if (!product?.id) { setHistoryLoading(false); return; }
  supabase
    .from('price_history')
    .select('price, checked_at')
    .eq('product_id', product.id)
    .order('checked_at', { ascending: true })
    .then(({ data }) => {
      setPriceHistory(data ?? []);
      setHistoryLoading(false);
    });
}, [product?.id]);
```

- [ ] **Step 4.3: Remove the dead camelCase line and update derived values**

Delete this line (currently around line 15):
```jsx
const priceHistory  = product?.priceHistory   ?? null;   // not yet fetched from DB
```

Replace `lowestPrice` derivation (currently `priceHistory ? Math.min(...priceHistory) : currentPrice`):
```jsx
const lowestPrice = priceHistory.length > 0
  ? Math.min(...priceHistory.map(h => h.price))
  : currentPrice;
```

Replace `mei` derivation (currently checks `priceHistory && priceHistory.length > 1`):
```jsx
const mei = priceHistory.length > 1
  ? meiFromPrices(currentPrice, priceHistory.map(h => h.price))
  : null;
```

- [ ] **Step 4.4: Update chart and MEI render gates**

Replace the chart render line (currently `{priceHistory && <PriceChart history={priceHistory} />}`):
```jsx
{!historyLoading && <PriceChart history={priceHistory} />}
```

The MEI block already gates on `mei` being truthy — no change needed there.

Also update the `priceHistory.length` reference inside the MEI block (currently `{priceHistory.length}-point price history`):
```jsx
{priceHistory.length}-point price history
```
This line is already correct once `priceHistory` is the state array.

- [ ] **Step 4.5: Verify build passes**

```bash
npm run build 2>&1 | tail -5
```
Expected: `✓ built in` with no errors.

- [ ] **Step 4.6: Commit**

```bash
git add src/pages/ProductDetail.jsx
git commit -m "fix: wire price_history Supabase fetch in ProductDetail (was reading dead camelCase prop)"
```

---

### Task 5: Upgrade `PriceChart.jsx` — AreaChart with gradient fill

**Files:**
- Modify: `src/components/product/PriceChart.jsx`

- [ ] **Step 5.1: Rewrite `PriceChart.jsx`**

Replace the entire file:

```jsx
// src/components/product/PriceChart.jsx
import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const date  = entry.payload.checked_at
    ? new Date(entry.payload.checked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;
  return (
    <div className="px-3 py-2 rounded-xl" style={{ background: '#1E1E1E', border: '1px solid #2E2E2E' }}>
      <p style={{ color: '#D4A853', fontFamily: 'DM Mono, monospace', fontSize: '13px' }}>
        ${entry.value.toFixed(2)}
      </p>
      {date && (
        <p style={{ color: '#6B6B6B', fontFamily: 'Inter', fontSize: '11px', marginTop: '2px' }}>{date}</p>
      )}
    </div>
  );
};

export default function PriceChart({ history }) {
  const [range, setRange] = useState(30);
  const ranges = [30, 60, 90];

  // history is an array of { price, checked_at } objects from price_history table
  const sliced = history.slice(-range);

  if (sliced.length < 2) {
    return (
      <div className="rounded-2xl p-4 mb-4" style={{ background: '#141414', border: '1px solid #1E1E1E' }}>
        <p style={{ color: '#6B6B6B', fontSize: '13px', fontFamily: 'DM Mono, monospace' }}>
          Monitoring price data…
        </p>
      </div>
    );
  }

  const prices = sliced.map(d => d.price);
  const minP   = Math.min(...prices);
  const maxP   = Math.max(...prices);
  const domain = [Math.floor(minP * 0.97), Math.ceil(maxP * 1.02)];

  return (
    <div className="rounded-2xl p-4 mb-4" style={{ background: '#141414', border: '1px solid #1E1E1E' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 style={{ color: '#F5F0E8', fontSize: '16px', fontFamily: 'Playfair Display, serif', fontWeight: 600 }}>
          Price History
        </h3>
        <div className="flex gap-1">
          {ranges.map(r => (
            <button
              type="button"
              key={r}
              onClick={() => setRange(r)}
              className="px-3 py-1 rounded-full transition-all"
              style={{
                background: range === r ? '#D4A853' : '#1E1E1E',
                color:      range === r ? '#0A0A0A' : '#6B6B6B',
                fontSize: '11px', fontFamily: 'Inter', fontWeight: 600,
              }}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: '140px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sliced}>
            <defs>
              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#D4A853" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#D4A853" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <YAxis domain={domain} hide />
            <XAxis dataKey="checked_at" hide />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#D4A853"
              strokeWidth={2}
              fill="url(#goldGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#D4A853', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

- [ ] **Step 5.2: Verify build passes**

```bash
npm run build 2>&1 | tail -5
```
Expected: `✓ built in` with no errors.

- [ ] **Step 5.3: Commit**

```bash
git add src/components/product/PriceChart.jsx
git commit -m "feat: PriceChart — AreaChart with gold gradient fill, date tooltip, null-safe guard"
```

---

### Task 6: Seed `price_history` row on product save

**Files:**
- Modify: `src/components/AddProductModal.jsx`

- [ ] **Step 6.1: Add price_history INSERT after list_items INSERT**

In `handleSave`, after the existing `list_items` insert block and before `setSaving(false)`, add:

```jsx
// Seed initial price history point
await supabase.from('price_history').insert({
  product_id: productId,
  price:      parsedPrice,
});
```

The full save sequence after this change:
1. INSERT `products` → capture `productId`
2. INSERT `list_items` (if `selectedList`)
3. INSERT `price_history` (always — seeds the chart)
4. UPSERT `price_alerts` (if `alertEnabled`)

- [ ] **Step 6.2: Verify build passes**

```bash
npm run build 2>&1 | tail -5
```
Expected: `✓ built in` with no errors.

- [ ] **Step 6.3: Commit**

```bash
git add src/components/AddProductModal.jsx
git commit -m "feat: seed price_history row on product save so chart has immediate data"
```

---

### Task 7: Standardise all toast call sites

**Files:**
- Modify: `src/components/AddProductModal.jsx`
- Modify: `src/components/product/SetAlert.jsx`
- Modify: `src/pages/Lists.jsx`

- [ ] **Step 7.1: Update `AddProductModal.jsx`**

Replace the import line at the top:
```jsx
// Remove: import { toast } from 'sonner';
// Add:
import { toastSuccess, toastInfo } from '@/lib/toast';
```

Replace all toast calls in `handleSave`:
```jsx
// BEFORE:
toast.error('Missing info', { description: 'Add a product name and price first.' });
// AFTER:
toastInfo('Missing info', 'Add a product name and price first.');

// BEFORE:
toast.error('Sign in required', { description: 'Create a Stashd account to save products.' });
// AFTER:
toastInfo('Sign in required', 'Create a Stashd account to save products.');

// BEFORE:
toast.error('Save failed', { description: productError?.message ?? 'Unknown error' });
// AFTER:
toastInfo('Could not save', productError?.message ?? 'Unknown error');

// BEFORE:
toast.success('Saved to Stashd', {
  description: name,
  style: { fontFamily: 'DM Mono, monospace', color: '#D4A853' },
});
// AFTER:
toastSuccess('Saved to Stashd', name);
```

- [ ] **Step 7.2: Update `SetAlert.jsx`**

Replace the import:
```jsx
// Remove: import { toast } from 'sonner';
// Add:
import { toastSuccess, toastInfo } from '@/lib/toast';
```

Replace toast calls:
```jsx
// BEFORE:
toast('Sign in to set alerts', {
  style: { fontFamily: 'DM Mono, monospace', color: '#D4A853' },
});
// AFTER:
toastInfo('Sign in to set alerts', '');

// BEFORE:
toast('Enter a valid target price', {
  style: { fontFamily: 'DM Mono, monospace', color: '#D4A853' },
});
// AFTER:
toastInfo('Enter a valid target price', '');

// BEFORE:
toast(error.message, {
  style: { fontFamily: 'DM Mono, monospace', color: '#D4A853' },
});
// AFTER:
toastInfo('Could not save alert', error.message);

// BEFORE:
toast('Alert saved.', {
  description: `Notify me when price drops to $${parseFloat(calcPrice).toFixed(2)}`,
  style: { fontFamily: 'DM Mono, monospace', color: '#D4A853' },
});
// AFTER:
toastSuccess('Alert set', `Notify when ↓ $${parseFloat(calcPrice).toFixed(2)}`);
```

- [ ] **Step 7.3: Update `Lists.jsx`**

Add import at the top of `Lists.jsx`:
```jsx
import { toastSuccess } from '@/lib/toast';
```

In `handleCreate`, after `setLists(prev => [...prev, { ...data, list_items: [] }])`, add:
```jsx
toastSuccess('List created', name);
```

In `commitEdit`, after `await supabase.from('lists').update({ name }).eq('id', listId)`, add:
```jsx
toastSuccess('List updated', name);
```

- [ ] **Step 7.4: Verify build passes with no lint errors**

```bash
npm run build 2>&1 | tail -5
npm run lint 2>&1 | tail -10
```
Expected: build passes, lint shows no `no-unused-vars` errors (the old `toast` import is removed).

- [ ] **Step 7.5: Commit**

```bash
git add src/components/AddProductModal.jsx src/components/product/SetAlert.jsx src/pages/Lists.jsx
git commit -m "feat: standardise all toasts via lib/toast.js — gold #D4A853 on every operation"
```

---

### Task 8: Apply `ProductImage` across all image locations

**Files:**
- Modify: `src/pages/Dashboard.jsx`
- Modify: `src/pages/ListDetail.jsx`
- Modify: `src/pages/Alerts.jsx`
- Modify: `src/pages/ProductDetail.jsx`

- [ ] **Step 8.1: Dashboard — `AssetRow` thumbnail**

In `Dashboard.jsx`, add the import:
```jsx
import ProductImage from '../components/ProductImage';
```

In `AssetRow`, replace the thumbnail block (the `div` with `{product.image_url ? <img> : <div>📦</div>}`):
```jsx
<div className="w-11 h-11 rounded-xl flex-shrink-0 overflow-hidden" style={{ background: '#1A1A1A' }}>
  <ProductImage
    src={product.image_url}
    alt={product.name}
    size="sm"
    className="w-full h-full object-cover"
    style={{ borderRadius: '10px' }}
  />
</div>
```

- [ ] **Step 8.2: ListDetail — product row thumbnail**

In `ListDetail.jsx`, add the import:
```jsx
import ProductImage from '../components/ProductImage';
```

Replace the thumbnail block in the `sorted.map` render (the `{product.image_url ? <img> : <div>🛍️</div>}` block):
```jsx
<ProductImage
  src={product.image_url}
  alt={product.name ?? ''}
  size="md"
  className="rounded-xl object-cover flex-shrink-0"
  style={{ width: '60px', height: '60px' }}
/>
```

- [ ] **Step 8.3: Alerts — alert card thumbnail**

In `Alerts.jsx`, add the import:
```jsx
import ProductImage from '../components/ProductImage';
```

In the active alerts map, replace the thumbnail block (the `{product?.image_url ? <img> : <div>🛍️</div>}` block):
```jsx
<ProductImage
  src={product?.image_url}
  alt={product?.name ?? ''}
  size="md"
  className="rounded-xl object-cover flex-shrink-0"
  style={{ width: '52px', height: '52px' }}
/>
```

Apply the same replacement in the triggered alerts map (same pattern).

- [ ] **Step 8.4: ProductDetail — hero image**

In `ProductDetail.jsx`, add the import:
```jsx
import ProductImage from '../components/ProductImage';
```

Replace the hero image block (the `{imageUrl ? <img> : <div>📦</div>}` block inside the `relative` hero div):
```jsx
<ProductImage
  src={imageUrl}
  alt={product?.name ?? 'Product'}
  size="lg"
  style={{
    width: '100%',
    height: '220px',
    objectFit: 'cover',
    borderBottomLeftRadius: '24px',
    borderBottomRightRadius: '24px',
  }}
/>
```

Note: `StashdPlaceholder` size `lg` renders `height: 220` — matches the hero slot. The gradient overlay `div` that sits on top of the image lives in its own `absolute inset-0` div and is unaffected.

- [ ] **Step 8.5: Verify build passes**

```bash
npm run build 2>&1 | tail -5
```
Expected: `✓ built in` with no errors.

- [ ] **Step 8.6: Commit**

```bash
git add src/pages/Dashboard.jsx src/pages/ListDetail.jsx src/pages/Alerts.jsx src/pages/ProductDetail.jsx
git commit -m "feat: replace all image fallbacks with StashdPlaceholder (S monogram) via ProductImage"
```

---

### Task 9: BottomNav CSS hardening + final build verify

**Files:**
- Modify: `src/components/BottomNav.jsx`

- [ ] **Step 9.1: Harden nav and FAB styles**

In `BottomNav.jsx`, update the `nav` inline style object to be explicit about every stacking property. Replace the existing `nav` style:

```jsx
style={{
  position:      'fixed',
  bottom:        0,
  left:          0,
  right:         0,
  zIndex:        40,
  overflow:      'visible',          /* REQUIRED: lets FAB protrude above the bar */
  background:    '#0D0D0D',
  borderTop:     '1px solid #1E1E1E',
  paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
}}
```

Update the FAB `button` style to make `zIndex: 50` explicit and add `touchAction: 'manipulation'` to prevent 300ms tap delay on iOS:

```jsx
style={{
  position:      'absolute',
  left:          '50%',
  transform:     'translateX(-50%)',
  top:           '-28px',
  zIndex:        50,
  width:         '56px',
  height:        '56px',
  borderRadius:  '50%',
  background:    '#E8652B',
  boxShadow:     '0 4px 24px rgba(232,101,43,0.6), 0 0 0 4px #0D0D0D',
  display:       'flex',
  alignItems:    'center',
  justifyContent: 'center',
  touchAction:   'manipulation',
  cursor:        'pointer',
}}
```

- [ ] **Step 9.2: Run full build and lint**

```bash
npm run build 2>&1
npm run lint  2>&1
```

Expected output:
- Build: `✓ built in X.XXs` — zero errors, only the expected chunk-size warning.
- Lint: no `error` lines. Any `warning` lines are acceptable.

- [ ] **Step 9.3: Final commit**

```bash
git add src/components/BottomNav.jsx
git commit -m "fix: BottomNav — explicit overflow:visible, z-index stack (nav:40/FAB:50), touchAction on FAB"
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] Dashboard ALERTS ACTIVE tile → Task 3
- [x] `priceHistory` camelCase bug fix → Task 4
- [x] `price_history` seeded on save → Task 6
- [x] AreaChart gradient fill → Task 5
- [x] `src/lib/toast.js` → Task 1
- [x] All toast call sites migrated (AddProductModal, SetAlert, Lists) → Task 7
- [x] `StashdPlaceholder` S monogram → Task 2
- [x] `ProductImage` with `onError` → Task 2
- [x] Placeholder applied to Dashboard, ListDetail, Alerts, ProductDetail → Task 8
- [x] BottomNav CSS hardening → Task 9
- [x] Null-safe guard (`< 2` entries → "Monitoring price data…") → Task 5

**Placeholder scan:** No "TBD", "TODO", or vague steps. All code blocks are complete.

**Type consistency:**
- `priceHistory` state is `{ price, checked_at }[]` — used correctly in Tasks 4, 5 (both access `.price` and `.checked_at`).
- `ProductImage` props: `src`, `alt`, `size`, `className`, `style` — used identically across Tasks 2, 8.
- `StashdPlaceholder` size values: `'sm'`, `'md'`, `'lg'` — defined in SIZE_MAP in Task 2, used as string literals in Tasks 8.
- `toastSuccess(title, description)` and `toastInfo(title, description)` — signature defined in Task 1, called correctly in Tasks 7.
