// Migo Connect Page — Shows related friends and community shoppers on MyMigo

import { RELATED_USERS } from '../data/relatedUsers.js';
import { PUBLIC_CONFIG } from '../config.js';
import { escapeHtml } from '../utils/dom.js';

export function renderMigoConnectPage(container, navigate) {
  let searchQuery = '';
  let selectedCity = 'All';
  const connectedUserIds = new Set(
    JSON.parse(localStorage.getItem('mymigo_connected_users') || '["user-1"]')
  );

  container.innerHTML = `
    <div class="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-14 animate-fade-up">
      <!-- Header with Migo Connect Network Icon -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div class="max-w-2xl">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#004643]/10 text-[#004643] mb-3">
            <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5.5 17.5L8.5 7.5L12 12.5L15.5 7.5L18.5 17.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="5.5" cy="17.5" r="2.6" />
              <circle cx="8.5" cy="7.5" r="2.6" />
              <circle cx="15.5" cy="7.5" r="2.6" />
              <circle cx="18.5" cy="17.5" r="2.6" />
            </svg>
            <span>Migo Connect</span>
          </div>
          <h1 class="text-3xl sm:text-5xl font-bold tracking-tight text-[#141413]">
            Friends on MyMigo
          </h1>
          <p class="mt-3 text-base sm:text-lg text-[#57534E] leading-relaxed">
            See your friends and related shoppers who use MyMigo. Discover which stores they love, exchange shopping finds, and shop across cities together.
          </p>
        </div>

        <!-- Invite Friends via WhatsApp -->
        <a
          href="https://api.whatsapp.com/send?text=${encodeURIComponent(
            'Hey! I am using MyMigo to shop from trusted local stores in other cities with live personal assistance. Try it here: ' + window.location.origin
          )}"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold bg-[#004643] text-white hover:bg-[#003634] transition-colors shadow-sm shrink-0"
        >
          <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm5.79 14.05c-.24.67-1.39 1.28-1.92 1.36-.5.08-1.14.12-3.67-.93-3.08-1.28-5.06-4.42-5.21-4.63-.16-.2-1.25-1.67-1.25-3.18 0-1.52.79-2.27 1.07-2.58.28-.31.62-.39.83-.39.2 0 .42 0 .6.01.19.01.44-.07.69.52.25.6.86 2.1.94 2.25.08.16.13.35.03.55-.1.2-.16.32-.31.5-.16.19-.33.42-.47.56-.16.15-.32.32-.14.63.18.31.8 1.32 1.72 2.14 1.18 1.05 2.18 1.38 2.49 1.53.31.16.5.14.68-.08.19-.21.8-.93 1.02-1.25.21-.31.43-.26.72-.16.29.11 1.83.86 2.15 1.02.31.16.52.24.6.37.08.13.08.76-.16 1.43z"/>
          </svg>
          <span>Invite Friends</span>
        </a>
      </div>

      <!-- Filters & Search Bar -->
      <div class="mt-8 bg-white rounded-3xl border border-[#DCD6C9] p-4 sm:p-6 shadow-sm space-y-4">
        <!-- Search Input -->
        <div class="relative flex items-center">
          <svg class="w-5 h-5 text-[#57534E] absolute left-4 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="7"></circle>
            <path stroke-linecap="round" stroke-linejoin="round" d="M20 20l-3.5-3.5"></path>
          </svg>
          <input
            id="connect-search-input"
            type="search"
            placeholder="Search friends by name, interest, or store..."
            autocomplete="off"
            class="w-full pl-12 pr-4 py-3 rounded-2xl border border-[#DCD6C9] bg-[#F0EDE5]/60 text-sm sm:text-base text-[#141413] placeholder:text-[#A8A29E] focus:bg-white transition-colors"
          />
        </div>

        <!-- City Filter Chips -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar flex-nowrap w-full" style="display: flex; flex-wrap: nowrap; overflow-x: auto; -webkit-overflow-scrolling: touch; gap: 8px;">
          <button
            type="button"
            data-city-chip="All"
            style="flex-shrink: 0; flex: 0 0 auto; white-space: nowrap;"
            class="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCity === 'All'
                ? 'bg-[#004643] text-white shadow-sm'
                : 'bg-white border border-[#DCD6C9] text-[#57534E] hover:text-[#004643]'
            }"
          >
            All Cities
          </button>
          ${PUBLIC_CONFIG.cities
            .map(
              (city) => `
            <button
              type="button"
              data-city-chip="${escapeHtml(city)}"
              style="flex-shrink: 0; flex: 0 0 auto; white-space: nowrap;"
              class="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCity === city
                  ? 'bg-[#004643] text-white shadow-sm'
                  : 'bg-white border border-[#DCD6C9] text-[#57534E] hover:text-[#004643]'
              }"
            >
              ${escapeHtml(city)}
            </button>
          `
            )
            .join('')}
        </div>
      </div>

      <!-- Users Grid -->
      <div id="connect-users-grid" class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6"></div>
    </div>
  `;

  const searchInput = container.querySelector('#connect-search-input');
  const gridEl = container.querySelector('#connect-users-grid');

  const renderUsers = () => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = RELATED_USERS.filter((user) => {
      const cityMatch = selectedCity === 'All' || user.city === selectedCity;
      if (!cityMatch) return false;
      if (!q) return true;
      return (
        user.name.toLowerCase().includes(q) ||
        user.city.toLowerCase().includes(q) ||
        user.shoppingInterest.toLowerCase().includes(q) ||
        user.connectionType.toLowerCase().includes(q) ||
        user.favoriteStores.some((s) => s.toLowerCase().includes(q))
      );
    });

    if (filtered.length === 0) {
      gridEl.innerHTML = `
        <div class="col-span-full bg-white rounded-3xl border border-[#DCD6C9] p-12 text-center">
          <div class="w-12 h-12 mx-auto rounded-full bg-[#004643]/10 text-[#004643] flex items-center justify-center mb-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9"/>
              <path stroke-linecap="round" d="M12 8v4m0 4h.01"/>
            </svg>
          </div>
          <p class="text-base font-semibold text-[#141413]">No related friends found</p>
          <p class="mt-2 text-sm text-[#57534E]">Try searching with a different name, city, or interest.</p>
          <button
            type="button"
            id="btn-reset-connect-filters"
            class="mt-4 px-5 py-2.5 rounded-full text-xs font-semibold bg-[#004643] text-white hover:bg-[#003634] transition-colors"
          >
            Show All Friends
          </button>
        </div>
      `;
      gridEl.querySelector('#btn-reset-connect-filters')?.addEventListener('click', () => {
        searchQuery = '';
        selectedCity = 'All';
        if (searchInput) searchInput.value = '';
        updateChips();
        renderUsers();
      });
      return;
    }

    gridEl.innerHTML = filtered
      .map((user) => {
        const isConnected = connectedUserIds.has(user.id);
        return `
        <div class="bg-white rounded-3xl border border-[#DCD6C9] p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <!-- Top: Avatar, Name & Online Indicator -->
            <div class="flex items-start justify-between gap-3">
              <div
                data-profile-nav="/profile?id=${encodeURIComponent(user.id)}"
                class="flex items-center gap-3.5 min-w-0 cursor-pointer group/user"
                title="View ${escapeHtml(user.name)}'s Profile"
              >
                <div class="relative shrink-0 transition-transform group-hover/user:scale-105">
                  <div class="w-12 h-12 rounded-2xl ${user.avatarBg} flex items-center justify-center font-bold text-sm tracking-tight shadow-sm">
                    ${escapeHtml(user.initials)}
                  </div>
                  ${
                    user.isOnline
                      ? `<span class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-500/20" title="Active now"></span>`
                      : ''
                  }
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <h3 class="text-base font-bold text-[#141413] group-hover/user:text-[#004643] transition-colors truncate">
                      ${escapeHtml(user.name)}
                    </h3>
                  </div>
                  <p class="text-xs font-medium text-[#57534E] truncate">
                    ${escapeHtml(user.city)} • <span class="text-[#004643] font-semibold">${escapeHtml(user.connectionType)}</span>
                  </p>
                </div>
              </div>

              <!-- Connect Toggle Button -->
              <button
                type="button"
                data-connect-toggle="${escapeHtml(user.id)}"
                class="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isConnected
                    ? 'bg-[#004643]/10 text-[#004643] border border-[#004643]/30 hover:bg-[#004643]/20'
                    : 'bg-[#004643] text-white hover:bg-[#003634] shadow-sm'
                }"
              >
                ${isConnected ? 'Connected ✓' : '+ Connect'}
              </button>
            </div>

            <!-- Shopping Interest Badge -->
            <div class="mt-4 p-3 rounded-2xl bg-[#F0EDE5]/70 border border-[#DCD6C9]/60">
              <p class="text-[11px] font-semibold uppercase tracking-wider text-[#71717A] mb-1">Looking for</p>
              <p class="text-xs sm:text-sm text-[#141413] font-medium leading-snug">
                "${escapeHtml(user.shoppingInterest)}"
              </p>
            </div>

            <!-- Favorite Stores Tag Chips -->
            <div class="mt-3.5 flex flex-wrap items-center gap-1.5">
              <span class="text-[11px] font-medium text-[#71717A]">Loves:</span>
              ${user.favoriteStores
                .map(
                  (storeName) => `
                <span class="px-2.5 py-1 rounded-lg bg-white border border-[#DCD6C9] text-[11px] font-medium text-[#141413]">
                  ${escapeHtml(storeName)}
                </span>
              `
                )
                .join('')}
            </div>
          </div>

          <!-- Bottom: Recent Activity & Action -->
          <div class="mt-5 pt-3.5 border-t border-[#DCD6C9]/60 flex items-center justify-between text-xs text-[#57534E]">
            <span class="inline-flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full ${user.isOnline ? 'bg-emerald-500' : 'bg-[#A8A29E]'}"></span>
              ${escapeHtml(user.recentActivity)}
            </span>

            <button
              type="button"
              data-profile-nav="/profile?id=${encodeURIComponent(user.id)}"
              class="font-semibold text-[#004643] hover:underline inline-flex items-center gap-1 group cursor-pointer"
            >
              <span>View Profile</span>
              <span class="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
            </button>
          </div>
        </div>
      `;
      })
      .join('');

    // Attach Connect Toggle handlers
    gridEl.querySelectorAll('[data-connect-toggle]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const userId = btn.getAttribute('data-connect-toggle');
        if (connectedUserIds.has(userId)) {
          connectedUserIds.delete(userId);
        } else {
          connectedUserIds.add(userId);
        }
        localStorage.setItem(
          'mymigo_connected_users',
          JSON.stringify(Array.from(connectedUserIds))
        );
        renderUsers();
      });
    });

    // Attach View Profile navigation buttons
    gridEl.querySelectorAll('[data-profile-nav]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        navigate(btn.getAttribute('data-profile-nav'));
      });
    });
  };

  const updateChips = () => {
    container.querySelectorAll('[data-city-chip]').forEach((chip) => {
      const city = chip.getAttribute('data-city-chip');
      const isActive = city === selectedCity;
      chip.style.flexShrink = '0';
      chip.style.flex = '0 0 auto';
      chip.style.whiteSpace = 'nowrap';
      chip.className = `shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
        isActive
          ? 'bg-[#004643] text-white shadow-sm'
          : 'bg-white border border-[#DCD6C9] text-[#57534E] hover:text-[#004643]'
      }`;
    });
  };

  searchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderUsers();
  });

  container.querySelectorAll('[data-city-chip]').forEach((chip) => {
    chip.addEventListener('click', () => {
      selectedCity = chip.getAttribute('data-city-chip');
      updateChips();
      renderUsers();
    });
  });

  renderUsers();
}
