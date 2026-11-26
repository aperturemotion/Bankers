// @ts-nocheck
// ★ V38 station STATE (builder D): "The state investigated. The betting was legal, and no one's odds were hurt.
//   The state itself made $120 million from it."
//   Night on the plaza below a domed capitol in the Massachusetts State House family (pale-gold ribbed dome, loggia of paired
//   columns, lit windows), lamp posts and an iron fence, the city's towers in the haze behind.
//   · arrival: a high flight out of the previous station's haze, craning down the plaza toward the dome (tag MASSACHUSETTS STATE HOUSE)
//   · "investigated": the Inspector General's report (a giant bound report, cover print OFFICE OF THE INSPECTOR GENERAL · JULY 2012)
//     drops onto the plaza, the camera tilting down with it, landing with a thud
//   · "The betting was legal": the cover swings open on its spine; the FINDINGS page; a light-blue check draws in → tag LEGAL
//   · "no one's odds were hurt": the second check → tag NO ONE'S ODDS HURT
//   · "The state itself made $120 million": the camera pulls back and rises; the centre door's hall lights up and a stream of
//     strapped $100 bundles arcs over the report into the State House; the dome brightens; counter $120 MILLION / TO THE STATE
//   · leaves by a flight (the next station's arrival shot) toward the total station.
import React, { useMemo } from "react";
import * as THREE from "three";
import { canvasTex, std, ease, easeOut, rnd, clamp01, lerp, Sky, Glow } from "./kit";
import { Tag, Counter } from "./overlays";
import { WORDS } from "./take";
import { cueAt } from "../bnx/SfxLayer";
import { BODY, FIGURE } from "./fonts3d";
import { StateHouse } from "./st_state_house";
import { Cash } from "./st_total_cash";
import { LightPool, LightWash } from "./st_state_fx";

