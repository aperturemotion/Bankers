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
import { CHIPS, TOTAL, VO_END } from "./take";
import { BrandClose, Watermark } from "../bnx/close";
import { SfxLayer, cueAt } from "../bnx/SfxLayer";
import { STATIONS } from "./stations";

export const CLOSE_AT = VO_END + 12;          // the close begins after the last line's breath
// ★ the song (Timur, 2026-11-26: "change the song to the video about Nvidia sold … billion of chips in 3 months" = Video 34 "Nvidia Keeps",
//   whose bed was 711): the file as he gave it (public/711.mp3, the copy Videos 11–16 used), ONE volume for the whole film (STYLE 11.3,
//   2026-10-15 / 10-22), started so its big drop (117.38 s in the source) lands on "In 2003," (frame 212); the volume matches the FOCUS
//   bed it replaces as heard (both −24.8 LUFS over the body: the 711 body is −10.1 LUFS at 1.0 → 0.18)
const BED_FILE = "711.mp3";
const BED_START = 3308;     // frames into the source: 110.27 s → the drop at 117.38 s plays at 7.11 s (frame 213), on "In" (212)
const BED_VOL = 0.18;
const shotsAll = STATIONS.flatMap((s) => s.shots()).sort((p, q) => p.a - q.a);
// the camera's final move: up and away into the navy sky as the close comes in (the world falls away under BANKER$)
const lastShot = shotsAll[shotsAll.length - 1];
const OUTRO = { a: CLOSE_AT - 6, b: CLOSE_AT + 40, pos: [lastShot.pos[0], lastShot.pos[1] + 22, lastShot.pos[2] + 10], target: [lastShot.target[0], lastShot.target[1] + 26, lastShot.target[2] - 6], fov: 40 };
export const CAM_RAW = makeCam([...shotsAll, OUTRO]);
export const CAM = smoothCam(CAM_RAW, TOTAL, shotsAll.filter((s) => s.cut).map((s) => s.a), 14);   // one continuous glide (kit.smoothCam)
// the store's push INTO the leaflet's bright diagram cuts to the dark coin wall (measured 159 → 102 mean levels at 480 → 481)
const CUT_FLASH = [{ at: 481, o: 0.58, dur: 16, color: "#C8DBF4" }, { at: 883, o: 0.42, dur: 14, color: "#EEF3FA" }];   // 883: the bright bill → the gold seal (186 → 147)
// a flight between stations crosses the navy HAZE (the reference style's "through a boundary" transition): the fog thickens to full
// as the camera crosses and clears as it lands, so a fast arrival into a small room never flashes (test: 51 → 81 levels in one frame)
const HAZE = [{ a: 744, peak: 756, b: 778 }];
export const SFX = [...STATIONS.flatMap((s) => (s.sfx ? s.sfx() : [])), cueAt("whooshlong", CLOSE_AT + 6, 40, 0.5)];

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
  const live = STATIONS.filter((s) => f >= s.from && f <= s.to);
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
            <s.Scene f={f} />
          </group>
        ); })}
      </World3D>
      {/* the reference look: a strong vignette, the lower quarter pushed dark for the captions (CLAUDE.md 3-D World §B7) */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 70% at 50% 42%, rgba(0,0,0,0) 55%, rgba(0,8,22,0.55) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,8,22,0) 62%, rgba(0,8,22,0.38) 80%, rgba(0,8,22,0.62) 100%)" }} />
      {/* the annotation layer, pinned through the same camera */}
      {live.map((s) => s.Overlay && <s.Overlay key={s.id} f={f} P={(p) => projectWith(k, [p[0] + s.origin[0], p[1] + s.origin[1], p[2] + s.origin[2]])} />)}
      {/* a matched cut from a bright surface onto a darker one carries the light across (a soft flash that decays) — flash.py: no one-frame jump */}
      {CUT_FLASH.map((c) => f >= c.at && f < c.at + c.dur && <AbsoluteFill key={c.at} style={{ background: c.color, opacity: c.o * (1 - ease(f, c.at, c.at + c.dur)) }} />)}
      {HAZE.map((h) => f > h.a && f < h.b && <AbsoluteFill key={h.a} style={{ background: "#0A2A52", opacity: ease(f, h.a, h.peak) * (1 - ease(f, h.peak, h.b)) }} />)}
      <AbsoluteFill style={{ background: "#001C3C", opacity: 0.86 * veil }} />
      <Karaoke chips={CHIPS} hideFrom={CLOSE_AT + 4} />
      {f >= CLOSE_AT && <BrandClose at={CLOSE_AT + 22} y={960} />}
      <Watermark lit={1} outAt={CLOSE_AT + 10} />
      {solo !== "picture" && <AudioLayers />}
    </AbsoluteFill>
  );
};
