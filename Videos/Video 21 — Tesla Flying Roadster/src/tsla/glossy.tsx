import React from "react";
import { alpha, mixHex } from "./anim";

// ══════════════════════════════════════════════════════════════════════════════════════════════
// ★ THE DEMO'S GLOSSY FAMILY (Bankers/Resources/visual-vocabulary.md → DEMO ANCHOR, Timur 2026-10-13): satin solids in the blue ramp —
// a light top face, deep sides, a soft rim light — that SYMBOLISE the subject. Each is drawn in SVG in its own coordinates, with its
// depth stepped up-right (the house oblique, STYLE §6.3). Few, large parts (STYLE §6.8a). Ids are passed in (one per use), so no two
// gradients collide.
// ══════════════════════════════════════════════════════════════════════════════════════════════

type Pt = { x: number; y: number };
const P = (pts: Pt[]) => pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
const rot = (p: Pt, c: Pt, deg: number): Pt => {
  const a = (deg * Math.PI) / 180, s = Math.sin(a), co = Math.cos(a);
  return { x: c.x + (p.x - c.x) * co - (p.y - c.y) * s, y: c.y + (p.x - c.x) * s + (p.y - c.y) * co };
};

/** ★ A GLOSSY ARROW (the demo's FgArrows recipe, generalised): a flat arrow, its extrusion stepped back up-right, a satin face lit
 *  from the top-left, a white rim. Pointing UP at angle 0; `angle` turns it about its centre (a smooth turn: up → down = 180). The
 *  extrusion stays up-right on screen whatever the angle (counter-rotated, STYLE §6.8a). */
