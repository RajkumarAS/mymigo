// Auth & Multi-Account Component
// Supports Instant OTP Login via Mobile OTP (+91) and Email OTP,
// Instagram-style Bottom Sheet Account Switcher with Click-and-Hold (long press) support,
// Multi-Account Management per mobile number: Up to 2 Shopper Accounts and Up to 3 Seller Accounts (5 total).

import { saveUser } from '../services/profileService.js';
import { escapeHtml } from '../utils/dom.js';

export const AUTH_STORAGE_KEY = 'mymigo_user_auth_v1';
export const MAX_SHOPPERS_PER_NUMBER = 2;
export const MAX_SELLERS_PER_NUMBER = 3;

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw);
    return normalizeUserAccounts(user);
  } catch (e) {
    return null;
  }
}

export function isUserLoggedIn() {
  const user = getCurrentUser();
  return Boolean(user && user.loggedIn);
}

/**
 * Normalizes user record so it always contains valid shopperAccounts and sellerAccounts arrays
 */
function normalizeUserAccounts(user) {
  if (!user) return null;

  const mobile = user.mobile || '9206955756';

  // Ensure shopperAccounts array exists (up to 2)
  if (!Array.isArray(user.shopperAccounts) || user.shopperAccounts.length === 0) {
    user.shopperAccounts = [
      {
        id: user.customerAccount?.id || 'shopper-1',
        name: user.customerAccount?.name || user.name || 'Ananya Sundaram',
        city: user.customerAccount?.city || user.city || 'Coimbatore',
        avatar: user.customerAccount?.avatar || user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        mobile,
        email: user.email || 'ananya.sundaram@example.com',
        connectionsCount: user.customerAccount?.connectionsCount || 248,
        role: 'customer',
        handle: `@${(user.customerAccount?.name || 'ananya').toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        subtitle: 'Shopper Account • 248 Connections',
      },
    ];
  }

  // Ensure sellerAccounts array exists (up to 3)
  if (!Array.isArray(user.sellerAccounts) || user.sellerAccounts.length === 0) {
    user.sellerAccounts = [
      {
        id: 'seller-1',
        storeId: user.sellerAccount?.storeId || 'store-kalyani-cotton',
        name: user.sellerAccount?.storeName || 'Kalyani Cotton',
        storeName: user.sellerAccount?.storeName || 'Kalyani Cotton',
        handle: user.sellerAccount?.handle || '@kalyani_cotton',
        category: user.sellerAccount?.category || 'Sarees',
        city: user.sellerAccount?.city || 'Coimbatore',
        avatar: user.sellerAccount?.avatar || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80',
        role: 'seller',
        subtitle: 'Boutique Store • 204K Connections • Sarees',
        description: user.sellerAccount?.description || 'Pure cotton sarees, breathable handloom weaves, and everyday traditional collections curated directly from weavers.',
      },
    ];
  }

  // Check active account
  if (!user.activeAccountId) {
    user.activeAccountId = user.activeRole === 'seller' ? user.sellerAccounts[0].id : user.shopperAccounts[0].id;
  }

  const activeAccount =
    [...user.shopperAccounts, ...user.sellerAccounts].find((a) => a.id === user.activeAccountId) ||
    user.shopperAccounts[0];

  user.activeRole = activeAccount.role;
  user.name = activeAccount.name;
  user.avatar = activeAccount.avatar;
  user.city = activeAccount.city;
  user.hasCustomerAccount = user.shopperAccounts.length > 0;
  user.hasSellerAccount = user.sellerAccounts.length > 0;

  return user;
}

export function loginUser(userData) {
  const existing = getCurrentUser() || {};
  const mobile = userData.mobile || existing.mobile || '9206955756';

  let shopperAccounts = existing.shopperAccounts || [];
  let sellerAccounts = existing.sellerAccounts || [];

  if (shopperAccounts.length === 0) {
    shopperAccounts = [
      {
        id: 'shopper-1',
        name: userData.customerAccount?.name || userData.name || 'Ananya Sundaram',
        city: userData.customerAccount?.city || userData.city || 'Coimbatore',
        avatar: userData.customerAccount?.avatar || userData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        mobile,
        email: userData.email || 'ananya.sundaram@example.com',
        connectionsCount: 248,
        role: 'customer',
        handle: '@ananya_shopper',
        subtitle: 'Shopper Account • 248 Connections',
      },
    ];
  }

  if (sellerAccounts.length === 0) {
    sellerAccounts = [
      {
        id: 'seller-1',
        storeId: userData.sellerAccount?.storeId || 'store-kalyani-cotton',
        name: userData.sellerAccount?.storeName || 'Kalyani Cotton',
        storeName: userData.sellerAccount?.storeName || 'Kalyani Cotton',
        handle: userData.sellerAccount?.handle || '@kalyani_cotton',
        category: userData.sellerAccount?.category || 'Sarees',
        city: userData.sellerAccount?.city || 'Coimbatore',
        avatar: userData.sellerAccount?.avatar || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80',
        role: 'seller',
        subtitle: 'Boutique Store • 204K Connections • Sarees',
        description: 'Pure cotton sarees, breathable handloom weaves, and everyday traditional collections curated directly from weavers.',
      },
    ];
  }

  const activeRole = userData.activeRole || existing.activeRole || 'customer';
  const activeAccountId =
    activeRole === 'seller' ? sellerAccounts[0].id : shopperAccounts[0].id;
  const activeAccount =
    activeRole === 'seller' ? sellerAccounts[0] : shopperAccounts[0];

  const payload = {
    loggedIn: true,
    id: activeAccount.id,
    mobile,
    email: userData.email || existing.email || '',
    activeAccountId,
    activeRole,
    hasCustomerAccount: shopperAccounts.length > 0,
    hasSellerAccount: sellerAccounts.length > 0,
    name: activeAccount.name,
    avatar: activeAccount.avatar,
    city: activeAccount.city,
    shopperAccounts,
    sellerAccounts,
    customerAccount: shopperAccounts[0],
    sellerAccount: sellerAccounts[0],
    loginMethod: userData.method || 'mobile_otp',
    loginTime: new Date().toISOString(),
  };

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
  if (activeRole === 'seller') {
    localStorage.setItem(`mymigo_seller_mode_${sellerAccounts[0].storeId}`, 'true');
  }

  window.dispatchEvent(new CustomEvent('mymigo:auth-changed', { detail: payload }));
  return payload;
}

/**
 * Switches the active account to any account by ID (Shopper or Seller)
 */
export function switchActiveAccount(accountId) {
  const user = getCurrentUser();
  if (!user) return null;

  const all = [...user.shopperAccounts, ...user.sellerAccounts];
  const target = all.find((a) => a.id === accountId);
  if (!target) return user;

  user.activeAccountId = target.id;
  user.activeRole = target.role;
  user.name = target.name;
  user.avatar = target.avatar;
  user.city = target.city;

  if (target.role === 'seller') {
    localStorage.setItem(`mymigo_seller_mode_${target.storeId}`, 'true');
    user.sellerAccount = target;
  } else {
    user.customerAccount = target;
  }

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new CustomEvent('mymigo:auth-changed', { detail: user }));
  return { user, account: target };
}

/**
 * Legacy helper for switching role
 */
export function switchUserRole(newRole) {
  const user = getCurrentUser();
  if (!user) return null;

  if (newRole === 'seller' && user.sellerAccounts.length > 0) {
    return switchActiveAccount(user.sellerAccounts[0].id)?.user || user;
  } else if (newRole === 'customer' && user.shopperAccounts.length > 0) {
    return switchActiveAccount(user.shopperAccounts[0].id)?.user || user;
  }
  return user;
}

/**
 * Adds a new Shopper Account (Limit: 2 per mobile number)
 */
export function addShopperAccount({ name, city, avatar }) {
  const user = getCurrentUser();
  if (!user) throw new Error('Must be logged in to add account.');

  if (user.shopperAccounts.length >= MAX_SHOPPERS_PER_NUMBER) {
    throw new Error(`Maximum ${MAX_SHOPPERS_PER_NUMBER} Shopper Accounts allowed per mobile number.`);
  }

  const newShopper = {
    id: `shopper-${Date.now()}`,
    name: name.trim() || `Shopper ${user.shopperAccounts.length + 1}`,
    city: city || 'Coimbatore',
    avatar: avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    mobile: user.mobile,
    email: user.email,
    connectionsCount: 150,
    role: 'customer',
    handle: `@${(name || 'shopper').toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    subtitle: 'Shopper Account • 150 Connections',
  };

  user.shopperAccounts.push(newShopper);
  user.hasCustomerAccount = true;

  // Switch to newly created account immediately
  user.activeAccountId = newShopper.id;
  user.activeRole = 'customer';
  user.name = newShopper.name;
  user.avatar = newShopper.avatar;
  user.city = newShopper.city;
  user.customerAccount = newShopper;

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new CustomEvent('mymigo:auth-changed', { detail: user }));
  return { user, account: newShopper };
}

/**
 * Adds a new Seller Account (Limit: 3 per mobile number)
 */
export function addSellerAccount({ storeName, category, city, avatar, description }) {
  const user = getCurrentUser();
  if (!user) throw new Error('Must be logged in to add account.');

  if (user.sellerAccounts.length >= MAX_SELLERS_PER_NUMBER) {
    throw new Error(`Maximum ${MAX_SELLERS_PER_NUMBER} Seller Accounts allowed per mobile number.`);
  }

  const cleanStoreName = storeName.trim() || `Store ${user.sellerAccounts.length + 1}`;
  const storeId = `store-${cleanStoreName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  const newSeller = {
    id: `seller-${Date.now()}`,
    storeId,
    name: cleanStoreName,
    storeName: cleanStoreName,
    handle: `@${cleanStoreName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    category: category || 'Sarees',
    city: city || 'Coimbatore',
    avatar: avatar || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80',
    role: 'seller',
    subtitle: `Boutique Store • ${category || 'Sarees'}`,
    description: description || 'Handloom curation and boutique collection directly from Indian weavers.',
  };

  user.sellerAccounts.push(newSeller);
  user.hasSellerAccount = true;

  // Switch to newly created seller store immediately
  user.activeAccountId = newSeller.id;
  user.activeRole = 'seller';
  user.name = newSeller.name;
  user.avatar = newSeller.avatar;
  user.city = newSeller.city;
  user.sellerAccount = newSeller;

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  localStorage.setItem(`mymigo_seller_mode_${storeId}`, 'true');
  window.dispatchEvent(new CustomEvent('mymigo:auth-changed', { detail: user }));
  return { user, account: newSeller };
}

export function logoutUser() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('mymigo:auth-changed', { detail: null }));
}

