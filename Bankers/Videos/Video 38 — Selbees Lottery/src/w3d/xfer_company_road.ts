// @ts-nocheck
// ★ V38 rev 2 — the COMPANY → ROAD hand-over (owned by the company builder, E; st_road.tsx spreads roadArrival as its first shots).
//   Timur, 2026-11-26: "really smoothen the transition after this scene … I don't really understand what's happening … make it a
//   lot more smoother." The old one pushed into a black screen, held empty navy, then the road appeared.
//   NOW: the lottery terminal stands in a convenience store BESIDE THE INTERSTATE (company_store.tsx, on the road's scrolling
//   ground, so the store, the pines and the road's lines stand still together and the sedan really drives along). After the screen
//   dies on "ended the game", the camera rises off the terminal, out through the store window into the night, across the lot,
//   and swings in high behind the sedan as it drives past the store — one continuous eased move, no cut, no flash, no empty frame. It comes to
//   rest high behind the car exactly on road's frame 1104 (velocity 0), where road's own crane down behind the car takes over.
//   Every frame from the cut onto the terminal (CUT2) to 1104 is a solved per-frame key (company_cam.keysFrom).
import { groundToWorld, roadToWorld, roadS, storeToGround, SCREEN, screenPt, SCR_WORD, SCR_W } from "./company_store";
import { solveView, segPx, keysFrom, moveBetween, smoother } from "./company_cam";

export const CUT2 = 1018;            // company's chalk "WINFALL" → the terminal's "WINFALL" (the first terminal frame)
export const ROAD_FROM = CUT2;       // the road mounts with the store (its world is outside the window; its light takes over on the cut)
export const DEPART = 1062;          // the camera starts to rise off the terminal (as "ended", 1056–1063, finishes)
export const FLY = 1070;             // … and flies out through the window from here
export const ARRIVE = 1104;          // at rest high behind the car; road's crane (a = 1104) continues from here
export const HEAD_SY = 600, TALLY_HP = 140, CUT_HP = 310;
export const G2 = Math.log(CUT_HP / TALLY_HP) / 22;   // the push's log-rate per frame through the cut
const DEC = 12;
// road-local (design) poses
export const HOVER = { pos: [-16, 10.5, 3.5], target: [8, 0.4, 0.2], fov: 40 };
// store-local framings of the terminal (metres)
const WIDE = { pos: [0.12, 1.75, 3.9], target: [0.05, 1.06, 1.4], fov: 40 };
const WIDE2 = { pos: [0.06, 1.72, 3.7], target: [0.03, 1.06, 1.4], fov: 40 };
const RISE = { pos: [-0.55, 1.9, 3.1], target: [-0.1, 1.05, 1.3], fov: 40 };   // risen and to the left (clear of the sign), looking down on the dark terminal   // risen, looking down on the dark terminal
const g = (p) => storeToGround(p);
const gPose = (k) => ({ pos: g(k.pos), target: g(k.target), fov: k.fov });
// the matched cut's screen side, solved in GROUND coords (a rotation of world about y: the solve carries over exactly)
const WORD_C = screenPt(SCR_WORD.x, SCR_WORD.y);
const WORD_HALF = (() => { const a = screenPt(SCR_WORD.x - SCR_WORD.w / 2, SCR_WORD.y), b = screenPt(SCR_WORD.x + SCR_WORD.w / 2, SCR_WORD.y); return Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) / 2; })();
const screenPoseG = (f) => {
  let L = Math.log(CUT_HP);
  for (let q = CUT2 + 1; q <= f; q++) L += G2 * (1 - smoother((q - CUT2) / DEC));
  const C = g(WORD_C);
  return solveView({ C, w: [-SCREEN.n[0], -SCREEN.n[1], -SCREEN.n[2]], sx: 540, sy: HEAD_SY, size: Math.exp(L), fov: 40, measure: (k) => segPx(k, C, SCREEN.ax, WORD_HALF) });
};
const REST = CUT2 + DEC;
/** the camera in GROUND coords while it is in the store (frames CUT2 … DEPART) */
const inStore = (f) => {
  if (f <= REST) return screenPoseG(f);
  const rest = screenPoseG(REST);
  if (f <= 1044) return moveBetween(rest, gPose(WIDE), smoother((f - REST) / (1044 - REST)));
  if (f <= DEPART) return moveBetween(gPose(WIDE), gPose(WIDE2), smoother((f - 1044) / (DEPART - 1044)));
  return moveBetween(gPose(WIDE2), gPose(RISE), smoother((f - DEPART) / (FLY + 10 - DEPART)));
};
const toLocal = (p, f) => [p[0] - roadS(f), p[1], p[2]];
/** the live camera (WORLD) from CUT2 to ARRIVE */
export const departCam = (f) => {
  const s = inStore(f);
  let pos = toLocal(s.pos, f), target = toLocal(s.target, f), fov = s.fov;
  if (f > FLY) {
    const tt = (f - FLY) / (ARRIVE - FLY), u = smoother(tt);
    // out through the window first (z, done by 65 %), then back along the road (x) and up (y), a small crest on top
    const uz = smoother(tt / 0.65), ux = Math.pow(u, 1.5), uy = u * u, ut = smoother((f - FLY) / 20), lift = 4 * Math.sin(Math.PI * u) * smoother(u / 0.7);
    pos = [pos[0] + (HOVER.pos[0] - pos[0]) * ux, pos[1] + (HOVER.pos[1] - pos[1]) * uy + lift, pos[2] + (HOVER.pos[2] - pos[2]) * uz];
    target = [target[0] + (HOVER.target[0] - target[0]) * ut, target[1] + (HOVER.target[1] - target[1]) * ut, target[2] + (HOVER.target[2] - target[2]) * ut];   // the gaze leads: it finds the car first
    fov = fov + (HOVER.fov - fov) * u;
  }
  return { pos: roadToWorld(pos), target: roadToWorld(target), fov };
};
/** road's first shots: the flight, one solved key per frame, a < 1104 */
export const roadArrival = (A, t) => keysFrom(DEPART, ARRIVE, departCam);
