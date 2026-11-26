// @ts-nocheck
// ★ V38 rev 2 (builder F) — the ARCHITECTURE KIT for the two landmark buildings (MIT's Building 10 / Great Dome, the Massachusetts
//   State House). Detail is real geometry merged into a FEW meshes (one per material), so a facade of hundreds of parts costs a
//   handful of draw calls in the software renderer:
//   · Kit       collects parts per material key (boxes, lathes, extruded mouldings, any geometry) and merges them; every vertex gets
//               WORLD-PROJECTED uvs (so one tiling ashlar / brick texture runs across all parts without stretching) unless the part
//               keeps its own (keepUV), and a per-vertex `fx` = (glow, ao): the glow is a baked uplight/wash (added to the emissive,
//               tinted by the surface's own albedo, so it reads as light on stone), the ao darkens recesses and undersides.
//   · kitMat    a MeshStandardMaterial that reads that `fx` attribute (uGlow colour × fx.x, diffuse × fx.y).
//   · mould     a classical moulding profile [[out, up], …] extruded along x (facade faces +z).
//   · lathe / fluted shaft / volute spiral / acanthus-leaf helpers.
//   · linTex    canvas textures in LINEAR space (bump / roughness maps), srgbTex for colour maps; both tile (RepeatWrapping).
import * as THREE from "three";
import { mergeGeometries, mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// ── textures ───────────────────────────────────────────────────────────────────────────────────────────────────────────
const cache = new Map();
const mkTex = (key, w, h, draw, srgb) => {
  if (cache.has(key)) return cache.get(key);
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = srgb ? 4 : 1; t.needsUpdate = true;   // (anisotropic bump taps are costly in SwiftShader)
  cache.set(key, t);
  return t;
};
export const srgbTex = (key, w, h, draw) => mkTex("s_" + key, w, h, draw, true);
export const linTex = (key, w, h, draw) => mkTex("l_" + key, w, h, draw, false);

/** a flat 4×4 map / bump: lets a plain material share the textured kit program (one shader compile for all of them) */
export const flatTex = (lin = false) => (lin ? linTex : srgbTex)("flat", 4, 4, (c, w, h) => { c.fillStyle = "#FFFFFF"; c.fillRect(0, 0, w, h); });
export const blackTex = () => srgbTex("black", 4, 4, (c, w, h) => { c.fillStyle = "#000000"; c.fillRect(0, 0, w, h); });

// ── transforms ─────────────────────────────────────────────────────────────────────────────────────────────────────────
export const mat4 = (pos = [0, 0, 0], rot = [0, 0, 0], scl = [1, 1, 1]) =>
  new THREE.Matrix4().compose(new THREE.Vector3(pos[0], pos[1], pos[2]), new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0], rot[1], rot[2])), new THREE.Vector3(scl[0], scl[1], scl[2]));
const BOX = new THREE.BoxGeometry(1, 1, 1);

