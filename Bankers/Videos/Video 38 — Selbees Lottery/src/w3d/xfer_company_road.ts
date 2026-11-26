// @ts-nocheck
// ★ V38 rev 2 — the COMPANY → ROAD hand-over's arrival on the road (owned by the company builder; st_road.tsx spreads it as its
//   first shot(s)). A(local) maps road-local coords to WORLD; t is road's word table. Shots with a < 1104 only — road's own
//   "crane down behind the car" starts at 1104.
export const ROAD_FROM = 1066;   // the frame road mounts (st_road ST.from reads this)
export const roadArrival = (A, t) => [
  { a: 1068, b: 1106, pos: A([-15, 11, -0.8]), target: A([9, -0.5, 0.3]), fov: 40, arc: 10 }   // arrival (flight)
];
