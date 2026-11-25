// Profile Page — Exact match of user reference screenshot in MyMigo color theme (#F0EDE5 & #004643)
// Features Loved Stores list, Affiliated Items, Shopper Profile Edit, and Seller Profile Creation.

import { getProfileData } from '../data/profiles.js';
import { getCurrentUser, loginUser, switchUserRole, openAccountSwitcherBottomSheet } from '../components/AuthModal.js';
import { saveUser, saveSeller, uploadMediaFile } from '../services/profileService.js';
import { fetchActiveStores } from '../services/storeService.js';
import { openUploadVideoModal } from '../components/UploadVideoModal.js';
import { getLovedStores, toggleLovedStore } from '../services/lovedStoresService.js';
import { getAffiliatedItems, toggleAffiliatedItem } from '../services/affiliatedItemsService.js';
import { escapeHtml } from '../utils/dom.js';

export function renderProfilePage(container, navigate, query) {
  const profileId = query.get('id') || 'raajkumar';
  const rawProfile = getProfileData(profileId);
  const currentUser = getCurrentUser();

  // If logged in user matches or viewing self, merge user profile updates
  const activeShopper =
    currentUser?.shopperAccounts?.find((a) => a.id === (query.get('id') || currentUser.activeAccountId)) ||
    currentUser?.shopperAccounts?.[0];

  const isSelf = Boolean(
    currentUser &&
      (!query.get('id') ||
        query.get('id') === currentUser.id ||
        query.get('id') === currentUser.activeAccountId ||
        currentUser.shopperAccounts?.some((a) => a.id === query.get('id')) ||
        profileId === 'raajkumar')
  );

  const profile =
    isSelf && currentUser
      ? {
          ...rawProfile,
          ...currentUser,
          ...(activeShopper || {}),
          avatar: activeShopper?.avatar || currentUser.avatar || rawProfile.avatar,
          name: activeShopper?.name || currentUser.name || rawProfile.name,
          city: activeShopper?.city || currentUser.city || rawProfile.city,
          handle:
            activeShopper?.handle ||
            currentUser?.handle ||
            `@${(activeShopper?.name || currentUser.name || 'ananya_shopper').toLowerCase().replace(/\s+/g, '_')}`,
          interests:
            activeShopper?.interests ||
            currentUser?.interests ||
            activeShopper?.preferences ||
            currentUser?.preferences ||
            rawProfile.shoppingInterest,
        }
      : rawProfile;

  // Active section view: 'media', 'loved-stores', or 'affiliated-items'
  let activeTab = query.get('tab') || 'media'; // 'media' | 'loved-stores' | 'affiliated-items'
  let mediaSubTab = 'video'; // 'video' | 'photo'

  function render() {
    // Dynamic refresh of loved stores and affiliated items from localStorage
    profile.lovedStores = getLovedStores();
    profile.affiliatedItems = getAffiliatedItems();

    container.innerHTML = `
      <div class="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-28 animate-fade-up relative">
        
        <!-- Subtle Decorative Theme Arc (matching screenshot top-right) -->
        <div class="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-[#004643]/5 blur-2xl pointer-events-none"></div>

        <!-- Top Header Navigation Bar with Instagram-Style Account Switcher in Center -->
        <div class="flex items-center justify-between gap-2 py-2 mb-3 relative z-10 bg-white/85 backdrop-blur-md rounded-2xl px-2.5 sm:px-3 border border-[#DCD6C9] shadow-2xs">
          <!-- Back Button -->
          <button
            id="profile-back-btn"
            type="button"
            aria-label="Back"
            class="p-2 -ml-1 text-[#141413] hover:text-[#004643] active:scale-95 transition-transform rounded-full shrink-0 cursor-pointer"
          >
            <svg class="w-5 h-5 fill-none stroke-current" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <!-- Centered Account Switcher Dropdown (Handle with Caret, exactly like Instagram) -->
          <button
            type="button"
            id="profile-name-switcher-btn"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-stone-200/50 cursor-pointer transition-colors active:scale-95 min-w-0"
            title="Click or hold to switch accounts"
          >
            <span class="text-sm font-black text-[#141413] truncate max-w-[150px] sm:max-w-[240px]">
              ${escapeHtml(profile.handle || `@${(profile.name || 'shopper').toLowerCase().replace(/\s+/g, '_')}` || profile.name)}
            </span>
            ${
              profile.verified
                ? `
              <svg class="w-3.5 h-3.5 text-[#004643] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            `
                : ''
            }
            <svg class="w-3.5 h-3.5 text-[#78716C] shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          <!-- Right Actions: Simple Icon Share, Bell with Dot & Settings -->
          <div class="flex items-center gap-1 shrink-0 -mr-1">
            <button
              id="share-profile-btn"
              type="button"
              aria-label="Share Profile"
              title="Share Profile"
              class="p-2 text-[#141413] hover:text-[#004643] active:scale-95 transition-transform rounded-full cursor-pointer"
            >
              <svg class="w-5 h-5 fill-none stroke-current" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
            </button>

            <a
              href="#/notifications"
              data-nav="/notifications"
              aria-label="Notifications"
              class="relative p-2 text-[#141413] hover:text-[#004643] transition-colors cursor-pointer"
            >
              <svg class="w-5 h-5 fill-none stroke-current" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 01-3.46 0"></path>
              </svg>
              <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF2E7E] ring-2 ring-[#F0EDE5]"></span>
            </a>

            <button
              id="profile-settings-btn"
              type="button"
              aria-label="Settings"
              class="p-2 text-[#141413] hover:text-[#004643] transition-colors cursor-pointer"
            >
              <svg class="w-5 h-5 fill-none stroke-current" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Profile Hero Card (Primary Profile Card with Avatar, Name, Bio, Connections & Actions) -->
        <div class="bg-white rounded-3xl border border-[#DCD6C9] p-4 sm:p-5 shadow-2xs mb-3.5">
          <div class="flex items-center gap-4 mb-3.5">
            <!-- Profile Avatar (Click opens profile image popup, no scrollbars or line) -->
            <div class="relative shrink-0">
              <button
                id="profile-avatar-trigger-btn"
                type="button"
                class="block w-16 h-16 sm:w-20 sm:h-20 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shadow-sm cursor-pointer active:scale-95 transition-transform overflow-hidden focus:outline-none"
                title="Click to view profile picture"
              >
                <div class="w-full h-full rounded-full p-[2px] bg-white overflow-hidden">
                  <img
                    src="${profile.avatar}"
                    alt="${escapeHtml(profile.name)}"
                    class="w-full h-full rounded-full object-cover"
                  />
                </div>
              </button>
              <span class="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-white text-[#141413] flex items-center justify-center text-[10px] border border-[#DCD6C9] shadow-2xs pointer-events-none" title="Tap to view photo">
                🔍
              </span>
            </div>

            <!-- Name, Verified, Bio & Connections (Shown ONCE) -->
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5 flex-wrap">
                <h1 class="text-xl sm:text-2xl font-extrabold text-[#141413] tracking-tight">
                  ${escapeHtml(profile.name)}
                </h1>
                ${
                  profile.verified
                    ? `
                  <span class="w-4 h-4 rounded-full bg-[#004643] text-white flex items-center justify-center shrink-0 shadow-2xs" title="Verified Shopper">
                    <svg class="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </span>
                `
                    : ''
                }
              </div>

              <!-- Interest / Handle Subtitle (Place and mobile number strictly kept private) -->
              <p class="text-xs text-[#78716C] mt-0.5 font-medium truncate flex items-center gap-1.5 flex-wrap">
                <span class="font-bold text-[#004643]">${escapeHtml(profile.handle || `@${(profile.name || 'shopper').toLowerCase().replace(/\s+/g, '_')}`)}</span>
                <span>•</span>
                <span>${escapeHtml(profile.interests || profile.preferences || 'Verified Migo Shopper')}</span>
              </p>

              <!-- Connections Pill Button (Click navigates to Migo Connect) -->
              <button
                id="connections-pill-btn"
                type="button"
                class="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#004643]/10 text-[#004643] hover:bg-[#004643]/20 transition-colors text-xs font-bold cursor-pointer active:scale-95"
              >
                <svg class="w-3.5 h-3.5 fill-none stroke-current" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 010 7.75"></path>
                </svg>
                <span>${profile.connectionsCount} Connections</span>
                <svg class="w-3 h-3 fill-none stroke-current" stroke-width="2.5" viewBox="0 0 24 24">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>

          <!-- Action Buttons Row: Edit Profile, Post Reel & Post Image -->
          <div class="grid grid-cols-3 gap-2 pt-3 border-t border-[#F0EDE5]">
            <button
              id="edit-profile-btn"
              type="button"
              class="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-[#004643] text-white hover:bg-[#003634] active:scale-[0.98] transition-all font-bold text-xs shadow-xs cursor-pointer truncate"
            >
              <svg class="w-3.5 h-3.5 fill-none stroke-current shrink-0" stroke-width="2.2" viewBox="0 0 24 24">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              <span class="truncate">Edit</span>
            </button>

            <button
              id="profile-post-reel-btn-top"
              type="button"
              class="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-white border border-[#004643] text-[#004643] hover:bg-[#004643] hover:text-white active:scale-[0.98] transition-all font-bold text-xs shadow-xs cursor-pointer truncate"
            >
              <span class="text-xs">🎬</span>
              <span class="truncate">Post Reel</span>
            </button>

            <button
              id="profile-post-image-btn"
              type="button"
              class="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-white border border-[#004643] text-[#004643] hover:bg-[#004643] hover:text-white active:scale-[0.98] transition-all font-bold text-xs shadow-xs cursor-pointer truncate"
            >
              <svg class="w-3.5 h-3.5 fill-none stroke-current shrink-0" stroke-width="2.2" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <span class="truncate">Post Image</span>
            </button>
          </div>
        </div>

        <!-- Join as Seller / Store Owner Callout or Switcher -->
        ${
          currentUser && currentUser.hasSellerAccount
            ? `
          <div class="mb-5 max-w-md mx-auto p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 flex items-center justify-between gap-3 shadow-2xs">
            <div class="flex items-center gap-2.5 min-w-0">
              <span class="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-base shrink-0">🏪</span>
              <div class="min-w-0">
                <p class="text-xs font-bold text-amber-950 truncate">${escapeHtml(currentUser.sellerAccount?.storeName || 'Store Profile')}</p>
                <p class="text-[11px] text-amber-800 truncate">Seller Account Ready</p>
              </div>
            </div>
            <button
              type="button"
              id="profile-switch-to-seller-btn"
              class="px-3.5 py-1.5 rounded-xl bg-amber-800 text-white text-[11px] font-bold hover:bg-amber-900 active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer flex items-center gap-1"
            >
              <span>Switch to Seller ⇄</span>
            </button>
          </div>
        `
            : `
          <div class="mb-5 max-w-md mx-auto p-3.5 rounded-2xl bg-white/90 border border-[#DCD6C9] flex items-center justify-between gap-3 shadow-2xs">
            <div class="flex items-center gap-2.5 min-w-0">
              <span class="w-8 h-8 rounded-xl bg-[#004643]/10 text-[#004643] flex items-center justify-center text-base shrink-0">🏪</span>
              <div class="min-w-0">
                <p class="text-xs font-bold text-[#141413] truncate">Own a boutique store or brand?</p>
                <p class="text-[11px] text-[#57534E] truncate">List your store & upload reels</p>
              </div>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                id="profile-post-reel-btn"
                class="px-2.5 py-1.5 rounded-xl bg-white border border-[#DCD6C9] text-[#004643] hover:bg-[#004643] hover:text-white text-[11px] font-bold active:scale-95 transition-all shadow-2xs shrink-0 cursor-pointer flex items-center gap-1"
              >
                <span>🎬</span>
                <span>Post Reel</span>
              </button>
              <button
                type="button"
                id="create-seller-profile-btn"
                class="px-3 py-1.5 rounded-xl bg-[#004643] text-white text-[11px] font-bold hover:bg-[#003634] active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
              >
                List Store &rarr;
              </button>
            </div>
          </div>
        `
        }

        <!-- Simple Compact Pills: My Loves & Affiliated Items (like Edit Profile) -->
        <div class="grid grid-cols-2 gap-2.5 sm:gap-3 mb-6 max-w-md mx-auto">
          
          <!-- Pill 1: My Loves -->
          <button
            id="loved-stores-card-btn"
            type="button"
            class="w-full flex items-center justify-between py-2.5 px-3.5 sm:px-4 rounded-2xl border transition-all text-xs sm:text-sm font-semibold active:scale-[0.98] shadow-xs cursor-pointer ${
              activeTab === 'loved-stores'
                ? 'bg-[#004643] text-white border-[#004643] shadow-xs ring-2 ring-[#004643]/20'
                : 'bg-white/90 text-[#141413] border-[#DCD6C9] hover:border-[#004643] hover:bg-white'
            }"
          >
            <div class="flex items-center gap-2 min-w-0">
              <svg class="w-4 h-4 shrink-0 ${activeTab === 'loved-stores' ? 'text-white' : 'text-[#004643]'}" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"></path>
              </svg>
              <span class="truncate">My Loves</span>
            </div>
            <svg class="w-3.5 h-3.5 opacity-60 shrink-0 ml-1" fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>

          <!-- Pill 2: Affiliated Items -->
          <button
            id="affiliated-items-card-btn"
            type="button"
            class="w-full flex items-center justify-between py-2.5 px-3.5 sm:px-4 rounded-2xl border transition-all text-xs sm:text-sm font-semibold active:scale-[0.98] shadow-xs cursor-pointer ${
              activeTab === 'affiliated-items'
                ? 'bg-[#004643] text-white border-[#004643] shadow-xs ring-2 ring-[#004643]/20'
                : 'bg-white/90 text-[#141413] border-[#DCD6C9] hover:border-[#004643] hover:bg-white'
            }"
          >
            <div class="flex items-center gap-2 min-w-0">
              <svg class="w-4 h-4 shrink-0 ${activeTab === 'affiliated-items' ? 'text-white' : 'text-[#004643]'}" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"></path>
                <line x1="7" y1="7" x2="7.01" y2="7"></line>
              </svg>
              <span class="truncate">Affiliated Items</span>
            </div>
            <svg class="w-3.5 h-3.5 opacity-60 shrink-0 ml-1" fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>

        </div>

        <!-- Section Content Based on Active View -->
        ${renderActiveSection()}

      </div>
    `;

    attachEventListeners();
  }

  function renderActiveSection() {
    if (activeTab === 'loved-stores') {
      const storesCount = (profile.lovedStores || []).length;
      return `
        <!-- My Loves Section View -->
        <div class="animate-fade-in">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-lg font-bold text-[#141413]">My Loves by ${escapeHtml(profile.name)}</h2>
              <p class="text-xs text-[#78716C]">Personal verified recommendations across Indian cities (${storesCount})</p>
            </div>
            <button
              id="back-to-media-btn"
              type="button"
              class="text-xs font-semibold text-[#004643] hover:underline"
            >
              View Reels & Grid &rarr;
            </button>
          </div>

          ${
            storesCount === 0
              ? `
            <div class="p-8 text-center bg-white rounded-2xl border border-[#DCD6C9] shadow-2xs">
              <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center text-xl shadow-2xs">
                ❤️
              </div>
              <h3 class="font-bold text-[#141413] text-sm mb-1">No Loves Yet</h3>
              <p class="text-xs text-[#78716C] max-w-sm mx-auto mb-4 leading-relaxed">
                Browse our directory of verified boutiques and tap the Love button to save your favorites here for instant access.
              </p>
              <button
                type="button"
                id="profile-empty-loved-stores-btn"
                class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#004643] text-white text-xs font-bold hover:bg-[#003634] active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                <span>Explore Stores</span>
                <span>&rarr;</span>
              </button>
            </div>
          `
              : `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              ${profile.lovedStores
                .map(
                  (store) => `
                <div class="bg-white rounded-2xl border border-[#DCD6C9] overflow-hidden shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative group">
                  <div>
                    <div class="relative h-36 bg-stone-200 overflow-hidden">
                      <img src="${store.image}" alt="${escapeHtml(store.name)}" class="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
                      
                      <!-- City Pill Badge Top-Right -->
                      <span class="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold">
                        ${escapeHtml(store.city)}
                      </span>

                      <!-- Loved Heart Pill Top-Left (Click to Remove/Unlove) -->
                      <button
                        type="button"
                        data-remove-loved-store="${escapeHtml(store.id)}"
                        class="absolute top-2.5 left-2.5 px-2 py-1 rounded-full bg-white/95 backdrop-blur-md text-rose-600 border border-rose-200 shadow-sm flex items-center gap-1 text-[10px] font-bold cursor-pointer hover:bg-rose-50 active:scale-95 transition-all"
                        title="Remove from My Loves"
                        aria-label="Remove ${escapeHtml(store.name)} from My Loves"
                      >
                        <svg class="w-3.5 h-3.5 fill-rose-500 text-rose-500" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>Loved</span>
                      </button>
                    </div>

                    <div class="p-3.5">
                      <div class="flex items-center gap-1.5">
                        <h3 class="font-bold text-[#141413] text-sm">${escapeHtml(store.name)}</h3>
                        <span class="w-3.5 h-3.5 rounded-full bg-[#004643] text-white flex items-center justify-center text-[8px] font-bold">✓</span>
                      </div>
                      <p class="text-[11px] font-medium text-[#78716C] mt-0.5">${escapeHtml(store.category)}</p>
                      <p class="text-xs text-[#57534E] mt-2 italic bg-[#F0EDE5]/60 p-2 rounded-xl border border-[#DCD6C9]/40 leading-snug">
                        "${escapeHtml(store.note)}"
                      </p>
                    </div>
                  </div>

                  <div class="p-3.5 pt-0 flex items-center gap-2">
                    <!-- Instagram Link Button (Opens Store's Particular Page) -->
                    <a
                      href="${escapeHtml(store.instagram_url || 'https://www.instagram.com/')}"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open ${escapeHtml(store.name)} on Instagram"
                      aria-label="Open ${escapeHtml(store.name)} on Instagram"
                      class="w-9 h-9 rounded-xl border border-[#DCD6C9] bg-white text-[#141413] hover:text-[#004643] hover:border-[#004643] hover:bg-[#F0EDE5] flex items-center justify-center transition-colors shrink-0 shadow-xs"
                    >
                      <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="1.9" viewBox="0 0 24 24">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                    </a>

                    <!-- Explore Store Button -->
                    <a
                      href="#/store/${encodeURIComponent(store.id)}"
                      data-nav="/store/${encodeURIComponent(store.id)}"
                      class="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#004643] text-white text-xs font-semibold hover:bg-[#003634] transition-colors shadow-xs"
                    >
                      <span>Explore Store</span>
                      <svg class="w-3.5 h-3.5 fill-none stroke-current" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                    </a>
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          `
          }
        </div>
      `;
    }

    if (activeTab === 'affiliated-items') {
      const itemsCount = (profile.affiliatedItems || []).length;
      return `
        <!-- Affiliated Items View with Prices -->
        <div class="animate-fade-in">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-lg font-bold text-[#141413]">Affiliated Products & Curations</h2>
              <p class="text-xs text-[#78716C]">Items recommended by ${escapeHtml(profile.name)} with member pricing (${itemsCount})</p>
            </div>
            <button
              id="back-to-media-btn"
              type="button"
              class="text-xs font-semibold text-[#004643] hover:underline"
            >
              View Reels & Grid &rarr;
            </button>
          </div>

          ${
            itemsCount === 0
              ? `
            <div class="p-8 text-center bg-white rounded-2xl border border-[#DCD6C9] shadow-2xs">
              <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl shadow-2xs">
                🔗
              </div>
              <h3 class="font-bold text-[#141413] text-sm mb-1">No Affiliated Items Yet</h3>
              <p class="text-xs text-[#78716C] max-w-sm mx-auto mb-4 leading-relaxed">
                Browse products in stores and tap the link icon (🔗) to add curated items to your profile recommendations.
              </p>
              <button
                type="button"
                id="profile-empty-affiliated-items-btn"
                class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#004643] text-white text-xs font-bold hover:bg-[#003634] active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                <span>Explore Stores</span>
                <span>&rarr;</span>
              </button>
            </div>
          `
              : `
            <!-- 2-Column Product Grid (Matching Attached Store Product Screenshot) -->
            <div class="grid grid-cols-2 gap-2.5 sm:gap-4">
              ${profile.affiliatedItems
                .map((item) => {
                  const offerPrice = item.price || '₹1,450';
                  let originalPrice = item.originalPrice;
                  if (!originalPrice) {
                    const num = item.priceNumber || parseInt(String(offerPrice).replace(/[^0-9]/g, '')) || 1450;
                    originalPrice = `₹${Math.round((num * 1.38) / 50) * 50}`;
                  }
                  const discount = item.discount || '31% OFF';
                  const deliveryBadge = item.deliveryBadge || 'Next Day Delivery';
                  const storeName = item.store || 'Kalyani Cotton';
                  const category = item.category || 'Collection';

                  return `
                <div class="bg-white rounded-2xl border border-[#DCD6C9] overflow-hidden shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow group relative">
                  <div>
                    <!-- Image with Discount Badge & Photo indicator (Matching store product grid screenshot) -->
                    <div class="relative aspect-[4/5] bg-[#F8F6F0] overflow-hidden">
                      <img
                        src="${escapeHtml(item.image)}"
                        alt="${escapeHtml(item.title || item.name)}"
                        class="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                        loading="lazy"
                      />

                      <!-- Discount Badge (Top-left, matching attached screenshot) -->
                      <span class="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                        ${escapeHtml(discount)}
                      </span>

                      <!-- Store tag pill (Bottom-left) -->
                      <span class="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/65 backdrop-blur-xs text-white text-[9px] font-semibold truncate max-w-[110px]">
                        ${escapeHtml(storeName)}
                      </span>

                      <!-- Photo indicator (Bottom-right, matching attached screenshot) -->
                      <span class="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1 shadow-xs pointer-events-none">
                        <svg class="w-3 h-3 text-emerald-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>6 photos</span>
                      </span>
                    </div>

                    <!-- Product Info -->
                    <div class="p-2.5 sm:p-3.5">
                      <!-- Category Pill (Matching attached screenshot) -->
                      <span class="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#004643]/10 text-[#004643] mb-1">
                        ${escapeHtml(category)}
                      </span>

                      <h3 class="text-xs sm:text-sm font-bold text-[#141413] leading-snug line-clamp-2">
                        ${escapeHtml(item.title || item.name)}
                      </h3>

                      <div class="mt-2 pt-1.5 border-t border-[#F0EDE5]">
                        <!-- Price Row: Offer Price + Original Price with Strikethrough -->
                        <div class="flex items-baseline gap-1.5 mb-1">
                          <span class="text-sm sm:text-base font-black text-[#004643]">
                            ${escapeHtml(offerPrice)}
                          </span>
                          <span class="text-[11px] text-[#78716C] line-through">
                            ${escapeHtml(originalPrice)}
                          </span>
                        </div>

                        <!-- Next Day Delivery Pill -->
                        <div class="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 w-fit">
                          <span>⚡</span>
                          <span>${escapeHtml(deliveryBadge)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Action Row: Buy Button + Unlink Affiliate Button at bottom -->
                  <div class="p-2.5 sm:p-3.5 pt-0">
                    <div class="flex items-center gap-1.5 pt-2 border-t border-[#F0EDE5]">
                      <a
                        href="https://api.whatsapp.com/send?text=${encodeURIComponent(
                          `Hi! I saw the "${item.title || item.name}" (${offerPrice}) on ${profile.name}'s MyMigo profile. Can you help me order/check availability?`
                        )}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="flex-1 py-2 px-2 rounded-xl bg-[#004643] hover:bg-[#003634] active:scale-95 text-white font-extrabold text-xs transition-all shadow-xs flex items-center justify-center cursor-pointer truncate"
                      >
                        <span>Buy</span>
                      </a>

                      <!-- Bottom Unlink Affiliate Button -->
                      <button
                        type="button"
                        data-remove-affiliated-item="${escapeHtml(item.id)}"
                        class="py-2 px-2 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 active:scale-95 text-xs font-bold transition-all cursor-pointer shadow-2xs shrink-0 flex items-center gap-1"
                        title="Unlink Affiliate"
                        aria-label="Unlink Affiliate"
                      >
                        <svg class="w-3.5 h-3.5 fill-none stroke-current" stroke-width="2.2" viewBox="0 0 24 24">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                        <span class="text-[10px] hidden xs:inline">Unlink</span>
                      </button>
                    </div>
                  </div>
                </div>
              `;
                })
                .join('')}
            </div>
          `
          }
        </div>
      `;
    }

    // Default: Media Tabs (Video / Photo) + 2-Column Grid matching screenshot
    return `
      <!-- Media Tabs -->
      <div class="border-b border-[#DCD6C9] mb-4">
        <div class="grid grid-cols-2">
          
          <!-- Video Tab -->
          <button
            id="media-subtab-video"
            type="button"
            class="py-3 flex items-center justify-center transition-colors relative ${
              mediaSubTab === 'video'
                ? 'text-[#004643]'
                : 'text-[#78716C] hover:text-[#141413]'
            }"
          >
            <svg class="w-6 h-6 fill-none stroke-current" stroke-width="2" viewBox="0 0 24 24">
              <rect x="2" y="4" width="20" height="16" rx="4"></rect>
              <polygon points="10 8 16 12 10 16 10 8" fill="currentColor"></polygon>
            </svg>
            ${
              mediaSubTab === 'video'
                ? '<span class="absolute bottom-0 inset-x-12 h-0.5 bg-[#004643] rounded-full"></span>'
                : ''
            }
          </button>

          <!-- Photo Tab -->
          <button
            id="media-subtab-photo"
            type="button"
            class="py-3 flex items-center justify-center transition-colors relative ${
              mediaSubTab === 'photo'
                ? 'text-[#004643]'
                : 'text-[#78716C] hover:text-[#141413]'
            }"
          >
            <svg class="w-6 h-6 fill-none stroke-current" stroke-width="2" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="3"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            ${
              mediaSubTab === 'photo'
                ? '<span class="absolute bottom-0 inset-x-12 h-0.5 bg-[#004643] rounded-full"></span>'
                : ''
            }
          </button>

        </div>
      </div>

      <!-- 2-Column Media Grid (Matching Screenshot) -->
      <div class="grid grid-cols-2 gap-3 sm:gap-4">
        ${profile.mediaPosts
          .map(
            (post) => `
          <div class="relative aspect-4/5 rounded-2xl overflow-hidden bg-stone-200 border border-[#DCD6C9] shadow-xs group cursor-pointer">
            <img
              src="${post.thumb}"
              alt="${escapeHtml(post.caption)}"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            <!-- Play Button Badge in Top-Right (matching screenshot) -->
            <div class="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white">
              <svg class="w-3 h-3 fill-current ml-0.5" viewBox="0 0 24 24">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            </div>

            <!-- Gradient overlay with subtle caption on hover -->
            <div class="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <p class="text-[11px] text-white font-medium line-clamp-1">
                ${escapeHtml(post.caption)}
              </p>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  function attachEventListeners() {
    // Back Button
    container.querySelector('#profile-back-btn')?.addEventListener('click', () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        navigate('/connect');
      }
    });

    // Connections Pill -> Navigate to Migo Connect
    container.querySelector('#connections-pill-btn')?.addEventListener('click', () => {
      navigate('/connect');
    });

    // Share Profile
    container.querySelector('#share-profile-btn')?.addEventListener('click', async () => {
      const shareUrl = `${window.location.origin}/#/profile?id=${encodeURIComponent(profile.id)}`;
      if (navigator.share) {
        try {
          await navigator.share({
            title: `${profile.name} on MyMigo`,
            text: `Check out ${profile.name}'s loved stores and affiliated finds on MyMigo!`,
            url: shareUrl,
          });
          return;
        } catch (e) {}
      }
      navigator.clipboard?.writeText(shareUrl);
      alert('Profile link copied to clipboard!');
    });

    // Profile Avatar Click: Opens square profile image popup (not full screen)
    container.querySelector('#profile-avatar-trigger-btn')?.addEventListener('click', () => {
      openProfileImageSquareModal(profile);
    });

    // Instagram-style header name dropdown: Opens Bottom Sheet Account Switcher
    container.querySelector('#profile-name-switcher-btn')?.addEventListener('click', () => {
      openAccountSwitcherBottomSheet(navigate, () => {
        render();
      });
    });

    // Profile Settings Gear Button: Also opens Account Switcher / Mobile Login Sheet
    container.querySelector('#profile-settings-btn')?.addEventListener('click', () => {
      openAccountSwitcherBottomSheet(navigate, () => {
        render();
      });
    });

    // Edit Profile Modal
    container.querySelector('#edit-profile-btn')?.addEventListener('click', () => {
      openEditShopperModal();
    });

    // Switch to Seller Role CTA
    container.querySelector('#profile-switch-to-seller-btn')?.addEventListener('click', () => {
      switchUserRole('seller');
      const storeId = currentUser?.sellerAccount?.storeId || 'store-kalyani-cotton';
      navigate(`/store/${encodeURIComponent(storeId)}`);
    });

    // Create Seller Profile Modal
    container.querySelector('#create-seller-profile-btn')?.addEventListener('click', () => {
      openCreateSellerModal();
    });

    // Post Video Reel Handlers (Available in Customer & Seller Profile)
    const handleOpenPostReel = async () => {
      try {
        const stores = await fetchActiveStores();
        openUploadVideoModal(stores || [], () => {
          showProfileToast('Reel published to Finds!', true);
          navigate('/finds');
        });
      } catch (err) {
        console.error('Error fetching stores for reel upload:', err);
        openUploadVideoModal([], () => {
          showProfileToast('Reel published to Finds!', true);
          navigate('/finds');
        });
      }
    };

    container.querySelector('#profile-post-reel-btn')?.addEventListener('click', handleOpenPostReel);
    container.querySelector('#profile-post-reel-btn-top')?.addEventListener('click', handleOpenPostReel);

    // Post Image Handlers
    const handleOpenPostImage = () => {
      openUploadImageModal(() => {
        mediaSubTab = 'photo';
        activeTab = 'media';
        render();
      });
    };

    container.querySelector('#profile-post-image-btn')?.addEventListener('click', handleOpenPostImage);

    // Loved Stores Card Toggle
    container.querySelector('#loved-stores-card-btn')?.addEventListener('click', () => {
      activeTab = activeTab === 'loved-stores' ? 'media' : 'loved-stores';
      render();
    });

    // Affiliated Items Card Toggle
    container.querySelector('#affiliated-items-card-btn')?.addEventListener('click', () => {
      activeTab = activeTab === 'affiliated-items' ? 'media' : 'affiliated-items';
      render();
    });

    // Back to Media Grid Button
    container.querySelector('#back-to-media-btn')?.addEventListener('click', () => {
      activeTab = 'media';
      render();
    });

    // Subtabs: Video / Photo
    container.querySelector('#media-subtab-video')?.addEventListener('click', () => {
      mediaSubTab = 'video';
      render();
    });

    container.querySelector('#media-subtab-photo')?.addEventListener('click', () => {
      mediaSubTab = 'photo';
      render();
    });

    // Loved Stores Remove / Unlove Button
    container.querySelectorAll('[data-remove-loved-store]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const storeId = btn.getAttribute('data-remove-loved-store');
        const found = profile.lovedStores.find((s) => s.id === storeId);
        toggleLovedStore(found || { id: storeId });
        profile.lovedStores = getLovedStores();
        render();
      });
    });

    // Empty Loved Stores CTA Button
    container.querySelector('#profile-empty-loved-stores-btn')?.addEventListener('click', () => {
      navigate('/stores');
    });

    // Affiliated Items Remove / Unlink Button
    container.querySelectorAll('[data-remove-affiliated-item]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const itemId = btn.getAttribute('data-remove-affiliated-item');
        const found = profile.affiliatedItems.find((s) => s.id === itemId);
        toggleAffiliatedItem(found || { id: itemId });
        profile.affiliatedItems = getAffiliatedItems();
        render();
      });
    });

    // Empty Affiliated Items CTA Button
    container.querySelector('#profile-empty-affiliated-items-btn')?.addEventListener('click', () => {
      navigate('/stores');
    });

    // Navigation links in loved stores or affiliated items
    container.querySelectorAll('[data-nav]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const route = el.getAttribute('data-nav');
        if (route) navigate(route);
      });
    });
  }

  function showProfileToast(message, isSuccess = true) {
    const existing = document.getElementById('mymigo-profile-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'mymigo-profile-toast';
    toast.className = `fixed top-5 left-1/2 -translate-x-1/2 z-50 ${
      isSuccess ? 'bg-[#004643] text-white' : 'bg-rose-700 text-white'
    } px-5 py-3 rounded-full text-xs sm:text-sm font-semibold shadow-xl border border-white/20 animate-fade-in flex items-center gap-2`;
    toast.innerHTML = `
      <span class="w-2 h-2 rounded-full ${isSuccess ? 'bg-emerald-400 animate-pulse' : 'bg-white'}"></span>
      <span>${escapeHtml(message)}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  function openUploadImageModal(onSuccess) {
    const existing = document.getElementById('profile-post-image-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'profile-post-image-modal';
    modal.className =
      'fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in';

    let currentImageUrl =
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80';

    modal.innerHTML = `
      <div class="relative w-full max-w-sm bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#DCD6C9] animate-fade-up max-h-[90vh] overflow-y-auto box-border">
        <button
          type="button"
          id="post-image-close-btn"
          class="absolute top-4 right-4 w-8 h-8 rounded-full border border-[#DCD6C9] bg-white text-[#78716C] hover:text-[#141413] flex items-center justify-center transition-colors text-lg font-bold cursor-pointer"
        >
          &times;
        </button>

        <div class="mb-4">
          <h3 class="text-base font-extrabold text-[#141413]">Post a Photo</h3>
          <p class="text-xs text-[#78716C] mt-0.5">Share shopping finds, curated outfits, or style inspo to your profile.</p>
        </div>

        <form id="profile-post-image-form" class="space-y-3.5">
          <div>
            <label class="block text-xs font-bold text-[#141413] mb-1.5">Photo Preview *</label>
            <div class="aspect-[4/5] w-full rounded-2xl overflow-hidden border border-[#DCD6C9] bg-[#F8F6F0] mb-2 flex items-center justify-center shadow-xs">
              <img id="post-image-preview" src="${escapeHtml(currentImageUrl)}" alt="Preview" class="w-full h-full object-cover" />
            </div>

            <div class="flex items-center gap-2">
              <input
                type="text"
                id="post-image-url-input"
                placeholder="Paste image URL"
                value="${escapeHtml(currentImageUrl)}"
                class="flex-1 px-3 py-1.5 rounded-xl border border-[#DCD6C9] text-xs focus:border-[#004643] outline-none"
              />
              <label class="px-3 py-1.5 rounded-xl bg-[#F0EDE5] hover:bg-[#E7E3D9] text-[#141413] text-xs font-bold cursor-pointer border border-[#DCD6C9] shrink-0">
                <span>Upload</span>
                <input type="file" id="post-image-file-input" accept="image/*" class="hidden" />
              </label>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-[#141413] mb-1">Caption</label>
            <textarea
              id="post-image-caption"
              rows="2"
              placeholder="Write a caption for your style find..."
              class="w-full px-3 py-2 rounded-xl border border-[#DCD6C9] text-xs font-medium focus:border-[#004643] outline-none resize-none"
            ></textarea>
          </div>

          <button
            type="submit"
            class="w-full py-2.5 rounded-xl bg-[#004643] hover:bg-[#003634] active:scale-97 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
          >
            Publish Photo
          </button>
        </form>
      </div>
    `;

    const closeImageModal = () => modal.remove();

    modal.querySelector('#post-image-close-btn')?.addEventListener('click', closeImageModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeImageModal();
    });

    const urlInput = modal.querySelector('#post-image-url-input');
    const previewImg = modal.querySelector('#post-image-preview');
    urlInput?.addEventListener('input', () => {
      if (urlInput.value.trim()) {
        currentImageUrl = urlInput.value.trim();
        previewImg.src = currentImageUrl;
      }
    });

    modal.querySelector('#post-image-file-input')?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (file) {
        try {
          const res = await uploadMediaFile(file);
          if (res?.url) {
            currentImageUrl = res.url;
            previewImg.src = currentImageUrl;
            urlInput.value = currentImageUrl;
          }
        } catch (err) {
          const localUrl = URL.createObjectURL(file);
          currentImageUrl = localUrl;
          previewImg.src = currentImageUrl;
          urlInput.value = currentImageUrl;
        }
      }
    });

    modal.querySelector('#profile-post-image-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const caption = modal.querySelector('#post-image-caption')?.value.trim() || 'Curated fashion find';
      const newPost = {
        id: `post-img-${Date.now()}`,
        type: 'photo',
        thumb: currentImageUrl,
        caption: caption,
        timestamp: Date.now(),
      };
      if (!Array.isArray(profile.mediaPosts)) profile.mediaPosts = [];
      profile.mediaPosts.unshift(newPost);
      closeImageModal();
      showProfileToast('Photo published to profile!', true);
      mediaSubTab = 'photo';
      activeTab = 'media';
      render();
      if (typeof onSuccess === 'function') onSuccess(newPost);
    });

    document.body.appendChild(modal);
  }

  /**
   * Profile Picture Popup
   * Displays the uploaded profile image in a clean portrait frame with enhanced height (not full screen)
   */
  function openProfileImageSquareModal(prof) {
    const existing = document.getElementById('profile-image-square-modal');
    if (existing) existing.remove();

    const avatarUrl = prof.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80';
    const handle = prof.handle || `@${(prof.name || 'shopper').toLowerCase().replace(/\s+/g, '_')}`;

    const modal = document.createElement('div');
    modal.id = 'profile-image-square-modal';
    modal.className =
      'fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in select-none';

    modal.innerHTML = `
      <div class="relative w-full max-w-[340px] sm:max-w-[400px] bg-white rounded-3xl p-4 sm:p-5 shadow-2xl border border-[#DCD6C9] animate-fade-up box-border mx-auto">
        
        <!-- Header: User info & Close Button -->
        <div class="flex items-center justify-between pb-2.5 mb-2 border-b border-[#E7E3D9]">
          <div class="flex items-center gap-2.5 min-w-0 pr-2">
            <div class="w-9 h-9 rounded-full p-[1.5px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shrink-0 shadow-2xs overflow-hidden">
              <img
                src="${escapeHtml(avatarUrl)}"
                alt="${escapeHtml(prof.name)}"
                class="w-full h-full rounded-full object-cover bg-white"
              />
            </div>
            <div class="min-w-0">
              <h3 class="text-xs sm:text-sm font-bold text-[#141413] truncate">${escapeHtml(prof.name)}</h3>
              <p class="text-[10px] sm:text-[11px] text-[#78716C] truncate">${escapeHtml(handle)}</p>
            </div>
          </div>

          <button
            type="button"
            id="profile-image-square-close-btn"
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
            alt="${escapeHtml(prof.name)}"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- Footer / Caption Details (Place and mobile strictly hidden) -->
        <div class="pt-2 border-t border-[#E7E3D9] flex items-center justify-between text-xs text-[#57534E]">
          <span class="truncate font-bold text-[#004643]">${escapeHtml(prof.handle || handle)}</span>
          <span class="font-bold text-[#57534E] shrink-0">${prof.connectionsCount || 84} Connections</span>
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

    modal.querySelector('#profile-image-square-close-btn')?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    document.body.appendChild(modal);
  }

  function openEditShopperModal() {
    const existing = document.getElementById('shopper-profile-modal');
    if (existing) existing.remove();

    const modalEl = document.createElement('div');
    modalEl.id = 'shopper-profile-modal';
    modalEl.className =
      'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-fade-in select-none box-border';

    let currentAvatar = profile.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80';

    modalEl.innerHTML = `
      <div class="relative w-full max-w-lg mx-auto bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border border-[#DCD6C9] animate-fade-up max-h-[92vh] overflow-y-auto no-scrollbar box-border">
        
        <!-- Close Button -->
        <button
          type="button"
          id="shopper-modal-close"
          class="absolute top-4 right-4 w-8 h-8 rounded-full border border-[#DCD6C9] bg-white text-[#78716C] hover:text-[#141413] flex items-center justify-center transition-colors text-lg font-bold cursor-pointer"
        >
          &times;
        </button>

        <div class="mb-4">
          <h2 class="text-lg sm:text-xl font-bold text-[#141413]">Edit Your Profile</h2>
          <p class="text-xs text-[#78716C]">Update your photo, handle, and shopping interests.</p>
        </div>

        <form id="shopper-profile-form" class="space-y-4">
          <!-- Profile Picture Preview & Change (Exact match with Seller modal) -->
          <div>
            <label class="block text-xs font-bold text-[#141413] mb-1.5">Profile Picture</label>
            <div class="flex items-center gap-3.5">
              <div class="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shadow-sm shrink-0">
                <img id="shopper-modal-avatar-preview" src="${escapeHtml(currentAvatar)}" alt="Avatar" class="w-full h-full object-cover rounded-full bg-white" />
              </div>
              <div class="flex-1 space-y-1.5 min-w-0">
                <input
                  type="text"
                  id="shopper-avatar-url"
                  value="${escapeHtml(currentAvatar)}"
                  placeholder="Paste Image URL"
                  class="w-full min-w-0 px-3 py-1.5 rounded-xl border border-[#DCD6C9] text-xs font-medium focus:border-[#004643] outline-none"
                />
                <div class="flex items-center gap-2">
                  <label class="px-3 py-1 rounded-lg bg-[#F0EDE5] hover:bg-[#E7E3D9] text-[#141413] text-[11px] font-bold cursor-pointer border border-[#DCD6C9]">
                    <span>Upload File</span>
                    <input type="file" id="shopper-avatar-file" accept="image/*" class="hidden" />
                  </label>
                  <span class="text-[10px] text-[#78716C]">JPG, PNG or WEBP</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Name & Handle Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-[#141413] mb-1" for="shopper-name">Your Full Name *</label>
              <input
                type="text"
                id="shopper-name"
                required
                value="${escapeHtml(profile.name || '')}"
                placeholder="e.g. Raajkumar"
                class="w-full px-3.5 py-2 rounded-xl border border-[#DCD6C9] text-xs font-semibold focus:border-[#004643] outline-none"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-[#141413] mb-1" for="shopper-handle">User ID / Handle *</label>
              <input
                type="text"
                id="shopper-handle"
                required
                value="${escapeHtml(profile.handle || `@${(profile.name || 'shopper').toLowerCase().replace(/\s+/g, '_')}`)}"
                placeholder="@username"
                class="w-full px-3.5 py-2 rounded-xl border border-[#DCD6C9] text-xs font-semibold focus:border-[#004643] outline-none lowercase"
              />
            </div>
          </div>

          <!-- Email (Optional, kept private) -->
          <div>
            <label class="block text-xs font-bold text-[#141413] mb-1" for="shopper-email">Email (Optional • Private)</label>
            <input
              type="email"
              id="shopper-email"
              value="${escapeHtml(profile.email || '')}"
              placeholder="you@example.com"
              class="w-full px-3.5 py-2 rounded-xl border border-[#DCD6C9] text-xs font-semibold focus:border-[#004643] outline-none"
            />
          </div>

          <!-- Preferences / Interests -->
          <div>
            <label class="block text-xs font-bold text-[#141413] mb-1" for="shopper-preferences">Shopping Preferences / Interests</label>
            <textarea
              id="shopper-preferences"
              rows="3"
              placeholder="e.g. Pure cotton sarees, handloom weaves, temple jewellery, linen wear..."
              class="w-full p-3 rounded-xl border border-[#DCD6C9] text-xs font-normal focus:border-[#004643] outline-none resize-none leading-relaxed"
            >${escapeHtml(profile.interests || profile.shoppingInterest || profile.preferences || '')}</textarea>
          </div>

          <!-- Privacy Notice -->
          <div class="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center gap-2">
            <span class="text-sm">🔒</span>
            <span class="text-[11px] leading-tight">Mobile number and location are kept strictly private and never shown publicly on your profile.</span>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-[#F0EDE5]">
            <button
              type="button"
              id="shopper-modal-cancel"
              class="px-4 py-2 rounded-xl text-xs font-bold text-[#57534E] hover:bg-[#F0EDE5] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="shopper-modal-submit"
              class="px-5 py-2.5 rounded-xl bg-[#004643] text-white text-xs font-bold hover:bg-[#003634] shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    `;
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modalEl);

    // Avatar upload handler
    const fileInput = modalEl.querySelector('#shopper-avatar-file');
    const urlInput = modalEl.querySelector('#shopper-avatar-url');
    const avatarPreview = modalEl.querySelector('#shopper-modal-avatar-preview');

    fileInput?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        showProfileToast('Uploading avatar photo...', true);
        const res = await uploadMediaFile(file);
        if (res && res.url) {
          currentAvatar = res.url;
          if (urlInput) urlInput.value = currentAvatar;
          if (avatarPreview) avatarPreview.src = currentAvatar;
          showProfileToast('Avatar photo uploaded!', true);
        }
      } catch (err) {
        showProfileToast(err.message || 'Avatar upload failed', false);
      }
    });

    urlInput?.addEventListener('input', (e) => {
      currentAvatar = e.target.value.trim();
      if (avatarPreview) avatarPreview.src = currentAvatar;
    });

    // Close handlers
    const closeModal = () => {
      document.removeEventListener('keydown', handleKeyDown);
      modalEl.remove();
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', handleKeyDown);

    modalEl.querySelector('#shopper-modal-close')?.addEventListener('click', closeModal);
    modalEl.querySelector('#shopper-modal-cancel')?.addEventListener('click', closeModal);
    modalEl.addEventListener('click', (e) => {
      if (e.target === modalEl) closeModal();
    });

    // Form submit
    modalEl.querySelector('#shopper-profile-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = modalEl.querySelector('#shopper-modal-submit');
      if (submitBtn) submitBtn.textContent = 'Saving...';

      let updatedHandle = modalEl.querySelector('#shopper-handle')?.value.trim() || profile.handle || '';
      if (updatedHandle && !updatedHandle.startsWith('@')) updatedHandle = `@${updatedHandle}`;

      const userPayload = {
        id: profile.id || 'usr-shopper',
        name: modalEl.querySelector('#shopper-name')?.value.trim() || profile.name || 'Shopper',
        handle: updatedHandle,
        email: modalEl.querySelector('#shopper-email')?.value.trim() || '',
        interests: modalEl.querySelector('#shopper-preferences')?.value.trim() || '',
        preferences: modalEl.querySelector('#shopper-preferences')?.value.trim() || '',
        avatar: currentAvatar,
        connectionsCount: profile.connectionsCount || 250,
        status: 'active',
      };

      try {
        await saveUser(userPayload);
        loginUser(userPayload);
        showProfileToast('Profile updated successfully!', true);
        closeModal();
        render();
      } catch {
        showProfileToast('Failed to save profile. Please try again.', false);
        if (submitBtn) submitBtn.textContent = 'Save Profile';
      }
    });
  }

  function openCreateSellerModal() {
    const modalEl = document.createElement('div');
    modalEl.id = 'create-seller-modal';
    modalEl.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto';

    let currentCover = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80';
    let currentVideo = '';

    modalEl.innerHTML = `
      <div class="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#DCD6C9] animate-fade-up my-8 max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          id="seller-create-close"
          class="absolute top-5 right-5 w-8 h-8 rounded-full border border-[#DCD6C9] bg-white text-[#78716C] hover:text-[#141413] hover:bg-[#F0EDE5] flex items-center justify-center transition-colors shadow-2xs"
        >
          &times;
        </button>

        <div class="pr-8 mb-5 pb-3 border-b border-[#E7E3D9]">
          <span class="text-xs font-bold uppercase tracking-wider text-[#004643]">Seller Registration</span>
          <h2 class="text-xl font-bold text-[#141413]">Create Seller Profile & List Store</h2>
          <p class="text-xs text-[#57534E]">Upload your store cover image, product reels, and join MyMigo's store catalog.</p>
        </div>

        <form id="create-seller-form" class="space-y-4">
          <!-- Store Name & Owner -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-[#141413] mb-1" for="new-seller-store-name">Store Name *</label>
              <input
                type="text"
                id="new-seller-store-name"
                required
                placeholder="e.g. Lakshmi Silks & Weaves"
                class="w-full px-3.5 py-2 rounded-xl border border-[#DCD6C9] text-xs sm:text-sm bg-white focus:outline-none focus:border-[#004643]"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-[#141413] mb-1" for="new-seller-owner-name">Owner / Brand Name *</label>
              <input
                type="text"
                id="new-seller-owner-name"
                required
                value="${escapeHtml(profile.name || '')}"
                placeholder="e.g. Lakshmi Narayanan"
                class="w-full px-3.5 py-2 rounded-xl border border-[#DCD6C9] text-xs sm:text-sm bg-white focus:outline-none focus:border-[#004643]"
              />
            </div>
          </div>

          <!-- Contact Phone & Email -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-[#141413] mb-1" for="new-seller-phone">WhatsApp / Phone *</label>
              <input
                type="tel"
                id="new-seller-phone"
                required
                value="${escapeHtml(profile.phone || profile.mobile || '')}"
                placeholder="+91 98765 43210"
                class="w-full px-3 py-2 rounded-xl border border-[#DCD6C9] text-xs bg-white focus:outline-none focus:border-[#004643]"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-[#141413] mb-1" for="new-seller-email">Store Email</label>
              <input
                type="email"
                id="new-seller-email"
                value="${escapeHtml(profile.email || '')}"
                placeholder="store@example.com"
                class="w-full px-3 py-2 rounded-xl border border-[#DCD6C9] text-xs bg-white focus:outline-none focus:border-[#004643]"
              />
            </div>
          </div>

          <!-- City & Category -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-[#141413] mb-1" for="new-seller-city">City *</label>
              <select id="new-seller-city" class="w-full px-3 py-2 rounded-xl border border-[#DCD6C9] text-xs bg-white focus:outline-none focus:border-[#004643]">
                ${['Coimbatore', 'Chennai', 'Bengaluru', 'Hyderabad', 'Madurai', 'Salem', 'Kochi', 'Mumbai', 'Delhi']
                  .map((c) => `<option value="${c}">${c}</option>`)
                  .join('')}
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-[#141413] mb-1" for="new-seller-category">Store Category *</label>
              <select id="new-seller-category" class="w-full px-3 py-2 rounded-xl border border-[#DCD6C9] text-xs bg-white focus:outline-none focus:border-[#004643]">
                ${[
                  "Men's Fashion",
                  "Women's Fashion",
                  "Kids & Baby",
                  "Jewellery & Accessories",
                  "Fabric & Textile Sourcing",
                  "Home & Living",
                  'Sarees',
                  'Tops',
                  'Jeans',
                  'Jewellery',
                  'Heels',
                  'Menswear',
                  'Handlooms',
                  'Accessories',
                ]
                  .map((cat) => `<option value="${cat}">${cat}</option>`)
                  .join('')}
              </select>
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-xs font-semibold text-[#141413] mb-1" for="new-seller-desc">Store Description *</label>
            <textarea
              id="new-seller-desc"
              rows="2"
              required
              placeholder="Tell shoppers about your fabrics, traditional weaves, collections, or custom stitching..."
              class="w-full px-3 py-2 rounded-xl border border-[#DCD6C9] text-xs bg-white focus:outline-none focus:border-[#004643]"
            ></textarea>
          </div>

          <!-- UPLOAD COVER IMAGE -->
          <div class="p-3.5 rounded-2xl bg-[#F8F6F0] border border-[#E7E3D9]">
            <label class="block text-xs font-bold text-[#004643] mb-1.5">Store Card Image (Upload or URL)</label>
            <div class="flex items-center gap-3">
              <img id="new-seller-cover-preview" src="${escapeHtml(currentCover)}" alt="Cover" class="w-16 h-16 rounded-xl object-cover border border-[#DCD6C9] shrink-0" />
              <div class="flex-1 space-y-1.5">
                <label class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#DCD6C9] bg-white text-xs font-semibold text-[#141413] hover:bg-[#F0EDE5] cursor-pointer shadow-2xs">
                  <span>Upload Image File</span>
                  <input type="file" id="new-seller-cover-file" accept="image/*" class="hidden" />
                </label>
                <input
                  type="text"
                  id="new-seller-cover-url"
                  value="${escapeHtml(currentCover)}"
                  placeholder="Or enter image URL"
                  class="w-full px-3 py-1.5 rounded-lg border border-[#DCD6C9] text-xs bg-white focus:outline-none focus:border-[#004643]"
                />
              </div>
            </div>
          </div>

          <!-- UPLOAD STORE VIDEO REEL -->
          <div class="p-3.5 rounded-2xl bg-[#F8F6F0] border border-[#E7E3D9]">
            <label class="block text-xs font-bold text-[#004643] mb-1.5">Store Video Reel (Upload MP4 or URL)</label>
            <div class="space-y-1.5">
              <label class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#DCD6C9] bg-white text-xs font-semibold text-[#141413] hover:bg-[#F0EDE5] cursor-pointer shadow-2xs">
                <span>Upload Video (MP4 / WebM)</span>
                <input type="file" id="new-seller-video-file" accept="video/mp4,video/webm,video/quicktime" class="hidden" />
              </label>
              <input
                type="text"
                id="new-seller-video-url"
                placeholder="Or paste Instagram reel URL or video link"
                class="w-full px-3 py-1.5 rounded-lg border border-[#DCD6C9] text-xs bg-white focus:outline-none focus:border-[#004643]"
              />
              <div id="new-seller-video-preview" class="mt-1"></div>
            </div>
          </div>

          <!-- Instagram Profile -->
          <div>
            <label class="block text-xs font-semibold text-[#141413] mb-1" for="new-seller-ig">Instagram Handle / URL</label>
            <input
              type="text"
              id="new-seller-ig"
              placeholder="https://www.instagram.com/yourstore/"
              class="w-full px-3 py-2 rounded-xl border border-[#DCD6C9] text-xs bg-white focus:outline-none focus:border-[#004643]"
            />
          </div>

          <!-- Actions -->
          <div class="mt-6 pt-4 border-t border-[#E7E3D9] flex items-center justify-end gap-3">
            <button
              type="button"
              id="seller-create-cancel"
              class="px-4 py-2 rounded-full border border-[#DCD6C9] text-xs font-semibold text-[#57534E] hover:bg-[#F0EDE5]"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="seller-create-submit"
              class="px-6 py-2 rounded-full bg-[#004643] text-white text-xs sm:text-sm font-bold hover:bg-[#003634] active:scale-95 transition-all shadow-sm"
            >
              Publish Store Profile
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modalEl);

    // Image upload handler
    const coverFileInput = modalEl.querySelector('#new-seller-cover-file');
    const coverUrlInput = modalEl.querySelector('#new-seller-cover-url');
    const coverPreview = modalEl.querySelector('#new-seller-cover-preview');

    coverFileInput?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        showProfileToast('Uploading store cover image...', true);
        const res = await uploadMediaFile(file);
        if (res && res.url) {
          currentCover = res.url;
          if (coverUrlInput) coverUrlInput.value = currentCover;
          if (coverPreview) coverPreview.src = currentCover;
          showProfileToast('Store cover uploaded!', true);
        }
      } catch (err) {
        showProfileToast(err.message || 'Image upload failed', false);
      }
    });

    coverUrlInput?.addEventListener('input', (e) => {
      currentCover = e.target.value.trim();
      if (coverPreview) coverPreview.src = currentCover;
    });

    // Video upload handler
    const videoFileInput = modalEl.querySelector('#new-seller-video-file');
    const videoUrlInput = modalEl.querySelector('#new-seller-video-url');
    const videoPreview = modalEl.querySelector('#new-seller-video-preview');

    const updateVideoUi = () => {
      if (!videoPreview) return;
      if (!currentVideo) {
        videoPreview.innerHTML = '';
        return;
      }
      if (currentVideo.includes('.mp4') || currentVideo.includes('.webm') || currentVideo.startsWith('./uploads/')) {
        videoPreview.innerHTML = `
          <video src="${escapeHtml(currentVideo)}" controls preload="metadata" class="w-full h-28 rounded-xl bg-black object-cover mt-1"></video>
        `;
      } else {
        videoPreview.innerHTML = `
          <p class="text-[11px] text-[#004643] font-semibold mt-1">Reel configured: ${escapeHtml(currentVideo)}</p>
        `;
      }
    };

    videoFileInput?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        showProfileToast('Uploading video reel (this may take a moment)...', true);
        const res = await uploadMediaFile(file);
        if (res && res.url) {
          currentVideo = res.url;
          if (videoUrlInput) videoUrlInput.value = currentVideo;
          updateVideoUi();
          showProfileToast('Video reel uploaded!', true);
        }
      } catch (err) {
        showProfileToast(err.message || 'Video upload failed', false);
      }
    });

    videoUrlInput?.addEventListener('input', (e) => {
      currentVideo = e.target.value.trim();
      updateVideoUi();
    });

    // Close handlers
    const closeModal = () => modalEl.remove();
    modalEl.querySelector('#seller-create-close')?.addEventListener('click', closeModal);
    modalEl.querySelector('#seller-create-cancel')?.addEventListener('click', closeModal);
    modalEl.addEventListener('click', (e) => {
      if (e.target === modalEl) closeModal();
    });

    // Form submit
    modalEl.querySelector('#create-seller-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = modalEl.querySelector('#seller-create-submit');
      if (submitBtn) submitBtn.textContent = 'Publishing...';

      const storeName = modalEl.querySelector('#new-seller-store-name')?.value.trim() || 'New Store';
      const sellerPayload = {
        storeName,
        ownerName: modalEl.querySelector('#new-seller-owner-name')?.value.trim() || '',
        phone: modalEl.querySelector('#new-seller-phone')?.value.trim() || '',
        email: modalEl.querySelector('#new-seller-email')?.value.trim() || '',
        city: modalEl.querySelector('#new-seller-city')?.value || 'Coimbatore',
        category: modalEl.querySelector('#new-seller-category')?.value || 'Sarees',
        description: modalEl.querySelector('#new-seller-desc')?.value.trim() || '',
        image: currentCover,
        videoUrl: currentVideo,
        instagramUrl: modalEl.querySelector('#new-seller-ig')?.value.trim() || '',
        badge: 'Top Rated.',
        rating: 4.8,
        active: true,
      };

      try {
        const createdSeller = await saveSeller(sellerPayload);
        showProfileToast(`Store "${storeName}" published successfully!`, true);
        closeModal();

        // Update logged in user with Seller account
        const curUser = getCurrentUser();
        if (curUser) {
          curUser.hasSellerAccount = true;
          curUser.activeRole = 'seller';
          curUser.sellerAccount = {
            storeId: createdSeller?.storeId || 'store-kalyani-cotton',
            storeName,
            handle: `@${storeName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
            category: sellerPayload.category,
            city: sellerPayload.city,
            avatar: currentCover,
            description: sellerPayload.description,
          };
          curUser.name = storeName;
          curUser.avatar = currentCover;
          localStorage.setItem('mymigo_user_auth_v1', JSON.stringify(curUser));
          localStorage.setItem(`mymigo_seller_mode_${curUser.sellerAccount.storeId}`, 'true');
          window.dispatchEvent(new CustomEvent('mymigo:auth-changed', { detail: curUser }));
        }

        if (createdSeller && createdSeller.storeId) {
          setTimeout(() => navigate(`/store/${encodeURIComponent(createdSeller.storeId)}`), 1200);
        } else {
          setTimeout(() => navigate('/store/store-kalyani-cotton'), 1200);
        }
      } catch {
        showProfileToast('Failed to create seller profile. Please try again.', false);
        if (submitBtn) submitBtn.textContent = 'Publish Store Profile';
      }
    });
  }

  render();
}
