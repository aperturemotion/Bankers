// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).

const n2 = (v) => v.toFixed(2);
const head = (r) => `perspective(${r.persp}px) rotateX(${n2(r.pitch)}deg) rotateY(${n2(r.yaw)}deg)`;
const rigT = (r, z) => `${head(r)} translateZ(${n2(z)}px)`;
const moveT = (r, dx, dy, z) => `${head(r)} translate3d(${n2(dx)}px, ${n2(dy)}px, ${n2(z)}px)`;
const pivotT = (r, p, rot, z) => `${head(r)} translate3d(${n2(p.x - r.cx)}px, ${n2(p.y - r.cy)}px, ${n2(p.z)}px) ${rot} translate3d(${n2(r.cx - p.x)}px, ${n2(r.cy - p.y)}px, ${n2(z - p.z)}px)`;
const project = (r, x, y, z) => {
  const b = r.yaw * Math.PI / 180, a = r.pitch * Math.PI / 180;
  const dx = x - r.cx, dy = y - r.cy;
  const x1 = dx * Math.cos(b) + z * Math.sin(b), z1 = -dx * Math.sin(b) + z * Math.cos(b);
  const y2 = dy * Math.cos(a) - z1 * Math.sin(a), z2 = dy * Math.sin(a) + z1 * Math.cos(a);
  const s = r.persp / (r.persp - z2);
  return { x: r.cx + x1 * s, y: r.cy + y2 * s, s };
};
const Plane = ({ r, l }) => {
  const op = l.op ?? 1;
  if (op <= 1e-3) return null;
  const { box } = l;
  return /* @__PURE__ */ jsx("div", { style: {
    position: "absolute",
    left: box.x,
    top: box.y,
    width: box.w,
    height: box.h,
    overflow: l.clip ? "hidden" : void 0,
    transformOrigin: `${n2(r.cx - box.x)}px ${n2(r.cy - box.y)}px`,
    transform: l.t ?? rigT(r, l.z),
    opacity: op < 1 ? op : void 0
  }, children: l.html ? l.el : /* @__PURE__ */ jsx("svg", { width: box.w, height: box.h, viewBox: `${box.x} ${box.y} ${box.w} ${box.h}`, style: { position: "absolute", left: 0, top: 0, overflow: "visible" }, children: l.el }) });
};
const Planes = ({ r, layers }) => /* @__PURE__ */ jsx(Fragment, { children: [...layers].sort((a, b) => (a.order ?? a.z) - (b.order ?? b.z)).map((l) => /* @__PURE__ */ jsx(Plane, { r, l }, l.k)) });
const around = (x, y, r) => ({ x: x - r, y: y - r, w: 2 * r, h: 2 * r });
const grow = (b, m) => ({ x: b.x - m, y: b.y - m, w: b.w + 2 * m, h: b.h + 2 * m });
const span = (z0, z1, step) => {
  const n = Math.max(1, Math.round(Math.abs(z1 - z0) / step));
  return Array.from({ length: n + 1 }, (_, i) => z0 + (z1 - z0) * i / n);
};
const side = (u, lo = "#102740", hi = "#2D6CB4") => mixHex(lo, hi, clamp01(u));
const ring = (cx, cy, r0, r1) => `M${n2(cx - r1)},${n2(cy)} a${n2(r1)},${n2(r1)} 0 1,0 ${n2(2 * r1)},0 a${n2(r1)},${n2(r1)} 0 1,0 ${n2(-2 * r1)},0 Z M${n2(cx - r0)},${n2(cy)} a${n2(r0)},${n2(r0)} 0 1,0 ${n2(2 * r0)},0 a${n2(r0)},${n2(r0)} 0 1,0 ${n2(-2 * r0)},0 Z`;
const rrect = (b, r) => {
  const { x, y, w, h } = b, q = Math.min(r, w / 2, h / 2);
  return `M${n2(x + q)},${n2(y)} H${n2(x + w - q)} Q${n2(x + w)},${n2(y)} ${n2(x + w)},${n2(y + q)} V${n2(y + h - q)} Q${n2(x + w)},${n2(y + h)} ${n2(x + w - q)},${n2(y + h)} H${n2(x + q)} Q${n2(x)},${n2(y + h)} ${n2(x)},${n2(y + h - q)} V${n2(y + q)} Q${n2(x)},${n2(y)} ${n2(x + q)},${n2(y)} Z`;
};
const plateWithHoles = (b, r, holes) => [rrect(b, r), ...holes.map((h) => rrect(h.b, h.r))].join(" ");
const slab = (k, b, r, z0, z1, step, lo, hi, face, holes = []) => {
  const d = holes.length ? plateWithHoles(b, r, holes) : rrect(b, r);
  const box = grow(b, 4);
  const L = span(z0, z1 - 2, step).map((z) => ({
    z,
    k: `${k}s${n2(z)}`,
    box,
    el: /* @__PURE__ */ jsx("path", { d, fillRule: "evenodd", fill: side((z - z0) / Math.max(1, z1 - z0), lo, hi) })
  }));
  L.push({ z: z1, k: `${k}f`, box, el: face });
  return L;
};
const tube = (k, b, r, wall, z0, z1, step, lo, hi) => {
  const box = grow(b, wall + 4);
  return span(z0, z1 - 1, step).map((z) => ({
    z,
    k: `${k}t${n2(z)}`,
    box,
    el: /* @__PURE__ */ jsx("path", { d: plateWithHoles(grow(b, wall), r + wall, [{ b, r }]), fillRule: "evenodd", fill: side((z - z0) / Math.max(1, z1 - z0), lo, hi) })
  }));
};
const disc = (k, cx, cy, R, z0, z1, step, lo, hi, face) => {
  const box = around(cx, cy, R + 2);
  const L = span(z0, z1, step).map((z, i, a) => ({
    z,
    k: `${k}d${n2(z)}`,
    box,
    el: /* @__PURE__ */ jsx("circle", { cx, cy, r: R, fill: i === a.length - 1 && face ? face : side((z - z0) / Math.max(1, z1 - z0), lo, hi) })
  }));
  return L;
};
const hexBolts = (k, pts, z0, box, r = 10, rot = 0) => [[2, r + 2, "#204D7F"], [5, r, "#7E9FC6"], [8, r - 3, "#DCE5EF"]].map(([dz, rr, col]) => ({
  z: z0 + dz,
  k: `${k}b${dz}`,
  box,
  el: /* @__PURE__ */ jsx("g", { children: pts.map((p, i) => /* @__PURE__ */ jsx("polygon", { fill: col, points: Array.from({ length: 6 }, (_, j) => {
    const a = (j * 60 + rot) * Math.PI / 180;
    return `${n2(p.x + rr * Math.cos(a))},${n2(p.y + rr * Math.sin(a))}`;
  }).join(" ") }, i)) })
}));
const rivets = (k, pts, z0, box, r = 7) => [[2, r, "#204D7F"], [4, r * 0.77, "#678FBB"], [6, r * 0.46, "#C1D0E4"]].map(([dz, rr, col]) => ({
  z: z0 + dz,
  k: `${k}r${dz}`,
  box,
  el: /* @__PURE__ */ jsx("g", { children: pts.map((p, i) => /* @__PURE__ */ jsx("circle", { cx: p.x, cy: p.y, r: rr, fill: col }, i)) })
}));
const sphere = (k, cx, cy, cz, R, step, lo, hi, spec = 0.6) => span(-R + 1.5, R - 1.5, step).map((dz) => {
  const r = Math.sqrt(R * R - dz * dz), u = (dz + R) / (2 * R);
  return { z: cz + dz, k: `${k}p${n2(dz)}`, box: around(cx, cy, R + 2), el: /* @__PURE__ */ jsxs("g", { children: [
    /* @__PURE__ */ jsx("circle", { cx: n2(cx), cy: n2(cy), r: n2(r), fill: side(u, lo, hi) }),
    dz > R - 4 - step && spec > 0 && /* @__PURE__ */ jsx("circle", { cx: n2(cx - R * 0.28), cy: n2(cy - R * 0.32), r: n2(R * 0.26), fill: "#ffffff", opacity: spec })
  ] }) };
});
const vcyl = (k, cx, y0, y1, cz, R, step, lo, hi, faceFill) => span(-R + 1, R, step).map((dz, i, a) => {
  const hw = Math.sqrt(Math.max(0, R * R - dz * dz)), u = (dz + R) / (2 * R);
  return { z: cz + dz, k: `${k}v${n2(dz)}`, box: { x: cx - R - 2, y: y0 - 2, w: 2 * R + 4, h: y1 - y0 + 4 }, el: /* @__PURE__ */ jsx("rect", { x: n2(cx - hw), y: y0, width: n2(2 * hw), height: y1 - y0, rx: n2(Math.min(hw, 4)), fill: i === a.length - 1 && faceFill ? faceFill : side(u, lo, hi) }) };
});
const hcyl = (k, x0, x1, cy, cz, R, step, lo, hi, faceFill) => span(-R + 1, R, step).map((dz, i, a) => {
  const hh = Math.sqrt(Math.max(0, R * R - dz * dz)), u = (dz + R) / (2 * R);
  return { z: cz + dz, k: `${k}h${n2(dz)}`, box: { x: x0 - 2, y: cy - R - 2, w: x1 - x0 + 4, h: 2 * R + 4 }, el: /* @__PURE__ */ jsx("rect", { x: x0, y: n2(cy - hh), width: x1 - x0, height: n2(2 * hh), rx: n2(Math.min(hh, 4)), fill: i === a.length - 1 && faceFill ? faceFill : side(u, lo, hi) }) };
});
const SteelDefs = ({ p }) => /* @__PURE__ */ jsx("svg", { width: 0, height: 0, style: { position: "absolute" }, children: /* @__PURE__ */ jsxs("defs", { children: [
  /* @__PURE__ */ jsxs("linearGradient", { id: `${p}Face`, x1: "0", y1: "0", x2: "0.35", y2: "1", children: [
    /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#265C98" }),
    /* @__PURE__ */ jsx("stop", { offset: "40%", stopColor: "#18375D" }),
    /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#0B2034" })
  ] }),
  /* @__PURE__ */ jsxs("linearGradient", { id: `${p}Plate`, x1: "0", y1: "0", x2: "1", y2: "1", children: [
    /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#204D7F" }),
    /* @__PURE__ */ jsx("stop", { offset: "45%", stopColor: "#132E4F" }),
    /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#0B2034" })
  ] }),
  /* @__PURE__ */ jsxs("linearGradient", { id: `${p}Chrome`, x1: "0", y1: "0", x2: "1", y2: "1", children: [
    /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#F3F6FA" }),
    /* @__PURE__ */ jsx("stop", { offset: "40%", stopColor: "#93AFCF" }),
    /* @__PURE__ */ jsx("stop", { offset: "70%", stopColor: "#204D7F" }),
    /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#C1D0E4" })
  ] }),
  /* @__PURE__ */ jsxs("linearGradient", { id: `${p}Bar`, x1: "0", y1: "0", x2: "0", y2: "1", children: [
    /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#E7EEF5" }),
    /* @__PURE__ */ jsx("stop", { offset: "45%", stopColor: "#7E9FC6" }),
    /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#204D7F" })
  ] }),
  /* @__PURE__ */ jsxs("linearGradient", { id: `${p}Post`, x1: "0", y1: "0", x2: "1", y2: "0", children: [
    /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#18375D" }),
    /* @__PURE__ */ jsx("stop", { offset: "40%", stopColor: "#C1D0E4" }),
    /* @__PURE__ */ jsx("stop", { offset: "60%", stopColor: "#E7EEF5" }),
    /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#204D7F" })
  ] }),
  /* @__PURE__ */ jsxs("radialGradient", { id: `${p}Disc`, cx: "42%", cy: "36%", r: "72%", children: [
    /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#C1D0E4" }),
    /* @__PURE__ */ jsx("stop", { offset: "45%", stopColor: "#678FBB" }),
    /* @__PURE__ */ jsx("stop", { offset: "85%", stopColor: "#204D7F" }),
    /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#132E4F" })
  ] }),
  /* @__PURE__ */ jsxs("radialGradient", { id: `${p}Red`, cx: "38%", cy: "34%", r: "70%", children: [
    /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: mixHex(LOSS, "#ffffff", 0.5) }),
    /* @__PURE__ */ jsx("stop", { offset: "45%", stopColor: LOSS }),
    /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: mixHex(LOSS, "#000000", 0.55) })
  ] })
] }) });
const sceneAt = (ax, ay, z, sx, sy, r) => ({ x: ax + (sx - O.x) / z, y: ay + (sy - O.y) / z, R: r / z });
export const HOUSE_VIEW = { persp: 1700, yaw: 10, pitch: 5 };
