// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import { rInOut } from "./anim";
import { aim } from "./common";
import { smoothFollow } from "./chart";

const zAt = (s, g) => s.z * (1 + (s.push ?? 0.03) * rInOut(g, s.a + (s.dur ?? 40), s.a + (s.dur ?? 40) + 150));
export const actionCam = (shots) => {
  if (!shots.length) throw new Error("actionCam: no focuses");
  for (let i = 1; i < shots.length; i++) if (shots[i].a < shots[i - 1].a) throw new Error(`actionCam: focus ${i} starts before focus ${i - 1}`);
  const raw = (g) => {
    let x = shots[0].at(g).x, y = shots[0].at(g).y, z = zAt(shots[0], g);
    for (let i = 1; i < shots.length; i++) {
      const s = shots[i], e = rInOut(g, s.a, s.a + (s.dur ?? 40));
      if (e <= 0) break;
      const p = s.at(g), zz = zAt(s, g);
      x += (p.x - x) * e;
      y += (p.y - y) * e;
      z += (zz - z) * e;
    }
    return { ...aim(x, y), z };
  };
  return (g) => smoothFollow(g, raw);
};
export const actionCamWindows = (shots) => [
  ...shots.slice(1).map((s) => ({ a: s.a, b: s.a + (s.dur ?? 40) })),
  ...shots.filter((s) => s.ride).map((s) => ({ a: s.ride.a, b: s.ride.b }))
].sort((p, q) => p.a - q.a);
export const still = (x, y) => () => ({ x, y });
