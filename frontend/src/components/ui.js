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

/** Official-style WhatsApp glyph (brand green). Shared by every "Chat on WhatsApp" button. */
export const WhatsAppIcon = ({ className = 'wa-ico' }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91A9.85 9.85 0 0 0 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.22-8.23 8.22zm4.52-6.16c-.25-.12-1.47-.73-1.7-.82-.23-.08-.39-.12-.56.12-.17.25-.64.82-.78.98-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.23-.16-.48-.29z" />
  </svg>
);

export const WhatsAppLabel = () => <span className="wa-lbl"><WhatsAppIcon />Chat on WhatsApp</span>;

export function WhatsAppButton({ variant = 'ghost', className = '', text }) {
  const href = whatsappHref(text);
  if (!href) return null;
  return <Button to={href} variant={variant} className={className}><WhatsAppLabel /></Button>;
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
