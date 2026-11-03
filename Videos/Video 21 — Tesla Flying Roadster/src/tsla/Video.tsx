import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame } from "remotion";
import { rInOut, rOut, rIn, drift2, clamp01, INOUT, alpha, mixHex } from "./anim";
import { Field, KeyLight } from "./stage";
import { BrandClose } from "./close";
import { WordCaption } from "./text";
import { TrackText, trackBottom, type TrackLine } from "./track";
import { CHIPS, HERO, VO_LEAD, VO_CUT, VO_GAP, TOTAL_FRAMES, SYNTHETIC, SENTENCES } from "./captions";
import { SfxLayer, within, type Cue, type SfxName } from "./SfxLayer";
import { World, camPath, zoomFrac, zoomT, FG, MID, FAST, type Move, type V3, type LayerSpec } from "./world";
import { Probe } from "./Probe";
import { theme } from "./theme";
import { PLACE_PARTS, TIMES, T0 as PT0, PF_CUES } from "./places/registry";
import { MARKER } from "./places/marker";
import { PROFILE, profileCar } from "./places/profile";
import { THRUSTERS } from "./places/thrusters";
import { SPEEDO } from "./places/speedo";
import { REVENUE_AT } from "./places/revenue";
import { BARS } from "./places/bars";
import { WORTH } from "./places/worth";
import { FUTURE } from "./places/future";
import { COMMITTEE } from "./places/committee";
import { FAA } from "./places/faa";
import { TIMELINE } from "./places/timeline";
import { UNSIGNED } from "./places/unsigned";
import { figLand } from "./places/land";
import { HOOK_SFX_BUILT, THRUSTER_SFX_BUILT } from "./hooksfx.gen";

// ══════════════════════════════════════════════════════════════════════════════════════════════
// ★ BANKERS VIDEO 21 — "The Last Car You'll Drive" (TeslaFlyingRoadster, ≤ 80 s — the brief's HARD CAP, end card included). ONE DATASET
// PER FIGURE FAMILY (data.ts): Tesla's deliveries releases; its Q3 2026 10-Q (profit, revenue); the Oct 27, 2026 close × the 10-Q's
// share count; the reveal as reported by TechCrunch, CBS, CNN and AP.
// ★★ BUILT FROM THE DEMO (Resources/visual-vocabulary.md → DEMO ANCHOR) with every STYLE §16 rule: 2-D by default, real 3-D where the idea
// needs depth (the stunt, the car, the gauge), the dark-blue metal, the camera following the action, ONE light frame, the house close.
// ONE CONTINUOUS JOURNEY, none over 7 s:
//   hookA     ★ THE BRIEF'S HOOK: THE STUNT, ALREADY MID-AIR (hook.tsx) — the Roadster racing up a twisting ramp, upside down, rolling back
//             in mid-air on its thrusters over five Teslas, landing; its own following camera
//   hookB     (pull-back) the line-up drives off by itself, the Cybercab first: BEST OF THE LAST HUMAN-DRIVEN
//   whatA     (slide, following the Roadster out) the reveal's date: an event board on the test pad, OCT 15, 2026, WACO, TEXAS
//   whatB     (slide) the stunt side-on: the ramp's profile, the path drawn as the car travels it
//   whatC     (push) the thrusters: a slow orbit round the Roadster's tail, 10 THRUSTERS and the SpaceX mark on its panel, the car lifting
//   whatD     (slide) the speedometer: 0 → 60 in under a second
//   teachA    (push) the strange part: the Roadster tiny beside Tesla's quarterly revenue in cash
//   teachB    (slide) the bars: deliveries Q3 2025 vs Q3 2026, −2%; teachB2 (travel) profit, −43%
//   teachC    (slide) the counter rolling to $1.6T, MARKET VALUE
//   teachD    (push) the cars Tesla sells today, their light dimming; teachD2 WHITE — the one light frame · (travel) what comes next:
//             a Cybercab with no driver, a robot's hand, a Starship
//   teachE    (slide, back to the navy) two board folders, Tesla and SpaceX, sliding together and stopping with a gap
//   honestA   (push) THE SPINE RETURNS: the Roadster parked, the camera circling it, an aircraft's outline it does not fit
//   honestB   (slide) the production rail: OCT 2026 → 2028, the far end open
//   honestC   (slide) the merger agreement, its two signature lines empty
//   question  (slide) the closing question as TRACKING TEXT on the open field; then the Bankers close (the house close, unchanged)
// ★ The camera: the Bankers durations on SETTLE, every long hold phrased ZOOM IN → MOVE → ZOOM OUT, every key gliding (STYLE §16).
// The take: ElevenLabs "Jon – Calm Presence" (eleven_v4), generated from the final VO_SCRIPT.txt (Bankers/CLAUDE.md §1, 2026-10-18).

export const VIDEO_FRAMES = TOTAL_FRAMES;
const HAS_VO = true;
const HAS_SFX = true;
/** ★ ON THE PROVISIONAL TAKE THE SCORE PLAYS IN THE STUDIO, for review (STYLE §11.4). stylecheck STAGE enforces `SFX_PREVIEW = SYNTHETIC`. */
const SFX_PREVIEW = SYNTHETIC;
const HAS_MUSIC = true;
// ★★ THE SONG: music_yeat.mp3 FROM ITS START at 15/97 (Timur's song table, 2026-10-28: "20 (approved), 21 | music_yeat.mp3, from its start
// at 15/97"). The file Videos 1, 4 and 6 used, copied from Video 1's public/, untouched; it plays as written from the first frame (its quiet
// intro under the hook, its drop at 13.33 s in the file), at ONE gain for the whole film, fading out under the closing logo (STYLE §11.3).
// ⚠ The brief asked for the drop on the hook's flip; the table says "from its start" — asked of Timur in the handback. ⚠ Commercial: the
// client's rights are flagged in every handback.
// ★★ Timur, 2026-10-30: "change the song to this" — Future, "LIKE ME" (Instrumental, ft. 42 Dugg & Lil Baby), his file from Downloads copied
// in as public/music_likeme.mp3 (134.6 s, 44.1 kHz stereo). It plays as Yeat did: from its start (its quiet intro under the hook, its own drop
// at 12.85 s), ONE gain, fading under the closing logo. Its body (14–77 s) measures −8.1 dB against Yeat's −8.7, so the gain is one 1/97 step
// lower (15/97 → 14/97, −0.6 dB): the song sits where the Yeat mix did. music_yeat.mp3 stays in public/, unmounted. ⚠ Commercial: flag rights.
// ★★ Timur, 2026-10-31: "use the daphni poly song" — Daphni, "Poly" (public/music_daphni_poly.mp3, copied from Video 10's public/: the same
// file, md5 db35d828…, as Videos 2, 3, 9 and 10). No drop: it plays from its top, one gain. Its body (14–77 s) measures −11.0 dB against LIKE
// ME's −7.4, so the gain rises 3.6 dB to the nearest 1/97 step (14/97 → 21/97, +3.5 dB): the same level as before. music_likeme.mp3 stays in
// public/, unmounted. ⚠ Commercial: flag the client's rights.
const MUSIC_SRC = "music_daphni_poly.mp3", MUSIC_FROM_S = 0;
const MUSIC_VOL = 21 / 97;
export type Solo = "vo" | "music" | "sfx" | undefined;

