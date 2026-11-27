// @ts-nocheck
// ★ V38 ROAD — the Selbees' sedan. Rev 2 (builder D; Timur 2026-11-26: "make the car a lot more detailed, make it more realistic"):
//   a generic mid-2000s American four-door family sedan, no make and no badges (road_carbody.ts: a lofted body with shoulder crease,
//   tumblehome, tucked sill and cut wheel arches; a lofted glasshouse with A/B/C pillars, black window frames and drip mouldings),
//   panel gaps, sill trim and body-side mouldings printed into its paint (+ bump), lamp clusters with reflectors and lenses, grille,
//   intake and fog lamps cut as decals from the body, real wheels (road_wheel.tsx), mirrors, chrome handles, belt mouldings, wipers,
//   a Michigan plate, the exhaust, and a full cabin (road_interior.tsx) with the steering wheel on the LEFT.
//   ★ THE ROOF FIX: the draft drew the whole glasshouse (roof included) as one transparent mesh and the body paint as a transparent
//   material too; the renderer sorts transparent meshes by their centres, so from the front (the cabin's centre then FARTHER than the
//   body's) the glass drew first without writing depth and the body painted over it — the roof and windshield "went transparent".
//   Now the body, the roof and every trim are OPAQUE until the x-ray starts (their materials switch to transparent only while the
//   shell is fading), only the window panes are glass, and the glass always draws after the opaque car.
//   X-RAY (unchanged timing and look): on "betting" the shell turns to clear pale-blue glass with a white rim (the panel and window
//   lines + a fresnel edge glow); the cabin and the tubs of tickets show; the tubs glow. Front = +x, right = +z, ground y = 0.
import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { canvasTex, Glow, clamp01 } from "./kit";
import { Tub } from "./st_road_parts";
import { bodyGeometry, greenGeometry, featureLines, decal, topY, roofY, beltW, sideZ, AXLE, TRACK } from "./road_carbody";
import { sideTex, sideBump, topTex, topBump, headTex, headEmis, tailTex, tailEmis, grilleTex, intakeTex, plateTex } from "./road_cartex";
import { Wheel, useWheelMats } from "./road_wheel";
import { Cabin, useCabinMats } from "./road_interior";

const beamTex = () => canvasTex("beamCone", 16, 256, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, 0, h);   // top row = the cone's apex (the lamp)
  g.addColorStop(0, "rgba(255,255,255,0.95)"); g.addColorStop(0.25, "rgba(255,255,255,0.35)"); g.addColorStop(0.7, "rgba(255,255,255,0.08)"); g.addColorStop(1, "rgba(255,255,255,0)");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
});
/** opaque until it must fade: a material is transparent ONLY while op < 1 (switching recompiles once, then caches) */
const fade = (m, op, depthWrite = false) => {
  const tr = op < 0.999;
  if (m.transparent !== tr) { m.transparent = tr; m.needsUpdate = true; }
  m.opacity = op; m.depthWrite = !tr || depthWrite; m.visible = op > 0.004;
};
const rimShader = () => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  uniforms: { k: { value: 0 }, col: { value: new THREE.Color("#E6F1FF") } },
  vertexShader: "varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }",
  fragmentShader: "uniform float k;\nuniform vec3 col;\nvarying vec3 vN;\nvarying vec3 vV;\nvoid main(){\n float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.6);\n gl_FragColor = vec4(col * f * k, 1.0);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}"
});

