// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).

const D2R = Math.PI / 180;
const poseAt = (f, keys, from = { yaw: 0, pitch: 0 }) => {
  let p = from;
  for (const k of keys) {
    const t = rInOut(f, k.at, k.at + k.dur);
    if (t <= 0) break;
    const to = { yaw: k.yaw, pitch: k.pitch ?? 0 };
    p = { yaw: p.yaw + (to.yaw - p.yaw) * t, pitch: p.pitch + (to.pitch - p.pitch) * t };
    if (t < 1) break;
  }
  return p;
};
const onSphere = (phi, el, p, r = 1) => {
  const ce = Math.cos(el * D2R);
  let x = ce * Math.sin(phi * D2R), y = Math.sin(el * D2R), z = ce * Math.cos(phi * D2R);
  const cy = Math.cos(p.yaw * D2R), sy = Math.sin(p.yaw * D2R);
  [x, z] = [x * cy + z * sy, -x * sy + z * cy];
  const cp = Math.cos(p.pitch * D2R), sp = Math.sin(p.pitch * D2R);
  [y, z] = [y * cp - z * sp, y * sp + z * cp];
  return { x: x * r, y: -y * r, z };
};
const n2 = (v) => v.toFixed(2);
const Dot = ({ R, phi, el, p, r }) => {
  const q = onSphere(phi, el, p);
  if (q.z <= 0.02) return null;
  const ang = Math.atan2(q.y, q.x) / D2R;
  return /* @__PURE__ */ jsx(
    "ellipse",
    {
      cx: n2(q.x * R),
      cy: n2(q.y * R),
      rx: n2(r * Math.max(0.12, q.z)),
      ry: n2(r),
      fill: "#F3F6FA",
      opacity: n2(clamp01((q.z - 0.02) / 0.2)),
      transform: `rotate(${n2(ang)} ${n2(q.x * R)} ${n2(q.y * R)})`
    }
  );
};
const Mouth = ({ R, p, mood }) => {
  const pts = [];
  let zmin = 1;
  const half = 11 - 2.5 * clamp01(-mood);
  for (let k = 0; k <= 11; k++) {
    const phi = -half + 2 * half * k / 11;
    const u = phi / half;
    const q = onSphere(phi, -23 - 2.2 * mood * (1 - u * u), p);
    if (q.z <= 0.03) continue;
    zmin = Math.min(zmin, q.z);
    pts.push(`${pts.length ? "L" : "M"}${n2(q.x * R)},${n2(q.y * R)}`);
  }
  if (pts.length < 2) return null;
  return /* @__PURE__ */ jsx("path", { d: pts.join(" "), stroke: "#F3F6FA", strokeWidth: n2(R * 0.034), strokeLinecap: "round", fill: "none", opacity: n2(clamp01((zmin - 0.03) / 0.25)) });
};
const W = { shell: 1.06, side: 1.13, bottom: 0.68, temple: 54, templeEl: 8 };
const wigOutline = (R) => {
  const s = W.shell * R, w = W.side * R, b = W.bottom * R;
  return `M${n2(-s)},0 A${n2(s)},${n2(s)} 0 0 1 ${n2(s)},0 C${n2(w)},${n2(0.16 * R)} ${n2(w)},${n2(0.42 * R)} ${n2(w - 0.02 * R)},${n2(b - 0.12 * R)} Q${n2(w - 0.05 * R)},${n2(b + 0.02 * R)} ${n2(w - 0.24 * R)},${n2(b)} L${n2(-w + 0.24 * R)},${n2(b)} Q${n2(-w + 0.05 * R)},${n2(b + 0.02 * R)} ${n2(-w + 0.02 * R)},${n2(b - 0.12 * R)} C${n2(-w)},${n2(0.42 * R)} ${n2(-w)},${n2(0.16 * R)} ${n2(-s)},0 Z`;
};
const wigWindow = (R, p) => {
  const pts = [];
  const T = W.temple;
  const tl = onSphere(-T, W.templeEl, p, W.shell), tr = onSphere(T, W.templeEl, p, W.shell);
  const curl = (t, s) => [
    { x: t.x + s * 0.03 * t.z, y: 0.3 },
    { x: t.x + s * 0.08 * t.z, y: 0.5 },
    { x: t.x + s * 0.13 * t.z, y: 0.62 },
    { x: t.x + s * 0.1 * t.z, y: 0.72 }
  ];
  pts.push({ x: tl.x, y: 1 }, ...curl(tl, 1).reverse(), { x: tl.x, y: tl.y });
  for (let k = 0, phi = -T; phi <= T + 0.01; phi += 4.5, k++) {
    const q = onSphere(phi, k % 2 ? 23 : 20, p, W.shell - 0.02);
    pts.push({ x: q.x, y: q.y });
  }
  pts.push({ x: tr.x, y: tr.y }, ...curl(tr, -1), { x: tr.x, y: 1 }, { x: 2.2, y: 1 }, { x: 2.2, y: 2.4 }, { x: -2.2, y: 2.4 }, { x: -2.2, y: 1 });
  return "M" + pts.map((q) => `${n2(q.x * R)},${n2(q.y * R)}`).join(" L") + " Z";
};
const wigStrands = (R, p) => {
  const out = [];
  for (let phi = -180; phi < 180; phi += 7.5) {
    const front = Math.abs(phi) < W.temple;
    const end = front ? 21 : W.templeEl;
    const seg = [];
    for (let el = 84; el >= end - 0.01; el -= 6) {
      const q = onSphere(phi, el, p, W.shell + 5e-3);
      if (q.z <= 0.02) {
        if (seg.length > 1) out.push(seg.join(" "));
        seg.length = 0;
        continue;
      }
      seg.push(`${seg.length ? "L" : "M"}${n2(q.x * R)},${n2(q.y * R)}`);
    }
    if (!front) {
      const t = onSphere(phi, W.templeEl, p, W.shell);
      if (t.z > 0.02 && seg.length) seg.push(`L${n2(t.x * R)},${n2((W.bottom - 0.08) * R)}`);
    }
    if (seg.length > 1) out.push(seg.join(" "));
  }
  return out;
};
let ORBCHECK = false;
export const setOrbCheck = (on) => {
  ORBCHECK = on;
};
const HALF = 2.56;
const HALF_W = 2.11;
const OrbPerson = ({ id, cx, cy, R, pose, wig, mood = 1, solid }) => {
  const gap = 0.24 * R, Rb = 2.35 * R;
  const bt = R + gap, bc = bt + Rb, bcut = bc + 0.2 * Rb;
  const p = pose;
  return /* @__PURE__ */ jsxs("g", { transform: `translate(${n2(cx)},${n2(cy)})`, children: [
    ORBCHECK && [-1, 1].map((k) => /* @__PURE__ */ jsx("circle", { "data-orb-half": id, cx: n2(k * HALF_W * R), cy: n2(HALF * R), r: 0.5, fill: "none", stroke: "none" }, k)),
    /* @__PURE__ */ jsxs("defs", { children: [
      /* @__PURE__ */ jsxs("radialGradient", { id: id + "g", cx: "50%", cy: "50%", r: "50%", children: [
        /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#0D1C2E" }),
        /* @__PURE__ */ jsx("stop", { offset: "58%", stopColor: "#0F2038" }),
        /* @__PURE__ */ jsx("stop", { offset: "80%", stopColor: "#193C62" }),
        /* @__PURE__ */ jsx("stop", { offset: "92%", stopColor: "#678FBB" }),
        /* @__PURE__ */ jsx("stop", { offset: "98%", stopColor: "#C2D1E4" }),
        /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#ECF1F7" })
      ] }),
      /* @__PURE__ */ jsxs("radialGradient", { id: id + "u", cx: "50%", cy: "100%", r: "62%", children: [
        /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#ffffff", stopOpacity: 0.42 }),
        /* @__PURE__ */ jsx("stop", { offset: "55%", stopColor: "#ffffff", stopOpacity: 0.08 }),
        /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#ffffff", stopOpacity: 0 })
      ] }),
      /* @__PURE__ */ jsxs("linearGradient", { id: id + "h", x1: "0", y1: "0", x2: "0", y2: "1", children: [
        /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#ffffff", stopOpacity: 0.3 }),
        /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#ffffff", stopOpacity: 0 })
      ] }),
      /* @__PURE__ */ jsxs("radialGradient", { id: id + "s", cx: "50%", cy: "50%", r: "50%", children: [
        /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#ffffff", stopOpacity: 0.75 }),
        /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#ffffff", stopOpacity: 0 })
      ] }),
      /* @__PURE__ */ jsxs("radialGradient", { id: id + "b", gradientUnits: "userSpaceOnUse", cx: 0, cy: n2(bc + 0.16 * Rb), r: n2(1.16 * Rb), children: [
        /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#0A172A" }),
        /* @__PURE__ */ jsx("stop", { offset: "76%", stopColor: "#0E1E33" }),
        /* @__PURE__ */ jsx("stop", { offset: "89%", stopColor: "#17385C" }),
        /* @__PURE__ */ jsx("stop", { offset: "96%", stopColor: "#6790BC" }),
        /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#D2DDEB" })
      ] }),
      /* @__PURE__ */ jsxs("linearGradient", { id: id + "r", x1: "0", y1: "0", x2: "1", y2: "0", children: [
        /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#ffffff", stopOpacity: 0 }),
        /* @__PURE__ */ jsx("stop", { offset: "50%", stopColor: "#ffffff", stopOpacity: 0.8 }),
        /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#ffffff", stopOpacity: 0 })
      ] }),
      /* @__PURE__ */ jsxs("radialGradient", { id: id + "n", cx: "50%", cy: "50%", r: "50%", children: [
        /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#ffffff", stopOpacity: 0.34 }),
        /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#ffffff", stopOpacity: 0 })
      ] }),
      /* @__PURE__ */ jsx("clipPath", { id: id + "k", children: /* @__PURE__ */ jsx("circle", { cx: 0, cy: 0, r: R }) }),
      /* @__PURE__ */ jsxs("linearGradient", { id: id + "f", gradientUnits: "userSpaceOnUse", x1: 0, y1: n2(bt), x2: 0, y2: n2(bcut), children: [
        /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#ffffff" }),
        /* @__PURE__ */ jsx("stop", { offset: "47%", stopColor: "#ffffff" }),
        /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: solid ? "#ffffff" : "#000000" })
      ] }),
      /* @__PURE__ */ jsx("mask", { id: id + "bm", maskUnits: "userSpaceOnUse", x: n2(-1.2 * Rb), y: n2(bt - 10), width: n2(2.4 * Rb), height: n2(bcut - bt + 20), children: /* @__PURE__ */ jsx("rect", { x: n2(-1.2 * Rb), y: n2(bt - 10), width: n2(2.4 * Rb), height: n2(bcut - bt + 20), fill: `url(#${id}f)` }) }),
      wig && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("linearGradient", { id: id + "w", x1: "0", y1: "0", x2: "0", y2: "1", children: [
          /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#1B426C" }),
          /* @__PURE__ */ jsx("stop", { offset: "55%", stopColor: "#142F4E" }),
          /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#0F233B" })
        ] }),
        /* @__PURE__ */ jsxs("linearGradient", { id: id + "wb", x1: "0", y1: "0", x2: "0", y2: "1", children: [
          /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#17385C" }),
          /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#102740" })
        ] }),
        /* @__PURE__ */ jsxs("mask", { id: id + "m", maskUnits: "userSpaceOnUse", x: -3 * R, y: -3 * R, width: 6 * R, height: 6 * R, children: [
          /* @__PURE__ */ jsx("path", { d: wigOutline(R), fill: "#ffffff" }),
          /* @__PURE__ */ jsx("path", { d: wigWindow(R, p), fill: "#000000" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("path", { d: `M${n2(-0.98 * Rb)},${n2(bcut)} A${n2(Rb)},${n2(Rb)} 0 1 1 ${n2(0.98 * Rb)},${n2(bcut)} Z`, fill: `url(#${id}b)`, mask: `url(#${id}bm)` }),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: `M${n2(-Rb * 0.62)},${n2(bc - Rb * 0.785)} A${n2(Rb)},${n2(Rb)} 0 0 1 ${n2(Rb * 0.62)},${n2(bc - Rb * 0.785)}`,
        stroke: `url(#${id}r)`,
        strokeWidth: n2(R * 0.03),
        fill: "none"
      }
    ),
    /* @__PURE__ */ jsx("ellipse", { cx: 0, cy: n2(R + gap), rx: n2(R * 1.05), ry: n2(R * 0.26), fill: `url(#${id}n)` }),
    wig && /* @__PURE__ */ jsx("path", { d: wigOutline(R), fill: `url(#${id}wb)`, stroke: "#93AFCF", strokeOpacity: 0.3, strokeWidth: n2(R * 0.016) }),
    /* @__PURE__ */ jsx("circle", { cx: 0, cy: 0, r: R, fill: `url(#${id}g)` }),
    /* @__PURE__ */ jsx("circle", { cx: 0, cy: 0, r: R, fill: `url(#${id}u)` }),
    /* @__PURE__ */ jsx("g", { clipPath: `url(#${id}k)`, children: /* @__PURE__ */ jsx("ellipse", { cx: 0, cy: n2(-R * 0.62), rx: n2(R * 0.56), ry: n2(R * 0.27), fill: `url(#${id}h)` }) }),
    /* @__PURE__ */ jsx("circle", { cx: n2(-R * 0.44), cy: n2(-R * 0.56), r: n2(R * 0.075), fill: `url(#${id}s)` }),
    /* @__PURE__ */ jsx("circle", { cx: 0, cy: 0, r: n2(R - 0.6), fill: "none", stroke: "#F1F5F9", strokeOpacity: 0.5, strokeWidth: 1.3 }),
    /* @__PURE__ */ jsxs("g", { clipPath: `url(#${id}k)`, children: [
      /* @__PURE__ */ jsx(Dot, { R, phi: -17, el: -4, p, r: R * 0.05 }),
      /* @__PURE__ */ jsx(Dot, { R, phi: 17, el: -4, p, r: R * 0.05 }),
      /* @__PURE__ */ jsx(Mouth, { R, p, mood })
    ] }),
    wig && /* @__PURE__ */ jsxs("g", { mask: `url(#${id}m)`, children: [
      /* @__PURE__ */ jsx("path", { d: wigOutline(R), fill: `url(#${id}w)` }),
      wigStrands(R, p).map((d, k) => /* @__PURE__ */ jsx("path", { d, stroke: k % 3 ? "#2D6CB4" : "#678FBB", strokeOpacity: 0.42, strokeWidth: n2(R * 0.013), fill: "none", strokeLinecap: "round" }, k)),
      (() => {
        const a = onSphere(-22, 86, p, W.shell + 0.01), b = onSphere(-24, 52, p, W.shell + 0.01);
        return a.z > 0 && b.z > 0 ? /* @__PURE__ */ jsx("path", { d: `M${n2(a.x * R)},${n2(a.y * R)} L${n2(b.x * R)},${n2(b.y * R)}`, stroke: "#091929", strokeOpacity: 0.6, strokeWidth: n2(R * 0.022), strokeLinecap: "round" }) : null;
      })(),
      /* @__PURE__ */ jsx("path", { d: `M${n2(-R * 0.74)},${n2(-R * 0.66)} Q0,${n2(-R * 1.05)} ${n2(R * 0.74)},${n2(-R * 0.66)}`, stroke: "#C1D0E4", strokeOpacity: 0.26, strokeWidth: n2(R * 0.1), fill: "none", strokeLinecap: "round" }),
      [-1, 1].map((s) => /* @__PURE__ */ jsx("path", { d: `M${n2(s * R * 1)},${n2(R * 0.02)} L${n2(s * R * 1.03)},${n2(R * 0.46)}`, stroke: "#C1D0E4", strokeOpacity: 0.14, strokeWidth: n2(R * 0.06), strokeLinecap: "round" }, s)),
      /* @__PURE__ */ jsx("path", { d: wigOutline(R), fill: "none", stroke: "#B2C6DD", strokeOpacity: 0.4, strokeWidth: n2(R * 0.016) })
    ] })
  ] });
};
