// @ts-nocheck
// THE CLOSING QUESTION as tracking text — OPTIONAL since Video 36.
// ★ V36 "Bre-X Gold" (2026-11-23): the film has NO spoken question (CONTENT.md: the story format ends on the lesson; the question
//   lives in the post caption). The question is the close scene's first non-hero line; with none, Q is null, QUESTION is empty and
//   Composition.tsx mounts no tracking text, no question whooshes and no "So be honest." hero (HAS_QUESTION = Q !== null).
// To bring one back: give the close scene its lines in episode.json (hero "So be honest." + the question), regenerate captions.ts,
//   and lay its words out below (V35's layout, for "Do you buy a ticket when the jackpot gets big?" — 10 words):
//     { idx: [0, 1, 2, 3], size: 78, weight: 800, z: 0 },               "Do you buy a"
//     { idx: [4], size: 132, weight: 400, z: 30, accent: true },        "ticket" — the accent (serif): the subject, never an answer
//     { idx: [5, 6, 7], size: 80, weight: 800, z: 60, fly: 420 },       "when the jackpot" — the WIDEST line
//     { idx: [8, 9], size: 84, weight: 800, z: 90, fly: 330 }           "gets big?"
import { SENTENCES, WORDS } from "./captions";

export const QUESTION = [];
const CLOSE = SENTENCES.filter((x) => x.scene === "close");
const Q_SEN = CLOSE.find((x) => !x.hero);
const Q_NEXT = Q_SEN ? CLOSE[CLOSE.indexOf(Q_SEN) + 1]?.at ?? Infinity : Infinity;
export const Q_WORDS = Q_SEN ? WORDS.filter((w) => w.at >= Q_SEN.at && w.at <= Q_SEN.end && w.at < Q_NEXT) : [];
const LAID = QUESTION.flatMap((l) => l.idx);
if (Q_SEN && LAID.length !== Q_WORDS.length) throw new Error("the question has " + Q_WORDS.length + " words, the tracking text lays out " + LAID.length);
if (Q_SEN && LAID.join() !== Q_WORDS.map((_, i) => i).join()) throw new Error("the question's lines must lay out its words once, in order");
if (!Q_SEN && QUESTION.length) throw new Error("QUESTION lays out a question the take does not have (no non-hero close line)");
export const Q = Q_SEN ? { at: Q_WORDS[0].at, last: Q_WORDS[Q_WORDS.length - 1].at } : null;
