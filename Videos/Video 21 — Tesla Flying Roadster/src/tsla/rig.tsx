import React from "react";
import { clamp01, mixHex } from "./anim";

// ══════════════════════════════════════════════════════════════════════════════════════════════
// THE PLANE RIG — real depth for a hero object (Timur, 2026-10-15, Video 11: "make the vault more 3d like, like in the recent [Style 3]
// video"; then "make sure the pie slices at 29 seconds are 3d"). Ported from the Style 3 films' rig (Style 3 Video 38 `rig.tsx`, which
// made Video 36's vault door reusable), in the Bankers blues — the technique crosses, never the other channel's palette.
// An object is a STACK OF PLANES parallel to its face, every plane projected through ONE shared perspective rig per object
// (perspective, pitch and yaw about the object's own centre), so its depth reads at rest. Planes paint back to front in DOM order —
// never preserve-3d (Chrome's depth sort is not stable in the sequential render: root CLAUDE.md, Style 3 V33). The object's planes
// sit inside a FLAT wrapper (`RigObject`), so a parent Turn's preserve-3d cannot pull them into its depth sort.
// A moving part (a door on its hinge) is a plane with its own transform inside the same rig.
// Conventions: x/y are the face's own pixels (for an upright object, the frame's pixels before the camera); +z points at the viewer
// (for a flat-lying object, UP out of the table); the face of a part is its top plane.
// ══════════════════════════════════════════════════════════════════════════════════════════════

export type Box = { x: number; y: number; w: number; h: number };
export type Rig = { cx: number; cy: number; persp: number; yaw: number; pitch: number };
export type Lyr = {
  /** depth of the plane (+ toward the viewer); also its paint order unless `order` is given */
  z: number; k: string; box: Box; el: React.ReactNode;
  op?: number; html?: boolean;
  /** a full transform for a moving part (from `moveT` / `pivotT`); default: the rig at z */
  t?: string;
  order?: number;
  /** not measured by the sweep's probe: a hidden side layer of a solid (its face plane stands for it) */
  skip?: boolean;
};

export const n2 = (v: number) => v.toFixed(2);
const head = (r: Rig) => `perspective(${r.persp}px) rotateX(${n2(r.pitch)}deg) rotateY(${n2(r.yaw)}deg)`;
/** a world-fixed plane at depth z */
export const rigT = (r: Rig, z: number) => `${head(r)} translateZ(${n2(z)}px)`;
/** a plane moved by (dx, dy, dz) in the object's own space, at depth z */
export const moveT = (r: Rig, dx: number, dy: number, z: number) => `${head(r)} translate3d(${n2(dx)}px, ${n2(dy)}px, ${n2(z)}px)`;
/** a plane turned by `rot` (a CSS rotate, e.g. rotateY(-24deg)) about an axis through point p of the object's space */
export const pivotT = (r: Rig, p: { x: number; y: number; z: number }, rot: string, z: number) =>
  `${head(r)} translate3d(${n2(p.x - r.cx)}px, ${n2(p.y - r.cy)}px, ${n2(p.z)}px) ${rot} translate3d(${n2(r.cx - p.x)}px, ${n2(r.cy - p.y)}px, ${n2(z - p.z)}px)`;

/** where a point (x, y, z) of the object lands on screen through the rig (before the camera): CSS's own order — translateZ,
 *  rotateY, rotateX, perspective — so a camera, a label or the lens bloom can aim at a part */
export const project = (r: Rig, x: number, y: number, z: number) => {
  const b = (r.yaw * Math.PI) / 180, a = (r.pitch * Math.PI) / 180;
  const dx = x - r.cx, dy = y - r.cy;
  const x1 = dx * Math.cos(b) + z * Math.sin(b), z1 = -dx * Math.sin(b) + z * Math.cos(b);
  const y2 = dy * Math.cos(a) - z1 * Math.sin(a), z2 = dy * Math.sin(a) + z1 * Math.cos(a);
  const s = r.persp / (r.persp - z2);
  return { x: r.cx + x1 * s, y: r.cy + y2 * s, s };
};

