// ══ THE SFX END SWEEP (user, 2026-10-07, V34: "in the scene at 17 seconds, the sound effect stops at the wrong time. Make it
//    keep playing. Ensure that there aren't any more issues with SFX in the rest of the video") ═══════════════════════════
// The timing sweep (sfxsweep33.py) judges where each cue STARTS. Nothing judged where it STOPS — so the certificate's chain,
// a 90-f file under a 139-f printing, ran out at FULL level with two names still to print, and every check passed.
//
// For every cue (copies of one held sound judged as ONE), from the live cue list (cuedump.mjs → out/cues.json) and the
// WAVs' own per-frame envelopes:
//   EARLY  a PROCESS sound (chain / data family) goes quiet (−24 dB re its file's peak) more than 6 f before its visual
//          ends (`to`). Gestures (whooshes) are listed with their margin, never silently: an ease-out's slow tail is
//          meant to be quiet, so they are judged by eye from the list.
//   LOUD   a file we CUT (sound left in it) under a fade of < 5 f while its last 3 frames peak within 12 dB of its loudest.
//   SEAM   a held sound dips > 6 dB at a crossfade seam against the frames either side.
//   BEAT   a sound still audible after its beat has ended (cues.json `beatEnd`, when present).
// ⚠ It MIRRORS SfxLayer's ramp math (linear fades; equal-power when `xf`). The canaries are built by the page with the REAL
//   builders (cuedump.mjs → out/cue_canary.json) and must come out as stated before a single real cue is judged:
//   bad (run out) → EARLY · early (faded too soon) → EARLY · good (held) → clean · loud (cut unfaded) → LOUD · quiet → clean.
//   node scratchpad/sfxends.mjs
import fs from "fs";

const FPS = 30;
const wav = (name) => {
  const b = fs.readFileSync(`public/sfx/${name}.wav`);
  let o = 12, fmt = null, data = null;
  while (o < b.length - 8) {
    const id = b.toString("ascii", o, o + 4), sz = b.readUInt32LE(o + 4);
    if (id === "fmt ") fmt = { ch: b.readUInt16LE(o + 10), sr: b.readUInt32LE(o + 12), bits: b.readUInt16LE(o + 22) };
    if (id === "data") data = b.subarray(o + 8, o + 8 + sz);
    o += 8 + sz + (sz & 1);
  }
  if (!fmt || !data || fmt.bits !== 16) throw new Error(`REFUSED: ${name}.wav is not 16-bit PCM`);
  const n = data.length / 2 / fmt.ch, hop = fmt.sr / FPS, pw = [];
  for (let k = 0; (k + 1) * hop <= n + 1e-6; k++) {
    let s = 0, c = 0;
    for (let i = Math.floor(k * hop); i < Math.min(n, Math.floor((k + 1) * hop)); i++) {
      let v = 0;
      for (let ch = 0; ch < fmt.ch; ch++) v += data.readInt16LE((i * fmt.ch + ch) * 2);
      v /= fmt.ch; s += v * v; c++;
    }
    pw.push(c ? s / c : 0);
  }
  const pk = Math.max(...pw);
  return pw.map((p) => p / pk);   // per-frame power re the file's loudest frame
};
const ENV = {};
const env = (s) => (ENV[s] ??= wav(s));
const dB = (p) => (p > 0 ? 10 * Math.log10(p) : -200);
const PROCESS = new Set(["chain", "chainshort", "data", "datamid", "datashort"]);

/** the rendered power of one cue at each absolute frame (the SfxLayer mirror) */
const render = (c, into) => {
  const e = env(c.s), dur = c.dur ?? e.length, fade = c.fade ?? 0, fadeIn = c.fadeIn ?? 0, skip = c.skip ?? 0;
  const at0 = Math.round(c.at), trim = Math.max(0, -(at0 - 1));
  const shape = (r) => (c.xf ? Math.sin((Math.PI / 2) * r) : r);
  for (let k = trim; k < dur; k++) {
    const f = k - trim;   // the Sequence's own frame
    const g = (fade > 0 ? shape(Math.max(0, Math.min(1, (dur - trim - f) / fade))) : 1) *
              (fadeIn > 0 ? shape(Math.max(0, Math.min(1, (f + trim) / fadeIn))) : 1);
    const p = (e[skip + k] ?? 0) * g * g;
    into.set(at0 + k, (into.get(at0 + k) ?? 0) + p);
  }
};

