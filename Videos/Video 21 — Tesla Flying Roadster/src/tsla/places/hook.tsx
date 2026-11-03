import React from "react";
import { useCurrentFrame } from "remotion";
import { rInOut, rOut, clamp01 } from "../anim";
import { label } from "../kit";
import { type Rig } from "../rig";
import { Faces, P, pts, quad, hexa, mix, depthOf, contactShadow, lightOf, steelBox, type Face, type V } from "../p3";
import { roadsterFaces, roadsterShadow, RoadsterJets, RoadsterDefs, dirWorld, spinBlurFor, RD, type Pose } from "../roadster";
import { carFaces, carShadow, lenOf, widthOf, type CarModel } from "../lineup";

// ══════════════════════════════════════════════════════════════════════════════════════════════
// hookA / hookB — ★ THE JUMP OVER THE ROW (the brief's mandatory hook): "Tesla built a car that jumps over other cars. And Elon Musk
// calls it the best of the last human-driven cars." Real depth (the idea is motion through space — STYLE §6.1a), one rig, its OWN
// following camera (a pan on a smoothed path of the car — one transform, eased).
//   · THE RAMP (revision 1, 2026-10-29: "a lot more detail on the ramp … the car should not clip through the ramp … the ramp should be set
//     up properly"): a real twin-track STUNT KICKER in the Bankers satin steel. Two steel wheel tracks (one under each pair of tyres, the
//     car's floor and diffuser passing over the open middle) rise from feather-edged lips on the pad through a clothoid transition and a
//     1,100-px curve into a 30° incline. Each track: tread-plate deck plates with joints, bevelled edges catching the key, bolt rows on its
//     steel sides, a box stringer under it; cross-members tie the two tracks; trestle legs with base plates, ties and X-braces carry it;
//     guard rails with posts run along the outer edges (the near one low, so the wheels stay in view).
//     ★ Why a kicker and not the old 180° corkscrew: a rigid car cannot keep four tyres on a twisted deck (its two axles would need two
//     bank angles at once — the old ramp sank the wheels and floated them by up to ~30 px), and a curl tight enough to invert it inside a
//     hook-sized frame drives its overhangs and diffuser into the deck. The car is turned over IN THE AIR instead, by its thrusters.
//   · THE PHYSICS (all measured — scratchpad session notes): the car's wheel centres ride the deck's offset line exactly (tyre gap 0 at
//     every frame); it accelerates up the run, leaves the lip at the speed real gravity needs for the 50-frame flight (its centre of mass
//     on a true parabola, g = 9.81 m/s² at the car's own scale), barrel-rolls 360° on its thrusters, clears every roof in the row, lands
//     level on all four wheels with a squat, and brakes to rest. The wheels turn with the distance travelled (spin = d / wheelR) and blur
//     (`spinBlur`) when too fast to read.
//   · THE LINE-UP (lineup.tsx): a Model 3, a Model Y, a Semi cab, a Cybertruck and a Cybercab, parked at an angle in a row under the flight
//     (their flanks to the camera). THE PAYOFF (line two): the five pull away BY THEMSELVES, the Cybercab first; "BEST OF THE LAST
//     HUMAN-DRIVEN" lands under the Roadster (Musk's words — TechCrunch); EXIT: the Roadster pulls away too.
// World: x along the stunt, y DOWN (the floor is y = 0), z toward the camera. The hook's own camera maps world → the rig's frame.
// ══════════════════════════════════════════════════════════════════════════════════════════════

export const KIND = "object";

export type HookCues = { tesla: number; built: number; car: number; jumps: number; over: number; cars: number; elon: number; musk: number;
  calls: number; best: number; last: number; human: number; driven: number };

// ══════════════════════════════════════════════════════════════════════════════════════════════
// ★ THE RIDE ENGINE (shared with profile.tsx). A DRIVING LINE is the deck's top in the stunt's vertical plane (x right, y down), built
// from a curvature programme (pieces whose curvature runs k0 → k1: + turns the nose UP). A RIGID car rides it exactly: its two wheel
// centres sit on the line's offset by the tyre radius (so each tyre touches the deck at one point and never cuts it), the wheelbase apart;
// the car's pitch is the chord between them. Nothing is eyeballed: a tyre's gap to the deck is zero by construction, and the checks
// (`nearestOnLine`) measure it independently.
// ══════════════════════════════════════════════════════════════════════════════════════════════
export type Piece = { len: number; k0: number; k1: number };
export type Line = { x: Float64Array; y: Float64Array; a: Float64Array; L: number; ds: number };
/** a driving line from (x0, y0) heading a0 (radians; 0 = +x, y down), integrated every `ds` px at the segment midpoints */
export const lineOf = (x0: number, y0: number, a0: number, pieces: Piece[], ds = 1): Line => {
  const L = pieces.reduce((s, p) => s + p.len, 0), n = Math.ceil(L / ds) + 1;
  const x = new Float64Array(n), y = new Float64Array(n), a = new Float64Array(n);
  x[0] = x0; y[0] = y0; a[0] = a0;
  const kAt = (s: number) => { let acc = 0; for (const p of pieces) { if (s <= acc + p.len) return p.k0 + (p.k1 - p.k0) * ((s - acc) / p.len); acc += p.len; } return pieces[pieces.length - 1].k1; };
  for (let i = 1; i < n; i++) {
    const k = kAt((i - 0.5) * ds), am = a[i - 1] - (k * ds) / 2;
    x[i] = x[i - 1] + Math.cos(am) * ds; y[i] = y[i - 1] + Math.sin(am) * ds; a[i] = a[i - 1] - k * ds;
  }
  return { x, y, a, L: (n - 1) * ds, ds };
};
/** the line at arc length s (straight on beyond either end, along its end tangents) */
export const lineAt = (ln: Line, s: number) => {
  const n = ln.x.length;
  if (s <= 0) return { x: ln.x[0] + Math.cos(ln.a[0]) * s, y: ln.y[0] + Math.sin(ln.a[0]) * s, a: ln.a[0] };
  if (s >= ln.L) { const e = s - ln.L; return { x: ln.x[n - 1] + Math.cos(ln.a[n - 1]) * e, y: ln.y[n - 1] + Math.sin(ln.a[n - 1]) * e, a: ln.a[n - 1] }; }
  const u = s / ln.ds, i = Math.min(n - 2, Math.floor(u)), t = u - i;
  return { x: ln.x[i] + (ln.x[i + 1] - ln.x[i]) * t, y: ln.y[i] + (ln.y[i + 1] - ln.y[i]) * t, a: ln.a[i] + (ln.a[i + 1] - ln.a[i]) * t };
};
/** the car's UP for a car heading along angle a (the deck's normal on the car's side) */
export const upOf = (a: number): [number, number] => [Math.sin(a), -Math.cos(a)];
/** a point of the deck: at arc length s, `h` along the up normal (− is into the deck), at depth z */
export const deckPt = (ln: Line, s: number, h: number, z: number): V => { const p = lineAt(ln, s), u = upOf(p.a); return [p.x + u[0] * h, p.y + u[1] * h, z]; };
export type Ride = { x: number; y: number; a: number; pitch: number; sr: number; sf: number; wr: [number, number]; wf: [number, number] };
/** ★ A RIGID CAR ON THE LINE, its FRONT tyre's contact at arc length sf (scale sc): both wheel centres on the offset line, the wheelbase
 *  apart. Returns the car's origin (the ground under its wheels' centre, RD's local y 0), its chord angle and pitch (deg, nose up +). */
export const rideOn = (ln: Line, sf: number, sc = 1): Ride => {
  const rw = RD.wheelR * sc, wb = (RD.wheelX[1] - RD.wheelX[0]) * sc, rear = -RD.wheelX[0] * sc;
  const O = (s: number): [number, number] => { const p = lineAt(ln, s), u = upOf(p.a); return [p.x + u[0] * rw, p.y + u[1] * rw]; };
  const F = O(sf);
  let lo = sf - wb * 1.8, hi = sf - wb * 0.3;
  for (let k = 0; k < 44; k++) { const m = (lo + hi) / 2, R = O(m); if (Math.hypot(F[0] - R[0], F[1] - R[1]) > wb) lo = m; else hi = m; }
  const sr = (lo + hi) / 2, R = O(sr), a = Math.atan2(F[1] - R[1], F[0] - R[0]), u = upOf(a);
  const k = rear / wb;
  return { x: R[0] + (F[0] - R[0]) * k - u[0] * rw, y: R[1] + (F[1] - R[1]) * k - u[1] * rw, a, pitch: (-a * 180) / Math.PI, sr, sf, wr: R, wf: F };
};
/** the nearest point of the line to (x, y) within [s0, s1]: its arc length, and the SIGNED distance (+ on the car's side) */
export const nearestOnLine = (ln: Line, x: number, y: number, s0 = 0, s1 = ln.L) => {
  let best = Infinity, bs = s0;
  const step = Math.max(ln.ds, 4);
  for (let s = s0; s <= s1; s += step) { const p = lineAt(ln, s), d = (p.x - x) ** 2 + (p.y - y) ** 2; if (d < best) { best = d; bs = s; } }
  let lo = Math.max(s0, bs - step), hi = Math.min(s1, bs + step);
  for (let k = 0; k < 30; k++) { const m1 = lo + (hi - lo) / 3, m2 = hi - (hi - lo) / 3; const p1 = lineAt(ln, m1), p2 = lineAt(ln, m2);
    if ((p1.x - x) ** 2 + (p1.y - y) ** 2 < (p2.x - x) ** 2 + (p2.y - y) ** 2) hi = m2; else lo = m1; }
  const s = (lo + hi) / 2, p = lineAt(ln, s), u = upOf(p.a);
  return { s, d: (x - p.x) * u[0] + (y - p.y) * u[1], dist: Math.hypot(x - p.x, y - p.y) };
};

