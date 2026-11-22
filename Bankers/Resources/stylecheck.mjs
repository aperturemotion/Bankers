// ══════════════════════════════════════════════════════════════════════════════════════════════
// BANKERS STYLE CHECK — Bankers/STYLE.md, the rules marked [CHECK]. Run before every handback:
//   node Bankers/Resources/stylecheck.mjs "Bankers/Videos/Video N — …"
//
// Timur, 2026-09-28: "There need to be rules about almost everything, and they need to be detailed so that you don't
// change the style over time." This is the half of that which a machine can hold. It REFUSES (exit 1) on any failure.
//
//   ENGINE   every file in Resources/kit/ is in the video's module folder, byte for byte (line endings aside)   §0
//   SCENES   no place lasts over 7.0 s, arrival to next arrival (the question: to its lift)                     §1.3
//   WHITE    1 place in 2.5–5 is white, and no dark stretch runs over 30 s                                        §4.1
//   CAMERA   PUSH_Z 1.25 · SLIDE_X 1020 (× distance, ≤ 1.6) · push 56 f (question 64) "zoom" · slide 48 f "io" · travels 40–56 f ·
//            ARRIVE/TRACK/THRU as canonical · caption camera ≤ 3 uses, |dz| ≤ 0.06 · NO move that does not start
//            on a place, the caption camera or the close (no "beats") · no kind 3× in a row                   §8
//   CAPTION  the caption's scale jumps only at a chip swap or in a pause · the question never cuts a chip before
//            its last word has shown 8 f                                                                         §8.6 §13
//   TYPE     figure 56–64 / 84–120 / 150–210 · label 30–44 · mono 24–26 · a raw font size in a place only on
//            object print (`data-print` on the same line) · no textShadow                                       §5
//   COLOUR   every colour in the video's own files is the logo blue's family (hue 200–225°), a near-neutral,
//            or one of the canonical reds                                                                        §2
//   STAGE    the key light (len 2200, spread 520, strength 0.35), the watermark (130 px, 0.3), HAS_* together      §3 §11 §12
//   BRAND    no 100bps branding in the video's src/ or public/ names                                             §14.4
//   KINDS    every place file declares its construction KIND, and no kind but `object` appears twice (Video 6 on) §10.2
//
// ★ It proves itself on every run (root CLAUDE.md: "a check whose failure mode is PASS must be tested by making it
// fire"): each checker is first run on a known-bad and a known-good input, and the run refuses if any canary is
// judged wrongly. It also fails CLOSED: a missing JOURNEY export, no places, no colours or no helper calls found is a
// refusal, never a pass. A line may opt out of TYPE/COLOUR only with a visible `style-exempt: <reason>` marker, and
// every such line is printed.
// ══════════════════════════════════════════════════════════════════════════════════════════════
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const KIT = path.join(HERE, "kit");
const FPS = 30;

// ── the rules' numbers (STYLE.md) ──────────────────────────────────────────────────────────────
const R = {
  sceneMax: 7.0, whiteShare: [1 / 5, 1 / 2.5], darkMax: 30,
  PUSH_Z: 1.25, SLIDE_X: 1020, slideMax: 1.6, pushGap: 300, pushDur: 56, questionDur: 64, slideDur: 48, travelDur: [40, 56], tiltMax: 420,
  capMax: 3, capDz: 0.06, capJump: 0.015, chipHold: 8,
  figure: [[56, 64], [84, 120], [150, 210]], label: [[30, 44]], mono: [[24, 26]],
  hue: [200, 225], neutralSat: 0.08, neutralChroma: 0.05,
  reds: ["ef2b3d", "ff8a80", "b3172a", "99101f", "6e0a16", "ff6a5e", "ff9a90", "a3121f", "3a040b", "4a0710"],
  brand: /100\s?bps|100\s?basis\s?points|market breakdowns/i,
};

// ══ THE CHECKERS — pure functions, so the canaries can run them on known cases ══════════════════
const norm = (b) => b.toString("utf8").replace(/\r\n/g, "\n");
const engineSame = (a, b) => norm(a) === norm(b);

function checkScenes(J) {
  const out = [];
  J.PLACES.forEach((p, i) => {
    const end = J.PLACES[i + 1]?.t0 ?? J.THRU[0];
    const s = (end - p.t0) / FPS;
    if (s > R.sceneMax + 1e-9) out.push(`${p.id} lasts ${s.toFixed(2)} s (frames ${p.t0}–${end}); the limit is ${R.sceneMax} s`);
  });
  return out;
}

function checkWhite(J) {
  const out = [];
  const P = J.PLACES, n = P.filter((p) => p.white).length, share = n / P.length;
  if (share < R.whiteShare[0] || share > R.whiteShare[1]) out.push(`${n} of ${P.length} places are white (${(share * 100).toFixed(0)}%); the rule is about 1 in 3–4`);
  // white spans at their 50% points: flood from t0 + whiteIn (+12), drain from the next dark place's t0 + 6 (+12)
  const spans = [];
  P.forEach((p, i) => {
    if (!p.white || P[i - 1]?.white) return;
    let j = i;
    while (P[j + 1]?.white) j++;
    spans.push([p.t0 + (p.whiteIn ?? 6) + 12, P[j + 1] ? P[j + 1].t0 + 18 : J.TOTAL]);
  });
  let cur = 0;
  for (const [a, b] of [...spans, [J.TOTAL, J.TOTAL]]) {
    if ((a - cur) / FPS > R.darkMax) out.push(`a dark stretch runs ${((a - cur) / FPS).toFixed(1)} s (frames ${cur}–${a}); the limit is ${R.darkMax} s`);
    cur = b;
  }
  return out;
}

/** ★ THE DEMO ANCHOR (Timur, 2026-10-13, Video 10 brief — STYLE §4.1): from Video 10 on, the film has ONE light frame, as the demo
 *  does — exactly one white run of one or two places, wherever the story puts it; the 1-in-3 cadence and the 30-s dark limit give way */
function checkWhiteDemo(J) {
  const out = [];
  const P = J.PLACES, runs = P.filter((p, i) => p.white && !P[i - 1]?.white).length, n = P.filter((p) => p.white).length;
  if (runs !== 1) out.push(`${runs} white runs; the demo anchor has exactly ONE light frame (STYLE §4.1)`);
  if (n > 2) out.push(`${n} white places in its light frame; one light frame is one or two places`);
  return out;
}

/** `quick`: from Video 11 the hook may OPEN on a quick, aggressive push-in from further out (STYLE changelog 2026-10-15 [T: "a more
 *  aggressive quick camera in transition for the hook scene, just start zoomed further out"]): ARRIVE eased "out", z +0.15…+0.6
 *  over 24–40 f (SMOOTH still caps its acceleration). Earlier videos keep the canonical z +0.15 over 40 f. */
/** ★★ THE STYLE 3 FILMS' INTENSITY AT THE BANKERS SPEED, from Video 11 (STYLE §8.2 [T 2026-10-15]: "use [their] speed and camera movement
 *  amounts as a reference", then "I mainly meant the intensity, not the speed or consistency of the movements"): pushes 56 f, slides 48 f,
 *  travels 40–56 f, all on SETTLE as before; every plain slide pulls back at its middle (an "arc" move over the same span, z −0.05…−0.1); and
 *  the camera FOLLOWS THE ACTION inside each place (§8.7 [T]: "the scenes stay still for too long…"; "the camera actually follows the
 *  line") — keys (J.KEYS) inside the place's hold, 16–90 f each, at most 0.18 nearer than the arrival (zoom-ins go close: [T] "some zoom ins like the one in the hook scene should be stronger"). */
