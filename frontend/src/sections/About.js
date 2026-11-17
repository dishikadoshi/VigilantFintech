import React, { useLayoutEffect, useRef } from 'react';
import { gsap, REDUCED } from '../lib/smooth';
import { ConsultButton } from '../components/ui';
import { ABOUT } from '../content/copy';
import './about.css';

const [HEAD_A, HEAD_B] = ABOUT.headline.split('. ').map((s, i) => (i === 0 ? `${s}.` : s));
const ICONS = ['shield', 'gem', 'eye', 'flex', 'growth', 'lock'];
const ACCENT = ['#17a08d', '#2f7bd8', '#0f8f7a', '#14466f', '#1ba87e', '#2a8fb8'];
const TINT = ['#0b2a4f', '#eaf6f3', '#25c3ad', '#eaf6f3', '#14466f', '#25c3ad']; // target rings, outside in

const SERVICES = [
  ['Admin support', <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4h6v3H9z" /><path d="m9 13 2 2 4-4" /></>],
  ['Customer care', <><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><rect x="3" y="14" width="4" height="6" rx="1.5" /><rect x="17" y="14" width="4" height="6" rx="1.5" /><path d="M19 20c0 1.5-2 2-5 2" /></>],
  ['Digital marketing', <><path d="M3 11v3a1 1 0 0 0 1 1h2l8 4V6L6 10H4a1 1 0 0 0-1 1z" /><path d="M18 9a4 4 0 0 1 0 6" /></>],
  ['Creative', <><path d="m4 20 1-4L17 4l3 3L8 19z" /><path d="m14 7 3 3" /></>],
  ['E-commerce', <><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M3 4h2.5l2.2 11h10.6l2-8H6.2" /></>],
  ['Operations', <><rect x="3" y="3" width="7" height="6" rx="1.5" /><rect x="14" y="15" width="7" height="6" rx="1.5" /><path d="M10 6h4a3 3 0 0 1 3 3v6" /></>],
  ['Bookkeeping', <><rect x="5" y="3" width="14" height="18" rx="2" /><rect x="8" y="6" width="8" height="4" rx="1" /><path d="M8.5 14h.01M12 14h.01M15.5 14h.01M8.5 17.5h.01M12 17.5h.01M15.5 17.5h.01" /></>],
];
const PLATE_SVC = [0, 1, 2, 6, 4, 5]; // six services become the six plates of the 3D object
const IC = {
  mail: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></>,
  chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  coin: <><circle cx="12" cy="12" r="9" /><path d="M9.5 14.5c.6.9 1.4 1.2 2.5 1.2 1.4 0 2.5-.7 2.5-1.8 0-2.4-5-1.4-5-3.8 0-1 1.1-1.8 2.5-1.8 1 0 1.9.4 2.5 1.2M12 6.5V8M12 16v1.5" /></>,
};
/* [icon, left%, top%, size, depth speed, colour] — drift at different speeds as you scroll */
const FL = [
  [IC.mail, 2, 12, 42, 0.5, '#17a08d'], [IC.chart, 92, 18, 50, 1.0, '#2f7bd8'], [IC.check, 2, 64, 38, 1.4, '#0f8f7a'], [IC.clock, 90, 66, 44, 0.7, '#14466f'],
  [IC.coin, 47, 6, 34, 1.2, '#17a08d'], [SERVICES[4][1], 52, 88, 40, 0.9, '#2a8fb8'], [IC.mail, 40, 10, 64, 2.0, '#17a08d'], [IC.chart, 80, 80, 70, 2.3, '#2f7bd8'],
];
const GW = ['Story', 'Services', 'Mission', 'Vision', 'Values', 'Belief'];
const GW_RANGE = [[0, 1], [1, 3], [3, 4], [4, 5], [5, 11], [11, 12]];
const CHAPTERS = ['Story', 'What we do', 'Mission', 'Vision', 'Values', 'Belief'];
const SLIDE_CH = [0, 1, 1, 2, 3, 4, 4, 4, 4, 4, 4, 5];
const N = 12;

const TICK = <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="10" r="8.5" strokeWidth="1.5" /><path d="m6 10.5 3 3 5-6" /></svg>;
const STORY_POINTS = ['One dedicated team for your admin, customer care, marketing and finance tasks', 'Remote-first, so your support works the hours you need', 'Built around your business, not a one-size-fits-all package'];
const STEPS = [['Understand', 'We learn how your business runs and where your time goes.'], ['Match', 'We assemble the right people and skills for your workload.'], ['Deliver', 'We take tasks off your plate and keep you updated along the way.']];
const MISSION_PILLARS = [['Accessible', 'Professional support without the cost and overhead of building a full in-house team.'], ['Flexible', 'Skills and hours that scale up or down as your business changes.'], ['Reliable', 'Consistent, accurate work you can hand off with confidence.']];
const VISION_PILLARS = [['Global', 'Supporting businesses across borders and time zones.'], ['Trusted', 'A long-term partner your team relies on, day after day.'], ['Sustainable', 'Simpler operations, so growth lasts without burnout.']];
const PRACTICE = [
  ['Deadlines we keep', 'Tasks followed through to completion', 'Backup cover so work never stalls'],
  ['Every deliverable reviewed before it reaches you', 'Consistent standards across every task', 'Your feedback built into the process'],
  ['Regular progress updates', 'Honest timelines and scope', 'No hidden surprises'],
  ['Scope that adjusts as priorities shift', 'Hours and skills that scale up or down', 'Support across your tools and time zones'],
  ['Routine work handed off, so you focus on opportunities', 'Processes that scale with you', 'Support that grows as your business does'],
  ['Discretion with your business information', 'Access limited to what each task needs', 'Respect for your clients’ data'],
];


/* Inline open-licence style line icons (Lucide/Feather-like): self-contained, nothing hotlinked. */
function ValueIcon({ k }) {
  const p = { viewBox: '0 0 64 64', fill: 'none', stroke: 'currentColor', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (k) {
    case 'shield': return (<svg className="ic" {...p}><path d="M32 6 54 14v17c0 13-9 23-22 27C19 54 10 44 10 31V14z" /><path d="m21 32 8 8 15-17" /></svg>);
    case 'gem': return (<svg className="ic" {...p}><path d="M20 12h24l12 14-24 28L8 26z" /><path d="M8 26h48M24 26l8 28 8-28M20 12l4 14 8-14 8 14 4-14" opacity=".7" /></svg>);
    case 'eye': return (<svg className="ic" {...p}><path d="M4 32s10-18 28-18 28 18 28 18-10 18-28 18S4 32 4 32z" /><circle cx="32" cy="32" r="8" /><circle cx="32" cy="32" r="2.6" fill="currentColor" /></svg>);
    case 'flex': return (<svg className="ic" {...p}><path d="M52 22a22 22 0 0 0-39-5" /><path d="M13 7v10h10" /><path d="M12 42a22 22 0 0 0 39 5" /><path d="M51 57V47H41" /><rect x="26" y="26" width="12" height="12" rx="3" /></svg>);
    case 'growth': return (<svg className="ic" {...p}><path d="M6 58h52" opacity=".6" /><rect x="10" y="38" width="9" height="20" rx="2" /><rect x="27" y="28" width="9" height="30" rx="2" /><rect x="44" y="16" width="9" height="42" rx="2" /><path d="M8 30 24 18l11 7 20-17" /><path d="M44 8h11v11" /></svg>);
    default: return (<svg className="ic" {...p}><rect x="12" y="28" width="40" height="30" rx="7" /><path d="M20 28V20a12 12 0 0 1 24 0v8" /><circle cx="32" cy="42" r="4" /><path d="M32 46v6" /></svg>);
  }
}

/* The six states the 3D object morphs through. Each is a function of the plate index. */
const SLAB = (i, gap = 12) => ({ x: 0, y: 0, z: (i - 2.5) * gap, rx: 0, ry: 0, rz: 0, iz: 0, br: 24, bg: 1, tint: 0, ring: 0, so: 1, vo: 0 });
const CAROUSEL = (i) => ({ ...SLAB(i), z: 0, ry: i * 60, iz: 360 });
const TARGET = (i) => ({ x: 0, y: 0, z: i * 26, rx: 0, ry: 0, rz: 0, iz: 0, br: 100, bg: 0, tint: 1, ring: 0, so: 0, vo: 0, sc: 1.15 - i * 0.19 });
const ARMIL = (i) => ({ x: 0, y: 0, z: 0, rx: 0, ry: i * 30, rz: 0, iz: 0, br: 100, bg: 0.12, tint: 0, ring: 1, so: 0, vo: 0, sc: 1.3 });
const FACES = [{}, { ry: 90 }, { ry: 180 }, { ry: -90 }, { rx: 90 }, { rx: -90 }];
const CUBE = (i) => ({ x: 0, y: 0, z: 0, rx: FACES[i].rx || 0, ry: FACES[i].ry || 0, rz: 0, iz: 100, br: 20, bg: 1, tint: 0, ring: 0, so: 0, vo: 1 });
const CUBE_VIEW = [{ rx: 0, ry: -720 }, { rx: 0, ry: -810 }, { rx: 0, ry: -900 }, { rx: 0, ry: -990 }, { rx: -90, ry: -1080 }, { rx: 90, ry: -1080 }];

export default function About() {
  const root = useRef(null);
  const num = useRef(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (REDUCED) { el.classList.add('ab--static'); return undefined; }
    const q = (s) => gsap.utils.toArray(s, el);

    const ctx = gsap.context(() => {
      const slides = q('.ab-s');
      const plates = q('.pl').map((w) => ({
        w, f: w.querySelector('.pl__f'), bg: w.querySelector('.pl__bg'), tint: w.querySelector('.pl__tint'), ring: w.querySelector('.pl__ring'), s: w.querySelector('.pl__s'), v: w.querySelector('.pl__v'),
      }));
      const rig = el.querySelector('.ab-rig');
      const tilt = el.querySelector('.ab-tilt');
      const pills = q('.ab-prog__pill');
      let cur = -1;

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el, start: 'top top', end: () => `+=${Math.round(window.innerHeight * N * 0.85)}`, scrub: 1, pin: el.querySelector('.ab-stage'), anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: (st) => {
            const idx = Math.min(N - 1, Math.floor(st.progress * N));
            if (idx === cur) return;
            cur = idx;
            if (num.current) num.current.textContent = String(idx + 1).padStart(2, '0');
            pills.forEach((p, i) => p.classList.toggle('is-on', i === SLIDE_CH[idx]));
          },
        },
      });

      /* helpers ---------------------------------------------------------- */
      const apply = (fn, at, dur) => plates.forEach((p, i) => {
        const s = fn(i); const ease = 'power2.inOut'; const d = { duration: dur, ease };
        tl.to(p.w, { x: s.x, y: s.y, z: s.z, rotationX: s.rx, rotationY: s.ry, rotationZ: s.rz, scale: s.sc || 1, ...d }, at);
        tl.to(p.f, { z: s.iz, borderRadius: s.br, ...d }, at);
        tl.to(p.bg, { opacity: s.bg, ...d }, at); tl.to(p.tint, { opacity: s.tint, ...d }, at); tl.to(p.ring, { opacity: s.ring, ...d }, at);
        tl.to(p.s, { opacity: s.so, ...d }, at); tl.to(p.v, { opacity: s.vo, ...d }, at);
      });
      const place = (fn) => plates.forEach((p, i) => {
        const s = fn(i);
        gsap.set(p.w, { x: s.x, y: s.y, z: s.z, rotationX: s.rx, rotationY: s.ry, rotationZ: s.rz, scale: s.sc || 1 });
        gsap.set(p.f, { z: s.iz, borderRadius: s.br }); gsap.set(p.bg, { opacity: s.bg }); gsap.set(p.tint, { opacity: s.tint }); gsap.set(p.ring, { opacity: s.ring }); gsap.set(p.s, { opacity: s.so }); gsap.set(p.v, { opacity: s.vo });
      });
      const rigTo = (v, at, dur) => tl.to(rig, { rotationX: v.rx, rotationY: v.ry, rotationZ: v.rz, scale: v.sc, y: v.y || 0, duration: dur, ease: 'power2.inOut' }, at);

      /* initial state: an exploded isometric stack of the six services ---- */
      place((i) => SLAB(i, 92));
      gsap.set(rig, { rotationX: 62, rotationY: 0, rotationZ: -38, scale: 1.15, y: 20 });
      gsap.set(tilt, { rotationX: 0, rotationY: 0 });

      /* 0 · STORY → the stack assembles and turns */
      plates.forEach((p, i) => tl.fromTo(p.w, { z: (i - 2.5) * 92 }, { z: (i - 2.5) * 12, duration: 0.6 }, 0));
      tl.fromTo(rig, { rotationZ: -38 }, { rotationZ: -80, duration: 0.75 }, 0);

      /* 1–2 · WHAT WE DO → stack opens into a carousel that spins through the services */
      apply(CAROUSEL, 0.75, 0.6); rigTo({ rx: 12, ry: 0, rz: 0, sc: 0.74 }, 0.75, 0.6);
      tl.to(rig, { rotationY: -340, duration: 1.4 }, 1.35);

      /* 3 · MISSION → the carousel collapses into a target */
      apply(TARGET, 2.75, 0.6); rigTo({ rx: 10, ry: -360, rz: 0, sc: 1.55 }, 2.75, 0.6);
      tl.to(rig, { rotationZ: 24, duration: 0.4 }, 3.35);

      /* 4 · VISION → discs open into a globe frame */
      apply(ARMIL, 3.75, 0.6); rigTo({ rx: 20, ry: -420, rz: 0, sc: 1.3 }, 3.75, 0.6);
      tl.to(rig, { rotationY: -600, duration: 0.45 }, 4.3);

      /* 5–10 · VALUES → the globe folds into a cube; every scroll step turns to the next face */
      apply(CUBE, 4.75, 0.6); rigTo({ ...CUBE_VIEW[0], rz: 0, sc: 1.6 }, 4.75, 0.6);
      tl.to(tilt, { rotationX: -16, rotationY: -26, duration: 0.6, ease: 'power2.inOut' }, 4.75);
      for (let k = 1; k < 6; k++) tl.to(rig, { rotationX: CUBE_VIEW[k].rx, rotationY: CUBE_VIEW[k].ry, duration: 0.5, ease: 'power2.inOut' }, 5 + k - 0.25);

      /* 11 · BELIEF → the cube settles back into the stack: everything in place */
      apply((i) => SLAB(i, 12), 10.75, 0.6); rigTo({ rx: 62, ry: -1080, rz: -38, sc: 1.15, y: 20 }, 10.75, 0.6);
      tl.to(tilt, { rotationX: 0, rotationY: 0, duration: 0.6, ease: 'power2.inOut' }, 10.75);
      tl.to(rig, { rotationZ: -398, duration: 0.65, ease: 'power2.out' }, 11.35);

      /* text slides: scrub-controlled in / out, never overlapping, never clipped */
      slides.forEach((s, i) => {
        gsap.set(s, { autoAlpha: i === 0 ? 1 : 0 });
        if (i > 0) {
          tl.fromTo(s, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, i);
          tl.fromTo(Array.from(s.children), { y: 34, opacity: 0 }, { y: 0, opacity: 1, duration: 0.24, stagger: 0.035, ease: 'power2.out' }, i);
        }
        if (i < N - 1) {
          tl.to(s, { autoAlpha: 0, duration: 0.2 }, i + 0.8);
          tl.to(Array.from(s.children), { y: -28, opacity: 0, duration: 0.2, stagger: 0.02, ease: 'power2.in' }, i + 0.78);
        }
      });

      /* ghost chapter words slide across behind the text */
      q('.ab-gw b').forEach((w, c) => {
        const [a, b] = GW_RANGE[c];
        gsap.set(w, { autoAlpha: c === 0 ? 1 : 0 });
        if (c > 0) tl.fromTo(w, { autoAlpha: 0, x: 160 }, { autoAlpha: 1, x: 0, duration: 0.3, ease: 'power2.out' }, a - 0.05);
        tl.fromTo(w, { xPercent: 0 }, { xPercent: -10, duration: b - a }, a);
        if (c < GW.length - 1) tl.to(w, { autoAlpha: 0, x: -160, duration: 0.3, ease: 'power2.in' }, b - 0.3);
      });

      /* depth: icons drift at different speeds, dotted grid slides, progress fills */
      q('.ab-fl').forEach((f) => {
        const spd = parseFloat(f.dataset.spd);
        tl.fromTo(f.firstChild, { y: spd * 180, rotate: -spd * 30 }, { y: -spd * 620, rotate: spd * 130, duration: N }, 0);
      });
      tl.fromTo('.ab-stage__grid', { y: 0 }, { y: -260, duration: N }, 0);
      tl.fromTo('.ab-prog__f', { scaleX: 0 }, { scaleX: 1, duration: N }, 0);
      tl.fromTo('.ab-ground', { opacity: 0.9, scaleX: 1 }, { opacity: 0.9, scaleX: 1, duration: N }, 0);
    }, root);

    return () => ctx.revert();
  }, []);

  const S = ({ children }) => <div className="ab-s">{children}</div>;

  return (
    <section className="ab" id="about" ref={root}>
      <div className="ab-stage">
        <i className="ab-stage__grid" aria-hidden="true" />
        <div className="ab-gw" aria-hidden="true">{GW.map((w) => <b key={w}>{w}</b>)}</div>
        <div className="ab-fls" aria-hidden="true">
          {FL.map(([ic, l, t, sz, spd, col], i) => (
            <span className="ab-fl" key={i} data-spd={spd} style={{ left: `${l}%`, top: `${t}%`, '--s': `${sz}px`, '--fc': col, '--d': `${4 + (i % 4)}s` }}>
              <span className="ab-fl__in"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{ic}</svg></span>
            </span>
          ))}
        </div>

        <div className="container ab-grid2">
          <div className="ab-slides">
            <S>
              <p className="eyebrow"><i />About us</p>
              <h2 className="ab-h1">{HEAD_A} <em>{HEAD_B}</em></h2>
              <p className="ab-p ab-p--lead">{ABOUT.intro[0]}</p>
              <ul className="ab-list">{STORY_POINTS.map((t) => <li key={t}>{TICK}<span>{t}</span></li>)}</ul>
              <div className="ab-tags">{['Remote-first', 'Multi-skilled team', 'Flexible by design'].map((t) => <span className="ab-tag" key={t}>{t}</span>)}</div>
            </S>
            <S>
              <p className="eyebrow"><i />What we do</p>
              <h2 className="ab-h2">One team. <em>Many skills.</em></h2>
              <p className="ab-p ab-p--lead">{ABOUT.intro[1]}</p>
              <ol className="ab-steps">{STEPS.map(([t, d], i) => (
                <li key={t}><b>{String(i + 1).padStart(2, '0')}</b><span><strong>{t}</strong>{d}</span></li>
              ))}</ol>
            </S>
            <S>
              <p className="eyebrow"><i />What we do</p>
              <h2 className="ab-h2">Whatever your <em>business needs.</em></h2>
              <p className="ab-p ab-p--lead">{ABOUT.intro[2]}</p>
              <div className="ab-tags">{SERVICES.map(([n, ic]) => (
                <span className="ab-tag ab-tag--ic" key={n}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{ic}</svg>{n}</span>
              ))}</div>
              <p className="ab-note">Don’t see what you need? We’ll build a support plan around it.</p>
            </S>
            <S>
              <p className="eyebrow"><i />Our mission</p>
              <h2 className="ab-h2">Support that <em>just works.</em></h2>
              <p className="ab-p ab-p--lead">{ABOUT.mission}</p>
              <ul className="ab-pillars">{MISSION_PILLARS.map(([t, d]) => <li key={t}><strong>{t}</strong><span>{d}</span></li>)}</ul>
            </S>
            <S>
              <p className="eyebrow"><i />Our vision</p>
              <h2 className="ab-h2">A partner <em>without borders.</em></h2>
              <p className="ab-p ab-p--lead">{ABOUT.vision}</p>
              <ul className="ab-pillars">{VISION_PILLARS.map(([t, d]) => <li key={t}><strong>{t}</strong><span>{d}</span></li>)}</ul>
            </S>
            {ABOUT.values.map(([t, d], i) => (
              <S key={t}>
                <p className="eyebrow"><i />Our values · {String(i + 1).padStart(2, '0')} / 06</p>
                <h2 className="ab-h2 ab-h2--v" style={{ '--c': ACCENT[i] }}>{t}</h2>
                <p className="ab-p ab-p--lead">{d}</p>
                <p className="ab-sub">In practice</p>
                <ul className="ab-list" style={{ '--c': ACCENT[i] }}>{PRACTICE[i].map((x) => <li key={x}>{TICK}<span>{x}</span></li>)}</ul>
                <div className="ab-dots">{ABOUT.values.map((v, j) => <i key={v[0]} className={j === i ? 'on' : ''} />)}</div>
              </S>
            ))}
            <S>
              <p className="eyebrow"><i />Our belief</p>
              <p className="ab-quote">{ABOUT.intro[3]}</p>
              <p className="ab-p ab-p--lead">Whether you’re a founder handling everything yourself or a growing team, we step in where you need us and take the work off your plate.</p>
              <ul className="ab-list">{['Tell us what’s taking your time', 'We’ll show you how we can help'].map((t) => <li key={t}>{TICK}<span>{t}</span></li>)}</ul>
              <div className="ab-cta"><ConsultButton variant="teal">Book a Free Consultation</ConsultButton></div>
            </S>
          </div>

          {/* the 3D object: six plates that fold into a stack, carousel, target, globe and cube */}
          <div className="ab-3d" aria-hidden="true">
            <div className="ab-3d__k"><div className="ab-tilt"><div className="ab-rig">
              {PLATE_SVC.map((si, i) => (
                <div className="pl" key={i}>
                  <div className="pl__f" style={{ '--c': ACCENT[i] }}>
                    <i className="pl__bg" /><i className="pl__tint" style={{ background: TINT[i] }} /><i className="pl__ring" />
                    <div className="pl__s"><span className="pl__ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{SERVICES[si][1]}</svg></span><b>{SERVICES[si][0]}</b></div>
                    <div className="pl__v"><span className="pl__vic"><ValueIcon k={ICONS[i]} /></span><small>{String(i + 1).padStart(2, '0')}</small><b>{ABOUT.values[i][0]}</b></div>
                  </div>
                </div>
              ))}
            </div></div></div>
            <i className="ab-ground" />
          </div>
        </div>

        <div className="container ab-prog" aria-hidden="true">
          <span className="ab-prog__n"><b ref={num}>01</b> / {N}</span>
          <span className="ab-prog__l"><i className="ab-prog__f" /></span>
          <span className="ab-prog__pills">{CHAPTERS.map((c, i) => <span className={`ab-prog__pill${i === 0 ? ' is-on' : ''}`} key={c}>{c}</span>)}</span>
        </div>
      </div>
    </section>
  );
}
