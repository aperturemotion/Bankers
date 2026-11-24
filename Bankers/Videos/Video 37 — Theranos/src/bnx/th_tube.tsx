// @ts-nocheck
// ★ V37 "Theranos" — th_tube.tsx: THE NANOTAINER and THE DROP. Owned by builder H; the hook builds on it, builder B imports it for
//   claim2 (the tube rides a cartridge into the Edison). Read only — ask builder H for a change.
//
//   The nanotainer is Theranos's thumb-sized sample tube, built as ONE real turned solid in 3-D (Timur's Video 36 vial rule: every
//   ring of it projected through the one view, so the mouth, the rim, the label band and the domed well all share one perspective):
//     · a clear moulded body with a thickened rim and a foot lip — a SKIRTED microtube: the sample well inside ends in a rounded
//       (hemispherical) bottom above the foot, so the tube stands on its own; the empty skirt shows through the clear plastic
//     · a coloured snap cap (house blue, ribbed skirt, domed top with a recessed centre) on a hinge strap at the back-right of the
//       rim: closed over the mouth (open = 0) or flipped open and hanging upside-down beside the tube (open = 1)
//     · a white paper label band high on the body, wrapped round it: THERANOS (the label text comes from the caller, L("hookTube"))
//       set letter by letter ON the cylinder (each glyph foreshortened by its angle), a fine rule above and below, a barcode
//     · the blood inside: a dark glossy column filling the well from its domed bottom (fill 0…1), its surface a meniscus disc
//     · one key light from the upper left: every turned band is shaded by sampling the light round its circumference (smooth, no
//       facets), the clear walls by Fresnel (clear in the middle, denser at the silhouette) with a specular streak on the lit side
//
//   <ThTube
//      x y            screen point (px) of the tube's FOOT centre (where it stands)
//      scale          px per tube unit — the tube is 100 units from foot to closed cap top (TH_TUBE.H); 22 units in radius
//      fill={0.3}     0…1  the blood level in the well (0 = empty, 1 = to the rim)
//      tilt={0}       degrees: the tube leans in the picture plane about its foot (+ = top to the right)
//      lit={0}        0…1  a light on it: a soft glow round the tube and brighter glints (e.g. inside the Edison's lit slot)
//      stage={0}      0…1  the white stage: outlines and print turn navy so the clear tube still reads on white
//      open={0}       0…1  the cap: 0 = snapped shut, 1 = flipped open and hanging beside the tube (the hook opens it for the drops)
//      pitch={-14}    the view's pitch (deg; negative = looking down on it)  ·  yaw={0} the view's yaw (deg)
//      persp={900}    the view's perspective distance in tube units (large = flat)
//      label          the label's text (pass L("hookTube")); omit for a blank label
//      drops=[]       drops on the tube's axis, drawn in their true layer: [{ s, r, neck, stretch }] — s = the drop's centre height
//                     above the foot (tube units), r = radius (units); one inside the well sinks into the blood (clipped at the
//                     surface: it goes ALL the way in), one above the rim is drawn in front
//      ripple={null}  { s, k } — a ring spreading on the blood surface (k 0…1 over ≈ 14 f) after a drop merges
//      id             unique id prefix (gradients) />
//   thTubePoint({ x, y, scale, tilt, pitch, yaw, persp }, s, r = 0, theta = 0) → [x, y] screen point of a spot on/in the tube
//                  (s = height above the foot; r = radius from the axis; theta = angle round it, 0 = facing the viewer)
//   thLevelS(fill) → the blood surface's height above the foot (tube units)   ·   TH_TUBE = the dimensions (units)
//   <ThDrop x y r neck={0} stretch={0} lit={1} id />   the glossy red drop alone, in screen px: (x, y) the centre of its round
//                  body, r its radius; neck 0…1 draws it HANGING (a pear whose neck runs up to a tip at y − r − 1.6·r·neck);
//                  stretch 0…1 elongates it a little as it falls. House red, the key light's specular at its upper left, the
//                  light it lets through glowing at its lower right.
//   thLathe        the turned-solid helpers (projector, turned band, front arc), for other turned objects (the hook's lancet)
import * as jsx_runtime from "react/jsx-runtime";
import { clamp01, mixHex } from "./anim";
import { lightOf, rampAt } from "./solid_engine";
import { VOICE } from "./fonts";

