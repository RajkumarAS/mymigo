// Search Page — Instagram-style quick search across Active Stores, Cities, Categories & Reels

import { PUBLIC_CONFIG } from '../config.js';
import { INSTAGRAM_VIDEOS } from '../data/instagramVideos.js';
import { fetchActiveStores, DEFAULT_SEARCH_CATEGORIES, matchesStoreCategory } from '../services/storeService.js';
import { escapeHtml } from '../utils/dom.js';

export async function renderSearchPage(container, navigate) {
  let activeStores = [];
  try {
    activeStores = await fetchActiveStores();
  } catch {
    activeStores = [];
  }

  let query = '';
  let selectedCategory = 'All';

  container.innerHTML = `
    <div class="max-w-3xl mx-auto px-4 sm:px-8 py-6 sm:py-12 animate-fade-up">
      <div class="sticky top-[65px] z-20 bg-[#F0EDE5]/95 backdrop-blur-md pt-1 pb-4">
        <label for="global-search-input" class="sr-only">Search stores, cities, or categories</label>
        <div class="relative flex items-center">
          <svg class="w-5 h-5 text-[#57534E] absolute left-4 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="7"></circle>
            <path stroke-linecap="round" stroke-linejoin="round" d="M20 20l-3.5-3.5"></path>
          </svg>
          <input
            id="global-search-input"
            type="text"
            inputmode="search"
            placeholder="Search stores, cities, sarees, jewellery..."
            autocomplete="off"
            class="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-[#DCD6C9] bg-white text-sm sm:text-base text-[#141413] placeholder:text-[#A8A29E] shadow-sm focus:border-[#004643] outline-none"
          />
          <button
            id="clear-global-search-btn"
            type="button"
            class="hidden absolute right-3.5 p-1 text-[#78716C] hover:text-[#141413] transition-colors"
            aria-label="Clear search"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Default Categories Shortcut Filter Pills -->
        <div class="mt-3 space-y-1">
          <div class="flex items-center justify-between px-1">
            <span class="text-[11px] font-bold uppercase tracking-wider text-[#78716C]">Categories</span>
            ${
              selectedCategory !== 'All'
                ? `<button type="button" id="clear-cat-filter" class="text-[11px] font-semibold text-[#004643] hover:underline">Reset category</button>`
                : ''
            }
          </div>
          <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar flex-nowrap w-full" style="display: flex; flex-wrap: nowrap; overflow-x: auto; -webkit-overflow-scrolling: touch; gap: 8px;">
            <button
              type="button"
              data-search-cat="All"
              style="flex-shrink: 0; flex: 0 0 auto; white-space: nowrap;"
              class="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer shadow-2xs ${
                selectedCategory === 'All'
                  ? 'bg-[#004643] text-white'
                  : 'bg-white border border-[#DCD6C9] text-[#57534E] hover:text-[#004643] hover:border-[#004643]'
              }"
            >
              All Categories
            </button>
            ${DEFAULT_SEARCH_CATEGORIES.map(
              (cat) => `
              <button
                type="button"
                data-search-cat="${escapeHtml(cat)}"
                style="flex-shrink: 0; flex: 0 0 auto; white-space: nowrap;"
                class="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer shadow-2xs ${
                  selectedCategory === cat
                    ? 'bg-[#004643] text-white'
                    : 'bg-white border border-[#DCD6C9] text-[#57534E] hover:text-[#004643] hover:border-[#004643]'
                }"
              >
                ${escapeHtml(cat)}
              </button>
            `
            ).join('')}
          </div>
        </div>

        <!-- Quick City Chips -->
        <div class="mt-2.5 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar flex-nowrap w-full" style="display: flex; flex-wrap: nowrap; overflow-x: auto; -webkit-overflow-scrolling: touch; gap: 8px;">
          ${PUBLIC_CONFIG.cities
            .map(
              (city) => `
            <button
              type="button"
              data-quick-query="${escapeHtml(city)}"
              style="flex-shrink: 0; flex: 0 0 auto; white-space: nowrap;"
              class="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white border border-[#DCD6C9] text-[#57534E] hover:text-[#004643] hover:border-[#004643] whitespace-nowrap transition-colors shadow-2xs cursor-pointer"
            >
              ${escapeHtml(city)}
            </button>
          `
            )
            .join('')}
        </div>
      </div>

      <div id="search-results" class="mt-2 space-y-8"></div>
    </div>
  `;

  const inputEl = container.querySelector('#global-search-input');
  const resultsEl = container.querySelector('#search-results');

  const renderResults = () => {
    const q = query.trim().toLowerCase();

    const matchedStores = activeStores.filter((store) => {
      if (store.active !== true) return false;
      if (!matchesStoreCategory(store, selectedCategory)) return false;
      if (!q) return true;
      return (
        store.name.toLowerCase().includes(q) ||
        store.city.toLowerCase().includes(q) ||
        store.category.toLowerCase().includes(q) ||
        store.description.toLowerCase().includes(q) ||
        (store.handle && store.handle.toLowerCase().includes(q))
      );
    });

    const matchedVideos = INSTAGRAM_VIDEOS.filter((v) => {
      if (selectedCategory !== 'All') {
        const storeForVideo = activeStores.find((s) => s.id === v.storeId);
        if (storeForVideo && !matchesStoreCategory(storeForVideo, selectedCategory)) {
          return false;
        }
      }
      if (!q) return true;
      return (
        v.storeName.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q) ||
        v.title.toLowerCase().includes(q) ||
        (v.handle && v.handle.toLowerCase().includes(q))
      );
    });

    if (matchedStores.length === 0 && matchedVideos.length === 0) {
      resultsEl.innerHTML = `
        <div class="bg-white rounded-3xl border border-[#DCD6C9] p-10 text-center">
          <p class="text-sm font-semibold text-[#141413]">No matching stores or videos found.</p>
          <p class="mt-1 text-xs text-[#57534E]">Try searching for Coimbatore, Sarees, Jewellery, or Kalyani Cotton.</p>
        </div>
      `;
      return;
    }

    resultsEl.innerHTML = `
      ${
        matchedStores.length > 0
          ? `
        <section>
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-xs font-semibold uppercase tracking-wider text-[#57534E]">
              Stores (${matchedStores.length})
            </h2>
          </div>
          <div class="bg-white rounded-3xl border border-[#DCD6C9] divide-y divide-[#DCD6C9] overflow-hidden">
            ${matchedStores
              .map(
                (store) => `
              <div class="p-4 flex items-center justify-between gap-3 hover:bg-[#F0EDE5] transition-colors">
                <button
                  type="button"
                  data-open-store="${escapeHtml(store.id)}"
                  class="flex items-center gap-3.5 min-w-0 text-left flex-1"
                >
                  <div class="w-11 h-11 rounded-full bg-[#E7E3D9] border border-[#DCD6C9] flex items-center justify-center text-sm font-bold text-[#141413] shrink-0">
                    ${escapeHtml(store.name.slice(0, 1).toUpperCase())}
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-[#141413] truncate">${escapeHtml(store.name)}</p>
                    <p class="text-xs text-[#57534E] truncate">${escapeHtml(store.city)} • ${escapeHtml(store.category)}</p>
                  </div>
                </button>

                <button
                  type="button"
                  data-quick-book="${escapeHtml(store.id)}"
                  data-quick-city="${escapeHtml(store.city)}"
                  class="px-3.5 py-2 rounded-full text-xs font-semibold bg-[#004643] text-white hover:bg-[#003634] transition-colors shrink-0 shadow-sm"
                >
                  Book
                </button>
              </div>
            `
              )
              .join('')}
          </div>
        </section>
      `
          : ''
      }

      ${
        matchedVideos.length > 0
          ? `
        <section>
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-xs font-semibold uppercase tracking-wider text-[#57534E]">
              Store Finds (${matchedVideos.length})
            </h2>
            <a href="#/finds" data-search-videos class="text-xs font-semibold text-[#004643] hover:underline">
              Open Finds
            </a>
          </div>
          <div class="bg-white rounded-3xl border border-[#DCD6C9] divide-y divide-[#DCD6C9] overflow-hidden">
            ${matchedVideos
              .map(
                (video) => `
              <button
                type="button"
                data-open-video-store="${escapeHtml(video.storeId)}"
                class="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-[#F0EDE5] transition-colors"
              >
                <div class="flex items-center gap-3.5 min-w-0">
                  <div class="w-11 h-11 rounded-2xl bg-[#004643]/10 text-[#004643] flex items-center justify-center shrink-0">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                      <rect x="2" y="3" width="20" height="18" rx="4"></rect>
                      <path d="M10 9l5 3-5 3V9z" fill="currentColor" stroke="none"></path>
                    </svg>
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-[#141413] truncate">${escapeHtml(video.title)}</p>
                    <p class="text-xs text-[#57534E] truncate">${escapeHtml(video.storeName)} • ${escapeHtml(video.city)}</p>
                  </div>
                </div>
                <svg class="w-4 h-4 text-[#A8A29E] shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            `
              )
              .join('')}
          </div>
        </section>
      `
          : ''
      }
    `;

    resultsEl.querySelectorAll('[data-open-store]').forEach((btn) => {
      btn.addEventListener('click', () => {
        navigate(`/store/${encodeURIComponent(btn.getAttribute('data-open-store'))}`);
      });
    });

    resultsEl.querySelectorAll('[data-quick-book]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const storeId = btn.getAttribute('data-quick-book');
        const city = btn.getAttribute('data-quick-city');
        navigate(`/book?store=${encodeURIComponent(storeId)}&city=${encodeURIComponent(city)}`);
      });
    });

    resultsEl.querySelectorAll('[data-open-video-store]').forEach((btn) => {
      btn.addEventListener('click', () => {
        navigate(`/store/${encodeURIComponent(btn.getAttribute('data-open-video-store'))}`);
      });
    });

    resultsEl.querySelector('[data-search-videos]')?.addEventListener('click', (e) => {
      e.preventDefault();
      navigate('/finds');
    });
  };

  const updateCategoryChips = () => {
    container.querySelectorAll('[data-search-cat]').forEach((chip) => {
      const val = chip.getAttribute('data-search-cat');
      const isActive = selectedCategory === val;
      chip.style.flexShrink = '0';
      chip.style.flex = '0 0 auto';
      chip.style.whiteSpace = 'nowrap';
      chip.className = `shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer shadow-2xs ${
        isActive
          ? 'bg-[#004643] text-white border-transparent'
          : 'bg-white border border-[#DCD6C9] text-[#57534E] hover:text-[#004643] hover:border-[#004643]'
      }`;
    });

    const resetBtn = container.querySelector('#clear-cat-filter');
    if (resetBtn) {
      resetBtn.classList.toggle('hidden', selectedCategory === 'All');
    }
  };

  const updateCityChips = () => {
    container.querySelectorAll('[data-search-cat]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const cat = chip.getAttribute('data-search-cat');
      selectedCategory = cat;
      updateCategoryChips();
      renderResults();
    });
  });

  container.querySelector('#clear-cat-filter')?.addEventListener('click', () => {
    selectedCategory = 'All';
    updateCategoryChips();
    renderResults();
  });

  container.querySelectorAll('[data-quick-query]').forEach((chip) => {
      const val = chip.getAttribute('data-quick-query');
      const isActive = query.trim().toLowerCase() === val.toLowerCase();
      chip.style.flexShrink = '0';
      chip.style.flex = '0 0 auto';
      chip.style.whiteSpace = 'nowrap';
      chip.className = `shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors shadow-2xs ${
        isActive
          ? 'bg-[#004643] text-white border-transparent'
          : 'bg-white border border-[#DCD6C9] text-[#57534E] hover:text-[#004643] hover:border-[#004643]'
      }`;
    });
  };

  const clearBtn = container.querySelector('#clear-global-search-btn');

  inputEl.addEventListener('input', (e) => {
    query = e.target.value;
    clearBtn?.classList.toggle('hidden', query.length === 0);
    updateCityChips();
    renderResults();
  });

  clearBtn?.addEventListener('click', () => {
    query = '';
    inputEl.value = '';
    clearBtn.classList.add('hidden');
    updateCityChips();
    renderResults();
  });

  container.querySelectorAll('[data-search-cat]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const cat = chip.getAttribute('data-search-cat');
      selectedCategory = cat;
      updateCategoryChips();
      renderResults();
    });
  });

  container.querySelector('#clear-cat-filter')?.addEventListener('click', () => {
    selectedCategory = 'All';
    updateCategoryChips();
    renderResults();
  });

  container.querySelectorAll('[data-quick-query]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const val = chip.getAttribute('data-quick-query');
      query = query.toLowerCase() === val.toLowerCase() ? '' : val;
      inputEl.value = query;
      updateCityChips();
      renderResults();
    });
  });

  renderResults();
  // Focus search input smoothly on mobile/desktop
  window.setTimeout(() => inputEl.focus({ preventScroll: true }), 80);
}
