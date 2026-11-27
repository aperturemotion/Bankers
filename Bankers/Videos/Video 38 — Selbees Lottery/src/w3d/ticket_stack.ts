// @ts-nocheck
// ★ V38 rev 5 (builder Q) — JERRY'S TICKET STACK, one layout for two places: the kitchen table (st_test, 1 unit = 10 cm) and the
//   balance's left pan (st_rolldown, the same stack scaled by PILE_K). The rolldown → test transition is a MATCH ON THE TICKETS: the camera
//   pushes onto the pan's stack and lands, on the cut, on the kitchen's identical stack at the same screen place and size.
import { rnd } from "./kit";
import { wf } from "./take";

export const TH = 0.11;          // one rubber-banded bundle of 100 thermal tickets: 1.1 cm
export const TK_N = 36;          // $3,600 at $1 a play: 36 bundles, two per layer, 18 layers
export const TKX = -1.3;         // the kitchen stack's centre (x); z 0
export const TK_W = 0.66, TK_D = 1.56;   // one bundle's footprint (x, z)
/** bundle i's pose RELATIVE to the stack's centre: [x, y(centre), z, yaw] */
export const tkLocal = (i) => {
  const L = Math.floor(i / 2), s = i % 2;
  return [(s ? 0.34 : -0.34) + (rnd(i + 3) - 0.5) * 0.04, L * TH + TH / 2, (rnd(i + 8) - 0.5) * 0.05, (rnd(i + 1) - 0.5) * 0.05];
};
export const TK_TOP = (TK_N / 2) * TH;   // 1.98: the stack's height
// the pan's copy: kitchen units → metres (0.28 → a 0.55 m stack on the pan, 0.37 × 0.44 m footprint, clear of the pan's rods)
export const PILE_K = 0.28;
// the kitchen's origin (st_test) — here so rolldown can map its camera into the kitchen without importing st_test
export const TEST_ORIGIN = [600, 0, 0];
// ★ the MATCH CUT (rolldown → test), story frame: the rolldown camera lands on the pan's stack at MATCH_CUT; the kitchen's first frame
//   is MATCH_CUT + 1 (a cut shot at `a` lands on a + 1). "Jerry tried it." — on "it." the tickets are his, on his table.
export const MATCH_CUT = () => wf("it.") - 1;
