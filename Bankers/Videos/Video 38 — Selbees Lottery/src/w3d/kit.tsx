// @ts-nocheck
// ★ BANKERS 3-D WORLD KIT (Video 38 on; Timur, 2026-11-25: the new reference style — a real 3-D world the camera flies through).
//   One WebGL world (three.js through @remotion/three) for the whole film, ONE continuous camera path, the Bankers palette as the
//   light of that world (blue-hour key, navy fog, cool rims; warm only in small practical lights), and a shared projector so the
//   HTML overlays (chips with leader lines, counters, photo insets) pin to 3-D points exactly where WebGL draws them.
//
//   camAt(f)            → { pos, target, fov, roll }  the camera at frame f (shots eased with smootherstep, a slow idle drift)
//   project(p, f)       → { x, y, z, behind }          a world point → frame px (1080 × 1920), from the SAME camera maths
//   <World3D shots>     the canvas: renderer (ACES, sRGB, soft shadows), an environment for reflections, fog, the key/fill/rim
//   MAT / TEX           the house materials and canvas-drawn textures (print, paper, signage), deterministic
import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig, delayRender, continueRender } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export const W = 1080, H = 1920;
// ── easing ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
export const clamp01 = (v) => Math.max(0, Math.min(1, v));
export const smoother = (t) => { const x = clamp01(t); return x * x * x * (x * (x * 6 - 15) + 10); };
export const ease = (f, a, b) => (b <= a ? (f >= b ? 1 : 0) : smoother((f - a) / (b - a)));
export const easeOut = (f, a, b) => { const x = clamp01((f - a) / Math.max(1e-6, b - a)); return 1 - Math.pow(1 - x, 3); };
export const lerp = (a, b, t) => a + (b - a) * t;
export const lerp3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
// ── the camera path ─────────────────────────────────────────────────────────────────────────────────────────────────────
// shots: [{ a, b, pos, target, fov?, roll?, arc? }] sorted by a. Before shot 0's a the camera holds shot 0. Between shot i's a and b
// it travels from where it was to shot i (smootherstep, so it starts and lands soft); after b it holds, with a slow drift.
// arc (optional): world units the travel bows UP at its middle (a crane over something in between).
// cut (optional): jump to this shot at a (only after a push INTO a surface that fills the frame — the next shot starts on a matching surface).
export const makeCam = (shots, drift = 1) => (f) => {
  let pos = shots[0].pos, target = shots[0].target, fov = shots[0].fov ?? 34, roll = shots[0].roll ?? 0;
  for (let i = 1; i < shots.length; i++) {
    const s = shots[i];
    if (f <= s.a) break;
    let e = s.cut ? 1 : ease(f, s.a, s.b);   // cut: a push-through lands on a matching close-up (the reference style's rare hard cut)
    // ZOOMS EASE IN WHAT THE EYE SEES (Bankers §2.5.1d): a push or pull that changes the distance to the aim by > 2.5× interpolates
    // that distance GEOMETRICALLY, so the apparent zoom rate is what is eased (a linear one made a close-up balloon in 2–3 frames)
    if (!s.cut && e > 0 && e < 1 && s.zoom !== false) {
      const d0 = Math.hypot(pos[0] - target[0], pos[1] - target[1], pos[2] - target[2]);
      const d1 = Math.hypot(s.pos[0] - s.target[0], s.pos[1] - s.target[1], s.pos[2] - s.target[2]);
      if (d0 > 1e-6 && d1 > 1e-6 && Math.abs(Math.log(d1 / d0)) > Math.log(2.5)) e = clamp01((d0 * Math.pow(d1 / d0, e) - d0) / (d1 - d0));
    }
    const lift = (s.arc ?? 0) * Math.sin(Math.PI * e);
    pos = lerp3(pos, s.pos, e); pos = [pos[0], pos[1] + lift, pos[2]];
    target = lerp3(target, s.target, e);
    fov = lerp(fov, s.fov ?? fov, e); roll = lerp(roll, s.roll ?? 0, e);
  }
  // idle drift: tiny, slow, never a jitter (two incommensurate sines per axis)
  const d = drift;
  pos = [pos[0] + d * 0.06 * Math.sin(f / 97), pos[1] + d * 0.04 * Math.sin(f / 131 + 1), pos[2] + d * 0.05 * Math.sin(f / 113 + 2)];
  return { pos, target, fov, roll };
};
// ★ ONE CONTINUOUS GLIDE (Timur, 2026-11-26: "the camera movement … is not smooth … it just moves a bit, like each several shots …
//   it just shakes … smoothen the camera movement a lot more"). makeCam eases every shot from rest to rest, so chained shots stopped
//   and started ~27 times in the film (measured: speed < 0.05°/f between moves of > 0.3°/f). smoothCam low-passes the WHOLE path
//   (pos, target, fov, roll) with a Gaussian of SIGMA frames, segment by segment between hard cuts; each segment is padded by POINT
//   REFLECTION about its end frames, so a cut's two frames (the matched seal at 882/883 etc.) keep their exact pose and velocity.
//   Short stops melt into one flowing move; holds longer than ~1 s still hold.
export const smoothCam = (cam, total, cuts, sigma = 10, taper = 24) => {
  // smoothed in a camera-shaped space: the aim point, the view DIRECTION and log DISTANCE (so a close macro never swings), fov, roll;
  // the Gaussian narrows to nothing over `taper` frames before/after a hard cut (a push into a cut is one designed ease already, and
  // the matched cut's frames must stay exactly where they were authored)
  const N = total + 2, R = Math.ceil(sigma * 3);
  const X = [];
  for (let f = 0; f < N; f++) {
    const k = cam(f), dx = k.pos[0] - k.target[0], dy = k.pos[1] - k.target[1], dz = k.pos[2] - k.target[2];
    const d = Math.max(1e-4, Math.hypot(dx, dy, dz));
    X.push([k.target[0], k.target[1], k.target[2], dx / d, dy / d, dz / d, Math.log(d), k.fov, k.roll ?? 0]);
  }
  const D = X[0].length;
  // FLIGHTS between places (the raw camera travelling > 0.35 m a frame) are single designed eases across hundreds of metres: a
  // Gaussian would start them ~20 f early (tags still up, the next place not yet mounted). They are kept raw, like a cut, and the
  // smoothing fades in over `taper` frames either side of them.
  // (a flight = a run of frames moving > 0.15 m/f whose total travel exceeds 30 m — the hops between places, not the local moves
  // around a big set like the road's car)
  const fast = new Array(N).fill(false), stepLen = new Array(N).fill(0);
  for (let f = 1; f < N; f++) { const p = cam(f).pos, q = cam(f - 1).pos; stepLen[f] = Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]); }
  for (let f = 1; f < N; ) {
    if (stepLen[f] <= 0.15) { f++; continue; }
    let g = f, tot = 0; while (g < N && stepLen[g] > 0.15) { tot += stepLen[g]; g++; }
    if (tot > 30) for (let k = f - 1; k < g; k++) fast[k] = true;
    f = g;
  }
  const distFast = new Array(N).fill(1e9);
  for (let f = 0, last = -1e9; f < N; f++) { if (fast[f]) last = f; distFast[f] = f - last; }
  for (let f = N - 1, next = 1e9; f >= 0; f--) { if (fast[f]) next = f; distFast[f] = Math.min(distFast[f], next - f); }
  const bounds = [0, ...cuts.map((c) => c + 1).filter((c) => c > 0 && c < N), N];   // a cut shot at a jumps between a and a + 1
  const out = new Array(N);
  for (let si = 0; si < bounds.length - 1; si++) {
    const a0 = bounds[si], a1 = bounds[si + 1] - 1;
    const at = (i) => {                      // point reflection outside [a0, a1]
      if (i < a0) { const m = Math.min(a1, 2 * a0 - i); return X[a0].map((v, j) => 2 * v - X[m][j]); }
      if (i > a1) { const m = Math.max(a0, 2 * a1 - i); return X[a1].map((v, j) => 2 * v - X[m][j]); }
      return X[i];
    };
    for (let f = a0; f <= a1; f++) {
      const edge = Math.min(si > 0 ? f - a0 : 1e9, si < bounds.length - 2 ? a1 - f : 1e9, distFast[f]);
      const sg = sigma * Math.min(1, Math.max(0, edge / taper));
      if (sg < 0.35) { out[f] = X[f]; continue; }
      const r = Math.min(R, Math.ceil(sg * 3));
      const acc = new Array(D).fill(0); let ws = 0;
      for (let k = -r; k <= r; k++) { const wk = Math.exp(-(k * k) / (2 * sg * sg)), x = at(f + k); ws += wk; for (let j = 0; j < D; j++) acc[j] += wk * x[j]; }
      out[f] = acc.map((v) => v / ws);
    }
  }
  return (f) => {
    const v = out[Math.max(0, Math.min(N - 1, Math.round(f)))];
    const n = Math.hypot(v[3], v[4], v[5]) || 1, d = Math.exp(v[6]);
    return { pos: [v[0] + v[3] / n * d, v[1] + v[4] / n * d, v[2] + v[5] / n * d], target: [v[0], v[1], v[2]], fov: v[7], roll: v[8] };
  };
};
const camObj = new THREE.PerspectiveCamera(34, W / H, 0.05, 600);
const setCam = (c, k) => {
  c.fov = k.fov; c.aspect = W / H; c.near = 0.05; c.far = 600; c.updateProjectionMatrix();
  c.position.set(k.pos[0], k.pos[1], k.pos[2]);
  c.up.set(Math.sin(k.roll), Math.cos(k.roll), 0);
  c.lookAt(k.target[0], k.target[1], k.target[2]);
  c.updateMatrixWorld(true);
};
export const projectWith = (k, p) => {
  setCam(camObj, k);
  const v = new THREE.Vector3(p[0], p[1], p[2]);
  const camSpace = v.clone().applyMatrix4(camObj.matrixWorldInverse);
  v.project(camObj);
  return { x: (v.x + 1) / 2 * W, y: (1 - v.y) / 2 * H, z: -camSpace.z, behind: camSpace.z > 0 };
};
// the R3F side: drives the canvas camera from the same function every frame
const CamDriver = ({ cam }) => {
  const f = useCurrentFrame();
  const { camera } = useThree();
  setCam(camera, cam(f));
  return null;
};
// ── the renderer, environment and light ─────────────────────────────────────────────────────────────────────────────────
const Setup = ({ fog }) => {
  const { gl, scene } = useThree();
  useMemo(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.0;
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.55;
    pm.dispose();
  }, [gl, scene]);
  scene.fog = fog ? new THREE.FogExp2(fog.color, fog.density) : null;
  scene.background = new THREE.Color(fog?.sky ?? "#06203F");
  return null;
};
// THE BANKERS LIGHT: a cool key from the upper left (the house key), a navy hemisphere fill, a pale-blue rim from behind
// gain: the integrator's blend weight when two stations are mounted at once (their lights cross-fade instead of doubling);
// casts: only the dominant station's key casts shadows. keyPos = the key's offset (`key` is reserved by React and never arrives).
export const HouseLights = ({ keyPos = [-9, 14, 8], keyI = 2.6, keyColor = "#DCE8FA", fillI = 0.55, rim = [6, 5, -10], rimI = 1.4, shadowBox = 14, target = [0, 0, 0], gain = 1, casts = true }) => {
  const key = keyPos;
  const tgt = useMemo(() => { const o = new THREE.Object3D(); o.position.set(...target); return o; }, [target[0], target[1], target[2]]);
  return (
    <>
      <primitive object={tgt} />
      <hemisphereLight args={["#8DB4EA", "#03101F", fillI * gain]} />
      <directionalLight castShadow={casts} position={[target[0] + key[0], target[1] + key[1], target[2] + key[2]]} target={tgt} intensity={keyI * gain} color={keyColor}
        shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.0004} shadow-normalBias={0.02}
        shadow-camera-left={-shadowBox} shadow-camera-right={shadowBox} shadow-camera-top={shadowBox} shadow-camera-bottom={-shadowBox} shadow-camera-near={0.5} shadow-camera-far={80} />
      <directionalLight position={[target[0] + rim[0], target[1] + rim[1], target[2] + rim[2]]} target={tgt} intensity={rimI * gain} color="#7FB0F0" />
    </>
  );
};
export const World3D = ({ cam, fog = { color: "#0A2A52", density: 0.018, sky: "#071F3E" }, children }) => (
  <ThreeCanvas width={W} height={H} shadows gl={{ antialias: true, preserveDrawingBuffer: true }} camera={{ fov: 34, near: 0.05, far: 600, position: [0, 2, 10] }}
    style={{ position: "absolute", left: 0, top: 0 }}>
    <Setup fog={fog} />
    <CamDriver cam={cam} />
    {children}
  </ThreeCanvas>
);
// ── the house palette for materials (the Bankers blue family; warm accents only for small practical lights) ─────────────────
export const PAL = {
  logo: "#005DC8", ground: "#001C3C", lift: "#003470", light: "#4D8ED9", core: "#B3CEEF", deep: "#002F64", white: "#FFFFFF",
  steel: "#8FA9C8", paper: "#EEF3FA", ink: "#0B2547", red: "#D93A3A", warm: "#FFC97A", green: "#3FA372"
};
export const std = (color, rough = 0.55, metal = 0.05, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra });
export const phys = (color, extra = {}) => new THREE.MeshPhysicalMaterial({ color, ...extra });
// ── canvas textures (print, signage) — drawn once per key, after the page fonts are loaded ─────────────────────────────────
const texCache = new Map();
let fontsReady = false;
if (typeof document !== "undefined") {
  const h = delayRender("w3d fonts");
  document.fonts.ready.then(() => { fontsReady = true; continueRender(h); });
}
/** canvasTex(key, w, h, draw(ctx, w, h)) → a THREE.CanvasTexture (sRGB, anisotropic), cached by key */
export const canvasTex = (key, w, h, draw) => {
  if (texCache.has(key)) return texCache.get(key);
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const ctx = c.getContext("2d");
  draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.needsUpdate = true;
  texCache.set(key, t);
  return t;
};
/** a deterministic pseudo-random in [0,1) from an integer seed */
export const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ── the sky: a big inverted sphere with a vertical gradient (zenith navy → the logo blue → a pale horizon glow) ───────────────
export const Sky = ({ zenith = "#020F24", mid = "#082A57", horizon = "#3F72B4", glowAt = 0.52, radius = 400 }) => {
  const tex = useMemo(() => canvasTex(`sky_${zenith}_${mid}_${horizon}_${glowAt}`, 8, 512, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, zenith); g.addColorStop(0.32, mid); g.addColorStop(glowAt, horizon); g.addColorStop(0.62, "#0B2A50"); g.addColorStop(1, "#061A33");
    c.fillStyle = g; c.fillRect(0, 0, w, h);
  }), [zenith, mid, horizon, glowAt]);
  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[radius, 48, 32]} />
      <meshBasicMaterial map={tex} side={THREE.BackSide} fog={false} depthWrite={false} />
    </mesh>
  );
};
// ── a soft light glow (an additive sprite): for lamps, lit windows, a screen, the jackpot's light ─────────────────────────────
const glowTex = () => canvasTex("glow", 128, 128, (c, w, h) => {
  const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.18, "rgba(255,255,255,0.55)"); g.addColorStop(0.5, "rgba(255,255,255,0.12)"); g.addColorStop(1, "rgba(255,255,255,0)");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
});
export const Glow = ({ position, size = 2, color = "#FFC97A", opacity = 0.8 }) => {
  const tex = useMemo(glowTex, []);
  return (
    <sprite position={position} scale={[size, size, size]}>
      <spriteMaterial map={tex} color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} />
    </sprite>
  );
};