/** one plane: a box of the object, drawn in the object's coordinates (its SVG's viewBox is the box), its perspective centred on the rig */
export const Plane: React.FC<{ r: Rig; l: Lyr }> = ({ r, l }) => {
  const op = l.op ?? 1;
  if (op <= 0.001) return null;
  const { box } = l;
  return (
    <div {...(l.skip ? { "data-probe-skip": true } : {})} style={{ position: "absolute", left: box.x, top: box.y, width: box.w, height: box.h,
      transformOrigin: `${n2(r.cx - box.x)}px ${n2(r.cy - box.y)}px`, transform: l.t ?? rigT(r, l.z), opacity: op < 1 ? op : undefined }}>
      {l.html ? l.el : (
        <svg width={box.w} height={box.h} viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          {l.el}
        </svg>
      )}
    </div>
  );
};
/** a whole object: its layers painted back to front, inside a FLAT wrapper (see the header) */
export const RigObject: React.FC<{ r: Rig; layers: Lyr[] }> = ({ r, layers }) => (
  <div style={{ position: "absolute", inset: 0, transformStyle: "flat" }}>
    {[...layers].sort((a, b) => (a.order ?? a.z) - (b.order ?? b.z)).map((l) => <Plane key={l.k} r={r} l={l} />)}
  </div>
);

// ── geometry helpers ─────────────────────────────────────────────────────────────────────────────
export const around = (x: number, y: number, r: number): Box => ({ x: x - r, y: y - r, w: 2 * r, h: 2 * r });
export const grow = (b: Box, m: number): Box => ({ x: b.x - m, y: b.y - m, w: b.w + 2 * m, h: b.h + 2 * m });
/** layers from z0 to z1 every ~step px (both ends included) */
export const span = (z0: number, z1: number, step: number) => {
  const n = Math.max(1, Math.round(Math.abs(z1 - z0) / step));
  return Array.from({ length: n + 1 }, (_, i) => z0 + ((z1 - z0) * i) / n);
};
/** a solid's side colour at depth fraction u (0 back … 1 front): the deep navy toward the back, the key light's blue toward the front */
export const side = (u: number, lo = "#001C3C", hi = "#1F62B3") => mixHex(lo, hi, clamp01(u));
/** an annulus as one path (even-odd) */
export const ring = (cx: number, cy: number, r0: number, r1: number) =>
  `M${n2(cx - r1)},${n2(cy)} a${n2(r1)},${n2(r1)} 0 1,0 ${n2(2 * r1)},0 a${n2(r1)},${n2(r1)} 0 1,0 ${n2(-2 * r1)},0 Z ` +
  `M${n2(cx - r0)},${n2(cy)} a${n2(r0)},${n2(r0)} 0 1,0 ${n2(2 * r0)},0 a${n2(r0)},${n2(r0)} 0 1,0 ${n2(-2 * r0)},0 Z`;
/** a rounded rectangle as a path */
export const rrect = (b: Box, r: number) => {
  const { x, y, w, h } = b, q = Math.min(r, w / 2, h / 2);
  return `M${n2(x + q)},${n2(y)} H${n2(x + w - q)} Q${n2(x + w)},${n2(y)} ${n2(x + w)},${n2(y + q)} V${n2(y + h - q)} ` +
    `Q${n2(x + w)},${n2(y + h)} ${n2(x + w - q)},${n2(y + h)} H${n2(x + q)} Q${n2(x)},${n2(y + h)} ${n2(x)},${n2(y + h - q)} V${n2(y + q)} ` +
    `Q${n2(x)},${n2(y)} ${n2(x + q)},${n2(y)} Z`;
};
/** a rounded plate with holes (even-odd): a face with windows cut through it */
export const plateWithHoles = (b: Box, r: number, holes: { b: Box; r: number }[]) => [rrect(b, r), ...holes.map((h) => rrect(h.b, h.r))].join(" ");

