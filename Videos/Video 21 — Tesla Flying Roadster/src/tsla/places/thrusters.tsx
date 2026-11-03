import React from "react";
import { useCurrentFrame } from "remotion";
import { rInOut, alpha, mixHex } from "../anim";
import { Faces, P, onFace, swing, type V } from "../p3";
import { type Rig } from "../rig";
import { roadsterFaces, roadsterShadow, RoadsterDefs, RoadsterJets, toWorld, flankZ, type Pose } from "../roadster";
import { SPX_D } from "../spxlogo";

// ══════════════════════════════════════════════════════════════════════════════════════════════
// whatC — "Then compressed-air thrusters, developed with SpaceX, lifted it over a row of other Teslas."
// A CLOSE, SLOW ORBIT ROUND THE REAR OF THE ROADSTER (the brief: "the nozzles glow, and a cutaway-free view of the jets with 10 THRUSTERS and
// the SpaceX mark engraved on a body panel"). The car in real depth on its own rig, big in the frame, parked on the test pad (its painted
// pad ring and grid receding into the dark, its soft footprint shadow); the camera's viewpoint swings ~38° round it, from almost straight
// behind (the four tail nozzles facing us) to a rear three-quarter where the near flank — and what is engraved on it — turns into view.
//   - "compressed-air thrusters" — the ten nozzles ARM (their cores glow blue), then FIRE: short white cold-gas jets breathing out;
//   - the flank carries 10 THRUSTERS and SpaceX's mark ENGRAVED in the paint from the first frame (print that belongs to an object is on it
//     from its first frame — STYLE §16 2026-10-22; the mark ~75 px clear of the label, no box round it); "thrusters" fills the label's
//     engraving with the light blue, "SpaceX" the mark's;
//   - "lifted" — the car rises gently off the pad on its jets (eased, ~80 px), its shadow softening and spreading under it;
//   - "a row of other Teslas" — it holds there, hovering, the jets breathing. (The row itself is the hook's; this line is the thrusters.)
// KIND object.
// ══════════════════════════════════════════════════════════════════════════════════════════════

export const KIND = "object";

type C = { arrive: number; compressed: number; thrusters: number; developed: number; spacex: number; lifted: number; row: number; teslas: number; end: number };

/** every animation window (the SFX score reads these); `done`: the frame the place's LAST action ends */
export const thrustersTimes = (c: C) => ({
  /** the slow orbit round the rear (the camera's viewpoint swings round the car) */
  orbit: [c.arrive, c.teslas + 6] as [number, number],
  /** the nozzles arm: their cores come up blue */
  arm: [c.compressed - 4, c.compressed + 12] as [number, number],
  /** they fire: the cold-gas jets come up (a hiss; the jets then breathe) */
  fire: [c.thrusters - 4, c.thrusters + 14] as [number, number],
  /** the engraving's ink: 10 THRUSTERS, then SpaceX's mark */
  inkLabel: [c.thrusters - 2, c.thrusters + 10] as [number, number],
  inkMark: [c.spacex - 4, c.spacex + 8] as [number, number],
  /** the lift: the jets swell to full and the car rises off the pad (a soft whoosh / the jets' swell) */
  swell: [c.lifted - 8, c.lifted + 8] as [number, number],
  lift: [c.lifted - 4, c.lifted + 34] as [number, number],
  done: c.lifted + 34,
});

// ── the scene ──
const S = 2.0;                 // the car's scale
const F = 1080;                // the pad, under its tyres
const LIFT = 80;               // how far the jets lift it
const PITCH = -16;
/** the orbit: the rig's yaw from almost straight behind the car (the tail toward us) round to a rear three-quarter */
const YAW0 = 78, YAW1 = 48;
const rigAt = (yaw: number): Rig => ({ cx: 540, cy: 960, persp: 2300, yaw, pitch: PITCH });
const poseAt = (lift: number): Pose => ({ x: 540, y: F - lift, z: 0, scale: S });

