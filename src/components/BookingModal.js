// Booking Modal Component — Opens Cal.com-style interactive booking form in a popup modal
// Features close button, store preselection, 12H time slots, category chips, and Google Sheets submission.

import { PUBLIC_CONFIG } from '../config.js';
import { fetchActiveStores } from '../services/storeService.js';
import { submitBookingRequest } from '../services/bookingService.js';
import {
  escapeHtml,
  getTodayIsoDate,
  formatDateIso,
  formatDateOrdinal,
  formatDateFull,
  MONTH_NAMES,
  DAY_NAMES_SHORT,
} from '../utils/dom.js';

export const TIME_OPTIONS = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '01:00 PM',
  '01:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
  '05:30 PM',
  '06:00 PM',
  '06:30 PM',
  '07:00 PM',
  '07:30 PM',
  '08:00 PM',
  '08:30 PM',
  '09:00 PM',
];

export async function openBookingModal(initialStore = null, onSuccess = null) {
  // Existing modal check
  const existing = document.getElementById('booking-modal-overlay');
  if (existing) existing.remove();

  let activeStores = [];
  try {
    activeStores = await fetchActiveStores();
  } catch {
    activeStores = [];
  }

  const preselectedStoreId = initialStore?.id || '';
  const preselectedCity = initialStore?.city || '';
  const matchedStore = activeStores.find((s) => s.id === preselectedStoreId) || initialStore;
  const initialCity = matchedStore ? matchedStore.city : preselectedCity;

  // Calendar State
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let selectedDate = new Date(today);
  const candidate18 = new Date(today.getFullYear(), today.getMonth(), 18);
  if (candidate18 >= today) {
    selectedDate = candidate18;
  }

  let viewYear = selectedDate.getFullYear();
  let viewMonth = selectedDate.getMonth();
  let selectedTime = PUBLIC_CONFIG.timeSlots[0] || '10.30 AM - 11.30 AM';
  let timeMode = 'preset'; // 'preset' | 'custom'
  let customStart = '11:00 AM';
  let customEnd = '03:00 PM';
  let currentStep = 'calendar'; // 'calendar' | 'details'

  // Selected apparel tags
  const selectedTags = new Set();

  const overlay = document.createElement('div');
  overlay.id = 'booking-modal-overlay';
  overlay.className =
    'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-sm overflow-y-auto animate-fade-in';

  const modalContainer = document.createElement('div');
  modalContainer.className =
    'relative w-full max-w-4xl bg-[#0F0F11] text-[#F4F4F5] rounded-3xl border border-[#27272A] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col';

  overlay.appendChild(modalContainer);
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  const closeModal = () => {
    overlay.remove();
    document.body.style.overflow = '';
  };

  const handleKeydown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleKeydown);
    }
  };
  document.addEventListener('keydown', handleKeydown);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  const renderModalContent = () => {
    const isStepCalendar = currentStep === 'calendar';
    const selectedDateIso = formatDateIso(selectedDate);
    const selectedDateOrdinal = formatDateOrdinal(selectedDate);
    const selectedDateFull = formatDateFull(selectedDate);

    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const canGoPrevMonth =
      viewYear > today.getFullYear() ||
      (viewYear === today.getFullYear() && viewMonth > today.getMonth());

    modalContainer.innerHTML = `
      <!-- Top Modal Header with Store Title and Close Button -->
      <div class="px-5 py-3.5 border-b border-[#27272A] flex items-center justify-between bg-[#141416]/90 backdrop-blur-md shrink-0">
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="w-7 h-7 rounded-lg bg-[#004643] text-white flex items-center justify-center text-xs font-bold shrink-0">
            M
          </span>
          <div class="min-w-0">
            <h2 class="text-sm sm:text-base font-bold text-white truncate">
              Book Shopping Session
            </h2>
            ${
              matchedStore
                ? `<p class="text-[11px] text-[#A1A1AA] truncate">${escapeHtml(matchedStore.name)} • ${escapeHtml(matchedStore.city)}</p>`
                : '<p class="text-[11px] text-[#A1A1AA]">Live personal shopping assistance</p>'
            }
          </div>
        </div>

        <!-- Close Button -->
        <button
          id="modal-close-btn"
          type="button"
          aria-label="Close"
          class="w-8 h-8 rounded-full bg-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-[#3F3F46] flex items-center justify-center text-sm font-bold transition-colors shrink-0"
        >
          ✕
        </button>
      </div>

      <!-- Modal Body (Scrollable) -->
      <div class="overflow-y-auto flex-1 p-4 sm:p-6">
        
        <!-- Confirmation Panel (Hidden until submission succeeds) -->
        <div id="modal-booking-confirmation" class="hidden bg-[#18181B] rounded-2xl border border-[#27272A] p-6 sm:p-10 text-center">
          <div class="w-14 h-14 mx-auto rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-4">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-white">Booking Confirmed!</h3>
          <p class="mt-2 text-xs sm:text-sm text-[#A1A1AA]">
            Your shopping assistance session is reserved. We've logged your request in our system.
          </p>

          <div class="mt-5 p-4 rounded-xl bg-[#27272A]/70 border border-[#3F3F46] max-w-sm mx-auto text-left space-y-2 text-xs">
            <div class="flex justify-between"><span class="text-[#A1A1AA]">Booking ID:</span><span id="modal-conf-id" class="font-mono font-bold text-emerald-400"></span></div>
            <div class="flex justify-between"><span class="text-[#A1A1AA]">Customer:</span><span id="modal-conf-name" class="font-medium text-white"></span></div>
            <div class="flex justify-between"><span class="text-[#A1A1AA]">Store & City:</span><span id="modal-conf-store" class="font-medium text-white"></span></div>
            <div class="flex justify-between"><span class="text-[#A1A1AA]">Date & Time:</span><span id="modal-conf-time" class="font-medium text-white"></span></div>
          </div>

          <button
            id="modal-done-btn"
            type="button"
            class="mt-6 px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-[#004643] text-white hover:bg-[#003634] transition-colors"
          >
            Done
          </button>
        </div>

        <!-- Main Booking Widget -->
        <div id="modal-booking-widget" class="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-[#27272A] rounded-2xl overflow-hidden bg-[#18181B]">
          
          <!-- Left Column: Session Info -->
          <div class="lg:col-span-4 p-5 sm:p-6 bg-[#141416] border-b lg:border-b-0 lg:border-r border-[#27272A] flex flex-col justify-between">
            <div>
              <p class="text-[11px] uppercase tracking-wider text-[#A1A1AA] font-semibold">
                ${matchedStore ? escapeHtml(matchedStore.name) : 'MyMigo'}
              </p>
              <h3 class="text-base sm:text-lg font-bold text-white mt-1">
                Live Shopping Assistance
              </h3>

              <div class="mt-4 space-y-2.5 text-xs text-[#A1A1AA]">
                <div class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Requires confirmation</span>
                </div>
                <div class="flex items-center gap-2">
                  <svg class="w-3.5 h-3.5 text-[#71717A]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span>60m session duration</span>
                </div>
                <div class="flex items-center gap-2 text-[#E4E4E7]">
                  <div class="w-4 h-4 rounded bg-[#004643] flex items-center justify-center shrink-0">
                    <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                  </div>
                  <span>Live in-store video call</span>
                </div>
                <div class="flex items-center gap-2">
                  <svg class="w-3.5 h-3.5 text-[#71717A]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
                  <span>Asia/Kolkata (IST)</span>
                </div>
              </div>
            </div>

            <!-- Selected Slot Preview & Toggle Step -->
            <div class="mt-6 pt-4 border-t border-[#27272A]">
              <div class="p-3 rounded-xl bg-[#1C1C20] border border-[#27272A]">
                <p class="text-xs font-semibold text-white">${escapeHtml(selectedDateFull)}</p>
                <span class="inline-block mt-1 px-2 py-0.5 rounded bg-[#004643] text-[11px] font-semibold text-white">
                  ${escapeHtml(selectedTime)}
                </span>
              </div>

              ${
                isStepCalendar
                  ? `
                <button
                  type="button"
                  id="modal-btn-confirm-slot"
                  class="mt-3 w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#004643] text-white hover:bg-[#003634] transition-colors shadow-sm"
                >
                  Enter Details &rarr;
                </button>
              `
                  : `
                <button
                  type="button"
                  id="modal-btn-back-calendar"
                  class="mt-3 w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#27272A] text-white hover:bg-[#3F3F46] transition-colors"
                >
                  &larr; Change Date / Time
                </button>
              `
              }
            </div>
          </div>

          <!-- Middle / Right Column: Calendar or Details Form -->
          <div class="lg:col-span-8 p-5 sm:p-6">
            ${
              isStepCalendar
                ? `
              <div class="grid grid-cols-1 md:grid-cols-7 gap-5">
                <!-- Monthly Calendar Grid -->
                <div class="md:col-span-4">
                  <div class="flex items-center justify-between mb-4">
                    <h4 class="text-sm font-bold text-white">${MONTH_NAMES[viewMonth]} ${viewYear}</h4>
                    <div class="flex items-center gap-1">
                      <button
                        type="button"
                        id="modal-cal-prev"
                        ${!canGoPrevMonth ? 'disabled' : ''}
                        class="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#27272A] disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
                      </button>
                      <button
                        type="button"
                        id="modal-cal-next"
                        class="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#27272A]"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
                      </button>
                    </div>
                  </div>

                  <!-- Days of week -->
                  <div class="grid grid-cols-7 text-center text-[10px] uppercase font-bold text-[#71717A] mb-2">
                    ${DAY_NAMES_SHORT.map((d) => `<div>${d}</div>`).join('')}
                  </div>

                  <!-- Calendar days -->
                  <div class="grid grid-cols-7 gap-1 text-xs">
                    ${Array.from({ length: firstDayIndex })
                      .map((_, i) => {
                        const dayNum = daysInPrevMonth - firstDayIndex + i + 1;
                        return `<div class="h-8 flex items-center justify-center text-[#52525B] cursor-default">${dayNum}</div>`;
                      })
                      .join('')}

                    ${Array.from({ length: daysInMonth })
                      .map((_, i) => {
                        const dayNum = i + 1;
                        const thisDate = new Date(viewYear, viewMonth, dayNum);
                        const isPast = thisDate < today;
                        const isSelected =
                          selectedDate.getFullYear() === viewYear &&
                          selectedDate.getMonth() === viewMonth &&
                          selectedDate.getDate() === dayNum;

                        if (isPast) {
                          return `<div class="h-8 flex items-center justify-center text-[#52525B] cursor-not-allowed">${dayNum}</div>`;
                        }

                        return `
                          <button
                            type="button"
                            data-cal-day="${dayNum}"
                            class="h-8 rounded-lg flex items-center justify-center font-medium transition-colors ${
                              isSelected
                                ? 'bg-[#004643] text-white font-bold ring-2 ring-[#004643]/30'
                                : 'text-[#E4E4E7] hover:bg-[#27272A]'
                            }"
                          >
                            ${dayNum}
                          </button>
                        `;
                      })
                      .join('')}
                  </div>
                </div>

                <!-- Time Slot Column -->
                <div class="md:col-span-3 border-t md:border-t-0 md:border-l border-[#27272A] pt-4 md:pt-0 md:pl-4 flex flex-col">
                  <div class="flex items-center justify-between mb-2">
                    <p class="text-xs font-bold text-white truncate">
                      ${selectedDateOrdinal}
                    </p>
                    <span class="text-[10px] font-semibold text-emerald-400">12H</span>
                  </div>

                  <!-- Preset Slots vs Custom Time Toggle -->
                  <div class="grid grid-cols-2 p-1 rounded-xl bg-[#27272A] border border-[#3F3F46] mb-3 text-[11px] font-semibold">
                    <button
                      type="button"
                      id="modal-mode-preset"
                      class="py-1 px-2 rounded-lg text-center transition-all cursor-pointer ${
                        timeMode === 'preset'
                          ? 'bg-[#004643] text-white shadow-xs'
                          : 'text-[#A1A1AA] hover:text-white'
                      }"
                    >
                      Preset Slots
                    </button>
                    <button
                      type="button"
                      id="modal-mode-custom"
                      class="py-1 px-2 rounded-lg text-center transition-all cursor-pointer ${
                        timeMode === 'custom'
                          ? 'bg-[#004643] text-white shadow-xs'
                          : 'text-[#A1A1AA] hover:text-white'
                      }"
                    >
                      Custom Time
                    </button>
                  </div>

                  ${
                    timeMode === 'preset'
                      ? `
                    <div class="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      ${PUBLIC_CONFIG.timeSlots
                        .map(
                          (slot) => `
                        <button
                          type="button"
                          data-time-slot="${escapeHtml(slot)}"
                          class="w-full py-2 px-3 rounded-lg text-xs font-semibold text-left transition-colors border cursor-pointer ${
                            selectedTime === slot
                              ? 'bg-[#004643] text-white border-[#004643]'
                              : 'bg-[#27272A]/50 text-[#D4D4D8] border-[#27272A] hover:bg-[#27272A]'
                          }"
                        >
                          ${escapeHtml(slot)}
                        </button>
                      `
                        )
                        .join('')}
                    </div>
                  `
                      : `
                    <!-- Custom Time Range: Start Session & End Session -->
                    <div class="space-y-2.5 p-3 rounded-xl bg-[#27272A]/70 border border-[#3F3F46]">
                      <div>
                        <label for="modal-custom-start" class="block text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA] mb-1">
                          Start Session
                        </label>
                        <select
                          id="modal-custom-start"
                          class="w-full px-2.5 py-1.5 rounded-lg bg-[#18181B] border border-[#3F3F46] text-xs text-white focus:border-[#004643] outline-none cursor-pointer"
                        >
                          ${TIME_OPTIONS.map((t) => `<option value="${t}" ${customStart === t ? 'selected' : ''}>${t}</option>`).join('')}
                        </select>
                      </div>

                      <div>
                        <label for="modal-custom-end" class="block text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA] mb-1">
                          End Session
                        </label>
                        <select
                          id="modal-custom-end"
                          class="w-full px-2.5 py-1.5 rounded-lg bg-[#18181B] border border-[#3F3F46] text-xs text-white focus:border-[#004643] outline-none cursor-pointer"
                        >
                          ${TIME_OPTIONS.map((t) => `<option value="${t}" ${customEnd === t ? 'selected' : ''}>${t}</option>`).join('')}
                        </select>
                      </div>

                      <div class="pt-1.5 border-t border-[#3F3F46]/60">
                        <p class="text-[11px] text-[#A1A1AA]">
                          Selected: <strong class="text-emerald-400 font-bold">${escapeHtml(selectedTime)}</strong>
                        </p>
                      </div>
                    </div>
                  `
                  }
                </div>
              </div>
            `
                : `
              <!-- Step 2: Customer Details Form -->
              <form id="modal-booking-form" novalidate class="space-y-4">
                <div class="flex items-center justify-between border-b border-[#27272A] pb-2">
                  <h4 class="text-sm font-bold text-white">Customer Details</h4>
                  <span class="text-xs text-emerald-400 font-mono">${escapeHtml(selectedDateIso)} • ${escapeHtml(selectedTime)}</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-medium text-[#A1A1AA] mb-1">Your Name *</label>
                    <input
                      type="text"
                      id="modal-input-name"
                      required
                      placeholder="e.g. Raajkumar"
                      class="w-full px-3 py-2 rounded-xl bg-[#27272A] border border-[#3F3F46] text-xs text-white placeholder-[#71717A] focus:border-[#004643] outline-none"
                    />
                  </div>

                  <div>
                    <label class="block text-xs font-medium text-[#A1A1AA] mb-1">WhatsApp Number *</label>
                    <input
                      type="tel"
                      id="modal-input-whatsapp"
                      required
                      placeholder="e.g. +91 98765 43210"
                      class="w-full px-3 py-2 rounded-xl bg-[#27272A] border border-[#3F3F46] text-xs text-white placeholder-[#71717A] focus:border-[#004643] outline-none"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-medium text-[#A1A1AA] mb-1">City *</label>
                    <select
                      id="modal-select-city"
                      class="w-full px-3 py-2 rounded-xl bg-[#27272A] border border-[#3F3F46] text-xs text-white focus:border-[#004643] outline-none"
                    >
                      ${PUBLIC_CONFIG.cities
                        .map(
                          (c) =>
                            `<option value="${escapeHtml(c)}" ${c === initialCity ? 'selected' : ''}>${escapeHtml(c)}</option>`
                        )
                        .join('')}
                    </select>
                  </div>

                  <div>
                    <label class="block text-xs font-medium text-[#A1A1AA] mb-1">Store *</label>
                    <select
                      id="modal-select-store"
                      class="w-full px-3 py-2 rounded-xl bg-[#27272A] border border-[#3F3F46] text-xs text-white focus:border-[#004643] outline-none"
                    >
                      ${activeStores
                        .map(
                          (s) =>
                            `<option value="${escapeHtml(s.id)}" ${s.id === preselectedStoreId ? 'selected' : ''}>${escapeHtml(s.name)} (${escapeHtml(s.city)})</option>`
                        )
                        .join('')}
                    </select>
                  </div>
                </div>

                <!-- Apparel Requirements: Women & Men default box chips -->
                <div class="p-3.5 rounded-xl bg-[#141416] border border-[#27272A] space-y-3">
                  <label class="block text-xs font-semibold text-[#E4E4E7]">What are you looking for?</label>

                  <!-- Women section -->
                  <div>
                    <span class="text-[11px] font-bold text-[#A1A1AA] block mb-1.5">Women</span>
                    <div class="flex flex-wrap gap-1.5">
                      ${['Saree', 'Kurti', 'Jean', 'Top', 'Tshirt']
                        .map(
                          (item) => `
                        <button
                          type="button"
                          data-chip="${item}"
                          class="px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors border ${
                            selectedTags.has(item)
                              ? 'bg-[#004643] text-white border-[#004643]'
                              : 'bg-[#27272A] text-[#D4D4D8] border-[#3F3F46] hover:bg-[#3F3F46]'
                          }"
                        >
                          ${item}
                        </button>
                      `
                        )
                        .join('')}
                    </div>
                  </div>

                  <!-- Men section -->
                  <div>
                    <span class="text-[11px] font-bold text-[#A1A1AA] block mb-1.5">Men</span>
                    <div class="flex flex-wrap gap-1.5">
                      ${['Shirt', 'Pant', 'Tshirt', 'Jean', 'Jacket', 'Shorts']
                        .map(
                          (item) => `
                        <button
                          type="button"
                          data-chip="${item}"
                          class="px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors border ${
                            selectedTags.has(item)
                              ? 'bg-[#004643] text-white border-[#004643]'
                              : 'bg-[#27272A] text-[#D4D4D8] border-[#3F3F46] hover:bg-[#3F3F46]'
                          }"
                        >
                          ${item}
                        </button>
                      `
                        )
                        .join('')}
                    </div>
                  </div>
                </div>

                <!-- Special Request / Message (Optional) -->
                <div>
                  <div class="flex items-center justify-between mb-1.5">
                    <label for="modal-input-notes" class="text-xs font-semibold text-[#E4E4E7]">
                      Special Requests / Message
                    </label>
                    <span class="text-[10px] font-normal text-[#A1A1AA] bg-[#27272A] px-2 py-0.5 rounded-full border border-[#3F3F46]">Optional</span>
                  </div>
                  <textarea
                    id="modal-input-notes"
                    rows="2"
                    placeholder="Type any message, specific store requests, budget, or preferred fabrics..."
                    class="w-full px-3.5 py-2.5 rounded-xl bg-[#27272A] border border-[#3F3F46] text-xs text-white placeholder-[#71717A] focus:border-[#004643] focus:ring-1 focus:ring-[#004643] outline-none resize-none transition-colors"
                  ></textarea>
                </div>

                <div id="modal-form-error" class="hidden p-2.5 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-xs"></div>

                <button
                  type="submit"
                  id="modal-submit-btn"
                  class="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-[#004643] text-white hover:bg-[#003634] transition-colors shadow-sm"
                >
                  Book Session Now
                </button>
              </form>
            `
            }
          </div>

        </div>

      </div>
    `;

    attachModalHandlers();
  };

  const attachModalHandlers = () => {
    modalContainer.querySelector('#modal-close-btn')?.addEventListener('click', closeModal);
    modalContainer.querySelector('#modal-done-btn')?.addEventListener('click', closeModal);

    modalContainer.querySelector('#modal-btn-confirm-slot')?.addEventListener('click', () => {
      currentStep = 'details';
      renderModalContent();
    });

    modalContainer.querySelector('#modal-btn-back-calendar')?.addEventListener('click', () => {
      currentStep = 'calendar';
      renderModalContent();
    });

    // Calendar Navigation
    modalContainer.querySelector('#modal-cal-prev')?.addEventListener('click', () => {
      if (viewMonth === 0) {
        viewMonth = 11;
        viewYear--;
      } else {
        viewMonth--;
      }
      renderModalContent();
    });

    modalContainer.querySelector('#modal-cal-next')?.addEventListener('click', () => {
      if (viewMonth === 11) {
        viewMonth = 0;
        viewYear++;
      } else {
        viewMonth++;
      }
      renderModalContent();
    });

    // Calendar day selection
    modalContainer.querySelectorAll('[data-cal-day]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const d = parseInt(btn.getAttribute('data-cal-day'), 10);
        selectedDate = new Date(viewYear, viewMonth, d);
        renderModalContent();
      });
    });

    // Time mode tabs & custom time handlers
    modalContainer.querySelector('#modal-mode-preset')?.addEventListener('click', () => {
      timeMode = 'preset';
      if (!PUBLIC_CONFIG.timeSlots.includes(selectedTime)) {
        selectedTime = PUBLIC_CONFIG.timeSlots[0] || '10.30 AM - 11.30 AM';
      }
      renderModalContent();
    });

    modalContainer.querySelector('#modal-mode-custom')?.addEventListener('click', () => {
      timeMode = 'custom';
      selectedTime = `${customStart} - ${customEnd}`;
      renderModalContent();
    });

    modalContainer.querySelector('#modal-custom-start')?.addEventListener('change', (e) => {
      customStart = e.target.value;
      selectedTime = `${customStart} - ${customEnd}`;
      renderModalContent();
    });

    modalContainer.querySelector('#modal-custom-end')?.addEventListener('change', (e) => {
      customEnd = e.target.value;
      selectedTime = `${customStart} - ${customEnd}`;
      renderModalContent();
    });

    // Time slot selection
    modalContainer.querySelectorAll('[data-time-slot]').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedTime = btn.getAttribute('data-time-slot');
        renderModalContent();
      });
    });

    // Category chips
    modalContainer.querySelectorAll('[data-chip]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const chip = btn.getAttribute('data-chip');
        if (selectedTags.has(chip)) {
          selectedTags.delete(chip);
        } else {
          selectedTags.add(chip);
        }
        renderModalContent();
      });
    });

    // Form submission
    const form = modalContainer.querySelector('#modal-booking-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errEl = modalContainer.querySelector('#modal-form-error');
        const submitBtn = modalContainer.querySelector('#modal-submit-btn');

        const name = modalContainer.querySelector('#modal-input-name')?.value.trim();
        const whatsapp = modalContainer.querySelector('#modal-input-whatsapp')?.value.trim();
        const notes = modalContainer.querySelector('#modal-input-notes')?.value.trim() || '';
        const city = modalContainer.querySelector('#modal-select-city')?.value;
        const storeId = modalContainer.querySelector('#modal-select-store')?.value;
        const selectedStoreObj = activeStores.find((s) => s.id === storeId);
        const storeName = selectedStoreObj ? selectedStoreObj.name : storeId;

        if (!name || !whatsapp) {
          errEl.textContent = 'Please fill in your name and WhatsApp number.';
          errEl.classList.remove('hidden');
          return;
        }

        errEl.classList.add('hidden');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting your booking...';

        try {
          const reqArray = Array.from(selectedTags);
          const requirementStr = reqArray.length > 0 ? reqArray.join(', ') : 'Shopping Assistance';

          const payload = {
            customerName: name,
            whatsappNumber: whatsapp,
            city: city,
            store: storeName,
            requirement: requirementStr,
            preferredDate: formatDateIso(selectedDate),
            preferredTime: selectedTime,
            additionalNotes: notes,
          };

          const result = await submitBookingRequest(payload);
          if (result && result.ok) {
            modalContainer.querySelector('#modal-booking-widget')?.classList.add('hidden');
            const confEl = modalContainer.querySelector('#modal-booking-confirmation');
            if (confEl) {
              confEl.classList.remove('hidden');
              modalContainer.querySelector('#modal-conf-id').textContent = result.bookingId;
              modalContainer.querySelector('#modal-conf-name').textContent = name;
              modalContainer.querySelector('#modal-conf-store').textContent = `${storeName} (${city})`;
              modalContainer.querySelector('#modal-conf-time').textContent = `${formatDateIso(selectedDate)} @ ${selectedTime}`;
            }
            if (typeof onSuccess === 'function') onSuccess(result);
          } else {
            errEl.textContent = result?.error || 'Failed to submit booking. Please try again.';
            errEl.classList.remove('hidden');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Book Session Now';
          }
        } catch (err) {
          errEl.textContent = err.message || 'Error communicating with booking service.';
          errEl.classList.remove('hidden');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Book Session Now';
        }
      });
    }
  };

  renderModalContent();
}
