// Quick Buy Modal Component — Instant Kurti Purchase, Pincode Verification & Checkout
// Features Delivery Pincode check ("Next Day Delivery Available"), Direct Buy Now button,
// Size selector (S, M, L, XL, XXL), Quantity counter, Optional note, and WhatsApp Fast Checkout.

import { escapeHtml } from '../utils/dom.js';
import { openBookingModal } from './BookingModal.js';
import { openImageGalleryModal } from './ImageGalleryModal.js';

export function openQuickBuyModal(product, video, onOrderComplete = null) {
  const existing = document.getElementById('quick-buy-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'quick-buy-modal';
  modal.className =
    'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in select-none';

  let selectedSize = 'M';
  let quantity = 1;
  let deliveryPincode = '641001';
  let isPincodeVerified = false;

  const sizes = [
    { label: 'S (36)', val: 'S' },
    { label: 'M (38)', val: 'M' },
    { label: 'L (40)', val: 'L' },
    { label: 'XL (42)', val: 'XL' },
    { label: 'XXL (44)', val: 'XXL' },
  ];

  const getCleanPhone = (phone) => (phone || '+919876543210').replace(/\D/g, '');

  const getNumericPrice = () => {
    const raw = (product.price || '1200').replace(/[^\d]/g, '');
    return parseInt(raw, 10) || 1200;
  };

  const calculateTotalFormatted = () => {
    const total = getNumericPrice() * quantity;
    return `₹${total.toLocaleString('en-IN')}`;
  };

  const updateWhatsAppHref = () => {
    const noteInput = modal.querySelector('#quick-buy-note');
    const note = noteInput ? noteInput.value.trim() : '';
    const pinInput = modal.querySelector('#quick-buy-pincode');
    const pin = pinInput ? pinInput.value.trim() : deliveryPincode;

    const msg = `Hi ${video.storeName}! 🛍️ I want to buy from your festive kurti collection on MyMigo:
• Item: ${product.name}
• Price: ${product.price}
• Size: ${selectedSize}
• Quantity: ${quantity}
• Total: ${calculateTotalFormatted()}
• Delivery Pincode: ${pin || '641001'} (Next Day Delivery)
${note ? `• Note: ${note}\n` : ''}
Please confirm availability and share payment link!`;

    const cleanPhone = getCleanPhone(video.whatsappNumber);
    const link = `https://api.whatsapp.com/send?phone=${encodeURIComponent(cleanPhone)}&text=${encodeURIComponent(msg)}`;
    const btn = modal.querySelector('#confirm-whatsapp-order-btn');
    if (btn) btn.href = link;

    const buyPriceLabel = modal.querySelector('#buy-now-total-label');
    if (buyPriceLabel) buyPriceLabel.textContent = calculateTotalFormatted();
  };

  modal.innerHTML = `
    <div id="quick-buy-card" class="relative w-full max-w-[94vw] sm:max-w-md bg-white rounded-3xl p-4 sm:p-7 shadow-2xl border border-[#DCD6C9] animate-fade-up text-[#141413] max-h-[92vh] overflow-y-auto no-scrollbar box-border">
      
      <!-- Close Button -->
      <button
        type="button"
        id="quick-buy-close"
        aria-label="Close"
        class="absolute top-4 right-4 w-8 h-8 rounded-full border border-[#DCD6C9] bg-white text-[#78716C] hover:text-[#141413] hover:bg-[#F0EDE5] flex items-center justify-center transition-colors cursor-pointer text-lg font-bold shadow-2xs z-10"
      >
        &times;
      </button>

      <!-- Store Attribution Badge -->
      <div class="flex items-center gap-2 mb-3.5 pr-6">
        <img
          src="${escapeHtml(video.avatar || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=100&q=80')}"
          alt="${escapeHtml(video.storeName)}"
          class="w-8 h-8 rounded-full object-cover ring-1.5 ring-emerald-500 shrink-0"
        />
        <div class="min-w-0">
          <p class="text-xs font-bold text-[#141413] truncate">${escapeHtml(video.storeName)}</p>
          <p class="text-[10px] text-[#78716C] truncate">${escapeHtml(video.city)} • Verified Partner Boutique</p>
        </div>
      </div>

      <!-- Product Showcase Row (Fixed width for mobile, click image to open 4-image gallery) -->
      <div class="flex items-center gap-3 p-3 rounded-2xl bg-[#F8F6F0] border border-[#E7E3D9] mb-3.5 w-full box-border overflow-hidden">
        <div
          class="relative shrink-0 cursor-pointer group rounded-xl overflow-hidden shadow-xs"
          style="width: 76px; height: 92px; min-width: 76px; max-width: 76px;"
          id="quick-buy-img-btn"
          title="Click to view full photo gallery"
        >
          <img
            src="${escapeHtml(product.image || video.poster || '')}"
            alt="${escapeHtml(product.name)}"
            class="w-full h-full object-cover border border-[#DCD6C9] group-hover:scale-105 transition-transform"
            style="width: 76px; height: 92px; object-fit: cover;"
          />
          <span class="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/75 text-[8px] font-bold text-white flex items-center gap-0.5 pointer-events-none">
            📸 ${product.images?.length || 6} imgs
          </span>
        </div>

        <div class="flex-1 min-w-0 flex flex-col justify-between overflow-hidden">
          <div>
            <span class="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#004643]/10 text-[#004643] uppercase tracking-wider mb-1">
              ${escapeHtml(product.category || 'Festive Collection')}
            </span>
            <h3 class="text-xs sm:text-sm font-bold text-[#141413] leading-snug truncate block w-full" title="${escapeHtml(product.name)}">
              ${escapeHtml(product.name)}
            </h3>
          </div>
          <div class="flex items-baseline gap-2 mt-1">
            <span class="text-base sm:text-lg font-black text-[#004643] shrink-0">${escapeHtml(product.price)}</span>
            ${product.originalPrice ? `<span class="text-xs text-[#78716C] line-through shrink-0">${escapeHtml(product.originalPrice)}</span>` : ''}
            <span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">In Stock</span>
          </div>
        </div>
      </div>

      <!-- Delivery Pincode Checker Section (Next Day Delivery Available) -->
      <div class="mb-3.5">
        <div class="flex items-center justify-between mb-1.5">
          <label class="block text-xs font-bold text-[#141413]" for="quick-buy-pincode">Delivery Pincode</label>
          <span class="text-[10px] text-[#78716C]">Check next-day delivery</span>
        </div>
        <div class="relative flex items-center">
          <input
            type="text"
            id="quick-buy-pincode"
            maxlength="6"
            inputmode="numeric"
            value="641001"
            placeholder="Enter 6-digit Pincode"
            class="w-full h-10 pl-3.5 pr-12 rounded-xl border border-[#DCD6C9] text-xs font-bold text-[#141413] bg-white focus:outline-none focus:border-[#004643] transition-colors"
          />
          <button
            type="button"
            id="quick-buy-pincode-submit-btn"
            aria-label="Check Pincode"
            title="Verify Pincode"
            class="absolute right-1 w-8 h-8 rounded-lg bg-[#004643] hover:bg-[#003634] active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
          >
            <svg class="w-4 h-4 fill-none stroke-current" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>

        <!-- Dynamic Message Box -->
        <div id="pincode-status-box" class="mt-2">
          <div class="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-2.5 animate-fade-in shadow-2xs">
            <span class="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shrink-0 font-bold">✓</span>
            <div class="min-w-0 flex-1">
              <p class="font-extrabold text-xs text-emerald-800 flex items-center gap-1 leading-none">
                <span>⚡ Next Day Delivery Available</span>
              </p>
              <p class="text-[11px] text-emerald-700 leading-tight mt-0.5">
                Guaranteed delivery by tomorrow, 8:00 PM to pincode <strong id="pincode-confirmed-val">641001</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Size Selection -->
      <div class="mb-3.5">
        <div class="flex items-center justify-between mb-1.5">
          <label class="block text-xs font-bold text-[#141413]">Select Kurti Size</label>
          <span class="text-[10px] text-[#78716C]">Selected: <strong class="text-[#004643] font-bold" id="selected-size-label">M (38)</strong></span>
        </div>
        <div class="grid grid-cols-5 gap-1.5" id="size-options-container">
          ${sizes
            .map((s) => {
              const isSelected = s.val === selectedSize;
              return `
              <button
                type="button"
                data-size-val="${s.val}"
                data-size-label="${escapeHtml(s.label)}"
                class="size-pill-btn py-2 px-1 rounded-xl text-xs font-bold transition-all border cursor-pointer text-center ${
                  isSelected
                    ? 'bg-[#004643] text-white border-[#004643] shadow-xs'
                    : 'bg-white text-[#57534E] border-[#DCD6C9] hover:border-[#004643]'
                }"
              >
                ${s.label}
              </button>
            `;
            })
            .join('')}
        </div>
      </div>

      <!-- Quantity Counter & Summary -->
      <div class="grid grid-cols-2 gap-3 mb-3.5">
        <div>
          <label class="block text-xs font-bold text-[#141413] mb-1.5">Quantity</label>
          <div class="flex items-center border border-[#DCD6C9] rounded-xl overflow-hidden bg-white">
            <button type="button" id="qty-minus-btn" class="w-9 h-9 flex items-center justify-center font-bold text-base text-[#57534E] hover:bg-[#F0EDE5] cursor-pointer">&minus;</button>
            <span id="qty-display" class="flex-1 text-center font-bold text-xs">1</span>
            <button type="button" id="qty-plus-btn" class="w-9 h-9 flex items-center justify-center font-bold text-base text-[#57534E] hover:bg-[#F0EDE5] cursor-pointer">+</button>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-[#141413] mb-1.5">Delivery City</label>
          <input
            type="text"
            id="quick-buy-city"
            value="${escapeHtml(video.city || 'Chennai')}"
            placeholder="Your city"
            class="w-full h-9 px-3 rounded-xl border border-[#DCD6C9] text-xs font-medium bg-white focus:outline-none focus:border-[#004643]"
          />
        </div>
      </div>

      <!-- Optional Note -->
      <div class="mb-4">
        <label class="block text-xs font-semibold text-[#57534E] mb-1">Optional Note for Boutique</label>
        <input
          type="text"
          id="quick-buy-note"
          placeholder="e.g. Urgent delivery needed / Gift packing"
          class="w-full px-3 py-2 rounded-xl border border-[#DCD6C9] text-xs bg-white focus:outline-none focus:border-[#004643]"
        />
      </div>

      <!-- Order Actions: Buy Button, WhatsApp Order, and Video Call -->
      <div class="space-y-2">
        <!-- 1. Dedicated Buy Button -->
        <button
          type="button"
          id="instant-buy-now-btn"
          class="w-full py-3 px-4 rounded-xl bg-[#004643] hover:bg-[#003634] active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/40"
        >
          <svg class="w-4 h-4 fill-none stroke-current" stroke-width="2.2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span>Buy Now — <span id="buy-now-total-label">${calculateTotalFormatted()}</span></span>
        </button>

        <!-- 2. WhatsApp Fast Order Button -->
        <a
          id="confirm-whatsapp-order-btn"
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          class="w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white font-extrabold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg class="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.072-2.123-.526-1.748-.73-2.853-2.518-2.94-2.634-.087-.116-.708-.941-.708-1.794s.448-1.273.607-1.446c.159-.174.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.087-.179.182-.077.357.101.174.45 0.741.966 1.201.666.592 1.229.775 1.402.862.173.087.275.072.376-.044.101-.116.434-.506.549-.68.116-.174.231-.145.39-.087s1.011.477 1.184.564.289.13.332.203c.044.072.044.42-.1.825z"/>
          </svg>
          <span>Order on WhatsApp (Fast Checkout)</span>
        </a>

        <!-- 3. Video Shopping Tryout Call -->
        <button
          type="button"
          id="book-video-call-btn"
          class="w-full py-2 px-4 rounded-xl bg-white hover:bg-[#F0EDE5] border border-[#DCD6C9] text-[#004643] font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <svg class="w-3.5 h-3.5 text-[#004643]" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>Book Video Shopping Call to Inspect Kurti</span>
        </button>
      </div>

    </div>
  `;

  document.body.appendChild(modal);

  // Close handlers
  const closeModal = () => modal.remove();
  modal.querySelector('#quick-buy-close')?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Open 4-Image Gallery on clicking image
  modal.querySelector('#quick-buy-img-btn')?.addEventListener('click', () => {
    openImageGalleryModal(product, video, () => {
      modal.querySelector('#instant-buy-now-btn')?.click();
    });
  });

  // Pincode Verification Logic
  const pincodeInput = modal.querySelector('#quick-buy-pincode');
  const pincodeSubmitBtn = modal.querySelector('#quick-buy-pincode-submit-btn');
  const pincodeStatusBox = modal.querySelector('#pincode-status-box');

  const checkPincode = () => {
    const rawVal = pincodeInput ? pincodeInput.value.replace(/\D/g, '') : '';
    if (rawVal.length === 6) {
      deliveryPincode = rawVal;
      isPincodeVerified = true;
      pincodeStatusBox.innerHTML = `
        <div class="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-2.5 animate-fade-in shadow-2xs">
          <span class="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shrink-0 font-bold">✓</span>
          <div class="min-w-0 flex-1">
            <p class="font-extrabold text-xs text-emerald-800 flex items-center gap-1 leading-none">
              <span>⚡ Next Day Delivery Available</span>
            </p>
            <p class="text-[11px] text-emerald-700 leading-tight mt-0.5">
              Guaranteed delivery by tomorrow, 8:00 PM to pincode <strong id="pincode-confirmed-val">${escapeHtml(rawVal)}</strong>.
            </p>
          </div>
        </div>
      `;
    } else {
      isPincodeVerified = false;
      pincodeStatusBox.innerHTML = `
        <div class="p-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2 animate-fade-in">
          <span>⚠️</span>
          <span>Please enter a valid 6-digit delivery pincode.</span>
        </div>
      `;
    }
    updateWhatsAppHref();
  };

  pincodeSubmitBtn?.addEventListener('click', checkPincode);
  pincodeInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      checkPincode();
    }
  });

  // Size pill clicks
  modal.querySelectorAll('.size-pill-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedSize = btn.getAttribute('data-size-val');
      const sizeLabel = btn.getAttribute('data-size-label');
      modal.querySelectorAll('.size-pill-btn').forEach((b) => {
        b.className =
          'size-pill-btn py-2 px-1 rounded-xl text-xs font-bold transition-all border cursor-pointer text-center bg-white text-[#57534E] border-[#DCD6C9] hover:border-[#004643]';
      });
      btn.className =
        'size-pill-btn py-2 px-1 rounded-xl text-xs font-bold transition-all border cursor-pointer text-center bg-[#004643] text-white border-[#004643] shadow-xs';
      const labelEl = modal.querySelector('#selected-size-label');
      if (labelEl) labelEl.textContent = sizeLabel;
      updateWhatsAppHref();
    });
  });

  // Quantity counter
  modal.querySelector('#qty-plus-btn')?.addEventListener('click', () => {
    quantity += 1;
    modal.querySelector('#qty-display').textContent = quantity;
    updateWhatsAppHref();
  });
  modal.querySelector('#qty-minus-btn')?.addEventListener('click', () => {
    if (quantity > 1) {
      quantity -= 1;
      modal.querySelector('#qty-display').textContent = quantity;
      updateWhatsAppHref();
    }
  });

  // Note & City inputs update link
  modal.querySelector('#quick-buy-note')?.addEventListener('input', updateWhatsAppHref);
  modal.querySelector('#quick-buy-city')?.addEventListener('input', updateWhatsAppHref);

  // Instant Buy Now button handler
  modal.querySelector('#instant-buy-now-btn')?.addEventListener('click', () => {
    const cardEl = modal.querySelector('#quick-buy-card');
    const orderId = `MIGO-${Math.floor(100000 + Math.random() * 900000)}`;
    const finalPincode = (pincodeInput && pincodeInput.value.trim()) || deliveryPincode || '641001';

    cardEl.innerHTML = `
      <div class="text-center py-4 animate-fade-in">
        <div class="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mb-3 shadow-inner">
          ✓
        </div>
        <h3 class="text-xl font-extrabold text-[#141413]">Order Placed Successfully!</h3>
        <p class="text-xs text-emerald-700 font-bold mt-1 flex items-center justify-center gap-1">
          <span>⚡ Next Day Delivery Available &amp; Scheduled</span>
        </p>

        <div class="mt-4 p-4 rounded-2xl bg-[#F8F6F0] border border-[#E7E3D9] text-left text-xs space-y-2">
          <div class="flex justify-between">
            <span class="text-[#78716C]">Order Reference:</span>
            <span class="font-mono font-bold text-[#141413]">#${orderId}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[#78716C]">Product:</span>
            <span class="font-bold text-[#141413] truncate max-w-[200px]">${escapeHtml(product.name)}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[#78716C]">Size &amp; Quantity:</span>
            <span class="font-bold text-[#141413]">${selectedSize} (${quantity} unit${quantity > 1 ? 's' : ''})</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[#78716C]">Boutique:</span>
            <span class="font-bold text-[#004643]">${escapeHtml(video.storeName)} (${escapeHtml(video.city)})</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[#78716C]">Delivery Pincode:</span>
            <span class="font-bold text-emerald-800">${escapeHtml(finalPincode)} (Next Day by 8 PM)</span>
          </div>
          <div class="flex justify-between border-t border-[#DCD6C9] pt-2">
            <span class="font-bold text-[#141413]">Total Amount:</span>
            <span class="font-extrabold text-[#004643] text-sm">${calculateTotalFormatted()}</span>
          </div>
        </div>

        <div class="mt-5 space-y-2">
          <a
            id="order-confirm-whatsapp-btn"
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            class="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>💬 Track Order &amp; Message Boutique on WhatsApp</span>
          </a>

          <button
            type="button"
            id="order-success-done-btn"
            class="w-full py-2.5 px-4 rounded-xl bg-[#004643] text-white font-bold text-xs hover:bg-[#003634] active:scale-95 transition-all cursor-pointer"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    `;

    const cleanPhone = getCleanPhone(video.whatsappNumber);
    const orderMsg = `Hi ${video.storeName}! I just placed Order #${orderId} on MyMigo:
• Item: ${product.name}
• Size: ${selectedSize} (Qty: ${quantity})
• Total: ${calculateTotalFormatted()}
• Pincode: ${finalPincode} (Next Day Delivery)
Please confirm dispatch!`;
    const trackLink = `https://api.whatsapp.com/send?phone=${encodeURIComponent(cleanPhone)}&text=${encodeURIComponent(orderMsg)}`;
    const trackBtn = cardEl.querySelector('#order-confirm-whatsapp-btn');
    if (trackBtn) trackBtn.href = trackLink;

    cardEl.querySelector('#order-success-done-btn')?.addEventListener('click', closeModal);

    if (typeof onOrderComplete === 'function') {
      onOrderComplete({ orderId, product, size: selectedSize, quantity, pincode: finalPincode });
    }
  });

  // Book Live Call button opens Booking modal
  modal.querySelector('#book-video-call-btn')?.addEventListener('click', () => {
    closeModal();
    openBookingModal({ id: video.storeId, name: video.storeName, city: video.city });
  });

  // Initial link calculation
  updateWhatsAppHref();
}
