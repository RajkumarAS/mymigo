// MyMigo MVP Application Entry & Router

import { renderNavbar } from './components/Navbar.js?v=20261125c';
import { renderFooter } from './components/Footer.js?v=20261125c';
import { renderHomePage } from './pages/HomePage.js?v=20261125c';
import { renderExploreStoresPage } from './pages/ExploreStoresPage.js?v=20261125c';
import { renderBookSessionPage } from './pages/BookSessionPage.js?v=20261125c';
import { renderInstagramPage } from './pages/InstagramPage.js?v=20261125c';
import { renderStoreProfilePage } from './pages/StoreProfilePage.js?v=20261125c';
import { renderSearchPage } from './pages/SearchPage.js?v=20261125c';
import { renderMigoConnectPage } from './pages/MigoConnectPage.js?v=20261125c';
import { renderNotificationsPage } from './pages/NotificationsPage.js?v=20261125c';
import { renderProfilePage } from './pages/ProfilePage.js?v=20261125c';
import { renderAdminPage } from './pages/AdminPage.js?v=20261125c';
import { mediaManager } from './utils/mediaManager.js';

function parseHashRoute() {
  const rawHash = window.location.hash.slice(1) || '/';
  const [pathPart, queryPart] = rawHash.split('?');
  const query = new URLSearchParams(queryPart || '');

  if (pathPart.startsWith('/store/')) {
    const storeId = decodeURIComponent(pathPart.slice('/store/'.length));
    return { path: '/store', storeId, query };
  }

  const normalizedPath = ['/', '/stores', '/book', '/search', '/instagram', '/finds', '/connect', '/notifications', '/profile', '/admin'].includes(pathPart)
    ? pathPart
    : '/';
  return {
    path: normalizedPath,
    storeId: null,
    query,
  };
}

function initApp() {
  const navbarEl = document.getElementById('app-navbar');
  const mainEl = document.getElementById('app-main');
  const footerEl = document.getElementById('app-footer');

  const navigate = (target) => {
    // Prime browser audio activation within user click gesture
    mediaManager.unlockAudio();

    const nextHash = `#${target}`;
    if (window.location.hash !== nextHash) {
      window.location.hash = target;
    } else {
      render();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const render = async () => {
    // Stop and mute any active video audio from previous views immediately
    mediaManager.stopAll();

    const { path, storeId, query } = parseHashRoute();
    let navActiveRoute = path === '/store' ? '/stores' : path;
    if (navActiveRoute === '/instagram') navActiveRoute = '/finds';
    renderNavbar(navbarEl, navActiveRoute, navigate);
    renderFooter(footerEl, navigate);

    switch (path) {
      case '/admin':
        await renderAdminPage(mainEl, navigate);
        break;
      case '/store':
        await renderStoreProfilePage(mainEl, storeId, navigate);
        break;
      case '/stores':
        await renderExploreStoresPage(mainEl, navigate);
        break;
      case '/book':
        await renderBookSessionPage(mainEl, navigate, query);
        break;
      case '/search':
        await renderSearchPage(mainEl, navigate);
        break;
      case '/connect':
        renderMigoConnectPage(mainEl, navigate);
        break;
      case '/profile':
        renderProfilePage(mainEl, navigate, query);
        break;
      case '/notifications':
        renderNotificationsPage(mainEl, navigate);
        break;
      case '/finds':
      case '/instagram':
        await renderInstagramPage(mainEl, navigate, query);
        break;
      case '/':
      default:
        await renderHomePage(mainEl, navigate);
        break;
    }
  };

  window.addEventListener('hashchange', render);
  render();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