export const O_STATE = [1800, 0, 0];
const nrm = (s) => s.toLowerCase().replace(/[^a-z0-9$']/g, "");
// the first word starting with `t` at or after frame `after` (so repeated words resolve to THIS station's line)
export const wAt = (t, after = 0) => { const q = nrm(t); const w = WORDS.find((w) => w.at >= after && nrm(w.t).startsWith(q)); if (!w) throw new Error("st_state: no word " + t); return w.at; };
export const wEndAt = (t, after = 0) => { const q = nrm(t); const w = WORDS.find((w) => w.at >= after && nrm(w.t).startsWith(q)); if (!w) throw new Error("st_state: no word " + t); return w.end; };
const T = () => {
  const s0 = wAt("the", 1612);
  return {
    s0, state: wAt("state", s0), inv: wAt("investigated", s0), betting: wAt("betting", s0), legal: wAt("legal", s0), no: wAt("no", wAt("legal", s0)),
    odds: wAt("odds", s0), hurt: wAt("hurt", s0), itself: wAt("itself", s0), made: wAt("made", s0), m120: wAt("$120", s0), m120e: wEndAt("$120", s0),
    it: wEndAt("it", wAt("from", wAt("$120", s0))), next: wAt("in", wAt("$120", s0))
  };
};
// ── where things stand (station-local) ─────────────────────────────────────────────────────────────────────────────────────
const HOUSE_Z = -22, HS = 0.55;                                    // the capitol's design-units group: front of the main block at z −22
const DOOR = [0, 1.75, HOUSE_Z + 4 * HS];                          // the open centre door's threshold
const DOME = [0, 0.55 * 21.5, HOUSE_Z - 5 * HS];                    // the dome's middle
const BIND = [0, 0, -9.2];                                         // the report lies on the plaza in front of the steps
const BW = 3.2, BD = 4.2;                                          // report: width (x) and depth (z)

// ── print ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const pavingTex = () => canvasTex("st_paving", 1024, 1024, (c, w, h) => {
  c.fillStyle = "#3A475A"; c.fillRect(0, 0, w, h);
  const n = 8, sw = w / n;
  for (let r = 0; r < n * 2; r++) for (let k = 0; k < n; k++) {
    const v = rnd(r * 17 + k * 3) * 0.12 - 0.06;
    c.fillStyle = v > 0 ? `rgba(220,232,250,${v})` : `rgba(0,0,0,${-v})`; c.fillRect(k * sw + (r % 2) * sw / 2, r * sw / 2, sw, sw / 2);
  }
  for (let i = 0; i < 16000; i++) { const g = 60 + rnd(i) * 70; c.fillStyle = `rgba(${g},${g + 8},${g + 22},${0.18 + rnd(i + 5) * 0.2})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); }
  c.fillStyle = "rgba(8,16,30,0.75)";
  for (let r = 0; r <= n * 2; r++) c.fillRect(0, r * sw / 2 - 1.5, w, 3);
  for (let r = 0; r < n * 2; r++) for (let k = 0; k <= n; k++) c.fillRect(k * sw + (r % 2) * sw / 2 - 1.5, r * sw / 2, 3, sw / 2);
});
const lawnTex = () => canvasTex("st_lawn", 512, 512, (c, w, h) => {
  c.fillStyle = "#142638"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 26000; i++) { const g = rnd(i) * 40; c.fillStyle = `rgba(${30 + g},${50 + g},${70 + g},${0.25})`; c.fillRect(rnd(i + 3) * w, rnd(i + 4) * h, 1.5, 3); }
});
const coverTex = () => canvasTex("st_cover", 640, 840, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, "#123A6E"); g.addColorStop(1, "#0A2448");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 9000; i++) { c.fillStyle = `rgba(255,255,255,${rnd(i) * 0.05})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); }   // the leatherette grain
  c.strokeStyle = "rgba(214,228,248,0.75)"; c.lineWidth = 3; c.strokeRect(34, 34, w - 68, h - 68);
  c.lineWidth = 1.2; c.strokeRect(46, 46, w - 92, h - 92);
  c.fillStyle = "#E8F0FB"; c.textAlign = "center";
  c.font = `600 26px ${BODY}`; c.fillText("COMMONWEALTH OF MASSACHUSETTS", w / 2, 150);
  c.fillStyle = "rgba(214,228,248,0.8)"; c.fillRect(w / 2 - 120, 180, 240, 2);
  c.fillStyle = "#FFFFFF"; c.font = `700 44px ${BODY}`; c.fillText("OFFICE OF THE", w / 2, 300);
  c.font = `800 66px ${BODY}`; c.fillText("INSPECTOR", w / 2, 384); c.fillText("GENERAL", w / 2, 458);
  c.fillStyle = "#7FB4F2"; c.fillRect(w / 2 - 160, 510, 320, 5);
  c.fillStyle = "#E8F0FB"; c.font = `700 38px ${BODY}`; c.fillText("CASH WINFALL REVIEW", w / 2, 590);
  c.font = `600 34px ${BODY}`; c.fillStyle = "rgba(214,228,248,0.9)"; c.fillText("JULY 2012", w / 2, 650);
});
const pageTex = () => canvasTex("st_page", 640, 840, (c, w, h) => {
  c.fillStyle = "#F4F7FB"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 4000; i++) { c.fillStyle = `rgba(30,50,80,${rnd(i) * 0.03})`; c.fillRect(rnd(i + 1) * w, rnd(i + 2) * h, 2, 2); }
  c.fillStyle = "#0B2547"; c.textAlign = "left"; c.font = `800 46px ${BODY}`; c.fillText("FINDINGS", 70, 110);
  c.fillStyle = "#4D8ED9"; c.fillRect(70, 128, 140, 5);
  // illegible body text (grey bars of varied length): never an invented readable claim
  const bars = (y0, n, x0 = 70, wmax = 500) => { for (let i = 0; i < n; i++) { const ww = wmax * (0.55 + rnd(y0 + i * 7) * 0.45); c.fillStyle = "rgba(40,60,90,0.32)"; c.fillRect(x0, y0 + i * 26, i === n - 1 ? ww * 0.5 : ww, 9); } };
  bars(170, 4);
  // two findings with their check boxes (the ticks are 3-D, drawn in by the station)
  [300, 470].forEach((y) => {
    c.strokeStyle = "#0B2547"; c.lineWidth = 5; c.strokeRect(70, y, 64, 64);
    c.fillStyle = "rgba(77,142,217,0.10)"; c.fillRect(160, y - 10, 420, 112);
    bars(y + 4, 3, 176, 380);
  });
  bars(640, 5);
  c.fillStyle = "rgba(40,60,90,0.5)"; c.font = `600 18px ${BODY}`; c.textAlign = "center"; c.fillText("— 1 —", w / 2, 800);
});
const pageEdgeTex = () => canvasTex("st_pedge", 256, 64, (c, w, h) => {
  c.fillStyle = "#E6ECF4"; c.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 2) { c.fillStyle = `rgba(60,80,110,${0.10 + rnd(y) * 0.18})`; c.fillRect(0, y, w, 1); }
});

