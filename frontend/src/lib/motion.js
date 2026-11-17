/**
 * motion.js — declarative scroll motion.
 *
 * Any element can opt in with data attributes, so pages stay plain JSX:
 *   data-split              headline words rise out of a mask
 *   data-scrub-words        words light up as you scroll through a paragraph
 *   data-reveal="up|left|right|scale|clip"   3D fade-in (data-delay, data-reveal-stagger)
 *   data-parallax="0.2"     vertical parallax (+/- speed)
 *   data-tilt               pointer-driven 3D card tilt (fine pointers only)
 *   data-magnetic           button gently follows the cursor
 */
import { gsap, ScrollTrigger, REDUCED, FINE, scrollVelocity } from './smooth';

export function splitTextNodes(el, wrapMask) {
  if (el.dataset.splitDone) return Array.from(el.querySelectorAll('.wi, .w2'));
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    if (!node.nodeValue.trim()) return;
    const frag = document.createDocumentFragment();
    node.nodeValue.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) {
        frag.appendChild(document.createTextNode(' '));
        return;
      }
      if (wrapMask) {
        const outer = document.createElement('span');
        outer.className = 'w';
        const inner = document.createElement('span');
        inner.className = 'wi';
        inner.textContent = part;
        outer.appendChild(inner);
        frag.appendChild(outer);
      } else {
        const s = document.createElement('span');
        s.className = 'w2';
        s.textContent = part;
        frag.appendChild(s);
      }
    });
    node.parentNode.replaceChild(frag, node);
  });
  el.dataset.splitDone = '1';
  return Array.from(el.querySelectorAll(wrapMask ? '.wi' : '.w2'));
}

const FROM = {
  up: { y: 56, rotateX: -12, opacity: 0, transformOrigin: '50% 100%' },
  left: { x: -60, rotateY: 10, opacity: 0, transformOrigin: '0% 50%' },
  right: { x: 60, rotateY: -10, opacity: 0, transformOrigin: '100% 50%' },
  scale: { scale: 0.82, opacity: 0, transformOrigin: '50% 50%' },
  clip: { clipPath: 'inset(100% 0% 0% 0%)', y: 40, opacity: 0 },
};