// ══ THE JOURNEY — ★★★ THE FLOW GRAMMAR (Bankers/STYLE.md §16, 2026-10-30) ═══════════════════════════════════════════════════════
// Timur, after Video 21's render: "the most impactful difference between bankers and [the Style 3 films] … has something to do with the way the
// video moves … every scene is so separate from one another … it should be sort of a flow throughout the entire video". Measured against the
// recent Style 3 films (Style 3 V35–V40, scratchpad/motioncmp in the session): the Style 3 films REST (29% still frames against Bankers' 8%), then
// TRAVELS through one world — 44% of its big travels are cranes (Bankers 12%), it rarely repeats a direction (36% vs 61%), its light travels
// with the camera (0.47× the content, Bankers 0.26×), and it has 4× the light frames. So, here:
//   · NO PUSH / ZOOM-THROUGH HAND-OVERS ("they're terrible"): every hand-over is a TRUCK (sideways) or a CRANE (vertical), on the Style 3
//     films' in-out (FAST), with their depth arc and a camera turn (yaw ±7° on a truck, pitch ±5° on a crane) — or a CARRIED hand-over,
//     where the camera follows the next scene's subject in (whatB, Timur's worked example);
//   · every scene ARRIVES ON ITS SUBJECT (the move lands framed in on `open`), RESTS, then pulls OUT to the whole, and rests again before it
//     leaves ("They shouldn't start zoomed out. Try going to the subject first");
//   · the background light belongs to its place and travels with the camera (0.4×); every 2–3 scenes a CHANGE OF PLACE (`newPlace`): the
//     light stays with the outgoing scene as it leaves, the ground goes plain, and a new light arrives with the next;
//   · more light frames (four white places, about 1 in 4).
type Span = [number, number];
type Kind = "truckR" | "truckL" | "craneU" | "craneD" | "carry";
const sentAt = (re: RegExp) => { const s = SENTENCES.find((x) => re.test(x.text)); if (!s) throw new Error(`no sentence ${re}`); return s; };
/** a truck crosses a frame and a margin; a crane a frame height and a margin (the Style 3 films use 1,600–2,000; the sweep's 15-f overlap
 *  sets ours) */
const SLIDE_X = 1020, CRANE_Y = 1450;
/** kept for stylecheck's older checks (no push is built in the flow grammar) */
const PUSH_Z = 1.25;
const moveOf = (kind: Kind, k = 1): Partial<V3> =>
  kind === "truckR" || kind === "carry" ? { x: SLIDE_X * k } : kind === "truckL" ? { x: -SLIDE_X * k } : kind === "craneU" ? { y: -CRANE_Y * k } : { y: CRANE_Y * k };

export type PlaceId = "hookA" | "hookB" | "whatA" | "whatB" | "whatC" | "whatD" | "teachA" | "teachB" | "teachB2" | "teachC" | "teachD" | "teachD2" | "teachE" | "honestA" | "honestB" | "honestC" | "question";
/** ★★★ THE CAMERA FOLLOWS THE ACTION (STYLE §8.7): a framing — the point (x, y) of the place as it stands when it has arrived, drawn `c` of the
 *  way toward the frame's centre, with the camera `dz` nearer */
type Aim = { x: number; y: number; dz: number; c?: number };
type Key = Aim & { from: number; to: number; curve?: "fast" | "glide" };
type Place = { id: PlaceId; kind?: Kind; t0: number; dur?: number; moves?: { from: number; to: number; d: Partial<V3> }[]; white?: boolean; whiteIn?: number;
  keepMid?: number; keepFg?: number; slideK?: number; newPlace?: boolean; key: { x: number; y: number; angle: number };
  /** the framing the hand-over LANDS on (the subject first) */
  open?: Aim;
  /** a second framing the camera travels to after its first rest (a long hold's ALONG) */
  along?: Aim };

/** ★ the Style 3 films' hand-over lengths at the Bankers pace: trucks 48 f, cranes 52 f, travels 48 f */
const TRUCK_DUR = 48, CRANE_DUR = 52, TRAVEL = 48, ARC = 0.08;
/** a scene RESTS after it lands and before it leaves (the Style 3 films: still runs of 0.5–3 s, 9 a minute) */
const REST_IN = 18, REST_OUT = 14, KEY_DUR = 40;

// ── the CARRIED hand-over into the side-on stunt (Timur's worked example, 2026-10-30): the board drifts out to the left; once it is clear the
// Roadster enters from the left on its run-up, speeding up toward a ramp not yet in view, the camera travelling with it CLOSE and a touch
// slower than the car; as the curl comes into view the camera slowly zooms out to the whole scene ──
// The board drifts LEFT BY ITSELF (boardDrift over boardDur) while the camera stays near it, so the car — whose run-up starts just off the
// left edge — appears only once the board has gone; the curl stands only `k` × 1020 to the right, held off-screen by the close framing.
const CARRY = { start: PT0.whatB, foot: PT0.whatB + 62, end: PT0.whatB + 97, k: 0.62, zoom: 0.44, ax: [-200, 330] as [number, number], ay: 1120,
  boardDrift: 1150, boardDur: 34, wx: [-8, 10] as [number, number], zin: [-6, 22] as [number, number], axFrom: 20, reveal: [19, 29] as [number, number] };
/** the board's own drift out to the left during the carried hand-over (its layers' station moves) */
const boardOff = (f: number) => -CARRY.boardDrift * rInOut(f, CARRY.start, CARRY.start + CARRY.boardDur);
/** ★ (Timur, 2026-10-31: "I don’t need the sort of road in the background to appear whatsoever until the billboard is sort of off screen.
 *  So don’t make the background change") the incoming place — its road, its floor, its light — is held at nothing until the board has left
 *  the frame (`reveal`[0]), then comes up; the car rolls in only after it (`axFrom`) */
const carryReveal = (f: number) => rInOut(f, CARRY.start + CARRY.reveal[0], CARRY.start + CARRY.reveal[1]);

