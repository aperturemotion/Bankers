// @ts-nocheck
// ★ V39 builder B — a used silver 2007 TOYOTA YARIS LIFTBACK, the US 3-DOOR hatchback (XP90), parked in the snow (FACTCHECK row 4:
//   used 2007 Yaris). Real proportions (b_yaris_shape.ts): length 3.81 m, width 1.695 m, height 1.525 m, wheelbase 2.46 m, 175/65 R14
//   tyres on steel wheels under plastic covers. The body is LOFTED from cross-sections along its length (short sloping hood, the long
//   raked windshield running into the roof, the near-upright hatch, tumblehome above a beltline that kicks up through the 3-door's rear
//   quarter window, wheel arches cut out of the sides). One LONG door per side, the B-pillar well back, a fixed raked quarter window.
//   The windows are REAL HOLES in the double-sided shell (its inside is the headliner / door-card trim), filled by a separate thin
//   tinted GLASS shell with a sky reflection and fresnel, so the detailed cabin (b_yaris_cabin.ts) shows through. Lamps (canvas lamp
//   clusters with reflectors and lenses), the black window surrounds, shut lines, the grille, fog-lamp blanks, the reflectors, a little
//   road salt at the sills and the snow on the roof are painted PER PIXEL in the shader from the same profile functions (a baked profile
//   texture), so every edge is crisp at any distance. Badges: YARIS in plain letters on the hatch and a plain chrome ellipse (no logo
//   artwork). Plates: VERMONT / GREEN MOUNTAIN STATE only. Front of the car = +x, right side = +z, ground y = 0. Units: metres.
import React, { useMemo } from "react";
import * as THREE from "three";
import { canvasTex, rnd } from "./kit";
import { XR, XF, LEN, AXF, AXR, WR, ARCH, TRACK, topY, beltY, planW, sideZ, botY, halfRing, crownH, hatchX, shieldX, DOOR_R } from "./b_yaris_shape";
import { tailTex, headTex, coverTex, sidewallTex, yarisBadgeTex, plateTex, TAIL, HEAD } from "./b_yaris_tex";
import { buildCabin } from "./b_yaris_cabin";

export { XR, XF, LEN, AXF, AXR, WR, ARCH, TRACK, topY, beltY, planW, sideZ, botY };

