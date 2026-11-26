# rev 4b (Timur: MIT ground "still just plain gray … in the center is just gray"; the Globe "is floating over the ground … make a table
#   so it lands on there"): the centre band gets dark polished granite slabs with light kerbs; a folding table stands in front of the
#   stack and the paper lands on its top
import os
os.chdir(os.path.join(os.path.dirname(__file__), "..", "src", "w3d"))
p = "st_globe.tsx"; s = open(p).read()
def rep(a, b):
    global s
    assert s.count(a) == 1, (a[:80], s.count(a))
    s = s.replace(a, b)
rep("const PAPER_AT = [-1.15, 0, -0.2];",
    "const PAPER_AT = [-1.3, 0, -0.2];   // rev 4b: 15 cm further from the pallet, so the table under the paper clears it\n"
    "const TABLE_H = 0.74, TABLE_TOP = [1.5, 1.0];   // a folding table in front of the stack: the paper lands on its top")
rep("""  return { y: (1 - k) * (1 - k) * 3.2, yaw: (1 - k) * 1.4, tilt: (1 - k) * 0.5 * Math.sin((f - a) / 4),""",
    """  const tilt = (1 - k) * 0.5 * Math.sin((f - a) / 4);
  return { y: TABLE_H + 0.003 + (1 - k) * (1 - k) * 3.2 + (PAPER_H / 2) * Math.abs(Math.sin(tilt)), yaw: (1 - k) * 1.4, tilt,""")
rep("const P_ = (dx, dy, dz) => [PAPER_AT[0] + dx, dy, PAPER_AT[2] + dz];",
    "const P_ = (dx, dy, dz) => [PAPER_AT[0] + dx, dy + TABLE_H, PAPER_AT[2] + dz];   // rev 4b: the paper is on the table")
# the table
rep("""      {/* the newspaper */}""",
    """      {/* rev 4b: the folding table the paper lands on — a walnut top with an edge band and an apron, folding steel legs with braces */}
      <FoldingTable p={[PAPER_AT[0], 0, PAPER_AT[2]]} />
      {/* the newspaper */}""")
# the centre band: textured dark granite + kerbs
rep("""      <mesh rotation-x={-Math.PI / 2} position={[14, 0.004, 0]} receiveShadow><planeGeometry args={[30, 7]} /><meshStandardMaterial color="#1D2A3E" roughness={0.3} metalness={0.2} /></mesh>""",
    """      {/* rev 4b: the band to the steps is polished DARK granite in the same slabs (it was a flat grey plane), between light kerbs */}
      <mesh rotation-x={-Math.PI / 2} position={[14, 0.004, 0]} receiveShadow><planeGeometry args={[30, 7]} /><meshStandardMaterial map={band} bumpMap={band} bumpScale={0.5} color="#7D8CA6" roughness={0.3} metalness={0.15} envMapIntensity={0.5} /></mesh>
      {[-3.65, 3.65].map((z) => <mesh key={"kb" + z} position={[14, 0.02, z]} receiveShadow castShadow><boxGeometry args={[30, 0.04, 0.3]} /><meshStandardMaterial map={kerb} color="#D6DEEA" roughness={0.55} /></mesh>)}""")
rep("""  paving.wrapS = paving.wrapT = THREE.RepeatWrapping; paving.repeat.set(50, 50); paving.anisotropy = 8;""",
    """  paving.wrapS = paving.wrapT = THREE.RepeatWrapping; paving.repeat.set(50, 50); paving.anisotropy = 8;
  const band = useMemo(() => { const b = paving.clone(); b.needsUpdate = true; b.wrapS = b.wrapT = THREE.RepeatWrapping; b.repeat.set(30 / 4, 7 / 4); b.anisotropy = 8; return b; }, [paving]);
  const kerb = useMemo(() => { const b = paving.clone(); b.needsUpdate = true; b.wrapS = b.wrapT = THREE.RepeatWrapping; b.repeat.set(30 / 4, 0.3 / 4); return b; }, [paving]);""")
rep("""const WOOD = [""",
    """const FoldingTable = ({ p }) => {
  const [W, D] = TABLE_TOP, H = TABLE_H, T = 0.035;
  const steel = <meshStandardMaterial color="#2A3446" metalness={0.75} roughness={0.35} />;
  return (
    <group position={p}>
      <mesh position={[0, H - T / 2, 0]} castShadow receiveShadow><boxGeometry args={[W, T, D]} /><meshStandardMaterial color="#6E5038" roughness={0.45} envMapIntensity={0.6} /></mesh>
      <mesh position={[0, H - T - 0.002, 0]}><boxGeometry args={[W + 0.012, 0.006, D + 0.012]} /><meshStandardMaterial color="#3A2A1E" roughness={0.6} /></mesh>
      {[-1, 1].map((s) => <mesh key={"ax" + s} position={[0, H - T - 0.05, s * (D / 2 - 0.05)]} castShadow><boxGeometry args={[W - 0.12, 0.08, 0.02]} /><meshStandardMaterial color="#5A3F2C" roughness={0.6} /></mesh>)}
      {[-1, 1].map((s) => <mesh key={"az" + s} position={[s * (W / 2 - 0.06), H - T - 0.05, 0]} castShadow><boxGeometry args={[0.02, 0.08, D - 0.12]} /><meshStandardMaterial color="#5A3F2C" roughness={0.6} /></mesh>)}
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([a, b], i) => (
        <mesh key={"lg" + i} position={[a * (W / 2 - 0.12), (H - T) / 2, b * (D / 2 - 0.1)]} rotation-x={b * 0.05} castShadow><cylinderGeometry args={[0.016, 0.016, H - T, 10]} />{steel}</mesh>
      ))}
      {[-1, 1].map((a) => <mesh key={"br" + a} position={[a * (W / 2 - 0.12), 0.22, 0]} rotation-x={Math.PI / 2}><cylinderGeometry args={[0.01, 0.01, D - 0.2, 8]} />{steel}</mesh>)}
      {[-1, 1].map((a) => <mesh key={"hg" + a} position={[a * (W / 2 - 0.12), H - T - 0.1, 0]} rotation-x={Math.PI / 2}><cylinderGeometry args={[0.012, 0.012, D - 0.22, 8]} />{steel}</mesh>)}
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([a, b], i) => <mesh key={"ft" + i} position={[a * (W / 2 - 0.12), 0.012, b * (D / 2 - 0.1)]}><cylinderGeometry args={[0.024, 0.024, 0.024, 10]} /><meshStandardMaterial color="#111821" roughness={0.8} /></mesh>)}
    </group>
  );
};
const WOOD = [""")
open(p, "w").write(s)
print("patched")
