import React, { useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger, REDUCED } from '../lib/smooth';
import { splitTextNodes } from '../lib/motion';
import { sceneState } from '../three/sceneState';
import { Button, ConsultButton } from '../components/ui';
import { HERO, WHY } from '../content/copy';
import { SERVICES } from '../content/services';

const CHAPTERS = 5;

// mobile-only highlights for the "Meet the team" slide: [title, one-line note, icon paths]
const PTS = [
  [WHY.items[0][0], 'Multiple skills, one team', <><circle cx="9" cy="8" r="3.2" /><path d="M3 19c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" /><path d="M16 5.2a3.2 3.2 0 0 1 0 5.6M18 14c2 .6 3.4 2.3 3.4 5" /></>],
  [WHY.items[2][0], 'Scales with your workload', <><path d="M4 7h9M17 7h3M4 17h3M11 17h9" /><circle cx="15" cy="7" r="2" /><circle cx="9" cy="17" r="2" /></>],
  [WHY.items[4][0], 'Clear, regular updates', <><path d="M21 12a8 8 0 0 1-11.5 7.2L4 20.5l1.4-4.6A8 8 0 1 1 21 12z" /><path d="M8.5 11h7M8.5 14h4" /></>]
];

/** The pinned 3D scroll film. Five captioned chapters scrubbed against the WebGL scene. */
export default function Hero() {
  const root = useRef(null);

  useLayoutEffect(() => {
    if (REDUCED) { sceneState.progress = 0.62; return undefined; }
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      const el = root.current;
      const chapters = gsap.utils.toArray('.fc', el);
      const rail = gsap.utils.toArray('.rail__dot', el);
      const mobile = window.matchMedia('(max-width: 800px)').matches;

      const wordSets = chapters.map((c) => {
        const h = c.querySelector('[data-fsplit]');
        return h ? splitTextNodes(h, true) : [];
      });
      el.querySelectorAll('[data-fsplit]').forEach((h) => (h.style.visibility = 'visible'));

      const delay = window.__introDone ? 0.35 : 1.7;
      const heroBits = el.querySelectorAll('.fc--0 .fc__fade');
      gsap.set(wordSets[0], { yPercent: 120, rotate: 5 });
      gsap.set(heroBits, { opacity: 0, y: 36 });
      gsap.to(wordSets[0], { yPercent: 0, rotate: 0, duration: 1.4, ease: 'expo.out', stagger: 0.05, delay });
      gsap.to(heroBits, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.09, delay: delay + 0.3 });

      gsap.set(chapters.slice(1), { autoAlpha: 0 });
      wordSets.slice(1).forEach((w) => gsap.set(w, { yPercent: 120, rotate: 5 }));
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el, start: 'top top',
          end: () => `+=${window.innerHeight * (mobile ? 4.6 : 6)}`,
          pin: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: (self) => {
            sceneState.progress = self.progress;
            sceneState.filmVisible = true;
            const idx = Math.min(CHAPTERS - 1, Math.floor(self.progress * CHAPTERS + 0.0001));
            rail.forEach((d, i) => d.classList.toggle('is-on', i === idx));
          },
        },
      });
      for (let i = 0; i < CHAPTERS; i++) {
        const c = chapters[i];
        const bits = c.querySelectorAll('.fc__fade');
        if (i > 0) {
          tl.set(c, { autoAlpha: 1 }, i + 0.02)
            .to(wordSets[i], { yPercent: 0, rotate: 0, duration: 0.3, stagger: 0.02, ease: 'power3.out' }, i + 0.02)
            .fromTo(bits, { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 0.28, stagger: 0.04, ease: 'power3.out' }, i + 0.14);
        }
        if (i < CHAPTERS - 1) {
          tl.to(c, { autoAlpha: 0, y: -80, rotateX: 16, transformPerspective: 900, duration: 0.2, ease: 'power2.in' }, i + 0.8)
            .set(c, { y: 0, rotateX: 0 }, i + 1.01);
        }
      }
      tl.to({}, { duration: 0.001 }, CHAPTERS);

      ScrollTrigger.create({
        trigger: document.querySelector('.after-film'), start: 'top top',
        onEnter: () => { sceneState.filmVisible = false; },
        onLeaveBack: () => { sceneState.filmVisible = true; },
      });
      gsap.to('.film__cue', { opacity: 0, scrollTrigger: { trigger: el, start: 'top top', end: '+=160', scrub: true } });
    }, root);
    return () => { mm.revert(); ctx.revert(); };
  }, []);

  return (
    <section className="hero" id="home" aria-label="Introduction">
      <div className="film" ref={root}>
        <div className="film__bg" aria-hidden="true" />
        <div className="fc fc--0">
          <div className="container fc__in">
            <p className="eyebrow fc__fade"><i />{HERO.label}</p>
            <h1 className="h1" data-fsplit style={{ visibility: 'hidden' }}>
              {HERO.headline[0]} <em>{HERO.headline[1]}</em>
            </h1>
            <p className="lead fc__fade">{HERO.sub}</p>
            <div className="fc__actions fc__fade">
              <ConsultButton>Book a Free Consultation</ConsultButton>
              <Button to="#services" variant="ghost">Explore Our Services</Button>
            </div>
            <p className="fc__support fc__fade">{HERO.support}</p>
          </div>
        </div>

        <div className="fc fc--1">
          <div className="container fc__in fc__in--center">
            <p className="eyebrow fc__fade"><i />Sound familiar?</p>
            <h2 className="hh" data-fsplit style={{ visibility: 'hidden' }}>Running a business requires time, attention and the right people.</h2>
            <p className="lead fc__fade">Managing everything yourself can slow down your growth.</p>
          </div>
        </div>

        <div className="fc fc--2">
          <div className="container fc__in fc__in--center">
            <p className="eyebrow fc__fade"><i />Meet the team</p>
            <h2 className="hh" data-fsplit style={{ visibility: 'hidden' }}>More Than Virtual Assistance. A Complete Business Support Team.</h2>
            <ul className="fc__m fc__pts fc__fade">
              {PTS.map(([t, d, icon]) => (
                <li key={t}>
                  <i><svg viewBox="0 0 24 24" aria-hidden="true">{icon}</svg></i>
                  <div><b>{t}</b><span>{d}</span></div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="fc fc--3">
          <div className="container fc__in fc__in--center">
            <p className="eyebrow fc__fade"><i />One company</p>
            <h2 className="hh" data-fsplit style={{ visibility: 'hidden' }}>One team. Multiple skills. Endless possibilities.</h2>
            <ul className="fc__m fc__pills fc__fade">
              {SERVICES.map((s) => <li key={s.slug}><b>{s.n}</b>{s.short}</li>)}
            </ul>
          </div>
        </div>

        <div className="fc fc--4">
          <div className="container fc__in fc__in--center">
            <p className="eyebrow fc__fade"><i />Your next chapter</p>
            <h2 className="hh" data-fsplit style={{ visibility: 'hidden' }}>Focus on growing your business while we take care of the work behind it.</h2>
            <div className="fc__actions fc__fade">
              <Button to="#services">Explore Our Services</Button>
              <ConsultButton variant="ghost">Book a Free Consultation</ConsultButton>
            </div>
            <p className="fc__m fc__note fc__fade">Free and no-obligation consultation</p>
          </div>
        </div>

        <ol className="rail" aria-hidden="true">
          {Array.from({ length: CHAPTERS }).map((_, i) => (
            <li key={i} className={`rail__dot${i === 0 ? ' is-on' : ''}`}><span>{String(i + 1).padStart(2, '0')}</span></li>
          ))}
        </ol>
        <div className="film__cue" aria-hidden="true"><span>Scroll</span><i /></div>
      </div>
    </section>
  );
}
