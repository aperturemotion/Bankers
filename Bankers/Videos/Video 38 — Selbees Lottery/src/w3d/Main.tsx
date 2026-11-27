// @ts-nocheck
// ★ V38 "The Couple Who Beat the Lottery" — the film in the BANKERS 3-D WORLD style (Timur, 2026-11-25).
//   ONE WebGL world (blue-hour Michigan → the road → Boston), ONE continuous camera assembled from the stations' shots, the HTML
//   annotation layer pinned to world points, the karaoke caption, the Bankers watermark and the BANKER$ close; voice, song, effects.
//   Station contract (src/w3d/st_<id>.tsx): export const ST = { id, origin:[x,y,z], from, to,           // frames it is mounted
//     shots: () => [{ a, b, pos, target, fov?, arc? }],   // WORLD coordinates (add origin), arrival first
//     Scene: ({ f }) => <R3F group content in the station's LOCAL coords>,
//     Overlay: ({ f, P }) => <HTML; P(localPoint) → screen {x,y} through the live camera>,
//     sfx: () => [cueAt(...)] }
import React from "react";
import { AbsoluteFill, Audio, Sequence, useCurrentFrame } from "remotion";
import { aud } from "../bnx/aud";
import { World3D, makeCam, smoothCam, projectWith, HouseLights, ease } from "./kit";
import { Karaoke } from "./karaoke";
import { BigWord } from "./overlays";
// ★ rev 6: the BIG WORDS — the film's key figures (and "Legally.") as large Anton text, no panel, no label (overlays.tsx BigWord). Keyed to
//   the karaoke chips' keywords in REAL time; in from the word's onset − 4, out at the chip's end. $3,600 / $6,300 stay the kitchen's 3-D plaques.
const BIG_SPEC = {
  /* "1,903" is said by the scene's own EVART sign (POP. 1,903) — no big word over it */ "Legally.": { text: "LEGALLY" }, "9 years.": { value: 9, unit: "YEARS" }, "2003,": { text: "2003" },
  "3 minutes.": { value: 3, unit: "MINUTES" }, "$5 million": { value: 5, prefix: "$", unit: "MILLION" }, "12": { value: 12, unit: "ROLL-DOWNS" },
  "6 years,": { value: 6, unit: "YEARS" }, "900 miles": { value: 900, unit: "MILES" }, "$600,000.": { value: 600000, prefix: "$", size: 230 },
  "2011,": { text: "2011" }, "$120 million": { value: 120, prefix: "$", unit: "MILLION" }, "$26 million,": { value: 26, prefix: "$", unit: "MILLION", size: 250 },
  "$8 million": { value: 8, prefix: "$", unit: "MILLION" }
};
// rev 7 (Timur, 2026-11-27): "instead of on-screen text like $5 million … just add them somewhere within the scene that actually matches the
//   visual itself" — the big words are OFF; every figure now lives IN its scene (each station draws its own, on its spoken word).
const BIG_ON = false;
const BIG = !BIG_ON ? [] : CHIPS.flatMap((c) => c.parts.filter((p) => BIG_SPEC[p.word]).map((p) => ({ ...BIG_SPEC[p.word], at: p.at - 4, out: Math.max(p.at + 34, c.until - 2) })));
import { CHIPS, TOTAL, VO_END } from "./take_rt";   // rev 4c: REAL time — the voice, the karaoke, the close
import { HOOK_SHIFT as S, HOOK_ID } from "./shift";
import { BrandClose, Watermark } from "../bnx/close";
import { SfxLayer, cueAt } from "../bnx/SfxLayer";
import { STATIONS } from "./stations";
import { TOTAL_PUSH_END } from "./st_total";

