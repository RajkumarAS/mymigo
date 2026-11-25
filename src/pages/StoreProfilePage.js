// Store Profile Page — Instagram Business Profile Model for MyMigo
// Supports:
// 1. Seller & Customer views with Edit Store Profile (change photo, name, bio, place).
// 2. Story Highlights row with "+" button at first position (Add Highlight) and fullscreen Story Viewer.
// 3. Products Section: "Shop By" toggle filter, 2 products per row, up to 6 images each, and "+ Add Product" option.
// 4. Videos Section: Reels grid with play count, duration, and scrollable up to 10 products with Quick Buy.
// 5. Photos Section: 3-column Instagram photo grid, "+ Create Poster / Add Photo" option, and lightbox with Previous/Next navigation.
// 6. Persistent state stored in localStorage so changes stay live across hosting and reloads.

import { fetchActiveStores } from '../services/storeService.js';
import { openBookingModal } from '../components/BookingModal.js';
import { openQuickBuyModal } from '../components/QuickBuyModal.js';
import { openImageGalleryModal } from '../components/ImageGalleryModal.js';
import { openShareModal } from '../components/ShareModal.js';
import {
  getStoreProfileData,
  updateStoreProfile,
  addHighlightToStore,
  addProductToStore,
  addPostToStore,
} from '../data/storeProfileData.js';
import { getCurrentUser, openAccountSwitcherBottomSheet } from '../components/AuthModal.js';
import { isStoreLoved, toggleLovedStore } from '../services/lovedStoresService.js';
import { isItemAffiliated, toggleAffiliatedItem } from '../services/affiliatedItemsService.js';
import { uploadMediaFile } from '../services/profileService.js';
import { escapeHtml } from '../utils/dom.js';

