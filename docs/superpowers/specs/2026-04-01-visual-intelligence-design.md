# Stashd v1.2.0 — Visual Intelligence Design Spec

**Date:** 2026-04-01  
**Status:** Approved  
**Design system:** Aesthetic-Alpha  

---

## Overview

Transform Stashd from a functional database into a living market intelligence tool. Four targeted deficits are addressed: dashboard aggregates, price chart data pipeline, toast feedback standardisation, and image resilience with branded placeholder.

---

## 1. Dashboard Aggregates

**Goal:** Every stat tile reflects a real-time database query. No computed fallback from stale data.

**Change:** Swap the PRICE DROPS tile for an **ALERTS ACTIVE** tile.

- PRICE DROPS is semantically redundant — TOTAL SAVINGS already captures the same signal.
- ALERTS ACTIVE is a high-value monitoring metric with no equivalent elsewhere in the UI.

**Implementation:**
- In `Dashboard.jsx`, alongside the existing `products` fetch, run a second Supabase query:
  ```js
  supabase
    .from('price_alerts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_active', true)
    .eq('is_triggered', false)
  ```
- Store result in `alertsActive` state.
- Stats grid order: **POSITIONS · PORTFOLIO · ALERTS ACTIVE · TOTAL SAVINGS**
- ALERTS ACTIVE uses gold `#D4A853` accent (same as PORTFOLIO) when count > 0; secondary `#6B6B6B` when zero.
- Both queries fire in parallel (not sequential) to keep load time minimal.

---

## 2. Price Chart — Data Pipeline Fix + Gradient Area Fill

### 2a. Root Cause Fix

`ProductDetail.jsx` line 15 reads `product?.priceHistory ?? null`. This camelCase key is never set by any Supabase query, so `priceHistory` is permanently `null` and `PriceChart` never renders.

**Fix:** Add a `useEffect` in `ProductDetail` that fetches `price_history` on mount:
```js
supabase
  .from('price_history')
  .select('price, checked_at')
  .eq('product_id', product.id)
  .order('checked_at', { ascending: true })
```
Map rows to `{ price: row.price, date: row.checked_at }`. Store in local state `priceHistory`. Pass to `PriceChart`.

### 2b. Seed on Save

When `AddProductModal` saves a product, it currently INSERTs into `products` and `list_items`. After capturing the returned `product.id`, also INSERT one row into `price_history`:
```js
{ product_id: productRow.id, price: parsedPrice }
```
This ensures every product has ≥1 history point immediately, so the chart is never permanently blank.

### 2c. PriceChart — Gradient Area Fill

Upgrade `PriceChart.jsx` from a bare line to a **line + gradient area fill** using Recharts' `AreaChart`:

- Replace `LineChart` + `Line` with `AreaChart` + `Area`.
- Define a `<defs><linearGradient>` with id `goldGradient`: top stop `rgba(212,168,83,0.18)`, bottom stop `rgba(212,168,83,0)`.
- `Area` props: `fill="url(#goldGradient)"`, `stroke="#D4A853"`, `strokeWidth={2}`, `dot={false}`.
- Add `XAxis` with `dataKey="date"` — hidden (`hide`) but feeds tooltip date display.
- Tooltip upgraded to show both price and formatted date.
- 30/60/90d toggle slices `priceHistory` array by the last N entries.
- Null-safe: if `priceHistory` has 0 or 1 entries, show an "Insufficient data" micro-state instead of a broken chart.

---

## 3. Toast Feedback — Standardisation

### 3a. Create `src/lib/toast.js`

Single source of truth for all Sonner toast calls:

```js
import { toast } from 'sonner';

const baseStyle = {
  fontFamily: 'Inter, sans-serif',
  background: '#141414',
  border: '1px solid #1E1E1E',
  color: '#F5F0E8',
};
const monoGold = { fontFamily: 'DM Mono, monospace', color: '#D4A853' };

export const toastSuccess = (title, description) =>
  toast(title, { description, style: baseStyle, descriptionStyle: monoGold });

export const toastInfo = (title, description) =>
  toast(title, { description, style: baseStyle, descriptionStyle: monoGold });
```

