import React from "react";
import { useCurrentFrame } from "remotion";
import { rInOut, rOut, clamp01, alpha } from "../anim";
import { Faces, P, hexa, steelBox, contactShadow, swing, type Face, type V } from "../p3";
import { type Rig } from "../rig";
import { roadsterFaces, roadsterShadow, RoadsterDefs, RoadsterJets, dirWorld, RD, type Pose } from "../roadster";
import { CUE } from "../captions";
import { lineOf, lineAt, upOf, deckPt, rideOn, twinTrack, dropOf, steel, beamFaces, TreadDefs, blurOf, G1, SQUAT, type TrackSpec, type Line } from "./hook";

// ══════════════════════════════════════════════════════════════════════════════════════════════
// whatB — "It climbed an upside-down ramp, flipped in mid-air, and landed on its wheels."
// A NEW ANGLE ON THE STUNT (the brief: "the ramp seen side-on as a clean profile, the car's path traced as a lit arc that draws as the car
// travels it"): the Roadster small and side-on (its own rig at yaw ≈ 0, pitch 0 — a clean profile, a slow ±3° arc on it) on the test pad.
// THE RAMP (revision 1, 2026-10-29: "the car should be a little bit more detailed and the ramp as well … make sure you have the physics
// right, the timing"): a twin-track steel curl in the Bankers satin steel — two wheel tracks (tread-plate deck plates with joints, bevels,
// bolted steel sides, box stringers, a low guide rail on the near edge and a guard rail on the far one) rising from feather-edged lips on
// the pad through a clothoid into a half loop that ends 140° round, upside down; posts with base plates and ties under its lower half, a
// braced steel frame BEHIND the curl holding its upper half (nothing crosses the car's path).
// ★ THE PHYSICS (measured — the session notes): the car's wheel centres ride the tracks' offset line (tyre gap 0 at every frame); it coasts
// round the curl under real gravity at its scale (energy kept: it slows as it climbs, and is still fast enough at the top to stay pressed to
// the deck — the grip margin is reported); it leaves the deck's end upside down, its centre of mass on a true parabola; its thrusters level
// it and roll it 180° about its length; it lands level on all four wheels with a squat, and brakes to rest on "wheels". The loop's radius
// is the smallest at which the car's overhangs clear the tracks (a tighter curl drove its tail into the deck). Wheels turn with distance.
// THE LINE is its path: a soft lit trace that DRAWS behind the car. A floor that fades into the ground, the soft reflection, the shadows.
// Sync: "climbed" → up the curl; "upside-down" → over the top; "ramp" → it leaves the deck; "flipped" → the roll; "landed" → touchdown;
// "wheels" → at rest. KIND line (the path).
// ══════════════════════════════════════════════════════════════════════════════════════════════

export const KIND = "line";

/** ★ (2026-10-30) the ride runs this many frames after its words: the carried hand-over needs the run-up on screen before the climb (the car
 *  reaches the curl's foot on "It climbed" instead of before it; it lands ~0.4 s after "landed") */
export const RIDE_DELAY = 13;
type CueC = { arrive: number; climbed: number; upside: number; ramp: number; flipped: number; midair: number; landed: number; wheels: number; end: number };
/** the cues the ride reads, shifted by RIDE_DELAY */
type C = CueC;
const ride = (c: CueC): C => ({ ...c, flipped: c.flipped + RIDE_DELAY, landed: c.landed + RIDE_DELAY, wheels: c.wheels + RIDE_DELAY });

