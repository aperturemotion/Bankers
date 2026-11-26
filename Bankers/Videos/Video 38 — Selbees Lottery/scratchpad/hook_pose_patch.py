# rev 4b: the hook ticket lands STANDING (as in rev 2), then falls over backward onto the road about its own bottom edge
import os
os.chdir(os.path.join(os.path.dirname(__file__), "..", "src", "w3d"))
p = "st_hook.tsx"; s = open(p).read()
a0 = s.index("const ticketPose = (t, f) => {"); a1 = s.index("\n};", a0) + 3
new = '''const ticketPose = (t, f) => {
  // rev 4b (Timur: "first it lands as a stand, as it was, and then it falls … when it fell, it started to go in the ground"):
  //   1. the fall from above with a leaf-like sway, LANDING UPRIGHT on its bottom edge on "lottery" + 6 (as in rev 2);
  //   2. as the camera starts its vault toward the store it tips over BACKWARD and lies flat, face up, on the road — and stays.
  //   The tip turns about the ticket's OWN bottom edge: the pose is nested (pivot + yaw → tilt about the local width axis → the
  //   ticket raised half its height → the rock), so the bottom edge stays on the asphalt. (rev 3 tilted it about the WORLD x axis
  //   after the yaw, which swung one corner 0.4 m under the road.) The lowest corner is ≥ 0.027 m above the road on every frame.
  const k = ease(f, t.lottery - 34, t.lottery + 6);
  const sway = (1 - k) * 0.45 * Math.sin((f - t.lottery) / 5);
  const half = 1.5 * TICKET_S, halfW = 0.85 * TICKET_S, REST = 0.05;
  const q = ease(f, t.next - 30, t.next - 12), fall = (Math.PI / 2) * q * q;    // the tip accelerates like a falling card
  const tilt = -fall - sway * 0.6;
  const rock = sway;
  // while it falls from the sky, lift the pivot so the rocked/tilted corners clear the road (zero once it has landed)
  const clear = half * (1 - Math.cos(rock)) + halfW * Math.abs(Math.sin(rock)) + half * Math.abs(Math.sin(Math.min(0, sway * 0.6)));
  const pivot = [TICKET_AT[0] + (1 - k) * 2.2 * Math.sin((f - t.lottery) / 9), REST + clear + 13 * (1 - k) * (1 - k), TICKET_AT[2]];
  const yaw = -0.35 + (1 - k) * 2.4;
  // the ticket's centre (for the tag): pivot + yaw-rotated (0, half·cos, −half·sin)
  const cz = -half * Math.sin(-tilt), cy = half * Math.cos(tilt);
  const pos = [pivot[0] + Math.sin(yaw) * cz, pivot[1] + cy, pivot[2] + Math.cos(yaw) * cz];
  return { pivot, pos, yaw, tilt, rock, half, vis: f > t.lottery - 36 };
};
'''
s = s[:a0] + new + s[a1:]
a = "{tp.vis && <group position={tp.pos} rotation-y={tp.yaw}><group rotation-x={tp.tilt}><group rotation-z={tp.rock}><Ticket s={TICKET_S} /></group></group></group>}"
assert s.count(a) == 1
s = s.replace(a, "{tp.vis && <group position={tp.pivot} rotation-y={tp.yaw}><group rotation-x={tp.tilt}><group position={[0, tp.half, 0]} rotation-z={tp.rock}><Ticket s={TICKET_S} /></group></group></group>}")
a = "const tick = P([tk.pos[0] - 0.55 * TICKET_S, tk.pos[1] + 0.02, tk.pos[2] - 0.6 * TICKET_S]);   // the ticket's upper-left, lying flat"
assert s.count(a) == 1
s = s.replace(a, "const tick = P([tk.pos[0] - 0.8 * TICKET_S, tk.pos[1] + 0.2 * TICKET_S, tk.pos[2]]);   // on the standing ticket (LEGAL leaves before it tips)")
a = "{ a: t.lottery - 22, b: t.years + 26, pos: [-1.3, 5.9, -6.9], target: [0.1, -0.4, -17.3], fov: 36 }   // rev 4: rises as the ticket comes down and looks DOWN on it lying flat on the road (the street and its lit fronts still beyond)"
assert s.count(a) == 1
s = s.replace(a, "{ a: t.lottery - 10, b: t.years + 26, pos: [-2.0, 2.5, 1.2], target: [-1.3, 1.15, -16], fov: 34 }   // rev 2 (restored in rev 4b): aimed 1.4 m left, so the standing ticket stands right of centre and 9 YEARS has the upper left")
a = '    cueAt("thud", t.lottery + 4, 14, 0.5),'
assert s.count(a) == 1
s = s.replace(a, a + '\n    cueAt("thud", t.next - 12, 12, 0.2),                      // rev 4b: the ticket slaps down flat on the road')
open(p, "w").write(s)
print("patched")
