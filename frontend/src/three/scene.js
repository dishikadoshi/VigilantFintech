/**
 * scene.js — Vigilant Fintech hero film (real-time WebGL, scrubbed by scroll)
 *
 *   0.00  a faceted core inside a teal wireframe shell, satellites on orbit rings
 *   0.30  the shell turns as the core wakes
 *   0.55  seven thin service tags lock into orbit
 *   0.85  everything resolves into a globe of data points (global, remote)
 *
 * Graphite studio, image-based lighting, teal wireframes (logo teal) on dark ink.
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { gsap } from 'gsap';
import { sceneState as S } from './sceneState';
import { SERVICES } from '../content/services';

const NAVY = 0x14233f, TEAL = 0x25c3ad, INK = 0x1b222b;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const damp = (cur, target, rate, dt) => lerp(cur, target, 1 - Math.exp(-rate * dt));

let seed = 11;
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(37,195,173,.30)');
  grad.addColorStop(0.5, 'rgba(37,195,173,.07)');
  grad.addColorStop(1, 'rgba(37,195,173,0)');
  g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

/** Thin pill-shaped service tag. */
function drawTag(canvas, svc) {
  const g = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height, pad = 14, r = (H - pad * 2) / 2;
  g.clearRect(0, 0, W, H);
  const x = pad, y = pad, w = W - pad * 2, h = H - pad * 2;
  g.beginPath();
  g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.arc(x + w - r, y + r, r, -Math.PI / 2, Math.PI / 2);
  g.lineTo(x + r, y + h); g.arc(x + r, y + r, r, Math.PI / 2, Math.PI * 1.5); g.closePath();
  g.shadowColor = 'rgba(2,10,24,.45)'; g.shadowBlur = 18; g.shadowOffsetY = 6;
  g.fillStyle = 'rgba(9,40,74,.94)'; g.fill();
  g.shadowColor = 'transparent';
  g.lineWidth = 2; g.strokeStyle = 'rgba(37,195,173,.8)'; g.stroke();
  g.beginPath(); g.arc(x + r, y + r, 7, 0, Math.PI * 2); g.fillStyle = '#25c3ad'; g.fill();
  g.fillStyle = '#eef3f6';
  g.font = '700 40px "Plus Jakarta Sans Variable", "Helvetica Neue", sans-serif';
  g.textBaseline = 'middle';
  g.fillText(svc.short, x + r * 2 + 6, y + h / 2 + 1);
}

