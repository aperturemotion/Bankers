// @ts-nocheck
// ★ V39 builder B — a used silver 2007 TOYOTA YARIS hatchback (XP90, 5-door), parked in the snow (FACTCHECK row 4: used 2007 Yaris).
//   Real proportions: length 3.75 m, width 1.70 m, height 1.53 m, wheelbase 2.46 m, 175/65 R14 tyres on steel wheels under plastic
//   covers. The body is LOFTED from cross-sections along its length (short sloping hood, the long raked windshield running into the
//   roof, the near-upright hatch, tumblehome above a beltline that kicks up at the rear quarter, wheel arches cut out of the sides).
//   Its glass, lamps, black B-pillar, shut lines and the snow on the roof are painted PER PIXEL in the shader from the same profile
//   functions (a baked profile texture), so every edge is crisp at any distance. Badges: YARIS in plain letters on the hatch and a
//   plain chrome ellipse (no logo artwork). Front of the car = +x, right side = +z, ground y = 0. Units: metres.
import React, { useMemo } from "react";
import * as THREE from "three";
import { canvasTex, rnd } from "./kit";
import { BODY } from "./fonts3d";

export const XR = -1.875, XF = 1.875, LEN = XF - XR;
export const AXF = 1.12, AXR = -1.34, WR = 0.292, ARCH = 0.335, TRACK = 0.735;
const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ss = (a, b, x) => { const t = cl((x - a) / (b - a)); return t * t * (3 - 2 * t); };
// ── the profile ──────────────────────────────────────────────────────────────────────────────────────────────────────────
/** centreline top: nose, hood, cowl, windshield, roof, spoiler lip, hatch glass, lower hatch */
export const topY = (x) => {
  if (x >= 1.8) { const t = (x - 1.8) / (XF - 1.8); return 0.762 - 0.16 * t * t; }
  if (x >= 1.05) return 0.985 - 0.223 * Math.pow((x - 1.05) / 0.75, 1.25);
  if (x >= 0.12) { const u = (1.05 - x) / 0.93; return 0.985 + 0.485 * u + 0.035 * Math.sin(Math.PI * u) - 0.02 * ss(0.75, 1, u) * (1 - ss(0.98, 1.0, u)); }
  if (x >= -0.45) { const u = (x + 0.45) / 0.57; return 1.525 - 0.055 * u * u; }
  if (x >= -1.56) { const u = (x + 0.45) / 1.11; return 1.525 - 0.065 * u * u; }
  if (x >= -1.62) return 1.46 + 0.008 * Math.sin(Math.PI * (-1.56 - x) / 0.06) - 0.03 * ((-1.56 - x) / 0.06);
  if (x >= -1.835) { const u = (-1.62 - x) / 0.215; return 1.43 - 0.411 * u - 0.03 * Math.sin(Math.PI * u); }
  const u = (-1.835 - x) / (-1.835 - XR); return 1.019 - 0.45 * u - 0.05 * u * u;
};
export const beltY = (x) => (x > -1.0 ? 0.975 + 0.03 * (1.05 - x) / 2.05 : 1.005 + 0.06 * ss(-1.0, -1.45, x));
export const planW = (x) => {
  let w = 0.8475 * (1 - 0.025 * (x / 1.875) ** 2);
  if (x > 1.32) { const t = cl((x - 1.32) / (XF - 1.32)); w *= Math.pow(1 - Math.pow(t, 2.3), 1 / 2.3); }
  if (x < -1.58) { const t = cl((-1.58 - x) / (-1.58 - XR)); w *= Math.pow(1 - Math.pow(t, 2.7), 1 / 2.7); }
  return w;
};
const gLow = (y) => 1 - 0.045 * ((y - 0.74) / 0.32) ** 2 - 1.4 * Math.max(0, 0.36 - y) ** 2;
export const sideZ = (x, y) => {
  const b = beltY(x);
  if (y <= b) return planW(x) * gLow(y);
  return planW(x) * (gLow(b) - 0.3 * Math.pow((y - b) / 0.52, 1.25));
};
const archY = (x) => { let y = -1; for (const c of [AXF, AXR]) { const d = x - c; if (Math.abs(d) < ARCH) y = Math.max(y, WR + Math.sqrt(ARCH * ARCH - d * d)); } return y; };
const baseY = (x) => 0.19 + 0.07 * ss(1.55, XF, x) + 0.11 * ss(-1.55, XR, x);
export const botY = (x) => Math.max(baseY(x), archY(x));
const crownH = (x) => (x > 1.05 ? 0.035 : x > 0.12 ? 0.06 : x > -1.6 ? 0.065 : 0.035);
const RC = (x) => (x > 1.05 ? 0.045 : 0.085), RB = 0.035;
const NB = 4, NBC = 3, NS1 = 12, NS2 = 8, NC = 6, NT = 9;
/** the half section at x (z ≥ 0): bottom centre → sill corner → side (belt exact) → roof corner → top centre; also zt = the top-corner half-width */
const halfRing = (x) => {
  const yb = botY(x), yt = topY(x), pts = [];
  const zb0 = Math.max(0.002, sideZ(x, yb + RB)), rb = Math.min(RB, zb0 * 0.5);
  for (let i = 0; i < NB; i++) pts.push([x, yb, (zb0 - rb) * i / NB]);
  for (let i = 0; i < NBC; i++) { const a = -Math.PI / 2 + (Math.PI / 2) * i / NBC; pts.push([x, yb + rb + rb * Math.sin(a), zb0 - rb + rb * Math.cos(a)]); }
  const rc0 = RC(x), ylo = yb + rb, yhi = Math.max(yt - rc0, ylo + 0.02), ybl = Math.max(ylo + 0.008, Math.min(beltY(x), yhi - 0.01));
  for (let i = 0; i < NS1; i++) { const y = ylo + (ybl - ylo) * i / NS1; pts.push([x, y, sideZ(x, y)]); }
  for (let i = 0; i <= NS2; i++) { const y = ybl + (yhi - ybl) * i / NS2; pts.push([x, y, sideZ(x, y)]); }
  const zs = sideZ(x, yhi), rc = Math.min(rc0, zs * 0.5, Math.max(0.004, yt - yhi)), zt = Math.max(0, zs - rc);
  for (let i = 1; i <= NC; i++) { const a = (Math.PI / 2) * i / NC; pts.push([x, yhi + (yt - yhi) * Math.sin(a), zt + rc * Math.cos(a)]); }
  const cr = crownH(x) * Math.min(1, zt / 0.6);
  for (let i = 1; i <= NT; i++) { const z = zt * (1 - i / NT); pts.push([x, yt + cr * (1 - (zt > 0 ? (z / zt) ** 2 : 0)), z]); }
  return { pts, zt, yt: yt + cr };
};
const stations = () => {
  const xs = [];
  for (let x = XR; x < -1.5; x += 0.004) xs.push(x);
  for (let x = -1.5; x < 1.72; x += 0.02) xs.push(x);
  for (let x = 1.72; x < XF; x += 0.005) xs.push(x);
  xs.push(XF);
  // the arch ends exactly
  for (const c of [AXF, AXR]) for (const e of [-ARCH - 0.001, ARCH + 0.001]) xs.push(c + e);
  xs.sort((a, b) => a - b);
  return xs.filter((x, i) => i === 0 || x - xs[i - 1] > 0.0015);
};
let BODYGEO = null;
export const yarisBody = () => {
  if (BODYGEO) return BODYGEO;
  const xs = stations();
  const rings = xs.map((x) => { const h = halfRing(x).pts; return [...h, ...h.slice(1, -1).reverse().map((p) => [p[0], p[1], -p[2]])]; });
  const nR = rings[0].length, nS = rings.length;
  const pos = new Float32Array(nS * nR * 3);
  rings.forEach((r, i) => r.forEach((p, j) => { const k = (i * nR + j) * 3; pos[k] = p[0]; pos[k + 1] = p[1]; pos[k + 2] = p[2]; }));
  const idx = [];
  for (let i = 0; i < nS - 1; i++) for (let j = 0; j < nR; j++) {
    const a = i * nR + j, b = (i + 1) * nR + j, c = (i + 1) * nR + (j + 1) % nR, d = i * nR + (j + 1) % nR;
    idx.push(a, c, b, a, d, c);
  }
  // end caps (tiny: the plan taper closes both ends)
  const cap = (i, flip) => { const c0 = pos.length / 3; return c0; };
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setIndex(idx); g.computeVertexNormals();
  // orient outward: test one side vertex
  const n = g.attributes.normal; const j = Math.floor(nR / 4), i0 = Math.floor(nS / 2) * nR + j;
  if (n.getZ(i0) < 0) { const I = g.index.array; for (let k = 0; k < I.length; k += 3) { const t = I[k + 1]; I[k + 1] = I[k + 2]; I[k + 2] = t; } g.computeVertexNormals(); }
  g.computeBoundingSphere();
  BODYGEO = g;
  return g;
};
// the profile baked for the shader: R belt, G top (with crown), B zt (top-corner half-width), A planW
let PROF = null;
const profTex = () => {
  if (PROF) return PROF;
  const N = 1024, d = new Float32Array(N * 4);
  for (let i = 0; i < N; i++) { const x = XR + (LEN * i) / (N - 1), h = halfRing(x); d[i * 4] = beltY(x); d[i * 4 + 1] = topY(x); d[i * 4 + 2] = h.zt; d[i * 4 + 3] = planW(x); }
  const t = new THREE.DataTexture(d, N, 1, THREE.RGBAFormat, THREE.FloatType);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true;
  PROF = t; return t;
};
// ── the paint shader ────────────────────────────────────────────────────────────────────────────────────────────────────
const FRAG_HEAD = /* glsl */`
varying vec3 vLP; varying vec3 vLN;
uniform sampler2D uProf; uniform float uXR; uniform float uLen;
float lineAt(float v, float c, float w) { return 1.0 - smoothstep(w * 0.5, w * 0.5 + fwidth(v) * 1.2, abs(v - c)); }
float box2(vec2 p, vec2 a, vec2 b) { vec2 e = fwidth(p) * 0.8; vec2 s = smoothstep(a - e, a + e, p) * (1.0 - smoothstep(b - e, b + e, p)); return s.x * s.y; }
`;
const FRAG_PART = /* glsl */`
  vec4 PR = texture2D(uProf, vec2((vLP.x - uXR) / uLen, 0.5));
  float bel = PR.r, top = PR.g, zt = PR.b, pw = PR.a;
  float x = vLP.x, y = vLP.y, az = abs(vLP.z);
  vec3 ln = normalize(vLN);
  float onSide = step(zt + 0.004, az);                    // the side surface (outboard of the roof corner)
  float onTop = 1.0 - onSide;
  // glass
  float sideWin = onSide * step(bel + 0.018, y) * step(y, top - 0.085) * step(-1.56, x) * step(x, 1.04);
  float bp = box2(vec2(x, y), vec2(-0.245, bel), vec2(-0.125, 2.0));              // the black B-pillar
  float cp = box2(vec2(x, y), vec2(-1.105, bel), vec2(-1.055, 2.0));              // the rear door / quarter glass division
  float qp = box2(vec2(x, y), vec2(0.5, bel), vec2(0.545, 2.0));                  // the front quarter-glass division
  float ws = onTop * box2(vec2(x, az), vec2(0.15, -1.0), vec2(1.025, zt - 0.055));
  float hg = onTop * box2(vec2(x, az), vec2(-1.795, -1.0), vec2(-1.635, zt - 0.1));
  float glass = clamp(sideWin + ws + hg, 0.0, 1.0);
  float blackP = sideWin * clamp(bp + cp + qp, 0.0, 1.0);
  glass *= 1.0 - blackP;
  // a black frame round the hatch glass and the window seals
  float hgFrame = onTop * box2(vec2(x, az), vec2(-1.815, -1.0), vec2(-1.615, zt - 0.06)) * (1.0 - hg);
  float seal = onSide * lineAt(y, bel + 0.012, 0.012) * step(-1.56, x) * step(x, 1.0);
  // lamps
  float tailZone = step(x, -1.72) * box2(vec2(y, 0.0), vec2(0.70, -1.0), vec2(1.10, 1.0));
  float tailEdge = 0.50 + 0.07 * smoothstep(0.98, 1.10, y) + 0.04 * smoothstep(0.80, 0.70, y);
  float tail = tailZone * smoothstep(tailEdge - 0.004, tailEdge + 0.004, az);
  float rev = tail * box2(vec2(y, az), vec2(0.72, 0.0), vec2(0.80, tailEdge + 0.09));
  float tailRim = tailZone * (1.0 - tail) * smoothstep(tailEdge - 0.02, tailEdge - 0.006, az);
  float head = step(1.41, x) * step(0.335, az) * step(0.625, y) * step(y, min(0.872, 0.625 + 0.6 * (x - 1.41))) * step(az, pw - 0.004 + 1.0);
  float headInner = head * step(0.65, y) * step(y, min(0.85, 0.65 + 0.6 * (x - 1.45))) * step(0.36, az);
  // grille slot and the lower intake, the black lower valance at the rear, the underbody
  float front = step(1.79, x);
  float grille = front * box2(vec2(az, y), vec2(-1.0, 0.535), vec2(0.34, 0.6));
  float intake = front * box2(vec2(az, y), vec2(-1.0, 0.27), vec2(0.47, 0.43));
  float rearBlk = step(x, -1.7) * step(y, 0.33);
  float under = smoothstep(-0.35, -0.6, ln.y);
  // shut lines: doors, fuel door, hood, bumpers
  float shut = 0.0;
  shut += onSide * lineAt(x, 0.985, 0.004) * step(0.6, y) * step(y, bel);
  shut += onSide * lineAt(x, -0.175, 0.004) * step(0.3, y) * step(y, bel);
  shut += onSide * lineAt(x, -1.06, 0.004) * step(0.48, y) * step(y, bel);
  shut += onSide * step(0.0, vLP.z) * (box2(vec2(x, y), vec2(-1.46, 0.855), vec2(-1.27, 0.985)) - box2(vec2(x, y), vec2(-1.455, 0.86), vec2(-1.275, 0.98)));
  shut += onTop * lineAt(x, 1.715, 0.004) * step(az, zt - 0.02);
  shut += onSide * lineAt(x, 1.47, 0.004) * step(0.62, y) * step(y, 0.95);
  shut += step(x, -1.6) * lineAt(y, 0.535, 0.004);
  shut += onSide * lineAt(y, 0.345, 0.004) * step(-1.0, x) * step(x, 0.8) * 0.6;
  shut = clamp(shut, 0.0, 1.0) * (1.0 - glass);
  // snow lying on the roof (and a little on the hood's top)
  float snow = smoothstep(0.84, 0.93, ln.y) * smoothstep(1.39, 1.43, y) * (1.0 - glass);
  snow = max(snow, smoothstep(0.86, 0.95, ln.y) * step(1.1, x) * step(az, zt - 0.08) * 0.0);
`;
let YM = null;
export const yarisPaint = () => {
  if (YM) return YM;
  const m = new THREE.MeshPhysicalMaterial({ color: "#A9AFB6", metalness: 0.6, roughness: 0.34, clearcoat: 0.7, clearcoatRoughness: 0.12, envMapIntensity: 1.1 });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uProf = { value: profTex() }; sh.uniforms.uXR = { value: XR }; sh.uniforms.uLen = { value: LEN };
    sh.vertexShader = "varying vec3 vLP; varying vec3 vLN;\n" + sh.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\n vLP = position; vLN = objectNormal;");
    sh.fragmentShader = FRAG_HEAD + sh.fragmentShader
      .replace("#include <color_fragment>", `#include <color_fragment>
${FRAG_PART}
  vec3 paint = diffuseColor.rgb;
  vec3 col = paint;
  col = mix(col, vec3(0.012, 0.016, 0.024), glass);
  col = mix(col, vec3(0.01), max(blackP, hgFrame));
  col = mix(col, vec3(0.015), seal);
  col = mix(col, vec3(0.20, 0.010, 0.014), tail * (1.0 - rev));
  col = mix(col, vec3(0.55, 0.56, 0.58), rev);
  col = mix(col, vec3(0.04), tailRim);
  col = mix(col, vec3(0.72, 0.75, 0.80), head);
  col = mix(col, vec3(0.32, 0.34, 0.38), headInner * 0.6);
  col = mix(col, vec3(0.02), max(grille, intake));
  col = mix(col, vec3(0.03), rearBlk);
  col = mix(col, vec3(0.01), under);
  col = mix(col, paint * 0.18, shut);
  col = mix(col, vec3(0.93, 0.95, 0.99), snow);
  diffuseColor.rgb = col;`)
      .replace("#include <roughnessmap_fragment>", `#include <roughnessmap_fragment>
  roughnessFactor = mix(roughnessFactor, 0.04, glass);
  roughnessFactor = mix(roughnessFactor, 0.12, max(tail, head));
  roughnessFactor = mix(roughnessFactor, 0.7, max(max(grille, intake), max(rearBlk, under)));
  roughnessFactor = mix(roughnessFactor, 0.85, snow);`)
      .replace("#include <metalnessmap_fragment>", `#include <metalnessmap_fragment>
  metalnessFactor = mix(metalnessFactor, 0.0, max(glass, max(snow, max(tail, max(grille, max(intake, under))))));
  metalnessFactor = mix(metalnessFactor, 0.9, head);`)
      .replace("#include <opaque_fragment>", `outgoingLight = mix(outgoingLight, outgoingLight * 0.32 + vec3(0.003, 0.005, 0.009), max(glass, max(blackP, hgFrame)) );
#include <opaque_fragment>`)
      .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
  totalEmissiveRadiance += vec3(0.05, 0.0, 0.0) * tail * (1.0 - rev);`);
  };
  m.customProgramCacheKey = () => "yaris_paint_v3";
  YM = m;
  return m;
};
// ── wheels: tyre (lathe), the steel wheel under a plastic wheel cover (drawn), the arch liner ─────────────────────────────────
const coverTex = () => canvasTex("b_yaris_cover", 512, 512, (c, w, h) => {
  const cx = w / 2, cy = h / 2;
  const g = c.createRadialGradient(cx - 40, cy - 60, 20, cx, cy, w / 2); g.addColorStop(0, "#E4E8EE"); g.addColorStop(0.7, "#A9B0B9"); g.addColorStop(1, "#6E757E");
  c.fillStyle = g; c.beginPath(); c.arc(cx, cy, w / 2, 0, 7); c.fill();
  // eight twisted spokes: dark slots between them
  for (let k = 0; k < 8; k++) {
    const a0 = (k / 8) * Math.PI * 2;
    c.fillStyle = "#1A1D22"; c.beginPath();
    for (let s = 0; s <= 20; s++) { const r = 70 + s * 8.5, a = a0 + 0.22 + s * 0.012; c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
    for (let s = 20; s >= 0; s--) { const r = 70 + s * 8.5, a = a0 + 0.22 + s * 0.012 + 0.2 + s * 0.006; c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
    c.fill();
  }
  c.strokeStyle = "rgba(40,44,50,0.6)"; c.lineWidth = 6; c.beginPath(); c.arc(cx, cy, 240, 0, 7); c.stroke();
  c.fillStyle = "#C9CED6"; c.beginPath(); c.arc(cx, cy, 64, 0, 7); c.fill();
  c.strokeStyle = "rgba(60,64,70,0.7)"; c.lineWidth = 4; c.beginPath(); c.ellipse(cx, cy, 34, 22, 0, 0, 7); c.stroke();   // a plain centre ellipse
  for (let i = 0; i < 3000; i++) { c.fillStyle = `rgba(60,50,40,${rnd(i) * 0.08})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); }   // road grime
});
let WG = null;
const wheelGeo = () => WG ??= (() => {
  const R0 = 0.18, R1 = WR, W = 0.175;
  const tyre = new THREE.LatheGeometry([[R0, -W * 0.45], [R0 + 0.025, -W * 0.5], [R1 - 0.035, -W * 0.5], [R1 - 0.008, -W * 0.42], [R1, -W * 0.25], [R1 + 0.002, 0], [R1, W * 0.25], [R1 - 0.008, W * 0.42], [R1 - 0.035, W * 0.5], [R0 + 0.025, W * 0.5], [R0, W * 0.45]].map(([r, y]) => new THREE.Vector2(r, y)), 40);
  const cover = new THREE.LatheGeometry([[0.0, W * 0.5 + 0.012], [0.08, W * 0.5 + 0.01], [0.17, W * 0.5 - 0.0], [0.19, W * 0.5 - 0.02]].map(([r, y]) => new THREE.Vector2(r, y)), 32);
  // planar UVs for the cover (looking down the axle)
  const P = cover.attributes.position, U = cover.attributes.uv;
  for (let i = 0; i < P.count; i++) U.setXY(i, 0.5 + P.getX(i) / 0.4, 0.5 + P.getZ(i) / 0.4);
  return { tyre, cover };
})();
export const Wheel = ({ position, side = 1, spin = 0 }) => {
  const g = wheelGeo();
  const mats = useMemo(() => ({ tyre: new THREE.MeshStandardMaterial({ color: "#1C1E21", roughness: 0.85 }), cover: new THREE.MeshStandardMaterial({ map: coverTex(), roughness: 0.38, metalness: 0.55 }) }), []);
  return (
    <group position={position} rotation-x={side * Math.PI / 2}>
      <group rotation-y={spin}>
        <mesh geometry={g.tyre} material={mats.tyre} castShadow receiveShadow />
        <mesh geometry={g.cover} material={mats.cover} castShadow />
      </group>
    </group>
  );
};
// ── badges, plate, mirrors, handles, wipers, the antenna ──────────────────────────────────────────────────────────────────
const yarisBadgeTex = () => canvasTex("b_yaris_badge", 512, 128, (c, w, h) => {
  c.clearRect(0, 0, w, h);
  c.font = `700 96px ${BODY}`; c.textAlign = "center"; c.textBaseline = "middle";
  if ("letterSpacing" in c) c.letterSpacing = "10px";
  c.fillStyle = "#3A3F46"; c.fillText("YARIS", w / 2 + 3, h / 2 + 5);
  const g = c.createLinearGradient(0, 20, 0, h - 20); g.addColorStop(0, "#FFFFFF"); g.addColorStop(0.5, "#AEB6C0"); g.addColorStop(1, "#E6EAF0");
  c.fillStyle = g; c.fillText("YARIS", w / 2, h / 2);
});
/** a Vermont plate: green, white border; VERMONT across the top, GREEN MOUNTAIN STATE at the bottom (a made-up registration) */
const plateTex = () => canvasTex("b_vt_plate", 600, 300, (c, w, h) => {
  c.fillStyle = "#1F5A3A"; c.beginPath(); c.roundRect(0, 0, w, h, 22); c.fill();
  c.strokeStyle = "#F2F2EE"; c.lineWidth = 10; c.beginPath(); c.roundRect(12, 12, w - 24, h - 24, 16); c.stroke();
  c.fillStyle = "#F2F2EE"; c.textAlign = "center"; c.textBaseline = "middle";
  c.font = `800 128px ${BODY}`; c.fillText("VERMONT", w / 2, 160, w - 60);   /* no invented plate number */
  c.font = `700 30px ${BODY}`; c.fillText("GREEN MOUNTAIN STATE", w / 2, 258);
  for (const x of [70, w - 70]) { c.fillStyle = "#8A9099"; c.beginPath(); c.arc(x, 50, 9, 0, 7); c.fill(); }
  for (let i = 0; i < 2000; i++) { c.fillStyle = `rgba(40,40,30,${rnd(i) * 0.08})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); }
});
/** the snow lying on the roof: a blanket draped on the roof surface, thickest in the middle, feathering out before the edges */
export const roofSnowGeo = () => {
  const NX = 60, NZ = 30, x0 = -1.5, x1 = 0.05, pos = [], idx = [];
  for (let i = 0; i <= NX; i++) for (let j = 0; j <= NZ; j++) {
    const x = x0 + (x1 - x0) * i / NX, h = halfRing(x), zt = h.zt * 0.97, v = (j / NZ) * 2 - 1, z = v * zt;
    const cr = crownH(x) * Math.min(1, h.zt / 0.6), y = topY(x) + cr * (1 - v * v);
    const edge = Math.min(1, (1 - Math.abs(v)) * 5) * Math.min(1, (x - x0) * 6, (x1 - x) * 6);
    const th = 0.055 * Math.pow(Math.max(0, edge), 0.6) * (0.85 + 0.15 * Math.sin(x * 9 + v * 3));
    pos.push(x, y + th - 0.004, z);
  }
  for (let i = 0; i < NX; i++) for (let j = 0; j < NZ; j++) { const a = i * (NZ + 1) + j, b = a + NZ + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  if (g.attributes.normal.getY(Math.floor(pos.length / 6)) < 0) { const I = g.index.array; for (let k = 0; k < I.length; k += 3) { const t = I[k + 1]; I[k + 1] = I[k + 2]; I[k + 2] = t; } g.computeVertexNormals(); }
  return g;
};
export const Yaris = ({ snow = 1 }) => {
  const body = useMemo(yarisBody, []);
  const roofSnow = useMemo(roofSnowGeo, []);
  const paint = useMemo(yarisPaint, []);
  const mats = useMemo(() => ({
    black: new THREE.MeshStandardMaterial({ color: "#121417", roughness: 0.5 }),
    chrome: new THREE.MeshStandardMaterial({ color: "#D8DEE6", roughness: 0.14, metalness: 0.95 }),
    mirror: new THREE.MeshStandardMaterial({ color: "#8E99A6", roughness: 0.02, metalness: 1 }),
    badge: new THREE.MeshStandardMaterial({ map: yarisBadgeTex(), transparent: true, roughness: 0.2, metalness: 0.8, polygonOffset: true, polygonOffsetFactor: -2 }),
    plate: new THREE.MeshStandardMaterial({ map: plateTex(), roughness: 0.4, metalness: 0.2 }),
    liner: new THREE.MeshStandardMaterial({ color: "#07080A", roughness: 0.9, side: THREE.BackSide }),
    snow: new THREE.MeshStandardMaterial({ color: "#EEF2F8", roughness: 0.85 })
  }), []);
  // where things sit on the surface
  const hatchX = (y) => { let a = XR, b = -1.5; for (let k = 0; k < 40; k++) { const m = (a + b) / 2; if (topY(m) > y) b = m; else a = m; } return (a + b) / 2; };
  const yP = 0.74, xP = hatchX(0.74);
  return (
    <group>
      <mesh geometry={body} material={paint} castShadow receiveShadow />
      {/* arch liners (dark half-cylinders inside each arch) */}
      {[AXF, AXR].map((x) => [-1, 1].map((sd) => (
        <mesh key={x + "_" + sd} position={[x, WR, sd * 0.56]} rotation-x={Math.PI / 2} material={mats.liner}>
          <cylinderGeometry args={[ARCH - 0.005, ARCH - 0.005, 0.56, 24, 1, true, -Math.PI / 2, Math.PI]} />
        </mesh>
      )))}
      {[AXF, AXR].map((x) => [-1, 1].map((sd) => <Wheel key={x + "w" + sd} position={[x, WR, sd * TRACK]} side={sd} />))}
      {/* door mirrors (body colour shells, black bases, glass) */}
      {[-1, 1].map((sd) => (
        <group key={sd} position={[0.93, 1.03, sd * 0.79]}>
          <mesh position={[0, -0.02, -sd * 0.03]} material={mats.black}><boxGeometry args={[0.1, 0.06, 0.06]} /></mesh>
          <mesh position={[-0.02, 0.02, sd * 0.07]} material={paint} castShadow scale={[0.55, 0.62, 1]}><sphereGeometry args={[0.1, 16, 12]} /></mesh>
          <mesh position={[-0.06, 0.02, sd * 0.07]} rotation-y={Math.PI / 2} material={mats.mirror}><planeGeometry args={[0.14, 0.1]} /></mesh>
        </group>
      ))}
      {/* door handles (body colour, a dark recess behind) */}
      {[[0.12, 0.9], [-0.95, 0.92]].map(([x, y]) => [-1, 1].map((sd) => (
        <group key={x + "h" + sd} position={[x, y, sd * (sideZ(x, y) + 0.004)]}>
          <mesh material={mats.black}><boxGeometry args={[0.15, 0.04, 0.006]} /></mesh>
          <mesh position={[0.01, 0, sd * 0.012]} material={paint}><boxGeometry args={[0.13, 0.03, 0.018]} /></mesh>
        </group>
      )))}
      {/* the wipers: two at the cowl, one on the hatch glass; the roof antenna */}
      {[-0.32, 0.18].map((z) => <mesh key={z} position={[1.0, topY(1.0) + 0.03, z]} rotation={[0, -0.18, 0.45]} material={mats.black}><boxGeometry args={[0.5, 0.012, 0.02]} /></mesh>)}
      <mesh position={[hatchX(1.18) - 0.015, 1.18, 0.1]} rotation={[0, 0, 1.12]} material={mats.black}><boxGeometry args={[0.012, 0.36, 0.02]} /></mesh>
      <mesh position={[-1.3, topY(-1.3) + 0.12, 0]} rotation-z={0.5} material={mats.black}><cylinderGeometry args={[0.004, 0.008, 0.3, 6]} /></mesh>
      {/* the rear: YARIS on the hatch (lower right), the plain ellipse, the plate in its recess with its lamp */}
      <mesh position={[hatchX(0.9) - 0.012, 0.9, 0.3]} rotation-y={-Math.PI / 2} material={mats.badge}><planeGeometry args={[0.2, 0.05]} /></mesh>
      <mesh position={[hatchX(0.93) - 0.012, 0.93, 0]} rotation={[0, -Math.PI / 2, 0]} scale={[1, 0.68, 1]} material={mats.chrome}><torusGeometry args={[0.055, 0.008, 8, 32]} /></mesh>
      <mesh position={[xP + 0.002, yP, 0]} rotation-y={-Math.PI / 2} material={mats.black}><boxGeometry args={[0.37, 0.175, 0.012]} /></mesh>
      <mesh position={[xP - 0.006, yP, 0]} rotation-y={-Math.PI / 2} material={mats.plate}><planeGeometry args={[0.31, 0.155]} /></mesh>
      <mesh position={[xP - 0.01, yP + 0.095, 0]} material={mats.black}><boxGeometry args={[0.03, 0.012, 0.12]} /></mesh>
      {/* the snow on the roof: a soft slab with rounded edges, a few clumps on the hood and the wipers' sweep left clear */}
      {snow > 0 && <mesh geometry={roofSnow} material={mats.snow} castShadow receiveShadow />}
    </group>
  );
};
