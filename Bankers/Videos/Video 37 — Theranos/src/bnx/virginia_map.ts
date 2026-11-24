// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import { D2R, area, cw, flattenPath } from "./solid_engine";
import { US_NATION, US_STATES } from "./usmap_data";

export const VM_FLOOR = 1010;
export const TRAY = { H: 26, feet: 6, mx: 34, myN: 28, myS: 40 };
export const VM_TOP = VM_FLOOR - TRAY.feet - TRAY.H;
export const S = 0.86;
const UC = 458, VC = 305, MX = 540;
export const PLATE = 12;
export const VM_RIG = { cx: 540, cy: VM_FLOOR - 3200, persp: 3600, yaw: 10, pitch: 0 };
export const mapW = (u, v, h) => [MX + (u - UC) * S, VM_TOP - h, (v - VC) * S];
const dp = (p, tol) => {
  if (p.length < 8) return p;
  const keep = new Uint8Array(p.length);
  const rec = (a, b) => {
    const [ax, ay] = p[a], [bx, by] = p[b];
    const dx = bx - ax, dy = by - ay, l = Math.hypot(dx, dy) || 1e-9;
    let best = -1, bi = -1;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs((p[i][0] - ax) * dy - (p[i][1] - ay) * dx) / l;
      if (d > best) {
        best = d;
        bi = i;
      }
    }
    if (best > tol && bi > 0) {
      keep[bi] = 1;
      rec(a, bi);
      rec(bi, b);
    }
  };
  const m = Math.floor(p.length / 2);
  keep[0] = keep[m] = keep[p.length - 1] = 1;
  rec(0, m);
  rec(m, p.length - 1);
  return p.filter((_, i) => keep[i]);
};
const ringsOf = (d) => flattenPath(d).map((r) => r.length > 1 && r[0][0] === r[r.length - 1][0] && r[0][1] === r[r.length - 1][1] ? r.slice(0, -1) : r).filter((r) => r.length >= 3);
const inside = (p, poly) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if (a[1] > p[1] !== b[1] > p[1] && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c;
  }
  return c;
};
export const VM_STATES = US_STATES.map((s, i) => {
  const rings = ringsOf(s.d);
  const walls = rings.map((r) => dp(r, 0.7)).filter((r) => r.length >= 3 && Math.abs(area(r)) > 2);
  return { id: s.id, name: s.name, c: s.c, rings, walls, b: s.b, seed: i * 7919 % 97 / 97 };
});
const VA_ID = "51";
export const VA_INDEX = VM_STATES.findIndex((s) => s.id === VA_ID);
if (VA_INDEX < 0) throw new Error("virginia_map: no Virginia (51) in usmap_data");
const NATION_RINGS = ringsOf(US_NATION).map((r) => dp(r, 0.7)).filter((r) => r.length >= 3);
export const MAP_B = (() => {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const s of VM_STATES) {
    x0 = Math.min(x0, s.b[0][0]);
    y0 = Math.min(y0, s.b[0][1]);
    x1 = Math.max(x1, s.b[1][0]);
    y1 = Math.max(y1, s.b[1][1]);
  }
  return { x0, y0, x1, y1 };
})();
export const VM_ORDER = (() => {
  const n = VM_STATES.length;
  const after = Array.from({ length: n }, () => /* @__PURE__ */ new Set());
  const indeg = new Array(n).fill(0);
  const big = VM_STATES.map((s) => s.rings);
  VM_STATES.forEach((s, i) => {
    for (const r of s.rings) for (let k = 0; k < r.length; k += 2) {
      const q = [r[k][0], r[k][1] + 1.6];
      for (let j = 0; j < n; j++) {
        if (j === i) continue;
        const b = VM_STATES[j].b;
        if (q[0] < b[0][0] || q[0] > b[1][0] || q[1] < b[0][1] || q[1] > b[1][1]) continue;
        if (big[j].some((rr) => inside(q, rr)) && !after[i].has(j) && !after[j].has(i)) {
          after[i].add(j);
          indeg[j]++;
        }
      }
    }
  });
  const out = [], done = new Array(n).fill(false);
  const lat = (i) => VM_STATES[i].c[1];
  while (out.length < n) {
    let pick = -1;
    for (let i = 0; i < n; i++) if (!done[i] && indeg[i] === 0 && (pick < 0 || lat(i) < lat(pick))) pick = i;
    if (pick < 0) {
      for (let i = 0; i < n; i++) if (!done[i] && (pick < 0 || lat(i) < lat(pick))) pick = i;
    }
    done[pick] = true;
    out.push(pick);
    for (const j of after[pick]) indeg[j]--;
  }
  return out;
})();
export const VA_SOLID = (() => {
  const rs = VM_STATES[VA_INDEX].rings.slice().sort((a, b) => Math.abs(area(b)) - Math.abs(area(a)));
  return cw(dp(rs[0], 1.1));
})();
const VA_REST = (() => {
  const rs = VM_STATES[VA_INDEX].rings.slice().sort((a, b) => Math.abs(area(b)) - Math.abs(area(a)));
  return rs.slice(1);
})();
const cyw = Math.cos(VM_RIG.yaw * D2R), syw = Math.sin(VM_RIG.yaw * D2R), cp = Math.cos(VM_RIG.pitch * D2R), spp = Math.sin(VM_RIG.pitch * D2R);
const viewOf = (w) => {
  const x = w[0] - VM_RIG.cx, y = w[1] - VM_RIG.cy, z = w[2];
  const x1 = x * cyw + z * syw, z1 = -x * syw + z * cyw;
  return [x1, y * cp - z1 * spp, y * spp + z1 * cp];
};
const UP = (() => {
  const a = viewOf([VM_RIG.cx, VM_RIG.cy - 1, 0]);
  return [a[0], a[1], a[2]];
})();
const viewRing = (r) => {
  const o = new Float64Array(r.length * 3);
  r.forEach((p, i) => {
    const v = viewOf(mapW(p[0], p[1], 0));
    o[i * 3] = v[0];
    o[i * 3 + 1] = v[1];
    o[i * 3 + 2] = v[2];
  });
  return o;
};
export const ringPath = (pr, h, dx = 0, dy = 0) => {
  const n = pr.length / 3, P = VM_RIG.persp, ux = UP[0] * h, uy = UP[1] * h, uz = UP[2] * h;
  let s = "";
  for (let i = 0; i < n; i++) {
    const vx = pr[i * 3] + ux, vy = pr[i * 3 + 1] + uy, vz = pr[i * 3 + 2] + uz, k = P / Math.max(1, P - vz);
    s += (i ? "L" : "M") + (VM_RIG.cx + vx * k + dx).toFixed(1) + "," + (VM_RIG.cy + vy * k + dy).toFixed(1);
  }
  return s + "Z";
};
export const VM_PROJ = VM_STATES.map((s) => ({ face: s.rings.map(viewRing), wall: s.walls.map(viewRing) }));
export const NATION_PROJ = NATION_RINGS.map(viewRing);
export const VA_REST_PROJ = VA_REST.map(viewRing);

export { MX, UC, VC };