export async function renderStoreProfilePage(container, storeId, navigate) {
  let activeStores = [];
  try {
    activeStores = await fetchActiveStores();
  } catch {
    activeStores = [];
  }

  // Support both "kalyani-cotton" and "store-kalyani-cotton" and handle formats
  const cleanId = (storeId || '').toLowerCase().trim();
  let store = activeStores.find(
    (s) =>
      (s.id && s.id.toLowerCase() === cleanId) ||
      (s.id && s.id.toLowerCase() === `store-${cleanId}`) ||
      (s.id && s.id.toLowerCase().replace(/^store-/, '') === cleanId.replace(/^store-/, '')) ||
      (s.handle && s.handle.toLowerCase() === cleanId.replace(/[-_]/g, ''))
  );

  // Fallback to Kalyani Cotton if no store matched
  if (!store && activeStores.length > 0) {
    store = activeStores.find((s) => s.id === 'store-kalyani-cotton') || activeStores[0];
  }

  if (!store) {
    container.innerHTML = `
      <div class="max-w-3xl mx-auto px-5 sm:px-8 py-20 text-center animate-fade-up">
        <h1 class="text-2xl sm:text-3xl font-bold text-[#141413]">Store not found</h1>
        <p class="mt-3 text-sm text-[#57534E]">
          This store may be inactive or unavailable right now.
        </p>
        <button
          type="button"
          id="back-to-stores-fallback-btn"
          class="mt-6 inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-semibold bg-[#004643] text-white hover:bg-[#003634] transition-colors shadow-sm cursor-pointer"
        >
          Back to Explore Stores
        </button>
      </div>
    `;
    container.querySelector('#back-to-stores-fallback-btn')?.addEventListener('click', () => {
      navigate('/stores');
    });
    return;
  }

  // Check login state: if user is logged in as seller or explicitly toggled
  const currentUser = getCurrentUser();
  let isSellerMode =
    (currentUser && currentUser.activeRole === 'seller') ||
    localStorage.getItem(`mymigo_seller_mode_${store.id}`) === 'true';

  // Component State
  let activeTab = 'products'; // 'products' | 'videos' | 'photos'
  let selectedCategory = 'All';
  let isShopByOpen = false;

  const render = () => {
    // Reload latest profile data including any added products, highlights, posts
    const profileData = getStoreProfileData(store);
    const isLoved = isStoreLoved(store.id);

    const storeInfo = {
      id: store.id,
      storeId: store.id,
      storeName: profileData.name,
      city: profileData.city,
      avatar: profileData.avatar,
      poster: profileData.avatar,
      whatsappNumber: profileData.whatsappNumber,
      handle: profileData.handle,
      category: profileData.category,
      instagramUrl: profileData.instagramUrl,
    };

    // Filter products by selected category
    const filteredProducts = profileData.products.filter((p) => {
      if (selectedCategory === 'All') return true;
      return p.category && p.category.toLowerCase() === selectedCategory.toLowerCase();
    });

    // Unique categories with counts
    const availableCategories = ['All', ...new Set(profileData.products.map((p) => p.category).filter(Boolean))];

    container.innerHTML = `
      <div class="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8 animate-fade-in select-none">
        
        <!-- Top Navigation Header -->
        <div class="flex items-center justify-between gap-2.5 mb-4 sm:mb-6">
          <button
            type="button"
            id="store-back-btn"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#DCD6C9] text-xs sm:text-sm font-semibold text-[#141413] hover:bg-[#F0EDE5] transition-colors shadow-2xs cursor-pointer active:scale-95 shrink-0"
            title="Back to Stores"
          >
            <svg class="w-4 h-4 text-[#57534E]" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Stores</span>
          </button>

          <!-- Centered Handle with Verified Badge & Instagram-style Dropdown Caret for Account Switching -->
          <button
            type="button"
            id="store-header-account-switcher-btn"
            class="flex items-center gap-1.5 min-w-0 px-2 py-1 rounded-xl hover:bg-stone-200/60 transition-colors cursor-pointer active:scale-95"
            title="Click or hold to switch accounts"
          >
            <span class="text-sm sm:text-base font-extrabold text-[#141413] truncate">
              @${escapeHtml(profileData.handle)}
            </span>
            <svg class="w-4 h-4 text-[#004643] shrink-0" fill="currentColor" viewBox="0 0 24 24" title="Verified Partner Boutique">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <svg class="w-3.5 h-3.5 text-[#78716C] shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          <!-- Top Actions: Love Button & Share -->
          <div class="flex items-center gap-2 shrink-0">
            <!-- Love / Favorite Header Button -->
            <button
              type="button"
              id="store-love-header-btn"
              class="p-2 rounded-full border transition-all cursor-pointer shadow-2xs active:scale-95 ${
                isLoved
                  ? 'bg-rose-50 border-rose-300 text-rose-600 ring-2 ring-rose-200/50'
                  : 'bg-white border-[#DCD6C9] text-[#78716C] hover:bg-[#F0EDE5] hover:text-rose-600'
              }"
              title="${isLoved ? 'In My Loves (tap to remove)' : 'Add to My Loves'}"
              aria-label="${isLoved ? 'Remove from My Loves' : 'Add to My Loves'}"
            >
              <svg class="w-4 h-4 ${isLoved ? 'fill-rose-500 text-rose-500 scale-105' : 'fill-none text-current'} transition-transform" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>

            <!-- Share Button -->
            <button
              type="button"
              id="store-share-btn"
              class="p-2 rounded-full bg-white border border-[#DCD6C9] text-[#141413] hover:bg-[#F0EDE5] transition-colors shadow-2xs cursor-pointer active:scale-95"
              title="Share Store Profile"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Instagram Business Profile Card -->
        <section class="bg-white rounded-3xl border border-[#DCD6C9] p-4 sm:p-7 shadow-[0_10px_30px_-15px_rgba(20,20,19,0.06)] mb-5 sm:mb-6">
          
          <!-- Profile Header: Avatar + Stats Row -->
          <div class="flex items-center gap-4 sm:gap-8 mb-4">
            
            <!-- Avatar with Instagram Story Gradient Ring & Seller Edit Badge (No scrollbar or lines) -->
            <div class="relative shrink-0 group">
              <button
                type="button"
                id="store-avatar-trigger-btn"
                class="block w-20 h-20 sm:w-24 sm:h-24 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shadow-md cursor-pointer active:scale-95 transition-transform text-left overflow-hidden focus:outline-none"
                title="Click to view profile picture"
              >
                <div class="w-full h-full rounded-full p-[2px] bg-white overflow-hidden">
                  <img
                    id="store-avatar-img"
                    src="${escapeHtml(profileData.avatar)}"
                    alt="${escapeHtml(profileData.name)}"
                    class="w-full h-full object-cover rounded-full"
                  />
                </div>
              </button>

              <!-- Seller Edit Avatar Button (or Video Badge for shoppers) -->
              ${
                isSellerMode
                  ? `
                <button
                  type="button"
                  id="seller-edit-avatar-btn"
                  title="Change Profile Picture"
                  class="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#004643] hover:bg-[#003634] text-white flex items-center justify-center text-xs font-bold border-2 border-white shadow-md cursor-pointer transition-transform active:scale-95"
                >
                  📷
                </button>
              `
                  : `
                <span class="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#004643] text-white flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-xs" title="Live Video Available">
                  📹
                </span>
              `
              }
            </div>

            <!-- Stats Counters (Instagram Style: Posts, Connections, Products) -->
            <div class="flex-1 grid grid-cols-3 gap-1 sm:gap-3 text-center">
              <div class="p-1 sm:p-2">
                <span class="block text-base sm:text-xl font-extrabold text-[#141413] tracking-tight">
                  ${escapeHtml(profileData.stats.posts)}
                </span>
                <span class="block text-[11px] sm:text-xs text-[#78716C] font-medium">Posts</span>
              </div>
              <div class="p-1 sm:p-2">
                <span class="block text-base sm:text-xl font-extrabold text-[#141413] tracking-tight">
                  ${escapeHtml(profileData.stats.followers)}
                </span>
                <span class="block text-[11px] sm:text-xs text-[#78716C] font-medium">Connections</span>
              </div>
              <div class="p-1 sm:p-2">
                <span class="block text-base sm:text-xl font-extrabold text-[#004643] tracking-tight">
                  ${escapeHtml(profileData.stats.products)}
                </span>
                <span class="block text-[11px] sm:text-xs text-[#78716C] font-medium">Products</span>
              </div>
            </div>

          </div>

          <!-- Bio & Store Details -->
          <div class="space-y-1.5 mb-4">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <h1 class="text-base sm:text-xl font-bold text-[#141413]">
                  ${escapeHtml(profileData.name)}
                </h1>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#004643]/10 text-[#004643] tracking-wide">
                  ${escapeHtml(profileData.category)}
                </span>
              </div>

              <!-- Edit Profile CTA for Seller Mode -->
              ${
                isSellerMode
                  ? `
                <button
                  type="button"
                  id="seller-edit-profile-btn"
                  class="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
                >
                  <svg class="w-3.5 h-3.5 text-amber-700" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span>Edit Profile</span>
                </button>
              `
                  : ''
              }
            </div>
            
            <p class="text-xs font-semibold text-[#57534E]">
              Clothing (Brand) • ${escapeHtml(profileData.city)}, Tamil Nadu
            </p>

            <p class="text-xs sm:text-sm text-[#44403C] leading-relaxed max-w-2xl">
              ${escapeHtml(profileData.description)}
            </p>

            <div class="flex items-center gap-3 pt-1 text-[11px] text-[#78716C]">
              <span class="flex items-center gap-1">
                <span>📍</span> ${escapeHtml(profileData.address || profileData.city)}
              </span>
              <span class="text-[#DCD6C9]">•</span>
              <span class="text-emerald-700 font-bold flex items-center gap-1">
                <span>⚡</span> Next Day Delivery
              </span>
            </div>
          </div>

          <!-- Primary Action Buttons: Book Video Call & Loved Store Toggle -->
          <div class="pt-2 flex items-center gap-2.5">
            <button
              type="button"
              id="store-book-call-btn"
              class="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[#004643] hover:bg-[#003634] active:scale-98 text-white transition-all shadow-sm cursor-pointer"
            >
              <svg class="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Book Video Call</span>
            </button>

            <!-- Loved Store Action Pill Button -->
            <button
              type="button"
              id="store-love-action-btn"
              class="shrink-0 inline-flex items-center justify-center gap-1.5 py-3 px-3.5 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-2xs cursor-pointer border active:scale-95 ${
                isLoved
                  ? 'bg-rose-50 text-rose-700 border-rose-300 ring-2 ring-rose-200/50'
                  : 'bg-white text-[#44403C] border-[#DCD6C9] hover:bg-[#F0EDE5] hover:text-rose-600'
              }"
              title="${isLoved ? 'In My Loves (tap to remove)' : 'Add to My Loves'}"
              aria-label="${isLoved ? 'In My Loves' : 'Add to My Loves'}"
            >
              <svg class="w-4 h-4 ${isLoved ? 'fill-rose-500 text-rose-500 scale-110' : 'fill-none text-current'} transition-transform" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>${isLoved ? 'Loved' : 'Love'}</span>
            </button>
          </div>

          <!-- Story Highlights Row with "+" Add Button at First Position -->
          <div class="flex items-center gap-3 sm:gap-5 pt-5 mt-4 border-t border-[#F0EDE5] overflow-x-auto no-scrollbar pb-1">
            
            <!-- "+" Add Highlight Button (Always First) -->
            <div class="flex flex-col items-center gap-1 shrink-0 cursor-pointer group" id="add-highlight-trigger-btn">
              <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-dashed border-[#004643] bg-[#004643]/5 group-hover:bg-[#004643]/15 flex items-center justify-center transition-all group-hover:scale-105 shadow-xs">
                <svg class="w-6 h-6 text-[#004643]" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span class="text-[10px] sm:text-[11px] font-bold text-[#004643] group-hover:underline">
                + New
              </span>
            </div>

            <!-- Highlights Items (Click opens fullscreen story viewer) -->
            ${profileData.highlights
              .map(
                (hl) => `
              <div
                class="flex flex-col items-center gap-1 shrink-0 cursor-pointer group"
                data-open-story-highlight="${escapeHtml(hl.id || hl.title)}"
                title="View ${escapeHtml(hl.title)} Story"
              >
                <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-[2px] border-2 border-[#DCD6C9] group-hover:border-[#004643] transition-all overflow-hidden group-hover:scale-105 shadow-xs">
                  <img
                    src="${escapeHtml(hl.img)}"
                    alt="${escapeHtml(hl.title)}"
                    class="w-full h-full object-cover rounded-full"
                  />
                </div>
                <span class="text-[10px] sm:text-[11px] font-semibold text-[#57534E] group-hover:text-[#141413]">
                  ${escapeHtml(hl.title)}
                </span>
              </div>
            `
              )
              .join('')}
          </div>

        </section>

        <!-- Profile Tabs Bar (Products, Videos / Reels, Photos) - Single Line Guaranteed -->
        <div class="bg-white rounded-2xl border border-[#DCD6C9] p-1 sm:p-1.5 mb-5 flex items-center justify-around shadow-2xs gap-1">
          
          <!-- Tab 1: Products -->
          <button
            type="button"
            data-profile-tab="products"
            class="flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 px-1.5 sm:px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'products'
                ? 'bg-[#004643] text-white shadow-sm'
                : 'text-[#78716C] hover:text-[#141413] hover:bg-[#F0EDE5]'
            }"
          >
            <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span class="whitespace-nowrap leading-none">Products (${profileData.products.length})</span>
          </button>

          <!-- Tab 2: Videos / Reels -->
          <button
            type="button"
            data-profile-tab="videos"
            class="flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 px-1.5 sm:px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'videos'
                ? 'bg-[#004643] text-white shadow-sm'
                : 'text-[#78716C] hover:text-[#141413] hover:bg-[#F0EDE5]'
            }"
          >
            <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="whitespace-nowrap leading-none">Videos (${profileData.videos.length})</span>
          </button>

          <!-- Tab 3: Photos -->
          <button
            type="button"
            data-profile-tab="photos"
            class="flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 px-1.5 sm:px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'photos'
                ? 'bg-[#004643] text-white shadow-sm'
                : 'text-[#78716C] hover:text-[#141413] hover:bg-[#F0EDE5]'
            }"
          >
            <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span class="whitespace-nowrap leading-none">Photos (${profileData.posts.length})</span>
          </button>

        </div>

        <!-- ========================================== -->
        <!-- TAB 1: PRODUCTS SECTION                     -->
        <!-- ========================================== -->
        ${
          activeTab === 'products'
            ? `
          <div id="store-products-view" class="space-y-4 animate-fade-in">
            
            <!-- "Shop By" Filter Bar with Toggle Button, Category Chips, and "+ Add Product" -->
            <div class="bg-white rounded-2xl border border-[#DCD6C9] p-3 shadow-2xs flex flex-col gap-2.5">
              
              <div class="flex items-center justify-between gap-2">
                
                <div class="flex items-center gap-2 shrink-0">
                  <!-- "Shop By" Toggle Pill Button -->
                  <button
                    type="button"
                    id="shop-by-toggle-btn"
                    aria-expanded="${isShopByOpen}"
                    title="Shop By Category"
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#004643] hover:bg-[#003634] active:scale-95 text-white text-xs font-bold shadow-xs cursor-pointer transition-all shrink-0 group ${
                      isShopByOpen ? 'ring-2 ring-emerald-400/50' : ''
                    }"
                  >
                    <svg class="w-3.5 h-3.5 text-emerald-300 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span>Shop By: ${selectedCategory === 'All' ? 'All' : escapeHtml(selectedCategory)}</span>
                    <svg class="shop-by-caret w-3.5 h-3.5 text-emerald-300 transition-transform duration-200 shrink-0 ${
                      isShopByOpen ? 'rotate-180' : ''
                    }" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <!-- "+ Add Product" Button -->
                  <button
                    type="button"
                    id="store-add-product-btn"
                    class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
                    title="Add a New Product"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add Product</span>
                  </button>
                </div>

                <!-- Active category count badge -->
                <span class="text-xs text-[#78716C] font-semibold truncate">
                  ${filteredProducts.length} ${filteredProducts.length === 1 ? 'item' : 'items'}
                </span>

              </div>

              <!-- Collapsible Category Chips (Hidden by default; revealed on click) -->
              <div
                id="shop-by-categories-container"
                class="items-center gap-1.5 overflow-x-auto no-scrollbar py-1 transition-all duration-200 ${
                  isShopByOpen ? 'flex opacity-100' : 'hidden opacity-0'
                }"
              >
                ${availableCategories
                  .map((cat) => {
                    const count =
                      cat === 'All'
                        ? profileData.products.length
                        : profileData.products.filter(
                            (p) => p.category && p.category.toLowerCase() === cat.toLowerCase()
                          ).length;
                    return `
                    <button
                      type="button"
                      data-category-pill="${escapeHtml(cat)}"
                      class="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                        selectedCategory.toLowerCase() === cat.toLowerCase()
                          ? 'bg-[#004643] text-white shadow-xs ring-1 ring-emerald-400/40'
                          : 'bg-[#F0EDE5] text-[#57534E] hover:bg-[#E7E3D9] hover:text-[#141413] border border-[#DCD6C9]'
                      }"
                    >
                      ${escapeHtml(cat)} (${count})
                    </button>
                  `;
                  })
                  .join('')}
              </div>

            </div>

            <!-- 2 Products Per Grid Row -->
            <div class="grid grid-cols-2 gap-3 sm:gap-4.5">
              ${filteredProducts
                .map((product) => {
                  const isAffiliated = isItemAffiliated(product.id);
                  return `
                <div class="product-card bg-white rounded-2xl border border-[#DCD6C9] overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col group">
                  
                  <!-- Product Image (Click opens 6-Image Gallery) -->
                  <div
                    class="relative aspect-[4/5] bg-[#F8F6F0] overflow-hidden cursor-pointer"
                    data-open-product-gallery="${escapeHtml(product.id)}"
                    title="Click to view ${product.images?.length || 6} photos in gallery"
                  >
                    <img
                      src="${escapeHtml(product.image)}"
                      alt="${escapeHtml(product.name)}"
                      class="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                      loading="lazy"
                    />

                    <!-- Discount Badge -->
                    <span class="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                      ${escapeHtml(product.discount || 'Special')}
                    </span>

                    <!-- Photo Gallery Indicator (Up to 6 images) -->
                    <span class="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1 shadow-xs pointer-events-none">
                      <svg class="w-3 h-3 text-emerald-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>${product.images?.length || 6} photos</span>
                    </span>
                  </div>

                  <!-- Product Info -->
                  <div class="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span class="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#004643]/10 text-[#004643] mb-1">
                        ${escapeHtml(product.category)}
                      </span>
                      
                      <h3
                        class="text-xs sm:text-sm font-bold text-[#141413] leading-snug line-clamp-2 cursor-pointer hover:text-[#004643] transition-colors"
                        data-open-product-gallery="${escapeHtml(product.id)}"
                      >
                        ${escapeHtml(product.name)}
                      </h3>
                    </div>

                    <div class="mt-2.5 pt-2 border-t border-[#F0EDE5]">
                      <!-- Price Row -->
                      <div class="flex items-baseline gap-1.5 mb-1.5">
                        <span class="text-sm sm:text-base font-black text-[#004643]">
                          ${escapeHtml(product.price)}
                        </span>
                        ${
                          product.originalPrice
                            ? `<span class="text-[11px] text-[#78716C] line-through">${escapeHtml(product.originalPrice)}</span>`
                            : ''
                        }
                      </div>

                      <!-- Next Day Delivery Pill -->
                      <div class="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 w-fit mb-2.5">
                        <span>⚡</span>
                        <span>${escapeHtml(product.deliveryBadge || 'Next Day Delivery')}</span>
                      </div>

                      <!-- Action Row: Buy Button (without arrow mark) & Affiliate Link Button (Icon Only, highlighted when clicked) -->
                      <div class="flex items-center gap-2">
                        <button
                          type="button"
                          data-quick-buy-id="${escapeHtml(product.id)}"
                          class="flex-1 py-2 px-3 rounded-xl bg-[#004643] hover:bg-[#003634] active:scale-97 text-white font-extrabold text-xs transition-all shadow-xs flex items-center justify-center cursor-pointer"
                        >
                          <span>Buy</span>
                        </button>

                        <button
                          type="button"
                          data-affiliate-product-btn="${escapeHtml(product.id)}"
                          class="w-9 h-9 rounded-xl border transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0 flex items-center justify-center ${
                            isAffiliated
                              ? 'bg-[#002624] border-[#001816] text-emerald-300 ring-2 ring-emerald-500/50 shadow-sm'
                              : 'bg-[#F0EDE5] border-[#DCD6C9] text-[#57534E] hover:text-[#004643] hover:border-[#004643] hover:bg-white'
                          }"
                          title="${isAffiliated ? 'Linked to Affiliate (tap to remove)' : 'Affiliate to profile'}"
                          aria-label="${isAffiliated ? 'Linked to Affiliate' : 'Affiliate to profile'}"
                        >
                          <svg class="w-4 h-4 ${isAffiliated ? 'stroke-emerald-300' : 'stroke-current'}" fill="none" stroke="currentColor" stroke-width="2.3" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                        </button>
                      </div>
                    </div>

                  </div>

                </div>
              `;
                })
                .join('')}
            </div>

          </div>
        `
            : ''
        }

        <!-- ========================================== -->
        <!-- TAB 2: VIDEOS / REELS SECTION               -->
        <!-- ========================================== -->
        ${
          activeTab === 'videos'
            ? `
          <div id="store-videos-view" class="animate-fade-in">
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
              ${profileData.videos
                .map(
                  (vid) => `
                <div
                  class="relative aspect-[9/16] rounded-2xl overflow-hidden bg-black border border-[#DCD6C9] group cursor-pointer shadow-xs hover:shadow-md transition-all"
                  data-open-store-reel="${escapeHtml(vid.id)}"
                  title="${escapeHtml(vid.title)}"
                >
                  <img
                    src="${escapeHtml(vid.poster)}"
                    alt="${escapeHtml(vid.title)}"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  <!-- Dark Gradient Overlay -->
                  <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30 pointer-events-none"></div>

                  <!-- Top Stats: Duration & Reel Icon -->
                  <div class="absolute top-2.5 inset-x-2.5 flex items-center justify-between text-white text-[11px] font-bold">
                    <span class="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs flex items-center gap-1">
                      🎬 Reel
                    </span>
                    <span class="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs font-mono">
                      ${escapeHtml(vid.duration)}
                    </span>
                  </div>

                  <!-- Play Center Icon on Hover -->
                  <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div class="w-12 h-12 rounded-full bg-white/90 text-[#004643] flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                      <svg class="w-6 h-6 fill-current ml-0.5" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>

                  <!-- Bottom Title & View Count -->
                  <div class="absolute bottom-2.5 inset-x-2.5 text-white">
                    <p class="text-xs font-bold leading-snug line-clamp-2 drop-shadow-sm mb-1">
                      ${escapeHtml(vid.title)}
                    </p>
                    <div class="flex items-center gap-1 text-[11px] font-semibold text-emerald-300">
                      <span>▶</span>
                      <span>${escapeHtml(vid.views)} views</span>
                    </div>
                  </div>

                </div>
              `
                )
                .join('')}
            </div>
          </div>
        `
            : ''
        }

        <!-- ========================================== -->
        <!-- TAB 3: PHOTOS / POSTS SECTION               -->
        <!-- ========================================== -->
        ${
          activeTab === 'photos'
            ? `
          <div id="store-photos-view" class="animate-fade-in space-y-3">
            
            <!-- Header bar with "Create Poster" option -->
            <div class="flex items-center justify-between bg-white rounded-2xl border border-[#DCD6C9] p-3 shadow-2xs">
              <span class="text-xs font-bold text-[#141413]">
                Photos & Posters (${profileData.posts.length})
              </span>
              
              <button
                type="button"
                id="store-create-poster-btn"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#004643] hover:bg-[#003634] active:scale-95 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                title="Upload Photo or Poster"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span>Create Poster</span>
              </button>
            </div>

            <div class="grid grid-cols-3 gap-1 sm:gap-2.5">
              ${profileData.posts
                .map(
                  (post) => `
                <div
                  class="relative aspect-square rounded-xl overflow-hidden bg-[#F0EDE5] border border-[#E7E3D9] group cursor-pointer"
                  data-open-photo-lightbox="${escapeHtml(post.id)}"
                  title="${escapeHtml(post.caption)}"
                >
                  <img
                    src="${escapeHtml(post.image)}"
                    alt="${escapeHtml(post.caption)}"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  <!-- Hover Overlay with Likes Count -->
                  <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white text-xs font-bold p-2 text-center">
                    <div class="flex items-center gap-1 text-rose-400">
                      <span>❤️</span>
                      <span>${escapeHtml(post.likes)}</span>
                    </div>
                    <div class="flex items-center gap-1 text-zinc-300 text-[10px]">
                      <span>💬</span>
                      <span>${escapeHtml(post.comments)}</span>
                    </div>
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        `
            : ''
        }

      </div>
    `;

    // ----------------------------------------------------
    // Event Listeners
    // ----------------------------------------------------

    // Instagram-style header handle dropdown: Opens Bottom Sheet Account Switcher
    container.querySelector('#store-header-account-switcher-btn')?.addEventListener('click', () => {
      openAccountSwitcherBottomSheet(navigate, () => {
        render();
      });
    });

    // Back button
    container.querySelector('#store-back-btn')?.addEventListener('click', () => {
      navigate('/stores');
    });

    // Book Video Call / Shop Virtual
    container.querySelector('#store-book-call-btn')?.addEventListener('click', () => {
      openBookingModal(store);
    });

    // Share button
    container.querySelector('#store-share-btn')?.addEventListener('click', () => {
      openShareModal(storeInfo);
    });

    // Loved Store Toggle Handlers (Header icon button and Action pill button)
    const handleToggleLove = () => {
      toggleLovedStore({
        id: store.id,
        name: profileData.name,
        city: profileData.city,
        category: profileData.category,
        image: profileData.avatar,
        instagramUrl: profileData.instagramUrl,
        description: profileData.description,
      });
      render();
    };

    container.querySelector('#store-love-header-btn')?.addEventListener('click', handleToggleLove);
    container.querySelector('#store-love-action-btn')?.addEventListener('click', handleToggleLove);

    // Seller Edit Profile Button
    container.querySelector('#seller-edit-profile-btn')?.addEventListener('click', () => {
      openEditProfileModal(profileData, (updated) => {
        updateStoreProfile(store.id, updated);
        render();
      });
    });

    // Store Avatar Click: Opens Profile Picture Popup with enhanced height
    container.querySelector('#store-avatar-trigger-btn')?.addEventListener('click', () => {
      openStoreAvatarPopupModal(profileData, store);
    });

    // Seller Edit Avatar Button
    container.querySelector('#seller-edit-avatar-btn')?.addEventListener('click', () => {
      openEditProfileModal(profileData, (updated) => {
        updateStoreProfile(store.id, updated);
        render();
      });
    });

    // "+" Add Highlight Button
    container.querySelector('#add-highlight-trigger-btn')?.addEventListener('click', () => {
      openAddHighlightModal(profileData, (newHighlight) => {
        addHighlightToStore(store.id, newHighlight);
        render();
      });
    });

    // Story Highlight Click (Opens Instagram Story Page Viewer)
    container.querySelectorAll('[data-open-story-highlight]').forEach((hlEl) => {
      hlEl.addEventListener('click', () => {
        const hlId = hlEl.getAttribute('data-open-story-highlight');
        const foundHl = profileData.highlights.find((h) => (h.id || h.title) === hlId) || profileData.highlights[0];
        openStoryViewerModal(foundHl, profileData.highlights, storeInfo, () => {
          openBookingModal(store);
        });
      });
    });

    // Add Product Button
    container.querySelector('#store-add-product-btn')?.addEventListener('click', () => {
      openAddProductModal(profileData, (newProduct) => {
        addProductToStore(store.id, newProduct);
        render();
      });
    });

    // Create Poster Button
    container.querySelector('#store-create-poster-btn')?.addEventListener('click', () => {
      openCreatePosterModal(profileData, (newPost) => {
        addPostToStore(store.id, newPost);
        render();
      });
    });

    // Tab buttons
    container.querySelectorAll('[data-profile-tab]').forEach((tabBtn) => {
      tabBtn.addEventListener('click', () => {
        activeTab = tabBtn.getAttribute('data-profile-tab');
        render();
      });
    });

    // "Shop By" Category Toggle Button
    const shopByBtn = container.querySelector('#shop-by-toggle-btn');
    const categoriesContainer = container.querySelector('#shop-by-categories-container');
    const caret = container.querySelector('.shop-by-caret');

    shopByBtn?.addEventListener('click', () => {
      isShopByOpen = !isShopByOpen;
      shopByBtn.setAttribute('aria-expanded', isShopByOpen ? 'true' : 'false');
      if (categoriesContainer) {
        if (isShopByOpen) {
          categoriesContainer.classList.remove('hidden', 'opacity-0');
          categoriesContainer.classList.add('flex', 'opacity-100');
        } else {
          categoriesContainer.classList.add('hidden', 'opacity-0');
          categoriesContainer.classList.remove('flex', 'opacity-100');
        }
      }
      if (caret) {
        if (isShopByOpen) {
          caret.classList.add('rotate-180');
        } else {
          caret.classList.remove('rotate-180');
        }
      }
    });

    // Category Filter Chips
    container.querySelectorAll('[data-category-pill]').forEach((pill) => {
      pill.addEventListener('click', () => {
        selectedCategory = pill.getAttribute('data-category-pill');
        render();
      });
    });

    // Product Gallery Click (Image thumbnail or title click opens 6-image gallery modal)
    container.querySelectorAll('[data-open-product-gallery]').forEach((el) => {
      el.addEventListener('click', () => {
        const prodId = el.getAttribute('data-open-product-gallery');
        const prod = profileData.products.find((p) => p.id === prodId);
        if (prod) {
          openImageGalleryModal(prod, storeInfo, () => {
            openQuickBuyModal(prod, storeInfo);
          });
        }
      });
    });

    // Buy Button Click (Opens Quick Buy Modal)
    container.querySelectorAll('[data-quick-buy-id]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const prodId = btn.getAttribute('data-quick-buy-id');
        const prod = profileData.products.find((p) => p.id === prodId);
        if (prod) {
          openQuickBuyModal(prod, storeInfo);
        }
      });
    });

    // Affiliate Link Icon Click (Adds/removes product from Affiliated Items on Profile)
    container.querySelectorAll('[data-affiliate-product-btn]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const prodId = btn.getAttribute('data-affiliate-product-btn');
        const prod = profileData.products.find((p) => p.id === prodId);
        if (prod) {
          toggleAffiliatedItem(prod, {
            id: store.id,
            name: profileData.name,
          });
          render();
        }
      });
    });

    // Video / Reel Click (Opens in video finds feed with specific video selected)
    container.querySelectorAll('[data-open-store-reel]').forEach((reelEl) => {
      reelEl.addEventListener('click', () => {
        const vidId = reelEl.getAttribute('data-open-store-reel');
        navigate(`/finds?video=${encodeURIComponent(vidId)}`);
      });
    });

    // Photo Lightbox Click
    container.querySelectorAll('[data-open-photo-lightbox]').forEach((photoEl) => {
      photoEl.addEventListener('click', () => {
        const postId = photoEl.getAttribute('data-open-photo-lightbox');
        const postIdx = profileData.posts.findIndex((p) => p.id === postId);
        if (postIdx !== -1) {
          openPhotoLightbox(postIdx, profileData.posts, storeInfo);
        }
      });
    });
  };

  render();
}

/**
 * Store Profile Picture Popup Modal
 * Displays the store boutique avatar image in a clean portrait card with enhanced height (not full screen)
 */
function openStoreAvatarPopupModal(profileData, store) {
  const existing = document.getElementById('store-avatar-image-modal');
  if (existing) existing.remove();

  const avatarUrl = profileData.avatar || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';
  const storeHandle = profileData.handle || `@${profileData.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

  const modal = document.createElement('div');
  modal.id = 'store-avatar-image-modal';
  modal.className =
    'fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in select-none';

  modal.innerHTML = `
    <div class="relative w-full max-w-[340px] sm:max-w-[400px] bg-white rounded-3xl p-4 sm:p-5 shadow-2xl border border-[#DCD6C9] animate-fade-up box-border mx-auto">
      
      <!-- Header: Store info & Close Button -->
      <div class="flex items-center justify-between pb-2.5 mb-2 border-b border-[#E7E3D9]">
        <div class="flex items-center gap-2.5 min-w-0 pr-2">
          <div class="w-9 h-9 rounded-full p-[1.5px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shrink-0 shadow-2xs overflow-hidden">
            <img
              src="${escapeHtml(avatarUrl)}"
              alt="${escapeHtml(profileData.name)}"
              class="w-full h-full rounded-full object-cover bg-white"
            />
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-1">
              <h3 class="text-xs sm:text-sm font-bold text-[#141413] truncate">${escapeHtml(profileData.name)}</h3>
              <span class="w-3.5 h-3.5 rounded-full bg-[#004643] text-white flex items-center justify-center text-[8px] shrink-0 font-bold">✓</span>
            </div>
            <p class="text-[10px] sm:text-[11px] text-[#78716C] truncate">${escapeHtml(profileData.category || 'Boutique')} • ${escapeHtml(storeHandle)}</p>
          </div>
        </div>

        <button
          type="button"
          id="store-avatar-image-close-btn"
          class="w-8 h-8 rounded-full bg-[#F0EDE5] hover:bg-[#E7E3D9] text-[#141413] flex items-center justify-center text-sm font-bold cursor-pointer transition-colors shrink-0"
          title="Close"
        >
          &times;
        </button>
      </div>

      <!-- Image Frame with Increased Height (aspect-[4/5] aspect-square min-h-[340px] for higher visibility) -->
      <div class="relative w-full aspect-[4/5] aspect-square min-h-[340px] sm:min-h-[400px] max-h-[68vh] rounded-2xl overflow-hidden bg-[#F8F6F0] border border-[#DCD6C9] shadow-inner flex items-center justify-center my-2.5">
        <img
          src="${escapeHtml(avatarUrl)}"
          alt="${escapeHtml(profileData.name)}"
          class="w-full h-full object-cover"
        />
      </div>

      <!-- Footer / Details -->
      <div class="pt-2 border-t border-[#E7E3D9] flex items-center justify-between text-xs text-[#57534E]">
        <span class="truncate">📍 ${escapeHtml(profileData.location || profileData.city || 'Coimbatore, Tamil Nadu')}</span>
        <span class="font-bold text-[#004643] shrink-0">★ 4.9 • Top Rated</span>
      </div>
    </div>
  `;

  const closeModal = () => {
    document.removeEventListener('keydown', handleKeyDown);
    modal.remove();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') closeModal();
  };
  document.addEventListener('keydown', handleKeyDown);

  modal.querySelector('#store-avatar-image-close-btn')?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.body.appendChild(modal);
}

/**
 * Edit Store Profile Modal (Allows Seller to change Avatar, Name, Description, Place/City, Address)
 */
function openEditProfileModal(profileData, onSave) {
  const existing = document.getElementById('edit-profile-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'edit-profile-modal';
  modal.className =
    'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-fade-in select-none';

  let currentAvatar = profileData.avatar;

  modal.innerHTML = `
    <div class="relative w-full max-w-lg bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border border-[#DCD6C9] animate-fade-up max-h-[92vh] overflow-y-auto no-scrollbar">
      
      <!-- Close Button -->
      <button
        type="button"
        id="edit-profile-close-btn"
        class="absolute top-4 right-4 w-8 h-8 rounded-full border border-[#DCD6C9] bg-white text-[#78716C] hover:text-[#141413] flex items-center justify-center transition-colors text-lg font-bold cursor-pointer"
      >
        &times;
      </button>

      <div class="mb-4">
        <h2 class="text-lg sm:text-xl font-bold text-[#141413]">Edit Store Profile</h2>
        <p class="text-xs text-[#78716C]">Update your boutique identity, logo, bio, and location.</p>
      </div>

      <form id="edit-profile-form" class="space-y-4">
        
        <!-- Profile Picture Preview & Change -->
        <div>
          <label class="block text-xs font-bold text-[#141413] mb-1.5">Profile Picture</label>
          <div class="flex items-center gap-3.5">
            <div class="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shadow-sm shrink-0">
              <img id="avatar-preview-img" src="${escapeHtml(currentAvatar)}" alt="Avatar" class="w-full h-full object-cover rounded-full bg-white" />
            </div>
            <div class="flex-1 space-y-1.5">
              <input
                type="text"
                id="edit-avatar-url"
                value="${escapeHtml(currentAvatar)}"
                placeholder="Paste Image URL"
                class="w-full px-3 py-1.5 rounded-xl border border-[#DCD6C9] text-xs font-medium focus:border-[#004643] outline-none"
              />
              <div class="flex items-center gap-2">
                <label class="px-3 py-1 rounded-lg bg-[#F0EDE5] hover:bg-[#E7E3D9] text-[#141413] text-[11px] font-bold cursor-pointer border border-[#DCD6C9]">
                  <span>Upload File</span>
                  <input type="file" id="edit-avatar-file" accept="image/*" class="hidden" />
                </label>
                <span class="text-[10px] text-[#78716C]">JPG, PNG or WEBP</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Store Name -->
        <div>
          <label class="block text-xs font-bold text-[#141413] mb-1" for="edit-store-name">Store Name *</label>
          <input
            type="text"
            id="edit-store-name"
            value="${escapeHtml(profileData.name)}"
            required
            class="w-full px-3.5 py-2 rounded-xl border border-[#DCD6C9] text-xs font-semibold focus:border-[#004643] outline-none"
          />
        </div>

        <!-- Category & City -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-[#141413] mb-1" for="edit-store-category">Category</label>
            <input
              type="text"
              id="edit-store-category"
              value="${escapeHtml(profileData.category)}"
              class="w-full px-3 py-2 rounded-xl border border-[#DCD6C9] text-xs font-semibold focus:border-[#004643] outline-none"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-[#141413] mb-1" for="edit-store-city">City / Place *</label>
            <input
              type="text"
              id="edit-store-city"
              value="${escapeHtml(profileData.city)}"
              required
              class="w-full px-3 py-2 rounded-xl border border-[#DCD6C9] text-xs font-semibold focus:border-[#004643] outline-none"
            />
          </div>
        </div>

        <!-- Description / Bio -->
        <div>
          <label class="block text-xs font-bold text-[#141413] mb-1" for="edit-store-desc">Store Description / Bio *</label>
          <textarea
            id="edit-store-desc"
            rows="3"
            required
            class="w-full p-3 rounded-xl border border-[#DCD6C9] text-xs font-normal focus:border-[#004643] outline-none resize-none leading-relaxed"
          >${escapeHtml(profileData.description)}</textarea>
        </div>

        <!-- Physical Address -->
        <div>
          <label class="block text-xs font-bold text-[#141413] mb-1" for="edit-store-address">Boutique Address</label>
          <input
            type="text"
            id="edit-store-address"
            value="${escapeHtml(profileData.address || '')}"
            placeholder="e.g. Cross Cut Road, Gandhipuram"
            class="w-full px-3.5 py-2 rounded-xl border border-[#DCD6C9] text-xs font-medium focus:border-[#004643] outline-none"
          />
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-[#F0EDE5]">
          <button
            type="button"
            id="edit-profile-cancel-btn"
            class="px-4 py-2 rounded-xl text-xs font-bold text-[#57534E] hover:bg-[#F0EDE5] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-5 py-2.5 rounded-xl bg-[#004643] hover:bg-[#003634] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            Save Changes
          </button>
        </div>

      </form>

    </div>
  `;

  document.body.appendChild(modal);

  const closeModal = () => modal.remove();
  modal.querySelector('#edit-profile-close-btn')?.addEventListener('click', closeModal);
  modal.querySelector('#edit-profile-cancel-btn')?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Handle avatar file upload
  const fileInput = modal.querySelector('#edit-avatar-file');
  const urlInput = modal.querySelector('#edit-avatar-url');
  const previewImg = modal.querySelector('#avatar-preview-img');

  fileInput?.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    try {
      const res = await uploadMediaFile(file);
      if (res && res.url) {
        currentAvatar = res.url;
        if (previewImg) previewImg.src = currentAvatar;
        if (urlInput) urlInput.value = currentAvatar;
        return;
      }
    } catch {}
    const reader = new FileReader();
    reader.onload = () => {
      currentAvatar = reader.result;
      if (previewImg) previewImg.src = currentAvatar;
      if (urlInput) urlInput.value = '';
    };
    reader.readAsDataURL(file);
  });

  urlInput?.addEventListener('input', () => {
    const val = urlInput.value.trim();
    if (val) {
      currentAvatar = val;
      if (previewImg) previewImg.src = val;
    }
  });

  // Form submit
  modal.querySelector('#edit-profile-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const updated = {
      avatar: currentAvatar,
      name: modal.querySelector('#edit-store-name')?.value.trim() || profileData.name,
      category: modal.querySelector('#edit-store-category')?.value.trim() || profileData.category,
      city: modal.querySelector('#edit-store-city')?.value.trim() || profileData.city,
      description: modal.querySelector('#edit-store-desc')?.value.trim() || profileData.description,
      address: modal.querySelector('#edit-store-address')?.value.trim() || profileData.address,
    };
    closeModal();
    if (typeof onSave === 'function') onSave(updated);
  });
}

