
import React, { useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger, REDUCED } from '../lib/smooth';
import { Button, Eyebrow } from '../components/ui';
import { useRouter } from '../lib/router';
import { setPrefill } from '../lib/store';
import { PRICING } from '../content/copy';

const ICONS = [
  'M3 12l18-8-7 18-3-7z',
  'M4 8h16v11H4zM9 8V5h6v3M4 13h16',
  'M8 11a3 3 0 100-6 3 3 0 000 6zM16 11a3 3 0 100-6 3 3 0 000 6zM2 20c0-3 3-5 6-5s6 2 6 5M14 15c3 0 8 1 8 5',
];

/** Pricing. Desktop: a pinned stage. The whole intro text rushes in from far away (extreme zoom-in) on its own as soon as
 *  the block arrives, holds, then (driven by scroll) shrinks away into the distance (zoom-out) while the three plan cards emerge from deep space one by one
 *  and their checklists build. Everything is scrubbed by scroll, so it reverses on the way back up.
 *  Phones/tablets: normal flow with lighter scrubbed zoom + rise. */
export default function Pricing() {
  const root = useRef(null);
  const { navigate } = useRouter();

  useLayoutEffect(() => {
    if (REDUCED) return undefined;

    const mm = gsap.matchMedia();

    const ctx = gsap.context(() => {
      const el = root.current;
      const cards = gsap.utils.toArray('.plan', el);
      const intro = el.querySelector('.price__intro');
      const eyebrow = intro.querySelector('.eyebrow');
      const title = intro.querySelector('.h2');
      const lead = intro.querySelector('.lead');
      const wrap = el.querySelector('.price__cards');
      const note = el.querySelector('.price__note');

      const buildContent = (c, tl, at) => {
        tl.fromTo(
          c.querySelector('.plan__rule'),
          { scaleX: 0 },
          { scaleX: 1, transformOrigin: '0 50%', duration: 0.5 },
          at
        )
          .fromTo(
            c.querySelectorAll('.plan__top > *, h3, .plan__for'),
            { y: 26, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.07, duration: 0.4 },
            at
          )
          .fromTo(
            c.querySelectorAll('li'),
            { x: -26, opacity: 0 },
            { x: 0, opacity: 1, stagger: 0.09, duration: 0.4 },
            at + 0.2
          )
          .fromTo(
            c.querySelectorAll('li svg'),
            { scale: 0 },
            { scale: 1, stagger: 0.09, duration: 0.3 },
            at + 0.3
          )
          .fromTo(
            c.querySelector('.btn'),
            { y: 24, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.3 },
            at + 0.7
          );
      };

      mm.add('(min-width: 900px)', () => {
        el.classList.add('is-pinned');

        const pin = el.querySelector('.price__pin');

        const fit = () =>
          Math.min(1, (window.innerHeight - 70) / wrap.offsetHeight);

        // Intro animation
        const introTl = gsap.timeline({
          paused: true,
          defaults: { ease: 'expo.out' }
        });

        introTl
          .fromTo(
            eyebrow,
            { scale: 0.3, opacity: 0, filter: 'blur(14px)' },
            { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1.3 },
            0
          )
          .fromTo(
            title,
            { scale: 0.06, opacity: 0, filter: 'blur(22px)' },
            { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1.7 },
            0
          )
          .fromTo(
            lead,
            { scale: 0.03, opacity: 0, filter: 'blur(20px)' },
            { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1.7 },
            0.15
          );

        const trig = ScrollTrigger.create({
          trigger: pin,
          start: 'top 40%',
          end: 'max',
          onEnter: () => {
            introTl.timeScale(1).play();
          },
          onLeaveBack: () => {
            introTl.timeScale(1.6).reverse();
          },
        });

        if (trig.isActive || trig.progress > 0) {
          introTl.progress(1);
        }

        // Scroll-driven animation
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: pin,
            start: 'top top',
            end: () => `+=${window.innerHeight * 3.8}`,
            pin: true,
            scrub: 0.9,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (self.progress > 0.01 && introTl.progress() < 1) {
                introTl.progress(1);
              }
            },
          },
        });

        const R = { immediateRender: false };

        // FIX: Lower the complete pricing card group by 42px
        // to prevent it from overlapping the fixed navbar.
        tl.set(
          wrap,
          {
            scale: () => fit(),
            y: 42,
            transformOrigin: '50% 50%'
          },
          0
        );

        tl.fromTo(
          intro,
          { scale: 1 },
          { scale: 1.06, duration: 0.5, ...R },
          0
        )
          .fromTo(
            title,
            { scale: 1, opacity: 1, filter: 'blur(0px)' },
            {
              scale: 0.04,
              opacity: 0,
              filter: 'blur(26px)',
              ease: 'power3.in',
              duration: 1,
              ...R
            },
            0.7
          )
          .fromTo(
            eyebrow,
            { scale: 1, opacity: 1, filter: 'blur(0px)' },
            {
              scale: 0.2,
              opacity: 0,
              filter: 'blur(16px)',
              ease: 'power3.in',
              duration: 0.9,
              ...R
            },
            0.7
          )
          .fromTo(
            lead,
            { scale: 1, opacity: 1, filter: 'blur(0px)' },
            {
              scale: 0.02,
              opacity: 0,
              filter: 'blur(26px)',
              ease: 'power3.in',
              duration: 0.9,
              ...R
            },
            0.8
          );

        // Cards emerge from deep space
        const from = [
          { x: -380, y: 60, rotateY: 40 },
          { x: 0, y: 220, rotateY: 0 },
          { x: 380, y: 60, rotateY: -40 }
        ];

        [0, 2, 1].forEach((i, k) => {
          const at = 1.2 + k * 0.4;

          tl.fromTo(
            cards[i],
            {
              ...from[i],
              z: -1100,
              scale: 0.25,
              autoAlpha: 0,
              transformPerspective: 1400
            },
            {
              x: 0,
              y: 0,
              z: 0,
              scale: 1,
              rotateY: 0,
              autoAlpha: 1,
              ease: 'power3.out',
              duration: 1.1
            },
            at
          );

          tl.fromTo(
            cards[i].querySelector('.plan__ic'),
            { rotate: -120 },
            { rotate: 0, ease: 'power3.out', duration: 1.1 },
            at
          );

          buildContent(cards[i], tl, at + 0.7);
        });

        tl.fromTo(
          '.plan--feat .plan__glow',
          { opacity: 0.1 },
          { opacity: 1, duration: 1.2 },
          2.4
        )
          .fromTo(
            note,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5 },
            3.0
          )
          .to({}, { duration: 0.6 }, 3.5);

        return () => {
          el.classList.remove('is-pinned');
        };
      });

      // Mobile and tablet layout
      mm.add('(max-width: 899px)', () => {
        gsap.fromTo(
          intro,
          { scale: 0.5, opacity: 0, filter: 'blur(10px)' },
          {
            scale: 1,
            opacity: 1,
            filter: 'blur(0px)',
            ease: 'none',
            scrollTrigger: {
              trigger: intro,
              start: 'top 98%',
              end: 'top 50%',
              scrub: 0.6
            }
          }
        );

        cards.forEach((c) => {
          gsap.fromTo(
            c,
            { y: 90, scale: 0.85, opacity: 0 },
            {
              y: 0,
              scale: 1,
              opacity: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: c,
                start: 'top 98%',
                end: 'top 65%',
                scrub: 0.6
              }
            }
          );

          const tl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: c,
              start: 'top 72%',
              end: 'top 22%',
              scrub: 0.8
            }
          });

          buildContent(c, tl, 0);
        });

        gsap.fromTo(
          note,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: note,
              start: 'top 98%',
              end: 'top 70%',
              scrub: 0.6
            }
          }
        );
      });
    }, root);

    return () => {
      mm.revert();
      ctx.revert();
    };
  }, []);

  const pick = (p) => {
    setPrefill({
      service: null,
      message: `I'm interested in the ${p.name} plan.`
    });

    navigate('#contact');
  };

  return (
    <section className="price" id="pricing" ref={root}>
      <div className="price__pin">
        <div className="container price__stage">
          <div className="price__intro">
            <Eyebrow>Pricing</Eyebrow>
            <h2 className="h2">{PRICING.headline}</h2>
            <p className="lead">{PRICING.sub}</p>
          </div>

          <div className="price__cards">
            <div className="plans">
              {PRICING.plans.map((p, i) => (
                <article
                  key={p.id}
                  className={`plan${p.featured ? ' plan--feat' : ''}`}
                  data-tilt="5"
                >
                  <i className="plan__glow" aria-hidden="true" />

                  <header className="plan__top">
                    <span className="plan__ic">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d={ICONS[i % ICONS.length]} />
                      </svg>
                    </span>

                    <span className="plan__tier">
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    {p.featured && (
                      <span className="plan__tag">
                        Most requested
                      </span>
                    )}
                  </header>

                  <h3>{p.name}</h3>
                  <p className="plan__for">{p.for}</p>

                  <span className="plan__rule" aria-hidden="true" />

                  <ul>
                    {p.items.map((it) => (
                      <li key={it}>
                        <svg viewBox="0 0 20 20" aria-hidden="true">
                          <path d="M4.5 10.5l3.5 3.5 7.5-8" />
                        </svg>
                        {it}
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={p.featured ? 'white' : 'teal'}
                    onClick={() => pick(p)}
                  >
                    {p.cta}
                  </Button>
                </article>
              ))}
            </div>

            <p className="price__note">{PRICING.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