No red. No `toast.error()`. All feedback uses gold DM Mono descriptions.

### 3b. Migration Map

Replace every raw `toast()` / `toast.success()` / `toast.error()` call:

| File | Operation | New call |
|------|-----------|----------|
| `AddProductModal.jsx` | Product saved | `toastSuccess('Saved to Stashd', name)` |
| `AddProductModal.jsx` | Save failed | `toastInfo('Could not save', error.message)` |
| `AddProductModal.jsx` | Missing info | `toastInfo('Missing info', 'Add a product name and price first.')` |
| `SetAlert.jsx` | Alert saved | `toastSuccess('Alert set', 'Notify when ↓ $X.XX')` |
| `SetAlert.jsx` | Sign in prompt | `toastInfo('Sign in to set alerts', '')` |
| `SetAlert.jsx` | Invalid price | `toastInfo('Enter a valid target price', '')` |
| `Lists.jsx` | List created | `toastSuccess('List created', name)` |
| `Lists.jsx` | List renamed | `toastSuccess('List updated', newName)` |

---

## 4. Image Resilience

### 4a. `StashdPlaceholder` Component

Create `src/components/StashdPlaceholder.jsx`:

- Props: `size` (default `'md'` — maps to pixel sizes), `className`, `style`.
- Renders a `div` with background `#141414`, a centred SVG containing:
  - Outer circle: `rgba(212,168,83,0.08)` fill, `rgba(212,168,83,0.2)` stroke (1px).
  - Inner "S" glyph: Playfair Display serif, gold `#D4A853`.
  - Sub-label: "STASHD" in DM Mono, 8px, `#6B6B6B`, letter-spacing 0.15em.
- Size map: `sm` = 40×40px, `md` = 60×60px, `lg` = 100% width / 220px height (hero).

### 4b. `onError` Pattern

Every `<img>` tag across Dashboard, ListDetail, Alerts, and ProductDetail gets:
```jsx
onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
```
…paired with a hidden `<StashdPlaceholder>` sibling that becomes visible on error. This avoids React re-renders and is instantaneous.

Alternatively (simpler): use a controlled `imgError` state per image and swap the `src` to a data URI inline SVG. Decision: use the **state swap** approach for cleaner JSX — `useState(false)` for `imgFailed`, render `StashdPlaceholder` when true, `onError={() => setImgFailed(true)}` on the `<img>`.

---

## 5. BottomNav CSS Polish

**Confirmed correct structure** (no changes to logic, only hardening):

- `nav` element: `position: fixed`, `overflow: visible` (explicit, not relying on default), `zIndex: 40`.
- FAB `button`: `position: absolute`, `top: '-28px'`, `left: '50%'`, `transform: 'translateX(-50%)'`, `zIndex: 50`.
- `box-shadow` ring uses `0 0 0 4px #0D0D0D` (matches nav background) — must not be clipped by any ancestor.
- All page scroll containers (`Lists`, `Dashboard`, `Alerts`, `ListDetail`) must have no `overflow: hidden` on the root div — they use `overflow-y: auto` which does not clip `position: fixed` descendants.
- Confirm `App.jsx` / `Home.jsx` root divs do not set `overflow: hidden` globally.

---

## Null-Safety Contract

- `priceHistory` length 0 → show "Monitoring price data…" micro-state in chart card, not a broken chart.
- `alertsActive` query error → tile shows `—` (em dash), not `0` or crash.
- `StashdPlaceholder` is always rendered, never the `📦` emoji.
- All `.toFixed()` calls guarded by `?? 0` on the value.

---

## Files Changed

| File | Type |
|------|------|
| `src/pages/Dashboard.jsx` | Modified |
| `src/pages/ProductDetail.jsx` | Modified |
| `src/components/product/PriceChart.jsx` | Modified |
| `src/components/AddProductModal.jsx` | Modified (seed price_history + toasts) |
| `src/components/product/SetAlert.jsx` | Modified (toasts) |
| `src/pages/Lists.jsx` | Modified (toasts) |
| `src/components/BottomNav.jsx` | Modified (CSS hardening) |
| `src/lib/toast.js` | **New** |
| `src/components/StashdPlaceholder.jsx` | **New** |
