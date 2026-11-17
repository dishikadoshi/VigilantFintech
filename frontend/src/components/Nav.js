
import React, { useEffect, useRef, useState } from 'react';
import { gsap, lockScroll } from '../lib/smooth';
import { Link, useRouter } from '../lib/router';
import Logo from './Logo';
import { Button } from './ui';
import { NAV, SITE, CONSULT_TO } from '../config/site';

// Which landing-page block each navigation item belongs to
const BLOCKS = [
  ['home', '#home'],
  ['about', '#about'],
  ['services', '#services'],
  ['why', '#services'],
  ['how', '#services'],
  ['industries', '#industries'],
  ['pricing', '#pricing'],
  ['faq', '#pricing'],
  ['contact', '#contact'],
];

export default function Nav() {
  const { path } = useRouter();

  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const [active, setActive] = useState('#home');
  const [pill, setPill] = useState({
    x: 0,
    w: 0,
    on: false,
  });

  const menu = useRef(null);
  const linksRef = useRef(null);

  // Keep navbar visible and update its appearance on scroll
  useEffect(() => {
    let raf = 0;

    const onScroll = () => {
      const y = window.scrollY;

      // Change navbar background after scrolling
      setSolid(y > 30);

      cancelAnimationFrame(raf);

      raf = requestAnimationFrame(() => {
        if (path !== '/') {
          setActive('');
          return;
        }

        const mid = window.innerHeight * 0.4;
        let cur = '#home';

        BLOCKS.forEach(([id, nav]) => {
          const el = document.getElementById(id);

          if (
            el &&
            el.getBoundingClientRect().top <= mid
          ) {
            cur = nav;
          }
        });

        setActive(cur);
      });
    };

    window.addEventListener('scroll', onScroll, {
      passive: true,
    });

    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [path]);

  // Close mobile menu when route changes
  useEffect(() => {
    setOpen(false);
  }, [path]);

  // Sliding active navigation indicator
  useEffect(() => {
    const el =
      linksRef.current &&
      linksRef.current.querySelector(
        `[data-to="${active}"]`
      );

    if (!el) {
      setPill((p) => ({
        ...p,
        on: false,
      }));
      return;
    }

    setPill({
      x: el.offsetLeft,
      w: el.offsetWidth,
      on: true,
    });
  }, [active, path]);

  // Mobile menu animation
  useEffect(() => {
    lockScroll(open);

    const el = menu.current;

    if (open && el) {
      gsap.fromTo(
        el.querySelectorAll('[data-m]'),
        {
          y: 50,
          rotateX: -45,
          opacity: 0,
          transformPerspective: 800,
        },
        {
          y: 0,
          rotateX: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'expo.out',
          stagger: 0.06,
          delay: 0.15,
        }
      );
    }

    return () => lockScroll(false);
  }, [open]);

  return (
    <>
      <header
        className={`nav${solid ? ' is-solid' : ''}${
          open ? ' is-open' : ''
        }`}
      >
        <div className="nav__in">

          {/* Logo */}
          <Link
            to="#home"
            className="nav__logo"
            aria-label={`${SITE.name} — home`}
          >
            <Logo height={38} />
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="nav__links"
            aria-label="Primary"
            ref={linksRef}
          >
            <span
              className={`nav__pill${
                pill.on ? ' is-on' : ''
              }`}
              style={{
                transform: `translateX(${pill.x}px)`,
                width: pill.w,
              }}
            />

            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                data-to={n.to}
                className={`nav__link${
                  active === n.to ? ' is-active' : ''
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          {/* Consultation Button */}
          <div className="nav__cta">
            <Button
              to={SITE.booking || CONSULT_TO}
              className="btn--sm"
            >
              Book a Free Consultation
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="burger"
            aria-label={
              open ? 'Close menu' : 'Open menu'
            }
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <i />
            <i />
          </button>

        </div>
      </header>

      {/* Mobile Navigation */}
      <div
        className={`menu${open ? ' is-open' : ''}`}
        ref={menu}
        aria-hidden={!open}
      >
        <nav
          className="menu__in"
          aria-label="Mobile"
        >
          {NAV.map((n, i) => (
            <Link
              key={n.to}
              to={n.to}
              className={`menu__link${
                active === n.to ? ' is-active' : ''
              }`}
              data-m=""
              tabIndex={open ? 0 : -1}
            >
              <em>
                {String(i + 1).padStart(2, '0')}
              </em>
              {n.label}
            </Link>
          ))}

          <div className="menu__foot" data-m="">
            <Button
              to={SITE.booking || CONSULT_TO}
              magnetic={false}
              tabIndex={open ? 0 : -1}
            >
              Book a Free Consultation
            </Button>
          </div>
        </nav>
      </div>
    </>
  );
}