const jsx = (t, p, k) => (0,jsx_runtime.jsx)(t, p, k);
const jsxs = (t, p, k) => (0,jsx_runtime.jsxs)(t, p, k);
const f2 = (v) => v.toFixed(2);
const D2R = Math.PI / 180;
// ── the dimensions (tube units; the foot at s = 0, the axis up) ─────────────────────────────────────────────────────────────
export const TH_TUBE = {
  H: 100,
  R: 22,          // the clear body's outer radius
  RIM: 82,        // the mouth's top
  RI: 18.4,       // the well's inner radius
  BOT: 13,        // the apex of the well's domed bottom (the skirt below it is empty)
  LAB: [55, 73],  // the label band
  CAP: { R: 25.2, L: 21.5, SEAT: 77.5 }, // the cap: radius, length, the height its open end sits at when closed
  HINGE: 128      // the hinge strap's angle round the rim (deg; 0 = the front, + = toward the viewer's right)
};
export const thLevelS = (fill) => TH_TUBE.BOT + (TH_TUBE.RIM - 3 - TH_TUBE.BOT) * clamp01(fill);
// ── the materials (house ramps: blue-steel family; red only for the blood) ──────────────────────────────────────────────────
const CAP_RAMP = ["#0A1B33", "#103664", "#1B5498", "#5C93D3", "#DCE8F6"];
const LABEL_RAMP = ["#5D6A7B", "#93A1B2", "#C9D3DF", "#EEF2F7", "#FFFFFF"];
const BLOOD_RAMP = ["#2C0208", "#5A0512", "#8E0B1E", "#C21A2F", "#F05A68"];
const GLASS = "#CFE0F3";
const INK = "#0E2747";
// ── projection: tube-local points (x right, y down, z toward the viewer) → view space → screen ────────────────────────────────
const mkProj = ({ x, y, scale, tilt = 0, pitch = -14, yaw = 0, persp = 900 }) => {
  const rz = tilt * D2R, b = yaw * D2R, a = pitch * D2R;
  const cz = Math.cos(rz), sz = Math.sin(rz), cb = Math.cos(b), sb = Math.sin(b), ca = Math.cos(a), sa = Math.sin(a);
  const rot = (q) => {
    const x0 = q[0] * cz - q[1] * sz, y0 = q[0] * sz + q[1] * cz, z0 = q[2];
    const x1 = x0 * cb + z0 * sb, z1 = -x0 * sb + z0 * cb;
    return [x1, y0 * ca - z1 * sa, y0 * sa + z1 * ca];
  };
  const V = rot;
  const P = (q) => {
    const v = rot(q), k = persp / Math.max(1, persp - v[2]);
    return [x + scale * v[0] * k, y + scale * v[1] * k];
  };
  // a surface point q with outward normal n faces the eye?
  const facing = (q, n) => {
    const v = rot(q), m = rot(n);
    return m[0] * -v[0] + m[1] * -v[1] + m[2] * (persp - v[2]);
  };
  const light = (n, spec = 0.5, shin = 26) => lightOf(unit(rot(n)), spec, shin);
  return { P, V, facing, light, scale, persp };
};
const unit = (a) => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const hull = (pts) => {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], hi = [];
  for (const q of p) {
    while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop();
    lo.push(q);
  }
  for (const q of [...p].reverse()) {
    while (hi.length >= 2 && cr(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop();
    hi.push(q);
  }
  return [...lo.slice(0, -1), ...hi.slice(0, -1)];
};
const poly = (pts, close = true) => pts.length ? `M${pts.map((p) => `${f2(p[0])},${f2(p[1])}`).join("L")}${close ? "Z" : ""}` : "";
// a frame for a turned solid: origin o, axis a (the profile's s runs along it), e1/e2 round it (θ = 0 along e1)
const frameOf = (o, a, e1) => {
  const A = unit(a), E1 = unit(e1), E2 = cross(A, E1);
  const at = (s, r, th) => [0, 1, 2].map((i) => o[i] + A[i] * s + r * (Math.cos(th) * E1[i] + Math.sin(th) * E2[i]));
  const nrm = (th, tiltN = 0) => {
    const c = Math.cos(th), s = Math.sin(th);
    return unit([0, 1, 2].map((i) => (c * E1[i] + s * E2[i]) * Math.cos(tiltN) + A[i] * Math.sin(tiltN)));
  };
  return { o, a: A, e1: E1, e2: E2, at, nrm };
};
const NS = 48;
const ring = (pr, fr, s, r, n = NS) => Array.from({ length: n }, (_, i) => pr.P(fr.at(s, r, i / n * 2 * Math.PI)));
// the arc of a ring that faces the eye (for a band's front edge), ordered round the ring, continuous
const frontArc = (pr, fr, s, r, n = 72, nTilt = 0) => {
  const ok = [];
  for (let i = 0; i < n; i++) {
    const th = i / n * 2 * Math.PI;
    ok.push(pr.facing(fr.at(s, r, th), fr.nrm(th, nTilt)) > 0);
  }
  // start just after a non-facing sample
  let st = ok.findIndex((v, i) => !v && ok[(i + 1) % n]);
  if (st < 0) return ok[0] ? Array.from({ length: n + 1 }, (_, i) => pr.P(fr.at(s, r, i / n * 2 * Math.PI))) : [];
  const out = [];
  for (let k = 1; k <= n; k++) {
    const i = (st + k) % n;
    if (!ok[i]) break;
    out.push(pr.P(fr.at(s, r, i / n * 2 * Math.PI)));
  }
  return out;
};
const backArc = (pr, fr, s, r, n = 72) => {
  const ok = [];
  for (let i = 0; i < n; i++) {
    const th = i / n * 2 * Math.PI;
    ok.push(pr.facing(fr.at(s, r, th), fr.nrm(th)) <= 0);
  }
  let st = ok.findIndex((v, i) => !v && ok[(i + 1) % n]);
  if (st < 0) return [];
  const out = [];
  for (let k = 1; k <= n; k++) {
    const i = (st + k) % n;
    if (!ok[i]) break;
    out.push(pr.P(fr.at(s, r, i / n * 2 * Math.PI)));
  }
  return out;
};
// a turned band s0…s1 (radius r0 → r1): its silhouette (hull of its two rings) and the light sampled round it, as a linear
//   gradient across the band perpendicular to its projected axis (lit edge → dark edge) — the smooth shading of a turned body
const turned = (pr, fr, s0, s1, r0, r1, shade, n = 64) => {
  const outline = hull([...ring(pr, fr, s0, Math.max(0.05, r0)), ...ring(pr, fr, s1, Math.max(0.05, r1))]);
  const sm = (s0 + s1) / 2, rm = (r0 + r1) / 2;
  const c = pr.P(fr.at(sm, 0, 0)), ca = pr.P(fr.at(sm + 1, 0, 0));
  let nx = -(ca[1] - c[1]), ny = ca[0] - c[0];
  const nl = Math.hypot(nx, ny);
  if (nl < 1e-6) {
    nx = 1;
    ny = 0;
  } else {
    nx /= nl;
    ny /= nl;
  }
  if (nx * -0.6 + ny * -0.8 < 0) {
    nx = -nx;
    ny = -ny;
  }
  const slope = Math.atan2(r0 - r1, s1 - s0);
  const samp = [];
  let hw = 1e-3;
  for (let i = 0; i < n; i++) {
    const th = i / n * 2 * Math.PI, q = fr.at(sm, rm, th), nn = fr.nrm(th, slope);
    const p = pr.P(q), o = (p[0] - c[0]) * nx + (p[1] - c[1]) * ny;
    hw = Math.max(hw, Math.abs(o));
    if (pr.facing(q, nn) > 0) samp.push({ o, l: pr.light(nn, 0.6, 30), th });
  }
  const stops = samp.map((q) => ({ t: clamp01((hw - q.o) / (2 * hw)), ...shade(q.l, Math.abs(q.o) / hw, q.th) })).sort((a, b) => a.t - b.t);
  const lit = [c[0] + nx * hw, c[1] + ny * hw], dark = [c[0] - nx * hw, c[1] - ny * hw];
  return { d: poly(outline), stops, x1: lit[0], y1: lit[1], x2: dark[0], y2: dark[1], hw, c, n: [nx, ny] };
};
const Grad = ({ id, g }) => jsx("linearGradient", { id, gradientUnits: "userSpaceOnUse", x1: f2(g.x1), y1: f2(g.y1), x2: f2(g.x2), y2: f2(g.y2), children: g.stops.map((s, i) => jsx("stop", { offset: s.t.toFixed(4), stopColor: s.c, stopOpacity: s.a ?? 1 }, i)) });
// a lit streak running along a turned band at angle th (only where it faces the eye)
const streak = (pr, fr, th, s0, s1, r, n = 14) => {
  const pts = [];
  for (let k = 0; k <= n; k++) {
    const s = s0 + (s1 - s0) * k / n, q = fr.at(s, r, th);
    if (pr.facing(q, fr.nrm(th)) > 0) pts.push(pr.P(q));
  }
  return pts.length > 1 ? poly(pts, false) : "";
};
// the angle round a frame that faces the key light most (the highlight's side), measured in view space
const keyAngle = (pr, fr) => {
  let best = 0, bl = -9;
  for (let i = 0; i < 72; i++) {
    const th = i / 72 * 2 * Math.PI, nn = fr.nrm(th);
    if (pr.facing(fr.at(0, 1, th), nn) <= 0) continue;
    const l = pr.light(nn, 0, 1);
    if (l > bl) {
      bl = l;
      best = th;
    }
  }
  return best;
};
export const thLathe = { mkProj, frameOf, ring, frontArc, backArc, turned, Grad, streak, keyAngle, hull, poly };
export const thTubePoint = (view, s, r = 0, theta = 0) => {
  const pr = mkProj(view);
  return pr.P([r * Math.sin(theta), -s, r * Math.cos(theta)]);
};
// ── the cap's pose: closed over the mouth, or swung about the hinge strap's axis (a tangent at the rim) to hang open ────────────
const capFrame = (open) => {
  const { CAP, HINGE, R } = TH_TUBE;
  const th = HINGE * D2R;
  const rad = [Math.sin(th), 0, Math.cos(th)], tan = [Math.cos(th), 0, -Math.sin(th)];
  const H = [rad[0] * (R + 3.4), -(CAP.SEAT + CAP.L * 0.32), rad[2] * (R + 3.4)];
  // Rodrigues about the tangent through H; the sign swings the cap OUTWARD (its centre moves along +rad)
  const ang = -196 * D2R * open;
  const c = Math.cos(ang), s = Math.sin(ang);
  const rotV = (v) => {
    const k = tan, d = k[0] * v[0] + k[1] * v[1] + k[2] * v[2], kx = cross(k, v);
    return [0, 1, 2].map((i) => v[i] * c + kx[i] * s + k[i] * d * (1 - c));
  };
  const rotP = (p) => {
    const v = rotV([p[0] - H[0], p[1] - H[1], p[2] - H[2]]);
    return [v[0] + H[0], v[1] + H[1], v[2] + H[2]];
  };
  const o = rotP([0, -CAP.SEAT, 0]);
  return { fr: frameOf(o, rotV([0, -1, 0]), rotV([0, 0, 1])), H, rad };
};
// ── the cap (house-blue moulded plastic): ribbed skirt, rounded shoulder, a domed top with a recessed centre; inside dark ───────
const Cap = ({ pr, open, id, stage, lit }) => {
  const { CAP } = TH_TUBE;
  const { fr } = capFrame(open);
  const R = CAP.R, L = CAP.L;
  const shade = (l) => ({ c: rampAt(CAP_RAMP, 0.86 * l + 0.04 + 0.12 * lit) });
  const skirt = turned(pr, fr, 0, L - 4, R, R, shade);
  const shoulder = turned(pr, fr, L - 4, L, R, R - 4.2, shade);
  // the top disc and the open end: which of them faces the eye
  const topN = fr.a, topQ = fr.at(L, 0, 0);
  const seeTop = pr.facing(topQ, topN) > 0;
  const seeIn = pr.facing(fr.at(0, 0, 0), topN.map((v) => -v)) > 0;
  const topL = pr.light(topN, 0.7, 40);
  const ribs = [];
  for (let i = 0; i < 40; i++) {
    const th = i / 40 * 2 * Math.PI, q = fr.at(1.5, R + 0.05, th);
    if (pr.facing(q, fr.nrm(th)) <= 0.05) continue;
    const a = pr.P(fr.at(1.8, R + 0.05, th)), b = pr.P(fr.at(L - 5, R + 0.05, th));
    const l = pr.light(fr.nrm(th + 0.06));
    ribs.push({ d: `M${f2(a[0])},${f2(a[1])}L${f2(b[0])},${f2(b[1])}`, c: rampAt(CAP_RAMP, 0.95 * l + 0.1), dk: l < 0.5 });
  }
  const kth = keyAngle(pr, fr);
  const sw = Math.max(0.5, 0.55 * pr.scale);
  return jsxs("g", { children: [
    jsxs("defs", { children: [jsx(Grad, { id: `${id}Cs`, g: skirt }), jsx(Grad, { id: `${id}Ch`, g: shoulder })] }),
    // the inside of the cap (seen when it hangs open, mouth toward the eye): a dark well with its inner ring
    jsx("path", { d: skirt.d, fill: `url(#${id}Cs)` }),
    // the inside of the cap, seen through its open end: a dark moulded well with its inner liner ring
    seeIn && jsx("path", { d: poly(ring(pr, fr, 0, R - 1.6)), fill: rampAt(CAP_RAMP, 0.16) }),
    seeIn && jsx("path", { d: poly(ring(pr, fr, 0, R - 6.5)), fill: rampAt(CAP_RAMP, 0.08), opacity: 0.9 }),
    seeIn && jsx("path", { d: poly(frontArc(pr, fr, 0.2, R - 6.5, 72, Math.PI / 2)), stroke: rampAt(CAP_RAMP, 0.5), strokeWidth: sw * 0.8, opacity: 0.6, fill: "none" }),
    ribs.map((r, i) => jsx("path", { d: r.d, stroke: r.dk ? "#061328" : r.c, strokeWidth: sw * (r.dk ? 0.9 : 0.7), opacity: r.dk ? 0.55 : 0.6, fill: "none" }, i)),
    jsx("path", { d: shoulder.d, fill: `url(#${id}Ch)` }),
    seeTop && jsx("path", { d: poly(ring(pr, fr, L, R - 4.2)), fill: rampAt(CAP_RAMP, 0.8 * topL + 0.05 + 0.1 * lit) }),
    seeTop && jsx("path", { d: poly(ring(pr, fr, L - 0.6, R - 10)), fill: rampAt(CAP_RAMP, 0.62 * topL + 0.02), opacity: 0.85 }),
    seeTop && jsx("path", { d: poly(frontArc(pr, fr, L - 0.6, R - 10), false), stroke: rampAt(CAP_RAMP, 1), strokeWidth: sw * 0.8, opacity: 0.5, fill: "none" }),
    // the open end's rim (when it faces the eye) and the key light's glint along the shoulder
    seeIn && jsx("path", { d: poly(frontArc(pr, fr, 0, R, 72, -Math.PI / 2), false), stroke: rampAt(CAP_RAMP, 0.95), strokeWidth: sw * 1.2, opacity: 0.8, fill: "none" }),
    jsx("path", { d: streak(pr, fr, kth, 2, L - 3, R + 0.1), stroke: "#FFFFFF", strokeWidth: sw * 1.6, opacity: 0.55 + 0.3 * lit, fill: "none", strokeLinecap: "round" }),
    stage > 0.01 && jsx("path", { d: skirt.d, fill: "none", stroke: INK, strokeWidth: sw, opacity: 0.5 * stage })
  ] });
};
// ── the drop ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const dropPath = (x, y, r, neck) => {
  const nk = neck * r * 1.6, k = 0.552 * (1 - 0.55 * neck);
  const ty = y - r - nk;
  return `M${f2(x)},${f2(ty)}C${f2(x + r * k)},${f2(ty + nk * 0.35)} ${f2(x + r)},${f2(y - r * 0.552 - nk * 0.15)} ${f2(x + r)},${f2(y)}A${f2(r)},${f2(r)} 0 0 1 ${f2(x - r)},${f2(y)}C${f2(x - r)},${f2(y - r * 0.552 - nk * 0.15)} ${f2(x - r * k)},${f2(ty + nk * 0.35)} ${f2(x)},${f2(ty)}Z`;
};
export const ThDrop = ({ x, y, r, neck = 0, stretch = 0, lit = 1, id = "thD" }) => {
  if (r <= 0.2) return null;
  const sy = 1 + 0.22 * stretch, sx = 1 / Math.sqrt(sy);
  const T = `translate(${f2(x)} ${f2(y)}) scale(${sx.toFixed(4)} ${sy.toFixed(4)}) translate(${f2(-x)} ${f2(-y)})`;
  const d = dropPath(x, y, r, neck);
  return jsxs("g", { transform: T, children: [
    jsxs("defs", { children: [
      jsxs("radialGradient", { id: `${id}B`, gradientUnits: "userSpaceOnUse", cx: f2(x + 0.28 * r), cy: f2(y + 0.34 * r), r: f2(1.45 * r), fx: f2(x + 0.34 * r), fy: f2(y + 0.42 * r), children: [
        jsx("stop", { offset: "0", stopColor: "#FF6E79" }),
        jsx("stop", { offset: "0.22", stopColor: "#EF2B3D" }),
        jsx("stop", { offset: "0.55", stopColor: "#B3122A" }),
        jsx("stop", { offset: "0.82", stopColor: "#6E0716" }),
        jsx("stop", { offset: "1", stopColor: "#3E020B" })
      ] }),
      jsxs("radialGradient", { id: `${id}S`, gradientUnits: "userSpaceOnUse", cx: f2(x - 0.36 * r), cy: f2(y - 0.42 * r - neck * r * 0.3), r: f2(0.42 * r), children: [
        jsx("stop", { offset: "0", stopColor: "#FFFFFF", stopOpacity: 0.95 * lit }),
        jsx("stop", { offset: "0.45", stopColor: "#FFFFFF", stopOpacity: 0.5 * lit }),
        jsx("stop", { offset: "1", stopColor: "#FFFFFF", stopOpacity: 0 })
      ] })
    ] }),
    jsx("path", { d, fill: `url(#${id}B)` }),
    // the key light's window on its upper left, a sharp core inside a soft bloom; the far rim's thin reflected light
    jsx("ellipse", { cx: f2(x - 0.36 * r), cy: f2(y - 0.42 * r - neck * r * 0.3), rx: f2(0.42 * r), ry: f2(0.34 * r), fill: `url(#${id}S)` }),
    jsx("ellipse", { cx: f2(x - 0.38 * r), cy: f2(y - 0.44 * r - neck * r * 0.3), rx: f2(0.15 * r), ry: f2(0.1 * r), fill: "#FFFFFF", opacity: 0.92 * lit, transform: `rotate(-38 ${f2(x - 0.38 * r)} ${f2(y - 0.44 * r - neck * r * 0.3)})` }),
    jsx("path", { d: `M${f2(x + 0.62 * r)},${f2(y + 0.42 * r)}A${f2(0.78 * r)},${f2(0.78 * r)} 0 0 1 ${f2(x + 0.05 * r)},${f2(y + 0.78 * r)}`, stroke: "#FF8A93", strokeWidth: f2(Math.max(0.6, 0.07 * r)), opacity: 0.55, fill: "none", strokeLinecap: "round" }),
    neck > 0.05 && jsx("path", { d: `M${f2(x - 0.12 * r)},${f2(y - r - neck * r * 1.2)}L${f2(x - 0.3 * r)},${f2(y - 0.95 * r)}`, stroke: "#FFFFFF", strokeWidth: f2(Math.max(0.5, 0.06 * r)), opacity: 0.45 * neck * lit, fill: "none", strokeLinecap: "round" }),
    jsx("path", { d, fill: "none", stroke: "#3A0209", strokeWidth: f2(Math.max(0.5, 0.035 * r)), opacity: 0.5 })
  ] });
};
// ── the tube ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
export const ThTube = ({ x, y, scale, fill = 0.3, tilt = 0, lit = 0, stage = 0, open = 0, pitch = -14, yaw = 0, persp = 900, label, drops = [], ripple = null, id = "thT" }) => {
  const T = TH_TUBE;
  const pr = mkProj({ x, y, scale, tilt, pitch, yaw, persp });
  const fr = frameOf([0, 0, 0], [0, -1, 0], [0, 0, 1]);
  const sw = Math.max(0.45, 0.5 * scale);
  const st = clamp01(stage), lt = clamp01(lit);
  const edge = mixHex(GLASS, INK, st);
  // ── the clear body ──
  const glassShade = (l, e) => ({ c: mixHex(mixHex("#9FBCDD", "#F2F7FD", clamp01((l - 0.3) / 0.8)), INK, 0.6 * st), a: 0.05 + 0.1 * lt + 0.42 * Math.pow(e, 5) + 0.12 * clamp01(l - 0.75) });
  const body = turned(pr, fr, 1.2, T.RIM, T.R, T.R, glassShade);
  const outline = hull([...ring(pr, fr, 0, T.R + 0.5), ...ring(pr, fr, T.RIM, T.R + 1.1)]);
  // ── the well and the blood ──
  const wellR = (s) => s >= T.BOT + T.RI ? T.RI : Math.sqrt(Math.max(0, T.RI * T.RI - (T.BOT + T.RI - s) ** 2));
  const L = thLevelS(fill);
  const wellSteps = [];
  for (let k = 0; k <= 10; k++) wellSteps.push(T.BOT + T.RI * (1 - Math.cos(k / 10 * Math.PI / 2)));
  const wellHull = hull([...wellSteps.flatMap((s) => ring(pr, fr, s, Math.max(0.3, wellR(s)), 32)), ...ring(pr, fr, T.RIM, T.RI, 32)]);
  const bloodShade = (l) => ({ c: rampAt(BLOOD_RAMP, 0.78 * l + 0.02) });
  const bloodSteps = [];
  for (let k = 0; k <= 12; k++) {
    const s = T.BOT + (L - T.BOT) * k / 12;
    bloodSteps.push(...ring(pr, fr, s, Math.max(0.3, wellR(s) * 0.985), 40));
  }
  const hasBlood = L > T.BOT + 0.5;
  const bloodG = hasBlood ? turned(pr, fr, Math.max(T.BOT + 1, L - 14), L, wellR(L) * 0.985, wellR(L) * 0.985, bloodShade) : null;
  const bloodD = hasBlood ? poly(hull(bloodSteps)) : "";
  const surfR = wellR(L) * 0.985;
  const surf = ring(pr, fr, L, surfR, 56);
  const surfL = pr.light([0, -1, 0], 0.9, 60);
  // ── drops: in the well (clipped at the blood surface), above the rim (in front) ──
  const lowArc = (() => {
    // the surface ring's lower (front) half, for the clip that sinks a drop into the blood
    const pts = ring(pr, fr, L, surfR, 56);
    const c = pr.P(fr.at(L, 0, 0));
    return pts.filter((p) => p[1] >= c[1] - 1e-6).sort((a, b) => a[0] - b[0]);
  })();
  const clipD = (() => {
    if (lowArc.length < 2) return "";
    const a = lowArc[0], b = lowArc[lowArc.length - 1];
    return poly([[a[0] - 4000, a[1]], ...lowArc, [b[0] + 4000, b[1]], [b[0] + 4000, a[1] - 6000], [a[0] - 4000, a[1] - 6000]]);
  })();
  const dropEl = (q, i, clip) => {
    const c = pr.P(fr.at(q.s, 0, 0)), k = Math.hypot(...[0, 1].map((j) => pr.P(fr.at(q.s, 1, 0))[j] - c[j]));
    const el = jsx(ThDrop, { x: c[0], y: c[1], r: q.r * Math.max(k, scale * 0.9), neck: q.neck ?? 0, stretch: q.stretch ?? 0, lit: 1, id: `${id}d${i}` });
    return clip ? jsx("g", { clipPath: `url(#${id}Dc)`, children: el }, `d${i}`) : jsx("g", { children: el }, `d${i}`);
  };
  const inDrops = drops.filter((q) => q.s - q.r < T.RIM && q.s + q.r > L - 2 * q.r);
  const upDrops = drops.filter((q) => q.s - q.r >= T.RIM);
  // ── the label band, its print set on the cylinder ──
  const [la, lb] = T.LAB, LR = T.R + 0.35;
  const labShade = (l) => ({ c: mixHex(rampAt(LABEL_RAMP, 0.8 * l + 0.12), "#FFFFFF", 0.1 * lt) });
  const labG = turned(pr, fr, la, lb, LR, LR, labShade);
  const labBand = (() => {
    const bot = frontArc(pr, fr, la, LR), top = frontArc(pr, fr, lb, LR);
    return poly([...bot, ...[...top].reverse()]);
  })();
  const glyphs = (() => {
    if (!label) return [];
    // per-letter advances (Figtree semibold caps, em) so the tracked word sets evenly round the curve
    const ADV = { I: 0.3, J: 0.5, M: 0.86, W: 0.98, T: 0.6, E: 0.58, F: 0.56, L: 0.54, S: 0.6, O: 0.78, Q: 0.78, C: 0.7, G: 0.74, N: 0.74, H: 0.74, A: 0.7, R: 0.64, " ": 0.3 };
    const FS = 7.4, TRK = 1.1;
    const chars = [...label], adv = chars.map((c) => (ADV[c] ?? 0.66) * FS);
    const tot = adv.reduce((a, b) => a + b, 0) + TRK * (chars.length - 1);
    const sm = la + (lb - la) * 0.53;
    let u = -tot / 2;
    return chars.map((ch, i) => {
      const uc = u + adv[i] / 2;
      u += adv[i] + TRK;
      const th = -uc / LR;
      const q = fr.at(sm, LR + 0.05, th);
      const p = pr.P(q), dt = 0.01;
      const pa = pr.P(fr.at(sm, LR + 0.05, th + dt)), pb = pr.P(fr.at(sm, LR + 0.05, th - dt));
      const ux = (pb[0] - pa[0]) / (2 * dt * LR), uy = (pb[1] - pa[1]) / (2 * dt * LR);
      const pv = pr.P(fr.at(sm - 0.5, LR + 0.05, th)), pw = pr.P(fr.at(sm + 0.5, LR + 0.05, th));
      const vx = pv[0] - pw[0], vy = pv[1] - pw[1];
      return { ch, fs: FS, m: `matrix(${ux.toFixed(5)} ${uy.toFixed(5)} ${vx.toFixed(5)} ${vy.toFixed(5)} ${f2(p[0])} ${f2(p[1])})`, vis: pr.facing(q, fr.nrm(th)) > 0 ? clamp01((Math.cos(th) - 0.05) / 0.25) : 0 };
    });
  })();
  const rule = (s) => poly(frontArc(pr, fr, s, LR + 0.06), false);
  const bars = (() => {
    // a barcode round the label's right side
    const out = [];
    const W = [1, 2, 1, 1, 3, 1, 2, 1, 1, 2, 3, 1, 1, 2, 1, 3, 1, 1, 2, 1];
    let th = 1.08;
    for (let i = 0; i < W.length; i++) {
      const w = W[i] * 0.018;
      if (i % 2 === 0) {
        const tc = th + w / 2, q = fr.at(la + 3, LR + 0.06, tc);
        if (pr.facing(q, fr.nrm(tc)) > 0) {
          const a = pr.P(fr.at(la + 2.6, LR + 0.06, tc)), b = pr.P(fr.at(lb - 4.2, LR + 0.06, tc));
          out.push({ d: `M${f2(a[0])},${f2(a[1])}L${f2(b[0])},${f2(b[1])}`, w: Math.max(0.3, w * LR * scale * Math.max(0.15, Math.cos(tc - 0.0))) });
        }
      }
      th += w + 0.012;
    }
    return out;
  })();
  // ── the cap: behind the tube's body (draw first) or in front of it ──
  const capO = capFrame(open).fr.at(TH_TUBE.CAP.L / 2, 0, 0);
  const capFront = pr.V(capO)[2] > pr.V([0, -T.RIM, 0])[2] + 4;
  const capEl = jsx(Cap, { pr, open, id, stage: st, lit: lt });
  const kth = keyAngle(pr, fr);
  const rimTop = poly(ring(pr, fr, T.RIM, T.R + 1.1, 64)) + poly(ring(pr, fr, T.RIM, T.RI, 64));
  const capCovers = open < 0.02;
  const capFrontK = 1 - clamp01((open - 0.05) / 0.8);
  const capBack = capFrontK >= 0.999 ? 0 : 1;
  return jsxs("g", { "data-probe-skip": true, children: [
    jsxs("defs", { children: [
      jsx(Grad, { id: `${id}G`, g: body }),
      bloodG && jsx(Grad, { id: `${id}Bl`, g: bloodG }),
      jsx(Grad, { id: `${id}Lb`, g: labG }),
      clipD && jsx("clipPath", { id: `${id}Dc`, clipPathUnits: "userSpaceOnUse", children: jsx("path", { d: clipD }) }),
      lt > 0.01 && jsxs("radialGradient", { id: `${id}Gl`, gradientUnits: "userSpaceOnUse", cx: f2(pr.P([0, -48, 0])[0]), cy: f2(pr.P([0, -48, 0])[1]), r: f2(95 * scale), children: [
        jsx("stop", { offset: "0", stopColor: "#CFE2F7", stopOpacity: 0.32 * lt }),
        jsx("stop", { offset: "1", stopColor: "#CFE2F7", stopOpacity: 0 })
      ] })
    ] }),
    lt > 0.01 && jsx("circle", { cx: f2(pr.P([0, -48, 0])[0]), cy: f2(pr.P([0, -48, 0])[1]), r: f2(95 * scale), fill: `url(#${id}Gl)` }),
    // the cap hanging open behind the tube; as it swings shut it crosses in front (a cross-fade over the swing, never a swap)
    capBack > 0.01 && jsx("g", { opacity: capBack, children: capEl }),
    // the back of the clear body: a faint tint, the back halves of the foot and rim rings
    jsx("path", { d: poly(outline), fill: mixHex("#20446E", INK, st), opacity: 0.16 }),
    jsx("path", { d: poly(backArc(pr, fr, T.RIM, T.R + 1.1), false), stroke: edge, strokeWidth: sw * 0.9, opacity: 0.35, fill: "none" }),
    jsx("path", { d: poly(backArc(pr, fr, 0.4, T.R + 0.5), false), stroke: edge, strokeWidth: sw * 0.8, opacity: 0.25, fill: "none" }),
    // the well: its walls and its domed bottom, faint through the plastic
    jsx("path", { d: poly(wellHull), fill: "#7FA3CC", opacity: 0.1, stroke: edge, strokeWidth: sw * 0.8, strokeOpacity: 0.5 }),
    // the blood: its column, its surface (a meniscus disc lit by the key light), a ring spreading after a drop
    hasBlood && jsx("path", { d: bloodD, fill: `url(#${id}Bl)` }),
    hasBlood && jsx("path", { d: poly(surf), fill: rampAt(BLOOD_RAMP, 0.55 * surfL + 0.18) }),
    hasBlood && jsx("path", { d: poly(frontArc(pr, fr, L, surfR * 0.97), false), stroke: "#F27A86", strokeWidth: sw * 0.9, opacity: 0.5, fill: "none" }),
    hasBlood && jsx("ellipse", { cx: f2(pr.P(fr.at(L, surfR * 0.42, Math.PI + kth))[0]), cy: f2(pr.P(fr.at(L, surfR * 0.42, Math.PI + kth))[1]), rx: f2(surfR * 0.34 * scale), ry: f2(surfR * 0.1 * scale), fill: "#FFFFFF", opacity: 0.32 }),
    hasBlood && ripple && ripple.k > 0 && ripple.k < 1 && jsx("path", { d: poly(ring(pr, fr, L + 0.05, surfR * (0.15 + 0.8 * ripple.k), 48)), stroke: "#FF9AA3", strokeWidth: sw * 1.1, opacity: 0.6 * (1 - ripple.k), fill: "none" }),
    hasBlood && ripple && ripple.k > 0.18 && ripple.k < 1 && jsx("path", { d: poly(ring(pr, fr, L + 0.05, surfR * (0.8 * (ripple.k - 0.18) / 0.82 + 0.05), 48)), stroke: "#FF9AA3", strokeWidth: sw * 0.8, opacity: 0.45 * (1 - ripple.k), fill: "none" }),
    // drops inside the well (they sink into the blood: clipped at its surface)
    inDrops.map((q, i) => dropEl(q, i, true)),
    // the front of the clear body: Fresnel tint, the inner wall's front lines, the specular streaks, the front arcs of foot and rim
    jsx("path", { d: body.d, fill: `url(#${id}G)` }),
    jsx("path", { d: poly(frontArc(pr, fr, T.BOT + T.RI, T.RI), false), stroke: edge, strokeWidth: sw * 0.6, opacity: 0.18, fill: "none" }),
    // the well's own walls, seen through the outer wall: two lit lines down to its domed bottom
    jsx("path", { d: streak(pr, fr, kth + 0.5, T.BOT + T.RI, T.RIM - 1, T.RI), stroke: "#E8F1FB", strokeWidth: sw * 0.9, opacity: 0.35, fill: "none" }),
    jsx("path", { d: streak(pr, fr, kth + 0.32, 3, T.RIM - 2, T.R + 0.05), stroke: "#FFFFFF", strokeWidth: sw * 2.4, opacity: 0.55 + 0.3 * lt, fill: "none", strokeLinecap: "round" }),
    jsx("path", { d: streak(pr, fr, kth + 0.62, 6, T.RIM - 6, T.R + 0.05), stroke: "#FFFFFF", strokeWidth: sw * 0.9, opacity: 0.3, fill: "none", strokeLinecap: "round" }),
    jsx("path", { d: streak(pr, fr, kth + Math.PI - 0.55, 8, T.RIM - 8, T.R + 0.05), stroke: "#DCEAF8", strokeWidth: sw * 1.1, opacity: 0.22, fill: "none", strokeLinecap: "round" }),
    jsx("path", { d: poly(outline), fill: "none", stroke: edge, strokeWidth: sw * 0.9, opacity: 0.5 }),
    jsx("path", { d: poly(frontArc(pr, fr, 0.4, T.R + 0.5), false), stroke: edge, strokeWidth: sw * 1.2, opacity: 0.6, fill: "none" }),
    jsx("path", { d: poly(frontArc(pr, fr, 2.4, T.R + 0.2), false), stroke: edge, strokeWidth: sw * 0.6, opacity: 0.3, fill: "none" }),
    jsx("path", { d: poly(frontArc(pr, fr, T.RIM - 3.2, T.R + 0.9), false), stroke: edge, strokeWidth: sw * 0.7, opacity: 0.35, fill: "none" }),
    // the label: white paper round the body, THERANOS foreshortened on the curve, the rules, the barcode
    jsx("path", { d: labBand, fill: `url(#${id}Lb)` }),
    jsx("path", { d: rule(la + 1.6), stroke: INK, strokeWidth: sw * 0.55, opacity: 0.55, fill: "none" }),
    jsx("path", { d: rule(lb - 1.6), stroke: INK, strokeWidth: sw * 0.55, opacity: 0.55, fill: "none" }),
    bars.map((b, i) => jsx("path", { d: b.d, stroke: INK, strokeWidth: b.w, opacity: 0.7, fill: "none" }, `b${i}`)),
    // (too small to read — under ~11 px a glyph — the print recedes to a texture on the label: no illegible type on screen)
    glyphs.map((g, i) => g.vis > 0.01 && jsx("text", { transform: g.m, x: 0, y: 0, textAnchor: "middle", dominantBaseline: "central", style: { fontFamily: VOICE, fontWeight: 600, fontSize: g.fs }, fill: INK, opacity: g.vis * (0.25 + 0.75 * clamp01((g.fs * scale - 7) / 4)), children: g.ch }, `g${i}`)),
    jsx("path", { d: poly(frontArc(pr, fr, lb, LR), false), stroke: "#FFFFFF", strokeWidth: sw * 0.7, opacity: 0.5, fill: "none" }),
    // the rim's top (a thick moulded annulus) and its lit front lip
    jsx("path", { d: rimTop, fillRule: "evenodd", fill: mixHex("#BFD3EA", INK, 0.5 * st), opacity: capCovers ? 0 : 0.42 }),
    jsx("path", { d: poly(frontArc(pr, fr, T.RIM, T.R + 1.1), false), stroke: mixHex("#F2F7FD", INK, st), strokeWidth: sw * 1.3, opacity: 0.85, fill: "none" }),
    jsx("path", { d: poly(frontArc(pr, fr, T.RIM, T.RI, 72, -Math.PI / 2).length ? backArc(pr, fr, T.RIM, T.RI) : [], false), stroke: mixHex("#F2F7FD", INK, st), strokeWidth: sw * 0.8, opacity: capCovers ? 0 : 0.5, fill: "none" }),
    // the hinge strap: a small moulded block on the rim at the back right
    (() => {
      const th = T.HINGE * D2R, a = pr.P(fr.at(T.RIM - 1.5, T.R + 1.6, th - 0.16)), b = pr.P(fr.at(T.RIM - 1.5, T.R + 1.6, th + 0.16));
      return jsx("path", { d: `M${f2(a[0])},${f2(a[1])}L${f2(b[0])},${f2(b[1])}`, stroke: rampAt(CAP_RAMP, 0.55), strokeWidth: sw * 4.2, strokeLinecap: "round", opacity: 0.95, fill: "none" });
    })(),
    capFrontK > 0.01 && jsx("g", { opacity: capFrontK, children: capEl }),
    // drops above the rim, in front of everything
    upDrops.map((q, i) => dropEl(q, 100 + i, false))
  ] });
};
