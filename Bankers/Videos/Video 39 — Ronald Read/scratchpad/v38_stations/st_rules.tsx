// @ts-nocheck
// ★ V38 station RULES (builder D): "Sometimes the edge isn't luck. It's reading the rules."
//   The close, back where it began: Jerry's kind of store on Evart's main street at blue hour.
//   · arrival: a CUT (cut: true) out of the total station's push into the home's lit window → a close-up under the store's pendant
//     lamp: the hook's LOTTERY ticket lying on the open WINFALL brochure (the same leaflet the store station showed: HOW TO PLAY |
//     PRIZES | THE ROLL-DOWN), a stand of folded WINFALL leaflets beside it. The camera drifts up and back.
//   · "the edge isn't luck": the ticket slides off the page and away (tag LUCK rides with it) — under it, the rules
//   · "It's reading the rules": the camera leans in on THE ROLL-DOWN; a light-blue highlight sweeps the rule line by line (tag
//     THE ROLL-DOWN RULE)
//   · then the camera pulls back out through the display window onto the sidewalk: the lit store, the sign, main street with its
//     lamps and lit shop windows receding (the hook's street) — and the integrator's outro lifts it into the sky for BANKER$.
import React, { useMemo } from "react";
import * as THREE from "three";
import { ease, easeOut, clamp01, lerp, Sky, Glow } from "./kit";
import { Tag } from "./overlays";
import { cueAt } from "../bnx/SfxLayer";
import { Ticket } from "./st_hook";
import { wAt, wEndAt } from "./st_state";
import { Street, COUNTER_TOP, COUNTER_Z } from "./st_rules_street";
import { Brochure, BrochureStack, RULE, pxToDesign, BRO } from "./st_rules_brochure";
import { TOTAL_PUSH_END } from "./st_total";