const FASTR = { pushDur: 56, slideDur: 48, questionDur: 64, travelDur: [40, 56], arc: [0.05, 0.1], keyDur: [30, 150], keyDz: 0.18, keyC: 0.5, still: 45 };
function checkCamera(J, quick = false) {
  const out = [];
  const fast = quick;   // Video 11 on: the quick opening push and the Style 3 films' speed came together
  const RR = fast ? { ...R, ...FASTR } : R;
  if (J.PUSH_Z !== R.PUSH_Z) out.push(`PUSH_Z is ${J.PUSH_Z}, not ${R.PUSH_Z}`);
  if (J.SLIDE_X !== R.SLIDE_X) out.push(`SLIDE_X is ${J.SLIDE_X}, not ${R.SLIDE_X}`);
  const M = J.MOVES, starts = new Set([J.ARRIVE[0], J.TRACK[0], J.THRU[0], ...Object.values(J.CAP).map((c) => c.span[0])]);
  const last = J.PLACES.length - 1;
  // a place's own move (never its depth arc, never a key)
  const own = (t0) => M.find((x) => x.t0 === t0 && x.ease !== "arc");
  J.PLACES.forEach((p, i) => {
    // a place without a move is allowed only as the film's last, the question held under its hero rack (2026-09-30)
    if (!p.kind) { if (i && i !== last) out.push(`${p.id} has no move`); return; }
    if (p.moves) {
      for (const m of p.moves) {
        starts.add(p.t0 + m.from);
        const d = m.to - m.from, mv = own(p.t0 + m.from);
        if (d < RR.travelDur[0] || d > RR.travelDur[1]) out.push(`${p.id}: a travel of ${d} f (rule ${RR.travelDur.join("–")})`);
        if (!mv) { out.push(`${p.id}: its travel is not in MOVES`); continue; }
        if (Math.abs(m.d.x ?? 0) > R.SLIDE_X) out.push(`${p.id}: a travel of x ${m.d.x}`);
        if ((m.d.z ? "zoom" : "io") !== mv.ease) out.push(`${p.id}: a travel ${m.d.z ? "with depth" : "across"} eased "${mv.ease}"`);
      }
      return;
    }
    starts.add(p.t0);
    const dur = J.DUR_OF(p), want = p.kind === "push" ? (i === last ? RR.questionDur : RR.pushDur) : RR.slideDur;
    if (dur !== want) out.push(`${p.id}: a ${p.kind} of ${dur} f, not ${want}`);
    const mv = own(p.t0);
    if (!mv) { out.push(`${p.id}: its ${p.kind} is not in MOVES`); return; }
    if (fast) {
      const arc = M.find((x) => x.t0 === p.t0 && x.ease === "arc");
      if (p.kind === "push" && arc) out.push(`${p.id}: a depth arc on a push`);
      if (p.kind !== "push" && (!arc || arc.t1 !== mv.t1 || -(arc.d.z ?? 0) < RR.arc[0] || -(arc.d.z ?? 0) > RR.arc[1])) out.push(`${p.id}: a slide without its depth arc (z −${RR.arc.join("…−")} over the slide)`);
    }
    if (mv.t1 - mv.t0 !== dur) out.push(`${p.id}: its move runs ${mv.t1 - mv.t0} f, the place says ${dur}`);
    if (p.kind === "push") {
      if (mv.d.z !== R.PUSH_Z) out.push(`${p.id}: a push of z ${mv.d.z}`);
      if (mv.ease !== "zoom") out.push(`${p.id}: a push eased "${mv.ease}", not "zoom"`);
      if (Math.abs(mv.d.y ?? 0) > R.tiltMax) out.push(`${p.id}: a tilt of ${-mv.d.y} px (max ${R.tiltMax})`);
    } else {
      // a slide is SLIDE_X × the outgoing construction's distance (STYLE §8.2: it must carry it a full frame)
      const ax = Math.abs(mv.d.x ?? 0);
      if (ax < R.SLIDE_X - 1e-6 || ax > R.SLIDE_X * R.slideMax) out.push(`${p.id}: a slide of x ${mv.d.x} (rule ${R.SLIDE_X}–${R.SLIDE_X * R.slideMax})`);
      if (mv.ease !== "io") out.push(`${p.id}: a slide eased "${mv.ease}", not "io"`);
    }
  });
  // ★★★ the keys (Video 11 on): each inside its place's hold, its own move in MOVES, within the depth and centring limits
  if (fast) {
    if (!Array.isArray(J.KEYS) || !Array.isArray(J.ARRIVAL_END)) out.push(`the journey declares no KEYS / ARRIVAL_END (STYLE §8.7: the camera follows the action)`);
    else J.KEYS.forEach((ks, i) => ks.forEach((k) => {
      const p = J.PLACES[i], lo = J.ARRIVAL_END[i] + 1, hi = (J.PLACES[i + 1]?.t0 ?? J.TOTAL) - 1;
      starts.add(k.from);
      if (k.from < lo || k.to > hi) out.push(`${p.id}: a camera key ${k.from}–${k.to} outside its hold ${lo}–${hi}`);
      if (k.to - k.from < RR.keyDur[0] || k.to - k.from > RR.keyDur[1]) out.push(`${p.id}: a camera key of ${k.to - k.from} f (rule ${RR.keyDur.join("–")})`);
      if (Math.abs(k.dz) > RR.keyDz) out.push(`${p.id}: a camera key ${k.dz} nearer (max ${RR.keyDz})`);
      if ((k.c ?? 0.35) > RR.keyC) out.push(`${p.id}: a camera key drawing its point ${k.c} of the way to the centre (max ${RR.keyC})`);
      if (!M.some((m) => m.t0 === k.from && m.t1 === k.to)) out.push(`${p.id}: its camera key ${k.from}–${k.to} is not in MOVES`);
    }));
  }
  for (const m of M) if (!starts.has(m.t0)) out.push(`a camera move at frame ${m.t0} (${JSON.stringify(m.d)}) starts on no place, caption line or close: a camera BEAT (STYLE §8.7)`);
  const A = M.find((m) => m.t0 === J.ARRIVE[0]);
  const canonical = A && A.t1 === 40 && A.d.z === 0.15 && A.ease === "out";
  const quickOk = quick && A && A.ease === "out" && A.d.z >= 0.15 && A.d.z <= 0.6 && A.t1 - A.t0 >= 24 && A.t1 - A.t0 <= 40;
  if (!canonical && !quickOk) out.push(quick ? `ARRIVE is not an "out" push-in of z +0.15…+0.6 over 24–40 f` : `ARRIVE is not z +0.15 over 0–40 f, "out"`);
  if (!M.some((m) => m.t0 === J.TRACK[0] && m.d.z === 0.12)) out.push(`TRACK is not z +0.12`);
  if (!M.some((m) => m.t0 === J.THRU[0] && m.d.z === 1.2)) out.push(`THRU is not z +1.2`);
  const caps = Object.entries(J.CAP);
  if (caps.length > R.capMax) out.push(`the caption camera is used ${caps.length}× (max ${R.capMax})`);
  for (const [k, c] of caps) if (Math.abs(c.dz) > R.capDz) out.push(`caption camera "${k}": dz ${c.dz} (max ${R.capDz})`);
  const kinds = J.PLACES.filter((p) => p.kind).map((p) => (p.moves ? "travel" : p.kind));
  kinds.forEach((k, i) => { if (i >= 2 && k === kinds[i - 1] && k === kinds[i - 2]) out.push(`three "${k}" transitions in a row (ending at ${J.PLACES.filter((p) => p.kind)[i].id})`); });
  // ★ NOT TOO MANY ZOOMS (STYLE §8.7a [T 2026-09-30]: "Too many zoom in's from 42 seconds")
  const moved = J.PLACES.filter((p) => p.kind);
  moved.forEach((p, i) => { if (i && p.kind === "push" && !p.moves && moved[i - 1].kind === "push" && !moved[i - 1].moves) out.push(`two pushes in a row: ${moved[i - 1].id} → ${p.id}`); });
  const pushes = moved.filter((p) => p.kind === "push" && !p.moves);
  pushes.forEach((p, i) => { if (i && p.t0 - pushes[i - 1].t0 < R.pushGap) out.push(`pushes ${((p.t0 - pushes[i - 1].t0) / FPS).toFixed(1)} s apart (${pushes[i - 1].id} → ${p.id}; at most one in any ${R.pushGap / FPS} s)`); });
  for (const [k, c] of Object.entries(J.CAP)) if (c.kind === "push" && c.span[0] > J.TOTAL * (2 / 3)) out.push(`the caption camera "${k}" pushes in the film's last third (frame ${c.span[0]})`);
  return out;
}