// ── pieces ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const LampPost = ({ x, z }) => (
  <group position={[x, 0, z]}>
    <mesh position={[0, 0.25, 0]} castShadow><cylinderGeometry args={[0.22, 0.3, 0.5, 12]} /><meshStandardMaterial color="#141C28" metalness={0.7} roughness={0.35} /></mesh>
    <mesh position={[0, 2.0, 0]} castShadow><cylinderGeometry args={[0.07, 0.11, 3.2, 10]} /><meshStandardMaterial color="#141C28" metalness={0.7} roughness={0.35} /></mesh>
    <mesh position={[0, 3.62, 0]}><cylinderGeometry args={[0.18, 0.12, 0.12, 8]} /><meshStandardMaterial color="#141C28" metalness={0.7} roughness={0.35} /></mesh>
    <mesh position={[0, 3.95, 0]}><cylinderGeometry args={[0.2, 0.14, 0.55, 6]} /><meshStandardMaterial color="#FFE6BE" emissive="#FFC27A" emissiveIntensity={2.6} transparent opacity={0.95} /></mesh>
    <mesh position={[0, 4.3, 0]}><coneGeometry args={[0.3, 0.22, 6]} /><meshStandardMaterial color="#141C28" metalness={0.7} roughness={0.35} /></mesh>
    <Glow position={[0, 3.95, 0]} size={2.4} color="#FFC27A" opacity={0.75} />
    <Glow position={[0, 3.95, 0]} size={0.7} color="#FFE8C4" opacity={0.9} />
  </group>
);
const Tree = ({ x, z, s = 1, i }) => (
  <group position={[x, 0, z]} scale={s} rotation-y={rnd(i) * 6}>
    <mesh position={[0, 1.4, 0]} castShadow><cylinderGeometry args={[0.16, 0.26, 2.8, 8]} /><meshStandardMaterial color="#1B2533" roughness={0.9} /></mesh>
    {[[0, 3.4, 0, 1.6], [0.9, 2.9, 0.3, 1.1], [-0.8, 3.0, -0.4, 1.2], [0.2, 4.2, -0.3, 1.0]].map(([a, b, c2, r], k) => (
      <mesh key={k} position={[a, b, c2]} castShadow><icosahedronGeometry args={[r, 1]} /><meshStandardMaterial color={k % 2 ? "#1E3A52" : "#24425C"} roughness={0.95} flatShading /></mesh>
    ))}
  </group>
);
// the iron fence: granite posts and a run of pickets (instanced)
const Fence = ({ x0, x1, z }) => {
  const n = Math.floor((x1 - x0) / 0.22);
  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.025, 0.025, 1.25, 5), std("#0E1520", 0.4, 0.7), n); m.castShadow = true;
    const M = new THREE.Matrix4();
    for (let i = 0; i < n; i++) { M.makeTranslation(x0 + (i + 0.5) * (x1 - x0) / n, 0.72, z); m.setMatrixAt(i, M); }
    return m;
  }, [x0, x1, z, n]);
  const posts = Math.floor((x1 - x0) / 3.2) + 1;
  return (
    <group>
      <primitive object={mesh} />
      {[0.3, 1.22].map((y) => <mesh key={y} position={[(x0 + x1) / 2, y, z]}><boxGeometry args={[x1 - x0, 0.05, 0.05]} /><meshStandardMaterial color="#0E1520" metalness={0.7} roughness={0.4} /></mesh>)}
      {Array.from({ length: posts }, (_, k) => <mesh key={k} position={[x0 + k * (x1 - x0) / (posts - 1), 0.75, z]} castShadow><boxGeometry args={[0.36, 1.5, 0.36]} /><meshStandardMaterial color="#7E8CA2" roughness={0.75} /></mesh>)}
      <mesh position={[(x0 + x1) / 2, 0.08, z]} receiveShadow><boxGeometry args={[x1 - x0, 0.16, 0.5]} /><meshStandardMaterial color="#6C7A90" roughness={0.8} /></mesh>
    </group>
  );
};
// a 3-D tick drawn in like a pen stroke: down to the heel, then the long stroke up to the right (k 0..1); lies on the page
const Stroke = ({ a, b, k, mat }) => {
  if (k <= 0.001) return null;
  const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) * k;
  const ux = dx / Math.hypot(dx, dz), uz = dz / Math.hypot(dx, dz);
  return <mesh position={[a[0] + ux * L / 2, 0.025, a[1] + uz * L / 2]} rotation-y={-Math.atan2(dz, dx)} scale={[L + 0.08, 1, 1]} castShadow><boxGeometry args={[1, 0.03, 0.075]} />{mat}</mesh>;
};
const Tick = ({ pos, k }) => {
  if (k <= 0.001) return null;
  const mat = <meshStandardMaterial color="#2F7BD6" emissive="#4D8ED9" emissiveIntensity={0.7} roughness={0.35} />;
  const P0 = [-0.15, -0.02], P1 = [-0.04, 0.1], P2 = [0.24, -0.24];
  return (
    <group position={pos} scale={1.5}>
      <Stroke a={P0} b={P1} k={clamp01(k / 0.3)} mat={mat} />
      <Stroke a={P1} b={P2} k={clamp01((k - 0.3) / 0.7)} mat={mat} />
      <Glow position={[0.02, 0.12, -0.04]} size={0.7 * k} color="#7FB4F2" opacity={0.3} />
    </group>
  );
};
// page coordinates (on the report's first page, x across, z down the page) → station-local
const PAGE_Y = 0.345;
const pagePt = (u, v) => [BIND[0] + 0.06 - (BW - 0.16) / 2 + u * (BW - 0.16), PAGE_Y + 0.01, BIND[2] - (BD - 0.14) / 2 + v * (BD - 0.14)];
const CHECK1 = pagePt(0.159, 0.395), CHECK2 = pagePt(0.159, 0.598);

