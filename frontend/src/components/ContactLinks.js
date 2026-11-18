import React, { useState } from 'react';
import { SITE, telHref, mailtoHref, gmailHref, isMobileDevice } from '../config/site';

/**
 * EmailLink — one component, right behaviour per device:
 *   • phones / tablets  → mailto:  (opens the default mail app, incl. the Gmail app)
 *   • desktop browsers  → Gmail compose in a new tab (works without a mail client installed)
 * Both URLs are always built, so the link also works with JavaScript disabled (mailto).
 */
export function EmailLink({ subject, body, children, ...rest }) {
  const [desktop] = useState(() => !isMobileDevice());
  if (!SITE.email) return null;
  const opts = { subject, body };
  return desktop ? (
    <a href={gmailHref(opts)} target="_blank" rel="noopener noreferrer" title={`Email ${SITE.email}`} {...rest}>
      {children ?? SITE.email}
    </a>
  ) : (
    <a href={mailtoHref(opts)} title={`Email ${SITE.email}`} {...rest}>
      {children ?? SITE.email}
    </a>
  );
}

/** PhoneLink — tel: opens the dialer on phones and the default calling app elsewhere. */
export function PhoneLink({ children, ...rest }) {
  if (!SITE.phone) return null;
  return <a href={telHref()} {...rest}>{children ?? SITE.phoneDisplay}</a>;
}

/** WebsiteLink — the company website, opens in a new tab. */
export function WebsiteLink({ children, ...rest }) {
  return (
    <a href={SITE.url} target="_blank" rel="noopener noreferrer" {...rest}>
      {children ?? SITE.url.replace(/^https?:\/\//, '')}
    </a>
  );
}

/** Turns any plain-text email address in a string into a clickable EmailLink. */
export function linkifyContact(text) {
  if (!SITE.email || typeof text !== 'string' || !text.includes(SITE.email)) return text;
  const parts = text.split(SITE.email);
  return parts.flatMap((part, i) => (i < parts.length - 1 ? [part, <EmailLink key={i} />] : [part]));
}
