// @ts-nocheck
// ★ V38 rev 4c — THE HOOK SHIFT. Timur (2026-11-26) re-wrote the opening line: "In this town of just 1,903 people, a retired couple found a
//   way to beat the lottery. Legally. For nine years." The new line (take38C, scratchpad/hook_vo.py) is 43 frames longer than take B's,
//   so the film runs in TWO clocks:
//   · REAL time (the composition's frames): the hook station, the voice (public/vo_trimmed.*), the karaoke (take_rt.ts), the close;
//   · STORY time = real − HOOK_SHIFT: every other station, exactly as authored and checked on take B (take.ts, its solved camera keys,
//     matched cuts, dissolves, sound cues). Main.tsx shifts their shots/cues/flashes by +HOOK_SHIFT and hands them story frames.
//   HOOK_SHIFT is written by scratchpad/hook_vo.py into scratchpad/hook_shift.json; keep the two equal.
export const HOOK_SHIFT = 53;   // rev 4d: + the 10-frame pause after "In this town"
export const HOOK_ID = "hook";