/**
 * INSTAGRAM-STYLE BOTTOM SHEET ACCOUNT SWITCHER
 * Triggered by Clicking and Holding (long-press) or tapping the user icon.
 * Displays all Shopper accounts (max 2) and Seller accounts (max 3),
 * with active checkmark, instant switching, and + Add Account capability.
 */
export function openAccountSwitcherBottomSheet(navigate, onStateChange) {
  const existing = document.getElementById('instagram-account-switcher-sheet');
  if (existing) existing.remove();

  const user = getCurrentUser();
  if (!user) {
    openAuthModal(onStateChange, navigate);
    return;
  }

  const sheetOverlay = document.createElement('div');
  sheetOverlay.id = 'instagram-account-switcher-sheet';
  sheetOverlay.className = 'fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in';
  sheetOverlay.style.cssText = 'position: fixed; inset: 0; top: 0; left: 0; right: 0; bottom: 0; width: 100vw; height: 100%; height: 100dvh; z-index: 100; display: flex; justify-content: center; overflow: hidden;';

  // Prevent background scrolling while bottom sheet is open
  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';

  const closeSheet = () => {
    document.body.style.overflow = prevOverflow || '';
    sheetOverlay.remove();
  };

  let isAddingAccount = false;
  let addAccountType = 'shopper'; // 'shopper' | 'seller'

  const renderSheet = () => {
    const curUser = getCurrentUser() || user;
    const allAccounts = [
      ...curUser.shopperAccounts.map((a) => ({ ...a, accountType: 'shopper' })),
      ...curUser.sellerAccounts.map((a) => ({ ...a, accountType: 'seller' })),
    ];

    const shopperCount = curUser.shopperAccounts.length;
    const sellerCount = curUser.sellerAccounts.length;
    const canAddShopper = shopperCount < MAX_SHOPPERS_PER_NUMBER;
    const canAddSeller = sellerCount < MAX_SELLERS_PER_NUMBER;
    const canAddAny = canAddShopper || canAddSeller;

    sheetOverlay.innerHTML = `
      <div
        class="relative w-full max-w-full sm:max-w-md mx-auto bg-white rounded-t-[28px] sm:rounded-3xl p-4 sm:p-6 shadow-2xl border-t sm:border border-[#DCD6C9] animate-slide-up overflow-y-auto box-border"
        style="max-height: min(85dvh, 640px); padding-bottom: max(1.75rem, calc(1rem + env(safe-area-inset-bottom, 20px))); overscroll-behavior: contain; -webkit-overflow-scrolling: touch;"
      >
        <!-- Top Drag Handle Bar (Instagram style) -->
        <div class="w-10 h-1.5 bg-[#DCD6C9] rounded-full mx-auto mb-3 cursor-pointer" id="sheet-drag-handle"></div>

        <!-- Sheet Header: Active Phone Number & Limits -->
        <div class="flex items-center justify-between gap-2 pb-3 border-b border-[#F0EDE5]">
          <div class="min-w-0 flex-1">
            <h3 class="text-sm sm:text-base font-extrabold text-[#141413] truncate">
              Switch Accounts
            </h3>
            <p class="text-xs text-[#78716C] mt-0.5 truncate">
              Linked to <strong class="text-[#141413]">+91 ${escapeHtml(curUser.mobile || '9206955756')}</strong>
            </p>
          </div>
          <div class="flex items-center gap-1 text-[11px] font-semibold text-[#57534E] shrink-0">
            <span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200" title="Shopper accounts used">
              👤 ${shopperCount}/2
            </span>
            <span class="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200" title="Seller accounts used">
              🏪 ${sellerCount}/3
            </span>
          </div>
        </div>

        <!-- ACCOUNTS LIST (Instagram Style) -->
        <div class="mt-2 divide-y divide-[#F0EDE5]">
          ${allAccounts
            .map((acc) => {
              const isActive = acc.id === curUser.activeAccountId;
              const isSeller = acc.accountType === 'seller';
              return `
              <button
                type="button"
                data-switch-to-account="${escapeHtml(acc.id)}"
                class="w-full flex items-center justify-between gap-2 py-2.5 px-2 rounded-2xl hover:bg-[#F0EDE5]/60 active:scale-[0.99] transition-all cursor-pointer text-left group"
              >
                <div class="flex items-center gap-2.5 min-w-0 flex-1">
                  <!-- Avatar with Role Badge -->
                  <div class="relative w-11 h-11 rounded-full p-0.5 shrink-0 ${
                    isActive
                      ? 'ring-2 ring-[#004643]'
                      : 'border border-[#DCD6C9]'
                  }">
                    <img
                      src="${escapeHtml(acc.avatar)}"
                      alt="${escapeHtml(acc.name)}"
                      class="w-full h-full rounded-full object-cover"
                    />
                    <span class="absolute -bottom-1 -right-1 text-xs bg-white rounded-full p-[1px] shadow-2xs border border-[#DCD6C9]">
                      ${isSeller ? '🏪' : '👤'}
                    </span>
                  </div>

                  <!-- Name, Handle & Subtitle -->
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <span class="text-xs sm:text-sm font-bold text-[#141413] truncate ${isActive ? 'text-[#004643]' : ''}">
                        ${escapeHtml(acc.name)}
                      </span>
                      <span class="px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                        isSeller ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                      }">
                        ${isSeller ? 'Seller' : 'Shopper'}
                      </span>
                    </div>
                    <p class="text-[11px] text-[#78716C] truncate mt-0.5">
                      ${escapeHtml(acc.handle || acc.subtitle || '')}
                    </p>
                  </div>
                </div>

                <!-- Right Switch Button / Active Checkmark (Always fully visible on the right) -->
                <div class="shrink-0 ml-2">
                  ${
                    isActive
                      ? `
                    <div class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-[#1877F2] border border-blue-200 text-xs font-bold shadow-2xs" title="Current Active Account">
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Active</span>
                    </div>
                  `
                      : `
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white bg-[#004643] hover:bg-[#003634] active:scale-95 transition-all shadow-xs">
                      Switch
                    </span>
                  `
                  }
                </div>
              </button>
            `;
            })
            .join('')}
        </div>

        <!-- + ADD ACCOUNT SECTION (Instagram Style) -->
        <div class="mt-3 pt-3 border-t border-[#F0EDE5]">
          ${
            !isAddingAccount
              ? `
            <button
              type="button"
              id="sheet-add-account-toggle-btn"
              class="w-full flex items-center gap-3 py-2.5 px-2 rounded-2xl hover:bg-[#F0EDE5]/70 transition-colors cursor-pointer text-left ${
                !canAddAny ? 'opacity-50 cursor-not-allowed' : ''
              }"
              ${!canAddAny ? 'disabled' : ''}
            >
              <!-- Plus Icon Circle -->
              <div class="w-10 h-10 rounded-full border border-[#DCD6C9] bg-[#FDFBF7] flex items-center justify-center text-[#141413] shrink-0 font-bold text-lg shadow-2xs">
                +
              </div>
              <div class="flex-1 min-w-0">
                <span class="text-xs sm:text-sm font-bold text-[#141413] block truncate">
                  ${canAddAny ? 'Add Account' : 'Account Limit Reached'}
                </span>
                <span class="text-[11px] text-[#78716C] block truncate mt-0.5">
                  ${
                    canAddAny
                      ? 'Add up to 2 Shopper & 3 Seller accounts'
                      : 'Limit reached for this phone number'
                  }
                </span>
              </div>
            </button>
          `
              : renderAddAccountForm(canAddShopper, canAddSeller, shopperCount, sellerCount)
          }
        </div>

        <!-- Footer: Log Out & Close -->
        <div class="mt-3 pt-3 border-t border-[#F0EDE5] flex items-center justify-between gap-2">
          <button
            type="button"
            id="sheet-logout-btn"
            class="text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors py-1 px-1 cursor-pointer truncate"
          >
            Log Out of MyMigo
          </button>
          <button
            type="button"
            id="sheet-close-btn"
            class="text-xs font-bold text-[#57534E] hover:text-[#141413] transition-colors py-1.5 px-4 rounded-xl bg-[#F0EDE5] cursor-pointer shrink-0"
          >
            Done
          </button>
        </div>
      </div>
    `;

    attachSheetEvents();
  };

  const renderAddAccountForm = (canAddShopper, canAddSeller, shopperCount, sellerCount) => {
    return `
      <div class="p-4 rounded-2xl bg-[#FDFBF7] border border-[#DCD6C9] animate-fade-in space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-bold uppercase tracking-wider text-[#004643]">
            Add New Account for This Mobile Number
          </h4>
          <button type="button" id="cancel-add-account-btn" class="text-xs text-[#78716C] hover:text-[#141413] cursor-pointer font-bold">
            &times; Cancel
          </button>
        </div>

        <!-- Role Choice Buttons: Shopper vs Seller -->
        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            id="add-type-shopper-btn"
            class="py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 border ${
              addAccountType === 'shopper'
                ? 'bg-[#004643] text-white border-[#004643] shadow-xs'
                : 'bg-white text-[#141413] border-[#DCD6C9] hover:bg-[#F0EDE5]'
            } ${!canAddShopper ? 'opacity-40 cursor-not-allowed' : ''}"
            ${!canAddShopper ? 'disabled' : ''}
          >
            <span>👤 Shopper Account</span>
            <span class="text-[10px] opacity-80">${canAddShopper ? `${shopperCount}/2 Available` : 'Limit 2/2 Reached'}</span>
          </button>

          <button
            type="button"
            id="add-type-seller-btn"
            class="py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 border ${
              addAccountType === 'seller'
                ? 'bg-amber-800 text-white border-amber-800 shadow-xs'
                : 'bg-white text-[#141413] border-[#DCD6C9] hover:bg-[#F0EDE5]'
            } ${!canAddSeller ? 'opacity-40 cursor-not-allowed' : ''}"
            ${!canAddSeller ? 'disabled' : ''}
          >
            <span>🏪 Seller Account</span>
            <span class="text-[10px] opacity-80">${canAddSeller ? `${sellerCount}/3 Available` : 'Limit 3/3 Reached'}</span>
          </button>
        </div>

        ${
          addAccountType === 'shopper'
            ? `
          <!-- Shopper Account Form -->
          <form id="new-shopper-account-form" class="space-y-2.5 pt-1">
            <div>
              <label class="block text-[11px] font-semibold text-[#57534E] mb-1">Shopper Name *</label>
              <input
                id="new-shopper-name"
                type="text"
                required
                placeholder="e.g. Raaj Kumar"
                class="w-full px-3 py-2 rounded-xl border border-[#DCD6C9] bg-white text-xs font-medium focus:border-[#004643] focus:outline-none"
              />
            </div>
            <div>
              <label class="block text-[11px] font-semibold text-[#57534E] mb-1">City *</label>
              <select id="new-shopper-city" class="w-full px-3 py-2 rounded-xl border border-[#DCD6C9] bg-white text-xs font-medium focus:border-[#004643] focus:outline-none">
                <option value="Coimbatore">Coimbatore</option>
                <option value="Chennai">Chennai</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Mumbai">Mumbai</option>
              </select>
            </div>
            <button
              type="submit"
              class="w-full py-2.5 rounded-xl bg-[#004643] text-white text-xs font-bold hover:bg-[#003634] transition-all shadow-xs cursor-pointer active:scale-95"
            >
              Save & Switch to Shopper Account
            </button>
          </form>
        `
            : `
          <!-- Seller Account Form -->
          <form id="new-seller-account-form" class="space-y-2.5 pt-1">
            <div>
              <label class="block text-[11px] font-semibold text-[#57534E] mb-1">Store / Brand Name *</label>
              <input
                id="new-seller-store-name"
                type="text"
                required
                placeholder="e.g. Lakshmi Silks"
                class="w-full px-3 py-2 rounded-xl border border-[#DCD6C9] bg-white text-xs font-medium focus:border-[#004643] focus:outline-none"
              />
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-[11px] font-semibold text-[#57534E] mb-1">Category *</label>
                <select id="new-seller-category" class="w-full px-3 py-2 rounded-xl border border-[#DCD6C9] bg-white text-xs font-medium focus:border-[#004643] focus:outline-none">
                  <option value="Sarees">Sarees</option>
                  <option value="Kurtis">Kurtis</option>
                  <option value="2 Piece">2 Piece</option>
                  <option value="Handlooms">Handlooms</option>
                  <option value="Jewellery">Jewellery</option>
                </select>
              </div>
              <div>
                <label class="block text-[11px] font-semibold text-[#57534E] mb-1">City *</label>
                <select id="new-seller-city" class="w-full px-3 py-2 rounded-xl border border-[#DCD6C9] bg-white text-xs font-medium focus:border-[#004643] focus:outline-none">
                  <option value="Coimbatore">Coimbatore</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Hyderabad">Hyderabad</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              class="w-full py-2.5 rounded-xl bg-amber-800 text-white text-xs font-bold hover:bg-amber-900 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              Save & Switch to Seller Store
            </button>
          </form>
        `
        }
      </div>
    `;
  };

  const attachSheetEvents = () => {
    // Backdrop click closes sheet
    sheetOverlay.addEventListener('click', (e) => {
      if (e.target === sheetOverlay) closeSheet();
    });

    // Close buttons
    sheetOverlay.querySelector('#sheet-drag-handle')?.addEventListener('click', () => closeSheet());
    sheetOverlay.querySelector('#sheet-close-btn')?.addEventListener('click', () => closeSheet());

    // Switch account click
    sheetOverlay.querySelectorAll('[data-switch-to-account]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-switch-to-account');
        const res = switchActiveAccount(targetId);
        if (res && res.account) {
          showToast(`Switched to ${res.account.name} (${res.account.role === 'seller' ? 'Seller' : 'Shopper'})`);
          closeSheet();
          if (typeof onStateChange === 'function') onStateChange(res.user);
          if (typeof navigate === 'function') {
            if (res.account.role === 'seller') {
              navigate(`/store/${encodeURIComponent(res.account.storeId || 'store-kalyani-cotton')}`);
            } else {
              navigate(`/profile?id=${encodeURIComponent(res.account.id)}`);
            }
          }
        }
      });
    });

    // Add Account toggle button
    sheetOverlay.querySelector('#sheet-add-account-toggle-btn')?.addEventListener('click', () => {
      const cur = getCurrentUser() || user;
      addAccountType = cur.shopperAccounts.length < MAX_SHOPPERS_PER_NUMBER ? 'shopper' : 'seller';
      isAddingAccount = true;
      renderSheet();
    });

    // Cancel Add Account
    sheetOverlay.querySelector('#cancel-add-account-btn')?.addEventListener('click', () => {
      isAddingAccount = false;
      renderSheet();
    });

    // Toggle Type buttons
    sheetOverlay.querySelector('#add-type-shopper-btn')?.addEventListener('click', () => {
      addAccountType = 'shopper';
      renderSheet();
    });

    sheetOverlay.querySelector('#add-type-seller-btn')?.addEventListener('click', () => {
      addAccountType = 'seller';
      renderSheet();
    });

    // Submit New Shopper Form
    sheetOverlay.querySelector('#new-shopper-account-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = sheetOverlay.querySelector('#new-shopper-name')?.value.trim();
      const city = sheetOverlay.querySelector('#new-shopper-city')?.value;
      try {
        const { user: updatedUser, account } = addShopperAccount({ name, city });
        showToast(`Shopper Account "${account.name}" created and active!`);
        closeSheet();
        if (typeof onStateChange === 'function') onStateChange(updatedUser);
        if (typeof navigate === 'function') navigate(`/profile?id=${encodeURIComponent(account.id)}`);
      } catch (err) {
        alert(err.message || 'Could not add shopper account');
      }
    });

    // Submit New Seller Form
    sheetOverlay.querySelector('#new-seller-account-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const storeName = sheetOverlay.querySelector('#new-seller-store-name')?.value.trim();
      const category = sheetOverlay.querySelector('#new-seller-category')?.value;
      const city = sheetOverlay.querySelector('#new-seller-city')?.value;
      try {
        const { user: updatedUser, account } = addSellerAccount({ storeName, category, city });
        showToast(`Seller Account "${account.name}" created and active!`);
        closeSheet();
        if (typeof onStateChange === 'function') onStateChange(updatedUser);
        if (typeof navigate === 'function') navigate(`/store/${encodeURIComponent(account.storeId)}`);
      } catch (err) {
        alert(err.message || 'Could not add seller account');
      }
    });

    // Logout
    sheetOverlay.querySelector('#sheet-logout-btn')?.addEventListener('click', () => {
      logoutUser();
      closeSheet();
      showToast('You have been logged out.');
      if (typeof onStateChange === 'function') onStateChange(null);
    });
  };

  document.body.appendChild(sheetOverlay);
  renderSheet();
}