/**
 * Add New Highlight Modal
 */
function openAddHighlightModal(profileData, onSave) {
  const existing = document.getElementById('add-highlight-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'add-highlight-modal';
  modal.className =
    'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-fade-in select-none';

  let currentImg = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';

  modal.innerHTML = `
    <div class="relative w-full max-w-md bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border border-[#DCD6C9] animate-fade-up max-h-[92vh] overflow-y-auto no-scrollbar">
      
      <!-- Close Button -->
      <button
        type="button"
        id="add-hl-close-btn"
        class="absolute top-4 right-4 w-8 h-8 rounded-full border border-[#DCD6C9] bg-white text-[#78716C] hover:text-[#141413] flex items-center justify-center transition-colors text-lg font-bold cursor-pointer"
      >
        &times;
      </button>

      <div class="mb-4">
        <h2 class="text-lg font-bold text-[#141413]">Add Story Highlight</h2>
        <p class="text-xs text-[#78716C]">Add a new featured highlight circle to your profile header.</p>
      </div>

      <form id="add-hl-form" class="space-y-4">
        
        <!-- Highlight Name -->
        <div>
          <label class="block text-xs font-bold text-[#141413] mb-1" for="hl-name">Highlight Name *</label>
          <input
            type="text"
            id="hl-name"
            placeholder="e.g. Silk Sarees, Diwali '26, Behind Looms"
            required
            maxlength="20"
            class="w-full px-3.5 py-2 rounded-xl border border-[#DCD6C9] text-xs font-semibold focus:border-[#004643] outline-none"
          />
        </div>

        <!-- Cover Image Preview & Input -->
        <div>
          <label class="block text-xs font-bold text-[#141413] mb-1.5">Cover & Story Image *</label>
          <div class="flex items-center gap-3">
            <div class="w-16 h-16 rounded-full border-2 border-[#004643] overflow-hidden shrink-0 shadow-xs">
              <img id="hl-preview-img" src="${escapeHtml(currentImg)}" alt="Cover" class="w-full h-full object-cover" />
            </div>
            <div class="flex-1 space-y-1.5">
              <input
                type="text"
                id="hl-img-url"
                placeholder="Paste Image URL"
                class="w-full px-3 py-1.5 rounded-xl border border-[#DCD6C9] text-xs focus:border-[#004643] outline-none"
              />
              <label class="inline-block px-3 py-1 rounded-lg bg-[#F0EDE5] hover:bg-[#E7E3D9] text-[#141413] text-[11px] font-bold cursor-pointer border border-[#DCD6C9]">
                <span>Upload Photo</span>
                <input type="file" id="hl-img-file" accept="image/*" class="hidden" />
              </label>
            </div>
          </div>
        </div>

        <!-- Story Caption -->
        <div>
          <label class="block text-xs font-bold text-[#141413] mb-1" for="hl-caption">Story Caption</label>
          <textarea
            id="hl-caption"
            rows="2"
            placeholder="e.g. New handloom saree weaves ready for festive season!"
            class="w-full p-2.5 rounded-xl border border-[#DCD6C9] text-xs focus:border-[#004643] outline-none resize-none"
          ></textarea>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-[#F0EDE5]">
          <button
            type="button"
            id="add-hl-cancel-btn"
            class="px-4 py-2 rounded-xl text-xs font-bold text-[#57534E] hover:bg-[#F0EDE5] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-5 py-2.5 rounded-xl bg-[#004643] hover:bg-[#003634] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            Add Highlight
          </button>
        </div>

      </form>

    </div>
  `;

  document.body.appendChild(modal);

  const closeModal = () => modal.remove();
  modal.querySelector('#add-hl-close-btn')?.addEventListener('click', closeModal);
  modal.querySelector('#add-hl-cancel-btn')?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  const fileInput = modal.querySelector('#hl-img-file');
  const urlInput = modal.querySelector('#hl-img-url');
  const previewImg = modal.querySelector('#hl-preview-img');

  fileInput?.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        currentImg = reader.result;
        if (previewImg) previewImg.src = currentImg;
      };
      reader.readAsDataURL(file);
    }
  });

  urlInput?.addEventListener('input', () => {
    const val = urlInput.value.trim();
    if (val) {
      currentImg = val;
      if (previewImg) previewImg.src = val;
    }
  });

  modal.querySelector('#add-hl-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = modal.querySelector('#hl-name')?.value.trim() || 'Highlight';
    const caption = modal.querySelector('#hl-caption')?.value.trim() || `${title} Collection`;
    const newHl = {
      id: `hl-${Date.now()}`,
      title,
      img: currentImg,
      stories: [
        {
          image: currentImg,
          caption,
          timestamp: 'Just now',
        },
      ],
    };
    closeModal();
    if (typeof onSave === 'function') onSave(newHl);
  });
}

