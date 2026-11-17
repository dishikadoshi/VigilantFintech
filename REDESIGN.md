# Vigilant Fintech — frontend redesign notes

**Design:** single landing page on a light base (logo navy `#10305a` + teal `#25c3ad`). Nav items scroll to blocks on the
page (#home, #about, #services, #industries, #pricing, #contact; Why / How / FAQ sit inside). Page-change curtain kept.
Real routes only: privacy / terms / cookies and 404. There is no admin area and no testimonials section.

**Stack:** GSAP + ScrollTrigger, Lenis smooth scroll, Three.js scroll-scrubbed hero scene, self-hosted fonts
(Plus Jakarta Sans, Inter, Instrument Serif via @fontsource).

**Where things are**
- Company details: `frontend/src/config/site.js` / `REACT_APP_*` in `frontend/.env.example` (empty options are hidden)
- Copy: `src/content/copy.js`, `services.js`, `legal.js`
- Blocks: `src/sections/*` (Hero film, About, Services deck, Why ring, How timeline, Industries, Pricing, FAQ, CTA, Contact)
- 3D scene: `src/three/scene.js`; styles: `src/styles.css`; cursor: `components/Cursor.js`

**Before launch:** set the real domain (`REACT_APP_SITE_URL`, `public/sitemap.xml`, `public/robots.txt`, backend email
templates use a guessed vigilantfintech.com), fill contact env vars, and have `content/legal.js` reviewed.
