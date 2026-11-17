import React, { useLayoutEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, REDUCED } from '../lib/smooth';
import { SectionHead } from '../components/ui';
import { FAQS } from '../content/copy';

const pad = (n) => String(n).padStart(2, '0');

/** Scroll-controlled FAQ: a progress rail fills as you move down the list, each row tilts in from below,
 *  and the row nearest the middle of the screen is highlighted while the counter on the left follows. */
export default function Faq() {
  const [open, setOpen] = useState(0);
  const root = useRef(null);

  useLayoutEffect(() => {
    if (REDUCED) return undefined;
    const ctx = gsap.context(() => {
      const list = root.current.querySelector('.faq__list');
      const rows = gsap.utils.toArray('.qa', root.current);
      const count = root.current.querySelector('.faq__count b');

      gsap.timeline({ scrollTrigger: { trigger: list, start: 'top 70%', end: 'bottom 60%', scrub: 0.6 } })
        .fromTo('.faq__rail i', { scaleY: 0 }, { scaleY: 1, ease: 'none' }, 0)
        .fromTo('.faq__rail b', { top: '0%' }, { top: '100%', ease: 'none' }, 0);

      rows.forEach((row, i) => {
        gsap.fromTo(row, { y: 60, opacity: 0, rotateX: -16, x: 30, transformPerspective: 1100, transformOrigin: '50% 0%' },
          { y: 0, opacity: 1, rotateX: 0, x: 0, ease: 'none', scrollTrigger: { trigger: row, start: 'top 96%', end: 'top 70%', scrub: 0.6 } });
        gsap.fromTo(row, { '--fill': 0 }, { '--fill': 1, ease: 'none', scrollTrigger: { trigger: row, start: 'top 80%', end: 'top 55%', scrub: 0.6 } });
        focusRow(row, i, count);
      });

      gsap.fromTo('.faq__in .shead', { opacity: 0.25, y: 30 }, { opacity: 1, y: 0, ease: 'none', scrollTrigger: { trigger: '.faq__in', start: 'top 90%', end: 'top 45%', scrub: 0.6 } });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="faq" id="faq" ref={root}>
      <div className="container faq__in">
        <SectionHead eyebrow="FAQ" title="Frequently Asked Questions">
          <div className="faq__count" aria-hidden="true"><b>01</b><span>/ {pad(FAQS.length)}</span></div>
        </SectionHead>
        <div className="faq__list">
          <span className="faq__rail" aria-hidden="true"><i /><b /></span>
          {FAQS.map(([q, a], i) => (
            <div key={q} className={`qa${open === i ? ' is-open' : ''}`}>
              <button type="button" className="qa__q" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
                <span>{q}</span><i aria-hidden="true" />
              </button>
              <div className="qa__a"><div><p>{a}</p></div></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Marks the row crossing the middle of the viewport and updates the counter. */
function focusRow(row, i, count) {
  ScrollTrigger.create({
    trigger: row, start: 'top 58%', end: 'bottom 58%',
    toggleClass: { targets: row, className: 'is-focus' },
    onToggle: (self) => { if (self.isActive && count) count.textContent = pad(i + 1); },
  });
}