export function initPage(root) {
  const ctxCleanup = [];
  const ctx = gsap.context(() => {
    if (REDUCED) {
      root.querySelectorAll('[data-split]').forEach((el) => (el.style.visibility = 'visible'));
      return;
    }

    // ── headline word masks ──────────────────────────────────
    root.querySelectorAll('[data-split]').forEach((el) => {
      const words = splitTextNodes(el, true);
      el.style.visibility = 'visible';
      gsap.set(words, { yPercent: 115, rotate: 4 });
      gsap.to(words, {
        yPercent: 0, rotate: 0, duration: 0.8, ease: 'expo.out', stagger: parseFloat(el.dataset.stagger || 0.03),
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        delay: parseFloat(el.dataset.delay || 0),
      });
    });

    // ── paragraphs that illuminate word by word ──────────────
    root.querySelectorAll('[data-scrub-words]').forEach((el) => {
      const words = splitTextNodes(el, false);
      gsap.set(words, { opacity: 0.14 });
      gsap.to(words, {
        opacity: 1, ease: 'none', stagger: 0.12,
        scrollTrigger: { trigger: el, start: 'top 85%', end: 'bottom 55%', scrub: 0.25 },
      });
    });

    // ── generic 3D reveals ───────────────────────────────────
    root.querySelectorAll('[data-reveal]').forEach((el) => {
      const kind = FROM[el.dataset.reveal] ? el.dataset.reveal : 'up';
      const stagger = el.hasAttribute('data-reveal-stagger');
      const targets = stagger ? Array.from(el.children) : [el];
      gsap.set(el, { transformPerspective: 1100 });
      gsap.fromTo(
        targets,
        { ...FROM[kind], transformPerspective: 1100 },
        {
          y: 0, x: 0, rotateX: 0, rotateY: 0, scale: 1, opacity: 1, clipPath: 'inset(0% 0% 0% 0%)',
          duration: 0.85, ease: 'expo.out',
          stagger: stagger ? 0.06 : 0,
          delay: parseFloat(el.dataset.delay || 0),
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          clearProps: 'clipPath',
        }
      );
    });

    // ── parallax drift ───────────────────────────────────────
    root.querySelectorAll('[data-parallax]').forEach((el) => {
      const speed = parseFloat(el.dataset.parallax) || 0.15;
      gsap.fromTo(
        el,
        { yPercent: speed * 60 },
        {
          yPercent: -speed * 60, ease: 'none',
          scrollTrigger: { trigger: el.parentElement || el, start: 'top bottom', end: 'bottom top', scrub: true },
        }
      );
    });


    // ── every block: drawing rule, drifting glow, eyebrow, staggered cards ──
    const made = [];
    root.querySelectorAll('.after-film > section').forEach((sec, i) => {
      const rule = document.createElement('i'); rule.className = 'blk-rule'; rule.setAttribute('aria-hidden', 'true');
      const orb = document.createElement('i'); orb.className = 'blk-orb' + (i % 2 ? ' blk-orb--r' : ''); orb.setAttribute('aria-hidden', 'true');
      sec.prepend(rule, orb); made.push(rule, orb);
      gsap.fromTo(rule, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: sec, start: 'top 92%', end: 'top 35%', scrub: 0.25 } });
      gsap.fromTo(orb, { yPercent: -25 }, { yPercent: 35, ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: true } });
      const eb = sec.querySelector('.eyebrow');
      if (eb) gsap.from(eb, { x: -24, opacity: 0, duration: 0.65, ease: 'expo.out', scrollTrigger: { trigger: eb, start: 'top 92%', once: true } });
    });
    ctxCleanup.push(() => made.forEach((n) => n.remove()));
    const auto = ['.marquee--mid', '.cta .marquee'];
    if (window.innerWidth < 900) auto.push('.vcard', '.wcard');
    const autoEls = gsap.utils.toArray(auto.join(','), document).filter((el) => !el.closest('[data-reveal]') && !el.hasAttribute('data-reveal'));
    gsap.set(autoEls, { opacity: 0, y: 44 });
    ScrollTrigger.batch(autoEls, { start: 'top 94%', once: true, onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, duration: 0.75, ease: 'expo.out', stagger: 0.06, overwrite: true }) });

    // ── velocity skew (marquees etc.) ────────────────────────
    const skewEls = root.querySelectorAll('[data-skew]');
    if (skewEls.length) {
      const setters = Array.from(skewEls).map((el) => gsap.quickTo(el, 'skewX', { duration: 0.3, ease: 'power3.out' }));
      const tick = () => { const k = Math.max(-12, Math.min(12, scrollVelocity.v * -0.45)); setters.forEach((f) => f(k)); };
      gsap.ticker.add(tick);
      ctxCleanup.push(() => gsap.ticker.remove(tick));
    }

    // ── pointer-driven interactions (desktop only) ───────────
    if (FINE) {
      root.querySelectorAll('[data-tilt]').forEach((el) => {
        const max = parseFloat(el.dataset.tilt) || 9;
        const rx = gsap.quickTo(el, 'rotateX', { duration: 0.35, ease: 'power3.out' });
        const ry = gsap.quickTo(el, 'rotateY', { duration: 0.35, ease: 'power3.out' });
        gsap.set(el, { transformPerspective: 900, transformStyle: 'preserve-3d' });
        const move = (e) => {
          const r = el.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width;
          const py = (e.clientY - r.top) / r.height;
          ry((px - 0.5) * max * 2);
          rx(-(py - 0.5) * max * 2);
          el.style.setProperty('--mx', `${px * 100}%`);
          el.style.setProperty('--my', `${py * 100}%`);
        };
        const leave = () => { rx(0); ry(0); };
        el.addEventListener('pointermove', move);
        el.addEventListener('pointerleave', leave);
      });

      root.querySelectorAll('[data-magnetic]').forEach((el) => {
        const xTo = gsap.quickTo(el, 'x', { duration: 0.28, ease: 'power3.out' });
        const yTo = gsap.quickTo(el, 'y', { duration: 0.28, ease: 'power3.out' });
        const move = (e) => {
          const r = el.getBoundingClientRect();
          xTo((e.clientX - (r.left + r.width / 2)) * 0.28);
          yTo((e.clientY - (r.top + r.height / 2)) * 0.4);
        };
        const leave = () => { xTo(0); yTo(0); };
        el.addEventListener('pointermove', move);
        el.addEventListener('pointerleave', leave);
      });
    }
  }, root);

  // Fonts and the scene change layout after first paint — re-measure.
  const refresh = () => ScrollTrigger.refresh();
  requestAnimationFrame(() => requestAnimationFrame(refresh));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  const t = setTimeout(refresh, 900);
  const prevRevert = ctx.revert.bind(ctx);
  ctx.revert = (...a) => { clearTimeout(t); ctxCleanup.forEach((f) => f()); return prevRevert(...a); };
  return ctx;
}