/** ★ SMOOTH (STYLE §8.2 [T 2026-09-29]: "the camera movement should always be smooth no matter what throughout the entire
 *  video"): the camera's path (every move, no drift) must never change speed abruptly — a move that starts or lands with a
 *  jolt, or a beat stacked on another move, shows as a jump in the per-frame velocity. Limits: 15 px/frame² in x and y,
 *  0.012/frame² in depth (a hard start of a 1020 px, 48 f slide is ~25 px/frame²; SETTLE's is ~6). Frame 0–2 (ARRIVE, the
 *  film's first frame already moving) are exempt. */
/** ★★★ STILL (Video 11 on — STYLE §8.7 [T 2026-10-15]: "the scenes look like different pages where the camera sort of just sits still
 *  while the visuals move. That should be prevented"): from the end of the opening push to the end of the fly-through into the close,
 *  the camera's path (every move, no idle float) never stands still for more than FASTR.still frames — "still" being under 0.12 px a
 *  frame across and 0.0002 a frame in depth (the slowest key glide moves ~0.5 px and ~0.0005 a frame). */
function checkStill(J, camPath) {
  const out = [], c = (f) => camPath({ x: 0, y: 0, z: 0 }, J.MOVES, f, false);
  let run = 0, p0 = c(J.ARRIVE[1]), worst = 0;
  const flush = (f) => { if (run > FASTR.still) out.push(`the camera stands still ${run} f (${(run / FPS).toFixed(1)} s), frames ${f - run}–${f - 1}`); worst = Math.max(worst, run); run = 0; };
  for (let f = J.ARRIVE[1] + 1; f <= J.THRU[1]; f++) {
    const p = c(f), still = Math.hypot(p.x - p0.x, p.y - p0.y) < 0.12 && Math.abs(p.z - p0.z) < 0.0002;
    if (still) run++; else flush(f);
    p0 = p;
  }
  flush(J.THRU[1] + 1);
  return { out, worst };
}

function checkSmooth(J, camPath) {
  const out = [], c = (f) => camPath({ x: 0, y: 0, z: 0 }, J.MOVES, f, false);
  let v0 = null, p0 = c(0);
  const worst = { xy: 0, z: 0 };
  for (let f = 1; f < J.TOTAL; f++) {
    const p = c(f), v = { x: p.x - p0.x, y: p.y - p0.y, z: p.z - p0.z };
    if (v0 && f > 2) {
      const ax = Math.abs(v.x - v0.x), ay = Math.abs(v.y - v0.y), az = Math.abs(v.z - v0.z);
      worst.xy = Math.max(worst.xy, ax, ay); worst.z = Math.max(worst.z, az);
      if (ax > 15 || ay > 15 || az > 0.012) out.push(`the camera jolts at frame ${f} (acceleration x ${ax.toFixed(1)}, y ${ay.toFixed(1)} px/f², z ${az.toFixed(4)}/f²)`);
    }
    v0 = v; p0 = p;
  }
  return { out: out.slice(0, 12).concat(out.length > 12 ? [`… and ${out.length - 12} more frames`] : []), worst };
}

function checkCaption(J) {
  const out = [];
  for (let f = 1; f < J.TOTAL; f++) {
    const d = Math.abs(J.capScale(f) - J.capScale(f - 1));
    if (d <= R.capJump) continue;
    const a = J.chipAt(f - 1), b = J.chipAt(f);
    if (a && b && a.at === b.at) out.push(`the caption's scale jumps ${(d * 100).toFixed(1)}% at frame ${f}, mid-chip`);
  }
  const c = J.chipAt(J.HERO_ON - 1);
  if (c) {
    const w = J.CHIPS.find((x) => x.at === c.at), lastWord = w?.parts?.at(-1)?.at ?? c.at;
    if (J.HERO_ON - lastWord < R.chipHold) out.push(`the question cuts "${w?.word}" ${J.HERO_ON - lastWord} f after its last word (min ${R.chipHold})`);
  }
  return out;
}

const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " ")).split("\n").map((l) => l.replace(/(^|[\s;,(){}[\]])\/\/.*$/, "$1")).join("\n");
const inRanges = (v, rs) => rs.some(([a, b]) => v >= a && v <= b);

/** files: [{ name, text, objects }] — `objects` files (fg.tsx) are object print throughout, so only helper SIZES apply */
function checkType(files) {
  const out = [], seen = { helpers: 0 };
  for (const { name, text, objects } of files) {
    const raw = text.split("\n"), lines = stripComments(text).split("\n");
    lines.forEach((l, i) => {
      if (/style-exempt:/.test(raw[i])) return;
      for (const [h, rs] of [["figure", R.figure], ["label", R.label], ["mono", R.mono]]) {
        for (const m of l.matchAll(new RegExp(`\\b${h}\\((\\d+(?:\\.\\d+)?)`, "g"))) {
          seen.helpers++;
          if (!inRanges(Number(m[1]), rs)) out.push(`${name}:${i + 1} ${h}(${m[1]}) is outside ${rs.map((r) => r.join("–")).join(" / ")}`);
        }
      }
      if (/textShadow/.test(l)) out.push(`${name}:${i + 1} a textShadow (type is flat, STYLE §5.2)`);
      if (!objects && /fontSize\s*[:=]/.test(l) && !/data-print/.test(l)) out.push(`${name}:${i + 1} a raw font size outside the helpers, not marked as object print (data-print)`);
    });
  }
  return { out, seen };
}

