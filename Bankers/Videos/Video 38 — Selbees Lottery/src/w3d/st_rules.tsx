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
import { Shade, floorBlob } from "./st_state_fx";
import { O_TOTAL, PIC_WORLD } from "./st_total";

// ★ rev 5 (Timur: "seamless transitions … preferably no fade outs"; at ~2,274 f "it just randomly wanders around … That can't happen"):
//   Evart's main street now runs BEHIND the family home of the total station (the across-the-street sidewalk borders its back yard),
//   so the film leaves the home's lit window by ONE crane up the facade, over the roof ridge and down onto the corner store's lit
//   display window — no cross-dissolve. The close is seen from the STREET now (the brochure turned to read from outside the glass):
//   the push to the brochure, the lean on the roll-down rule, and one slow pull back across the street onto the whole lit storefront
//   (the sign, the window, the brochure on the counter) — the camera always on the store, never wandering down an empty street.
export const O_RULES = [O_TOTAL[0] + 12, 0, -38.5];
const T = () => {
  const s0 = wAt("sometimes", 2090);
  return { s0, edge: wAt("edge", s0), isnt: wAt("isn't", s0), luck: wAt("luck", s0), luckE: wEndAt("luck", s0), its: wAt("it's", wAt("luck", s0)), reading: wAt("reading", s0), rules: wAt("rules", s0), rulesE: wEndAt("rules", s0), next: wAt("sometimes", 2090) };
};
// the brochure on the counter (rev 5: its page top away from the window — it reads upright from the street, through the glass)
const BP = [-2.05, COUNTER_TOP + 0.001, COUNTER_Z - 0.02];
const YAW = Math.PI / 2;   // rev 5: it reads from the street, through the window
// brochure design coords (dx along the spread, dy up the page) → station-local (yaw +π/2: dx → +x, dy → −z)
const bro = (dx, dy, dz = 0.002) => [BP[0] + dx, BP[1] + dz, BP[2] - dy];
const brPx = (px, py) => { const [dx, dy] = pxToDesign(px, py); return bro(dx, dy); };
const RULE_PT = () => brPx(1440, 330);                 // the middle of the rule's lines (THE ROLL-DOWN panel)
// the ticket: lying on THE ROLL-DOWN panel, then sliding off the page on "luck"
const ticketPose = (t, f) => {
  const k = ease(f, t.luck - 4, t.luckE + 8);   // rev 5: on "luck", once the camera has arrived
  const p0 = brPx(1450, 400);
  // rev 5: it slides off the page DOWN the frame, toward the window (it slid right into the leaflet stand)
  return { pos: [p0[0] + 0.06 * k, p0[1] + 0.0068 + 0.003 * Math.sin(Math.PI * k) - 0.0062 * clamp01((k - 0.72) / 0.28), p0[2] + 0.34 * k * k], yaw: 0.22 + 0.5 * k };   // (down onto the counter once off the page)
};
const COUNTER_BLOBS = [floorBlob(BP[0] + 0.45, COUNTER_TOP, BP[2] - 0.02, 0.17, 0.25, 0.55, 0.18), floorBlob(BP[0] - 0.01, COUNTER_TOP, BP[2] + 0.01, 0.3, 0.2, 0.28)];
const Scene = ({ f }) => {
  const t = useMemo(T, []);
  const tp = ticketPose(t, f);
  const hi = ease(f, t.reading - 2, t.rules + 6);
  return (
    <group>
      <Sky />
      <Street />
      {/* rev 6: the leaflet stand's and the open brochure's contact shade on the counter (the key throws it down-left) */}
      <Shade items={COUNTER_BLOBS} kind="blob" />
      <Brochure p={BP} open={1} hi={hi} glow={1 - ease(f, t.rules + 6, t.rulesE + 8)} yaw={YAW} />
      <group position={[BP[0] + 0.47, COUNTER_TOP, BP[2] - 0.02]} rotation-y={-0.18}>
        <mesh position={[0, 0.006, 0]} castShadow receiveShadow><boxGeometry args={[0.2, 0.012, 0.36]} /><meshStandardMaterial color="#DCE8F6" transparent opacity={0.4} roughness={0.05} /></mesh>
        <BrochureStack p={[0, 0.013, 0]} n={7} yaw={YAW} />
      </group>
      <group position={tp.pos} rotation-y={tp.yaw}><Ticket pos={[0, 0, 0]} rot={[-Math.PI / 2, 0, 0]} s={0.045} /></group>
    </group>
  );
};
const W = (p) => [p[0] + O_RULES[0], p[1] + O_RULES[1], p[2] + O_RULES[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
// the family home's lit picture window in this station's local frame (the crane leaves from it)
const PICL = () => [PIC_WORLD[0] - O_RULES[0], PIC_WORLD[1] - O_RULES[1], PIC_WORLD[2] - O_RULES[2]];
const shots = () => {
  const t = T();
  const r = RULE_PT(), c = brPx(1300, 560), h = PICL();
  return [
    // ★ the crane, part 1 (rev 5): up the home's facade and over its roof ridge (≥ 3 m clear), turning to the corner store across
    //   main street; the store's lit window is the subject from the moment it clears the ridge
    { a: t.next - 16, b: t.edge + 2, pos: W([h[0] - 0.4, 9.6, 19]), target: W([-1.1, 2.0, 0]), fov: 38, arc: 2.5 },
    // part 2: down over the far sidewalk and the street to the display window, the brochure and the ticket on the counter inside
    { a: t.edge - 10, b: t.luck - 2, pos: W([c[0] + 0.05, 1.8, 2.5]), target: W(add(c, [0, 0, 0])), fov: 36 },
    // the push to the brochure as the ticket slides off it on "luck" (from outside the glass, ~1.5 m, looking steeply down)
    { a: t.luck - 8, b: t.its + 6, pos: W(add(c, [0.04, 1.2, 0.98])), target: W(add(c, [0, 0, 0.02])), fov: 28 },
    // lean in on THE ROLL-DOWN rule (~1.5 m, narrower lens; from outside the glass: a close-up the camera must leave is framed from ≥ ~1 m)
    { a: t.its - 2, b: t.rules + 6, pos: W(add(r, [0.05, 1.25, 0.86])), target: W(add(r, [0, 0, 0])), fov: 26 },   // the lens stays outside the glass; steeper, so the page fills the frame, not the floor
    // the close: one slow pull back across the street onto the whole lit storefront — the sign, the window, the brochure on the
    //   counter under its lamp. raw: the zoom-out keeps its authored path (no smoothing reaching back into the lean)
    { a: t.rulesE - 8, b: t.rulesE + 46, pos: W([-0.3, 2.1, 17.4]), target: W([-0.3, 2.3, 0]), fov: 38, raw: true }   // the whole sign, window and door
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
    cueAt("whooshlong", t.next - 2, 40, 0.4),                       // rev 5: the crane over the roof (fastest ≈ next + 12)
    cueAt("ov_paper_flutter", t.luck - 2, 18, 0.15),                // rev 6: the ticket sliding off the page …
    cueAt("ee_click_click_01", t.luckE + 8, 6, 0.15),              // … and coming to rest on the counter
    cueAt("whooshsoft", t.its + 2, 16, 0.3),                         // the lean in
    cueAt("pingshort", t.reading + 4, 12, 0.3),                      // the highlight starts
    cueAt("pingshort", t.rules + 2, 12, 0.35),                       // …and completes
    cueAt("airwoosh", t.rulesE - 6, 26, 0.3)                         // the pull back across the street
  ];
};
// mounted from the cut to the end: the outro lifts the camera from this station's last framing (the world stays under the veil)
// rev 5: mounted from before the total station's truck (it is the fogged town behind the family home in every total view); the key
//   comes from the upper RIGHT, through the window over the awning, so the brochure and the ticket get a clean, visible cast shadow
export const ST = { id: "rules", origin: O_RULES, from: wAt("$120", 1700) + 10, to: 2400, light: { target: [-1.2, 1, -0.2], key: [6, 14, 7], shadowBox: 7, keyI: 1.7, fillI: 0.36, rimI: 1.6 }, shots, Scene, Overlay, sfx };
