// Admin Page — Manage Home Page Banner, 3 Featured Stores (Order 1, 2, 3), 4 Featured Videos, User Profiles, and Seller Profiles

import { fetchHomepageConfig, saveHomepageConfig, resetHomepageConfig, DEFAULT_HOMEPAGE_CONFIG } from '../services/homepageService.js';
import { fetchActiveStores } from '../services/storeService.js';
import { INSTAGRAM_VIDEOS } from '../data/instagramVideos.js';
import { renderStoreBadge } from '../components/StoreCard.js';
import { createAdminUsersTab } from '../components/AdminUsersTab.js';
import { createAdminSellersTab } from '../components/AdminSellersTab.js';
import { escapeHtml } from '../utils/dom.js';

export async function renderAdminPage(container, navigate) {
  container.innerHTML = `
    <div class="animate-fade-up max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12 pb-28">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#DCD6C9]">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#004643]/10 text-[#004643] mb-2">
            <span class="w-2 h-2 rounded-full bg-[#004643] animate-pulse"></span>
            Admin Panel
          </div>
          <h1 class="text-3xl sm:text-4xl font-bold tracking-tight text-[#141413]">
            MyMigo Management
          </h1>
          <p class="mt-1 text-sm text-[#57534E]">
            Edit homepage banner & featured stores, manage registered shoppers, and review seller profiles & media uploads.
          </p>
        </div>

        <div class="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            id="admin-view-home-btn"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold border border-[#DCD6C9] bg-white text-[#141413] hover:bg-[#F0EDE5] transition-colors shadow-xs cursor-pointer"
          >
            <svg class="w-4 h-4 text-[#004643]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
            <span>View Home</span>
          </button>
          <button
            type="button"
            id="admin-top-save-btn"
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-[#004643] text-white hover:bg-[#003634] active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      <!-- Navigation Tabs: Home Customizer, User Profiles, Seller Profiles & Media -->
      <div class="mt-6 flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-[#DCD6C9] max-w-xl shadow-xs overflow-x-auto">
        <button
          type="button"
          id="admin-tab-btn-home"
          class="flex-1 min-w-[130px] inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all bg-[#004643] text-white shadow-xs cursor-pointer"
        >
          <span>🎨 Home Customizer</span>
        </button>
        <button
          type="button"
          id="admin-tab-btn-users"
          class="flex-1 min-w-[130px] inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all text-[#57534E] hover:text-[#141413] hover:bg-[#F0EDE5] cursor-pointer"
        >
          <span>👥 User Profiles</span>
          <span id="admin-users-badge-count" class="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#004643]/10 text-[#004643]">0</span>
        </button>
        <button
          type="button"
          id="admin-tab-btn-sellers"
          class="flex-1 min-w-[150px] inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all text-[#57534E] hover:text-[#141413] hover:bg-[#F0EDE5] cursor-pointer"
        >
          <span>🏪 Sellers & Media</span>
          <span id="admin-sellers-badge-count" class="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#004643]/10 text-[#004643]">0</span>
        </button>
      </div>

      <!-- Toast Container -->
      <div id="admin-toast-area" class="fixed top-20 right-4 z-50 pointer-events-none"></div>

      <!-- Loading Placeholder -->
      <div id="admin-loading" class="py-16 text-center text-sm text-[#57534E]">
        Loading dashboard configuration...
      </div>

      <!-- Tab Content 1: Homepage Customizer -->
      <div id="admin-tab-content-home">
        <form id="admin-homepage-form" class="hidden mt-8 space-y-10">
        
        <!-- SECTION 1: LANDING BANNER -->
        <section class="bg-white rounded-3xl border border-[#DCD6C9] p-6 sm:p-8 shadow-xs">
          <div class="flex items-center justify-between pb-4 border-b border-[#E7E3D9]">
            <div>
              <span class="text-xs font-bold uppercase tracking-wider text-[#004643]">Section 1</span>
              <h2 class="text-xl font-bold text-[#141413]">Landing Page Banner</h2>
            </div>
            <span class="text-xs text-[#57534E]">Banner images & hero typography</span>
          </div>

          <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Desktop Banner Image -->
            <div>
              <label class="block text-xs font-semibold text-[#141413] mb-1.5" for="banner-desktop-img">
                Desktop Banner Image (Landscape)
              </label>
              <input
                type="text"
                id="banner-desktop-img"
                class="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD6C9] text-sm focus:outline-none focus:border-[#004643] bg-[#FDFBF7]"
                placeholder="./assets/hero-desktop.jpg"
              />
              <p class="mt-1 text-[11px] text-[#57534E]">Relative path or https:// URL</p>
            </div>

            <!-- Mobile Banner Image -->
            <div>
              <label class="block text-xs font-semibold text-[#141413] mb-1.5" for="banner-mobile-img">
                Mobile Banner Image (Portrait)
              </label>
              <input
                type="text"
                id="banner-mobile-img"
                class="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD6C9] text-sm focus:outline-none focus:border-[#004643] bg-[#FDFBF7]"
                placeholder="./assets/hero-mobile.jpg"
              />
              <p class="mt-1 text-[11px] text-[#57534E]">Relative path or https:// URL</p>
            </div>

            <!-- Badge Line 1 -->
            <div>
              <label class="block text-xs font-semibold text-[#141413] mb-1.5" for="banner-badge-title">
                Pill Badge Line 1
              </label>
              <input
                type="text"
                id="banner-badge-title"
                class="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD6C9] text-sm focus:outline-none focus:border-[#004643] bg-[#FDFBF7]"
                placeholder="Personal Shopping Assistance"
              />
            </div>

            <!-- Badge Line 2 -->
            <div>
              <label class="block text-xs font-semibold text-[#141413] mb-1.5" for="banner-badge-sub">
                Pill Badge Line 2
              </label>
              <input
                type="text"
                id="banner-badge-sub"
                class="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD6C9] text-sm focus:outline-none focus:border-[#004643] bg-[#FDFBF7]"
                placeholder="Across Indian Cities"
              />
            </div>

            <!-- Heading Line 1 -->
            <div>
              <label class="block text-xs font-semibold text-[#141413] mb-1.5" for="banner-heading-1">
                Main Heading (Line 1)
              </label>
              <input
                type="text"
                id="banner-heading-1"
                class="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD6C9] text-sm focus:outline-none focus:border-[#004643] bg-[#FDFBF7]"
                placeholder="Someone is"
              />
            </div>

            <!-- Heading Line 2 -->
            <div>
              <label class="block text-xs font-semibold text-[#141413] mb-1.5" for="banner-heading-2">
                Main Heading (Line 2 / Italic)
              </label>
              <input
                type="text"
                id="banner-heading-2"
                class="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD6C9] text-sm focus:outline-none focus:border-[#004643] bg-[#FDFBF7]"
                placeholder="there."
              />
            </div>

            <!-- Subtitle -->
            <div class="col-span-full">
              <label class="block text-xs font-semibold text-[#141413] mb-1.5" for="banner-subtitle">
                Subtitle Text
              </label>
              <input
                type="text"
                id="banner-subtitle"
                class="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD6C9] text-sm focus:outline-none focus:border-[#004643] bg-[#FDFBF7]"
                placeholder="Shop from anywhere."
              />
            </div>
          </div>

          <!-- Buttons 1 & 2 -->
          <div class="mt-8 pt-6 border-t border-[#E7E3D9]">
            <h3 class="text-sm font-bold text-[#141413] mb-4">Hero Call-to-Action Buttons</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Button 1 (Theme Fill) -->
              <div class="p-4 rounded-2xl bg-[#F8F6F0] border border-[#E7E3D9]">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-xs font-bold text-[#004643]">Button 1 (Theme Fill)</span>
                  <label class="inline-flex items-center gap-1.5 text-xs text-[#141413] cursor-pointer">
                    <input type="checkbox" id="btn1-enabled" class="rounded text-[#004643] focus:ring-0" />
                    <span>Enabled</span>
                  </label>
                </div>
                <div class="space-y-3">
                  <div>
                    <label class="block text-[11px] font-medium text-[#57534E] mb-1" for="btn1-text">Button Label</label>
                    <input
                      type="text"
                      id="btn1-text"
                      class="w-full px-3 py-2 rounded-lg border border-[#DCD6C9] text-xs bg-white focus:outline-none focus:border-[#004643]"
                      placeholder="Book a Session"
                    />
                  </div>
                  <div>
                    <label class="block text-[11px] font-medium text-[#57534E] mb-1" for="btn1-action">Action / Target</label>
                    <select
                      id="btn1-action"
                      class="w-full px-3 py-2 rounded-lg border border-[#DCD6C9] text-xs bg-white focus:outline-none focus:border-[#004643]"
                    >
                      <option value="book_session">Open Book Session Modal (Popup)</option>
                      <option value="#/book">Navigate to Book Session Page (#/book)</option>
                      <option value="#/stores">Navigate to Explore Stores (#/stores)</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Button 2 (Outline Pill) -->
              <div class="p-4 rounded-2xl bg-[#F8F6F0] border border-[#E7E3D9]">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-xs font-bold text-[#141413]">Button 2 (Outline Pill)</span>
                  <label class="inline-flex items-center gap-1.5 text-xs text-[#141413] cursor-pointer">
                    <input type="checkbox" id="btn2-enabled" class="rounded text-[#004643] focus:ring-0" />
                    <span>Enabled</span>
                  </label>
                </div>
                <div class="space-y-3">
                  <div>
                    <label class="block text-[11px] font-medium text-[#57534E] mb-1" for="btn2-text">Button Label</label>
                    <input
                      type="text"
                      id="btn2-text"
                      class="w-full px-3 py-2 rounded-lg border border-[#DCD6C9] text-xs bg-white focus:outline-none focus:border-[#004643]"
                      placeholder="Explore Stores"
                    />
                  </div>
                  <div>
                    <label class="block text-[11px] font-medium text-[#57534E] mb-1" for="btn2-action">Action / Target</label>
                    <select
                      id="btn2-action"
                      class="w-full px-3 py-2 rounded-lg border border-[#DCD6C9] text-xs bg-white focus:outline-none focus:border-[#004643]"
                    >
                      <option value="#/stores">Navigate to Explore Stores (#/stores)</option>
                      <option value="book_session">Open Book Session Modal (Popup)</option>
                      <option value="#/book">Navigate to Book Session Page (#/book)</option>
                      <option value="#/finds">Navigate to Finds (#/finds)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- SECTION 2: EXPLORE STORES (ORDER 1, 2, 3) -->
        <section class="bg-white rounded-3xl border border-[#DCD6C9] p-6 sm:p-8 shadow-xs">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E7E3D9] gap-2">
            <div>
              <span class="text-xs font-bold uppercase tracking-wider text-[#004643]">Section 2</span>
              <h2 class="text-xl font-bold text-[#141413]">Featured Stores (Order 1, 2, 3)</h2>
            </div>
            <span class="text-xs font-medium px-3 py-1 rounded-full bg-[#004643]/10 text-[#004643]">
              Slot 1 = 1st, Slot 2 = 2nd, Slot 3 = 3rd
            </span>
          </div>

          <p class="mt-3 text-xs sm:text-sm text-[#57534E]">
            Whichever stores you select below will be rendered on the Homepage in this exact sequence. Each store card has 2 customizable badge options in its top-left corner: <strong>Option 1 (Badge Text)</strong> and <strong>Option 2 (Store Rating with + / &minus; stepper)</strong>. If either is empty it is omitted; if both are empty, the badge is completely invisible. On the bottom-right, the store icon button is placed left to the white <strong>+</strong> button (which triggers the Book Session popup).
          </p>

          <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Slot 1 -->
            <div class="p-5 rounded-2xl bg-[#F8F6F0] border border-[#E7E3D9] flex flex-col space-y-3.5">
              <div class="flex items-center justify-between">
                <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#004643] text-white text-xs font-bold">1</span>
                <span class="text-xs font-bold text-[#004643]">Order: 1st Store</span>
              </div>

              <!-- Store Select -->
              <div>
                <label class="block text-xs font-semibold text-[#141413] mb-1.5" for="store-slot-1">Select Store</label>
                <select id="store-slot-1" class="w-full px-3 py-2.5 rounded-xl border border-[#DCD6C9] text-xs bg-white font-medium focus:outline-none focus:border-[#004643]"></select>
              </div>

              <!-- Option 1: Badge Text -->
              <div class="pt-2 border-t border-[#E7E3D9]">
                <label class="block text-xs font-semibold text-[#141413] mb-1" for="store-slot-1-badge">
                  Option 1: Badge Text
                </label>
                <input
                  type="text"
                  id="store-slot-1-badge"
                  class="w-full px-3 py-2 rounded-xl border border-[#DCD6C9] text-xs bg-white focus:outline-none focus:border-[#004643]"
                  placeholder="e.g. Top Rated. or Trending"
                />
                <p class="mt-1 text-[11px] text-[#57534E]">Leave empty to omit badge text</p>
              </div>

              <!-- Option 2: Rating with Decimal Stepper -->
              <div class="pt-2 border-t border-[#E7E3D9]">
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-xs font-semibold text-[#141413]" for="store-slot-1-rating">
                    Option 2: Store Rating (0.0 &ndash; 5.0)
                  </label>
                  <button
                    type="button"
                    data-rating-clear="1"
                    class="text-[11px] font-semibold text-[#57534E] hover:text-[#991B1B] underline cursor-pointer"
                    title="Clear rating (make empty)"
                  >
                    Clear Rating
                  </button>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    data-rating-dec="1"
                    class="w-9 h-9 rounded-xl bg-white border border-[#DCD6C9] font-bold text-base text-[#141413] hover:bg-[#F0EDE5] active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-xs"
                    title="Decrease by 0.1"
                  >
                    &minus;
                  </button>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    id="store-slot-1-rating"
                    class="w-24 text-center px-2 py-2 rounded-xl border border-[#DCD6C9] text-xs bg-white font-bold text-[#141413] focus:outline-none focus:border-[#004643]"
                    placeholder="e.g. 4.9"
                  />
                  <button
                    type="button"
                    data-rating-inc="1"
                    class="w-9 h-9 rounded-xl bg-white border border-[#DCD6C9] font-bold text-base text-[#141413] hover:bg-[#F0EDE5] active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-xs"
                    title="Increase by 0.1"
                  >
                    +
                  </button>
                  <span class="text-[11px] text-[#57534E] ml-1">&plusmn; 0.1 step</span>
                </div>
                <p class="mt-1 text-[11px] text-[#57534E]">Leave empty to omit rating & star</p>
              </div>

              <!-- Live Card Preview -->
              <div id="store-slot-1-preview" class="mt-2 pt-3 border-t border-[#E7E3D9] flex-1"></div>
            </div>

            <!-- Slot 2 -->
            <div class="p-5 rounded-2xl bg-[#F8F6F0] border border-[#E7E3D9] flex flex-col space-y-3.5">
              <div class="flex items-center justify-between">
                <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#004643] text-white text-xs font-bold">2</span>
                <span class="text-xs font-bold text-[#004643]">Order: 2nd Store</span>
              </div>

              <!-- Store Select -->
              <div>
                <label class="block text-xs font-semibold text-[#141413] mb-1.5" for="store-slot-2">Select Store</label>
                <select id="store-slot-2" class="w-full px-3 py-2.5 rounded-xl border border-[#DCD6C9] text-xs bg-white font-medium focus:outline-none focus:border-[#004643]"></select>
              </div>

              <!-- Option 1: Badge Text -->
              <div class="pt-2 border-t border-[#E7E3D9]">
                <label class="block text-xs font-semibold text-[#141413] mb-1" for="store-slot-2-badge">
                  Option 1: Badge Text
                </label>
                <input
                  type="text"
                  id="store-slot-2-badge"
                  class="w-full px-3 py-2 rounded-xl border border-[#DCD6C9] text-xs bg-white focus:outline-none focus:border-[#004643]"
                  placeholder="e.g. Top Rated. or Trending"
                />
                <p class="mt-1 text-[11px] text-[#57534E]">Leave empty to omit badge text</p>
              </div>

              <!-- Option 2: Rating with Decimal Stepper -->
              <div class="pt-2 border-t border-[#E7E3D9]">
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-xs font-semibold text-[#141413]" for="store-slot-2-rating">
                    Option 2: Rating (0.0 &ndash; 5.0)
                  </label>
                  <button
                    type="button"
                    data-rating-clear="2"
                    class="text-[11px] font-semibold text-[#57534E] hover:text-[#991B1B] underline cursor-pointer"
                    title="Clear rating (make empty)"
                  >
                    Clear Rating
                  </button>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    data-rating-dec="2"
                    class="w-9 h-9 rounded-xl bg-white border border-[#DCD6C9] font-bold text-base text-[#141413] hover:bg-[#F0EDE5] active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-xs"
                    title="Decrease by 0.1"
                  >
                    &minus;
                  </button>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    id="store-slot-2-rating"
                    class="w-24 text-center px-2 py-2 rounded-xl border border-[#DCD6C9] text-xs bg-white font-bold text-[#141413] focus:outline-none focus:border-[#004643]"
                    placeholder="e.g. 4.8"
                  />
                  <button
                    type="button"
                    data-rating-inc="2"
                    class="w-9 h-9 rounded-xl bg-white border border-[#DCD6C9] font-bold text-base text-[#141413] hover:bg-[#F0EDE5] active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-xs"
                    title="Increase by 0.1"
                  >
                    +
                  </button>
                  <span class="text-[11px] text-[#57534E] ml-1">&plusmn; 0.1 step</span>
                </div>
                <p class="mt-1 text-[11px] text-[#57534E]">Leave empty to omit rating & star</p>
              </div>

              <!-- Live Card Preview -->
              <div id="store-slot-2-preview" class="mt-2 pt-3 border-t border-[#E7E3D9] flex-1"></div>
            </div>

            <!-- Slot 3 -->
            <div class="p-5 rounded-2xl bg-[#F8F6F0] border border-[#E7E3D9] flex flex-col space-y-3.5">
              <div class="flex items-center justify-between">
                <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#004643] text-white text-xs font-bold">3</span>
                <span class="text-xs font-bold text-[#004643]">Order: 3rd Store</span>
              </div>

              <!-- Store Select -->
              <div>
                <label class="block text-xs font-semibold text-[#141413] mb-1.5" for="store-slot-3">Select Store</label>
                <select id="store-slot-3" class="w-full px-3 py-2.5 rounded-xl border border-[#DCD6C9] text-xs bg-white font-medium focus:outline-none focus:border-[#004643]"></select>
              </div>

              <!-- Option 1: Badge Text -->
              <div class="pt-2 border-t border-[#E7E3D9]">
                <label class="block text-xs font-semibold text-[#141413] mb-1" for="store-slot-3-badge">
                  Option 1: Badge Text
                </label>
                <input
                  type="text"
                  id="store-slot-3-badge"
                  class="w-full px-3 py-2 rounded-xl border border-[#DCD6C9] text-xs bg-white focus:outline-none focus:border-[#004643]"
                  placeholder="e.g. Top Rated. or Trending"
                />
                <p class="mt-1 text-[11px] text-[#57534E]">Leave empty to omit badge text</p>
              </div>

              <!-- Option 2: Rating with Decimal Stepper -->
              <div class="pt-2 border-t border-[#E7E3D9]">
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-xs font-semibold text-[#141413]" for="store-slot-3-rating">
                    Option 2: Rating (0.0 &ndash; 5.0)
                  </label>
                  <button
                    type="button"
                    data-rating-clear="3"
                    class="text-[11px] font-semibold text-[#57534E] hover:text-[#991B1B] underline cursor-pointer"
                    title="Clear rating (make empty)"
                  >
                    Clear Rating
                  </button>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    data-rating-dec="3"
                    class="w-9 h-9 rounded-xl bg-white border border-[#DCD6C9] font-bold text-base text-[#141413] hover:bg-[#F0EDE5] active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-xs"
                    title="Decrease by 0.1"
                  >
                    &minus;
                  </button>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    id="store-slot-3-rating"
                    class="w-24 text-center px-2 py-2 rounded-xl border border-[#DCD6C9] text-xs bg-white font-bold text-[#141413] focus:outline-none focus:border-[#004643]"
                    placeholder="e.g. 4.7"
                  />
                  <button
                    type="button"
                    data-rating-inc="3"
                    class="w-9 h-9 rounded-xl bg-white border border-[#DCD6C9] font-bold text-base text-[#141413] hover:bg-[#F0EDE5] active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-xs"
                    title="Increase by 0.1"
                  >
                    +
                  </button>
                  <span class="text-[11px] text-[#57534E] ml-1">&plusmn; 0.1 step</span>
                </div>
                <p class="mt-1 text-[11px] text-[#57534E]">Leave empty to omit rating & star</p>
              </div>

              <!-- Live Card Preview -->
              <div id="store-slot-3-preview" class="mt-2 pt-3 border-t border-[#E7E3D9] flex-1"></div>
            </div>
          </div>
        </section>

        <!-- SECTION 3: FEATURED VIDEOS (ORDER 1, 2, 3, 4) -->
        <section class="bg-white rounded-3xl border border-[#DCD6C9] p-6 sm:p-8 shadow-xs">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E7E3D9] gap-2">
            <div>
              <span class="text-xs font-bold uppercase tracking-wider text-[#004643]">Section 3</span>
              <h2 class="text-xl font-bold text-[#141413]">Featured Videos / Finds (4 Videos)</h2>
            </div>
            <span class="text-xs font-medium px-3 py-1 rounded-full bg-[#004643]/10 text-[#004643]">
              Slot 1 to 4 Order on Homepage
            </span>
          </div>

          <p class="mt-3 text-xs sm:text-sm text-[#57534E]">
            Select which Instagram Reels appear as the 4 featured video cards on the Home Page and set their order.
          </p>

          <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <!-- Video Slot 1 -->
            <div class="p-4 rounded-2xl bg-[#F8F6F0] border border-[#E7E3D9] flex flex-col">
              <div class="flex items-center justify-between mb-2">
                <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#004643] text-white text-[11px] font-bold">1</span>
                <span class="text-[11px] font-bold text-[#004643]">1st Video</span>
              </div>
              <select id="video-slot-1" class="w-full px-2.5 py-2 rounded-lg border border-[#DCD6C9] text-xs bg-white focus:outline-none focus:border-[#004643]"></select>
              <div id="video-slot-1-preview" class="mt-3 pt-2 border-t border-[#E7E3D9] flex-1"></div>
            </div>

            <!-- Video Slot 2 -->
            <div class="p-4 rounded-2xl bg-[#F8F6F0] border border-[#E7E3D9] flex flex-col">
              <div class="flex items-center justify-between mb-2">
                <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#004643] text-white text-[11px] font-bold">2</span>
                <span class="text-[11px] font-bold text-[#004643]">2nd Video</span>
              </div>
              <select id="video-slot-2" class="w-full px-2.5 py-2 rounded-lg border border-[#DCD6C9] text-xs bg-white focus:outline-none focus:border-[#004643]"></select>
              <div id="video-slot-2-preview" class="mt-3 pt-2 border-t border-[#E7E3D9] flex-1"></div>
            </div>

            <!-- Video Slot 3 -->
            <div class="p-4 rounded-2xl bg-[#F8F6F0] border border-[#E7E3D9] flex flex-col">
              <div class="flex items-center justify-between mb-2">
                <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#004643] text-white text-[11px] font-bold">3</span>
                <span class="text-[11px] font-bold text-[#004643]">3rd Video</span>
              </div>
              <select id="video-slot-3" class="w-full px-2.5 py-2 rounded-lg border border-[#DCD6C9] text-xs bg-white focus:outline-none focus:border-[#004643]"></select>
              <div id="video-slot-3-preview" class="mt-3 pt-2 border-t border-[#E7E3D9] flex-1"></div>
            </div>

            <!-- Video Slot 4 -->
            <div class="p-4 rounded-2xl bg-[#F8F6F0] border border-[#E7E3D9] flex flex-col">
              <div class="flex items-center justify-between mb-2">
                <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#004643] text-white text-[11px] font-bold">4</span>
                <span class="text-[11px] font-bold text-[#004643]">4th Video</span>
              </div>
              <select id="video-slot-4" class="w-full px-2.5 py-2 rounded-lg border border-[#DCD6C9] text-xs bg-white focus:outline-none focus:border-[#004643]"></select>
              <div id="video-slot-4-preview" class="mt-3 pt-2 border-t border-[#E7E3D9] flex-1"></div>
            </div>
          </div>
        </section>

        <!-- Save & Reset Action Bar -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#DCD6C9]">
          <button
            type="button"
            id="admin-reset-btn"
            class="w-full sm:w-auto px-5 py-3 rounded-full text-xs sm:text-sm font-semibold border border-[#DCD6C9] text-[#57534E] hover:text-[#141413] hover:bg-white transition-colors"
          >
            Reset to Defaults
          </button>

          <div class="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="submit"
              id="admin-save-btn"
              class="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold bg-[#004643] text-white hover:bg-[#003634] active:scale-95 transition-all shadow-md cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Save & Publish Changes</span>
            </button>
          </div>
        </div>

        </form>
      </div>

      <!-- Tab Content 2: User Profiles -->
      <div id="admin-tab-content-users" class="hidden mt-8"></div>

      <!-- Tab Content 3: Seller Profiles & Media -->
      <div id="admin-tab-content-sellers" class="hidden mt-8"></div>
    </div>
  `;

  const loadingEl = container.querySelector('#admin-loading');
  const formEl = container.querySelector('#admin-homepage-form');
  const toastArea = container.querySelector('#admin-toast-area');

  function showToast(message, type = 'success') {
    if (!toastArea) return;
    const toast = document.createElement('div');
    toast.className = `pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl text-xs sm:text-sm font-medium transition-all duration-300 transform translate-y-2 opacity-0 ${
      type === 'success' ? 'bg-[#004643] text-white' : 'bg-[#991B1B] text-white'
    }`;
    toast.innerHTML = `
      <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
        ${
          type === 'success'
            ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>'
            : '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'
        }
      </svg>
      <span>${escapeHtml(message)}</span>
    `;
    toastArea.appendChild(toast);
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
    });
    setTimeout(() => {
      toast.classList.add('opacity-0', '-translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // Load stores & config
  let stores = [];
  let config = {};

  try {
    const [fetchedStores, fetchedConfig] = await Promise.all([
      fetchActiveStores(),
      fetchHomepageConfig(),
    ]);
    stores = fetchedStores || [];
    config = fetchedConfig || DEFAULT_HOMEPAGE_CONFIG;
  } catch (err) {
    config = DEFAULT_HOMEPAGE_CONFIG;
  }

  if (loadingEl) loadingEl.classList.add('hidden');
  if (formEl) formEl.classList.remove('hidden');

  // Populate Banner Fields
  const desktopImgInput = container.querySelector('#banner-desktop-img');
  const mobileImgInput = container.querySelector('#banner-mobile-img');
  const badgeTitleInput = container.querySelector('#banner-badge-title');
  const badgeSubInput = container.querySelector('#banner-badge-sub');
  const heading1Input = container.querySelector('#banner-heading-1');
  const heading2Input = container.querySelector('#banner-heading-2');
  const subtitleInput = container.querySelector('#banner-subtitle');

  const btn1EnabledInput = container.querySelector('#btn1-enabled');
  const btn1TextInput = container.querySelector('#btn1-text');
  const btn1ActionInput = container.querySelector('#btn1-action');

  const btn2EnabledInput = container.querySelector('#btn2-enabled');
  const btn2TextInput = container.querySelector('#btn2-text');
  const btn2ActionInput = container.querySelector('#btn2-action');

  function populateForm(data) {
    const b = data.banner || {};
    if (desktopImgInput) desktopImgInput.value = b.imageDesktop || './assets/hero-desktop.jpg';
    if (mobileImgInput) mobileImgInput.value = b.imageMobile || './assets/hero-mobile.jpg';
    if (badgeTitleInput) badgeTitleInput.value = b.badgeTitle || 'Personal Shopping Assistance';
    if (badgeSubInput) badgeSubInput.value = b.badgeSubtitle || 'Across Indian Cities';
    if (heading1Input) heading1Input.value = b.headingLine1 || 'Someone is';
    if (heading2Input) heading2Input.value = b.headingLine2 || 'there.';
    if (subtitleInput) subtitleInput.value = b.subtitle || 'Shop from anywhere.';

    const b1 = b.button1 || {};
    if (btn1EnabledInput) btn1EnabledInput.checked = b1.enabled !== false;
    if (btn1TextInput) btn1TextInput.value = b1.text || 'Book a Session';
    if (btn1ActionInput) btn1ActionInput.value = b1.action || 'book_session';

    const b2 = b.button2 || {};
    if (btn2EnabledInput) btn2EnabledInput.checked = b2.enabled !== false;
    if (btn2TextInput) btn2TextInput.value = b2.text || 'Explore Stores';
    if (btn2ActionInput) btn2ActionInput.value = b2.link || '#/stores';

    // Populate 3 Stores Selectors, Badges, and Ratings
    const chosenStores = Array.isArray(data.featuredStores) && data.featuredStores.length === 3
      ? data.featuredStores
      : DEFAULT_HOMEPAGE_CONFIG.featuredStores;

    [1, 2, 3].forEach((slotNum, idx) => {
      const slotData = chosenStores[idx] || {};
      const slotStoreId = typeof slotData === 'object' ? slotData.id : slotData;
      const slotBadge = typeof slotData === 'object' && slotData.badge !== undefined ? slotData.badge : '';
      const slotRating = typeof slotData === 'object' && slotData.rating !== undefined && slotData.rating !== null ? slotData.rating : '';

      const select = container.querySelector(`#store-slot-${slotNum}`);
      const badgeInput = container.querySelector(`#store-slot-${slotNum}-badge`);
      const ratingInput = container.querySelector(`#store-slot-${slotNum}-rating`);

      if (badgeInput) badgeInput.value = slotBadge;
      if (ratingInput) ratingInput.value = slotRating !== '' ? Number(slotRating).toFixed(1) : '';

      if (select) {
        select.innerHTML = '';
        stores.forEach((st) => {
          const opt = document.createElement('option');
          opt.value = st.id;
          opt.textContent = `${st.name} (${st.city} • ${st.category})`;
          if (st.id === slotStoreId) opt.selected = true;
          select.appendChild(opt);
        });
        // Fallback if not matched
        if (!select.value && select.options.length > 0) {
          select.selectedIndex = Math.min(idx, select.options.length - 1);
        }
      }
      updateStorePreview(slotNum);
    });

    // Populate 4 Videos Selectors
    const chosenVideos = Array.isArray(data.featuredVideos) && data.featuredVideos.length === 4
      ? data.featuredVideos
      : DEFAULT_HOMEPAGE_CONFIG.featuredVideos;

    [1, 2, 3, 4].forEach((slotNum, idx) => {
      const select = container.querySelector(`#video-slot-${slotNum}`);
      if (!select) return;
      select.innerHTML = '';
      INSTAGRAM_VIDEOS.forEach((vid) => {
        const opt = document.createElement('option');
        opt.value = vid.id;
        opt.textContent = `${vid.title} (${vid.city})`;
        if (vid.id === chosenVideos[idx]) opt.selected = true;
        select.appendChild(opt);
      });
      if (!select.value && select.options.length > 0) {
        select.selectedIndex = Math.min(idx, select.options.length - 1);
      }
      updateVideoPreview(slotNum);
    });
  }

  function updateStorePreview(slotNum) {
    const select = container.querySelector(`#store-slot-${slotNum}`);
    const badgeInput = container.querySelector(`#store-slot-${slotNum}-badge`);
    const ratingInput = container.querySelector(`#store-slot-${slotNum}-rating`);
    const previewEl = container.querySelector(`#store-slot-${slotNum}-preview`);
    if (!select || !previewEl) return;

    const store = stores.find((s) => s.id === select.value);
    if (!store) {
      previewEl.innerHTML = '<p class="text-[11px] text-[#57534E]">No store selected</p>';
      return;
    }

    const badgeVal = badgeInput?.value.trim() || '';
    const rawRating = ratingInput?.value.trim() || '';
    const ratingVal = rawRating !== '' && !isNaN(parseFloat(rawRating)) ? parseFloat(rawRating) : null;
    const badgeHtml = renderStoreBadge(badgeVal, ratingVal);

    previewEl.innerHTML = `
      <div class="flex items-center gap-3">
        <img src="${escapeHtml(store.image)}" alt="${escapeHtml(store.name)}" class="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#DCD6C9]" />
        <div class="min-w-0 flex-1">
          <p class="text-xs font-bold text-[#141413] truncate">${escapeHtml(store.name)}</p>
          <p class="text-[11px] text-[#57534E]">${escapeHtml(store.city)} &bull; ${escapeHtml(store.category)}</p>
        </div>
      </div>
      <div class="mt-3 pt-2.5 border-t border-[#E7E3D9]">
        <div class="text-[10px] font-bold uppercase tracking-wider text-[#57534E] mb-1.5">Top-Left Badge Preview:</div>
        ${
          badgeHtml
            ? `<div class="p-2 rounded-xl bg-[#141413] inline-flex items-center">${badgeHtml}</div>`
            : '<div class="px-2.5 py-1.5 rounded-lg bg-white border border-dashed border-[#DCD6C9] text-[11px] text-[#57534E] italic">Badge invisible (both text & rating empty)</div>'
        }
      </div>
    `;
  }

  function updateVideoPreview(slotNum) {
    const select = container.querySelector(`#video-slot-${slotNum}`);
    const previewEl = container.querySelector(`#video-slot-${slotNum}-preview`);
    if (!select || !previewEl) return;
    const video = INSTAGRAM_VIDEOS.find((v) => v.id === select.value);
    if (!video) {
      previewEl.innerHTML = '<p class="text-[11px] text-[#57534E]">No video selected</p>';
      return;
    }
    previewEl.innerHTML = `
      <div class="flex items-center gap-2.5">
        <img src="${escapeHtml(video.posterImage)}" alt="${escapeHtml(video.title)}" class="w-10 h-14 rounded-lg object-cover shrink-0 border border-[#DCD6C9]" />
        <div class="min-w-0 flex-1">
          <p class="text-[11px] font-bold text-[#141413] line-clamp-2 leading-tight">${escapeHtml(video.title)}</p>
          <p class="text-[10px] text-[#004643] mt-0.5">${escapeHtml(video.city)}</p>
        </div>
      </div>
    `;
  }

  // Wire input / change listeners for slots
  [1, 2, 3].forEach((slotNum) => {
    const select = container.querySelector(`#store-slot-${slotNum}`);
    const badgeInput = container.querySelector(`#store-slot-${slotNum}-badge`);
    const ratingInput = container.querySelector(`#store-slot-${slotNum}-rating`);

    select?.addEventListener('change', () => updateStorePreview(slotNum));
    badgeInput?.addEventListener('input', () => updateStorePreview(slotNum));
    ratingInput?.addEventListener('input', () => updateStorePreview(slotNum));
  });

  // Stepper handlers for ratings (+0.1 / -0.1 / Clear)
  container.querySelectorAll('[data-rating-inc]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const slot = btn.getAttribute('data-rating-inc');
      const input = container.querySelector(`#store-slot-${slot}-rating`);
      if (!input) return;
      const current = parseFloat(input.value);
      const next = isNaN(current) ? 4.5 : Math.min(5.0, Math.round((current + 0.1) * 10) / 10);
      input.value = next.toFixed(1);
      updateStorePreview(slot);
    });
  });

  container.querySelectorAll('[data-rating-dec]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const slot = btn.getAttribute('data-rating-dec');
      const input = container.querySelector(`#store-slot-${slot}-rating`);
      if (!input) return;
      const current = parseFloat(input.value);
      const next = isNaN(current) ? 4.5 : Math.max(0.0, Math.round((current - 0.1) * 10) / 10);
      input.value = next.toFixed(1);
      updateStorePreview(slot);
    });
  });

  container.querySelectorAll('[data-rating-clear]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const slot = btn.getAttribute('data-rating-clear');
      const input = container.querySelector(`#store-slot-${slot}-rating`);
      if (!input) return;
      input.value = '';
      updateStorePreview(slot);
    });
  });

  [1, 2, 3, 4].forEach((slotNum) => {
    const select = container.querySelector(`#video-slot-${slotNum}`);
    select?.addEventListener('change', () => updateVideoPreview(slotNum));
  });

  populateForm(config);

  // Collect form state
  function buildPayloadFromForm() {
    return {
      banner: {
        imageDesktop: desktopImgInput?.value.trim() || './assets/hero-desktop.jpg',
        imageMobile: mobileImgInput?.value.trim() || './assets/hero-mobile.jpg',
        badgeTitle: badgeTitleInput?.value.trim() || 'Personal Shopping Assistance',
        badgeSubtitle: badgeSubInput?.value.trim() || 'Across Indian Cities',
        headingLine1: heading1Input?.value.trim() || 'Someone is',
        headingLine2: heading2Input?.value.trim() || 'there.',
        subtitle: subtitleInput?.value.trim() || 'Shop from anywhere.',
        button1: {
          text: btn1TextInput?.value.trim() || 'Book a Session',
          action: btn1ActionInput?.value || 'book_session',
          link: btn1ActionInput?.value === 'book_session' ? '#/book' : btn1ActionInput?.value,
          enabled: Boolean(btn1EnabledInput?.checked),
        },
        button2: {
          text: btn2TextInput?.value.trim() || 'Explore Stores',
          action: btn2ActionInput?.value === 'book_session' ? 'book_session' : 'explore_stores',
          link: btn2ActionInput?.value || '#/stores',
          enabled: Boolean(btn2EnabledInput?.checked),
        },
      },
      featuredStores: [1, 2, 3].map((slotNum) => {
        const id = container.querySelector(`#store-slot-${slotNum}`)?.value || 'store-kalyani-cotton';
        const badge = container.querySelector(`#store-slot-${slotNum}-badge`)?.value.trim() || '';
        const rawRating = container.querySelector(`#store-slot-${slotNum}-rating`)?.value.trim() || '';
        const rating = rawRating !== '' && !isNaN(parseFloat(rawRating))
          ? parseFloat(parseFloat(rawRating).toFixed(1))
          : null;
        return { id, badge, rating };
      }),
      featuredVideos: [
        container.querySelector('#video-slot-1')?.value || 'ig-01',
        container.querySelector('#video-slot-2')?.value || 'ig-02',
        container.querySelector('#video-slot-3')?.value || 'ig-03',
        container.querySelector('#video-slot-4')?.value || 'ig-04',
      ],
    };
  }

  async function handleSave() {
    const payload = buildPayloadFromForm();
    const saveBtn = container.querySelector('#admin-save-btn');
    const topSaveBtn = container.querySelector('#admin-top-save-btn');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<span>Saving...</span>';
    }
    if (topSaveBtn) {
      topSaveBtn.disabled = true;
      topSaveBtn.innerHTML = '<span>Saving...</span>';
    }

    try {
      const saved = await saveHomepageConfig(payload);
      showToast('Homepage configuration saved successfully!', 'success');
      config = saved;
    } catch {
      showToast('Failed to save configuration. Please try again.', 'error');
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = `
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>Save & Publish Changes</span>
        `;
      }
      if (topSaveBtn) {
        topSaveBtn.disabled = false;
        topSaveBtn.innerHTML = `
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
          <span>Save Changes</span>
        `;
      }
    }
  }

  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSave();
  });

  container.querySelector('#admin-top-save-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    handleSave();
  });

  container.querySelector('#admin-reset-btn')?.addEventListener('click', async () => {
    if (window.confirm('Reset all homepage settings to original defaults?')) {
      const fresh = await resetHomepageConfig();
      populateForm(fresh || DEFAULT_HOMEPAGE_CONFIG);
      showToast('Reset to original default settings.', 'success');
    }
  });

  container.querySelector('#admin-view-home-btn')?.addEventListener('click', () => {
    navigate('/');
  });

  // Initialize Users and Sellers tabs
  const tabHomeBtn = container.querySelector('#admin-tab-btn-home');
  const tabUsersBtn = container.querySelector('#admin-tab-btn-users');
  const tabSellersBtn = container.querySelector('#admin-tab-btn-sellers');

  const contentHome = container.querySelector('#admin-tab-content-home');
  const contentUsers = container.querySelector('#admin-tab-content-users');
  const contentSellers = container.querySelector('#admin-tab-content-sellers');

  const usersBadge = container.querySelector('#admin-users-badge-count');
  const sellersBadge = container.querySelector('#admin-sellers-badge-count');
  const topSaveBtn = container.querySelector('#admin-top-save-btn');

  const usersTabInstance = createAdminUsersTab(contentUsers, showToast, (count) => {
    if (usersBadge) usersBadge.textContent = String(count);
  });

  const sellersTabInstance = createAdminSellersTab(contentSellers, showToast, (count) => {
    if (sellersBadge) sellersBadge.textContent = String(count);
  });

  function switchTab(targetTab) {
    const tabButtons = [
      { id: 'home', btn: tabHomeBtn, content: contentHome },
      { id: 'users', btn: tabUsersBtn, content: contentUsers },
      { id: 'sellers', btn: tabSellersBtn, content: contentSellers },
    ];

    tabButtons.forEach(({ id, btn, content }) => {
      const isActive = id === targetTab;
      if (isActive) {
        content?.classList.remove('hidden');
        btn?.classList.remove('text-[#57534E]', 'hover:text-[#141413]', 'hover:bg-[#F0EDE5]');
        btn?.classList.add('bg-[#004643]', 'text-white', 'shadow-xs', 'font-bold');
      } else {
        content?.classList.add('hidden');
        btn?.classList.remove('bg-[#004643]', 'text-white', 'shadow-xs', 'font-bold');
        btn?.classList.add('text-[#57534E]', 'hover:text-[#141413]', 'hover:bg-[#F0EDE5]');
      }
    });

    if (topSaveBtn) {
      if (targetTab === 'home') {
        topSaveBtn.classList.remove('hidden');
      } else {
        topSaveBtn.classList.add('hidden');
      }
    }

    if (targetTab === 'users') usersTabInstance.reload();
    if (targetTab === 'sellers') sellersTabInstance.reload();
  }

  tabHomeBtn?.addEventListener('click', () => switchTab('home'));
  tabUsersBtn?.addEventListener('click', () => switchTab('users'));
  tabSellersBtn?.addEventListener('click', () => switchTab('sellers'));
}
