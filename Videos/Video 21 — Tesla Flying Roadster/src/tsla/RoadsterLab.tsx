import React from "react";
import { useCurrentFrame } from "remotion";
import { Faces } from "./p3";
import { type Rig } from "./rig";
import { roadsterFaces, roadsterShadow, RoadsterJets, RoadsterDefs, spinBlurFor, RD, type Pose } from "./roadster";
import { cybercabFaces, cybercabShadow, CB, type CabPose } from "./cybercab3d";

// The look lab's Roadster (registry.tsx PLACE_PARTS rd*; `node scratchpad/lab.mjs rdThreeQ@30 …`) — never in the film.
//   side    a clean profile (yaw 0), the wheels turning slowly
//   threeq  a front three-quarter from above (the house view)
//   rear    a rear three-quarter: the tail panel, the light bar, the diffuser and its four nozzles firing
//   roll    rolled 120° in the air (the flip): the flank and the underside
//   under   SEEN FROM BELOW (the camera under the car, looking up): the floor's panels, the battery plate, the motors, the arms, the fins
//   front   the nose almost head-on: the intake, the splitter, the headlamps, the windscreen
//   wheel   one front wheel close up, turning: sharp spokes until ~frame 45, then faster and faster, cross-fading into the blur disc
export const RoadsterLab: React.FC<{ view: "side" | "threeq" | "rear" | "roll" | "under" | "front" | "wheel" }> = ({ view }) => {
  const f = useCurrentFrame();
  const FLOOR = 1180;
  // the wheel view's turn: 0.12 rad a frame, accelerating from frame 40 (≈ 0.6 rad/f by frame 60, 1.4 by frame 90)
  const w = 0.12 + Math.max(0, f - 40) * 0.025, spinW = 0.12 * f + 0.0125 * Math.max(0, f - 40) ** 2;
  const RIG: Record<typeof view, Rig> = {
    side: { cx: 540, cy: 1000, persp: 2200, yaw: 0, pitch: -6 },
    threeq: { cx: 540, cy: 1000, persp: 2200, yaw: -26, pitch: -14 },
    rear: { cx: 540, cy: 1000, persp: 2200, yaw: 62, pitch: -14 },
    roll: { cx: 540, cy: 1000, persp: 2200, yaw: -14, pitch: -14 },
    under: { cx: 540, cy: 1000, persp: 2200, yaw: -24, pitch: 34 },
    front: { cx: 540, cy: 1000, persp: 2200, yaw: -72, pitch: -10 },
    wheel: { cx: 540, cy: 1000, persp: 2400, yaw: -16, pitch: -6 },
  };
  const r = RIG[view];
  const S = view === "wheel" ? 5.2 : 1.75;
  let p: Pose = {
    x: 540, y: view === "roll" ? FLOOR - 260 : FLOOR, z: 0, scale: S, spin: f * 0.12, jets: view === "side" || view === "front" ? 0 : 1, breath: f / 18,
    roll: view === "roll" ? 120 : 0, pitch: view === "roll" ? 6 : 0,
  };
  if (view === "under") p = { ...p, y: 1000 + 60 * S, jets: 0 };
  if (view === "wheel") {
    // the near front wheel's centre on the rig's centre
    p = { ...p, x: 540 - RD.wheelX[1] * S, y: 1000 + RD.wheelR * S, z: -RD.wheelZ * S, spin: spinW, spinBlur: spinBlurFor(w), jets: 0 };
  }
  const shadow = view === "under" || view === "wheel" ? [] : roadsterShadow(r, p, FLOOR);
  return (
    <svg key={f} width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <RoadsterDefs />
      <Faces list={[...shadow, ...roadsterFaces(r, p)]} />
      <RoadsterJets r={r} p={p} />
    </svg>
  );
};

/** ★ The look lab's CYBERCAB (cybercab3d.tsx) at its poses — never in the film. Views as the Roadster's; `light` 1 draws it as the white
 *  stage sees it (the stage itself is the lab's). Register as pieces cbSide / cbThreeQ / cbRear / cbUnder / cbFront / cbWheel. */
export const CybercabLab: React.FC<{ view: "side" | "threeq" | "rear" | "under" | "front" | "wheel" }> = ({ view }) => {
  const f = useCurrentFrame();
  const FLOOR = 1180;
  const w = 0.12 + Math.max(0, f - 40) * 0.025, spinW = 0.12 * f + 0.0125 * Math.max(0, f - 40) ** 2;
  const RIG: Record<typeof view, Rig> = {
    side: { cx: 540, cy: 1000, persp: 2200, yaw: 0, pitch: -6 },
    threeq: { cx: 540, cy: 1000, persp: 2200, yaw: -26, pitch: -14 },
    rear: { cx: 540, cy: 1000, persp: 2200, yaw: 62, pitch: -14 },
    under: { cx: 540, cy: 1000, persp: 2200, yaw: -24, pitch: 34 },
    front: { cx: 540, cy: 1000, persp: 2200, yaw: -72, pitch: -10 },
    wheel: { cx: 540, cy: 1000, persp: 2400, yaw: -16, pitch: -6 },
  };
  const r = RIG[view];
  const S = view === "wheel" ? 5.2 : 1.85;
  let p: CabPose = { x: 540, y: FLOOR, z: 0, scale: S, spin: f * 0.12 };
  if (view === "under") p = { ...p, y: 1000 + 60 * S };
  if (view === "wheel") p = { ...p, x: 540 - CB.wheelX[1] * S, y: 1000 + CB.wheelR * S, z: -CB.wheelZ * S, spin: spinW, spinBlur: spinBlurFor(w) };
  const shadow = view === "under" || view === "wheel" ? [] : cybercabShadow(r, p, FLOOR);
  return (
    <svg key={f} width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <Faces list={[...shadow, ...cybercabFaces(r, p)]} />
    </svg>
  );
};
