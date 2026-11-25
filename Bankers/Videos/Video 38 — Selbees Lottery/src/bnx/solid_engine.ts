// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import { clamp01, mixHex } from "./anim";

export const D2R = Math.PI / 180;
const n3 = (v) => Math.abs(v) < 1e-9 ? "0" : v.toFixed(4);
const rotV = (vw, p) => {
  const b = vw.yaw * D2R, a = vw.pitch * D2R;
  const x1 = p[0] * Math.cos(b) + p[2] * Math.sin(b), z1 = -p[0] * Math.sin(b) + p[2] * Math.cos(b);
  return [x1, p[1] * Math.cos(a) - z1 * Math.sin(a), p[1] * Math.sin(a) + z1 * Math.cos(a)];
};
const projV = (vw, p) => {
  const r = rotV(vw, p), s = vw.P / Math.max(1e-3, vw.P - r[2]);
  return [r[0] * s, r[1] * s, r[2]];
};
const planeT = (vw, z, k) => `perspective(${(vw.P * k).toFixed(2)}px) rotateX(${vw.pitch.toFixed(3)}deg) rotateY(${vw.yaw.toFixed(3)}deg) translateZ(${(z * k).toFixed(3)}px)`;
const norm = (v) => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};
const KEY = norm([-0.52, -0.62, 0.58]);
const HALF = norm([KEY[0], KEY[1], KEY[2] + 1]);
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const lightOf = (n, spec = 0.5, shin = 26) => 0.13 + 0.58 * Math.max(0, dot(n, KEY)) + 0.12 * (0.5 - 0.5 * n[1]) + spec * Math.pow(Math.max(0, dot(n, HALF)), shin);
export const rampAt = (r, i) => {
  const t = clamp01(i) * 4, k = Math.min(3, Math.floor(t));
  return mixHex(r[k], r[k + 1], t - k);
};
export const flattenPath = (d, seg = 24) => {
  const tok = d.match(/[MmLlHhVvCcSsZz]|-?(?:\d*\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/g) ?? [];
  const out = [];
  let cur = [], x = 0, y = 0, sx = 0, sy = 0, cmd = "", c2x = 0, c2y = 0, i = 0;
  const num = () => Number(tok[i++]);
  const cubic = (x1, y1, x2, y2, x3, y3) => {
    for (let s = 1; s <= seg; s++) {
      const t = s / seg, m = 1 - t;
      cur.push([m * m * m * x + 3 * m * m * t * x1 + 3 * m * t * t * x2 + t * t * t * x3, m * m * m * y + 3 * m * m * t * y1 + 3 * m * t * t * y2 + t * t * t * y3]);
    }
    c2x = x2;
    c2y = y2;
    x = x3;
    y = y3;
  };
  while (i < tok.length) {
    if (/[A-Za-z]/.test(tok[i])) cmd = tok[i++];
    const rel = cmd === cmd.toLowerCase();
    const ox = rel ? x : 0, oy = rel ? y : 0;
    switch (cmd.toUpperCase()) {
      case "M": {
        if (cur.length) out.push(cur);
        x = ox + num();
        y = oy + num();
        sx = x;
        sy = y;
        cur = [[x, y]];
        cmd = rel ? "l" : "L";
        c2x = x;
        c2y = y;
        break;
      }
      case "L": {
        x = ox + num();
        y = oy + num();
        cur.push([x, y]);
        c2x = x;
        c2y = y;
        break;
      }
      case "H": {
        x = (rel ? x : 0) + num();
        cur.push([x, y]);
        c2x = x;
        c2y = y;
        break;
      }
      case "V": {
        y = (rel ? y : 0) + num();
        cur.push([x, y]);
        c2x = x;
        c2y = y;
        break;
      }
      case "C": {
        const a = [num(), num(), num(), num(), num(), num()];
        cubic(ox + a[0], oy + a[1], ox + a[2], oy + a[3], ox + a[4], oy + a[5]);
        break;
      }
      case "S": {
        const a = [num(), num(), num(), num()];
        cubic(2 * x - c2x, 2 * y - c2y, ox + a[0], oy + a[1], ox + a[2], oy + a[3]);
        break;
      }
      case "Z": {
        x = sx;
        y = sy;
        if (cur.length) out.push(cur);
        cur = [];
        c2x = x;
        c2y = y;
        break;
      }
      default:
        throw new Error(`spine_engine: path command ${cmd} not supported`);
    }
  }
  if (cur.length) out.push(cur);
  return out.map((p) => p.length > 2 && Math.hypot(p[0][0] - p[p.length - 1][0], p[0][1] - p[p.length - 1][1]) < 1e-6 ? p.slice(0, -1) : p);
};
export const area = (p) => {
  let a = 0;
  for (let i = 0; i < p.length; i++) {
    const q = p[(i + 1) % p.length];
    a += p[i][0] * q[1] - q[0] * p[i][1];
  }
  return a / 2;
};
const centroid = (p) => {
  let a = 0, cx = 0, cy = 0;
  for (let i = 0; i < p.length; i++) {
    const q = p[(i + 1) % p.length], c = p[i][0] * q[1] - q[0] * p[i][1];
    a += c;
    cx += (p[i][0] + q[0]) * c;
    cy += (p[i][1] + q[1]) * c;
  }
  return [cx / (3 * a), cy / (3 * a)];
};
export const cw = (p) => area(p) < 0 ? [...p].reverse() : p;
const resample = (p, step, corner = 38) => {
  const n = p.length;
  const isCorner = p.map((q, i) => {
    const a = p[(i - 1 + n) % n], b = p[(i + 1) % n];
    const d1 = [q[0] - a[0], q[1] - a[1]], d2 = [b[0] - q[0], b[1] - q[1]];
    const c = (d1[0] * d2[0] + d1[1] * d2[1]) / (Math.hypot(d1[0], d1[1]) * Math.hypot(d2[0], d2[1]) || 1);
    return Math.acos(Math.max(-1, Math.min(1, c))) / D2R > corner;
  });
  let start = isCorner.indexOf(true);
  if (start < 0) start = 0;
  const ring = [...p.slice(start), ...p.slice(0, start)], rc = [...isCorner.slice(start), ...isCorner.slice(0, start)];
  const out = [];
  let run = [ring[0]];
  const flush = () => {
    const L = [0];
    for (let i = 1; i < run.length; i++) L.push(L[i - 1] + Math.hypot(run[i][0] - run[i - 1][0], run[i][1] - run[i - 1][1]));
    const tot = L[L.length - 1], m = Math.max(1, Math.round(tot / step));
    for (let s = 0; s < m; s++) {
      const want = tot * s / m;
      let k = 1;
      while (k < L.length - 1 && L[k] < want) k++;
      const t = (want - L[k - 1]) / Math.max(1e-9, L[k] - L[k - 1]);
      out.push([run[k - 1][0] + (run[k][0] - run[k - 1][0]) * t, run[k - 1][1] + (run[k][1] - run[k - 1][1]) * t]);
    }
  };
  for (let i = 1; i <= ring.length; i++) {
    const q = ring[i % ring.length];
    run.push(q);
    if (i === ring.length || rc[i % ring.length]) {
      flush();
      run = [q];
    }
  }
  return out;
};
const rayHitE = (p, c, th) => {
  const dx = Math.cos(th), dy = Math.sin(th);
  let best = -1, e = 0;
  for (let i = 0; i < p.length; i++) {
    const a = p[i], b = p[(i + 1) % p.length];
    const ex = b[0] - a[0], ey = b[1] - a[1];
    const den = dx * ey - dy * ex;
    if (Math.abs(den) < 1e-12) continue;
    const t = ((a[0] - c[0]) * ey - (a[1] - c[1]) * ex) / den, s = ((a[0] - c[0]) * dy - (a[1] - c[1]) * dx) / den;
    if (t > 0 && s >= -1e-9 && s <= 1 + 1e-9 && t > best) {
      best = t;
      e = i;
    }
  }
  return { q: [c[0] + dx * Math.max(0, best), c[1] + dy * Math.max(0, best)], e };
};
const rayHit = (p, c, th) => rayHitE(p, c, th).q;
const sector = (p, c, a, b) => {
  const A = rayHitE(p, c, a), B = rayHitE(p, c, b), n = p.length;
  const mid = [];
  const along = (e, q) => {
    const s = p[e], t = p[(e + 1) % n];
    return Math.hypot(q[0] - s[0], q[1] - s[1]) / (Math.hypot(t[0] - s[0], t[1] - s[1]) || 1);
  };
  if (!(A.e === B.e && along(B.e, B.q) >= along(A.e, A.q) && b - a < Math.PI)) {
    for (let i = (A.e + 1) % n, k = 0; k < n; i = (i + 1) % n, k++) {
      mid.push(p[i]);
      if (i === B.e) break;
    }
  }
  return [c, A.q, ...mid, B.q];
};
const faceNormal = (pts) => {
  let x = 0, y = 0, z = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    x += (a[1] - b[1]) * (a[2] + b[2]);
    y += (a[2] - b[2]) * (a[0] + b[0]);
    z += (a[0] - b[0]) * (a[1] + b[1]);
  }
  return norm([x, y, z]);
};
const orient = (pts, ref) => {
  const n = faceNormal(pts);
  return dot(n, ref) < 0 ? [-n[0], -n[1], -n[2]] : n;
};
const insetPoly = (p, off) => {
  const n = p.length;
  const nrm = p.map((a, i) => {
    const b = p[(i + 1) % n], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return [(b[1] - a[1]) / l, -(b[0] - a[0]) / l];
  });
  return p.map((q, i) => {
    const j = (i - 1 + n) % n, n1 = nrm[j], n2 = nrm[i], o1 = off[j], o2 = off[i];
    const det = n1[0] * n2[1] - n1[1] * n2[0];
    if (Math.abs(det) < 0.17) {
      const m = [n1[0] + n2[0], n1[1] + n2[1]], l2 = Math.hypot(m[0], m[1]) || 1, o = (o1 + o2) / 2;
      return [q[0] - m[0] / l2 * o, q[1] - m[1] / l2 * o];
    }
    let dx = (-o1 * n2[1] + o2 * n1[1]) / det, dy = (-o2 * n1[0] + o1 * n2[0]) / det;
    const lim = 2.6 * Math.max(o1, o2), l = Math.hypot(dx, dy);
    if (l > lim && l > 0) {
      dx *= lim / l;
      dy *= lim / l;
    }
    return [q[0] + dx, q[1] + dy];
  });
};
export const prism = (p, d, bev, mat, pass, cutEdge = () => false, at = [0, 0, 0]) => {
  const n = p.length, h = d / 2;
  const cut = Array.from({ length: n }, (_, i) => cutEdge(i));
  const off = cut.map((c) => c ? 0 : bev);
  const q = insetPoly(p, off);
  const vb = Array.from({ length: n }, (_, i) => !cut[i] || !cut[(i - 1 + n) % n] ? bev : 0);
  const P = (xy, w) => [xy[0] + at[0], xy[1] + at[1], w + at[2]];
  const F = [];
  const en = p.map((a, i) => {
    const b = p[(i + 1) % n], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return [(b[1] - a[1]) / l, -(b[0] - a[0]) / l, 0];
  });
  const vnorm = (i, k) => {
    const o = k === i ? (i - 1 + n) % n : (i + 1) % n;
    if (cut[o] || dot(en[i], en[o]) < Math.cos(30 * D2R)) return en[i];
    return norm([en[i][0] + en[o][0], en[i][1] + en[o][1], 0]);
  };
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n, a = p[i], b = p[j];
    const out = en[i];
    if (!cut[i]) {
      const wall = [P(a, h - bev), P(b, h - bev), P(b, -h + bev), P(a, -h + bev)];
      F.push({ pts: wall, n: out, pass, mat, vn: [vnorm(i, i), vnorm(i, j)] });
      if (bev > 0) {
        const fb = [P(a, h - bev), P(q[i], h), P(q[j], h), P(b, h - bev)];
        F.push({ pts: fb, n: orient(fb, [out[0], out[1], 1]), pass, mat, bev: true });
        const bb = [P(b, -h + bev), P(q[j], -h), P(q[i], -h), P(a, -h + bev)];
        F.push({ pts: bb, n: orient(bb, [out[0], out[1], -1]), pass, mat, bev: true });
      }
    } else {
      const raw = [P(a, h - vb[i]), P(q[i], h), P(q[j], h), P(b, h - vb[j]), P(b, -h + vb[j]), P(q[j], -h), P(q[i], -h), P(a, -h + vb[i])];
      const pts = raw.filter((v, k) => {
        const w = raw[(k + 1) % raw.length];
        return Math.hypot(v[0] - w[0], v[1] - w[1], v[2] - w[2]) > 1e-7;
      });
      F.push({ pts, n: out, pass, mat, cut: true });
    }
  }
  const front = q.map((v) => P(v, h)), back = [...q].reverse().map((v) => P(v, -h));
  F.push({ pts: front, n: [0, 0, 1], pass: pass + 1, mat, cap: true });
  F.push({ pts: back, n: [0, 0, -1], pass: pass + 1, mat, cap: true });
  return F;
};
export const box3 = (c, s, mat, pass) => {
  const [x, y, z] = c, [a, b, e] = [s[0] / 2, s[1] / 2, s[2] / 2];
  const v = (i, j, k) => [x + i * a, y + j * b, z + k * e];
  const quads = [
    [v(-1, -1, 1), v(1, -1, 1), v(1, 1, 1), v(-1, 1, 1)],
    [v(1, -1, -1), v(-1, -1, -1), v(-1, 1, -1), v(1, 1, -1)],
    [v(1, -1, 1), v(1, -1, -1), v(1, 1, -1), v(1, 1, 1)],
    [v(-1, -1, -1), v(-1, -1, 1), v(-1, 1, 1), v(-1, 1, -1)],
    [v(-1, -1, -1), v(1, -1, -1), v(1, -1, 1), v(-1, -1, 1)],
    [v(-1, 1, 1), v(1, 1, 1), v(1, 1, -1), v(-1, 1, -1)]
  ];
  return quads.map((pts) => {
    const m = pts.reduce((acc, p) => [acc[0] + p[0] / 4 - x / 4, acc[1] + p[1] / 4 - y / 4, acc[2] + p[2] / 4 - z / 4], [0, 0, 0]);
    return { pts, n: orient(pts, m), pass, mat };
  });
};
export const cylW = (cx, cy, r, w0, w1, segs, mat, pass) => {
  const ring = Array.from({ length: segs }, (_, i) => [cx + r * Math.cos(i / segs * 2 * Math.PI), cy + r * Math.sin(i / segs * 2 * Math.PI)]);
  return prism(cw(ring.map((v) => [v[0] - cx, v[1] - cy])), w1 - w0, 0, mat, pass, () => false, [cx, cy, (w0 + w1) / 2]);
};
const paint = (faces, vw, grow = 0) => {
  const eye = [0, 0, vw.P];
  const out = [];
  for (const f of faces) {
    const nv = rotV(vw, f.n);
    const rv = f.pts.map((p) => rotV(vw, p));
    const c = [0, 0, 0];
    for (const r of rv) {
      c[0] += r[0];
      c[1] += r[1];
      c[2] += r[2];
    }
    c[0] /= rv.length;
    c[1] /= rv.length;
    c[2] /= rv.length;
    if (dot(nv, [eye[0] - c[0], eye[1] - c[1], eye[2] - c[2]]) <= 1e-6) continue;
    const pr = rv.map((r) => {
      const s = vw.P / Math.max(1e-3, vw.P - r[2]);
      return [r[0] * s, r[1] * s];
    });
    if (f.vn && grow > 0 && pr.length === 4) {
      const ex = pr[1][0] - pr[0][0], ey = pr[1][1] - pr[0][1], el = Math.hypot(ex, ey) || 1, gx = ex / el * grow, gy = ey / el * grow;
      pr[0] = [pr[0][0] - gx, pr[0][1] - gy];
      pr[3] = [pr[3][0] - gx, pr[3][1] - gy];
      pr[1] = [pr[1][0] + gx, pr[1][1] + gy];
      pr[2] = [pr[2][0] + gx, pr[2][1] + gy];
    }
    const dw = { d: `M${pr.map((p) => `${n3(p[0])},${n3(p[1])}`).join("L")}Z`, face: f, nv, depth: c[2], light: lightOf(nv, f.cap ? 0 : 0.5) };
    if (f.vn) {
      dw.ends = [pr[0], pr[1]];
      dw.lights = [lightOf(rotV(vw, f.vn[0]), 0.5), lightOf(rotV(vw, f.vn[1]), 0.5)];
    }
    out.push(dw);
  }
  return out.sort((a, b) => a.face.pass - b.face.pass || a.depth - b.depth);
};
const pathOf = (vw, pts) => `M${pts.map((p) => {
  const q = projV(vw, p);
  return `${n3(q[0])},${n3(q[1])}`;
}).join("L")}Z`;
