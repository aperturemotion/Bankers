// @ts-nocheck
// ★ V37 "Theranos" — expose helper (builder C, REV 1): THE PRINTED FRONT PAGE (above the fold) of a folded broadsheet, set as
//   real newspaper typography on the copy's own CSS-3-D plane (so it rides every move of the copy and never swims):
//     the masthead (exposeMast, Anton — no logo) between its rules · the dateline strip with OCT 15, 2015 (exposeDate) ·
//     a left news-digest column (a serif section head, bold lead-ins, small type) · the lead story: the real headline in a serif
//     display face (expose_data, WSJ Oct 15, 2015), a deck, the byline, three columns of body type with column rules, a halftone
//     photo box (a sample tube on a bench — no face) with its caption line · newsprint grain.
//   Body type is NEUTRAL TEXTURE: seeded sequences of plain words (no names, no figures, no claims) set small and justified, so it
//   reads as print at a glance; the only readable sentence is the real headline.
//   <PagePrint rig X page mast date glint ink /> — X the pose of the copy's top face (expose_bundle printXf), page = PAGE_W × PAGE_D.
import * as jsx_runtime from "react/jsx-runtime";
import { loadFont as newsreaderLoad } from "@remotion/google-fonts/Newsreader";
import { clamp01, mixHex } from "./anim";
import { rampAt } from "./solid_engine";
import { XPlane } from "./tk_rig";
import { seeded } from "./common";
import { SHOUT } from "./fonts";
import { EXPOSE_BYLINE, EXPOSE_HEADLINE } from "./expose_data";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
// a news serif for the headline, deck and body (Google Fonts "Newsreader"); latin only, two weights
const SERIF = newsreaderLoad("normal", { weights: ["400", "600", "700"], subsets: ["latin"] }).fontFamily;
export const PAGE_W = 520, PAGE_D = 460;
export const PAPER_RAMP = ["#4F6079", "#8A9BB2", "#BCC8D6", "#DCE3EC", "#F4F7FA"];
export const PRINT_INK = "#0E2442";
// ── neutral texture words ───────────────────────────────────────────────────────────────────────────────────────────────────────
const WORDS = ("the of and to in a for on that with as by from its at was it an be has have are this which were their more after " +
  "about other into over said year than also new some time when would been could most only first market week day while where " +
  "people early report office plan board state public service later during under since several between however among through " +
  "people work process system order number group part city local center account policy research industry business service").split(" ");
