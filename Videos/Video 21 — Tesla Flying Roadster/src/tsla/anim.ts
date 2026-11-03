// ══ BANKERS CLONE of Style 3 Video 26 — the Bankers pass applied (Bankers/CLAUDE.md §2): greys → the blue
// family by Resources/apply-palette.mjs, every face Anton 400, the outro carries the Bankers logo.

import { interpolate, Easing } from "remotion";

// ══════════════════════════════════════════════════════════════════════════════════════════════
// STYLE 3 EASING
//
// ★ MEASURED CHARACTER: this style never snaps and never stops. Frame-differencing the corpus at
// 30fps gives a mean per-frame change of 0.77–6.09/255 with as few as 0/89 "still" frames in a
// 3-second window — the camera drifts, objects rotate and breathe, light sweeps, CONTINUOUSLY.
// So the curves here are soft on BOTH ends (nothing arrives hard), and every settled element
// still carries an idle motion on top.
//
// Three curves, deliberately not unified:
//   • entrances / reveals -> EASE-OUT, long asymptotic settle, no overshoot
//   • travel / camera     -> EASE-IN-OUT, symmetric, for A→B moves that start and end at rest
//   • exits               -> EASE-IN, accelerating away (objects leave frame, they don't fade)
// ══════════════════════════════════════════════════════════════════════════════════════════════

/** entrances, reveals, fills — quick off the mark, long gentle settle */
export const OUT = Easing.bezier(0.17, 0.84, 0.28, 1);
/** camera travel and A→B object moves — symmetric, rest to rest */
export const INOUT = Easing.bezier(0.45, 0.05, 0.35, 1);
/** exits — accelerate away */
export const IN = Easing.bezier(0.55, 0, 0.9, 0.45);

const clampOpts = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const rOut = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], { ...clampOpts, easing: OUT });
export const rInOut = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], { ...clampOpts, easing: INOUT });
export const rIn = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], { ...clampOpts, easing: IN });
export const rLin = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], clampOpts);

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const mix = (a: number, b: number, t: number) => a + (b - a) * clamp01(t);

/** a window: fades in, holds, fades out — for elements that hand over inside one continuous shot */
export const win = (f: number, a: number, e: number, inF = 22, outF = 16) =>
  rOut(f, a, a + inF) * (1 - rIn(f, e - outF, e));

/** ★ the IDLE life every settled element carries — a plain sine, never a curve (a periodic move
 *  driven through an ease curve whips through the middle and stalls at the turns = turbulence). */
export const breathe = (f: number, period = 128, amp = 1) => Math.sin((f / period) * Math.PI * 2) * amp;

/** two unrelated sines, so a drift never settles into an obvious back-and-forth */
export const drift2 = (f: number, p1: number, p2: number, a1: number, a2 = a1 * 0.35) =>
  Math.sin((f / p1) * Math.PI * 2) * a1 + Math.sin((f / p2) * Math.PI * 2) * a2;

/** hex → rgba string, for glows built off a token */
export const alpha = (hex: string, a: number) => {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

/** continuous colour blend — never flip a colour on a threshold (that reads as a snap) */
export const mixHex = (a: string, b: string, t: number) => {
  const p = (h: string) => {
    const s = h.replace("#", "");
    const n = parseInt(s.length === 3 ? s.split("").map((c) => c + c).join("") : s, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const [r1, g1, b1] = p(a), [r2, g2, b2] = p(b);
  const k = clamp01(t);
  const c = (x: number, y: number) => Math.round(x + (y - x) * k).toString(16).padStart(2, "0");
  return `#${c(r1, r2)}${c(g1, g2)}${c(b1, b2)}`;
};
