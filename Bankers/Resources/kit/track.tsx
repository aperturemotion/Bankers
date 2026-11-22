import React from "react";
import { useCurrentFrame } from "remotion";
import { rOut, rIn, drift2, clamp01, mixHex } from "./anim";
import { VOICE, ACCENT } from "./fonts";
import { theme } from "./theme";

// ══════════════════════════════════════════════════════════════════════════════════════════════
// ★ TRACKING TEXT (Timur, 2026-09-26 — Bankers/CLAUDE.md §2.5.2): "instead of using generic captions for
// when the VO says: So where do rates go next? … use the tracking text feature … to practice for future
// videos, so make sure it zooms closer to the text almost like its 3d."
//
// The line is set BIG, in real CSS 3-D:
//   · each LINE sits on its own depth plane (z), so as the camera dollies in the nearer lines grow faster —
//     true parallax between the lines, not one flat block scaling;
//   · each WORD flies in FROM DEPTH on the frame the voice says it (far, soft, transparent → settled);
//   · the camera then TRACKS toward the text for the rest of the line (an eased dolly, never linear), the
//     block turns slowly in 3-D (yaw and pitch easing toward square-on, plus a drift), and the letter-
//     spacing opens a little — the typographic "tracking" — as it comes closer;
//   · on the push through to the logo the dolly carries the text past the lens (Demo.tsx defocuses it).
// Faces stay Style 3's own (§2.3): Figtree for the words, the Instrument Serif italic accent for the last word,
// carrying the accent gradient.
// ══════════════════════════════════════════════════════════════════════════════════════════════

type W = { word: string; at: number };
export type TrackLine = { idx: number[]; size: number; weight: number; z: number; accent?: boolean };

const PERSPECTIVE = 1500;
const ACCENT_GRAD = `linear-gradient(175deg, #ffffff 6%, ${theme.accentBright} 30%, ${theme.accent} 62%, #1D70CE 96%)`;
/** ★ INK FOR THE WHITE STAGE (Bankers STYLE §5.5, 2026-10-09: a text-only beat or the question on a "light full frame"): the
 *  lines go navy and the accent ramps through the deep blues. `ink` is a BLEND (0 dark stage → 1 white stage), never a switch. */
const ACCENT_STOPS_DARK = ["#ffffff", theme.accentBright, theme.accent, "#1D70CE"];
const ACCENT_STOPS_LIGHT = ["#002F64", "#005DC8", "#1D70CE", "#4D8ED9"];
const accentGrad = (ink: number) => (ink <= 0 ? ACCENT_GRAD : `linear-gradient(175deg, ${ACCENT_STOPS_DARK.map((c, i) => `${mixHex(c, ACCENT_STOPS_LIGHT[i], ink)} ${[6, 30, 62, 96][i]}%`).join(", ")})`);

// ★ LINE SPACING = STYLE 3's HERO RHYTHM, SET BY INK (Timur, 2026-09-26: "the lines are too far apart, make the
// overall spacing between lines similar to the way it is with [Style 3]"). Style 3 sets its hero at line-height 1.25:
// at 64 px that is an 80 px baseline pitch, which leaves ≈ 0.5 × the size between one line's baseline and the top of
// the next line's letters. With three very different sizes here (88 / 128 / 240, the last a lowercase serif), a line-
// height rule would open a big empty band above "next?", so each line is placed by its BASELINE: the next line's ink
// top sits GAP × the upper line's size below the upper line's baseline. Glyph metrics come from the font itself.
const GAP = 0.5;
const DESC_CLEAR = 0.42;
let ctx2d: CanvasRenderingContext2D | null = null;
const metrics = (ln: TrackLine, text: string) => {
  ctx2d = ctx2d ?? document.createElement("canvas").getContext("2d");
  const c = ctx2d!;
  c.font = `${ln.accent ? "italic " : ""}${ln.weight} ${ln.size}px ${ln.accent ? ACCENT : VOICE}`;
  const m = c.measureText(text);
  return { inkA: m.actualBoundingBoxAscent, inkD: m.actualBoundingBoxDescent, fa: m.fontBoundingBoxAscent, fd: m.fontBoundingBoxDescent };
};
/** each line's box top (line-height = its size) and baseline, relative to the block's INK centre */
const layout = (words: W[], lines: TrackLine[]) => {
  const ms = lines.map((ln) => metrics(ln, ln.idx.map((i) => words[i].word).join(" ")));
  const base: number[] = [];
  // ★ DESCENDER-AWARE (full sweep, 2026-09-26): the gap ran from the upper line's BASELINE, so a descender ate it — the
  // "y" of "you" hung 20 px into it, and as the camera dollied in (the lower line nearer the lens grows faster) it came
  // within 5 px of "Micron". The gap is now at least DESC_CLEAR × size below the upper line's lowest INK; a line with no
  // descender keeps exactly the approved GAP rhythm.
  lines.forEach((ln, i) => { base.push(i === 0 ? 0 : base[i - 1] + Math.max(GAP * lines[i - 1].size, ms[i - 1].inkD + DESC_CLEAR * lines[i - 1].size) + ms[i].inkA); });
  const inkTop = base[0] - ms[0].inkA, inkBottom = base[base.length - 1] + ms[ms.length - 1].inkD;
  const c = (inkTop + inkBottom) / 2;
  return lines.map((ln, i) => {
    const m = ms[i];
    const baseline = base[i] - c;
    // with line-height = size, the baseline sits half the leading plus the font ascent below the box top
    const top = baseline - ((ln.size - (m.fa + m.fd)) / 2 + m.fa);
    return { ln, top, baseline, inkBottom: baseline + m.inkD };
  });
};