/** ★ SIXTEEN PLACES, NONE OVER 7 s (STYLE §1.3). Hand-overs alternate type and direction (never the same type and direction twice running). */
export const PLACES: Place[] = [
  { id: "hookA", t0: PT0.hookA, keepMid: 1, key: { x: 300, y: -280, angle: 10 } },
  // ★ the payoff: the hook's own camera moves IN on the Roadster as the line-up drives off (hook.tsx — the hero is the subject); no house move
  { id: "hookB", t0: PT0.hookB, key: { x: 300, y: -270, angle: 8 } },
  // the event board: the camera TRUCKS RIGHT after the Roadster as it drives out of the hook (a change of place), landing on the date, then
  // out to the whole board
  { id: "whatA", kind: "truckR", t0: PT0.whatA, newPlace: true, key: { x: 760, y: -255, angle: -15 },
    open: { x: MARKER.a.x, y: MARKER.a.y, dz: 0.12, c: 0.3 }, along: { x: MARKER.b.x, y: MARKER.b.y, dz: 0.1, c: 0.25 } },
  // ★ CARRIED: the Roadster's run-up, followed in, then the whole curl (Video.tsx carryCam)
  { id: "whatB", kind: "carry", t0: CARRY.start, dur: CARRY.end - CARRY.start, slideK: CARRY.k, key: { x: 300, y: -270, angle: 10 },
    along: { x: PROFILE.b.x, y: PROFILE.b.y, dz: 0.08, c: 0.15 } },
  // the thrusters: the camera CRANES UP to the hovering car (a change of place), landing on the nozzles, along to the engraved panel, out
  { id: "whatC", kind: "craneU", t0: PT0.whatC, newPlace: true, key: { x: 280, y: -270, angle: 14 },
    open: { x: THRUSTERS.a.x, y: THRUSTERS.a.y, dz: 0.12, c: 0.2 }, along: { x: THRUSTERS.b.x, y: THRUSTERS.b.y, dz: 0.1, c: 0.1 } },
  // the speedometer: a truck left, landing on the needle, then out to the dial
  { id: "whatD", kind: "truckL", t0: PT0.whatD, key: { x: 740, y: -255, angle: -15 },
    open: { x: SPEEDO.a.x, y: SPEEDO.a.y, dz: 0.12, c: 0.3 } },
  // ★ LIGHT: the strange part — a crane down onto the white stage (a change of place), on the tiny Roadster, along to the revenue, out
  { id: "teachA", kind: "craneD", t0: PT0.teachA, white: true, newPlace: true, key: { x: 280, y: -270, angle: 12 },
    open: { x: REVENUE_AT.a.x, y: REVENUE_AT.a.y, dz: 0.12, c: 0.3 }, along: { x: REVENUE_AT.b.x, y: REVENUE_AT.b.y, dz: 0.08, c: 0.2 } },
  // the bars (back to the navy): a truck right, on the deliveries pair
  { id: "teachB", kind: "truckR", t0: PT0.teachB, keepMid: 1, newPlace: true, key: { x: 760, y: -255, angle: -15 },
    open: { x: BARS.first.x, y: BARS.first.y, dz: 0.1, c: 0.15 } },
  // the travel to the profit pair
  { id: "teachB2", kind: "truckR", t0: PT0.teachB2, moves: [{ from: 0, to: TRAVEL, d: { x: BARS.travel } }], key: { x: 300, y: -270, angle: 10 } },
  // the counter: a crane up to it, on the drums, then out
  { id: "teachC", kind: "craneU", t0: PT0.teachC, key: { x: 740, y: -255, angle: -15 },
    open: { x: WORTH.a.x, y: WORTH.a.y, dz: 0.12, c: 0.3 } },
  // the cars Tesla sells today: a crane down (a change of place — a truck carried its wide row across the counter), on today's cars, out
  { id: "teachD", kind: "craneD", t0: PT0.teachD, keepMid: 1, newPlace: true, key: { x: 280, y: -270, angle: 12 },
    open: { x: FUTURE.today.x, y: FUTURE.today.y, dz: 0.1, c: 0.25 } },
  // ★ LIGHT: the travel onto what comes next — the Cybercab, along through the robot's hand to the Starship, out
  { id: "teachD2", kind: "truckR", t0: PT0.teachD2, white: true, moves: [{ from: 0, to: TRAVEL, d: { x: FUTURE.travel } }], key: { x: 760, y: -255, angle: -15 },
    open: { x: FUTURE.cab.x, y: FUTURE.cab.y, dz: 0.1, c: 0.2 }, along: { x: FUTURE.ship.x, y: FUTURE.ship.y, dz: 0.1, c: 0.2 } },
  // the board folders (back to the navy): a crane up (a truck left carried the camera back across what comes next), close on the gap, out
  { id: "teachE", kind: "craneU", t0: PT0.teachE, key: { x: 740, y: -255, angle: -15 },
    open: { x: 190, y: 980, dz: 0.14, c: 0.5 } },   // (opens on TESLA's folder, then pulls out to both: the folders' labels sit near the frame's edges, so a centred zoom pushed one out)
  // the honest part: THE SPINE RETURNS — a truck right (a change of place), on the car, along as it circles, out
  { id: "honestA", kind: "truckR", t0: PT0.honestA, newPlace: true, key: { x: 280, y: -270, angle: 12 },
    open: { x: FAA.a.x, y: FAA.a.y, dz: 0.12, c: 0.25 }, along: { x: FAA.wing.x, y: FAA.wing.y, dz: 0.08, c: 0.2 } },
  // ★ LIGHT: the production rail — a crane up onto the white stage (a change of place), on 2028, out
  { id: "honestB", kind: "craneU", t0: PT0.honestB, white: true, newPlace: true, key: { x: 300, y: -270, angle: 10 },
    open: { x: TIMELINE.x, y: TIMELINE.a.y, dz: 0.1, c: 0.2 } },
  // ★ LIGHT: the agreement — a truck left along the white, on its empty lines, out
  { id: "honestC", kind: "truckL", t0: PT0.honestC, white: true, slideK: 1.12, key: { x: 740, y: -255, angle: -15 },
    open: { x: UNSIGNED.a.x, y: UNSIGNED.a.y, dz: 0.1, c: 0.25 } },
  // ★★★ the question arrives by a TRUCK onto the open field (STYLE §9.8) — a change of place; the house close exactly
  { id: "question", kind: "truckR", t0: PT0.question, slideK: 1.2, newPlace: true, key: { x: 480, y: -280, angle: 3 } },
];

const DUR_OF = (p?: Place) => (p?.dur ?? (p?.moves ? Math.max(...p.moves.map((m) => m.to)) : p?.kind === "craneU" || p?.kind === "craneD" ? CRANE_DUR : TRUCK_DUR));
/** kept for the score's older helpers */
const SLIDE_DUR = TRUCK_DUR;
const HERO_LAST = HERO[HERO.length - 1].at;
const TRACK: Span = [HERO[0].at - 4, HERO_LAST + 24];
/** the fly-through into the close: 56 f (the house close, unchanged) */
const THRU: Span = [HERO_LAST + 24, HERO_LAST + 80];
/** the question lifts away over 72 f (STYLE §8.10) */
const LIFT: Span = [THRU[0], THRU[0] + 72];
/** ★ THE OPENING PUSH — quick, from twice the distance (STYLE §16 2026-10-15) */
const ARRIVE_DZ = 0.5;
const ARRIVE: Span = [0, 30];
const ARRIVE_Y = 0;

/** ★ THE CAPTION CAMERA (§2.5.2) — important lines only: the hook, and the teach's key number ($1.6 trillion) */
const s0 = SENTENCES[0];
const teachLine = sentAt(/^Yet Tesla is worth/i);
const CAP = {
  hook: { span: [s0.at, s0.end] as Span, dz: 0.06, kind: "push" as const },
  reveal: { span: [Math.max(teachLine.at, PT0.teachC + CRANE_DUR + 2), Math.min(teachLine.end, PT0.teachD - 2)] as Span, dz: 0.03, kind: "push" as const },
};
const CAP_R = 0.7;
const CAM0: V3 = { x: 0, y: -ARRIVE_Y, z: -ARRIVE_DZ };
const arrivalEnd = (i: number) => (i === 0 ? ARRIVE[1] : PLACES[i].t0 + (PLACES[i].kind ? DUR_OF(PLACES[i]) : 0));
/** a framing's camera offset from where the place stands: Δ = p·(1 − (1 − c)(1 − dz)) */
const keyOff = (k?: Aim): V3 => {
  if (!k) return { x: 0, y: 0, z: 0 };
  const s = (1 - (k.c ?? 0.35)) * (1 - k.dz);
  return { x: (k.x - 540) * (1 - s), y: (k.y - 960) * (1 - s), z: k.dz };
};
/** ★ each place's camera after it lands: REST on its subject, (ALONG and rest), then OUT to the whole, and rest again before it leaves. A hold
 *  too short for all of it keeps the OUT and lets it run into the next hand-over (the camera is then still moving as it leaves — never a
 *  stop-start on the hand-over's first frame). */
export const KEYS: Key[][] = PLACES.map((p, i) => {
  if (!p.kind) return [];
  const lo = arrivalEnd(i), next = PLACES[i + 1]?.t0 ?? THRU[0], out: Key[] = [];
  const start = p.open ?? { x: 540, y: 960, dz: 0, c: 0 };
  let at = lo + REST_IN;
  if (p.along && next - REST_OUT - (at + KEY_DUR + 12 + 30) >= 0) { out.push({ ...p.along, from: at, to: at + KEY_DUR, curve: "glide" }); at += KEY_DUR + 12; }
  if (!p.open && !out.length) return [];
  const outTo = Math.max(at + 30, Math.min(at + KEY_DUR, next - REST_OUT));
  out.push({ x: 540, y: 960, dz: 0, c: 0, from: at, to: outTo, curve: "glide" });
  void start;
  return out;
});
const OPEN_OFF = (i: number) => keyOff(PLACES[i].open);
const buildMoves = (slideK: (p: Place) => number): Move[] => ([
  { t0: ARRIVE[0], t1: ARRIVE[1], d: { y: ARRIVE_Y, z: ARRIVE_DZ }, ease: "out" as const },
  ...PLACES.flatMap((p, i) => {
    if (!p.kind) return [];
    const o = OPEN_OFF(i), t1 = p.t0 + DUR_OF(p);
    const base: Partial<V3> = p.moves ? { x: p.moves[0].d.x ?? 0, y: p.moves[0].d.y ?? 0 } : moveOf(p.kind, slideK(p));
    // the hand-over: across (or up / down) on FAST, landing framed on the subject; its depth (the open's dz) on a zoom ease, and the arc
    const ms: Move[] = [{ t0: p.t0, t1, d: { x: (base.x ?? 0) + o.x, y: (base.y ?? 0) + o.y }, ease: "io", curve: "fast" }];
    if (o.z) ms.push({ t0: p.t0, t1, d: { z: o.z }, ease: "zoom", endD: MID - o.z, curve: "fast" });
    if (p.kind !== "carry") ms.push({ t0: p.t0, t1, d: { z: -ARC }, ease: "arc", curve: "fast" });
    return ms;
  }),
  ...KEYS.flatMap((ks, i) => ks.map((k, j) => {
    const a = j ? keyOff(ks[j - 1]) : OPEN_OFF(i), b = keyOff(k), dz = b.z - a.z;
    return { t0: k.from, t1: k.to, d: { x: b.x - a.x, y: b.y - a.y, z: dz }, ease: (Math.abs(dz) > 1e-6 ? "zoom" : "io") as "zoom" | "io", endD: MID - b.z, curve: "glide" as const };
  })),
  ...Object.values(CAP).map((c) => ({ t0: c.span[0], t1: c.span[1], d: { z: c.kind === "push" ? c.dz : -c.dz }, ease: "zoom" as const })),
  { t0: TRACK[0], t1: TRACK[1], d: { z: 0.12 }, ease: "zoom" as const },
  { t0: THRU[0], t1: THRU[1], d: { z: 1.2 }, ease: "zoom" as const },
] as Move[]).sort((a, b) => a.t0 - b.t0);
/** ★ A TRUCK CARRIES WHAT IT LEAVES A FULL FRAME: scaled by the outgoing construction's distance */
const MOVES0 = buildMoves(() => 1);
const midOwner = (i: number) => { for (let j = i - 1; j > 0; j--) if (PLACE_PARTS[PLACES[j].id]?.mid) return j; return 0; };
const slideK = (p: Place) => {
  if (p.slideK !== undefined) return p.slideK;
  const i = PLACES.indexOf(p), zo = camPath(CAM0, MOVES0, arrivalEnd(midOwner(i)), false).z;
  return Math.max(1, (zo + MID - camPath(CAM0, MOVES0, p.t0, false).z) / MID);
};
const MOVES: Move[] = buildMoves(slideK);
const at = (f: number) => camPath(CAM0, MOVES, f, false);
/** a station is where the camera stands, framing the WHOLE place, once it has arrived (the open framing taken off) */
const ST: Record<PlaceId, V3> = Object.fromEntries(PLACES.map((p, i) => {
  if (i === 0) return [p.id, { x: 0, y: 0, z: 0 }];
  const a = at(arrivalEnd(i)), o = OPEN_OFF(i);
  return [p.id, { x: a.x - o.x, y: a.y - o.y, z: a.z - o.z }];
})) as Record<PlaceId, V3>;
const ST_OUTRO = at(THRU[1]);

