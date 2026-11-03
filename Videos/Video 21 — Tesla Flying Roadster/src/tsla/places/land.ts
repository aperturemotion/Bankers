/** ★ HOW EVERY FIGURE LANDS ON ITS WORD — rOut over [word − 4, word + 16], from depth. ONE copy: the constructions animate
 *  on it and the SFX score (Video.tsx `lands`) puts each landing's hit on it. The hit belongs where the eye sees the figure
 *  ARRIVE: OUT is front-loaded (0.23, 0.43, 0.57 of the way after 1, 2, 3 frames), so the motion is biggest on the window's
 *  first frames — the sweep's own frames measured "$833B" moving most at word − 3 … − 1 — not on the word itself, where the
 *  subs used to sit (2–3 f late; Timur, 2026-10-01: "ensure that the sfx are timed right, especially in the hook scene"). */
export const figLand = (word: number): [number, number] => [word - 4, word + 16];
