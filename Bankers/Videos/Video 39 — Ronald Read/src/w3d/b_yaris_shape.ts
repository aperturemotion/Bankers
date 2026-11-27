// @ts-nocheck
// ★ V39 builder B — the 2007 Yaris Liftback (XP90, 3-door, US) body PROFILE as pure functions (no three.js), shared by the body
//   loft, the paint shader's baked profile, the cabin builder and the snow. Front = +x, right side = +z, ground y = 0, metres.
//   Real figures (US/Canadian spec): length 150.0 in ≈ 3.81 m, width 66.7 in ≈ 1.695 m, height 60.0 in ≈ 1.525 m, wheelbase
//   96.9 in ≈ 2.46 m, 175/65 R14 tyres on steel wheels with covers.
//   The side/plan/top curves were first drawn for the 3.75 m car; REMAP stretches them onto the real overhangs (the axles stay at
//   the real wheelbase) and the roof is brought down to the real 1.525 m over its crown.
export const XR = -1.905, XF = 1.905, LEN = XF - XR;
export const AXF = 1.135, AXR = -1.326, WR = 0.292, ARCH = 0.335, TRACK = 0.735;
export const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const ss = (a, b, x) => { const t = cl((x - a) / (b - a)); return t * t * (3 - 2 * t); };
// new x → the old authoring x (piecewise linear through the bumpers and both axles)
const NA = [XR, AXR, AXF, XF], OA = [-1.875, -1.34, 1.12, 1.875];
export const U = (x) => {
  if (x <= NA[1]) return OA[0] + (x - NA[0]) * (OA[1] - OA[0]) / (NA[1] - NA[0]);
  if (x <= NA[2]) return OA[1] + (x - NA[1]) * (OA[2] - OA[1]) / (NA[2] - NA[1]);
  return OA[2] + (x - NA[2]) * (OA[3] - OA[2]) / (NA[3] - NA[2]);
};
/** centreline top (before the crown): nose, hood, cowl, the long raked windshield, roof, spoiler lip, hatch glass, lower hatch */
const topY0 = (x) => {
  if (x >= 1.8) { const t = (x - 1.8) / (1.875 - 1.8); return 0.762 - 0.16 * t * t; }
  if (x >= 1.05) return 0.985 - 0.223 * Math.pow((x - 1.05) / 0.75, 1.25);
  if (x >= 0.12) { const u = (1.05 - x) / 0.93; return 0.985 + 0.485 * u + 0.035 * Math.sin(Math.PI * u) - 0.02 * ss(0.75, 1, u) * (1 - ss(0.98, 1.0, u)); }
  if (x >= -0.45) { const u = (x + 0.45) / 0.57; return 1.525 - 0.055 * u * u; }
  if (x >= -1.56) { const u = (x + 0.45) / 1.11; return 1.525 - 0.065 * u * u; }
  if (x >= -1.62) return 1.46 + 0.008 * Math.sin(Math.PI * (-1.56 - x) / 0.06) - 0.03 * ((-1.56 - x) / 0.06);
  if (x >= -1.835) { const u = (-1.62 - x) / 0.215; return 1.43 - 0.411 * u - 0.03 * Math.sin(Math.PI * u); }
  const u = (-1.835 - x) / (-1.835 - -1.875); return 1.019 - 0.45 * u - 0.05 * u * u;
};
export const topY = (x) => { const y = topY0(U(x)); return y - 0.052 * ss(0.99, 1.45, y); };
/** the beltline: nearly level along the long door, then the 3-door's rising kick through the rear quarter window */
export const beltY = (x) => (x > -0.45 ? 0.975 + 0.03 * (1.05 - x) / 2.05 : 0.9969 + 0.115 * ss(-0.5, -1.5, x));
export const planW = (x0) => {
  const x = U(x0);
  let w = 0.8475 * (1 - 0.025 * (x / 1.875) ** 2);
  if (x > 1.32) { const t = cl((x - 1.32) / (1.875 - 1.32)); w *= Math.pow(1 - Math.pow(t, 2.3), 1 / 2.3); }
  if (x < -1.58) { const t = cl((-1.58 - x) / (-1.58 + 1.875)); w *= Math.pow(1 - Math.pow(t, 2.7), 1 / 2.7); }
  return w;
};
const gLow = (y) => 1 - 0.045 * ((y - 0.74) / 0.32) ** 2 - 1.4 * Math.max(0, 0.36 - y) ** 2;
/** the half-width of the body side at (x, y) (tumblehome above the belt) */
export const sideZ = (x, y) => {
  const b = beltY(x);
  if (y <= b) return planW(x) * gLow(y);
  return planW(x) * (gLow(b) - 0.3 * Math.pow((y - b) / 0.47, 1.25));
};
export const archY = (x) => { let y = -1; for (const c of [AXF, AXR]) { const d = x - c; if (Math.abs(d) < ARCH) y = Math.max(y, WR + Math.sqrt(ARCH * ARCH - d * d)); } return y; };
const baseY = (x) => 0.19 + 0.07 * ss(1.58, XF, x) + 0.11 * ss(-1.58, XR, x);
export const botY = (x) => Math.max(baseY(x), archY(x));
export const crownH = (x) => { const u = U(x); return u > 1.05 ? 0.035 : u > 0.12 ? 0.06 : u > -1.6 ? 0.06 : 0.035; };
export const RC = (x) => (U(x) > 1.05 ? 0.045 : 0.085);
export const RB = 0.035;
const NB = 4, NBC = 3, NS1 = 12, NS2 = 8, NC = 6, NT = 9;
/** the half section at x (z ≥ 0): bottom centre → sill corner → side (belt exact) → roof corner → top centre; zt = the top-corner half-width */
export const halfRing = (x) => {
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
  return { pts, zt, yt: yt + cr, cr };
};
/** the roof surface height at (x, z) (with the crown), for things that sit on / hang under the roof */
export const roofAt = (x, z) => { const h = halfRing(x); const v = h.zt > 0 ? Math.min(1, Math.abs(z) / h.zt) : 1; return topY(x) + h.cr * (1 - v * v); };
/** the x where the hatch / rear face passes height y (searching the rear) */
export const hatchX = (y) => { let a = XR, b = -1.5; for (let k = 0; k < 40; k++) { const m = (a + b) / 2; if (topY(m) > y) b = m; else a = m; } return (a + b) / 2; };
/** the x where the windshield passes height y */
export const shieldX = (y) => { let a = 0.12, b = 1.05; for (let k = 0; k < 40; k++) { const m = (a + b) / 2; if (topY(m) > y) a = m; else b = m; } return (a + b) / 2; };
// the 3-door's openings (side view): the long door, the B-pillar, the rear quarter window
export const DOOR_F = 0.775, DOOR_R = -0.455;
export const bPill = (y) => -0.40 + 0.12 * (y - 1.0);            // the door glass's rear edge (the black B-pillar runs 0.09 behind it)
export const qRear = (y) => -1.43 + 0.62 * (y - 1.1);           // the quarter window's raked rear edge
export const qDiv = (y) => 0.60 - 0.2 * (y - 1.0);               // the door's front quarter-light division bar
