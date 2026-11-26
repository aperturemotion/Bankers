// @ts-nocheck
// ★ BANKERS 3-D WORLD — the HTML overlay layer (drawn over the WebGL world, pinned to 3-D points through kit.project).
//   The reference style's annotation grammar in the Bankers dress:
//   · <Tag>      a small dark chip, caps label (Figtree 700, tracked), a light-blue accent bar on its left edge, and a thin
//                LEADER LINE from the chip to the object, ending in a dot on the object; it draws in (line first, then the chip)
//   · <Counter>  a big Anton figure with a small unit in the house light blue, on a dark rounded panel; it counts up
//   · <Inset>    a real photo in a rounded panel with a thin light border and a credit line ("Photo: CBS News")
//   · <Pill>     a persistent top-right status pill (e.g. a running total) that ticks when its value changes
//   Everything enters by a short eased move (≥ 8 f), never pops; positions are px in the 1080 × 1920 frame.
import React from "react";
import { Img, useCurrentFrame } from "remotion";
import { clamp01, ease, easeOut } from "./kit";
import { BODY, FIGURE } from "./fonts3d";

const CHIP_BG = "rgba(4, 18, 38, 0.82)";
const ACCENT = "#4D8ED9";
const HOT = "#B3CEEF";
export const Tag = ({ text, at, out = 1e9, x, y, to, side = "left", size = 30 }) => {
  // (x, y): the chip's anchor corner in px; to: { x, y } the object's point (already projected) or null for no leader
  const f = useCurrentFrame();
  const kIn = ease(f, at, at + 12), kOut = ease(f, out, out + 10);
  const vis = kIn * (1 - kOut);
  if (vis <= 0.001) return null;
  const line = to ? ease(f, at - 4, at + 8) * (1 - kOut) : 0;
  const pad = size * 0.42;
  const chip = (
    <div style={{ position: "absolute", left: side === "left" ? x : undefined, right: side === "right" ? 1080 - x : undefined, top: y,
      transform: `translateY(${(1 - kIn) * 14 - kOut * 10}px)`, opacity: vis, display: "flex", alignItems: "stretch",
      background: CHIP_BG, borderRadius: 6, boxShadow: "0 6px 24px rgba(0,8,20,0.45)", overflow: "hidden" }}>
      <div style={{ width: 5, background: ACCENT }} />
      <div style={{ padding: `${pad * 0.55}px ${pad}px`, fontFamily: BODY, fontWeight: 700, fontSize: size, letterSpacing: size * 0.12, color: "#F2F7FD", lineHeight: 1, textTransform: "uppercase", whiteSpace: "nowrap" }}>{text}</div>
    </div>
  );
  return (
    <>
      {to && line > 0.001 && (
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
          {(() => {
            const sx = side === "left" ? x + 12 : x - 12, sy = y + size * 0.9;
            const ex = sx + (to.x - sx) * line, ey = sy + (to.y - sy) * line;
            return (
              <g opacity={1 - kOut}>
                <line x1={sx} y1={sy} x2={ex} y2={ey} stroke="#E6F0FB" strokeWidth={2} strokeOpacity={0.85} />
                <circle cx={to.x} cy={to.y} r={6 * clamp01((line - 0.85) / 0.15)} fill="#FFFFFF" stroke={ACCENT} strokeWidth={2.5} />
              </g>
            );
          })()}
        </svg>
      )}
      {chip}
    </>
  );
};
export const Counter = ({ at, out = 1e9, x, y, from = 0, value, prefix = "", unit = "", label, size = 120, decimals = 0, countDur = 26, align = "center" }) => {
  const f = useCurrentFrame();
  const kIn = easeOut(f, at, at + 14), kOut = ease(f, out, out + 10);
  const vis = kIn * (1 - kOut);
  if (vis <= 0.001) return null;
  const k = easeOut(f, at + 2, at + 2 + countDur);
  const v = from + (value - from) * k;
  const txt = v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(${align === "center" ? "-50%" : align === "right" ? "-100%" : "0"}, ${(1 - kIn) * 22 - kOut * 14}px) scale(${0.94 + 0.06 * kIn})`,
      opacity: vis, background: CHIP_BG, borderRadius: 14, padding: `${size * 0.12}px ${size * 0.24}px`, boxShadow: "0 10px 40px rgba(0,8,20,0.5)", textAlign: "center" }}>
      {label && <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: size * 0.2, letterSpacing: size * 0.024, color: HOT, textTransform: "uppercase", marginBottom: size * 0.04 }}>{label}</div>}
      <div style={{ fontFamily: FIGURE, fontSize: size, lineHeight: 1, color: "#FFFFFF", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
        {prefix}{txt}<span style={{ fontSize: size * 0.42, color: ACCENT, marginLeft: size * 0.08 }}>{unit}</span>
      </div>
    </div>
  );
};
export const Inset = ({ src, credit, at, out = 1e9, x, y, w, h, fit = "cover", pos = "50% 30%" }) => {
  const f = useCurrentFrame();
  const kIn = easeOut(f, at, at + 16), kOut = ease(f, out, out + 12);
  const vis = kIn * (1 - kOut);
  if (vis <= 0.001) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, opacity: vis, transform: `translateY(${(1 - kIn) * 30 - kOut * 20}px) scale(${0.96 + 0.04 * kIn})`,
      borderRadius: 18, overflow: "hidden", border: "2px solid rgba(179,206,239,0.55)", boxShadow: "0 18px 60px rgba(0,8,20,0.6)", background: "#041226" }}>
      <Img src={src} style={{ width: "100%", height: "100%", objectFit: fit, objectPosition: pos, filter: "saturate(0.85) contrast(1.04)" }} />
      {credit && <div style={{ position: "absolute", left: 14, top: 12, fontFamily: BODY, fontWeight: 600, fontSize: 20, color: "#EAF2FC", background: "rgba(4,18,38,0.7)", padding: "4px 10px", borderRadius: 4 }}>{credit}</div>}
    </div>
  );
};
export const Pill = ({ at, out = 1e9, x = 1040, y = 150, icon, value, prevValue, changeAt = -1, label }) => {
  const f = useCurrentFrame();
  const kIn = easeOut(f, at, at + 12), kOut = ease(f, out, out + 10);
  const vis = kIn * (1 - kOut);
  if (vis <= 0.001) return null;
  const tick = changeAt >= 0 ? clamp01(1 - Math.abs(f - changeAt - 4) / 8) : 0;
  const shown = changeAt >= 0 && f < changeAt + 2 && prevValue !== undefined ? prevValue : value;
  return (
    <div style={{ position: "absolute", right: 1080 - x, top: y, opacity: vis, transform: `translateY(${(1 - kIn) * -16}px) scale(${1 + 0.06 * tick})`,
      display: "flex", alignItems: "center", gap: 12, background: "rgba(240,246,253,0.95)", borderRadius: 14, padding: "10px 18px", boxShadow: "0 8px 30px rgba(0,8,20,0.45)" }}>
      {icon}
      {label && <span style={{ fontFamily: BODY, fontWeight: 700, fontSize: 22, color: "#2A4A73", letterSpacing: 1.5, textTransform: "uppercase" }}>{label}</span>}
      <span style={{ fontFamily: FIGURE, fontSize: 44, color: "#00244D", lineHeight: 1 }}>{shown}</span>
    </div>
  );
};
