// @ts-nocheck
// ★ V38 ROAD — the Selbees' sedan (builder C). Built, not drawn: an extruded, bevelled body shell from a real sedan side profile,
//   a glass greenhouse with body-colour roof and pillars, four wheels (tyre, five-spoke rim, brake disc), headlight units with
//   their light (two spot lights) and a visible beam in the haze, tail-light bars, plate, mirrors, door seams and handles.
//   X-RAY: on "betting" the shell turns to clear blue glass with a white rim (EdgesGeometry) and the cabin shows what it carries:
//   tubs of tickets in the trunk and on the back seat. Front of the car = +x, right side = +z; it sits on y = 0.
import React, { useMemo } from "react";
import * as THREE from "three";
import { canvasTex, Glow, clamp01 } from "./kit";
import { Tub } from "./st_road_parts";

const bodyShape = () => {
  const s = new THREE.Shape();
  s.moveTo(-2.45, 0.42);
  s.lineTo(-2.43, 0.74);
  s.quadraticCurveTo(-2.41, 0.96, -2.2, 0.99);
  s.lineTo(-1.36, 1.02);
  s.lineTo(1.0, 1.0);
  s.quadraticCurveTo(1.85, 0.96, 2.3, 0.8);
  s.quadraticCurveTo(2.47, 0.74, 2.47, 0.6);
  s.lineTo(2.45, 0.36);
  s.lineTo(1.88, 0.32);
  s.absarc(1.45, 0.34, 0.43, 0, Math.PI, false);
  s.lineTo(-1.02, 0.32);
  s.absarc(-1.45, 0.34, 0.43, 0, Math.PI, false);
  s.lineTo(-2.45, 0.42);
  return s;
};
const cabinShape = () => {
  const s = new THREE.Shape();
  s.moveTo(-1.42, 0.98);
  s.quadraticCurveTo(-1.0, 1.3, -0.72, 1.4);
  s.quadraticCurveTo(-0.2, 1.47, 0.32, 1.43);
  s.quadraticCurveTo(0.62, 1.38, 1.08, 0.98);
  s.lineTo(-1.42, 0.98);
  return s;
};
const BODY_W = 1.7, CAB_W = 1.36;
// the plan view of a real car: narrower at the nose and tail, the sides tucking in above the shoulder (tumblehome) and at the sill
const sculpt = (g, cabin) => {
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i); let z = p.getZ(i);
    const ax = Math.abs(x), te = Math.max(0, Math.min(1, (ax - 1.5) / 1.0));
    z *= 1 - (x > 0 ? 0.2 : 0.14) * te * te;
    if (cabin) z *= 1 - 0.24 * Math.max(0, Math.min(1, (y - 0.98) / 0.47));
    else {
      z *= 1 - 0.1 * Math.max(0, Math.min(1, (y - 0.8) / 0.25));
      z *= 1 - 0.06 * Math.max(0, Math.min(1, (0.5 - y) / 0.2));
    }
    p.setZ(i, z);
  }
  g.computeVertexNormals();
  // the flat side panels (the extrusion's caps, group 0): smooth normals, a touch upward above the shoulder (no facets)
  const n = g.attributes.normal, cap = g.groups[0];
  for (let i = cap.start; i < cap.start + cap.count; i++) {
    const y = p.getY(i), s = Math.sign(p.getZ(i)) || 1;
    const up = cabin ? 0.45 : 0.28 * Math.max(0, Math.min(1, (y - 0.8) / 0.25)) - 0.15 * Math.max(0, Math.min(1, (0.5 - y) / 0.2));
    const l = Math.hypot(up, 1); n.setXYZ(i, 0, up / l, s / l);
  }
  n.needsUpdate = true;
  return g;
};
const plateTex = () => canvasTex("plateMI", 256, 128, (c, w, h) => {
  c.fillStyle = "#EEF3FA"; c.fillRect(0, 0, w, h);
  c.strokeStyle = "#0B2547"; c.lineWidth = 6; c.strokeRect(5, 5, w - 10, h - 10);
  c.fillStyle = "#0B3F7A"; c.fillRect(5, 5, w - 10, 22);
  c.fillStyle = "rgba(11,37,71,0.55)"; for (let i = 0; i < 6; i++) c.fillRect(30 + i * 34, 52, 24, 48);
});
const rimTex = () => canvasTex("rim5", 256, 256, (c, w, h) => {
  // a five-spoke alloy in motion: the spokes softened by speed, the hub crisp
  c.fillStyle = "#1A2433"; c.fillRect(0, 0, w, h);
  const g = c.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2);
  g.addColorStop(0, "#C9D6E6"); g.addColorStop(0.75, "#8EA3BE"); g.addColorStop(0.92, "#5D7290"); g.addColorStop(1, "#1A2433");
  c.fillStyle = g; c.beginPath(); c.arc(w / 2, h / 2, w / 2 - 2, 0, Math.PI * 2); c.fill();
  c.save(); c.translate(w / 2, h / 2);
  for (let k = 0; k < 5; k++) { c.rotate((Math.PI * 2) / 5); c.fillStyle = "rgba(10,20,36,0.55)"; c.beginPath(); c.moveTo(18, -16); c.lineTo(108, -40); c.lineTo(108, 40); c.lineTo(18, 16); c.fill(); }
  c.restore();
  c.fillStyle = "#24364F"; c.beginPath(); c.arc(w / 2, h / 2, 22, 0, Math.PI * 2); c.fill();
  c.fillStyle = "#AFC0D6"; c.beginPath(); c.arc(w / 2, h / 2, 12, 0, Math.PI * 2); c.fill();
});
const beamTex = () => canvasTex("beamCone", 16, 256, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, 0, h);   // top row = the cone's apex (the lamp)
  g.addColorStop(0, "rgba(255,255,255,0.95)"); g.addColorStop(0.25, "rgba(255,255,255,0.35)"); g.addColorStop(0.7, "rgba(255,255,255,0.08)"); g.addColorStop(1, "rgba(255,255,255,0)");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
});

