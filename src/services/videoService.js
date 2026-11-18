// Video Reels Service — Connects to /api/videos with fallback to local defaults

import { INSTAGRAM_VIDEOS } from '../data/instagramVideos.js';

let cachedVideos = null;

// Warm up videos cache in background
fetchVideos().catch(() => {});

export function getCachedVideos() {
  return cachedVideos || INSTAGRAM_VIDEOS;
}

export async function fetchVideos() {
  try {
    const res = await fetch('/api/videos', { headers: { Accept: 'application/json' } });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.videos) && data.videos.length > 0) {
        cachedVideos = data.videos;
        return cachedVideos;
      }
    }
  } catch {
    // fallback
  }

  return cachedVideos || INSTAGRAM_VIDEOS;
}

export async function likeVideo(videoId) {
  try {
    const res = await fetch('/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ action: 'like', id: videoId }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.videos) cachedVideos = data.videos;
      return data;
    }
  } catch (err) {
    console.error('Like error:', err);
  }
  return null;
}

export async function commentVideo(videoId, text, userName = 'Shopper', userAvatar = '') {
  try {
    const res = await fetch('/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        action: 'comment',
        id: videoId,
        text,
        userName,
        userAvatar,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.videos) cachedVideos = data.videos;
      return data;
    }
  } catch (err) {
    console.error('Comment error:', err);
  }
  return null;
}

export async function shareVideo(videoId) {
  try {
    const res = await fetch('/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ action: 'share', id: videoId }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.videos) cachedVideos = data.videos;
      return data;
    }
  } catch (err) {
    console.error('Share error:', err);
  }
  return null;
}

export async function uploadVideo(videoData) {
  try {
    const res = await fetch('/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        action: 'upload',
        ...videoData,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.videos) cachedVideos = data.videos;
      return data;
    }
  } catch (err) {
    console.error('Upload video error:', err);
  }
  return null;
}

export function clearVideosCache() {
  cachedVideos = null;
}