/** ★ THE CARRIED CAMERA (whatB): over the hand-over it is blended onto a camera that FOLLOWS the car — the car held at a screen anchor that
 *  runs from off the left edge to x 300 (the car a touch faster than the camera), framed CLOSE (dz CARRY.zoom); as the car reaches the curl
 *  the anchor eases onto the car's own place and the zoom out to the whole: at CARRY.end the follow IS the station, so it hands back with
 *  no seam. For a layer at the place's MID: screen = 540 + ((p − 540) − (cam − st)) / D, so cam = st + (p − 540) − (A − 540)·D. */
const PF_C = { ...PF_CUES, end: 0 };
const carryCam = (f: number, cam: V3): V3 => {
  if (f < CARRY.start + Math.min(0, CARRY.wx[0]) || f > CARRY.end) return cam;
  const st = ST.whatB, car = profileCar(PF_C, f);
  // (the zoom waits for the board to go: zoomed with it, the board's top crossed the caption)
  const zIn = CARRY.zoom * rInOut(f, CARRY.start + CARRY.zin[0], CARRY.start + CARRY.zin[1]), out = rInOut(f, CARRY.foot, CARRY.end);
  const dz = zIn * (1 - out), D = MID - dz;
  // ★ (2026-10-31, Timur on the rev-3 render: "around 12 seconds, a visual from the next scene … abruptly appears in the corner on the right")
  // The ZOOM goes on at once and the camera moves sideways onto the car only after it: blended together (one `w`), the camera reached the
  // car at full size, where the curl stands ~950 px from the parked car, and the ramp slid in at the right edge, out, then in again.
  // scratchpad/carryview.mjs projects the curl and the car through this camera and refuses that.
  const ax0 = CARRY.ax[0] + (CARRY.ax[1] - CARRY.ax[0]) * rInOut(f, CARRY.start + CARRY.axFrom, CARRY.foot);
  const ax = ax0 + (car.x - ax0) * out, ay = CARRY.ay + (car.y - CARRY.ay) * out;
  const follow: V3 = { x: st.x + (car.x - 540) - (ax - 540) * D, y: st.y + (car.y - 960) - (ay - 960) * D, z: st.z + dz };
  const w = rInOut(f, CARRY.start, CARRY.start + 18), wx = rInOut(f, CARRY.start + CARRY.wx[0], CARRY.start + CARRY.wx[1]);
  return { x: cam.x + (follow.x - cam.x) * wx, y: cam.y + (follow.y - cam.y) * wx, z: cam.z + (follow.z - cam.z) * wx };
};

/** ★ THE CAMERA TURNS AS IT TRAVELS (the Style 3 films' shot.tsx): a truck yaws ±7°, a crane pitches ±5°, both rising and returning on the
 *  move's own eased progress — so a hand-over is the viewpoint moving, not the pictures sliding */
const turnAt = (f: number) => {
  let yaw = 0, pitch = 0;
  for (const p of PLACES) {
    if (!p.kind) continue;
    const d = DUR_OF(p);
    if (f < p.t0 || f > p.t0 + d) continue;
    const q = Math.sin(Math.PI * FAST(clamp01((f - p.t0) / d)));
    if (p.kind === "truckR" || p.kind === "carry") yaw += (p.moves ? -4 : p.kind === "carry" ? -4 : -7) * q;
    else if (p.kind === "truckL") yaw += 7 * q;
    else if (p.kind === "craneU") pitch += 5 * q;
    else pitch -= 5 * q;
  }
  return { yaw, pitch };
};

/** ★★ THE LIGHT TRAVELS WITH ITS PLACE (the Style 3 films' E7; measured: their background moves 0.47× the content). Each place owns a lift and
 *  a key cone, drawn at its station and moved on screen at 0.4 of the camera's travel. A plain hand-over hands the light over as the camera
 *  moves (the old one fades over 0.3–1.0 of the move, the new one comes over its first 60%); at a CHANGE OF PLACE the old light stays WITH
 *  its scene (0.9×) as it leaves, the ground between goes plain, and the new light arrives with the next scene (STYLE §16 2026-10-30). */
const LIGHT_PAR = 0.4, LIGHT_PAR_NEW = 0.9;
type PlaceLight = { i: number; o: number; dx: number; dy: number };
const lightsAt = (f: number, cam: V3): PlaceLight[] => {
  const out: PlaceLight[] = [];
  PLACES.forEach((p, i) => {
    if (i === 1) return;   // (hookB shares the hook's light)
    const nx = PLACES[i === 0 ? 2 : i + 1], pv = i === 0 ? undefined : PLACES[i === 2 ? 0 : i - 1];
    // arrival: this place's own hand-over; departure: the next one's
    const arrT = p.kind ? p.t0 : -Infinity, arrD = p.kind ? DUR_OF(p) : 1;
    const depT = nx?.t0 ?? Infinity, depD = nx?.kind ? DUR_OF(nx) : 1;
    const inQ = clamp01((f - arrT) / arrD), outQ = clamp01((f - depT) / depD);
    const newIn = !!p.newPlace, newOut = !!nx?.newPlace;
    const oIn = arrT === -Infinity ? 1 : p.kind === "carry" ? carryReveal(f) : newIn ? rInOut(inQ, 0.45, 1) : rInOut(inQ, 0, 0.6);
    const oOut = newOut ? 1 - rInOut(outQ, 0.55, 1) : 1 - rInOut(outQ, 0.3, 1);
    const o = oIn * oOut;
    if (o <= 0.003) return;
    const par = (f < depT ? newIn : newOut) ? LIGHT_PAR_NEW : LIGHT_PAR;
    void pv;
    const sx = ST[p.id].x + (p.id === "whatA" ? boardOff(f) / par : 0);   // (the board's light leaves with the board)
    out.push({ i, o, dx: -(cam.x - sx) * par, dy: -(cam.y - ST[p.id].y) * par });
  });
  return out;
};

/** ★ (Timur, 2026-10-18: a "small visual glitch at around 1 minute and 21" — the caption BLINKED: "And these are averages." left at 1825
 *  and "Your own raise may" came at 1830, an empty slot of 5 f; the same 2–6-f blinks at 1150, 1183, 1909). A gap under 12 f between
 *  two chips is closed: the chip holds until the next one comes. */
