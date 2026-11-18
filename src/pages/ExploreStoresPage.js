// Explore Stores Page — Displays Active stores with modern Search, City & Category Filter Chips, and Auto-suggestions

import { PUBLIC_CONFIG } from '../config.js';
import { fetchActiveStores, clearStoresCache, matchesStoreCategory } from '../services/storeService.js';
import { createStoreCard, createFeaturedStoreCard } from '../components/StoreCard.js';
import { openBookingModal } from '../components/BookingModal.js';
import { escapeHtml } from '../utils/dom.js';

export async function renderExploreStoresPage(container, navigate) {
  let selectedCity = 'All';
  let selectedCategory = 'All';
  let searchQuery = '';
  let activeStores = [];

  container.innerHTML = `
    <div class="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-16 animate-fade-up">
      <!-- Header -->
      <div class="max-w-2xl">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#004643]/10 text-[#004643] mb-3">
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span>Trusted Directory</span>
        </div>
        <h1 class="text-3xl sm:text-5xl font-bold tracking-tight text-[#141413]">
          Explore Stores
        </h1>
        <p class="mt-3 text-base sm:text-lg text-[#57534E] leading-relaxed">
          Browse verified boutiques, weavers, and specialty stores across cities. Choose a store and book your shopping assistance session.
        </p>
      </div>

      <!-- Modern Search & Suggestions Filter Bar -->
      <div class="mt-8 bg-white rounded-3xl border border-[#DCD6C9] p-4 sm:p-6 shadow-sm space-y-4 relative">
        <!-- Search Input with Auto-Suggestions -->
        <div class="relative">
          <div class="relative flex items-center">
            <svg class="w-5 h-5 text-[#57534E] absolute left-4 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7"></circle>
              <path stroke-linecap="round" stroke-linejoin="round" d="M20 20l-3.5-3.5"></path>
            </svg>
            <input
              id="store-search-input"
              type="text"
              inputmode="search"
              placeholder="Search by store name, city, category, or collection..."
              autocomplete="off"
              class="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-[#DCD6C9] bg-[#F0EDE5]/60 text-sm sm:text-base text-[#141413] placeholder:text-[#A8A29E] focus:bg-white focus:border-[#004643] transition-all shadow-xs"
            />
            <button
              id="clear-store-search-btn"
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

          <!-- Dynamic Suggestions Dropdown (Cities, Categories & Store Names) -->
          <div
            id="store-suggestions-dropdown"
            class="hidden absolute left-0 right-0 top-full mt-2 z-30 bg-white rounded-2xl border border-[#DCD6C9] shadow-xl overflow-hidden divide-y divide-[#E7E3D9] max-h-80 overflow-y-auto"
          >
            <!-- Suggestions rendered via JavaScript -->
          </div>
        </div>

        <!-- City Suggestions Chips -->
        <div class="space-y-1.5">
          <p class="text-[11px] font-bold uppercase tracking-wider text-[#78716C] px-1">Filter by City</p>
          <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar flex-nowrap w-full" style="display: flex; flex-wrap: nowrap; overflow-x: auto; -webkit-overflow-scrolling: touch; gap: 8px;">
            <button
              type="button"
              data-store-city-chip="All"
              style="flex-shrink: 0; flex: 0 0 auto; white-space: nowrap;"
              class="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors bg-[#004643] text-white shadow-sm"
            >
              All Cities
            </button>
            ${PUBLIC_CONFIG.cities
              .map(
                (city) => `
              <button
                type="button"
                data-store-city-chip="${escapeHtml(city)}"
                style="flex-shrink: 0; flex: 0 0 auto; white-space: nowrap;"
                class="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors bg-white border border-[#DCD6C9] text-[#57534E] hover:text-[#004643] hover:border-[#004643]"
              >
                ${escapeHtml(city)}
              </button>
            `
              )
              .join('')}
          </div>
        </div>

        <!-- Category Suggestions Chips (Sarees, Tops, Jeans, Jewellery, Heels, Others) -->
        <div class="space-y-1.5 pt-1 border-t border-[#E7E3D9]/60">
          <p class="text-[11px] font-bold uppercase tracking-wider text-[#78716C] px-1">Filter by Category</p>
          <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar flex-nowrap w-full" style="display: flex; flex-wrap: nowrap; overflow-x: auto; -webkit-overflow-scrolling: touch; gap: 8px;">
            <button
              type="button"
              data-store-cat-chip="All"
              style="flex-shrink: 0; flex: 0 0 auto; white-space: nowrap;"
              class="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors bg-[#004643] text-white shadow-sm"
            >
              All Categories
            </button>
            ${PUBLIC_CONFIG.categories
              .map(
                (cat) => `
              <button
                type="button"
                data-store-cat-chip="${escapeHtml(cat)}"
                style="flex-shrink: 0; flex: 0 0 auto; white-space: nowrap;"
                class="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors bg-white border border-[#DCD6C9] text-[#57534E] hover:text-[#004643] hover:border-[#004643]"
              >
                ${escapeHtml(cat)}
              </button>
            `
              )
              .join('')}
          </div>
        </div>

        <!-- Summary & Reset -->
        <div class="flex items-center justify-between pt-1 border-t border-[#E7E3D9]/60 text-xs text-[#57534E]">
          <span id="stores-count">Loading stores...</span>
          <button
            type="button"
            id="reset-store-filters-btn"
            class="hidden font-semibold text-[#004643] hover:underline"
          >
            Reset filters
          </button>
        </div>
      </div>

      <!-- Stores Grid -->
      <div id="stores-grid" class="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        <div class="col-span-full py-16 text-center text-sm text-[#57534E]">Loading active stores...</div>
      </div>
    </div>
  `;

  const searchInput = container.querySelector('#store-search-input');
  const clearSearchBtn = container.querySelector('#clear-store-search-btn');
  const suggestionsDropdown = container.querySelector('#store-suggestions-dropdown');
  const countEl = container.querySelector('#stores-count');
  const resetBtn = container.querySelector('#reset-store-filters-btn');
  const gridEl = container.querySelector('#stores-grid');

  const updateCityChips = () => {
    container.querySelectorAll('[data-store-city-chip]').forEach((chip) => {
      const city = chip.getAttribute('data-store-city-chip');
      const isActive = city === selectedCity;
      chip.style.flexShrink = '0';
      chip.style.flex = '0 0 auto';
      chip.style.whiteSpace = 'nowrap';
      chip.className = `shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
        isActive
          ? 'bg-[#004643] text-white shadow-sm'
          : 'bg-white border border-[#DCD6C9] text-[#57534E] hover:text-[#004643] hover:border-[#004643]'
      }`;
    });
  };

  const updateCategoryChips = () => {
    container.querySelectorAll('[data-store-cat-chip]').forEach((chip) => {
      const cat = chip.getAttribute('data-store-cat-chip');
      const isActive = cat === selectedCategory;
      chip.style.flexShrink = '0';
      chip.style.flex = '0 0 auto';
      chip.style.whiteSpace = 'nowrap';
      chip.className = `shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
        isActive
          ? 'bg-[#004643] text-white shadow-sm'
          : 'bg-white border border-[#DCD6C9] text-[#57534E] hover:text-[#004643] hover:border-[#004643]'
      }`;
    });
  };

  const renderSuggestions = () => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      // Show Quick Suggestions: Cities, Categories, & Featured Stores
      const suggestedCities = PUBLIC_CONFIG.cities.slice(0, 5);
      const suggestedCategories = PUBLIC_CONFIG.categories.slice(0, 5);
      const featuredStores = activeStores.slice(0, 5);

      suggestionsDropdown.innerHTML = `
        <div class="p-3 bg-[#F0EDE5]/40 space-y-2">
          <div>
            <p class="text-[11px] font-bold uppercase tracking-wider text-[#78716C] mb-1.5 px-1">Suggested Categories</p>
            <div class="flex flex-wrap gap-1.5">
              ${suggestedCategories
                .map(
                  (cat) => `
                <button
                  type="button"
                  data-suggest-category="${escapeHtml(cat)}"
                  class="px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-[#DCD6C9] text-[#141413] hover:bg-[#004643] hover:text-white transition-colors"
                >
                  🏷️ ${escapeHtml(cat)}
                </button>
              `
                )
                .join('')}
            </div>
          </div>

          <div>
            <p class="text-[11px] font-bold uppercase tracking-wider text-[#78716C] mb-1.5 px-1">Suggested Cities</p>
            <div class="flex flex-wrap gap-1.5">
              ${suggestedCities
                .map(
                  (c) => `
                <button
                  type="button"
                  data-suggest-city="${escapeHtml(c)}"
                  class="px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-[#DCD6C9] text-[#141413] hover:bg-[#004643] hover:text-white transition-colors"
                >
                  📍 ${escapeHtml(c)}
                </button>
              `
                )
                .join('')}
            </div>
          </div>
        </div>

        <div class="p-2">
          <p class="text-[11px] font-bold uppercase tracking-wider text-[#78716C] mb-1.5 px-2">Featured Stores</p>
          ${featuredStores
            .map(
              (s) => `
            <button
              type="button"
              data-suggest-store="${escapeHtml(s.name)}"
              class="w-full text-left px-2.5 py-2 rounded-xl text-xs hover:bg-[#F0EDE5] flex items-center justify-between transition-colors"
            >
              <span class="font-semibold text-[#141413]">🏬 ${escapeHtml(s.name)}</span>
              <span class="text-[11px] text-[#78716C]">${escapeHtml(s.city)} • ${escapeHtml(s.category)}</span>
            </button>
          `
            )
            .join('')}
        </div>
      `;
      attachSuggestionEvents();
      suggestionsDropdown.classList.remove('hidden');
      return;
    }

    // Filter matching cities
    const matchingCities = PUBLIC_CONFIG.cities
      .filter((city) => city.toLowerCase().includes(q))
      .slice(0, 4);

    // Filter matching categories
    const matchingCategories = PUBLIC_CONFIG.categories
      .filter((cat) => cat.toLowerCase().includes(q))
      .slice(0, 4);

    // Filter matching stores
    const matchingStores = activeStores
      .filter((store) => {
        return (
          store.name.toLowerCase().includes(q) ||
          store.category.toLowerCase().includes(q) ||
          store.description.toLowerCase().includes(q)
        );
      })
      .slice(0, 5);

    if (matchingCities.length === 0 && matchingCategories.length === 0 && matchingStores.length === 0) {
      suggestionsDropdown.innerHTML = `
        <div class="p-4 text-center text-xs text-[#57534E]">
          No city, category, or store matches "<strong>${escapeHtml(searchQuery)}</strong>". Press enter to search all fields.
        </div>
      `;
      suggestionsDropdown.classList.remove('hidden');
      return;
    }

    suggestionsDropdown.innerHTML = `
      ${
        matchingCategories.length > 0
          ? `
        <div class="p-2 bg-[#F0EDE5]/40">
          <p class="text-[11px] font-bold uppercase tracking-wider text-[#78716C] mb-1 px-2">Suggested Categories (${matchingCategories.length})</p>
          ${matchingCategories
            .map((cat) => {
              const count = activeStores.filter((s) => s.category.toLowerCase() === cat.toLowerCase()).length;
              return `
              <button
                type="button"
                data-suggest-category="${escapeHtml(cat)}"
                class="w-full text-left px-2.5 py-2 rounded-xl text-xs hover:bg-[#F0EDE5] flex items-center justify-between transition-colors cursor-pointer"
              >
                <span class="font-semibold text-[#141413]">🏷️ ${escapeHtml(cat)}</span>
                <span class="text-[11px] text-[#004643] font-medium">${count} ${count === 1 ? 'store' : 'stores'}</span>
              </button>
            `;
            })
            .join('')}
        </div>
      `
          : ''
      }
      ${
        matchingCities.length > 0
          ? `
        <div class="p-2 bg-[#F0EDE5]/20">
          <p class="text-[11px] font-bold uppercase tracking-wider text-[#78716C] mb-1 px-2">Suggested Cities (${matchingCities.length})</p>
          ${matchingCities
            .map((city) => {
              const storeCount = activeStores.filter((s) => s.city.toLowerCase() === city.toLowerCase()).length;
              return `
              <button
                type="button"
                data-suggest-city="${escapeHtml(city)}"
                class="w-full text-left px-2.5 py-2 rounded-xl text-xs hover:bg-[#F0EDE5] flex items-center justify-between transition-colors cursor-pointer"
              >
                <span class="font-semibold text-[#141413]">📍 ${escapeHtml(city)}</span>
                <span class="text-[11px] text-[#004643] font-medium">${storeCount} ${storeCount === 1 ? 'store' : 'stores'}</span>
              </button>
            `;
            })
            .join('')}
        </div>
      `
          : ''
      }
      ${
        matchingStores.length > 0
          ? `
        <div class="p-2">
          <p class="text-[11px] font-bold uppercase tracking-wider text-[#78716C] mb-1 px-2">Suggested Stores (${matchingStores.length})</p>
          ${matchingStores
            .map(
              (store) => `
            <button
              type="button"
              data-suggest-store="${escapeHtml(store.name)}"
              class="w-full text-left px-2.5 py-2 rounded-xl text-xs hover:bg-[#F0EDE5] flex items-center justify-between transition-colors cursor-pointer"
            >
              <div class="min-w-0 pr-2">
                <span class="font-semibold text-[#141413] block truncate">🏬 ${escapeHtml(store.name)}</span>
                <span class="text-[11px] text-[#78716C] block truncate">${escapeHtml(store.category)}</span>
              </div>
              <span class="text-[11px] text-[#57534E] shrink-0 font-medium">${escapeHtml(store.city)}</span>
            </button>
          `
            )
            .join('')}
        </div>
      `
          : ''
      }
    `;

    attachSuggestionEvents();
    suggestionsDropdown.classList.remove('hidden');
  };

  const attachSuggestionEvents = () => {
    suggestionsDropdown.querySelectorAll('[data-suggest-category]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-suggest-category');
        selectedCategory = cat;
        searchQuery = '';
        if (searchInput) searchInput.value = '';
        clearSearchBtn.classList.add('hidden');
        suggestionsDropdown.classList.add('hidden');
        updateCategoryChips();
        renderGrid();
      });
    });

    suggestionsDropdown.querySelectorAll('[data-suggest-city]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const city = btn.getAttribute('data-suggest-city');
        selectedCity = city;
        searchQuery = '';
        if (searchInput) searchInput.value = '';
        clearSearchBtn.classList.add('hidden');
        suggestionsDropdown.classList.add('hidden');
        updateCityChips();
        renderGrid();
      });
    });

    suggestionsDropdown.querySelectorAll('[data-suggest-store]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const storeName = btn.getAttribute('data-suggest-store');
        searchQuery = storeName;
        selectedCity = 'All';
        selectedCategory = 'All';
        if (searchInput) searchInput.value = storeName;
        clearSearchBtn.classList.remove('hidden');
        suggestionsDropdown.classList.add('hidden');
        updateCityChips();
        updateCategoryChips();
        renderGrid();
      });
    });
  };

  const renderGrid = () => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = activeStores.filter((store) => {
      if (store.active !== true) return false;

      // City filter
      const cityMatch =
        selectedCity === 'All' ||
        store.city.toLowerCase() === selectedCity.toLowerCase();
      if (!cityMatch) return false;

      // Category filter
      if (!matchesStoreCategory(store, selectedCategory)) return false;

      // Search query filter
      if (!q) return true;
      return (
        store.name.toLowerCase().includes(q) ||
        store.city.toLowerCase().includes(q) ||
        store.category.toLowerCase().includes(q) ||
        store.description.toLowerCase().includes(q) ||
        (store.handle && store.handle.toLowerCase().includes(q))
      );
    });

    const isFiltered = selectedCity !== 'All' || selectedCategory !== 'All' || q.length > 0;
    resetBtn.classList.toggle('hidden', !isFiltered);

    const filterLabels = [];
    if (selectedCity !== 'All') filterLabels.push(selectedCity);
    if (selectedCategory !== 'All') filterLabels.push(selectedCategory);
    const filterContext = filterLabels.length > 0 ? ` in ${filterLabels.join(' • ')}` : '';

    countEl.textContent = `${filtered.length} ${filtered.length === 1 ? 'store' : 'stores'} found${filterContext}`;

    gridEl.innerHTML = '';
    if (filtered.length === 0) {
      gridEl.innerHTML = `
        <div class="col-span-full bg-white rounded-3xl border border-[#DCD6C9] p-12 text-center">
          <div class="w-12 h-12 mx-auto rounded-full bg-[#004643]/10 text-[#004643] flex items-center justify-center mb-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7"></circle>
              <path stroke-linecap="round" stroke-linejoin="round" d="M20 20l-3.5-3.5"></path>
            </svg>
          </div>
          <p class="text-base font-semibold text-[#141413]">No stores match your search.</p>
          <p class="mt-2 text-sm text-[#57534E]">
            ${
              searchQuery
                ? `No results for "${escapeHtml(searchQuery)}".`
                : 'No stores available for this combination.'
            } Try adjusting your city, category, or search term.
          </p>
          <button
            type="button"
            id="empty-reset-btn"
            class="mt-5 inline-flex items-center justify-center px-6 py-2.5 rounded-full text-xs font-semibold bg-[#004643] text-white hover:bg-[#003634] transition-colors shadow-sm"
          >
            Show All Stores
          </button>
        </div>
      `;
      gridEl.querySelector('#empty-reset-btn')?.addEventListener('click', () => {
        resetAllFilters();
      });
      return;
    }

    filtered.forEach((store) => {
      gridEl.appendChild(
        createFeaturedStoreCard(
          store,
          (selected) => {
            openBookingModal(selected);
          },
          (selected) => {
            navigate(`/store/${encodeURIComponent(selected.id)}`);
          },
          {
            isCarousel: false,
            badge: store.badge !== undefined ? store.badge : '',
            rating: store.rating !== undefined ? store.rating : null,
          }
        )
      );
    });
  };

  const resetAllFilters = () => {
    selectedCity = 'All';
    selectedCategory = 'All';
    searchQuery = '';
    if (searchInput) searchInput.value = '';
    clearSearchBtn.classList.add('hidden');
    suggestionsDropdown.classList.add('hidden');
    updateCityChips();
    updateCategoryChips();
    renderGrid();
  };

  // Search input events
  searchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    clearSearchBtn.classList.toggle('hidden', searchQuery.length === 0);
    renderSuggestions();
    renderGrid();
  });

  searchInput?.addEventListener('focus', () => {
    renderSuggestions();
  });

  clearSearchBtn?.addEventListener('click', () => {
    searchQuery = '';
    searchInput.value = '';
    clearSearchBtn.classList.add('hidden');
    suggestionsDropdown.classList.add('hidden');
    renderGrid();
  });

  // Close suggestions on outside click
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) return;
    if (!searchInput?.contains(e.target) && !suggestionsDropdown?.contains(e.target)) {
      suggestionsDropdown?.classList.add('hidden');
    }
  });

  // City chips click handling
  container.querySelectorAll('[data-store-city-chip]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const city = chip.getAttribute('data-store-city-chip');
      selectedCity = selectedCity === city && city !== 'All' ? 'All' : city;
      updateCityChips();
      renderGrid();
    });
  });

  // Category chips click handling
  container.querySelectorAll('[data-store-cat-chip]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const cat = chip.getAttribute('data-store-cat-chip');
      selectedCategory = selectedCategory === cat && cat !== 'All' ? 'All' : cat;
      updateCategoryChips();
      renderGrid();
    });
  });

  resetBtn?.addEventListener('click', () => {
    resetAllFilters();
  });

  try {
    clearStoresCache();
    activeStores = await fetchActiveStores();
    renderGrid();
  } catch {
    gridEl.innerHTML = `
      <div class="col-span-full bg-white rounded-3xl border border-[#DCD6C9] p-10 text-center">
        <p class="text-sm font-semibold text-[#141413]">Unable to load stores right now.</p>
        <p class="mt-1 text-sm text-[#57534E]">Please check that the MyMigo server is running and refresh.</p>
      </div>
    `;
  }
}
