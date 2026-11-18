// Instagram Embed & Mobile Deep-Link Utilities
// Never downloads or hosts Instagram videos on MyMigo.

/**
 * Extracts Instagram post/reel type and shortcode from a standard Instagram URL.
 * Supports /reel/<code>, /p/<code>, /tv/<code>.
 */
export function parseInstagramMediaUrl(url) {
  if (!url) return null;
  const match = url.match(/instagram\.com\/(reel|p|tv)\/([A-Za-z0-9_-]+)/i);
  if (!match) return null;
  return {
    type: match[1].toLowerCase(),
    shortcode: match[2],
  };
}

/**
 * Returns the official Instagram embed iframe URL for a Reel or Post.
 */
export function getInstagramEmbedUrl(url) {
  const parsed = parseInstagramMediaUrl(url);
  if (!parsed) return null;
  return `https://www.instagram.com/${parsed.type}/${parsed.shortcode}/embed/`;
}

/**
 * Extracts username from an Instagram profile URL like https://www.instagram.com/mymigo.official/
 */
export function parseInstagramUsername(url) {
  if (!url) return null;
  if (parseInstagramMediaUrl(url)) return null;
  const match = url.match(/instagram\.com\/([A-Za-z0-9._]+)/i);
  return match ? match[1] : null;
}

/**
 * Returns the official Instagram profile embed URL for a handle or profile URL.
 */
export function getInstagramProfileEmbedUrl(handleOrUrl) {
  if (!handleOrUrl) return null;
  const handle = handleOrUrl.includes('instagram.com')
    ? parseInstagramUsername(handleOrUrl)
    : String(handleOrUrl).replace(/^@/, '').trim();
  if (!handle) return null;
  return `https://www.instagram.com/${encodeURIComponent(handle)}/embed/`;
}

/**
 * Checks whether a URL is a placeholder sample shortcode before real Reels are added.
 */
export function isSamplePlaceholderUrl(url) {
  return Boolean(url && /SampleReel/i.test(url));
}

/**
 * Opens an Instagram URL with mobile app deep-link support where appropriate:
 * - On Android: uses an HTTPS-scheme Android Intent to open the Instagram app if installed,
 *   falling back to the web URL in the browser.
 * - On iOS: opens the official https://www.instagram.com/... Universal Link directly,
 *   which iOS routes straight into the Instagram app when installed.
 * - For profile links on mobile, optionally attempts instagram://user?username=... with
 *   clean fallback.
 */
export function openInstagramUrl(event, webUrl) {
  if (!webUrl) return;
  const ua = navigator.userAgent || '';
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);

  // Desktop: standard new-tab navigation
  if (!isAndroid && !isIOS) {
    return;
  }

  // Android: official Intent URI opens Instagram app if installed, else falls back cleanly
  if (isAndroid) {
    event.preventDefault();
    const cleaned = webUrl.replace(/^https?:\/\//i, '');
    const fallbackEncoded = encodeURIComponent(webUrl);
    const intentUrl = `intent://${cleaned}#Intent;package=com.instagram.android;scheme=https;S.browser_fallback_url=${fallbackEncoded};end`;
    window.location.href = intentUrl;
    return;
  }

  // iOS: for profile links, try instagram://user?username=... with clean fallback if app absent
  const username = parseInstagramUsername(webUrl);
  if (isIOS && username) {
    event.preventDefault();
    const appUrl = `instagram://user?username=${encodeURIComponent(username)}`;
    let appOpened = false;

    const onVisibilityChange = () => {
      if (document.hidden) {
        appOpened = true;
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange, { once: true });

    window.location.href = appUrl;
    window.setTimeout(() => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (!appOpened) {
        window.open(webUrl, '_blank', 'noopener,noreferrer');
      }
    }, 900);
  }
  // For iOS Reels/Posts, standard https://www.instagram.com/reel/... Universal Link
  // opens directly in the Instagram app if installed (no JS interception needed).
}
