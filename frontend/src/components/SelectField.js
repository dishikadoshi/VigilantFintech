import React, { useEffect, useRef, useState } from 'react';

/**
 * Custom dropdown that matches the phone country picker.
 * `options` is an array of strings. Empty `value` shows the placeholder.
 */
export default function SelectField({ id, label, placeholder, options, value, onChange, className = '' }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const box = useRef(null);
  const list = useRef(null);

  const close = () => setOpen(false);
  const pick = (o) => { onChange(o); close(); };

  useEffect(() => {
    if (!open) return undefined;
    const away = (e) => { if (box.current && !box.current.contains(e.target)) close(); };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [open]);

  useEffect(() => {
    if (open) setActive(Math.max(0, options.indexOf(value)));
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const el = open && list.current && list.current.children[active];
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const onKey = (e) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); setOpen(true); }
      return;
    }
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'Tab') close();
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, options.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(options[active]); }
  };

  return (
    <div className={`fld sel-fld${open ? ' is-open' : ''} ${className}`} ref={box}>
      <label className="sel__lbl" htmlFor={id}>{label}</label>

      <div className={`sel${open ? ' is-open' : ''}`}>
        <button
          type="button"
          id={id}
          className={`sel__btn${value ? '' : ' is-empty'}`}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={onKey}
        >
          <span>{value || placeholder}</span>
          <svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true"><path d="M2.5 4.5L6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>

        {open && (
          <div className="phone__pop sel__pop">
            <ul className="phone__list" role="listbox" ref={list} data-lenis-prevent>
              {options.map((o, i) => (
                <li
                  key={o}
                  role="option"
                  aria-selected={o === value}
                  className={`sel__opt ${i === active ? 'is-active ' : ''}${o === value ? 'is-sel' : ''}`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => pick(o)}
                >
                  <span>{o}</span>
                  {o === value && (
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