// ── ★ THE BANKERS SATIN STEEL (the revision brief: a pale lit face → the deep blue turned from the key, the sheen continuous across a
// panel because every facet is lit by its own normal — never a per-facet overlay): the key's Lambert term plus the room's reflection ──
const sst = (a: number, b: number, x: number) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const vw = (r: Rig, [nx, ny, nz]: V) => {
  const b = (r.yaw * Math.PI) / 180, a = (r.pitch * Math.PI) / 180;
  const x1 = nx * Math.cos(b) + nz * Math.sin(b), z1 = -nx * Math.sin(b) + nz * Math.cos(b);
  return { x: x1, y: ny * Math.cos(a) - z1 * Math.sin(a), z: ny * Math.sin(a) + z1 * Math.cos(a) };
};
const envOf = (r: Rig, n: V) => {
  const v = vw(r, n), up = -2 * v.z * v.y, sx = 2 * v.z * v.x;
  return clamp01(0.05 + 0.2 * sst(-0.55, 0.02, up) + 0.46 * sst(0.03, 0.13, up) + 0.24 * sst(0.28, 0.85, up) * (0.4 + 0.6 * sst(0.25, -0.55, sx)));
};
const STEEL: [number, string][] = [[0, "#011A38"], [0.22, "#06305F"], [0.42, "#174C8E"], [0.6, "#2F6CB4"], [0.76, "#6FA3DF"], [0.9, "#B3CEEF"], [1, "#DCE9F7"]];
const ramp = (t: number) => { const u = clamp01(t); for (let i = 0; i < STEEL.length - 1; i++) if (u <= STEEL[i + 1][0]) return mix(STEEL[i][1], STEEL[i + 1][1], (u - STEEL[i][0]) / (STEEL[i + 1][0] - STEEL[i][0])); return STEEL[STEEL.length - 1][1]; };
/** a steel face's colour for its world normal: `lift` brightens (a bevel's catch-light), `deep` darkens (tread plate, shadowed parts) */
export const steel = (r: Rig, n: V, lift = 0, deep = 0) => ramp((0.56 * lightOf(r, n) + 0.44 * envOf(r, n)) * (1 - deep) + lift);
const nrm3 = (a: V): V => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const sub3 = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const crs3 = (a: V, b: V): V => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const add3 = (a: V, b: V, k = 1): V => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
/** a square-section steel member from a to b (`hw` half its side), each face lit by its own normal */
export const beamFaces = (r: Rig, k: string, a: V, b: V, hw: number, lift = 0.05, o: Partial<Face> = {}): Face[] => {
  const ax = nrm3(sub3(b, a)), ref: V = Math.abs(ax[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
  const p1 = nrm3(crs3(ax, ref)), p2 = nrm3(crs3(ax, p1));
  const c: V[] = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => add3(add3(i & 1 ? b : a, p1, i & 2 ? hw : -hw), p2, i & 4 ? hw : -hw));
  return hexa(r, k, c, (_n, n) => steel(r, n, lift), { chrome: 0, fall: 0, skip: true, ...o });
};
/** an SVG affine mapping (u, v) → screen, given three projected points: (u0, v0) → p0, (u1, v0) → p1, (u0, v1) → p2 */
export const affineUV = (p0: { x: number; y: number }, p1: { x: number; y: number }, p2: { x: number; y: number }, u0: number, u1: number, v0: number, v1: number) => {
  const a = (p1.x - p0.x) / (u1 - u0), b = (p1.y - p0.y) / (u1 - u0), c = (p2.x - p0.x) / (v1 - v0), d = (p2.y - p0.y) / (v1 - v0);
  return `matrix(${a.toFixed(5)} ${b.toFixed(5)} ${c.toFixed(5)} ${d.toFixed(5)} ${(p0.x - a * u0 - c * v0).toFixed(3)} ${(p0.y - b * u0 - d * v0).toFixed(3)})`;
};
/** the tread plate: raised lozenges in alternate directions (a static pattern, laid ON a deck plate through its own affine) */
export const TreadDefs: React.FC<{ id: string; tile?: number }> = ({ id, tile = 18 }) => {
  const t = tile, q = t / 2;
  return (
    <defs data-probe-skip>
      <pattern id={id} patternUnits="userSpaceOnUse" width={t} height={t}>
        <path d={`M${t * 0.12 + 0.5} ${q * 0.82 + 0.5} L${q * 0.82 + 0.5} ${t * 0.12 + 0.5} M${q + t * 0.12 + 0.5} ${t * 0.88 + 0.5} L${t * 0.88 + 0.5} ${q + t * 0.12 + 0.5}`} stroke="#000C1E" strokeOpacity={0.5} strokeWidth={t * 0.13} strokeLinecap="round" />
        <path d={`M${t * 0.12} ${q * 0.82} L${q * 0.82} ${t * 0.12} M${q + t * 0.12} ${t * 0.88} L${t * 0.88} ${q + t * 0.12}`} stroke="#B3CEEF" strokeOpacity={0.3} strokeWidth={t * 0.11} strokeLinecap="round" />
      </pattern>
    </defs>
  );
};
/** ★ the spin blur from the wheels' turn per frame (the model's own house value: 0 below 0.35 rad/f, the spokes read; full by 0.75) */
export const blurOf = (radPerFrame: number) => spinBlurFor(radPerFrame);

// ══════════════════════════════════════════════════════════════════════════════════════════════
// THE HOOK'S STUNT
// ══════════════════════════════════════════════════════════════════════════════════════════════
/** real gravity at the car's own scale: 430 px = 4.3 m → 100 px/m; 30 fps → 9.81 · 100 / 900 px/f² */
export const G1 = (9.81 * 100) / 900;
const RW = RD.wheelR;
/** the car's centre of mass above its wheels' contact (local) */
const HC = 52;
/** the landing squat (local px): the most the body can sink before its lowest sprung part (4.5 px up) would touch the ground, less 1 */
export const SQUAT = 3.5;
// ── THE KICKER: two wheel tracks at z ±ZT, each TW either side of its centre; the driving line: the pad, a clothoid in, a 1,100-px arc, a
// clothoid out, a straight 30° incline to the lip ──
const ZT = 98, TW = 20;   // z 78…118: the tyres (79…105) wholly on the plate, the nose splitter (to z 77) over the open middle
const RT = 1100, KA = (22 * Math.PI) / 180, LC = 220, LA = RT * KA - LC, LI = 860, RUNIN = 1000;
/** the foot of the kicker (where the tracks' feather-edged lips meet the pad) */
const XF = -1180;
const KICK = lineOf(XF - RUNIN, 0, 0, [{ len: RUNIN, k0: 0, k1: 0 }, { len: LC, k0: 0, k1: 1 / RT }, { len: LA, k0: 1 / RT, k1: 1 / RT }, { len: LC, k0: 1 / RT, k1: 0 }, { len: LI, k0: 0, k1: 0 }]);
const S_FOOT = RUNIN, S_END = KICK.L;
/** the deck plate's thickness: a feather edge on the pad, full 14 px once the track has risen (it never reaches below the floor) */
const TH = 14, BV = 2.5, SD = 22;
const heightAt = (s: number) => { const p = lineAt(KICK, s); return -p.y / Math.max(0.3, Math.cos(p.a)); };
const thk = (s: number) => Math.max(0.35, Math.min(TH, heightAt(s) - 0.15));

// ── the timing (frames) ──
const LEAVE = 46;            // the rear tyres leave the lip
const LAND = 96;             // touchdown
const TAU = LAND - LEAVE;
const FLIP: [number, number] = [LEAVE + 4, LEAVE + 34];
const JETS: [number, number] = [LEAVE + 12, LAND - 6];
// ── the release: the rear tyres at the lip, the front ones a wheelbase on along the incline; the speed that lands it at LAND under real
// gravity (its centre of mass on a parabola that ends HC above the pad, level) ──
const WB = RD.wheelX[1] - RD.wheelX[0];
const REL = rideOn(KICK, S_END + WB, 1);
const UP_E = upOf(REL.a);
const C0: [number, number] = [REL.x + UP_E[0] * HC, REL.y + UP_E[1] * HC];
// ★ THE TOUCHDOWN (Timur, 2026-10-30: "you can improve the gravity a little bit for the car itself. It can land better"). The car comes down a
// touch nose-high, as a jumped car does: its REAR tyres meet the pad first, at LAND, and the nose then falls onto the front tyres over SLAP
// frames (a rotation that accelerates, as a falling nose does — no snap, no float); the springs take the weight and come back ONCE (an
// underdamped response, one rebound), and the body nods forward on its front springs as the brakes bite, rocking back once when it stops.
/** the nose-up attitude at touchdown (°) and the frames the nose takes to come down onto the front tyres */
const LAND_PITCH = 1.8, SLAP = 6;
const landPose = (pitch: number) => ({ x: 0, y: 0, z: 0, roll: 0, pitch, yaw: 0 });
/** where the rear tyres' contact and the centre of mass sit from the car's origin at the touchdown attitude */
const LAND_REAR = dirWorld(landPose(LAND_PITCH), [RD.wheelX[0], 0, 0]), LAND_COM = dirWorld(landPose(LAND_PITCH), [0, -HC, 0]);
/** the centre of mass's height at touchdown: the rear tyres on the pad */
const COM_END_Y = LAND_COM[1] - LAND_REAR[1];
const VE = (COM_END_Y - C0[1] - (G1 * TAU * TAU) / 2) / (Math.sin(REL.a) * TAU);
const VX = VE * Math.cos(REL.a), VY0 = VE * Math.sin(REL.a);
const LAND_X = C0[0] + VX * TAU;
/** the run's net acceleration up the ramp (px/f²; a 0–60-in-under-a-second car pulling hard against the climb), set so that on frame 0
 *  the car is already on the curve, 280 px past the tracks' lips */
const ACC = (2 * (VE * LEAVE - (S_END + WB - (S_FOOT + 280)))) / (LEAVE * LEAVE);
/** the braking after touchdown (1.8 g on stunt tyres: a car that does 0–60 in under a second stops as hard), and where it comes to rest */
const BRAKE = 1.8 * G1, T_STOP = VX / BRAKE, ROLL_OUT = (VX * VX) / (2 * BRAKE), REST = LAND + Math.ceil(T_STOP);
/** the rear tyres' contact along the pad after touchdown (they roll on, braking), and the car's origin at rest */
const REAR0_X = LAND_X - LAND_COM[0] + LAND_REAR[0];
const rearXAt = (u: number) => { const t = Math.min(Math.max(0, u), T_STOP); return REAR0_X + VX * t - (BRAKE * t * t) / 2; };
const REST_X = REAR0_X + ROLL_OUT - RD.wheelX[0];
/** the whole car's pitch while its nose comes down (°): from LAND_PITCH, accelerating, to 0 at SLAP (no rate at touchdown: the flight's
 *  levelling eases into it) */
const slapPitch = (u: number) => (u <= 0 ? LAND_PITCH : u >= SLAP ? 0 : LAND_PITCH * (1 - (u / SLAP) ** 2));
/** the BODY's nod on its springs (Pose.dive, ° nose down): the nose's fall carries on into the front springs (a damped ring that starts with
 *  the slap's own rate — 2·LAND_PITCH/SLAP °/f — so the motion is continuous), plus the brakes' dive, released with one rock back as it stops */
const NOD_PER = 15, NOD_DEC = 8, NOD_A = ((2 * LAND_PITCH) / SLAP) * (NOD_PER / (2 * Math.PI)), BRAKE_DIVE = 0.7;
const stepResp = (t: number) => (t <= 0 ? 0 : 1 - Math.exp(-t / 5) * (Math.cos((2 * Math.PI * t) / 14) + (14 / (2 * Math.PI * 5)) * Math.sin((2 * Math.PI * t) / 14)));
export const hookDive = (f: number) => {
  const u = f - LAND;
  if (u <= SLAP) return 0;
  const v = u - SLAP;
  return NOD_A * Math.exp(-v / NOD_DEC) * Math.sin((2 * Math.PI * v) / NOD_PER) + BRAKE_DIVE * (rInOut(v, 0, 8) - stepResp(u - T_STOP));
};
/** the run: the front tyre's arc position at frame t ≤ LEAVE (speed VE at the release, ACC less every frame before it) */
const sfAt = (t: number) => { const d = LEAVE - t; return S_END + WB - (VE * d - (ACC * d * d) / 2); };
const runSpeed = (t: number) => Math.max(0, VE - ACC * (LEAVE - t));

/** the line-up: echelon parking under the flight, noses angled away (into the dark) and to the right. Placed FROM the flight: the Semi
 *  (the tallest) right under the apex, its neighbours spaced by their real widths with a 46-px gap between flanks (the clearances to the
 *  Roadster's hull are measured at every half frame) */
const LIP_X = lineAt(KICK, S_END).x;
const ROW_YAW = 56, ROW_GAP = 44;
const ROW_MODELS: CarModel[] = ["model3", "modely", "semi", "cybertruck", "cybercab"];
const ROW: { model: CarModel; x: number; z: number }[] = (() => {
  const apexX = C0[0] + VX * (-VY0 / G1), s = Math.sin((ROW_YAW * Math.PI) / 180);
  const xs = [0];
  for (let i = 1; i < ROW_MODELS.length; i++) xs.push(xs[i - 1] + ((widthOf(ROW_MODELS[i - 1]) + widthOf(ROW_MODELS[i])) / 2 + ROW_GAP) / s);
  // (and never under the kicker: the Model 3's footprint starts ≥ 130 px past the lip)
  const half = (m: CarModel) => (lenOf(m) / 2) * Math.cos((ROW_YAW * Math.PI) / 180) + (widthOf(m) / 2) * s;
  const x0 = Math.max(apexX - xs[2], LIP_X + 130 + half(ROW_MODELS[0]));
  return ROW_MODELS.map((model, i) => ({ model, x: x0 + xs[i], z: -60 }));
})();

export const hookTimes = (c: HookCues) => ({
  leave: LEAVE, flip: FLIP, jets: JETS, land: LAND, squat: [LAND, LAND + 26] as [number, number],
  /** the line-up drives off, the Cybercab first (each 8 f after the one before); the window ends as the last car is gone into the fog */
  drive: [c.best - 8, c.best - 8 + 120] as [number, number],
  /** the payoff's label lands under the Roadster */
  label: [c.last - 6, c.last + 14] as [number, number],
  /** the Roadster pulls away into scene two */
  exit: [c.driven + 40, c.driven + 90] as [number, number],
  done: c.last + 16,
});

// ══ ★ THE LINE-UP DRIVES OFF INTO FOG (Timur, 2026-10-30: "they accelerate way too quickly … their movement is sort of sped up … they sort of
// just fade into nowhere … make it seem more like they're not fading out, but more like going into some fog … they could go at a more
// consistent pace, not accelerating so quickly. And make sure they're fully like into the fog before completely removing them"). ══
//   · THE PACE: each car pulls away gently and smoothly (its acceleration rises from nothing and falls back to nothing: v = V·smoothstep over
//     LU_T frames, peak 1.5·LU_V/LU_T = 0.5 px/f² ≈ 0.46 g at the car's scale of 100 px/m, never the old 2100·t^1.15 lunge that kept a
//     ~60 px/f exit speed), then CRUISES at one steady speed, LU_V px/f (≈ 7 m/s, a car rolling off a lot) — every car the same.
//   · THE FOG: by distance, as air does it. From FOG_A px of travel the car loses contrast and takes the fog's colour (the field's own colour
//     at that height on screen, FOG_STOPS), until at FOG_B it is a wholly fog-coloured silhouette; its opacity starts to run out only once it
//     is ~85% fog (FOG_B − 250) and reaches 0 at GONE, after it is wholly fog — so what dissolves is a ground-coloured shape, never a car.
const LU_STAGGER = 8, LU_V = 24, LU_T = 72, LU_WR = 34;
const FOG_A = 480, FOG_B = 1480, GONE = 1680;
/** the fog's colour is the GROUND's colour where the car is: the hook's field is not one flat navy (the key light lifts it toward the top,
 *  the floor's pool lifts it again below), so a single colour left each fogged car a flat visible shape. FOG_STOPS are the field's colour
 *  by SCREEN height, sampled from the payoff's own stills where no car stands (x 200–400); the overlay is a vertical gradient through them */
export const FOG = "#042650";
const FOG_STOPS: [number, string][] = [[380, "#052E60"], [460, "#052B57"], [520, "#042852"], [580, "#04274E"], [640, "#03244A"], [700, "#032145"],
  [760, "#032042"], [830, "#042243"], [900, "#082A4F"]];
/** the fog gradient in the hook SVG's zoomed user space (screen y s ↔ user y 1010 + (s − 1010) / zoom) */
const FogDefs: React.FC<{ zoom: number }> = ({ zoom }) => {
  const u = (s: number) => 1010 + (s - 1010) / zoom, y0 = u(FOG_STOPS[0][0]), y1 = u(FOG_STOPS[FOG_STOPS.length - 1][0]);
  return (
    <defs data-probe-skip>
      <linearGradient id="hkFog" gradientUnits="userSpaceOnUse" x1={0} x2={0} y1={y0.toFixed(1)} y2={y1.toFixed(1)}>
        {FOG_STOPS.map(([s, col]) => <stop key={s} offset={((u(s) - y0) / (y1 - y0)).toFixed(4)} stopColor={col} />)}
      </linearGradient>
    </defs>
  );
};
/** a driving car's travel t frames after it starts (px): v rises as a smoothstep to LU_V over LU_T frames, then holds */
const luDist = (t: number) => {
  if (t <= 0) return 0;
  if (t < LU_T) { const x = t / LU_T; return LU_V * LU_T * (x ** 3 - x ** 4 / 2); }
  return (LU_V * LU_T) / 2 + LU_V * (t - LU_T);
};
/** every line-up car at frame f (row order): its travel, its wheels' turn per frame, how deep in the fog it is (0…1) and its opacity */
export const hookLineup = (f: number, c: HookCues) => {
  const d0 = hookTimes(c).drive[0];
  return ROW.map((_cr, i) => {
    const t0 = d0 + (ROW.length - 1 - i) * LU_STAGGER;   // the Cybercab (last in the row) goes first
    const d = luDist(f - t0);
    return { d, t0, rate: (luDist(f - t0 + 0.5) - luDist(f - t0 - 0.5)) / LU_WR, fog: sst(FOG_A, FOG_B, d), op: 1 - sst(FOG_B - 250, GONE, d) };
  });
};

/** the camera's height through the flight: 55% of the way up to the apex of the car's arc (world y) */
const APEX_Y = C0[1] - (VY0 * VY0) / (2 * G1) + HC;
const FLIGHT_TY = APEX_Y * 0.6;
/** where the camera rests after the landing: the Roadster right of centre, the row's last cars (the Cybertruck, the Cybercab) at left */
const REST_VIEW_X = REST_X - 200;
const LOOK_AHEAD = 2;
/** ★ THE HERO FRAMING (Timur, 2026-10-30: "zoom in more on the car itself, on the main car, as those other cars start to drive off … the main
 *  car … should be the subject, not the cars behind it"): from the line-up's drive-off the camera eases IN onto the Roadster at rest — the
 *  car centred, its payoff label under it (world: a little ahead of its middle, between its roof and the label on the floor) */
const HERO: [number, number] = [REST_X + 10, -20];

export type HookCar = Pose & { phase: 0 | 1 | 2; rate: number; sr?: number; sf?: number; cx?: number; cy?: number };
void REST_X;
/** the wheels' turn per frame at frame t (rad/f): rolling with the deck, free-spinning (slowly running down) in the air, then rolling with
 *  the pad as it brakes, and as it pulls away */
const rateAt = (t: number, c: HookCues) => {
  if (t <= LEAVE) return runSpeed(t) / RW;
  const air = (u: number) => (VE / RW) * (1 - (0.12 * Math.min(u, TAU)) / TAU);
  if (t <= LAND) return air(t - LEAVE);
  const u = t - LAND, ground = Math.max(0, VX - BRAKE * Math.min(u, T_STOP)) / RW, w = rOut(t, LAND, LAND + 4);
  const ex = c.driven + 40, pull = t > ex ? (9 * 1.6 * Math.pow(t - ex, 0.6)) / RW : 0;
  return air(TAU) + (ground - air(TAU)) * w + pull;
};
/** the wheels' total turn (rad): the integral of the rate from well before frame 0 */
const spinAt = (f: number, c: HookCues) => {
  let s = 0;
  const t0 = -40, h = 0.5;
  for (let t = t0; t < f; t += h) { const t1 = Math.min(f, t + h); s += ((rateAt(t, c) + rateAt(t1, c)) / 2) * (t1 - t); }
  return s;
};
// ══ ★ THE CAR IN THE AIR IS A FREE BODY (Timur, 2026-10-29: "really focus on the gravity … make the car sort of wobbly while it's midair …
// natural and realistic"). Its centre of mass flies a TRUE parabola under real gravity (nothing eased: x = x0 + vx·t, y = y0 + vy·t + g·t²/2), so
// it leaves the lip fast, slows into a visible hang at the apex and is pulled down faster and faster. It turns about that centre of mass only:
//   · the 360° roll is the roll thrusters' torque (it spins up, then is braked by the opposite thrusters);
//   · every KICK rings the body a little in pitch and yaw and dies away — the lip (the front tyres drop off it before the rear ones: a nose
//     nod), the roll thrusters lighting and cutting, the main jets, the levelling burst before touchdown. Each ring is a damped oscillator's
//     impulse response with a soft 2-frame onset and a period of 13–19 frames (≈ 2 Hz: smooth at 30 fps, never a jitter or a strobe);
//   · the suspension EXTENDS as the weight leaves the wheels (the wheels drop ~7 px and bob once), and on touchdown it compresses and
//     settles critically damped (no bounce), its compression capped by the measured clearance of the model's lowest sprung parts. ══
/** a damped oscillator's response to a kick at t0 (0 before it; a soft onset; amplitude amp, period per frames, decay time dec frames) */
const ring = (t: number, t0: number, amp: number, per: number, dec: number) => {
  const u = t - t0;
  return u <= 0 ? 0 : amp * (1 - Math.exp(-u / 2)) * Math.exp(-u / dec) * Math.sin((2 * Math.PI * u) / per);
};
/** the kicks (frame, pitch amplitude °, yaw amplitude °, period f, decay f) */
const KICKS: { t: number; p: number; y: number; per: number; dec: number }[] = [
  { t: LEAVE, p: -3.9, y: 0.8, per: 17, dec: 14 },          // the lip: a nose-down nod as the front tyres drop off before the rear ones
  { t: FLIP[0], p: 1.4, y: 2.7, per: 15, dec: 12 },         // the roll thrusters light
  { t: JETS[0], p: 2.0, y: -1.7, per: 14, dec: 11 },        // the main jets
  { t: FLIP[1] - 6, p: -1.3, y: -2.1, per: 15, dec: 11 },   // the counter-thrusters brake the roll
  { t: LAND - 17, p: -1.6, y: 0.9, per: 13, dec: 9 },       // the levelling burst
];
/** the secondary motion at frame t (pitch, yaw in degrees): every ring, faded out over the last 8 frames so it touches down level */
export const hookWobble = (t: number) => {
  let p = 0, y = 0;
  for (const k of KICKS) { p += ring(t, k.t, k.p, k.per, k.dec); y += ring(t, k.t, k.y, k.per * 1.12, k.dec); }
  const w = 1 - rInOut(t, LAND - 9, LAND - 1);
  return { p: p * w, y: y * w };
};
/** the wheels' droop in the air (local px; negative squat = the body riding up off its wheels) and the bob as they unload */
const DROOP = 7;
const airSquat = (t: number) => { const u = t - LEAVE; return u <= 0 ? 0 : -DROOP * (1 - Math.exp(-u / 2.5)) + ring(t, LEAVE, 1.6, 11, 7); };
/** touchdown: from the droop, the body keeps falling onto its springs, and they push it back ONCE (Timur, 2026-10-30: "it can land better"):
 *  an underdamped spring, q(u) = e^(−σu)·(q0·cos ωu + B·sin ωu), B = (v0 + σ·q0)/ω — the deepest compression exactly SQUAT_PEAK (the
 *  measured cap), one rebound to about a third of it above rest, then a last trace that settles by ~20 frames (σ, ω: a 13-frame period) */
const SIG = 0.2, OMG = (2 * Math.PI) / 13, SQUAT_PEAK = SQUAT;
const Q0 = airSquat(LAND);
const landQ = (u: number, v0: number) => Math.exp(-SIG * u) * (Q0 * Math.cos(OMG * u) + ((v0 + SIG * Q0) / OMG) * Math.sin(OMG * u));
const V0 = (() => { let lo = 0, hi = 40; for (let k = 0; k < 50; k++) { const m = (lo + hi) / 2; let pk = -1e9; for (let u = 0; u < 30; u += 0.05) pk = Math.max(pk, landQ(u, m)); if (pk > SQUAT_PEAK) hi = m; else lo = m; } return lo; })();
/** the suspension at frame t (Pose.squat): 0 on the deck, drooping in the air, compressing and settling on the pad */
export const hookSquat = (t: number) => (t <= LEAVE ? 0 : t <= LAND ? airSquat(t) : landQ(t - LAND, V0));

/** ★ THE CAR AT FRAME f (world): on the deck (its tyres on the tracks), in the air (a free body: its centre of mass on the parabola, turning
 *  about it), then on the pad braking to rest; the exit pulls it away */
export const hookCar = (f: number, c: HookCues): HookCar => {
  if (f <= LEAVE) {
    const rd = rideOn(KICK, sfAt(f), 1);
    return { x: rd.x, y: rd.y, z: 0, roll: 0, pitch: rd.pitch, phase: 0, rate: runSpeed(f) / RW, sr: rd.sr, sf: rd.sf };
  }
  if (f <= LAND) {
    const t = f - LEAVE, cx = C0[0] + VX * t, cy = C0[1] + VY0 * t + (G1 * t * t) / 2, vy = VY0 + G1 * t;
    // its attitude: the nose eases from the ramp's angle toward half the arc's (the thrusters trimming it), levelled for the landing, plus
    // the rings; the roll is the thrusters' torque. It turns about its centre of mass (the origin is placed from it)
    const traj = (Math.atan2(-vy, VX) * 180) / Math.PI, wb = hookWobble(f);
    // (it is trimmed to come down a touch nose-high, LAND_PITCH, so the rear tyres touch first)
    const kl = rInOut(f, LAND - 16, LAND);
    const pitch = REL.pitch + (traj * 0.5 * (1 - kl) + LAND_PITCH * kl - REL.pitch) * rInOut(f, LEAVE, LEAVE + 16) + wb.p;
    const roll = -360 * rInOut(f, FLIP[0], FLIP[1]), yaw = wb.y;
    const d = dirWorld({ x: 0, y: 0, z: 0, roll, pitch, yaw }, [0, -HC, 0]);
    return { x: cx - d[0], y: cy - d[1], z: -d[2], roll, pitch, yaw, phase: 1, rate: rateAt(f, c), cx, cy };
  }
  // on the pad: the rear tyres roll on (braking) while the nose comes down onto the front ones (the car pivots on its rear contact), then the
  // body nods on its springs (hookDive); the exit pulls it away
  const u = f - LAND, ex = c.driven + 40, pitch = slapPitch(u);
  const rc = dirWorld(landPose(pitch), [RD.wheelX[0], 0, 0]);
  const pull = f > ex ? 9 * Math.pow(f - ex, 1.6) : 0;
  return { x: rearXAt(u) - rc[0] + pull, y: -rc[1], z: 0, roll: 0, pitch, phase: 2, rate: rateAt(f, c), dive: hookDive(f) };
};
/** the stunt's numbers (the session's checks read them) */
export const HOOK_RIDE = { KICK, S_FOOT, S_END, ZT, TW, TH, SD, HC, VE, VX, VY0, LAND_X, REST, ROLL_OUT, ROW, ROW_YAW, LIP_X, G: G1, LEAVE, LAND, ACC, REL };
void lenOf; void widthOf;

/** where the hook's camera looks (world): a smoothed path of the car — one transform on a steady eased path (followjit) — that holds once
 *  the car has come to rest, framing it with the line-up behind */
const RAW_TARGET = (f: number, c: HookCues): [number, number] => {
  // (in the air it looks AHEAD of the car — where it will be LOOK_AHEAD frames on — so the row it is clearing fills the frame; up the ramp,
  // with the camera closer (Z_RAMP), it looks at the car itself, so the whole car stays in frame with its margin)
  const p = hookCar(Math.min(f + LOOK_AHEAD * rInOut(f, 28, 52), REST), c);
  // (up the ramp it rides the car's height; in the air it holds one height between the apex and the pad, so the rise, the hang at the apex
  // and the fall play in the frame — gravity is SEEN, not cancelled by the camera)
  const ka = rInOut(f, LEAVE - 8, LEAVE + 10);
  const tx = p.x, ty = p.y + 10 + (FLIGHT_TY - (p.y + 10)) * ka;
  // after the landing the target settles between the line-up's last car and the Roadster at rest, the car right of centre…
  const k = rInOut(f, LAND - 6, REST + 14);
  const rx = tx + (REST_VIEW_X - tx) * k, ry = ty + (-130 - ty) * k;
  // …and as the line-up drives off it moves onto the Roadster itself (the hero framing)
  const h = heroK(f, c);
  return [rx + (HERO[0] - rx) * h, ry + (HERO[1] - ry) * h];
};
/** 0 → 1: the camera's move onto the hero, from the line-up's first car pulling away (one long in-out, ~2.7 s) */
const heroK = (f: number, c: HookCues) => { const d0 = hookTimes(c).drive[0]; return rInOut(f, d0 - 4, d0 + 78); };
const target = (f: number, c: HookCues): [number, number] => {
  // a triangular moving average over ±14 f — a smooth pan, no jolt where the car's motion changes character
  let sx = 0, sy = 0, w = 0;
  for (let k = -14; k <= 14; k++) { const a = 15 - Math.abs(k), q = RAW_TARGET(f + k, c); sx += q[0] * a; sy += q[1] * a; w += a; }
  return [sx / w, sy / w];
};
/** the hook's camera target at its rest (Video.tsx aims nothing here: the hook carries its own camera) */
export const HOOK = { x: 540, y: 960 } as const;

const ROOF: Record<CarModel, number> = { model3: -144, modely: -162, semi: -400, cybertruck: -179, cybercab: -122 };
export const HOOK_ROOF = ROOF;

/** ★ A TWIN-TRACK STEEL DECK along a driving line (shared with profile.tsx): two wheel tracks at z ±zt (each tw either side of its centre),
 *  every part lit by its own normal in the satin steel. Per track: tread-plate deck plates with joints (a dark seam, a lit lip, bolts), two
 *  bevels catching the key, steel sides with bolt rows and seams, the underside, and a box stringer under it (never below the floor); the
 *  guard rail along its outer edge (posts with foot plates, lofted tubes). The far track and rail paint in `back`; the near guard rail in
 *  `front` (it stands in front of the near wheels). `u` scales the small parts (bolts, tubes) with the scene. */
export type TrackSpec = {
  key: string; ln: Line; sFoot: number; sEnd: number; zt: number; tw: number; th: number; bv: number; sd: number;
  ds: number; plate: number; post: number; floorY: number; u: number; tread: string;
  near: { rh: number; tubes: number[] }; far: { rh: number; tubes: number[] }; railFrom: number;
};
export type DeckShadow = { sr: number; sf: number; k: number } | null;
/** how deep below the deck (along its normal, away from the car) a part may hang at s before it would reach the floor */
export const dropOf = (ln: Line, s: number, floorY: number) => { const p = lineAt(ln, s), c = Math.cos(p.a); return c > 0.05 ? (floorY - 1 - p.y) / c : 1e9; };
export const twinTrack = (r: Rig, T: TrackSpec, at: (v: V) => V, sh: DeckShadow): { back: Face[]; front: Face[] } => {
  const back: Face[] = [], front: Face[] = [];
  const { ln, u, bv } = T;
  const D = (s: number, h: number, z: number) => at(deckPt(ln, s, h, z));
  const nUp = (s: number): V => { const q = upOf(lineAt(ln, s).a); return [q[0], q[1], 0]; };
  const nTan = (s: number): V => { const a = lineAt(ln, s).a; return [Math.cos(a), Math.sin(a), 0]; };
  const thk = (s: number) => Math.max(0.35 * u, Math.min(T.th, dropOf(ln, s, T.floorY) + 0.85));
  const F = (k: string, c: V[], n: V, fill: string, o: Partial<Face> = {}) => quad(r, k, c, n, fill, { chrome: 0, fall: 0, skip: true, ...o });
  const segS: number[] = [];
  for (let s = T.sFoot; s < T.sEnd - 0.5; s += T.ds) segS.push(s);
  segS.push(T.sEnd);
  const isJoint = (s: number) => s > T.sFoot + 1 && Math.abs((s - T.sFoot) % T.plate) < 0.5;
  const bolt = (x: number, y: number, rr: number, key: string | number) => <g key={key}><circle cx={x} cy={y} r={rr} fill="#03204A" /><circle cx={x - rr * 0.24} cy={y - rr * 0.24} r={rr * 0.55} fill="#A9C7EC" /></g>;
  for (const side of [1, -1] as const) {
    const zc = side * T.zt, zo = zc + side * T.tw, zi = zc - side * T.tw, zLo = Math.min(zo, zi), zHi = Math.max(zo, zi);
    for (let i = 0; i < segS.length - 1; i++) {
      const s0 = segS[i], s1 = segS[i + 1], t0 = thk(s0), t1 = thk(s1), up = nUp((s0 + s1) / 2);
      const k = `${T.key}t${side}_${i}`;
      // ── the deck plate: its tread-plate top (dark satin steel with the raised lozenges laid on it), the car's soft shadow on it ──
      const top = F(`${k}t`, [D(s0, 0, zLo + bv), D(s1, 0, zLo + bv), D(s1, 0, zHi - bv), D(s0, 0, zHi - bv)], up, steel(r, up, 0.02, 0.3));
      if (top) {
        const tf = affineUV(P(r, D(s0, 0, zLo + bv)), P(r, D(s1, 0, zLo + bv)), P(r, D(s0, 0, zHi - bv)), s0, s1, zLo + bv, zHi - bv);
        let shade: React.ReactNode = null;
        if (sh && sh.k > 0.01) {
          const a = sh.sr - 70 * u, b = sh.sf + 70 * u;
          if (s1 > a && s0 < b) {
            const lo = Math.max(s0, a), hi = Math.min(s1, b), kk = clamp01(Math.min((lo + hi) / 2 - a, b - (lo + hi) / 2) / (60 * u));
            const q = [D(lo, 0.1, zLo + bv), D(hi, 0.1, zLo + bv), D(hi, 0.1, zHi - bv), D(lo, 0.1, zHi - bv)].map((v) => P(r, v));
            shade = <polygon points={q.map((v) => `${v.x.toFixed(1)},${v.y.toFixed(1)}`).join(" ")} fill="#000814" opacity={(0.42 * kk * sh.k).toFixed(3)} />;
          }
        }
        top.after = (
          <g data-probe-skip>
            <rect x={s0} y={zLo + bv} width={s1 - s0} height={zHi - zLo - 2 * bv} fill={`url(#${T.tread})`} transform={tf} />
            {isJoint(s0) && <g transform={tf}>
              <line x1={s0} y1={zLo + bv} x2={s0} y2={zHi - bv} stroke="#000C1E" strokeOpacity={0.75} strokeWidth={2.2 * u} />
              <line x1={s0 + 1.6 * u} y1={zLo + bv} x2={s0 + 1.6 * u} y2={zHi - bv} stroke="#B3CEEF" strokeOpacity={0.35} strokeWidth={0.9 * u} />
              {[0.22, 0.5, 0.78].map((q) => { const z = zLo + (zHi - zLo) * q; return <g key={q}>{bolt(s0 + 6 * u, z, 1.9 * u, "a")}{bolt(s0 - 6 * u, z, 1.9 * u, "b")}</g>; })}
            </g>}
            {shade}
          </g>
        );
        back.push(top);
      }
      // ── its two bevels (the catch-light along each edge), its steel sides (bolt rows, plate seams) ──
      for (const e of [1, -1] as const) {
        const ze = e > 0 ? zHi : zLo, zin = ze - e * bv, bn = nrm3([up[0], up[1], e * 1.1]);
        const bev = F(`${k}b${e}`, [D(s0, 0, zin), D(s1, 0, zin), D(s1, -bv, ze), D(s0, -bv, ze)], bn, steel(r, bn, 0.2));
        if (bev) back.push(bev);
        const sn: V = [0, 0, e];
        const sideF = F(`${k}s${e}`, [D(s0, -bv, ze), D(s1, -bv, ze), D(s1, -t1, ze), D(s0, -t0, ze)], sn, steel(r, sn, 0.04));
        if (sideF) {
          const bolts: React.ReactNode[] = [];
          if (t0 > 6 * u) for (const q of [0.3, 0.8]) { const s = s0 + (s1 - s0) * q, b = P(r, D(s, -(bv + (thk(s) - bv) * 0.5), ze + e * 0.4)); bolts.push(bolt(b.x, b.y, 1.9 * u, q)); }
          const ja = P(r, D(s0, -bv, ze + e * 0.4)), jb = P(r, D(s0, -t0, ze + e * 0.4));
          sideF.after = <g data-probe-skip>{bolts}{isJoint(s0) && <line x1={ja.x} y1={ja.y} x2={jb.x} y2={jb.y} stroke="#000C1E" strokeOpacity={0.6} strokeWidth={1.4 * u} />}</g>;
          back.push(sideF);
        }
      }
      const dn: V = [-up[0], -up[1], 0];
      const bot = F(`${k}u`, [D(s0, -t0, zLo), D(s0, -t0, zHi), D(s1, -t1, zHi), D(s1, -t1, zLo)], dn, steel(r, dn, 0, 0.3));
      if (bot) back.push(bot);
      // ── the box stringer under the plate (where there is room above the floor) ──
      const h0 = Math.min(T.sd, dropOf(ln, s0, T.floorY) - t0), h1 = Math.min(T.sd, dropOf(ln, s1, T.floorY) - t1);
      if (h0 > 2 * u && h1 > 2 * u) {
        const za = zc - 12 * u, zb = zc + 12 * u;
        for (const e of [1, -1] as const) {
          const ze = e > 0 ? zb : za, sn: V = [0, 0, e];
          const q = F(`${k}g${e}`, [D(s0, -t0, ze), D(s1, -t1, ze), D(s1, -t1 - h1, ze), D(s0, -t0 - h0, ze)], sn, steel(r, sn, 0, 0.15));
          if (q) back.push(q);
        }
        const gb = F(`${k}gu`, [D(s0, -t0 - h0, za), D(s0, -t0 - h0, zb), D(s1, -t1 - h1, zb), D(s1, -t1 - h1, za)], dn, steel(r, dn, 0, 0.3));
        if (gb) back.push(gb);
      }
    }
    // the deck's cut end (the steel end plate where the car leaves)
    {
      const tn = nTan(T.sEnd - 1), tE = thk(T.sEnd);
      const endF = F(`${T.key}end${side}`, [D(T.sEnd, 0, zLo), D(T.sEnd, 0, zHi), D(T.sEnd, -tE - T.sd, zHi), D(T.sEnd, -tE - T.sd, zLo)], tn, steel(r, tn, 0.12));
      if (endF) back.push(endF);
    }
    // ── the guard rail along the outer edge: posts with foot plates, lofted tubes ──
    const near = side > 0, spec = near ? T.near : T.far, zp = zo - side * 4 * u, out = near ? front : back;
    const sA = T.sFoot + T.railFrom, sB = T.sEnd - 8 * u, ph = 3.2 * u;
    for (let sp = sA; sp <= sB + 0.5; sp += T.post) {
      const s = Math.min(sp, sB);
      const c8: V[] = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => D(s + (i & 1 ? ph : -ph), i & 2 ? 0 : spec.rh, zp + (i & 4 ? ph : -ph)));
      out.push(...hexa(r, `${T.key}p${side}_${Math.round(s)}`, c8, (_n, n) => steel(r, n, 0.1), { chrome: 0, fall: 0, skip: true }));
      const f8: V[] = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => D(s + (i & 1 ? 7 * u : -7 * u), i & 2 ? 0 : 2.2 * u, zp + (i & 4 ? 6 * u : -6 * u)));
      out.push(...hexa(r, `${T.key}pf${side}_${Math.round(s)}`, f8, (_n, n) => steel(r, n, 0.14), { chrome: 0, fall: 0, skip: true }));
    }
    const step = Math.max(12, T.ds * 1.5);
    for (const hc of spec.tubes) {
      const TS = 2.6 * u;
      for (let s = sA - 4 * u; s < sB + 4 * u - 0.5; s += step) {
        const e = Math.min(sB + 4 * u, s + step), um = nUp((s + e) / 2);
        const face4: [string, V[], V][] = [
          ["t", [D(s, hc + TS, zp - TS), D(e, hc + TS, zp - TS), D(e, hc + TS, zp + TS), D(s, hc + TS, zp + TS)], [um[0], um[1], 0]],
          ["o", [D(s, hc - TS, zp + TS), D(e, hc - TS, zp + TS), D(e, hc + TS, zp + TS), D(s, hc + TS, zp + TS)], [0, 0, 1]],
          ["i", [D(s, hc - TS, zp - TS), D(e, hc - TS, zp - TS), D(e, hc + TS, zp - TS), D(s, hc + TS, zp - TS)], [0, 0, -1]],
          ["u", [D(s, hc - TS, zp - TS), D(e, hc - TS, zp - TS), D(e, hc - TS, zp + TS), D(s, hc - TS, zp + TS)], [-um[0], -um[1], 0]],
        ];
        for (const [nm, cs, n] of face4) { const q = F(`${T.key}r${side}_${hc}_${Math.round(s)}${nm}`, cs, n, steel(r, n, nm === "t" ? 0.22 : 0.06)); if (q) out.push(q); }
      }
    }
  }
  return { back, front };
};

