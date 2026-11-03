// ══ BANKERS CLONE of Style 3 Video 26 — the Bankers pass applied (Bankers/CLAUDE.md §2): greys → the blue
// family by Resources/apply-palette.mjs, every face Anton 400, the outro carries the Bankers logo.

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { theme, LAYOUT, MOTION } from "./theme";
import { rOut, rInOut, drift2, breathe, alpha, clamp01 } from "./anim";

// ══════════════════════════════════════════════════════════════════════════════════════════════
// STYLE 3 — THE STAGE: the field, the light, the floor, and the camera.
//
// Measured from the ten references:
//   • the field is TRUE BLACK with a soft RADIAL LIFT where the key light sits (never flat grey)
//   • a GREEN volumetric key light is present in 9/10 videos — a soft cone, not a hard beam
//   • objects sit on a MIRROR FLOOR: a vertically-flipped, blurred, fading copy of the object
//   • the camera NEVER stops: a slow push plus two unrelated sine drifts per axis
// ══════════════════════════════════════════════════════════════════════════════════════════════

/** THE FIELD — true black + a radial lift toward the key light. Optionally the light stage. */
export const Field: React.FC<{ light?: number; lightX?: number; lightY?: number }> = ({
  light = 0, lightX = 30, lightY = 12,
}) => {
  const f = useCurrentFrame();
  // the lift breathes very slightly so even an empty frame is alive
  const b = 1 + breathe(f, 220, 0.06);
  const dark = (
    <AbsoluteFill
      style={{
        background:
          `radial-gradient(120% 80% at ${lightX}% ${lightY}%, ${alpha(theme.bgLift, 0.95 * b)} 0%, ${alpha(theme.bg, 0.6)} 32%, ${theme.bg} 68%)` /* BANKERS: the mid-stop is the navy ground, not near-black */,
      }}
    />
  );
  if (light <= 0.001) return dark;
  return (
    <>
      {dark}
      <AbsoluteFill
        style={{
          opacity: light,
          background:
            `radial-gradient(120% 80% at ${lightX}% ${lightY}%, ${theme.bgLightLift} 0%, ${theme.bgLight} 55%)`,
        }}
      />
    </>
  );
};

/** the faint blueprint grid a few dark sections carry (measured barely-there, ~4.5% white) */
export const Grid: React.FC<{ at?: number; cell?: number }> = ({ at = 0, cell = 132 }) => {
  const f = useCurrentFrame();
  const on = rOut(f, at, at + 40) * 0.9;
  if (on <= 0.001) return null;
  return (
    <AbsoluteFill
      style={{
        opacity: on,
        backgroundImage:
          `linear-gradient(${theme.grid} 1px, transparent 1px), linear-gradient(90deg, ${theme.grid} 1px, transparent 1px)`,
        backgroundSize: `${cell}px ${cell}px`,
        maskImage: "radial-gradient(75% 60% at 50% 55%, #000000 0%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(75% 60% at 50% 55%, #000000 0%, transparent 100%)",
      }}
    />
  );
};

/** ★ THE VOLUMETRIC KEY LIGHT — a soft green cone from off-frame. The signature of the style.
 *  Not a hard beam: a wide, heavily-blurred wedge that drifts and pulses. */
