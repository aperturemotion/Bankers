// @ts-nocheck
// ★ V38 rev 2 — the TEST → COMPANY matched cut (Timur: "make sure that when they transition, they locate at the same point").
//   On test's LAST frame (T().out - 1, ≈ 882) the $1 bill's green Treasury seal and on company's FIRST frame (T().cut ≈ 883) the
//   certificate's gold seal are BOTH centred on this screen point with this radius (px of the 1080×1920 frame, the seal's outer
//   sawtooth edge), and both are being pushed in at the same rate (the seal's radius grows by PUSH_RATE per frame on both sides of
//   the cut, so the motion carries straight through). The test builder measures its side, the company builder matches it.
export const SEAL_SCREEN = { x: 540, y: 820, r: 300 };
export const PUSH_RATE = 0.012;   // +1.2 % radius per frame through the cut
