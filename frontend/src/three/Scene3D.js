import React, { useEffect, useRef } from 'react';
import { createScene } from './scene';

/** Fixed full-viewport WebGL canvas that sits behind every page. */
export default function Scene3D() {
  const ref = useRef(null);
  useEffect(() => {
    let dispose;
    try {
      const probe = document.createElement('canvas');
      const ok = !!(probe.getContext('webgl2') || probe.getContext('webgl'));
      if (ok && ref.current) dispose = createScene(ref.current);
      else document.documentElement.classList.add('no-webgl');
    } catch (e) {
      console.warn('[Scene3D] WebGL scene disabled:', e);
      document.documentElement.classList.add('no-webgl');
    }
    return () => dispose && dispose();
  }, []);
  return <canvas ref={ref} className="scene" aria-hidden="true" />;
}