/** judge one sound (a cue, or the copies of one held sound) */
const judge = (copies) => {
  const c0 = copies[0], m = new Map();
  copies.forEach((c) => render(c, m));
  const frames = [...m.keys()].sort((a, b) => a - b);
  const lastF = frames[frames.length - 1];
  const audible = frames.filter((f) => dB(m.get(f)) > -24);
  const audEnd = audible.length ? audible[audible.length - 1] + 1 : frames[0];
  // ★ a DEAD STOP is a file we CUT (sound left in it past the cue) whose last 3 frames still peak within 12 dB of the file's
  //   loudest. Three frames, not one: `data` pulses frame to frame (−3.5, −7.7, −23.6, −2.6 dB…), so one frame says nothing.
  //   A file's own ending is the sound designer's (`chain`'s last clank decays −7 → −15 → −34 dB into silence) — not ours.
  const lastC = copies[copies.length - 1], le = env(lastC.s);
  const fileEnd = le.reduce((a, p, i) => (dB(p) > -60 ? i + 1 : a), 0);
  const truncated = (lastC.skip ?? 0) + (lastC.dur ?? le.length) < fileEnd - 1;
  const nz = frames.filter((f) => dB(m.get(f)) > -60);
  const tailF = nz.length ? nz[nz.length - 1] : lastF;
  // the FILE's level (before our fade) over the last 3 frames we play of it — what the cut interrupts — and the fade it got:
  //   a cut under a fade of ≥ 5 f (167 ms) is a release, not a stop; a shorter one, on a loud stretch, is a dead stop
  const lastDur = lastC.dur ?? le.length, lastSkip = lastC.skip ?? 0;
  const endLvl = Math.max(...[1, 2, 3].map((d) => dB(le[lastSkip + lastDur - d] ?? 0)));
  const shortFade = (lastC.fade ?? 0) < 5;
  const to = c0.to;
  const out = { s: c0.s, at: Math.round(c0.at), n: copies.length, last: lastF + 1, audEnd, endLvl, to, flags: [] };
  // ≤ 6 f (0.2 s): a 10-f fade cut on the visual's last frame goes quiet ~3 f before it — that is the fade, not a stop
  if (to !== undefined && PROCESS.has(c0.s) && audEnd < to - 6) out.flags.push(`EARLY: quiet at f${audEnd}, ${to - audEnd} f before its visual ends (f${to})`);
  if (truncated && shortFade && endLvl > -12) out.flags.push(`LOUD: cut at ${endLvl.toFixed(1)} dB re its peak at f${tailF + 1} under a ${lastC.fade ?? 0}-f fade (a dead stop)`);
  // ★ V37 (2026-10-13): judged on the 3-FRAME PEAK, not one frame. `data` ticks every 3 frames (−3, −18, −8 dB…), so a
  //   single frame at the seam could land in a tick's gap and read as an 11.7-dB dip that no ear hears. A real seam dip — a
  //   copy restarting on a silent lead-in — lasts far longer than 3 frames and still fires (canary seamBad, below).
  const pk3 = (f) => dB(Math.max(m.get(f - 1) ?? 0, m.get(f) ?? 0, m.get(f + 1) ?? 0));
  for (const c of copies.slice(1)) {
    const sc = Math.round(c.at) + Math.round((c.fadeIn ?? 0) / 2);
    const around = [-12, -9, 9, 12].map((d) => pk3(sc + d));
    const ref = around.reduce((a, b) => a + b, 0) / around.length, here = pk3(sc);
    if (here < ref - 6) out.flags.push(`SEAM: dips ${(ref - here).toFixed(1)} dB at f${sc}`);
  }
  if (c0.beatEnd !== undefined && audEnd > c0.beatEnd + 2) out.flags.push(`BEAT: audible to f${audEnd}, past its beat's end (f${c0.beatEnd})`);
  return out;
};
const groups = (cues) => {
  const g = new Map();
  cues.forEach((c, i) => { const k = c.grp ?? `#${i}`; g.set(k, [...(g.get(k) ?? []), c]); });
  return [...g.values()];
};

