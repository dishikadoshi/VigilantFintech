
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export const REDUCED =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const FINE =
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;

let lenis = null;

export const getLenis = () => lenis;

export const scrollVelocity = { v: 0 };

/**
 * Inertial smooth scrolling (Lenis) driven by GSAP's ticker
 * so ScrollTrigger, the WebGL scene and every scrub
 * share a single clock.
 */
export function initSmoothScroll() {
  if (lenis || REDUCED) return lenis;

  document.documentElement.classList.add('has-lenis');

  lenis = new Lenis({
    duration: 0.95,
    easing: (t) =>
      Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1.05,
    touchMultiplier: 1.6,
  });

  lenis.on('scroll', (e) => {
    scrollVelocity.v = e.velocity || 0;
    ScrollTrigger.update();
  });

  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

export function scrollToTop(immediate = true) {
  if (lenis) {
    lenis.scrollTo(0, {
      immediate,
      force: true,
    });
  }

  window.scrollTo(0, 0);
}

/**
 * Jump to a #hash block.
 * `immediate` is used under the page-transition curtain.
 */
export function scrollToHash(hash, immediate = false) {
  const section =
    typeof hash === 'string'
      ? document.querySelector(hash)
      : hash;

  if (!section) return;

  // On smaller screens (or with reduced motion),
  // Contact is not pinned and the form follows
  // the contact details vertically.
  // Land at the form itself so a Contact nav click
  // shows the form instead of only the intro text.
  const isContact = hash === '#contact';

  const isUnpinnedContact =
    isContact &&
    (
      window.matchMedia('(max-width: 899px)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );

  const formStage = isUnpinnedContact
    ? section.querySelector('.contact__stage')
    : null;

  const target = formStage || section;

  // Pinned sections can opt into a partial landing
  // position via data-land-vh.
  // Contact uses this on desktop to land near the end
  // of its two-viewport animation, where the form
  // has fully appeared.
  const land =
    target === section &&
    section.dataset &&
    section.dataset.landVh
      ? parseFloat(section.dataset.landVh) * window.innerHeight
      : 0;

  const off = (hash === '#home' ? 0 : -8) + land;

  if (lenis) {
    lenis.scrollTo(target, {
      offset: off,
      immediate,
      force: true,
      duration: 1.6,
    });
  } else {
    window.scrollTo(
      0,
      target.getBoundingClientRect().top +
      window.scrollY +
      off
    );
  }
}

export function lockScroll(lock) {
  if (!lenis) {
    document.documentElement.style.overflow =
      lock ? 'hidden' : '';

    return;
  }

  lock ? lenis.stop() : lenis.start();
}

export { gsap, ScrollTrigger };
