
import React from 'react';
import { Page, PageHero } from '../components/ui';
import { PRIVACY, TERMS, COOKIES, UPDATED } from '../content/legal';
import { getLenis } from '../lib/smooth';
import { linkifyContact } from '../components/ContactLinks';

const slugify = (value) => value
  .toLowerCase()
  .replace(/&/g, 'and')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

const sectionId = (path, heading) =>
  `${path.replace(/^\/+|\/+$/g, '').replace(/\//g, '-')}-${slugify(heading)}`;

function handleTocClick(event, id) {
  event.preventDefault();

  const target = document.getElementById(id);
  if (!target) return;

  // Update URL hash without triggering a second native jump.
  window.history.replaceState(
    window.history.state,
    '',
    `${window.location.pathname}${window.location.search}#${id}`
  );

  // Use Lenis when available.
  const lenis = getLenis();

  if (lenis) {
    lenis.scrollTo(target, {
      offset: -104,
      duration: 1.2,
      force: true,
    });
  } else {
    const top =
      target.getBoundingClientRect().top +
      window.scrollY -
      104;

    window.scrollTo({
      top,
      behavior: 'smooth',
    });
  }
}

function Legal({
  path,
  title,
  eyebrow,
  intro,
  sections,
}) {
  return (
    <Page
      path={path}
      title={title}
      description={`${title} — how we handle information, our commitments and your choices.`}
    >
      <PageHero
        eyebrow={eyebrow}
        title={title}
        sub={`Last updated: ${UPDATED}. ${intro}`}
      />

      <section className="legal">
        <div className="container legal__in">

          {/* Clickable sidebar questions */}
          <nav
            className="legal__toc"
            aria-label="On this page"
          >
            {sections.map((s, i) => {
              const id = sectionId(path, s.h);

              return (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={(event) =>
                    handleTocClick(event, id)
                  }
                >
                  {String(i + 1).padStart(2, '0')} {s.h}
                </a>
              );
            })}
          </nav>

          {/* Main policy content */}
          <div className="prose">
            {sections.map((s, i) => {
              const id = sectionId(path, s.h);

              return (
                <section
                  key={id}
                  id={id}
                  data-reveal="up"
                  tabIndex="-1"
                >
                  <h2>
                    <em>
                      {String(i + 1).padStart(2, '0')}
                    </em>
                    {s.h}
                  </h2>

                  {(s.p || []).map((t) => (
                    <p key={t}>{linkifyContact(t)}</p>
                  ))}

                  {s.ul && (
                    <ul>
                      {s.ul.map((t) => (
                        <li key={t}>{linkifyContact(t)}</li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>

        </div>
      </section>
    </Page>
  );
}

export const PrivacyPolicy = () => (
  <Legal
    path="/privacy-policy"
    title="Privacy Policy"
    eyebrow="Legal"
    intro="How we collect, use and protect your information."
    sections={PRIVACY}
  />
);

export const Terms = () => (
  <Legal
    path="/terms-and-conditions"
    title="Terms & Conditions"
    eyebrow="Legal"
    intro="The terms that apply when you use this website."
    sections={TERMS}
  />
);

export const CookiePolicy = () => (
  <Legal
    path="/cookie-policy"
    title="Cookie Policy"
    eyebrow="Legal"
    intro="What this website stores in your browser."
    sections={COOKIES}
  />
);
