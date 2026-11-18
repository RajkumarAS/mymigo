// Store Card Component
// Displays: Store image, Store name, City, Category, Short description, Instagram link, Book a Session button.

import { openInstagramUrl } from '../services/instagramHelper.js';
import { isStoreLoved, toggleLovedStore } from '../services/lovedStoresService.js';
import { escapeHtml } from '../utils/dom.js';

export function createStoreCard(store, onBookSession, onViewStore, options = {}) {
  const isPlusOnly = Boolean(options.plusOnly);
  const isLoved = isStoreLoved(store.id);
  const card = document.createElement('article');
  card.className =
    'group bg-white rounded-3xl border border-[#DCD6C9] overflow-hidden flex flex-col transition-all duration-300 hover:shadow-[0_16px_40px_-16px_rgba(0,70,67,0.15)] hover:-translate-y-0.5';

  card.innerHTML = `
    <div class="relative aspect-[4/3] overflow-hidden bg-[#E7E3D9] ${onViewStore ? 'cursor-pointer' : ''}" data-store-preview>
      <img
        src="${escapeHtml(store.image)}"
        alt="${escapeHtml(store.name)}"
        loading="lazy"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div class="absolute top-3.5 left-3.5">
        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/95 backdrop-blur-sm text-[#004643] shadow-sm">
          ${escapeHtml(store.city)}
        </span>
      </div>
      <!-- Love Store Pill / Button Top-Right -->
      <div class="absolute top-3.5 right-3.5">
        <button
          type="button"
          data-store-love-btn
          class="w-8 h-8 rounded-full ${
            isLoved ? 'bg-rose-50 border-rose-300 text-rose-600' : 'bg-white/95 border-[#DCD6C9] text-[#78716C] hover:text-rose-600'
          } backdrop-blur-sm border flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-sm z-10 cursor-pointer"
          title="${isLoved ? 'In My Loves (tap to remove)' : 'Add to My Loves'}"
          aria-label="${isLoved ? 'Remove from My Loves' : 'Add to My Loves'}"
        >
          <svg class="w-4 h-4 ${isLoved ? 'fill-rose-500 text-rose-500' : 'fill-none text-current'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
    </div>

    <div class="p-6 flex flex-col flex-1">
      <div class="mb-2">
        <span class="text-xs font-bold uppercase tracking-wider text-[#004643]">
          ${escapeHtml(store.category)}
        </span>
        <h3 class="mt-1 text-xl font-bold tracking-tight text-[#141413] ${onViewStore ? 'cursor-pointer hover:text-[#004643] transition-colors' : ''}" data-store-title>
          ${escapeHtml(store.name)}
        </h3>
      </div>

      <p class="text-sm text-[#57534E] leading-relaxed line-clamp-3 flex-1">
        ${escapeHtml(store.description)}
      </p>

      <div class="mt-5 pt-4 border-t border-[#E7E3D9] flex items-center justify-between gap-2">
        <!-- Instagram: Icon Only Pill Button (No Text) -->
        <a
          href="${escapeHtml(store.instagram_url)}"
          target="_blank"
          rel="noopener noreferrer"
          data-store-ig
          aria-label="Open ${escapeHtml(store.name)} on Instagram"
          title="Open on Instagram"
          class="w-9 h-9 rounded-full border border-[#DCD6C9] text-[#141413] hover:text-[#004643] hover:border-[#004643] hover:bg-[#F0EDE5] flex items-center justify-center transition-colors shrink-0 shadow-xs"
        >
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="1.9" viewBox="0 0 24 24">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
        </a>

        ${
          isPlusOnly
            ? `
          <!-- Plus (+) Button: opens Book Session modal directly -->
          <button
            type="button"
            data-book-store
            aria-label="Book a session at ${escapeHtml(store.name)}"
            title="Book a Session"
            class="w-10 h-10 rounded-full bg-[#004643] text-white hover:bg-[#003634] active:scale-95 flex items-center justify-center transition-all shadow-sm hover:shadow-md cursor-pointer group/plus shrink-0"
          >
            <svg class="w-5 h-5 transition-transform duration-200 group-hover/plus:rotate-90" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        `
            : `
          <!-- View Store & Book Session Pill Buttons -->
          <div class="flex items-center gap-2">
            ${
              onViewStore
                ? `
              <button
                type="button"
                data-view-store-card
                class="inline-flex items-center justify-center px-3.5 py-2 rounded-full text-xs font-semibold border border-[#DCD6C9] text-[#141413] hover:border-[#004643] hover:bg-[#F0EDE5] transition-colors whitespace-nowrap shadow-xs"
              >
                View Store
              </button>
            `
                : ''
            }
            <button
              type="button"
              data-book-store
              class="inline-flex items-center justify-center px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-[#004643] text-white hover:bg-[#003634] transition-colors shadow-xs whitespace-nowrap"
            >
              Book a Session
            </button>
          </div>
        `
        }
      </div>
    </div>
  `;

  const igLink = card.querySelector('[data-store-ig]');
  if (igLink) {
    igLink.addEventListener('click', (e) => openInstagramUrl(e, store.instagram_url));
  }

  // Love Button Listener
  const loveBtn = card.querySelector('[data-store-love-btn]');
  if (loveBtn) {
    loveBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const res = toggleLovedStore(store);
      if (res.isLoved) {
        loveBtn.className = 'w-8 h-8 rounded-full bg-rose-50 border border-rose-300 text-rose-600 backdrop-blur-sm flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-sm z-10 cursor-pointer';
        loveBtn.title = 'In My Loves (tap to remove)';
        loveBtn.innerHTML = `<svg class="w-4 h-4 fill-rose-500 text-rose-500" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>`;
      } else {
        loveBtn.className = 'w-8 h-8 rounded-full bg-white/95 border border-[#DCD6C9] text-[#78716C] hover:text-rose-600 backdrop-blur-sm flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-sm z-10 cursor-pointer';
        loveBtn.title = 'Add to My Loves';
        loveBtn.innerHTML = `<svg class="w-4 h-4 fill-none text-current" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>`;
      }
    });
  }

  const bookBtn = card.querySelector('[data-book-store]');
  if (bookBtn) {
    bookBtn.addEventListener('click', () => onBookSession(store));
  }

  if (typeof onViewStore === 'function') {
    card.querySelectorAll('[data-store-preview], [data-store-title], [data-view-store-card]').forEach((el) => {
      el.addEventListener('click', () => onViewStore(store));
    });
  }

  return card;
}

