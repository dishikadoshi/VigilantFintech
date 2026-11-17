import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger, REDUCED, FINE, scrollVelocity } from '../lib/smooth';
import { Button, ConsultButton } from '../components/ui';
import { FINAL_CTA } from '../content/copy';
import './cta.css';

const MARQUEE_DRIFT = 40; // px/s idle drift of the outline marquee. Set 0 to move only when scrolling.

/* The FIRST LETTER of every headline word reacts to the cursor: the moment the pointer touches it, it is
   kicked up, overshoots, bounces and settles (under-damped spring). Everything else stays still. */
function useFirstLetters(headRef, panelRef) {
  useEffect(() => {
    if (REDUCED || !FINE) return undefined;
    const head = headRef.current; const panel = panelRef.current;
    const L = Array.from(head.querySelectorAll('.fl')).map((el, i) => ({ el, y: 0, v: 0, r: 0, vr: 0, in: false, dir: i % 2 ? 1 : -1, cx: 0, cy: 0, hw: 0, hh: 0 }));
    let px = -9999; let py = -9999; let near = false; let spd = 0; let lx = 0; let ly = 0;
    const onMove = (e) => { spd = Math.min(Math.hypot(e.clientX - lx, e.clientY - ly) / 30, 1); lx = px = e.clientX; ly = py = e.clientY; near = true; };
    const onLeave = () => { near = false; };
    panel.addEventListener('pointermove', onMove); panel.addEventListener('pointerleave', onLeave);
    const tick = (time, dtMs) => {
      const k = Math.min(dtMs, 40) / 16.67;
      const em = parseFloat(getComputedStyle(head).fontSize) || 48;
      spd *= Math.pow(0.9, k);
      L.forEach((c) => {
        if (near) {
          const r = c.el.getBoundingClientRect();
          const dx = Math.max(r.left - px, 0, px - r.right); const dy = Math.max(r.top - c.y - py, 0, py - (r.bottom - c.y));
          const hit = Math.hypot(dx, dy) < 14;
          if (hit && !c.in) { c.in = true; c.v -= em * (0.55 + spd * 0.5); c.vr += c.dir * (5 + spd * 6); }
          else if (!hit && Math.hypot(dx, dy) > 40) c.in = false;
        } else c.in = false;
        if (!c.y && !c.v && !c.r && !c.vr) return;
        c.v += -c.y * 0.2 * k; c.v *= Math.pow(0.82, k); c.y += c.v * k;
        c.vr += -c.r * 0.2 * k; c.vr *= Math.pow(0.82, k); c.r += c.vr * k;
        if (Math.abs(c.y) < 0.05 && Math.abs(c.v) < 0.05 && Math.abs(c.r) < 0.05 && Math.abs(c.vr) < 0.05) { c.y = c.v = c.r = c.vr = 0; c.el.style.transform = ''; return; }
        c.el.style.transform = `translate3d(0,${c.y.toFixed(2)}px,0) rotate(${c.r.toFixed(2)}deg)`;
      });
    };
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); panel.removeEventListener('pointermove', onMove); panel.removeEventListener('pointerleave', onLeave); };
  }, [headRef, panelRef]);
}

/* Outline marquee: slow idle drift plus scroll velocity (scroll faster = faster, scroll up = reverses). */
function OutlineMarquee({ items }) {
  const root = useRef(null);
  useLayoutEffect(() => {
    const el = root.current; const track = el.querySelector('.cta2__track');
    let w = 1; let x = 0; let visible = false;
    const measure = () => { w = track.scrollWidth / 2; };
    measure();
    const trig = ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onToggle: (s) => { visible = s.isActive; } });
    visible = trig.isActive;
    const tick = (time, dtMs) => {
      if (!visible) return;
      const v = REDUCED ? 0 : scrollVelocity.v;
      x -= Math.max(-900, Math.min(900, MARQUEE_DRIFT + v * 18)) * (dtMs / 1000);
      x = -(((-x) % w) + w) % w;
      track.style.transform = `translate3d(${x}px,0,0)`;
    };
    gsap.ticker.add(tick);
    const ro = new ResizeObserver(measure); ro.observe(el);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    return () => { ro.disconnect(); trig.kill(); gsap.ticker.remove(tick); };
  }, []);
  const group = (k) => <div className="cta2__group" key={k}>{items.map((t, i) => <span className={`cta2__item${i % 2 ? ' is-serif' : ''}`} key={t}>{t}<i /></span>)}</div>;
  return <div className="cta2__mq" ref={root} aria-hidden="true"><div className="cta2__track">{group('a')}{group('b')}{group('c')}{group('d')}</div></div>;
}

