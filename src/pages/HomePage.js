// Home Page — Hero Banner, Featured Stores (Full-bleed Cards matching user reference), Market Finds, Contact

import { PUBLIC_CONFIG } from '../config.js';
import { INSTAGRAM_VIDEOS } from '../data/instagramVideos.js';
import { fetchVideos } from '../services/videoService.js';
import { fetchActiveStores } from '../services/storeService.js';
import { fetchHomepageConfig, DEFAULT_HOMEPAGE_CONFIG } from '../services/homepageService.js';
import { openInstagramUrl } from '../services/instagramHelper.js';
import { createFeaturedStoreCard } from '../components/StoreCard.js';
import { createInstagramCard } from '../components/InstagramCard.js';
import { openBookingModal } from '../components/BookingModal.js';
import { escapeHtml } from '../utils/dom.js';

export async function renderHomePage(container, navigate) {
  // Load dynamic homepage config
  let config = DEFAULT_HOMEPAGE_CONFIG;
  try {
    config = await fetchHomepageConfig();
  } catch {
    config = DEFAULT_HOMEPAGE_CONFIG;
  }

  const banner = config.banner || DEFAULT_HOMEPAGE_CONFIG.banner;
  const btn1 = banner.button1 || DEFAULT_HOMEPAGE_CONFIG.banner.button1;
  const btn2 = banner.button2 || DEFAULT_HOMEPAGE_CONFIG.banner.button2;

  container.innerHTML = `
    <div class="animate-fade-up">
      <!-- 1. Hero Section -->
      <section class="max-w-6xl mx-auto px-4 sm:px-8 pt-4 sm:pt-8 pb-10 sm:pb-14">
        <div class="relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden min-h-[580px] sm:min-h-[640px] flex items-end bg-[#141413] shadow-[0_24px_60px_-24px_rgba(20,20,19,0.35)]">
          <!-- Responsive Hero Banner: Dynamic Mobile & Desktop Images -->
          <picture class="absolute inset-0 w-full h-full">
            <source media="(max-width: 639px)" srcset="${escapeHtml(banner.imageMobile || './assets/hero-mobile.jpg')}" />
            <img
              src="${escapeHtml(banner.imageDesktop || './assets/hero-desktop.jpg')}"
              alt="Personal live shopping assistance inside boutique"
              class="w-full h-full object-cover hero-bg-motion opacity-95 object-center"
            />
          </picture>

          <!-- Top-Right Pill Badge -->
          <div class="absolute top-4 right-4 sm:top-7 sm:right-7 z-20">
            <div class="inline-flex items-center gap-2.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-black/45 backdrop-blur-md border border-white/25 text-white shadow-lg text-left">
              <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
              </svg>
              <span class="text-[10px] sm:text-xs font-normal leading-tight text-white/95">
                ${escapeHtml(banner.badgeTitle || 'Personal Shopping Assistance')}<br />
                <span class="opacity-90">${escapeHtml(banner.badgeSubtitle || 'Across Indian Cities')}</span>
              </span>
            </div>
          </div>

          <!-- Bottom Gradient Overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 via-40% to-transparent pointer-events-none"></div>

          <!-- Bottom Text & CTA Buttons -->
          <div class="relative z-10 w-full p-6 sm:p-12 md:p-14">
            
            <h1 class="text-5xl sm:text-6xl md:text-7xl font-serif text-white tracking-tight leading-[0.98]">
              ${escapeHtml(banner.headingLine1 || 'Someone is')}<br />
              <span class="italic font-normal">${escapeHtml(banner.headingLine2 || 'there.')}</span>
            </h1>

            <div class="mt-4 sm:mt-5 flex items-center gap-3">
              <span class="w-8 sm:w-10 h-[1.5px] bg-white/60 shrink-0"></span>
              <p class="text-base sm:text-lg font-normal text-white/95 tracking-wide">
                ${escapeHtml(banner.subtitle || 'Shop from anywhere.')}
              </p>
            </div>

            <div class="mt-6 sm:mt-8 flex flex-row items-center gap-2.5 sm:gap-3.5 max-w-md">
              ${
                btn1.enabled !== false
                  ? `
                <!-- Button 1 in Store Theme Color #004643 -->
                <button
                  type="button"
                  id="hero-btn-1"
                  data-action="${escapeHtml(btn1.action || 'book_session')}"
                  data-link="${escapeHtml(btn1.link || '#/book')}"
                  class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 sm:px-6 sm:py-3.5 rounded-full text-xs sm:text-sm font-semibold bg-[#004643] text-white hover:bg-[#003634] active:scale-[0.98] transition-all shadow-lg whitespace-nowrap cursor-pointer"
                >
                  <svg class="w-4 h-4 shrink-0 fill-none stroke-current" stroke-width="2" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <span>${escapeHtml(btn1.text || 'Book a Session')}</span>
                  <svg class="w-3.5 h-3.5 shrink-0 fill-none stroke-current" stroke-width="2.5" viewBox="0 0 24 24">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              `
                  : ''
              }

              ${
                btn2.enabled !== false
                  ? `
                <!-- Button 2 (Translucent Outline Pill) -->
                <button
                  type="button"
                  id="hero-btn-2"
                  data-action="${escapeHtml(btn2.action || 'explore_stores')}"
                  data-link="${escapeHtml(btn2.link || '#/stores')}"
                  class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 sm:px-6 sm:py-3.5 rounded-full text-xs sm:text-sm font-semibold border border-white/40 bg-black/30 backdrop-blur-md text-white hover:bg-white/10 active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer"
                >
                  <svg class="w-4 h-4 shrink-0 fill-none stroke-current" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  <span>${escapeHtml(btn2.text || 'Explore Stores')}</span>
                  <svg class="w-3.5 h-3.5 shrink-0 fill-none stroke-current" stroke-width="2.5" viewBox="0 0 24 24">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              `
                  : ''
              }
            </div>

          </div>
        </div>
      </section>

      <!-- 2. Featured Stores Section (Clean full-bleed cards with overlay, no separate text section below) -->
      <section class="max-w-6xl mx-auto px-4 sm:px-8 py-10 sm:py-16 border-t border-[#DCD6C9]">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 class="text-3xl sm:text-4xl font-bold tracking-tight text-[#141413]">
              Featured Stores.
            </h2>
            <p class="mt-1.5 text-sm sm:text-base text-[#57534E]">
              Handpicked, and a call away.
            </p>
          </div>
          <a
            href="#/stores"
            data-home-nav="/stores"
            class="inline-flex items-center gap-1.5 text-sm font-semibold text-[#141413] hover:text-[#004643] transition-colors self-start sm:self-auto"
          >
            <span>Explore all stores</span>
            <span aria-hidden="true">&rarr;</span>
          </a>
        </div>

        <!-- City Filter Pill Container matching user mockup -->
        <div class="mt-6 sm:mt-8 flex items-center justify-center">
          <div id="home-city-pills" class="inline-flex items-center gap-1 p-1 rounded-full bg-[#E7E3D9] border border-[#DCD6C9] max-w-full overflow-x-auto shadow-inner">
            <button
              type="button"
              data-city-filter="all"
              class="px-4 py-1.5 rounded-full text-xs font-semibold bg-white text-[#141413] shadow-xs transition-all whitespace-nowrap cursor-pointer"
            >
              All
            </button>
            <button
              type="button"
              data-city-filter="Coimbatore"
              class="px-4 py-1.5 rounded-full text-xs font-medium text-[#57534E] hover:text-[#141413] transition-all whitespace-nowrap cursor-pointer"
            >
              Coimbatore
            </button>
            <button
              type="button"
              data-city-filter="Chennai"
              class="px-4 py-1.5 rounded-full text-xs font-medium text-[#57534E] hover:text-[#141413] transition-all whitespace-nowrap cursor-pointer"
            >
              Chennai
            </button>
            <button
              type="button"
              data-city-filter="Bengaluru"
              class="px-4 py-1.5 rounded-full text-xs font-medium text-[#57534E] hover:text-[#141413] transition-all whitespace-nowrap cursor-pointer"
            >
              Bengaluru
            </button>
          </div>
        </div>

        <!-- Featured Stores Cards (Swipeable Carousel on Mobile, 3-Col Grid on Desktop) -->
        <div
          id="home-featured-stores"
          class="mt-8 flex md:grid md:grid-cols-3 gap-5 sm:gap-8 overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x snap-mandatory scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          <div class="col-span-full py-12 text-center text-sm text-[#57534E]">Loading stores...</div>
        </div>
      </section>

      <!-- 3. Finds Section (Ordered 1, 2, 3, 4 Videos) -->
      <section class="max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-20 border-t border-[#DCD6C9]">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div class="max-w-2xl">
            <p class="text-xs font-semibold uppercase tracking-widest text-[#004643]">Store Finds</p>
            <h2 class="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-[#141413]">
              See What’s Happening in the Market
            </h2>
            <p class="mt-3 text-base text-[#57534E] leading-relaxed">
              Discover stores, products and shopping moments through MyMigo Finds.
            </p>
          </div>

          <a
            href="#/finds"
            data-home-nav="/finds"
            class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-[#004643] text-white hover:bg-[#003634] transition-colors duration-200 shrink-0 shadow-sm"
          >
            Explore All Finds
          </a>
        </div>

        <div id="home-instagram-grid" class="mt-8 sm:mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto"></div>
      </section>

      <!-- 4. Contact / Booking CTA -->
      <section class="max-w-6xl mx-auto px-5 sm:px-8 pt-6 pb-8">
        <div class="rounded-[2rem] bg-[#E7E3D9] border border-[#DCD6C9] p-8 sm:p-14 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div class="max-w-xl">
            <p class="text-xs font-semibold uppercase tracking-widest text-[#004643]">Need Help Deciding?</p>
            <h2 class="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#141413]">
              Talk to the MyMigo team or book your session directly.
            </h2>
            <p class="mt-3 text-sm sm:text-base text-[#57534E] leading-relaxed">
              Reach us at
              <a href="mailto:${escapeHtml(PUBLIC_CONFIG.contactEmail)}" class="text-[#004643] font-semibold underline decoration-[#DCD6C9] underline-offset-4 hover:text-[#003634]">
                ${escapeHtml(PUBLIC_CONFIG.contactEmail)}
              </a>
              or on WhatsApp at
              <a href="${escapeHtml(PUBLIC_CONFIG.contactWhatsAppUrl)}" target="_blank" rel="noopener noreferrer" class="text-[#004643] font-semibold underline decoration-[#DCD6C9] underline-offset-4 hover:text-[#003634]">
                ${escapeHtml(PUBLIC_CONFIG.contactPhone)}
              </a>.
            </p>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 shrink-0">
            <a
              href="#/book"
              data-home-nav="/book"
              class="inline-flex items-center justify-center px-6 py-3.5 rounded-full text-sm font-semibold bg-[#004643] text-white hover:bg-[#003634] transition-colors shadow-sm"
            >
              Book a Session
            </a>
            <a
              href="${escapeHtml(PUBLIC_CONFIG.contactWhatsAppUrl)}"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center px-6 py-3.5 rounded-full text-sm font-semibold bg-white border border-[#DCD6C9] text-[#004643] hover:bg-[#F0EDE5] transition-colors"
            >
              Contact on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  `;

  // Attach internal hash navigation links
  container.querySelectorAll('[data-home-nav]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(el.getAttribute('data-home-nav'));
    });
  });

  // Hero Button 1 Action
  const heroBtn1 = container.querySelector('#hero-btn-1');
  if (heroBtn1) {
    heroBtn1.addEventListener('click', () => {
      const action = heroBtn1.getAttribute('data-action');
      const link = heroBtn1.getAttribute('data-link');
      if (action === 'book_session') {
        openBookingModal();
      } else if (link) {
        navigate(link.replace(/^#/, ''));
      }
    });
  }

  // Hero Button 2 Action
  const heroBtn2 = container.querySelector('#hero-btn-2');
  if (heroBtn2) {
    heroBtn2.addEventListener('click', () => {
      const action = heroBtn2.getAttribute('data-action');
      const link = heroBtn2.getAttribute('data-link');
      if (action === 'book_session') {
        openBookingModal();
      } else if (link) {
        navigate(link.replace(/^#/, ''));
      }
    });
  }

  // Render 4 Featured Videos in configured order 1, 2, 3, 4
  const igGrid = container.querySelector('#home-instagram-grid');
  if (igGrid) {
    igGrid.innerHTML = '';
    let allVideos = INSTAGRAM_VIDEOS;
    try {
      const fetched = await fetchVideos();
      if (fetched && fetched.length > 0) allVideos = fetched;
    } catch {}

    const configuredVideoIds = Array.isArray(config.featuredVideos) && config.featuredVideos.length === 4
      ? config.featuredVideos
      : DEFAULT_HOMEPAGE_CONFIG.featuredVideos;

    let orderedVideos = configuredVideoIds
      .map((id) => allVideos.find((v) => v.id === id))
      .filter(Boolean);

    // Fallback if any missing or IDs don't match
    if (orderedVideos.length < 4) {
      allVideos.forEach((v) => {
        if (!orderedVideos.some((ov) => ov.id === v.id) && orderedVideos.length < 4) {
          orderedVideos.push(v);
        }
      });
    }

    orderedVideos.forEach((video) => {
      igGrid.appendChild(
        createInstagramCard(video, (selectedVideo) => {
          navigate(`/store/${encodeURIComponent(selectedVideo.storeId)}`);
        })
      );
    });
  }

  // Load and Render Featured Stores
  const storesGrid = container.querySelector('#home-featured-stores');
  let activeStoresList = [];

  try {
    activeStoresList = await fetchActiveStores();
  } catch {
    activeStoresList = [];
  }

  function renderStoresForCity(filterCity = 'all') {
    if (!storesGrid) return;
    storesGrid.innerHTML = '';

    let displayedStores = [];

    if (filterCity === 'all') {
      // Use exact configured order and custom badges/ratings from admin
      const configuredStores = Array.isArray(config.featuredStores) && config.featuredStores.length === 3
        ? config.featuredStores
        : DEFAULT_HOMEPAGE_CONFIG.featuredStores;

      displayedStores = configuredStores
        .map((entry) => {
          const storeId = typeof entry === 'string' ? entry : entry.id;
          const store = activeStoresList.find((s) => s.id === storeId);
          if (!store) return null;
          return {
            store,
            badge: typeof entry === 'object' && entry.badge !== undefined ? entry.badge : (store.badge || ''),
            rating: typeof entry === 'object' && entry.rating !== undefined ? entry.rating : store.rating,
          };
        })
        .filter(Boolean);

      // Fallback if needed
      if (displayedStores.length < 3) {
        activeStoresList.forEach((st) => {
          if (!displayedStores.some((d) => d.store.id === st.id) && displayedStores.length < 3) {
            displayedStores.push({ store: st, badge: st.badge || '', rating: st.rating });
          }
        });
      }
    } else {
      // Filter by city
      const matched = activeStoresList.filter(
        (st) => st.city.toLowerCase() === filterCity.toLowerCase()
      );
      if (matched.length === 0) {
        storesGrid.innerHTML = `
          <div class="col-span-full py-12 text-center text-sm text-[#57534E]">
            No verified stores found in ${escapeHtml(filterCity)} right now.
          </div>
        `;
        return;
      }
      displayedStores = matched.map((st) => ({
        store: st,
        badge: st.badge || '',
        rating: st.rating,
      }));
    }

    if (displayedStores.length === 0) {
      storesGrid.innerHTML =
        '<p class="col-span-full py-12 text-center text-sm text-[#57534E]">No active stores available right now.</p>';
      return;
    }

    displayedStores.forEach(({ store, badge, rating }) => {
      storesGrid.appendChild(
        createFeaturedStoreCard(
          store,
          (selected) => {
            // When clicking white '+' button -> open booking session modal popup
            openBookingModal(selected);
          },
          (selected) => {
            navigate(`/store/${encodeURIComponent(selected.id)}`);
          },
          { isCarousel: true, badge, rating }
        )
      );
    });
  }

  // Initial render with 'all'
  renderStoresForCity('all');

  // Wire up city filter pills
  const pillBtns = container.querySelectorAll('[data-city-filter]');
  pillBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const city = btn.getAttribute('data-city-filter');

      // Update active pill styling
      pillBtns.forEach((b) => {
        b.classList.remove('bg-white', 'text-[#141413]', 'shadow-xs', 'font-semibold');
        b.classList.add('text-[#57534E]', 'font-medium');
      });
      btn.classList.add('bg-white', 'text-[#141413]', 'shadow-xs', 'font-semibold');
      btn.classList.remove('text-[#57534E]', 'font-medium');

      renderStoresForCity(city);
    });
  });
}
