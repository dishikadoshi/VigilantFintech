import { useEffect } from 'react';
import { SITE } from '../config/site';

function setMeta(selector, attr, value, create) {
  let el = document.head.querySelector(selector);
  if (!el && create) {
    el = document.createElement(create.tag);
    Object.entries(create.attrs).forEach(([k, v]) => el.setAttribute(k, v));
    document.head.appendChild(el);
  }
  if (el) el.setAttribute(attr, value);
}

/** Per-route <title>, description, canonical and Open Graph tags. */
export function useSEO({ title, description, path }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE.name}` : `Virtual Assistant Services & Remote Business Support | ${SITE.name}`;
    document.title = fullTitle;
    const desc = description ||
      'Professional virtual assistant services: administrative support, customer service, digital marketing, e-commerce assistance, bookkeeping support and remote business solutions.';
    setMeta('meta[name="description"]', 'content', desc, { tag: 'meta', attrs: { name: 'description' } });
    setMeta('meta[property="og:title"]', 'content', fullTitle, { tag: 'meta', attrs: { property: 'og:title' } });
    setMeta('meta[property="og:description"]', 'content', desc, { tag: 'meta', attrs: { property: 'og:description' } });
    const url = `${SITE.url}${path === '/' ? '/' : path || window.location.pathname}`;
    setMeta('link[rel="canonical"]', 'href', url, { tag: 'link', attrs: { rel: 'canonical' } });
    setMeta('meta[property="og:url"]', 'content', url, { tag: 'meta', attrs: { property: 'og:url' } });
  }, [title, description, path]);
}