export const CLOSE_AT = VO_END + 12;          // the close begins after the last line's breath
// ★ the song (Timur, 2026-11-26: "change the song to the video about Nvidia sold … billion of chips in 3 months" = Video 34 "Nvidia Keeps",
//   whose bed was 711): the file as he gave it (public/711.mp3, the copy Videos 11–16 used), ONE volume for the whole film (STYLE 11.3,
//   2026-10-15 / 10-22), started so its big drop (117.38 s in the source) lands on "In 2003," (frame 212); the volume matches the FOCUS
//   bed it replaces as heard (both −24.8 LUFS over the body: the 711 body is −10.1 LUFS at 1.0 → 0.18)
const BED_FILE = "711.mp3";
const BED_START = 3308 - S;   // rev 4c: the drop still lands on "In 2003" (now real frame 255)
const BED_START_TAKE_B = 3308;     // frames into the source: 110.27 s → the drop at 117.38 s plays at 7.11 s (frame 213), on "In" (212)
const BED_VOL = 0.18;
// rev 4c: every station but the hook is authored in STORY time (real − S): its shots move by +S
const real = (s) => (sh) => (s.id === HOOK_ID ? sh : { ...sh, a: sh.a + S, b: sh.b + S });
const shotsAll = STATIONS.flatMap((s) => s.shots().map(real(s))).sort((p, q) => p.a - q.a);
const story = (s, f) => (s.id === HOOK_ID ? f : Math.max(0, f - S));   // the frame a station is handed
// the camera's final move: up and away into the navy sky as the close comes in (the world falls away under BANKER$)
const lastShot = shotsAll[shotsAll.length - 1];
// rev 5 (builder S): the lift keeps the last subject (the lit storefront) in frame: a slow rise and pull back, the store sinking into the fog under BANKER$
const OUTRO = { a: CLOSE_AT + 32, b: CLOSE_AT + 96,
   pos: [lastShot.pos[0], lastShot.pos[1] + 9, lastShot.pos[2] + 3], target: [lastShot.target[0], lastShot.target[1] + 0.5, lastShot.target[2]], fov: lastShot.fov ?? 40 };
