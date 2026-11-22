// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import { SENTENCES, WORDS } from "./captions";

var _a;

export const QUESTION = [
  // V35: "Do you buy a ticket when the jackpot gets big?" — 10 words. The accent (serif) is the subject ("ticket"), never an answer.
  { idx: [0, 1, 2, 3], size: 78, weight: 800, z: 0 },
  // "Do you buy a"
  { idx: [4], size: 132, weight: 400, z: 30, accent: true },
  // "ticket" — the accent (serif)
  { idx: [5, 6, 7], size: 80, weight: 800, z: 60, fly: 420 },
  // "when the jackpot" — the WIDEST line (check it at the dolly's end)
  { idx: [8, 9], size: 84, weight: 800, z: 90, fly: 330 }
  // "gets big?"
];
const Q_SEN = SENTENCES.filter((x) => x.scene === "close")[1];
const Q_NEXT = ((_a = SENTENCES.filter((x) => x.scene === "close")[2]) == null ? void 0 : _a.at) ?? Infinity;
export const Q_WORDS = WORDS.filter((w) => w.at >= Q_SEN.at && w.at <= Q_SEN.end && w.at < Q_NEXT);
if (Q_WORDS.length !== 10) throw new Error("the question has " + Q_WORDS.length + " words, the tracking text lays out 10");
if (QUESTION.flatMap((l) => l.idx).join() !== "0,1,2,3,4,5,6,7,8,9") throw new Error("the question's lines must lay out its 10 words once, in order");
export const Q = { at: Q_WORDS[0].at, last: Q_WORDS[9].at };
