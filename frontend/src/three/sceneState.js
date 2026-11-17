/**
 * Shared mutable state between React/GSAP (which write it) and the
 * WebGL scene (which reads it every frame). Plain object on purpose —
 * no React renders are triggered by scroll.
 */
export const sceneState = {
  mode: 'ambient',   // 'film' (home scroll film) | 'ambient' (inner pages)
  progress: 0,       // 0..1 across the pinned film
  filmVisible: false,
  mouseX: 0,
  mouseY: 0,
  ready: false,
};
