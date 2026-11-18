// Notifications Page — Exact creator/Instagram notification UI matching user reference
// Groups: Today, Yesterday, Last 7 days, and expandable "See more" older notifications.
// "Followers" replaced with "Connections".

export function renderNotificationsPage(container, navigate) {
  let activeFilter = 'All';
  let showOlder = false;

  // Mark notifications as read in localStorage
  try {
    localStorage.setItem('mymigo_has_unread_notif_v1', 'false');
  } catch (e) {}

  const NOTIFICATIONS_DATA = {
    today: [
      {
        id: 'notif-1',
        category: 'Activities',
        type: 'like',
        avatars: [
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
        ],
        badge: { type: 'heart', bg: 'bg-[#FF2E7E]' },
        html: '<span class="font-bold text-[#141413]">riyaan_aarush</span>, <span class="font-bold text-[#141413]">sanem_subs</span> and 24 others liked your reel.',
        time: '25m',
        rightType: 'video',
        thumb: 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=160&q=80',
        actionRoute: '/finds',
      },
      {
        id: 'notif-2',
        category: 'Earnings',
        type: 'connection',
        isIconAvatar: true,
        iconBg: 'bg-purple-100 text-purple-700',
        html: 'You have <span class="font-bold text-[#141413]">10+ new connections</span>.',
        time: '1h',
        rightType: 'chevron',
        actionRoute: '/connect',
      },
      {
        id: 'notif-3',
        category: 'Orders',
        type: 'save',
        avatars: [
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
        ],
        badge: { type: 'bag', bg: 'bg-purple-600' },
        html: '<span class="font-bold text-[#141413]">subbulakshmi_01</span> and <span class="font-bold text-[#141413]">vivek_mrj</span> saved your product.',
        time: '2h',
        rightType: 'image',
        thumb: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=160&q=80',
        actionRoute: '/stores',
      },
    ],
    yesterday: [
      {
        id: 'notif-4',
        category: 'Activities',
        type: 'comment',
        avatars: [
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
          'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=160&q=80',
        ],
        badge: { type: 'comment', bg: 'bg-amber-500' },
        html: '<span class="font-bold text-[#141413]">sanem_subs</span> commented: ❤️❤️❤️',
        time: '13h',
        rightType: 'image',
        thumb: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=160&q=80',
        actionRoute: '/finds',
      },
      {
        id: 'notif-5',
        category: 'Orders',
        type: 'purchase',
        avatars: [
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80',
        ],
        badge: { type: 'cart', bg: 'bg-[#004643]' },
        html: '<span class="font-bold text-[#141413]">jeelashnhttpsyoutube.comjeelas</span> booked a session from your store.',
        time: '13h',
        rightType: 'chevron',
        actionRoute: '/book',
      },
      {
        id: 'notif-6',
        category: 'Activities',
        type: 'share',
        avatars: [
          'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80',
        ],
        badge: { type: 'share', bg: 'bg-blue-500' },
        html: '<span class="font-bold text-[#141413]">yamini_kyra</span> shared your product link.',
        time: '19h',
        rightType: 'image',
        thumb: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=160&q=80',
        actionRoute: '/stores',
      },
    ],
    last7days: [
      {
        id: 'notif-7',
        category: 'Earnings',
        type: 'affiliate',
        avatars: [
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80',
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80',
        ],
        badge: { type: 'crown', bg: 'bg-amber-500' },
        html: '<span class="font-bold text-[#141413]">kaarthysundaresan</span> and 49 others joined the Affiliate Program.',
        time: '1d',
        rightType: 'button',
        buttonText: 'View',
        actionRoute: '/connect',
      },
    ],
    older: [
      {
        id: 'notif-8',
        category: 'Orders',
        type: 'booking',
        avatars: [
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
        ],
        badge: { type: 'cart', bg: 'bg-[#004643]' },
        html: '<span class="font-bold text-[#141413]">Priya Ramachandran</span> booked a live video shopping session at Kalyani Cotton.',
        time: '2d',
        rightType: 'button',
        buttonText: 'View',
        actionRoute: '/book',
      },
      {
        id: 'notif-9',
        category: 'Earnings',
        type: 'connection',
        isIconAvatar: true,
        iconBg: 'bg-emerald-100 text-[#004643]',
        html: '<span class="font-bold text-[#141413]">Ananya Sundaram</span> added you to her shopping circle on Migo Connect.',
        time: '4d',
        rightType: 'chevron',
        actionRoute: '/connect',
      },
      {
        id: 'notif-10',
        category: 'Orders',
        type: 'save',
        avatars: [
          'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=160&q=80',
        ],
        badge: { type: 'bag', bg: 'bg-purple-600' },
        html: '<span class="font-bold text-[#141413]">Virasat Temple Jewels</span> added 15 new temple jewellery designs to Explore Stores.',
        time: '5d',
        rightType: 'image',
        thumb: 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=160&q=80',
        actionRoute: '/stores',
      },
      {
        id: 'notif-11',
        category: 'Activities',
        type: 'share',
        avatars: [
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
        ],
        badge: { type: 'share', bg: 'bg-blue-500' },
        html: '<span class="font-bold text-[#141413]">Arjun & Meera</span> shared The SilkWalk Studio collection with 8 friends.',
        time: '6d',
        rightType: 'video',
        thumb: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=160&q=80',
        actionRoute: '/finds',
      },
    ],
  };

  function renderBadgeIcon(badge) {
    switch (badge.type) {
      case 'heart':
        return `<span class="w-4 h-4 rounded-full ${badge.bg} text-white flex items-center justify-center absolute -bottom-0.5 -right-0.5 ring-2 ring-[#F0EDE5] shadow-xs">
          <svg class="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        </span>`;
      case 'bag':
        return `<span class="w-4 h-4 rounded-full ${badge.bg} text-white flex items-center justify-center absolute -bottom-0.5 -right-0.5 ring-2 ring-[#F0EDE5] shadow-xs">
          <svg class="w-2.5 h-2.5 fill-none stroke-current" stroke-width="2.2" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
        </span>`;
      case 'comment':
        return `<span class="w-4 h-4 rounded-full ${badge.bg} text-white flex items-center justify-center absolute -bottom-0.5 -right-0.5 ring-2 ring-[#F0EDE5] shadow-xs">
          <svg class="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
        </span>`;
      case 'cart':
        return `<span class="w-4 h-4 rounded-full ${badge.bg} text-white flex items-center justify-center absolute -bottom-0.5 -right-0.5 ring-2 ring-[#F0EDE5] shadow-xs">
          <svg class="w-2.5 h-2.5 fill-none stroke-current" stroke-width="2.2" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
        </span>`;
      case 'share':
        return `<span class="w-4 h-4 rounded-full ${badge.bg} text-white flex items-center justify-center absolute -bottom-0.5 -right-0.5 ring-2 ring-[#F0EDE5] shadow-xs">
          <svg class="w-2.5 h-2.5 fill-none stroke-current" stroke-width="2.5" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </span>`;
      case 'crown':
        return `<span class="w-4 h-4 rounded-full ${badge.bg} text-white flex items-center justify-center absolute -bottom-0.5 -right-0.5 ring-2 ring-[#F0EDE5] shadow-xs">
          <svg class="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5m14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>
        </span>`;
      default:
        return '';
    }
  }

  function renderAvatar(item) {
    if (item.isIconAvatar) {
      return `
        <div class="relative w-11 h-11 shrink-0 flex items-center justify-center rounded-full ${item.iconBg}">
          <svg class="w-5 h-5 fill-none stroke-current" stroke-width="2" viewBox="0 0 24 24">
            <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
        </div>
      `;
    }

    if (item.avatars.length === 2) {
      return `
        <div class="relative w-11 h-11 shrink-0">
          <img src="${item.avatars[0]}" alt="User" class="w-7 h-7 rounded-full object-cover border border-white absolute top-0 left-0" />
          <img src="${item.avatars[1]}" alt="User" class="w-7 h-7 rounded-full object-cover border border-white absolute bottom-0 right-0" />
          ${renderBadgeIcon(item.badge)}
        </div>
      `;
    }

    return `
      <div class="relative w-11 h-11 shrink-0">
        <img src="${item.avatars[0]}" alt="User" class="w-11 h-11 rounded-full object-cover border border-[#DCD6C9]" />
        ${renderBadgeIcon(item.badge)}
      </div>
    `;
  }

  function renderRightAction(item) {
    if (item.rightType === 'video') {
      return `
        <div class="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-[#DCD6C9] bg-stone-200">
          <img src="${item.thumb}" alt="Reel thumbnail" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-black/20 flex items-center justify-center">
            <svg class="w-3.5 h-3.5 text-white fill-current" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
        </div>
      `;
    }

    if (item.rightType === 'image') {
      return `
        <div class="w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-[#DCD6C9] bg-stone-200">
          <img src="${item.thumb}" alt="Product thumbnail" class="w-full h-full object-cover" />
        </div>
      `;
    }

    if (item.rightType === 'button') {
      return `
        <button
          type="button"
          class="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#004643]/10 text-[#004643] hover:bg-[#004643] hover:text-white transition-colors shrink-0"
        >
          ${item.buttonText}
        </button>
      `;
    }

    // Default rightType === 'chevron'
    return `
      <div class="w-6 h-6 flex items-center justify-center text-[#A8A29E] shrink-0">
        <svg class="w-4 h-4 fill-none stroke-current" stroke-width="2.2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
      </div>
    `;
  }

  function filterItems(items) {
    if (activeFilter === 'All') return items;
    return items.filter((item) => item.category === activeFilter);
  }

  function renderSection(title, items) {
    const filtered = filterItems(items);
    if (!filtered || filtered.length === 0) return '';

    return `
      <div class="mb-6">
        <h2 class="text-base sm:text-lg font-bold text-[#141413] mb-3 px-1">${title}</h2>
        <div class="divide-y divide-[#ECE7DC] bg-white/70 backdrop-blur-sm rounded-3xl border border-[#DCD6C9] p-2 sm:p-3 shadow-xs">
          ${filtered
            .map(
              (item) => `
            <div
              data-notif-action="${item.actionRoute}"
              class="py-3 px-2 sm:px-3 flex items-center justify-between gap-3.5 hover:bg-[#F0EDE5]/60 rounded-2xl cursor-pointer transition-colors"
            >
              <div class="flex items-center gap-3 min-w-0 flex-1">
                ${renderAvatar(item)}
                <div class="min-w-0 flex-1 text-xs sm:text-sm text-[#141413] leading-snug">
                  <p class="break-words">
                    ${item.html}
                    <span class="text-[11px] sm:text-xs text-[#78716C] ml-1.5 font-normal whitespace-nowrap">${item.time}</span>
                  </p>
                </div>
              </div>
              <div class="shrink-0">
                ${renderRightAction(item)}
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;
  }

  function render() {
    container.innerHTML = `
      <div class="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-8 pb-28 animate-fade-up">
        
        <!-- Header with Back Arrow <, Center Title, and Right Bell Icon -->
        <div class="flex items-center justify-between py-2 mb-4 border-b border-[#DCD6C9]/80 pb-3">
          <button
            id="notif-back-btn"
            type="button"
            aria-label="Back"
            class="p-2 -ml-2 text-[#141413] hover:text-[#004643] active:scale-95 transition-transform rounded-full"
          >
            <svg class="w-6 h-6 fill-none stroke-current" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <h1 class="text-lg sm:text-xl font-bold text-[#141413] tracking-tight text-center">
            Notifications
          </h1>

          <div class="relative p-2 -mr-2 text-[#141413]">
            <svg class="w-6 h-6 fill-none stroke-current" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 01-3.46 0"></path>
            </svg>
            <span class="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF2E7E] ring-2 ring-[#F0EDE5]"></span>
          </div>
        </div>

        <!-- Filter Pills: All, Activities, Orders, Earnings -->
        <div class="flex items-center gap-2 overflow-x-auto pb-2 mb-5 no-scrollbar">
          ${['All', 'Activities', 'Orders', 'Earnings']
            .map(
              (filter) => `
            <button
              type="button"
              data-filter="${filter}"
              class="px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                activeFilter === filter
                  ? 'bg-[#004643] text-white shadow-xs'
                  : 'bg-white border border-[#DCD6C9] text-[#57534E] hover:text-[#004643] hover:bg-[#F0EDE5]'
              }"
            >
              ${filter}
            </button>
          `
            )
            .join('')}
        </div>

        <!-- Notification List Grouped by Dates -->
        <div id="notifications-list">
          ${renderSection('Today', NOTIFICATIONS_DATA.today)}
          ${renderSection('Yesterday', NOTIFICATIONS_DATA.yesterday)}
          ${renderSection('Last 7 days', NOTIFICATIONS_DATA.last7days)}
          ${showOlder ? renderSection('Earlier', NOTIFICATIONS_DATA.older) : ''}
        </div>

        <!-- Bottom See More Button -->
        <div class="mt-4 text-center">
          ${
            !showOlder
              ? `
            <button
              id="see-more-btn"
              type="button"
              class="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-white border border-[#DCD6C9] text-[#004643] hover:bg-[#004643] hover:text-white transition-all shadow-xs active:scale-95"
            >
              <span>See more</span>
              <svg class="w-4 h-4 fill-none stroke-current" stroke-width="2" viewBox="0 0 24 24">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          `
              : `
            <p class="text-xs text-[#78716C] font-medium py-2 flex items-center justify-center gap-1.5">
              <span>✨</span>
              <span>You're all caught up with your notifications.</span>
            </p>
          `
          }
        </div>

      </div>
    `;

    // Event listeners
    container.querySelector('#notif-back-btn')?.addEventListener('click', () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        navigate('/');
      }
    });

    container.querySelectorAll('[data-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeFilter = btn.getAttribute('data-filter') || 'All';
        render();
      });
    });

    container.querySelector('#see-more-btn')?.addEventListener('click', () => {
      showOlder = true;
      render();
    });

    container.querySelectorAll('[data-notif-action]').forEach((item) => {
      item.addEventListener('click', () => {
        const route = item.getAttribute('data-notif-action');
        if (route) navigate(route);
      });
    });
  }

  render();
}
