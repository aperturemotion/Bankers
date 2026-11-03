import React from "react";
import { AbsoluteFill, Freeze } from "remotion";
import { Field, KeyLight } from "./stage";
import { theme } from "./theme";
import "./fonts";
import { RV_CUES, TL_CUES, UN_CUES, T0 } from "./places/registry";
import { Revenue, revenueTimes } from "./places/revenue";
import { Timeline, timelineTimes } from "./places/timeline";
import { Unsigned, unsignedTimes } from "./places/unsigned";

// ══════════════════════════════════════════════════════════════════════════════════════════════
// THE WHITE LAB (2026-10-30) — not part of the film. Renders teachA (Revenue), honestB (Timeline) and honestC (Unsigned) with the cue props
// registry.tsx gives them, over the stage at `light` (0 navy … 1 the white stage), frozen at one frame of the film (`at`, absolute; default:
// the place's last action + 24 f, i.e. settled). No camera. `node scratchpad/whitelab.mjs` stills it (never an MP4).
// ══════════════════════════════════════════════════════════════════════════════════════════════

export type WhitePiece = "teachA" | "honestB" | "honestC";
export const WHITE_SETTLED: Record<WhitePiece, number> = {
  teachA: revenueTimes({ ...RV_CUES, end: 0 }).done + 24,
  honestB: timelineTimes({ ...TL_CUES, end: 0 }).done + 24,
  honestC: unsignedTimes({ ...UN_CUES, end: 0 }).done + 24,
};

export const WhiteLab: React.FC<{ piece?: WhitePiece; light?: number; at?: number }> = ({ piece = "teachA", light = 1, at }) => {
  const frame = at ?? WHITE_SETTLED[piece];
  const end = (T0 as Record<string, number>)[piece] + 300;
  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg, overflow: "hidden" }}>
      <Freeze frame={frame}>
        <Field light={light} lightX={30} lightY={12} />
        <KeyLight at={-100} x={280} y={-270} angle={16} len={2200} spread={520} strength={0.35 * (1 - light)} />
        {piece === "teachA" && <Revenue {...RV_CUES} end={end} light={light} />}
        {piece === "honestB" && <Timeline {...TL_CUES} end={end} light={light} />}
        {piece === "honestC" && <Unsigned {...UN_CUES} end={end} light={light} />}
      </Freeze>
    </AbsoluteFill>
  );
};
