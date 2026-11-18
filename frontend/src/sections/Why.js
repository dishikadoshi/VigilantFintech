import React, { useLayoutEffect, useRef } from 'react';
import { gsap, REDUCED } from '../lib/smooth';
import { SectionHead } from '../components/ui';
import { WHY } from '../content/copy';

const ICONS = [
  'M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z M9 12l2 2 4-4',
  'M12 3v18M16.5 7.5c-.8-1.3-2.4-2-4.5-2-2.6 0-4 1.2-4 3s1.4 2.6 4 3 4 1.3 4 3-1.4 3-4 3c-2.2 0-3.8-.8-4.7-2.2',
  'M4 7h16M4 12h10M4 17h6M17 14l3 3-3 3',
  'M3 8l9-5 9 5-9 5zM3 13l9 5 9-5M3 18l9 5 9-5',
  'M4 5h16v11H9l-5 4zM8 10h8',
  'M3 17l6-6 4 4 8-9M15 6h6v6',
];

/**
 * All six reasons are visible at once on a 3D board. Scrolling pins the section:
 * cards fly in from different depths and angles, then the whole board tilts
 * and a light sweep highlights each reason in turn.
 */
export default function Why() {
  const root = useRef(null);
  useLayoutEffect(() => {
    if (REDUCED) return undefined;
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.wcard', root.current);
      const spots = gsap.utils.toArray('.wspot', root.current);
      // One builder for both layouts: desktop board (3 x 2) and phones (2 x 3 tiles + a spotlight panel).
      const build = (mobile) => {
        const pin = root.current.querySelector('.why__pin');
        const board = root.current.querySelector('.wboard');
        const LEN = mobile ? 2.8 : 3;
        gsap.set(board, { transformPerspective: 1600, transformOrigin: '50% 60%' });
        const from = (i) => (mobile
          ? { z: -260 - (i % 2) * 80, x: (i % 2 ? 1 : -1) * 70, y: (i < 2 ? -1 : i < 4 ? 0 : 1) * 90, rotateY: (i % 2 ? 1 : -1) * 28, rotateX: i < 2 ? -18 : i < 4 ? 0 : 18, opacity: 0, scale: 0.85 }
          : { z: -1400 - (i % 3) * 300, x: (i % 3 - 1) * 520, y: i < 3 ? -380 : 380, rotateY: (i % 3 - 1) * 70, rotateX: i < 3 ? -50 : 50, opacity: 0, scale: 0.7 });
        const setLit = (idx) => {
          cards.forEach((c, i) => c.classList.toggle('is-lit', i === idx));
          spots.forEach((c, i) => c.classList.toggle('is-on', i === idx));
        };
        if (mobile) setLit(0);
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: pin, start: 'top top', end: () => `+=${window.innerHeight * LEN}`, pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true,
            onUpdate: (self) => {
              const k = clamp01((self.progress - 0.5) / 0.5);
              // phones always spotlight a reason (the first from the start); desktop lights them one by one
              setLit(k > 0 ? Math.min(5, Math.floor(k * 6)) : (mobile ? 0 : -1));
            } },
        });
        const land = { z: 0, x: 0, y: 0, rotateY: 0, rotateX: 0, opacity: 1, scale: 1, duration: 0.7, ease: 'power3.out' };
        if (mobile) {
          // phones: the tiles land while the section scrolls into view (before it pins), so the stage is never empty
          const arrive = gsap.timeline({ defaults: { ease: 'none' },
            scrollTrigger: { trigger: root.current, start: 'top 88%', end: 'top 12%', scrub: 0.6, invalidateOnRefresh: true } });
          cards.forEach((c, i) => arrive.fromTo(c, from(i), land, i * 0.08));
          arrive.fromTo('.wspots', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.45);
        } else {
          cards.forEach((c, i) => tl.fromTo(c, from(i), land, i * 0.14));
        }
        tl.fromTo(board, { rotateY: mobile ? -8 : -14, rotateX: mobile ? 6 : 8 }, { rotateY: mobile ? 8 : 14, rotateX: mobile ? -3 : -4, duration: 2.2 }, 0.9)
          .to(board, { rotateY: 0, rotateX: 0, duration: 0.9, ease: 'power2.inOut' }, 3.1);
        tl.to({}, { duration: 0.6 });
        gsap.to('.why__ghost', { xPercent: -30, ease: 'none', scrollTrigger: { trigger: pin, start: 'top top', end: () => `+=${window.innerHeight * LEN}`, scrub: true } });
      };
      mm.add('(min-width: 900px)', () => build(false));
      mm.add('(max-width: 899px)', () => build(true));
    }, root);
    return () => { mm.revert(); ctx.revert(); };
  }, []);

  return (
    <section className="why" id="why" ref={root}>
      <div className="why__pin">
        <span className="why__ghost" aria-hidden="true">Support that scales · Support that scales ·</span>
        <div className="container why__top">
          <SectionHead eyebrow="Why choose us" title={WHY.headline} center />
        </div>
        <div className="container">
          <div className="wboard">
            {WHY.items.map(([t, d], i) => (
              <article className="wcard" key={t}>
                <span className="wcard__n">{String(i + 1).padStart(2, '0')}</span>
                <svg className="wcard__ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ICONS[i % ICONS.length]} /></svg>
                <h3>{t}</h3>
                <p>{d}</p>
                <i className="wcard__sweep" aria-hidden="true" />
              </article>
            ))}
          </div>
          {/* phones only: the reason currently lit on the board is explained here */}
          <div className="wspots" aria-hidden="true">
            {WHY.items.map(([t, d]) => (
              <div className="wspot" key={t}><h3>{t}</h3><p>{d}</p></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
const clamp01 = (x) => Math.min(1, Math.max(0, x));
