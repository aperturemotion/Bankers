import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Field, KeyLight } from "./stage";
import { theme } from "./theme";
import "./fonts";
import { PLACE_PARTS, T0 } from "./places/registry";

// A LOOK LAB (Video 10 on): renders one place's construction on the demo's field and key light, so a piece can be judged at full size
// before it goes into the journey (no camera). Not part of the film; `node scratchpad/lab.mjs <place>@<frame> …` stills it. `piece` is a
// place id (registry.tsx PLACE_PARTS); a place with no MID of its own (a travel) shows nothing.
export const Lab: React.FC<{ piece?: string; light?: number }> = ({ piece = "hookA", light = 0 }) => {
  const f = useCurrentFrame();
  const parts = PLACE_PARTS[piece];
  const t0 = (T0 as Record<string, number>)[piece] ?? 0;
  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg, overflow: "hidden" }}>
      <Field light={light} lightX={30} lightY={12} />
      <KeyLight at={-100} x={280} y={-270} angle={16} len={2200} spread={520} strength={0.35} />
      {parts?.mid?.({ f, light, t0, end: 99999 })}
    </AbsoluteFill>
  );
};