/** ── THE GEOMETRY (the place's own 1080×1920 frame; object space x right, y DOWN, z toward the viewer) ── */
const S = 0.36;                          // the car's scale (430 px → 155 px)
const G = G1 * S;                        // real gravity at this scale (px/f²)
const HC = 52 * S;                       // the car's centre of mass above its tyres' contact
const F = 1236;                          // the pad
const RL = 920 * S;                      // the curl's radius (the deck's driving face): the tightest the car's overhangs clear
const LCP = 200;                         // the clothoid easing the pad into the curl
const PHI_E = (128 * Math.PI) / 180;     // the deck ends 128° round: climbing back over, upside down
// ★ (Timur, 2026-10-30: the hand-over INTO this scene is CARRIED — the car enters from the left speeding up toward a ramp not yet in view,
// the camera travelling with it close, then zooming out as the ramp appears): a long run-up on the pad, the car speeding up along it
const RUN = 1800;                        // the pad before the curl (the line runs on it)
const ZT = 98 * S, TW = 20 * S;           // the tracks: z 78…118 (the tyres run at 79…105; the nose splitter reaches z 77)
/** the curl's driving line, its foot at x = 0 (shifted to centre the figure below) */
const LINE0 = lineOf(-RUN, F, 0, [{ len: RUN, k0: 0, k1: 0 }, { len: LCP, k0: 0, k1: 1 / RL }, { len: RL * PHI_E - LCP / 2, k0: 1 / RL, k1: 1 / RL }]);
const S_FOOT = RUN, S_END = LINE0.L;
const WB = (RD.wheelX[1] - RD.wheelX[0]) * S;

// ── the release and the flight (frame-free: τ, the flight time, is a constant of the geometry) ──
const REL0 = rideOn(LINE0, S_END + WB, S);
const UP0 = upOf(REL0.a);
/** the car's centre of mass at the release, its speed: 12% over what it needs to stay pressed to the deck at the curl's end */
const C00: [number, number] = [REL0.x + UP0[0] * HC, REL0.y + UP0[1] * HC];
const GRIP_V = Math.sqrt(G * (RL - HC) * Math.max(0, -Math.cos(PHI_E)));
const VE = 1.12 * GRIP_V;
const VX = VE * Math.cos(REL0.a), VY0 = VE * Math.sin(REL0.a);
/** the flight time: the parabola from the release down to the centre of mass's height on its wheels (HC above the pad) */
const TAU = (() => { const dy = F - HC - C00[1]; return (-VY0 + Math.sqrt(VY0 * VY0 + 2 * G * dy)) / G; })();
/** ── the layout: the whole figure (the frame behind the curl … the car's nose at rest) centred on x 540, for the wired take ── */
const LAND0 = C00[0] + VX * TAU;
const BRAKE_T = CUE.wheels + 1 - (CUE.landed - 1);
const REST0 = LAND0 + (VX * BRAKE_T) / 2;
const X0 = Math.round(540 - ((REST0 - 215 * S - 6) + (RL + 30)) / 2);
const LINE: Line = lineOf(X0 - RUN, F, 0, [{ len: RUN, k0: 0, k1: 0 }, { len: LCP, k0: 0, k1: 1 / RL }, { len: RL * PHI_E - LCP / 2, k0: 1 / RL, k1: 1 / RL }]);
const REL = rideOn(LINE, S_END + WB, S);
const C0: [number, number] = [REL.x + UP0[0] * HC, REL.y + UP0[1] * HC];
const LAND_X = C0[0] + VX * TAU;

/** the speed of the car along the deck at arc position s (its front tyre's): energy kept from the release down (it is faster low on the
 *  curl, slowing as it climbs), and on the pad a steady pull (it accelerates into the curl) */
const A_PAD = 0.05;   // (the run-up: a steady, building pace — ~17 px/f 1,400 px before the foot, the curl's ~21 at its foot: "it sort of speeds up")
const vAtS = (s: number) => {
  const h = (q: number) => F - lineAt(LINE, q).y;
  const sRef = Math.min(s, S_END) - WB / 2;
  const vCurl = Math.sqrt(VE * VE + 2 * G * Math.max(0, h(S_END - WB / 2) - h(Math.max(S_FOOT, sRef))));
  return s >= S_FOOT ? vCurl : Math.sqrt(Math.max(1, vCurl * vCurl - 2 * A_PAD * (S_FOOT - s)));
};
/** time before the release at which the front tyre is at s (a table) */
const S_MIN = S_FOOT - 1500;
const TT = (() => { const n = Math.ceil(S_END + WB - S_MIN) + 1, t = new Float64Array(n); t[n - 1] = 0; for (let i = n - 2; i >= 0; i--) { const s = S_MIN + i; t[i] = t[i + 1] + 1 / ((vAtS(s) + vAtS(s + 1)) / 2); } return t; })();
const sfAtBefore = (dt: number) => {   // the front tyre's arc position dt frames before the release
  let lo = 0, hi = TT.length - 1;
  if (dt >= TT[0]) return S_MIN;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (TT[m] > dt) lo = m; else hi = m; }
  const u = (TT[lo] - dt) / (TT[lo] - TT[hi]);
  return S_MIN + lo + u;
};