// ── the kit ────────────────────────────────────────────────────────────────────────────────────────────────────────────
export class Kit {
  constructor() { this.parts = {}; this.count = 0; }
  /** add a geometry under a material key, transformed by pos/rot/scl (or a ready matrix `m`) */
  add(key, geo, pos, rot, scl, opt = {}) {
    let g = geo.index ? geo.toNonIndexed() : geo.clone();
    for (const n of Object.keys(g.attributes)) if (n !== "position" && n !== "normal" && n !== "uv") g.deleteAttribute(n);
    if (!g.attributes.normal) g.computeVertexNormals();
    if (!g.attributes.uv) g.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    g.applyMatrix4(opt.m ?? mat4(pos, rot, scl));
    g.userData = { keepUV: !!opt.keepUV, lit: opt.lit ?? 0, tag: opt.tag ?? 0 };
    (this.parts[key] ??= []).push(g); this.count++;
    return this;
  }
  /** an axis-aligned box (centre x,y,z; size w,h,d), optionally turned about y */
  box(key, w, h, d, x, y, z, ry = 0, opt) { return this.add(key, BOX, [x, y, z], [0, ry, 0], [w, h, d], opt); }
  /** a box without the faces listed in `skip` ("px nx py ny pz nz"): hidden faces cost full shading in the software renderer */
  boxF(key, w, h, d, x, y, z, skip, opt) {
    const g = new THREE.BoxGeometry(1, 1, 1), I = g.index.array, keep = [];
    ["px", "nx", "py", "ny", "pz", "nz"].forEach((f, k) => { if (!skip.includes(f)) for (let i = 0; i < 6; i++) keep.push(I[k * 6 + i]); });
    g.setIndex(keep);
    return this.add(key, g, [x, y, z], [0, 0, 0], [w, h, d], opt);
  }
  /** merge: fx(x, y, z, nx, ny, nz, userData) → [glow, ao]; uvs = world projection × uvScale[key] (unless keepUV) */
  build(fx, uvScale = {}) {
    const out = [];
    for (const key of Object.keys(this.parts)) {
      const s = uvScale[key] ?? 0.25;
      for (const g of this.parts[key]) {
        const P = g.attributes.position, N = g.attributes.normal, U = g.attributes.uv, n = P.count;
        const F = new Float32Array(n * 2);
        for (let i = 0; i < n; i++) {
          const x = P.getX(i), y = P.getY(i), z = P.getZ(i), nx = N.getX(i), ny = N.getY(i), nz = N.getZ(i);
          if (!g.userData.keepUV) {
            const ax = Math.abs(nx), ay = Math.abs(ny), az = Math.abs(nz);
            if (ay >= ax && ay >= az) U.setXY(i, x * s, z * s);
            else if (ax >= az) U.setXY(i, z * s, y * s);
            else U.setXY(i, x * s, y * s);
          }
          const r = fx ? fx(x, y, z, nx, ny, nz, g.userData) : [0, 1];
          F[i * 2] = r[0]; F[i * 2 + 1] = r[1];
        }
        g.setAttribute("fx", new THREE.Float32BufferAttribute(F, 2));
      }
      // merged in chunks of ≤ 60 000 vertices (a draw over a bigger buffer measured far slower in the software renderer)
      let chunk = [], n = 0;
      const flush = () => { if (!chunk.length) return; const merged = mergeGeometries(chunk, false); merged.computeBoundingSphere(); merged.computeBoundingBox(); out.push({ key, geometry: merged }); chunk = []; n = 0; };
      for (const g of this.parts[key]) { if (n + g.attributes.position.count > 60000) flush(); chunk.push(g); n += g.attributes.position.count; }
      flush();
    }
    return out;
  }
}

// ── the material that reads fx ─────────────────────────────────────────────────────────────────────────────────────────
export const kitMat = (o) => {
  const { glow = "#000000", glowI = 1, ...rest } = o;
  // every kit material carries a map, a bump map and an emissive map (flat ones where it has none), so all of them run ONE
  // shader program: a software renderer compiles each program variant for seconds
  if (!rest.map) rest.map = flatTex();
  if (!rest.bumpMap) { rest.bumpMap = flatTex(true); rest.bumpScale = 0; }
  if (!rest.emissiveMap) rest.emissiveMap = flatTex();
  const m = new THREE.MeshStandardMaterial(rest);
  const u = { value: new THREE.Color(glow).multiplyScalar(glowI) };
  m.userData.uGlow = u;
  m.onBeforeCompile = (s) => {
    s.uniforms.uGlow = u;
    s.vertexShader = s.vertexShader.replace("#include <common>", "#include <common>\nattribute vec2 fx;\nvarying vec2 vFx;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvFx = fx;");
    s.fragmentShader = s.fragmentShader.replace("#include <common>", "#include <common>\nuniform vec3 uGlow;\nvarying vec2 vFx;")
      .replace("#include <map_fragment>", "#include <map_fragment>\ndiffuseColor.rgb *= vFx.y;")
      .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance += uGlow * vFx.x * diffuseColor.rgb;");
  };
  m.customProgramCacheKey = () => "bldfx1";
  return m;
};

