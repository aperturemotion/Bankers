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
const SPOKEN = "#D2DCE9";   // rev 5: lighter — there is no dark pill behind it any more
// ★ rev 5 (Timur, 2026-11-27): "keep them at the bottom of the screen, just like Bankers used to be … without that weird box … remove that blue
//   box and remove the background darker label shape as well, so it's just the text and lower in the screen." No pill, no keyword box: the
//   words alone (karaoke timing kept), legible by a soft shadow only (no shape), centred low (a one-line chip's centre at y 1500).
const SHADOW = "0 2px 4px rgba(0,6,16,0.85), 0 0 18px rgba(0,6,16,0.55)";
export const Karaoke = ({ chips, cy = 1500, size = 58, maxW = 760, hideFrom = 1e9 }) => {
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
          <div key={li} style={{ display: "flex", gap: size * 0.24, padding: `0 ${size * 0.24}px`, opacity: anyOn ? 1 : 0 }}>
            {ln.filter((p) => p.i <= cur).map((p) => {
              const spoken = p.i <= cur, now = p.i === cur, kw = false;   // rev 5: no keyword box
              const fade = clamp01((f - p.at + 1) / 3);
              return (
                <span key={p.i} style={{ position: "relative", fontFamily: BODY, fontWeight: now ? 800 : 500, fontSize: size, lineHeight: 1.12,
                  color: now ? "#FFFFFF" : SPOKEN, opacity: spoken ? fade : 0, padding: `0 ${size * 0.05}px`, textShadow: SHADOW }}>
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
