// Homepage Service — dynamic banner, featured stores, and featured videos configuration

export const DEFAULT_HOMEPAGE_CONFIG = {
  banner: {
    imageDesktop: './assets/hero-desktop.jpg',
    imageMobile: './assets/hero-mobile.jpg',
    badgeTitle: 'Personal Shopping Assistance',
    badgeSubtitle: 'Across Indian Cities',
    headingLine1: 'Someone is',
    headingLine2: 'there.',
    subtitle: 'Shop from anywhere.',
    button1: {
      text: 'Book a Session',
      action: 'book_session',
      link: '#/book',
      enabled: true,
    },
    button2: {
      text: 'Explore Stores',
      action: 'explore_stores',
      link: '#/stores',
      enabled: true,
    },
  },
  featuredStores: [
    { id: 'store-silkwalk-studio', badge: 'Top Rated.', rating: 4.8 },
    { id: 'store-kalyani-cotton', badge: 'Top Rated.', rating: 4.9 },
    { id: 'store-urban-tops', badge: 'Trending', rating: 4.7 },
  ],
  featuredVideos: [
    'video-01',
    'video-02',
    'video-03',
    'video-04',
  ],
};

const STORAGE_KEY = 'mymigo_homepage_config';

export async function fetchHomepageConfig() {
  try {
    const res = await fetch('/api/homepage', {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.homepage && typeof data.homepage === 'object') {
        const merged = mergeWithDefaults(data.homepage);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        } catch {
          // ignore quota issues
        }
        return merged;
      }
    }
  } catch {
    // Network or server error fallback
  }

  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed === 'object') {
        return mergeWithDefaults(parsed);
      }
    }
  } catch {
    // Cache parse error fallback
  }

  return structuredClone(DEFAULT_HOMEPAGE_CONFIG);
}

export async function saveHomepageConfig(config) {
  const merged = mergeWithDefaults(config);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // ignore
  }

  try {
    const res = await fetch('/api/homepage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(merged),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.homepage) {
        return mergeWithDefaults(data.homepage);
      }
    }
  } catch {
    // offline or error, still persisted in localStorage
  }

  return merged;
}

export async function resetHomepageConfig() {
  const fresh = structuredClone(DEFAULT_HOMEPAGE_CONFIG);
  return saveHomepageConfig(fresh);
}

function mergeWithDefaults(incoming) {
  const base = structuredClone(DEFAULT_HOMEPAGE_CONFIG);
  if (!incoming || typeof incoming !== 'object') return base;

  return {
    banner: {
      ...base.banner,
      ...(incoming.banner || {}),
      button1: {
        ...base.banner.button1,
        ...(incoming.banner?.button1 || {}),
      },
      button2: {
        ...base.banner.button2,
        ...(incoming.banner?.button2 || {}),
      },
    },
    featuredStores: Array.isArray(incoming.featuredStores) && incoming.featuredStores.length === 3
      ? incoming.featuredStores.map((item, idx) => {
          if (typeof item === 'string') {
            return {
              id: item,
              badge: base.featuredStores[idx]?.badge || 'Top Rated.',
              rating: base.featuredStores[idx]?.rating ?? 4.8,
            };
          }
          return {
            id: item.id || base.featuredStores[idx]?.id || 'store-kalyani-cotton',
            badge: typeof item.badge === 'string' ? item.badge : (base.featuredStores[idx]?.badge || ''),
            rating: item.rating !== undefined && item.rating !== null && item.rating !== '' ? Number(item.rating) : null,
          };
        })
      : base.featuredStores,
    featuredVideos: Array.isArray(incoming.featuredVideos) && incoming.featuredVideos.length === 4
      ? incoming.featuredVideos
      : base.featuredVideos,
  };
}
