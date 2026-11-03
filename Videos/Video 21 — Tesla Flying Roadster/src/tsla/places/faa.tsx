import React from "react";
import { useCurrentFrame } from "remotion";
import { rOut, rInOut, clamp01 } from "../anim";
import { Faces, P, mix, swing, type Face, type V } from "../p3";
import { type Rig } from "../rig";
import { Pool3D } from "../s3";
import { roadsterFaces, RD, type Pose } from "../roadster";

// ══════════════════════════════════════════════════════════════════════════════════════════════
// honestA — "Now, the honest part. The FAA says the Roadster doesn't meet its definition of an aircraft." ★ THE SPINE RETURNS, CHANGED
// (the brief): the hook's Roadster again, but PARKED — wheels at rest, no jets — standing on a hangar floor in real depth (roadster.tsx,
// p3.tsx), its soft footprint shadow under it, while the CAMERA CIRCLES it slowly (its rig's yaw eases through ~50° over the place, so the
// car turns under the one key light like a rendered object). Under and around it, painted on the floor: an AIRCRAFT'S OUTLINE — a plain
// dashed silhouette (fuselage, swept wings, tailplane; no plane detail) that the car sits in and does not fit: the car covers the middle of
// the fuselage, the wings run out empty either side. The outline is not there until the voice names the FAA: it DRAWS along its own path
// from the nose, both sides at once, meeting at the tail ("…its definition"), and on "aircraft" it brightens and its empty shape lights
// faintly on the floor — the car a small, wrong shape in the middle of it. No label (the voice and the chip carry "FAA"). KIND object.
// ══════════════════════════════════════════════════════════════════════════════════════════════

export const KIND = "object";

type C = { arrive: number; honest: number; faa: number; definition: number; aircraft: number; end: number };
/** the camera's slow circle (the rig's yaw, frames after the arrival) */
const CIRCLE = 200;
export const faaTimes = (c: C) => ({
  /** the car, its shadow and the floor's pool arrive with the camera (the push) */
  base: [c.arrive - 6, c.arrive + 26] as [number, number],
  /** the camera circles the parked car (a slow, continuous turn — no sound of its own beyond the push) */
  circle: [c.arrive, c.arrive + CIRCLE] as [number, number],
  /** the aircraft's outline draws on the floor from its nose, both sides at once, meeting at its tail ("FAA" → "definition") */
  draw: [c.faa + 2, c.definition + 8] as [number, number],
  /** on "aircraft": the outline brightens and the empty silhouette lights faintly on the floor */
  lit: [c.aircraft - 12, c.aircraft + 4] as [number, number],
  /** the frame the place's LAST action ends (the next place waits for it) */
  done: c.aircraft + 4,
});

// ── the world: the car parked at (CX, FLOOR, 0), nose to +x; the outline on the floor round it, its nose ahead of the car's ──
const CX = 540, FLOOR = 1010, S = 1.25;
const PITCH = -26, PERSP = 2200, YAW0 = -30, YAW1 = -70;
const rigAt = (yaw: number): Rig => ({ cx: CX, cy: FLOOR, persp: PERSP, yaw, pitch: PITCH });

/** ★ THE AIRCRAFT'S OUTLINE — one side (z ≥ 0) from the nose tip to the tail's end, in floor units about the car's centre: a slender
 *  fuselage with an ogive nose, a swept wing with a rounded tip, a swept tailplane, a tail cone. The other side is its mirror. */
