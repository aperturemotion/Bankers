// @ts-nocheck
// ★ BANKERS 3-D WORLD — the KARAOKE CAPTION (the reference style's subtitles in the Bankers dress).
//   One chip at a time (the take's TICKER chips: 2–5 words, 1–2 lines), centred in the lower-middle of the frame. Each word sits
//   dimmed until it is spoken, then turns white; the word being spoken is bold white inside a thin box in the house light blue
//   with two corner dots (top-left, bottom-right). Behind each line a soft translucent navy band. The chip changes with no
//   animation of its own beyond a 4-f dissolve (the references cut chip to chip).
import React from "react";
import { useCurrentFrame } from "remotion";
import { clamp01 } from "./kit";
import { BODY } from "./fonts3d";

const BOX = "#7FB4F2";
export const Karaoke = ({ chips, y = 1255, size = 62, maxW = 860, hideFrom = 1e9, lineBreak }) => {
  const f = useCurrentFrame();
  if (f >= hideFrom) return null;
  const c = chips.find((q) => f >= q.at && f < q.until);
  if (!c) return null;
  const parts = c.parts;
  const fade = clamp01((f - c.at) / 4) * clamp01((c.until - f) / 4);
  // the line split: at a given part index (from the generator) or by width (≈ 0.52 em per char)
  const est = (w) => (w.length + 1) * size * 0.52;
  let lines = [[]], width = 0;
  parts.forEach((p, i) => {
    const wd = est(p.word);
    if ((lineBreak ? lineBreak(c, i) : width + wd > maxW) && lines[lines.length - 1].length) { lines.push([]); width = 0; }
    lines[lines.length - 1].push({ ...p, i }); width += wd;
  });
  const cur = parts.reduce((k, p, i) => (f >= p.at ? i : k), -1);
  return (
    <div style={{ position: "absolute", left: 0, top: y, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: size * 0.12, opacity: fade, pointerEvents: "none" }}>
      {lines.map((ln, li) => (
        <div key={li} style={{ display: "flex", gap: size * 0.26, padding: `${size * 0.06}px ${size * 0.22}px`, background: "rgba(3, 14, 30, 0.42)", borderRadius: size * 0.16 }}>
          {ln.map((p) => {
            const spoken = p.i <= cur, now = p.i === cur;
            return (
              <span key={p.i} style={{ position: "relative", fontFamily: BODY, fontWeight: now ? 800 : 600, fontSize: size, lineHeight: 1.18, color: spoken ? "#FFFFFF" : "rgba(214,226,242,0.55)",
                textShadow: "0 2px 12px rgba(0,8,20,0.55)", padding: `0 ${size * 0.06}px` }}>
                {p.word}
                {now && (
                  <span style={{ position: "absolute", left: -size * 0.04, right: -size * 0.04, top: size * 0.04, bottom: size * 0.0, border: `3px solid ${BOX}`, borderRadius: 3 }}>
                    <span style={{ position: "absolute", left: -6, top: -6, width: 9, height: 9, borderRadius: 5, background: BOX }} />
                    <span style={{ position: "absolute", right: -6, bottom: -6, width: 9, height: 9, borderRadius: 5, background: BOX }} />
                  </span>
                )}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};
