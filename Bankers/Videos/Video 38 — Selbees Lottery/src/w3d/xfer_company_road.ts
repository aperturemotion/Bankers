// @ts-nocheck
// ★ V38 — the COMPANY → ROAD hand-over (company builder; st_company spreads storeShots, st_road spreads roadArrival).
//   rev 2 (Timur, 2026-11-26: "really smoothen the transition after this scene"): the lottery terminal stands in a convenience store
//   beside the interstate (company_store.tsx), the camera flew out of the window and caught the sedan as it drove past.
//   ★ rev 5 (builder R; Timur, 2026-11-27: "a little slower … more seamless transitions … preferably no fade outs"): that flight
//   caught a car doing highway speed in 34 frames (≥ 400 px/f). NOW the Selbees' sedan is PARKED in the store's lot, outside the
//   window behind the register (road_drive.ts):
//     1018  the matched cut: chalk "WINFALL" → the same word on the terminal's screen (solved, as before; the push eases out slower)
//     1034  the push rests on the screen; 1056 "ended": GAME ENDED on it, the pole display reads CLOSED
//     1050  ONE slow pull-back to the register (the HERO: the terminal on its open till, lit by the store's key, its shadow on the counter)
//     1088  the camera rises over the register and (1112) out through the upper pane of the window
//     1084  the car's lamps come on ("Then"); 1110 it pulls out of the lot and eases onto the interstate
//     1136  the camera rides along — from rest, with the car — and settles high behind it (road's chase), no relative speed to catch
//   No cut, no flash, no fade, no empty frame.
import { roadToWorld, storeToGround, SCREEN, screenPt, SCR_WORD, STORE as STORE_O } from "./company_store";
import { solveView, segPx, keysFrom, smoother } from "./company_cam";
import { S, carZ, CAR_Z0 } from "./road_drive";
import { makeCam } from "./kit";

export const CUT2 = 1018;            // company's chalk "WINFALL" → the terminal's "WINFALL" (the first terminal frame)
export const ROAD_FROM = CUT2;       // the road mounts with the store (its world is outside the window; its light takes over on the cut)
export const HEAD_SY = 600, TALLY_HP = 190, CUT_HP = 310;   // rev 5: the chalk push starts closer (140 → 190 px) and runs 30 f: half the rate at the cut
export const PUSH_N = 30;
export const G2 = Math.log(CUT_HP / TALLY_HP) / PUSH_N;   // the push's log-rate per frame through the cut
const DEC = 16;
export const REST = CUT2 + DEC;
// store-local → the road's local (design) frame while the car is parked (the ground stands still: S = S_PARK)
const g = (p) => storeToGround(p);
const toLocal = (p, f) => [p[0] - S(f), p[1], p[2]];
const st = (p) => toLocal(g(p), CUT2);
const toLocalG = (p) => [p[0] - STORE_O[0], p[1] - STORE_O[1], p[2] - STORE_O[2]];   // ground → store-local
// the matched cut's screen side, solved in GROUND coords (a rotation of world about y: the solve carries over exactly)
const WORD_C = screenPt(SCR_WORD.x, SCR_WORD.y);
const WORD_HALF = (() => { const a = screenPt(SCR_WORD.x - SCR_WORD.w / 2, SCR_WORD.y), b = screenPt(SCR_WORD.x + SCR_WORD.w / 2, SCR_WORD.y); return Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) / 2; })();
const screenPoseG = (f) => {
  let L = Math.log(CUT_HP);
  for (let q = CUT2 + 1; q <= f; q++) L += G2 * (1 - smoother((q - CUT2) / DEC));
  const C = g(WORD_C);
  return solveView({ C, w: [-SCREEN.n[0], -SCREEN.n[1], -SCREEN.n[2]], sx: 540, sy: HEAD_SY, size: Math.exp(L), fov: 40, measure: (k) => segPx(k, C, SCREEN.ax, WORD_HALF) });
};
/** the solved screen push in WORLD coords (frames CUT2 … REST) */
export const departCam = (f) => { const s = screenPoseG(Math.min(f, REST)); return { pos: roadToWorld(toLocal(s.pos, f)), target: roadToWorld(toLocal(s.target, f)), fov: s.fov }; };
// the register's hero framing, the look over it at the car through the glass, and the pose outside the glass (store-local metres)
const HERO = { pos: [0.22, 1.8, 3.6], target: [-0.04, 1.0, 1.45], fov: 38 };
const LOOK = { pos: [-0.2, 1.84, 3.05], target: [-0.45, 1.0, -1.2], fov: 38 };
// road-local: the car is parked at (0, 0, CAR_Z0 = 7.3); outside the glass, above its right rear; then high behind it in its lane
const OUT = { pos: [-3.0, 2.45, 10.4], target: [1.2, 1.1, 7.1], fov: 38 };   // just outside the glass, above the car's right rear
export const CHASE = { pos: [-11.5, 4.2, 0.6], target: [5, 1.3, -0.2], fov: 36 };
// ★ the whole hand-over is ONE chain of overlapping eased moves (kit.makeCam, no drift) evaluated RELATIVE TO THE CAR — which stands
//   parked until 1110 (so relative to the car = relative to the store) and then eases out of the lot and sideways into its lane
//   (road_drive.carZ): the chain is authored as if the car stood still, and the car's sideways glide is added back every frame. So the
//   camera rides with the car from rest and never has to catch it. Every frame from REST on is a solved per-frame key (keysFrom).
const rel = (p) => [p[0], p[1], p[2] - CAR_Z0];
const RS = (k) => ({ pos: rel(st(k.pos)), target: rel(st(k.target)), fov: k.fov });   // store-local pose → car-relative
const RL = (k) => ({ pos: rel(k.pos), target: rel(k.target), fov: k.fov });          // road-local pose (car parked) → car-relative
/** the hand-over's moves (car-relative), from the screen push at rest to riding high behind the car */
export const handoverShots = () => {
  const s0 = screenPoseG(REST);
  return [
    { a: 0, b: 0, ...RS({ pos: toLocalG(s0.pos), target: toLocalG(s0.target), fov: s0.fov }) },
    { a: 1050, b: 1096, ...RS(HERO) },                      // on the screen (GAME ENDED on "ended"), then ONE slow pull-back to the register (46 f)
    { a: 1082, b: 1126, ...RS(LOOK) },                      // rise and look over it, through the glass, at the parked car (lamps on at 1084)
    { a: 1100, b: 1146, ...RL(OUT) },                       // out through the upper pane as the car starts to roll (1110)
    { a: 1128, b: 1222, ...CHASE }                          // ride along as it pulls out, settling high behind it in its lane
  ];
};
/** per-frame keys [f0, f1] for a chain of car-relative road-local shots (st_road appends its own moves and calls this) */
export const chainKeys = (shots, f0, f1) => {
  const C = makeCam(shots, 0);
  return keysFrom(f0, f1, (f) => { const k = C(f), z = carZ(f); return { pos: roadToWorld([k.pos[0], k.pos[1], k.pos[2] + z]), target: roadToWorld([k.target[0], k.target[1], k.target[2] + z]), fov: k.fov }; });
};
/** company's shots: the solved push on the screen (the chain from REST + 1 is road's: st_road.tsx) */
export const storeShots = () => keysFrom(CUT2, REST, departCam);