// ══════════════════════════════════════════════════════════════════════════════════════════════
// THE KICKER'S FACES
// ══════════════════════════════════════════════════════════════════════════════════════════════
const KTRACK: TrackSpec = { key: "hk", ln: KICK, sFoot: S_FOOT, sEnd: S_END, zt: ZT, tw: TW, th: TH, bv: BV, sd: SD, ds: 28, plate: 140, post: 168, floorY: 0, u: 1,
  tread: "hkTread", near: { rh: 15, tubes: [12.5] }, far: { rh: 44, tubes: [22, 41] }, railFrom: 170 };
/** how deep below the deck a part may hang at s before it would reach the pad */
const dropAt = (s: number) => dropOf(KICK, s, 0);

type Kick = { back: Face[]; front: Face[]; floor: Face[] };
const kickerFaces = (r: Rig, at: (v: V) => V, car: HookCar, shadowK: number): Kick => {
  const floor: Face[] = [];
  const D = (s: number, h: number, z: number) => at(deckPt(KICK, s, h, z));
  const onDeck = car.phase === 0 && car.sr !== undefined;
  const { back, front } = twinTrack(r, KTRACK, at, onDeck ? { sr: car.sr!, sf: car.sf!, k: shadowK } : null);
  // ── the cross-members tying the two tracks (under the decks: the car's floor and diffuser pass over them) ──
  for (let s = S_FOOT + 240; s < S_END - 20; s += 200) {
    if (dropAt(s) < TH + 22) continue;
    const c8: V[] = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => D(s + (i & 1 ? 7 : -7), i & 2 ? -(TH + 18) : -(TH + 2), i & 4 ? ZT - 12 : -(ZT - 12)));
    back.push(...hexa(r, `hkx${Math.round(s)}`, c8, (_n, n) => steel(r, n, 0.02, 0.1), { chrome: 0, fall: 0, skip: true }));
  }
  // ── the trestles: at each station a pair of legs (one under each track's stringer) from the stringer to its base plate on the pad, a tie
  // and an X-brace between them, and a diagonal brace along each track to the next station ──
  const stations: number[] = [];
  for (let s = S_FOOT + 330; s < S_END - 60; s += 250) if (dropAt(s) > TH + SD + 50) stations.push(s);
  stations.push(S_END - 14);
  const legTop = (s: number, zc: number): V => deckPt(KICK, s, -(thk(s) + SD), zc);
  stations.forEach((s, j) => {
    for (const zc of [-ZT, ZT]) {
      const tp = legTop(s, zc), x = tp[0], y0 = tp[1] + 2, w = 9;
      back.push(...beamFaces(r, `hkl${j}${zc}`, at([x, y0, zc]), at([x, -6, zc]), w, 0.06));
      // its base plate on the pad (the plates are the kicker's measured shapes: the sweep counts the hand-overs by them), four anchor bolts
      const [bx, by] = at([x, 0, 0]);
      const plate = steelBox(r, `hklb${j}${zc}`, bx - 26, bx + 26, by - 6, by, zc - 26, zc + 26, 0.15, 0.4).map((q) => ({ ...q, chrome: 0, fall: 0 }));
      const pt = plate.find((q) => q.k === `hklb${j}${zc}t`);
      if (pt) {
        const bolts = [[-17, -17], [17, -17], [-17, 17], [17, 17]].map(([dx, dz], i) => { const b = P(r, [bx + dx, by - 6.2, zc + dz]); return <g key={i}><circle cx={b.x} cy={b.y} r={2.4} fill="#03204A" /><circle cx={b.x - 0.5} cy={b.y - 0.5} r={1.3} fill="#B3CEEF" /></g>; });
        pt.after = <g data-probe-skip>{pt.after}{bolts}</g>;
      }
      back.push(...plate);
      floor.push(...contactShadow(r, `hkls${j}${zc}`, bx - 26, bx + 26, zc - 26, zc + 26, by, 0.7));
    }
    const tA = legTop(s, -ZT), x = tA[0], yTop = tA[1] + 14, yLow = -40;
    if (yLow - yTop > 30) {
      back.push(...beamFaces(r, `hkxa${j}`, at([x, yTop, -ZT + 8]), at([x, yLow, ZT - 8]), 3.6, 0));
      back.push(...beamFaces(r, `hkxb${j}`, at([x, yTop, ZT - 8]), at([x, yLow, -ZT + 8]), 3.6, 0));
    }
    back.push(...beamFaces(r, `hkxt${j}`, at([x, -34, -ZT + 8]), at([x, -34, ZT - 8]), 5, 0.04));
    if (j < stations.length - 1) {
      const nx = legTop(stations[j + 1], ZT)[0];
      for (const zc of [-ZT, ZT]) back.push(...beamFaces(r, `hkxl${j}${zc}`, at([x + 6, yTop + 6, zc]), at([nx - 6, -30, zc]), 3.4, 0));
    }
  });
  // the whole kicker's soft footprint on the pad
  const o0 = at([0, 0, 0]);
  floor.push(...contactShadow(r, "hkfoot", lineAt(KICK, S_FOOT).x + o0[0], LIP_X + o0[0], -ZT - TW, ZT + TW, o0[1], 0.9, 40));
  return { back, front, floor };
};