const textOf = (seed, n) => {
  const r = seeded(seed);
  const out = [];
  let cap = true;
  for (let i = 0; i < n; i++) {
    let w = WORDS[Math.floor(r() * WORDS.length)];
    if (cap) w = w[0].toUpperCase() + w.slice(1);
    cap = false;
    if (r() < 0.07 && i < n - 1) {
      w += ".";
      cap = true;
    } else if (r() < 0.06) w += ",";
    out.push(w);
  }
  return out.join(" ") + ".";
};
// the fixed layout (page units, the page's top-left at 0,0; the masthead along the top = the far edge)
const M = 16, DIG = { x0: M, x1: 132 }, LEAD = { x0: 148, x1: PAGE_W - M };
const COLW = (LEAD.x1 - LEAD.x0 - 16) / 3;
const col = (i) => LEAD.x0 + i * (COLW + 8);
const BODY_Y = 268, PHOTO = { x0: col(2), x1: col(2) + COLW, y0: BODY_Y, y1: BODY_Y + 112 };
const TEXTS = {
  digest: [0, 1, 2, 3].map((k) => textOf(100 + k, 38)),
  deck: textOf(7, 16),
  cols: [textOf(11, 190), textOf(12, 190), textOf(13, 70)],
  caption: textOf(21, 9)
};
// the halftone: a dot screen whose dots grow with the photo's darkness — a sample tube standing on a bench, soft light from the left
const HALF = (() => {
  const step = 3.6, dots = [];
  const w = PHOTO.x1 - PHOTO.x0, h = PHOTO.y1 - PHOTO.y0;
  const dark = (u, v) => {
    // background: a light wall darkening to the right, the bench edge, the tube (a capped cylinder) and its shadow
    let d = 0.18 + 0.32 * u + 0.12 * v;
    if (v > 0.74) d = 0.55 + 0.2 * (v - 0.74) / 0.26;
    const tx = 0.42, tw = 0.11;
    if (Math.abs(u - tx) < tw && v > 0.2 && v < 0.78) d = 0.2 + 0.55 * Math.pow(Math.abs(u - tx) / tw, 3) + (u > tx ? 0.12 : 0);
    if (Math.abs(u - tx) < tw * 1.12 && v > 0.12 && v <= 0.24) d = 0.82;
    if (Math.abs(u - tx) < tw * 0.85 && v > 0.52 && v < 0.78) d = 0.78;
    if (v > 0.76 && v < 0.82 && u > tx && u < tx + 0.38) d = Math.max(d, 0.7 - 1.3 * (u - tx));
    return Math.max(0.04, Math.min(0.95, d));
  };
  for (let y = PHOTO.y0 + step / 2; y < PHOTO.y1; y += step) for (let x = PHOTO.x0 + step / 2; x < PHOTO.x1; x += step) {
    const r = 0.5 * step * Math.sqrt(dark((x - PHOTO.x0) / w, (y - PHOTO.y0) / h)) * 1.05;
    dots.push(`M${f2(x - r)},${f2(y)}a${f2(r)},${f2(r)} 0 1 0 ${f2(2 * r)},0a${f2(r)},${f2(r)} 0 1 0 ${f2(-2 * r)},0`);
  }
  return dots.join("");
})();
const rectsD = (arr) => arr.map(([x, y, w, h]) => `M${f2(x)},${f2(y)}h${f2(w)}v${f2(h)}h${f2(-w)}Z`).join("");
const RULES = rectsD([
  [M, 86, PAGE_W - 2 * M, 2.6], [M, 91, PAGE_W - 2 * M, 1], [M, 136, PAGE_W - 2 * M, 1.2],
  [DIG.x1 + 7, 142, 0.9, PAGE_D - 148], [col(1) - 4.5, BODY_Y, 0.7, PAGE_D - BODY_Y - 6], [col(2) - 4.5, BODY_Y, 0.7, PAGE_D - BODY_Y - 6],
  [LEAD.x0, 258, LEAD.x1 - LEAD.x0, 0.7]
]);
const body = (size, lh, extra = {}) => ({ position: "absolute", fontFamily: SERIF, fontWeight: 400, fontSize: size, lineHeight: `${lh}px`, color: PRINT_INK, textAlign: "justify", overflow: "hidden", hyphens: "auto", ...extra });
export const PagePrint = ({ rig, X, mast = 0, date = 0, glint = -1, mastText, dateText, light = 0.8, probe = "the top copy's printed page", id = "pp" }) => {
  const g0 = clamp01(light);
  const paper = (l) => rampAt(PAPER_RAMP, Math.max(0.12, Math.min(0.96, 0.1 + 0.98 * l)));
  const lit0 = paper(0.92 * g0 + 0.14), lit1 = paper(0.92 * g0 + 0.02), lit2 = paper(0.92 * g0 - 0.1);
  const ease = (v) => ({ opacity: clamp01(v), transform: `scale(${(1.06 - 0.06 * clamp01(v)).toFixed(4)})` });
  const ink = (o) => ({ color: PRINT_INK, opacity: o });
  return jsx(XPlane, { rig, x: X, u: -PAGE_W / 2, v: -PAGE_D / 2, w: 0.6, width: PAGE_W, height: PAGE_D, probe, children: jsxs("div", { style: { position: "relative", width: PAGE_W, height: PAGE_D, overflow: "hidden", background: `linear-gradient(128deg, ${lit0} 0%, ${lit1} 46%, ${lit2} 100%)` }, children: [
    jsxs("svg", { width: PAGE_W, height: PAGE_D, style: { position: "absolute", left: 0, top: 0 }, children: [
      jsx("defs", { "data-probe-skip": true, children: jsxs("filter", { id: `${id}Gr`, x: "0", y: "0", width: "100%", height: "100%", children: [
        jsx("feTurbulence", { type: "fractalNoise", baseFrequency: "0.9", numOctaves: 2, seed: 7 }),
        jsx("feColorMatrix", { values: "0 0 0 0 0.1  0 0 0 0 0.16  0 0 0 0 0.26  0 0 0 0.55 0" })
      ] }) }),
      jsx("rect", { x: 0, y: 0, width: PAGE_W, height: PAGE_D, filter: `url(#${id}Gr)`, opacity: 0.3 }),
      jsx("path", { d: RULES, fill: PRINT_INK, opacity: 0.8 }),
      // the dateline strip's right-hand items (the price box and edition marks, as small bars)
      jsx("path", { d: rectsD([[PAGE_W - M - 150, 108, 40, 7], [PAGE_W - M - 100, 108, 84, 7], [PAGE_W - M - 100, 119, 60, 4]]), fill: PRINT_INK, opacity: 0.32 }),
      // the halftone photo and its keyline
      jsx("rect", { x: PHOTO.x0, y: PHOTO.y0, width: PHOTO.x1 - PHOTO.x0, height: PHOTO.y1 - PHOTO.y0, fill: "#FFFFFF", opacity: 0.18 }),
      jsx("path", { d: HALF, fill: PRINT_INK, opacity: 0.82 }),
      jsx("rect", { x: PHOTO.x0, y: PHOTO.y0, width: PHOTO.x1 - PHOTO.x0, height: PHOTO.y1 - PHOTO.y0, fill: "none", stroke: PRINT_INK, strokeWidth: 0.6, opacity: 0.6 }),
      // the fold's soft shading at the page's foot (the lens side)
      jsx("rect", { x: 0, y: PAGE_D - 26, width: PAGE_W, height: 26, fill: "#2B3D57", opacity: 0.1 })
    ] }),
    // the news digest: a section head, then four items, each a bold lead-in and small type
    jsx("div", { style: { position: "absolute", left: DIG.x0, top: 144, width: DIG.x1 - DIG.x0, fontFamily: SERIF, fontWeight: 700, fontSize: 11.5, lineHeight: "13px", ...ink(0.92) }, children: "What’s News" }),
    jsx("div", { style: { position: "absolute", left: DIG.x0, top: 160, width: DIG.x1 - DIG.x0, height: 0.6, background: PRINT_INK, opacity: 0.6 } }),
    TEXTS.digest.map((tx, k) => jsx("div", { style: body(6.2, 7.4, { left: DIG.x0, top: 166 + k * 72, width: DIG.x1 - DIG.x0, height: 66, opacity: 0.78 }), children: [
      jsx("span", { style: { fontWeight: 700 }, children: "▪ " }, "b"),
      tx
    ] }, `d${k}`)),
    // the lead story: headline, deck, byline
    jsx("div", { style: { position: "absolute", left: LEAD.x0, top: 142, width: LEAD.x1 - LEAD.x0, fontFamily: SERIF, fontWeight: 600, fontSize: 24.5, lineHeight: "25.5px", letterSpacing: -0.2, ...ink(0.96) }, children: EXPOSE_HEADLINE }),
    jsx("div", { style: body(7.4, 8.6, { left: LEAD.x0, top: 226, width: LEAD.x1 - LEAD.x0 - 40, height: 18, fontStyle: "normal", opacity: 0.7 }), children: TEXTS.deck }),
    jsx("div", { style: { position: "absolute", left: LEAD.x0, top: 247, fontFamily: SERIF, fontWeight: 600, fontSize: 6.4, letterSpacing: 0.6, textTransform: "uppercase", ...ink(0.75) }, children: EXPOSE_BYLINE }),
    // three columns of body type (the third under the photo) and the photo's caption
    jsx("div", { style: body(6.2, 7.3, { left: col(0), top: BODY_Y + 2, width: COLW, height: PAGE_D - BODY_Y - 10, opacity: 0.72 }), children: TEXTS.cols[0] }),
    jsx("div", { style: body(6.2, 7.3, { left: col(1), top: BODY_Y + 2, width: COLW, height: PAGE_D - BODY_Y - 10, opacity: 0.72 }), children: TEXTS.cols[1] }),
    jsx("div", { style: body(5.6, 6.6, { left: col(2), top: PHOTO.y1 + 3, width: COLW, height: 14, fontStyle: "italic", opacity: 0.7 }), children: TEXTS.caption }),
    jsx("div", { style: body(6.2, 7.3, { left: col(2), top: PHOTO.y1 + 20, width: COLW, height: PAGE_D - PHOTO.y1 - 28, opacity: 0.72 }), children: TEXTS.cols[2] }),
    // the light's sheen across the page
    glint > -1 && jsx("div", { style: { position: "absolute", left: -260 + (PAGE_W + 520) * glint - 130, top: -60, width: 260, height: PAGE_D + 120, transform: "skewX(-24deg)", background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 100%)", opacity: 0.42 * Math.sin(Math.PI * clamp01(glint)) } }),
    // the masthead (Anton) and the dateline: printed in as their words are said
    mast > 3e-3 && jsx("div", { style: { position: "absolute", left: 0, top: 22, width: PAGE_W, textAlign: "center", transformOrigin: "50% 50%", ...ease(mast) }, children: jsx("span", { style: { fontFamily: SHOUT, fontWeight: 400, fontSize: 45, letterSpacing: 1, color: PRINT_INK, whiteSpace: "nowrap", lineHeight: 1 }, children: mastText }) }),
    date > 3e-3 && jsx("div", { style: { position: "absolute", left: 18, top: 99, transformOrigin: "0% 50%", ...ease(date) }, children: jsx("span", { style: { fontFamily: SHOUT, fontWeight: 400, fontSize: 30, letterSpacing: 1.2, color: PRINT_INK, whiteSpace: "nowrap", lineHeight: 1 }, children: dateText }) })
  ] }) });
};
void mixHex;
