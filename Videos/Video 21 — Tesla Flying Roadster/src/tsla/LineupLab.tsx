import React from "react";
import { useCurrentFrame } from "remotion";
import { Faces, type Face } from "./p3";
import { type Rig } from "./rig";
import { carFaces, carShadow, type CarModel } from "./lineup";

// ══ LOOK-LAB ONLY (registry.tsx `lu*` pieces): the line-up's five cars, for close checks — never a place of the film ══
// view "row": all five side by side at a three-quarter; "close": one car large (`model`), turning slowly round its own axis (yaw −40° at
// frame 0, +1.2° a frame: f 30 ≈ side-on, f 100 ≈ the nose, f 190 ≈ the other side, f 250 ≈ the tail); from frame 300 its wheels spin
// fast with spinBlur 1 (the blurred-disc check)
const MODELS: CarModel[] = ["model3", "modely", "semi", "cybertruck", "cybercab"];
const FLOOR = 1240;
export const LineupLab: React.FC<{ view: "row" | "close"; model?: CarModel }> = ({ view, model = "model3" }) => {
  const f = useCurrentFrame();
  const yaw = view === "row" ? -28 : -40 + f * 1.2;
  const r: Rig = { cx: 540, cy: 1000, persp: 2200, yaw, pitch: -14 };
  const list: Face[] = [];
  if (view === "row") {
    MODELS.forEach((m, i) => {
      const pose = { x: 540, y: FLOOR, z: -520 + i * 260, scale: 0.75, spin: f * 0.1 };
      list.push(...carShadow(r, m, pose, FLOOR, `lu${i}`), ...carFaces(r, m, pose, `lu${i}`));
    });
  } else {
    // (from frame 300 the wheels spin fast with the motion blur on: the spinBlur check)
    const fast = f >= 300;
    const pose = { x: 540, y: FLOOR, z: 0, scale: 1.7, spin: fast ? f * 0.9 : f * 0.1, spinBlur: fast ? 1 : 0 };
    list.push(...carShadow(r, model, pose, FLOOR, "lc"), ...carFaces(r, model, pose, "lc"));
  }
  return (
    <svg key={f} width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <Faces list={list} />
    </svg>
  );
};