const Wheel = ({ x, z, spin }) => {
  const rim = useMemo(rimTex, []);
  const side = z > 0 ? 1 : -1;
  return (
    <group position={[x, 0.34, z]}>
      <mesh rotation-x={Math.PI / 2} castShadow><cylinderGeometry args={[0.34, 0.34, 0.24, 32]} /><meshStandardMaterial color="#121A26" roughness={0.85} /></mesh>
      {/* the rim face, turning */}
      <mesh position={[0, 0, side * 0.122]} rotation-y={side > 0 ? 0 : Math.PI} rotation-z={spin * side}>
        <circleGeometry args={[0.235, 36]} />
        <meshStandardMaterial map={rim} metalness={0.75} roughness={0.28} />
      </mesh>
    </group>
  );
};

/** the car. f: frame; xray 0–1 (shell → glass); flash 0–1 (the white rim's peak); shell 0–1 (whole car dissolves for the push in);
 *  glow 0–1 (the tubs light in the accent); spin: wheel angle */
export const Car = ({ xray = 0, flash = 0, shell = 1, glow = 0, spin = 0, lit = 1 }) => {
  const geo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(bodyShape(), { depth: BODY_W, bevelEnabled: true, bevelThickness: 0.09, bevelSize: 0.07, bevelSegments: 5, curveSegments: 28 });
    g.translate(0, 0, -BODY_W / 2); return sculpt(g, false);
  }, []);
  const cab = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(cabinShape(), { depth: CAB_W, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.06, bevelSegments: 5, curveSegments: 20 });
    g.translate(0, 0, -CAB_W / 2); return sculpt(g, true);
  }, []);
  const edges = useMemo(() => new THREE.EdgesGeometry(geo, 28), [geo]);
  const cabEdges = useMemo(() => new THREE.EdgesGeometry(cab, 28), [cab]);
  const plate = useMemo(plateTex, []);
  const beam = useMemo(beamTex, []);
  const tgt = useMemo(() => [0].map(() => { const o = new THREE.Object3D(); o.position.set(18, -0.6, 0); return o; }), []);
  const paint = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#A7B9D1", metalness: 0.55, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.07, transparent: true }), []);
  const glass = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#040B16", metalness: 0.1, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.1, envMapIntensity: 0.22, transparent: true, opacity: 0.94 }), []);
  // the x-ray: the paint thins to a pale-blue glass, the shell keeps its form in a white rim
  const op = shell * (1 - 0.86 * xray);
  paint.opacity = op; paint.depthWrite = op > 0.95; paint.visible = op > 0.004;
  paint.color.set("#A7B9D1").lerp(new THREE.Color("#8FC0F5"), xray);
  paint.emissive.set("#3F7CC4"); paint.emissiveIntensity = 0.5 * xray + 1.4 * flash;
  const gop = shell * (0.94 - 0.84 * xray);
  glass.opacity = gop; glass.depthWrite = gop > 0.95; glass.visible = gop > 0.004;
  const rimOp = shell * clamp01(0.7 * xray + 0.6 * flash);
  const trim = (o = 1) => ({ transparent: true, opacity: o * shell * (1 - 0.8 * xray), depthWrite: xray < 0.05 });
  const lampsOn = shell;
  return (
    <group>
      {/* contact shadow under the car (soft, always) */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.012, 0]}>
        <planeGeometry args={[5.6, 2.5]} />
        <meshBasicMaterial color="#000814" transparent opacity={0.55 * shell} depthWrite={false} alphaMap={useMemo(() => canvasTex("carShadow", 128, 64, (c, w, h) => { const g = c.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2); g.addColorStop(0, "#fff"); g.addColorStop(0.6, "#888"); g.addColorStop(1, "#000"); c.fillStyle = g; c.fillRect(0, 0, w, h); }), [])} />
      </mesh>
      <mesh geometry={geo} material={paint} castShadow={xray < 0.3 && shell > 0.5} receiveShadow />
      <mesh geometry={cab} material={glass} castShadow={xray < 0.3 && shell > 0.5} />
      <lineSegments geometry={edges}><lineBasicMaterial color="#E6F1FF" transparent opacity={rimOp} depthWrite={false} /></lineSegments>
      <lineSegments geometry={cabEdges}><lineBasicMaterial color="#E6F1FF" transparent opacity={rimOp * 0.8} depthWrite={false} /></lineSegments>
      {/* the glasshouse is one dark piece (black roof, as many sedans); a chrome strip frames the side glass */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[-0.17, 1.03, s * 0.705]}><boxGeometry args={[2.3, 0.018, 0.012]} /><meshStandardMaterial color="#DDE7F4" metalness={1} roughness={0.15} {...trim()} /></mesh>
          {/* door seams, handles, the shoulder line, mirror */}
          {[0.98, -0.18, -1.22].map((x) => <mesh key={x} position={[x, 0.68, s * (BODY_W / 2 + 0.072)]}><boxGeometry args={[0.012, 0.6, 0.006]} /><meshStandardMaterial color="#1E2C40" {...trim()} /></mesh>)}
          {[0.55, -0.62].map((x) => <mesh key={x} position={[x, 0.86, s * (BODY_W / 2 + 0.078)]}><boxGeometry args={[0.16, 0.03, 0.02]} /><meshStandardMaterial color="#D7E2F0" metalness={0.8} roughness={0.25} {...trim()} /></mesh>)}
          <mesh position={[0, 0.9, s * (BODY_W / 2 + 0.07)]}><boxGeometry args={[4.1, 0.012, 0.006]} /><meshStandardMaterial color="#DDE8F6" emissive="#9CC2EE" emissiveIntensity={0.3} {...trim(0.8)} /></mesh>
          <group position={[0.95, 1.04, s * (BODY_W / 2 + 0.12)]}>
            <mesh material={paint}><boxGeometry args={[0.16, 0.12, 0.16]} /></mesh>
            <mesh position={[-0.081, 0, 0]}><boxGeometry args={[0.005, 0.1, 0.13]} /><meshStandardMaterial color="#C9D8EA" metalness={1} roughness={0.05} {...trim()} /></mesh>
          </group>
          {/* lower sill in a darker trim */}
          <mesh position={[0, 0.36, s * (BODY_W / 2 + 0.04)]}><boxGeometry args={[2.0, 0.08, 0.04]} /><meshStandardMaterial color="#25344A" roughness={0.6} {...trim()} /></mesh>
        </group>
      ))}
      {/* front: grille, headlight units, lamps, beams */}
      <mesh position={[2.5, 0.5, 0]}><boxGeometry args={[0.05, 0.16, 0.9]} /><meshStandardMaterial color="#0C1522" metalness={0.5} roughness={0.4} {...trim()} /></mesh>
      <mesh position={[2.49, 0.68, 0]}><boxGeometry args={[0.04, 0.07, 0.7]} /><meshStandardMaterial color="#C9D8EA" metalness={0.9} roughness={0.2} {...trim()} /></mesh>
      {[-1, 1].map((s) => (
        <group key={"hl" + s} position={[2.38, 0.72, s * 0.62]}>
          <mesh rotation-y={s * 0.35}><boxGeometry args={[0.16, 0.1, 0.4]} /><meshStandardMaterial color="#F2F7FF" emissive="#EAF3FF" emissiveIntensity={3.2 * lampsOn} toneMapped={false} transparent opacity={shell} /></mesh>
          <Glow position={[0.14, 0, 0]} size={1.3} color="#DCEBFF" opacity={0.85 * lampsOn * lit} />
          <Glow position={[0.16, 0, 0]} size={0.45} color="#FFFFFF" opacity={0.95 * lampsOn * lit} />
          {/* the beam in the haze: an open cone, apex at the lamp */}
          {[0.45, 0.75, 1].map((k) => (
            <mesh key={k} position={[7.6, -0.32, s * 0.35]} rotation-z={Math.PI / 2 + 0.045}>
              <coneGeometry args={[2.4 * k, 15, 28, 1, true]} />
              <meshBasicMaterial map={beam} color="#BFD8FF" transparent opacity={0.035 * lampsOn * lit} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      ))}
      {/* both lamps' light as ONE spot between them (render cost: one light, not two) */}
      <primitive object={tgt[0]} />
      <spotLight position={[2.35, 0.72, 0]} target={tgt[0]} angle={0.42} penumbra={0.8} intensity={340 * lampsOn * lit} distance={46} decay={1.6} color="#EAF2FF" />
      {/* rear: tail-light bars, third brake light, plate, bumper */}
      {[-1, 1].map((s) => (
        <group key={"tl" + s} position={[-2.47, 0.82, s * 0.6]}>
          <mesh><boxGeometry args={[0.04, 0.09, 0.42]} /><meshStandardMaterial color="#FF6B6B" emissive="#E02A2A" emissiveIntensity={2.6 * lampsOn * (1 - 0.6 * xray)} toneMapped={false} transparent opacity={shell} /></mesh>
          <Glow position={[-0.06, 0, 0]} size={0.9} color="#FF4A4A" opacity={0.55 * lampsOn * (1 - 0.6 * xray)} />
        </group>
      ))}
      <mesh position={[-2.47, 0.82, 0]}><boxGeometry args={[0.035, 0.05, 0.75]} /><meshStandardMaterial color="#7A1F25" emissive="#B0202A" emissiveIntensity={0.8 * lampsOn} transparent opacity={shell} /></mesh>
      <mesh position={[-1.3, 1.02, 0]}><boxGeometry args={[0.03, 0.03, 0.3]} /><meshStandardMaterial color="#FF6B6B" emissive="#E02A2A" emissiveIntensity={2 * lampsOn} toneMapped={false} transparent opacity={shell} /></mesh>
      <mesh position={[-2.545, 0.6, 0]} rotation-y={-Math.PI / 2}><planeGeometry args={[0.5, 0.25]} /><meshStandardMaterial map={plate} roughness={0.4} transparent opacity={shell * (1 - 0.8 * xray)} /></mesh>
      <mesh position={[-2.5, 0.47, 0]}><boxGeometry args={[0.06, 0.1, 1.6]} /><meshStandardMaterial color="#1B283B" roughness={0.6} {...trim()} /></mesh>
      {/* wheel-arch liners (dark), then the wheels */}
      {[1.45, -1.45].map((x) => <mesh key={"lin" + x} position={[x, 0.34, 0]} rotation-x={Math.PI / 2}><cylinderGeometry args={[0.415, 0.415, 1.58, 20, 1, true, Math.PI / 2, Math.PI]} /><meshStandardMaterial color="#070D17" roughness={0.9} side={THREE.DoubleSide} transparent opacity={shell * (1 - 0.7 * xray)} /></mesh>)}
      {/* wheels */}
      {[[1.45, 1], [1.45, -1], [-1.45, 1], [-1.45, -1]].map(([x, s]) => <Wheel key={x + "_" + s} x={x} z={s * 0.77} spin={spin} />)}
      {/* the cabin: dark seats; what the car carries — tubs of tickets on the back seat and in the trunk */}
      <group visible={xray > 0.02 || shell < 1}>
        {[0.25, -0.75].map((x) => [-0.36, 0.36].map((z) => (
          <group key={x + "_" + z} position={[x, 0, z]}>
            <mesh position={[0, 0.6, 0]}><boxGeometry args={[0.5, 0.14, 0.5]} /><meshStandardMaterial color="#132238" roughness={0.9} /></mesh>
            <mesh position={[-0.27, 0.92, 0]} rotation-z={-0.18}><boxGeometry args={[0.12, 0.6, 0.48]} /><meshStandardMaterial color="#132238" roughness={0.9} /></mesh>
          </group>
        )))}
        <Tub position={[-0.7, 0.67, -0.33]} rotY={0.04} glow={glow} />
        <Tub position={[-0.7, 0.67, 0.33]} rotY={-0.03} glow={glow} />
        <Tub position={[-0.72, 0.97, 0.05]} rotY={0.1} glow={glow} />
      </group>
      <Tub position={TRUNK_TUB} open hero glow={glow} seed={3} />
      <Tub position={[-1.88, 0.48, -0.47]} open glow={glow} seed={11} />
      <Tub position={[-1.88, 0.48, 0.47]} open glow={glow} seed={17} />
      {/* the trunk's own small lamp (a warm practical) */}
      <Glow position={[-1.6, 0.95, 0]} size={0.7} color="#FFC97A" opacity={0.6 * xray * shell} />
    </group>
  );
};
export const TRUNK_TUB = [-1.86, 0.48, 0];
