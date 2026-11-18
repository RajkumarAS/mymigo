// Book a Session Page — Cal.com / InBooked style interactive booking calendar
// Features: Left Session Details (no Google Meet), Monthly Calendar Grid,
// 12H time slot selection (10.30 AM - 11.30 AM up to 7.30 PM),
// and seamless Customer Details Form connecting to Google Sheets.

import { PUBLIC_CONFIG } from '../config.js';
import { fetchActiveStores } from '../services/storeService.js';
import { submitBookingRequest } from '../services/bookingService.js';
import { TIME_OPTIONS } from '../components/BookingModal.js';
import {
  escapeHtml,
  getTodayIsoDate,
  formatDateIso,
  formatDateOrdinal,
  formatDateFull,
  MONTH_NAMES,
  DAY_NAMES_SHORT,
} from '../utils/dom.js';

export async function renderBookSessionPage(container, navigate, queryParams) {
  const preselectedStoreId = queryParams.get('store') || '';
  const preselectedCity = queryParams.get('city') || '';

  let activeStores = [];
  try {
    activeStores = await fetchActiveStores();
  } catch {
    activeStores = [];
  }

  const matchedStore = activeStores.find((s) => s.id === preselectedStoreId);
  const initialCity = matchedStore ? matchedStore.city : preselectedCity;

  // Calendar State
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Initialize selected date (default to today or next 3 days, like Nov 18 in screenshot)
  let selectedDate = new Date(today);
  // If today is before the 18th of current month, let's select 18th if within same month, else today
  const candidate18 = new Date(today.getFullYear(), today.getMonth(), 18);
  if (candidate18 >= today) {
    selectedDate = candidate18;
  }

  let viewYear = selectedDate.getFullYear();
  let viewMonth = selectedDate.getMonth();

  // Default selected time slot (12H format, starting at 10.30 AM - 11.30 AM)
  let selectedTime = PUBLIC_CONFIG.timeSlots[0] || '10.30 AM - 11.30 AM';
  let timeMode = 'preset'; // 'preset' | 'custom'
  let customStart = '11:00 AM';
  let customEnd = '03:00 PM';

  // Step state: 'calendar' | 'details'
  let currentStep = 'calendar';

  const render = () => {
    const isStepCalendar = currentStep === 'calendar';
    const selectedDateIso = formatDateIso(selectedDate);
    const selectedDateOrdinal = formatDateOrdinal(selectedDate);
    const selectedDateFull = formatDateFull(selectedDate);

    // Compute calendar grid
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    // Disable navigating to past months
    const canGoPrevMonth =
      viewYear > today.getFullYear() ||
      (viewYear === today.getFullYear() && viewMonth > today.getMonth());

    container.innerHTML = `
      <div class="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-14 animate-fade-up">
        <!-- Header -->
        <div class="max-w-2xl">
          <p class="text-xs font-semibold uppercase tracking-widest text-[#004643]">Shopping Assistance</p>
          <h1 class="mt-2 text-3xl sm:text-5xl font-bold tracking-tight text-[#141413]">
            Book Your Shopping Session
          </h1>
          <p class="mt-3 text-base sm:text-lg text-[#57534E] leading-relaxed">
            Want to shop from a store in another city? Choose your preferred date and time slot below, and we'll connect you with the right shopping assistance.
          </p>

          ${
            matchedStore
              ? `
            <div class="mt-4 inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-[#DCD6C9] text-xs font-semibold text-[#141413] shadow-sm">
              <span class="w-2.5 h-2.5 rounded-full bg-[#004643]"></span>
              <span>Virtual Shopping Session for ${escapeHtml(matchedStore.name)} (${escapeHtml(matchedStore.city)})</span>
            </div>
          `
              : ''
          }
        </div>

        <!-- Confirmation Panel (Hidden until Google Sheets confirms submission) -->
        <div
          id="booking-confirmation"
          class="hidden mt-8 bg-white rounded-3xl border border-[#DCD6C9] p-8 sm:p-12 text-center shadow-xl"
        >
          <div class="w-16 h-16 mx-auto rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mb-6">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 class="text-2xl sm:text-3xl font-bold tracking-tight text-[#141413]">
            Booking Request Received
          </h2>
          <p class="mt-3 text-base text-[#57534E] max-w-md mx-auto leading-relaxed">
            Thank you. Your MyMigo request has been received. Our team will contact you shortly.
          </p>

          <div class="mt-6 inline-flex flex-wrap items-center justify-center gap-3 px-5 py-2.5 rounded-2xl bg-[#E7E3D9] text-xs sm:text-sm font-semibold text-[#141413]">
            <span>Reference ID: <strong id="confirmed-booking-id" class="text-[#004643]"></strong></span>
            <span class="text-[#A8A29E]">•</span>
            <span id="confirmed-booking-slot" class="text-[#57534E]"></span>
          </div>

          <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              id="book-another-btn"
              class="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-semibold bg-[#004643] text-white hover:bg-[#003634] transition-colors shadow-sm"
            >
              Submit Another Request
            </button>
            <a
              href="#/stores"
              data-book-nav="/stores"
              class="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-semibold border border-[#DCD6C9] bg-white text-[#004643] hover:bg-[#F0EDE5] transition-colors"
            >
              Explore Stores
            </a>
          </div>
        </div>

        <!-- Main Cal.com / InBooked Style Card -->
        <div id="booking-widget-card" class="mt-8 rounded-[28px] bg-[#121214] border border-[#27272A] text-white shadow-2xl overflow-hidden transition-all">
          
          <!-- STEP 1: Cal.com Calendar & Time Slots View -->
          <div id="view-calendar-step" class="${isStepCalendar ? 'block' : 'hidden'}">
            <div class="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#27272A]">
              
              <!-- 1. Left Column: Session Details (No Google Meet, Strictly Shopping Assistance) -->
              <div class="lg:col-span-4 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-2xl bg-[#27272A] text-white flex items-center justify-center text-sm font-bold border border-[#3F3F46]">
                      ${matchedStore ? escapeHtml(matchedStore.name.slice(0, 1)) : 'M'}
                    </div>
                    <div>
                      <p class="text-xs uppercase tracking-wider text-[#A1A1AA] font-medium">
                        ${matchedStore ? escapeHtml(matchedStore.name) : 'MyMigo'}
                      </p>
                      <h2 class="text-lg sm:text-xl font-bold tracking-tight text-white leading-tight">
                        Self Booked Shopping Session
                      </h2>
                    </div>
                  </div>

                  <!-- Requires Confirmation Badge -->
                  <div class="mt-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-xs font-medium text-[#D4D4D8]">
                    <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Requires confirmation</span>
                  </div>

                  <!-- Session Metadata Rows -->
                  <div class="mt-6 space-y-3.5 text-sm text-[#A1A1AA]">
                    <div class="flex items-center gap-2.5">
                      <svg class="w-4 h-4 text-[#71717A] shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      <span>60m session</span>
                    </div>

                    <!-- Shopping Assistance Option (NOT Google Meet) -->
                    <div class="flex items-center gap-2.5 text-[#E4E4E7]">
                      <div class="w-5 h-5 rounded-md bg-[#004643] flex items-center justify-center shrink-0">
                        <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <span>Shopping Assistance (Live In-Store)</span>
                    </div>

                    <!-- Timezone -->
                    <div class="flex items-center gap-2.5">
                      <svg class="w-4 h-4 text-[#71717A] shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"></path>
                      </svg>
                      <span>Asia/Kolkata (IST)</span>
                    </div>
                  </div>
                </div>

                <!-- Selected Session Preview -->
                <div class="mt-8 pt-6 border-t border-[#27272A]/80">
                  <p class="text-xs uppercase tracking-wider text-[#71717A] font-semibold mb-2">Selected Time</p>
                  <div class="p-3.5 rounded-2xl bg-[#18181B] border border-[#27272A]">
                    <p class="text-sm font-semibold text-white">${escapeHtml(selectedDateFull)}</p>
                    <span class="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-[#004643] text-xs font-semibold text-white">${escapeHtml(selectedTime)}</span>
                  </div>

                  <button
                    type="button"
                    id="btn-goto-details-left"
                    class="mt-4 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-[#004643] text-white hover:bg-[#003634] transition-colors shadow-lg shadow-black/25"
                  >
                    <span>Confirm &amp; Enter Details</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- 2. Middle Column: Calendar Month View -->
              <div class="lg:col-span-5 p-6 sm:p-8">
                <!-- Month Header & Navigation -->
                <div class="flex items-center justify-between mb-6">
                  <h3 class="text-base sm:text-lg font-bold text-white tracking-tight">
                    ${MONTH_NAMES[viewMonth]} ${viewYear}
                  </h3>
                  <div class="flex items-center gap-1">
                    <button
                      type="button"
                      id="cal-prev-month"
                      aria-label="Previous month"
                      ${!canGoPrevMonth ? 'disabled' : ''}
                      class="p-2 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#27272A] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      id="cal-next-month"
                      aria-label="Next month"
                      class="p-2 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#27272A] transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Weekday Headers -->
                <div class="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold tracking-wider uppercase text-[#71717A] mb-2">
                  ${DAY_NAMES_SHORT.map((day) => `<div>${day}</div>`).join('')}
                </div>

                <!-- Calendar Days Grid -->
                <div class="grid grid-cols-7 gap-1 text-center">
                  ${(() => {
                    let cells = '';
                    // Previous month padded days
                    for (let i = 0; i < firstDayIndex; i++) {
                      const prevDay = daysInPrevMonth - firstDayIndex + i + 1;
                      cells += `<div class="h-10 sm:h-11 flex items-center justify-center text-xs text-[#3F3F46] select-none">${prevDay}</div>`;
                    }

                    // Current month days
                    for (let day = 1; day <= daysInMonth; day++) {
                      const cellDate = new Date(viewYear, viewMonth, day);
                      cellDate.setHours(0, 0, 0, 0);
                      const isPast = cellDate < today;
                      const isSelected = cellDate.getTime() === selectedDate.getTime();
                      const isCurrentDay = cellDate.getTime() === today.getTime();

                      if (isPast) {
                        cells += `
                          <div class="h-10 sm:h-11 flex items-center justify-center text-xs text-[#3F3F46] select-none cursor-not-allowed">
                            ${day}
                          </div>
                        `;
                      } else {
                        cells += `
                          <button
                            type="button"
                            data-cal-day="${day}"
                            class="h-10 sm:h-11 rounded-xl flex flex-col items-center justify-center text-xs sm:text-sm font-medium transition-all relative ${
                              isSelected
                                ? 'bg-[#004643] text-white font-bold shadow-lg shadow-black/30 ring-2 ring-[#004643]'
                                : 'text-[#E4E4E7] hover:bg-[#27272A] hover:text-white'
                            }"
                          >
                            <span>${day}</span>
                            ${
                              !isSelected
                                ? `<span class="w-1 h-1 rounded-full ${isCurrentDay ? 'bg-[#F0EDE5]' : 'bg-[#52525B]'} mt-0.5"></span>`
                                : '<span class="w-1 h-1 rounded-full bg-white mt-0.5"></span>'
                            }
                          </button>
                        `;
                      }
                    }
                    return cells;
                  })()}
                </div>
              </div>

              <!-- 3. Right Column: 12H Time Slots List & Custom Time Range -->
              <div class="lg:col-span-3 p-6 sm:p-8 flex flex-col">
                <div class="flex items-center justify-between mb-3">
                  <h3 class="text-sm sm:text-base font-bold text-white tracking-tight">
                    ${escapeHtml(selectedDateOrdinal)}
                  </h3>
                  <!-- 12H Format Indicator -->
                  <span class="px-2.5 py-0.5 rounded-md bg-[#18181B] border border-[#27272A] text-[11px] font-semibold text-[#A1A1AA]">
                    12h format
                  </span>
                </div>

                <!-- Mode Switcher Tabs: Preset Slots vs Custom Time Range -->
                <div class="grid grid-cols-2 p-1 rounded-xl bg-[#18181B] border border-[#27272A] mb-3 text-xs font-semibold">
                  <button
                    type="button"
                    id="page-mode-preset"
                    class="py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${
                      timeMode === 'preset'
                        ? 'bg-[#004643] text-white shadow-xs'
                        : 'text-[#A1A1AA] hover:text-white'
                    }"
                  >
                    Preset Slots
                  </button>
                  <button
                    type="button"
                    id="page-mode-custom"
                    class="py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${
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
                  <div class="cal-slot-scroll max-h-[340px] overflow-y-auto space-y-2 pr-1 flex-1">
                    ${PUBLIC_CONFIG.timeSlots
                      .map((slot) => {
                        const isSlotSelected = selectedTime === slot;
                        return `
                        <button
                          type="button"
                          data-slot-btn="${escapeHtml(slot)}"
                          class="w-full py-2.5 px-3 rounded-xl border text-xs sm:text-sm text-center font-medium transition-all cursor-pointer ${
                            isSlotSelected
                              ? 'border-[#004643] bg-[#004643] text-white font-semibold ring-2 ring-[#004643]'
                              : 'border-[#27272A] bg-[#18181B] text-[#D4D4D8] hover:border-[#004643] hover:bg-[#202025] hover:text-white'
                          }"
                        >
                          ${escapeHtml(slot)}
                        </button>
                      `;
                      })
                      .join('')}
                  </div>
                `
                    : `
                  <!-- Custom Time (Start Session & End Session) -->
                  <div class="space-y-3.5 p-4 rounded-2xl bg-[#18181B] border border-[#27272A] flex-1">
                    <div>
                      <label for="page-custom-start" class="block text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA] mb-1.5">
                        Start Session
                      </label>
                      <select
                        id="page-custom-start"
                        class="w-full px-3 py-2 rounded-xl bg-[#27272A] border border-[#3F3F46] text-xs text-white focus:border-[#004643] outline-none cursor-pointer"
                      >
                        ${TIME_OPTIONS.map((t) => `<option value="${t}" ${customStart === t ? 'selected' : ''}>${t}</option>`).join('')}
                      </select>
                    </div>

                    <div>
                      <label for="page-custom-end" class="block text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA] mb-1.5">
                        End Session
                      </label>
                      <select
                        id="page-custom-end"
                        class="w-full px-3 py-2 rounded-xl bg-[#27272A] border border-[#3F3F46] text-xs text-white focus:border-[#004643] outline-none cursor-pointer"
                      >
                        ${TIME_OPTIONS.map((t) => `<option value="${t}" ${customEnd === t ? 'selected' : ''}>${t}</option>`).join('')}
                      </select>
                    </div>

                    <div class="p-3 rounded-xl bg-[#004643]/20 border border-[#004643]/40 text-xs text-[#A7F3D0]">
                      <p class="font-medium">Selected Session:</p>
                      <p class="text-sm font-bold text-white mt-0.5">${escapeHtml(selectedTime)}</p>
                    </div>
                  </div>
                `
                }

                <button
                  type="button"
                  id="btn-goto-details-right"
                  class="mt-4 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-[#004643] text-white hover:bg-[#003634] transition-colors shadow-lg shadow-black/25"
                >
                  <span>Next: Your Details</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>

            </div>
          </div>

          <!-- STEP 2: Customer Details Form View (Slides into the Card) -->
          <div id="view-details-step" class="${!isStepCalendar ? 'block' : 'hidden'} p-6 sm:p-10">
            <!-- Back & Summary Header -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#27272A]">
              <div>
                <button
                  type="button"
                  id="btn-back-to-calendar"
                  class="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#A1A1AA] hover:text-white transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Change Date &amp; Time</span>
                </button>
                <h2 class="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Enter Your Details
                </h2>
              </div>

              <!-- Selected Slot Badge -->
              <div class="px-4 py-2.5 rounded-2xl bg-[#18181B] border border-[#27272A] flex items-center gap-2.5 text-xs sm:text-sm">
                <span class="w-2.5 h-2.5 rounded-full bg-[#004643] shrink-0 ring-2 ring-white/20"></span>
                <span class="font-semibold text-white">${escapeHtml(selectedDateOrdinal)}</span>
                <span class="text-[#71717A]">•</span>
                <span class="px-2 py-0.5 rounded-md bg-[#004643] text-white font-semibold text-xs">${escapeHtml(selectedTime)}</span>
              </div>
            </div>

            <!-- Booking Form -->
            <form id="booking-form" novalidate class="mt-6 space-y-6">
              <div id="booking-error-banner" class="hidden rounded-2xl border border-rose-500/30 bg-rose-950/40 p-4 text-sm text-rose-200">
                <p class="font-semibold" id="booking-error-title">Unable to submit booking</p>
                <p class="mt-1 text-xs text-rose-300" id="booking-error-message"></p>
              </div>

              <!-- Hidden Preferred Date & Time inputs bound from Step 1 -->
              <input type="hidden" name="preferredDate" value="${escapeHtml(selectedDateIso)}" />
              <input type="hidden" name="preferredTime" value="${escapeHtml(selectedTime)}" />

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <!-- Customer Name -->
                <div>
                  <label for="customerName" class="block text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] mb-2">
                    Customer Name <span class="text-[#004643]">*</span>
                  </label>
                  <input
                    id="customerName"
                    name="customerName"
                    type="text"
                    required
                    autocomplete="name"
                    placeholder="e.g., Meera Sundaram"
                    class="w-full px-4 py-3 rounded-xl border border-[#27272A] bg-[#18181B] text-sm text-white placeholder:text-[#52525B] focus:border-[#004643] focus:ring-1 focus:ring-[#004643]"
                  />
                </div>

                <!-- WhatsApp Number (Required) -->
                <div>
                  <label for="whatsappNumber" class="block text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] mb-2">
                    WhatsApp Number <span class="text-[#004643]">*</span>
                  </label>
                  <input
                    id="whatsappNumber"
                    name="whatsappNumber"
                    type="tel"
                    required
                    autocomplete="tel"
                    placeholder="e.g., +91 98765 43210"
                    class="w-full px-4 py-3 rounded-xl border border-[#27272A] bg-[#18181B] text-sm text-white placeholder:text-[#52525B] focus:border-[#004643] focus:ring-1 focus:ring-[#004643]"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <!-- City (Dropdown) -->
                <div>
                  <label for="city" class="block text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] mb-2">
                    City <span class="text-[#004643]">*</span>
                  </label>
                  <select
                    id="city"
                    name="city"
                    required
                    class="w-full px-4 py-3 rounded-xl border border-[#27272A] bg-[#18181B] text-sm text-white focus:border-[#004643] focus:ring-1 focus:ring-[#004643]"
                  >
                    <option value="">Select a city</option>
                    ${PUBLIC_CONFIG.cities
                      .map(
                        (city) => `
                        <option value="${escapeHtml(city)}" ${initialCity === city ? 'selected' : ''}>
                          ${escapeHtml(city)}
                        </option>
                      `
                      )
                      .join('')}
                  </select>
                </div>

                <!-- Store (Dropdown) -->
                <div>
                  <label for="store" class="block text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] mb-2">
                    Store <span class="text-[#004643]">*</span>
                  </label>
                  <select
                    id="store"
                    name="store"
                    required
                    class="w-full px-4 py-3 rounded-xl border border-[#27272A] bg-[#18181B] text-sm text-white focus:border-[#004643] focus:ring-1 focus:ring-[#004643]"
                  >
                    <option value="">Select a store</option>
                  </select>
                </div>
              </div>

              <!-- What are you looking for? -->
              <div>
                <label for="requirement" class="block text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] mb-2">
                  What are you looking for? <span class="text-[#004643]">*</span>
                </label>
                <textarea
                  id="requirement"
                  name="requirement"
                  rows="3"
                  required
                  placeholder='e.g., "Saree for wedding", "Cotton sarees under ₹2,000", "Men&#39;s shirts"'
                  class="w-full px-4 py-3 rounded-xl border border-[#27272A] bg-[#18181B] text-sm text-white placeholder:text-[#52525B] focus:border-[#004643] focus:ring-1 focus:ring-[#004643]"
                ></textarea>
              </div>

              <!-- Special Request / Message (Optional) -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <label for="additionalNotes" class="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
                    Special Requests / Message
                  </label>
                  <span class="text-[10px] font-normal text-[#A1A1AA] bg-[#18181B] px-2.5 py-1 rounded-full border border-[#27272A]">Optional</span>
                </div>
                <textarea
                  id="additionalNotes"
                  name="additionalNotes"
                  rows="3"
                  placeholder="Type any message, specific store requests, budget, or preferred fabrics..."
                  class="w-full px-4 py-3 rounded-xl border border-[#27272A] bg-[#18181B] text-sm text-white placeholder:text-[#52525B] focus:border-[#004643] focus:ring-1 focus:ring-[#004643]"
                ></textarea>
              </div>

              <!-- Submit Buttons -->
              <div class="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  id="submit-booking-btn"
                  class="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-full text-sm sm:text-base font-semibold bg-[#004643] text-white hover:bg-[#003634] disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200 shadow-lg shadow-black/25"
                >
                  Submit Booking Request
                </button>
                <button
                  type="button"
                  id="btn-cancel-to-calendar"
                  class="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-full text-sm font-semibold border border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-[#18181B] transition-colors"
                >
                  Back
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    `;

    attachEventHandlers();
  };

  const attachEventHandlers = () => {
    // Month navigation
    container.querySelector('#cal-prev-month')?.addEventListener('click', () => {
      if (viewMonth === 0) {
        viewMonth = 11;
        viewYear--;
      } else {
        viewMonth--;
      }
      render();
    });

    container.querySelector('#cal-next-month')?.addEventListener('click', () => {
      if (viewMonth === 11) {
        viewMonth = 0;
        viewYear++;
      } else {
        viewMonth++;
      }
      render();
    });

    // Day selection
    container.querySelectorAll('[data-cal-day]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const d = parseInt(btn.getAttribute('data-cal-day'), 10);
        selectedDate = new Date(viewYear, viewMonth, d);
        render();
      });
    });

    // Time Mode Switcher & Custom Range Handlers
    container.querySelector('#page-mode-preset')?.addEventListener('click', () => {
      timeMode = 'preset';
      if (!PUBLIC_CONFIG.timeSlots.includes(selectedTime)) {
        selectedTime = PUBLIC_CONFIG.timeSlots[0] || '10.30 AM - 11.30 AM';
      }
      render();
    });

    container.querySelector('#page-mode-custom')?.addEventListener('click', () => {
      timeMode = 'custom';
      selectedTime = `${customStart} - ${customEnd}`;
      render();
    });

    container.querySelector('#page-custom-start')?.addEventListener('change', (e) => {
      customStart = e.target.value;
      selectedTime = `${customStart} - ${customEnd}`;
      render();
    });

    container.querySelector('#page-custom-end')?.addEventListener('change', (e) => {
      customEnd = e.target.value;
      selectedTime = `${customStart} - ${customEnd}`;
      render();
    });

    // Slot selection
    container.querySelectorAll('[data-slot-btn]').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedTime = btn.getAttribute('data-slot-btn');
        render();
      });
    });

    // Step navigation: Go to Details
    const goToDetails = () => {
      currentStep = 'details';
      render();
      window.scrollTo({ top: container.offsetTop - 20, behavior: 'smooth' });
    };

    container.querySelector('#btn-goto-details-left')?.addEventListener('click', goToDetails);
    container.querySelector('#btn-goto-details-right')?.addEventListener('click', goToDetails);

    // Step navigation: Back to Calendar
    const backToCalendar = () => {
      currentStep = 'calendar';
      render();
    };

    container.querySelector('#btn-back-to-calendar')?.addEventListener('click', backToCalendar);
    container.querySelector('#btn-cancel-to-calendar')?.addEventListener('click', backToCalendar);

    // Form elements & store population
    const form = container.querySelector('#booking-form');
    const citySelect = container.querySelector('#city');
    const storeSelect = container.querySelector('#store');
    const errorBanner = container.querySelector('#booking-error-banner');
    const errorTitle = container.querySelector('#booking-error-title');
    const errorMsg = container.querySelector('#booking-error-message');
    const submitBtn = container.querySelector('#submit-booking-btn');

    const populateStoresDropdown = (cityFilter, selectedStoreNameOrId = '') => {
      if (!storeSelect) return;
      const storesToShow = cityFilter
        ? activeStores.filter((s) => s.city === cityFilter)
        : activeStores;

      storeSelect.innerHTML = '<option value="">Select a store</option>';

      if (storesToShow.length === 0 && cityFilter) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = `No active stores listed in ${cityFilter} yet`;
        opt.disabled = true;
        storeSelect.appendChild(opt);
        return;
      }

      storesToShow.forEach((store) => {
        const opt = document.createElement('option');
        opt.value = store.name;
        opt.textContent = cityFilter ? store.name : `${store.name} (${store.city})`;
        if (
          selectedStoreNameOrId &&
          (store.id === selectedStoreNameOrId || store.name === selectedStoreNameOrId)
        ) {
          opt.selected = true;
        }
        storeSelect.appendChild(opt);
      });
    };

    if (citySelect) {
      populateStoresDropdown(citySelect.value || initialCity, matchedStore ? matchedStore.id : '');
      citySelect.addEventListener('change', () => {
        populateStoresDropdown(citySelect.value);
      });
    }

    const showError = (title, message) => {
      if (!errorBanner) return;
      errorTitle.textContent = title;
      errorMsg.textContent = message;
      errorBanner.classList.remove('hidden');
      errorBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    const hideError = () => {
      errorBanner?.classList.add('hidden');
    };

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();

        const whatsapp = form.whatsappNumber.value.trim();
        const payload = {
          customerName: form.customerName.value.trim(),
          whatsappNumber: whatsapp,
          mobileNumber: whatsapp,
          email: '',
          city: form.city.value.trim(),
          store: form.store.value.trim(),
          requirement: form.requirement.value.trim(),
          preferredDate: form.preferredDate.value.trim(),
          preferredTime: form.preferredTime.value.trim(),
          additionalNotes: form.additionalNotes ? form.additionalNotes.value.trim() : '',
        };

        if (!payload.customerName) {
          showError('Missing required field', 'Please enter your Customer Name.');
          form.customerName.focus();
          return;
        }
        if (!whatsapp) {
          showError('Missing required field', 'Please enter your WhatsApp Number.');
          form.whatsappNumber.focus();
          return;
        }
        const digits = whatsapp.replace(/\D/g, '');
        if (digits.length < 8 || digits.length > 15) {
          showError('Invalid WhatsApp Number', 'Please enter a valid WhatsApp Number (8–15 digits).');
          form.whatsappNumber.focus();
          return;
        }
        if (!payload.city) {
          showError('Missing required field', 'Please select a City.');
          form.city.focus();
          return;
        }
        if (!payload.store) {
          showError('Missing required field', 'Please select a Store.');
          form.store.focus();
          return;
        }
        if (!payload.requirement) {
          showError('Missing required field', 'Please tell us what you are looking for.');
          form.requirement.focus();
          return;
        }
        if (!payload.preferredDate) {
          showError('Missing preferred date', 'Please pick a date from the calendar.');
          return;
        }
        if (!payload.preferredTime) {
          showError('Missing preferred time', 'Please pick a 12H time slot.');
          return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting Request...';

        try {
          const result = await submitBookingRequest(payload);
          form.reset();
          const widgetCard = container.querySelector('#booking-widget-card');
          const confirmationEl = container.querySelector('#booking-confirmation');
          const confirmedIdEl = container.querySelector('#confirmed-booking-id');
          const confirmedSlotEl = container.querySelector('#confirmed-booking-slot');

          if (widgetCard) widgetCard.classList.add('hidden');
          if (confirmedIdEl) confirmedIdEl.textContent = result.bookingId;
          if (confirmedSlotEl) {
            confirmedSlotEl.textContent = `${formatDateOrdinal(selectedDate)} at ${selectedTime}`;
          }
          if (confirmationEl) {
            confirmationEl.classList.remove('hidden');
            confirmationEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        } catch (err) {
          if (err.code === 'GOOGLE_SHEETS_NOT_CONFIGURED') {
            showError(
              'Google Sheets Integration Not Connected Yet',
              'Your booking was not saved because Google Sheets credentials are not configured on the server yet. Please configure GOOGLE_APPS_SCRIPT_URL or Google Service Account settings in .env to enable live booking storage.'
            );
          } else {
            showError('Booking Not Saved', err.message);
          }
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Booking Request';
        }
      });
    }

    container.querySelector('#book-another-btn')?.addEventListener('click', () => {
      container.querySelector('#booking-confirmation')?.classList.add('hidden');
      container.querySelector('#booking-widget-card')?.classList.remove('hidden');
      currentStep = 'calendar';
      render();
    });

    container.querySelectorAll('[data-book-nav]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        navigate(el.getAttribute('data-book-nav'));
      });
    });
  };

  render();
}
