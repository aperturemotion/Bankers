// @ts-nocheck
// ★ V38 rev 4c — THE HOOK SHIFT. Timur (2026-11-26) re-wrote the opening line: "In this town of just 1,903 people, a retired couple found a
//   way to beat the lottery. Legally. For nine years." The new line (take38C, scratchpad/hook_vo.py) is HOOK_SHIFT frames longer than take B's (54 since rev 4f),
//   so the film runs in TWO clocks:
//   · REAL time (the composition's frames): the hook station, the voice (public/vo_trimmed.*), the karaoke (take_rt.ts), the close;
//   · STORY time = real − HOOK_SHIFT: every other station, exactly as authored and checked on take B (take.ts, its solved camera keys,
//     matched cuts, dissolves, sound cues). Main.tsx shifts their shots/cues/flashes by +HOOK_SHIFT and hands them story frames.
//   HOOK_SHIFT is written by scratchpad/hook_vo.py into scratchpad/hook_shift.json; keep the two equal.
export const HOOK_SHIFT = 54;   // rev 4f: the closing "s" of "years." kept (the splice was 0.34 s early); rev 4e: no pause after "In this town"
export const HOOK_ID = "hook";