// ── geometry helpers ───────────────────────────────────────────────────────────────────────────────────────────────────
/** a moulding: profile [[out, up], …] from the wall (out 0) at the bottom, around the face, back to the wall at the top;
 *  extruded along x over `len`, centred; the face points +z */
export const mould = (profile, len) => {
  const s = new THREE.Shape();
  s.moveTo(0, profile[0][1]);
  for (const [o, u] of profile) s.lineTo(o, u);
  s.lineTo(0, profile[profile.length - 1][1]); s.closePath();
  // shape (x = out, y = up) extruded along +z by len → turn so out → +z and the run → x
  const g = new THREE.ExtrudeGeometry(s, { depth: len, bevelEnabled: false, curveSegments: 4 });
  g.translate(0, 0, -len / 2);
  g.rotateY(-Math.PI / 2);   // shape +x → +z ; extrusion +z → +x
  return g;
};
/** sample a quarter round (ovolo / cavetto) into profile points */
export const arcPts = (o0, u0, o1, u1, convex = true, n = 5) => {
  const pts = [];
  for (let i = 1; i <= n; i++) {
    const t = i / n, a = t * Math.PI / 2;
    const fo = convex ? Math.sin(a) : 1 - Math.cos(a), fu = convex ? 1 - Math.cos(a) : Math.sin(a);
    pts.push([o0 + (o1 - o0) * fo, u0 + (u1 - u0) * fu]);
  }
  return pts;
};
/** a cyma recta (S-curve) from (o0,u0) to (o1,u1) */
export const cymaPts = (o0, u0, o1, u1, n = 8) => {
  const pts = [];
  for (let i = 1; i <= n; i++) { const t = i / n; const e = t - Math.sin(2 * Math.PI * t) / (2 * Math.PI); pts.push([o0 + (o1 - o0) * e, u0 + (u1 - u0) * t]); }
  return pts;
};
/** a lathe from [[r, y], …] */
export const lathe = (pts, seg = 20) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(Math.max(0.0001, r), y)), seg);
/** a fluted shaft: radius r0 at the foot → r1 at the top (entasis over the upper two thirds), `flutes` concave flutes with fillets */
export const flutedShaft = (r0, r1, h, flutes = 24, sub = 6, rows = 8) => {
  const seg = flutes * sub;
  const g = new THREE.CylinderGeometry(1, 1, h, seg, rows, true);
  const P = g.attributes.position;
  for (let i = 0; i < P.count; i++) {
    const x = P.getX(i), y = P.getY(i), z = P.getZ(i);
    const t = (y + h / 2) / h;
    const R = t < 0.33 ? r0 : r0 + (r1 - r0) * Math.pow((t - 0.33) / 0.67, 1.3);
    const a = Math.atan2(z, x);
    const ph = ((a / (Math.PI * 2)) * flutes % 1 + 1) % 1;   // 0..1 across one flute + fillet
    const fl = 0.82;
    const d = ph < fl ? Math.sin((ph / fl) * Math.PI) : 0;
    const rr = R * (1 - 0.075 * d);
    P.setXYZ(i, Math.cos(a) * rr, y, Math.sin(a) * rr);
  }
  g.computeVertexNormals();
  return g;
};
/** an Ionic volute: a flat spiral band (≈ 2.3 turns), outer radius R, band thickness t, extruded `depth` (face +z); dir ±1 mirrors */
export const volute = (R, depth, dir = 1, turns = 2.3, n = 90) => {
  const s = new THREE.Shape();
  const T = turns * Math.PI * 2;
  const rad = (th) => R * (1 - 0.86 * th / T);
  const outer = [], inner = [];
  for (let i = 0; i <= n; i++) {
    const th = (i / n) * T, r = rad(th), w = Math.max(0.035 * R, 0.2 * r);
    const a = -Math.PI / 2 + th;       // start at the bottom, wind in
    outer.push([dir * Math.cos(a) * r, Math.sin(a) * r]);
    inner.push([dir * Math.cos(a) * (r - w), Math.sin(a) * (r - w)]);
  }
  s.moveTo(outer[0][0], outer[0][1]);
  for (const p of outer) s.lineTo(p[0], p[1]);
  for (let i = inner.length - 1; i >= 0; i--) s.lineTo(inner[i][0], inner[i][1]);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 2 });
  // the eye
  const eye = new THREE.CylinderGeometry(R * 0.16, R * 0.16, depth * 1.4, 12); eye.rotateX(Math.PI / 2); eye.translate(0, 0, depth / 2);
  return mergeGeometries([g.index ? g.toNonIndexed() : g, eye.toNonIndexed()].map((x) => { for (const k of Object.keys(x.attributes)) if (!["position", "normal", "uv"].includes(k)) x.deleteAttribute(k); return x; }));
};
/** a vase baluster lathe of height h, max radius r */
export const baluster = (h, r, seg = 8) => lathe([
  [r * 0.95, 0], [r * 0.95, 0.08 * h], [r * 0.7, 0.1 * h], [r * 0.6, 0.14 * h], [r * 0.9, 0.3 * h], [r, 0.42 * h], [r * 0.75, 0.56 * h],
  [r * 0.42, 0.7 * h], [r * 0.4, 0.78 * h], [r * 0.62, 0.82 * h], [r * 0.48, 0.86 * h], [r * 0.85, 0.9 * h], [r * 0.85, h], [0.0001, h]
], seg);
/** an acanthus leaf: a curved, tapering blade standing on y = 0, leaning out along +z, height h, width w; tip curls out */
export const leaf = (h, w) => {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, 0);
  s.bezierCurveTo(-w * 0.62, h * 0.45, -w * 0.4, h * 0.8, 0, h);
  s.bezierCurveTo(w * 0.4, h * 0.8, w * 0.62, h * 0.45, w / 2, 0);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: w * 0.12, bevelEnabled: false, curveSegments: 4 });
  // bend: push z out with height (the leaf leans and the tip curls forward)
  const P = g.attributes.position;
  for (let i = 0; i < P.count; i++) { const y = P.getY(i), t = y / h; P.setZ(i, P.getZ(i) + w * (0.15 * t + 0.55 * Math.pow(t, 3)) - Math.abs(P.getX(i)) * 0.35); }
  g.computeVertexNormals();
  return g;
};
/** a classical arch opening outline: a rectangle (x0..x1, y0..spring) topped by a semicircle */
export const archPath = (path, x0, x1, y0, spring, hole = true, n = 16) => {
  const r = (x1 - x0) / 2, cx = (x0 + x1) / 2;
  path.moveTo(x0, y0); path.lineTo(x1, y0); path.lineTo(x1, spring);
  for (let i = 1; i <= n; i++) { const a = (i / n) * Math.PI; path.lineTo(cx + Math.cos(a) * r, spring + Math.sin(a) * r); }
  path.lineTo(x0, y0);
  return path;
};
/** a semicircular arch ring (archivolt) of inner radius r, width w, depth d (face +z), centred at 0 */
export const archRing = (r, w, d, n = 18) => {
  const s = new THREE.Shape();
  for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI; const p = [Math.cos(a) * (r + w), Math.sin(a) * (r + w)]; i ? s.lineTo(p[0], p[1]) : s.moveTo(p[0], p[1]); }
  for (let i = n; i >= 0; i--) { const a = (i / n) * Math.PI; s.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
  s.closePath();
  return new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: 2 });
};
/** a meshes list from a built kit (R3F) */
export const smoothstep = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
