// ══ BANKERS CLONE of Style 3 Video 26 — the Bankers pass applied (Bankers/CLAUDE.md §2): greys → the blue
// family by Resources/apply-palette.mjs, every face Anton 400, the outro carries the Bankers logo.

import React from "react";
import { useCurrentFrame } from "remotion";
import { theme, TYPE, LAYOUT } from "./theme";
import { VOICE, SHOUT, SHOUT_SQUEEZE, ACCENT, DISPLAY_TEXT, SUBTITLE_IS_ANTON } from "./fonts";
import { rOut, rIn, rInOut, breathe, clamp01, mixHex } from "./anim";

// ══════════════════════════════════════════════════════════════════════════════════════════════
// STYLE 3 TEXT — measured, and the negative findings matter as much as the positive ones.
//
// ★★ TYPE IS COMPLETELY FLAT. Three independent analyses sampled the pixels around every text
// element and found the field value unchanged 0–26px away: NO glow, NO stroke, NO drop shadow,
// NO plate, 100% opaque. A 255→background transition inside 1–2px of anti-aliasing. This is the
// opposite of Style 1's glowing type and it is a big part of why Style 3 reads as *design*
// rather than as motion-graphics. Do not add a text-shadow to anything here.
//
// ★★ TWO CAPTION MODES, MUTUALLY EXCLUSIVE IN TIME:
//   MODE 1 — ONE WORD, pinned. Dead centre (x=360 @720, measured 358–360.5), a FIXED baseline
//            that never moves within a video. Median hold 9 frames (0.30s). The word is REPLACED,
//            never accumulated, and the slot genuinely EMPTIES during speech pauses.
//   MODE 2 — HERO SENTENCE, centred mid-frame, built word by word, each word arriving oversized,
//            blurred and transparent and settling. While a hero sentence builds, MODE 1 is OFF.
//
// ★ Emphasis is by WEIGHT and SIZE inside the line (a measured 1.6× jump), never by colour.
// ══════════════════════════════════════════════════════════════════════════════════════════════

export type Word = {
  word: string; at: number; until?: number;
  /** ★ the chip's own words with their spoken frames — present on every chip the generator
   *  emits, and what the hook's word-by-word build reads. Optional so a hand-built Word still
   *  type-checks. ⚠ THIS SHAPE MUST TRACK captions.ts's Word: it is declared here too because
   *  text.tsx is the shared kit and does not import the per-video caption module. */
  parts?: { word: string; at: number }[];
};

