import React from "react";
import { project, type Rig } from "./rig";

// ══════════════════════════════════════════════════════════════════════════════════════════════
// SOLIDS IN REAL DEPTH, AS SVG (Video 12). Every object of this film is built from boxes, prisms and cylinders whose corners are projected
// through ONE perspective rig per object (rig.tsx `project`: CSS's own order and maths), each face kept only if it faces the camera and
// painted far to near. It is the plane rig's projection without CSS 3-D transforms: plain SVG polygons recomputed every frame, so
// nothing can go stale in the render (STYLE §16, 2026-10-16) and every object holds its depth at rest (STYLE §6.8a, the real-depth rule).
// Object space: x right, y DOWN, z toward the viewer. Gradients are static `<defs>` (objectBoundingBox), never changed per frame.
// ══════════════════════════════════════════════════════════════════════════════════════════════

export type Pt = { x: number; y: number };
export type V = [number, number, number];
/** `chrome`: the sheen's strength (0 off); `fall`: the spotlight falloff's (0 off — shadows, glows, glass) */
/** `gloss`: a polished SPECULAR STREAK over the face (0 off; Video 13, Timur 2026-10-20: "that sort of metallic, shiny vibe") */
export type Face = { k: string; p: Pt[]; z: number; fill: string; stroke?: string; sw?: number; op?: number; skip?: boolean; chrome?: number; fall?: number; gloss?: number; after?: React.ReactNode };

