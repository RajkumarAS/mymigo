// Luxury Reel Player Component — Bespoke Video Experience for MyMigo Finds
// Features full-screen mobile fill, HTTP 206 Range video seeking, interactive finger-swipe scrubber,
// 1-product single horizontal frame (fixed layout for mobile and desktop),
// bottom-left Back button, like with animation, comments drawer, share sheet, 4-image gallery modal, and instant Quick Buy.

import { escapeHtml } from '../utils/dom.js';
import { likeVideo } from '../services/videoService.js';
import { openCommentsDrawer } from './CommentsDrawer.js';
import { openShareModal } from './ShareModal.js';
import { openBookingModal } from './BookingModal.js';
import { openQuickBuyModal } from './QuickBuyModal.js';
import { openImageGalleryModal } from './ImageGalleryModal.js';
import { mediaManager } from '../utils/mediaManager.js';

export function createReelPlayer(video, options = {}) {
  const {
    currentIndex = 0,
    totalCount = 10,
    onStoreClick = null,
    onBackClick = null,
    autoPlay = false,
  } = options;

  const container = document.createElement('div');
  // Full-screen on mobile (100dvh, edge-to-edge), luxury centered card on desktop
  container.className =
    'relative w-full h-[100dvh] sm:h-[720px] sm:max-w-[420px] mx-auto bg-black sm:bg-[#0A0A0C] sm:rounded-[32px] sm:border sm:border-[#27272A] sm:shadow-2xl flex flex-col justify-between select-none box-border overflow-hidden';

  let isPlaying = false;
  let isMuted = false;
  let isScrubbing = false;
  let scrubTargetTime = 0;
  let likes = video.likesCount || 0;
  let isLiked = Boolean(video.isLiked);
  let commentsCount = video.commentsCount || (video.comments ? video.comments.length : 24);

  // 2x Speed Hold State
  let isHolding2x = false;
  let holdSpeedTimer = null;
  let justHeld2x = false;
  let touchStartPos = { x: 0, y: 0 };
  let hasMovedSignificantly = false;

  // 10 authentic boutique collections (Sarees, Kurtis, 2 Piece) with up to 6 images each
  const defaultProducts = [
    {
      id: `${video.id}-p1`,
      name: 'Pure Cotton A-Line Kurti',
      category: 'Kurtis',
      price: '₹1,200',
      originalPrice: '₹1,699',
      image: video.poster || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      images: [
        video.poster || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1572455044339-9d0f77b4742a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      id: `${video.id}-p2`,
      name: 'Handloom Zari Border Kurti',
      category: 'Kurtis',
      price: '₹1,350',
      originalPrice: '₹1,850',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1572455044339-9d0f77b4742a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      id: `${video.id}-p3`,
      name: 'Festive Pastel Straight Kurti',
      category: 'Kurtis',
      price: '₹1,450',
      originalPrice: '₹2,100',
      image: 'https://images.unsplash.com/photo-1572455044339-9d0f77b4742a?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1572455044339-9d0f77b4742a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      id: `${video.id}-p4`,
      name: 'Block Printed Daily Kurti',
      category: 'Daily Wear',
      price: '₹1,250',
      originalPrice: '₹1,750',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1572455044339-9d0f77b4742a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      id: `${video.id}-p5`,
      name: 'Pure Cotton Handloom Saree',
      category: 'Sarees',
      price: '₹1,450',
      originalPrice: '₹2,100',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1572455044339-9d0f77b4742a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      id: `${video.id}-p6`,
      name: 'Soft Mulmul Floral Cotton Saree',
      category: 'Sarees',
      price: '₹1,299',
      originalPrice: '₹1,850',
      image: 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1572455044339-9d0f77b4742a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      id: `${video.id}-p7`,
      name: 'Pastel 2-Piece Kurti & Pant Co-ord Set',
      category: '2 Piece',
      price: '₹1,850',
      originalPrice: '₹2,499',
      image: 'https://images.unsplash.com/photo-1572455044339-9d0f77b4742a?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1572455044339-9d0f77b4742a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      id: `${video.id}-p8`,
      name: 'Festive Chanderi 2-Piece Tunic Set',
      category: '2 Piece',
      price: '₹2,100',
      originalPrice: '₹2,899',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1572455044339-9d0f77b4742a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      id: `${video.id}-p9`,
      name: 'Coimbatore Zari Border Handloom Saree',
      category: 'Sarees',
      price: '₹1,850',
      originalPrice: '₹2,600',
      image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1572455044339-9d0f77b4742a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      id: `${video.id}-p10`,
      name: 'Kalamkari Printed Festive Kurti',
      category: 'Kurtis',
      price: '₹1,150',
      originalPrice: '₹1,599',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1572455044339-9d0f77b4742a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
      ],
    },
  ];

  const rawProducts = Array.isArray(video.products) && video.products.length > 0
    ? video.products
    : defaultProducts;

  // Ensure each product has 4 gallery images
  const products = rawProducts.map((p, idx) => {
    const fallbackImgs = defaultProducts[idx % defaultProducts.length].images;
    const imgs = Array.isArray(p.images) && p.images.length > 0 ? p.images : [p.image || fallbackImgs[0], ...fallbackImgs.slice(1)];
    return { ...p, images: imgs };
  });

  let currentProductIndex = 0;

  container.innerHTML = `
    <!-- Background Video Element (Full-screen complete fill on mobile) -->
    <video
      class="reel-video absolute inset-0 w-full h-full object-cover object-center cursor-pointer"
      src="${escapeHtml(video.videoUrl || './uploads/diwali_sale_kurtis.mp4')}"
      poster="${escapeHtml(video.poster || video.posterImage || '')}"
      playsinline
      loop
      preload="auto"
    ></video>

    <!-- 2x Speed Hold Indicator Badge -->
    <div
      class="speed-2x-badge hidden absolute top-24 sm:top-28 inset-x-0 mx-auto w-fit z-40 px-3.5 py-1.5 rounded-full bg-black/85 backdrop-blur-md border border-white/25 text-white shadow-2xl items-center gap-2 pointer-events-none select-none transition-all duration-150 animate-pulse"
      data-speed-badge
    >
      <div class="flex items-center text-emerald-400">
        <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/>
        </svg>
      </div>
      <span class="font-mono font-black text-sm tracking-wide text-white">2x &gt;&gt;</span>
      <span class="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">Speed</span>
    </div>

    <!-- Top & Bottom Gradient Vignettes -->
    <div class="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-none z-10"></div>
    <div class="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black/95 via-black/75 to-transparent pointer-events-none z-10"></div>

    <!-- Center Play/Pause Indicator Animation -->
    <div class="play-pause-badge absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 scale-75 transition-all duration-200 pointer-events-none z-20">
      <svg class="play-icon w-8 h-8 fill-current ml-1" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z"/>
      </svg>
      <svg class="pause-icon hidden w-8 h-8 fill-current" viewBox="0 0 24 24">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
      </svg>
    </div>

    <!-- Boutique Store Header (Positioned cleanly below the top City Filter bar) -->
    <div
      class="relative z-20 px-3.5 sm:px-4 flex items-center justify-between"
      style="padding-top: calc(env(safe-area-inset-top, 0px) + 54px);"
    >
      <button
        type="button"
        data-store-header-btn
        class="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-left hover:bg-black/80 transition-all cursor-pointer group shadow-md"
        title="View boutique store profile"
      >
        <img
          src="${escapeHtml(video.avatar || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=200&q=80')}"
          alt="${escapeHtml(video.storeName)}"
          class="w-8 h-8 rounded-full object-cover ring-1.5 ring-emerald-400 group-hover:scale-105 transition-transform shrink-0"
        />
        <div class="min-w-0 pr-1">
          <div class="flex items-center gap-1">
            <span class="text-xs font-bold text-white truncate max-w-[130px] sm:max-w-[160px] leading-tight">${escapeHtml(video.storeName)}</span>
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
          </div>
          <span class="text-[10px] text-zinc-300 block truncate">${escapeHtml(video.city)}</span>
        </div>
      </button>

      <!-- Booking Button (Strictly "Book" as requested) -->
      <button
        type="button"
        data-reel-book-btn
        class="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#004643] hover:bg-[#003634] text-white border border-emerald-400/50 shadow-md transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shrink-0"
        title="Book video shopping call"
      >
        <svg class="w-3.5 h-3.5 text-emerald-300" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
        </svg>
        <span>Book</span>
      </button>
    </div>

    <!-- Right Engagement Rail (Like, Comment, Share, Sound) - Anchored near bottom right, non-floating -->
    <div
      class="absolute right-3.5 sm:right-4 z-30 flex flex-col items-center gap-3 select-none"
      style="bottom: 162px;"
    >
      <!-- Like Button -->
      <button
        type="button"
        data-reel-like-btn
        aria-label="Like Video"
        class="group flex flex-col items-center gap-1 cursor-pointer transition-transform active:scale-90"
      >
        <div class="like-bubble w-10 h-10 sm:w-11 sm:h-11 rounded-full ${isLiked ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40' : 'bg-black/60 text-white border border-white/25 hover:bg-black/80'} backdrop-blur-md flex items-center justify-center transition-all duration-200 shadow-md group-hover:scale-105">
          <svg class="w-5 h-5 ${isLiked ? 'fill-current' : 'fill-none stroke-current'} transition-colors" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <span class="like-count text-[11px] font-bold text-white drop-shadow">${likes}</span>
      </button>

      <!-- Comments Button -->
      <button
        type="button"
        data-reel-comments-btn
        aria-label="View Comments"
        class="group flex flex-col items-center gap-1 cursor-pointer transition-transform active:scale-90"
      >
        <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/60 backdrop-blur-md border border-white/25 text-white hover:bg-black/80 flex items-center justify-center transition-all shadow-md group-hover:scale-105">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <span class="comments-count text-[11px] font-bold text-white drop-shadow">${commentsCount}</span>
      </button>

      <!-- Share Button (Paper Airplane Send Design matching user image) -->
      <button
        type="button"
        data-reel-share-btn
        aria-label="Share Video"
        class="group flex flex-col items-center gap-1 cursor-pointer transition-transform active:scale-90"
        title="Share on WhatsApp & Instagram"
      >
        <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/60 backdrop-blur-md border border-white/25 text-white hover:bg-black/80 flex items-center justify-center transition-all shadow-md group-hover:scale-105">
          <svg class="w-5 h-5 text-white -mr-0.5" viewBox="0 0 24 24">
            <path d="M4 4.5l16 7.5-16 7.5 3.5-6.5h6v-2h-6L4 4.5z" fill="currentColor" />
          </svg>
        </div>
        <span class="share-count text-[11px] font-bold text-white drop-shadow">${video.shareCount || 54}</span>
      </button>

      <!-- Speaker Audio Toggle (Matches user speaker design: horn with waves when unmuted, horn with X when muted) -->
      <button
        type="button"
        data-reel-mute-btn
        aria-label="Toggle Audio"
        class="group flex flex-col items-center gap-1 cursor-pointer transition-transform active:scale-90 overflow-hidden"
        title="Toggle Sound"
      >
        <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/60 backdrop-blur-md border border-white/25 text-white hover:bg-black/80 flex items-center justify-center transition-all shadow-md group-hover:scale-105 overflow-hidden">
          <!-- Unmuted Icon: Speaker Cone with 2 Curved Sound Waves (Default sound ON) -->
          <svg class="unmute-icon w-5 h-5 text-white" viewBox="0 0 24 24">
            <path d="M4 9.5h3.5l4.5-4v13l-4.5-4H4a1 1 0 01-1-1v-3a1 1 0 011-1z" fill="currentColor" />
            <path d="M15.5 8.5a5 5 0 010 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <path d="M18.5 6a9 9 0 010 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>

          <!-- Muted Icon: Speaker Cone with distinct X Cross (Hidden by default) -->
          <svg class="mute-icon hidden w-5 h-5 text-white" viewBox="0 0 24 24">
            <path d="M4 9.5h3.5l4.5-4v13l-4.5-4H4a1 1 0 01-1-1v-3a1 1 0 011-1z" fill="currentColor" />
            <path d="M16 9.5l5 5m0-5l-5 5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
          </svg>
        </div>
      </button>
    </div>

    <!-- Bottom Overlay: Handle, Caption, Bottom-Left Back Button, 1-Product Horizontal Card & Interactive Time Scrubber -->
    <div class="relative z-20 px-3.5 pb-3.5 sm:px-4 sm:pb-4 pt-0 space-y-2 box-border w-full overflow-hidden">
      <!-- Store Handle & Tag -->
      <div class="flex items-center gap-2 pr-14">
        <span class="text-xs font-bold text-white tracking-wide">@${escapeHtml(video.handle || video.storeName)}</span>
        <span class="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-semibold text-emerald-300">
          Diwali Sale Kurti ₹1,200+
        </span>
      </div>

      <!-- Caption with Toggle -->
      <div class="text-[11px] text-[#F4F4F5] leading-snug line-clamp-1 hover:line-clamp-none transition-all cursor-pointer pr-14" data-caption-container>
        <p>${escapeHtml(video.caption || 'Diwali Special Kurti Collection! Tap image for gallery or Buy to order.')}</p>
      </div>

      <!-- Single Product in Single Frame Horizontally + Bottom-Left Back Button -->
      <div class="relative w-full select-none pt-0.5 box-border overflow-hidden" data-product-section>
        
        <!-- Header row with counter and swipe navigation -->
        <div class="flex items-center justify-between mb-1 px-1">
          <div class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="text-[10px] font-bold text-white tracking-wide uppercase">Featured Kurti</span>
            <span class="text-[10px] text-emerald-300 font-mono font-semibold" data-product-counter>1 of ${products.length}</span>
          </div>
          <div class="flex items-center gap-1 text-[10px] text-zinc-300">
            <button
              type="button"
              data-product-prev-btn
              class="w-5 h-5 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Previous Kurti"
            >
              &lsaquo;
            </button>
            <span class="text-[9px] font-medium opacity-85 px-0.5">Swipe →</span>
            <button
              type="button"
              data-product-next-btn
              class="w-5 h-5 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Next Kurti"
            >
              &rsaquo;
            </button>
          </div>
        </div>

        <!-- Bottom Controls Row: Bottom-Left Back Button + 1 Product Card -->
        <div class="flex items-center gap-2 w-full">
          <!-- Back Button (Bottom Left) -->
          <button
            type="button"
            data-reel-back-btn
            class="h-12 px-3 rounded-2xl bg-black/85 hover:bg-black text-white backdrop-blur-md border border-white/20 text-xs font-bold flex items-center gap-1 shrink-0 active:scale-95 shadow-md cursor-pointer transition-all group"
            title="Back to Stores & Sections"
          >
            <svg class="w-4 h-4 fill-none stroke-current group-hover:-translate-x-0.5 transition-transform" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back</span>
          </button>

          <!-- 1 Product per Frame Horizontal Carousel (flex: 1 min-w-0) -->
          <div
            class="product-carousel-track flex overflow-x-auto snap-x snap-mandatory no-scrollbar flex-1 min-w-0 box-border"
            style="display: flex; overflow-x: auto; -webkit-overflow-scrolling: touch; scroll-snap-type: x mandatory;"
            data-product-track
          >
            ${products
              .map(
                (prod, pIdx) => `
              <div
                class="single-product-frame w-full shrink-0 snap-center snap-always flex items-center justify-between gap-2 p-1.5 sm:p-2 rounded-2xl bg-black/85 backdrop-blur-md border border-white/20 shadow-lg box-border overflow-hidden"
                style="flex: 0 0 100%; width: 100%; max-width: 100%; box-sizing: border-box;"
                data-frame-idx="${pIdx}"
              >
                <!-- Photo on Left (Click to open up to 4 images gallery!) -->
                <div
                  class="relative shrink-0 cursor-pointer group rounded-xl overflow-hidden shadow-xs"
                  style="width: 40px; height: 40px; min-width: 40px; max-width: 40px;"
                  data-open-gallery-idx="${pIdx}"
                  title="Click to view photos in gallery"
                >
                  <img
                    src="${escapeHtml(prod.image || video.poster || '')}"
                    alt="${escapeHtml(prod.name)}"
                    class="w-full h-full object-cover ring-1 ring-white/20 group-hover:scale-105 transition-transform"
                    style="width: 40px; height: 40px; object-fit: cover;"
                    loading="lazy"
                  />
                  <span class="absolute -bottom-0.5 -right-0.5 px-0.5 rounded bg-black/80 text-[7px] font-bold text-emerald-400 border border-white/20">${prod.images?.length || 6}</span>
                </div>

                <!-- Title & Price in Center (strictly truncated & fixed!) -->
                <div class="min-w-0 flex-1 flex flex-col justify-center overflow-hidden pr-1">
                  <h4 class="text-xs font-bold text-white truncate block w-full leading-tight" title="${escapeHtml(prod.name)}">${escapeHtml(prod.name)}</h4>
                  <div class="flex items-center gap-1.5 mt-0.5 flex-nowrap overflow-hidden">
                    <span class="text-xs font-black text-emerald-400 shrink-0 leading-none">${escapeHtml(prod.price)}</span>
                    ${prod.originalPrice ? `<span class="text-[10px] text-zinc-400 line-through shrink-0 leading-none">${escapeHtml(prod.originalPrice)}</span>` : ''}
                    <span class="text-[8px] font-bold text-emerald-300 bg-emerald-950/80 px-1 py-0.2 rounded border border-emerald-500/30 shrink-0">Next Day</span>
                  </div>
                </div>

                <!-- Buy Button on Right -->
                <button
                  type="button"
                  data-buy-product-idx="${pIdx}"
                  class="buy-btn shrink-0 py-1.5 px-2.5 sm:px-3 rounded-xl bg-[#004643] hover:bg-[#003634] active:scale-95 text-white text-xs font-extrabold tracking-wide transition-all shadow-sm cursor-pointer flex items-center gap-1 border border-emerald-400/40"
                >
                  <span>Buy</span>
                  <svg class="w-3 h-3 text-emerald-300" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            `
              )
              .join('')}
          </div>
        </div>

      </div>

      <!-- Interactive Finger-Swipe Time Frame Scrubber Bar -->
      <div class="pt-0.5 select-none">
        <div
          class="progress-scrub-container relative w-full h-6 flex items-center cursor-pointer group"
          data-scrub-container
          title="Drag or click to scrub video time"
        >
          <!-- Floating Time Tooltip during finger swipe -->
          <div
            class="scrub-time-tooltip hidden absolute -top-7 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-black/90 border border-white/25 text-white font-mono text-[10px] font-bold pointer-events-none shadow-xl z-30 whitespace-nowrap"
            data-scrub-tooltip
          >
            0:00 / 0:00
          </div>

          <!-- Scrubber Track Line -->
          <div class="progress-bar-track relative w-full h-1.5 group-hover:h-2 bg-white/25 rounded-full overflow-hidden transition-all duration-150">
            <div class="progress-bar-fill w-0 h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-[width] duration-75"></div>
          </div>

          <!-- Circular Draggable Thumb that follows playhead & finger -->
          <div
            class="scrub-thumb absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-md ring-2 ring-emerald-400 group-hover:scale-125 transition-transform pointer-events-none"
            data-scrub-thumb
            style="left: 0%;"
          ></div>
        </div>
      </div>

    </div>
  `;

  // Element references
  const videoEl = container.querySelector('.reel-video');
  const speedBadge = container.querySelector('[data-speed-badge]');
  const playPauseBadge = container.querySelector('.play-pause-badge');
  const playIcon = container.querySelector('.play-icon');
  const pauseIcon = container.querySelector('.pause-icon');
  const progressBarFill = container.querySelector('.progress-bar-fill');
  const scrubContainer = container.querySelector('[data-scrub-container]');
  const scrubTooltip = container.querySelector('[data-scrub-tooltip]');
  const scrubThumb = container.querySelector('[data-scrub-thumb]');
  const muteBtn = container.querySelector('[data-reel-mute-btn]');
  const muteIcon = container.querySelector('.mute-icon');
  const unmuteIcon = container.querySelector('.unmute-icon');
  const likeBtn = container.querySelector('[data-reel-like-btn]');
  const likeBubble = container.querySelector('.like-bubble');
  const likeCountEl = container.querySelector('.like-count');
  const commentsBtn = container.querySelector('[data-reel-comments-btn]');
  const shareBtn = container.querySelector('[data-reel-share-btn]');
  const bookBtnTop = container.querySelector('[data-reel-book-btn]');
  const storeHeaderBtn = container.querySelector('[data-store-header-btn]');
  const backBtn = container.querySelector('[data-reel-back-btn]');
  const productTrack = container.querySelector('[data-product-track]');
  const productCounter = container.querySelector('[data-product-counter]');
  const productPrevBtn = container.querySelector('[data-product-prev-btn]');
  const productNextBtn = container.querySelector('[data-product-next-btn]');

  // Unmuted Video Playback with Strict Single-Audio Enforcement via mediaManager
  const playVideoWithAudio = () => {
    // Enforce strictly that this is the ONLY playing media element in the entire app!
    mediaManager.play(container, videoEl);

    videoEl.muted = isMuted; // isMuted is false by default (Sound ON!)
    const playPromise = videoEl.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        isPlaying = true;
      }).catch(() => {
        // If unmuted autoplay blocked by browser policy without prior gesture,
        // start playback muted temporarily and unmute automatically on first touch/click of THIS reel!
        if (!isMuted) {
          videoEl.muted = true;
          videoEl.play().then(() => {
            isPlaying = true;
          }).catch(() => {});

          const unlockThisReelAudio = () => {
            if (!isMuted && mediaManager.activeVideoEl === videoEl) {
              videoEl.muted = false;
              if (muteIcon) muteIcon.classList.add('hidden');
              if (unmuteIcon) unmuteIcon.classList.remove('hidden');
            }
            container.removeEventListener('click', unlockThisReelAudio, true);
            container.removeEventListener('touchstart', unlockThisReelAudio, true);
          };
          container.addEventListener('click', unlockThisReelAudio, { capture: true, once: true });
          container.addEventListener('touchstart', unlockThisReelAudio, { capture: true, once: true });
        }
      });
    }
  };

  // 2x Speed Hold Activation (Click & hold left, right, or center of video player)
  const activate2xSpeed = () => {
    isHolding2x = true;
    videoEl.playbackRate = 2.0;
    if (videoEl.paused) {
      videoEl.play().catch(() => {});
      isPlaying = true;
    }
    if (speedBadge) {
      speedBadge.classList.remove('hidden');
      speedBadge.classList.add('flex');
    }
  };

  // Automatically Return to Normal Speed Mode (1.0x) on Release
  const deactivate2xSpeed = () => {
    if (holdSpeedTimer) {
      clearTimeout(holdSpeedTimer);
      holdSpeedTimer = null;
    }
    if (isHolding2x) {
      isHolding2x = false;
      // Return to normal model / speed (1.0x)
      videoEl.playbackRate = 1.0;
      if (speedBadge) {
        speedBadge.classList.add('hidden');
        speedBadge.classList.remove('flex');
      }
      // Ensure video continues playing smoothly in normal mode
      if (videoEl.paused) {
        videoEl.play().catch(() => {});
        isPlaying = true;
      }
      justHeld2x = true;
      setTimeout(() => {
        justHeld2x = false;
      }, 450);
    }
  };

  const isInteractiveTarget = (target) => {
    return Boolean(
      target &&
      target.closest &&
      target.closest('button, [data-scrub-container], [data-product-track], a, input, textarea, select')
    );
  };

  let isPointerDownOnVideo = false;

  const handlePointerDown = (clientX, clientY, target) => {
    if (isInteractiveTarget(target)) {
      isPointerDownOnVideo = false;
      return;
    }
    isPointerDownOnVideo = true;
    touchStartPos = { x: clientX, y: clientY };
    hasMovedSignificantly = false;

    if (holdSpeedTimer) {
      clearTimeout(holdSpeedTimer);
      holdSpeedTimer = null;
    }

    // Activate 2x speed after holding for 160ms
    holdSpeedTimer = setTimeout(() => {
      activate2xSpeed();
    }, 160);
  };

  const handlePointerMove = (clientX, clientY) => {
    if (!holdSpeedTimer && !isHolding2x) return;
    const dx = Math.abs(clientX - touchStartPos.x);
    const dy = Math.abs(clientY - touchStartPos.y);

    if (!isHolding2x) {
      // If finger/mouse moves significantly before 160ms, user is swiping/scrolling feed
      if (dx > 14 || dy > 14) {
        if (holdSpeedTimer) {
          clearTimeout(holdSpeedTimer);
          holdSpeedTimer = null;
        }
        hasMovedSignificantly = true;
      }
    }
  };

  const handlePointerUp = () => {
    if (holdSpeedTimer) {
      clearTimeout(holdSpeedTimer);
      holdSpeedTimer = null;
    }

    if (!isPointerDownOnVideo) return; // Strictly ignore scrubber and button interactions!
    isPointerDownOnVideo = false;

    if (isHolding2x) {
      // User released hold: automatically return to normal mode!
      deactivate2xSpeed();
    } else if (!hasMovedSignificantly && !justHeld2x) {
      // Short click/tap (< 160ms): toggle play/pause
      togglePlay();
    }
  };

  // Wire pointer/mouse/touch down on container & video
  container.addEventListener('pointerdown', (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    handlePointerDown(e.clientX, e.clientY, e.target);
  });

  container.addEventListener('touchstart', (e) => {
    if (!e.touches || e.touches.length !== 1) return;
    handlePointerDown(e.touches[0].clientX, e.touches[0].clientY, e.target);
  }, { passive: true });

  // Move tracking on window
  window.addEventListener('pointermove', (e) => {
    handlePointerMove(e.clientX, e.clientY);
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!e.touches || e.touches.length === 0) return;
    handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  // Release tracking on window (guarantees return to normal mode wherever released!)
  window.addEventListener('pointerup', handlePointerUp);
  window.addEventListener('pointercancel', handlePointerUp);
  window.addEventListener('mouseup', handlePointerUp);
  window.addEventListener('touchend', handlePointerUp);
  window.addEventListener('touchcancel', handlePointerUp);

  // Suppress browser click if coming out of a 2x hold
  container.addEventListener('click', (e) => {
    if (justHeld2x || isHolding2x) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }, true);

  // Video Playback Logic
  const togglePlay = () => {
    if (justHeld2x || isHolding2x) return; // Prevent play/pause toggle when releasing 2x hold
    if (videoEl.paused) {
      playVideoWithAudio();
      showBadge('play');
    } else {
      videoEl.pause();
      isPlaying = false;
      showBadge('pause');
    }
  };

  const showBadge = (type) => {
    if (!playPauseBadge) return;
    if (type === 'play') {
      playIcon.classList.remove('hidden');
      pauseIcon.classList.add('hidden');
    } else {
      playIcon.classList.add('hidden');
      pauseIcon.classList.remove('hidden');
    }
    playPauseBadge.classList.remove('opacity-0', 'scale-75');
    playPauseBadge.classList.add('opacity-100', 'scale-100');
    setTimeout(() => {
      playPauseBadge.classList.remove('opacity-100', 'scale-100');
      playPauseBadge.classList.add('opacity-0', 'scale-75');
    }, 450);
  };

  // Time update updates progress fill & thumb position when not actively scrubbing
  videoEl.addEventListener('timeupdate', () => {
    if (isScrubbing) return;
    if (videoEl.duration) {
      const pct = (videoEl.currentTime / videoEl.duration) * 100;
      if (progressBarFill) progressBarFill.style.width = `${pct}%`;
      if (scrubThumb) scrubThumb.style.left = `${pct}%`;
    }
  });

  // REAL-TIME FINGER-SWIPE TIME FRAME SCRUBBING
  // Keeps audio and video in 100% exact synchronization on drag and release
  let scrubSeekTimeout = null;

  const updateScrubberUI = (clientX) => {
    if (!videoEl.duration || !scrubContainer) return 0;
    const rect = scrubContainer.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    scrubTargetTime = ratio * videoEl.duration;

    const pct = ratio * 100;
    if (progressBarFill) progressBarFill.style.width = `${pct}%`;
    if (scrubThumb) scrubThumb.style.left = `${pct}%`;

    if (scrubTooltip) {
      const curMin = Math.floor(scrubTargetTime / 60);
      const curSec = Math.floor(scrubTargetTime % 60).toString().padStart(2, '0');
      const durMin = Math.floor(videoEl.duration / 60);
      const durSec = Math.floor(videoEl.duration % 60).toString().padStart(2, '0');
      scrubTooltip.textContent = `${curMin}:${curSec} / ${durMin}:${durSec}`;
      scrubTooltip.style.left = `${pct}%`;
      scrubTooltip.classList.remove('hidden');
    }

    return scrubTargetTime;
  };

  const startScrubbing = (e) => {
    e.stopPropagation();
    isScrubbing = true;
    videoEl.pause();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    updateScrubberUI(clientX);

    const onMove = (moveEv) => {
      if (!isScrubbing) return;
      if (moveEv.cancelable) moveEv.preventDefault();
      const x = moveEv.touches ? moveEv.touches[0].clientX : moveEv.clientX;
      updateScrubberUI(x);
    };

    const onEnd = (endEv) => {
      if (!isScrubbing) return;
      isScrubbing = false;
      if (scrubTooltip) scrubTooltip.classList.add('hidden');

      if (endEv) {
        const x = endEv.changedTouches ? endEv.changedTouches[0].clientX : endEv.clientX;
        if (x !== undefined) updateScrubberUI(x);
      }

      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('touchcancel', onEnd);

      // Apply target time ONCE and synchronize audio & video on seeked
      if (isFinite(scrubTargetTime) && scrubTargetTime >= 0) {
        if (scrubSeekTimeout) {
          clearTimeout(scrubSeekTimeout);
          scrubSeekTimeout = null;
        }

        videoEl.currentTime = scrubTargetTime;

        const onSeekConfirmed = () => {
          videoEl.removeEventListener('seeked', onSeekConfirmed);
          if (scrubSeekTimeout) {
            clearTimeout(scrubSeekTimeout);
            scrubSeekTimeout = null;
          }
          playVideoWithAudio();
        };

        videoEl.addEventListener('seeked', onSeekConfirmed, { once: true });

        scrubSeekTimeout = setTimeout(() => {
          videoEl.removeEventListener('seeked', onSeekConfirmed);
          if (videoEl.paused && !isScrubbing) {
            playVideoWithAudio();
          }
        }, 200);
      } else {
        playVideoWithAudio();
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    window.addEventListener('touchcancel', onEnd);
  };

  scrubContainer?.addEventListener('mousedown', startScrubbing);
  scrubContainer?.addEventListener('touchstart', startScrubbing, { passive: false });

  // Suppress redundant click event on scrubContainer to prevent double-seek race conditions
  scrubContainer?.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
  });

  // Mute / Unmute
  muteBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    isMuted = !isMuted;
    videoEl.muted = isMuted;
    muteIcon.classList.toggle('hidden', !isMuted);
    unmuteIcon.classList.toggle('hidden', isMuted);
  });

  // Like button
  likeBtn?.addEventListener('click', async (e) => {
    e.stopPropagation();
    isLiked = !isLiked;
    likes = isLiked ? likes + 1 : Math.max(0, likes - 1);
    likeCountEl.textContent = likes;

    if (isLiked) {
      likeBubble.className =
        'like-bubble w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-rose-500 text-white shadow-lg shadow-rose-500/40 backdrop-blur-md flex items-center justify-center transition-all duration-200 scale-125';
      setTimeout(() => likeBubble.classList.remove('scale-125'), 200);
    } else {
      likeBubble.className =
        'like-bubble w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/60 text-white border border-white/25 hover:bg-black/80 backdrop-blur-md flex items-center justify-center transition-all duration-200';
    }

    const heartSvg = likeBubble.querySelector('svg');
    if (heartSvg) {
      heartSvg.className = `w-5 h-5 ${isLiked ? 'fill-current' : 'fill-none stroke-current'} transition-colors`;
    }

    await likeVideo(video.id);
  });

  // Comments drawer
  commentsBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    openCommentsDrawer(video, () => {
      commentsCount += 1;
      const countEl = container.querySelector('.comments-count');
      if (countEl) countEl.textContent = commentsCount;
    });
  });

  // Share modal (WhatsApp, Instagram, Copy Link)
  shareBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    openShareModal(video, () => {
      const shareCountEl = container.querySelector('.share-count');
      if (shareCountEl) {
        const count = parseInt(shareCountEl.textContent || '0', 10);
        shareCountEl.textContent = count + 1;
      }
    });
  });

  // Booking Modal
  const openBooking = (e) => {
    e.stopPropagation();
    openBookingModal({ id: video.storeId, name: video.storeName, city: video.city });
  };
  bookBtnTop?.addEventListener('click', openBooking);

  // Buy buttons for the 1-product single frame carousel
  container.querySelectorAll('[data-buy-product-idx]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pIdx = parseInt(btn.getAttribute('data-buy-product-idx'), 10);
      const selectedProd = products[pIdx] || products[0];
      openQuickBuyModal(selectedProd, video);
    });
  });

  // Open 4-Image Gallery on clicking product image thumbnail in the reel
  container.querySelectorAll('[data-open-gallery-idx]').forEach((imgBox) => {
    imgBox.addEventListener('click', (e) => {
      e.stopPropagation();
      const pIdx = parseInt(imgBox.getAttribute('data-open-gallery-idx'), 10);
      const selectedProd = products[pIdx] || products[0];
      openImageGalleryModal(selectedProd, video, () => {
        openQuickBuyModal(selectedProd, video);
      });
    });
  });

  // Back Button (Bottom Left)
  backBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (typeof onBackClick === 'function') {
      onBackClick();
    }
  });

  // Horizontal Product Track Navigation (Swipe / Arrows)
  const scrollToProduct = (idx) => {
    if (idx < 0 || idx >= products.length || !productTrack) return;
    currentProductIndex = idx;
    const frames = productTrack.querySelectorAll('.single-product-frame');
    if (frames[idx]) {
      frames[idx].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
    if (productCounter) {
      productCounter.textContent = `${idx + 1} of ${products.length}`;
    }
  };

  productPrevBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentProductIndex > 0) {
      scrollToProduct(currentProductIndex - 1);
    }
  });

  productNextBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentProductIndex < products.length - 1) {
      scrollToProduct(currentProductIndex + 1);
    }
  });

  // Update counter when user swipes with finger on product track
  productTrack?.addEventListener('scroll', () => {
    const width = productTrack.clientWidth;
    if (width > 0) {
      const idx = Math.round(productTrack.scrollLeft / width);
      if (idx !== currentProductIndex && idx >= 0 && idx < products.length) {
        currentProductIndex = idx;
        if (productCounter) {
          productCounter.textContent = `${idx + 1} of ${products.length}`;
        }
      }
    }
  });

  // Store click navigation
  storeHeaderBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (typeof onStoreClick === 'function') {
      onStoreClick(video);
    }
  });

  // Autoplay trigger if requested (plays with audio immediately inside user gesture stack)
  if (autoPlay) {
    playVideoWithAudio();
  }

  // Method to pause externally when user scrolls away
  container.pauseVideo = () => {
    deactivate2xSpeed();
    mediaManager.pause(videoEl);
    videoEl.pause();
    videoEl.muted = true;
    isPlaying = false;
  };

  container.playVideo = () => {
    deactivate2xSpeed();
    playVideoWithAudio();
  };

  // Method to completely tear down when leaving the page
  container.destroy = () => {
    deactivate2xSpeed();
    mediaManager.pause(videoEl);
    videoEl.pause();
    videoEl.muted = true;
    isPlaying = false;
    try {
      videoEl.removeAttribute('src');
      videoEl.load();
    } catch (e) {}
  };

  return container;
}