export const CAM_RAW = makeCam([...shotsAll, OUTRO]);
// one continuous glide (kit.smoothCam). rev 3 (Timur, 2026-11-26: "smoothen the camera move as much as you can … really pleasant"):
//   SIGMA 14 → CAM_SIGMA; shots flagged `raw` (a move threading an opening) stay as authored
export const CAM_SIGMA = 14;
export const CAM = smoothCam(CAM_RAW, TOTAL, shotsAll.filter((s) => s.cut).map((s) => s.a), CAM_SIGMA, 24, shotsAll.filter((s) => s.raw).map((s) => [s.a - 2, s.b + 2]));
// ★ CROSS-DISSOLVES (rev 3; the reference style's 0.2–0.5 s dissolve, CLAUDE.md 3-D World §B6): Timur on the 24 s flight to the kitchen —
//   "it looks a bit weird … a lot of changes at the same time. Make it more aesthetic and more clean and smooth". The incoming station
//   cuts in at `at` (its first shot is cut: true); for HALF frames either side a SECOND canvas renders the other station with its own
//   camera (the outgoing one still drifting on its own last shot, the incoming one held on its first pose, which it leaves from rest),
//   and the two pictures cross-fade on a smootherstep. The 70 s window → brochure cut became one too (it pushed through the pane onto
//   the blank back wall: 8 grey frames).
const HALF = 7;
// rev 5 (builder Q): rolldown → test is a MATCH CUT on Jerry's ticket stack now (st_test TEST_ARRIVE "match"), not a dissolve
// rev 5: no dissolves left — rolldown → test is a match cut (builder Q), total → rules a crane over the roof (builder S)
export const DISSOLVES = [].map((d) => ({
  ...d, camPre: makeCam([...shotsAll.filter((s) => s.a < d.at), OUTRO].filter((s) => s.a < d.at)), camPost: makeCam(shotsAll.filter((s) => s.a >= d.at))
}));
const dissolveAt = (f) => DISSOLVES.find((d) => f >= d.at + 1 - HALF && f < d.at + 1 + HALF);   // a cut shot at `at` lands on at + 1
// the store's push INTO the leaflet's bright diagram cuts to the dark coin wall (measured 159 → 102 mean levels at 480 → 481)
const CUT_FLASH = [{ at: 481 + S, o: 0.58, dur: 16, color: "#C8DBF4" }, { at: 883 + S, o: 0.25, dur: 14, color: "#EEF3FA" }];   // story 481 / 883   // 883: the $1's seal → the gold seal, matched in place (rev 2: 165.6 → 139 without flash; 0.25 evens it, builder E)
// a flight between stations crosses the navy HAZE (the reference style's "through a boundary" transition): the fog thickens to full
// as the camera crosses and clears as it lands, so a fast arrival into a small room never flashes (test: 51 → 81 levels in one frame)
const HAZE = [];   // rev 3: the 24 s flight through the haze is a cross-dissolve now (DISSOLVES)
// ── rev 8d (Timur, 2026-11-27: "add some subtle … long whooshing sounds when the camera is moving quickly … each sound effect should be
// linked to an actual visual or change … perfectly synced, meaning that the sound effect starts when the movement … starts and ends when
// the movement … finishes"). The fast camera moves are MEASURED on the film's own camera (scratchpad/fastmoves.py out/cam_s.json 40 18:
// the median per-point image speed of a cloud at the aim point, a run above 40 px/f extended both ways while above 18 px/f; hard cuts
// split runs) — REAL frames [start, end]. Re-run it after any camera change and paste its list here.
const FAST_MOVES = [
  [336, 367],
  [374, 420],
  [506, 530],
  [543, 596],
  [898, 932],
  [955, 1031],
  [1416, 1464],
  [1609, 1740],
  [1890, 1939],
  [2079, 2129],
  [2135, 2233],
  [2264, 2304]
];
const CAM_WHOOSH = new Set(["whooshsoft", "whooshlong", "airwoosh"]);   // the old per-travel whooshes: replaced by the synced ones below
const WH_VOL = { whooshlong: 0.56, airwoosh: 0.4, ee_whoosh_medium_whoosh_01: 0.29, ee_whoosh_large_whoosh_01: 0.37 };   // each ≈ −19 dB under bed + voice (sfxaudit.py): subtle
const WH_FILES = { whooshlong: 31.5, airwoosh: 53.4, ee_whoosh_medium_whoosh_01: 62.9, ee_whoosh_large_whoosh_01: 74.4 };   // file length, frames
const moveWhoosh = ([a, b], i) => {
  const L = b - a + 1;
  const s = L < 40 ? "whooshlong" : L < 58 ? "airwoosh" : i % 2 ? "ee_whoosh_medium_whoosh_01" : "ee_whoosh_large_whoosh_01";
  // stretched (pitch kept) so the file runs exactly the move: it starts on the move's first frame and is gone on its last
  return { s, at: a, dur: L, rate: WH_FILES[s] / L, fadeIn: Math.round(L * 0.25), fade: Math.round(L * 0.35), xf: true, vol: WH_VOL[s] };
};
export const SFX = [
  ...STATIONS.flatMap((s) => (s.sfx ? s.sfx().map((c) => (s.id === HOOK_ID ? c : { ...c, at: c.at + S })) : [])).filter((c) => !CAM_WHOOSH.has(c.s)),
  ...FAST_MOVES.map(moveWhoosh),
];