/** the construction's centre (the camera aims here) and the points of its phrase: `a` the curl's TOP, where the car leaves the deck upside
 *  down (the camera's IN), `b` the landing (the MOVE follows the car down to it); `foot`: the curl's foot. For a camera that follows the
 *  car itself, `profileCar(c, f)` below gives the car's centre in this frame. */
export const PROFILE = {
  x: 540, y: 1000,
  a: { x: Math.round(C0[0]), y: Math.round(C0[1] + 20) },
  b: { x: Math.round(LAND_X), y: Math.round(F - 40) },
  foot: { x: X0, y: Math.round(F - HC) },
} as const;

/** ── THE TIMING ── */
const motion = (c: C) => {
  const tl = c.landed - 1, te = tl - TAU, ts = c.wheels + 1, t0 = c.arrive;
  const brake = -VX / Math.max(1, ts - tl);       // the deceleration that stops it on "wheels"
  return { t0, te, tl, ts, brake };
};
type M = ReturnType<typeof motion>;
type Car = { x: number; y: number; ox: number; oy: number; pitch: number; roll: number; rate: number; phase: 0 | 1 | 2; sr?: number; sf?: number };
/** ★ the car at frame t: its centre (x, y) and its origin (ox, oy), its attitude, its wheels' turn per frame */
const carAt = (m: M, c: C, t: number): Car => {
  if (t <= m.te) {
    const sf = sfAtBefore(m.te - t), rd = rideOn(LINE, sf, S), u = upOf(rd.a);
    return { x: rd.x + u[0] * HC, y: rd.y + u[1] * HC, ox: rd.x, oy: rd.y, pitch: rd.pitch, roll: 0, rate: vAtS(sf) / (RD.wheelR * S), phase: 0, sr: rd.sr, sf: rd.sf };
  }
  if (t <= m.tl) {
    const u = t - m.te, x = C0[0] + VX * u, y = C0[1] + VY0 * u + (G * u * u) / 2;
    // ★ the half-roll in mid-air (about its length), centred on "flipped"; its nose levels from 140° to 180° (heading back, level) to land
    const roll = -180 * rInOut(t, c.flipped - 13, c.flipped + 15);
    const pitch = REL.pitch + (180 - REL.pitch) * rInOut(t, m.te + 2, m.tl - 6);
    const d = dirWorld({ x: 0, y: 0, z: 0, roll, pitch, scale: 1 }, [0, -HC, 0]);
    // (the wheels run on, free, slowly losing speed in the air)
    return { x, y, ox: x - d[0], oy: y - d[1], pitch, roll, rate: (VE / (RD.wheelR * S)) * (1 - 0.12 * (u / TAU)), phase: 1 };
  }
  // the roll-out: braking to rest on the pad, stopping on "wheels"
  const D = m.ts - m.tl, u = Math.min(D, t - m.tl), dx = VX * u + (m.brake * u * u) / 2;
  const v = Math.abs(VX + m.brake * u), air = (VE / (RD.wheelR * S)) * 0.88, w = rOut(t, m.tl, m.tl + 4);
  return { x: LAND_X + dx, y: F - HC, ox: LAND_X + dx, oy: F, pitch: 180, roll: -180, rate: air + (v / (RD.wheelR * S) - air) * w, phase: 2 };
};
/** the wheels' total turn (rad) at frame f: the integral of the rate from the place's arrival */
const spinAt = (m: M, c: C, f: number) => {
  let s = 0;
  for (let t = m.t0 - 30; t < f; t += 0.5) { const t1 = Math.min(f, t + 0.5); s += ((carAt(m, c, t).rate + carAt(m, c, t1).rate) / 2) * (t1 - t); }
  return s;
};