/**
 * Fullscreen Instagram Story Viewer Modal (Allows browsing highlight stories with timers and tap-to-advance)
 */
function openStoryViewerModal(initialHighlight, allHighlights, storeInfo, onBookVideoCall) {
  const existing = document.getElementById('story-viewer-modal');
  if (existing) existing.remove();

  let highlightIndex = allHighlights.findIndex((h) => (h.id || h.title) === (initialHighlight.id || initialHighlight.title));
  if (highlightIndex === -1) highlightIndex = 0;

  let currentHl = allHighlights[highlightIndex];
  const stories = Array.isArray(currentHl.stories) && currentHl.stories.length > 0
    ? currentHl.stories
    : [{ image: currentHl.img, caption: `${currentHl.title} Showcase`, timestamp: 'Recently' }];

  let storyIndex = 0;
  let storyTimer = null;
  let isPaused = false;

  const modal = document.createElement('div');
  modal.id = 'story-viewer-modal';
  modal.className =
    'fixed inset-0 z-50 flex items-center justify-center bg-black/95 animate-fade-in select-none';

  const renderStory = () => {
    const story = stories[storyIndex];

    modal.innerHTML = `
      <div class="relative w-full h-[100dvh] max-w-md bg-black flex flex-col justify-between overflow-hidden">
        
        <!-- Top Story Progress Indicator Bars -->
        <div class="absolute top-2.5 inset-x-3 z-30 flex items-center gap-1.5">
          ${stories
            .map(
              (_, idx) => `
            <div class="flex-1 h-1 rounded-full bg-white/30 overflow-hidden">
              <div
                class="story-progress-bar h-full bg-white transition-all duration-100 ${
                  idx < storyIndex ? 'w-full' : idx === storyIndex ? 'w-0' : 'w-0'
                }"
                id="story-bar-${idx}"
              ></div>
            </div>
          `
            )
            .join('')}
        </div>

        <!-- Top Header: Store Info, Highlight Title, and Close -->
        <div class="absolute top-6 inset-x-3 z-30 flex items-center justify-between text-white drop-shadow-md">
          <div class="flex items-center gap-2 min-w-0 pr-3">
            <img
              src="${escapeHtml(storeInfo.avatar)}"
              alt="${escapeHtml(storeInfo.storeName)}"
              class="w-8 h-8 rounded-full object-cover ring-1.5 ring-emerald-400 shrink-0"
            />
            <div class="min-w-0">
              <div class="flex items-center gap-1">
                <span class="text-xs font-bold truncate">@${escapeHtml(storeInfo.handle)}</span>
                <span class="text-[10px] text-white/70">• ${escapeHtml(currentHl.title)}</span>
              </div>
              <p class="text-[10px] text-white/60 truncate">${escapeHtml(story.timestamp || 'Active')}</p>
            </div>
          </div>

          <button
            type="button"
            id="story-close-btn"
            class="w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center text-lg font-bold cursor-pointer transition-colors shadow-sm"
          >
            &times;
          </button>
        </div>

        <!-- Main Story Image (Full Aspect Coverage) -->
        <div class="relative w-full h-full flex items-center justify-center overflow-hidden">
          <img
            id="story-main-img"
            src="${escapeHtml(story.image)}"
            alt="${escapeHtml(story.caption || currentHl.title)}"
            class="w-full h-full object-cover"
          />

          <!-- Left Tap Zone (Previous Story Slide) -->
          <div
            id="story-left-tap"
            class="absolute top-16 left-0 w-1/3 bottom-24 z-20 cursor-pointer"
            title="Previous slide"
          ></div>

          <!-- Right Tap Zone (Next Story Slide) -->
          <div
            id="story-right-tap"
            class="absolute top-16 right-0 w-2/3 bottom-24 z-20 cursor-pointer"
            title="Next slide"
          ></div>
        </div>

        <!-- Bottom Story Bar: Caption & Book Call Action -->
        <div class="absolute bottom-4 inset-x-3 z-30 flex flex-col gap-2.5">
          ${
            story.caption
              ? `
            <div class="p-3 rounded-2xl bg-black/60 backdrop-blur-md border border-white/15 text-white">
              <p class="text-xs leading-relaxed drop-shadow-sm font-medium">
                ${escapeHtml(story.caption)}
              </p>
            </div>
          `
              : ''
          }

          <div class="flex items-center gap-2">
            <button
              type="button"
              id="story-book-call-btn"
              class="flex-1 py-3 px-4 rounded-2xl bg-[#004643] hover:bg-[#003634] active:scale-97 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer border border-emerald-400/30"
            >
              <svg class="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Book Video Call to Shop</span>
            </button>
          </div>
        </div>

      </div>
    `;

    // Hook listeners
    modal.querySelector('#story-close-btn')?.addEventListener('click', closeStoryModal);
    modal.querySelector('#story-book-call-btn')?.addEventListener('click', () => {
      closeStoryModal();
      if (typeof onBookVideoCall === 'function') onBookVideoCall();
    });

    modal.querySelector('#story-left-tap')?.addEventListener('click', prevSlide);
    modal.querySelector('#story-right-tap')?.addEventListener('click', nextSlide);

    startStoryTimer();
  };

  const startStoryTimer = () => {
    clearTimeout(storyTimer);
    const activeBar = modal.querySelector(`#story-bar-${storyIndex}`);
    if (activeBar) {
      activeBar.style.width = '0%';
      activeBar.style.transition = 'width 4500ms linear';
      requestAnimationFrame(() => {
        activeBar.style.width = '100%';
      });
    }

    storyTimer = setTimeout(() => {
      if (!isPaused) {
        nextSlide();
      }
    }, 4500);
  };

  const nextSlide = () => {
    clearTimeout(storyTimer);
    if (storyIndex < stories.length - 1) {
      storyIndex += 1;
      renderStory();
    } else if (highlightIndex < allHighlights.length - 1) {
      // Go to next highlight
      highlightIndex += 1;
      currentHl = allHighlights[highlightIndex];
      storyIndex = 0;
      renderStory();
    } else {
      closeStoryModal();
    }
  };

  const prevSlide = () => {
    clearTimeout(storyTimer);
    if (storyIndex > 0) {
      storyIndex -= 1;
      renderStory();
    } else if (highlightIndex > 0) {
      // Go to previous highlight
      highlightIndex -= 1;
      currentHl = allHighlights[highlightIndex];
      storyIndex = (currentHl.stories?.length || 1) - 1;
      renderStory();
    } else {
      renderStory();
    }
  };

  const closeStoryModal = () => {
    clearTimeout(storyTimer);
    modal.remove();
  };

  document.body.appendChild(modal);
  renderStory();
}