const CHIPS_V = CHIPS.map((w, k) => { const nx = CHIPS[k + 1]; return nx && w.until !== undefined && nx.at - w.until < 12 ? { ...w, until: nx.at } : w; });
/** the chip on screen at frame f, as [at, end) — undefined in a pause */
const chipAt = (f: number) => {
  const i = CHIPS_V.findIndex((w, k) => f >= w.at && f < (w.until ?? CHIPS_V[k + 1]?.at ?? Infinity));
  return i < 0 ? undefined : { at: CHIPS_V[i].at, end: CHIPS_V[i].until ?? CHIPS_V[i + 1]?.at ?? Infinity };
};
/** the caption's own scale, eased exactly as the camera's zoom. ★ It may only JUMP at a chip swap or in an empty slot (STYLE §8.6). */
const capScale = (f: number) => {
  const s = (dz: number) => CAP_R / (CAP_R - dz);
  for (const c0 of Object.values(CAP)) {
    const c = c0 as { span: Span; dz: number; kind: "push" | "pull" };
    const from = c.kind === "pull" ? chipAt(c.span[0])?.at ?? c.span[0] : c.span[0];
    const until = c.kind === "push" ? Math.max(c.span[1], chipAt(c.span[1] - 1)?.end ?? c.span[1]) : c.span[1];
    if (f >= from && f < until) {
      const e = zoomT(f, c.span[0], c.span[1]);
      return c.kind === "push" ? s(c.dz * zoomFrac(e, c.dz, CAP_R - c.dz)) : s(c.dz * (1 - zoomFrac(e, -c.dz, CAP_R)));
    }
  }
  return 1;
};

/** the question: "Is Tesla still a car company?" — SHORT lines (STYLE §16 2026-10-28, V20: never one wide line), the accent nearest the lens
 *  ("car" — the word the whole film turns on), the lower lines on near planes (words fly in from depth toward the block's centre) */
const QUESTION: TrackLine[] = [
  { idx: [0, 1], size: 96, weight: 500, z: 0 },                   // "Is Tesla"
  { idx: [2, 3], size: 88, weight: 500, z: 30 },                  // "still a"
  { idx: [4], size: 190, weight: 400, z: 70, accent: true },      // "car" — the accent
  { idx: [5], size: 104, weight: 800, z: 50 },                    // "company?"
];
if (HERO.length !== 6) throw new Error("the question has " + HERO.length + " words, the tracking text lays out 6");
const P = { heroEnd: HERO_LAST + 70, brand: HERO_LAST + 30 };
/** ★ (Timur, 2026-10-18: "at 1:08:11, some subtitle appears for a split second"): a chip that begins under the closing question never
 *  shows — "Tell us below." resurfaced for 2 f when the question's hold ended (2051–2052) */
const CHIPS_SHOWN = CHIPS_V.filter((w) => w.at < HERO[0].at - 3);
/** ★★ THE SONG FADES OUT SLOWLY AS THE BANKERS LOGO APPEARS (STYLE §11.3, 2026-10-15) */
const musicVol = (f: number) => (f < P.brand ? MUSIC_VOL : MUSIC_VOL * (1 - rInOut(f, P.brand, TOTAL_FRAMES - 1)));
/** the chips give way to the tracking text as its first word starts out of depth (track.tsx: at − 3) */
const HERO_ON = (() => {
  const a = HERO[0].at - 3, c = chipAt(a - 1);
  if (!c) return a;
  const last = CHIPS.find((w) => w.at === c.at)?.parts?.at(-1)?.at ?? c.at;
  return Math.min(Math.max(a, last + 8), c.end);
})();

/** ★ what Bankers/Resources/stylecheck.mjs reads (STYLE §15.1): the journey as the render runs it */
export const JOURNEY = { GRAMMAR: "flow" as const, PLACES, DUR_OF, MOVES, CAP, capScale, chipAt, CHIPS: CHIPS_V, ARRIVE, TRACK, THRU, PUSH_Z, SLIDE_X, CRANE_Y, TRUCK_DUR, CRANE_DUR, HERO_ON, TOTAL: TOTAL_FRAMES, KEYS, ARC, ARRIVAL_END: PLACES.map((_, i) => arrivalEnd(i)), CARRY, CAM: (f: number) => carryCam(f, camPath(CAM0, MOVES, f, false)),
  /** spans where a place carries its OWN camera (the hook follows its car: hook.tsx), so the house camera may hold */
  OWN_CAMERA: [[ARRIVE[1], PT0.whatA]] as Span[],
  /** where a scene's time starts for the 7-s rule: a carried hand-over's once the old place has gone */
  SCENE_FROM: { whatB: CARRY.start + CARRY.boardDur } as Partial<Record<PlaceId, number>>,
  /** the stations (scratchpad/carryview.mjs projects the carried hand-over's ramp and car through the real camera) */
  ST, boardOff };

// ══ SOUND (§2.5.3, §11) — the swoosh family on every camera move, a different one each time; context SFX in the places ══
const w = within({ at: 0, end: TOTAL_FRAMES });
const SWOOSH: { s: "swoosh" | "whooshlong" | "airwoosh" | "lowwoosh" | "whooshsoft"; peak: number; vol: number }[] = [
  // (Timur's Epidemic Sound set: each file's onset → peak gap, measured on the cuts — whooshlong 5, swoosh 12, airwoosh 9, lowwoosh 8,
  // whooshsoft 2)
  { s: "whooshlong", peak: 5, vol: 1.6 }, { s: "swoosh", peak: 12, vol: 1.5 }, { s: "airwoosh", peak: 9, vol: 0.8 },
  { s: "lowwoosh", peak: 8, vol: 1.1 }, { s: "whooshsoft", peak: 2, vol: 1.0 },
];
/** ★★ A PROCESS SOUND LASTS AS LONG AS ITS ANIMATION (STYLE §11.2) */
const FIT: [SfxName, number][] = [["datashort", 29], ["datamid", 48], ["data", 68]];
const SFX_SPANS: [number, number][] = [];
const proc = (from: number, to: number, vol: number): Cue[] => {
  SFX_SPANS.push([from, to]);
  const fit = FIT.find(([, L2]) => to - from <= L2);
  if (fit) return [w(fit[0], from, to, vol)];
  const out: Cue[] = [];
  for (let a = from; a < to - 6; a = Math.min(to, a + 64) - 6) out.push(w("data", a, Math.min(to, a + 64), vol * (out.length ? 0.85 : 1)));
  return out;
};
/** ★★ A MOVE'S WHOOSH PEAKS ON THE MOVE'S FASTEST FRAME (SETTLE peaks ~29% in), read off SETTLE itself */
const SETTLE_PEAK = (() => { let best = 0, a = 0.5; for (let k = 1; k <= 1000; k++) { const v = FAST(k / 1000) - FAST((k - 1) / 1000); if (v > best) { best = v; a = (k - 0.5) / 1000; } } return a; })();   // (the flow grammar's hand-overs run on FAST: it peaks ~39% in)
void INOUT;
/** a move's whoosh is moved off SETTLE's peak only where the picture is measured to move most elsewhere (scratchpad/whooshsync.py) */
const PEAK_SHIFT: Partial<Record<PlaceId, number>> = {
  // ★ measured with whooshsync on the flow grammar's every-frame sweep (2026-10-30): the picture moves most a little after the camera's own
  // FAST peak — most on a crane, where the content crosses the frame's height
  whatA: 10, whatB: -31, whatC: 9, whatD: 9, teachB2: 1, teachC: 17, teachD: -10, honestA: 6, honestB: -2, honestC: 6,   // (whatB: the carried move's picture peaks as the board drifts away)
};
const SWOOSH_OF: Partial<Record<PlaceId, (typeof SWOOSH)[number]>> = {
  // ★ the carried hand-over: the long one (the car rushing in); the travels soft or air
  whatB: { s: "whooshlong", peak: 5, vol: 1.0 },
  teachB2: { s: "airwoosh", peak: 9, vol: 0.7 },
  teachD2: { s: "whooshsoft", peak: 2, vol: 0.8 },
};
/** the places the whoosh CYCLE counts: the travels are left out, so the others keep alternating families */
const CYCLE_SKIP = new Set<PlaceId>(["whatB", "teachB2", "teachD2"]);
const CYCLED = PLACES.filter((p) => p.kind && !CYCLE_SKIP.has(p.id));
/** ★★ EVERY CONTEXT SOUND IS TIMED BY ITS ANIMATION'S OWN WINDOW (registry.tsx TIMES). `when(win, level, ease)`: the first frame the
 *  eased window reaches `level`. A landing's hit goes where the eye sees it ARRIVE: 0.4 of its OUT window. */
