import React, { useLayoutEffect, useRef } from 'react';
import { gsap, REDUCED } from '../lib/smooth';
import { Eyebrow } from '../components/ui';
import { STEPS } from '../content/copy';

const N = STEPS.items.length;
const SHORT = ['Brief', 'Review', 'Plan', 'Onboard', 'Grow'];

/**
 * Pinned "layer stack": five glass plates start collapsed, fan apart in 3D as you scroll,
 * and the plate for the current step lifts and glows while the step list on the right
 * lights up and its spine fills. Scroll back and everything folds shut again.
 */
export default function How() {
  const root = useRef(null);
  useLayoutEffect(() => {
    if (REDUCED) return undefined;
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      // One builder for both layouts: desktop (side by side) and phones (stack on top, stepper below).
      const build = (mobile) => {
        const el = root.current;
        const plates = gsap.utils.toArray('.hplate', el);
        const steps = gsap.utils.toArray('.hstep', el);
        const fill = el.querySelector('.hsteps__fill');
        const stack = el.querySelector('.hstack');
        const GAP = mobile ? 40 : 52;
        const Y0 = mobile ? 24 : 70;
        const Y1 = mobile ? 22 : 76;
        const LEN = mobile ? 3.2 : 3.4;
        gsap.set(stack, { transformPerspective: 1400, rotateX: 60, rotateZ: mobile ? -8 : -14, y: Y0, scale: mobile ? 0.95 : 0.9 });
        plates.forEach((p, i) => gsap.set(p, { z: i * 6, y: (mobile ? 18 : 30) + (N - i) * (mobile ? 10 : 16), opacity: 0 }));
        let last = -2;
        const setActive = (idx) => {
          if (idx === last) return; last = idx;
          steps.forEach((s, i) => { s.classList.toggle('is-on', i === idx); s.classList.toggle('is-done', i < idx); });
          plates.forEach((p, i) => p.classList.toggle('is-on', i === idx));
        };
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: el.querySelector('.how__pin'), start: 'top top', end: () => `+=${window.innerHeight * LEN}`, pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true,
            onUpdate: (self) => {
              const idx = Math.min(N - 1, Math.max(0, Math.floor((self.progress - 0.14) / 0.86 * N)));
              // phones always show a step's text, so the first one is active from the start
              setActive(self.progress < 0.1 ? (mobile ? 0 : -1) : idx);
              const f = clamp((self.progress - 0.1) / 0.9);
              fill.style.transform = mobile ? `scaleX(${f})` : `scaleY(${f})`;
            },
          },
        });
        // 0 → 1: plates arrive and fan apart
        plates.forEach((p, i) => tl.to(p, { opacity: 1, y: 0, z: i * GAP, duration: 1, ease: 'power3.out' }, i * 0.1));
        // the stack settles upright (no diagonal), then breathes slowly while the steps run
        tl.to(stack, { rotateZ: 0, rotateX: 58, scale: 1, duration: 1.1, ease: 'power2.out' }, 0);
        tl.to(stack, { rotateZ: 3, y: Y1, duration: 4 }, 1.2);
        tl.to({}, { duration: 0.4 });
        if (!mobile) {
          gsap.fromTo('.how__ghost', { xPercent: 10 }, { xPercent: -40, ease: 'none', scrollTrigger: { trigger: el.querySelector('.how__pin'), start: 'top top', end: () => `+=${window.innerHeight * LEN}`, scrub: true } });
        }
      };
      mm.add('(min-width: 900px)', () => build(false));
      mm.add('(max-width: 899px)', () => build(true));
    }, root);
    return () => { mm.revert(); ctx.revert(); };
  }, []);

  return (
    <section className="how" id="how" ref={root}>
      <div className="how__pin">
        <span className="how__ghost" aria-hidden="true">How it works · How it works ·</span>
        <div className="container how__in">
          <div className="how__left">
            <Eyebrow>How it works</Eyebrow>
            <h2 className="h2" data-split style={{ visibility: 'hidden' }}>{STEPS.headline}</h2>
            <p className="lead" data-reveal="up" data-delay="0.15">Tell us what you need. We shape a plan around it and get to work.</p>
            <div className="hstack" aria-hidden="true">
              {STEPS.items.map((_, i) => (
                <div className="hplate" key={i}><small>Step {i + 1}</small><b>{SHORT[i]}</b></div>
              ))}
            </div>
          </div>
          <ol className="hsteps">
            <div className="hsteps__spine" aria-hidden="true"><i className="hsteps__fill" /></div>
            {STEPS.items.map(([t, d], i) => (
              <li className="hstep" key={t}>
                <span className="hstep__node">{i + 1}</span>
                <div><h3>{t}</h3><p>{d}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
const clamp = (x) => Math.min(1, Math.max(0, x));