const stations = () => {
  const xs = [];
  for (let x = XR; x < -1.5; x += 0.004) xs.push(x);
  for (let x = -1.5; x < 1.72; x += 0.015) xs.push(x);
  for (let x = 1.72; x < XF; x += 0.004) xs.push(x);
  xs.push(XF);
  for (const c of [AXF, AXR]) for (const e of [-ARCH - 0.001, ARCH + 0.001]) xs.push(c + e);
  xs.sort((a, b) => a - b);
  return xs.filter((x, i) => i === 0 || x - xs[i - 1] > 0.0015);
};
let BODYGEO = null;
export const yarisBody = () => {
  if (BODYGEO) return BODYGEO;
  const xs = stations();
  const rings = xs.map((x) => { const h = halfRing(x).pts; return [...h, ...h.slice(1, -1).reverse().map((p) => [p[0], p[1], -p[2]])]; });
  const nR = rings[0].length, nS = rings.length;
  const pos = new Float32Array(nS * nR * 3);
  rings.forEach((r, i) => r.forEach((p, j) => { const k = (i * nR + j) * 3; pos[k] = p[0]; pos[k + 1] = p[1]; pos[k + 2] = p[2]; }));
  const idx = [];
  for (let i = 0; i < nS - 1; i++) for (let j = 0; j < nR; j++) {
    const a = i * nR + j, b = (i + 1) * nR + j, c = (i + 1) * nR + (j + 1) % nR, d = i * nR + (j + 1) % nR;
    idx.push(a, c, b, a, d, c);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setIndex(idx); g.computeVertexNormals();
  const n = g.attributes.normal; const j = Math.floor(nR / 4), i0 = Math.floor(nS / 2) * nR + j;
  if (n.getZ(i0) < 0) { const I = g.index.array; for (let k = 0; k < I.length; k += 3) { const t = I[k + 1]; I[k + 1] = I[k + 2]; I[k + 2] = t; } g.computeVertexNormals(); }
  g.computeBoundingSphere();
  BODYGEO = g;
  return g;
};
// the profile baked for the shader: R belt, G top (before the crown), B zt (top-corner half-width), A planW
let PROF = null;
const profTex = () => {
  if (PROF) return PROF;
  // half floats, LINEAR filtered (filterable in WebGL2 core; nearest sampling stair-stepped the edges where the profile is steep)
  const N = 2048, d = new Uint16Array(N * 4), H = THREE.DataUtils.toHalfFloat;
  for (let i = 0; i < N; i++) { const x = XR + (LEN * (i + 0.5)) / N, h = halfRing(x); d[i * 4] = H(beltY(x)); d[i * 4 + 1] = H(topY(x)); d[i * 4 + 2] = H(h.zt); d[i * 4 + 3] = H(planW(x)); }
  const t = new THREE.DataTexture(d, N, 1, THREE.RGBAFormat, THREE.HalfFloatType);
  t.minFilter = t.magFilter = THREE.LinearFilter; t.generateMipmaps = false; t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; t.needsUpdate = true;
  PROF = t; return t;
};
// ── the shared GLSL: the glass openings (from position only, so the paint, the glass and the shadow pass agree exactly) ─────────────
const GLSL_COMMON = /* glsl */`
varying vec3 vLP;
uniform sampler2D uProf; uniform float uXR; uniform float uLen;
float yAA(float v) { return max(fwidth(v), 1e-5); }
float band(float v, float a, float b) { float e = yAA(v) * 0.75; return smoothstep(a - e, a + e, v) * (1.0 - smoothstep(b - e, b + e, v)); }
float lineAt(float v, float c, float w) { return 1.0 - smoothstep(w * 0.5, w * 0.5 + yAA(v) * 1.2, abs(v - c)); }
float bPill(float y) { return -0.40 + 0.12 * (y - 1.0); }
float qRear(float y) { return -1.33 + 0.55 * (y - 1.1); }
float qDiv(float y) { return 0.60 - 0.2 * (y - 1.0); }
float rrect(vec2 p, vec2 lo, vec2 hi, float r) {   // anti-aliased coverage of a rounded rectangle
  vec2 c = (lo + hi) * 0.5, h = max((hi - lo) * 0.5 - r, vec2(0.0));
  vec2 q = abs(p - c) - h;
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  float e = max(fwidth(d), 1e-5) * 0.75;
  return 1.0 - smoothstep(-e, e, d);
}
vec4 yProf(float x) { return texture2D(uProf, vec2((x - uXR) / uLen, 0.5)); }
float yGlass(vec3 P, vec4 PR) {
  float bel = PR.r, top = PR.g, zt = PR.b;
  float x = P.x, y = P.y, az = abs(P.z);
  float onSide = step(zt + 0.004, az), onTop = 1.0 - onSide;
  float side = onSide * band(y, bel + 0.022, top - 0.09) * band(x, qRear(y), 1.2);
  float pill = band(x, bPill(y) - 0.09, bPill(y)) + band(x, qDiv(y) - 0.012, qDiv(y) + 0.012);
  side *= 1.0 - clamp(pill, 0.0, 1.0);
  float ws = onTop * rrect(vec2(P.z, x), vec2(-(zt - 0.052), 0.155), vec2(zt - 0.052, 1.03), 0.05);
  float hg = onTop * step(x, -1.5) * rrect(vec2(P.z, y), vec2(-(zt - 0.078), 1.025), vec2(zt - 0.078, 1.342), 0.065);
  return clamp(side + ws + hg, 0.0, 1.0);
}
`;
const FRAG_PAINT = /* glsl */`
  vec4 PR = yProf(vLP.x);
  float bel = PR.r, top = PR.g, zt = PR.b, pw = PR.a;
  float x = vLP.x, y = vLP.y, az = abs(vLP.z);
  vec3 ln = normalize(vLN);
  if (abs(x) > ${(XF - 0.012).toFixed(3)}) ln = vec3(sign(x), 0.0, 0.0);   // the loft's tips: their smooth normals are meaningless
  float onSide = step(zt + 0.004, az), onTop = 1.0 - onSide;
  float glass = yGlass(vLP, PR);
  if (glass > 0.5) discard;                                 // a real opening: the glass shell fills it
  float inside = gl_FrontFacing ? 0.0 : 1.0;
  float frontF = smoothstep(0.35, 0.65, ln.x), rearF = smoothstep(0.35, 0.65, -ln.x);
  // black: the window surrounds (DLO frame, B-pillar, quarter-light bar, the drip rail), the windshield frit, the hatch-glass frame
  float dlo = onSide * band(y, bel + 0.006, top - 0.064) * band(x, qRear(y) - 0.024, 1.2);
  float wsF = onTop * rrect(vec2(vLP.z, x), vec2(-(zt - 0.036), 0.137), vec2(zt - 0.036, 1.046), 0.06);
  float hgF = onTop * step(x, -1.5) * rrect(vec2(vLP.z, y), vec2(-(zt - 0.05), 1.0), vec2(zt - 0.05, 1.362), 0.085);
  float blk = clamp(dlo + wsF + hgF, 0.0, 1.0);
  // the mirror sail (black triangle at the door's front corner)
  float sail = onSide * band(x, qDiv(y) - 0.02, qDiv(y) + 0.12 - 0.9 * (y - bel)) * band(y, bel - 0.035, bel + 0.09);
  blk = max(blk, sail);
  // tail lamps (unrolled round the corner) and the headlamps
  float tIn = 0.52 + 0.06 * smoothstep(0.95, 1.12, y);
  float ts = (az - tIn) + 1.2 * max(0.0, x + 1.83);
  vec4 TL = texture2D(uTail, vec2(ts / ${TAIL.s1.toFixed(3)}, (y - ${TAIL.y0.toFixed(3)}) / ${(TAIL.y1 - TAIL.y0).toFixed(3)}));
  float tail = step(x, -1.66) * step(0.0, ts) * step(ts, ${TAIL.s1.toFixed(3)}) * band(y, ${TAIL.y0.toFixed(3)}, ${TAIL.y1.toFixed(3)}) * TL.a * (1.0 - inside);
  float hdx = max(0.0, x - 1.42), hda = max(0.0, 0.82 - az);
  float hs = hdx + hda - 0.586 * min(hdx, hda);          // ≈ the arc length round the corner
  vec4 HL = texture2D(uHead, vec2(hs / ${HEAD.s1.toFixed(3)}, (y - ${HEAD.y0.toFixed(3)}) / ${(HEAD.y1 - HEAD.y0).toFixed(3)}));
  float head = step(1.40, x) * step(0.0, hs) * step(hs, ${HEAD.s1.toFixed(3)}) * band(y, ${HEAD.y0.toFixed(3)}, ${HEAD.y1.toFixed(3)}) * HL.a * (1.0 - inside);
  // the third brake lamp in the spoiler lip over the hatch glass
  float hbrake = onTop * step(x, -1.5) * band(y, 1.354, 1.37) * band(az, -1.0, 0.125);
  // the front: the slim upper grille slot (a plain ellipse in it is geometry), the lower intake with its bars, fog-lamp blanks, the lip
  float grille = frontF * band(az, -1.0, 0.3) * band(y, 0.668, 0.735);
  float intake = frontF * band(az, -1.0, 0.40 + 0.3 * (y - 0.27)) * band(y, 0.27, 0.46);
  float bars = intake * (1.0 - step(0.25, fract((y - 0.27) * 26.0)));
  float fogR = length(vec2(az - 0.6, y - 0.37));
  float fogB = step(1.6, x) * (1.0 - smoothstep(0.048, 0.052, fogR));
  float fogRing = step(1.6, x) * lineAt(fogR, 0.052, 0.006);
  float lip = step(1.62, x) * (1.0 - smoothstep(0.235, 0.245, y));
  // the rear: the black lower valance with its red reflectors
  float rearBlk = step(x, -1.7) * (1.0 - smoothstep(0.325, 0.335, y));
  float refl = step(x, -1.7) * band(az, 0.6, 0.74) * band(y, 0.37, 0.405);
  float under = smoothstep(-0.35, -0.6, ln.y);
  // shut lines: the long door (front edge, rear edge, bottom, the roof gap), hood, fender/bumper, bumpers, the hatch, the fuel door
  float shut = 0.0;
  shut += onSide * lineAt(x, 0.775 + 0.03 * (y - 0.6), 0.004) * band(y, 0.33, bel);
  shut += onSide * lineAt(x, ${DOOR_R.toFixed(3)}, 0.004) * band(y, 0.33, bel);
  shut += onSide * lineAt(y, 0.335, 0.004) * band(x, ${DOOR_R.toFixed(3)}, 0.78);
  shut += onSide * lineAt(y, top - 0.058, 0.004) * band(x, ${DOOR_R.toFixed(3)} - 0.04, 0.95);
  shut += onTop * lineAt(x, 1.80, 0.004) * band(az, -1.0, zt - 0.02);
  shut += onTop * lineAt(az, zt - 0.02, 0.004) * band(x, 1.06, 1.80);
  shut += onSide * lineAt(x, 1.47, 0.004) * band(y, 0.45, 0.66);
  shut += onSide * lineAt(y, 0.56, 0.004) * band(x, -2.0, -1.665);
  shut += rearF * lineAt(y, 0.565, 0.004);
  shut += rearF * lineAt(az, tIn - 0.014, 0.004) * band(y, 0.565, 1.04);
  shut += onTop * lineAt(x, -1.565, 0.004) * band(az, -1.0, zt - 0.02);
  shut += onSide * step(0.0, vLP.z) * (band(x, -1.50, -1.31) * band(y, 0.86, 0.99) - band(x, -1.496, -1.314) * band(y, 0.864, 0.986));
  shut += onSide * lineAt(y, 0.62, 0.003) * band(x, 1.47, 2.0) * 0.6;
  shut = clamp(shut, 0.0, 1.0) * (1.0 - blk);
  // a used car: a little road salt and grime at the sills and behind the wheels (kept light)
  float hsh = fract(sin(dot(floor(vLP.xy * 160.0) + floor(vLP.z * 40.0), vec2(12.9898, 78.233))) * 43758.5453);
  float low = (1.0 - smoothstep(0.3, 0.5, y)) * (1.0 - inside) * (1.0 - under);
  // the snow lying on the roof
  float snow = smoothstep(0.84, 0.93, ln.y) * smoothstep(1.36, 1.40, y) * (1.0 - blk) * (1.0 - inside);
  // the inside of the shell: headliner and pillar trim (light grey), the door cards and quarter trims (dark), the carpet
  vec3 inC = mix(vec3(0.062, 0.066, 0.074), vec3(0.36, 0.35, 0.33), smoothstep(bel - 0.01, bel + 0.04, y));
  inC = mix(inC, vec3(0.11, 0.115, 0.125), band(y, bel - 0.12, bel - 0.02));
  inC = mix(inC, vec3(0.025), 1.0 - smoothstep(0.34, 0.37, y));
`;
let YM = null;
export const yarisPaint = () => {
  if (YM) return YM;
  const m = new THREE.MeshPhysicalMaterial({ color: "#A6ACB3", metalness: 0.55, roughness: 0.4, clearcoat: 0.45, clearcoatRoughness: 0.22, envMapIntensity: 1.0, side: THREE.DoubleSide });
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, { uProf: { value: profTex() }, uXR: { value: XR }, uLen: { value: LEN }, uTail: { value: tailTex() }, uHead: { value: headTex() } });
    sh.vertexShader = "varying vec3 vLP; varying vec3 vLN;\n" + sh.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\n vLP = position; vLN = objectNormal;");
    sh.fragmentShader = GLSL_COMMON + "varying vec3 vLN; uniform sampler2D uTail; uniform sampler2D uHead;\n" + sh.fragmentShader
      .replace("#include <color_fragment>", `#include <color_fragment>
${FRAG_PAINT}
  vec3 paint = diffuseColor.rgb;
  vec3 col = paint;
  col = mix(col, col * 0.72 + vec3(0.02, 0.019, 0.017), low * 0.55);
  col = mix(col, vec3(0.62, 0.62, 0.6), low * step(0.94, hsh) * 0.45);
  col = mix(col, vec3(0.012), blk);
  col = mix(col, TL.rgb, tail);
  col = mix(col, HL.rgb, head);
  col = mix(col, vec3(0.25, 0.01, 0.015), hbrake);
  col = mix(col, vec3(0.008), max(grille, intake));
  col = mix(col, vec3(0.03), bars);
  col = mix(col, vec3(0.012), max(max(fogB, lip), rearBlk));
  col = mix(col, vec3(0.05), fogRing);
  col = mix(col, vec3(0.3, 0.008, 0.01), refl);
  col = mix(col, vec3(0.01), under);
  col = mix(col, paint * 0.16, shut);
  col = mix(col, vec3(0.93, 0.95, 0.99), snow);
  col = mix(col, inC, inside);
  diffuseColor.rgb = col;`)
      .replace("#include <normal_fragment_begin>", `#include <normal_fragment_begin>
  // the loft's two tips (nose, tail centre) collapse to a line and their smooth normals are meaningless: use the facet normal there
  if (abs(vLP.x) > ${(XF - 0.012).toFixed(3)}) { vec3 fN = normalize(cross(dFdx(vViewPosition), dFdy(vViewPosition))); normal = fN; }`)
      .replace("#include <roughnessmap_fragment>", `#include <roughnessmap_fragment>
  roughnessFactor = mix(roughnessFactor, 0.35, blk);
  roughnessFactor = mix(roughnessFactor, 0.1, max(max(tail, head), max(hbrake, refl)));
  roughnessFactor = mix(roughnessFactor, 0.75, max(max(grille, intake), max(max(rearBlk, lip), max(under, fogB))));
  roughnessFactor = mix(roughnessFactor, 0.85, snow);
  roughnessFactor = mix(roughnessFactor, 0.6, low * 0.5);
  roughnessFactor = mix(roughnessFactor, 0.92, inside);`)
      .replace("#include <metalnessmap_fragment>", `#include <metalnessmap_fragment>
  metalnessFactor = mix(metalnessFactor, 0.0, max(max(blk, snow), max(max(tail, hbrake), max(max(grille, intake), max(under, max(rearBlk, max(lip, refl)))))));
  metalnessFactor = mix(metalnessFactor, 0.85, head * smoothstep(0.35, 0.7, max(HL.r, HL.b)));
  metalnessFactor = mix(metalnessFactor, 0.0, inside);`)
      .replace("#include <lights_physical_fragment>", `#include <lights_physical_fragment>
  material.clearcoat *= (1.0 - inside) * (1.0 - max(max(blk, under), max(snow, max(rearBlk, lip))));`)
      .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
  totalEmissiveRadiance += vec3(0.035, 0.0, 0.0) * tail * step(TL.g * 2.0, TL.r);`);
  };
  m.customProgramCacheKey = () => "yaris3_paint_v1";
  YM = m;
  return m;
};
// the shadow pass: the same openings let the light into the cabin
let YD = null;
const yarisDepth = () => {
  if (YD) return YD;
  const m = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, side: THREE.DoubleSide });
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, { uProf: { value: profTex() }, uXR: { value: XR }, uLen: { value: LEN } });
    sh.vertexShader = "varying vec3 vLP;\n" + sh.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\n vLP = position;");
    sh.fragmentShader = GLSL_COMMON + sh.fragmentShader.replace("void main() {", "void main() {\n  if (yGlass(vLP, yProf(vLP.x)) > 0.5) discard;");
  };
  m.customProgramCacheKey = () => "yaris3_depth_v1";
  YD = m; return m;
};
// ── the GLASS: a thin tinted shell over the openings — a faint blue-grey tint face-on, the blue-hour sky reflected at grazing angles ──
let YG = null;
const yarisGlass = () => {
  if (YG) return YG;
  const m = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
      uProf: { value: null }, uXR: { value: XR }, uLen: { value: LEN },
      uTint: { value: new THREE.Color("#1E2A36") }, uZen: { value: new THREE.Color("#0B2A55") }, uHor: { value: new THREE.Color("#7FA6D6") }, uGnd: { value: new THREE.Color("#9FB0C8") }
    }]),
    vertexShader: /* glsl */`
      #include <common>
      #include <fog_pars_vertex>
      varying vec3 vLP; varying vec3 vWN; varying vec3 vWP;
      void main() {
        vLP = position; vWN = normalize(mat3(modelMatrix) * normal);
        vec4 wp = modelMatrix * vec4(position, 1.0); vWP = wp.xyz;
        vec4 mvPosition = viewMatrix * wp; gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */`
      #include <common>
      #include <fog_pars_fragment>
      ${GLSL_COMMON.replace("varying vec3 vLP;", "")}
      varying vec3 vLP; varying vec3 vWN; varying vec3 vWP;
      uniform vec3 uTint; uniform vec3 uZen; uniform vec3 uHor; uniform vec3 uGnd;
      void main() {
        float g = yGlass(vLP, yProf(vLP.x));
        if (g < 0.5) discard;
        vec3 V = normalize(vWP - cameraPosition), N = normalize(vWN);
        if (!gl_FrontFacing) N = -N;
        float c = clamp(abs(dot(V, N)), 0.0, 1.0);
        float fr = 0.035 + 0.965 * pow(1.0 - c, 5.0);
        vec3 R = reflect(V, N);
        vec3 sky = mix(uHor, uZen, smoothstep(0.0, 0.7, R.y));
        sky = mix(uGnd * 0.55, sky, smoothstep(-0.08, 0.04, R.y));
        float streak = smoothstep(0.985, 1.0, sin(dot(vWP, vec3(1.3, 2.1, 0.7)) * 3.0)) * 0.15;   // a faint streaky sheen
        // a broad soft sheen (the sky's bright band reflected across the glass) so even face-on glass reads as glass
        float sheen = 0.5 + 0.5 * sin(dot(vWP, vec3(0.9, 1.6, 0.5)) * 1.7 + 1.0);
        sheen = smoothstep(0.55, 1.0, sheen) * 0.22;
        vec3 col = mix(uTint, sky, clamp(fr * 1.3 + 0.18 + sheen, 0.0, 1.0)) + streak * (0.3 + fr);
        float a = clamp(0.3 + fr * 0.85 + sheen + streak * 0.4, 0.0, 0.76);
        if (!gl_FrontFacing) a *= 0.6;
        gl_FragColor = vec4(col, a);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`,
    transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: true
  });
  m.uniforms.uProf.value = profTex();
  m.extensions = { derivatives: true };
  YG = m; return m;
};
// ── wheels: tyre (lathe) with its lettered sidewall, the black steel wheel, the brake (disc + caliper front, drum rear), the cover ─────
let WG = null;
const wheelGeo = () => WG ??= (() => {
  const R0 = 0.178, R1 = WR, W = 0.175;
  const tyre = new THREE.LatheGeometry([[R0, -W * 0.45], [R0 + 0.025, -W * 0.5], [R1 - 0.035, -W * 0.5], [R1 - 0.008, -W * 0.42], [R1, -W * 0.25], [R1 + 0.002, 0], [R1, W * 0.25], [R1 - 0.008, W * 0.42], [R1 - 0.035, W * 0.5], [R0 + 0.025, W * 0.5], [R0, W * 0.45]].map(([r, y]) => new THREE.Vector2(r, y)), 48);
  const wall = new THREE.RingGeometry(R0 + 0.006, R1 - 0.012, 64, 1); wall.rotateX(-Math.PI / 2); wall.translate(0, W * 0.5 + 0.0015, 0);
  { const P = wall.attributes.position, U = wall.attributes.uv; for (let i = 0; i < P.count; i++) U.setXY(i, 0.5 + P.getX(i) / (2 * (R1 - 0.012)), 0.5 - P.getZ(i) / (2 * (R1 - 0.012))); }
  const cover = new THREE.LatheGeometry([[0.0, W * 0.5 + 0.012], [0.08, W * 0.5 + 0.01], [0.17, W * 0.5 - 0.0], [0.19, W * 0.5 - 0.02]].map(([r, y]) => new THREE.Vector2(r, y)), 40);
  { const P = cover.attributes.position, U = cover.attributes.uv; for (let i = 0; i < P.count; i++) U.setXY(i, 0.5 + P.getX(i) / 0.4, 0.5 + P.getZ(i) / 0.4); }
  const steel = new THREE.CylinderGeometry(R0 - 0.004, R0 - 0.004, 0.006, 40); steel.translate(0, W * 0.5 - 0.035, 0);
  const rim = new THREE.CylinderGeometry(R0, R0, W * 0.9, 40, 1, true);
  const disc = new THREE.CylinderGeometry(0.125, 0.125, 0.022, 32); disc.translate(0, W * 0.5 - 0.075, 0);
  const hat = new THREE.CylinderGeometry(0.075, 0.075, 0.03, 24); hat.translate(0, W * 0.5 - 0.055, 0);
  const caliper = new THREE.BoxGeometry(0.09, 0.045, 0.1); caliper.translate(-0.105, W * 0.5 - 0.075, 0);
  const drum = new THREE.CylinderGeometry(0.12, 0.12, 0.06, 32); drum.translate(0, W * 0.5 - 0.085, 0);
  return { tyre, wall, cover, steel, rim, disc, hat, caliper, drum };
})();
const steelTex = () => canvasTex("b_yaris_steel", 256, 256, (c, w, h) => {
  c.fillStyle = "#2A2D31"; c.beginPath(); c.arc(128, 128, 127, 0, 7); c.fill();
  c.globalCompositeOperation = "destination-out";
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; c.beginPath(); c.ellipse(128 + Math.cos(a) * 84, 128 + Math.sin(a) * 84, 18, 12, a, 0, 7); c.fill(); }
  c.beginPath(); c.arc(128, 128, 20, 0, 7); c.fill();
  c.globalCompositeOperation = "source-over";
  for (let k = 0; k < 4; k++) { const a = k / 4 * Math.PI * 2 + 0.4; c.fillStyle = "#6A7078"; c.beginPath(); c.arc(128 + Math.cos(a) * 42, 128 + Math.sin(a) * 42, 7, 0, 7); c.fill(); }   // lug nuts
});
let WM = null;
const wheelMats = () => WM ??= {
  tyre: new THREE.MeshStandardMaterial({ color: "#1C1E21", roughness: 0.88 }),
  wall: new THREE.MeshStandardMaterial({ map: sidewallTex(), roughness: 0.85, polygonOffset: true, polygonOffsetFactor: -1 }),
  cover: new THREE.MeshStandardMaterial({ map: coverTex(), roughness: 0.36, metalness: 0.5, alphaTest: 0.5, side: THREE.DoubleSide }),
  steel: new THREE.MeshStandardMaterial({ map: steelTex(), roughness: 0.6, metalness: 0.4, alphaTest: 0.5 }),
  rim: new THREE.MeshStandardMaterial({ color: "#26292D", roughness: 0.6, metalness: 0.4, side: THREE.DoubleSide }),
  disc: new THREE.MeshStandardMaterial({ color: "#6E6A66", roughness: 0.45, metalness: 0.8 }),
  dark: new THREE.MeshStandardMaterial({ color: "#2A2522", roughness: 0.7, metalness: 0.3 })
};
export const Wheel = ({ position, side = 1, spin = 0, front = true }) => {
  const g = wheelGeo(), m = wheelMats();
  return (
    <group position={position} rotation-x={side * Math.PI / 2}>
      <group rotation-y={spin}>
        <mesh geometry={g.tyre} material={m.tyre} castShadow receiveShadow />
        <mesh geometry={g.wall} material={m.wall} />
        <mesh geometry={g.rim} material={m.rim} />
        <mesh geometry={g.steel} material={m.steel} />
        <mesh geometry={g.cover} material={m.cover} castShadow />
      </group>
      {front ? <><mesh geometry={g.disc} material={m.disc} /><mesh geometry={g.hat} material={m.dark} /><mesh geometry={g.caliper} material={m.dark} /></> : <mesh geometry={g.drum} material={m.dark} />}
    </group>
  );
};
/** the snow lying on the roof: a blanket draped on the roof surface, thickest in the middle, feathering out before the edges */
export const roofSnowGeo = () => {
  const NX = 60, NZ = 30, x0 = -1.5, x1 = 0.02, pos = [], idx = [];
  for (let i = 0; i <= NX; i++) for (let j = 0; j <= NZ; j++) {
    const x = x0 + (x1 - x0) * i / NX, h = halfRing(x), zt = h.zt * 0.97, v = (j / NZ) * 2 - 1, z = v * zt;
    const y = topY(x) + h.cr * (1 - v * v);
    const edge = Math.min(1, (1 - Math.abs(v)) * 5) * Math.min(1, (x - x0) * 6, (x1 - x) * 6);
    const th = 0.055 * Math.pow(Math.max(0, edge), 0.6) * (0.85 + 0.15 * Math.sin(x * 9 + v * 3));
    pos.push(x, y + th - 0.004, z);
  }
  for (let i = 0; i < NX; i++) for (let j = 0; j < NZ; j++) { const a = i * (NZ + 1) + j, b = a + NZ + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  if (g.attributes.normal.getY(Math.floor(pos.length / 6)) < 0) { const I = g.index.array; for (let k = 0; k < I.length; k += 3) { const t = I[k + 1]; I[k + 1] = I[k + 2]; I[k + 2] = t; } g.computeVertexNormals(); }
  return g;
};
let CAB = null;
const cabin = () => CAB ??= buildCabin();
export const Yaris = ({ snow = 1 }) => {
  const body = useMemo(yarisBody, []);
  const roofSnow = useMemo(roofSnowGeo, []);
  const paint = useMemo(yarisPaint, []);
  const depth = useMemo(yarisDepth, []);
  const glass = useMemo(yarisGlass, []);
  const cab = useMemo(cabin, []);
  const mats = useMemo(() => ({
    black: new THREE.MeshStandardMaterial({ color: "#121417", roughness: 0.55 }),
    rubber: new THREE.MeshStandardMaterial({ color: "#0C0D0F", roughness: 0.8 }),
    chrome: new THREE.MeshStandardMaterial({ color: "#D8DEE6", roughness: 0.14, metalness: 0.95 }),
    mirror: new THREE.MeshStandardMaterial({ color: "#8E99A6", roughness: 0.02, metalness: 1 }),
    badge: new THREE.MeshStandardMaterial({ map: yarisBadgeTex(), transparent: true, roughness: 0.2, metalness: 0.8, polygonOffset: true, polygonOffsetFactor: -2 }),
    plate: new THREE.MeshStandardMaterial({ map: plateTex(), roughness: 0.4, metalness: 0.2 }),
    liner: new THREE.MeshStandardMaterial({ color: "#07080A", roughness: 0.9, side: THREE.BackSide }),
    snow: new THREE.MeshStandardMaterial({ color: "#EEF2F8", roughness: 0.85 }),
    body: new THREE.MeshPhysicalMaterial({ color: "#959BA2", metalness: 0.55, roughness: 0.4, clearcoat: 0.45, clearcoatRoughness: 0.22 }),
    red: new THREE.MeshStandardMaterial({ color: "#5A0A10", roughness: 0.15, emissive: "#3A0005", emissiveIntensity: 0.08 })
  }), []);
  const yP = 0.74, xP = hatchX(0.74);
  const xw = shieldX(1.06);   // the windshield's base line
  const rw = useMemo(() => {   // the rear wiper arm lying on the hatch glass, from its pivot up and to the left
    const x0 = hatchX(1.06), x1 = hatchX(1.3), d = new THREE.Vector3(x1 - x0, 0.24, 0).normalize();
    const a = d.clone().multiplyScalar(Math.cos(1.15)).add(new THREE.Vector3(0, 0, -Math.sin(1.15))).normalize();
    const nrm = new THREE.Vector3(-0.24, x1 - x0, 0).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), a);
    const c = new THREE.Vector3(x0, 1.06, 0.02).add(a.clone().multiplyScalar(0.18)).add(nrm.clone().multiplyScalar(0.02));
    const c2 = c.clone().add(nrm.clone().multiplyScalar(-0.012));
    return { p: c.toArray(), p2: c2.toArray(), q };
  }, []);
  return (
    <group>
      <mesh geometry={body} material={paint} customDepthMaterial={depth} castShadow receiveShadow />
      <primitive object={cab} />
      <mesh geometry={body} material={glass} renderOrder={3} />
      {/* arch liners (dark half-cylinders inside each arch, kept outboard of the cabin) */}
      {[AXF, AXR].map((x) => [-1, 1].map((sd) => (
        <mesh key={x + "_" + sd} position={[x, WR, sd * 0.73]} rotation-x={Math.PI / 2} material={mats.liner}>
          <cylinderGeometry args={[ARCH - 0.005, ARCH - 0.005, 0.26, 24, 1, true, -Math.PI / 2, Math.PI]} />
        </mesh>
      )))}
      {[AXF, AXR].map((x) => [-1, 1].map((sd) => <Wheel key={x + "w" + sd} position={[x, WR, sd * TRACK]} side={sd} front={x > 0} />))}
      {/* door mirrors on their sails at the door's front corner: body-colour shells, black bases and arms, the glass */}
      {[-1, 1].map((sd) => {
        const x = 0.57, y = beltY(0.57) + 0.07, z = sideZ(x, y);
        return (
          <group key={sd} position={[x, y, sd * z]}>
            <mesh position={[0.02, -0.02, sd * 0.03]} material={mats.black}><boxGeometry args={[0.1, 0.05, 0.06]} /></mesh>
            <mesh position={[-0.01, 0.02, sd * 0.13]} material={mats.body} castShadow scale={[0.48, 0.62, 1]} rotation-y={sd * 0.12}><sphereGeometry args={[0.1, 18, 12]} /></mesh>
            <mesh position={[-0.045, 0.02, sd * 0.13]} rotation-y={-Math.PI / 2 + sd * 0.12} material={mats.black}><planeGeometry args={[0.165, 0.115]} /></mesh>
            <mesh position={[-0.048, 0.02, sd * 0.13]} rotation-y={-Math.PI / 2 + sd * 0.12} material={mats.mirror}><planeGeometry args={[0.15, 0.1]} /></mesh>
          </group>
        );
      })}
      {/* the door handle (one per side, at the rear of the long door): body colour pull, a dark recess behind */}
      {[-1, 1].map((sd) => {
        const x = DOOR_R + 0.2, y = 0.905;
        return (
          <group key={"h" + sd} position={[x, y, sd * (sideZ(x, y) + 0.003)]}>
            <mesh material={mats.black}><boxGeometry args={[0.15, 0.042, 0.006]} /></mesh>
            <mesh position={[0.012, 0, sd * 0.012]} material={mats.body}><boxGeometry args={[0.13, 0.03, 0.018]} /></mesh>
            <mesh position={[-0.07, 0, sd * 0.008]} material={mats.black}><boxGeometry args={[0.025, 0.03, 0.012]} /></mesh>
          </group>
        );
      })}
      {/* the cowl panel at the windshield base, the two wipers parked on it, the washer jets on the hood */}
      <mesh position={[xw + 0.035, topY(xw + 0.035) + 0.012, 0]} rotation-z={0.12} material={mats.black}><boxGeometry args={[0.09, 0.014, 1.22]} /></mesh>
      {[[-0.05, 0.6], [0.4, 0.5]].map(([z, l], i) => (
        <group key={"w" + i} position={[xw + 0.005, topY(xw) + 0.03, z]} rotation-z={0.22} rotation-y={0.05}>
          <mesh material={mats.black}><boxGeometry args={[0.014, 0.012, l]} /></mesh>
          <mesh position={[0.012, -0.004, 0]} material={mats.rubber}><boxGeometry args={[0.018, 0.012, l * 0.95]} /></mesh>
        </group>
      ))}
      {[-0.26, 0.26].map((z) => <mesh key={"j" + z} position={[xw + 0.1, topY(xw + 0.1) + crownH(xw + 0.1) * (1 - (z / 0.7) ** 2) + 0.004, z]} material={mats.black}><boxGeometry args={[0.02, 0.01, 0.012]} /></mesh>)}
      {/* the roof antenna: a base and a raked mast at the rear of the roof */}
      <mesh position={[-1.3, topY(-1.3) + 0.055, 0]} material={mats.black}><boxGeometry args={[0.07, 0.02, 0.035]} /></mesh>
      <mesh position={[-1.36, topY(-1.3) + 0.17, 0]} rotation-z={0.55} material={mats.black}><cylinderGeometry args={[0.003, 0.006, 0.26, 6]} /></mesh>
      {/* the third brake lamp lens in the spoiler lip; the rear wiper on the hatch glass */}
      <mesh position={[hatchX(1.362) - 0.006, 1.362, 0]} rotation-z={0.5} material={mats.red}><boxGeometry args={[0.01, 0.014, 0.24]} /></mesh>
      <group position={[hatchX(1.06) - 0.03, 1.06, 0.02]}>
        <mesh material={mats.black} rotation-x={Math.PI / 2}><cylinderGeometry args={[0.022, 0.026, 0.03, 12]} /></mesh>
        <mesh position={[0.012, 0.0, 0]} rotation-z={Math.PI / 2} material={mats.black}><cylinderGeometry args={[0.018, 0.018, 0.03, 12]} /></mesh>
      </group>
      <mesh position={rw.p} quaternion={rw.q} material={mats.black}><boxGeometry args={[0.012, 0.36, 0.016]} /></mesh>
      <mesh position={rw.p2} quaternion={rw.q} material={mats.rubber}><boxGeometry args={[0.01, 0.32, 0.03]} /></mesh>
      {/* the rear: YARIS on the hatch (lower right), the plain chrome ellipse, the plate in its recess with its lamp */}
      <mesh position={[hatchX(0.92) - 0.012, 0.92, 0.3]} rotation-y={-Math.PI / 2} material={mats.badge}><planeGeometry args={[0.2, 0.05]} /></mesh>
      <mesh position={[hatchX(0.95) - 0.012, 0.95, 0]} rotation={[0, -Math.PI / 2, 0]} scale={[1, 0.68, 1]} material={mats.chrome}><torusGeometry args={[0.055, 0.008, 8, 32]} /></mesh>
      <mesh position={[xP + 0.002, yP, 0]} rotation-y={-Math.PI / 2} material={mats.black}><boxGeometry args={[0.37, 0.175, 0.012]} /></mesh>
      <mesh position={[xP - 0.006, yP, 0]} rotation-y={-Math.PI / 2} material={mats.plate}><planeGeometry args={[0.31, 0.155]} /></mesh>
      <mesh position={[xP - 0.01, yP + 0.095, 0]} material={mats.black}><boxGeometry args={[0.03, 0.012, 0.12]} /></mesh>
      {/* the front: a plain chrome ellipse in the upper grille slot, the front plate on its bracket over the intake */}
      <mesh position={[1.888, 0.70, 0]} rotation={[0, Math.PI / 2, 0]} scale={[1, 0.68, 1]} material={mats.chrome}><torusGeometry args={[0.05, 0.007, 8, 32]} /></mesh>
      <mesh position={[1.9, 0.43, 0]} rotation-y={Math.PI / 2} material={mats.black}><boxGeometry args={[0.35, 0.17, 0.012]} /></mesh>
      <mesh position={[1.908, 0.43, 0]} rotation-y={Math.PI / 2} material={mats.plate}><planeGeometry args={[0.31, 0.155]} /></mesh>
      {/* the snow on the roof */}
      {snow > 0 && <mesh geometry={roofSnow} material={mats.snow} castShadow receiveShadow />}
    </group>
  );
};
