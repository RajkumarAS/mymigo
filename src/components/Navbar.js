// Navigation — Desktop Header + Floating Pill 5-icon mobile bottom switcher
// Top header: Bare Book icon on left (no box), Centered MyMigo brand (no M box),
// Right side: Infinity Icon, Desktop User Pill (with Instagram-style account switcher & login), Book Session.
// Bottom floating pill: Stores (left), Videos, Migo Connect (center), Search, User Profile / Switcher (right).
// Supports instant Tap and Click-and-Hold (long press) to switch accounts or login!

import {
  getCurrentUser,
  openAuthModal,
  openAccountSwitcherBottomSheet,
} from './AuthModal.js';
import { escapeHtml } from '../utils/dom.js';

const UNREAD_STORAGE_KEY = 'mymigo_has_unread_notif_v1';

function hasUnreadNotification() {
  try {
    const val = localStorage.getItem(UNREAD_STORAGE_KEY);
    if (val !== null) return val === 'true';
  } catch (e) {
    // fallback
  }
  return true;
}

function getBottomTabIcon(id, isActive, currentUser) {
  switch (id) {
    case 'stores':
      return `<svg class="w-[21px] h-[21px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${isActive ? '2.4' : '2'}" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l1.5-5h15L21 9" />
        <path d="M3 9a2.5 2.5 0 005 0 2.5 2.5 0 005 0 2.5 2.5 0 003 0" />
        <path d="M5 11.5V19a2 2 0 002 2h10a2 2 0 002-2v-7.5" />
      </svg>`;
    case 'search':
      return `<svg class="w-[21px] h-[21px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${isActive ? '2.6' : '2.1'}" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="7" />
        <line x1="16.5" y1="16.5" x2="21" y2="21" stroke-linecap="round" />
      </svg>`;
    case 'connect':
      return `<svg class="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M5.5 17.5L8.5 7.5L12 12.5L15.5 7.5L18.5 17.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="5.5" cy="17.5" r="2.6" />
        <circle cx="8.5" cy="7.5" r="2.6" />
        <circle cx="15.5" cy="7.5" r="2.6" />
        <circle cx="18.5" cy="17.5" r="2.6" />
      </svg>`;
    case 'finds':
      return `<svg class="w-[21px] h-[21px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${isActive ? '2.3' : '2'}" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3.5" width="18" height="17" rx="5" />
        <path d="M10 9.5l5 3-5 3v-6z" fill="currentColor" stroke="none" />
      </svg>`;
    case 'profile':
    default:
      if (currentUser && currentUser.avatar) {
        const isSeller = currentUser.activeRole === 'seller';
        return `<div class="relative w-[26px] h-[26px] rounded-full overflow-visible flex items-center justify-center pointer-events-none">
          <div class="w-full h-full rounded-full overflow-hidden ${
            isActive ? 'ring-2 ring-white shadow-xs' : 'ring-1 ring-[#DCD6C9]'
          }">
            <img src="${escapeHtml(currentUser.avatar)}" alt="${escapeHtml(currentUser.name)}" class="w-full h-full object-cover" />
          </div>
          <span class="absolute -bottom-1 -right-1 text-[9px] leading-none bg-white rounded-full p-[1.5px] border border-[#DCD6C9] shadow-2xs">
            ${isSeller ? '🏪' : '👤'}
          </span>
        </div>`;
      }
      return `<svg class="w-[21px] h-[21px] pointer-events-none" viewBox="0 0 24 24" fill="${isActive ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="${isActive ? '2.4' : '2'}" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>`;
  }
}

const MOBILE_BOTTOM_ITEMS = [
  { id: 'stores', label: 'Stores', route: '/stores' },
  { id: 'finds', label: 'Videos', route: '/finds' },
  { id: 'connect', label: 'Migo Connect', route: '/connect' },
  { id: 'search', label: 'Search', route: '/search' },
  { id: 'profile', label: 'Profile', route: '/profile' },
];

/**
 * Attaches click and hold (long press) as well as regular click listeners
 */