const hsl = (r, g, b) => {
  const [R_, G, B] = [r / 255, g / 255, b / 255], mx = Math.max(R_, G, B), mn = Math.min(R_, G, B), c = mx - mn, l = (mx + mn) / 2;
  const s = c === 0 ? 0 : c / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (c) h = mx === R_ ? 60 * (((G - B) / c) % 6) : mx === G ? 60 * ((B - R_) / c + 2) : 60 * ((R_ - G) / c + 4);
  return { h: (h + 360) % 360, s, c };
};
/** a colour's verdict: "ok" | "red" | a reason */
function judgeColour(hex) {
  let x = hex.replace("#", "").toLowerCase();
  if (x.length === 3) x = [...x].map((ch) => ch + ch).join("");
  const [r, g, b] = [0, 2, 4].map((k) => parseInt(x.slice(k, k + 2), 16));
  const { h, s, c } = hsl(r, g, b);
  if (s < R.neutralSat || c < R.neutralChroma) return "ok";
  if (h >= R.hue[0] && h <= R.hue[1]) return "ok";
  if (R.reds.includes(x)) return "red";
  return `hue ${h.toFixed(0)}°, saturation ${s.toFixed(2)}`;
}
const toHex = (r, g, b) => "#" + [r, g, b].map((v) => Number(v).toString(16).padStart(2, "0")).join("");
function checkColour(files) {
  const out = [], reds = [], seen = { n: 0 };
  for (const { name, text } of files) {
    const raw = text.split("\n"), lines = stripComments(text).split("\n");
    lines.forEach((l, i) => {
      if (/style-exempt:/.test(raw[i])) return;
      const found = [...l.matchAll(/#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g)].map((m) => m[0]);
      for (const m of l.matchAll(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g)) found.push(toHex(m[1], m[2], m[3]));
      for (const col of found) {
        seen.n++;
        const v = judgeColour(col);
        if (v === "red") reds.push(`${name}:${i + 1} ${col}`);
        else if (v !== "ok") out.push(`${name}:${i + 1} ${col} is off the logo blue's family (${v})`);
      }
      if (/theme\.red\b/.test(l)) reds.push(`${name}:${i + 1} theme.red`);
    });
  }
  return { out, reds, seen };
}

function checkStage(videoSrc) {
  const out = [], s = stripComments(videoSrc);
  if (!/<KeyLight[^>]*len=\{2200\}[^>]*spread=\{520\}[^>]*strength=\{0\.35 \*/.test(s)) out.push(`the KeyLight is not len 2200, spread 520, strength 0.35 × (1 − white) (STYLE §3.2)`);
  if (!/data-probe-group="logo"[^>]*width: 130\b[^>]*opacity: 0\.3\b/.test(s)) out.push(`the watermark is not 130 px wide at opacity 0.3 (STYLE §12.1)`);
  const has = ["HAS_VO", "HAS_MUSIC", "HAS_SFX"].map((k) => (s.match(new RegExp(`const ${k} = (true|false)`)) ?? [])[1]);
  if (has.some((v) => v === undefined)) out.push(`HAS_VO / HAS_MUSIC / HAS_SFX not all found`);
  else if (new Set(has).size !== 1) out.push(`HAS_VO / HAS_MUSIC / HAS_SFX are ${has.join(" / ")}: they switch on together (STYLE §11.4)`);
  // ★ the World in its own stacking context (STYLE §5.5 [T 2026-10-01]): its layers' zIndex otherwise beats the question, the chips
  // and the watermark, and a racked-out construction painted OVER the closing question
  if (!/(zIndex: 0|isolation: "isolate")[^>]*>\s*<World\b/.test(s)) out.push(`<World> is not wrapped in its own stacking context (zIndex 0): its layers paint over the question and the captions (STYLE §5.5)`);
  // the score may play in the Studio on the PROVISIONAL take only (STYLE §11.4): the preview must be the captions' own SYNTHETIC flag
  const prev = s.match(/const SFX_PREVIEW = ([^;]+);/);
  if (prev && prev[1].trim() !== "SYNTHETIC") out.push(`SFX_PREVIEW is "${prev[1].trim()}": it must be SYNTHETIC, so it switches off when the real take is wired (STYLE §11.4)`);
  return out;
}

function checkBrand(entries) {
  return entries.filter(({ text }) => R.brand.test(text)).map(({ name }) => `100bps branding in ${name}`);
}

// ── KINDS (§10.2, Timur 2026-10-05: "the third scene is a bar chart after the bar chart in the second scene. Prevent these sorts
// of things by avoiding visual repetition in the same video") ──
/** the construction kinds; every one but `object` and `text` may appear once per film (`text`, a text-only beat: the visual
 *  vocabulary, Timur 2026-10-09 — Resources/visual-vocabulary.md) */
const KINDS = ["bars", "line", "candles", "pie", "dial", "steps", "grid", "fill", "counter", "object", "text"];
const REPEATABLE = new Set(["object", "text"]);
/** files: [{ name, text }] — every places/*.tsx except the registry. Returns { out, seen: [[name, kinds]] } */
function checkKinds(files) {
  const out = [], seen = [], first = new Map(), exempt = [];
  for (const { name, text } of files) {
    // ★ a repeat Timur asked for by name (STYLE §10.2, 2026-10-07: "use candlesticks for the scene at one minute") carries
    // `style-exempt: <his words>` on its KIND line: allowed, and LISTED — read from the raw line, before comments are stripped
    const exLine = text.split("\n").find((l) => /export\s+const\s+KIND\b/.test(l) && /style-exempt:\s*\S/.test(l));
    const code = text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
    const m = code.match(/export\s+const\s+KIND\s*(?::[^=]+)?=\s*(\[[^\]]*\]|"[^"]*"|'[^']*')/);
    if (!m) { out.push(`${name} declares no KIND (export const KIND = "bars" | "line" | … — STYLE §10.2)`); continue; }
    const kinds = [...m[1].matchAll(/["']([^"']+)["']/g)].map((x) => x[1]);
    if (!kinds.length) { out.push(`${name}: an empty KIND`); continue; }
    seen.push([name, kinds]);
    for (const k of kinds) {
      if (!KINDS.includes(k)) { out.push(`${name}: unknown KIND "${k}" (one of ${KINDS.join(", ")})`); continue; }
      if (REPEATABLE.has(k)) continue;
      if (first.has(k) && exLine) exempt.push(`${name} is "${k}" again, as asked — ${exLine.slice(exLine.indexOf("style-exempt:")).trim().slice(0, 140)}`);
      else if (first.has(k)) out.push(`${name} is "${k}" again — ${first.get(k)} already is: one of each chart kind per film (STYLE §10.2)`);
      else first.set(k, name);
    }
  }
  return { out, seen, exempt };
}

// ══ THE CANARIES — every checker judged on a known-bad and a known-good case, every run ══════════
function canaries() {
  const bad = [];
  let n = 0;
  const expect = (label, got, wantFire) => { n++; if ((got.length > 0) !== wantFire) bad.push(`${label}: ${wantFire ? "did not fire" : "fired"} (${got.join("; ") || "nothing"})`); };
  // engine
  if (!engineSame(Buffer.from("a\r\nb"), Buffer.from("a\nb"))) bad.push("engine: CRLF vs LF judged different");
  if (engineSame(Buffer.from("PUSH_Z = 1.25"), Buffer.from("PUSH_Z = 1.3"))) bad.push("engine: an edited file judged the same");
  // a synthetic journey
  const place = (id, kind, t0, extra = {}) => ({ id, kind, t0, ...extra });
  const chips = [{ word: "one two three", at: 0, until: 100, parts: [{ at: 0 }, { at: 80 }] }, { word: "four five", at: 100, until: 300, parts: [{ at: 100 }, { at: 200 }] }];
  const chipAt = (f) => { const c = chips.find((w) => f >= w.at && f < w.until); return c && { at: c.at, end: c.until }; };
  const J0 = (over = {}) => {
    const PLACES = over.PLACES ?? [place("a", undefined, 0), place("b", "slideR", 180, { white: true }), place("c", "push", 360), place("d", "slideL", 480), place("e", "push", 670, { dur: 64 })];
    const DUR_OF = (p) => p.dur ?? (p.kind === "push" ? 56 : 48);
    const MOVES = [over.arrive ?? { t0: 0, t1: 40, d: { z: 0.15 }, ease: "out" }, ...PLACES.filter((p) => p.kind).map((p) => ({ t0: p.t0, t1: p.t0 + DUR_OF(p), d: p.kind === "push" ? { z: 1.25 } : { x: 1020 }, ease: p.kind === "push" ? "zoom" : "io" })),
      { t0: 700, t1: 760, d: { z: 0.12 }, ease: "zoom" }, { t0: 760, t1: 796, d: { z: 1.2 }, ease: "zoom" }, ...(over.extraMoves ?? [])];
    return { PLACES, DUR_OF, MOVES, CAP: over.CAP ?? {}, capScale: over.capScale ?? (() => 1), chipAt, CHIPS: chips, ARRIVE: [0, over.arrive?.t1 ?? 40], TRACK: [700, 760], THRU: [760, 796], PUSH_Z: 1.25, SLIDE_X: 1020, HERO_ON: over.HERO_ON ?? 300, TOTAL: 900 };
  };
  expect("scenes: a 6 s scene", checkScenes(J0()), false);
  expect("scenes: a 7.3 s scene", checkScenes(J0({ PLACES: [place("a", undefined, 0), place("b", "slideR", 220, { white: true }), place("c", "push", 400), place("d", "push", 560, { dur: 64 })] })), true);
  expect("white: 1 of 4 white", checkWhite(J0()), false);
  expect("white: none white", checkWhite(J0({ PLACES: [place("a", undefined, 0), place("b", "slideR", 180), place("c", "push", 360), place("d", "slideL", 480), place("e", "push", 670, { dur: 64 })] })), true);
  expect("white (demo anchor): one light frame", checkWhiteDemo(J0()), false);
  expect("white (demo anchor): none", checkWhiteDemo(J0({ PLACES: [place("a", undefined, 0), place("b", "slideR", 180), place("c", "push", 360), place("d", "slideL", 480), place("e", "push", 670, { dur: 64 })] })), true);
  expect("white (demo anchor): two light frames", checkWhiteDemo(J0({ PLACES: [place("a", undefined, 0), place("b", "slideR", 180, { white: true }), place("c", "push", 360), place("d", "slideL", 480, { white: true }), place("e", "push", 670, { dur: 64 })] })), true);
  expect("camera: the canonical moves", checkCamera(J0()), false);
  expect("camera: a quick opening push before Video 11", checkCamera(J0({ arrive: { t0: 0, t1: 30, d: { z: 0.5 }, ease: "out" } }), false), true);
  expect("camera: a beat mid-scene", checkCamera(J0({ extraMoves: [{ t0: 250, t1: 262, d: { z: 0.03 }, ease: "io" }] })), true);
  expect("camera: a push of 40 f", checkCamera(J0({ PLACES: [place("a", undefined, 0), place("b", "slideR", 180, { white: true }), place("c", "push", 360, { dur: 40 }), place("d", "slideL", 480), place("e", "push", 670, { dur: 64 })] })), true);
  expect("camera: two pushes in a row", checkCamera(J0({ PLACES: [place("a", undefined, 0), place("b", "slideR", 180, { white: true }), place("c", "push", 360), place("d", "push", 560, { dur: 64 })] })), true);
  expect("camera: pushes 7 s apart", checkCamera(J0({ PLACES: [place("a", undefined, 0), place("b", "push", 180, { white: true }), place("c", "slideR", 300), place("d", "push", 390), place("e", "slideL", 560, { dur: 48 })] })), true);
  expect("camera: a caption push in the last third", checkCamera(J0({ CAP: { display: { span: [700, 740], dz: 0.05, kind: "push" } } })), true);
  // ★★ the Style 3 films' speed (Video 11 on): 36 / 32 f on the fast curve, a depth arc on every plain slide, keys inside the holds
  const J0F = (over = {}) => {
    const PLACES = [place("a", undefined, 0), place("b", "slideR", 180, { white: true }), place("c", "push", 360), place("d", "slideL", 480), place("e", "push", 670, { dur: 64 })];
    const DUR_OF = (p) => p.dur ?? (p.kind === "push" ? 56 : over.slideDur ?? 48);
    const arrEnd = PLACES.map((p, i) => (i ? p.t0 + DUR_OF(p) : 30));
    const KEYS = over.KEYS ?? PLACES.map((p, i) => (i === 1 ? [{ from: 230, to: 300, x: 600, y: 1100, dz: 0.06, c: 0.3 }] : []));
    const MOVES = [over.arrive ?? { t0: 0, t1: 30, d: { z: 0.5 }, ease: "out" },
      ...PLACES.filter((p) => p.kind).flatMap((p) => [{ t0: p.t0, t1: p.t0 + DUR_OF(p), d: p.kind === "push" ? { z: 1.25 } : { x: 1020 }, ease: p.kind === "push" ? "zoom" : "io" },
        ...(p.kind !== "push" && !over.noArc ? [{ t0: p.t0, t1: p.t0 + DUR_OF(p), d: { z: -0.08 }, ease: "arc" }] : [])]),
      ...KEYS.flat().map((k) => ({ t0: k.from, t1: k.to, d: { z: k.dz }, ease: "zoom" })),
      { t0: 700, t1: 760, d: { z: 0.12 }, ease: "zoom" }, { t0: 760, t1: 816, d: { z: 1.2 }, ease: "zoom" }];
    return { PLACES, DUR_OF, MOVES, CAP: {}, capScale: () => 1, chipAt, CHIPS: chips, ARRIVE: [0, 30], TRACK: [700, 760], THRU: [760, 816], PUSH_Z: 1.25, SLIDE_X: 1020, HERO_ON: 300, TOTAL: 900, KEYS, ARRIVAL_END: arrEnd };
  };
  expect("fast camera: the Style 3 films' intensity at the Bankers speed, with the quick opening push", checkCamera(J0F(), true), false);
  { const o = checkCamera(J0F({ arrive: { t0: 0, t1: 30, d: { z: 0.9 }, ease: "out" } }), true); expect("fast camera: an opening push too far", o, true); if (o.length !== 1 || !/ARRIVE/.test(o[0])) bad.push(`fast camera: an opening push too far fired for other reasons (${o.join("; ")})`); }
  expect("fast camera: a 32 f slide (too fast)", checkCamera(J0F({ slideDur: 32 }), true), true);
  expect("fast camera: a slide without its depth arc", checkCamera(J0F({ noArc: true }), true), true);
  expect("fast camera: a key before its place has arrived", checkCamera(J0F({ KEYS: [[], [{ from: 200, to: 260, x: 600, y: 1100, dz: 0.06 }], [], [], []] }), true), true);
  expect("fast camera: a key too near", checkCamera(J0F({ KEYS: [[], [{ from: 230, to: 300, x: 600, y: 1100, dz: 0.25 }], [], [], []] }), true), true);
  expect("fast camera: SETTLE moves judged by the old rules", checkCamera(J0F(), false), true);
  const snap = (f) => (f >= 20 && f < 60 ? 1 + 0.09 * Math.min(1, (f - 20) / 40) : 1);        // Video 1's hook: back to 1 mid-chip
  const held = (f) => (f >= 20 && f < 100 ? 1 + 0.09 * Math.min(1, (f - 20) / 40) : 1);       // held to the chip swap at 100
  expect("caption: a snap mid-chip", checkCaption(J0({ capScale: snap })), true);
  expect("caption: held to the chip swap", checkCaption(J0({ capScale: held })), false);
  expect("caption: the question cuts a chip", checkCaption(J0({ HERO_ON: 205 })), true);
  const T = (text, objects = false) => checkType([{ name: "t", text, objects }]).out;
  expect("type: figure(130)", T(`...figure(130, ink)`), true);
  expect("type: label(34), figure(92), mono(24)", T(`label(34, a) figure(92) mono(24)`), false);
  expect("type: a raw fontSize", T(`<div style={{ fontFamily: SHOUT, fontSize: 46 }}>STOCKS</div>`), true);
  expect("type: object print", T(`<div data-print style={{ fontFamily: SHOUT, fontSize: 20 }}>PRICE</div>`), false);
  expect("type: a textShadow", T(`textShadow: "0 0 8px #fff"`), true);
  expect("type: a commented-out raw size", T(`// fontSize: 46 was here`), false);
  const C = (text) => checkColour([{ name: "c", text }]).out;
  expect("colour: #00C853 green", C(`fill="#00C853"`), true);
  expect("colour: #3C4A60 slate-blue, #1F62B3, #FFF, rgba(0,28,60,.3)", C(`"#3C4A60" "#1F62B3" "#FFF" rgba(0,28,60,0.3)`), false);
  expect("colour: #ef2b3d the canonical red", C(`fill="#ef2b3d"`), false);
  expect("colour: #ff0000 an off-token red", C(`fill="#ff0000"`), true);
  expect("colour: rgba(255,170,0,1) amber", C(`rgba(255,170,0,1)`), true);
  expect("brand: 100bps", checkBrand([{ name: "x", text: "Follow for more market breakdowns" }]), true);
  expect("brand: Bankers", checkBrand([{ name: "x", text: "@bankers" }]), false);
  expect("stage: a bare key light", checkStage(`<KeyLight len={1800} />`), true);
  const okStage = `<KeyLight len={2200} spread={520} strength={0.35 * k} /> <div data-probe-group="logo" style={{ width: 130, opacity: 0.3 }} /> const HAS_VO = true; const HAS_MUSIC = true; const HAS_SFX = true;`;
  expect("stage: the World in its own stacking context", checkStage(okStage + ` <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
  <World cam={cam} layers={l} /></div> const SFX_PREVIEW = SYNTHETIC;`), false);
  expect("stage: a bare World (its layers over the question)", checkStage(okStage + ` <World cam={cam} layers={l} />`), true);
  expect("stage: an SFX preview left on", checkStage(okStage + ` <div style={{ zIndex: 0 }}><World cam={cam} /></div> const SFX_PREVIEW = true;`), true);
  const K = (...ks) => checkKinds(ks.map((k, i) => ({ name: `p${i}.tsx`, text: k === null ? "export const X = 1;" : `export const KIND = ${JSON.stringify(k)};` }))).out;
  expect("kinds: two bar charts (Video 6's lows, then its deposit stacks)", K("bars", "line", "bars"), true);
  expect("kinds: bars, line, counter and two objects", K("bars", "line", "counter", "object", "object"), false);
  expect("kinds: three text-only beats (the vocabulary's sentences)", K("text", "line", "text", "text"), false);
  expect("kinds: a place that declares none", K("bars", null), true);
  expect("kinds: an unknown kind", K("barchart"), true);
  expect("kinds: a commented-out declaration", checkKinds([{ name: "c.tsx", text: `// export const KIND = "bars";` }]).out, true);
  // a repeat asked for by name passes and is listed; the same repeat without the marker (twin) still fires
  const ex = checkKinds([{ name: "a.tsx", text: `export const KIND = "candles";` }, { name: "b.tsx", text: `export const KIND = "candles"; // style-exempt: Timur asked for candlesticks here` }]);
  expect("kinds: a repeat Timur asked for (style-exempt)", ex.out, false);
  if (ex.exempt.length !== 1) bad.push("kinds: the asked-for repeat was not listed");
  expect("kinds: the same repeat without the marker", checkKinds([{ name: "a.tsx", text: `export const KIND = "candles";` }, { name: "b.tsx", text: `export const KIND = "candles"; // Timur asked for candlesticks here` }]).out, true);
  return { bad, n };
}

// ══ THE RUN ═════════════════════════════════════════════════════════════════════════════════════
const arg = process.argv[2];
if (!arg) { console.error('usage: node Bankers/Resources/stylecheck.mjs "<video folder>"'); process.exit(2); }
const video = path.resolve(arg);
const fails = [];
const section = (name, list, note = "") => {
  console.log(`${list.length ? "✗" : "✓"} ${name}${note ? ` — ${note}` : ""}`);
  for (const l of list) console.log(`    ${l}`);
  fails.push(...list.map((l) => `${name}: ${l}`));
};

const { bad, n: nCanary } = canaries();
if (bad.length) {
  console.log("✗ THE CHECKER IS BROKEN — its canaries were judged wrongly:");
  for (const b of bad) console.log(`    ${b}`);
  process.exit(1);
}
console.log(`✓ canaries — ${nCanary} known cases judged correctly`);

const srcDir = path.join(video, "src");
const mods = fs.existsSync(srcDir) ? fs.readdirSync(srcDir).filter((d) => fs.existsSync(path.join(srcDir, d, "Video.tsx"))) : [];
if (mods.length !== 1) { console.log(`✗ REFUSED — expected one module folder with a Video.tsx under ${srcDir}, found ${mods.length}`); process.exit(1); }
const mod = path.join(srcDir, mods[0]);
const rd = (p) => fs.readFileSync(p, "utf8");

// ENGINE
{
  const out = [];
  const kitFiles = fs.readdirSync(KIT).filter((f) => /\.(tsx?|mjs)$/.test(f));
  if (!kitFiles.length) out.push(`Resources/kit/ is empty`);
  for (const f of kitFiles) {
    const p = path.join(mod, f);
    if (!fs.existsSync(p)) out.push(`${f} is missing from ${mods[0]}/`);
    else if (!engineSame(fs.readFileSync(p), fs.readFileSync(path.join(KIT, f)))) out.push(`${f} differs from Resources/kit/${f} — the engine is never edited in a video (STYLE §0)`);
  }
  section("ENGINE", out, `${kitFiles.length} canonical files`);
}

// JOURNEY (bundled from the video's own Video.tsx, as the render runs it)
let J, camPathV;   // camPathV: the video's own engine — the SMOOTH canaries run against it after the bundle
{
  const req = createRequire(path.join(video, "package.json"));
  let esbuild;
  try { esbuild = req("esbuild"); } catch { console.log(`✗ REFUSED — esbuild not found in the video's node_modules (npm install)`); process.exit(1); }
  const stub = { name: "stub-fonts", setup(b) {
    b.onResolve({ filter: /^@remotion\/(google-fonts|fonts)/ }, (a) => ({ path: a.path, namespace: "stub" }));
    // the probe measures with a canvas at load: it has no part in the journey's numbers
    b.onResolve({ filter: /(^|\/)Probe$/ }, (a) => ({ path: a.path, namespace: "stub" }));
    b.onLoad({ filter: /.*/, namespace: "stub" }, (a) => ({ contents: /Probe$/.test(a.path) ? `export const Probe = () => null;` : `export const loadFont = () => ({ fontFamily: "stub", waitUntilDone: () => Promise.resolve() });`, loader: "js" }));
  } };
  const tmp = path.join(video, "scratchpad", `.stylecheck_${process.pid}.cjs`);
  const r = await esbuild.build({
    stdin: { contents: `export { JOURNEY } from "./Video"; export { camPath } from "./world";`, resolveDir: mod, loader: "ts" },
    bundle: true, platform: "node", format: "cjs", write: false, jsx: "automatic", logLevel: "silent",
    external: ["react", "react/*", "react-dom", "remotion", "remotion/*", "@remotion/*"],
    loader: { ".svg": "text", ".png": "dataurl", ".jpg": "dataurl", ".json": "json" },
    plugins: [stub],
  });
  fs.mkdirSync(path.dirname(tmp), { recursive: true });
  fs.writeFileSync(tmp, r.outputFiles[0].text);
  try { const mod_ = createRequire(tmp)(tmp); J = mod_.JOURNEY; camPathV = mod_.camPath; } finally { fs.rmSync(tmp, { force: true }); }
  if (!J || !Array.isArray(J.PLACES) || !J.PLACES.length || typeof J.capScale !== "function") {
    console.log(`✗ REFUSED — ${mods[0]}/Video.tsx does not export JOURNEY { PLACES, DUR_OF, MOVES, CAP, capScale, chipAt, CHIPS, ARRIVE, TRACK, THRU, PUSH_Z, SLIDE_X, HERO_ON, TOTAL } (STYLE §15.1)`);
    process.exit(1);
  }
}
section("SCENES", checkScenes(J), `${J.PLACES.length} places, longest ${Math.max(...J.PLACES.map((p, i) => ((J.PLACES[i + 1]?.t0 ?? J.THRU[0]) - p.t0) / FPS)).toFixed(2)} s`);
// (from Video 10, the demo anchor's ONE light frame — STYLE §4.1; earlier films keep the 1-in-3 cadence they were built to)
const VIDEO_NUM = Number((path.basename(video).match(/^Video (\d+)/) ?? [])[1] ?? NaN);
if (/^Video /.test(path.basename(video)) && !Number.isFinite(VIDEO_NUM)) { console.log(`✗ REFUSED — could not read the video's number from "${path.basename(video)}"`); process.exit(1); }
const DEMO_ANCHOR = Number.isFinite(VIDEO_NUM) && VIDEO_NUM >= 10;
section("WHITE", DEMO_ANCHOR ? checkWhiteDemo(J) : checkWhite(J), `${J.PLACES.filter((p) => p.white).map((p) => p.id).join(", ")}${DEMO_ANCHOR ? " (the demo anchor: one light frame)" : ""}`);
section("CAMERA", checkCamera(J, Number.isFinite(VIDEO_NUM) && VIDEO_NUM >= 11), `${J.MOVES.length} moves`);
// ★★★ PHRASE (Video 12 on — Timur, 2026-10-18, STYLE §16: "the camera should follow the visuals more… zoom in, move, zoom out… scenes
// that simply hold the camera still on a visual for too long are boring"): every place's hold of ≥ 96 f is a phrase of ≥ 2 keys that comes
// IN (a key ≥ 0.1 nearer) and goes back OUT after it (a later key ≥ 0.08 wider) — unless the next place is a travel that carries the
// phrase on (its out comes there). The close (the last place) is the house close. Proven on three canaries before it judges the film.
function checkPhrase(J) {
  const out = [];
  J.PLACES.forEach((p, i) => {
    if (i === J.PLACES.length - 1) return;
    const lo = J.ARRIVAL_END[i] + 1, hi = (J.PLACES[i + 1]?.t0 ?? J.TOTAL) - 1, ks = J.KEYS[i] ?? [];
    if (hi - lo < 96) return;
    if (ks.length < 2) { out.push(`${p.id}: a ${hi - lo}-f hold on ${ks.length} camera key(s) — a hold this long is phrased IN → MOVE → OUT`); return; }
    const zs = ks.map((k) => k.dz), mx = Math.max(...zs), iMax = zs.indexOf(mx);
    if (mx < 0.1) out.push(`${p.id}: its phrase never comes IN (its nearest key is dz ${mx}; rule ≥ 0.1)`);
    if (!zs.slice(iMax + 1).some((z) => mx - z >= 0.08) && !J.PLACES[i + 1]?.moves) out.push(`${p.id}: its phrase never goes back OUT (no key ≥ 0.08 wider after its nearest)`);
  });
  return out;
}
if (Number.isFinite(VIDEO_NUM) && VIDEO_NUM >= 12) {
  const fake = (keys, nextMoves = false) => ({ PLACES: [{ id: "a" }, { id: "b", kind: "slideR" }, { id: "c", kind: "push", ...(nextMoves ? { moves: [{}] } : {}) }, { id: "q", kind: "slideL" }],
    ARRIVAL_END: [30, 148, 456, 548], KEYS: [[], keys, [], []], TOTAL: 900 });
  // (a holds 31–99 and c 457–499, too short to be judged; b holds 149–399, 250 f — the place under test; q is the close)
  const F = (keys, nextMoves) => { const j = fake(keys, nextMoves); j.PLACES[1].t0 = 100; j.PLACES[2].t0 = 400; j.PLACES[3].t0 = 500; return checkPhrase(j).length > 0; };
  const canaries = [
    ["one long drift on a 150-f hold fires", F([{ dz: 0.06 }]), true],
    ["in → move → out is quiet", F([{ dz: 0.15 }, { dz: 0.15 }, { dz: 0 }]), false],
    ["in → move with no out (next place not a travel) fires", F([{ dz: 0.15 }, { dz: 0.14 }]), true],
  ];
  // ★ GLIDE (Timur, 2026-10-18: "make the camera movement a little smoother… Apply those changes to the style"): every camera key's move
  // glides (the sine in-out) — a key on SETTLE starts and lands harder
  const checkGlide = (J) => J.KEYS.flat().filter((k) => !J.MOVES.some((m) => m.t0 === k.from && m.t1 === k.to && m.curve === "glide")).map((k) => `a camera key ${k.from}–${k.to} does not glide (STYLE §16 2026-10-18)`);
  canaries.push(
    ["a gliding key is quiet", checkGlide({ KEYS: [[{ from: 10, to: 50 }]], MOVES: [{ t0: 10, t1: 50, curve: "glide" }] }).length > 0, false],
    ["a key on SETTLE fires", checkGlide({ KEYS: [[{ from: 10, to: 50 }]], MOVES: [{ t0: 10, t1: 50 }] }).length > 0, true],
  );
  const broken = canaries.filter(([, got, want]) => got !== want);
  section("PHRASE", broken.length ? broken.map(([n]) => `the phrase check failed its canary: ${n}`) : [...checkPhrase(J), ...checkGlide(J)], "every long hold comes IN, moves, and goes OUT, every key glides (5 canaries ok)");
}
section("CAPTION", checkCaption(J), `${J.TOTAL} frames scanned`);
{
  if (typeof camPathV !== "function") { console.log("✗ REFUSED — world.tsx exports no camPath"); process.exit(1); }
  // the canaries above need a camPath: run them now against the video's own engine, then judge the film
  const bad2 = [];
  const hard = { ...J, MOVES: [{ t0: 100, t1: 140, d: { x: 1020 }, ease: "out" }] };
  if (!checkSmooth(hard, camPathV).out.length) bad2.push("smooth canary: a slide starting at full speed was not flagged");
  if (checkSmooth({ ...J, MOVES: [{ t0: 100, t1: 148, d: { x: 1020 }, ease: "io" }, { t0: 300, t1: 356, d: { z: 1.25 }, ease: "zoom" }] }, camPathV).out.length) bad2.push("smooth canary: SETTLE moves were flagged");
  const FASTV = Number.isFinite(VIDEO_NUM) && VIDEO_NUM >= 11;
  if (FASTV) {
    // the Style 3 films' speed must pass SMOOTH on their own curve (a 1,224-px slide over 32 f, a push over 36 f), and SETTLE at that
    // speed must not (it is why the fast curve exists)
    if (checkSmooth({ ...J, MOVES: [{ t0: 100, t1: 148, d: { x: 1224 }, ease: "io" }, { t0: 100, t1: 148, d: { z: -0.08 }, ease: "arc" }, { t0: 300, t1: 356, d: { z: 1.25 }, ease: "zoom" }] }, camPathV).out.length) bad2.push("smooth canary: a 48 f slide with its depth arc, and a 56 f push, were flagged");
    if (!checkSmooth({ ...J, MOVES: [{ t0: 100, t1: 132, d: { x: 1224 }, ease: "io" }] }, camPathV).out.length) bad2.push("smooth canary: a 32 f SETTLE slide (a jolt) was not flagged");
    // STILL must fire on a hold with no camera move, and stay silent when a key glides through it
    const two = [{ t0: 60, t1: 92, d: { x: 1020 }, ease: "io" }, { t0: 300, t1: 332, d: { x: 1020 }, ease: "io" }];
    const Jc = (extra) => ({ ...J, ARRIVE: [0, 30], THRU: [340, 380], MOVES: [{ t0: 0, t1: 30, d: { z: 0.3 }, ease: "out" }, ...two, { t0: 30, t1: 60, d: { z: 0.04 }, ease: "zoom", curve: "glide" }, { t0: 92, t1: 300, d: {}, ease: "io" }, ...extra, { t0: 332, t1: 380, d: { z: 0.3 }, ease: "zoom", curve: "fast" }] });
    if (!checkStill(Jc([]), camPathV).out.length) bad2.push("still canary: a 208 f hold with no camera move was not flagged");
    if (checkStill(Jc([{ t0: 93, t1: 299, d: { x: 60, z: 0.06 }, ease: "zoom", curve: "glide" }]), camPathV).out.length) bad2.push("still canary: a hold a key glides through was flagged");
  }
  if (bad2.length) { console.log("✗ THE CHECKER IS BROKEN — " + bad2.join("; ")); process.exit(1); }
  const { out, worst } = checkSmooth(J, camPathV);
  section("SMOOTH", out, `worst acceleration ${worst.xy.toFixed(1)} px/f², depth ${worst.z.toFixed(4)}/f² (${FASTV ? 4 : 2} canaries ok)`);
  if (FASTV) {
    const st = checkStill(J, camPathV);
    section("STILL", st.out, `the camera never stands still more than ${FASTR.still} f (longest ${st.worst} f; 2 canaries ok)`);
  }
}

// TYPE + COLOUR over the video's own files (the engine is judged by ENGINE)
const placesDir = path.join(mod, "places");
const own = [
  ...(fs.existsSync(placesDir) ? fs.readdirSync(placesDir).filter((f) => f.endsWith(".tsx")).map((f) => ({ name: `places/${f}`, text: rd(path.join(placesDir, f)), objects: false })) : []),
  ...["Video.tsx", "fg.tsx"].filter((f) => fs.existsSync(path.join(mod, f))).map((f) => ({ name: f, text: rd(path.join(mod, f)), objects: f === "fg.tsx" })),
];
if (!own.some((o) => o.name.startsWith("places/"))) { console.log(`✗ REFUSED — no places/*.tsx in ${mods[0]}/`); process.exit(1); }
{
  const { out, seen } = checkType(own);
  if (!seen.helpers) out.push(`no figure()/label()/mono() calls found at all — the parser is blind; refusing`);
  section("TYPE", out, `${seen.helpers} helper calls in ${own.length} files`);
}
{
  const { out, reds, seen } = checkColour(own);
  if (!seen.n) out.push(`no colours found at all — the parser is blind; refusing`);
  section("COLOUR", out, `${seen.n} colours; red used on ${reds.length} lines (each must be a loss, a fall or a drop — STYLE §2.4)`);
  for (const r of reds) console.log(`    · red: ${r}`);
  const ex = own.flatMap(({ name, text }) => text.split("\n").map((l, i) => (/style-exempt:/.test(l) ? `${name}:${i + 1} ${l.trim().slice(0, 120)}` : null)).filter(Boolean));
  for (const e of ex) console.log(`    · exempt: ${e}`);
}
section("STAGE", checkStage(rd(path.join(mod, "Video.tsx"))));
{
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
  const texts = walk(srcDir).filter((p) => /\.(tsx?|json|css|md)$/.test(p)).map((p) => ({ name: path.relative(video, p), text: rd(p) }));
  const pub = path.join(video, "public");
  const names = fs.existsSync(pub) ? walk(pub).map((p) => ({ name: path.relative(video, p), text: path.basename(p) })) : [];
  section("BRAND", checkBrand([...texts, ...names]), `${texts.length} source files, ${names.length} public names`);
}

// KINDS — from Video 6 on (the rule's date); older films are listed, not judged
{
  const num = Number((path.basename(video).match(/^Video (\d+)/) ?? [])[1] ?? NaN);
  const files = own.filter((o) => o.name.startsWith("places/") && !/registry\.tsx$/.test(o.name));
  const { out, seen, exempt } = checkKinds(files);
  const note = seen.map(([n, k]) => `${n.replace(/^places\//, "").replace(/\.tsx$/, "")} ${k.join("+")}`).join(" · ");
  if (Number.isFinite(num) && num < 6) console.log(`· KINDS — not judged (Video ${num} predates STYLE §10.2's kind rule)${note ? `: ${note}` : ""}`);
  else {
    if (!files.length) out.push("no place files to judge — refusing");
    section("KINDS", out, note);
    for (const e of exempt) console.log(`    · ${e}`);
  }
}

console.log(fails.length ? `\nREFUSED — ${fails.length} rule${fails.length > 1 ? "s" : ""} broken (Bankers/STYLE.md)` : `\nCLEAN — ${path.basename(video)} follows every [CHECK] rule in Bankers/STYLE.md`);
process.exit(fails.length ? 1 : 0);
