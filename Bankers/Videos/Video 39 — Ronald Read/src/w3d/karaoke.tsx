// @ts-nocheck
// ★ BANKERS 3-D WORLD — the KARAOKE CAPTION (CLAUDE.md "3-D World" §C, measured from the 8 references, in the Bankers dress).
//   Centred, a one-line chip's centre at 68 % of the height (two-line chips grow upward), ≤ 2 lines. Word by word: each word fades in
//   (~3 f) on its voice onset; the CURRENT word is white bold, SPOKEN words grey regular, FUTURE words hidden (each line's pill grows word by
//   word, centred, as in the references). Each line on its own dark translucent pill. One KEYWORD per chip (take.ts `kw`: a number, else the key noun) in a
//   thin light-blue outline box with filled dots on its top-left and bottom-right corners, from its onset to the chip's end.
import React from "react";
import { useCurrentFrame } from "remotion";
import { clamp01 } from "./kit";
import { BODY } from "./fonts3d";

const BOX = "#7FB4F2";
const SPOKEN = "#A3B0C2";
export const Karaoke = ({ chips, cy = 1306, size = 56, maxW = 660, hideFrom = 1e9 }) => {
  const f = useCurrentFrame();
  if (f >= hideFrom) return null;
  const c = chips.find((q) => f >= q.at && f < q.until);
  if (!c) return null;
  const parts = c.parts;
  const est = (w) => (w.length + 1) * size * 0.53;
  let lines = [[]], width = 0;
  parts.forEach((p, i) => {
    const wd = est(p.word);
    if (width + wd > maxW && lines[lines.length - 1].length) { lines.push([]); width = 0; }
    lines[lines.length - 1].push({ ...p, i }); width += wd;
  });
  const cur = parts.reduce((k, p, i) => (f >= p.at ? i : k), -1);
  const lineH = size * 1.42;
  const top = cy - lineH / 2 - (lines.length - 1) * lineH;
  return (
    <div style={{ position: "absolute", left: 0, top, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: size * 0.14, pointerEvents: "none" }}>
      {lines.map((ln, li) => {
        const anyOn = ln.some((p) => p.i <= cur);
        return (
          <div key={li} style={{ display: "flex", gap: size * 0.24, padding: `${size * 0.1}px ${size * 0.24}px`, background: "rgba(2, 9, 20, 0.70)", borderRadius: 9,
            opacity: anyOn ? 1 : 0 }}>
            {ln.filter((p) => p.i <= cur).map((p) => {
              const spoken = p.i <= cur, now = p.i === cur, kw = p.i === c.kw && spoken;
              const fade = clamp01((f - p.at + 1) / 3);
              return (
                <span key={p.i} style={{ position: "relative", fontFamily: BODY, fontWeight: now ? 800 : 500, fontSize: size, lineHeight: 1.12,
                  color: now ? "#FFFFFF" : SPOKEN, opacity: spoken ? fade : 0, padding: `0 ${size * 0.05}px` }}>
                  {p.word}
                  {kw && (
                    <span style={{ position: "absolute", left: -size * 0.06, right: -size * 0.06, top: size * 0.02, bottom: size * 0.0, border: `3px solid ${BOX}`, background: "rgba(127,180,242,0.10)", borderRadius: 2 }}>
                      <span style={{ position: "absolute", left: -6, top: -6, width: 10, height: 10, borderRadius: 5, background: BOX }} />
                      <span style={{ position: "absolute", right: -6, bottom: -6, width: 10, height: 10, borderRadius: 5, background: BOX }} />
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
