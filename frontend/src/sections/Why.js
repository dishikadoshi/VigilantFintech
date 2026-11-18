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

const Icon = ({ i, className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ICONS[i % ICONS.length]} /></svg>
);

/**
 * Desktop (>= 900px): all six reasons on a pinned 3D board. Cards fly in, the board tilts and a
 * light sweep highlights each reason in turn.
 * Phones: stacked cards (.wlist) that slide in from alternating sides as you scroll and slide back out as they leave.
 */
export default function Why() {
  const root = useRef(null);
  useLayoutEffect(() => {
    if (REDUCED) return undefined;
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      mm.add('(min-width: 900px)', () => {
        const cards = gsap.utils.toArray('.wcard', root.current);
        const pin = root.current.querySelector('.why__pin');
        const board = root.current.querySelector('.wboard');
        const LEN = 3;
        gsap.set(board, { transformPerspective: 1600, transformOrigin: '50% 60%' });
        const from = (i) => ({ z: -1400 - (i % 3) * 300, x: (i % 3 - 1) * 520, y: i < 3 ? -380 : 380, rotateY: (i % 3 - 1) * 70, rotateX: i < 3 ? -50 : 50, opacity: 0, scale: 0.7 });
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: pin, start: 'top top', end: () => `+=${window.innerHeight * LEN}`, pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true,
            onUpdate: (self) => {
              const k = clamp01((self.progress - 0.5) / 0.5);
              const idx = k > 0 ? Math.min(5, Math.floor(k * 6)) : -1;
              cards.forEach((c, i) => c.classList.toggle('is-lit', i === idx));
            } },
        });
        cards.forEach((c, i) => {
          tl.fromTo(c, from(i), { z: 0, x: 0, y: 0, rotateY: 0, rotateX: 0, opacity: 1, scale: 1, duration: 0.7, ease: 'power3.out' }, i * 0.14);
        });
        tl.fromTo(board, { rotateY: -14, rotateX: 8 }, { rotateY: 14, rotateX: -4, duration: 2.2 }, 0.9)
          .to(board, { rotateY: 0, rotateX: 0, duration: 0.9, ease: 'power2.inOut' }, 3.1);
        tl.to({}, { duration: 0.6 });
        gsap.to('.why__ghost', { xPercent: -30, ease: 'none', scrollTrigger: { trigger: pin, start: 'top top', end: () => `+=${window.innerHeight * LEN}`, scrub: true } });
      });

      mm.add('(max-width: 899px)', () => {
        // Phones: stacked cards that slide in from alternating sides, hold, then slide out the other way.
        const items = gsap.utils.toArray('.witem', root.current);
        items.forEach((it, i) => {
          const dir = i % 2 ? 1 : -1; // odd cards come from the right, even from the left
          const tl = gsap.timeline({ defaults: { ease: 'none' },
            scrollTrigger: { trigger: it, start: 'top 98%', end: 'bottom 2%', scrub: 0.5,
              toggleClass: { targets: it, className: 'is-active' } } });
          tl.fromTo(it, { x: dir * 130, opacity: 0, rotate: dir * 2 }, { x: 0, opacity: 1, rotate: 0, duration: 0.3, ease: 'power3.out' }, 0)
            .fromTo(it.querySelector('.witem__ic'), { scale: 0.4, rotate: dir * -40 }, { scale: 1, rotate: 0, duration: 0.25, ease: 'back.out(2)' }, 0.1)
            .to(it, { x: -dir * 130, opacity: 0, rotate: -dir * 2, duration: 0.25, ease: 'power3.in' }, 0.75);
        });
      });
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
          {/* desktop */}
          <div className="wboard">
            {WHY.items.map(([t, d], i) => (
              <article className="wcard" key={t}>
                <span className="wcard__n">{String(i + 1).padStart(2, '0')}</span>
                <Icon i={i} className="wcard__ic" />
                <h3>{t}</h3>
                <p>{d}</p>
                <i className="wcard__sweep" aria-hidden="true" />
              </article>
            ))}
          </div>
          {/* phones */}
          <div className="wlist">
            {WHY.items.map(([t, d], i) => (
              <article className="witem" key={t}>
                <span className="witem__n">{String(i + 1).padStart(2, '0')}</span>
                <span className="witem__ic"><Icon i={i} /></span>
                <h3>{t}</h3>
                <p>{d}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
const clamp01 = (x) => Math.min(1, Math.max(0, x));