// Helper to render Top-Left badge (Option 1: Text, Option 2: Rating; invisible if empty)
export function renderStoreBadge(badgeText, ratingValue) {
  const hasText = Boolean(badgeText && String(badgeText).trim().length > 0);
  const ratingNum = typeof ratingValue === 'number' ? ratingValue : parseFloat(ratingValue);
  const hasRating = !isNaN(ratingNum) && ratingNum > 0;

  if (!hasText && !hasRating) {
    return '';
  }

  const cleanText = hasText ? String(badgeText).trim() : '';
  const formattedRating = hasRating ? ratingNum.toFixed(1) : '';

  if (hasRating && hasText) {
    return `
      <span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-black/45 backdrop-blur-md border border-white/20 text-white shadow-sm tracking-wide">
        <span class="inline-flex items-center gap-1 text-[#FBBF24]">
          <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
          <span class="text-white font-bold">${escapeHtml(formattedRating)}</span>
        </span>
        <span class="text-white/40">&middot;</span>
        <span>${escapeHtml(cleanText)}</span>
      </span>
    `;
  }

  if (hasRating && !hasText) {
    return `
      <span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-black/45 backdrop-blur-md border border-white/20 text-white shadow-sm tracking-wide">
        <svg class="w-3.5 h-3.5 fill-[#FBBF24] text-[#FBBF24]" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
        <span class="text-white font-bold">${escapeHtml(formattedRating)}</span>
      </span>
    `;
  }

  return `
    <span class="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold bg-black/45 backdrop-blur-md border border-white/20 text-white shadow-sm tracking-wide">
      ${escapeHtml(cleanText)}
    </span>
  `;
}

