// Finds / Video Reels Page — Fullscreen Mobile Video Stream for MyMigo
// Fills 100% of the screen on mobile, single-scroll vertical snap,
// Bottom-left Back button that restores the bottom navigation dock upon exit.

import { PUBLIC_CONFIG } from '../config.js';
import { fetchVideos, getCachedVideos } from '../services/videoService.js';
import { createReelPlayer } from '../components/ReelPlayer.js';
import { hideMobileBottomDock, showMobileBottomDock } from '../components/NavBar.js';
import { escapeHtml } from '../utils/dom.js';
import { mediaManager } from '../utils/mediaManager.js';

export function renderInstagramPage(container, navigate, queryParams) {
  // Use in-memory cached videos synchronously to preserve the user's click gesture for immediate unmuted autoplay!
  let videos = getCachedVideos();

  // In background, refresh if server has new video uploads
  fetchVideos().then((fresh) => {
    if (fresh && fresh.length > 0 && fresh.length !== videos.length) {
      videos = fresh;
      render();
    }
  }).catch(() => {});

  // Hide the mobile bottom pill dock while in the video feed
  hideMobileBottomDock();

  // Check URL query param for specific video ID (e.g. #/finds?video=video-03)
  const targetVideoId = queryParams ? queryParams.get('video') : null;
  let selectedCity = 'All';
  let isCityFilterOpen = false;
  let activeReelIndex = 0;
  let reelPlayers = [];
  let feedObserver = null;

  const cleanupAllReels = () => {
    mediaManager.stopAll();
    reelPlayers.forEach((p) => {
      try {
        p.pauseVideo?.();
        p.destroy?.();
      } catch (e) {}
    });
    if (feedObserver) {
      feedObserver.disconnect();
      feedObserver = null;
    }
  };

  const handleExitToStores = () => {
    cleanupAllReels();
    showMobileBottomDock();
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate('/stores');
    }
  };

  // Automatically kill all media playback when navigating away from this page via any hash change
  const onRouteExit = () => {
    cleanupAllReels();
    window.removeEventListener('hashchange', onRouteExit);
  };
  window.addEventListener('hashchange', onRouteExit);

  const render = () => {
    // Cleanup any existing observer & stop active videos before fresh render
    cleanupAllReels();
    reelPlayers = [];

    // Filter videos by selected city
    const filteredVideos = videos.filter((v) => {
      if (selectedCity === 'All') return true;
      return v.city && v.city.toLowerCase() === selectedCity.toLowerCase();
    });

    if (targetVideoId) {
      const foundIdx = filteredVideos.findIndex((v) => v.id === targetVideoId);
      if (foundIdx !== -1) activeReelIndex = foundIdx;
    }

    container.innerHTML = `
      <!-- Fullscreen Container on Mobile (100dvh, edge-to-edge), Centered Stream on Desktop -->
      <div class="fixed inset-0 w-full h-[100dvh] bg-black z-30 flex flex-col justify-center items-center overflow-hidden animate-fade-in select-none">
        
        <!-- Elegant Top Bar with Toggleable City Filter Tabs -->
        <div class="fixed top-0 inset-x-0 mx-auto z-40 w-full sm:max-w-[440px] px-3.5 pt-2.5 pb-2 bg-gradient-to-b from-black/95 via-black/80 to-transparent flex items-center gap-2 select-none">
          <!-- "City" Toggle Pill Button (Click to show/hide right-side tabs) -->
          <button
            type="button"
            id="city-filter-toggle-btn"
            aria-expanded="${isCityFilterOpen}"
            title="Filter by City"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95 shrink-0 group ${
              isCityFilterOpen ? 'ring-1 ring-emerald-400/60 bg-black/90' : ''
            }"
          >
            <svg class="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>${selectedCity === 'All' ? 'City' : escapeHtml(selectedCity)}</span>
            <svg class="city-caret w-3 h-3 text-zinc-400 group-hover:text-white transition-transform duration-200 shrink-0 ${
              isCityFilterOpen ? 'rotate-180 text-emerald-400' : ''
            }" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Right-Side City Tabs (Hidden by default; revealed when clicking City, hidden when clicking City again) -->
          <div
            id="city-tabs-container"
            class="items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 min-w-0 flex-1 transition-all duration-200 ${
              isCityFilterOpen ? 'flex opacity-100' : 'hidden opacity-0'
            }"
          >
            <button
              type="button"
              data-city-pill="All"
              class="px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap backdrop-blur-md transition-all cursor-pointer shrink-0 ${
                selectedCity === 'All'
                  ? 'bg-[#004643] text-white ring-1 ring-emerald-400/60 shadow-md'
                  : 'bg-black/60 text-zinc-300 border border-white/20 hover:bg-black/80 hover:text-white'
              }"
            >
              All (${videos.length})
            </button>
            ${PUBLIC_CONFIG.cities
              .map((city) => {
                const count = videos.filter((v) => v.city && v.city.toLowerCase() === city.toLowerCase()).length;
                if (count === 0) return '';
                return `
                <button
                  type="button"
                  data-city-pill="${escapeHtml(city)}"
                  class="px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap backdrop-blur-md transition-all cursor-pointer shrink-0 ${
                    selectedCity === city
                      ? 'bg-[#004643] text-white ring-1 ring-emerald-400/60 shadow-md'
                      : 'bg-black/60 text-zinc-300 border border-white/20 hover:bg-black/80 hover:text-white'
                  }"
                >
                  ${escapeHtml(city)} (${count})
                </button>
              `;
              })
              .join('')}
          </div>
        </div>

        <!-- Continuous Vertical Snap Scroll Feed Container (100% full screen on mobile) -->
        <div
          id="reels-snap-feed"
          class="w-full h-full sm:max-w-[440px] sm:h-[94vh] sm:my-auto overflow-y-auto snap-y snap-mandatory no-scrollbar sm:rounded-[36px] bg-black sm:bg-[#0A0A0C] sm:border sm:border-[#27272A] sm:shadow-2xl"
          style="scroll-snap-type: y mandatory; overflow-y: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; -ms-overflow-style: none;"
        >
          ${filteredVideos
            .map(
              (v, idx) => `
            <div
              class="reel-snap-item relative w-full h-[100dvh] sm:h-[720px] flex items-center justify-center snap-center snap-always"
              data-reel-index="${idx}"
              data-reel-id="${escapeHtml(v.id)}"
              style="scroll-snap-align: center; scroll-snap-stop: always;"
            >
              <!-- Reel Player dynamically mounted here -->
            </div>
          `
            )
            .join('')}
        </div>

      </div>
    `;

    mountFeedAndAttachHandlers(filteredVideos);
  };

  const mountFeedAndAttachHandlers = (filteredVideos) => {
    const feedContainer = container.querySelector('#reels-snap-feed');
    if (!feedContainer) return;

    const snapItemElements = feedContainer.querySelectorAll('.reel-snap-item');

    // Mount each Reel Player into its snap slot
    snapItemElements.forEach((slot, idx) => {
      const vid = filteredVideos[idx];
      const isFirst = idx === activeReelIndex;
      const player = createReelPlayer(vid, {
        currentIndex: idx,
        totalCount: filteredVideos.length,
        onStoreClick: (v) => {
          cleanupAllReels();
          showMobileBottomDock();
          navigate(`/store/${encodeURIComponent(v.storeId)}`);
        },
        onBackClick: handleExitToStores,
        autoPlay: isFirst, // First video autoplays immediately!
      });
      reelPlayers.push(player);
      slot.appendChild(player);
    });

    const updatePositionDisplay = (idx) => {
      activeReelIndex = idx;
    };

    // Scroll to initial active reel if target was provided
    if (activeReelIndex > 0 && snapItemElements[activeReelIndex]) {
      setTimeout(() => {
        snapItemElements[activeReelIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }

    // Deterministic scroll tracker: ensures ONLY the snapped video plays and all other reels are strictly paused
    let scrollRafId = null;
    const handleScrollSnap = () => {
      if (scrollRafId) cancelAnimationFrame(scrollRafId);
      scrollRafId = requestAnimationFrame(() => {
        const itemHeight = feedContainer.clientHeight || window.innerHeight;
        if (!itemHeight) return;
        const targetIdx = Math.max(
          0,
          Math.min(filteredVideos.length - 1, Math.round(feedContainer.scrollTop / itemHeight))
        );
        if (targetIdx !== activeReelIndex) {
          activeReelIndex = targetIdx;
          reelPlayers.forEach((p, pIdx) => {
            if (pIdx === targetIdx) {
              p.playVideo?.();
            } else {
              p.pauseVideo?.();
            }
          });
        }
      });
    };
    feedContainer.addEventListener('scroll', handleScrollSnap, { passive: true });

    // Set up IntersectionObserver as secondary guard:
    // Guarantees only one active video plays at a time
    feedObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const slot = entry.target;
          const idx = parseInt(slot.getAttribute('data-reel-index'), 10);
          const player = reelPlayers[idx];
          if (!player) return;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            if (activeReelIndex !== idx) {
              activeReelIndex = idx;
              reelPlayers.forEach((p, pIdx) => {
                if (pIdx === idx) {
                  p.playVideo();
                } else {
                  p.pauseVideo?.();
                }
              });
            }
          } else if (entry.intersectionRatio < 0.25) {
            player.pauseVideo?.();
          }
        });
      },
      {
        root: feedContainer,
        threshold: [0.1, 0.25, 0.6],
      }
    );

    snapItemElements.forEach((slot) => feedObserver.observe(slot));

    // City Filter Toggle: Click "City" to show right-side tabs, click "City" again to hide them
    const toggleBtn = container.querySelector('#city-filter-toggle-btn');
    const cityTabs = container.querySelector('#city-tabs-container');
    const caret = toggleBtn?.querySelector('.city-caret');

    toggleBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      isCityFilterOpen = !isCityFilterOpen;
      toggleBtn.setAttribute('aria-expanded', isCityFilterOpen);
      if (isCityFilterOpen) {
        cityTabs?.classList.remove('hidden', 'opacity-0');
        cityTabs?.classList.add('flex', 'opacity-100');
        caret?.classList.add('rotate-180', 'text-emerald-400');
        toggleBtn?.classList.add('ring-1', 'ring-emerald-400/60', 'bg-black/90');
      } else {
        cityTabs?.classList.add('hidden', 'opacity-0');
        cityTabs?.classList.remove('flex', 'opacity-100');
        caret?.classList.remove('rotate-180', 'text-emerald-400');
        toggleBtn?.classList.remove('ring-1', 'ring-emerald-400/60', 'bg-black/90');
      }
    });

    // Keyboard arrow Up/Down support for desktop navigation
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        if (activeReelIndex < snapItemElements.length - 1) {
          e.preventDefault();
          snapItemElements[activeReelIndex + 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else if (e.key === 'ArrowUp') {
        if (activeReelIndex > 0) {
          e.preventDefault();
          snapItemElements[activeReelIndex - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else if (e.key === 'Escape') {
        handleExitToStores();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // City pills
    container.querySelectorAll('[data-city-pill]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedCity = btn.getAttribute('data-city-pill');
        activeReelIndex = 0;
        window.removeEventListener('keydown', handleKeyDown);
        render();
      });
    });

    // Unmount cleanup when leaving route
    const handleRouteExit = () => {
      showMobileBottomDock();
      reelPlayers.forEach((p) => p.pauseVideo?.());
      if (feedObserver) feedObserver.disconnect();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hashchange', handleRouteExit);
    };
    window.addEventListener('hashchange', handleRouteExit, { once: true });
  };

  render();
}
