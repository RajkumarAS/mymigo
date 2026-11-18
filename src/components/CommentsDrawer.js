// Comments Drawer Component — Interactive slide-up comments panel for Reels

import { escapeHtml } from '../utils/dom.js';
import { commentVideo } from '../services/videoService.js';

export function openCommentsDrawer(video, onCommentAdded = null) {
  const existing = document.getElementById('mymigo-comments-drawer');
  if (existing) existing.remove();

  const commentsList = Array.isArray(video.comments) ? video.comments : [
    {
      id: 'c-1',
      userName: 'Priya Raman',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      text: 'Are these kurtis available in XXL size? Looking for festive pooja wear.',
      timeAgo: '2h ago',
    },
    {
      id: 'c-2',
      userName: 'Ananya S',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      text: 'Colors are so vibrant! Booked a live session to see the purple one.',
      timeAgo: '4h ago',
    },
    {
      id: 'c-3',
      userName: 'Kavitha N',
      userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
      text: 'Price is so reasonable starting ₹1,200. Does it include dupatta?',
      timeAgo: '1d ago',
    },
  ];

  const drawerOverlay = document.createElement('div');
  drawerOverlay.id = 'mymigo-comments-drawer';
  drawerOverlay.className =
    'fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-fade-in';

  drawerOverlay.innerHTML = `
    <div class="relative w-full max-w-lg bg-[#18181B] text-[#F4F4F5] rounded-t-3xl sm:rounded-3xl border border-[#27272A] shadow-2xl flex flex-col max-h-[80vh] h-[520px] animate-slide-up">
      <!-- Drawer Header -->
      <div class="px-5 py-4 border-b border-[#27272A] flex items-center justify-between shrink-0">
        <div class="flex items-center gap-2">
          <h3 class="text-sm sm:text-base font-bold text-white">
            Comments
          </h3>
          <span id="drawer-comments-count" class="px-2 py-0.5 rounded-full bg-[#27272A] text-xs font-semibold text-[#A1A1AA]">
            ${video.commentsCount || commentsList.length}
          </span>
        </div>

        <button
          type="button"
          id="close-comments-drawer-btn"
          class="w-7 h-7 rounded-full bg-[#27272A] text-[#A1A1AA] hover:text-white flex items-center justify-center text-xs font-bold cursor-pointer"
        >
          ✕
        </button>
      </div>

      <!-- Comments Stream -->
      <div id="drawer-comments-stream" class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        ${commentsList
          .map(
            (c) => `
          <div class="flex items-start gap-3">
            <img
              src="${escapeHtml(c.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80')}"
              alt="${escapeHtml(c.userName)}"
              class="w-8 h-8 rounded-full object-cover border border-[#3F3F46] shrink-0"
            />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-white truncate">${escapeHtml(c.userName)}</span>
                <span class="text-[10px] text-[#71717A]">${escapeHtml(c.timeAgo || 'Just now')}</span>
              </div>
              <p class="text-xs text-[#D4D4D8] mt-0.5 leading-relaxed break-words">${escapeHtml(c.text)}</p>
            </div>
          </div>
        `
          )
          .join('')}
      </div>

      <!-- Add Comment Form -->
      <form id="drawer-comment-form" class="p-3 sm:p-4 border-t border-[#27272A] bg-[#141416] shrink-0">
        <div class="flex items-center gap-2.5">
          <input
            type="text"
            id="drawer-comment-input"
            required
            placeholder="Add a comment for ${escapeHtml(video.storeName)}..."
            class="flex-1 px-4 py-2.5 rounded-full bg-[#27272A] border border-[#3F3F46] text-xs text-white placeholder-[#71717A] focus:border-[#004643] focus:ring-1 focus:ring-[#004643] outline-none"
          />
          <button
            type="submit"
            id="drawer-comment-submit"
            class="px-4 py-2.5 rounded-full text-xs font-semibold bg-[#004643] text-white hover:bg-[#003634] transition-colors shrink-0 cursor-pointer"
          >
            Post
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(drawerOverlay);

  const closeDrawer = () => drawerOverlay.remove();
  drawerOverlay.querySelector('#close-comments-drawer-btn')?.addEventListener('click', closeDrawer);
  drawerOverlay.addEventListener('click', (e) => {
    if (e.target === drawerOverlay) closeDrawer();
  });

  const form = drawerOverlay.querySelector('#drawer-comment-form');
  const input = drawerOverlay.querySelector('#drawer-comment-input');
  const stream = drawerOverlay.querySelector('#drawer-comments-stream');
  const countEl = drawerOverlay.querySelector('#drawer-comments-count');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input?.value.trim();
    if (!text) return;

    input.value = '';
    const newCommentObj = {
      userName: 'You (Shopper)',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      text,
      timeAgo: 'Just now',
    };

    // Prepend to stream
    const commentEl = document.createElement('div');
    commentEl.className = 'flex items-start gap-3 animate-fade-in';
    commentEl.innerHTML = `
      <img
        src="${escapeHtml(newCommentObj.userAvatar)}"
        alt="${escapeHtml(newCommentObj.userName)}"
        class="w-8 h-8 rounded-full object-cover border border-[#004643] shrink-0"
      />
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-white truncate">${escapeHtml(newCommentObj.userName)}</span>
          <span class="text-[10px] text-emerald-400 font-semibold">${escapeHtml(newCommentObj.timeAgo)}</span>
        </div>
        <p class="text-xs text-[#D4D4D8] mt-0.5 leading-relaxed break-words">${escapeHtml(newCommentObj.text)}</p>
      </div>
    `;
    stream.prepend(commentEl);
    stream.scrollTop = 0;

    const currentCount = parseInt(countEl?.textContent || '0', 10);
    if (countEl) countEl.textContent = currentCount + 1;

    await commentVideo(video.id, text, 'You (Shopper)', newCommentObj.userAvatar);
    if (typeof onCommentAdded === 'function') onCommentAdded();
  });

  setTimeout(() => input?.focus(), 150);
}
