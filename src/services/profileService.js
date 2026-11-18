// Profile & Seller Service — User Profiles, Seller Profiles, and Media Uploads

const USERS_CACHE_KEY = 'mymigo_users_cache_v1';
const SELLERS_CACHE_KEY = 'mymigo_sellers_cache_v1';

export async function fetchUsers() {
  try {
    const res = await fetch('/api/users', { headers: { Accept: 'application/json' } });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.users)) {
        try {
          localStorage.setItem(USERS_CACHE_KEY, JSON.stringify(data.users));
        } catch {}
        return data.users;
      }
    }
  } catch {}

  try {
    const cached = localStorage.getItem(USERS_CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch {}
  return [];
}

export async function saveUser(userData) {
  const res = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error('Failed to save user profile');
  const data = await res.json();
  return data.user;
}

export async function deleteUser(userId) {
  const res = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ action: 'delete', id: userId }),
  });
  if (!res.ok) throw new Error('Failed to delete user');
  const data = await res.json();
  return data.users;
}

export async function fetchSellers() {
  try {
    const res = await fetch('/api/sellers', { headers: { Accept: 'application/json' } });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.sellers)) {
        try {
          localStorage.setItem(SELLERS_CACHE_KEY, JSON.stringify(data.sellers));
        } catch {}
        return data.sellers;
      }
    }
  } catch {}

  try {
    const cached = localStorage.getItem(SELLERS_CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch {}
  return [];
}

export async function saveSeller(sellerData) {
  const res = await fetch('/api/sellers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(sellerData),
  });
  if (!res.ok) throw new Error('Failed to save seller profile');
  const data = await res.json();
  return data.seller;
}

export async function deleteSeller(sellerId) {
  const res = await fetch('/api/sellers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ action: 'delete', id: sellerId }),
  });
  if (!res.ok) throw new Error('Failed to delete seller');
  const data = await res.json();
  return data.sellers;
}

/**
 * Uploads a file (image or video) as base64 to /api/upload
 * Returns { url: './uploads/xxx', filename: 'xxx', mediaType: 'image'|'video' }
 */
export async function uploadMediaFile(file) {
  if (!file) throw new Error('No file provided');
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = async () => {
      try {
        const fileData = reader.result;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            fileData,
          }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Upload failed');
        }
        const data = await res.json();
        resolve(data);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsDataURL(file);
  });
}
