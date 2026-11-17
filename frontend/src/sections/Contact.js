
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, REDUCED } from '../lib/smooth';
import { Eyebrow, Button, WhatsAppButton } from '../components/ui';
import { onPrefill, prefill } from '../lib/store';
import { FORM_SERVICES } from '../content/services';
import { CONTACT } from '../content/copy';
import { SITE, API_BASE } from '../config/site';
import './contact.css';

const Ico = ({ children }) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>;
const IcoClock = () => <Ico><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Ico>;
const IcoChat = () => <Ico><path d="M21 12a8 8 0 0 1-11.5 7.2L4 20.5l1.4-4.6A8 8 0 1 1 21 12z" /><path d="M8.5 11h7M8.5 14h4" /></Ico>;
const IcoPhone = () => <Ico><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></Ico>;
const IcoMail = () => <Ico><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M4 7l8 6 8-6" /></Ico>;
const IcoPin = () => <Ico><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z" /><circle cx="12" cy="10" r="2.4" /></Ico>;
const IcoSend = () => <Ico><path d="M21 3L10 14" /><path d="M21 3l-7 18-4-7-7-4 18-7z" /></Ico>;
const IcoCheck = () => <Ico><path d="M5 12.5l4.5 4.5L19 7.5" /></Ico>;

const STEPS = [
  ['Share your needs', 'Tell us what you want off your plate.'],
  ['We review & reply', 'A real person reads every inquiry.'],
  ['Free consultation', 'We map out how our team can help.']
];

const OTHER = 'Other';
const empty = {
  name: '',
  company: '',
  email: '',
  phone: '',
  workload: '',
  message: ''
};

// Desktop uses a pinned, two-stage contact animation.
// When the Contact nav item is clicked, land near the end
// of that sequence so the form is visible.
// On mobile (and with reduced motion) there is no pinned
// sequence; smooth.js scrolls directly to the form card.
const contactLandingOffset = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(min-width: 900px)').matches &&
  !REDUCED
    ? '1.9'
    : undefined;

