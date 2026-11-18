// Share Modal Component — Allows sharing video to WhatsApp, Instagram, or Copying Link

import { escapeHtml } from '../utils/dom.js';
import { shareVideo } from '../services/videoService.js';
import { openInstagramUrl } from '../services/instagramHelper.js';

export function openShareModal(video, onShared = null) {
  const existing = document.getElementById('mymigo-share-modal');
  if (existing) existing.remove();

  const shareText = `Check out this festive kurti collection from ${video.storeName} (${video.city}) on MyMigo! Live in-store shopping assistance available.`;
  const shareUrl = `${window.location.origin}/#/finds?video=${encodeURIComponent(video.id)}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
  const storeInstagramUrl = video.instagramUrl || video.storeInstagramUrl || `https://www.instagram.com/${video.handle}/`;

  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'mymigo-share-modal';
  modalOverlay.className =
    'fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-sm animate-fade-in';

  modalOverlay.innerHTML = `
    <div class="relative w-full max-w-md bg-[#18181B] text-[#F4F4F5] rounded-3xl border border-[#27272A] shadow-2xl p-6 sm:p-7 space-y-5 animate-scale-in">
      <div class="flex items-center justify-between pb-3 border-b border-[#27272A]">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-full bg-[#004643] text-white flex items-center justify-center text-xs font-bold">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </div>
          <div>
            <h3 class="text-sm sm:text-base font-bold text-white">Share Video</h3>
            <p class="text-[11px] text-[#A1A1AA] truncate">${escapeHtml(video.storeName)} • ${escapeHtml(video.city)}</p>
          </div>
        </div>

        <button
          type="button"
          id="close-share-modal-btn"
          class="w-8 h-8 rounded-full bg-[#27272A] text-[#A1A1AA] hover:text-white flex items-center justify-center text-xs font-bold cursor-pointer"
        >
          ✕
        </button>
      </div>

      <!-- Quick Action Buttons -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <!-- WhatsApp -->
        <a
          href="${escapeHtml(whatsappUrl)}"
          target="_blank"
          rel="noopener noreferrer"
          id="share-whatsapp-btn"
          class="flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold text-xs sm:text-sm transition-all shadow-md cursor-pointer"
        >
          <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.072-2.123-.526-1.748-.73-2.853-2.518-2.94-2.634-.087-.116-.708-.941-.708-1.794s.448-1.273.607-1.446c.159-.174.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.087-.179.182-.077.357.101.174.45 0.741.966 1.201.666.592 1.229.775 1.402.862.173.087.275.072.376-.044.101-.116.434-.506.549-.68.116-.174.231-.145.39-.087s1.011.477 1.184.564.289.13.332.203c.044.072.044.42-.1.825z"/>
          </svg>
          <span>Share to WhatsApp</span>
        </a>

        <!-- Instagram -->
        <button
          type="button"
          id="share-instagram-btn"
          class="flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-95 text-white font-semibold text-xs sm:text-sm transition-all shadow-md cursor-pointer"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
          <span>Share on Instagram</span>
        </button>
      </div>

      <!-- Copy Direct Link -->
      <div class="space-y-1.5 pt-2">
        <label class="block text-xs font-semibold text-[#A1A1AA]">Copy Link</label>
        <div class="flex items-center gap-2">
          <input
            type="text"
            readonly
            id="share-link-input"
            value="${escapeHtml(shareUrl)}"
            class="flex-1 px-3 py-2.5 rounded-xl bg-[#27272A] border border-[#3F3F46] text-xs text-[#E4E4E7] focus:outline-none select-all"
          />
          <button
            type="button"
            id="copy-share-link-btn"
            class="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#004643] text-white hover:bg-[#003634] transition-colors shrink-0 cursor-pointer"
          >
            Copy Link
          </button>
        </div>
        <p id="share-copy-toast" class="hidden text-xs text-emerald-400 font-semibold pt-1">
          ✓ Link copied to clipboard!
        </p>
      </div>
    </div>
  `;

  document.body.appendChild(modalOverlay);

  const closeModal = () => modalOverlay.remove();

  modalOverlay.querySelector('#close-share-modal-btn')?.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  modalOverlay.querySelector('#share-whatsapp-btn')?.addEventListener('click', async () => {
    await shareVideo(video.id);
    if (typeof onShared === 'function') onShared();
  });

  modalOverlay.querySelector('#share-instagram-btn')?.addEventListener('click', async (e) => {
    await shareVideo(video.id);
    if (typeof onShared === 'function') onShared();
    openInstagramUrl(e, storeInstagramUrl);
  });

  const copyBtn = modalOverlay.querySelector('#copy-share-link-btn');
  const toast = modalOverlay.querySelector('#share-copy-toast');
  copyBtn?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      await shareVideo(video.id);
      if (typeof onShared === 'function') onShared();
      if (toast) {
        toast.classList.remove('hidden');
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          toast.classList.add('hidden');
          copyBtn.textContent = 'Copy Link';
        }, 2500);
      }
    } catch {
      // fallback
      const input = modalOverlay.querySelector('#share-link-input');
      input?.select();
      document.execCommand('copy');
    }
  });
}