export function createScene(canvas) {
  const mobileQ = window.matchMedia('(max-width: 800px)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let isMobile = mobileQ.matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.fog = new THREE.FogExp2(0x082447, 0.022);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0, 11.5);

  const world = new THREE.Group();
  scene.add(world);
  const key = new THREE.DirectionalLight(0xdff7f2, 1.8); key.position.set(4, 6, 6); scene.add(key);
  const rim = new THREE.PointLight(TEAL, 55, 40); rim.position.set(-7, -2, 5); scene.add(rim);

  // ── core: faceted globe with a wireframe shell ────────────
  const core = new THREE.Group();
  const facets = new THREE.Mesh(new THREE.IcosahedronGeometry(1.7, 1), new THREE.MeshPhysicalMaterial({
    color: 0x34476b, metalness: 0.85, roughness: 0.22, flatShading: true, clearcoat: 1, clearcoatRoughness: 0.15, envMapIntensity: 1.5, emissive: 0x0a2c33, emissiveIntensity: 0.18,
  }));
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.72, 1)), new THREE.LineBasicMaterial({ color: TEAL, transparent: true, opacity: 0.9 }));
  const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(2.35, 2), new THREE.MeshBasicMaterial({ color: TEAL, wireframe: true, transparent: true, opacity: 0.28 }));
  const shell2 = new THREE.Mesh(new THREE.IcosahedronGeometry(3.0, 1), new THREE.MeshBasicMaterial({ color: 0xe9f4f2, wireframe: true, transparent: true, opacity: 0.08 }));
  core.add(facets, edges, shell, shell2);
  const halo = new THREE.Mesh(new THREE.TorusGeometry(3.1, 0.012, 8, 220), new THREE.MeshBasicMaterial({ color: TEAL, transparent: true, opacity: 0.7 }));
  const halo2 = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.008, 8, 220), new THREE.MeshBasicMaterial({ color: 0xe9f4f2, transparent: true, opacity: 0.25 }));
  halo.rotation.x = 1.15; halo2.rotation.x = 1.9; halo2.rotation.y = 0.4;
  core.add(halo, halo2);
  // satellites riding the halo rings
  const sats = [0, 1, 2].map((i) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.11, 18, 18), new THREE.MeshBasicMaterial({ color: i === 1 ? 0xe9f4f2 : TEAL }));
    core.add(m); return m;
  });
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), depthWrite: false, transparent: true, opacity: 0.9 }));
  glow.scale.set(11, 11, 1); glow.position.z = -1;
  core.add(glow);
  world.add(core);

  // ── orbit rings ───────────────────────────────────────────
  const rings = [];
  [[3.5, 0.3, 0.2], [4.05, -0.5, 1.1]].forEach(([r, rx, rz], i) => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.005, 6, 240), new THREE.MeshBasicMaterial({ color: i === 1 ? 0xe9f4f2 : TEAL, transparent: true, opacity: 0.13 }));
    m.rotation.set(Math.PI / 2 + rx, 0, rz);
    world.add(m); rings.push(m);
  });

  // ── thin service tags ─────────────────────────────────────
  const tagGeo = new THREE.PlaneGeometry(3.0, 0.525);
  const cards = SERVICES.map((svc, i) => {
    const cv = document.createElement('canvas');
    cv.width = 800; cv.height = 140;
    drawTag(cv, svc);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false });
    const mesh = new THREE.Mesh(tagGeo, mat);
    world.add(mesh);
    return {
      mesh, mat, tex, cv, svc, i, a: (i / SERVICES.length) * Math.PI * 2,
      scatter: new THREE.Vector3((rnd() - 0.5) * 2, (rnd() - 0.5) * 1.5, -3 + rnd() * 6.5),
      ring: new THREE.Vector3(),
      rotA: new THREE.Euler((rnd() - 0.5) * 1.0, (rnd() - 0.5) * 1.4, (rnd() - 0.5) * 0.8),
      phase: rnd() * 6.28,
    };
  });
  if (document.fonts) {
    document.fonts.load('700 40px "Plus Jakarta Sans Variable"').catch(() => {})
      .then(() => cards.forEach((c) => { drawTag(c.cv, c.svc); c.tex.needsUpdate = true; }));
  }

  // ── data dust → globe (gold + slate points) ───────────────
  const COUNT = isMobile ? 600 : 1300;
  const aScatter = new Float32Array(COUNT * 3), aSphere = new Float32Array(COUNT * 3), aSeed = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    const rr = 3.5 + Math.pow(rnd(), 0.6) * 11;
    const th = rnd() * Math.PI * 2, ph = Math.acos(2 * rnd() - 1);
    aScatter.set([rr * Math.sin(ph) * Math.cos(th), rr * Math.cos(ph) * 0.7, rr * Math.sin(ph) * Math.sin(th)], i * 3);
    const y = 1 - (i / (COUNT - 1)) * 2, rad = Math.sqrt(1 - y * y), ga = i * 2.399963;
    aSphere.set([Math.cos(ga) * rad * 3.6, y * 3.6, Math.sin(ga) * rad * 3.6], i * 3);
    aSeed[i] = rnd();
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(aScatter, 3));
  dustGeo.setAttribute('aScatter', new THREE.BufferAttribute(aScatter, 3));
  dustGeo.setAttribute('aSphere', new THREE.BufferAttribute(aSphere, 3));
  dustGeo.setAttribute('aSeed', new THREE.BufferAttribute(aSeed, 1));
  const dustMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uMix: { value: 0 }, uTime: { value: 0 }, uSize: { value: isMobile ? 4.6 : 5.2 }, uPx: { value: renderer.getPixelRatio() } },
    vertexShader: `
      attribute vec3 aScatter; attribute vec3 aSphere; attribute float aSeed;
      uniform float uMix, uTime, uSize, uPx; varying float vSeed; varying float vDepth;
      void main(){
        vec3 p = mix(aScatter, aSphere, uMix);
        float amp = .2 + .45*(1.-uMix);
        p += vec3(sin(uTime*.35+aSeed*40.), cos(uTime*.28+aSeed*23.), sin(uTime*.22+aSeed*11.))*amp;
        vec4 mv = modelViewMatrix*vec4(p,1.);
        gl_Position = projectionMatrix*mv;
        gl_PointSize = uSize*uPx*(.35+aSeed*.9)*(9./max(.5,-mv.z));
        vSeed = aSeed; vDepth = -mv.z;
      }`,
    fragmentShader: `
      varying float vSeed; varying float vDepth;
      void main(){
        float d = length(gl_PointCoord-.5);
        if(d>.5) discard;
        float a = smoothstep(.5,.15,d);
        vec3 c = mix(vec3(.85,.93,.93), vec3(.145,.76,.68), step(.45,vSeed));
        float fade = clamp(1.-(vDepth-8.)/18.,.12,1.);
        gl_FragColor = vec4(c, a*.5*fade);
      }`,
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  dust.frustumCulled = false; world.add(dust);

  // ── sizing ────────────────────────────────────────────────
  let W = 1, H = 1;
  const resize = () => {
    W = window.innerWidth; H = window.innerHeight;
    isMobile = mobileQ.matches;
    renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.updateProjectionMatrix();
    const aspect = W / H;
    const R = lerp(2.4, 3.5, clamp((aspect - 0.45) / 0.9));
    cards.forEach((c) => {
      c.ring.set(Math.cos(c.a) * R, Math.sin(c.a * 2) * 0.5 + 0.4, Math.sin(c.a) * R);
      const spread = lerp(1.3, 3.2, clamp((aspect - 0.45) / 1.1));
      c.scatterPos = new THREE.Vector3(c.scatter.x * spread, c.scatter.y * spread * 0.85 * (aspect < 1 ? 1.6 : 1), c.scatter.z);
    });
  };
  resize();
  window.addEventListener('resize', resize);

  const cur = { p: 0, globe: 0, coreS: 0.55, shiftX: 0, shiftY: 0, rotY: 0, camZ: 11.5, mx: 0, my: 0, fit: 0.8, az: 0, el: 0.1, roll: 0 };
  const FOV_TAN = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const FOOTPRINT = 4.3; // half-width of the whole object in world units (tag ring + tag, outer orbit ring)
  const tmpQ = new THREE.Quaternion(), tmpE = new THREE.Quaternion(), worldQ = new THREE.Quaternion(), face = new THREE.Quaternion();
    const clock = new THREE.Clock();
  let t = 0, lastScroll = 0, running = true;

  const tick = () => {
    if (!running) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const active = S.mode === 'film' && S.filmVisible;
    canvas.style.opacity = active ? '1' : '0';
    if (!active) return;
    t += dt;
    const sy = window.scrollY || 0;
    const aspect = W / H;
    const desktop = W >= 900;

    const p = S.progress;
    const globe = smooth(0.8, 0.99, p);
    const coreS = lerp(0.36, 1.0, smooth(0.04, 0.5, p)) * (1 - smooth(0.88, 1, p) * 0.45);
    // slide 1 keeps the globe centred; from slide 2 on it drops lower so the top-centre text sits above it
    const shiftY = desktop ? lerp(-0.25, -1.75, smooth(0.04, 0.3, p)) : -2.4;
    const camZ = lerp(13.4, 12.2, smooth(0.04, 0.5, p)) + smooth(0.84, 1, p) * 1.2;
    const k = reduced ? 20 : 6;
    cur.p = damp(cur.p, p, 7, dt);
    cur.globe = damp(cur.globe, globe, 6, dt);
    cur.coreS = damp(cur.coreS, coreS, k, dt);
    cur.shiftY = damp(cur.shiftY, shiftY, k, dt);
    cur.camZ = damp(cur.camZ, camZ, k, dt);
    cur.mx = damp(cur.mx, S.mouseX, 3, dt);
    cur.my = damp(cur.my, S.mouseY, 3, dt);
    cur.rotY += (sy - lastScroll) * 0.0008; lastScroll = sy;

    const P = cur.p;

    // free width between the two text columns (must match --col / gutter in styles.css)
    let fit = 0.6;
    if (desktop) {
      const unitPx = H / (2 * cur.camZ * FOV_TAN);
      const col = clamp(W * 0.24, 250, 420);
      const gut = clamp(W * 0.045, 20, 56);
      const half = W / 2 - gut - 56 - col - 28;
      fit = clamp(half / (FOOTPRINT * unitPx), 0.5, 0.95);
    }
    cur.fit = damp(cur.fit, fit, 8, dt);

    // Horizontal placement is done in screen pixels (camera view offset), so it stays exact while the camera orbits.
    // Start: parked at the right edge. Scroll: glides to the exact centre. Scroll back: returns to the right.
    let shiftPx = 0;
    if (desktop) {
      const unitPx = H / (2 * cur.camZ * FOV_TAN);
      const gut = clamp(W * 0.045, 20, 56);
      const rightPark = Math.max(0, W / 2 - gut - 56 - 12 - FOOTPRINT * cur.fit * unitPx);
      shiftPx = rightPark * (1 - smooth(0.0, 0.4, P));
    }
    cur.shiftX = damp(cur.shiftX, shiftPx, reduced ? 20 : 7, dt);
    camera.setViewOffset(W, H, -cur.shiftX, 0, W, H);

    world.position.set(0, cur.shiftY, 0);
    world.scale.setScalar(cur.fit);
    world.rotation.y = P * Math.PI * 0.9 + t * 0.05 + cur.rotY + cur.mx * 0.12;
    world.rotation.x = cur.my * 0.06 + smooth(0.5, 0.85, P) * 0.1;

    // camera flies an arc around the object as you scroll (fully reversible): azimuth sweep, rise-and-dip, slight roll
    const azT = -0.8 * (1 - smooth(0.0, 0.4, P)) + smooth(0.4, 1.0, P) * 0.95 + cur.mx * 0.18;
    const elT = 0.06 + Math.sin(P * Math.PI * 2) * 0.3 - cur.my * 0.1;
    const rollT = Math.sin(P * Math.PI * 2 + 0.6) * 0.05;
    cur.az = damp(cur.az, azT, 9, dt);
    cur.el = damp(cur.el, elT, 9, dt);
    cur.roll = damp(cur.roll, rollT, 9, dt);
    const cd = cur.camZ, ce = Math.cos(cur.el);
    camera.position.set(Math.sin(cur.az) * ce * cd, Math.sin(cur.el) * cd, Math.cos(cur.az) * ce * cd);
    camera.up.set(Math.sin(cur.roll), Math.cos(cur.roll), 0);
    camera.lookAt(0, 0, 0);

    // tower stays roughly front-on while the world orbits
    core.scale.setScalar(cur.coreS);
    facets.rotation.y = t * 0.18 + P * 3; facets.rotation.x = t * 0.07; edges.rotation.copy(facets.rotation);
    shell.rotation.y = -t * 0.1 - P * 2; shell.rotation.z = t * 0.04; shell2.rotation.y = t * 0.05; shell2.rotation.x = -t * 0.03;
    core.position.y = Math.sin(t * 1.0) * 0.06;
    halo.rotation.z = t * 0.2; halo2.rotation.z = -t * 0.14;
    sats.forEach((m, i) => { const a = t * (0.5 + i * 0.17) + i * 2.1, r = i === 1 ? 3.6 : 3.1; const v = new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0); v.applyEuler(i === 1 ? halo2.rotation : halo.rotation); m.position.copy(v); });
    halo.material.opacity = 0.25 + cur.coreS * 0.45;
    glow.material.opacity = clamp(0.25 + cur.coreS * 0.7);
    rings.forEach((m, i) => { m.rotation.z += dt * (0.05 + i * 0.03); });

    // service tags
    worldQ.setFromEuler(world.rotation).invert();
    face.copy(worldQ).multiply(camera.quaternion);
    cards.forEach((c, i) => {
      const m = smooth(0.5 + i * 0.02, 0.76 + i * 0.02, P);
      const bob = Math.sin(t * 0.9 + c.phase) * 0.12;
      const sp = c.scatterPos || c.scatter;
      c.mesh.position.set(
        lerp(sp.x + Math.sin(t * 0.3 + c.phase) * 0.4, c.ring.x, m),
        lerp(sp.y + bob, c.ring.y + bob * 0.4, m),
        lerp(sp.z, c.ring.z, m)
      );
      tmpE.setFromEuler(c.rotA); tmpQ.copy(tmpE);
      c.mesh.quaternion.copy(tmpQ.slerp(face, lerp(0.55, 1, m)));
      const vis = (1 - smooth(0.88, 1, P)) * smooth(0.36, 0.5, P);
      c.mesh.scale.setScalar(Math.max(0.0001, lerp(0.7, 1, m) * vis) * (!desktop && aspect < 0.8 ? 0.62 : 1));
      c.mat.opacity = vis;
    });

    dustMat.uniforms.uTime.value = t;
    dustMat.uniforms.uMix.value = cur.globe;
    dust.rotation.y = t * 0.03;

    renderer.render(scene, camera);
  };

  gsap.ticker.add(tick);
  const onMouse = (e) => {
    S.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    S.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  };
  window.addEventListener('pointermove', onMouse, { passive: true });
  S.ready = true;
  tick();

  return () => {
    running = false;
    gsap.ticker.remove(tick);
    window.removeEventListener('resize', resize);
    window.removeEventListener('pointermove', onMouse);
    cards.forEach((c) => { c.tex.dispose(); c.mat.dispose(); });
    dustGeo.dispose(); dustMat.dispose(); tagGeo.dispose(); 
    pmrem.dispose(); renderer.dispose();
  };
}