/**
 * Opens Profile Check / Account Switcher Modal
 */
export function openProfileCheckModal(user, onStateChange, navigate) {
  // Delegate directly to Instagram Bottom Sheet Account Switcher for consistent UX
  openAccountSwitcherBottomSheet(navigate, onStateChange);
}

/**
 * Opens Login Modal via Mobile OTP or Email OTP
 */
export function openAuthModal(onStateChange, navigate) {
  const existing = document.getElementById('mymigo-auth-modal');
  if (existing) existing.remove();

  const currentUser = getCurrentUser();
  if (currentUser) {
    openAccountSwitcherBottomSheet(navigate, onStateChange);
    return;
  }

  let activeTab = 'mobile';
  let mobileStep = 'input';
  let emailStep = 'input';
  let enteredMobile = '';
  let enteredEmail = '';
  let resendCountdown = 30;
  let countdownTimer = null;

  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'mymigo-auth-modal';
  modalOverlay.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in';

  const renderContent = () => {
    modalOverlay.innerHTML = `
      <div class="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#DCD6C9] animate-fade-up max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          id="auth-close-btn"
          class="absolute top-5 right-5 w-8 h-8 rounded-full border border-[#DCD6C9] bg-white text-[#78716C] hover:text-[#141413] hover:bg-[#F0EDE5] flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
          aria-label="Close"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div class="pr-8">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#004643]/10 text-[#004643] mb-2.5">
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            <span>MyMigo Secure Login</span>
          </div>
          <h2 class="text-2xl font-bold tracking-tight text-[#141413]">
            Welcome to MyMigo
          </h2>
          <p class="mt-1 text-xs sm:text-sm text-[#57534E] leading-relaxed">
            Verify with instant OTP. 1 mobile number supports up to <strong>2 Shopper</strong> and <strong>3 Seller</strong> accounts!
          </p>
        </div>

        ${
          (activeTab === 'mobile' && mobileStep === 'account_setup') ||
          (activeTab === 'email' && emailStep === 'account_setup')
            ? renderAccountSetupView()
            : `
          <div class="mt-6 p-1 bg-[#F0EDE5] rounded-2xl flex items-center text-xs font-semibold">
            <button
              type="button"
              id="tab-mobile-otp"
              class="flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'mobile'
                  ? 'bg-white text-[#004643] shadow-sm font-bold'
                  : 'text-[#57534E] hover:text-[#141413]'
              }"
            >
              📱 Mobile OTP
            </button>
            <button
              type="button"
              id="tab-email-otp"
              class="flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'email'
                  ? 'bg-white text-[#004643] shadow-sm font-bold'
                  : 'text-[#57534E] hover:text-[#141413]'
              }"
            >
              ✉️ Email OTP
            </button>
          </div>

          <div class="mt-6">
            ${
              activeTab === 'mobile'
                ? renderMobileTab(mobileStep, enteredMobile)
                : renderEmailTab(emailStep, enteredEmail)
            }
          </div>
        `
        }

        <div class="mt-6 pt-4 border-t border-[#DCD6C9]/60 text-center text-[11px] text-[#78716C]">
          By continuing, you agree to MyMigo's Terms of Service & Privacy Policy.
        </div>
      </div>
    `;

    attachEvents();
  };

  const renderMobileTab = (step, mobile) => {
    if (step === 'input') {
      return `
        <form id="mobile-send-otp-form" class="space-y-4">
          <div>
            <label for="auth-mobile-input" class="block text-xs font-semibold uppercase tracking-wider text-[#57534E] mb-1.5">
              Mobile Number
            </label>
            <div class="relative flex items-center">
              <span class="absolute left-3.5 text-xs sm:text-sm font-bold text-[#141413] border-r border-[#DCD6C9] pr-2.5">
                🇮🇳 +91
              </span>
              <input
                id="auth-mobile-input"
                type="tel"
                inputmode="numeric"
                maxlength="10"
                placeholder="Enter 10-digit mobile number"
                value="${escapeHtml(mobile)}"
                required
                autocomplete="tel-national"
                class="w-full pl-20 pr-4 py-3 rounded-2xl border border-[#DCD6C9] bg-[#F0EDE5]/50 text-sm sm:text-base text-[#141413] placeholder:text-[#A8A29E] focus:bg-white focus:border-[#004643] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            class="w-full py-3.5 rounded-2xl text-sm font-semibold bg-[#004643] text-white hover:bg-[#003634] transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <span>Get OTP via SMS</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
            </svg>
          </button>
        </form>
      `;
    }

    // Step === 'otp'
    return `
      <form id="mobile-verify-otp-form" class="space-y-4">
        <div class="p-3 bg-[#004643]/5 rounded-2xl border border-[#004643]/15 flex items-center justify-between">
          <div class="text-xs">
            <span class="text-[#57534E] block">OTP sent to:</span>
            <span class="font-bold text-[#141413]">+91 ${escapeHtml(mobile)}</span>
          </div>
          <button
            type="button"
            id="btn-change-mobile"
            class="text-xs font-semibold text-[#004643] hover:underline cursor-pointer"
          >
            Change
          </button>
        </div>

        <div>
          <label for="auth-otp-input" class="block text-xs font-semibold uppercase tracking-wider text-[#57534E] mb-1.5">
            Enter 4-Digit OTP
          </label>
          <input
            id="auth-otp-input"
            type="text"
            inputmode="numeric"
            maxlength="4"
            placeholder="• • • •"
            required
            autocomplete="one-time-code"
            autofocus
            class="w-full text-center tracking-[1em] text-xl font-bold py-3.5 rounded-2xl border-2 border-[#DCD6C9] bg-white text-[#141413] placeholder:text-[#A8A29E] focus:border-[#004643] focus:outline-none transition-all shadow-inner"
          />
          <div class="mt-3 flex items-center justify-between text-xs text-[#78716C] gap-2">
            <!-- Clickable Demo OTP button -->
            <button
              type="button"
              id="btn-demo-otp"
              title="Click to auto-fill sample OTP 1234"
              class="inline-flex items-center gap-1.5 font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 px-2.5 py-1 rounded-lg text-xs cursor-pointer active:scale-95 transition-all shadow-2xs"
            >
              <span>💡 Sample OTP:</span>
              <strong class="underline decoration-emerald-600 font-extrabold tracking-wider">1234</strong>
              <span class="text-[10px] bg-emerald-200/90 text-emerald-900 px-1 py-0.2 rounded font-bold">Tap to fill</span>
            </button>

            <!-- Countdown Timer Container: Updated directly via DOM without re-rendering -->
            <span id="auth-countdown-container" class="text-xs text-[#78716C] shrink-0 font-medium">
              Resend in <strong class="text-[#141413]">${resendCountdown}s</strong>
            </span>
          </div>
        </div>

        <button
          type="submit"
          id="auth-verify-submit-btn"
          class="w-full py-3.5 rounded-2xl text-sm font-semibold bg-[#004643] text-white hover:bg-[#003634] transition-colors shadow-sm cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2"
        >
          <span>Verify & Continue</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </form>
    `;
  };

  const renderEmailTab = (step, email) => {
    if (step === 'input') {
      return `
        <form id="email-send-otp-form" class="space-y-4">
          <div>
            <label for="auth-email-input" class="block text-xs font-semibold uppercase tracking-wider text-[#57534E] mb-1.5">
              Email Address
            </label>
            <input
              id="auth-email-input"
              type="email"
              placeholder="name@example.com"
              value="${escapeHtml(email)}"
              required
              autocomplete="email"
              class="w-full px-4 py-3 rounded-2xl border border-[#DCD6C9] bg-[#F0EDE5]/50 text-sm sm:text-base text-[#141413] placeholder:text-[#A8A29E] focus:bg-white focus:border-[#004643] transition-colors"
            />
          </div>

          <button
            type="submit"
            class="w-full py-3.5 rounded-2xl text-sm font-semibold bg-[#004643] text-white hover:bg-[#003634] transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <span>Get OTP via Email</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
            </svg>
          </button>
        </form>
      `;
    }

    return `
      <form id="email-verify-otp-form" class="space-y-4">
        <div class="p-3 bg-[#004643]/5 rounded-2xl border border-[#004643]/15 flex items-center justify-between">
          <div class="text-xs">
            <span class="text-[#57534E] block">OTP sent to:</span>
            <span class="font-bold text-[#141413] truncate max-w-[200px] block">${escapeHtml(email)}</span>
          </div>
          <button
            type="button"
            id="btn-change-email"
            class="text-xs font-semibold text-[#004643] hover:underline cursor-pointer"
          >
            Change
          </button>
        </div>

        <div>
          <label for="auth-otp-input" class="block text-xs font-semibold uppercase tracking-wider text-[#57534E] mb-1.5">
            Enter 4-Digit OTP
          </label>
          <input
            id="auth-otp-input"
            type="text"
            inputmode="numeric"
            maxlength="4"
            placeholder="• • • •"
            required
            autocomplete="one-time-code"
            autofocus
            class="w-full text-center tracking-[1em] text-xl font-bold py-3.5 rounded-2xl border-2 border-[#DCD6C9] bg-white text-[#141413] placeholder:text-[#A8A29E] focus:border-[#004643] focus:outline-none transition-all shadow-inner"
          />
          <div class="mt-3 flex items-center justify-between text-xs text-[#78716C] gap-2">
            <button
              type="button"
              id="btn-demo-otp"
              title="Click to auto-fill sample OTP 5678"
              class="inline-flex items-center gap-1.5 font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 px-2.5 py-1 rounded-lg text-xs cursor-pointer active:scale-95 transition-all shadow-2xs"
            >
              <span>💡 Sample OTP:</span>
              <strong class="underline decoration-emerald-600 font-extrabold tracking-wider">5678</strong>
              <span class="text-[10px] bg-emerald-200/90 text-emerald-900 px-1 py-0.2 rounded font-bold">Tap to fill</span>
            </button>

            <span id="auth-countdown-container" class="text-xs text-[#78716C] shrink-0 font-medium">
              Resend in <strong class="text-[#141413]">${resendCountdown}s</strong>
            </span>
          </div>
        </div>

        <button
          type="submit"
          id="auth-verify-submit-btn"
          class="w-full py-3.5 rounded-2xl text-sm font-semibold bg-[#004643] text-white hover:bg-[#003634] transition-colors shadow-sm cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2"
        >
          <span>Verify & Continue</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </form>
    `;
  };

  const renderAccountSetupView = () => {
    return `
      <div class="mt-5 space-y-4 animate-fade-in" id="account-setup-view">
        <div class="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-2.5">
          <span class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">✓</span>
          <div class="text-xs text-emerald-950 font-medium">
            <strong class="font-bold">Phone Verified!</strong> Select your initial account type. (You can add up to 2 Shopper & 3 Seller accounts anytime!)
          </div>
        </div>

        <div class="space-y-3">
          <div class="p-4 rounded-2xl border-2 border-[#DCD6C9] hover:border-[#004643] bg-[#FDFBF7] transition-all text-left">
            <div class="flex items-start justify-between gap-2 mb-2">
              <div class="flex items-center gap-2">
                <span class="w-8 h-8 rounded-xl bg-[#004643]/10 text-[#004643] flex items-center justify-center text-base">👤</span>
                <div>
                  <h3 class="text-sm font-bold text-[#141413]">Shopper Account</h3>
                  <span class="text-[11px] text-[#78716C]">Personal Shopping</span>
                </div>
              </div>
              <span class="text-[10px] bg-[#004643]/10 text-[#004643] font-bold px-2 py-0.5 rounded-full">Max 2</span>
            </div>
            <p class="text-xs text-[#57534E] mb-3 leading-relaxed">
              Explore stores, watch videos, join live video shopping calls, and connect with friends.
            </p>
            <button
              type="button"
              id="btn-choose-customer-account"
              class="w-full py-2.5 px-3 rounded-xl bg-[#004643] text-white text-xs font-bold hover:bg-[#003634] transition-all shadow-xs cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span>Start as Shopper</span>
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          <div class="p-4 rounded-2xl border-2 border-[#DCD6C9] hover:border-amber-600 bg-[#FDFBF7] transition-all text-left">
            <div class="flex items-start justify-between gap-2 mb-2">
              <div class="flex items-center gap-2">
                <span class="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-base">🏪</span>
                <div>
                  <h3 class="text-sm font-bold text-[#141413]">Seller Account</h3>
                  <span class="text-[11px] text-[#78716C]">Store Owner & Boutique</span>
                </div>
              </div>
              <span class="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">Max 3</span>
            </div>
            <p class="text-xs text-[#57534E] mb-3 leading-relaxed">
              Showcase your store, upload video reels & posters, add products, and receive video shopping bookings.
            </p>
            <button
              type="button"
              id="btn-choose-seller-account"
              class="w-full py-2.5 px-3 rounded-xl bg-amber-800 text-white text-xs font-bold hover:bg-amber-900 transition-all shadow-xs cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span>Start as Seller</span>
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          <div class="p-3.5 rounded-2xl bg-gradient-to-r from-[#004643]/10 to-amber-100/60 border border-[#004643]/20 text-center">
            <span class="text-xs font-bold text-[#141413] block mb-1">✨ Activate Both Accounts (Recommended)</span>
            <p class="text-[11px] text-[#57534E] mb-2.5 leading-snug">
              Get 1 Shopper + 1 Seller account immediately. Hold the user icon to switch anytime!
            </p>
            <button
              type="button"
              id="btn-choose-both-accounts"
              class="w-full py-2.5 px-4 rounded-xl bg-[#141413] text-white text-xs font-bold hover:bg-black transition-all shadow-xs cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span>Enable Both Accounts (Shopper ⇄ Seller)</span>
            </button>
          </div>
        </div>
      </div>
    `;
  };

  const updateCountdownUI = () => {
    const container = modalOverlay.querySelector('#auth-countdown-container');
    if (!container) return;
    if (resendCountdown > 0) {
      container.innerHTML = `Resend in <strong class="text-[#141413]">${resendCountdown}s</strong>`;
    } else {
      container.innerHTML = `<button type="button" id="btn-resend-otp" class="font-bold text-[#004643] hover:underline cursor-pointer">Resend OTP</button>`;
      container.querySelector('#btn-resend-otp')?.addEventListener('click', (e) => {
        e.preventDefault();
        resendCountdown = 30;
        startCountdown();
        showToast('New OTP sent successfully!');
      });
    }
  };

  const startCountdown = () => {
    clearInterval(countdownTimer);
    resendCountdown = 30;
    updateCountdownUI();
    countdownTimer = setInterval(() => {
      resendCountdown -= 1;
      if (resendCountdown <= 0) {
        clearInterval(countdownTimer);
      }
      updateCountdownUI();
    }, 1000);
  };

  const fillDemoOtp = (sampleCode) => {
    const otpInput = modalOverlay.querySelector('#auth-otp-input');
    if (otpInput) {
      otpInput.value = sampleCode;
      otpInput.focus();
      otpInput.classList.add('border-emerald-600', 'bg-emerald-50/50', 'ring-2', 'ring-emerald-500/30');
      setTimeout(() => {
        otpInput.classList.remove('bg-emerald-50/50', 'ring-2', 'ring-emerald-500/30');
      }, 500);
    }
  };

  const completeLoginWithSetup = (roleChoice) => {
    clearInterval(countdownTimer);

    const user = loginUser({
      mobile: enteredMobile || '9206955756',
      email: enteredEmail || '',
      method: activeTab === 'mobile' ? 'mobile_otp' : 'email_otp',
      activeRole: roleChoice === 'seller' ? 'seller' : 'customer',
    });

    modalOverlay.remove();

    if (roleChoice === 'seller') {
      showToast(`Welcome! Seller Store Account active. Long press user icon to switch accounts.`);
      if (typeof navigate === 'function') navigate('/store/store-kalyani-cotton');
    } else {
      showToast(`Welcome! Shopper Account active. Long press user icon to switch accounts.`);
      if (typeof navigate === 'function') navigate(`/profile?id=${encodeURIComponent(user.id)}`);
    }

    if (typeof onStateChange === 'function') onStateChange(user);
  };

  const attachEvents = () => {
    modalOverlay.querySelector('#auth-close-btn')?.addEventListener('click', () => {
      clearInterval(countdownTimer);
      modalOverlay.remove();
    });

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        clearInterval(countdownTimer);
        modalOverlay.remove();
      }
    });

    modalOverlay.querySelector('#tab-mobile-otp')?.addEventListener('click', () => {
      activeTab = 'mobile';
      renderContent();
    });

    modalOverlay.querySelector('#tab-email-otp')?.addEventListener('click', () => {
      activeTab = 'email';
      renderContent();
    });

    modalOverlay.querySelector('#mobile-send-otp-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = modalOverlay.querySelector('#auth-mobile-input').value.trim().replace(/\D/g, '');
      if (val.length < 10) {
        alert('Please enter a valid 10-digit mobile number.');
        return;
      }
      enteredMobile = val;
      mobileStep = 'otp';
      renderContent();
      startCountdown();
      modalOverlay.querySelector('#auth-otp-input')?.focus();
    });

    modalOverlay.querySelector('#btn-change-mobile')?.addEventListener('click', () => {
      mobileStep = 'input';
      clearInterval(countdownTimer);
      renderContent();
    });

    modalOverlay.querySelector('#btn-demo-otp')?.addEventListener('click', (e) => {
      e.preventDefault();
      const sample = activeTab === 'mobile' ? '1234' : '5678';
      fillDemoOtp(sample);
    });

    modalOverlay.querySelector('#mobile-verify-otp-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const otp = modalOverlay.querySelector('#auth-otp-input').value.trim();
      if (!otp) return;

      clearInterval(countdownTimer);
      mobileStep = 'account_setup';
      renderContent();
    });

    modalOverlay.querySelector('#email-send-otp-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = modalOverlay.querySelector('#auth-email-input').value.trim();
      if (!val || !val.includes('@')) {
        alert('Please enter a valid email address.');
        return;
      }
      enteredEmail = val;
      emailStep = 'otp';
      renderContent();
      startCountdown();
      modalOverlay.querySelector('#auth-otp-input')?.focus();
    });

    modalOverlay.querySelector('#btn-change-email')?.addEventListener('click', () => {
      emailStep = 'input';
      clearInterval(countdownTimer);
      renderContent();
    });

    modalOverlay.querySelector('#email-verify-otp-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const otp = modalOverlay.querySelector('#auth-otp-input').value.trim();
      if (!otp) return;

      clearInterval(countdownTimer);
      emailStep = 'account_setup';
      renderContent();
    });

    modalOverlay.querySelector('#btn-choose-customer-account')?.addEventListener('click', () => {
      completeLoginWithSetup('customer');
    });

    modalOverlay.querySelector('#btn-choose-seller-account')?.addEventListener('click', () => {
      completeLoginWithSetup('seller');
    });

    modalOverlay.querySelector('#btn-choose-both-accounts')?.addEventListener('click', () => {
      completeLoginWithSetup('both');
    });
  };

  document.body.appendChild(modalOverlay);
  renderContent();
}

export function showToast(message) {
  const existing = document.getElementById('mymigo-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'mymigo-toast';
  toast.className = 'fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#141413] text-white px-5 py-3 rounded-full text-xs font-semibold shadow-xl border border-white/20 animate-fade-in flex items-center gap-2 max-w-[90vw] truncate';
  toast.innerHTML = `
    <span class="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
    <span class="truncate">${escapeHtml(message)}</span>
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3500);
}