// Featured Store Card (Full-bleed card with bottom gradient, bottom city/name, top-left badge/rating, top-right Instagram icon & white '+' button)
// Matching user requirement: top-left supports badge text & rating (invisible if empty), store icon left of '+' at bottom-right.
export function createFeaturedStoreCard(store, onBookSession, onViewStore, options = {}) {
  const isCarousel = Boolean(options.isCarousel);
  const isLoved = isStoreLoved(store.id);
  const effectiveBadge = options.badge !== undefined ? options.badge : (store.badge || '');
  const effectiveRating = options.rating !== undefined ? options.rating : store.rating;
  const badgeHtml = renderStoreBadge(effectiveBadge, effectiveRating);

  const card = document.createElement('article');
  card.className = `group relative rounded-[2rem] sm:rounded-[2.25rem] overflow-hidden min-h-[460px] sm:min-h-[480px] flex flex-col justify-between p-6 sm:p-7 bg-[#141413] shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer select-none ${
    isCarousel ? 'w-[82vw] sm:w-[340px] md:w-auto shrink-0 snap-center' : 'w-full'
  }`;

  card.innerHTML = `
    <!-- Background Image with Bottom-Only Gradient -->
    <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <img
        src="${escapeHtml(store.image)}"
        alt="${escapeHtml(store.name)}"
        loading="lazy"
        class="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
      <!-- Gradient only at bottom (transparent at top, smooth fade up) -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 via-45% to-transparent"></div>
    </div>

    <!-- Top Area: Top-Left Badge (Rating and/or Text, or empty) & Top-Right Actions (Love Heart & Instagram) -->
    <div class="relative z-10 flex items-center justify-between">
      <!-- Top-Left Badge / Rating Container -->
      <div data-store-top-badge>
        ${badgeHtml}
      </div>

      <!-- Top-Right Actions: Loved Heart Toggle & Instagram Pill -->
      <div class="flex items-center gap-2 shrink-0">
        <!-- Love / Favorite Heart Button -->
        <button
          type="button"
          data-store-love-btn
          class="w-9 h-9 rounded-full ${
            isLoved ? 'bg-rose-500 text-white' : 'bg-black/40 text-white hover:text-rose-400'
          } backdrop-blur-md border border-white/25 hover:scale-110 active:scale-95 flex items-center justify-center transition-all shrink-0 shadow-sm cursor-pointer"
          aria-label="${isLoved ? 'Remove from My Loves' : 'Add to My Loves'}"
          title="${isLoved ? 'In My Loves (tap to remove)' : 'Add to My Loves'}"
        >
          <svg class="w-4 h-4 ${isLoved ? 'fill-current' : 'fill-none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        <!-- Instagram Pill Icon Top-Right -->
        <a
          href="${escapeHtml(store.instagram_url)}"
          target="_blank"
          rel="noopener noreferrer"
          data-store-ig
          aria-label="Open ${escapeHtml(store.name)} on Instagram"
          title="Open on Instagram"
          class="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/25 text-white hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all shrink-0 shadow-sm"
        >
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
        </a>
      </div>
    </div>

    <!-- Bottom Content: City · Category & Store Name on the left, Store Icon & White '+' Button on the right -->
    <div class="relative z-10 mt-auto pt-6 flex items-end justify-between gap-3">
      <div class="min-w-0 flex-1 pr-2">
        <p class="text-xs sm:text-sm font-medium tracking-wide text-white/85">
          ${escapeHtml(store.city)} &middot; ${escapeHtml(store.category)}
        </p>
        <h3 class="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug font-sans line-clamp-2" data-store-title>
          ${escapeHtml(store.name)}
        </h3>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <!-- Store Icon Button (Placed Left to '+' Button) -->
        <button
          type="button"
          data-store-profile-btn
          aria-label="View store details for ${escapeHtml(store.name)}"
          title="View Store"
          class="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/25 text-[#10B981] hover:text-[#34D399] hover:bg-black/70 active:scale-95 flex items-center justify-center transition-all shadow-md cursor-pointer"
        >
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"></path>
            <path d="M4 10a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0"></path>
            <path d="M5 12.5V19a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6.5"></path>
            <path d="M10 21v-4a2 2 0 0 1 4 0v4"></path>
          </svg>
        </button>

        <!-- Circular White '+' Button -->
        <button
          type="button"
          data-book-store
          aria-label="Book a session at ${escapeHtml(store.name)}"
          title="Book a Session"
          class="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white text-[#141413] hover:bg-white/90 active:scale-95 flex items-center justify-center transition-all shadow-lg cursor-pointer group/plus"
        >
          <svg class="w-5 h-5 transition-transform duration-200 group-hover/plus:rotate-90" fill="none" stroke="currentColor" stroke-width="2.6" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
    </div>
  `;

  // Love Button Listener
  const loveBtn = card.querySelector('[data-store-love-btn]');
  if (loveBtn) {
    loveBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const res = toggleLovedStore(store);
      if (res.isLoved) {
        loveBtn.className = 'w-9 h-9 rounded-full bg-rose-500 text-white backdrop-blur-md border border-white/25 hover:scale-110 active:scale-95 flex items-center justify-center transition-all shrink-0 shadow-sm cursor-pointer';
        loveBtn.title = 'In My Loves (tap to remove)';
        loveBtn.setAttribute('aria-label', 'Remove from My Loves');
        loveBtn.innerHTML = `<svg class="w-4 h-4 fill-current" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>`;
      } else {
        loveBtn.className = 'w-9 h-9 rounded-full bg-black/40 text-white hover:text-rose-400 backdrop-blur-md border border-white/25 hover:scale-110 active:scale-95 flex items-center justify-center transition-all shrink-0 shadow-sm cursor-pointer';
        loveBtn.title = 'Add to My Loves';
        loveBtn.setAttribute('aria-label', 'Add to My Loves');
        loveBtn.innerHTML = `<svg class="w-4 h-4 fill-none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>`;
      }
    });
  }

  const profileBtn = card.querySelector('[data-store-profile-btn]');
  if (profileBtn) {
    profileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (typeof onViewStore === 'function') {
        onViewStore(store);
      }
    });
  }

  const igLink = card.querySelector('[data-store-ig]');
  if (igLink) {
    igLink.addEventListener('click', (e) => {
      e.stopPropagation();
      openInstagramUrl(e, store.instagram_url);
    });
  }

  const bookBtn = card.querySelector('[data-book-store]');
  if (bookBtn) {
    bookBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      onBookSession(store);
    });
  }

  card.addEventListener('click', () => {
    if (typeof onViewStore === 'function') {
      onViewStore(store);
    }
  });

  return card;
}
