// Image Gallery Modal Component — Up to 6 High-Resolution Product Images
// Features interactive gallery slider, thumbnail selector, image zoom preview, and direct Buy button.

import { escapeHtml } from '../utils/dom.js';

export function openImageGalleryModal(product, video, onBuyClick = null) {
  const existing = document.getElementById('image-gallery-modal');
  if (existing) existing.remove();

  // Curate 6 high-resolution product views fallback
  const fallbackGallery = [
    product.image || video.poster || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1572455044339-9d0f77b4742a?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80',
  ];

  const galleryImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images.slice(0, 6)
    : fallbackGallery.slice(0, 6);

  let activeIndex = 0;

  const modal = document.createElement('div');
  modal.id = 'image-gallery-modal';
  modal.className =
    'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none';

  modal.innerHTML = `
    <div class="relative w-full max-w-lg bg-[#0F0F12] rounded-3xl p-4 sm:p-6 shadow-2xl border border-white/20 animate-fade-up text-white flex flex-col max-h-[92vh] overflow-hidden">
      
      <!-- Top Bar: Boutique Attribution & Close Button -->
      <div class="flex items-center justify-between pb-3 mb-2 border-b border-white/10 shrink-0">
        <div class="flex items-center gap-2 min-w-0 pr-4">
          <img
            src="${escapeHtml(video.avatar || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=100&q=80')}"
            alt="${escapeHtml(video.storeName || '')}"
            class="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-400 shrink-0"
          />
          <div class="min-w-0">
            <h3 class="text-xs font-bold text-white truncate leading-tight">${escapeHtml(product.name)}</h3>
            <p class="text-[10px] text-[#A1A1AA] truncate">${escapeHtml(video.storeName || 'Verified Partner')} • ${escapeHtml(video.city || 'Tamil Nadu')}</p>
          </div>
        </div>

        <button
          type="button"
          id="gallery-close-btn"
          aria-label="Close Gallery"
          class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer text-lg font-bold shrink-0 shadow-xs"
        >
          &times;
        </button>
      </div>

      <!-- Main Large Image View with Left/Right Arrows -->
      <div class="relative w-full aspect-[4/5] sm:aspect-square bg-black/60 rounded-2xl overflow-hidden flex items-center justify-center border border-white/10 shrink-0">
        <img
          id="gallery-main-img"
          src="${escapeHtml(galleryImages[0])}"
          alt="${escapeHtml(product.name)}"
          class="w-full h-full object-contain transition-opacity duration-200"
        />

        <!-- Left/Previous Arrow -->
        <button
          type="button"
          id="gallery-prev-btn"
          aria-label="Previous image"
          class="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/90 flex items-center justify-center transition-all cursor-pointer border border-white/15 shadow-md active:scale-95"
        >
          <svg class="w-4 h-4 fill-none stroke-current" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <!-- Right/Next Arrow -->
        <button
          type="button"
          id="gallery-next-btn"
          aria-label="Next image"
          class="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/90 flex items-center justify-center transition-all cursor-pointer border border-white/15 shadow-md active:scale-95"
        >
          <svg class="w-4 h-4 fill-none stroke-current" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <!-- Image Counter Badge -->
        <div class="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-[11px] font-mono font-bold text-white shadow-sm">
          <span id="gallery-counter-text">1 / ${galleryImages.length} Images</span>
        </div>
      </div>

      <!-- Thumbnails Strip (Up to 6 Images) -->
      <div class="grid grid-cols-${Math.min(galleryImages.length, 6)} gap-1.5 sm:gap-2 pt-3 shrink-0">
        ${galleryImages
          .map(
            (img, idx) => `
          <button
            type="button"
            data-gallery-thumb-idx="${idx}"
            class="gallery-thumb-btn aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer relative ${
              idx === 0
                ? 'border-emerald-400 ring-2 ring-emerald-400/40 scale-102'
                : 'border-white/15 opacity-70 hover:opacity-100 hover:border-white/40'
            }"
          >
            <img src="${escapeHtml(img)}" alt="View ${idx + 1}" class="w-full h-full object-cover" />
          </button>
        `
          )
          .join('')}
      </div>

      <!-- Bottom Bar: Price & Buy Now Button -->
      <div class="pt-3.5 mt-2 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
        <div>
          <span class="text-[10px] text-[#A1A1AA] uppercase tracking-wider font-semibold block">Price</span>
          <div class="flex items-baseline gap-1.5">
            <span class="text-base sm:text-lg font-black text-emerald-400">${escapeHtml(product.price)}</span>
            ${product.originalPrice ? `<span class="text-xs text-[#71717A] line-through">${escapeHtml(product.originalPrice)}</span>` : ''}
          </div>
        </div>

        <button
          type="button"
          id="gallery-buy-btn"
          class="flex-1 max-w-[200px] py-2.5 px-4 rounded-xl bg-[#004643] hover:bg-[#003634] active:scale-95 text-white font-extrabold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-1.5 border border-emerald-400/40 cursor-pointer"
        >
          <span>Buy Now</span>
          <svg class="w-3.5 h-3.5 text-emerald-300" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>

    </div>
  `;

  document.body.appendChild(modal);

  const mainImg = modal.querySelector('#gallery-main-img');
  const counterText = modal.querySelector('#gallery-counter-text');
  const thumbBtns = modal.querySelectorAll('.gallery-thumb-btn');

  const updateGalleryView = (idx) => {
    activeIndex = idx;
    if (mainImg) {
      mainImg.style.opacity = '0.3';
      setTimeout(() => {
        mainImg.src = galleryImages[idx];
        mainImg.style.opacity = '1';
      }, 100);
    }
    if (counterText) {
      counterText.textContent = `${idx + 1} / ${galleryImages.length} Images`;
    }
    thumbBtns.forEach((btn, bIdx) => {
      if (bIdx === idx) {
        btn.className =
          'gallery-thumb-btn aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer relative border-emerald-400 ring-2 ring-emerald-400/40 scale-102';
      } else {
        btn.className =
          'gallery-thumb-btn aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer relative border-white/15 opacity-70 hover:opacity-100 hover:border-white/40';
      }
    });
  };

  // Thumbnail clicks
  thumbBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-gallery-thumb-idx'), 10);
      updateGalleryView(idx);
    });
  });

  // Next / Prev buttons
  modal.querySelector('#gallery-prev-btn')?.addEventListener('click', () => {
    const nextIdx = activeIndex > 0 ? activeIndex - 1 : galleryImages.length - 1;
    updateGalleryView(nextIdx);
  });

  modal.querySelector('#gallery-next-btn')?.addEventListener('click', () => {
    const nextIdx = activeIndex < galleryImages.length - 1 ? activeIndex + 1 : 0;
    updateGalleryView(nextIdx);
  });

  // Close handlers
  const closeModal = () => modal.remove();
  modal.querySelector('#gallery-close-btn')?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Buy button inside gallery
  modal.querySelector('#gallery-buy-btn')?.addEventListener('click', () => {
    closeModal();
    if (typeof onBuyClick === 'function') {
      onBuyClick();
    }
  });
}
