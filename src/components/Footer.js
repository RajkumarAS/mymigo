// Minimal, Premium Footer with Learn About & Contact Info

import { PUBLIC_CONFIG } from '../config.js';
import { openInstagramUrl } from '../services/instagramHelper.js';
import { escapeHtml } from '../utils/dom.js';

export function renderFooter(container, navigate) {
  container.innerHTML = `
    <footer class="border-t border-[#DCD6C9] bg-[#F0EDE5] mt-10 sm:mt-16 pb-20 md:pb-0">
      <div class="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-10">
          <!-- Brand & Mission -->
          <div class="md:col-span-5 space-y-4">
            <div class="flex items-center gap-2.5">
              <span class="w-8 h-8 rounded-xl bg-[#004643] text-[#F0EDE5] flex items-center justify-center text-sm font-bold shadow-sm">M</span>
              <span class="text-lg font-bold tracking-tight text-[#004643]">MyMigo</span>
            </div>
            <p class="text-sm text-[#57534E] leading-relaxed max-w-sm">
              Someone is there. Shop from anywhere. MyMigo helps you discover trusted stores across cities and book personal shopping assistance with confidence.
            </p>
          </div>

          <!-- Navigation -->
          <div class="md:col-span-3 space-y-3">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-[#57534E]">Explore</h3>
            <ul class="space-y-2.5 text-sm">
              <li><a href="#/" data-footer-nav="/" class="text-[#141413] hover:text-[#004643] transition-colors">Home</a></li>
              <li><a href="#/stores" data-footer-nav="/stores" class="text-[#141413] hover:text-[#004643] transition-colors">Explore Stores</a></li>
              <li><a href="#/book" data-footer-nav="/book" class="text-[#141413] hover:text-[#004643] transition-colors">Book a Session</a></li>
              <li><a href="#/finds" data-footer-nav="/finds" class="text-[#141413] hover:text-[#004643] transition-colors">Finds</a></li>
              <li><a href="#/admin" data-footer-nav="/admin" class="text-[#004643] font-semibold hover:underline transition-colors flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-[#004643]"></span>Admin Panel</a></li>
            </ul>
          </div>

          <!-- Contact -->
          <div class="md:col-span-4 space-y-3">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-[#57534E]">Contact MyMigo</h3>
            <ul class="space-y-2.5 text-sm text-[#57534E]">
              <li>
                Email:
                <a href="mailto:${escapeHtml(PUBLIC_CONFIG.contactEmail)}" class="text-[#141413] font-medium hover:text-[#004643] transition-colors">
                  ${escapeHtml(PUBLIC_CONFIG.contactEmail)}
                </a>
              </li>
              <li>
                Phone / WhatsApp:
                <a href="${escapeHtml(PUBLIC_CONFIG.contactWhatsAppUrl)}" target="_blank" rel="noopener noreferrer" class="text-[#141413] font-medium hover:text-[#004643] transition-colors">
                  ${escapeHtml(PUBLIC_CONFIG.contactPhone)}
                </a>
              </li>
              <li>
                Instagram:
                <a
                  href="${escapeHtml(PUBLIC_CONFIG.officialInstagramUrl)}"
                  data-ig-footer
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-[#141413] font-medium hover:text-[#004643] transition-colors"
                >
                  ${escapeHtml(PUBLIC_CONFIG.officialInstagramHandle)}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div class="mt-12 pt-6 border-t border-[#DCD6C9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#57534E]">
          <p>&copy; ${new Date().getFullYear()} MyMigo. All rights reserved.</p>
          <p>Trusted stores across Coimbatore, Salem, Chennai, Madurai, Bengaluru, Kochi &amp; Hyderabad.</p>
        </div>
      </div>
    </footer>
  `;

  container.querySelectorAll('[data-footer-nav]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(el.getAttribute('data-footer-nav'));
    });
  });

  const igLink = container.querySelector('[data-ig-footer]');
  if (igLink) {
    igLink.addEventListener('click', (e) => openInstagramUrl(e, PUBLIC_CONFIG.officialInstagramUrl));
  }
}