/** ★ the hook's own zoom (Timur, 2026-10-30: "the camera should be more closely zoomed in on it, on the car"): CLOSE on the car up the ramp
 *  (Z_RAMP), still close in the air (Z_AIR: the whole car, rolling, with comfortable margin — measured on the car's projected corners at
 *  every frame), a touch wider as it lands and rolls out (Z_LAND), then IN on the Roadster as the line-up drives off (Z_HERO) */
const Z_RAMP = 1.42, Z_AIR = 1.17, Z_LAND = 1.06, Z_HERO = 1.5;
export const hookZoom = (f: number, c?: HookCues) => {
  const z = Z_RAMP + (Z_AIR - Z_RAMP) * rInOut(f, 24, 70) + (Z_LAND - Z_AIR) * rInOut(f, LAND - 4, LAND + 40);
  return c ? z + (Z_HERO - z) * heroK(f, c) : z;
};
/** the camera at frame f (the session's checks project the car through it): the target, the zoom, the rig */
export const hookCam = (f: number, c: HookCues) => { const [cx, cy] = target(f, c); return { cx, cy, zoom: hookZoom(f, c), rig: { cx: 540, cy: 1010, persp: 2300, yaw: -14 + 3 * rInOut(f, 0, 240), pitch: -13 } as Rig }; };

