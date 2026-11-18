import React, { useLayoutEffect, useRef } from 'react';
import { gsap, REDUCED } from '../lib/smooth';
import { Button, Eyebrow } from '../components/ui';
import { setPrefill } from '../lib/store';
import { SERVICES } from '../content/services';
import { SERVICES_INTRO } from '../content/copy';
import { useRouter } from '../lib/router';

const ICONS = [
  'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4', 'M4 5h16v11H9l-5 4z', 'M3 17l6-6 4 4 8-9M15 6h6v6', 'M4 20l4-1 11-11-3-3L5 16zM14 6l3 3',
  'M3 5h18v14H3zM3 9h18M7 7h.01', 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5', 'M5 3h14v18H5zM9 8h6M9 12h6M9 16h3',
];
const N = SERVICES.length;
const DIAL = 2 * Math.PI * 52;

/**
 * Pinned deck. Left: a service "odometer" (digits and names roll like a dial) with a
 * circular progress gauge. Right: a stack of slim cards that tip forward and fly away.
 * Phones get the exact same animation: header + odometer on top, the card stack below.
 */
export default function Services() {
  const root = useRef(null);
  const { navigate } = useRouter();

  useLayoutEffect(() => {
    if (REDUCED) return undefined;
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      // Same pinned, scrubbed deck on desktop AND phones (layout differs in CSS only).
      mm.add('(min-width: 1px)', () => {
        const el = root.current;
        const pin = el.querySelector('.svc__pin');
        const cards = gsap.utils.toArray('.dcard', el);
        const numCol = el.querySelector('.odo__num .odo__col');
        const nameCol = el.querySelector('.odo__name .odo__col');
        const arc = el.querySelector('.odo__arc');
        const ticks = el.querySelector('.odo__ticks');
        const dots = gsap.utils.toArray('.odo__dots i', el);
        const depth = (j) => ({ y: j * 26, z: -j * 90, scale: 1 - j * 0.045, opacity: j > 2 ? 0 : 1, rotateX: 0, rotateZ: 0 });
        cards.forEach((c, j) => gsap.set(c, { ...depth(j), transformPerspective: 1600 }));
        let last = -1;
        const tl = gsap.timeline({
          defaults: { ease: 'power2.inOut' },
          scrollTrigger: {
            trigger: pin, start: 'top top', end: () => `+=${N * window.innerHeight * 0.75}`, pin: true, scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true,
            onUpdate: (self) => {
              const idx = Math.min(N - 1, Math.floor(self.progress * N * 0.999));
              if (idx !== last) {
                last = idx;
                numCol.style.transform = `translateY(${-idx * 100 / N}%)`;
                nameCol.style.transform = `translateY(${-idx * 100 / N}%)`;
                dots.forEach((d, i) => d.classList.toggle('is-on', i <= idx));
              }
              arc.style.strokeDashoffset = String(DIAL * (1 - self.progress));
              ticks.style.transform = `rotate(${self.progress * 360}deg)`;
            },
          },
        });
        for (let i = 0; i < N; i++) {
          tl.to(cards[i], { y: () => -window.innerHeight * 0.95, rotateX: 38, rotateZ: i % 2 ? 7 : -7, opacity: 0, z: 240, duration: 1 }, i);
          for (let j = i + 1; j < cards.length; j++) tl.to(cards[j], { ...depth(j - i - 1), duration: 1 }, i);
        }
        tl.to({}, { duration: 0.6 }, N);
      });
    }, root);
    return () => { mm.revert(); ctx.revert(); };
  }, []);

  const request = (s) => { setPrefill({ service: s.formLabel, message: '' }); navigate('#contact'); };

  return (
    <section className="svc" id="services" ref={root}>
      <div className="svc__pin">
        <div className="container svc__in">
          <div className="svc__left">
            <Eyebrow>What we do</Eyebrow>
            <h2 className="h2" data-split style={{ visibility: 'hidden' }}>{SERVICES_INTRO.headline}</h2>
            <p className="lead" data-reveal="up" data-delay="0.15">{SERVICES_INTRO.sub}</p>

            <div className="odo" aria-hidden="true">
              <div className="odo__gauge">
                <svg viewBox="0 0 120 120">
                  <circle className="odo__track" cx="60" cy="60" r="52" />
                  <circle className="odo__arc" cx="60" cy="60" r="52" strokeDasharray={DIAL} strokeDashoffset={DIAL} transform="rotate(-90 60 60)" />
                  <g className="odo__ticks">
                    {Array.from({ length: 36 }).map((_, i) => <line key={i} x1="60" y1="3" x2="60" y2={i % 3 ? 6 : 10} transform={`rotate(${i * 10} 60 60)`} />)}
                  </g>
                </svg>
                <div className="odo__num"><div className="odo__col">{SERVICES.map((s) => <span key={s.n}>{s.n}</span>)}</div></div>
              </div>
              <div className="odo__txt">
                <div className="odo__name"><div className="odo__col">{SERVICES.map((s) => <span key={s.slug}>{s.short}</span>)}</div></div>
                <div className="odo__dots">{SERVICES.map((s, i) => <i key={s.slug} className={i === 0 ? 'is-on' : ''} />)}</div>
              </div>
            </div>
          </div>

          <div className="deck">
            {SERVICES.map((s, i) => (
              <article className="dcard" key={s.slug}>
                <aside className="dcard__rail">
                  <span className="dcard__n">{s.n}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ICONS[i % ICONS.length]} /></svg>
                </aside>
                <div className="dcard__body">
                  <h3>{s.title}</h3>
                  <p className="dcard__d">{s.blurb}</p>
                  <ul className="dcard__l">
                    {s.items.map((it) => <li key={it}>{it}</li>)}
                  </ul>
                  <Button variant="teal" className="btn--sm" onClick={() => request(s)}>Request this service</Button>
                </div>
              </article>
            ))}
            <article className="dcard dcard--cta">
              <aside className="dcard__rail">
                <span className="dcard__n">+</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4zM8 9.5h8M8 12.5h5" /></svg>
              </aside>
              <div className="dcard__body">
                <i className="dcard__rings" aria-hidden="true" />
                <h3>{SERVICES_INTRO.cta}</h3>
                <Button variant="navy" onClick={() => { setPrefill({ service: null, message: '' }); navigate('#contact'); }}>Start a conversation</Button>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
