import React, { useLayoutEffect, useRef } from 'react';
import { Link } from '../lib/router';
import { gsap, REDUCED, scrollToTop } from '../lib/smooth';
import Logo from './Logo';
import { Button, WhatsAppLabel } from './ui';
import { SITE, whatsappHref, NAV, CONSULT_TO } from '../config/site';
import { SERVICES } from '../content/services';
import { FOOTER } from '../content/copy';

const ICON = {
  mail: 'M3 6h18v12H3zM3 7l9 7 9-7',
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z',
  chat: 'M4 5h16v11H9l-5 4z',
  linkedin: 'M6 9v9M6 6v.01M10 18v-5a3 3 0 016 0v5M10 11v7',
  pin: 'M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11zM12 12a2 2 0 100-4 2 2 0 000 4z',
  up: 'M12 19V5M5 12l7-7 7 7',
};
const Ic = ({ d }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);

/**
 * Footer: closing call-to-action built from the tagline, a glass link board, contact pills,
 * a giant outlined wordmark, and a bottom bar. Everything is scrubbed by scroll position.
 */
export default function Footer() {
  const root = useRef(null);
  const wa = whatsappHref();
  const lines = SITE.tagline.split(/(?<=\.)\s+/);
  const chars = SITE.name.toUpperCase().split('');

  // Size the wordmark so the whole company name always fits the page width (never cropped).
  useLayoutEffect(() => {
    const el = root.current;
    const mark = el.querySelector('.foot__mark');
    const word = el.querySelector('.foot__word');
    const fit = () => {
      word.style.fontSize = '100px';
      const cs = getComputedStyle(mark);
      const avail = mark.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      word.style.fontSize = `${Math.floor((100 * avail / word.offsetWidth) * 10) / 10 * 0.99}px`;
    };
    fit();
    // only re-fit when the WIDTH changes, and do it on the next frame: resizing the text changes the
    // wordmark's height, which would otherwise re-trigger the observer in a loop
    let lastW = mark.clientWidth;
    let raf = 0;
    const ro = new ResizeObserver(() => {
      if (mark.clientWidth === lastW) return;
      lastW = mark.clientWidth;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(fit);
    });
    ro.observe(mark);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  useLayoutEffect(() => {
    if (REDUCED) return undefined;
    const ctx = gsap.context(() => {
      const el = root.current;
      const st = (trigger, start, end, scrub = 0.7) => ({ trigger, start, end, scrub });
      gsap.fromTo(el.querySelector('.foot__rule'), { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: st(el, 'top 95%', 'top 55%') });
      gsap.fromTo(el.querySelectorAll('.foot__line > span'), { yPercent: 115, rotate: 3 }, { yPercent: 0, rotate: 0, stagger: 0.2, ease: 'none', scrollTrigger: st('.foot__cta', 'top 92%', 'top 40%') });
      gsap.fromTo(el.querySelectorAll('.foot__actions > *'), { y: 34, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.2, ease: 'none', scrollTrigger: st('.foot__cta', 'top 70%', 'top 25%') });
      gsap.fromTo(el.querySelector('.foot__board'), { y: 80, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, ease: 'none', scrollTrigger: st('.foot__board', 'top 98%', 'top 62%') });
      gsap.fromTo(el.querySelectorAll('.fcol, .fbrand'), { y: 36, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.12, ease: 'none', scrollTrigger: st('.foot__board', 'top 88%', 'top 40%') });
      gsap.fromTo(el.querySelectorAll('.fpill'), { x: -30, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.12, ease: 'none', scrollTrigger: st('.foot__pills', 'top 98%', 'top 70%') });
      // company name: letters flip up one by one, then each fills with teal, all tied to scroll
      const ch = el.querySelectorAll('.foot__word .ch');
      gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: st('.foot__mark', 'top 100%', 'bottom 96%', 0.8) })
        .fromTo(ch, { yPercent: 115, rotateX: -80, opacity: 0, transformOrigin: '50% 100%' }, { yPercent: 0, rotateX: 0, opacity: 1, stagger: 0.05, duration: 0.5 }, 0)
        .fromTo(ch, { '--f': 0 }, { '--f': 1, stagger: 0.05, duration: 0.5 }, 0.35);
      gsap.fromTo(el.querySelector('.foot__orb--a'), { y: -80 }, { y: 120, ease: 'none', scrollTrigger: st(el, 'top bottom', 'bottom bottom', 0.5) });
      gsap.fromTo(el.querySelector('.foot__orb--b'), { y: 100 }, { y: -60, ease: 'none', scrollTrigger: st(el, 'top bottom', 'bottom bottom', 0.5) });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <footer className="foot" ref={root}>
      <i className="foot__orb foot__orb--a" aria-hidden="true" />
      <i className="foot__orb foot__orb--b" aria-hidden="true" />
      <i className="foot__rule" aria-hidden="true" />
      <div className="container">
        <div className="foot__cta">
          <h2 className="foot__big">
            {lines.map((l, i) => (
              <span className="foot__line" key={l}><span className={i === lines.length - 1 ? 'is-accent' : ''}>{l}</span></span>
            ))}
          </h2>
          <div className="foot__actions">
            <Button to={SITE.booking || CONSULT_TO} variant="teal">Book a Free Consultation</Button>
            {wa && <Button to={wa} variant="ghost"><WhatsAppLabel /></Button>}
          </div>
        </div>

        <div className="foot__board">
          <div className="fbrand">
            <span className="foot__logo"><Logo height={42} /></span>
            <p>{FOOTER.about}</p>
          </div>
          <nav className="fcol" aria-label="Quick links">
            <h3>Explore</h3>
            {NAV.map((n) => <Link key={n.to} to={n.to}>{n.label}</Link>)}
            <Link to="#faq">FAQ</Link>
          </nav>
          <nav className="fcol fcol--wide" aria-label="Services">
            <h3>Services</h3>
            <div className="fcol__2">
              {SERVICES.map((s) => <Link key={s.slug} to="#services">{s.short}</Link>)}
            </div>
          </nav>
          <nav className="fcol" aria-label="Legal">
            <h3>Legal</h3>
            {FOOTER.legal.map(([l, to]) => <Link key={to} to={to}>{l}</Link>)}
          </nav>
        </div>

        <ul className="foot__pills">
          {SITE.email && <li className="fpill"><a href={`mailto:${SITE.email}`}><Ic d={ICON.mail} /><span>{SITE.email}</span></a></li>}
          {SITE.phone && <li className="fpill"><a href={`tel:+91${SITE.phone}`}><Ic d={ICON.phone} /><span>{SITE.phoneDisplay}</span></a></li>}
          {wa && <li className="fpill"><a href={wa} target="_blank" rel="noopener noreferrer"><Ic d={ICON.chat} /><span>WhatsApp</span></a></li>}
          {SITE.linkedin && <li className="fpill"><a href={SITE.linkedin} target="_blank" rel="noopener noreferrer"><Ic d={ICON.linkedin} /><span>LinkedIn</span></a></li>}
          {SITE.address && <li className="fpill"><span className="fpill__t"><Ic d={ICON.pin} /><span>{SITE.address}</span></span></li>}
        </ul>
      </div>

      <div className="foot__mark" aria-hidden="true"><span className="foot__word">{chars.map((c, i) => <span key={i} className={`ch${c === ' ' ? ' ch--sp' : ''}`}>{c === ' ' ? '\u00a0' : c}</span>)}</span></div>

      <div className="container">
        <div className="foot__bar">
          <p>Copyright © {new Date().getFullYear()} {SITE.name}. All Rights Reserved.</p>
          <button type="button" className="foot__up" onClick={() => scrollToTop(false)} aria-label="Back to top"><span>Back to top</span><i><Ic d={ICON.up} /></i></button>
        </div>
      </div>
    </footer>
  );
}