// ── parts, each a stack of planes ────────────────────────────────────────────────────────────────
/** a cylinder whose axis points at the viewer (a hub, a knob, a dial drum): discs from z0 to z1, a face on top */
export const disc = (k: string, cx: number, cy: number, R: number, z0: number, z1: number, step: number, lo: string, hi: string, face?: string): Lyr[] => {
  const box = around(cx, cy, R + 2);
  return span(z0, z1, step).map((z, i, a) => {
    const top = i === a.length - 1;
    return { z, k: `${k}d${n2(z)}`, box, skip: !top,
      el: <circle cx={cx} cy={cy} r={R} fill={top && face ? face : side((z - z0) / Math.max(1, z1 - z0), lo, hi)} /> };
  });
};
/** hex bolt heads standing on a face at z0: three planes each */
export const hexBolts = (k: string, pts: { x: number; y: number }[], z0: number, box: Box, r = 10, rot = 0): Lyr[] =>
  ([[2, r + 2, "#0B3F82"], [5, r, "#6FA3DF"], [8, r - 3, "#E3EDF9"]] as [number, number, string][]).map(([dz, rr, col], i) => ({
    z: z0 + dz, k: `${k}b${dz}`, box, skip: i < 2,
    el: <g>{pts.map((p, j) => (
      <polygon key={j} fill={col} points={Array.from({ length: 6 }, (_, q) => {
        const a = ((q * 60 + rot) * Math.PI) / 180;
        return `${n2(p.x + rr * Math.cos(a))},${n2(p.y + rr * Math.sin(a))}`;
      }).join(" ")} />
    ))}</g>,
  }));
/** rivets: domes, three planes each */
export const rivets = (k: string, pts: { x: number; y: number }[], z0: number, box: Box, r = 7): Lyr[] =>
  ([[2, r, "#0B3F82"], [4, r * 0.77, "#4D8ED9"], [6, r * 0.46, "#B3CEEF"]] as [number, number, string][]).map(([dz, rr, col], i) => ({
    z: z0 + dz, k: `${k}r${dz}`, box, skip: i < 2, el: <g>{pts.map((p, j) => <circle key={j} cx={p.x} cy={p.y} r={rr} fill={col} />)}</g>,
  }));
/** a sphere: each plane is its section at that depth; a specular dot on top */
export const sphere = (k: string, cx: number, cy: number, cz: number, R: number, step: number, lo: string, hi: string, spec = 0.6): Lyr[] =>
  span(-R + 1.5, R - 1.5, step).map((dz, i, a) => {
    const r = Math.sqrt(R * R - dz * dz), u = (dz + R) / (2 * R);
    return { z: cz + dz, k: `${k}p${n2(dz)}`, box: around(cx, cy, R + 2), skip: i < a.length - 1, el: (
      <g>
        <circle cx={n2(cx)} cy={n2(cy)} r={n2(r)} fill={side(u, lo, hi)} />
        {dz > R - 4 - step && spec > 0 && <circle cx={n2(cx - R * 0.28)} cy={n2(cy - R * 0.32)} r={n2(R * 0.26)} fill="#FFFFFF" opacity={spec} />}
      </g>
    ) };
  });
/** a vertical cylinder (a post, a hinge barrel): each plane is a band of width 2√(R²−dz²) */
export const vcyl = (k: string, cx: number, y0: number, y1: number, cz: number, R: number, step: number, lo: string, hi: string, faceFill?: string): Lyr[] =>
  span(-R + 1, R, step).map((dz, i, a) => {
    const hw = Math.sqrt(Math.max(0, R * R - dz * dz)), u = (dz + R) / (2 * R), top = i === a.length - 1;
    return { z: cz + dz, k: `${k}v${n2(dz)}`, box: { x: cx - R - 2, y: y0 - 2, w: 2 * R + 4, h: y1 - y0 + 4 }, skip: !top, el: (
      <rect x={n2(cx - hw)} y={y0} width={n2(2 * hw)} height={y1 - y0} rx={n2(Math.min(hw, 4))} fill={top && faceFill ? faceFill : side(u, lo, hi)} />
    ) };
  });
