import React, { useEffect, useRef } from 'react';
import { gsap, FINE } from '../lib/smooth';

/**
 * Custom cursor: a precise dot plus a lagging ring that swells over links
 * and buttons, becomes a labelled bubble on [data-cursor="Label"], and
 * thins to a caret over form fields. Touch devices get nothing.
 */
export default function Cursor() {
  const root = useRef(null), dot = useRef(null), ring = useRef(null), label = useRef(null);

  useEffect(() => {
    if (!FINE) return undefined;
    document.documentElement.classList.add('has-cursor');
    const dx = gsap.quickTo(dot.current, 'x', { duration: 0.05, ease: 'power3.out' });
    const dy = gsap.quickTo(dot.current, 'y', { duration: 0.05, ease: 'power3.out' });
    const rx = gsap.quickTo(ring.current, 'x', { duration: 0.3, ease: 'power3.out' });
    const ry = gsap.quickTo(ring.current, 'y', { duration: 0.3, ease: 'power3.out' });

    const move = (e) => {
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
      root.current.classList.add('is-on');
    };
    const over = (e) => {
      const el = e.target.closest ? e.target.closest('[data-cursor], a, button, summary, [role="button"], input, textarea, select, label') : null;
      const c = root.current;
      c.classList.remove('is-link', 'is-view', 'is-text');
      if (!el) return;
      if (el.matches('input, textarea, select')) { c.classList.add('is-text'); return; }
      if (el.dataset && el.dataset.cursor) { label.current.textContent = el.dataset.cursor; c.classList.add('is-view'); return; }
      c.classList.add('is-link');
    };
    const down = () => root.current.classList.add('is-down');
    const up = () => root.current.classList.remove('is-down');
    const leave = () => root.current.classList.remove('is-on');
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerover', over, { passive: true });
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    document.documentElement.addEventListener('pointerleave', leave);
    return () => {
      document.documentElement.classList.remove('has-cursor');
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerover', over);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      document.documentElement.removeEventListener('pointerleave', leave);
    };
  }, []);

  if (!FINE) return null;
  return (
    <div className="cur" ref={root} aria-hidden="true">
      <div className="cur__ring" ref={ring}><span ref={label} className="cur__label" /></div>
      <div className="cur__dot" ref={dot} />
    </div>
  );
}