const PAINT = "#A9BCD4", XRAY = "#8FC0F5";
const useCarParts = () => useMemo(() => {
  const B = bodyGeometry(), G = greenGeometry();
  const st = sideTex(), sb = sideBump(), tt = topTex(), tb = topBump();
  const paintP = { color: PAINT, metalness: 0.55, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.06 };
  const M = {
    side: new THREE.MeshPhysicalMaterial({ ...paintP, map: st, bumpMap: sb, bumpScale: 2.2 }),
    top: new THREE.MeshPhysicalMaterial({ ...paintP, map: tt, bumpMap: tb, bumpScale: 2.2 }),
    roof: new THREE.MeshPhysicalMaterial({ ...paintP }),
    under: new THREE.MeshStandardMaterial({ color: "#0B111A", roughness: 0.9 }),
    trim: new THREE.MeshPhysicalMaterial({ color: "#0A0E15", roughness: 0.32, metalness: 0.2, clearcoat: 0.5 }),
    chrome: new THREE.MeshStandardMaterial({ color: "#DDE7F4", metalness: 1, roughness: 0.14 }),
    mirror: new THREE.MeshStandardMaterial({ color: "#B9C9DD", metalness: 1, roughness: 0.03 }),
    liner: new THREE.MeshStandardMaterial({ color: "#070C14", roughness: 0.95, side: THREE.DoubleSide }),
    plate: new THREE.MeshStandardMaterial({ map: plateTex(), roughness: 0.4, metalness: 0.1 }),
    head: new THREE.MeshPhysicalMaterial({ map: headTex(), emissiveMap: headEmis(), emissive: "#FFFFFF", emissiveIntensity: 2.4, alphaTest: 0.5, roughness: 0.12, metalness: 0.35, clearcoat: 1, clearcoatRoughness: 0.03 }),
    tail: new THREE.MeshPhysicalMaterial({ map: tailTex(), emissiveMap: tailEmis(), emissive: "#FFFFFF", emissiveIntensity: 1.8, alphaTest: 0.5, roughness: 0.15, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.03 }),
    grille: new THREE.MeshPhysicalMaterial({ map: grilleTex(), alphaTest: 0.5, roughness: 0.2, metalness: 0.75, clearcoat: 0.6 }),
    intake: new THREE.MeshPhysicalMaterial({ map: intakeTex(), alphaTest: 0.5, roughness: 0.35, metalness: 0.4 }),
    third: new THREE.MeshStandardMaterial({ color: "#7A1F25", emissive: "#E02A2A", emissiveIntensity: 2, toneMapped: false }),
    glass: new THREE.MeshPhysicalMaterial({ color: "#0B1626", metalness: 0.25, roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.3, transparent: true, opacity: 0.8 }),
    rim: rimShader()
  };
  // decals cut from the body's own faces (they hug the nose and tail exactly)
  const D = {
    head: [1, -1].map((s) => decal({ c: [2.33, 0.715, s * 0.6], dir: [1, 0, 0.62 * s], w: 0.62, h: 0.2, flipU: s < 0 })),
    tail: [1, -1].map((s) => decal({ c: [-2.36, 0.855, s * 0.6], dir: [-1, 0, 0.55 * s], w: 0.6, h: 0.2, flipU: s < 0 })),
    grille: decal({ c: [2.46, 0.705, 0], dir: [1, 0, 0], w: 0.64, h: 0.17 }),
    intake: decal({ c: [2.46, 0.43, 0], dir: [1, 0, 0], w: 1.15, h: 0.2 })
  };
  // belt mouldings (chrome) along the shelf under the side glass
  const belt = [1, -1].map((s) => {
    const pts = []; for (let x = -1.4; x <= 0.97; x += 0.06) pts.push(new THREE.Vector3(x, topY(x) + 0.006, s * (beltW(x) + 0.016)));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.0075, 6, false);
  });
  // wipers parked along the windshield's foot: blade + arm to its pivot at the cowl
  const wip = [[-0.68, -0.12], [-0.06, 0.48]].map(([z0, z1]) => {
    const x = 0.955, y = roofY(x) + 0.009;
    return { x, y, z: (z0 + z1) / 2, len: z1 - z0 };
  });
  // the door mirror's housing: a rounded shell, deeper at its outer end, its glass on the rear face
  const mirrorBody = new RoundedBoxGeometry(0.1, 0.105, 0.2, 3, 0.04);
  { const p = mirrorBody.attributes.position; for (let i = 0; i < p.count; i++) { const z = p.getZ(i), k = 0.75 + 0.25 * (z + 0.1) / 0.2; p.setY(i, p.getY(i) * k); p.setX(i, p.getX(i) * (0.8 + 0.2 * k) + (p.getX(i) > 0 ? 0.012 * (1 - k) : 0)); } mirrorBody.computeVertexNormals(); }
  return { B, G, M, D, belt, wip, lines: featureLines(), handle: new RoundedBoxGeometry(0.17, 0.034, 0.03, 2, 0.012), mirrorBody };
}, []);

/** the car. xray 0–1 (shell → glass); flash 0–1 (the white rim's peak); shell 0–1 (whole car dissolves for the push in);
 *  glow 0–1 (the tubs light in the accent); spin: wheel angle */