/** the screen y of the block's lowest ink, from the same layout and perspective the component draws with, plus the
 *  lift — Demo.tsx holds the logo back until this is clear of it. A small allowance covers the 3-D pitch. */
export const trackBottom = (words: W[], lines: TrackLine[], y: number, dolly: number, lift: number) => {
  const rows = layout(words, lines);
  const last = rows[rows.length - 1];
  const s = PERSPECTIVE / Math.max(1, PERSPECTIVE - (dolly + last.ln.z));
  return y + last.inkBottom * s * 1.06 - lift;
};

export const TrackText: React.FC<{
  words: W[]; lines: TrackLine[];
  /** the block's centre */
  y: number;
  /** the camera's dolly toward the text, in px along the lens axis (Demo.tsx drives it) */
  dolly: number;
  /** 0 → 1 across the line: the 3-D turn and the tracking open with it */
  hold: number;
  /** the frame the text is cut (a 9 f fade, as the Style 3 hero) */
  end: number;
  /** px the whole block rises as the camera tilts down onto the close — it leaves through the TOP, so the
   *  logo arriving at the centre never touches it (Timur, 2026-09-26: "the bankers at the end should not
   *  intersect with the other text at all") */
  lift?: number;
  /** 0 → white type for the dark stage (default); 1 → navy type for the white stage, blended between */
  ink?: number;
}> = ({ words, lines, y, dolly, hold, end, lift = 0, ink = 0 }) => {
  const f = useCurrentFrame();
  const first = words[0]?.at ?? 0;
  if (f < first - 4) return null;
  const out = 1 - rIn(f, end - 9, end);
  if (out <= 0.001) return null;
  // the block's slow 3-D turn: from a three-quarter view to nearly square-on, with a drift that never settles
  const yaw = -17 + 14 * hold + drift2(f, 173, 67, 1.2);
  const pitch = 10 - 7 * hold + drift2(f + 40, 151, 59, 0.8);
  const track = -0.01 + 0.065 * hold;   // em
  const rows = layout(words, lines);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: out, transform: lift ? "translateY(" + (-lift).toFixed(1) + "px)" : undefined, perspective: PERSPECTIVE, perspectiveOrigin: `540px ${y}px` }}>
      <div style={{
        position: "absolute", left: 0, top: y, width: 1080, height: 0, transformStyle: "preserve-3d",
        transform: `translateZ(${dolly.toFixed(1)}px) rotateX(${pitch.toFixed(2)}deg) rotateY(${yaw.toFixed(2)}deg)`,
      }}>
        {rows.map(({ ln, top: t }, li) => (
          <div key={li} style={{
            position: "absolute", left: 0, width: 1080, top: t, height: ln.size, textAlign: "center",
            transformStyle: "preserve-3d", transform: `translateZ(${ln.z}px)`,
            fontSize: ln.size, lineHeight: `${ln.size}px`, whiteSpace: "nowrap", color: ink <= 0 ? "#ffffff" : mixHex("#ffffff", "#001C3C", ink),
            fontFamily: ln.accent ? ACCENT : VOICE, fontWeight: ln.weight, fontStyle: ln.accent ? "italic" : undefined,
            letterSpacing: `${track.toFixed(4)}em`,
          }}>
            {ln.idx.map((i, k) => {
              const w = words[i];
              // ★ each word arrives FROM DEPTH on its spoken frame: far, soft and clear → settled (eased, never linear)
              const p = rOut(f, w.at - 3, w.at + 15);
              const vis = clamp01(p * 1.6);
              if (vis <= 0.001) {
                // unarrived words keep their slot, so the line never reflows as the next word lands
                // (an accent word keeps its padding too, or the line re-centres by 0.16 em as its first word lands)
                return <span key={i} style={{ display: "inline-block", opacity: 0, marginRight: k < ln.idx.length - 1 ? ln.size * 0.28 : 0, ...(ln.accent ? { padding: "0 0.08em" } : {}) }}>{w.word}</span>;
              }
              // ★ the accent's gradient sits on an INNER span (root CLAUDE.md, Style 3 V33): with the arrival's blur `filter` and
              // `background-clip: text` on ONE span, Chrome's sequential render drew the word as a solid box for its whole arrival
              return (
                <span key={i} style={{
                  display: "inline-block", opacity: vis,
                  transform: `translateZ(${(-900 * (1 - p)).toFixed(1)}px)`,
                  filter: p < 0.99 ? `blur(${((1 - p) * 9).toFixed(2)}px)` : undefined,
                  marginRight: k < ln.idx.length - 1 ? ln.size * 0.28 : 0,
                }}>{ln.accent
                  ? <span style={{ display: "inline-block", background: accentGrad(ink), WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", padding: "0 0.08em" }}>{w.word}</span>
                  : w.word}</span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
