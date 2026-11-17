/**
 * router.js — History-API router for the few real routes (home, legal pages) plus in-page #section navigation. Every jump runs through
 * the curtain transition so the experience stays cinematic.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { scrollToTop, scrollToHash, ScrollTrigger } from './smooth';

const Ctx = createContext(null);
export const useRouter = () => useContext(Ctx);

const norm = (p) => (p.length > 1 ? p.replace(/\/+$/, '') : p) || '/';
const read = () => ({ path: norm(window.location.pathname), search: window.location.search, hash: window.location.hash });

const LABELS = {
  '#home': 'Home', '#about': 'About Us', '#services': 'Services', '#why': 'Why Choose Us', '#how': 'How It Works',
  '#industries': 'Industries', '#pricing': 'Pricing', '#faq': 'FAQ', '#contact': 'Contact',
  '/privacy-policy': 'Privacy Policy', '/terms-and-conditions': 'Terms', '/cookie-policy': 'Cookie Policy',
  '/': 'Home',
};

const frames = (n) => new Promise((res) => { const f = () => (n-- <= 0 ? res() : requestAnimationFrame(f)); f(); });

export function RouterProvider({ transitionRef, children }) {
  const [loc, setLoc] = useState(read);
  const busy = useRef(false);

  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    const onPop = () => { setLoc(read()); scrollToTop(); };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback(async (to) => {
    const url = new URL(to, window.location.origin);
    const path = norm(url.pathname);
    const samePath = path === norm(window.location.pathname);
    const hash = url.hash;
    if (busy.current) return;
    busy.current = true;
    window.__navJump = Date.now();
    const t = transitionRef.current;
    try {
      if (samePath && path === '/' && !hash) { scrollToTop(false); return; }
      if (t) await t.cover(LABELS[hash] || LABELS[path] || '');
      if (!samePath) {
        window.history.pushState({}, '', url.pathname + url.search + hash);
        setLoc(read());
        scrollToTop();
        await frames(4);
      } else if (hash) {
        window.history.replaceState({}, '', url.pathname + url.search + hash);
      }
      if (hash && path === '/') {
        await frames(2);
        ScrollTrigger.refresh();
        scrollToHash(hash, true);
        await frames(2);
      } else if (samePath) {
        scrollToTop();
      }
      window.__navJump = Date.now();
      if (t) await t.reveal();
    } finally {
      busy.current = false;
    }
  }, [transitionRef]);

  const value = useMemo(() => ({ ...loc, navigate }), [loc, navigate]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

const isExternal = (to) => /^(https?:|mailto:|tel:)/i.test(to);

/** Drop-in <a>. `to` may be "/path", "#section" or an external URL. */
export const Link = React.forwardRef(function Link({ to, onClick, children, ...rest }, ref) {
  const router = useRouter();
  if (isExternal(to)) {
    const web = /^https?:/i.test(to);
    return <a ref={ref} href={to} {...(web ? { target: '_blank', rel: 'noopener noreferrer' } : {})} onClick={onClick} {...rest}>{children}</a>;
  }
  const target = to.startsWith('#') ? `/${to}` : to;
  const handle = (e) => {
    if (onClick) onClick(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || rest.target === '_blank') return;
    e.preventDefault();
    router.navigate(target);
  };
  return <a ref={ref} href={target} onClick={handle} {...rest}>{children}</a>;
});