const when = (win: [number, number], level = 0.5, ease = rInOut) => {
  for (let f = Math.floor(win[0]); f <= Math.ceil(win[1]); f++) if (ease(f, win[0], win[1]) >= level) return f;
  return win[1];
};
const lands = (win: [number, number]) => when(win, 0.4, rOut);
/** ★ each file's ONSET → PEAK gap in frames (Timur's Epidemic Sound cuts): `peakAt(s, f)` puts the file's PEAK on frame f */
const PEAK_GAP: Partial<Record<SfxName, number>> = { whooshsoft: 2, whooshlong: 5, airwoosh: 9, lowwoosh: 8, swoosh: 12, sub: 6, flash: 1, coin: 1, click: 1 };
const peakAt = (sname: SfxName, f: number, end?: number, vol = 1) => w(sname, f - (PEAK_GAP[sname] ?? 0), end, vol);
void figLand; void proc;
/** ★ A PUSH'S WHOOSH PEAKS ON THE OUTGOING PLACE'S RUSH (STYLE §9.8): mid-dissolve */
const LIGHT_CUES: Cue[] = [];
const HK = TIMES.hook;
const MK = TIMES.marker, PF = TIMES.profile, TH = TIMES.thrusters, SP = TIMES.speedo, RV = TIMES.revenue, BR = TIMES.bars, WT = TIMES.worth;
const FU = TIMES.future, CM = TIMES.committee, FA = TIMES.faa, TL = TIMES.timeline, UN = TIMES.unsigned;
const mid = (q: [number, number]) => Math.round((q[0] + q[1]) / 2);
/** an in-out glide is fastest ~40% in (the carriage's rInOut) */
const FA_GLIDE_PEAK = (q: [number, number]) => q[0] + 0.4 * (q[1] - q[0]);
/** the camera's own whooshes: ARRIVE, every place's move (scratchpad/whooshsync.py judges these against the picture) */
const CAM_CUES: Cue[] = [
  w("whooshsoft", ARRIVE[0] + 1, ARRIVE[1] + 1, 0.6),   // from frame 0: the opening push is fastest on its first frames
  ...PLACES.filter((p) => p.kind).map((p) => {
    const i = CYCLED.indexOf(p); const m = SWOOSH_OF[p.id] ?? SWOOSH[Math.max(0, i) % SWOOSH.length]; const d = p.moves ? Math.max(...p.moves.map((x) => x.to)) : DUR_OF(p);
    const fast = Math.round(p.t0 + SETTLE_PEAK * d) + (PEAK_SHIFT[p.id] ?? 0);
    return w(m.s, fast - m.peak, p.t0 + d + 6, m.vol);
  }),
  // (no whoosh under the fly-through into the close — STYLE §16 2026-10-23)
];
/** ★ A RATTLE FOR EXACTLY ITS ANIMATION (bars climbing — the bike chain, STYLE §16 2026-10-18: audible over the bed) */
const CHAIN_LIFT = 7;
const rattle = (a: number, b: number, vol: number): Cue[] => {
  const out: Cue[] = [];
  for (let s0 = a; ; s0 += 24) {
    const c = w("chainshort", s0, b + 2, vol * CHAIN_LIFT * (out.length ? 0.9 : 1));
    out.push(c);
    if (c.at + (c.dur ?? 0) >= b || s0 > b) break;
  }
  if (Math.max(...out.map((c) => c.at + (c.dur ?? 0))) < b) throw new Error(`SFX: the rattle for ${a}–${b} stops early`);
  return out;
};
void rattle;
/** ★ the families' heard levels matched to Video 16's, measured from the rendered SFX stem (scratchpad/sfxlevels.py, 2026-10-28: flicks sat
 *  2.9 dB, pingshorts 2.7 and clicks 1.6 under Video 16's medians) */
