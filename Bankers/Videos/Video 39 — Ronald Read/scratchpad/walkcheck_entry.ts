// @ts-nocheck
// rev 4c review: the couple's gait as numbers — pelvis height per frame (smooth? the bounce), its frame-to-frame change and
// acceleration, the head's world height, and the planted foot's slip (both people, 0–300)
import { __walk } from "../src/w3d/i_couple";
const { mk, solvePose } = __walk;
const out = {};
for (const [name, fem, ph] of [["man", false, 0.0], ["wom", true, 0.37]]) {
  const S = mk(fem).S ?? mk(fem);
  const rows = [];
  for (let f = 0; f < 300; f++) {
    const o = solvePose(S, f / 30, { ph, look: 0 });
    rows.push({ hy: o.hipsP.y, ankL: [o.ankL.x, o.ankL.y, o.ankL.z], ankR: [o.ankR.x, o.ankR.y, o.ankR.z] });
  }
  out[name] = rows;
}
console.log(JSON.stringify(out));