/** the car's centre at frame f, in the place's own frame (before the rig's slow arc) — for a camera that follows it */
export const profileCar = (c0: C, f: number) => { const c = ride(c0), q = carAt(motion(c), c, f); return { x: q.x, y: q.y }; };
/** the stunt's numbers (the session's checks read them) */
export const PROFILE_RIDE = { LINE, S_FOOT, S_END, ZT, TW, S, G, HC, RL, VE, VX, VY0, TAU, GRIP_V, C0, LAND_X, X0, F, carAt: (c: C, t: number) => carAt(motion(ride(c)), ride(c), t), motion: (c: C) => motion(ride(c)) };

/** every animation window (the SFX score reads these); `done`: the frame the place's LAST action ends */
export const profileTimes = (c0: C) => {
  const c = ride(c0);
  const m = motion(c), te = Math.round(m.te);
  return {
    /** the car runs up the curl (the climb) and round its inverted top */
    climb: [c.arrive, te] as [number, number],
    /** it leaves the deck's end (a whoosh as it flies) */
    launch: [te - 4, te + 10] as [number, number],
    /** the half-roll in the air */
    roll: [c.flipped - 13, c.flipped + 15] as [number, number],
    /** touchdown (a soft landing thump), the squat and its recovery */
    touchdown: [c.landed - 2, c.landed + 14] as [number, number],
    /** the roll-out to rest */
    rollout: [c.landed, m.ts] as [number, number],
    /** the lit path draws the whole time the car moves */
    trace: [c.arrive, m.ts] as [number, number],
    done: m.ts,
  };
};

// ── THE CURL'S TRACKS AND STRUCTURE ──
const TRACK: TrackSpec = { key: "pf", ln: LINE, sFoot: S_FOOT, sEnd: S_END, zt: ZT, tw: TW, th: 6.5, bv: 1.1, sd: 9, ds: 9, plate: 54, post: 46,
  floorY: F, u: 0.5, tread: "pfTread", near: { rh: 5, tubes: [4] }, far: { rh: 17, tubes: [8, 15.5] }, railFrom: 30 };
