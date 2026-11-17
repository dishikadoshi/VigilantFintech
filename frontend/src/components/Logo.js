import React from 'react';
import logo from '../assets/logo.png';
import mark from '../assets/mark.png';
import { SITE } from '../config/site';

/** The Vigilant Fintech logo (supplied artwork). */
export default function Logo({ height = 40, className = '' }) {
  return <img className={`logo ${className}`} src={logo} alt={SITE.name} height={height} style={{ height }} draggable="false" />;
}

export function Mark({ size = 40, className = '' }) {
  return <img className={className} src={mark} alt="" width={size} style={{ width: size, height: 'auto' }} draggable="false" />;
}