const LEVEL: Partial<Record<SfxName, number>> = { flick: 1.4, pingshort: 1.36, click: 1.2 };
const CUES: Cue[] = [
  ...CAM_CUES,
  // ── context: ONLY actions visibly on screen (§2.5.3), each on its animation's own frames (registry.tsx TIMES), from Timur's Epidemic set ──
  // ★ the hook: its car sounds are REAL sounds in their own file (public/sfx21/hook.wav, played below — STYLE §16 2026-10-29: "the right
  // sound effects… subtle and in the background"): the electric whine up the ramp, the thrusters' cold-gas hiss, the landing thump, the
  // line-up's whir as it rolls away. The pack keeps only a soft low boom on the mid-air roll and the label's flick (no ping in the hook)
  peakAt("sub", Math.round((HK.flip[0] + HK.flip[1]) / 2), undefined, 0.2),
  w("flick", lands(HK.label), undefined, 0.4),
  // ── whatA: the event board — each word's lamps come up (a flick), the engraved T latches on (a click), the light crosses the panel ──
  w("flick", lands(MK.dateA), undefined, 0.34),
  w("flick", lands(MK.dateB), undefined, 0.3),
  w("flick", lands(MK.placeA), undefined, 0.32),
  w("flick", lands(MK.placeB), undefined, 0.3),
  w("click", MK.logo[0] + 4, undefined, 0.26),
  peakAt("whooshsoft", mid(MK.sweep), undefined, 0.3),
  // ── whatB: the stunt side-on — a long whoosh round the curl, a swoosh off the deck, a soft whoosh through the half-roll, the touchdown ──
  peakAt("whooshlong", PF.climb[1] - 4, PF.launch[1], 0.36),
  peakAt("whooshsoft", mid(PF.roll), undefined, 0.3),
  w("thud", PF.touchdown[0] + 2, undefined, 0.42),
  // ── whatC: the thrusters — the nozzles arm (click), the engraving inks (flicks); the jets' cold-gas hiss from the frame they fire, swelling
  // as they lift the car, is a real sound in its own file (public/sfx21/thrusters.wav, played below — STYLE §16 2026-10-29) ──
  w("click", TH.arm[0] + 10, undefined, 0.26),   // (mid-arm: at +4 it sat under the crane's swoosh peak)
  w("flick", lands(TH.inkLabel), undefined, 0.3),
  w("flick", lands(TH.inkMark), undefined, 0.3),
  // ── whatD: the speedometer — the backlight clicks on, the read-out COUNTS (data, the length of the sweep), 60 lands (ping), the plate ──
  w("click", SP.power[0] + 4, undefined, 0.24),
  ...proc(SP.count[0], SP.count[1], 0.12),
  w("pingshort", SP.count[1] - 1, undefined, 0.24),
  w("flick", lands(SP.plate), undefined, 0.34),
  // ── teachA: the turntable turns the tiny car (soft), its ring lights (click); the revenue's plate inks in (flick) ──
  peakAt("whooshsoft", mid(RV.turn), undefined, 0.26),
  w("click", RV.ring[0] + 4, undefined, 0.22),
  w("flick", lands(RV.plate), undefined, 0.36),
  // ── teachB: the bars — the bike chain under every climb, a flick per figure, a low whoosh as each shortfall draws, the verdicts ──
  ...rattle(BR.grow[0][0], BR.grow[1][1], 0.16),
  ...rattle(BR.grow[2][0], BR.grow[3][1], 0.16),
  // (the profit pair's figures, shortfall and −43% all land within ~6 f: its second figure and its shortfall play under the −43% ping — PILE)
  ...BR.fig.slice(0, 3).map((q) => w("flick", lands(q), undefined, 0.32)),
  peakAt("lowwoosh", mid(BR.gap[0]), undefined, 0.26),
  w("flick", lands(BR.verdict[0]), undefined, 0.36),
  w("pingshort", lands(BR.verdict[1]), undefined, 0.24),
  // ── teachC: the counter — the drums COUNT (data), they land (click), the label (flick), the ring light and glint (soft) ──
  ...proc(WT.count[0], WT.count[1], 0.12),
  w("click", WT.count[1], undefined, 0.28),
  w("flick", lands(WT.label), undefined, 0.34),
  peakAt("whooshsoft", mid(WT.light), undefined, 0.22),
  // ── teachD: today's cars — the lamps (click), the light dims (low); teachD2: the rims (ticks), the Cybercab glides in and stops,
  // the robot's hand and the Starship rise (swooshes), the Starship settles (sub) ──
  w("click", FU.lamps[0] + 4, undefined, 0.24),
  peakAt("lowwoosh", mid(FU.dim), undefined, 0.22),
  ...FU.rims.map((q) => w("tick", q[0] + 4, undefined, 0.5)),
  peakAt("whooshsoft", FU.cab[0] + 8, undefined, 0.3),   // (the car is fastest as it enters the frame, braking to its turntable)
  w("click", FU.cab[1], undefined, 0.22),
  peakAt("swoosh", mid(FU.hand), undefined, 0.3),
  w("click", FU.hand[1], undefined, 0.22),   // the hand seats on its turntable
  peakAt("swoosh", mid(FU.ship), undefined, 0.3),
  peakAt("sub", FU.ship[1] - 2, undefined, 0.2),
  // ── teachE: the two folders slide together (soft) and stop with their gap (click) ──
  peakAt("whooshsoft", mid(CM.slide), undefined, 0.28),
  w("click", CM.slideR[1], undefined, 0.26),
  // ── honestA: the aircraft's outline draws round the car (soft, long), it lights on "aircraft" (the verdict: a low whoosh) ──
  peakAt("whooshsoft", mid(FA.draw), undefined, 0.22),
  peakAt("lowwoosh", FA.lit[1] - 4, undefined, 0.3),
  // ── honestB: the carriage glides along the rail (soft), passes 2027 (tick), seats at 2028 (click); PRODUCTION lands (flick) ──
  peakAt("whooshsoft", Math.round(FA_GLIDE_PEAK(TL.glide)), undefined, 0.28),
  w("tick", Math.round(TL.glide[0] + 0.45 * (TL.glide[1] - TL.glide[0])), undefined, 0.45),
  w("click", TL.seat, undefined, 0.28),
  // (PRODUCTION lands as the carriage seats: the click carries both — PILE)
  // ── honestC: a light runs along each empty signature line (very quiet) ──
  peakAt("whooshsoft", mid(UN.lineL), undefined, 0.18),
  peakAt("whooshsoft", mid(UN.lineR), undefined, 0.18),
  // ── the question: each line flies in from depth on its first word (track.tsx: at − 3) ──
  ...QUESTION.map((l) => w("flick", HERO[l.idx[0]].at + 2, undefined, 0.5)),
].map((c) => (LEVEL[c.s] ? { ...c, vol: (c.vol ?? 1) * (LEVEL[c.s] ?? 1) } : c));   // (untouched cues keep their identity: sfxsheet marks the CAM ones by it)
// ★ the check: the hook's and the thrusters' baked sound files were built on THESE frames — if a window moves, re-run
// scratchpad/mkhooksfx21.py with the new ones (fails the bundle, so a sound can never drift off its motion)
{
  const built = { ...HOOK_SFX_BUILT, ...THRUSTER_SFX_BUILT };
  const now = { leave: HK.leave, jets0: HK.jets[0], jets1: HK.jets[1], land: HK.land, drive0: HK.drive[0], fire0: TH.fire[0], swell0: TH.swell[0], lift1: TH.lift[1] };
  for (const [k, v] of Object.entries(now)) if (built[k as keyof typeof built] !== v) throw new Error(`SFX: public/sfx21 was built with ${k} = ${built[k as keyof typeof built]}, the film now has ${v} — re-run scratchpad/mkhooksfx21.py`);
}
// ★ the check: every process window is covered, start to end, by the cues proc() made for it (fails the bundle)
for (const [a, b] of SFX_SPANS) {
  const cov = CUES.filter((c) => c.s.startsWith("data") && c.at <= b && c.at + (c.dur ?? 0) >= a).reduce((m, c) => Math.max(m, c.at + (c.dur ?? 0)), -Infinity);
  if (cov < b - 1) throw new Error(`SFX: the process sound for frames ${a}–${b} stops at ${cov} — shorter than its animation; refusing`);
}
// (★ NO SYNTHESIZED SOUND EFFECTS — STYLE §16 2026-10-20; the library is Timur's Epidemic set — 2026-10-23)
/** what scratchpad/sfxsheet.mjs reads: the score as the render plays it */
export const SFX_SHEET = { CUES, SPANS: SFX_SPANS, CAM: CAM_CUES, LIGHT: LIGHT_CUES };

