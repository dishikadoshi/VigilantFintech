import React, { useEffect, useMemo, useRef, useState } from 'react';
import { COUNTRIES, getCountry, matchDial } from '../content/countries';

const MAX_DIGITS = 15;
const HINTS = { IN: '98765 43210', US: '555-0000', CA: '555-0000', GB: '7400 123456', AU: '412 345 678' };

/**
 * Phone input with a searchable country-code picker.
 * `country` is an ISO code (e.g. "IN"), `value` is the national number only.
 * The parent stores them separately: countryCode "+91" and phone "9876543210".
 */
export default function PhoneField({ id, label, country, value, onCountry, onValue }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const box = useRef(null);
  const list = useRef(null);
  const cur = getCountry(country);

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase().replace(/^\+/, '');
    if (!s) return COUNTRIES;
    return COUNTRIES.filter((c) =>
      c.name.toLowerCase().includes(s) || c.iso.toLowerCase() === s || c.dial.startsWith(s)
    );
  }, [q]);

  const close = () => { setOpen(false); setQ(''); };

  const pick = (c) => {
    onCountry(c.iso);
    close();
    const el = box.current && box.current.querySelector('.phone__num');
    if (el) el.focus();
  };

  useEffect(() => {
    if (!open) return undefined;
    const away = (e) => { if (box.current && !box.current.contains(e.target)) close(); };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [open]);

  useEffect(() => { setActive(0); }, [q, open]);

  useEffect(() => {
    const el = list.current && list.current.children[active];
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const onSearchKey = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, shown.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (shown[active]) pick(shown[active]); }
  };

  const onNumber = (e) => {
    let v = e.target.value;
    // Pasting "+91 98765 43210" picks the country and keeps only the local number.
    if (v.trim().startsWith('+')) {
      const m = matchDial(v.replace(/\D/g, ''), country);
      if (m) { onCountry(m.country.iso); v = m.rest; }
    }
    onValue(v.replace(/[^\d\s-]/g, '').slice(0, MAX_DIGITS + 6));
  };

  return (
    <div className="fld phone-fld">
      <label className="phone__lbl" htmlFor={id}>{label}</label>

      <div className={`phone${open ? ' is-open' : ''}`} ref={box}>
        <button
          type="button"
          className="phone__cc"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`Country code: ${cur.name} +${cur.dial}`}
          onClick={() => setOpen((o) => !o)}
        >
          <em>{cur.iso}</em>
          <b>+{cur.dial}</b>
          <svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true"><path d="M2.5 4.5L6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>

        <input
          className="phone__num"
          required
          type="tel"
          inputMode="tel"
          id={id}
          name="phone"
          autoComplete="tel-national"
          placeholder={HINTS[cur.iso] || 'Phone number'}
          value={value}
          onChange={onNumber}
        />

        {open && (
          <div className="phone__pop">
            <input
              className="phone__search"
              type="text"
              autoFocus
              autoComplete="off"
              placeholder="Search country…"
              aria-label="Search country"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onSearchKey}
            />
            <ul className="phone__list" role="listbox" ref={list} data-lenis-prevent>
              {shown.map((c, i) => (
                <li
                  key={c.iso}
                  role="option"
                  aria-selected={c.iso === cur.iso}
                  className={`${i === active ? 'is-active ' : ''}${c.iso === cur.iso ? 'is-sel' : ''}`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => pick(c)}
                >
                  <em>{c.iso}</em>
                  <span>{c.name}</span>
                  <b>+{c.dial}</b>
                </li>
              ))}
              {!shown.length && <li className="phone__none" role="presentation">No country found</li>}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