// ── the engravings on the near (+z) flank (local units). 10 THRUSTERS on the door's flat panel (between its shut lines at x −72 and +96,
// below the shoulder line, above the step-out over the rocker and its nozzles); SpaceX's mark on the rear quarter, between the tail and the
// rear arch — the rear wheel between them keeps the mark well over 75 px clear of the label at every angle of the orbit. Each plane is
// seated ON the body (roadster.tsx flankZ, at its own mid-height, 0.5 proud), so it follows the rebuilt flank (2026-10-29) ──
const ENG = { x0: -46, x1: 68, y0: -54, y1: -30, z0: flankZ(-46, -42) + 0.5, z1: flankZ(68, -42) + 0.5 } as const;
const LBL = { x: 0, base: 19.5, size: 20 } as const;     // "10 THRUSTERS": from the panel's left, its baseline 19.5 down (cap ≈ 17.4)
const MRK = { x0: -209, x1: -174, y0: -58, y1: -38, z0: flankZ(-209, -48) + 0.5, z1: flankZ(-174, -48) + 0.5 } as const;

/** where things are, for the camera: `a` the tail's nozzles (the camera's IN, near the start of the orbit), `b` the engraved flank as the car
 *  lifts (the MOVE) */
export const THRUSTERS = (() => {
  const ra = rigAt(72), rb = rigAt(54);
  const a = P(ra, toWorld(poseAt(0), [-215, -34, 0]));
  const b = P(rb, toWorld(poseAt(LIFT / 2), [-60, -50, 104]));
  // (the centre: midway between the tail's and the nose's projections at the orbit's middle — the car's on-screen mass)
  const t0 = P(rigAt(62), toWorld(poseAt(LIFT / 2), [-215, -50, 0])), n0 = P(rigAt(62), toWorld(poseAt(LIFT / 2), [215, -36, 0]));
  return { x: 540, y: Math.round((t0.y + n0.y) / 2), a: { x: Math.round(a.x), y: Math.round(a.y) }, b: { x: Math.round(b.x), y: Math.round(b.y) } } as const;
})();