/** ★ MODE 1 — the one-word caption. Pinned, flat, replaced not accumulated, empties on pauses. */
export const WordCaption: React.FC<{
  words: Word[]; y?: number; size?: number; onLight?: number;
  /** the references split: some hard-swap in one frame, some cross a 4-frame fade. 0 = hard. */
  fade?: number;
}> = ({ words, y = LAYOUT.captionY, size = TYPE.captionSize, onLight = 0, fade = 0 }) => {
  const f = useCurrentFrame();
  // find the word live NOW — words do not accumulate, and a gap means an empty slot
  const cur = words.find((w, i) => {
    const end = w.until ?? words[i + 1]?.at ?? Infinity;
    return f >= w.at && f < end;
  });
  if (!cur) return null;
  const a = fade > 0 ? rOut(f, cur.at, cur.at + fade) : 1;
  const col = mixHex("#ffffff", theme.textOnLight, clamp01(onLight));
  return (
    <div
      style={{
        position: "absolute", left: 0, width: "100%", top: y,
        transform: "translateY(-50%)", textAlign: "center",
        fontFamily: VOICE, fontWeight: 400, fontSize: size,
        letterSpacing: TYPE.trackingCaption, color: col, opacity: a,
        // ★ deliberately NO textShadow — measured flat
      }}
    >
      {cur.word}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════════════════════
// ★★ THE HERO LADDER (user note, 2026-08-09f): "whenever there's a scene where there is only text
// appearing on the screen I need you to add that little scale effect to the text where the words
// above are smaller and the ones at the bottom are bigger."
//
// So a hero sentence is no longer set at ONE size — it is set as a LADDER, growing line by line
// down the block. That needs real line breaking, because the ladder is per LINE, not per word, and
// the browser's own wrapping is invisible to us. Everything below is that: a deterministic
// width estimator, a greedy wrap, and a fit pass.
//
// ⚠ The ladder and the wrap are CIRCULAR — the sizes decide the breaks and the breaks decide how
// many rungs the ladder has. Resolved by iterating: wrap at a uniform size to guess the line count,
// build the ladder for that count, re-wrap with the per-line sizes, and repeat while the count
// moves (bounded). Then any line still over the column is shrunk to fit, so this can never push
// type off frame no matter what sentence the VO delivers.
// ══════════════════════════════════════════════════════════════════════════════════════════════

/** the ladder's first and last rung, as a multiple of the nominal size (mean ≈ 1.0) */
const LADDER_LO = 0.84;
const LADDER_HI = 1.2;
/** emphasis is now WEIGHT plus a small bump — the ladder already carries the size story */
const EMPH_SIZE = 1.15;
/** ★ the ACCENT word (user rules 2026-08-13d): the ONE word in a line that lands hardest — set
 *  in the serif italic at a real SCALE JUMP, optionally carrying a colour gradient. Sparingly:
 *  at most one per sentence, only where the meaning earns it. */
const ACCENT_SIZE = 1.32;
/** width multiplier for an accent word in the estimator — the serif italic is narrower per em
 *  than Figtree, so the 1.32× scale nets out around 1.18× the advance */
const ACCENT_ADV = 1.18;
export type AccentTone = "red" | "accent" | "white";
const ACCENT_GRADS: Record<AccentTone, string | null> = {
  red: "linear-gradient(175deg, #ff6a5e 8%, #ef2b3d 52%, #99101f 96%)",
  // ★ V9's accent gradient is a POLISHED-METAL ramp, not a hue: bright specular at the top,
  // the platinum token through the middle, a cold graphite foot. On a neutral palette the
  // gradient has to do its work with value alone, so the spread is much wider than the green
  // one's was — a narrow neutral ramp just reads as flat grey type.
  accent: `linear-gradient(175deg, #ffffff 6%, ${theme.accentBright} 30%, ${theme.accent} 62%, #1D70CE 96%)`,
  white: null,
};

/** per-character advance in em for Figtree at weight 500 — good to a few percent, which is all
 *  the fit pass needs (it only has to know when a line is close to the column edge) */
const ADV: Record<string, number> = {
  " ": 0.28, i: 0.26, l: 0.26, j: 0.26, I: 0.28, t: 0.36, f: 0.34, r: 0.38,
  ".": 0.28, ",": 0.28, "'": 0.2, "’": 0.2, "!": 0.28, ":": 0.28, ";": 0.28, "?": 0.5,
  m: 0.87, w: 0.76, M: 0.86, W: 0.88, "%": 0.85, "$": 0.58, "-": 0.36,
};
const advance = (c: string) => {
  const a = ADV[c];
  if (a !== undefined) return a;
  if (c >= "0" && c <= "9") return 0.58;
  if (c >= "A" && c <= "Z") return 0.66;
  return 0.55;
};
const textW = (s: string, size: number) =>
  [...s].reduce((a, c) => a + advance(c), 0) * size;

/** the rung multiplier for line `i` of `n` */
const rung = (i: number, n: number) =>
  n <= 1 ? 1 : LADDER_LO + (LADDER_HI - LADDER_LO) * (i / (n - 1));

type Line = { idx: number[]; size: number };

/** greedy wrap where line `i` is set at `size * rung(i, n)` — `mul(j)` is word j's advance
 *  multiplier (1 for a plain word, EMPH_SIZE for emphasis, ACCENT_ADV for an accent word) */
const wrapAt = (words: Word[], size: number, n: number, mul: (j: number) => number, colW: number): Line[] => {
  const lines: Line[] = [];
  let cur: number[] = [];
  let curW = 0;
  const sizeOf = (li: number) => size * rung(Math.min(li, Math.max(n - 1, 0)), n);
  for (let i = 0; i < words.length; i++) {
    const ls = sizeOf(lines.length);
    const ws = textW(words[i].word, ls * mul(i));
    const gap = cur.length ? ls * 0.3 : 0;
    if (cur.length && curW + gap + ws > colW) {
      lines.push({ idx: cur, size: ls });
      cur = [i];
      curW = textW(words[i].word, sizeOf(lines.length) * mul(i));
    } else {
      cur.push(i);
      curW += gap + ws;
    }
  }
  if (cur.length) lines.push({ idx: cur, size: sizeOf(lines.length) });
  return lines;
};

const layoutHero = (words: Word[], size: number, mul: (j: number) => number, colW: number): Line[] => {
  let n = wrapAt(words, size, 1, mul, colW).length;
  let lines = wrapAt(words, size, n, mul, colW);
  for (let k = 0; k < 4 && lines.length !== n; k++) {
    n = lines.length;
    lines = wrapAt(words, size, n, mul, colW);
  }
  // re-stamp each line's size against the FINAL count, then shrink any line that still overruns
  return lines.map((ln, i) => {
    let s = size * rung(i, lines.length);
    const w = ln.idx.reduce(
      (a, j, k) => a + (k ? s * 0.3 : 0) + textW(words[j].word, s * mul(j)),
      0,
    );
    if (w > colW) s *= colW / w;
    return { idx: ln.idx, size: s };
  });
};

/** ★ MODE 2 — the hero sentence. Words arrive OVERSIZED + BLURRED + TRANSPARENT and settle;
 *  the whole block keeps easing down for ~0.9s after the last word (measured 11% overshoot),
 *  and the lines grow down the ladder. */
export const HeroSentence: React.FC<{
  words: Word[]; y?: number; size?: number; end?: number; onLight?: number;
  /** the frame this block may START painting — the generator computes it so it can never share a
   *  frame with the previous caption (variable lead: it shrinks when the VO runs sentences
   *  together). Falls back to first-word − 4. */
  paint?: number;
  /** indices of words set in the emphasis weight (measured device: weight + a size bump) */
  emph?: number[];
  /** ★ the ONE accent word (serif italic + scale jump + optional gradient) — index + tone */
  accent?: { i: number; tone: AccentTone };
  /** ★ DISPLAY TREATMENT — the sentence is set in the display face instead of the voice face.
   *  Used for the one line the video is built to land on. Text and timing are untouched; only
   *  the type changes, so the stage can be cleared and the words themselves are the visual. */
  display?: boolean;
}> = ({ words, y = LAYOUT.heroY, size = TYPE.heroSize, end, onLight = 0, paint, emph = [], accent, display = false }) => {
  const f = useCurrentFrame();
  const first = words[0]?.at ?? 0;
  const last = words[words.length - 1]?.at ?? first;
  if (f < (paint ?? first - 4)) return null;
  // a 9f exit, not 14 — the corpus CUTS the pushed line hard; the shorter fade both reads closer
  // to that and stops the fade eating the hold of tightly-packed sentences
  const out = end !== undefined ? 1 - rIn(f, end - 9, end) : 1;
  if (out <= 0.001) return null;
  const col = mixHex("#ffffff", theme.textOnLight, clamp01(onLight));
  // ★ the display face is materially wider per em than the voice face, and `mul` feeds BOTH the
  // wrap and the max-scale cap — without this the display line overruns the column and the
  // push then scales the overrun up (measured: "And the story won." spilled off frame).
  const DISPLAY_ADV = 1.24;
  const mul = (j: number) =>
    (accent?.i === j ? ACCENT_ADV : emph.includes(j) ? EMPH_SIZE : 1) * (display ? DISPLAY_ADV : 1);
  const lines = layoutHero(words, size, mul, LAYOUT.colW);
  // ★ after the last word settles the whole block keeps SCALING UP and is then cut — measured
  // ~1.5× over ~28 frames ("the line rushes past the lens"). REAL, but it must never push type
  // off frame (user note: "every trading day has two parts" clipped): the push is capped so the
  // widest line × scale stays inside the frame with a 45px margin each side.
  const lineW = (ln: { idx: number[]; size: number }) =>
    ln.idx.reduce((a, j, k) => a + (k ? ln.size * 0.3 : 0) +
      textW(words[j].word, ln.size * mul(j)), 0);
  const maxW = Math.max(1, ...lines.map(lineW));
  const maxScale = Math.min(1.42, (LAYOUT.W - 90) / maxW);
  const push = rOut(f, last + 12, last + 44);
  const scale = 1 + (maxScale - 1) * push;
  return (
    <div
      style={{
        position: "absolute", left: (LAYOUT.W - LAYOUT.colW) / 2, width: LAYOUT.colW, top: y,
        transform: `translateY(-50%) scale(${scale.toFixed(4)})`, transformOrigin: "50% 50%",
        textAlign: "center", fontFamily: display ? DISPLAY_TEXT : VOICE,
        fontWeight: SUBTITLE_IS_ANTON ? 400 : display ? 700 : undefined, letterSpacing: display ? -2 : undefined,
        color: col, opacity: out,
      }}
    >
      {/* ⚠ EVERY LINE HOLDS ITS SLOT FROM FRAME ONE. A word that has not arrived yet renders null,
          so without a minHeight the second line has ZERO height until its first word lands — and
          the moment it does, the block grows and `translateY(-50%)` re-centres it, jumping every
          line already on screen up by half a line in ONE frame. A layout change is not an
          animation; no easing can rescue it. The line boxes are therefore reserved up front and
          the words fill into them. */}
      {lines.map((ln, li) => (
        <div key={li} style={{
          fontSize: ln.size, lineHeight: TYPE.lineHeight, whiteSpace: "nowrap",
          minHeight: ln.size * TYPE.lineHeight,
        }}>
          {ln.idx.map((i, k) => {
            const w = words[i];
            // ★ THE FLY-THROUGH-THE-LENS ENTRANCE — the most identifiable motion in the style.
            // Measured (v05, the word "nobody"): arrives at ≈2.0× scale, ≈18% opacity and a ≈13px
            // Gaussian blur AT ITS FINAL LAYOUT POSITION, then shrinks and sharpens over ~12 frames.
            const p = rOut(f, w.at, w.at + 13);
            // ⚠ A NOT-YET-ARRIVED WORD IS RENDERED, AT ZERO OPACITY — never removed. The line is
            // centred, so if unarrived words are absent the line centres the arrived ones and
            // every word already on screen SLIDES LEFT as the next one lands. That is a reflow,
            // not an animation, and it contradicts the measured behaviour: a word arrives AT ITS
            // FINAL LAYOUT POSITION and resolves in place. Keeping the span reserves its metrics.
            const isE = emph.includes(i);
            const isA = accent?.i === i;
            const grad = isA ? ACCENT_GRADS[accent!.tone] : null;
            // (the reference measures 2.0×; we use 1.6× because a word scaling about its own centre
            // spills into its neighbours, and at 2.0× that reads as a missing space rather than motion)
            const s = 1.6 - 0.6 * p;
            const blur = (1 - p) * 13;
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  fontFamily: isA ? ACCENT : undefined,
                  fontStyle: isA && !SUBTITLE_IS_ANTON ? "italic" : undefined, // Anton has no italic
                  fontWeight: SUBTITLE_IS_ANTON ? 400 : isA ? 400 : isE ? 800 : 500,
                  fontSize: isA ? `${ACCENT_SIZE}em` : isE ? "1.15em" : undefined,
                  // the accent word may carry a gradient — background-clipped so it stays flat
                  ...(grad
                    ? { background: grad, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }
                    : {}),
                  // the 18% floor itself fades up over 3 frames, so the word does not pop from
                  // nothing to 18% in a single frame on arrival
                  opacity: (0.18 + 0.82 * p) * clamp01((f - w.at + 3) / 3),
                  transform: `scale(${s.toFixed(3)})`,
                  filter: blur > 0.15 && f >= w.at - 3 ? `blur(${blur.toFixed(2)}px)` : undefined,
                  // ★ the word gap must be a real margin — a whitespace text node between
                  // inline-blocks collapses away and the sentence runs together
                  marginRight: k < ln.idx.length - 1 ? ln.size * 0.3 : 0,
                }}
              >
                {w.word}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** ★ THE SHOUT — the one ultra-condensed display line per video. Near full-bleed, heavy, flat. */
export const Shout: React.FC<{
  text: string; at?: number; y?: number; size?: number; end?: number; onLight?: number;
  /** the references wipe it on left→right over ~12–15 frames */
  wipe?: boolean;
}> = ({ text, at = 0, y = 620, size = TYPE.shoutSize, end, onLight = 0, wipe = true }) => {
  const f = useCurrentFrame();
  const p = rOut(f, at, at + 14);
  if (p <= 0.001) return null;
  const out = end !== undefined ? 1 - rIn(f, end - 12, end) : 1;
  if (out <= 0.001) return null;
  // it is under the same continuous push as everything else
  const grow = 1 + 0.05 * rInOut(f, at, at + 150);
  const col = mixHex("#ffffff", theme.textOnLight, clamp01(onLight));
  return (
    <div
      style={{
        position: "absolute", left: 0, width: "100%", top: y,
        transform: `translateY(-50%) scale(${grow.toFixed(4)})`, textAlign: "center",
        opacity: out, overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "inline-block",
          fontFamily: SHOUT, fontWeight: 400, fontSize: size, lineHeight: 0.92,
          color: col, textTransform: "uppercase",
          transform: `scaleX(${SHOUT_SQUEEZE})`,
          clipPath: wipe ? `inset(0 ${((1 - p) * 100).toFixed(1)}% 0 0)` : undefined,
          whiteSpace: "pre-line",
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** an editor kicker/headline — the mixed-weight line where ONE word is bold (measured device) */
export const Kicker: React.FC<{
  parts: { t: string; bold?: boolean }[]; at?: number; y?: number; size?: number; end?: number;
  onLight?: number;
}> = ({ parts, at = 0, y = 560, size = TYPE.kickerSize, end, onLight = 0 }) => {
  const f = useCurrentFrame();
  const p = rOut(f, at, at + 18);
  if (p <= 0.001) return null;
  const out = end !== undefined ? 1 - rIn(f, end - 12, end) : 1;
  if (out <= 0.001) return null;
  const col = mixHex("#ffffff", theme.textOnLight, clamp01(onLight));
  return (
    <div style={{
      position: "absolute", left: (LAYOUT.W - LAYOUT.colW) / 2, width: LAYOUT.colW, top: y,
      transform: "translateY(-50%)", textAlign: "center", fontFamily: VOICE,
      fontSize: size, lineHeight: 1.22, color: col, opacity: p * out,
    }}>
      {parts.map((s, i) => (
        <span key={i} style={{ fontWeight: 400 }}>{s.t}</span>
      ))}
    </div>
  );
};

/** a small label / micro-sublabel that belongs to an object (measured 4–6× smaller than its stat) */
export const Label: React.FC<{
  x: number; y: number; text: string; at?: number; size?: number; onLight?: number; dim?: number;
}> = ({ x, y, text, at = 0, size = TYPE.labelSize, onLight = 0, dim = 0.8 }) => {
  const f = useCurrentFrame();
  const p = rOut(f, at, at + 16);
  if (p <= 0.001) return null;
  const col = mixHex("#ffffff", theme.textOnLight, clamp01(onLight));
  return (
    <div style={{
      position: "absolute", left: x, top: y, transform: "translate(-50%,-50%)",
      fontFamily: VOICE, fontWeight: 400, fontSize: size, color: col,
      opacity: p * dim, whiteSpace: "nowrap",
    }}>{text}</div>
  );
};

// (the source channel's Wordmark is not ported — Bankers/CLAUDE.md §2.4)
