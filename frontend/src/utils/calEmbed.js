import { CAL } from '../config/site';

export const CAL_NAMESPACE = 'booking';
let started = false;

/**
 * Loads Cal.com's official embed script once and configures the popup.
 * Any element carrying data-cal-link / data-cal-namespace / data-cal-config
 * then opens Cal.com's own booking window on click (month view + time
 * slots, details form, email verification — all hosted by Cal.com).
 */
export function initCalEmbed() {
  if (started || !CAL.link || typeof window === 'undefined') return;
  started = true;

  // Official Cal.com loader snippet: queues calls until embed.js has loaded.
  (function (C, A, L) {
    const p = (a, ar) => { a.q.push(ar); };
    const d = C.document;
    C.Cal = C.Cal || function () {
      const cal = C.Cal;
      const ar = arguments;
      if (!cal.loaded) {
        cal.ns = {};
        cal.q = cal.q || [];
        d.head.appendChild(d.createElement('script')).src = A;
        cal.loaded = true;
      }
      if (ar[0] === L) {
        const api = function () { p(api, arguments); };
        const namespace = ar[1];
        api.q = api.q || [];
        if (typeof namespace === 'string') {
          cal.ns[namespace] = cal.ns[namespace] || api;
          p(cal.ns[namespace], ar);
          p(cal, ['initNamespace', namespace]);
        } else p(cal, ar);
        return;
      }
      p(cal, ar);
    };
  })(window, `${CAL.origin}/embed/embed.js`, 'init');

  window.Cal('init', CAL_NAMESPACE, { origin: CAL.origin });
  window.Cal.ns[CAL_NAMESPACE]('ui', {
    theme: CAL.theme,
    layout: 'month_view',
    hideEventTypeDetails: false,
    ...(CAL.brandColor ? { styles: { branding: { brandColor: CAL.brandColor } } } : {}),
  });
}