const AudioLayers = () => (
  <>
    <Sequence from={0}><Audio src={aud("vo_trimmed.mp3")} volume={1} /></Sequence>
    <Audio src={aud(BED_FILE)} startFrom={BED_START} volume={BED_VOL} />
    <SfxLayer cues={SFX} total={TOTAL} />
  </>
);
export const SelbeesLottery = ({ solo }) => {
  const f = useCurrentFrame();
  if (solo === "audio") return <AbsoluteFill style={{ background: "#001C3C" }}><AudioLayers /></AbsoluteFill>;   // the render's audio pass (no WebGL)
  const k = CAM(f);
  // around a dissolve the main canvas carries only the station whose camera CAM is on (the other one is on the second canvas)
  const live = STATIONS.filter((s) => { const g = s.id === HOOK_ID ? f : f - S; return (g >= s.from || s.from <= 0) && g <= s.to && !DISSOLVES.some((d) => (f <= d.at && s.id === d.post) || (f > d.at && s.id === d.pre)); });
  const dz = dissolveAt(f);
  const dzOther = dz && STATIONS.find((s) => s.id === (f <= dz.at ? dz.post : dz.pre));
  const dzW = dz ? ease(f, dz.at + 1 - HALF, dz.at + 1 + HALF) : 0;   // the incoming picture's weight (smootherstep): 0.5 at the cut
  // the light of overlapping stations CROSS-FADES by how near the camera's aim is to each (it never doubles); one shadow caster
  const near = live.map((s) => { const lt = s.light?.target ?? [0, 0, 0]; const dx = k.target[0] - (s.origin[0] + lt[0]), dz = k.target[2] - (s.origin[2] + lt[2]); return Math.exp(-Math.sqrt(dx * dx + dz * dz) / 25); });
  const nsum = near.reduce((a, b) => a + b, 0) || 1;
  const top = near.indexOf(Math.max(...near));
  const veil = ease(f, CLOSE_AT + 8, CLOSE_AT + 40);   // the world dims to the navy ground under the close
  return (
    <AbsoluteFill style={{ background: "#001C3C" }}>
      <World3D cam={CAM}>
        {live.map((s, i) => { const { key: keyPos, ...lt } = s.light ?? {}; return (
          <group key={s.id} position={s.origin}>
            <HouseLights target={[0, 0, 0]} {...lt} {...(keyPos ? { keyPos } : {})} gain={near[i] / nsum} casts={i === top} />
            <s.Scene f={story(s, f)} />
          </group>
        ); })}
      </World3D>
      {dz && dzOther && (
        <AbsoluteFill style={{ opacity: f <= dz.at ? dzW : 1 - dzW }}>
          <World3D cam={f <= dz.at ? dz.camPost : dz.camPre}>
            {(() => { const { key: keyPos, ...lt } = dzOther.light ?? {}; return (
              <group position={dzOther.origin}>
                <HouseLights target={[0, 0, 0]} {...lt} {...(keyPos ? { keyPos } : {})} gain={1} casts />
                <dzOther.Scene f={story(dzOther, f)} />
              </group>
            ); })()}
          </World3D>
        </AbsoluteFill>
      )}
      {/* the reference look: a strong vignette, the lower quarter pushed dark for the captions (CLAUDE.md 3-D World §B7) */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 70% at 50% 42%, rgba(0,0,0,0) 55%, rgba(0,8,22,0.55) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,8,22,0) 62%, rgba(0,8,22,0.38) 80%, rgba(0,8,22,0.62) 100%)" }} />
      {/* the annotation layer, pinned through the same camera */}
      {/* rev 4c: a story-time station's overlay sits in a Sequence shifted by S, so its Tags/Counters (useCurrentFrame) read story frames too */}
      {live.map((s) => { const P = (p) => projectWith(k, [p[0] + s.origin[0], p[1] + s.origin[1], p[2] + s.origin[2]]); return s.Overlay && (s.id === HOOK_ID
        ? <s.Overlay key={s.id} f={f} P={P} />
        : <Sequence key={s.id} from={S} layout="none"><s.Overlay f={f - S} P={P} /></Sequence>); })}
      {/* a matched cut from a bright surface onto a darker one carries the light across (a soft flash that decays) — flash.py: no one-frame jump */}
      {CUT_FLASH.map((c) => f >= c.at && f < c.at + c.dur && <AbsoluteFill key={c.at} style={{ background: c.color, opacity: c.o * (1 - ease(f, c.at, c.at + c.dur)) }} />)}
      {HAZE.map((h) => f > h.a && f < h.b && <AbsoluteFill key={h.a} style={{ background: "#0A2A52", opacity: ease(f, h.a, h.peak) * (1 - ease(f, h.peak, h.b)) }} />)}
      <AbsoluteFill style={{ background: "#001C3C", opacity: 0.86 * veil }} />
      <Karaoke chips={CHIPS} hideFrom={CLOSE_AT + 4} />
      {BIG.map((b, i) => <BigWord key={i} {...b} />)}
      {f >= CLOSE_AT && <BrandClose at={CLOSE_AT + 22} y={960} />}
      <Watermark lit={1} outAt={CLOSE_AT + 10} />
      {solo !== "picture" && <AudioLayers />}
    </AbsoluteFill>
  );
};
