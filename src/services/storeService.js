// Store Service — Fetches active stores from the backend (/api/stores)

import { PUBLIC_CONFIG } from '../config.js';

let cachedStores = null;

/**
 * Loads only Active stores (`active === true`).
 * Fetches from the server API (which reads Supabase if configured or data/stores.json).
 */
export async function fetchActiveStores() {
  if (cachedStores) {
    return cachedStores;
  }

  const response = await fetch(PUBLIC_CONFIG.storesApiEndpoint, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Unable to load stores right now.');
  }

  const data = await response.json();
  const stores = Array.isArray(data.stores) ? data.stores : [];
  cachedStores = stores.filter((store) => store && store.active === true);
  return cachedStores;
}

export function clearStoresCache() {
  cachedStores = null;
}

export const DEFAULT_SEARCH_CATEGORIES = [
  "Men's Fashion",
  "Women's Fashion",
  "Kids & Baby",
  "Jewellery & Accessories",
  "Fabric & Textile Sourcing",
  "Home & Living",
];

export function matchesStoreCategory(store, targetCategory) {
  if (!targetCategory || targetCategory === 'All') return true;
  const tc = targetCategory.toLowerCase().trim();
  const cat = (store.category || '').toLowerCase();
  const desc = (store.description || '').toLowerCase();
  const name = (store.name || '').toLowerCase();

  if (cat === tc) return true;

  if (tc === "men's fashion" || tc === 'mens fashion' || tc === 'men') {
    return (
      cat.includes('men') ||
      /men|menswear|shirt|pant|kurta|dhotis/i.test(desc) ||
      /men|thaatha/i.test(name)
    );
  }
  if (tc === "women's fashion" || tc === 'womens fashion' || tc === 'women') {
    return (
      ['sarees', 'tops', 'jeans', 'heels'].includes(cat) ||
      /women|saree|kurti|dress|blouse|heel|lehenga|top|fem/i.test(desc + ' ' + name)
    );
  }
  if (tc === 'kids & baby' || tc === 'kids' || tc === 'baby') {
    return (
      cat.includes('kid') ||
      cat.includes('baby') ||
      /kid|baby|infant|children|child/i.test(desc + ' ' + name)
    );
  }
  if (tc === 'jewellery & accessories' || tc === 'jewellery' || tc === 'accessories') {
    return (
      ['jewellery', 'heels', 'accessories'].includes(cat) ||
      /jewel|silver|gold|ornament|nakshi|temple silver|heel|accessory|bag/i.test(desc + ' ' + name)
    );
  }
  if (tc === 'fabric & textile sourcing' || tc === 'fabric' || tc === 'textiles') {
    return (
      ['sarees', 'handlooms', 'textiles'].includes(cat) ||
      /fabric|textile|handloom|weaver|cotton|silk|zari|loom|balaramapuram|sourcing/i.test(desc + ' ' + name)
    );
  }
  if (tc === 'home & living' || tc === 'home') {
    return (
      cat.includes('home') ||
      /home|living|decor|linen|handicraft|rosewood|brass|craft/i.test(desc + ' ' + name)
    );
  }

  return cat.includes(tc) || desc.includes(tc) || name.includes(tc);
}
