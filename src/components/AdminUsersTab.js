// Admin Users Tab — Review and edit Shopper Profiles who created a profile on MyMigo

import { fetchUsers, saveUser, deleteUser, uploadMediaFile } from '../services/profileService.js';
import { escapeHtml } from '../utils/dom.js';

export function createAdminUsersTab(container, showToast, onCountUpdate) {
  let users = [];
  let searchQuery = '';

  async function loadData() {
    try {
      users = await fetchUsers();
      if (typeof onCountUpdate === 'function') onCountUpdate(users.length);
      render();
    } catch {
      showToast('Failed to load user profiles.', 'error');
    }
  }

  function render() {
    const filtered = users.filter((u) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.toLowerCase().includes(q)) ||
        (u.city && u.city.toLowerCase().includes(q)) ||
        (u.preferences && u.preferences.toLowerCase().includes(q))
      );
    });

    container.innerHTML = `
      <section class="bg-white rounded-3xl border border-[#DCD6C9] p-6 sm:p-8 shadow-xs">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#E7E3D9] gap-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold uppercase tracking-wider text-[#004643]">Registered Shoppers</span>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#004643]/10 text-[#004643]">
                ${users.length} Users
              </span>
            </div>
            <h2 class="text-xl sm:text-2xl font-bold text-[#141413] mt-1">User Profiles</h2>
            <p class="text-xs sm:text-sm text-[#57534E]">
              View shoppers who created a user profile, inspect details, and edit directly in backend.
            </p>
          </div>

          <button
            type="button"
            id="admin-add-user-btn"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-[#004643] text-white hover:bg-[#003634] active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Add New User</span>
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
              id="admin-user-search-input"
              value="${escapeHtml(searchQuery)}"
              placeholder="Search by name, email, phone, city, or interests..."
              class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DCD6C9] text-xs sm:text-sm bg-[#FDFBF7] focus:outline-none focus:border-[#004643]"
            />
          </div>
          ${
            searchQuery
              ? `
            <button
              type="button"
              id="admin-user-search-clear"
              class="px-3 py-2 rounded-xl text-xs font-semibold text-[#57534E] hover:text-[#141413] hover:bg-[#F0EDE5]"
            >
              Clear
            </button>
          `
              : ''
          }
        </div>

        <!-- Users Grid / List -->
        <div class="mt-6">
          ${
            filtered.length === 0
              ? `
            <div class="py-12 text-center border-2 border-dashed border-[#DCD6C9] rounded-2xl p-6">
              <p class="text-sm font-semibold text-[#141413]">No user profiles found</p>
              <p class="text-xs text-[#57534E] mt-1">Try adjusting your search or add a new user profile above.</p>
            </div>
          `
              : `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${filtered
                .map((user) => {
                  const initials = user.name
                    ? user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()
                    : 'U';
                  const dateStr = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active';

                  return `
                  <div class="p-5 rounded-2xl bg-[#F8F6F0] border border-[#E7E3D9] flex flex-col justify-between hover:shadow-xs transition-shadow">
                    <div>
                      <div class="flex items-start justify-between gap-3">
                        <div class="flex items-center gap-3 min-w-0">
                          ${
                            user.avatar
                              ? `<img src="${escapeHtml(user.avatar)}" alt="${escapeHtml(user.name)}" class="w-12 h-12 rounded-full object-cover shrink-0 border border-[#DCD6C9]" />`
                              : `<div class="w-12 h-12 rounded-full bg-[#004643] text-white flex items-center justify-center font-bold text-sm shrink-0">${escapeHtml(initials)}</div>`
                          }
                          <div class="min-w-0">
                            <h3 class="text-sm font-bold text-[#141413] truncate flex items-center gap-1.5">
                              <span>${escapeHtml(user.name || 'Shopper')}</span>
                              <span class="inline-block w-2 h-2 rounded-full ${user.status === 'inactive' ? 'bg-amber-400' : 'bg-emerald-500'}" title="${escapeHtml(user.status || 'active')}"></span>
                            </h3>
                            <p class="text-xs text-[#57534E] truncate">${escapeHtml(user.email || 'No email')}</p>
                            <p class="text-[11px] font-medium text-[#004643] mt-0.5">${escapeHtml(user.phone || 'No phone')}</p>
                          </div>
                        </div>

                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          user.status === 'inactive' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }">
                          ${escapeHtml(user.status === 'inactive' ? 'Inactive' : 'Active')}
                        </span>
                      </div>

                      <div class="mt-3 pt-3 border-t border-[#E7E3D9]/70 space-y-1.5 text-xs">
                        <div class="flex items-center justify-between text-[#57534E]">
                          <span class="font-medium">City:</span>
                          <span class="font-semibold text-[#141413]">${escapeHtml(user.city || 'Not set')}</span>
                        </div>
                        ${
                          user.preferences
                            ? `
                          <div class="text-[#57534E]">
                            <span class="font-medium block text-[11px] text-[#78716C]">Shopping Interests:</span>
                            <p class="text-xs text-[#141413] line-clamp-2 mt-0.5 italic">"${escapeHtml(user.preferences)}"</p>
                          </div>
                        `
                            : ''
                        }
                        <div class="flex items-center justify-between text-[11px] text-[#78716C] pt-1">
                          <span>Joined: ${escapeHtml(dateStr)}</span>
                          <span>${user.connectionsCount || 0} Connections</span>
                        </div>
                      </div>
                    </div>

                    <!-- Actions -->
                    <div class="mt-4 pt-3 border-t border-[#E7E3D9] flex items-center justify-end gap-2">
                      <button
                        type="button"
                        data-user-edit-id="${escapeHtml(user.id)}"
                        class="px-3.5 py-1.5 rounded-lg border border-[#DCD6C9] bg-white text-xs font-semibold text-[#141413] hover:bg-[#F0EDE5] hover:border-[#004643] active:scale-95 transition-all shadow-2xs cursor-pointer"
                      >
                        Edit Profile
                      </button>
                      <button
                        type="button"
                        data-user-delete-id="${escapeHtml(user.id)}"
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
    // Search
    const searchInput = container.querySelector('#admin-user-search-input');
    searchInput?.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      render();
    });

    container.querySelector('#admin-user-search-clear')?.addEventListener('click', () => {
      searchQuery = '';
      render();
    });

    // Add User
    container.querySelector('#admin-add-user-btn')?.addEventListener('click', () => {
      openUserModal(null);
    });

    // Edit User
    container.querySelectorAll('[data-user-edit-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-user-edit-id');
        const user = users.find((u) => u.id === id);
        if (user) openUserModal(user);
      });
    });

    // Delete User
    container.querySelectorAll('[data-user-delete-id]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-user-delete-id');
        const user = users.find((u) => u.id === id);
        if (window.confirm(`Are you sure you want to delete profile for "${user?.name || id}"?`)) {
          try {
            users = await deleteUser(id);
            if (typeof onCountUpdate === 'function') onCountUpdate(users.length);
            showToast('User profile deleted successfully.', 'success');
            render();
          } catch {
            showToast('Failed to delete user profile.', 'error');
          }
        }
      });
    });
  }

  function openUserModal(existingUser) {
    const isEdit = Boolean(existingUser);
    const modalEl = document.createElement('div');
    modalEl.id = 'admin-user-modal';
    modalEl.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto';

    let currentAvatar = existingUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

    modalEl.innerHTML = `
      <div class="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#DCD6C9] animate-fade-up my-8">
        <button
          type="button"
          id="user-modal-close"
          class="absolute top-5 right-5 w-8 h-8 rounded-full border border-[#DCD6C9] bg-white text-[#78716C] hover:text-[#141413] hover:bg-[#F0EDE5] flex items-center justify-center transition-colors shadow-2xs"
        >
          &times;
        </button>

        <div class="pr-8 mb-5 pb-3 border-b border-[#E7E3D9]">
          <span class="text-xs font-bold uppercase tracking-wider text-[#004643]">Backend Edit</span>
          <h2 class="text-xl font-bold text-[#141413]">${isEdit ? 'Edit User Profile' : 'Create New User Profile'}</h2>
          <p class="text-xs text-[#57534E]">Manage user shopper details and upload avatar.</p>
        </div>

        <form id="admin-user-form" class="space-y-4">
          <!-- Avatar Preview & Upload -->
          <div>
            <label class="block text-xs font-semibold text-[#141413] mb-1.5">Profile Avatar</label>
            <div class="flex items-center gap-4">
              <img id="user-modal-avatar-preview" src="${escapeHtml(currentAvatar)}" alt="Avatar" class="w-16 h-16 rounded-full object-cover border-2 border-[#004643] shrink-0" />
              <div class="flex-1 space-y-1.5">
                <label class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#DCD6C9] bg-[#FDFBF7] text-xs font-semibold text-[#141413] hover:bg-[#F0EDE5] cursor-pointer">
                  <span>Upload Image File</span>
                  <input type="file" id="user-avatar-file" accept="image/*" class="hidden" />
                </label>
                <input
                  type="text"
                  id="user-avatar-url"
                  value="${escapeHtml(currentAvatar)}"
                  placeholder="Or enter image URL"
                  class="w-full px-3 py-1.5 rounded-lg border border-[#DCD6C9] text-xs bg-white focus:outline-none focus:border-[#004643]"
                />
              </div>
            </div>
          </div>

          <!-- Name -->
          <div>
            <label class="block text-xs font-semibold text-[#141413] mb-1" for="user-name">Full Name *</label>
            <input
              type="text"
              id="user-name"
              required
              value="${escapeHtml(existingUser?.name || '')}"
              placeholder="e.g. Priya Sundaram"
              class="w-full px-3.5 py-2 rounded-xl border border-[#DCD6C9] text-xs sm:text-sm bg-white focus:outline-none focus:border-[#004643]"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <!-- Email -->
            <div>
              <label class="block text-xs font-semibold text-[#141413] mb-1" for="user-email">Email Address</label>
              <input
                type="email"
                id="user-email"
                value="${escapeHtml(existingUser?.email || '')}"
                placeholder="name@example.com"
                class="w-full px-3 py-2 rounded-xl border border-[#DCD6C9] text-xs bg-white focus:outline-none focus:border-[#004643]"
              />
            </div>

            <!-- Phone -->
            <div>
              <label class="block text-xs font-semibold text-[#141413] mb-1" for="user-phone">Phone / WhatsApp</label>
              <input
                type="tel"
                id="user-phone"
                value="${escapeHtml(existingUser?.phone || '')}"
                placeholder="+91 98765 43210"
                class="w-full px-3 py-2 rounded-xl border border-[#DCD6C9] text-xs bg-white focus:outline-none focus:border-[#004643]"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <!-- City -->
            <div>
              <label class="block text-xs font-semibold text-[#141413] mb-1" for="user-city">City</label>
              <select id="user-city" class="w-full px-3 py-2 rounded-xl border border-[#DCD6C9] text-xs bg-white focus:outline-none focus:border-[#004643]">
                ${['Coimbatore', 'Chennai', 'Bengaluru', 'Hyderabad', 'Madurai', 'Salem', 'Kochi', 'Mumbai', 'Delhi']
                  .map((c) => `<option value="${c}" ${existingUser?.city === c ? 'selected' : ''}>${c}</option>`)
                  .join('')}
              </select>
            </div>

            <!-- Status -->
            <div>
              <label class="block text-xs font-semibold text-[#141413] mb-1" for="user-status">Account Status</label>
              <select id="user-status" class="w-full px-3 py-2 rounded-xl border border-[#DCD6C9] text-xs bg-white focus:outline-none focus:border-[#004643]">
                <option value="active" ${existingUser?.status !== 'inactive' ? 'selected' : ''}>Active</option>
                <option value="inactive" ${existingUser?.status === 'inactive' ? 'selected' : ''}>Inactive / Blocked</option>
              </select>
            </div>
          </div>

          <!-- Preferences / Interests -->
          <div>
            <label class="block text-xs font-semibold text-[#141413] mb-1" for="user-preferences">Shopping Preferences / Bio</label>
            <textarea
              id="user-preferences"
              rows="2"
              placeholder="e.g. Pure cotton sarees, handcrafted jewellery, linen wear..."
              class="w-full px-3 py-2 rounded-xl border border-[#DCD6C9] text-xs bg-white focus:outline-none focus:border-[#004643]"
            >${escapeHtml(existingUser?.preferences || '')}</textarea>
          </div>

          <!-- Actions -->
          <div class="mt-6 pt-4 border-t border-[#E7E3D9] flex items-center justify-end gap-3">
            <button
              type="button"
              id="user-modal-cancel"
              class="px-4 py-2 rounded-full border border-[#DCD6C9] text-xs font-semibold text-[#57534E] hover:bg-[#F0EDE5]"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="user-modal-submit"
              class="px-6 py-2 rounded-full bg-[#004643] text-white text-xs sm:text-sm font-bold hover:bg-[#003634] active:scale-95 transition-all shadow-sm"
            >
              ${isEdit ? 'Save Changes' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modalEl);

    // Avatar upload handler
    const fileInput = modalEl.querySelector('#user-avatar-file');
    const urlInput = modalEl.querySelector('#user-avatar-url');
    const avatarPreview = modalEl.querySelector('#user-modal-avatar-preview');

    fileInput?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        showToast('Uploading avatar...', 'success');
        const res = await uploadMediaFile(file);
        if (res && res.url) {
          currentAvatar = res.url;
          if (urlInput) urlInput.value = currentAvatar;
          if (avatarPreview) avatarPreview.src = currentAvatar;
          showToast('Avatar uploaded successfully!', 'success');
        }
      } catch (err) {
        showToast(err.message || 'Avatar upload failed', 'error');
      }
    });

    urlInput?.addEventListener('input', (e) => {
      currentAvatar = e.target.value.trim();
      if (avatarPreview) avatarPreview.src = currentAvatar;
    });

    // Close handlers
    const closeModal = () => modalEl.remove();
    modalEl.querySelector('#user-modal-close')?.addEventListener('click', closeModal);
    modalEl.querySelector('#user-modal-cancel')?.addEventListener('click', closeModal);
    modalEl.addEventListener('click', (e) => {
      if (e.target === modalEl) closeModal();
    });

    // Submit handler
    const form = modalEl.querySelector('#admin-user-form');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = modalEl.querySelector('#user-modal-submit');
      if (submitBtn) submitBtn.textContent = 'Saving...';

      const payload = {
        id: existingUser?.id || '',
        name: modalEl.querySelector('#user-name')?.value.trim() || '',
        email: modalEl.querySelector('#user-email')?.value.trim() || '',
        phone: modalEl.querySelector('#user-phone')?.value.trim() || '',
        city: modalEl.querySelector('#user-city')?.value || 'Coimbatore',
        status: modalEl.querySelector('#user-status')?.value || 'active',
        preferences: modalEl.querySelector('#user-preferences')?.value.trim() || '',
        avatar: currentAvatar,
        connectionsCount: existingUser?.connectionsCount || 150,
      };

      try {
        await saveUser(payload);
        showToast(isEdit ? 'User profile updated successfully!' : 'New user profile created!', 'success');
        closeModal();
        await loadData();
      } catch {
        showToast('Failed to save user profile.', 'error');
        if (submitBtn) submitBtn.textContent = isEdit ? 'Save Changes' : 'Create Profile';
      }
    });
  }

  loadData();

  return {
    reload: loadData,
  };
}
