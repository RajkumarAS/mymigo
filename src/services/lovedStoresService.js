// Loved Stores Service — Manages Shopper's Loved / Favorited Stores
// Persists in localStorage and synchronizes across ProfilePage, StoreProfilePage, and ExploreStoresPage.

import { showToast } from '../components/AuthModal.js';

const LOVED_STORES_KEY = 'mymigo_loved_stores_v1';

// Default initial loved stores for shoppers
const DEFAULT_LOVED_STORES = [
  {
    id: 'store-kalyani-cotton',
    name: 'Kalyani Cotton',
    city: 'Coimbatore',
    category: 'Cotton Sarees & Weaves',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    instagram_url: 'https://www.instagram.com/kalyani_cotton/',
    note: 'Authentic handloom weaves direct from skilled Coimbatore weavers.',
  },
];

export function getLovedStores() {
  try {
    const raw = localStorage.getItem(LOVED_STORES_KEY);
    if (!raw) {
      localStorage.setItem(LOVED_STORES_KEY, JSON.stringify(DEFAULT_LOVED_STORES));
      return [...DEFAULT_LOVED_STORES];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...DEFAULT_LOVED_STORES];
  } catch (e) {
    return [...DEFAULT_LOVED_STORES];
  }
}

export function isStoreLoved(storeId) {
  if (!storeId) return false;
  const clean = storeId.toLowerCase().trim().replace(/^store-/, '');
  const loved = getLovedStores();
  return loved.some(
    (s) =>
      (s.id && s.id.toLowerCase() === storeId.toLowerCase()) ||
      (s.id && s.id.toLowerCase().replace(/^store-/, '') === clean) ||
      (s.name && s.name.toLowerCase() === clean.replace(/[-_]/g, ' '))
  );
}

export function toggleLovedStore(storeData) {
  if (!storeData) return { isLoved: false, lovedStores: getLovedStores() };

  const storeId = storeData.id || storeData.storeId || `store-${(storeData.name || storeData.storeName || 'store').toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  const storeName = storeData.name || storeData.storeName || 'Store';
  const lovedList = getLovedStores();
  const clean = storeId.toLowerCase().trim().replace(/^store-/, '');

  const index = lovedList.findIndex(
    (s) =>
      (s.id && s.id.toLowerCase() === storeId.toLowerCase()) ||
      (s.id && s.id.toLowerCase().replace(/^store-/, '') === clean) ||
      (s.name && s.name.toLowerCase() === storeName.toLowerCase())
  );

  let isLoved = false;
  if (index >= 0) {
    // Remove from loved stores
    lovedList.splice(index, 1);
    isLoved = false;
    showToast(`Removed from your Loves.`);
  } else {
    // Add to loved stores
    lovedList.unshift({
      id: storeId,
      name: storeName,
      city: storeData.city || 'Coimbatore',
      category: storeData.category || 'Specialty Boutique',
      image: storeData.image || storeData.avatar || storeData.poster || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
      instagram_url: storeData.instagramUrl || storeData.instagram_url || 'https://www.instagram.com/',
      note: storeData.description || 'Authentic curation loved and verified by shopper.',
    });
    isLoved = true;
    showToast('Added to your Loves ❤️');
  }

  localStorage.setItem(LOVED_STORES_KEY, JSON.stringify(lovedList));
  window.dispatchEvent(
    new CustomEvent('mymigo:loved-stores-changed', {
      detail: { isLoved, storeId, lovedStores: lovedList },
    })
  );

  return { isLoved, lovedStores: lovedList };
}