export const Car = ({ xray = 0, flash = 0, shell = 1, glow = 0, spin = 0, lit = 1, tail = 1 }) => {
  const { B, G, M, D, belt, wip, lines, handle, mirrorBody } = useCarParts();
  const W = useWheelMats();
  const C = useCabinMats();
  const beam = useMemo(beamTex, []);
  const tgt = useMemo(() => { const o = new THREE.Object3D(); o.position.set(18, -0.6, 0); return o; }, []);
  // ── the x-ray (timing and look as the draft): paint thins to pale-blue glass, white rim ─────────────────────────────────
  const op = shell * (1 - 0.86 * xray);
  for (const k of ["side", "top", "roof"]) {
    const m = M[k]; fade(m, op);
    m.color.set(PAINT).lerp(new THREE.Color(XRAY), xray);
    m.emissive.set("#3F7CC4"); m.emissiveIntensity = 0.5 * xray + 1.4 * flash;
  }
  for (const k of ["under", "trim", "chrome", "mirror", "liner", "plate", "grille", "intake"]) fade(M[k], shell * (1 - (k === "liner" ? 0.7 : 0.8) * xray));
  fade(M.head, shell * (1 - 0.45 * xray)); fade(M.tail, shell * (1 - 0.55 * xray)); fade(M.third, shell * (1 - 0.6 * xray));
  M.head.emissiveIntensity = 2.4 * shell * lit; M.tail.emissiveIntensity = 1.8 * shell * tail * (1 - 0.6 * xray); M.third.emissiveIntensity = 2 * tail;
  // the panes: tinted glass, always drawn after the opaque car; they write depth until the x-ray thins them
  const gop = shell * (0.8 - 0.7 * xray);
  M.glass.opacity = gop; M.glass.depthWrite = xray < 0.02 && shell > 0.99; M.glass.visible = gop > 0.004;
  const rimOp = shell * clamp01(0.7 * xray + 0.6 * flash);
  M.rim.uniforms.k.value = shell * clamp01(0.28 * xray + 0.8 * flash);
  for (const m of Object.values(C)) fade(m, shell, true);
  for (const m of Object.values(W)) fade(m, shell, true);
  const cast = xray < 0.3 && shell > 0.5;
  const lampsOn = shell;
  return (
    <group>
      {/* contact shadow under the car (soft, always) */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.012, 0]}>
        <planeGeometry args={[6.0, 2.9]} />
        <meshBasicMaterial color="#000814" transparent opacity={0.78 * shell} depthWrite={false} alphaMap={useMemo(() => canvasTex("carShadow", 128, 64, (c, w, h) => { const g = c.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2); g.addColorStop(0, "#fff"); g.addColorStop(0.6, "#888"); g.addColorStop(1, "#000"); c.fillStyle = g; c.fillRect(0, 0, w, h); }), [])} />
      </mesh>
      {/* the body and its glasshouse */}
      <mesh geometry={B.side} material={M.side} castShadow={cast} receiveShadow />
      <mesh geometry={B.top} material={M.top} castShadow={cast} receiveShadow />
      <mesh geometry={B.under} material={M.under} />
      <mesh geometry={G.paint} material={M.roof} castShadow={cast} receiveShadow />
      <mesh geometry={G.trim} material={M.trim} castShadow={cast} />
      <mesh geometry={G.glass} material={M.glass} renderOrder={2} />
      {/* the x-ray's white rim: panel / window lines and a fresnel edge glow */}
      <lineSegments geometry={lines} visible={rimOp > 0.003}><lineBasicMaterial color="#E6F1FF" transparent opacity={rimOp} depthWrite={false} /></lineSegments>
      {M.rim.uniforms.k.value > 0.003 && <><mesh geometry={B.all} material={M.rim} renderOrder={3} /><mesh geometry={G.all} material={M.rim} renderOrder={3} /></>}
      {/* lamps, grille, intake (decals on the body) */}
      {D.head.map((g, i) => <mesh key={"h" + i} geometry={g} material={M.head} />)}
      {D.tail.map((g, i) => <mesh key={"t" + i} geometry={g} material={M.tail} />)}
      <mesh geometry={D.grille} material={M.grille} />
      <mesh geometry={D.intake} material={M.intake} />
      {[1, -1].map((s) => (
        <group key={s}>
          <mesh geometry={belt[s > 0 ? 0 : 1]} material={M.chrome} />
          {/* door handles (chrome pulls in their finger cups) */}
          {[0.42, -0.62].map((x) => <mesh key={x} geometry={handle} material={M.chrome} position={[x, 0.862, s * (sideZ(x, 0.862) + 0.013)]} />)}
          {/* the door mirror: a painted housing on its stalk, the glass facing back */}
          <group position={[0.84, 1.035, s * (beltW(0.84) + 0.16)]} scale={[1, 1, s]}>
            <mesh geometry={mirrorBody} material={M.roof} castShadow={cast} />
            <mesh position={[-0.0505, 0.002, 0.004]} rotation-y={-Math.PI / 2} material={M.mirror}><planeGeometry args={[0.165, 0.082]} /></mesh>
            <mesh position={[0.02, -0.03, -0.115]} material={M.trim}><boxGeometry args={[0.09, 0.035, 0.07]} /></mesh>
          </group>
          {/* wheel-arch liners */}
          {[AXLE, -AXLE].map((x) => <mesh key={"l" + x} position={[x, 0.34, s * 0.73]} rotation-x={Math.PI / 2} material={M.liner}><cylinderGeometry args={[0.4, 0.4, 0.3, 24, 1, true, Math.PI / 2, Math.PI]} /></mesh>)}
        </group>
      ))}
      {/* wipers: blade and arm, parked */}
      {wip.map((w, i) => (
        <group key={"w" + i} position={[w.x, w.y, w.z]}>
          <mesh material={M.trim}><boxGeometry args={[0.016, 0.014, w.len]} /></mesh>
          <mesh position={[0.035, -0.004, 0.06]} rotation-y={0.12} material={M.trim}><boxGeometry args={[0.012, 0.012, w.len * 0.85]} /></mesh>
        </group>
      ))}
      {/* the rear plate (in a dark recess on the bumper) and its lamp; the exhaust tip */}
      <mesh position={[-2.452, 0.54, 0]} rotation-y={-Math.PI / 2} material={M.trim}><planeGeometry args={[0.36, 0.19]} /></mesh>
      <mesh position={[-2.458, 0.54, 0]} rotation-y={-Math.PI / 2} material={M.plate}><planeGeometry args={[0.305, 0.152]} /></mesh>
      <Glow position={[-2.47, 0.63, 0]} size={0.25} color="#EAF2FF" opacity={0.5 * lampsOn * tail} />
      <group position={[-2.37, 0.3, -0.48]} rotation-z={Math.PI / 2}>
        <mesh material={M.chrome}><cylinderGeometry args={[0.035, 0.035, 0.16, 20, 1, true]} /></mesh>
        <mesh position={[0, -0.07, 0]} material={M.under}><cylinderGeometry args={[0.03, 0.03, 0.01, 20]} /></mesh>
      </group>
      {/* the third brake light on the parcel shelf, under the rear window */}
      <mesh position={[-1.34, 1.02, 0]} material={M.third}><boxGeometry args={[0.05, 0.03, 0.3]} /></mesh>
      {/* headlamp light: glows on the lenses, the beams in the haze, one spot for both */}
      {[-1, 1].map((s) => (
        <group key={"hl" + s}>
          <Glow position={[2.48, 0.72, s * 0.46]} size={1.3} color="#DCEBFF" opacity={0.85 * lampsOn * lit} />
          <Glow position={[2.5, 0.72, s * 0.46]} size={0.42} color="#FFFFFF" opacity={0.95 * lampsOn * lit} />
          <Glow position={[2.42, 0.72, s * 0.6]} size={0.5} color="#DCEBFF" opacity={0.5 * lampsOn * lit} />
          {[0.45, 0.75, 1].map((k) => (
            <mesh key={k} position={[2.38 + 7.6, 0.72 - 0.32, s * 0.97]} rotation-z={Math.PI / 2 + 0.045}>
              <coneGeometry args={[2.4 * k, 15, 28, 1, true]} />
              <meshBasicMaterial map={beam} color="#BFD8FF" transparent opacity={0.035 * lampsOn * lit} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
            </mesh>
          ))}
          <Glow position={[-2.5, 0.86, s * 0.5]} size={0.9} color="#FF4A4A" opacity={0.5 * lampsOn * tail * (1 - 0.6 * xray)} />
        </group>
      ))}
      <primitive object={tgt} />
      <spotLight position={[2.35, 0.72, 0]} target={tgt} angle={0.42} penumbra={0.8} intensity={340 * lampsOn * lit} distance={46} decay={1.6} color="#EAF2FF" />
      {/* wheels */}
      {[[AXLE, 1], [AXLE, -1], [-AXLE, 1], [-AXLE, -1]].map(([x, s]) => <Wheel key={x + "_" + s} x={x} z={s * TRACK} side={s} spin={spin} mats={W} />)}
      {/* the cabin, and what the car carries — tubs of tickets on the back seat and in the trunk */}
      <group visible={shell > 0.004}><Cabin mats={C} /></group>
      <Tub position={[-0.7, 0.67, -0.33]} rotY={0.04} glow={glow} seed={5} fade={shell} num={18} />
      <Tub position={[-0.7, 0.67, 0.33]} rotY={-0.03} glow={glow} seed={6} fade={shell} num={19} />
      <Tub position={[-0.72, 0.97, 0.05]} rotY={0.1} glow={glow} seed={7} fade={shell} num={20} />
      <Tub position={TRUNK_TUB} open hero glow={glow} seed={3} num={22} />
      <Tub position={[-1.88, 0.48, -0.47]} open glow={glow} seed={11} num={21} />
      <Tub position={[-1.88, 0.48, 0.47]} open glow={glow} seed={17} num={23} />
      {/* the trunk's own small lamp (a warm practical) */}
      <Glow position={[-1.6, 0.95, 0]} size={0.7} color="#FFC97A" opacity={0.6 * xray * shell} />
    </group>
  );
};
export const TRUNK_TUB = [-1.86, 0.48, 0];
