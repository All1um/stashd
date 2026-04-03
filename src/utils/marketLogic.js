/**
 * Market Entry Index (MEI)
 *
 *   MEI = 100 × ( 1 − (currentPrice − low90) / (high90 − low90) )
 *
 * Interpretation:
 *   80–100  Strong Buy  — price is near its 90-day low, entry point is attractive
 *   40–79   Hold        — price is mid-range
 *   0–39    Overvalued  — price is near its 90-day high
 */

export function computeMEI(currentPrice, low90, high90) {
  if (high90 === low90) return 50; // flat price history → neutral
  const raw = 100 * (1 - (currentPrice - low90) / (high90 - low90));
  return Math.max(0, Math.min(100, Math.round(raw)));
}

export function getMEILabel(mei) {
  if (mei >= 80) return { label: 'Strong Buy', color: '#2ECC71' };
  if (mei >= 40) return { label: 'Hold',        color: '#D4A853' };
  return              { label: 'Overvalued',   color: '#E74C3C' };
}

/**
 * Given an array of prices (e.g. product.priceHistory or search result prices),
 * returns the MEI score and label for a given current price.
 */
export function meiFromPrices(currentPrice, priceArray) {
  if (!priceArray || priceArray.length === 0) return null;
  const low90  = Math.min(...priceArray);
  const high90 = Math.max(...priceArray);
  const score  = computeMEI(currentPrice, low90, high90);
  return { score, ...getMEILabel(score) };
}