export const GlossyArrow: React.FC<{ id: string; cx: number; cy: number; len: number; head?: number; hw?: number; sw?: number; angle?: number; light?: number; depth?: number }> = ({
  id, cx, cy, len, head = len * 0.28, hw = len * 0.2, sw = len * 0.075, angle = 0, light = 0, depth = 7,
}) => {
  const c = { x: cx, y: cy }, top = cy - len / 2;
  const base: Pt[] = [
    { x: cx, y: top }, { x: cx + hw, y: top + head }, { x: cx + sw, y: top + head }, { x: cx + sw, y: top + len },
    { x: cx - sw, y: top + len }, { x: cx - sw, y: top + head }, { x: cx - hw, y: top + head },
  ].map((p) => rot(p, c, angle));
  // the extrusion is FIVE depth units deep, drawn in steps of ≤ 2 px: at a large size (Video 11's light frame, len 370) five copies 7 px
  // apart showed as a sawtooth along the head's edges (close-up check, STYLE §6.8a)
  const STEPS = Math.max(5, Math.ceil((5 * depth * 0.8) / 2));
  const step = (i: number) => base.map((p) => ({ x: p.x + ((i * 5) / STEPS) * depth * 0.8, y: p.y - ((i * 5) / STEPS) * depth * 0.62 }));
  // the two bevel planes, split along the axis (tip → the middle of the shaft's foot)
  const axisB = rot({ x: cx, y: top + len }, c, angle);
  const right = [base[0], base[1], base[2], base[3], axisB], left = [base[0], axisB, base[4], base[5], base[6]];
  const streak = [rot({ x: cx - sw * 0.5, y: top + head + len * 0.06 }, c, angle), rot({ x: cx - sw * 0.5, y: top + len * 0.92 }, c, angle)];
  return (
    <g>
      <defs>
        <linearGradient id={`${id}F`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor={mixHex("#E6EFFA", "#FFFFFF", light)} /><stop offset="0.42" stopColor={mixHex("#3F80CC", "#99BBE4", light)} /><stop offset="1" stopColor={mixHex("#0A3469", "#2D6AB1", light)} />
        </linearGradient>
        <linearGradient id={`${id}S`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor={mixHex("#6599D5", "#D7E3F2", light)} /><stop offset="0.45" stopColor={mixHex("#234F84", "#3F80CC", light)} /><stop offset="1" stopColor={mixHex("#072F63", "#2860A0", light)} />
        </linearGradient>
      </defs>
      {[...Array(STEPS)].map((_, k) => STEPS - k).map((i) => <polygon key={i} points={P(step(i))} fill={i === STEPS ? mixHex("#011A38", "#2860A0", light) : mixHex("#072F63", "#3F80CC", light)} />)}
      {/* ★ BEVELLED (Timur, 2026-10-13: "more detailed, like the Style 3 films"): the face is two planes meeting along the arrow's axis — the
          half toward the key light lit, the other in shade — with a highlight on the ridge between them, a specular streak down the
          lit half of the shaft, and the white rim round the whole */}
      <polygon points={P(left)} fill={`url(#${id}F)`} />
      <polygon points={P(right)} fill={`url(#${id}S)`} />
      <polyline points={P([base[0], axisB])} fill="none" stroke={alpha("#FFFFFF", 0.55)} strokeWidth={Math.max(2, len * 0.006)} strokeLinecap="round" />
      <polyline points={P(streak)} fill="none" stroke={alpha("#FFFFFF", 0.35)} strokeWidth={Math.max(3, sw * 0.22)} strokeLinecap="round" />
      <polygon points={P(base)} fill="none" stroke={alpha("#ffffff", 0.6)} strokeWidth={3} strokeLinejoin="round" />
    </g>
  );
};

/** ★ A GLOSSY COIN, edge-on from above: its rim (a short cylinder side) and its lit face, an engraved inner ring and a "$" */
/** `under`: a coin lying under another in a stack — its face is covered, so its face marks are not measured (the probe has no depth) */
export const Coin: React.FC<{ id: string; cx: number; cy: number; rx: number; t?: number; on?: number; mark?: boolean; under?: boolean }> = ({ id, cx, cy, rx, t = rx * 0.16, on = 1, mark = true, under = false }) => {
  const ry = rx * 0.34;
  return (
    <g opacity={on}>
      <defs>
        <linearGradient id={`${id}E`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0A3164" /><stop offset="0.35" stopColor="#3F80CC" /><stop offset="0.6" stopColor="#19457A" /><stop offset="1" stopColor="#031A3A" />
        </linearGradient>
        <linearGradient id={`${id}T`} x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="#F5F9FD" /><stop offset="0.45" stopColor="#6599D5" /><stop offset="1" stopColor="#234F84" />
        </linearGradient>
      </defs>
      {/* the rim: down the near side, round the bottom, up, and back along the face's FRONT arc (never a straight line across the
          face — hidden under it, but the probe would read it as a stroke through the "$") */}
      <path d={`M${cx - rx} ${cy} v${t} a${rx} ${ry} 0 0 0 ${2 * rx} 0 v${-t} a${rx} ${ry} 0 0 1 ${-2 * rx} 0Z`} fill={`url(#${id}E)`} />
      {/* the reeding on its side: grooves round the near half, one per ~24 px at the middle (never finer — STYLE §6.9a) */}
      <g data-probe-skip>
        {[...Array(Math.max(6, Math.round((Math.PI * rx) / 24)))].map((_, i, arr) => {
          const a = ((i + 0.5) / arr.length) * Math.PI, x = cx - rx * Math.cos(a), y = cy + ry * Math.sin(a);
          return <line key={i} x1={x} y1={y + 1} x2={x} y2={y + t - 1} stroke={alpha("#001C3C", 0.22 + 0.2 * Math.sin(a))} strokeWidth={Math.max(1.5, rx * 0.011)} />;
        })}
      </g>
      <g {...(under ? { "data-probe-skip": true } : {})}>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${id}T)`} stroke={alpha("#FFFFFF", 0.7)} strokeWidth={2} />
        {/* the raised rim: a bevelled band inside the edge (its lit inner lip, its shaded outer lip) */}
        <ellipse cx={cx} cy={cy} rx={rx * 0.9} ry={ry * 0.9} fill="none" stroke={alpha("#0A3164", 0.28)} strokeWidth={Math.max(2, rx * 0.02)} />
        <ellipse cx={cx} cy={cy + 1} rx={rx * 0.87} ry={ry * 0.87} fill="none" stroke={alpha("#FFFFFF", 0.45)} strokeWidth={Math.max(1.5, rx * 0.012)} />
        <ellipse cx={cx} cy={cy} rx={rx * 0.7} ry={ry * 0.7} fill="none" stroke={alpha("#0A3164", 0.35)} strokeWidth={3} />
        {/* the bead ring between them */}
        {[...Array(18)].map((_, i) => {
          const a = (i / 18) * Math.PI * 2;
          return <ellipse key={i} cx={cx + rx * 0.795 * Math.cos(a)} cy={cy + ry * 0.795 * Math.sin(a)} rx={Math.max(2, rx * 0.022)} ry={Math.max(1, rx * 0.022 * 0.34 * 1.6)} fill={alpha("#0A3164", 0.4)} />;
        })}
      </g>
      {/* the "$" stamped on the face, foreshortened with it (squashed about the coin's centre) */}
      {mark && <text data-print x={cx} y={cy + rx * 0.3} textAnchor="middle" fontFamily="Anton" fontSize={rx * 0.85} fill={alpha("#0B3F82", 0.45)}
        transform={`translate(${cx} ${cy}) scale(1 0.34) translate(${-cx} ${-cy})`}>$</text>}
    </g>
  );
};

/** ★ A GLOSSY PRICE TAG on its string: a pointed swing tag (pointing LEFT, its eyelet at the point), its thickness up-right, a satin
 *  face; `children` print on it (in its own coordinates: the tag's box from (0,0) to (w,h), the point at the left) */
/** `flip`: the point (and its eyelet) on the RIGHT, the body to its left — the shape is mirrored, its thickness stays up-right on
 *  screen and its print (children) is never mirrored. The eyelet is a metal grommet (a ring with its own highlight) with the string's
 *  knot through it; a stitched border runs inside the edge. */
export const PriceTag: React.FC<{ id: string; w: number; h: number; tip?: number; d?: number; flip?: boolean; children?: React.ReactNode }> = ({ id, w, h, tip = h * 0.42, d = 12, flip = false, children }) => {
  const r = 14;
  const face = `M${tip} 0 H${w - r} Q${w} 0 ${w} ${r} V${h - r} Q${w} ${h} ${w - r} ${h} H${tip} L0 ${h / 2}Z`;
  const mir = flip ? `translate(${w} 0) scale(-1 1)` : undefined;
  const ex = flip ? w - tip * 0.5 : tip * 0.5, er = h * 0.075;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}F`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#FFFFFF" /><stop offset="0.55" stopColor="#D7E3F2" /><stop offset="1" stopColor="#7AA6DC" />
        </linearGradient>
        <linearGradient id={`${id}G`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F4F8FD" /><stop offset="0.5" stopColor="#6599D5" /><stop offset="1" stopColor="#19457A" />
        </linearGradient>
      </defs>
      <g transform={`translate(${d} ${-d * 0.7})`}><path d={face} transform={mir} fill="#2860A0" /></g>
      <path d={face} transform={mir} fill={`url(#${id}F)`} stroke={alpha("#FFFFFF", 0.85)} strokeWidth={2} />
      {/* the stitched border, a little inside the edge */}
      <path d={face} fill="none" stroke={alpha("#19457A", 0.32)} strokeWidth={2} strokeDasharray="9 7" transform={`${mir ?? ""} translate(${w * 0.05} ${h * 0.1}) scale(0.9 0.8)`} />
      {/* the grommet: a ring with its highlight, the dark hole, the string's knot through it */}
      <circle cx={ex} cy={h / 2} r={er * 1.65} fill={`url(#${id}G)`} />
      <circle cx={ex} cy={h / 2} r={er} fill="#0B2A55" />
      <path d={`M${ex - er * 1.3} ${h / 2 - er * 1.2} A${er * 1.6} ${er * 1.6} 0 0 1 ${ex + er * 1.3} ${h / 2 - er * 1.2}`} fill="none" stroke={alpha("#FFFFFF", 0.75)} strokeWidth={2} />
      <circle cx={ex} cy={h / 2 - er * 0.2} r={er * 0.45} fill="#D7E3F2" />
      {children}
    </g>
  );
};

/** ★ A PALE FLUTED COLUMN, whole (the demo's columns were cropped at the frame; these stand in a row): base, shaft with flutes
 *  shaded as a cylinder, necking, echinus and abacus. Drawn in HTML so its gradients stay crisp. `rise` 0..1 builds it upward. */
export const Column: React.FC<{ cx: number; base: number; h: number; sw?: number; rise?: number }> = ({ cx, base, h, sw = 120, rise = 1 }) => {
  const shaftH = h - 70;
  const vis = Math.max(0, Math.min(1, rise));
  return (
    <div style={{ position: "absolute", left: cx - sw * 0.75, top: base - h, width: sw * 1.5, height: h, clipPath: `inset(${((1 - vis) * 100).toFixed(2)}% -40px 0 -40px)`, filter: "drop-shadow(0 22px 34px rgba(0,28,60,0.28))" }}>
      {/* the abacus and the echinus */}
      <div style={{ position: "absolute", left: 0, top: 0, width: sw * 1.5, height: 26, background: "linear-gradient(180deg, #FFFFFF 0%, #D7E3F2 60%, #7AA6DC 100%)" }} />
      <div style={{ position: "absolute", left: sw * 0.1, top: 26, width: sw * 1.3, height: 28, borderRadius: "0 0 50% 50% / 0 0 100% 100%", background: "linear-gradient(90deg, #6599D5 0%, #F4F8FD 34%, #FFFFFF 46%, #C3D7EF 72%, #4079C0 100%)" }} />
      {/* the shaft: a cylinder's shading with its flutes (each ≥ 20 px, STYLE §6.9a — no fine repeating stripes) */}
      <div style={{ position: "absolute", left: sw * 0.25, top: 56, width: sw, height: shaftH - 30, background: "linear-gradient(90deg, #5388C9 0%, #E9F1FB 28%, #FFFFFF 40%, #CCDDF1 64%, #4079C0 100%)" }}>
        {[0.2, 0.4, 0.6, 0.8].map((t) => <div key={t} style={{ position: "absolute", left: `${t * 100}%`, top: 0, width: 4, height: "100%", background: alpha("#023065", 0.12), boxShadow: `3px 0 0 ${alpha("#FFFFFF", 0.45)}` }} />)}
      </div>
      {/* the base: a torus and a plinth */}
      <div style={{ position: "absolute", left: sw * 0.12, top: h - 44, width: sw * 1.26, height: 18, borderRadius: 9, background: "linear-gradient(90deg, #6599D5 0%, #F4F8FD 36%, #C3D7EF 70%, #4079C0 100%)" }} />
      <div style={{ position: "absolute", left: sw * 0.04, top: h - 26, width: sw * 1.42, height: 26, background: "linear-gradient(180deg, #FFFFFF 0%, #D7E3F2 60%, #7AA6DC 100%)" }} />
    </div>
  );
};

/** ★ A GLOSSY CARD (a bank card, credit): a rounded slab, its thickness up-right, a chip and a stripe of glints */
export const CardIcon: React.FC<{ id: string; x: number; y: number; w: number }> = ({ id, x, y, w }) => {
  const h = w * 0.63, r = w * 0.07, d = w * 0.05;
  const body = `M${x + r} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${y + h - r} Q${x + w} ${y + h} ${x + w - r} ${y + h} H${x + r} Q${x} ${y + h} ${x} ${y + h - r} V${y + r} Q${x} ${y} ${x + r} ${y}Z`;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}F`} x1="0" y1="0" x2="0.6" y2="1"><stop offset="0" stopColor="#99BBE4" /><stop offset="0.45" stopColor="#2860A0" /><stop offset="1" stopColor="#0A3164" /></linearGradient>
        <linearGradient id={`${id}C`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F5F9FD" /><stop offset="1" stopColor="#6599D5" /></linearGradient>
      </defs>
      <path d={body} transform={`translate(${d} ${-d * 0.7})`} fill="#072F63" />
      <path d={body} fill={`url(#${id}F)`} stroke={alpha("#FFFFFF", 0.6)} strokeWidth={2} />
      {/* ★ the parts a card has (Timur, 2026-10-13: "more detailed"): a satin sheen across it; the chip with its contact plates; the
          contactless mark; the number embossed in four groups (raised bars, each with its lit top edge — no digits to read); the
          cardholder line; two interlocking rings, a generic network mark (no real brand) */}
      <path d={`M${x + r} ${y} H${x + w * 0.62} L${x + w * 0.34} ${y + h} H${x + r} Q${x} ${y + h} ${x} ${y + h - r} V${y + r} Q${x} ${y} ${x + r} ${y}Z`} fill={alpha("#FFFFFF", 0.1)} />
      <rect x={x + w * 0.1} y={y + h * 0.28} width={w * 0.19} height={h * 0.26} rx={w * 0.025} fill={`url(#${id}C)`} stroke={alpha("#0A3164", 0.35)} strokeWidth={1.5} />
      <line x1={x + w * 0.1} x2={x + w * 0.29} y1={y + h * 0.37} y2={y + h * 0.37} stroke={alpha("#0A3164", 0.4)} strokeWidth={1.5} />
      <line x1={x + w * 0.1} x2={x + w * 0.29} y1={y + h * 0.45} y2={y + h * 0.45} stroke={alpha("#0A3164", 0.4)} strokeWidth={1.5} />
      <line x1={x + w * 0.195} x2={x + w * 0.195} y1={y + h * 0.28} y2={y + h * 0.54} stroke={alpha("#0A3164", 0.4)} strokeWidth={1.5} />
      {[0, 1, 2].map((i) => <path key={`cl${i}`} d={`M${x + w * (0.36 + i * 0.035)} ${y + h * (0.33 - i * 0.03)} q${w * 0.03} ${h * (0.08 + i * 0.03)} 0 ${h * (0.16 + i * 0.06)}`} fill="none" stroke={alpha("#F5F9FD", 0.7)} strokeWidth={Math.max(2, w * 0.008)} strokeLinecap="round" />)}
      {[0, 1, 2, 3].map((i) => (
        <g key={`ng${i}`}>
          <rect x={x + w * (0.1 + i * 0.205)} y={y + h * 0.64} width={w * 0.17} height={h * 0.075} rx={h * 0.03} fill={alpha("#072F63", 0.45)} />
          <rect x={x + w * (0.1 + i * 0.205)} y={y + h * 0.64} width={w * 0.17} height={h * 0.022} rx={h * 0.011} fill={alpha("#F5F9FD", 0.55)} />
        </g>
      ))}
      <rect x={x + w * 0.1} y={y + h * 0.8} width={w * 0.36} height={h * 0.05} rx={h * 0.025} fill={alpha("#D7E3F2", 0.45)} />
      <circle cx={x + w * 0.76} cy={y + h * 0.82} r={h * 0.085} fill={alpha("#D7E3F2", 0.55)} />
      <circle cx={x + w * 0.84} cy={y + h * 0.82} r={h * 0.085} fill={alpha("#6599D5", 0.55)} />
    </g>
  );
};
