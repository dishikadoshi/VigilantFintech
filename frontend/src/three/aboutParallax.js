/**
 * aboutParallax.js — "Depth Tunnel": a real-time 3D fly-through used as the sticky backdrop of the
 * whole About section. The camera travels down a tunnel of hex frames while shards, data streaks and
 * dust sit at wildly different depths, so every scroll step produces extreme parallax.
 *
 *   state.p  0..1  scroll progress through the About section
 *   scroll speed   → FOV warp + camera roll + streak stretch
 *   pointer        → camera drifts / looks around
 */
import * as THREE from 'three';
import { gsap } from 'gsap';
import { scrollVelocity } from '../lib/smooth';

const TEAL = 0x2cc9b4;
const SKY = 0x5cb8ff;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const damp = (c, t, r, dt) => lerp(c, t, 1 - Math.exp(-r * dt));
const rnd = (a, b) => a + Math.random() * (b - a);

export function createParallaxScene(canvas, state) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x061a33, 0.03);
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 220);

  const LEN = 130; // tunnel length
  const root = new THREE.Group(); scene.add(root);

  /* ── hex frames (thin hexagonal tori) ─────────────────────────── */
  const frames = [];
  const FN = 28;
  for (let i = 0; i < FN; i++) {
    const r = 5.2 + (i % 4) * 1.5;
    const geo = new THREE.TorusGeometry(r, i % 5 === 0 ? 0.07 : 0.028, 4, 6);
    const mat = new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? 0xe8fffb : i % 3 === 1 ? TEAL : SKY, transparent: true, opacity: i % 5 === 0 ? 0.5 : 0.55 });
    const m = new THREE.Mesh(geo, mat);
    m.position.z = -i * (LEN / FN) - 4;
    m.rotation.z = i * 0.42;
    root.add(m);
    frames.push({ m, s: (i % 2 ? 1 : -1) * (0.08 + (i % 5) * 0.045) });
  }

  /* ── speed streaks (short lines parallel to the tunnel) ────────── */
  const SN = 260;
  const sp = new Float32Array(SN * 6);
  const sdata = [];
  for (let i = 0; i < SN; i++) {
    const a = Math.random() * Math.PI * 2, r = rnd(3.2, 15), z = -Math.random() * LEN, len = rnd(1.5, 6);
    sdata.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, z, len });
  }
  const sg = new THREE.BufferGeometry();
  sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const streaks = new THREE.LineSegments(sg, new THREE.LineBasicMaterial({ color: 0x9ff1e4, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false }));
  streaks.frustumCulled = false; root.add(streaks);

  /* ── floating shards at many depths ───────────────────────────── */
  const geos = [new THREE.OctahedronGeometry(1), new THREE.IcosahedronGeometry(1, 0), new THREE.TetrahedronGeometry(1.1), new THREE.BoxGeometry(1.2, 1.2, 1.2), new THREE.TorusKnotGeometry(0.7, 0.2, 48, 6)];
  const shards = [];
  for (let i = 0; i < 54; i++) {
    const g = geos[i % geos.length];
    const wire = i % 3 !== 0;
    const mat = new THREE.MeshBasicMaterial({ color: [TEAL, SKY, 0xe8fffb][i % 3], wireframe: wire, transparent: true, opacity: wire ? 0.75 : 0.2 });
    const m = new THREE.Mesh(g, mat);
    const a = Math.random() * Math.PI * 2, r = rnd(3.6, 12);
    m.position.set(Math.cos(a) * r, Math.sin(a) * r, -rnd(4, LEN));
    m.scale.setScalar(rnd(0.3, 1.5));
    m.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
    root.add(m);
    shards.push({ m, base: m.position.clone(), rx: rnd(-0.6, 0.6), ry: rnd(-0.6, 0.6), ph: Math.random() * 6, amp: rnd(0.2, 0.9) });
  }

  /* ── hero core: nested wireframes camera flies through ────────── */
  const core = new THREE.Group(); core.position.set(0, 0, -16); root.add(core);
  const c1 = new THREE.Mesh(new THREE.IcosahedronGeometry(2.6, 1), new THREE.MeshBasicMaterial({ color: TEAL, wireframe: true, transparent: true, opacity: 0.6 }));
  const c2 = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 2), new THREE.MeshBasicMaterial({ color: 0xe8fffb, wireframe: true, transparent: true, opacity: 0.35 }));
  const c3 = new THREE.Mesh(new THREE.SphereGeometry(0.7, 24, 24), new THREE.MeshBasicMaterial({ color: 0xbffcf2, transparent: true, opacity: 0.55 }));
  core.add(c1, c2, c3);

  /* second landmark deeper in the tunnel */
  const gate = new THREE.Group(); gate.position.set(0, 0, -78); root.add(gate);
  [3, 4.6, 6.2].forEach((r, i) => {
    const t = new THREE.Mesh(new THREE.TorusGeometry(r, 0.06, 6, 64), new THREE.MeshBasicMaterial({ color: i === 1 ? 0xe8fffb : TEAL, transparent: true, opacity: 0.7 }));
    gate.add(t);
  });

  /* ── dust ─────────────────────────────────────────────────────── */
  const DN = 1800, dp = new Float32Array(DN * 3);
  for (let i = 0; i < DN; i++) {
    const a = Math.random() * Math.PI * 2, r = rnd(1.5, 17);
    dp[i * 3] = Math.cos(a) * r; dp[i * 3 + 1] = Math.sin(a) * r; dp[i * 3 + 2] = -Math.random() * LEN;
  }
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: 0xbffcf2, size: 0.07, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending }));
  dust.frustumCulled = false; root.add(dust);

  /* ── sizing / input ───────────────────────────────────────────── */
  const host = canvas.parentElement;
  const resize = () => {
    const r = host.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / Math.max(1, r.height); camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize); ro.observe(host);
  const mouse = { x: 0, y: 0 };
  const onMove = (e) => { mouse.x = (e.clientX / window.innerWidth - 0.5) * 2; mouse.y = (e.clientY / window.innerHeight - 0.5) * 2; };
  window.addEventListener('pointermove', onMove, { passive: true });

  const sectionEl = canvas.closest('section') || host;
  let vis = true;
  const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; }); io.observe(sectionEl);

  const cur = { p: 0, mx: 0, my: 0, warp: 0, roll: 0 };
  let t = 0, last = performance.now() / 1000;
  const END = LEN - 12;

  const tick = () => {
    const now = performance.now() / 1000; const dt = Math.min(0.05, now - last); last = now;
    if (!vis) return;
    t += dt;

    cur.p = damp(cur.p, state.p, 4.5, dt);
    cur.mx = damp(cur.mx, mouse.x, 3, dt); cur.my = damp(cur.my, mouse.y, 3, dt);
    const v = scrollVelocity.v || 0;
    cur.warp = damp(cur.warp, clamp(Math.abs(v) * 0.02), 4, dt);
    cur.roll = damp(cur.roll, clamp(v * 0.0016, -0.35, 0.35), 3, dt);

    // camera dives down the tunnel with scroll, twists as it goes, drifts with the pointer
    const cz = 8 - cur.p * END;
    camera.position.set(cur.mx * 1.9, -cur.my * 1.2, cz);
    camera.rotation.set(-cur.my * 0.07, -cur.mx * 0.1, cur.p * Math.PI * 0.9 + cur.roll + Math.sin(t * 0.25) * 0.03);
    camera.fov = 60 + cur.warp * 26; camera.updateProjectionMatrix();

    frames.forEach((f) => { f.m.rotation.z += f.s * dt * (1 + cur.warp * 6); });
    shards.forEach((s, i) => {
      s.m.rotation.x += s.rx * dt; s.m.rotation.y += s.ry * dt;
      s.m.position.x = s.base.x + Math.sin(t * 0.5 + s.ph) * s.amp;
      s.m.position.y = s.base.y + Math.cos(t * 0.4 + s.ph + i) * s.amp;
    });
    core.rotation.set(t * 0.3, t * 0.45, 0); c2.rotation.set(-t * 0.6, t * 0.2, 0);
    c3.scale.setScalar(1 + Math.sin(t * 2.2) * 0.12);
    gate.rotation.z = t * 0.2; gate.children.forEach((c, i) => { c.rotation.x = Math.sin(t * 0.6 + i) * 0.25; c.rotation.y = Math.cos(t * 0.5 + i) * 0.25; });

    // streaks stretch with scroll speed
    const stretch = 1 + cur.warp * 7;
    for (let i = 0; i < SN; i++) {
      const d = sdata[i];
      sp[i * 6] = d.x; sp[i * 6 + 1] = d.y; sp[i * 6 + 2] = d.z;
      sp[i * 6 + 3] = d.x; sp[i * 6 + 4] = d.y; sp[i * 6 + 5] = d.z - d.len * stretch;
    }
    sg.attributes.position.needsUpdate = true;
    streaks.material.opacity = 0.3 + cur.warp * 0.5;
    dust.rotation.z = t * 0.02;

    renderer.render(scene, camera);
  };
  gsap.ticker.add(tick);

  return () => {
    gsap.ticker.remove(tick); ro.disconnect(); io.disconnect();
    window.removeEventListener('pointermove', onMove);
    scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    renderer.dispose();
  };
}