export default function Contact() {
  const [f, setF] = useState(empty);
  const [svc, setSvc] = useState('');
  const [other, setOther] = useState('');
  const [status, setStatus] = useState('idle');
  const [err, setErr] = useState('');

  const set = (k) => (e) =>
    setF((x) => ({ ...x, [k]: e.target.value }));

  const root = useRef(null);

  // Left text plays in by itself on arrival.
  // The next scroll brings the form in from the right.
  // Desktop is pinned + scrubbed; phones reveal each part
  // as it scrolls into view.
  useLayoutEffect(() => {
    if (REDUCED) return undefined;

    const mm = gsap.matchMedia();

    const ctx = gsap.context(() => {
      const el = root.current;
      const stage = el.querySelector('.contact__stage');
      const card = el.querySelector('.contact__card');
      const words = el.querySelectorAll('.contact__h .wi');
      const lead = el.querySelector('.contact__head .lead');
      const ways = el.querySelectorAll('.contact__ways li');
      const wa = el.querySelector('.contact__side .btn');
      const flds = gsap.utils.toArray('.fld', card);
      const submit = card.querySelector('.btn');

      const sc = (trigger, start, end, scrub = 0.7) => ({
        trigger,
        start,
        end,
        scrub
      });

      gsap.fromTo(
        el.querySelector('.contact__orb--a'),
        { y: -100, scale: 0.8 },
        {
          y: 140,
          scale: 1.2,
          ease: 'none',
          scrollTrigger: sc(el, 'top bottom', 'bottom top', 0.6)
        }
      );

      gsap.fromTo(
        el.querySelector('.contact__orb--b'),
        { y: 120, scale: 1.15 },
        {
          y: -120,
          scale: 0.8,
          ease: 'none',
          scrollTrigger: sc(el, 'top bottom', 'bottom top', 0.6)
        }
      );

      mm.add('(min-width: 900px)', () => {
        el.classList.add('is-pinned');

        const pin = el.querySelector('.contact__pin');

        // Text intro is time-based.
        // It plays when the block reaches the screen
        // and rewinds when leaving upwards.
        const intro = gsap.timeline({
          paused: true,
          defaults: { ease: 'expo.out' }
        });

        intro
          .fromTo(
            words,
            { yPercent: 115, rotate: 5 },
            {
              yPercent: 0,
              rotate: 0,
              stagger: 0.09,
              duration: 1.1
            },
            0
          )
          .fromTo(
            lead,
            { y: 34, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.9 },
            0.35
          )
          .fromTo(
            ways,
            { x: -50, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              stagger: 0.15,
              duration: 0.8
            },
            0.6
          )
          .fromTo(
            wa,
            { y: 30, scale: 0.85, opacity: 0 },
            {
              y: 0,
              scale: 1,
              opacity: 1,
              duration: 0.7
            },
            1.0
          );

        const trig = ScrollTrigger.create({
          trigger: pin,
          start: 'top 40%',
          end: 'max',
          onEnter: () => {
            intro.timeScale(1).play();
          },
          onLeaveBack: () => {
            intro.timeScale(1.6).reverse();
          }
        });

        if (trig.isActive || trig.progress > 0) {
          intro.progress(1);
        }

        // Scroll step: the form flies in from the right
        // and its fields fill in.
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: pin,
            start: 'top top',
            end: () => `+=${window.innerHeight * 2}`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (self.progress > 0.01 && intro.progress() < 1) {
                intro.progress(1);
              }
            }
          }
        });

        // Form stays in position.
        // On short screens it shrinks slightly to fit.
        tl.set(
          card,
          {
            scale: () => Math.min(
              1,
              stage.clientHeight / card.offsetHeight
            ),
            transformOrigin: '50% 0%'
          },
          0
        );

        tl
          .fromTo(
            stage,
            {
              x: 280,
              rotateY: -22,
              opacity: 0,
              transformPerspective: 1400,
              transformOrigin: '0% 50%'
            },
            {
              x: 0,
              rotateY: 0,
              opacity: 1,
              ease: 'power3.out',
              duration: 1.1
            },
            0
          )
          .fromTo(
            flds,
            { y: 34, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              stagger: 0.09,
              duration: 0.4
            },
            0.4
          )
          .fromTo(
            submit,
            { y: 30, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.4
            },
            1.1
          )
          .fromTo(
            stage,
            { '--p': 0 },
            { '--p': 1, duration: 1.2 },
            0.4
          )
          .to({}, { duration: 0.5 }, 1.7);

        return () => el.classList.remove('is-pinned');
      });

      mm.add('(max-width: 899px)', () => {
        gsap.fromTo(
          words,
          { yPercent: 115, rotate: 5 },
          {
            yPercent: 0,
            rotate: 0,
            stagger: 0.08,
            ease: 'none',
            scrollTrigger: sc(el, 'top 85%', 'top 45%')
          }
        );

        gsap.fromTo(
          [lead, ...ways, wa].filter(Boolean),
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.15,
            ease: 'none',
            scrollTrigger: sc(el, 'top 70%', 'top 20%')
          }
        );

        gsap.fromTo(
          stage,
          { y: 110, scale: 0.92, opacity: 0 },
          {
            y: 0,
            scale: 1,
            opacity: 1,
            ease: 'none',
            scrollTrigger: sc(stage, 'top 98%', 'top 55%')
          }
        );

        gsap.fromTo(
          stage,
          { '--p': 0 },
          {
            '--p': 1,
            ease: 'none',
            scrollTrigger: sc(stage, 'top 60%', 'bottom 70%', 0.5)
          }
        );

        gsap.fromTo(
          flds,
          { y: 26, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.12,
            ease: 'none',
            scrollTrigger: sc(stage, 'top 85%', 'center 50%')
          }
        );
      });
    }, root);

    return () => {
      mm.revert();
      ctx.revert();
    };
  }, []);

  // When the form height changes, re-measure its fit.
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => cancelAnimationFrame(id);
  }, [svc, status]);

  useEffect(() => {
    const apply = (p) => {
      if (p.service) setSvc(p.service);

      if (p.message) {
        setF((x) => ({ ...x, message: p.message }));
      }
    };

    if (prefill.stamp && Date.now() - prefill.stamp < 4000) {
      apply(prefill);
    }

    return onPrefill(apply);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');

    const isOther = svc === OTHER;

    if (isOther && !other.trim()) {
      setErr('Please tell us what service you need.');
      return;
    }

    const reasons = [
      isOther ? `Other: ${other.trim()}` : (svc || 'General enquiry')
    ];

    const parts = f.name.trim().split(/\s+/);

    const msg = [
      f.workload && `Estimated workload: ${f.workload}`,
      f.message.trim()
    ].filter(Boolean).join('\n\n');

    setStatus('sending');

    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: parts[0] || '',
          lastName: parts.slice(1).join(' '),
          company: f.company.trim(),
          email: f.email.trim(),
          phone: f.phone.replace(/[^\d\s().-]/g, '').trim(),
          countryCode: '',
          reason: reasons.join(', '),
          message: msg,
          smsConsent: false
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setErr(
          (data.errors && data.errors.join(' ')) ||
          data.message ||
          'Something went wrong. Please try again.'
        );

        setStatus('idle');
        return;
      }

      setStatus('done');
      setF(empty);
      setSvc('');
      setOther('');
    } catch {
      setErr("We couldn't reach our server. Please try again in a moment.");
      setStatus('idle');
    }
  };

  return (
    <section
      className="contact"
      id="contact"
      data-land-vh={contactLandingOffset()}
      ref={root}
    >
      <i className="contact__orb contact__orb--a" aria-hidden="true" />
      <i className="contact__orb contact__orb--b" aria-hidden="true" />

      <div className="contact__pin">
        <div className="container contact__in">

          <div className="contact__side">
            <div className="shead contact__head">
              <Eyebrow>Contact</Eyebrow>

              <h2 className="h2 contact__h">
                {CONTACT.headline.split(' ').map((w, i) => (
                  <React.Fragment key={i}>
                    <span className="w">
                      <span className={`wi${i === CONTACT.headline.split(' ').length - 1 ? ' is-accent' : ''}`}>
                        {w}
                      </span>
                    </span>
                    {' '}
                  </React.Fragment>
                ))}
              </h2>

              <p className="lead">{CONTACT.sub}</p>
            </div>

            <ul className="contact__ways contact__info">
              <li>
                <i className="ci"><IcoClock /></i>
                <div>
                  <span>Response</span>
                  {CONTACT.support}
                </div>
              </li>

              <li>
                <i className="ci"><IcoChat /></i>
                <div>
                  <span>Consultation</span>
                  Free and no-obligation
                </div>
              </li>

              {SITE.email && (
                <li>
                  <i className="ci"><IcoMail /></i>
                  <div>
                    <span>Email</span>
                    <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
                  </div>
                </li>
              )}

              {SITE.phone && (
                <li>
                  <i className="ci"><IcoPhone /></i>
                  <div>
                    <span>Phone</span>
                    <a href={`tel:+91${SITE.phone}`}>{SITE.phoneDisplay}</a>
                  </div>
                </li>
              )}

              {SITE.address && (
                <li>
                  <i className="ci"><IcoPin /></i>
                  <div>
                    <span>Office</span>
                    {SITE.address}
                  </div>
                </li>
              )}
            </ul>

            <ol className="contact__ways contact__steps">
              {STEPS.map(([t, d], i) => (
                <li key={t}>
                  <b className="cs__n">
                    {String(i + 1).padStart(2, '0')}
                  </b>
                  <strong>{t}</strong>
                  <small>{d}</small>
                </li>
              ))}
            </ol>

            <WhatsAppButton />
          </div>

          <div className="contact__stage">
            <div className="contact__card" data-tilt="2">
              {status === 'done' ? (
                <div className="done" role="status">
                  <svg
                    className="done__check"
                    viewBox="0 0 52 52"
                    aria-hidden="true"
                  >
                    <circle cx="26" cy="26" r="24" />
                    <path d="M14 27l8 8 16-17" />
                  </svg>

                  <h3>Thank you</h3>

                  <p>
                    Your inquiry has been received.
                    Our team will review it and get back to you.
                  </p>

                  <Button
                    variant="ghost"
                    onClick={() => setStatus('idle')}
                  >
                    Send another
                  </Button>
                </div>
              ) : (
                <form onSubmit={submit} noValidate={false}>
                  <div className="contact__cardhead">
                    <i><IcoSend /></i>
                    <div>
                      <h3>Tell us about your needs</h3>
                      <p>It only takes about a minute.</p>
                    </div>
                  </div>

                  <div className="form__grid">
                    <label className="fld">
                      <span>Full name *</span>
                      <input
                        required
                        autoComplete="name"
                        value={f.name}
                        onChange={set('name')}
                      />
                    </label>

                    <label className="fld">
                      <span>Company *</span>
                      <input
                        required
                        autoComplete="organization"
                        value={f.company}
                        onChange={set('company')}
                      />
                    </label>

                    <label className="fld">
                      <span>Email *</span>
                      <input
                        required
                        type="email"
                        autoComplete="email"
                        value={f.email}
                        onChange={set('email')}
                      />
                    </label>

                    <label className="fld">
                      <span>Phone / WhatsApp *</span>
                      <input
                        required
                        type="tel"
                        autoComplete="tel"
                        value={f.phone}
                        onChange={set('phone')}
                      />
                    </label>
                  </div>

                  <label className="fld fld--wide">
                    <span>Service you need</span>

                    <select
                      value={svc}
                      onChange={(e) => {
                        setSvc(e.target.value);

                        if (e.target.value !== OTHER) {
                          setOther('');
                        }
                      }}
                    >
                      <option value="">Select a service…</option>

                      {FORM_SERVICES.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}

                      <option value={OTHER}>{OTHER}</option>
                    </select>
                  </label>

                  {svc === OTHER && (
                    <label className="fld fld--wide fld--other">
                      <span>Tell us what you need *</span>
                      <input
                        required
                        autoFocus
                        placeholder="e.g. Transcription, travel booking…"
                        maxLength={190}
                        value={other}
                        onChange={(e) => setOther(e.target.value)}
                      />
                    </label>
                  )}

                  <label className="fld fld--wide">
                    <span>Estimated workload</span>

                    <select
                      value={f.workload}
                      onChange={set('workload')}
                    >
                      <option value="">Select…</option>

                      {CONTACT.workloads.map((w) => (
                        <option key={w}>{w}</option>
                      ))}
                    </select>
                  </label>

                  <label className="fld fld--wide">
                    <span>Tell us about your requirements</span>
                    <textarea
                      rows="3"
                      maxLength={1800}
                      value={f.message}
                      onChange={set('message')}
                    />
                  </label>

                  {err && (
                    <p className="form__err" role="alert">
                      {err}
                    </p>
                  )}

                  <Button
                    variant="navy"
                    type="submit"
                    disabled={status === 'sending'}
                    className="btn--block"
                    magnetic={false}
                  >
                    {status === 'sending' ? 'Sending…' : CONTACT.submit}
                  </Button>

                  <p className="contact__note">
                    <IcoCheck />
                    No obligation. Just a conversation about how we can help.
                  </p>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
