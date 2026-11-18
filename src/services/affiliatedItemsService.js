// Affiliated Items Service — Manages Shopper's Affiliated Products
// Persists in localStorage and synchronizes across StoreProfilePage and ProfilePage.

import { showToast } from '../components/AuthModal.js';
import { PROFILES_DATA } from '../data/profiles.js';

const AFFILIATED_ITEMS_KEY = 'mymigo_affiliated_items_v1';

const DEFAULT_AFFILIATED_ITEMS = PROFILES_DATA.raajkumar?.affiliatedItems || [
  {
    id: 'aff-1',
    productId: 'kalyani-prod-1',
    title: 'Kalyani Pure Cotton Handloom Saree',
    name: 'Kalyani Pure Cotton Handloom Saree',
    store: 'Kalyani Cotton',
    storeId: 'store-kalyani-cotton',
    category: 'Sarees',
    price: '₹1,499',
    priceNumber: 1499,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    description: '100% breathable organic cotton with contrasting thread border.',
  },
];

export function getAffiliatedItems() {
  try {
    const raw = localStorage.getItem(AFFILIATED_ITEMS_KEY);
    if (!raw) {
      localStorage.setItem(AFFILIATED_ITEMS_KEY, JSON.stringify(DEFAULT_AFFILIATED_ITEMS));
      return [...DEFAULT_AFFILIATED_ITEMS];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...DEFAULT_AFFILIATED_ITEMS];
  } catch (e) {
    return [...DEFAULT_AFFILIATED_ITEMS];
  }
}

export function isItemAffiliated(productId) {
  if (!productId) return false;
  const cleanId = String(productId).toLowerCase().trim();
  const list = getAffiliatedItems();
  return list.some(
    (item) =>
      (item.id && String(item.id).toLowerCase() === cleanId) ||
      (item.productId && String(item.productId).toLowerCase() === cleanId) ||
      (item.title && item.title.toLowerCase().includes(cleanId)) ||
      (item.name && item.name.toLowerCase().includes(cleanId))
  );
}

export function toggleAffiliatedItem(productData, storeData = {}) {
  if (!productData) return { isAffiliated: false, items: getAffiliatedItems() };

  const prodId = productData.id || productData.productId || `prod-${Date.now()}`;
  const prodTitle = productData.name || productData.title || 'Product';
  const cleanId = String(prodId).toLowerCase().trim();
  const list = getAffiliatedItems();

  const index = list.findIndex(
    (item) =>
      (item.id && String(item.id).toLowerCase() === cleanId) ||
      (item.productId && String(item.productId).toLowerCase() === cleanId) ||
      (item.title && item.title.toLowerCase() === prodTitle.toLowerCase()) ||
      (item.name && item.name.toLowerCase() === prodTitle.toLowerCase())
  );

  let isAffiliated = false;
  if (index >= 0) {
    list.splice(index, 1);
    isAffiliated = false;
    showToast('Removed from Affiliated Items.');
  } else {
    const newItem = {
      id: prodId,
      productId: prodId,
      title: prodTitle,
      name: prodTitle,
      store: storeData.name || storeData.storeName || productData.store || 'Kalyani Cotton',
      storeId: storeData.id || storeData.storeId || productData.storeId || 'store-kalyani-cotton',
      category: productData.category || 'Specialty Collection',
      price: productData.price || '₹1,450',
      priceNumber: parseInt(String(productData.price || '').replace(/[^0-9]/g, '')) || 1450,
      originalPrice: productData.originalPrice || '',
      discount: productData.discount || 'Special Offer',
      deliveryBadge: productData.deliveryBadge || 'Next Day Delivery',
      image:
        productData.image ||
        (Array.isArray(productData.images) && productData.images[0]) ||
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
      description: productData.description || `Curated and affiliated from ${storeData.name || 'Store'}.`,
      addedAt: Date.now(),
    };
    list.unshift(newItem);
    isAffiliated = true;
    showToast('Linked to Affiliate 🔗');
  }

  localStorage.setItem(AFFILIATED_ITEMS_KEY, JSON.stringify(list));
  window.dispatchEvent(
    new CustomEvent('mymigo:affiliated-items-changed', {
      detail: { isAffiliated, productId: prodId, items: list },
    })
  );

  return { isAffiliated, items: list };
}
