// ══ BANKERS CLONE of Style 3 Video 26 — the Bankers pass applied (Bankers/CLAUDE.md §2): greys → the blue
// family by Resources/apply-palette.mjs, every face Anton 400, the outro carries the Bankers logo.

// (the bullion bar, stacks and flag chips are not ported — the demo does not use them)
import React from "react";
import { useCurrentFrame } from "remotion";
import { SHOUT } from "./fonts";
import { rInOut, alpha, mixHex } from "./anim";

// ══════════════════════════════════════════════════════════════════════════════════════════════
// THE SHARED KIT — the primitives every beat draws with.
//
// ⚠ THESE ARE PRIMITIVES, NOT SCENES. A bar is a bar, exactly as `Slab` is shared across V9/V10.
// If you want a whole beat in here, it belongs in beats.tsx instead.
// ══════════════════════════════════════════════════════════════════════════════════════════════

// ★★★ ONE ON-SCREEN FACE — THE HOOK'S (user, 2026-08-30: "change the 6331 tons font to the same
// one as the one in the beginning of the video (hook). Same with all the other on screen texts
// (that doesn't include the subtitles. Leave them the way they are)").
//
// So every one of these three helpers is now SHOUT/Anton — the banner's face. They keep their
// distinct JOBS (hero figure · small readout · uppercase caption) and stay separated by SIZE,
// COLOUR and TRACKING instead of by family. ⚠ SUBTITLES ARE UNTOUCHED: WordCaption and
// HeroSentence in text.tsx keep VOICE/Figtree — that separation is the point, since the
// narrated line and the built graphic must not read as the same layer.
// ⚠ AND THE BRAND LOCKUP IS UNTOUCHED: BrandClose's "Style 3" is fixed channel branding, byte
// -identical across V9/V10/V11 — changing it here would break the thing this note is protecting.

/** a HERO FIGURE — the big spoken number ("6,331 TONS", "2022", "$300B", "95%") */
export const figure = (size: number, color = "#EEF5FB"): React.CSSProperties => ({
  fontFamily: SHOUT, fontWeight: 400, fontSize: size,
  letterSpacing: size >= 90 ? -2 : -1, color, whiteSpace: "nowrap", lineHeight: 1,
});
/** a SMALL READOUT — axis values, plate numbers, tick labels. Same face, quieter tracking. */
export const mono = (size: number, color = "#DEEAF8"): React.CSSProperties => ({
  fontFamily: SHOUT, fontWeight: 400, fontSize: size, letterSpacing: 0.5, color,
  whiteSpace: "nowrap", lineHeight: 1,
});
/** a CAPTION under an object — uppercase, dim, wide-tracked */
export const label = (size: number, color = "#5795DB"): React.CSSProperties => ({
  fontFamily: SHOUT, fontWeight: 400, fontSize: size, letterSpacing: 1.5,
  color, whiteSpace: "nowrap", lineHeight: 1, textTransform: "uppercase",
});

/** the slow arc that keeps an extrusion legible (rule 34) */
export const Turn: React.FC<{
  at: number; end: number; from?: number; to?: number;
  tilt?: number; tiltTo?: number; amp?: number; period?: number; persp?: number;
  children: React.ReactNode;
}> = ({
  at, end, from = -15, to = 6, tilt = 0, tiltTo, amp = 2.6, period = 250, persp = 1800, children,
}) => {
  const f = useCurrentFrame();
  const p = rInOut(f, at, end);
  const yaw0 = from + (to - from) * p + amp * Math.sin((f - at) / period * Math.PI * 2);
  // never exactly 0.00°: a purely 2-D transform snaps the subtree a pixel for one frame (root CLAUDE.md, Style 3 V33)
  const yaw = Math.abs(yaw0) < 0.06 ? (yaw0 < 0 ? -0.06 : 0.06) : yaw0;
  const pitch = tilt + ((tiltTo ?? tilt) - tilt) * p;
  // ★ FLAT, never preserve-3d (Timur, 2026-10-15: "the business and clients and buybacks text glitches at 41 seconds", "the dollar signs
  // glitch at 21 seconds", "this only applies to the rendered version"). Inside a preserve-3d Turn, the headless render mis-draws SVG
  // text once the place's depth-of-field blur (a CSS filter on the layer above) switches on: BUYBACKS jumped ~75 px up out of its tray
  // and BUSINESS & CLIENTS vanished on the exit's first blurred frame (f1253); the coin stacks' "$" marks vanished the same way (f677).
  // The Studio's GPU compositor draws it right, so only the MP4 showed it. Flat, the Turn still swings in perspective, its children paint
  // in DOM order, and every 3-D object already carries its own rig inside a flat wrapper (rig.tsx).
  // ★ Flat alone did NOT fix it: the mis-draw needs the tab to have drawn the place's EARLIER frames (a run from f1200 broke f1253; one
  // from f1246 did not; a fresh still never does). So the Turn's contents are a NEW DOM every frame (key = frame): every frame is drawn
  // the way a fresh still draws it. Nothing inside a Turn keeps state across frames (no useState/effects/Img), so nothing is lost.
  return (
    <div style={{ position: "absolute", inset: 0, perspective: persp }}>
      <div key={f} style={{
        position: "absolute", inset: 0, transformStyle: "flat",
        transform: `rotateX(${pitch.toFixed(2)}deg) rotateY(${yaw.toFixed(2)}deg)`,
      }}>{children}</div>
    </div>
  );
};