/**
 * Add Product Modal (Allows adding a new product with up to 6 gallery images)
 */
function openAddProductModal(profileData, onSave) {
  const existing = document.getElementById('add-product-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'add-product-modal';
  modal.className =
    'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-fade-in select-none';

  let productImages = ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'];

  modal.innerHTML = `
    <div class="relative w-full max-w-lg bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border border-[#DCD6C9] animate-fade-up max-h-[92vh] overflow-y-auto no-scrollbar">
      
      <!-- Close Button -->
      <button
        type="button"
        id="add-prod-close-btn"
        class="absolute top-4 right-4 w-8 h-8 rounded-full border border-[#DCD6C9] bg-white text-[#78716C] hover:text-[#141413] flex items-center justify-center transition-colors text-lg font-bold cursor-pointer"
      >
        &times;
      </button>

      <div class="mb-4">
        <h2 class="text-lg sm:text-xl font-bold text-[#141413]">Add New Product</h2>
        <p class="text-xs text-[#78716C]">Upload product details, pricing, and up to 6 gallery images.</p>
      </div>

      <form id="add-prod-form" class="space-y-4">
        
        <!-- Product Title -->
        <div>
          <label class="block text-xs font-bold text-[#141413] mb-1" for="prod-name">Product Name *</label>
          <input
            type="text"
            id="prod-name"
            placeholder="e.g. Pure Cotton Handloom Saree"
            required
            class="w-full px-3.5 py-2 rounded-xl border border-[#DCD6C9] text-xs font-semibold focus:border-[#004643] outline-none"
          />
        </div>

        <!-- Category & Delivery Badge -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-[#141413] mb-1" for="prod-category">Category *</label>
            <select
              id="prod-category"
              class="w-full px-3 py-2 rounded-xl border border-[#DCD6C9] text-xs font-semibold focus:border-[#004643] outline-none bg-white"
            >
              <option value="Sarees">Sarees</option>
              <option value="Kurtis">Kurtis</option>
              <option value="2 Piece">2 Piece</option>
              <option value="Daily Wear">Daily Wear</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-[#141413] mb-1" for="prod-delivery">Delivery Badge</label>
            <input
              type="text"
              id="prod-delivery"
              value="Next Day Delivery"
              class="w-full px-3 py-2 rounded-xl border border-[#DCD6C9] text-xs font-semibold focus:border-[#004643] outline-none"
            />
          </div>
        </div>

        <!-- Price & Original Price -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-[#141413] mb-1" for="prod-price">Selling Price (₹) *</label>
            <input
              type="text"
              id="prod-price"
              placeholder="e.g. 1450"
              required
              class="w-full px-3.5 py-2 rounded-xl border border-[#DCD6C9] text-xs font-bold text-[#004643] focus:border-[#004643] outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-[#141413] mb-1" for="prod-original-price">Original Price (₹)</label>
            <input
              type="text"
              id="prod-original-price"
              placeholder="e.g. 2100"
              class="w-full px-3.5 py-2 rounded-xl border border-[#DCD6C9] text-xs text-[#78716C] focus:border-[#004643] outline-none"
            />
          </div>
        </div>

        <!-- Product Gallery (Up to 6 Images) -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="block text-xs font-bold text-[#141413]">Gallery Images (Up to 6 photos)</label>
            <span class="text-[10px] text-[#78716C]" id="prod-img-count">1 of 6 photos</span>
          </div>

          <div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-1" id="prod-thumbs-strip">
            <div class="w-14 h-16 rounded-xl border border-[#DCD6C9] overflow-hidden shrink-0">
              <img src="${escapeHtml(productImages[0])}" alt="Thumb" class="w-full h-full object-cover" />
            </div>
          </div>

          <div class="mt-2 flex items-center gap-2">
            <input
              type="text"
              id="prod-img-input"
              placeholder="Paste Image URL to Add"
              class="flex-1 px-3 py-1.5 rounded-xl border border-[#DCD6C9] text-xs focus:border-[#004643] outline-none"
            />
            <button
              type="button"
              id="prod-add-img-btn"
              class="px-3 py-1.5 rounded-xl bg-[#004643] text-white text-xs font-bold cursor-pointer hover:bg-[#003634]"
            >
              Add URL
            </button>
            <label class="px-3 py-1.5 rounded-xl bg-[#F0EDE5] hover:bg-[#E7E3D9] text-[#141413] text-xs font-bold cursor-pointer border border-[#DCD6C9] shrink-0">
              <span>Upload</span>
              <input type="file" id="prod-img-file" accept="image/*" class="hidden" />
            </label>
          </div>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-xs font-bold text-[#141413] mb-1" for="prod-desc">Description</label>
          <textarea
            id="prod-desc"
            rows="2"
            placeholder="e.g. Pure breathable handwoven cotton with zari borders..."
            class="w-full p-2.5 rounded-xl border border-[#DCD6C9] text-xs focus:border-[#004643] outline-none resize-none"
          ></textarea>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-[#F0EDE5]">
          <button
            type="button"
            id="add-prod-cancel-btn"
            class="px-4 py-2 rounded-xl text-xs font-bold text-[#57534E] hover:bg-[#F0EDE5] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-5 py-2.5 rounded-xl bg-[#004643] hover:bg-[#003634] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            Save Product
          </button>
        </div>

      </form>

    </div>
  `;

  document.body.appendChild(modal);

  const closeModal = () => modal.remove();
  modal.querySelector('#add-prod-close-btn')?.addEventListener('click', closeModal);
  modal.querySelector('#add-prod-cancel-btn')?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  const thumbsStrip = modal.querySelector('#prod-thumbs-strip');
  const countLabel = modal.querySelector('#prod-img-count');
  const imgInput = modal.querySelector('#prod-img-input');
  const fileInput = modal.querySelector('#prod-img-file');

  const updateThumbs = () => {
    if (countLabel) countLabel.textContent = `${productImages.length} of 6 photos`;
    if (thumbsStrip) {
      thumbsStrip.innerHTML = productImages
        .map(
          (img, idx) => `
        <div class="relative w-14 h-16 rounded-xl border border-[#DCD6C9] overflow-hidden shrink-0 group">
          <img src="${escapeHtml(img)}" alt="Thumb ${idx + 1}" class="w-full h-full object-cover" />
          ${
            productImages.length > 1
              ? `
            <button
              type="button"
              data-remove-thumb-idx="${idx}"
              class="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/70 text-white flex items-center justify-center text-[10px] font-bold"
            >
              &times;
            </button>
          `
              : ''
          }
        </div>
      `
        )
        .join('');

      thumbsStrip.querySelectorAll('[data-remove-thumb-idx]').forEach((b) => {
        b.addEventListener('click', () => {
          const rIdx = parseInt(b.getAttribute('data-remove-thumb-idx'), 10);
          productImages.splice(rIdx, 1);
          updateThumbs();
        });
      });
    }
  };

  modal.querySelector('#prod-add-img-btn')?.addEventListener('click', () => {
    const url = imgInput?.value.trim();
    if (url && productImages.length < 6) {
      productImages.push(url);
      if (imgInput) imgInput.value = '';
      updateThumbs();
    }
  });

  fileInput?.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (file && productImages.length < 6) {
      const reader = new FileReader();
      reader.onload = () => {
        productImages.push(reader.result);
        updateThumbs();
      };
      reader.readAsDataURL(file);
    }
  });

  modal.querySelector('#add-prod-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = modal.querySelector('#prod-name')?.value.trim() || 'New Collection';
    const category = modal.querySelector('#prod-category')?.value || 'Sarees';
    const rawPrice = modal.querySelector('#prod-price')?.value.replace(/[^\d]/g, '') || '1200';
    const rawOrig = modal.querySelector('#prod-original-price')?.value.replace(/[^\d]/g, '');
    const delivery = modal.querySelector('#prod-delivery')?.value.trim() || 'Next Day Delivery';
    const desc = modal.querySelector('#prod-desc')?.value.trim() || `${name} handcrafted collection.`;

    // Ensure up to 6 images (fill with duplicates if fewer than 6 provided)
    const finalImgs = [...productImages];
    while (finalImgs.length < 6) {
      finalImgs.push(productImages[finalImgs.length % productImages.length]);
    }

    const newProd = {
      id: `prod-${Date.now()}`,
      name,
      category,
      price: `₹${parseInt(rawPrice, 10).toLocaleString('en-IN')}`,
      originalPrice: rawOrig ? `₹${parseInt(rawOrig, 10).toLocaleString('en-IN')}` : '',
      discount: rawOrig ? `${Math.round(((rawOrig - rawPrice) / rawOrig) * 100)}% OFF` : 'Special',
      deliveryBadge: delivery,
      rating: 4.9,
      reviewsCount: 1,
      inStock: true,
      image: finalImgs[0],
      images: finalImgs,
      description: desc,
    };

    closeModal();
    if (typeof onSave === 'function') onSave(newProd);
  });
}