export const KeyLight: React.FC<{
  at?: number; x?: number; y?: number; angle?: number; len?: number; spread?: number;
  colour?: string; strength?: number;
}> = ({ at = 0, x = 180, y = -160, angle = 28, len = 1900, spread = 460, colour = theme.accent, strength = 1 }) => {
  const f = useCurrentFrame();
  const on = rOut(f, at, at + MOTION.sweepFrames);
  if (on <= 0.001) return null;
  // the cone lives, always: a slow sway plus a pulse in intensity
  const sway = drift2(f, 260, 121, 2.2);
  const pulse = 0.82 + 0.18 * (0.5 + 0.5 * Math.sin((f / 96) * Math.PI * 2));
  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: spread,
          height: len,
          transformOrigin: "50% 0%",
          transform: `rotate(${(angle + sway).toFixed(2)}deg)`,
          opacity: on * strength * pulse,
          background: `linear-gradient(to bottom, ${alpha(colour, 0.5)} 0%, ${alpha(colour, 0.18)} 34%, ${alpha(colour, 0.04)} 68%, transparent 100%)`,
          filter: "blur(58px)",
          mixBlendMode: "screen",
        }}
      />
      {/* the hot core of the source */}
      <div
        style={{
          position: "absolute",
          left: x + spread / 2 - 190,
          top: y + 40,
          width: 380,
          height: 380,
          borderRadius: "50%",
          opacity: on * strength * pulse * 0.9,
          background: `radial-gradient(circle, ${alpha(colour, 0.55)} 0%, ${alpha(colour, 0.12)} 45%, transparent 70%)`,
          filter: "blur(30px)",
          mixBlendMode: "screen",
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * ★ THE MIRROR FLOOR — every object stands on its own reflection. Flip, blur, fade.
 * Wrap the object; the reflection is generated from the SAME children so it can never drift.
 *
 * ⚠ THE MASK MUST BE ANCHORED TO THE MIRROR LINE, NOT TO THE FRAME (fixed 2026-08-09f). The first
 * version used `linear-gradient(to top, transparent 0px, #000000 <height>px)` — measured from the
 * BOTTOM OF THE FRAME, i.e. the fade landed at y≈1770–1920, hundreds of px away from any object.
 * The practical effect was that reflections had NO distance falloff at all: every mirrored object
 * was a uniform 18% ghost stretching the full height of the frame, and the hook's coin was sitting
 * as a visible phantom directly behind the "0.38%" and "22%" stats.
 *
 * The reflection is drawn by `scaleY(-1) translateY(-2y)` about the top edge, which maps a local
 * point `p` to screen `2y − p`. So a fade from opaque at local `y` to transparent at local
 * `y − height` is a fade from opaque AT the mirror line to transparent `height` px BELOW it —
 * which is what a floor actually does.
 */
export const Reflect: React.FC<{
  y: number; height?: number; opacity?: number; blur?: number; children: React.ReactNode;
}> = ({ y, height = 420, opacity = 0.26, blur = 7, children }) => {
  const mask =
    `linear-gradient(to bottom, transparent ${y - height}px, rgba(0,0,0,0.45) ${y - height * 0.45}px, #000000 ${y}px)`;
  return (
    <>
      {children}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          transform: `scaleY(-1) translateY(${-2 * y}px)`,
          transformOrigin: "50% 0%",
          opacity,
          filter: `blur(${blur}px)`,
          maskImage: mask,
          WebkitMaskImage: mask,
          pointerEvents: "none",
        }}
      >
        {children}
      </div>
    </>
  );
};

/** the floor itself — a whisper of a horizon line where the mirror begins */
export const FloorLine: React.FC<{ y?: number; at?: number; colour?: string }> = ({
  y = LAYOUT.floorY, at = 0, colour = theme.accent,
}) => {
  const f = useCurrentFrame();
  const on = rOut(f, at, at + 40);
  if (on <= 0.001) return null;
  return (
    <div
      style={{
        position: "absolute", left: 0, right: 0, top: y, height: 2, opacity: on * 0.5,
        background: `linear-gradient(to right, transparent 0%, ${alpha(colour, 0.5)} 30%, ${alpha("#ffffff", 0.55)} 50%, ${alpha(colour, 0.5)} 70%, transparent 100%)`,
        filter: "blur(0.5px)",
      }}
    />
  );
};

/** ★ THE CAMERA — it never stops. A slow push across the shot + two unrelated sines per axis.
 *  Wraps the OBJECT layer only; the caption is pinned (moving subtitles read as broken). */
export const Camera: React.FC<{
  from?: number; to?: number; push?: number; children: React.ReactNode;
}> = ({ from = 0, to = 300, push = MOTION.pushPerSection, children }) => {
  const f = useCurrentFrame();
  const p = rInOut(f, from, to);
  const dx = drift2(f, MOTION.periodX, 83, MOTION.driftX);
  const dy = drift2(f, MOTION.periodY, 67, MOTION.driftY);
  const zoom = 1 + push * p + breathe(f, 190, 0.004);
  return (
    <AbsoluteFill
      style={{
        transform: `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) scale(${zoom.toFixed(4)})`,
        transformOrigin: "50% 52%",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** a soft coloured pool of light on the floor under an object */
export const Pool: React.FC<{
  x: number; y: number; w?: number; h?: number; colour?: string; at?: number; strength?: number;
}> = ({ x, y, w = 520, h = 130, colour = theme.accent, at = 0, strength = 1 }) => {
  const f = useCurrentFrame();
  const on = rOut(f, at, at + 30) * strength * (0.85 + 0.15 * (0.5 + 0.5 * Math.sin(f / 74)));
  if (on <= 0.001) return null;
  return (
    <div
      style={{
        position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h,
        borderRadius: "50%", opacity: clamp01(on),
        background: `radial-gradient(ellipse, ${alpha(colour, 0.65)} 0%, ${alpha(colour, 0.16)} 45%, transparent 72%)`,
        filter: "blur(26px)", mixBlendMode: "screen", pointerEvents: "none",
      }}
    />
  );
};