export function attachLongPressListener(el, onHold, onClick, duration = 400) {
  let pressTimer = null;
  let wasLongPress = false;

  const startHold = () => {
    wasLongPress = false;
    pressTimer = setTimeout(() => {
      wasLongPress = true;
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(40);
        } catch (e) {}
      }
      el.classList.add('scale-90');
      setTimeout(() => el.classList.remove('scale-90'), 150);
      if (typeof onHold === 'function') onHold();
    }, duration);
  };

  const cancelHold = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
  };

  el.addEventListener('touchstart', startHold, { passive: true });
  el.addEventListener('touchend', cancelHold, { passive: true });
  el.addEventListener('touchcancel', cancelHold, { passive: true });

  el.addEventListener('mousedown', startHold);
  el.addEventListener('mouseup', cancelHold);
  el.addEventListener('mouseleave', cancelHold);

  el.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (wasLongPress) {
      wasLongPress = false;
      return;
    }
    if (typeof onClick === 'function') onClick(e);
  });
}

export function renderNavbar(container, currentRoute, navigate) {
  const isNotificationsPage = currentRoute === '/notifications';
  const isUnread = !isNotificationsPage && hasUnreadNotification();
  const currentUser = getCurrentUser();

  const totalAccounts = currentUser
    ? (currentUser.shopperAccounts?.length || 1) + (currentUser.sellerAccounts?.length || 1)
    : 0;

  container.innerHTML = `
    <!-- Top Header: Left Book Icon, Centered Brand, Right Infinity, User Pill / Login, Book Session -->
    <header class="sticky top-0 z-40 bg-[#F0EDE5]/95 backdrop-blur-md border-b border-[#DCD6C9] ${(currentRoute === '/finds' || currentRoute === '/instagram') ? 'hidden sm:block' : ''}">
      <div class="max-w-6xl mx-auto px-4 sm:px-8 py-3 sm:py-3.5 relative flex items-center justify-between">
        
        <!-- Left Side: Bare Book Icon Shortcut -->
        <div class="flex items-center gap-6 z-10">
          <a
            href="#/book"
            data-nav="/book"
            title="Book a Session"
            aria-label="Book a Session"
            class="text-[#004643] hover:text-[#003634] active:scale-95 transition-transform flex items-center justify-center p-1 -ml-1 focus:outline-none"
          >
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="17" rx="3.5" />
              <line x1="8" y1="2" x2="8" y2="5" />
              <line x1="16" y1="2" x2="16" y2="5" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="12" y1="12.5" x2="12" y2="17.5" />
              <line x1="9.5" y1="15" x2="14.5" y2="15" />
            </svg>
          </a>

          <!-- Desktop Navigation: Left items -->
          <nav aria-label="Desktop Nav Left" class="hidden md:flex items-center gap-6">
            <a
              href="#/"
              data-nav="/"
              class="text-sm font-medium transition-colors duration-150 ${
                currentRoute === '/' ? 'text-[#004643] font-bold' : 'text-[#57534E] hover:text-[#004643]'
              }"
            >
              Home
            </a>
            <a
              href="#/stores"
              data-nav="/stores"
              class="text-sm font-medium transition-colors duration-150 ${
                currentRoute === '/stores' ? 'text-[#004643] font-bold' : 'text-[#57534E] hover:text-[#004643]'
              }"
            >
              Explore Stores
            </a>
          </nav>
        </div>

        <!-- Center: Centered Brand "MyMigo" -->
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <a
            href="#/"
            data-nav="/"
            class="pointer-events-auto text-xl sm:text-2xl font-bold tracking-tight text-[#004643] hover:opacity-90 transition-opacity focus:outline-none"
          >
            MyMigo
          </a>
        </div>

        <!-- Right Side: Infinity Notification Icon, User Pill / Login, Book Session -->
        <div class="flex items-center gap-3 sm:gap-4 relative z-10">
          <nav aria-label="Desktop Nav Right" class="hidden md:flex items-center gap-6">
            <a
              href="#/connect"
              data-nav="/connect"
              class="text-sm font-medium transition-colors duration-150 ${
                currentRoute === '/connect' ? 'text-[#004643] font-bold' : 'text-[#57534E] hover:text-[#004643]'
              }"
            >
              Migo Connect
            </a>
            <a
              href="#/finds"
              data-nav="/finds"
              class="text-sm font-medium transition-colors duration-150 ${
                currentRoute === '/finds' || currentRoute === '/instagram'
                  ? 'text-[#004643] font-bold'
                  : 'text-[#57534E] hover:text-[#004643]'
              }"
            >
              Finds
            </a>
          </nav>

          <!-- Notification Button -->
          <a
            href="#/notifications"
            data-nav="/notifications"
            aria-label="Notifications"
            title="Notifications"
            class="relative text-[#004643] hover:text-[#003634] active:scale-95 transition-transform flex items-center justify-center p-1 -mr-1 focus:outline-none"
          >
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.267-8-12.356-8-5.096 0-5.096 8 0 8 5.09 0 7.261-8 12.356-8z" />
            </svg>
            <span
              id="notif-dot"
              class="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-[#004643] ring-2 ring-[#F0EDE5] ${
                isUnread ? '' : 'hidden'
              }"
            ></span>
          </a>

          <!-- Desktop User Icon Pill (Account & Switcher) -->
          ${
            currentUser
              ? `
            <button
              type="button"
              id="desktop-user-pill-btn"
              class="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#DCD6C9] bg-white hover:bg-[#F0EDE5] text-xs font-semibold text-[#141413] transition-all shadow-2xs cursor-pointer select-none"
              title="Click or hold to switch accounts"
            >
              <div class="relative w-5 h-5 rounded-full overflow-hidden ring-1 ring-[#004643] shrink-0">
                <img src="${escapeHtml(currentUser.avatar)}" alt="${escapeHtml(currentUser.name)}" class="w-full h-full object-cover" />
              </div>
              <span class="max-w-[90px] truncate text-xs font-bold">${escapeHtml(currentUser.name)}</span>
              <span class="px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                currentUser.activeRole === 'seller' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
              }">
                ${currentUser.activeRole === 'seller' ? '🏪 Seller' : '👤 Shopper'}
              </span>
              <span class="text-[11px] text-[#78716C] font-bold ml-0.5">▾</span>
            </button>
          `
              : `
            <button
              type="button"
              id="desktop-login-header-btn"
              class="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#DCD6C9] bg-white hover:bg-[#F0EDE5] text-xs font-bold text-[#004643] transition-all shadow-2xs cursor-pointer active:scale-95"
            >
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span>Login</span>
            </button>
          `
          }

          <!-- Desktop Book a Session button -->
          <a
            href="#/book"
            data-nav="/book"
            class="hidden lg:inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-semibold bg-[#004643] text-white hover:bg-[#003634] transition-colors shadow-sm"
          >
            Book a Session
          </a>
        </div>

      </div>
    </header>

    <!-- Floating Pill Mobile Bottom Switcher: Stores (left), Videos, Connect (center), Search, User Profile / Switcher (right) -->
    <nav
      id="mobile-bottom-dock"
      aria-label="Mobile Bottom Navigation"
      class="${(currentRoute === '/finds' || currentRoute === '/instagram') ? 'hidden' : 'md:hidden'} fixed bottom-4 inset-x-0 mx-auto z-50 w-[336px] sm:w-[360px] max-w-[94vw] h-[48px] bg-white/95 backdrop-blur-2xl rounded-full border border-[#DCD6C9] shadow-[0_8px_28px_-4px_rgba(20,20,19,0.22)] px-2 py-1 flex items-center justify-between"
    >
      ${MOBILE_BOTTOM_ITEMS.map((item) => {
        const isActive =
          currentRoute === item.route ||
          (item.route === '/finds' && (currentRoute === '/finds' || currentRoute === '/instagram')) ||
          (item.route === '/connect' && currentRoute === '/connect') ||
          (item.route === '/profile' && currentRoute === '/profile');
        return `
          <a
            href="#${item.route}"
            data-bottom-tab="${item.id}"
            aria-label="${item.label}"
            title="${item.id === 'profile' ? 'Profile & Account Switcher (Click or Hold to switch)' : item.label}"
            class="flex items-center justify-center transition-all duration-200 cursor-pointer select-none touch-manipulation ${
              isActive
                ? 'w-[54px] h-[36px] bg-[#004643] text-white rounded-full shadow-sm'
                : 'w-[46px] h-[36px] text-[#141413] hover:text-[#004643] rounded-full'
            }"
          >
            ${getBottomTabIcon(item.id, isActive, currentUser)}
            <span class="sr-only">${item.label}</span>
          </a>
        `;
      }).join('')}
    </nav>
  `;

  // Attach navigation click listeners for header links
  container.querySelectorAll('[data-nav]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const target = el.getAttribute('data-nav');
      if (target) navigate(target);
    });
  });

  // Direct Click Action: Navigates directly to active profile (Shopper or Seller)
  const handleOpenActiveProfile = () => {
    const user = getCurrentUser();
    if (!user) {
      openAuthModal((loggedInUser) => {
        renderNavbar(container, currentRoute, navigate);
        if (loggedInUser) {
          if (loggedInUser.activeRole === 'seller') {
            const activeSeller =
              loggedInUser.sellerAccounts?.find((a) => a.id === loggedInUser.activeAccountId) ||
              loggedInUser.sellerAccount ||
              loggedInUser.sellerAccounts?.[0];
            const storeId = activeSeller?.storeId || 'store-kalyani-cotton';
            navigate(`/store/${encodeURIComponent(storeId)}`);
          } else {
            const activeShopper =
              loggedInUser.shopperAccounts?.find((a) => a.id === loggedInUser.activeAccountId) ||
              loggedInUser.shopperAccounts?.[0];
            const shopperId = activeShopper?.id || loggedInUser.activeAccountId || loggedInUser.id;
            navigate(`/profile?id=${encodeURIComponent(shopperId)}`);
          }
        }
      }, navigate);
      return;
    }

    if (user.activeRole === 'seller') {
      const activeSeller =
        user.sellerAccounts?.find((a) => a.id === user.activeAccountId) ||
        user.sellerAccount ||
        user.sellerAccounts?.[0];
      const storeId = activeSeller?.storeId || 'store-kalyani-cotton';
      navigate(`/store/${encodeURIComponent(storeId)}`);
    } else {
      const activeShopper =
        user.shopperAccounts?.find((a) => a.id === user.activeAccountId) ||
        user.shopperAccounts?.[0];
      const shopperId = activeShopper?.id || user.activeAccountId || user.id;
      navigate(`/profile?id=${encodeURIComponent(shopperId)}`);
    }
  };

  // Hold (Long Press) Action: Opens Bottom Sheet Account Switcher
  const handleOpenAccountSwitcher = () => {
    const user = getCurrentUser();
    if (!user) {
      handleOpenActiveProfile();
    } else {
      openAccountSwitcherBottomSheet(navigate, () => {
        renderNavbar(container, currentRoute, navigate);
      });
    }
  };

  // Desktop user pill: Click opens active profile; Hold opens Account Switcher
  const desktopUserPill = container.querySelector('#desktop-user-pill-btn');
  if (desktopUserPill) {
    attachLongPressListener(desktopUserPill, handleOpenAccountSwitcher, handleOpenActiveProfile);
  }

  // Desktop login button
  container.querySelector('#desktop-login-header-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    openAuthModal((loggedInUser) => {
      renderNavbar(container, currentRoute, navigate);
      if (loggedInUser) {
        if (loggedInUser.activeRole === 'seller') {
          navigate('/store/store-kalyani-cotton');
        } else {
          navigate(`/profile?id=${encodeURIComponent(loggedInUser.id)}`);
        }
      }
    }, navigate);
  });

  // Mobile Bottom dock tabs
  container.querySelectorAll('[data-bottom-tab]').forEach((el) => {
    const tabId = el.getAttribute('data-bottom-tab');

    if (tabId === 'profile') {
      // Click directly opens active profile (Shopper/Seller); Hold opens Account Switcher
      attachLongPressListener(el, handleOpenAccountSwitcher, handleOpenActiveProfile);
    } else {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const targetItem = MOBILE_BOTTOM_ITEMS.find((item) => item.id === tabId);
        if (targetItem) navigate(targetItem.route);
      });
    }
  });
}

// Global listener for auth state changes
if (typeof window !== 'undefined' && !window.__mymigo_auth_listener_registered) {
  window.__mymigo_auth_listener_registered = true;
  window.addEventListener('mymigo:auth-changed', () => {
    // Auth changed event handled dynamically
  });
}

export function hideMobileBottomDock() {
  const dock = document.getElementById('mobile-bottom-dock');
  if (dock) {
    dock.classList.add('hidden');
    dock.style.display = 'none';
  }
}

export function showMobileBottomDock() {
  const dock = document.getElementById('mobile-bottom-dock');
  if (dock) {
    dock.classList.remove('hidden');
    dock.style.display = '';
  }
}