// the report's fall and opening
const reportPose = (t, f) => {
  const k = ease(f, t.inv - 6, t.inv + 20);
  const y = 22 * (1 - k) * (1 - k);
  const settle = Math.max(0, 1 - Math.abs(f - (t.inv + 21)) / 6) * 0.04;
  return { y: y + settle, ry: 0.35 * (1 - k) - 0.06, rz: 0.25 * (1 - k), rx: -0.2 * (1 - k), vis: f > t.inv - 8 };
};
const Report = ({ t, f }) => {
  const cover = useMemo(coverTex, []), page = useMemo(pageTex, []), edge = useMemo(pageEdgeTex, []);
  const pose = reportPose(t, f);
  if (!pose.vis) return null;
  const open = ease(f, t.betting - 6, t.legal - 2);             // the cover swings over on its spine
  const th = Math.PI * 0.985 * open;
  const lift = Math.sin(Math.PI * open) * 0.05;
  return (
    <group position={[BIND[0], pose.y, BIND[2]]} rotation={[pose.rx, pose.ry, pose.rz]}>
      {/* back board, the page block with its paper edges, the first page */}
      <mesh position={[0, 0.03, 0]} castShadow receiveShadow><boxGeometry args={[BW, 0.06, BD]} /><meshStandardMaterial color="#0C2A52" roughness={0.55} /></mesh>
      <mesh position={[0.06, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[BW - 0.16, 0.28, BD - 0.14]} />
        {[0, 1, 2, 3, 4, 5].map((i) => <meshStandardMaterial key={i} attach={`material-${i}`} color={i === 2 ? "#DCE5F0" : "#CAD4E2"} map={i === 2 ? page : edge} roughness={0.75} />)}
      </mesh>
      {/* the spine: a rounded binding along the left edge */}
      <mesh position={[-BW / 2 + 0.02, 0.2, 0]} rotation-x={Math.PI / 2}><cylinderGeometry args={[0.2, 0.2, BD, 16, 1, false, Math.PI, Math.PI]} /><meshStandardMaterial color="#0C2A52" roughness={0.5} side={THREE.DoubleSide} /></mesh>
      {/* the front cover, hinged at the spine */}
      <group position={[-BW / 2 + 0.02, 0.38 + lift, 0]} rotation-z={th}>
        <mesh position={[BW / 2, 0.03, 0]} castShadow receiveShadow>
          <boxGeometry args={[BW, 0.06, BD]} />
          {[0, 1, 2, 3, 4, 5].map((i) => <meshStandardMaterial key={i} attach={`material-${i}`} color={i === 2 ? "#FFFFFF" : i === 3 ? "#1A3E70" : "#0C2A52"} map={i === 2 ? cover : null} roughness={i === 2 ? 0.45 : 0.6} metalness={0.05} />)}
        </mesh>
      </group>
      {/* the checks */}
      <Tick pos={[CHECK1[0] - BIND[0], PAGE_Y, CHECK1[2] - BIND[2]]} k={ease(f, t.legal - 2, t.legal + 12)} />
      <Tick pos={[CHECK2[0] - BIND[0], PAGE_Y, CHECK2[2] - BIND[2]]} k={ease(f, t.no + 2, t.no + 16)} />
    </group>
  );
};
// the money stream: N strapped bundles launched from behind the camera, arcing over the report into the lit door
const N_CASH = 56;
const cashItems = (t, f) => {
  const t0 = t.made - 4;
  return Array.from({ length: N_CASH }, (_, i) => {
    const a = t0 + i * 1.25 + rnd(i * 5) * 1.0, dur = 34;
    const u = (f - a) / dur;
    if (u <= 0 || u >= 1) return { p: [0, -50, 0], s: 0 };
    const e = u * u * (3 - 2 * u);
    const side = i % 2 ? 1 : -1, sx = side * (2.2 + rnd(i + 11) * 4.5), sy = 2.5 + rnd(i + 12) * 5, sz = 3 + rnd(i + 13) * 5;
    const ex = DOOR[0] + (rnd(i + 14) - 0.5) * 0.5, ey = DOOR[1] + (rnd(i + 15) - 0.5) * 0.4, ez = DOOR[2] - 1.4;
    const x = lerp(sx, ex, e), z = lerp(sz, ez, e);
    const y = lerp(sy, ey, e) + Math.sin(Math.PI * e) * (3.2 + rnd(i + 16) * 1.6);
    const spin = (1 - e) * (2.5 + rnd(i + 17) * 3);
    const s = 0.62 * (1 - ease(u, 0.88, 1.0) * 0.95) * clamp01(u / 0.16);
    return { p: [x, y, z], r: [spin * 0.6 * (rnd(i + 18) - 0.5), spin + Math.PI / 2, spin * 0.4 * (rnd(i + 19) - 0.5)], s };
  });
};

const Scene = ({ f }) => {
  const t = useMemo(T, []);
  const paving = useMemo(() => { const p = pavingTex(); p.wrapS = p.wrapT = THREE.RepeatWrapping; p.repeat.set(1.2, 6); return p; }, []);
  const lawn = useMemo(() => { const p = lawnTex(); p.wrapS = p.wrapT = THREE.RepeatWrapping; p.repeat.set(4, 8); return p; }, []);
  const domeK = ease(f, t.m120 - 6, t.it);
  const doorK = ease(f, t.made - 18, t.made + 4);
  const moonK = ease(f, t.s0 - 12, t.s0 + 2) * (1 - ease(f, t.it - 18, t.it - 4));
  return (
    <group>
      <Sky />
      {/* a pale moon high left, its halo */}
      {/* a pale moon high left (it fades as the camera leaves, so the next station's moon never doubles it) */}
      {moonK > 0.002 && <Glow position={[-60, 70, -150]} size={16} color="#CFE0FA" opacity={0.35 * moonK} />}
      {moonK > 0.002 && <mesh position={[-60, 70, -150]}><sphereGeometry args={[2.2, 24, 16]} /><meshBasicMaterial color="#E8F0FB" fog={false} transparent opacity={moonK} /></mesh>}
      {/* ground: the far ground, the lawns, the paved path and plaza */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.03, -40]} receiveShadow><planeGeometry args={[400, 400]} /><meshStandardMaterial color="#0C1F33" roughness={0.95} /></mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.015, 4]} receiveShadow><planeGeometry args={[46, 44]} /><meshStandardMaterial map={lawn} color="#8FA2BC" roughness={0.95} /></mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.0, 4]} receiveShadow><planeGeometry args={[9.6, 44]} /><meshStandardMaterial map={paving} color="#9DAAC0" roughness={0.38} metalness={0.15} /></mesh>
      {[-1, 1].map((s) => <mesh key={s} position={[s * 4.9, 0.06, 4]} receiveShadow><boxGeometry args={[0.3, 0.12, 44]} /><meshStandardMaterial color="#8090A6" roughness={0.7} /></mesh>)}
      {/* the capitol */}
      <group position={[0, 0, HOUSE_Z]} scale={HS}><StateHouse dome={domeK} door={doorK} /></group>
      {/* uplights at the steps (cool), the dome's halo (warms a little as the money arrives) */}
      <pointLight position={[0, 1.2, -12.5]} intensity={16} distance={16} decay={1.4} color="#BFD6FF" />
      <pointLight position={[0, 15, -12]} intensity={10 + 40 * domeK} distance={16} decay={1.4} color="#FFE0A8" />
      <Glow position={[DOME[0], DOME[1] + 0.3, DOME[2]]} size={9 + 7 * domeK} color="#FFD796" opacity={0.14 + 0.45 * domeK} />
      <Glow position={[DOME[0], DOME[1] + 2.9, DOME[2]]} size={2.6 + 2 * domeK} color="#FFE2B0" opacity={0.6 + 0.3 * domeK} />
      <Glow position={[DOOR[0], DOOR[1], DOOR[2] + 0.2]} size={3 + 4 * doorK} color="#FFC27A" opacity={0.25 + 0.5 * doorK} />
      {/* the fence, lamps and trees */}
      <Fence x0={-22} x1={-5.6} z={-15.2} />
      <Fence x0={5.6} x1={22} z={-15.2} />
      {[-12.5, -3.5, 5.5, 14.5].map((z) => [-5.6, 5.6].map((x) => <LampPost key={x + "_" + z} x={x} z={z} />))}
      {[[-10, -10, 1.1], [-15, -3, 1.3], [-11, 6, 1.2], [-17, 13, 1.4], [10.5, -9, 1.2], [15, -1, 1.35], [11, 8, 1.15], [17, 15, 1.3]].map(([x, z, s], i) => <Tree key={i} x={x} z={z} s={s} i={i} />)}
      {[-12.5, -3.5, 5.5, 14.5].map((z) => [-5.6, 5.6].map((x) => <LightPool key={x + "p" + z} position={[x, 0.02, z]} r={3.2} color="#FFB867" opacity={0.32} />))}
      <LightPool position={[DOOR[0], 0.72, DOOR[2] + 2.6]} r={2.6} sz={1.4} color="#FFB867" opacity={0.15 + 0.35 * doorK} />
      <LightWash position={[0, 4.2, HOUSE_Z + 4.4 * HS]} w={12} h={7} color="#BFD6FF" opacity={0.14} />
      {[-1, 1].map((sd) => <LightWash key={sd} position={[sd * 10, 3.2, HOUSE_Z + 0.06]} w={9} h={7} color="#BFD6FF" opacity={0.16} />)}
      <LightWash position={[0, 9.6, HOUSE_Z - 5 * HS + 3.05]} w={7} h={4} color="#FFE2B0" opacity={0.08 + 0.2 * domeK} />
      {/* the report, then the money */}
      <Report t={t} f={f} />
      {f > t.made - 6 && f < t.next + 40 && <Cash items={cashItems(t, f)} shadows={false} self={0.45} />}
    </group>
  );
};

