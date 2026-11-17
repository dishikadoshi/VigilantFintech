import React, { useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger, REDUCED } from '../lib/smooth';
import { Eyebrow } from '../components/ui';
import { INDUSTRIES } from '../content/copy';

/* Seven hand-drawn line illustrations. Every path has pathLength=1 so it can be "drawn" by scroll. */
const P = (props) => <path pathLength="1" className="dr" {...props} />;
const ART = [
  // startups — rocket on a launch trail
  () => (<g><P d="M100 24c22 18 30 46 24 82H76c-6-36 2-64 24-82z" /><circle className="dr" pathLength="1" cx="100" cy="64" r="10" /><P d="M76 106l-20 24 22-4zM124 106l20 24-22-4z" /><P d="M88 118c4 16 4 28 12 42 8-14 8-26 12-42" className="dr fl" /><P d="M40 150c20 10 28 28 28 40M160 150c-20 10-28 28-28 40" /><circle className="pop" cx="34" cy="60" r="3" /><circle className="pop" cx="168" cy="48" r="4" /><circle className="pop" cx="150" cy="90" r="2.5" /></g>),
  // e-commerce — cart with parcels
  () => (<g><P d="M26 46h24l16 82h82l14-58H60" /><circle className="dr" pathLength="1" cx="82" cy="152" r="9" /><circle className="dr" pathLength="1" cx="136" cy="152" r="9" /><P d="M84 70h28v30H84zM116 54h28v46h-28z" /><P d="M84 80h28M116 66h28" /><circle className="pop" cx="170" cy="40" r="4" /><circle className="pop" cx="40" cy="100" r="3" /></g>),
  // accounting — calculator / ledger with check
  () => (<g><P d="M58 26h84a8 8 0 018 8v132a8 8 0 01-8 8H58a8 8 0 01-8-8V34a8 8 0 018-8z" /><P d="M66 42h68v28H66z" /><P d="M70 92h8M96 92h8M122 92h8M70 116h8M96 116h8M122 116h8M70 140h8M96 140h8M122 140h8" /><P d="M72 58l8 8 20-20" className="dr ck" /><circle className="pop" cx="170" cy="70" r="4" /><circle className="pop" cx="32" cy="120" r="3" /></g>),
  // marketing — megaphone with signal and bars
  () => (<g><P d="M44 84l72-34v96L44 112z" /><P d="M44 84h-16v28h16M60 118l8 36h18l-8-30" /><P d="M132 76c12 10 12 40 0 50M146 62c20 18 20 62 0 80" /><P d="M160 164v-24M176 164v-44M192 164v-64" className="dr bars" /></g>),
  // coaches — person with speech bubble and stairs
  () => (<g><circle className="dr" pathLength="1" cx="76" cy="62" r="20" /><P d="M36 150c0-26 18-42 40-42s40 16 40 42" /><P d="M122 40h56a8 8 0 018 8v28a8 8 0 01-8 8h-34l-14 14v-14h-8a8 8 0 01-8-8V48a8 8 0 018-8z" /><P d="M136 56h40M136 68h24" /><P d="M120 170h22v-14h22v-14h22" /></g>),
  // SMB — shopfront
  () => (<g><P d="M30 82l12-40h116l12 40" /><P d="M30 82c0 12 12 14 18 6 6 8 18 8 24 0 6 8 18 8 24 0 6 8 18 8 24 0 6 8 18 8 24 0 6 8 18 6 18-6" /><P d="M42 96v70h116V96" /><P d="M60 166v-44h30v44M108 112h34v28h-34z" /><P d="M26 166h148" /></g>),
  // professional firms — briefcase with document and shield
  () => (<g><P d="M26 66h148a8 8 0 018 8v82a8 8 0 01-8 8H26a8 8 0 01-8-8V74a8 8 0 018-8z" /><P d="M72 66V50a8 8 0 018-8h40a8 8 0 018 8v16" /><P d="M18 104h164" /><P d="M90 98h20v14H90z" /><P d="M60 134h30M110 134h30M60 148h20" /><circle className="pop" cx="164" cy="34" r="4" /><circle className="pop" cx="36" cy="38" r="3" /></g>),
];

const N = INDUSTRIES.items.length;

/**
 * Horizontal film strip: the section pins and the seven industries slide past.
 * Each panel's own illustration draws itself as the panel arrives, then idles.
 */
