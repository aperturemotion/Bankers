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
    const e = s.cut ? 1 : ease(f, s.a, s.b);   // cut: a push-through lands on a matching close-up (the reference style's rare hard cut)
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
export const HouseLights = ({ key = [-9, 14, 8], keyI = 2.6, keyColor = "#DCE8FA", fillI = 0.55, rim = [6, 5, -10], rimI = 1.4, shadowBox = 14, target = [0, 0, 0] }) => {
  const tgt = useMemo(() => { const o = new THREE.Object3D(); o.position.set(...target); return o; }, [target[0], target[1], target[2]]);
  return (
    <>
      <primitive object={tgt} />
      <hemisphereLight args={["#8DB4EA", "#03101F", fillI]} />
      <directionalLight castShadow position={[target[0] + key[0], target[1] + key[1], target[2] + key[2]]} target={tgt} intensity={keyI} color={keyColor}
        shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.0004} shadow-normalBias={0.02}
        shadow-camera-left={-shadowBox} shadow-camera-right={shadowBox} shadow-camera-top={shadowBox} shadow-camera-bottom={-shadowBox} shadow-camera-near={0.5} shadow-camera-far={80} />
      <directionalLight position={[target[0] + rim[0], target[1] + rim[1], target[2] + rim[2]]} target={tgt} intensity={rimI} color="#7FB0F0" />
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