/**
 * Create Poster / Add Photo Modal
 */
function openCreatePosterModal(profileData, onSave) {
  const existing = document.getElementById('create-poster-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'create-poster-modal';
  modal.className =
    'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-fade-in select-none';

  let currentPosterImg = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';

  modal.innerHTML = `
    <div class="relative w-full max-w-md bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border border-[#DCD6C9] animate-fade-up max-h-[92vh] overflow-y-auto no-scrollbar">
      
      <!-- Close Button -->
      <button
        type="button"
        id="poster-close-btn"
        class="absolute top-4 right-4 w-8 h-8 rounded-full border border-[#DCD6C9] bg-white text-[#78716C] hover:text-[#141413] flex items-center justify-center transition-colors text-lg font-bold cursor-pointer"
      >
        &times;
      </button>

      <div class="mb-4">
        <h2 class="text-lg font-bold text-[#141413]">Create Boutique Poster</h2>
        <p class="text-xs text-[#78716C]">Upload a photo or promotional banner to display in your photo grid.</p>
      </div>

      <form id="create-poster-form" class="space-y-4">
        
        <!-- Image Preview & Input -->
        <div>
          <label class="block text-xs font-bold text-[#141413] mb-1.5">Poster Photo *</label>
          <div class="aspect-square w-full rounded-2xl overflow-hidden border border-[#DCD6C9] bg-[#F8F6F0] mb-2 flex items-center justify-center shadow-xs">
            <img id="poster-preview-img" src="${escapeHtml(currentPosterImg)}" alt="Preview" class="w-full h-full object-cover" />
          </div>

          <div class="flex items-center gap-2">
            <input
              type="text"
              id="poster-img-url"
              placeholder="Paste Image URL"
              class="flex-1 px-3 py-1.5 rounded-xl border border-[#DCD6C9] text-xs focus:border-[#004643] outline-none"
            />
            <label class="px-3 py-1.5 rounded-xl bg-[#F0EDE5] hover:bg-[#E7E3D9] text-[#141413] text-xs font-bold cursor-pointer border border-[#DCD6C9] shrink-0">
              <span>Upload Photo</span>
              <input type="file" id="poster-img-file" accept="image/*" class="hidden" />
            </label>
          </div>
        </div>

        <!-- Caption -->
        <div>
          <label class="block text-xs font-bold text-[#141413] mb-1" for="poster-caption">Caption / Story *</label>
          <textarea
            id="poster-caption"
            rows="3"
            required
            placeholder="e.g. Behind the scenes: Handloom weaving our signature festive drapes in Coimbatore."
            class="w-full p-2.5 rounded-xl border border-[#DCD6C9] text-xs focus:border-[#004643] outline-none resize-none leading-relaxed"
          ></textarea>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-[#F0EDE5]">
          <button
            type="button"
            id="poster-cancel-btn"
            class="px-4 py-2 rounded-xl text-xs font-bold text-[#57534E] hover:bg-[#F0EDE5] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-5 py-2.5 rounded-xl bg-[#004643] hover:bg-[#003634] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            Publish Poster
          </button>
        </div>

      </form>

    </div>
  `;

  document.body.appendChild(modal);

  const closeModal = () => modal.remove();
  modal.querySelector('#poster-close-btn')?.addEventListener('click', closeModal);
  modal.querySelector('#poster-cancel-btn')?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  const fileInput = modal.querySelector('#poster-img-file');
  const urlInput = modal.querySelector('#poster-img-url');
  const previewImg = modal.querySelector('#poster-preview-img');

  fileInput?.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        currentPosterImg = reader.result;
        if (previewImg) previewImg.src = currentPosterImg;
      };
      reader.readAsDataURL(file);
    }
  });

  urlInput?.addEventListener('input', () => {
    const val = urlInput.value.trim();
    if (val) {
      currentPosterImg = val;
      if (previewImg) previewImg.src = val;
    }
  });

  modal.querySelector('#create-poster-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const caption = modal.querySelector('#poster-caption')?.value.trim() || 'Festive post';
    const newPost = {
      id: `post-${Date.now()}`,
      image: currentPosterImg,
      caption,
      likes: '1',
      comments: '0',
    };
    closeModal();
    if (typeof onSave === 'function') onSave(newPost);
  });
}