// ── the canaries: the judge must see what each was built to show ──
const can = JSON.parse(fs.readFileSync("out/cue_canary.json", "utf8"));
const kinds = (r) => r.flags.map((f) => f.split(":")[0]).sort().join("+") || "clean";
const expect = { bad: "EARLY", early: "EARLY", good: "clean", loud: "LOUD", quiet: "clean" };
let refuse = false;
for (const [k, want] of Object.entries(expect)) {
  if (!can[k]) { console.error(`REFUSED: canary "${k}" missing`); process.exit(1); }
  const rs = groups(can[k]).map(judge);
  const got = rs.map(kinds).join(" | ");
  const ok = got === want;
  console.log(`canary ${k.padEnd(5)} → ${got.padEnd(10)} ${ok ? "✓" : `✗ (want ${want})`}${rs[0].flags.length ? "   " + rs[0].flags.join("; ") : ""}`);
  if (!ok) refuse = true;
}
// ★ the seam canaries (V37): a held airwoosh whose second copy restarts at the file's start (19 silent lead-in frames) MUST
//   dip; the same hold restarting past the lead-in, and a held data tick (it pulses every 3 frames), must NOT
const seamHold = (s, skip) => [{ s, at: 0, dur: 40, fade: 10, xf: true, grp: "c", to: 90, skip: 0, fadeIn: 0 },
  { s, at: 30, dur: 50, fade: 10, xf: true, grp: "c", to: 90, skip, fadeIn: 10 }];
const seamKinds = (cs) => judge(cs).flags.filter((x) => x.startsWith("SEAM")).length;
const seamBad = seamKinds(seamHold("airwoosh", 0)), seamOk = seamKinds(seamHold("airwoosh", 19));
const pulse = [0, 1, 2, 3, 4, 5].some((ph) => seamKinds([{ s: "data", at: 0, dur: 66, fade: 10, xf: true, grp: "d", to: 140, skip: 0, fadeIn: 0 },
  { s: "data", at: 56 + ph, dur: 60, fade: 10, xf: true, grp: "d", to: 140, skip: 9, fadeIn: 10 }]) > 0);
console.log(`canary seamBad → ${seamBad ? "SEAM" : "clean"} ${seamBad ? "✓" : "✗ (want SEAM)"}   seamOk → ${seamOk ? "SEAM ✗" : "clean ✓"}   data pulse, 6 phases → ${pulse ? "SEAM ✗" : "clean ✓"}`);
if (!seamBad || seamOk || pulse) refuse = true;
if (refuse) { console.error("REFUSED: a canary came out wrong — the judge is not to be trusted"); process.exit(1); }

// ── the film ──
const cues = JSON.parse(fs.readFileSync("out/cues.json", "utf8"));
const rs = groups(cues).map(judge).sort((a, b) => a.at - b.at);
let bad = 0;
console.log(`\n${rs.length} sounds (${cues.length} cues):`);
for (const r of rs) {
  const margin = r.to !== undefined ? `${r.audEnd - r.to >= 0 ? "+" : ""}${r.audEnd - r.to} f vs visual end f${r.to}` : "decay (no visual end)";
  const mark = r.flags.length ? "✗" : " ";
  console.log(`${mark} f${String(r.at).padStart(4)}  ${r.s.padEnd(10)} ${r.n > 1 ? `×${r.n} held` : "      "}  audible to f${String(r.audEnd).padStart(4)}  ends ${r.endLvl.toFixed(0).padStart(4)} dB  ${margin}`);
  for (const f of r.flags) console.log(`        ${f}`);
  bad += r.flags.length;
}
console.log(bad ? `\n✗ ${bad} SFX end problem(s)` : `\n✓ SFX ends clean: every process sound runs to its visual's end, nothing stops loud, every seam holds`);
process.exit(bad ? 1 : 0);
