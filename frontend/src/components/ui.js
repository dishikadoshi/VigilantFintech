import React, { useLayoutEffect, useRef } from 'react';
import { Link } from '../lib/router';
import { initPage } from '../lib/motion';
import { useSEO } from '../lib/seo';
import { sceneState } from '../three/sceneState';
import { SITE, CONSULT_TO, whatsappHref } from '../config/site';

export const Arrow = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/** Pill button: sliding fill + magnetic pull. variants: navy | teal | ghost | white */
export function Button({ to, variant = 'navy', children, magnetic = true, className = '', ...rest }) {
  const inner = (
    <>
      <span className="btn__fill" />
      <span className="btn__label">{children}</span>
      <span className="btn__icon"><Arrow /></span>
    </>
  );
  const attrs = { className: `btn btn--${variant} ${className}`, ...(magnetic ? { 'data-magnetic': '' } : {}), ...rest };
  if (to) return <Link to={to} {...attrs}>{inner}</Link>;
  return <button type="button" {...attrs}>{inner}</button>;
}

export function ConsultButton({ children = 'Book a Free Consultation', variant = 'navy', className = '' }) {
  return <Button to={SITE.booking || CONSULT_TO} variant={variant} className={className}>{children}</Button>;
}

export function WhatsAppButton({ variant = 'ghost', className = '', text }) {
  const href = whatsappHref(text);
  if (!href) return null;
  return <Button to={href} variant={variant} className={className}>Chat on WhatsApp</Button>;
}

export const Eyebrow = ({ children, className = '' }) => (
  <p className={`eyebrow ${className}`}><i />{children}</p>
);

/** Section header. `title` may contain <em> for the serif accent. */
export function SectionHead({ eyebrow, title, lead, center = false, children, className = '' }) {
  return (
    <div className={`shead${center ? ' shead--center' : ''} ${className}`}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="h2" data-split style={{ visibility: 'hidden' }}>{title}</h2>
      {lead && <p className="lead" data-reveal="up" data-delay="0.15">{lead}</p>}
      {children}
    </div>
  );
}

/** Page shell: SEO, scene mode, declarative scroll motion. */
export function Page({ title, description, path, scene = 'none', children }) {
  useSEO({ title, description, path });
  const ref = useRef(null);
  useLayoutEffect(() => {
    sceneState.mode = scene;
    sceneState.progress = 0;
    sceneState.filmVisible = scene === 'film';
    const ctx = initPage(ref.current);
    return () => ctx.revert();
  }, [scene]);
  return <div className="page" ref={ref}>{children}</div>;
}

/** Scroll-velocity-skewed marquee (see Home). */
export function Marquee({ items, className = '', reverse = false }) {
  const row = Array.from({ length: 3 }).map((_, k) => (
    <div className="marquee__row" key={k}>
      {items.map((t) => <span key={t} className="marquee__item">{t}<i /></span>)}
    </div>
  ));
  return (
    <div className={`marquee ${reverse ? 'marquee--rev' : ''} ${className}`} aria-hidden="true" data-skew>
      <div className="marquee__track">{row}{row}</div>
    </div>
  );
}

/** Compact header for the few secondary pages (legal, feedback, 404). */
export function PageHero({ eyebrow, title, sub }) {
  return (
    <header className="phero">
      <div className="container phero__in">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="h1 h1--sm" data-split style={{ visibility: 'hidden' }}>{title}</h1>
        {sub && <p className="lead" data-reveal="up" data-delay="0.15">{sub}</p>}
      </div>
    </header>
  );
}