const HALF: [number, number][] = [
  [480, 0], [474, 18], [458, 36], [432, 52], [398, 64], [356, 70],
  [175, 72],
  [-128, 396], [-142, 408], [-196, 410], [-214, 400],
  [-104, 72],
  [-330, 70], [-388, 60],
  [-468, 186], [-480, 194], [-510, 194], [-520, 186],
  [-490, 44], [-528, 22], [-536, 0],
];
const lenOf = (q: [number, number][]) => q.reduce((s, p, i) => (i ? s + Math.hypot(p[0] - q[i - 1][0], p[1] - q[i - 1][1]) : 0), 0);
const HALF_LEN = lenOf(HALF);
/** a point and its direction along the half outline at arc length s */
const along = (s: number): { x: number; z: number; tx: number; tz: number } => {
  let acc = 0;
  for (let i = 1; i < HALF.length; i++) {
    const a = HALF[i - 1], b = HALF[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (s <= acc + L || i === HALF.length - 1) {
      const t = clamp01((s - acc) / Math.max(1e-6, L));
      return { x: a[0] + (b[0] - a[0]) * t, z: a[1] + (b[1] - a[1]) * t, tx: (b[0] - a[0]) / L, tz: (b[1] - a[1]) / L };
    }
    acc += L;
  }
  return { x: HALF[HALF.length - 1][0], z: 0, tx: -1, tz: 0 };
};
/** the dashes of one side, in arc length: 34 painted, 18 bare (each a painted stripe on the floor, foreshortened with it) */
const DASH = 34, GAP = 18;
const DASHES: [number, number][] = (() => {
  const out: [number, number][] = [];
  for (let s = 0; s < HALF_LEN; s += DASH + GAP) out.push([s, Math.min(HALF_LEN, s + DASH)]);
  return out;
})();

/** where the camera aims: the car (IN), and the outline's empty wing on the near side (the move), as framed late in the circle */
export const FAA = (() => {
  const r = rigAt(YAW1 + 8);
  const car = P(r, [CX, FLOOR - RD.height * 0.55 * S, 0]);
  const wing = P(r, [CX - 110, FLOOR, 300]);
  return { x: CX, y: Math.round(car.y + 75), a: { x: Math.round(car.x), y: Math.round(car.y) }, wing: { x: Math.round(wing.x), y: Math.round(wing.y) } } as const;
})();

export const Faa: React.FC<C> = (c) => {
  const f = useCurrentFrame();
  const T = faaTimes(c);
  const bq = rOut(f, ...T.base);
  const r = rigAt(swing(f, T.circle[0], T.circle[1], YAW0, YAW1, 0.8));
  const drawP = rInOut(f, ...T.draw), litP = rInOut(f, ...T.lit);

  const faces: Face[] = [];
  // ── the outline: each dash a thin painted stripe ON the floor (so it foreshortens and turns with it), drawn from the nose along both
  // sides; the head of the drawing glows as it travels (a lit line drawing), the whole brightens on "aircraft" ──
  const head = drawP * HALF_LEN, W = 7;
  const strip = (s0: number, s1: number, side: 1 | -1): V[] => {
    const ss = [s0];
    // (a dash that turns a corner keeps the corner: the outline's own vertices inside it)
    let acc = 0;
    for (let i = 1; i < HALF.length; i++) { acc += Math.hypot(HALF[i][0] - HALF[i - 1][0], HALF[i][1] - HALF[i - 1][1]); if (acc > s0 && acc < s1) ss.push(acc); }
    ss.push(s1);
    const pts = ss.map((s) => along(Math.min(s, HALF_LEN - 1e-3)));
    const left = pts.map((q) => [CX + q.x - q.tz * W * 0.5, FLOOR - 0.6, (q.z + q.tx * W * 0.5) * side] as V);
    const right = pts.map((q) => [CX + q.x + q.tz * W * 0.5, FLOOR - 0.6, (q.z - q.tx * W * 0.5) * side] as V);
    return [...left, ...right.reverse()];
  };
  if (drawP > 0.0005) {
    DASHES.forEach(([s0, s1], i) => {
      if (s0 >= head) return;
      const e = Math.min(s1, head);
      if (e - s0 < 0.5) return;
      // the glow of the drawing's head: the last ~120 units of what is drawn burn bright, settling to the line's dim lit blue behind it
      // (the glow settles out over the drawing's last tenth — never switched off on the frame it completes)
      const near = clamp01(1 - (head - e) / 120) * (1 - clamp01((drawP - 0.9) / 0.1));
      const col = mix(mix("#3F7FCB", "#D7E7F8", litP), "#F2F8FE", near * (1 - litP));
      const op = (0.62 + 0.3 * near) * (1 - litP) + 0.95 * litP;
      for (const side of [1, -1] as const) {
        faces.push({ k: `faL${i}${side}`, p: strip(s0, e, side).map((q) => P(r, q)), z: -3e6 + i, fill: col, op, chrome: 0, fall: 0, skip: true, sw: 0.6 });
      }
    });
  }
  // ── on "aircraft": the empty silhouette lights faintly on the floor (painted under the line), the car a small wrong shape inside it ──
  if (litP > 0.001) {
    const full: V[] = [...HALF, ...HALF.slice(1, -1).reverse().map(([x, z]) => [x, -z] as [number, number])].map(([x, z]) => [CX + x, FLOOR - 0.4, z] as V);
    faces.push({ k: "faFill", p: full.map((q) => P(r, q)), z: -4e6, fill: "#4D8ED9", op: 0.13 * litP, chrome: 0, fall: 0, skip: true, sw: 0 });
  }
  // ── the car's footprint shadow: darkest in a line at its base, softening outward, leaning AWAY from the key in VIEW space (right and
  // back on screen, whichever way the camera has circled), navy — painted after the floor's line, before the car ──
  {
    const b = (r.yaw * Math.PI) / 180;
    // view-right and view-back as floor directions (rig.tsx project: x1 = dx·cos b + z·sin b, z1 = −dx·sin b + z·cos b)
    const rx = Math.cos(b), rz = Math.sin(b), kx = Math.sin(b), kz = -Math.cos(b);
    const lx = rx * 0.7 + kx * 0.5, lz = rz * 0.7 + kz * 0.5;
    const hx = RD.half * S, hz = 102 * S, RINGS = 14, N = 36;
    for (let i = 0; i < RINGS; i++) {
      const g = i / (RINGS - 1), spread = 3 + g * 52, rad = 30 + g * 46, lean = 34 * g;
      const ax = hx + spread, az = hz + spread * 0.8, rr = Math.min(rad, ax, az), ox = CX + lx * lean, oz = lz * lean;
      const ring: V[] = [];
      for (let j = 0; j < N; j++) {
        const a = (j / N) * Math.PI * 2, co = Math.cos(a), si = Math.sin(a);
        ring.push([ox + Math.sign(co) * (ax - rr) + rr * co, FLOOR - 0.3, oz + Math.sign(si) * (az - rr) + rr * si]);
      }
      faces.push({ k: `faSh${i}`, p: ring.map((q) => P(r, q)), z: -1e6 - i, fill: "#000814", op: 0.075 * (1 - 0.4 * g), chrome: 0, fall: 0, skip: true, sw: 0 });
    }
  }
  // ── the car, parked: wheels at rest, jets off; the canopy's light where the key puts it ──
  const pose: Pose = { x: CX, y: FLOOR, z: 0, scale: S, spin: 0, jets: 0 };
  faces.push(...roadsterFaces(r, pose, "fa"));

  const pool = P(r, [CX, FLOOR, 0]);
  return (
    // (the whole place fades as ONE layer while the camera brings it in: per-face opacity would show the mesh's seams through the car)
    <div style={{ position: "absolute", inset: 0, opacity: bq < 1 ? bq : undefined }}>
      <Pool3D x={CX} y={pool.y + 30} w={1120} on={0.7} />
      <svg key={f} width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Faces list={faces} />
      </svg>
    </div>
  );
};