export const Hook: React.FC<{ c: HookCues; end: number }> = ({ c, end }) => {
  const f = useCurrentFrame();
  const T = hookTimes(c);
  const [cx, cy] = target(f, c);
  const ox = 540 - cx, oy = 1010 - cy;
  // ★ the hook's own zoom (hookZoom): close on the car up the ramp, close in the air, a touch wider on the pad, then IN on the Roadster as
  // the line-up drives off (Timur, 2026-10-29 and 2026-10-30)
  const zoom = hookZoom(f, c);
  // the floor's light dims as the slide out carries it away (`end`: the slide's last frame), so nothing lit is cut when the place unmounts
  const floorOn = 1 - rInOut(f, end - 44, end - 6);
  const at = (v: V): V => [v[0] + ox, v[1] + oy, v[2]];
  const car = hookCar(f, c);
  const r: Rig = { cx: 540, cy: 1010, persp: 2300, yaw: -14 + 3 * rInOut(f, 0, 240), pitch: -13 };
  const list: Face[] = [];

  // ── the line-up: parked, then driving off by itself (the Cybercab first) ──
  const fading: { k: string; d: number; op: number; fog: number; sh: Face[]; fs: Face[] }[] = [];
  const LU = hookLineup(f, c);
  ROW.forEach((cr, i) => {
    // ★ a steady pull-away to a cruise, INTO FOG (hookLineup): it loses contrast and takes the fog's colour with distance, and is removed
    // only once it is wholly fog-coloured
    const { d, rate: lrate, fog, op } = LU[i];
    if (op <= 0.004) return;
    const yaw = ROW_YAW, a = (yaw * Math.PI) / 180, dirx = Math.cos(a), dirz = -Math.sin(a);
    const x = cr.x + dirx * d, z = cr.z + dirz * d;
    // (a car in the fog is drawn SOLID, its fog laid over it as ONE silhouette and the whole faded as ONE group: per-face opacity let its far
    // side show through its near side, a see-through ghost. It is always behind everything else in the frame — the Roadster is at rest on
    // the pad, and every car still parked or slower is nearer)
    const p: Pose = { x: x + ox, y: oy, z, yaw, spin: d / LU_WR, spinBlur: spinBlurFor(lrate) };
    const sh = carShadow(r, cr.model, p, oy, `lu${i}`), body = carFaces(r, cr.model, p, `lu${i}`);
    if (fog > 0.001 || op < 1) { fading.push({ k: `lu${i}`, d, op, fog, sh, fs: body }); return; }
    const fs = [...sh, ...body];
    list.push(...fs);
    // ★ the Roadster's shadow sweeping across this car's roof as it passes over (a soft dark patch on the roof, strongest when the
    // Roadster is right above it)
    const over = clamp01(1 - Math.abs(car.x - x) / 260) * (car.phase === 1 ? 1 : 0) * op;
    if (over > 0.02) {
      const ry = ROOF[cr.model] * 0.98, s = contactShadow(r, `rs${i}`, car.x - 170 + ox, car.x + 170 + ox, car.z - 80, car.z + 80, ry + oy, 1.2 * over, 0);
      const zTop = depthOf(r, at([x, ry, z])) + 40;
      s.forEach((q) => list.push({ ...q, z: zTop + q.z * 1e-9 }));
    }
  });

  // ── the Roadster ──
  const breath = f / 16;
  const jets = clamp01(rInOut(f, JETS[0], JETS[0] + 8) - rInOut(f, JETS[1], JETS[1] + 10));
  // the suspension: drooping in the air, compressing on touchdown and settling (hookSquat; the compression is capped by MEASUREMENT: the
  // model's lowest sprung parts, the motor housings, sit 4.5 px off the ground and sink with the squat)
  const squat = hookSquat(f);
  const pose: Pose = { x: car.x + ox, y: car.y + oy, z: car.z, roll: car.roll, pitch: car.pitch, yaw: car.yaw ?? 0, scale: 1, spin: spinAt(f, c), spinBlur: blurOf(car.rate),
    jets, breath, squat, dive: car.dive ?? 0 };
  const carFs = roadsterFaces(r, pose);
  list.push(...carFs);

  // ── the kicker ──
  const hAbove = car.phase === 0 ? 0 : 999;
  const K = kickerFaces(r, at, car, hAbove < 1 ? 1 : 0);

  // ── the floor's grid (the test pad's markings), the pool of light under the action ──
  const grid: React.ReactNode[] = [];
  const poolC = [cx, 0, 0] as V;
  const STEP = 340;
  const gx0 = Math.floor((cx - 2400) / STEP) * STEP;
  for (let k = 0; k < 15; k++) {
    const gx = gx0 + k * STEP;
    for (let j = 0; j < 8; j++) {
      const z0 = -1800 + j * 300, z1 = z0 + 300, zm = (z0 + z1) / 2;
      const dist = Math.hypot(gx - poolC[0], zm * 1.4) / 1500, o = 0.16 * clamp01(1 - dist);
      if (o < 0.01) continue;
      const a = P(r, at([gx, 0, z0])), b = P(r, at([gx, 0, z1]));
      grid.push(<line key={`gx${k}_${j}`} data-probe-skip x1={a.x.toFixed(1)} y1={a.y.toFixed(1)} x2={b.x.toFixed(1)} y2={b.y.toFixed(1)} stroke="#8DB6E6" strokeOpacity={o.toFixed(3)} strokeWidth={1.4} />);
    }
  }
  for (let j = 0; j < 9; j++) {
    const gz = -1800 + j * 300;
    for (let k = 0; k < 14; k++) {
      const x0 = gx0 + k * STEP, x1 = x0 + STEP, xm = (x0 + x1) / 2;
      const dist = Math.hypot(xm - poolC[0], gz * 1.4) / 1500, o = 0.16 * clamp01(1 - dist);
      if (o < 0.01) continue;
      const a = P(r, at([x0, 0, gz])), b = P(r, at([x1, 0, gz]));
      grid.push(<line key={`gz${j}_${k}`} data-probe-skip x1={a.x.toFixed(1)} y1={a.y.toFixed(1)} x2={b.x.toFixed(1)} y2={b.y.toFixed(1)} stroke="#8DB6E6" strokeOpacity={o.toFixed(3)} strokeWidth={1.4} />);
    }
  }
  // the pool: concentric soft discs on the floor under the camera's target (the overhead spotlight)
  const pool: React.ReactNode[] = [];
  for (let k = 0; k < 9; k++) {
    const R = 260 + k * 130, ring: string[] = [];
    for (let j = 0; j < 40; j++) { const a2 = (j / 40) * Math.PI * 2, q = P(r, at([cx + R * Math.cos(a2), 0, R * 0.8 * Math.sin(a2)])); ring.push(`${q.x.toFixed(1)},${q.y.toFixed(1)}`); }
    pool.push(<polygon key={`pl${k}`} data-probe-skip points={ring.join(" ")} fill="#4D8ED9" opacity={0.035} />);
  }
  const shadow = roadsterShadow(r, { ...pose, y: car.y + oy }, oy);

  // ★ the payoff's label: under the Roadster, on the floor's side of it (Musk's words), landing on "last" (it stays on the floor where the
  // car came to rest: the car pulls away from it, and the slide carries it out)
  const lq = rOut(f, ...T.label), lc = hookCar(Math.min(f, c.driven + 40), c), lp0 = P(r, at([lc.x, 60, lc.z + 120])), lp = { x: 540 + (lp0.x - 540) * zoom, y: 1010 + (lp0.y - 1010) * zoom };
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg key={f} width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <RoadsterDefs />
        <TreadDefs id="hkTread" />
        {fading.length > 0 && <FogDefs zoom={zoom} />}
        <g transform={`translate(540 1010) scale(${zoom.toFixed(4)}) translate(-540 -1010)`}>
          {/* ★ the floor's light (its pool, its grid, its floor faces) dims away while the slide carries it out (Timur, 2026-10-29: "at around
              10 seconds, the light in the background just abruptly disappears") — it is wider than the frame, so it was still lit at the left
              edge when the place unmounted (f310) */}
          <g opacity={floorOn.toFixed(3)}>
          {pool}
          {grid}
          <Faces list={K.floor} />
          </g>
          <Faces list={shadow} />
          {/* the kicker paints first (it is always behind or under the car, and left of the row); the cars sort among themselves; the near
              guard rail paints last (it stands in front of the near wheels) */}
          <Faces list={K.back} />
          {/* the cars in the fog, farthest first: each one's shadow thins with the fog; its body is laid over by its own silhouette in the
              fog's colour (opacity = how deep in the fog it is), so it loses contrast and takes the ground's colour as one shape — never a
              CSS filter on a moving thing; the whole group fades only once it is all fog */}
          {[...fading].sort((a, b) => b.d - a.d).map((fc) => (
            <g key={fc.k} opacity={fc.op < 1 ? fc.op.toFixed(3) : undefined}>
              {fc.fog < 0.999 && <g opacity={(1 - fc.fog).toFixed(3)}><Faces list={fc.sh} /></g>}
              <Faces list={fc.fs} />
              <g data-probe-skip opacity={fc.fog.toFixed(3)}>
                {fc.fs.filter((q) => q.p.length > 2 && q.fill !== "none").map((q) => <polygon key={q.k} points={pts(q.p)} fill="url(#hkFog)" stroke="url(#hkFog)" strokeWidth={1.6} strokeLinejoin="round" />)}
              </g>
            </g>
          ))}
          <Faces list={list} />
          <Faces list={K.front} />
          <RoadsterJets r={r} p={pose} />
        </g>
      </svg>
      {lq > 0.001 && (
        <div style={{ position: "absolute", left: Math.max(320, Math.min(lp.x, 760)) /* its ~460-px line keeps the 60-px side margins under the closer camera */, top: lp.y, transform: `translate(-50%, ${(-10 * (1 - lq)).toFixed(2)}px)`, opacity: lq, ...label(30, "#B3CEEF"), letterSpacing: 4, whiteSpace: "nowrap" }}>
          BEST OF THE LAST HUMAN-DRIVEN
        </div>
      )}
    </div>
  );
};