/** a point on the curl's OUTER side (away from the car) at angle φ round it: `out` px beyond the deck's driving face */
const curlS = (phi: number) => S_FOOT + LCP / 2 + RL * phi;   // (≈ the arc position at angle φ, past the clothoid)
const structure = (r: Rig): { back: Face[]; plates: Face[] } => {
  const back: Face[] = [], plates: Face[] = [];
  const under = (s: number, z: number, extra = 0): V => deckPt(LINE, s, -(TRACK.th + TRACK.sd + extra), z);
  const plate = (k: string, x: number, z: number, w = 12) => {
    const fs = steelBox(r, k, x - w, x + w, F - 2.6, F, z - w, z + w, 0.2, 0.5).map((q) => ({ ...q, chrome: 0, fall: 0 }));
    const top = fs.find((q) => q.k === `${k}t`);
    if (top) top.after = <g data-probe-skip>{top.after}{[[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]].map(([a, b], i) => { const q = P(r, [x + a * w, F - 2.7, z + b * w]); return <circle key={i} cx={q.x} cy={q.y} r={0.9} fill="#03204A" />; })}</g>;
    plates.push(...fs);   // (the base plates are measured: the sweep counts the hand-overs by them)
  };
  // ── the posts under the lower half of the curl: a pair at each station (under each track's stringer) down to its base plate, a tie and a
  // knee brace between them ──
  for (const [j, deg] of [26, 45, 63, 80].entries()) {
    const s = curlS((deg * Math.PI) / 180);
    if (dropOf(LINE, s, F) < 30) continue;
    for (const z of [-ZT, ZT]) {
      const top = under(s, z), x = top[0];
      back.push(...beamFaces(r, `pfp${j}${z}`, [x, top[1] + 1, z], [x, F - 2.6, z], 3.2, 0.06));
      plate(`pfpb${j}${z > 0 ? "n" : "f"}`, x, z);
    }
    const top = under(s, 0), x = top[0];
    back.push(...beamFaces(r, `pfpt${j}`, [x, F - 14, -ZT], [x, F - 14, ZT], 1.8, 0.04));
    if (F - 18 - top[1] > 26) {
      back.push(...beamFaces(r, `pfpx${j}a`, [x, top[1] + 6, -ZT + 2], [x, F - 18, ZT - 2], 1.3, 0));
      back.push(...beamFaces(r, `pfpx${j}b`, [x, top[1] + 6, ZT - 2], [x, F - 18, -ZT + 2], 1.3, 0));
    }
  }
  // ── the frame BEHIND the curl (z < −ZT − TW): four posts standing back on their plates, each with an arm reaching to the far track's
  // stringer, X-braced between them, a sill along the pad, gusset plates at the arms (nothing crosses the car's path, which runs between
  // the tracks) ──
  const ZB = -(ZT + TW + 16);
  const tops: V[] = [];
  for (const [j, k] of [0.7, 0.8, 0.9, 0.98].entries()) {
    const s = curlS(PHI_E * k), a = under(s, -ZT, 3), x = a[0];
    back.push(...steelBox(r, `pfbp${j}`, x - 3.4, x + 3.4, a[1] - 4, F - 2.6, ZB - 3.4, ZB + 3.4, 0.08, 0.4).map((q) => ({ ...q, chrome: 0, fall: 0, skip: true })));
    plate(`pfbb${j}`, x, ZB, 10);
    back.push(...beamFaces(r, `pfba${j}`, [x, a[1], ZB + 3.4], [a[0], a[1], -ZT - 2], 2.4, 0.12));
    // the gusset: a small steel plate where the arm meets the post
    back.push(...hexa(r, `pfbg${j}`, [[x - 7, a[1] + 1, ZB - 0.6], [x + 7, a[1] + 1, ZB - 0.6], [x - 7, a[1] + 12, ZB - 0.6], [x + 7, a[1] + 12, ZB - 0.6], [x - 7, a[1] + 1, ZB + 0.6], [x + 7, a[1] + 1, ZB + 0.6], [x - 7, a[1] + 12, ZB + 0.6], [x + 7, a[1] + 12, ZB + 0.6]] as V[],
      (_n, n) => steel(r, n, 0.1), { chrome: 0, fall: 0, skip: true }));
    tops.push([x, a[1], ZB]);
  }
  for (let j = 0; j < tops.length - 1; j++) {
    const A = tops[j], B = tops[j + 1];
    back.push(...beamFaces(r, `pfx${j}a`, [A[0], A[1] + 10, ZB - 1.5], [B[0], F - 20, ZB - 1.5], 1.4, 0));
    back.push(...beamFaces(r, `pfx${j}b`, [B[0], B[1] + 10, ZB - 1.5], [A[0], F - 20, ZB - 1.5], 1.4, 0));
    back.push(...beamFaces(r, `pfxh${j}`, [A[0], (A[1] + F) / 2, ZB - 1.5], [B[0], (B[1] + F) / 2, ZB - 1.5], 1.4, 0.02));
  }
  back.push(...steelBox(r, "pfsill", Math.min(...tops.map((t) => t[0])) - 14, Math.max(...tops.map((t) => t[0])) + 14, F - 5, F - 2.6, ZB - 4, ZB + 4, 0.1, 0.4).map((q) => ({ ...q, chrome: 0, fall: 0, skip: true })));
  // the cross-members between the two tracks, under their decks (seen at the curl's ends and through the gap)
  for (let s = S_FOOT + 90; s < S_END - 10; s += 54) {
    if (dropOf(LINE, s, F) < 16) continue;
    const c8: V[] = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => deckPt(LINE, s + (i & 1 ? 2.5 : -2.5), i & 2 ? -(TRACK.th + 7) : -(TRACK.th + 1), i & 4 ? ZT - 4 : -(ZT - 4)));
    back.push(...hexa(r, `pfcm${Math.round(s)}`, c8, (_n, n) => steel(r, n, 0, 0.1), { chrome: 0, fall: 0, skip: true }));
  }
  return { back, plates };
};

