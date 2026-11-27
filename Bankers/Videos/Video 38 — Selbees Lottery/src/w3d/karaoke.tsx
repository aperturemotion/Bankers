// @ts-nocheck
// ★ rev 6 (Timur, 2026-11-27): "take the subtitles and change them back to the version that we had on the original Bankers style, but just at
//   the bottom. Maybe with a slight like black fade out in the background, but a smooth one, a slight one, subtle one."
//   = Video 1–37's WordCaption (src/bnx/text.tsx): each caption chunk appears WHOLE on its first word, Figtree 400 at 50 px, white, tracking 0,
//   centred, no pill, no keyword box, no text shadow — placed low (centre y 1500), over a soft full-width black gradient at the foot of the frame.
import React from "react";
import { useCurrentFrame } from "remotion";
import { ease } from "./kit";
import { BODY } from "./fonts3d";

export const CAPTION_Y = 1500;
export const Karaoke = ({ chips, cy = CAPTION_Y, size = 50, maxW = 860, hideFrom = 1e9 }) => {
  const f = useCurrentFrame();
  const shade = 1 - ease(f, hideFrom - 10, hideFrom + 10);
  const c = f < hideFrom ? chips.find((q) => f >= q.at && f < q.until) : null;
  return (
    <>
      {/* the subtle black fade at the bottom: transparent at y 1150, ~40 % black at the frame's foot */}
      {shade > 0.001 && <div style={{ position: "absolute", left: 0, top: 1150, width: 1080, height: 770, pointerEvents: "none", opacity: shade,
        background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.16) 38%, rgba(0,0,0,0.34) 72%, rgba(0,0,0,0.42) 100%)" }} />}
      {c && (
        <div style={{ position: "absolute", left: (1080 - maxW) / 2, width: maxW, top: cy, transform: "translateY(-50%)", textAlign: "center", pointerEvents: "none",
          fontFamily: BODY, fontWeight: 400, fontSize: size, lineHeight: 1.22, letterSpacing: 0, color: "#FFFFFF" }}>
          {c.parts.map((p) => p.word).join(" ")}
        </div>
      )}
    </>
  );
};