export const Thrusters: React.FC<C> = (c) => {
  const f = useCurrentFrame();
  const T = thrustersTimes(c);
  const r = rigAt(swing(f, T.orbit[0], T.orbit[1], YAW0, YAW1, 0.5));
  const arm = rInOut(f, ...T.arm), fire = rInOut(f, ...T.fire), swell = rInOut(f, ...T.swell);
  const lift = LIFT * rInOut(f, ...T.lift);
  const pose: Pose = { ...poseAt(lift), spin: 0, sweep: 0.25 + 0.5 * rInOut(f, c.arrive, c.teslas), breath: Math.max(0, f - T.fire[0]) / 20 };
  // the nozzle cores: blue as they arm (0.5), white-hot as they fire; the jets: 0.72 when they first fire, full as they lift the car
  const core = 0.5 * arm + 0.5 * fire;
  const jets = fire * (0.72 + 0.28 * swell);
  // ★ the pad's light, its ring and the jets' glow dim away as the slide carries the place out (`end`: the slide's last frame): the jets'
  // plume and the ring are wider than the car, so they were still lit at the frame's right edge when the place unmounted (the MP4's pop scan,
  // f816 → 817) — the hook's floor had the same fault at 10 s
  const outOn = 1 - rInOut(f, c.end - 30, c.end - 4);

  // (the tail nozzles sort in front of the tail panel they are set into at the source now — roadster.tsx hostZ — so no fix-up here)
  const carF = roadsterFaces(r, { ...pose, jets: core }, "th");
  const shadow = roadsterShadow(r, pose, F, "th");

  // ── the pad: a lit pool under the car, the painted landing ring and its grid, every line fading with its distance from the car ──
  const marks: { k: string; a: { x: number; y: number }; b: { x: number; y: number }; op: number; w: number }[] = [];
  const fade = (x: number, z: number) => Math.max(0, 1 - Math.hypot(x - 540, z) / 980);
  const seg = (k: string, A: V, B: V, w: number, base: number) => {
    const op = base * fade((A[0] + B[0]) / 2, (A[2] + B[2]) / 2);
    if (op > 0.004) marks.push({ k, a: P(r, A), b: P(r, B), op, w });
  };
  for (const [ri, R] of [[0, 560], [1, 600]] as [number, number][]) for (let i = 0; i < 96; i++) {
    const a0 = (i / 96) * Math.PI * 2, a1 = ((i + 1) / 96) * Math.PI * 2;
    seg(`ring${ri}_${i}`, [540 + R * Math.cos(a0), F - 0.3, R * Math.sin(a0)], [540 + R * Math.cos(a1), F - 0.3, R * Math.sin(a1)], ri ? 2 : 4, ri ? 0.16 : 0.24);
  }
  for (let g = -5; g <= 5; g++) for (let i = 0; i < 24; i++) {
    const t0 = -1200 + i * 100, t1 = t0 + 100;
    seg(`gx${g}_${i}`, [540 + g * 200, F - 0.2, t0], [540 + g * 200, F - 0.2, t1], 1.6, 0.13);
    seg(`gz${g}_${i}`, [540 + t0, F - 0.2, g * 200], [540 + t1, F - 0.2, g * 200], 1.6, 0.13);
  }
  const floor = [[-900, -1300], [1980, -1300], [1980, 1300], [-900, 1300]].map(([x, z]) => P(r, [x, F, z]));
  const fc = P(r, [540, F, 0]);

  // ── the engravings, on the flank's plane (they turn with the car) ──
  const plane = (E: { x0: number; x1: number; y0: number; y1: number; z0: number; z1: number }) => {
    const w = E.x1 - E.x0, h = E.y1 - E.y0;
    const at = (x: number, y: number): V => toWorld(pose, [x, y, E.z0 + ((E.z1 - E.z0) * (x - E.x0)) / w]);
    return { w, h, t: onFace(r, at(E.x0, E.y0), at(E.x1, E.y0), at(E.x0, E.y1), w, h) };
  };
  const pl = plane(ENG), pm = plane(MRK);
  const inkL = rInOut(f, ...T.inkLabel), inkM = rInOut(f, ...T.inkMark);
  const cut = "#7F97B6", lip = alpha("#FFFFFF", 0.75), ink = "#2F72C4";
  // the mark (24 × 24 units, its ink 7.4–16.6 high) fills the quarter panel's width, centred on its height
  const mk = pm.w / 24, mkY = (pm.h - 9.2 * mk) / 2 - 7.4 * mk;

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg key={f} width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <RoadsterDefs />
        <defs data-probe-skip>
          <radialGradient id="thPad" gradientUnits="userSpaceOnUse" cx={fc.x} cy={fc.y} r={760} gradientTransform={`translate(${fc.x.toFixed(1)} ${fc.y.toFixed(1)}) scale(1 0.42) translate(${(-fc.x).toFixed(1)} ${(-fc.y).toFixed(1)})`}>
            <stop offset="0" stopColor="#0B3E7A" stopOpacity="0.85" /><stop offset="0.45" stopColor="#052C5A" stopOpacity="0.45" /><stop offset="1" stopColor="#001C3C" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* ── the pad ── */}
        <polygon data-probe-skip points={floor.map((q) => `${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(" ")} fill="url(#thPad)" opacity={outOn.toFixed(3)} />
        <g data-probe-skip opacity={outOn.toFixed(3)}>
          {marks.map((m) => <line key={m.k} x1={m.a.x.toFixed(1)} y1={m.a.y.toFixed(1)} x2={m.b.x.toFixed(1)} y2={m.b.y.toFixed(1)} stroke="#4D8ED9" strokeOpacity={m.op.toFixed(3)} strokeWidth={m.w} strokeLinecap="round" />)}
        </g>
        <Faces list={shadow} />
        <Faces list={carF} />
        {/* ── 10 THRUSTERS and SpaceX's mark, engraved in the flank's paint (a cut with its lower lip catching the key), the cut filling with
            the light blue on their words ── */}
        <g data-probe-skip transform={pl.t}>
          <text data-print x={LBL.x + 0.35} y={LBL.base + 0.4} fontFamily="Anton" fontSize={LBL.size} letterSpacing={1} fill={lip}>10 THRUSTERS</text>
          <text data-print x={LBL.x} y={LBL.base} fontFamily="Anton" fontSize={LBL.size} letterSpacing={1} fill={mixHex(cut, ink, inkL)}>10 THRUSTERS</text>
        </g>
        <g data-probe-skip transform={pm.t}>
          <g transform={`translate(0.3 ${(mkY + 0.35).toFixed(2)}) scale(${mk.toFixed(4)})`}>{SPX_D.map((d, i) => <path key={i} d={d} fill={lip} />)}</g>
          <g transform={`translate(0 ${mkY.toFixed(2)}) scale(${mk.toFixed(4)})`}>{SPX_D.map((d, i) => <path key={i} d={d} fill={mixHex(cut, ink, inkM)} />)}</g>
        </g>
        {/* ── the cold-gas jets, in front of the body ── */}
        <g opacity={outOn.toFixed(3)}><RoadsterJets r={r} p={{ ...pose, jets }} len={88} /></g>
      </svg>
    </div>
  );
};