export const O_RULES = [2400, 0, 0];
const T = () => {
  const s0 = wAt("sometimes", 2090);
  return { s0, edge: wAt("edge", s0), isnt: wAt("isn't", s0), luck: wAt("luck", s0), luckE: wEndAt("luck", s0), its: wAt("it's", wAt("luck", s0)), reading: wAt("reading", s0), rules: wAt("rules", s0), rulesE: wEndAt("rules", s0), cut: TOTAL_PUSH_END() };
};
// the brochure on the counter, its page top toward the display window: it reads upright from behind the counter, the street beyond
const BP = [-2.05, COUNTER_TOP + 0.001, COUNTER_Z - 0.02];
const YAW = -Math.PI / 2;
// brochure design coords (dx along the spread, dy up the page) → station-local (yaw −π/2: dx → −x, dy → +z)
const bro = (dx, dy, dz = 0.002) => [BP[0] - dx, BP[1] + dz, BP[2] + dy];
const brPx = (px, py) => { const [dx, dy] = pxToDesign(px, py); return bro(dx, dy); };
const RULE_PT = () => brPx(1440, 330);                 // the middle of the rule's lines (THE ROLL-DOWN panel)
// the ticket: lying on THE ROLL-DOWN panel, then sliding off to the right and away on "luck"
const ticketPose = (t, f) => {
  const k = ease(f, t.isnt - 4, t.luckE + 2);
  const p0 = brPx(1450, 400);
  return { pos: [p0[0] - 0.3 * k, p0[1] + 0.0068 + 0.003 * Math.sin(Math.PI * k), p0[2] - 0.1 * k * k], yaw: Math.PI + 0.22 + 0.7 * k };
};
const Scene = ({ f }) => {
  const t = useMemo(T, []);
  const tp = ticketPose(t, f);
  const hi = ease(f, t.reading - 2, t.rules + 6);
  return (
    <group>
      <Sky />
      <Street />
      <Brochure p={BP} open={1} hi={hi} glow={1 - ease(f, t.rules + 6, t.rulesE + 8)} yaw={YAW} />
      <group position={[BP[0] + 0.47, COUNTER_TOP, BP[2] + 0.02]} rotation-y={0.18}>
        <mesh position={[0, 0.006, 0]} castShadow receiveShadow><boxGeometry args={[0.2, 0.012, 0.36]} /><meshStandardMaterial color="#DCE8F6" transparent opacity={0.4} roughness={0.05} /></mesh>
        <BrochureStack p={[0, 0.013, 0]} n={7} yaw={YAW} />
      </group>
      <group position={tp.pos} rotation-y={tp.yaw}><Ticket pos={[0, 0, 0]} rot={[-Math.PI / 2, 0, 0]} s={0.045} /></group>
    </group>
  );
};
const W = (p) => [p[0] + O_RULES[0], p[1] + O_RULES[1], p[2] + O_RULES[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const LEAN = [-0.08, 0.75, -0.6];   // rev 2: the lean-in on the rule from ~1 m (0.38 m made the fly-out whip: image jerk 30 → 16 px/f²)
const shots = () => {
  const t = T();
  const r = RULE_PT(), c = brPx(1300, 560);
  return [
    // the cut: close over the ticket on THE ROLL-DOWN panel, from behind the counter, under the pendant lamp
    { a: t.cut, b: t.cut, cut: true, pos: W(add(c, [-0.07, 0.42, -0.34])), target: W(add(c, [-0.03, 0, 0.01])), fov: 34 },
    // a slow drift up and back: the whole spread, the leaflet stand at its side, the lit street through the window beyond
    { a: t.cut + 1, b: t.isnt + 6, pos: W(add(bro(0.03, -0.1), [-0.05, 0.6, -0.56])), target: W(bro(0.03, 0.05)), fov: 34 },
    // lean in on the rule as the ticket is gone
    { a: t.luck + 2, b: t.rules - 2, pos: W(add(r, LEAN)), target: W(add(r, [0, 0, 0.01])), fov: 34 },
    // fly forward over the counter, out through the display window into main street, turning to look down the road (the hook's street);
    // rev 2: a slow 62-f move (it was a 35-f whip from a 0.35-m close-up: Timur, no fast back-and-forth)
    { a: t.rules - 4, b: t.rules + 40, pos: W([-1.7, 2.0, 2.6]), target: W([-6.5, 1.7, 14]), fov: 40, raw: true },   // rev 4f: starts 6 f later, after the tags have gone
    // rev 3: …looking OUT through the window as it passes (turning left while still inside showed the brick beside the window), then,
    //   outside, the turn down main street
    { a: t.rules + 34, b: t.rules + 80, pos: W([0.4, 2.4, 8.4]), target: W([-30, 2.2, 7.4]), fov: 40, raw: true }
  ];
};
const Overlay = ({ f, P }) => {
  const t = T();
  const tp = ticketPose(t, f);
  const tk = P([tp.pos[0], tp.pos[1] + 0.003, tp.pos[2]]);
  const rl = P(RULE_PT());
  return (
    <>
      <Tag text="Luck" at={t.luck - 14} out={t.rules - 24} x={600} y={520} to={tk.behind ? null : tk} size={32} />
      <Tag text="The roll-down rule" at={t.its - 14} out={t.rules - 14} x={90} y={520} to={rl.behind ? null : rl} size={30} />
    </>
  );
};
const sfx = () => {
  const t = T();
  return [
    cueAt("ee_whoosh_fast_small_whoosh_01", t.isnt + 4, 14, 0.25),   // the ticket sliding off the page
    cueAt("whooshsoft", t.its + 2, 16, 0.3),                         // the lean in
    cueAt("pingshort", t.reading + 4, 12, 0.3),                      // the highlight starts
    cueAt("pingshort", t.rules + 2, 12, 0.35),                       // …and completes
    cueAt("airwoosh", t.rules + 12, 26, 0.35)                        // the pull back out through the window
  ];
};
// mounted from the cut to the end: the outro lifts the camera from this station's last framing (the world stays under the veil)
export const ST = { id: "rules", origin: O_RULES, from: TOTAL_PUSH_END() - 2, to: 2400, light: { target: [-2.0, 1, -0.8], shadowBox: 3.2, keyI: 1.6, fillI: 0.36, rimI: 1.6 }, shots, Scene, Overlay, sfx };