export default function Industries() {
  const root = useRef(null);
  useLayoutEffect(() => {
    const el = root.current;
    const drawAll = () => {
      gsap.utils.toArray('.ipan', el).forEach((p) => {
        gsap.set(p.querySelectorAll('.dr'), { strokeDasharray: 1, strokeDashoffset: 1 });
        gsap.set(p.querySelectorAll('.pop'), { scale: 0, transformOrigin: '50% 50%' });
      });
    };
    if (REDUCED) { return undefined; }
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      drawAll();
      mm.add('(min-width: 900px)', () => {
        const track = el.querySelector('.itrack');
        const pin = el.querySelector('.ind__pin');
        const panels = gsap.utils.toArray('.ipan', el);
        const bar = el.querySelector('.ind__bar i');
        const cnt = el.querySelector('.ind__cnt b');
        const dist = () => track.scrollWidth - window.innerWidth + parseFloat(getComputedStyle(track).paddingLeft) * 0.4;
        const tween = gsap.to(track, {
          x: () => -dist(), ease: 'none',
          scrollTrigger: {
            trigger: pin, start: 'top top', end: () => `+=${dist() * 1.15}`, pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true,
            onUpdate: (self) => {
              bar.style.transform = `scaleX(${self.progress})`;
              cnt.textContent = String(Math.min(N, Math.round(self.progress * (N - 1)) + 1)).padStart(2, '0');
            },
          },
        });
        panels.forEach((p) => {
          const draws = p.querySelectorAll('.dr'), pops = p.querySelectorAll('.pop');
          const st = { trigger: p, containerAnimation: tween, start: 'left 78%', end: 'left 28%', scrub: true };
          gsap.to(draws, { strokeDashoffset: 0, stagger: 0.12, ease: 'none', scrollTrigger: st });
          gsap.to(pops, { scale: 1, stagger: 0.1, ease: 'back.out(3)', scrollTrigger: { ...st, end: 'left 20%' } });
          gsap.fromTo(p.querySelector('.ipan__media'), { x: 50 }, { x: -50, ease: 'none', scrollTrigger: { trigger: p, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
          gsap.fromTo(p.querySelector('.ipan__ghost'), { x: 120 }, { x: -120, ease: 'none', scrollTrigger: { trigger: p, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
          gsap.fromTo(p, { scale: 0.92, rotateY: 14, transformPerspective: 1400 }, { scale: 1, rotateY: 0, ease: 'none', scrollTrigger: { trigger: p, containerAnimation: tween, start: 'left 95%', end: 'left 40%', scrub: true } });
        });
      });
      mm.add('(max-width: 899px)', () => {
        gsap.utils.toArray('.ipan', el).forEach((p) => {
          gsap.to(p.querySelectorAll('.dr'), { strokeDashoffset: 0, stagger: 0.1, duration: 1.4, ease: 'power2.out', scrollTrigger: { trigger: p, start: 'top 80%', once: true } });
          gsap.to(p.querySelectorAll('.pop'), { scale: 1, stagger: 0.1, duration: 0.6, ease: 'back.out(3)', scrollTrigger: { trigger: p, start: 'top 75%', once: true } });
          gsap.from(p, { y: 60, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: p, start: 'top 90%', once: true } });
        });
      });
    }, root);
    return () => { mm.revert(); ctx.revert(); };
  }, []);

  return (
    <section className="ind" id="industries" ref={root}>
      <div className="ind__pin">
        <div className="container ind__head">
          <div>
            <Eyebrow>Industries</Eyebrow>
            <h2 className="h2" data-split style={{ visibility: 'hidden' }}>{INDUSTRIES.headline}</h2>
          </div>
          <p className="lead" data-reveal="up" data-delay="0.15">{INDUSTRIES.sub}</p>
        </div>
        <div className="itrack">
          {INDUSTRIES.items.map((it, i) => {
            const Art = ART[i % ART.length];
            return (
              <article key={it.title} className="ipan">
                <span className="ipan__ghost" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <div className="ipan__txt">
                  <span className="ipan__n">{String(i + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}</span>
                  <h3>{it.title}</h3>
                  <p>{it.text}</p>
                  <ul>{it.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
                </div>
                <div className="ipan__art">
                  <div className="ipan__media" aria-hidden="true">
                    <i className="ipan__disc" />
                    <svg viewBox="0 0 200 200" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><Art /></svg>
                    <img className="ipan__img" src={`/images/industries/${it.img}.jpg`} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  </div>
                  <span className="ipan__badge">{String(i + 1).padStart(2, '0')}</span>
                </div>
              </article>
            );
          })}
        </div>
        <div className="container ind__foot" aria-hidden="true">
          <span className="ind__cnt"><b>01</b> / {String(N).padStart(2, '0')}</span>
          <div className="ind__bar"><i /></div>
          <span className="ind__hint">Scroll</span>
        </div>
      </div>
    </section>
  );
}
