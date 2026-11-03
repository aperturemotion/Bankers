import React from "react";
import { CUE, SECT, SENTENCES, HERO } from "../captions";
import { Hook, hookTimes } from "./hook";
import { Marker, markerTimes } from "./marker";
import { Profile, profileTimes } from "./profile";
import { Thrusters, thrustersTimes } from "./thrusters";
import { Speedo, speedoTimes } from "./speedo";
import { Revenue, revenueTimes } from "./revenue";
import { Bars, barsTimes } from "./bars";
import { Worth, worthTimes } from "./worth";
import { Future, futureTimes } from "./future";
import { Committee, committeeTimes } from "./committee";
import { Faa, faaTimes } from "./faa";
import { Timeline, timelineTimes } from "./timeline";
import { Unsigned, unsignedTimes } from "./unsigned";
import { RoadsterLab } from "../RoadsterLab";
import { LineupLab } from "../LineupLab";

// each place's MID construction (Video 21's 3-D places carry their own rig, as Video 16's did).
/** `exit`: the next place's first frame */
type Ctx = { f: number; light: number; t0: number; end: number; exit?: number; leave?: number };
export type Plane = { key: string; R: number; node: React.ReactNode; pinXY?: boolean };
type Parts = { mid?: (c: Ctx) => React.ReactNode; planes?: (c: Ctx) => Plane[]; fg?: (c: Ctx) => React.ReactNode; fgSide?: "left" | "right"; frame?: (c: Ctx) => React.ReactNode };

const sentAt = (re: RegExp) => { const s = SENTENCES.find((x) => re.test(x.text)); if (!s) throw new Error(`registry: no sentence ${re}`); return s; };

export const HOOK_CUES = { tesla: CUE.tesla, built: CUE.built, car: CUE.car, jumps: CUE.jumps, over: CUE.over, cars: CUE.cars, elon: CUE.elon,
  musk: CUE.musk, calls: CUE.calls, best: CUE.best, last: CUE.last, human: CUE.human, driven: CUE.driven };
const HK = hookTimes(HOOK_CUES);

/** ★ EVERY PLACE'S FIRST FRAME, ONE COPY (Video.tsx's PLACES and every construction's windows read these). Each opens on its own sentence
 *  and WAITS for the last action (`done`) of the place it leaves (root CLAUDE.md, VO pipeline step 7): Math.max(lead, done). */
