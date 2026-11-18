// Admin Sellers Tab — Review, inspect uploaded images & videos, and edit Seller Profiles & Stores

import { fetchSellers, saveSeller, deleteSeller, uploadMediaFile } from '../services/profileService.js';
import { renderStoreBadge } from '../components/StoreCard.js';
import { escapeHtml } from '../utils/dom.js';

export function createAdminSellersTab(container, showToast, onCountUpdate) {
  let sellers = [];
  let searchQuery = '';

  async function loadData() {
    try {
      sellers = await fetchSellers();
      if (typeof onCountUpdate === 'function') onCountUpdate(sellers.length);
      render();
    } catch {
      showToast('Failed to load seller profiles.', 'error');
    }
  }

  function render() {
    const filtered = sellers.filter((s) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        (s.storeName && s.storeName.toLowerCase().includes(q)) ||
        (s.ownerName && s.ownerName.toLowerCase().includes(q)) ||
        (s.city && s.city.toLowerCase().includes(q)) ||
        (s.category && s.category.toLowerCase().includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.phone && s.phone.toLowerCase().includes(q))
      );
    });

    container.innerHTML = `
      <section class="bg-white rounded-3xl border border-[#DCD6C9] p-6 sm:p-8 shadow-xs">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#E7E3D9] gap-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold uppercase tracking-wider text-[#004643]">Seller Directory</span>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#004643]/10 text-[#004643]">
                ${sellers.length} Stores
              </span>
            </div>
            <h2 class="text-xl sm:text-2xl font-bold text-[#141413] mt-1">Seller Profiles & Media</h2>
            <p class="text-xs sm:text-sm text-[#57534E]">
              Inspect who created seller profiles, view their uploaded images & videos, and edit backend store settings.
            </p>
          </div>

          <button
            type="button"
            id="admin-add-seller-btn"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-[#004643] text-white hover:bg-[#003634] active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Add New Seller Store</span>
          </button>
        </div>

        <!-- Search Bar -->
        <div class="mt-5 flex items-center gap-3">
          <div class="relative flex-1">
            <svg class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78716C]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              id="admin-seller-search-input"
              value="${escapeHtml(searchQuery)}"
              placeholder="Search by store name, owner, city, category, or contact..."
              class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DCD6C9] text-xs sm:text-sm bg-[#FDFBF7] focus:outline-none focus:border-[#004643]"
            />
          </div>
          ${
            searchQuery
              ? `
            <button
              type="button"
              id="admin-seller-search-clear"
              class="px-3 py-2 rounded-xl text-xs font-semibold text-[#57534E] hover:text-[#141413] hover:bg-[#F0EDE5]"
            >
              Clear
            </button>
          `
              : ''
          }
        </div>

        <!-- Sellers List -->
        <div class="mt-6">
          ${
            filtered.length === 0
              ? `
            <div class="py-12 text-center border-2 border-dashed border-[#DCD6C9] rounded-2xl p-6">
              <p class="text-sm font-semibold text-[#141413]">No seller profiles found</p>
              <p class="text-xs text-[#57534E] mt-1">Try adjusting your search or add a new seller store profile above.</p>
            </div>
          `
              : `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
              ${filtered
                .map((seller) => {
                  const isDirectVideo =
                    seller.videoUrl &&
                    (seller.videoUrl.includes('.mp4') ||
                      seller.videoUrl.includes('.webm') ||
                      seller.videoUrl.includes('.mov') ||
                      seller.videoUrl.startsWith('./uploads/'));
                  const badgeHtml = renderStoreBadge(seller.badge || '', seller.rating);

                  return `
                  <div class="p-5 rounded-2xl bg-[#F8F6F0] border border-[#E7E3D9] flex flex-col justify-between hover:shadow-xs transition-shadow">
                    <div>
                      <!-- Store Header Info -->
                      <div class="flex items-start justify-between gap-3">
                        <div>
                          <div class="flex items-center gap-2">
                            <h3 class="text-base font-bold text-[#141413] leading-snug">${escapeHtml(seller.storeName)}</h3>
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              seller.active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
                            }">
                              ${seller.active ? 'Live Store' : 'Inactive'}
                            </span>
                          </div>
                          <p class="text-xs text-[#57534E] mt-0.5">
                            Owner: <span class="font-semibold text-[#141413]">${escapeHtml(seller.ownerName || 'Verified Partner')}</span>
                            &bull; ${escapeHtml(seller.city)} &bull; ${escapeHtml(seller.category)}
                          </p>
                          <div class="flex items-center gap-3 text-xs text-[#004643] mt-1">
                            <span>${escapeHtml(seller.phone || 'No phone')}</span>
                            <span>&bull;</span>
                            <span class="text-[#57534E]">${escapeHtml(seller.email || 'No email')}</span>
                          </div>
                        </div>

                        ${
                          seller.instagramUrl
                            ? `
                          <a
                            href="${escapeHtml(seller.instagramUrl)}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="w-8 h-8 rounded-full border border-[#DCD6C9] bg-white text-[#141413] hover:text-[#004643] hover:border-[#004643] flex items-center justify-center transition-colors shrink-0 shadow-2xs"
                            title="Open Instagram"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                              <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"></path>
                              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                            </svg>
                          </a>
                        `
                            : ''
                        }
                      </div>

                      <!-- Media Previews: Uploaded Image & Uploaded Video -->
                      <div class="mt-4 grid grid-cols-2 gap-3">
                        <!-- Uploaded Image -->
                        <div class="space-y-1">
                          <span class="text-[10px] font-bold uppercase tracking-wider text-[#78716C]">Uploaded Store Image:</span>
                          <div class="relative aspect-4/3 rounded-xl overflow-hidden bg-stone-200 border border-[#DCD6C9] shadow-2xs group">
                            <img src="${escapeHtml(seller.image)}" alt="${escapeHtml(seller.storeName)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            <a
                              href="${escapeHtml(seller.image)}"
                              target="_blank"
                              rel="noopener noreferrer"
                              class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[11px] font-semibold transition-opacity"
                            >
                              View Full Image &rarr;
                            </a>
                          </div>
                        </div>

                        <!-- Uploaded Video -->
                        <div class="space-y-1">
                          <span class="text-[10px] font-bold uppercase tracking-wider text-[#78716C]">Uploaded Store Video:</span>
                          ${
                            isDirectVideo
                              ? `
                            <div class="relative aspect-4/3 rounded-xl overflow-hidden bg-black border border-[#DCD6C9] shadow-2xs flex items-center justify-center">
                              <video src="${escapeHtml(seller.videoUrl)}" controls preload="metadata" class="w-full h-full object-cover"></video>
                            </div>
                          `
                              : seller.videoUrl
                              ? `
                            <div class="relative aspect-4/3 rounded-xl overflow-hidden bg-gradient-to-br from-[#141413] to-[#262624] border border-[#DCD6C9] p-3 flex flex-col justify-between text-white">
                              <div class="flex items-center gap-1.5 text-xs text-[#10B981] font-semibold">
                                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                                <span>Reel / Video Link</span>
                              </div>
                              <p class="text-[11px] text-white/70 line-clamp-2">${escapeHtml(seller.videoUrl)}</p>
                              <a href="${escapeHtml(seller.videoUrl)}" target="_blank" rel="noopener noreferrer" class="text-[11px] font-bold text-white hover:underline flex items-center gap-1">
                                <span>Play / Open Video</span>
                                <span>&rarr;</span>
                              </a>
                            </div>
                          `
                              : `
                            <div class="aspect-4/3 rounded-xl border border-dashed border-[#DCD6C9] bg-white/60 flex items-center justify-center text-center p-2 text-xs text-[#78716C]">
                              No video uploaded
                            </div>
                          `
                          }
                        </div>
                      </div>

                      <!-- Badge & Rating Display -->
                      <div class="mt-3.5 pt-3 border-t border-[#E7E3D9] flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <span class="text-[10px] font-bold uppercase tracking-wider text-[#78716C]">Store Badge:</span>
                          ${
                            badgeHtml
                              ? `<div class="p-1 rounded-xl bg-[#141413] inline-flex items-center scale-90 origin-left">${badgeHtml}</div>`
                              : '<span class="text-xs text-[#78716C] italic">None (invisible)</span>'
                          }
                        </div>
                        <span class="text-xs font-semibold text-[#004643]">${seller.category}</span>
                      </div>
                    </div>

                    <!-- Actions -->
                    <div class="mt-4 pt-3 border-t border-[#E7E3D9] flex items-center justify-end gap-2">
                      <button
                        type="button"
                        data-seller-edit-id="${escapeHtml(seller.id)}"
                        class="px-3.5 py-1.5 rounded-lg border border-[#DCD6C9] bg-white text-xs font-semibold text-[#141413] hover:bg-[#F0EDE5] hover:border-[#004643] active:scale-95 transition-all shadow-2xs cursor-pointer"
                      >
                        Edit Store & Media
                      </button>
                      <button
                        type="button"
                        data-seller-delete-id="${escapeHtml(seller.id)}"
                        class="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 active:scale-95 transition-all cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                `;
                })
                .join('')}
            </div>
          `
          }
        </div>
      </section>
    `;

    attachEvents();
  }

  function attachEvents() {
    const searchInput = container.querySelector('#admin-seller-search-input');
    searchInput?.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      render();
    });

    container.querySelector('#admin-seller-search-clear')?.addEventListener('click', () => {
      searchQuery = '';
      render();
    });

    // Add Seller
    container.querySelector('#admin-add-seller-btn')?.addEventListener('click', () => {
      openSellerModal(null);
    });

    // Edit Seller
    container.querySelectorAll('[data-seller-edit-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-seller-edit-id');
        const seller = sellers.find((s) => s.id === id);
        if (seller) openSellerModal(seller);
      });
    });

    // Delete Seller
    container.querySelectorAll('[data-seller-delete-id]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-seller-delete-id');
        const seller = sellers.find((s) => s.id === id);
        if (window.confirm(`Are you sure you want to delete "${seller?.storeName || id}"? This will also remove the store from the directory.`)) {
          try {
            sellers = await deleteSeller(id);
            if (typeof onCountUpdate === 'function') onCountUpdate(sellers.length);
            showToast('Seller store deleted successfully.', 'success');
            render();
          } catch {
            showToast('Failed to delete seller.', 'error');
          }
        }
      });
    });
  }

  function openSellerModal(existingSeller) {
    const isEdit = Boolean(existingSeller);
    const modalEl = document.createElement('div');
    modalEl.id = 'admin-seller-modal';
    modalEl.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto';

    let currentImage = existingSeller?.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80';
    let currentVideoUrl = existingSeller?.videoUrl || '';
    let currentRating = existingSeller?.rating !== undefined && existingSeller?.rating !== null ? Number(existingSeller.rating).toFixed(1) : '4.8';

    modalEl.innerHTML = `
      <div class="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#DCD6C9] animate-fade-up my-8 max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          id="seller-modal-close"
          class="absolute top-5 right-5 w-8 h-8 rounded-full border border-[#DCD6C9] bg-white text-[#78716C] hover:text-[#141413] hover:bg-[#F0EDE5] flex items-center justify-center transition-colors shadow-2xs"
        >
          &times;
        </button>

        <div class="pr-8 mb-5 pb-3 border-b border-[#E7E3D9]">
          <span class="text-xs font-bold uppercase tracking-wider text-[#004643]">Backend Edit</span>
          <h2 class="text-xl font-bold text-[#141413]">${isEdit ? 'Edit Seller Profile & Store' : 'Create New Seller Profile'}</h2>
          <p class="text-xs text-[#57534E]">Manage store details, upload store cover image, and upload/link product videos.</p>
        </div>

        <form id="admin-seller-form" class="space-y-4">
          <!-- Store Name & Owner -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-[#141413] mb-1" for="seller-store-name">Store Name *</label>
              <input
                type="text"
                id="seller-store-name"
                required
                value="${escapeHtml(existingSeller?.storeName || '')}"
                placeholder="e.g. Kalyani Cotton"
                class="w-full px-3.5 py-2 rounded-xl border border-[#DCD6C9] text-xs sm:text-sm bg-white focus:outline-none focus:border-[#004643]"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-[#141413] mb-1" for="seller-owner-name">Owner / Contact Name</label>
              <input
                type="text"
                id="seller-owner-name"
                value="${escapeHtml(existingSeller?.ownerName || '')}"
                placeholder="e.g. Meenakshi Sundaram"
                class="w-full px-3.5 py-2 rounded-xl border border-[#DCD6C9] text-xs sm:text-sm bg-white focus:outline-none focus:border-[#004643]"
              />
            </div>
          </div>

          <!-- Contact Email & Phone -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-[#141413] mb-1" for="seller-email">Contact Email</label>
              <input
                type="email"
                id="seller-email"
                value="${escapeHtml(existingSeller?.email || '')}"
                placeholder="store@example.com"
                class="w-full px-3 py-2 rounded-xl border border-[#DCD6C9] text-xs bg-white focus:outline-none focus:border-[#004643]"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-[#141413] mb-1" for="seller-phone">WhatsApp / Phone</label>
              <input
                type="tel"
                id="seller-phone"
                value="${escapeHtml(existingSeller?.phone || '')}"
                placeholder="+91 94432 10987"
                class="w-full px-3 py-2 rounded-xl border border-[#DCD6C9] text-xs bg-white focus:outline-none focus:border-[#004643]"
              />
            </div>
          </div>

          <!-- City & Category -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-[#141413] mb-1" for="seller-city">City</label>
              <select id="seller-city" class="w-full px-3 py-2 rounded-xl border border-[#DCD6C9] text-xs bg-white focus:outline-none focus:border-[#004643]">
                ${['Coimbatore', 'Chennai', 'Bengaluru', 'Hyderabad', 'Madurai', 'Salem', 'Kochi', 'Mumbai', 'Delhi']
                  .map((c) => `<option value="${c}" ${existingSeller?.city === c ? 'selected' : ''}>${c}</option>`)
                  .join('')}
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-[#141413] mb-1" for="seller-category">Category</label>
              <select id="seller-category" class="w-full px-3 py-2 rounded-xl border border-[#DCD6C9] text-xs bg-white focus:outline-none focus:border-[#004643]">
                ${[
                  "Men's Fashion",
                  "Women's Fashion",
                  "Kids & Baby",
                  "Jewellery & Accessories",
                  "Fabric & Textile Sourcing",
                  "Home & Living",
                  'Sarees',
                  'Tops',
                  'Jeans',
                  'Jewellery',
                  'Heels',
                  'Menswear',
                  'Handlooms',
                  'Accessories',
                ]
                  .map((cat) => `<option value="${cat}" ${existingSeller?.category === cat ? 'selected' : ''}>${cat}</option>`)
                  .join('')}
              </select>
            </div>
          </div>

          <!-- Store Description -->
          <div>
            <label class="block text-xs font-semibold text-[#141413] mb-1" for="seller-description">Store Description</label>
            <textarea
              id="seller-description"
              rows="2"
              placeholder="Describe your handlooms, boutique collection, or fabrics..."
              class="w-full px-3 py-2 rounded-xl border border-[#DCD6C9] text-xs bg-white focus:outline-none focus:border-[#004643]"
            >${escapeHtml(existingSeller?.description || '')}</textarea>
          </div>

          <!-- UPLOAD STORE IMAGE -->
          <div class="p-4 rounded-2xl bg-[#F8F6F0] border border-[#E7E3D9]">
            <label class="block text-xs font-bold text-[#004643] mb-1.5">Store Cover Image (Upload or URL)</label>
            <div class="flex items-center gap-4">
              <img id="seller-modal-image-preview" src="${escapeHtml(currentImage)}" alt="Preview" class="w-20 h-20 rounded-xl object-cover border border-[#DCD6C9] shrink-0" />
              <div class="flex-1 space-y-2">
                <label class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#DCD6C9] bg-white text-xs font-semibold text-[#141413] hover:bg-[#F0EDE5] cursor-pointer shadow-2xs">
                  <svg class="w-3.5 h-3.5 text-[#004643]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  <span>Upload Image File</span>
                  <input type="file" id="seller-image-file" accept="image/*" class="hidden" />
                </label>
                <input
                  type="text"
                  id="seller-image-url"
                  value="${escapeHtml(currentImage)}"
                  placeholder="Or enter image URL"
                  class="w-full px-3 py-1.5 rounded-lg border border-[#DCD6C9] text-xs bg-white focus:outline-none focus:border-[#004643]"
                />
              </div>
            </div>
          </div>

          <!-- UPLOAD STORE VIDEO -->
          <div class="p-4 rounded-2xl bg-[#F8F6F0] border border-[#E7E3D9]">
            <label class="block text-xs font-bold text-[#004643] mb-1.5">Store Video Reel (Upload MP4 or URL)</label>
            <div class="space-y-2">
              <div class="flex items-center gap-3">
                <label class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#DCD6C9] bg-white text-xs font-semibold text-[#141413] hover:bg-[#F0EDE5] cursor-pointer shadow-2xs">
                  <svg class="w-3.5 h-3.5 text-[#004643]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                  <span>Upload Video (MP4 / WebM)</span>
                  <input type="file" id="seller-video-file" accept="video/mp4,video/webm,video/quicktime" class="hidden" />
                </label>
                <span class="text-[11px] text-[#78716C]">Uploads up to 30MB supported</span>
              </div>
              <input
                type="text"
                id="seller-video-url"
                value="${escapeHtml(currentVideoUrl)}"
                placeholder="Or enter video URL / Instagram reel URL"
                class="w-full px-3 py-1.5 rounded-lg border border-[#DCD6C9] text-xs bg-white focus:outline-none focus:border-[#004643]"
              />
              <div id="seller-modal-video-preview" class="mt-2"></div>
            </div>
          </div>

          <!-- Instagram URL & Status -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-[#141413] mb-1" for="seller-instagram-url">Instagram Profile URL</label>
              <input
                type="text"
                id="seller-instagram-url"
                value="${escapeHtml(existingSeller?.instagramUrl || '')}"
                placeholder="https://www.instagram.com/yourstore/"
                class="w-full px-3 py-2 rounded-xl border border-[#DCD6C9] text-xs bg-white focus:outline-none focus:border-[#004643]"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-[#141413] mb-1" for="seller-status">Store Directory Status</label>
              <select id="seller-status" class="w-full px-3 py-2 rounded-xl border border-[#DCD6C9] text-xs bg-white focus:outline-none focus:border-[#004643]">
                <option value="true" ${existingSeller?.active !== false ? 'selected' : ''}>Active (Visible in Explore Stores)</option>
                <option value="false" ${existingSeller?.active === false ? 'selected' : ''}>Inactive (Hidden from Directory)</option>
              </select>
            </div>
          </div>

          <!-- Badge & Rating with Decimal Stepper -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E7E3D9]">
            <!-- Badge Text -->
            <div>
              <label class="block text-xs font-semibold text-[#141413] mb-1" for="seller-badge">Top-Left Badge Text</label>
              <input
                type="text"
                id="seller-badge"
                value="${escapeHtml(existingSeller?.badge || 'Top Rated.')}"
                placeholder="e.g. Top Rated. or Trending"
                class="w-full px-3 py-2 rounded-xl border border-[#DCD6C9] text-xs bg-white focus:outline-none focus:border-[#004643]"
              />
              <p class="mt-1 text-[11px] text-[#78716C]">Leave blank to omit text</p>
            </div>

            <!-- Rating with Stepper -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-xs font-semibold text-[#141413]" for="seller-rating">Rating (0.0 – 5.0)</label>
                <button type="button" id="seller-rating-clear-btn" class="text-[11px] font-semibold text-[#78716C] hover:text-[#991B1B] underline">Clear</button>
              </div>
              <div class="flex items-center gap-2">
                <button type="button" id="seller-rating-dec-btn" class="w-8 h-8 rounded-lg bg-white border border-[#DCD6C9] font-bold text-sm hover:bg-[#F0EDE5] active:scale-95">&minus;</button>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  id="seller-rating"
                  value="${escapeHtml(currentRating)}"
                  class="w-20 text-center px-2 py-1.5 rounded-lg border border-[#DCD6C9] text-xs font-bold bg-white focus:outline-none focus:border-[#004643]"
                />
                <button type="button" id="seller-rating-inc-btn" class="w-8 h-8 rounded-lg bg-white border border-[#DCD6C9] font-bold text-sm hover:bg-[#F0EDE5] active:scale-95">+</button>
                <span class="text-[11px] text-[#78716C] ml-1">&plusmn; 0.1</span>
              </div>
              <p class="mt-1 text-[11px] text-[#78716C]">Leave blank to omit star & rating</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="mt-6 pt-4 border-t border-[#E7E3D9] flex items-center justify-end gap-3">
            <button
              type="button"
              id="seller-modal-cancel"
              class="px-4 py-2 rounded-full border border-[#DCD6C9] text-xs font-semibold text-[#57534E] hover:bg-[#F0EDE5]"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="seller-modal-submit"
              class="px-6 py-2 rounded-full bg-[#004643] text-white text-xs sm:text-sm font-bold hover:bg-[#003634] active:scale-95 transition-all shadow-sm"
            >
              ${isEdit ? 'Save Changes' : 'Create Seller Store'}
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modalEl);

    // Image Upload Handler
    const imageFileInput = modalEl.querySelector('#seller-image-file');
    const imageUrlInput = modalEl.querySelector('#seller-image-url');
    const imagePreview = modalEl.querySelector('#seller-modal-image-preview');

    imageFileInput?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        showToast('Uploading store cover image...', 'success');
        const res = await uploadMediaFile(file);
        if (res && res.url) {
          currentImage = res.url;
          if (imageUrlInput) imageUrlInput.value = currentImage;
          if (imagePreview) imagePreview.src = currentImage;
          showToast('Image uploaded successfully!', 'success');
        }
      } catch (err) {
        showToast(err.message || 'Image upload failed', 'error');
      }
    });

    imageUrlInput?.addEventListener('input', (e) => {
      currentImage = e.target.value.trim();
      if (imagePreview) imagePreview.src = currentImage;
    });

    // Video Upload Handler
    const videoFileInput = modalEl.querySelector('#seller-video-file');
    const videoUrlInput = modalEl.querySelector('#seller-video-url');
    const videoPreviewEl = modalEl.querySelector('#seller-modal-video-preview');

    const updateVideoPreview = () => {
      if (!videoPreviewEl) return;
      const v = currentVideoUrl;
      if (!v) {
        videoPreviewEl.innerHTML = '';
        return;
      }
      if (v.includes('.mp4') || v.includes('.webm') || v.includes('.mov') || v.startsWith('./uploads/')) {
        videoPreviewEl.innerHTML = `
          <video src="${escapeHtml(v)}" controls preload="metadata" class="w-full h-32 rounded-xl bg-black object-cover"></video>
        `;
      } else {
        videoPreviewEl.innerHTML = `
          <p class="text-[11px] text-[#004643] font-semibold">Video URL configured: <a href="${escapeHtml(v)}" target="_blank" class="underline">${escapeHtml(v)}</a></p>
        `;
      }
    };
    updateVideoPreview();

    videoFileInput?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        showToast('Uploading store video reel (this may take a moment)...', 'success');
        const res = await uploadMediaFile(file);
        if (res && res.url) {
          currentVideoUrl = res.url;
          if (videoUrlInput) videoUrlInput.value = currentVideoUrl;
          updateVideoPreview();
          showToast('Video uploaded successfully!', 'success');
        }
      } catch (err) {
        showToast(err.message || 'Video upload failed', 'error');
      }
    });

    videoUrlInput?.addEventListener('input', (e) => {
      currentVideoUrl = e.target.value.trim();
      updateVideoPreview();
    });

    // Rating Stepper
    const ratingInput = modalEl.querySelector('#seller-rating');
    modalEl.querySelector('#seller-rating-inc-btn')?.addEventListener('click', () => {
      const cur = parseFloat(ratingInput.value);
      const next = isNaN(cur) ? 4.5 : Math.min(5.0, Math.round((cur + 0.1) * 10) / 10);
      ratingInput.value = next.toFixed(1);
    });

    modalEl.querySelector('#seller-rating-dec-btn')?.addEventListener('click', () => {
      const cur = parseFloat(ratingInput.value);
      const next = isNaN(cur) ? 4.5 : Math.max(0.0, Math.round((cur - 0.1) * 10) / 10);
      ratingInput.value = next.toFixed(1);
    });

    modalEl.querySelector('#seller-rating-clear-btn')?.addEventListener('click', () => {
      ratingInput.value = '';
    });

    // Close Modal
    const closeModal = () => modalEl.remove();
    modalEl.querySelector('#seller-modal-close')?.addEventListener('click', closeModal);
    modalEl.querySelector('#seller-modal-cancel')?.addEventListener('click', closeModal);
    modalEl.addEventListener('click', (e) => {
      if (e.target === modalEl) closeModal();
    });

    // Submit
    const form = modalEl.querySelector('#admin-seller-form');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = modalEl.querySelector('#seller-modal-submit');
      if (submitBtn) submitBtn.textContent = 'Saving...';

      const rawRating = ratingInput?.value.trim() || '';
      const rating = rawRating !== '' && !isNaN(parseFloat(rawRating)) ? parseFloat(parseFloat(rawRating).toFixed(1)) : null;

      const payload = {
        id: existingSeller?.id || '',
        storeId: existingSeller?.storeId || '',
        storeName: modalEl.querySelector('#seller-store-name')?.value.trim() || '',
        ownerName: modalEl.querySelector('#seller-owner-name')?.value.trim() || '',
        email: modalEl.querySelector('#seller-email')?.value.trim() || '',
        phone: modalEl.querySelector('#seller-phone')?.value.trim() || '',
        city: modalEl.querySelector('#seller-city')?.value || 'Chennai',
        category: modalEl.querySelector('#seller-category')?.value || 'Sarees',
        description: modalEl.querySelector('#seller-description')?.value.trim() || '',
        image: currentImage,
        videoUrl: currentVideoUrl,
        instagramUrl: modalEl.querySelector('#seller-instagram-url')?.value.trim() || '',
        active: modalEl.querySelector('#seller-status')?.value === 'true',
        badge: modalEl.querySelector('#seller-badge')?.value.trim() || '',
        rating,
      };

      try {
        await saveSeller(payload);
        showToast(isEdit ? 'Seller profile and store updated successfully!' : 'New seller store created & synced to directory!', 'success');
        closeModal();
        await loadData();
      } catch {
        showToast('Failed to save seller profile.', 'error');
        if (submitBtn) submitBtn.textContent = isEdit ? 'Save Changes' : 'Create Seller Store';
      }
    });
  }

  loadData();

  return {
    reload: loadData,
  };
}