export const pts = (p: Pt[]) => p.map((q) => `${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(" ");
export const P = (r: Rig, [x, y, z]: V) => project(r, x, y, z);

/** a direction turned into the rig's view: its z (toward the camera) and its screen-space x/y */
const view = (r: Rig, [nx, ny, nz]: V) => {
  const b = (r.yaw * Math.PI) / 180, a = (r.pitch * Math.PI) / 180;
  const x1 = nx * Math.cos(b) + nz * Math.sin(b), z1 = -nx * Math.sin(b) + nz * Math.cos(b);
  return { x: x1, y: ny * Math.cos(a) - z1 * Math.sin(a), z: ny * Math.sin(a) + z1 * Math.cos(a) };
};
/** the depth of a point after the rig's turns (larger is nearer) */
export const depthOf = (r: Rig, [x, y, z]: V) => {
  const b = (r.yaw * Math.PI) / 180, a = (r.pitch * Math.PI) / 180;
  const dx = x - r.cx, dy = y - r.cy, z1 = -dx * Math.sin(b) + z * Math.cos(b);
  return dy * Math.sin(a) + z1 * Math.cos(a);
};
/** does a face with outward normal n face the camera? Culled at EXACTLY edge-on, where its area is nil: with a 2% margin a turning face
 *  blinked out as a sliver (the lever's end as the beam tilted — the sweep's VANISH, 1056) */
export const faces = (r: Rig, n: V, eps = 0) => view(r, n).z > eps;
/** ★ THE KEY, in VIEW space (x right, y down, z toward the camera): from the upper left and a little in front — the spotlight of every
 *  Bankers frame. Fixed to the view, not the object, so an object turning under it changes light as a rendered one does. */
const KEY: V = (() => { const k: V = [-0.42, -0.76, 0.5]; const l = Math.hypot(...k); return [k[0] / l, k[1] / l, k[2] / l]; })();
/** the half vector between the key and the eye (0, 0, 1): its spread is the specular sheen */
const HALF: V = (() => { const h: V = [KEY[0], KEY[1], KEY[2] + 1]; const l = Math.hypot(...h); return [h[0] / l, h[1] / l, h[2] / l]; })();
/** ★★ the light on a face, 0 dark … 1 lit (Timur, 2026-10-18: "the shadows aren't right and it makes them sort of look like unrendered 3D
 *  objects"): LAMBERT against the one key, plus a low ambient, plus a soft specular for curved parts. A top under the key is bright, a
 *  side turned away is DARK, an underside darkest — the old term (0.5 ± a small tilt) kept every face within a step of mid-grey, so
 *  tops, fronts and sides read the same and the solids looked flat-lit. */
export const lightOf = (r: Rig, n: V) => {
  const v = view(r, n);
  const lam = Math.max(0, v.x * KEY[0] + v.y * KEY[1] + v.z * KEY[2]);
  const spec = Math.pow(Math.max(0, v.x * HALF[0] + v.y * HALF[1] + v.z * HALF[2]), 18);
  // (+ a soft FILL from the camera's side: the faces turned to the lens never fall into the murk the key alone leaves them in — the pale
  // fronts read grey without it)
  const fill = Math.max(0, v.z);
  return Math.max(0, Math.min(1, 0.08 + 0.7 * lam + 0.26 * fill + 0.35 * spec));
};
/** ★ any base colour, lit by a face's normal: shaded toward a deep navy on the dark side, toward white where the key is full on (paper,
 *  pages, tags — anything that is not the house metal). The base colour itself is what a face half-turned to the key shows. */
export const shade = (r: Rig, n: V, base: string, gain = 1) => {
  const L = Math.max(0, Math.min(1, lightOf(r, n) * gain));
  // (the shadow side is BLUE — the navy room's bounce — never a grey: a pale face in shade reads as paper in shadow, not as dirt)
  const dark = mix(base, "#0A2A55", 0.66), hi = mix(base, "#FFFFFF", 0.55);
  return L < 0.55 ? mix(dark, base, L / 0.55) : mix(base, hi, (L - 0.55) / 0.45);
};
/** a box in one base colour, every face lit by its own normal (shade) */
export const matBox = (r: Rig, k: string, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, base: string, o: Partial<Face> = {}, gain = 1): Face[] =>
  box(r, k, x0, x1, y0, y1, z0, z1, {
    top: shade(r, [0, -1, 0], base, gain), bottom: shade(r, [0, 1, 0], base, gain), front: shade(r, [0, 0, 1], base, gain), back: shade(r, [0, 0, -1], base, gain),
    left: shade(r, [-1, 0, 0], base, gain), right: shade(r, [1, 0, 0], base, gain),
  }, o);
/** ★ A SOFT CONTACT SHADOW on a floor at height y (Timur, 2026-10-18: "the shadows aren't right"): the footprint [x0,x1]×[z0,z1] drawn as
 *  nested rounded rings, darkest under the object, feathering out — painted, never a CSS filter (STYLE §6.2). The key is upper left and
 *  in front, so the shadow leans to the RIGHT and BACK of the object (`lean` in object units). Paint it after the floor, before the object. */
export const contactShadow = (r: Rig, k: string, x0: number, x1: number, z0: number, z1: number, y: number, strength = 1, lean = 26, disc = false): Face[] => {
  const out: Face[] = [];
  // (14 faint rings 3–4 px apart: six rings 9 px apart read as STEPPED halos on the white stage's floor)
  const RINGS = 14, N = 32;
  for (let i = 0; i < RINGS; i++) {
    const g = (i / (RINGS - 1)) * 1, spread = 2 + g * 46, rad = 10 + g * 40;
    const ax0 = x0 - spread + lean * g * 0.6, ax1 = x1 + spread + lean * g, az0 = z0 - spread - lean * g, az1 = z1 + spread * 0.6;
    const cx = (ax0 + ax1) / 2, cz = (az0 + az1) / 2, hx = (ax1 - ax0) / 2, hz = (az1 - az0) / 2, rr = disc ? Math.min(hx, hz) : Math.min(rad, hx, hz);
    const ring: V[] = [];
    for (let j = 0; j < N; j++) {
      const a = (j / N) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
      ring.push([cx + Math.sign(c) * (hx - rr) + rr * c, y - 0.4, cz + Math.sign(s) * (hz - rr) + rr * s]);
    }
    out.push({ k: `${k}sh${i}`, p: ring.map((q) => P(r, q)), z: -1e6 + i, fill: "#000814", op: 0.058 * strength * (1 - 0.35 * g), chrome: 0, fall: 0, skip: true, sw: 0 });
  }
  return out.reverse();
};

/** ★ IS A FACE SEEN, IN PERSPECTIVE: its projected polygon winds the way a camera-facing face does. Exact — as a face turns away its
 *  on-screen area passes through zero, so it can never blink on or off with any size (the rig-orientation test it replaced ignored
 *  perspective: off-centre faces flipped on whole — the pop scan, 1448, a column base). The 3-D winding is read against the outward
 *  normal, so it holds whichever order the corners were listed in. */
export const seen = (r: Rig, c: V[], n: V) => {
  const p = c.map((q) => P(r, q));
  let a = 0;
  for (let i = 0; i < p.length; i++) { const u = p[i], v = p[(i + 1) % p.length]; a += u.x * v.y - v.x * u.y; }
  const e1: V = [c[1][0] - c[0][0], c[1][1] - c[0][1], c[1][2] - c[0][2]], e2: V = [c[c.length - 1][0] - c[0][0], c[c.length - 1][1] - c[0][1], c[c.length - 1][2] - c[0][2]];
  const s3 = (e1[1] * e2[2] - e1[2] * e2[1]) * n[0] + (e1[2] * e2[0] - e1[0] * e2[2]) * n[1] + (e1[0] * e2[1] - e1[1] * e2[0]) * n[2];
  return { ok: a * s3 > 0, p };
};
/** one face (corners in order), with its outward normal for culling */
export const quad = (r: Rig, k: string, c: V[], n: V, fill: string, o: Partial<Face> = {}): Face | null => {
  const v = seen(r, c, n);
  if (!v.ok) return null;
  // ★ the chrome sheen follows the face's turn to the CAMERA: full on a face square to the lens, fading as it turns edge-on — never the
  // same band laid over a top, a front and a dark side alike (that sameness read as "unrendered", Timur 2026-10-18)
  const vz = view(r, n).z, ch = Math.max(0, Math.min(1, (vz - 0.15) / 0.75)) * (0.35 + 0.65 * lightOf(r, n));
  return { k, p: v.p, z: c.reduce((s, q) => s + depthOf(r, q), 0) / c.length, fill, chrome: ch, ...o, ...(o.chrome !== undefined ? { chrome: o.chrome * ch } : {}) };
};

/** a box [x0,x1]×[y0,y1]×[z0,z1]; `f` gives each face's fill (top, bottom, front = +z, back = −z, left = −x, right = +x) */
export type BoxFills = { top: string; bottom?: string; front: string; back?: string; left: string; right: string };
export const box = (r: Rig, k: string, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, f: BoxFills, o: Partial<Face> = {}): Face[] =>
  [
    quad(r, `${k}t`, [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], [0, -1, 0], f.top, o),
    quad(r, `${k}b`, [[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]], [0, 1, 0], f.bottom ?? f.front, o),
    quad(r, `${k}f`, [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], [0, 0, 1], f.front, o),
    quad(r, `${k}k`, [[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]], [0, 0, -1], f.back ?? f.front, o),
    quad(r, `${k}l`, [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], [-1, 0, 0], f.left, o),
    quad(r, `${k}r`, [[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]], [1, 0, 0], f.right, o),
  ].filter(Boolean) as Face[];

/** a vertical cylinder (axis along y) from y0 (top) to y1 (bottom), centred (cx, cz), radius R; its side as N bands shaded by their
 *  turn to the light, its top cap; `ink` is its base colour pair [lit, deep] */
export const vcyl = (r: Rig, k: string, cx: number, cz: number, R: number, y0: number, y1: number, top: string, ink: [string, string], N = 28, o: Partial<Face> = {}): Face[] => {
  const out: Face[] = [];
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * Math.PI * 2, a1 = ((i + 1) / N) * Math.PI * 2, am = (a0 + a1) / 2;
    const n: V = [Math.cos(am), 0, Math.sin(am)];
    const L = lightOf(r, n);
    const c: V[] = [[cx + R * Math.cos(a0), y0, cz + R * Math.sin(a0)], [cx + R * Math.cos(a1), y0, cz + R * Math.sin(a1)], [cx + R * Math.cos(a1), y1, cz + R * Math.sin(a1)], [cx + R * Math.cos(a0), y1, cz + R * Math.sin(a0)]];
    const v = seen(r, c, n);
    if (!v.ok) continue;
    out.push({ k: `${k}s${i}`, p: v.p, z: c.reduce((s, q) => s + depthOf(r, q), 0) / 4, fill: mix(ink[1], ink[0], L), ...o, stroke: mix(ink[1], ink[0], L), sw: 0.8, chrome: 0, skip: true });
  }
  const ring = (y: number) => Array.from({ length: N }, (_, i) => [cx + R * Math.cos((i / N) * Math.PI * 2), y, cz + R * Math.sin((i / N) * Math.PI * 2)] as V);
  const yc = seen(r, ring(y0), [0, -1, 0]).ok ? y0 : y1;
  const cap: V[] = ring(yc);
  out.push({ k: `${k}c`, p: cap.map((q) => P(r, q)), z: depthOf(r, [cx, yc, cz]), fill: top, ...o });
  return out;
};

/** a horizontal cylinder along x (a fuselage, a rail) from x0 to x1, centred (cy, cz), radius R; `taper(t)` scales R along it (0..1) */
export const xcyl = (r: Rig, k: string, x0: number, x1: number, cy: number, cz: number, R: number, ink: [string, string], taper: (t: number) => number = () => 1, NX = 14, N = 22, o: Partial<Face> = {}): Face[] => {
  const out: Face[] = [];
  for (let j = 0; j < NX; j++) {
    const t0 = j / NX, t1 = (j + 1) / NX, xa = x0 + (x1 - x0) * t0, xb = x0 + (x1 - x0) * t1, ra = R * taper(t0), rb = R * taper(t1);
    for (let i = 0; i < N; i++) {
      const a0 = (i / N) * Math.PI * 2, a1 = ((i + 1) / N) * Math.PI * 2, am = (a0 + a1) / 2;
      const n: V = [(ra - rb) / Math.max(1, xb - xa) * 0.6, Math.cos(am), Math.sin(am)];
      const L = lightOf(r, n);
      const c: V[] = [[xa, cy + ra * Math.cos(a0), cz + ra * Math.sin(a0)], [xb, cy + rb * Math.cos(a0), cz + rb * Math.sin(a0)], [xb, cy + rb * Math.cos(a1), cz + rb * Math.sin(a1)], [xa, cy + ra * Math.cos(a1), cz + ra * Math.sin(a1)]];
      const v = seen(r, c, n);
      if (!v.ok) continue;
      const col = mix(ink[1], ink[0], L);
      out.push({ k: `${k}${j}_${i}`, p: v.p, z: c.reduce((s, q) => s + depthOf(r, q), 0) / 4, fill: col, stroke: col, sw: 0.8, chrome: 0, skip: true, ...o });
    }
  }
  return out;
};

/** ★ A LOFT along x through circular SECTIONS (a fuselage with a curved nose and an up-swept tail cone, a nacelle): each section is its x,
 *  its centre's height `cy` and depth `cz`, and its radius; rings of N facets join consecutive sections, each facet lit by its own normal
 *  (the radial direction tilted by the loft's slope). `ink(t, a)` may restyle a facet ([lit, deep]) by its place along the loft (t 0..1)
 *  and its angle round it (a: 0 = straight down, π/2 = toward the viewer) — a cheatline, a darker belly. Smooth enough to read as a
 *  turned surface: N ≥ 32 and sections every ~20 px. */
export type Sec = { x: number; cy: number; cz: number; R: number };
export const xloft = (r: Rig, k: string, secs: Sec[], ink: [string, string] | ((t: number, a: number) => [string, string]), N = 32, o: Partial<Face> = {}): Face[] => {
  const out: Face[] = [];
  const inkOf = typeof ink === "function" ? ink : () => ink;
  for (let j = 0; j < secs.length - 1; j++) {
    const A = secs[j], B = secs[j + 1], dx = Math.max(0.5, B.x - A.x);
    for (let i = 0; i < N; i++) {
      const a0 = (i / N) * Math.PI * 2, a1 = ((i + 1) / N) * Math.PI * 2, am = (a0 + a1) / 2;
      // (the angle measured from straight down, y being down: (cos a, sin a) → (y, z))
      const ring = (S: Sec, a: number): V => [S.x, S.cy + S.R * Math.cos(a), S.cz + S.R * Math.sin(a)];
      const c: V[] = [ring(A, a0), ring(B, a0), ring(B, a1), ring(A, a1)];
      const slope = (A.R - B.R) / dx, dy = (B.cy - A.cy) / dx;
      let n: V = [slope + dy * Math.cos(am) * 0, Math.cos(am), Math.sin(am)];
      const l = Math.hypot(...n); n = [n[0] / l, n[1] / l, n[2] / l];
      const v = seen(r, c, n);
      if (!v.ok) continue;
      const [hi, lo] = inkOf((j + 0.5) / (secs.length - 1), am);
      const col = mix(lo, hi, lightOf(r, n));
      out.push({ k: `${k}${j}_${i}`, p: v.p, z: c.reduce((s, q) => s + depthOf(r, q), 0) / 4, fill: col, stroke: col, sw: 0.9, chrome: 0, skip: true, ...o });
    }
  }
  return out;
};
/** a flat disc (an intake, a cap) at x, centred (cy, cz), radius R, facing −x or +x */
export const xdisc = (r: Rig, k: string, x: number, cy: number, cz: number, R: number, facing: 1 | -1, fill: string, N = 28, o: Partial<Face> = {}): Face | null => {
  const ring: V[] = Array.from({ length: N }, (_, i) => { const a = (i / N) * Math.PI * 2 * facing; return [x, cy + R * Math.cos(a), cz + R * Math.sin(a)] as V; });
  return quad(r, k, ring, [facing, 0, 0], fill, { chrome: 0, ...o });
};

/** paint faces far to near */
/** ★ THE CHROME RAMP over every face (STYLE §16 2026-10-15, "smooth metallic … keep the blue color"): a static gradient laid over the
 *  face's own colour — a light upper-left, a dark reflected band past the middle, a little light again from below — so a flat face reads as
 *  polished metal, not satin plastic. One fixed `<defs>` (never changed per frame). `chrome: 0` turns it off (paper, glass). */
export const Faces: React.FC<{ list: (Face | null | undefined)[] }> = ({ list }) => (
  <>
    <defs data-probe-skip>
      {/* (softer than the first ramp: a gentle highlight upper left, a faint reflected band past the middle — Timur, 2026-10-18) */}
      <linearGradient id="p3Chrome" x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.16" /><stop offset="0.42" stopColor="#FFFFFF" stopOpacity="0" />
        <stop offset="0.7" stopColor="#000814" stopOpacity="0.12" /><stop offset="1" stopColor="#B3CEEF" stopOpacity="0.05" />
      </linearGradient>
      {/* ★ THE SPOTLIGHT'S FALLOFF across every surface (the frame's one overhead key, upper left): a fixed radial in the layer's own
          pixels, so a wide top grades from lit to dim and the parts farther from the light sit darker — as a rendered surface does under a
          spot. Static: never a stop changed per frame (the stale-paint class). */}
      {/* ★ THE GLOSS (Video 13): a polished metal's specular streaks — a bright narrow band a third of the way across the face and a fainter
          one past its middle, diagonal, static. Faces carrying `gloss` read as polished steel rather than painted metal. */}
      <linearGradient id="p3Gloss" x1="0" y1="0" x2="1" y2="0.85">
        <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" /><stop offset="0.24" stopColor="#FFFFFF" stopOpacity="0" />
        <stop offset="0.31" stopColor="#FFFFFF" stopOpacity="0.55" /><stop offset="0.36" stopColor="#FFFFFF" stopOpacity="0.08" />
        <stop offset="0.58" stopColor="#FFFFFF" stopOpacity="0" /><stop offset="0.7" stopColor="#FFFFFF" stopOpacity="0.2" />
        <stop offset="0.74" stopColor="#FFFFFF" stopOpacity="0" /><stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
      </linearGradient>
      <radialGradient id="p3Fall" gradientUnits="userSpaceOnUse" cx={430} cy={560} r={1150}>
        <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.14" /><stop offset="0.42" stopColor="#FFFFFF" stopOpacity="0" />
        <stop offset="0.72" stopColor="#000814" stopOpacity="0.16" /><stop offset="1" stopColor="#000814" stopOpacity="0.42" />
      </radialGradient>
    </defs>
    {(list.filter(Boolean) as Face[]).sort((a, b) => a.z - b.z).map((f) => (
      <React.Fragment key={f.k}>
        {/* (every solid face is outlined in its own colour, 0.7 px: anti-aliased neighbours otherwise leave hairline seams of the ground
            between them, which read as an unrendered mesh) */}
        <polygon {...(f.skip ? { "data-probe-skip": true } : {})} points={pts(f.p)} fill={f.fill} stroke={f.stroke ?? (f.fill !== "none" && f.sw !== 0 ? f.fill : undefined)} strokeWidth={f.sw ?? 0.7} opacity={f.op} strokeLinejoin="round" />
        {f.chrome !== 0 && f.fill !== "none" && <polygon data-probe-skip points={pts(f.p)} fill="url(#p3Chrome)" opacity={(f.op ?? 1) * (f.chrome ?? 1)} />}
        {f.fall !== 0 && f.fill !== "none" && !f.fill.startsWith("url") && <polygon data-probe-skip points={pts(f.p)} fill="url(#p3Fall)" opacity={(f.op ?? 1) * (f.fall ?? 1)} />}
        {(f.gloss ?? 0) > 0 && f.fill !== "none" && <polygon data-probe-skip points={pts(f.p)} fill="url(#p3Gloss)" opacity={(f.op ?? 1) * (f.gloss ?? 0)} />}
        {f.after}
      </React.Fragment>
    ))}
  </>
);

/** an affine map from a face's local (0..w, 0..h) onto its projected corners (o top-left, ex top-right, ey bottom-left) — print ON a face */
export const affine = (o: Pt, ex: Pt, ey: Pt, w: number, h: number) =>
  `matrix(${((ex.x - o.x) / w).toFixed(5)} ${((ex.y - o.y) / w).toFixed(5)} ${((ey.x - o.x) / h).toFixed(5)} ${((ey.y - o.y) / h).toFixed(5)} ${o.x.toFixed(2)} ${o.y.toFixed(2)})`;
export const onFace = (r: Rig, o: V, ex: V, ey: V, w: number, h: number) => affine(P(r, o), P(r, ex), P(r, ey), w, h);

/** colour mix (hex), t 0 → a, 1 → b */
export const mix = (a: string, b: string, t: number) => {
  const h = (s: string) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
  const A = h(a), B = h(b), u = Math.max(0, Math.min(1, t));
  return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * u).toString(16).padStart(2, "0")).join("");
};

/** the house metal: face colours by how a face turns to the light (dark-blue steel; STYLE §16 2026-10-15) */
export const METAL = { hi: "#6FA3DF", lit: "#2D6AB1", mid: "#174C8E", deep: "#0B3F82", dark: "#02234A", night: "#011A38" } as const;
/** a metal face's fill for its normal */
export const metal = (r: Rig, n: V, lift = 0) => {
  // (lift brightens a part a little — a lit cover, a highlighted bar — but never lifts a face turned away out of its shadow)
  const L0 = lightOf(r, n), L = Math.min(1, L0 + lift * (0.4 + 0.6 * L0));
  return L > 0.66 ? mix(METAL.lit, METAL.hi, (L - 0.66) / 0.34) : L > 0.33 ? mix(METAL.deep, METAL.lit, (L - 0.33) / 0.33) : mix(METAL.night, METAL.deep, L / 0.33);
};
/** a box in the house metal (each face lit by its own normal) */
export const metalBox = (r: Rig, k: string, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, lift = 0, o: Partial<Face> = {}) =>
  box(r, k, x0, x1, y0, y1, z0, z1, {
    top: metal(r, [0, -1, 0], lift), bottom: metal(r, [0, 1, 0], lift), front: metal(r, [0, 0, 1], lift), back: metal(r, [0, 0, -1], lift),
    left: metal(r, [-1, 0, 0], lift), right: metal(r, [1, 0, 0], lift),
  }, o);

/** ★ THE TURN, FOR A PROJECTED OBJECT (STYLE §6.7 — every MID keeps its slow arc): the rig's yaw eases from `from` to `to` over the place's
 *  hold with the house's ~1° sine on top (the Bankers Turn's own curve, on the object's own rig instead of a CSS transform) */
export const swing = (f: number, at: number, end: number, from: number, to: number, amp = 1) => {
  const t = Math.max(0, Math.min(1, (f - at) / Math.max(1, end - at)));
  const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  return from + (to - from) * e + amp * Math.sin(((f - at) / 250) * Math.PI * 2);
};

/** ★ ANY HEXAHEDRON (a rotated box, a tapered wing, a tilted beam): 8 corners indexed by bits (x: bit 0, y: bit 1, z: bit 2 — so c[0] is
 *  x0 y0 z0 and c[7] is x1 y1 z1 of the shape before it was turned); each face's outward normal comes from its own geometry, and its
 *  fill from `fill(name, normal)` (names: top = y0, bottom = y1, front = z1, back = z0, left = x0, right = x1) */
export const hexa = (r: Rig, k: string, c: V[], fill: (name: string, n: V) => string, o: Partial<Face> = {}): Face[] => {
  const cen = c.reduce((a, q) => [a[0] + q[0] / 8, a[1] + q[1] / 8, a[2] + q[2] / 8] as V, [0, 0, 0] as V);
  const F: [string, number[]][] = [["top", [0, 1, 5, 4]], ["bottom", [2, 6, 7, 3]], ["front", [4, 5, 7, 6]], ["back", [1, 0, 2, 3]], ["left", [0, 4, 6, 2]], ["right", [5, 1, 3, 7]]];
  const out: Face[] = [];
  for (const [name, ix] of F) {
    const q = ix.map((i) => c[i]);
    const u: V = [q[1][0] - q[0][0], q[1][1] - q[0][1], q[1][2] - q[0][2]], w: V = [q[3][0] - q[0][0], q[3][1] - q[0][1], q[3][2] - q[0][2]];
    let n: V = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
    const fc = q.reduce((a, p) => [a[0] + p[0] / 4, a[1] + p[1] / 4, a[2] + p[2] / 4] as V, [0, 0, 0] as V);
    if (n[0] * (fc[0] - cen[0]) + n[1] * (fc[1] - cen[1]) + n[2] * (fc[2] - cen[2]) < 0) n = [-n[0], -n[1], -n[2]];
    const len = Math.hypot(...n) || 1; n = [n[0] / len, n[1] / len, n[2] / len];
    const f = quad(r, `${k}${name[0]}${name[1]}`, q, n, fill(name, n), o);
    if (f) out.push(f);
  }
  return out;
};
/** the 8 corners of a box [x0,x1]×[y0,y1]×[z0,z1] turned by `deg` in the x–y plane about (px, py) (a beam tilting on its fulcrum) */
export const turnedBox = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, deg: number, px: number, py: number): V[] => {
  const a = (deg * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
  return [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
    const x = i & 1 ? x1 : x0, y = i & 2 ? y1 : y0, z = i & 4 ? z1 : z0, dx = x - px, dy = y - py;
    return [px + dx * ca - dy * sa, py + dx * sa + dy * ca, z] as V;
  });
};
/** a point turned the same way (to seat things on a turned beam) */
export const turnPt = (x: number, y: number, deg: number, px: number, py: number): [number, number] => {
  const a = (deg * Math.PI) / 180;
  return [px + (x - px) * Math.cos(a) - (y - py) * Math.sin(a), py + (x - px) * Math.sin(a) + (y - py) * Math.cos(a)];
};

/** ★ POLISHED STEEL (Video 13): a metal box with the gloss streak on the faces turned to the camera and a bright CATCHLIGHT along the
 *  edges of its top that face the light (the bevel a polished part shows) — the shiny Bankers metal. `lift` brightens it like metalBox's. */
export const steelBox = (r: Rig, k: string, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, lift = 0.2, gloss = 0.7, o: Partial<Face> = {}): Face[] => {
  const fs = metalBox(r, k, x0, x1, y0, y1, z0, z1, lift, o).map((f) => (f.k.endsWith("t") || f.k.endsWith("f") || f.k.endsWith("r") || f.k.endsWith("l") ? { ...f, gloss: gloss * (f.k.endsWith("t") ? 0.6 : 1) } : f));
  const top = fs.find((f) => f.k === `${k}t`);
  if (top) {
    // the catchlight: the top face's front and left edges (toward the key, upper left), drawn over the face
    const a = P(r, [x0, y0, z1]), b = P(r, [x1, y0, z1]), c = P(r, [x0, y0, z0]);
    top.after = (
      <g data-probe-skip opacity={o.op ?? 1}>
        <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#FFFFFF" strokeOpacity={0.7} strokeWidth={1.6} strokeLinecap="round" />
        <line x1={a.x} y1={a.y} x2={c.x} y2={c.y} stroke="#FFFFFF" strokeOpacity={0.45} strokeWidth={1.3} strokeLinecap="round" />
      </g>
    );
  }
  return fs;
};