export default function Cta() {
  const root = useRef(null);
  const panel = useRef(null);
  const head = useRef(null);
  useFirstLetters(head, panel);

  useLayoutEffect(() => {
    if (REDUCED) return undefined;
    const ctx = gsap.context(() => {
      const once = (start) => ({ trigger: root.current, start, once: true });
      const small = window.innerWidth < 700;
      // extreme rotated zoom-out, scrubbed by scroll: starts huge and tilted, lands square at normal size
      gsap.fromTo(panel.current,
        { scale: small ? 2.1 : 3, rotate: small ? -10 : -18, borderRadius: 160, transformOrigin: '50% 50%' },
        { scale: 1, rotate: 0, borderRadius: small ? 26 : 36, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'top 18%', scrub: 0.35 } });
      gsap.fromTo('.cta2__h .wi', { yPercent: 118, rotate: 6 }, { yPercent: 0, rotate: 0, duration: 0.9, ease: 'expo.out', stagger: 0.05, delay: 0.15, scrollTrigger: once('top 42%'), onComplete: () => head.current && head.current.classList.add('is-live') });
      gsap.from('.cta2__label', { y: 18, opacity: 0, duration: 0.6, ease: 'expo.out', scrollTrigger: once('top 46%') });
      gsap.from('.cta2__lead', { y: 26, opacity: 0, duration: 0.8, ease: 'expo.out', delay: 0.35, scrollTrigger: once('top 40%') });
      gsap.from('.cta2__actions > *', { y: 28, opacity: 0, scale: 0.92, duration: 0.7, ease: 'back.out(1.6)', stagger: 0.1, delay: 0.5, scrollTrigger: once('top 40%') });
      gsap.from('.cta2__mq', { y: 40, opacity: 0, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: '.cta2__mq', start: 'top 98%', once: true } });
      // orbs drift as you scroll
      gsap.fromTo('.cta2__orb--a', { y: -50 }, { y: 70, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.3 } });
      gsap.fromTo('.cta2__orb--b', { y: 60 }, { y: -70, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.3 } });
      // orbs lean toward the cursor
      if (FINE) {
        const ax = gsap.quickTo('.cta2__orb--a', 'x', { duration: 0.5, ease: 'power3.out' }); const bx = gsap.quickTo('.cta2__orb--b', 'x', { duration: 0.5, ease: 'power3.out' });
        const move = (e) => { const r = panel.current.getBoundingClientRect(); const n = (e.clientX - r.left) / r.width - 0.5; ax(n * 90); bx(n * -110); };
        panel.current.addEventListener('pointermove', move);
      }
    }, root);
    return () => ctx.revert();
  }, []);

  const words = FINAL_CTA.headline.split(' ');
  return (
    <section className="cta2" ref={root}>
      <div className="cta2__panel" ref={panel}>
        <i className="cta2__orb cta2__orb--a" aria-hidden="true" />
        <i className="cta2__orb cta2__orb--b" aria-hidden="true" />
        <p className="cta2__label"><i />Ready when you are</p>
        <h2 className="cta2__h" ref={head} aria-label={FINAL_CTA.headline}>
          {words.map((w, i) => (
            <React.Fragment key={i}>
              <span className="w" aria-hidden="true"><span className={`wi${w === 'Growing' ? ' is-accent' : ''}`}><span className="fl">{w[0]}</span>{w.slice(1)}</span></span>{' '}
            </React.Fragment>
          ))}
        </h2>
        <p className="cta2__lead">{FINAL_CTA.text}</p>
        <div className="cta2__actions">
          <ConsultButton variant="teal">{FINAL_CTA.primary}</ConsultButton>
          <Button to="#contact" variant="white">{FINAL_CTA.secondary}</Button>
        </div>
      </div>
      <OutlineMarquee items={FINAL_CTA.brandMessage.replace(/\.$/, '').split('. ')} />
    </section>
  );
}