// the hook's pull-back (the payoff, "…the best of the last human-driven cars."), as line two begins
const hookB = SENTENCES[1].at - 4;
// ★ the hook's exit FOLLOWS THE ROADSTER into scene two (the brief), once the payoff has read ≥ 1 s in the full frame
const whatA = Math.max(SECT.what.at - 12, HK.done + 30);
const MK = (arrive: number) => markerTimes({ arrive, october: CUE.october, d15: CUE.d15, waco: CUE.waco, texas: CUE.texas, showed: CUE.showed, roadster: CUE.roadster, end: 0 });
// ★ the CARRIED hand-over (Timur, 2026-10-30): it starts as the board's sweep finishes (the board drifts away slowly), so the camera can
// pick up the car on its run-up and follow it in; the curl comes into view as it climbs on "It climbed"
const whatB = MK(whatA).done - 15;
const PF = (arrive: number) => profileTimes({ arrive, climbed: CUE.climbed, upside: CUE.upside, ramp: CUE.ramp, flipped: CUE.flipped, midair: CUE.midair, landed: CUE.landed, wheels: CUE.wheels, end: 0 });
const whatC = Math.max(sentAt(/^Then compressed/).at - 12, PF(whatB).done + 6);
const TH = (arrive: number) => thrustersTimes({ arrive, compressed: CUE.compressed, thrusters: CUE.thrusters, developed: CUE.developed, spacex: CUE.spacex, lifted: CUE.lifted, row: CUE.row, teslas: CUE.teslas, end: 0 });
const whatD = Math.max(sentAt(/^Tesla says it goes/).at - 12, TH(whatC).done + 6);
const SP = (arrive: number) => speedoTimes({ arrive, says: CUE.says, zero: CUE.zero, sixty: CUE.sixty, under: CUE.under, second: CUE.second, end: 0 });
// the push into the teach: "Here's the strange part."
const teachA = Math.max(SECT.teach.at - 12, SP(whatD).done + 6);
const RV = (arrive: number) => revenueTimes({ arrive, strange: CUE.strange, even: CUE.even, roadsterB: CUE.roadsterB, revenue: CUE.revenue, much: CUE.much, end: 0 });
const teachB = Math.max(sentAt(/car business is shrinking/).at - 12, RV(teachA).done + 6);
// the travel from the deliveries pair to the profit pair, on "profit"
const teachB2 = CUE.profit - 16;
const BR = (arrive: number) => barsTimes({ arrive, business: CUE.business, shrinking: CUE.shrinking, july: CUE.july, deliveries: CUE.deliveries, p2: CUE.p2, profit: CUE.profit, p43: CUE.p43, end: 0 });
const teachC = Math.max(sentAt(/^Yet Tesla is worth/).at - 12, BR(teachB).done + 4);
const WT = (arrive: number) => worthTimes({ arrive, yet: CUE.yet, worth: CUE.worth, t16: CUE.t16, trillion: CUE.trillion, end: 0 });
const teachD = Math.max(sentAt(/^Investors aren't/).at - 12, WT(teachC).done + 4);
// ★ the ONE light frame: the travel onto what comes next (robotaxis, robots, maybe SpaceX), on "They're paying"
const teachD2 = sentAt(/^They're paying/).at - 12;
const FU = (arrive: number) => futureTimes({ arrive, investors: CUE.investors, paying: CUE.paying, today: CUE.today, next: CUE.next, robotaxis: CUE.robotaxis, robots: CUE.robots, maybe: CUE.maybe, spacexB: CUE.spacexB, end: 0 });
const teachE = Math.max(sentAt(/^Musk has said both/).at - 12, FU(teachD).done + 4);
const CM = (arrive: number) => committeeTimes({ arrive, committees: CUE.committees, merger: CUE.merger, end: 0 });
// the push into the honest part (back to the navy): THE SPINE RETURNS
const honestA = Math.max(SECT.honest.at - 10, CM(teachE).done + 6);
const FA = (arrive: number) => faaTimes({ arrive, honest: CUE.honest, faa: CUE.faa, definition: CUE.definition, aircraft: CUE.aircraft, end: 0 });
const honestB = Math.max(sentAt(/^Production/).at - 12, FA(honestA).done + 4);
const TL = (arrive: number) => timelineTimes({ arrive, production: CUE.production, y2028: CUE.y2028, end: 0 });
const honestC = Math.max(sentAt(/^And no merger/).at - 12, TL(honestB).done + 4);
// the question's slide carries the last place clear of the frame before the first word's ink (STYLE §9.8)
const question = HERO[0].at - 27;
export const T0 = { hookA: 0, hookB, whatA, whatB, whatC, whatD, teachA, teachB, teachB2, teachC, teachD, teachD2, teachE, honestA, honestB, honestC, question } as const;

export const MK_CUES = { arrive: whatA, october: CUE.october, d15: CUE.d15, waco: CUE.waco, texas: CUE.texas, showed: CUE.showed, roadster: CUE.roadster };
export const PF_CUES = { arrive: whatB, climbed: CUE.climbed, upside: CUE.upside, ramp: CUE.ramp, flipped: CUE.flipped, midair: CUE.midair, landed: CUE.landed, wheels: CUE.wheels };
export const TH_CUES = { arrive: whatC, compressed: CUE.compressed, thrusters: CUE.thrusters, developed: CUE.developed, spacex: CUE.spacex, lifted: CUE.lifted, row: CUE.row, teslas: CUE.teslas };
export const SP_CUES = { arrive: whatD, says: CUE.says, zero: CUE.zero, sixty: CUE.sixty, under: CUE.under, second: CUE.second };
export const RV_CUES = { arrive: teachA, strange: CUE.strange, even: CUE.even, roadsterB: CUE.roadsterB, revenue: CUE.revenue, much: CUE.much };
export const BR_CUES = { arrive: teachB, business: CUE.business, shrinking: CUE.shrinking, july: CUE.july, deliveries: CUE.deliveries, p2: CUE.p2, profit: CUE.profit, p43: CUE.p43 };
export const WT_CUES = { arrive: teachC, yet: CUE.yet, worth: CUE.worth, t16: CUE.t16, trillion: CUE.trillion };
export const FU_CUES = { arrive: teachD, investors: CUE.investors, paying: CUE.paying, today: CUE.today, next: CUE.next, robotaxis: CUE.robotaxis, robots: CUE.robots, maybe: CUE.maybe, spacexB: CUE.spacexB };
export const CM_CUES = { arrive: teachE, committees: CUE.committees, merger: CUE.merger };
export const FA_CUES = { arrive: honestA, honest: CUE.honest, faa: CUE.faa, definition: CUE.definition, aircraft: CUE.aircraft };
export const TL_CUES = { arrive: honestB, production: CUE.production, y2028: CUE.y2028 };
export const UN_CUES = { arrive: honestC, terms: CUE.terms, agreed: CUE.agreed };

/** ★ every animation window the SFX score times itself to, built from the SAME helpers and the SAME cue words the places below are given —
 *  ONE copy, so a sound can never drift from its motion (Bankers STYLE §11.2) */
export const TIMES = {
  hook: HK,
  marker: markerTimes({ ...MK_CUES, end: 0 }),
  profile: profileTimes({ ...PF_CUES, end: 0 }),
  thrusters: thrustersTimes({ ...TH_CUES, end: 0 }),
  speedo: speedoTimes({ ...SP_CUES, end: 0 }),
  revenue: revenueTimes({ ...RV_CUES, end: 0 }),
  bars: barsTimes({ ...BR_CUES, end: 0 }),
  worth: worthTimes({ ...WT_CUES, end: 0 }),
  future: futureTimes({ ...FU_CUES, end: 0 }),
  committee: committeeTimes({ ...CM_CUES, end: 0 }),
  faa: faaTimes({ ...FA_CUES, end: 0 }),
  timeline: timelineTimes({ ...TL_CUES, end: 0 }),
  unsigned: unsignedTimes({ ...UN_CUES, end: 0 }),
};

export const PLACE_PARTS: Record<string, Parts> = {
  hookA: { mid: (c) => <Hook c={HOOK_CUES} end={c.end} /> },
  hookB: {},        // the camera's pull-back as the line-up drives off by itself (the hook's payoff)
  whatA: { mid: (c) => <Marker {...MK_CUES} end={c.end} /> },
  whatB: { mid: (c) => <Profile {...PF_CUES} end={c.end} /> },
  whatC: { mid: (c) => <Thrusters {...TH_CUES} end={c.end} /> },
  whatD: { mid: (c) => <Speedo {...SP_CUES} end={c.end} /> },
  teachA: { mid: (c) => <Revenue {...RV_CUES} end={c.end} light={c.light} /> },
  teachB: { mid: (c) => <Bars {...BR_CUES} end={c.end} /> },
  teachB2: {},      // the travel from the deliveries pair to the profit pair
  teachC: { mid: (c) => <Worth {...WT_CUES} end={c.end} /> },
  teachD: { mid: (c) => <Future {...FU_CUES} end={c.end} light={c.light} /> },
  teachD2: {},      // the travel (onto the white stage) to what comes next
  teachE: { mid: (c) => <Committee {...CM_CUES} end={c.end} /> },
  honestA: { mid: (c) => <Faa {...FA_CUES} end={c.end} /> },
  honestB: { mid: (c) => <Timeline {...TL_CUES} end={c.end} light={c.light} /> },
  honestC: { mid: (c) => <Unsigned {...UN_CUES} end={c.end} light={c.light} /> },
  // ── look-lab only (never a place of the film: sweep.mjs reads the places from Video.tsx's PLACES): the Roadster at its poses ──
  rdSide: { mid: () => <RoadsterLab view="side" /> },
  rdThreeQ: { mid: () => <RoadsterLab view="threeq" /> },
  rdRear: { mid: () => <RoadsterLab view="rear" /> },
  rdRoll: { mid: () => <RoadsterLab view="roll" /> },
  rdUnder: { mid: () => <RoadsterLab view="under" /> },
  rdFront: { mid: () => <RoadsterLab view="front" /> },
  rdWheel: { mid: () => <RoadsterLab view="wheel" /> },
  // the line-up's cars (LineupLab.tsx)
  luRow: { mid: () => <LineupLab view="row" /> },
  luModel3: { mid: () => <LineupLab view="close" model="model3" /> },
  luModelY: { mid: () => <LineupLab view="close" model="modely" /> },
  luSemi: { mid: () => <LineupLab view="close" model="semi" /> },
  luTruck: { mid: () => <LineupLab view="close" model="cybertruck" /> },
  luCab: { mid: () => <LineupLab view="close" model="cybercab" /> },
};