export const Profile: React.FC<C> = (c0) => {
  const c = ride(c0);
  const f = useCurrentFrame();
  const m = motion(c);
  const r: Rig = { cx: 540, cy: 1000, persp: 2600, yaw: swing(f, c.arrive, c.arrive + 150, -3, 3, 0.3), pitch: 0 };

  // ── the car ──
  const car = carAt(m, c, f);
  // the squat on touchdown (capped by measurement: the model's lowest sprung parts sit 4.5 local px off the ground)
  const sq = SQUAT * (rOut(f, c.landed - 1, c.landed + 4) - rInOut(f, c.landed + 4, c.landed + 18));
  const pose: Pose = { x: car.ox, y: car.oy, z: 0, roll: car.roll, pitch: car.pitch, scale: S, spin: spinAt(m, c, f), spinBlur: blurOf(car.rate), squat: sq,
    // the cold-gas thrusters that turn it over: they breathe through the roll
    jets: clamp01(rInOut(f, c.flipped - 18, c.flipped - 10) - rInOut(f, c.flipped + 12, c.flipped + 20)), breath: f / 16,
    sweep: clamp01((f - c.arrive) / 140) };

  // ── the lit path: the car centre's trace, from where it started to where it is now ──
  const trace: { x: number; y: number }[] = [];
  for (let t = m.t0; t < f; t += 0.5) { const q = carAt(m, c, t); trace.push(P(r, [q.x, q.y, 0])); }
  trace.push(P(r, [car.x, car.y, 0]));
  const td = trace.map((q, i) => `${i ? "L" : "M"}${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join(" ");

  const { back: tb, front } = twinTrack(r, TRACK, (v) => v, car.phase === 0 && car.sr !== undefined ? { sr: car.sr, sf: car.sf!, k: 1 } : null);
  const st = structure(r);
  const back = [...tb, ...st.back, ...st.plates];
  const foot = lineAt(LINE, S_FOOT).x;
  const shadows: Face[] = [
    ...contactShadow(r, "pfshr", foot - 10, foot + RL + 20, -ZT - TW, ZT + TW, F, 0.9),
    ...contactShadow(r, "pfshb", foot + RL * 0.4, foot + RL + 20, -ZT - TW - 30, -ZT - TW, F, 0.6),
    ...roadsterShadow(r, pose, F, "pfc"),
  ];
  const carF = roadsterFaces(r, pose, "pfc");

  // the floor: a plane at the pad's height, lit under the ramp and fading into the ground on every side
  const floor = [[-2300, -480], [1480, -480], [1480, 1900], [-2300, 1900]].map(([x, z]) => P(r, [x, F, z]));
  const fp = floor.map((q) => `${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(" ");
  const lane = (z: number) => { const a = P(r, [-2200, F - 0.2, z]), b = P(r, [1380, F - 0.2, z]); return { a, b }; };
  const Fs = P(r, [540, F, 0]).y;
  // the run-up's pool: under the car (projected) while it is on the pad left of the ramp's lit floor, fading as it nears the foot
  const run = { x: P(r, [car.x, F, 0]).x, on: 1 - rInOut(car.x, foot - 420, foot - 60) };

  const scene = () => (
    <>
      <Faces list={back} />
      {/* the path, lit: a wide soft glow, a narrower one, a bright core; round ends */}
      <g data-probe-skip>
        <path d={td} fill="none" stroke={alpha("#4D8ED9", 0.16)} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
        <path d={td} fill="none" stroke={alpha("#4D8ED9", 0.32)} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" />
        <path d={td} fill="none" stroke="#CFE2F8" strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <Faces list={carF} />
      <RoadsterJets r={r} p={pose} len={60} />
      <Faces list={front} />
    </>
  );

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg key={f} width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <RoadsterDefs />
        <TreadDefs id="pfTread" tile={7} />
        <defs data-probe-skip>
          <radialGradient id="pfFloor" gradientUnits="userSpaceOnUse" cx={540} cy={F + 40} r={620} gradientTransform={`translate(540 ${F + 40}) scale(1 0.5) translate(-540 ${-(F + 40)})`}>
            <stop offset="0" stopColor="#0A3C76" stopOpacity="0.75" /><stop offset="0.5" stopColor="#063061" stopOpacity="0.4" /><stop offset="1" stopColor="#001C3C" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="pfLaneFade" gradientUnits="userSpaceOnUse" cx={540} cy={F + 30} r={560} gradientTransform={`translate(540 ${F + 30}) scale(1 0.4) translate(-540 ${-(F + 30)})`}>
            <stop offset="0" stopColor="#FFFFFF" /><stop offset="0.6" stopColor="#FFFFFF" stopOpacity="0.5" /><stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          {/* ★ the run-up's own light: a soft pool that travels under the car on the pad until it reaches the lit ramp */}
          <radialGradient id="pfRunFade" gradientUnits="userSpaceOnUse" cx={run.x} cy={F + 30} r={430} gradientTransform={`translate(${run.x.toFixed(1)} ${F + 30}) scale(1 0.4) translate(${(-run.x).toFixed(1)} ${-(F + 30)})`}>
            <stop offset="0" stopColor="#FFFFFF" stopOpacity={run.on.toFixed(3)} /><stop offset="0.6" stopColor="#FFFFFF" stopOpacity={(0.5 * run.on).toFixed(3)} /><stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="pfRunPool" gradientUnits="userSpaceOnUse" cx={run.x} cy={F + 40} r={480} gradientTransform={`translate(${run.x.toFixed(1)} ${F + 40}) scale(1 0.5) translate(${(-run.x).toFixed(1)} ${-(F + 40)})`}>
            <stop offset="0" stopColor="#0A3C76" stopOpacity={(0.7 * run.on).toFixed(3)} /><stop offset="0.5" stopColor="#063061" stopOpacity={(0.35 * run.on).toFixed(3)} /><stop offset="1" stopColor="#001C3C" stopOpacity="0" />
          </radialGradient>
          <mask id="pfLaneMask" maskUnits="userSpaceOnUse" x={-2400} y={F - 200} width={3680} height={800}>
            <rect x={-200} y={F - 200} width={1480} height={800} fill="url(#pfLaneFade)" />
            <rect x={-2400} y={F - 200} width={3680} height={800} fill="url(#pfRunFade)" />
          </mask>
          {/* the reflection fades out within ~150 px under the pad's line */}
          <linearGradient id="pfReflFade" gradientUnits="userSpaceOnUse" x1={0} y1={Fs} x2={0} y2={Fs + 170}>
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="1" /><stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <mask id="pfReflMask" maskUnits="userSpaceOnUse" x={-2400} y={Fs} width={3680} height={260}>
            <rect x={-2400} y={Fs} width={3680} height={260} fill="url(#pfReflFade)" />
          </mask>
        </defs>
        {/* ── the pad ── */}
        <polygon data-probe-skip points={fp} fill="url(#pfFloor)" />
        {run.on > 0.002 && <polygon data-probe-skip points={fp} fill="url(#pfRunPool)" />}
        <g data-probe-skip mask="url(#pfLaneMask)">
          {[-ZT - TW - 60, ZT + TW + 70].map((z) => { const { a, b } = lane(z); return <line key={z} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={alpha("#4D8ED9", 0.22)} strokeWidth={z > 0 ? 3 : 2} />; })}
        </g>
        {/* ── the reflection in the pad (the scene mirrored about the pad's line, faint, fading) ── */}
        <g data-probe-skip mask="url(#pfReflMask)" opacity={0.2}>
          <g transform={`matrix(1 0 0 -1 0 ${(2 * Fs).toFixed(1)})`}>{scene()}</g>
        </g>
        <Faces list={shadows} />
        {scene()}
      </svg>
    </div>
  );
};
void lineAt;