// ── the camera (WORLD coordinates) ─────────────────────────────────────────────────────────────────────────────────────────
const W = (p) => [p[0] + O_STATE[0], p[1] + O_STATE[1], p[2] + O_STATE[2]];
const shots = () => {
  const t = T();
  return [
    // arrival (held 10 f so RIGGED? reads to the end of "game."): a flight out of the haze, high and craning down the plaza toward the dome
    { a: t.s0 - 12, b: t.s0 + 12, pos: W([5, 17, 75]), target: W([0, 9, -22]), fov: 36, arc: 12 },
    { a: t.s0, b: t.state + 18, pos: W([1.5, 9.5, 24]), target: W([0, 8.5, -22]), fov: 36 },
    // the report drops: the camera eases down and in, tilting with it
    { a: t.state + 14, b: t.inv + 30, pos: W([1.2, 6.2, 6.5]), target: W([0, 2.2, -14]), fov: 36 },
    // the findings: above the open report, the lit arcade and door at the top of frame; a slow orbit while the checks land
    { a: t.inv + 26, b: t.legal + 2, pos: W([2.4, 6.8, 3.2]), target: W([-0.2, -0.4, -9.2]), fov: 34 },
    { a: t.legal + 2, b: t.hurt + 4, pos: W([-0.7, 6.3, 2.0]), target: W([-0.3, -0.5, -9.0]), fov: 34 },
    // the money: pull back and rise; the stream, the door, the dome (slow push while it fills)
    { a: t.hurt + 2, b: t.m120 + 12, pos: W([-3.2, 4.0, 11.5]), target: W([0, 8.6, -18]), fov: 40 },
    { a: t.m120 + 12, b: t.it + 8, pos: W([-1.6, 3.7, 8.6]), target: W([0, 9.4, -18]), fov: 40 }
  ];
};
const Overlay = ({ f, P }) => {
  const t = T();
  const dome = P([DOME[0] + 1.2, DOME[1] + 1.0, DOME[2] + 2.5]);
  const c1 = P(CHECK1), c2 = P(CHECK2);
  return (
    <>
      <Tag text="Massachusetts State House" at={t.state} out={t.inv + 24} x={70} y={330} to={dome.behind ? null : dome} size={28} />
      <Tag text="Legal" at={t.legal + 2} out={t.hurt + 10} x={620} y={300} to={c1.behind ? null : c1} size={34} />
      <Tag text="No one's odds hurt" at={t.no + 4} out={t.hurt + 12} x={470} y={400} to={c2.behind ? null : c2} size={34} />
      <Counter at={t.m120 - 2} out={t.next - 4} x={540} y={330} value={120} prefix="$" unit="MILLION" label="To the state" size={112} countDur={28} />
    </>
  );
};
const sfx = () => {
  const t = T();
  return [
    cueAt("whooshlong", t.s0 + 2, 30, 0.55),                      // the arrival flight (fastest ≈ its middle)
    cueAt("ee_whoosh_fast_small_whoosh_01", t.inv + 10, 14, 0.35), // the report falling
    cueAt("thud", t.inv + 20, 14, 0.55),                          // …and landing
    cueAt("ee_paper_paper_tear_01", t.betting + 2, 12, 0.18),     // the cover swinging open (a soft paper sound)
    cueAt("ee_click_click_01", t.legal + 4, 6, 0.4),              // check 1
    cueAt("ee_click_click_01", t.no + 6, 6, 0.4),                 // check 2
    cueAt("whooshsoft", t.hurt + 14, 24, 0.45),                   // the pull-back
    cueAt("coin", t.made + 6, 16, 0.35), cueAt("coin", t.m120 + 6, 16, 0.35), cueAt("coin", t.m120 + 20, 16, 0.3),
    cueAt("pingshort", t.m120 + 28, 12, 0.4)                       // the counter lands
  ];
};
export const ST = { id: "state", origin: O_STATE, from: wAt("the", 1612) - 24, to: wAt("in", wAt("$120", 1700)) + 14, light: { target: [0, 0, -12], shadowBox: 24, keyI: 1.6, fillI: 0.32, rimI: 1.9 }, shots, Scene, Overlay, sfx };
