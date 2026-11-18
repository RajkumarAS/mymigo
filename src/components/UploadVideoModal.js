// Upload Video / Post Reel Modal Component — Allows store profiles & sellers to upload videos with captions

import { escapeHtml } from '../utils/dom.js';
import { uploadVideo } from '../services/videoService.js';
import { uploadMediaFile } from '../services/profileService.js';

export function openUploadVideoModal(stores = [], onUploaded = null) {
  const existing = document.getElementById('mymigo-upload-video-modal');
  if (existing) existing.remove();

  let selectedVideoUrl = './uploads/diwali_sale_kurtis.mp4';
  let uploadedFileBase64 = null;
  let uploadedFileName = '';

  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'mymigo-upload-video-modal';
  modalOverlay.className =
    'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fade-in';

  modalOverlay.innerHTML = `
    <div class="relative w-full max-w-lg bg-[#141416] text-[#F4F4F5] rounded-3xl border border-[#27272A] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-scale-in">
      <!-- Modal Header -->
      <div class="px-5 py-4 border-b border-[#27272A] flex items-center justify-between bg-[#18181B] shrink-0">
        <div class="flex items-center gap-2.5">
          <span class="w-8 h-8 rounded-xl bg-[#004643] text-white flex items-center justify-center text-xs font-bold">
            🎬
          </span>
          <div>
            <h3 class="text-sm sm:text-base font-bold text-white">Post a Reel / Video</h3>
            <p class="text-[11px] text-[#A1A1AA]">Share your latest boutique arrivals with shoppers</p>
          </div>
        </div>

        <button
          type="button"
          id="close-upload-modal-btn"
          class="w-8 h-8 rounded-full bg-[#27272A] text-[#A1A1AA] hover:text-white flex items-center justify-center text-xs font-bold cursor-pointer"
        >
          ✕
        </button>
      </div>

      <!-- Modal Body (Scrollable) -->
      <form id="upload-video-form" class="overflow-y-auto flex-1 p-5 sm:p-6 space-y-4 text-xs">
        <!-- Store / Profile Selection -->
        <div>
          <label class="block font-semibold text-[#E4E4E7] mb-1.5" for="upload-store-select">
            Select Store / Profile *
          </label>
          <select
            id="upload-store-select"
            class="w-full px-3.5 py-2.5 rounded-xl bg-[#27272A] border border-[#3F3F46] text-white focus:border-[#004643] outline-none"
          >
            ${stores.map(
              (s) => `<option value="${escapeHtml(s.id)}" data-name="${escapeHtml(s.name)}" data-city="${escapeHtml(s.city)}" data-handle="${escapeHtml(s.handle || '')}" data-avatar="${escapeHtml(s.image || '')}">${escapeHtml(s.name)} (${escapeHtml(s.city)})</option>`
            ).join('')}
          </select>
        </div>

        <!-- Video Selection / Upload -->
        <div>
          <label class="block font-semibold text-[#E4E4E7] mb-1.5">
            Video Source *
          </label>
          
          <div class="p-3 rounded-2xl bg-[#1C1C20] border border-[#27272A] space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-semibold text-[#A1A1AA]">Choose upload method:</span>
              <span class="text-[10px] text-emerald-400 font-medium">MP4 / WEBM (up to 30MB)</span>
            </div>

            <!-- Quick Template Video Button -->
            <button
              type="button"
              id="use-attached-video-btn"
              class="w-full py-2 px-3 rounded-xl bg-[#004643]/20 hover:bg-[#004643]/35 border border-[#004643]/50 text-white font-medium flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div class="flex items-center gap-2">
                <span class="text-base">🎥</span>
                <div>
                  <p class="font-bold text-white text-[11px]">Diwali Kurtis Video (Attached)</p>
                  <p class="text-[10px] text-[#A1A1AA]">Pre-loaded Festive Kurti Sale Video</p>
                </div>
              </div>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-[#004643] text-white font-semibold">Active</span>
            </button>

            <!-- File Upload input -->
            <div class="relative">
              <input
                type="file"
                id="upload-file-input"
                accept="video/mp4,video/webm,video/quicktime"
                class="hidden"
              />
              <button
                type="button"
                id="browse-video-btn"
                class="w-full py-2.5 px-3 rounded-xl bg-[#27272A] hover:bg-[#323236] border border-[#3F3F46] text-[#E4E4E7] font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <svg class="w-4 h-4 text-[#A1A1AA]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span id="browse-btn-text">Or Upload Video from Device</span>
              </button>
            </div>

            <!-- Video Player Preview -->
            <div id="upload-preview-container" class="rounded-xl overflow-hidden bg-black max-h-48 flex items-center justify-center border border-[#3F3F46]">
              <video
                id="upload-video-preview"
                src="./uploads/diwali_sale_kurtis.mp4"
                controls
                playsinline
                class="max-h-48 w-auto mx-auto object-contain"
              ></video>
            </div>
          </div>
        </div>

        <!-- Caption Textarea -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="font-semibold text-[#E4E4E7]" for="upload-caption">
              Caption *
            </label>
            <span class="text-[10px] text-[#71717A]" id="caption-count">0 / 300</span>
          </div>
          <textarea
            id="upload-caption"
            rows="3"
            required
            maxlength="300"
            placeholder="Write an engaging caption, mention kurti prices (e.g. ₹1,200+), sizing, fabric, and styling tips..."
            class="w-full px-3.5 py-2.5 rounded-xl bg-[#27272A] border border-[#3F3F46] text-white placeholder-[#71717A] focus:border-[#004643] outline-none resize-none leading-relaxed"
          >Diwali Kurti Special Sale! ✨ Pure breathable cotton and festive collections starting ₹1,200. S to 3XL available now!</textarea>
        </div>

        <div id="upload-error-box" class="hidden p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs"></div>

        <button
          type="submit"
          id="publish-video-btn"
          class="w-full py-3 px-4 rounded-xl font-bold bg-[#004643] text-white hover:bg-[#003634] transition-all shadow-md text-sm cursor-pointer"
        >
          Publish Reel
        </button>
      </form>
    </div>
  `;

  document.body.appendChild(modalOverlay);

  const closeModal = () => modalOverlay.remove();
  modalOverlay.querySelector('#close-upload-modal-btn')?.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  const fileInput = modalOverlay.querySelector('#upload-file-input');
  const browseBtn = modalOverlay.querySelector('#browse-video-btn');
  const browseText = modalOverlay.querySelector('#browse-btn-text');
  const previewVideo = modalOverlay.querySelector('#upload-video-preview');
  const captionInput = modalOverlay.querySelector('#upload-caption');
  const captionCount = modalOverlay.querySelector('#caption-count');
  const useAttachedBtn = modalOverlay.querySelector('#use-attached-video-btn');
  const form = modalOverlay.querySelector('#upload-video-form');
  const publishBtn = modalOverlay.querySelector('#publish-video-btn');
  const errorBox = modalOverlay.querySelector('#upload-error-box');

  captionInput?.addEventListener('input', () => {
    if (captionCount) captionCount.textContent = `${captionInput.value.length} / 300`;
  });

  useAttachedBtn?.addEventListener('click', () => {
    selectedVideoUrl = './uploads/diwali_sale_kurtis.mp4';
    uploadedFileBase64 = null;
    if (previewVideo) previewVideo.src = selectedVideoUrl;
    if (browseText) browseText.textContent = 'Or Upload Video from Device';
  });

  browseBtn?.addEventListener('click', () => fileInput?.click());

  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 30 * 1024 * 1024) {
      if (errorBox) {
        errorBox.textContent = 'File exceeds maximum 30MB limit.';
        errorBox.classList.remove('hidden');
      }
      return;
    }

    uploadedFileName = file.name;
    const reader = new FileReader();
    reader.onload = (evt) => {
      uploadedFileBase64 = evt.target.result;
      selectedVideoUrl = uploadedFileBase64;
      if (previewVideo) previewVideo.src = selectedVideoUrl;
      if (browseText) browseText.textContent = `Selected: ${file.name.slice(0, 24)}...`;
      if (errorBox) errorBox.classList.add('hidden');
    };
    reader.readAsDataURL(file);
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (errorBox) errorBox.classList.add('hidden');

    const selectEl = modalOverlay.querySelector('#upload-store-select');
    const selectedOpt = selectEl?.selectedOptions[0];
    const storeId = selectEl?.value || 'store-custom';
    const storeName = selectedOpt?.getAttribute('data-name') || 'Partner Boutique';
    const city = selectedOpt?.getAttribute('data-city') || 'Coimbatore';
    const handle = selectedOpt?.getAttribute('data-handle') || 'mymigo';
    const avatar = selectedOpt?.getAttribute('data-avatar') || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=200&q=80';
    const caption = captionInput?.value.trim();

    if (!caption) {
      if (errorBox) {
        errorBox.textContent = 'Please enter a caption for your reel.';
        errorBox.classList.remove('hidden');
      }
      return;
    }

    publishBtn.disabled = true;
    publishBtn.textContent = 'Publishing reel...';

    try {
      let finalVideoUrl = './uploads/diwali_sale_kurtis.mp4';
      if (uploadedFileBase64) {
        // Upload base64 file to server /api/upload
        const upRes = await uploadMediaFile(uploadedFileName || 'video.mp4', uploadedFileBase64);
        if (upRes && upRes.url) {
          finalVideoUrl = upRes.url;
        }
      }

      const videoPayload = {
        storeId,
        storeName,
        handle,
        city,
        avatar,
        poster: avatar,
        videoUrl: finalVideoUrl,
        caption,
        tags: ['DiwaliSale', 'Kurtis', 'FestiveWear'],
        likesCount: 1,
      };

      const result = await uploadVideo(videoPayload);
      if (result && result.ok) {
        closeModal();
        if (typeof onUploaded === 'function') onUploaded(result.video);
      } else {
        if (errorBox) {
          errorBox.textContent = result?.error || 'Failed to publish reel.';
          errorBox.classList.remove('hidden');
        }
        publishBtn.disabled = false;
        publishBtn.textContent = 'Publish Reel';
      }
    } catch (err) {
      if (errorBox) {
        errorBox.textContent = err.message || 'Error uploading video.';
        errorBox.classList.remove('hidden');
      }
      publishBtn.disabled = false;
      publishBtn.textContent = 'Publish Reel';
    }
  });
}
