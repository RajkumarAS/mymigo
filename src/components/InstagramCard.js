// Video / Reel Card Component for Home & Finds
// Features native video player, like/comments/share (WhatsApp & Instagram), and store connection.

import { openInstagramUrl } from '../services/instagramHelper.js';
import { likeVideo } from '../services/videoService.js';
import { openCommentsDrawer } from './CommentsDrawer.js';
import { openShareModal } from './ShareModal.js';
import { escapeHtml } from '../utils/dom.js';

export function createInstagramCard(video, onViewStore) {
  const card = document.createElement('article');
  card.className =
    'w-full max-w-[420px] mx-auto bg-white rounded-3xl border border-[#DCD6C9] overflow-hidden flex flex-col transition-all duration-300 hover:shadow-[0_20px_45px_-15px_rgba(0,70,67,0.18)]';

  const videoSrc = video.videoUrl || './uploads/diwali_sale_kurtis.mp4';
  const posterSrc = video.poster || video.posterImage || video.avatar || '';
  const storeProfileUrl = video.storeInstagramUrl || video.instagramUrl || `https://www.instagram.com/${video.handle}/`;
  let likes = video.likesCount || 0;
  let isLiked = Boolean(video.isLiked);
  let commentsCount = video.commentsCount || (video.comments ? video.comments.length : 18);

  card.innerHTML = `
    <!-- Video Player Container with Custom Controls -->
    <div class="relative aspect-[9/12] bg-[#0E0E10] overflow-hidden group">
      <video
        class="card-video w-full h-full object-cover cursor-pointer"
        src="${escapeHtml(videoSrc)}"
        poster="${escapeHtml(posterSrc)}"
        playsinline
        loop
        muted
        preload="metadata"
      ></video>

      <!-- Top Overlay Bar: City & Category Tag -->
      <div class="absolute top-3 inset-x-3 flex items-center justify-between z-10 pointer-events-none">
        <span class="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-bold pointer-events-auto shadow-sm">
          ${escapeHtml(video.city)}
        </span>
        <span class="px-2.5 py-1 rounded-full bg-[#004643]/90 text-emerald-200 text-[11px] font-bold border border-emerald-400/30 pointer-events-auto">
          Festive Kurti Edit
        </span>
      </div>

      <!-- Center Play/Pause Floating Button -->
      <button
        type="button"
        data-card-play-btn
        aria-label="Play Video"
        class="card-play-badge absolute inset-0 m-auto w-14 h-14 rounded-full bg-white/90 hover:bg-white text-[#004643] flex items-center justify-center shadow-xl transition-all duration-200 z-10 cursor-pointer group-hover:scale-105"
      >
        <svg class="play-svg w-7 h-7 fill-current ml-1" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
        <svg class="pause-svg hidden w-7 h-7 fill-current" viewBox="0 0 24 24">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>
      </button>

      <!-- Bottom Audio / Scrubber Overlay -->
      <div class="absolute bottom-3 inset-x-3 flex items-center justify-between z-10">
        <button
          type="button"
          data-card-mute-btn
          aria-label="Toggle Sound"
          class="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center cursor-pointer hover:bg-black/80 transition-colors"
        >
          <svg class="mute-svg w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
          </svg>
          <svg class="unmute-svg hidden w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        </button>

        <a
          href="#/finds?video=${encodeURIComponent(video.id)}"
          class="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold hover:bg-black/80 transition-colors flex items-center gap-1.5"
        >
          <span>Full Reel</span>
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
          </svg>
        </a>
      </div>

      <!-- Tiny Progress Bar -->
      <div class="absolute bottom-0 inset-x-0 h-1 bg-white/20">
        <div class="card-progress-bar h-full w-0 bg-emerald-400 transition-all duration-100"></div>
      </div>
    </div>

    <!-- Video Info & Social Action Buttons -->
    <div class="p-5 flex flex-col flex-1 space-y-3">
      <!-- Boutique Store Row -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5 min-w-0">
          <img
            src="${escapeHtml(video.avatar || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=150&q=80')}"
            alt="${escapeHtml(video.storeName)}"
            class="w-7 h-7 rounded-full object-cover ring-1 ring-[#004643] shrink-0"
          />
          <span class="text-xs font-bold text-[#141413] truncate">${escapeHtml(video.storeName)}</span>
        </div>
        <span class="text-[11px] font-mono text-[#78716C]">@${escapeHtml(video.handle || video.storeName)}</span>
      </div>

      <!-- Caption -->
      <p class="text-xs text-[#57534E] leading-relaxed line-clamp-2 flex-1">
        ${escapeHtml(video.caption || video.title || 'Diwali Special Kurti Collection available now!')}
      </p>

      <!-- Social Interaction Bar: Like, Comments, Share -->
      <div class="pt-3 border-t border-[#E7E3D9] flex items-center justify-between text-xs font-semibold text-[#57534E]">
        <div class="flex items-center gap-4">
          <!-- Like Button -->
          <button
            type="button"
            data-card-like-btn
            class="flex items-center gap-1.5 hover:text-rose-600 transition-colors cursor-pointer"
          >
            <svg class="like-icon w-4.5 h-4.5 ${isLiked ? 'fill-rose-500 text-rose-500' : 'fill-none stroke-current'}" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span class="like-label">${likes}</span>
          </button>

          <!-- Comments Button -->
          <button
            type="button"
            data-card-comment-btn
            class="flex items-center gap-1.5 hover:text-[#004643] transition-colors cursor-pointer"
          >
            <svg class="w-4.5 h-4.5 fill-none stroke-current" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span class="comments-label">${commentsCount}</span>
          </button>

          <!-- Share Button (WhatsApp / Instagram) -->
          <button
            type="button"
            data-card-share-btn
            class="flex items-center gap-1.5 hover:text-[#004643] transition-colors cursor-pointer"
          >
            <svg class="w-4.5 h-4.5 fill-none stroke-current" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span>Share</span>
          </button>
        </div>

        <button
          type="button"
          data-view-store-btn
          class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#004643] text-white hover:bg-[#003634] transition-colors cursor-pointer"
        >
          <span>Store</span>
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  `;

  const videoEl = card.querySelector('.card-video');
  const playBtn = card.querySelector('[data-card-play-btn]');
  const playSvg = card.querySelector('.play-svg');
  const pauseSvg = card.querySelector('.pause-svg');
  const muteBtn = card.querySelector('[data-card-mute-btn]');
  const muteSvg = card.querySelector('.mute-svg');
  const unmuteSvg = card.querySelector('.unmute-svg');
  const progressBar = card.querySelector('.card-progress-bar');
  const likeBtn = card.querySelector('[data-card-like-btn]');
  const likeIcon = card.querySelector('.like-icon');
  const likeLabel = card.querySelector('.like-label');
  const commentBtn = card.querySelector('[data-card-comment-btn]');
  const shareBtn = card.querySelector('[data-card-share-btn]');
  const viewStoreBtn = card.querySelector('[data-view-store-btn]');

  const togglePlay = () => {
    if (videoEl.paused) {
      videoEl.play().then(() => {
        playSvg.classList.add('hidden');
        pauseSvg.classList.remove('hidden');
      }).catch(() => {});
    } else {
      videoEl.pause();
      playSvg.classList.remove('hidden');
      pauseSvg.classList.add('hidden');
    }
  };

  videoEl.addEventListener('click', togglePlay);
  playBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlay();
  });

  videoEl.addEventListener('timeupdate', () => {
    if (videoEl.duration) {
      const pct = (videoEl.currentTime / videoEl.duration) * 100;
      if (progressBar) progressBar.style.width = `${pct}%`;
    }
  });

  videoEl.addEventListener('ended', () => {
    playSvg.classList.remove('hidden');
    pauseSvg.classList.add('hidden');
  });

  muteBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    videoEl.muted = !videoEl.muted;
    muteSvg.classList.toggle('hidden', !videoEl.muted);
    unmuteSvg.classList.toggle('hidden', videoEl.muted);
  });

  likeBtn?.addEventListener('click', async (e) => {
    e.stopPropagation();
    isLiked = !isLiked;
    likes = isLiked ? likes + 1 : Math.max(0, likes - 1);
    likeLabel.textContent = likes;
    likeIcon.className = `like-icon w-4.5 h-4.5 ${isLiked ? 'fill-rose-500 text-rose-500' : 'fill-none stroke-current'}`;
    await likeVideo(video.id);
  });

  commentBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    openCommentsDrawer(video, () => {
      commentsCount += 1;
      const lbl = card.querySelector('.comments-label');
      if (lbl) lbl.textContent = commentsCount;
    });
  });

  shareBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    openShareModal(video);
  });

  viewStoreBtn?.addEventListener('click', () => {
    if (typeof onViewStore === 'function') {
      onViewStore(video);
    }
  });

  return card;
}