/**
 * Clean Instagram Photo Lightbox Modal with Next and Previous Post Arrows
 */
function openPhotoLightbox(initialIndex, posts, storeInfo) {
  const existing = document.getElementById('photo-lightbox-modal');
  if (existing) existing.remove();

  if (!posts || posts.length === 0) return;
  let currentIndex = Math.max(0, Math.min(initialIndex, posts.length - 1));

  const modal = document.createElement('div');
  modal.id = 'photo-lightbox-modal';
  modal.className =
    'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in select-none';

  const currentPost = posts[currentIndex];

  modal.innerHTML = `
    <div class="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#DCD6C9] animate-fade-up flex flex-col max-h-[92vh]">
      
      <!-- Top Bar: Avatar, Handle, Boutique Info, and Close Button -->
      <div class="flex items-center justify-between p-3.5 border-b border-[#F0EDE5] shrink-0">
        <div class="flex items-center gap-2.5">
          <img
            src="${escapeHtml(storeInfo.avatar)}"
            alt="${escapeHtml(storeInfo.storeName)}"
            class="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-500 shrink-0"
          />
          <div>
            <p class="text-xs font-bold text-[#141413]">@${escapeHtml(storeInfo.handle)}</p>
            <p class="text-[10px] text-[#78716C]">${escapeHtml(storeInfo.city)} • Partner Boutique</p>
          </div>
        </div>

        <button
          type="button"
          id="photo-lightbox-close-btn"
          aria-label="Close"
          class="w-8 h-8 rounded-full bg-[#F0EDE5] hover:bg-[#E7E3D9] text-[#57534E] hover:text-[#141413] flex items-center justify-center text-lg font-bold transition-colors cursor-pointer"
        >
          &times;
        </button>
      </div>

      <!-- Main Photo Container with Next & Previous Post Arrow Buttons -->
      <div class="relative aspect-square bg-black overflow-hidden flex items-center justify-center shrink-0">
        <img
          id="photo-lightbox-main-img"
          src="${escapeHtml(currentPost.image)}"
          alt="${escapeHtml(currentPost.caption)}"
          class="w-full h-full object-contain transition-opacity duration-200"
        />

        <!-- Previous Post Arrow Button -->
        <button
          type="button"
          id="photo-lightbox-prev-btn"
          aria-label="Previous post"
          title="Previous post"
          class="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/65 backdrop-blur-md text-white hover:bg-black/90 flex items-center justify-center transition-all cursor-pointer border border-white/20 shadow-md active:scale-95 z-10"
        >
          <svg class="w-4 h-4 fill-none stroke-current" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <!-- Next Post Arrow Button -->
        <button
          type="button"
          id="photo-lightbox-next-btn"
          aria-label="Next post"
          title="Next post"
          class="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/65 backdrop-blur-md text-white hover:bg-black/90 flex items-center justify-center transition-all cursor-pointer border border-white/20 shadow-md active:scale-95 z-10"
        >
          <svg class="w-4 h-4 fill-none stroke-current" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <!-- Photo Counter Badge (e.g. 1 / 9) -->
        <div class="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-[11px] font-mono font-bold text-white shadow-sm z-10">
          <span id="photo-counter-text">${currentIndex + 1} / ${posts.length}</span>
        </div>
      </div>

      <!-- Caption & Stats -->
      <div class="p-4 space-y-2 overflow-y-auto no-scrollbar">
        <div class="flex items-center gap-3 text-xs font-bold text-[#141413]">
          <span class="flex items-center gap-1 text-rose-600">
            <span>❤️</span>
            <span id="photo-likes-text">${escapeHtml(currentPost.likes)} likes</span>
          </span>
          <span class="flex items-center gap-1 text-[#78716C]">
            <span>💬</span>
            <span id="photo-comments-text">${escapeHtml(currentPost.comments)} comments</span>
          </span>
        </div>

        <p class="text-xs text-[#44403C] leading-relaxed">
          <strong class="text-[#141413]">@${escapeHtml(storeInfo.handle)}</strong>
          <span id="photo-caption-text">${escapeHtml(currentPost.caption)}</span>
        </p>
      </div>

    </div>
  `;

  document.body.appendChild(modal);

  const mainImg = modal.querySelector('#photo-lightbox-main-img');
  const counterText = modal.querySelector('#photo-counter-text');
  const likesText = modal.querySelector('#photo-likes-text');
  const commentsText = modal.querySelector('#photo-comments-text');
  const captionText = modal.querySelector('#photo-caption-text');

  const updatePhotoView = (newIndex) => {
    currentIndex = (newIndex + posts.length) % posts.length;
    const post = posts[currentIndex];
    if (mainImg) {
      mainImg.style.opacity = '0.3';
      setTimeout(() => {
        mainImg.src = post.image;
        mainImg.alt = post.caption;
        mainImg.style.opacity = '1';
      }, 80);
    }
    if (counterText) counterText.textContent = `${currentIndex + 1} / ${posts.length}`;
    if (likesText) likesText.textContent = `${post.likes} likes`;
    if (commentsText) commentsText.textContent = `${post.comments} comments`;
    if (captionText) captionText.textContent = post.caption;
  };

  // Previous & Next Button Handlers
  modal.querySelector('#photo-lightbox-prev-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    updatePhotoView(currentIndex - 1);
  });

  modal.querySelector('#photo-lightbox-next-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    updatePhotoView(currentIndex + 1);
  });

  // Keyboard Navigation (Arrow Left, Arrow Right, Escape)
  const handleKeydown = (e) => {
    if (e.key === 'ArrowLeft') {
      updatePhotoView(currentIndex - 1);
    } else if (e.key === 'ArrowRight') {
      updatePhotoView(currentIndex + 1);
    } else if (e.key === 'Escape') {
      closeModal();
    }
  };
  window.addEventListener('keydown', handleKeydown);

  // Close handlers
  const closeModal = () => {
    window.removeEventListener('keydown', handleKeydown);
    modal.remove();
  };

  modal.querySelector('#photo-lightbox-close-btn')?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}