export const TeslaFlyingRoadster: React.FC<{ solo?: Solo; probe?: boolean }> = ({ solo, probe }) => {
  const f = useCurrentFrame();
  const play = (k: Exclude<Solo, undefined>) => !solo || solo === k;

  // the white places: the stage floods as the camera travels in and drains as it travels out (a white run never dips between its places)
  let fieldLight = 0;
  PLACES.forEach((p, i) => {
    if (!p.white || PLACES[i - 1]?.white) return;
    let j = i;
    while (PLACES[j + 1]?.white) j++;
    // (the Style 3 films: the stage dissolves to white WHILE the camera moves into the place — about the move's middle — and back across its exit)
    const inA = p.t0 + (p.whiteIn ?? Math.round(DUR_OF(p) * 0.2)), next = PLACES[j + 1];
    const outA = next ? next.t0 + Math.round(DUR_OF(next) * 0.2) : Infinity;
    fieldLight = Math.max(fieldLight, rInOut(f, inA, inA + 26) - (outA === Infinity ? 0 : rInOut(f, outA, outA + 26)));
  });
  fieldLight = clamp01(fieldLight);
  // the caption ink and the watermark read the stage AND the lens bloom together (Style 3: 1 − (1 − stage)(1 − flare))
  const flr = 0;
  const lit = 1 - (1 - fieldLight) * (1 - flr);
  const capLight = lit >= 0.5 ? 1 : 0;

  const camBase = camPath(CAM0, MOVES, f), cam = carryCam(f, camBase);
  const heroOn = f >= HERO_ON && f < P.heroEnd;
  const turn = turnAt(f);
  const turnCss = Math.abs(turn.yaw) + Math.abs(turn.pitch) < 0.005 ? undefined : `perspective(1400px) rotateY(${turn.yaw.toFixed(3)}deg) rotateX(${turn.pitch.toFixed(3)}deg)`;
  // ★ each place's own light, travelling with it (lightsAt): its lift (alternating sides) and its key cone
  const lights = lightsAt(f, cam);

  // ── the layers: each place's MID, mounted from its hand-over to the end of the next one ──
  const camND = carryCam(f, camPath(CAM0, MOVES, f, false));
  const drift: V3 = { x: cam.x - camND.x, y: cam.y - camND.y, z: cam.z - camND.z };
  const leaveOf = (q?: Place) => (q?.kind ? q.t0 + DUR_OF(q) + 4 : THRU[1] + 12);
  const endOf = (q?: Place) => (q?.kind ? q.t0 + DUR_OF(q) : THRU[1]);
  const layers: LayerSpec[] = [];
  PLACES.forEach((p, i) => {
    const next = PLACES[i + 1];
    const from = i === 0 ? -100 : p.t0 - 10;
    const after = p.keepMid ? PLACES[i + 1 + p.keepMid] : next;
    const fgAfter = p.keepFg ? PLACES[i + 1 + p.keepFg] : next;
    const until = leaveOf(fgAfter);
    const untilMid = leaveOf(after);
    if (f < from || f >= untilMid) return;
    const endAt = endOf(after);
    // (the hook's opening push starts it 1.5 away: the default far fade [1.25, 1.5] would hide it on frame 0)
    const farMid: [number, number] | undefined = i === 0 ? [2.2, 3.2] : p.keepMid ? [2.2, 3.2] : [1.8, 2.8];
    const parts = PLACE_PARTS[p.id];
    const revealOp = p.kind === "carry" && f < CARRY.end ? carryReveal(f) : 1;   // (the carried place waits for the board: carryReveal)
    const ctx = { f, light: fieldLight, t0: p.t0, end: endAt, exit: next?.t0, leave: after?.t0 };
    const mid = parts?.mid?.(ctx);
    const spans = p.keepMid ? PLACES.slice(i + 1, i + 1 + p.keepMid).filter((q) => f >= q.t0) : [];
    const curSpan = spans.at(-1), prevSpan = spans.at(-2);
    const also = curSpan ? [curSpan.id, ...(prevSpan && f < curSpan.t0 + DUR_OF(curSpan) + 4 ? [prevSpan.id] : [])].join(" ") : undefined;
    const tag = (n: React.ReactNode) => (also ? <div data-probe-also={also} style={{ position: "absolute", inset: 0 }}>{n}</div> : n);
    for (const pl of parts?.planes?.(ctx) ?? []) {
      layers.push({ id: `${p.id}:${pl.key}`, st: ST[p.id], R: pl.R, op: revealOp, cam: pl.pinXY ? { x: ST[p.id].x + drift.x, y: ST[p.id].y + drift.y, z: cam.z } : undefined,
        far: farMid, node: tag(pl.node) });
    }
    const kNow = (ST[p.id].z + MID - cam.z) / MID;
    const k0 = (ST[p.id].z + MID - at(THRU[0]).z) / MID;
    const pass = f >= THRU[0] && k0 > 0.4 ? clamp01((kNow - 0.35) / (k0 - 0.35)) : 1;
    // ★ the board does NOT take the carry’s close-in (2026-10-31: the camera now closes in on the car’s lane while the board is still
    // leaving, and with it the board swelled ~1.5× on its way out — a zoom-in transition, which Timur banned). Its station rides the carry’s
    // depth and height, so it keeps its size and level and only slides left.
    const stP = p.id === "whatA" ? { x: ST.whatA.x + boardOff(f), y: ST.whatA.y + (cam.y - camBase.y), z: ST.whatA.z + (cam.z - camBase.z) } : ST[p.id];
    if (mid) layers.push({ id: `${p.id}:mid`, st: stP, R: MID, op: pass * revealOp, far: farMid, node: tag(mid) });
    if (f >= until) return;
    const fg = parts?.fg?.({ f, light: fieldLight, t0: p.t0, end: endAt });
    if (fg) layers.push({ id: `${p.id}:fg`, st: ST[p.id], R: FG, op: revealOp, node: fg });
  });
  // the close: small and sharp behind the question as it lifts away; it waits for the gap (demo §2.5.2)
  const dolly = 240 * rInOut(f, TRACK[0], TRACK[1]) + 220 * rIn(f, THRU[0], THRU[0] + 32);
  const lift = 1800 * rInOut(f, ...LIFT);
  const hold = rInOut(f, TRACK[0], THRU[0] + 8);
  const heroBlur = 6 * rIn(f, THRU[0] + 6, THRU[0] + 30);
  const kE = (ST_OUTRO.z + MID - cam.z) / MID;
  const logoTop = 960 - 94 * (1 / Math.max(kE, 0.2)) * (0.84 + 0.16 * rOut(f, P.brand, P.brand + 44));
  const textBottom = trackBottom(HERO, QUESTION, 900, dolly, lift);
  const logoGate = f >= P.heroEnd ? 1 : rInOut(clamp01((logoTop - 24 - textBottom) / 260), 0, 1);
  if (f >= THRU[0] - 4) layers.push({ id: "outro:mid", st: ST_OUTRO, R: MID, op: logoGate, far: [1.5, 2.0], node: <BrandClose at={P.brand} /> });

  const cs = capScale(f);
  const logoY = (1 - rOut(f, 0, 26)) * 210 + rIn(f, THRU[0], THRU[0] + 26) * 210 + drift2(f, 190, 77, 2);

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg, overflow: "hidden" }}>
      {HAS_VO && play("vo") && (
        <>
          <Sequence from={VO_LEAD} durationInFrames={VO_CUT}><Audio src={staticFile("vo_trimmed.wav")} volume={1} /></Sequence>
          <Sequence from={VO_LEAD + VO_CUT + VO_GAP}><Audio src={staticFile("vo_trimmed.wav")} startFrom={VO_CUT} volume={1} /></Sequence>
        </>
      )}
      {(HAS_SFX || SFX_PREVIEW) && play("sfx") && <SfxLayer cues={CUES} total={VIDEO_FRAMES} />}
      {/* ★ the hook's and the thrusters' REAL sounds (scratchpad/mkhooksfx21.py: levels and fades baked in, one gain) */}
      {(HAS_SFX || SFX_PREVIEW) && play("sfx") && <Sequence from={0} durationInFrames={330}><Audio src={staticFile("sfx21/hook.wav")} volume={1} /></Sequence>}
      {(HAS_SFX || SFX_PREVIEW) && play("sfx") && <Sequence from={THRUSTER_SFX_BUILT.fire0} durationInFrames={130}><Audio src={staticFile("sfx21/thrusters.wav")} volume={1} /></Sequence>}
      {HAS_MUSIC && play("music") && <Audio src={staticFile(MUSIC_SRC)} startFrom={Math.round(MUSIC_FROM_S * 30)} volume={musicVol} />}

      {/* ★ the ground, and each place's OWN light travelling with it (lightsAt — STYLE §16 2026-10-30): the lift on its side, the key cone */}
      <Field light={fieldLight} lightX={50} lightY={-60} />
      {lights.map((l) => {
        const q = PLACES[l.i], side = l.i % 2 ? 66 : 24;
        const lift = mixHex(theme.bgLift, theme.bgLightLift, fieldLight);
        return (
          <div key={`lt${l.i}`} data-probe-skip style={{ position: "absolute", left: -1600, top: -1600, width: 1080 + 3200, height: 1920 + 3200, opacity: l.o,
            transform: `translate(${l.dx.toFixed(2)}px, ${l.dy.toFixed(2)}px)`,
            background: `radial-gradient(1296px 1536px at ${(1600 + 10.8 * side).toFixed(1)}px ${(1600 + 230).toFixed(1)}px, ${alpha(lift, 0.95)} 0%, ${alpha(lift, 0.42)} 16%, ${alpha(lift, 0)} 34%)` }}>
            {/* (drawn in the oversized layer itself: KeyLight clips to its own box, which showed as a hard edge when the light travelled) */}
            {fieldLight < 0.995 && <KeyLight at={0} x={q.key.x + 1600} y={q.key.y + 1600} angle={q.key.angle} len={2200} spread={520} strength={0.35 * (1 - fieldLight)} />}
          </div>
        );
      })}

      {/* ★ THE WORLD IS ITS OWN STACKING CONTEXT (STYLE §5.4a): every depth layer stays below the text above it */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, transformOrigin: "540px 883px", transform: turnCss }}>
        <World cam={cam} layers={layers} />
      </div>

      <div data-probe-group="caption" style={{ position: "absolute", inset: 0, transformOrigin: "540px 291px", transform: cs !== 1 ? `scale(${cs.toFixed(5)})` : undefined }}>
        {!heroOn && <WordCaption words={CHIPS_SHOWN} onLight={capLight} />}
      </div>
      <div data-probe-group="hero" data-blur={heroBlur.toFixed(2)} data-exiting={lift > 1 ? "1" : "0"} style={{ position: "absolute", inset: 0, filter: heroBlur > 0.2 ? `blur(${heroBlur.toFixed(2)}px)` : undefined }}>
        <TrackText words={HERO} lines={QUESTION} y={900} dolly={dolly} hold={hold} end={P.heroEnd} lift={lift} />
      </div>

      {/* §2.5.4: the watermark — 30%, the black file on the white stage */}
      {logoY < 205 && (
        <div data-probe-group="logo" style={{ position: "absolute", left: 540 - 65, top: 1745 - 20 + logoY, width: 130, height: 130 / (530.2 / 160), opacity: 0.3 }}>
          <Img src={staticFile("brand/bankers-logo-white.svg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 1 - lit }} />
          <Img src={staticFile("brand/bankers-logo-black.svg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: lit }} />
        </div>
      )}
      {probe && <Probe />}
    </AbsoluteFill>
  );
};
