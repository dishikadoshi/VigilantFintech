import React, { forwardRef, useImperativeHandle, useLayoutEffect, useRef } from 'react';
import { gsap, REDUCED } from '../lib/smooth';
import { Mark } from './Logo';
import { SITE } from '../config/site';

const COLS = 6;

/**
 * Full-screen curtain: columns sweep up to cover the old page, the route
 * swaps underneath, then they sweep away. Also plays once on first load
 * as the intro.
 */
const PageTransition = forwardRef(function PageTransition(_, ref) {
  const root = useRef(null);
  const label = useRef(null);
  const cols = useRef([]);

  const q = () => cols.current.filter(Boolean);

  useLayoutEffect(() => {
    // Start covered: this doubles as the loader.
    gsap.set(q(), { scaleY: 1, transformOrigin: '50% 0%' });
    gsap.set(root.current, { pointerEvents: 'auto' });
    gsap.set(label.current, { opacity: 1, y: 0 });
  }, []);

  useImperativeHandle(ref, () => ({
    cover(text) {
      return new Promise((resolve) => {
        if (REDUCED) return resolve();
        const el = root.current;
        label.current.querySelector('.pt__text').textContent = text || SITE.name;
        gsap.set(el, { pointerEvents: 'auto' });
        gsap.set(q(), { transformOrigin: '50% 100%' });
        gsap.timeline({ onComplete: resolve })
          .fromTo(q(), { scaleY: 0 }, { scaleY: 1, duration: 0.7, ease: 'expo.inOut', stagger: { each: 0.05, from: 'edges' } })
          .fromTo(label.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 0.25);
      });
    },
    reveal() {
      return new Promise((resolve) => {
        const el = root.current;
        if (REDUCED) { gsap.set(el, { pointerEvents: 'none' }); gsap.set(q(), { scaleY: 0 }); return resolve(); }
        gsap.set(q(), { transformOrigin: '50% 0%' });
        gsap.timeline({ onComplete: () => { gsap.set(el, { pointerEvents: 'none' }); resolve(); } })
          .to(label.current, { opacity: 0, y: -24, duration: 0.35, ease: 'power2.in' })
          .to(q(), { scaleY: 0, duration: 0.8, ease: 'expo.inOut', stagger: { each: 0.05, from: 'center' } }, 0.1);
      });
    },
  }));

  return (
    <div className="pt" ref={root} aria-hidden="true">
      <div className="pt__cols">
        {Array.from({ length: COLS }).map((_, i) => (
          <i key={i} ref={(n) => (cols.current[i] = n)} />
        ))}
      </div>
      <div className="pt__label" ref={label}>
        <Mark size={58} />
        <span className="pt__text">{SITE.name}</span>
      </div>
    </div>
  );
});

export default PageTransition;
