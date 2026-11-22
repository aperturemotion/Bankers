// STYLE 3 RULE CHECK for VIDEO 35 ("PayPal Got Richer. The Stock Lost 82%.").   node scratchpad/stylecheck.mjs
//
// Greps the source for the identity rules in test/resources3/style3-preferences.md that can be
// checked statically (the active look: Videos 12 + 9 — spec §1–§6), and checks the scene plan for
// overlapping mounts.
//
// ⚠ THIS DOES NOT REPLACE LOOKING AT STILLS. It catches the classes of mistake that are invisible
// in a spot check — a text-shadow buried in one component, a hue that escaped the palette — not
// whether a frame is well composed.
//
// ★ THE MODULE LIST IS DERIVED FROM DISK, never typed. V12's copy of this file still listed six
// modules this film deleted, and its layout check filtered for file names ("beats", "charts")
// that do not exist here — so it scanned NOTHING and reported clean. A list that cannot see a new
// file is the V13 lesson ("the stylecheck was only reading half the film").
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const MOD = "src/bnx";
const KIT = new Set(["anim.ts", "backdrops.tsx", "fonts.ts", "s3.tsx", "stage.tsx", "swoop.tsx", "text.tsx",
  "theme.ts", "SfxLayer.tsx", "captions.ts", "data.ts"]);
const ALL = fs.readdirSync(path.join(root, MOD)).filter((f) => /\.tsx?$/.test(f));
/** the film's own modules — every beat file plus kit.tsx and the composition */
const SRC = ALL.filter((f) => !KIT.has(f)).map((f) => `${MOD}/${f}`);
if (SRC.length < 6) throw new Error(`stylecheck: only ${SRC.length} film modules found in ${MOD} — refusing to report on a partial film`);

let fail = 0, warn = 0;
const bad = (m) => { console.log("  ✗ " + m); fail++; };
const soft = (m) => { console.log("  ⚠ " + m); warn++; };
const ok = (m) => console.log("  ✓ " + m);

const lines = [];
for (const f of SRC) read(f).split("\n").forEach((t, i) => lines.push({ f, n: i + 1, t }));
/** source lines that are not comments */
const code = lines.filter((l) => {
  const t = l.t.trim();
  return t && !t.startsWith("//") && !t.startsWith("*") && !t.startsWith("/*") && !t.startsWith("{/*");
});

console.log(`STYLE 3 RULE CHECK — Video 38  (${SRC.length} modules: ${SRC.map((s) => path.basename(s)).join(", ")})\n`);

// ── 1 · TYPE IS COMPLETELY FLAT ────────────────────────────────────────────────────────────────
// ⚠ ONE grandfathered exception, by the spec (§5): BrandClose's "bps" halo — the fixed channel
// close, byte-identical across films. Exempted BY CONTENT, so a second textShadow in close.tsx
// still fails.
{
  console.log("1. type is flat (no text-shadow, no -webkit-text-stroke)");
  const hits = code.filter((l) => /textShadow|WebkitTextStroke|textStroke/.test(l.t)
    && !(/close\.tsx/.test(l.f) && /textShadow: `0 0 \$\{34 \* halo\}px/.test(l.t)));
  if (!hits.length) ok("no text-shadow or stroke anywhere (BrandClose's lockup halo grandfathered)");
  for (const h of hits) bad(`${h.f}:${h.n} — ${h.t.trim().slice(0, 78)}`);
}

// ── 2 · OBJECTS HAVE NO OUTLINES ───────────────────────────────────────────────────────────────
// "No outlines, no hard drop shadows." An `inset 0 0 0 Npx` box-shadow is an outline — except on
// struck metal and engraved notes, where the ring IS the object (the milled rim, V13's exemption).
{
  console.log("\n2. objects carry no outlines (inset 0 0 0 Npx rings)");
  // the coin's milled rim, the notes' border (V41: money.tsx's NoteFace — the $100's paper edge catching the light)
  const STRUCK = (l) => /mech\.tsx/.test(l.f) || (/money\.tsx$/.test(l.f) && /rgba\(255,255,255,0\.22\)/.test(l.t));
  const hits = code.filter((l) => /inset 0 0 0 \$?\{?[0-9(]/.test(l.t) && !STRUCK(l));
  if (!hits.length) ok("no ring outlines outside struck metal");
  for (const h of hits) soft(`${h.f}:${h.n} — ${h.t.trim().slice(0, 78)}`);
}

// ── 3 · THE FIELD IS FLAT ──────────────────────────────────────────────────────────────────────
{
  console.log("\n3. the field carries no grain / noise / vignette / global grid");
  const hits = code.filter((l) => /(noise|grain|vignette)\s*[:(]/i.test(l.t));
  if (!hits.length) ok("clean");
  for (const h of hits) bad(`${h.f}:${h.n} — ${h.t.trim().slice(0, 78)}`);
}

// ── 4 · NO BANNED TRANSITIONS ──────────────────────────────────────────────────────────────────
{
  console.log("\n4. no glitch / whip / wipe / zoom-blur / RGB split");
  const hits = code.filter((l) => /glitch|whipPan|rgbSplit|chromaticAberration/i.test(l.t));
  if (!hits.length) ok("clean");
  for (const h of hits) bad(`${h.f}:${h.n} — ${h.t.trim().slice(0, 78)}`);
}

// ── 5 · CHROMA BUDGET — platinum on black, red the only colour (spec §1) ───────────────────────
// ★ V30 SPENDS RED ONCE, ON ONE MEANING (spec §1 allows ≤2): the consumer-sentiment line — "how Americans
// feel", the jaws' falling half — in the hook, the two-charts panel and the calm reprise (jaws.tsx,
// record.tsx). It is the one genuinely negative state (the second-lowest reading in 74 years). Nothing else
// may carry red, and nothing may carry any other hue (the lens flare's ghosts are FLARE_INK, exempted below).
{
  console.log("\n5. chroma budget — platinum + the one reserved red");
  const hex = new Map();
  // ⚠ kit.tsx's FLAG_INK block is the spec's sanctioned exception (real flags, brief-driven only).
  // It is exempt as a BLOCK — and section 6 asserts no FlagChip is drawn, so the exemption cannot
  // hide a flag that actually reaches the screen.
  const kitSrc = read(`${MOD}/kit.tsx`).split("\n");
  const flagA = kitSrc.findIndex((t) => /^(export )?const FLAG_INK = \{/.test(t)) + 1;
  const flagB = flagA + kitSrc.slice(flagA).findIndex((t) => /^\}(?: as const)?;/.test(t)) + 1;
  if (flagA <= 0 || flagB <= flagA) throw new Error("stylecheck: FLAG_INK block not found in kit.tsx — re-point the exemption");
  const inFlagInk = (l) => /kit\.tsx$/.test(l.f) && l.n >= flagA && l.n <= flagB;
  // ★ flare.tsx's FLARE_INK block is the user's sanctioned exception (2026-09-27: the lens-flare ghosts'
  // amber / blue / green, "just like in the reference photos"). Exempt as a BLOCK, plus the ghost table
  // that reads it — and only inside flare.tsx: any other module naming FLARE_INK is a violation below.
  const flareSrc = read(`${MOD}/flare.tsx`).split("\n");
  const flA = flareSrc.findIndex((t) => /^const FLARE_INK = \{/.test(t)) + 1;
  const flB = flA + flareSrc.slice(flA).findIndex((t) => /^\}(?: as const)?;/.test(t)) + 1;
  if (flA <= 0 || flB <= flA) throw new Error("stylecheck: FLARE_INK block not found in flare.tsx — re-point the exemption");
  const inFlareInk = (l) => /flare\.tsx$/.test(l.f) && ((l.n >= flA && l.n <= flB) || /FLARE_INK\./.test(l.t));
  // ★ V43: data.ts's GOLD_INK block is the user's sanctioned material colour (2026-10-26: "the bar of gold looks like a bar of
  // silver"). Exempt as a BLOCK, plus any line that reads GOLD_INK — every other saturated literal is still a violation.
  const dataSrc = read(`${MOD}/data.ts`).split("\n");
  const giA = dataSrc.findIndex((t) => /^export const GOLD_INK = \{/.test(t)) + 1;
  const giB = giA + dataSrc.slice(giA).findIndex((t) => /^\}(?: as const)?;/.test(t)) + 1;
  if (giA <= 0 || giB <= giA) throw new Error("stylecheck: GOLD_INK block not found in data.ts — re-point the exemption");
  const inGoldInk = (l) => (/data\.ts$/.test(l.f) && l.n >= giA && l.n <= giB) || /GOLD_INK\./.test(l.t);
  // (V37's YELLOWCAKE exemption is gone with its uranium film: V38 has no material-colour exception.)
  // (V39's BRAND_INK exemption is gone with its Coca-Cola / NVIDIA objects: V41 has no brand-colour exception — no logos.)
  for (const l of code) {
    if (inFlagInk(l) || inFlareInk(l) || inGoldInk(l)) continue;
    for (const m of l.t.matchAll(/#([0-9a-fA-F]{6})\b/g)) {
      const h = m[1].toLowerCase();
      const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      const sat = mx === 0 ? 0 : (mx - mn) / mx;
      // ⚠ LUMINANCE FLOOR — saturation is meaningless near black (#0d0f13 scores 0.32)
      if (sat > 0.30 && mx > 90) hex.set("#" + h, (hex.get("#" + h) || []).concat(`${l.f}:${l.n}`));
    }
  }
  // the gold tokens live only in kit.tsx's no-gold-film bullion helpers (checked in 6)
  for (const [h, where] of hex) {
    const onlyRedSpend = where.every((w) => /mech\.tsx/.test(w));
    if (onlyRedSpend) soft(`saturated ${h} inside the red spend (${where.join(", ")}) — confirm it reads as the red`);
    else bad(`saturated ${h} outside the red spend: ${where.slice(0, 3).join(", ")}`);
  }
  if (!hex.size) ok("no saturated hex literals");
  // ★ V30: ONE spend — theme.red may appear in the kit's DEFINITIONS and in the sentiment line's two files
  // (jaws.tsx, record.tsx) only; no hero accent may use the "red" tone.
  // ★ 2026-09-28 (the rigid spec, A6): red is a VERDICT moment — the lows' today rail (split.tsx) and the feel
  // panel on "record low" (record.tsx) only; never the jaws' running series
  // ★ V31: ONE spend — the past year's drop, from the year's high to today (film.tsx PastYear, a verdict span)
  // ★ V32: ONE spend, ONE meaning — Nike's own declines (the −10% bar, China's eight quarters, the two fallen-profit
  //   arrows), all read through common.tsx's LOSS, which is the only line here allowed to name theme.red
  const redLines = code.filter((l) => /theme\.red|tone: "red"/.test(l.t) && !/(theme\.ts|text\.tsx|kit\.tsx|s3\.tsx|SfxLayer\.tsx)$/.test(l.f)
    && !(/common\.tsx$/.test(l.f) && /export const LOSS = theme\.red;/.test(l.t)));
  const okRed = redLines.length === 0;
  console.log(`   ${okRed ? "✓" : "✗"} red only on the two verdict moments (${redLines.map((l) => `${l.f}:${l.n}`).join(", ") || "nowhere else"})`);
  if (!okRed) bad("red appears outside the two verdict moments (the rigid spec, A6)");
  const green = code.filter((l) => /#22c55e|#4ade80|green/i.test(l.t) && !/Pool3D|mixHex/.test(l.t) && !inFlagInk(l) && !inFlareInk(l));
  const flareLeak = code.filter((l) => /FLARE_INK/.test(l.t) && !/flare\.tsx$/.test(l.f));
  for (const x of flareLeak) bad(`${x.f}:${x.n} — FLARE_INK used outside the lens flare`);
  // ★ THE STANDING COUNT (user, 2026-09-27: "1-2 times each video") — read off the composition's FLARES list
  const compSrc = read(`${MOD}/Composition.tsx`);
  const fl = compSrc.match(/^const FLARES(?::[^=]*)? = \[([\s\S]*?)^\];/m);
  const nFlares = fl ? (fl[1].match(/^\s*\{ peak:/gm) ?? []).length : 0;
  const mounted = /FLARES\.map\(\(fl, i\) => <LensFlare/.test(compSrc);
  console.log(`   ${nFlares >= 1 && nFlares <= 2 && mounted ? "✓" : "✗"} lens flares: ${nFlares} (standing: 1–2 per video)${mounted ? "" : " — NOT MOUNTED"}`);
  if (nFlares < 1 || nFlares > 2) bad(`${nFlares} lens flares — the standing rule is 1–2 per video`);
  if (!mounted) bad("the FLARES list is not mounted as <LensFlare> in the composition");
  for (const g of green) bad(`${g.f}:${g.n} — green is not in the active palette: ${g.t.trim().slice(0, 60)}`);
}

// ── 6 · NO GOLD — this is not a film about gold ────────────────────────────────────────────────
{
  console.log("\n6. bullion appears nowhere (no-gold film)");
  const users = [...new Set(lines.filter((l) => /<BarStack|<BullionBar/.test(l.t) && !/kit\.tsx/.test(l.f)).map((l) => l.f))];
  console.log(`   ${users.length === 0 ? "✓" : "✗"} no bullion drawn (${users.join(", ") || "none"})`);
  if (users.length) bad("bullion drawn in a no-gold film: " + users.join(", "));
  // the flag palette is exempt from section 5 only because no COUNTRY flag is drawn — prove it
  const flags = [...new Set(lines.filter((l) => /<FlagChip/.test(l.t) && !/kit\.tsx/.test(l.f)).map((l) => l.f))];
  console.log(`   ${flags.length === 0 ? "✓" : "✗"} no country flag drawn (${flags.join(", ") || "none"}) — the FLAG_INK exemption holds`);
  if (flags.length) bad("a FlagChip is drawn — the brief does not sanction country flags in this film: " + flags.join(", "));
  // ★ G6 (user, 2026-09-29: "46 sec use real democrat and republican flag"): the PARTY flags are sanctioned, in the
  // parties scene only, and their colours come from FLAG_INK by name — any other module reading FLAG_INK is a leak
  const partyUsers = [...new Set(lines.filter((l) => /<PartyFlag/.test(l.t)).map((l) => path.basename(l.f)))];
  const inkUsers = [...new Set(code.filter((l) => /FLAG_INK\./.test(l.t)).map((l) => path.basename(l.f)))];
  const okParty = partyUsers.every((f) => f === "prices.tsx") && inkUsers.every((f) => f === "kit.tsx" || f === "rework.tsx");
  console.log(`   ${okParty ? "✓" : "✗"} party flags only in the parties scene (${partyUsers.join(", ") || "none"}); FLAG_INK read in ${inkUsers.join(", ") || "none"}`);
  if (!okParty) bad("G6 — a party flag or a FLAG_INK token outside the parties scene");
}

// ── 7 · THE INTERPUNCT IS BANNED FROM SCREEN TEXT (rule 36g) ───────────────────────────────────
{
  console.log("\n7. no interpunct in rendered text");
  const dataTs = read(`${MOD}/data.ts`).split("\n").filter((t) => !t.trim().startsWith("//") && !t.trim().startsWith("*"));
  const hits = [
    ...code.filter((l) => /["'`>][^"'`<]*·[^"'`<]*["'`<]/.test(l.t)),
    ...dataTs.filter((t) => /"[^"]*·[^"]*"/.test(t)).map((t) => ({ f: "data.ts", n: "?", t })),
  ];
  if (!hits.length) ok("no \" · \" in any rendered string");
  for (const h of hits) bad(`${h.f}:${h.n} — ${h.t.trim().slice(0, 78)}`);
}

// ── 8 · TWO CONSTRUCTIONS ON STAGE AT ONCE ─────────────────────────────────────────────────────
{
  console.log("\n8. no two constructions mounted at the same time");
  const cap = read(`${MOD}/captions.ts`);
  const grab = (marker) => {
    const i = cap.indexOf(marker), j = cap.indexOf("= [", i) + 2;
    let d = 0;
    for (let k = j; k < cap.length; k++) {
      if (cap[k] === "[") d++;
      else if (cap[k] === "]") { d--; if (!d) return JSON.parse(cap.slice(j, k + 1)); }
    }
  };
  const SEN = grab("export const SENTENCES");
  const HEROES = grab("export const HEROES");
  const TOTAL = Number(cap.match(/TOTAL_FRAMES = (\d+)/)[1]);
  const BANNER_END = Number(cap.match(/BANNER_END = (\d+)/)[1]);
  const comp = read(`${MOD}/Composition.tsx`);
  const LEAD = Number((comp.match(/^const LEAD = (\d+);/m) ?? [])[1]);
  if (!Number.isFinite(LEAD)) throw new Error("stylecheck: could not read LEAD out of Composition.tsx");
  const sen = (sc, n) => SEN.filter((s) => s.scene === sc)[n];
  const cut = (sc, n) => sen(sc, n).at - LEAD;
  // ⚠ same signatures as the composition's: heroPaint(scene, n) — a scene can carry two heroes (the
  // one-argument copy here silently resolved nuance's SECOND hero to its first) — and mid()
  const heroPaint = (sc, n = 0) => HEROES.filter((h) => h.scene === sc)[n].paint;
  const mid = (sc, n, off) => sen(sc, n).at + off;
  const PSTART = comp.indexOf("const P = {");
  const planSrc = comp.slice(PSTART, comp.indexOf("\n};", PSTART));
  // ★ V33: the plan may cut on a WORD inside a sentence — the composition's cue / cueAny, read off the same captions
  const WORDS_ALL = grab("export const WORDS");
  const SCENE_OF = JSON.parse(cap.match(/const SCENE_OF(?::[^=]*)? = (?:\(\/\* unused pure expression or super \*\/ null && \()?(\[[^\]]*\])/)[1]);
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9$%&]/g, "");
  const cue = (sc, word, occ = 1) => {
    let seen = 0;
    for (let i = 0; i < WORDS_ALL.length; i++) if (SCENE_OF[i] === sc && norm(WORDS_ALL[i].word) === norm(word) && ++seen === occ) return WORDS_ALL[i].at;
    throw new Error(`cue: no "${word}" in ${sc}`);
  };
  const cueAny = (sc, ...ws) => { for (const x of ws) { try { return cue(sc, x); } catch { /* the next spelling */ } } throw new Error(`cueAny: none of ${ws.join(" / ")} in ${sc}`); };
  const plan = [...planSrc.matchAll(/^  (\w+): \{ at: (.+?), end: (.+?) \},?$/gm)].map((m) => {
    // V35: the plan's close/brand bounds read LAST_WORD_END (the generated captions' own table)
    const LWE = JSON.parse(cap.match(/LAST_WORD_END(?::[^=]*)? = (\{[^}]*\})/)[1]);
    const ev = (x) => Function("cut", "mid", "cue", "cueAny", "heroPaint", "LEAD", "BANNER_END", "TOTAL_FRAMES", "LAST_WORD_END", "return " + x)(
      cut, mid, cue, cueAny, heroPaint, LEAD, BANNER_END, TOTAL, LWE);
    return { id: m[1], at: ev(m[2]), end: ev(m[3]) };
  });
  const declared = (planSrc.match(/^  \w+: \{/gm) ?? []).length;
  if (plan.length !== declared) bad(`parsed ${plan.length} of ${declared} plan entries — the plan format changed`);
  // the mount guard is `f >= at - 2 && f < end + 2`, so a 4-frame kiss at each boundary is by
  // design (the outgoing one is fully off-frame by then); anything longer is two beats sharing
  const sorted = [...plan].sort((a, b) => a.at - b.at);
  let clashes = 0;
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const o = Math.min(sorted[i].end + 2, sorted[j].end + 2) - Math.max(sorted[i].at - 2, sorted[j].at - 2);
      if (o > 5) { bad(`"${sorted[i].id}" and "${sorted[j].id}" share ${o} frames on stage`); clashes++; }
    }
  }
  if (!clashes) ok(`${plan.length} constructions, none overlapping beyond the 4-frame handover`);
}

// ── 9 · ★★★ THE RIGID SPEC (V27–V29), the checkable half (style3-preferences.md, "THE RIGID SPEC") ──
// The user, 2026-09-28: "ensure that the video completely matches the recent 100bps style … create more rigid and
// specific rules". Each rule below is the measured range of V27, V28 and V29 (test/resources3/ref-specs/).
{
  console.log("\n9. the rigid spec (V27–V29)");
  const nums = (re) => code.flatMap((l) => [...l.t.matchAll(re)].map((m) => ({ v: Number(m[1]), at: `${path.basename(l.f)}:${l.n}` })));
  const SCENES = (l) => !/(kit|close|Probe)\.tsx$/.test(l);
  // C4 · figures 58–104 px at most (the only larger text is the brand lockup, which is not a figure() call)
  const figs = nums(/\bfigure\((\d+)/g).filter((x) => x.v > 104);
  figs.length ? figs.forEach((x) => bad(`C4 figure ${x.v} px > 104 (${x.at})`)) : ok("C4 no figure above 104 px");
  // ★ V35 (the style audit, 2026-10-08): C4 covers text PRINTED ON OBJECTS too, and those sizes travel as `size:` in a
  //   DrumStyle (odometers, drums) or `size={…}` on a Flap — `figure(st.size)` hid a 124 px kicker, 132 px flaps and 112 px
  //   tag drums from the literal check above. Read every size literal outside the brand lockup (close.tsx), and prove the
  //   reader on planted fixtures first: a reader that cannot catch a planted 120 is broken, and that is a refusal.
  const SIZE_RES = [/\bsize:\s*(\d+)/g, /\bsize=\{(\d+)\}/g, /\bfontSize[=:]\s*\{?(\d+)/g];
  const sizeHits = (t) => SIZE_RES.flatMap((re) => [...t.matchAll(re)].map((m) => Number(m[1])));
  const planted = sizeHits(`const K: DrumStyle = { size: 120, ink: "#fff", w: 60, h: 130 }; <Flap size={132} /> <text fontSize={140}>`);
  if (!(planted.includes(120) && planted.includes(132) && planted.includes(140))) bad("C4 the printed-size reader missed its planted fixtures (120 / 132 / 140) — refusing to trust it");
  const printed = code.filter((l) => !/close\.tsx$/.test(l.f))
    .flatMap((l) => sizeHits(l.t).map((v) => ({ v, at: `${path.basename(l.f)}:${l.n}` }))).filter((x) => x.v > 104);
  printed.length ? printed.forEach((x) => bad(`C4 printed text ${x.v} px > 104 (${x.at})`)) : ok("C4 no printed text (drums, flaps, SVG) above 104 px — reader proven on planted fixtures");
  // C5 · labels 18–28 px (engraving micro-text inside an object may go to 15 — mark it `/* engraving */`)
  const labs = code.flatMap((l) => [...l.t.matchAll(/\blabel\((\d+)/g)].map((m) => ({ v: Number(m[1]), at: `${path.basename(l.f)}:${l.n}`, eng: /engraving/.test(l.t) })))
    .filter((x) => (x.v < 18 && !(x.eng && x.v >= 15)) || x.v > 28);
  labs.length ? labs.forEach((x) => bad(`C5 label ${x.v} px outside 18–28 (${x.at})`)) : ok("C5 every label 18–28 px");
  // C6 · readouts 24–34 px
  const monos = nums(/\bmono\((\d+)/g).filter((x) => x.v < 24 || x.v > 34);
  monos.length ? monos.forEach((x) => bad(`C6 mono ${x.v} px outside 24–34 (${x.at})`)) : ok("C6 every readout 24–34 px");
  // E2 · Turn: from −5…−8, to +4…+5, sine 0.8–1.1
  const turns = code.filter((l) => /<Turn /.test(l.t)).map((l) => {
    const g = (k) => Number((l.t.match(new RegExp(`${k}=\\{(-?[\\d.]+)\\}`)) ?? [])[1]);
    // ★ V33 (2026-10-06): a MATCH ZOOM's two Turns split one continuous yaw (−6° → 0° → +5°) so the faces meet square-on at
    //   the cut. Each is declared with "E2-MATCH" on the line before it, and the PAIR must still run the whole range.
    // read the RAW line before (the scan strips comments, and the declaration lives in one)
    const prev = (fs.readFileSync(l.f, "utf8").split(/\r?\n/)[l.n - 2]) ?? "";
    return { from: g("from"), to: g("to"), amp: g("amp"), at: `${path.basename(l.f)}:${l.n}`, match: /E2-MATCH/.test(prev) };
  });
  const pair = turns.filter((t) => t.match);
  if (pair.length && (pair.length !== 2 || Math.min(...pair.map((t) => t.from)) > -5 || Math.max(...pair.map((t) => t.to)) < 4))
    bad(`E2 a declared match pair must be exactly two Turns that together run −5…−8 → +4…+5 (found ${pair.length})`);
  else if (pair.length) ok(`E2 match pair declared (${pair.map((t) => t.at).join(" + ")}), together ${Math.min(...pair.map((t) => t.from))}° → ${Math.max(...pair.map((t) => t.to))}°`);
  const badTurn = turns.filter((t) => !t.match).filter((t) => !(t.from >= -8 && t.from <= -5) || !(t.to >= 4 && t.to <= 5) || !(t.amp >= 0.8 && t.amp <= 1.1));
  badTurn.length ? badTurn.forEach((t) => bad(`E2 Turn from ${t.from} to ${t.to} amp ${t.amp} (${t.at}) — must be −5…−8 → +4…+5, 0.8–1.1`))
    : ok(`E2 all ${turns.length} Turns in range`);
  // E4 · entrance rise ≤ 40 px — the born ramp's translate
  const rises = code.flatMap((l) => [...l.t.matchAll(/\(1 - born\) \* (\d+)/g)].map((m) => ({ v: Number(m[1]), at: `${path.basename(l.f)}:${l.n}` })))
    .filter((x) => x.v > 40 && SCENES(x.at));
  rises.length ? rises.forEach((x) => bad(`E4 entrance rises ${x.v} px > 40 (${x.at})`)) : ok("E4 every entrance rises ≤ 40 px");
  // D5 · no glow on a plain stroke: SVG blur filters live only in the line-build kit (ribbon.tsx) and the flare
  const blurs = code.filter((l) => /feGaussianBlur/.test(l.t) && !/(ribbon|flare|stage|s3)\.tsx$/.test(l.f));
  blurs.length ? blurs.forEach((l) => bad(`D5 an SVG blur outside ribbon.tsx (${path.basename(l.f)}:${l.n}) — a line is a Tube/Tape/Profile/Wire, never a glowing stroke`))
    : ok("D5 no blurred plain strokes (line builds come from ribbon.tsx)");
  // E5 · exits alternate: read each mounted construction's exit from its component, in mount order
  const comp = read(`${MOD}/Composition.tsx`);
  const mounts = [...comp.matchAll(/\{on\(P\.(\w+)\) && <(\w+) ([^/]*)\/>\}/g)].map((m) => ({ id: m[1], c: m[2], stay: /\bstay\b/.test(m[3]) }));
  const all = SRC.map((f) => read(f)).join("\n");
  const exitOf = (c, stay) => {
    if (stay) return "stay";
    const i = all.indexOf(`export const ${c}:`); if (i < 0) return "?";
    const j = all.indexOf("\nexport const ", i + 10); const body = all.slice(i, j < 0 ? undefined : j);
    if (/\(-1150 \* out\)/.test(body)) return "L";
    if (/\(1150 \* out\)/.test(body)) return "R";
    if (/1500 \* out/.test(body)) return "drop";
    if (/scale\(\$\{\(1 - 0\.6\d \* out\)/.test(body)) return "collapse";
    return "?";
  };
  const exits = mounts.map((m, i) => ({ ...m, x: i === mounts.length - 1 ? "end" : exitOf(m.c, m.stay) }));
  console.log(`   exits in order: ${exits.map((e) => `${e.id}:${e.x}`).join(" · ")}`);
  let alt = 0;
  for (let i = 1; i < exits.length; i++) {
    const a = exits[i - 1].x, b = exits[i].x;
    if ((a === "L" || a === "R") && a === b) { bad(`E5 "${exits[i - 1].id}" and "${exits[i].id}" both exit ${a} — lateral exits alternate`); alt++; }
    if (exits[i].x === "?") soft(`E5 could not read "${exits[i].id}"'s exit (${exits[i].c})`);
  }
  if (!alt) ok("E5 lateral exits alternate");
  // A6 · red: at most 2 spends, and never on a line build or with a glow
  const redUses = code.filter((l) => /theme\.red/.test(l.t) && !/(theme\.ts|text\.tsx|kit\.tsx|s3\.tsx|SfxLayer\.tsx)$/.test(l.f));
  const redFiles = [...new Set(redUses.map((l) => path.basename(l.f)))];
  console.log(`   red: ${redUses.length} line(s) in ${redFiles.join(", ") || "none"}`);
  if (redFiles.includes("jaws.tsx")) bad("A6 red on the jaws' running series — red is a verdict moment, not a chart's colour");
  if (redUses.some((l) => /drop-shadow|glow|blur/i.test(l.t))) bad("A6 red with a glow");
}

// ── 10 · ★★★ THE V30 FRAME REVIEW (the rigid spec G, 2026-09-29), the static half ─────────────────────
// G2 "way too much explainer text with the • in the middle": screen text is one plain phrase — no •, no ·, no
// comma, dash or colon joining two phrases — and a component prints at most ONE small label (≤ 20 px) that is not
// an engraving inside an object or an axis tick (mark those `/* engraving */` or `/* tick */`).
// G1 "bring the video down": the construction layer carries the DROP (≥ 110 px) in the composition.
// (G1's pixels, G4's detail floor and G2's per-frame count are measured by geom_sweep.mjs.)
// ★ It proves itself first: a table of lines that MUST be flagged and lines that must NOT.
{
  console.log("\n10. the V30 frame review (G1, G2)");
  /** the screen strings on one source line: JSX text runs and ALL-CAPS string literals */
  const screenText = (t) => {
    const out = [];
    // JSX text is prose: no lower-case code, no operators (">= 1 && clamp01(… / FALL)" is an expression, not a label)
    for (const m of t.matchAll(/>([^<>{}]*[A-Z]{2,}[^<>{}]*)</g)) if (!/[a-z=&]/.test(m[1])) out.push(m[1].trim());
    for (const m of t.matchAll(/"([A-Z0-9][A-Z0-9 ,.'&;%$()\-:→·•—–]{3,})"/g)) if (/[A-Z]{2,}/.test(m[1])) out.push(m[1]);
    return out.filter(Boolean);
  };
  const JOINED = /[•·]|, [A-Z0-9]| [—–-] |: [A-Z0-9]/;
  const fixtures = [
    ['<div>CONSUMER SENTIMENT, BY PARTY</div>', true], ['<div>TO AUGUST · BLS</div>', true], ['{ t: "SINCE FEB 23, EIA U.S. AVERAGE" }', true],
    ['<div>GAS AT $4.50: ALL 100</div>', true], ['<div>STOCKS • 2026</div>', true],
    ['<div>HOW AMERICANS FEEL</div>', false], ['<div>27,244</div>', false], ['{ t: "401(K)" }', false], ['<div>POOREST TO RICHEST</div>', false],
    ['{i < n && landed >= 1 && clamp01((landedF - i - 1) / FALL) < 0.5}', false],
  ];
  const wrong = fixtures.filter(([src, want]) => screenText(src).some((s) => JOINED.test(s)) !== want);
  if (wrong.length) { bad(`the separator test fails its own fixtures: ${wrong.map((w) => w[0]).join(" / ")}`); }
  else {
    const joined = [];
    for (const l of code) {
      if (/engraving/.test(l.t)) continue;
      for (const s of screenText(l.t)) if (JOINED.test(s)) joined.push(`${path.basename(l.f)}:${l.n} "${s.slice(0, 50)}"`);
    }
    // data.ts's hook labels carry "HEAD: TAIL" on purpose (EndLabel splits them into two lines) — checked apart
    const dataSrc = read(`${MOD}/data.ts`);
    for (const m of dataSrc.matchAll(/(stocksLabel|feelLabel): "([^"]+)"/g)) {
      const [head, tail] = m[2].split(": ");
      if (!tail || JOINED.test(head) || JOINED.test(tail)) joined.push(`data.ts ${m[1]} "${m[2]}"`);
      if (head.split(" ").length > 3 || tail.split(" ").length > 4) joined.push(`data.ts ${m[1]} over G5's word limits (≤ 3 / ≤ 4): "${m[2]}"`);
    }
    console.log(`   ${joined.length ? "✗" : "✓"} G2 screen text is one plain phrase per line (${joined.length} joined)`);
    for (const j of joined) bad(`G2 ${j}`);
  }
  // small labels per component
  const comps = [];
  for (const f of SRC) {
    const src = read(f).split("\n");
    let cur = null;
    src.forEach((t, i) => {
      const m = t.match(/^export const (\w+): React\.FC/);
      if (m) { cur = { f, name: m[1], small: [] }; comps.push(cur); }
      else if (/^export |^const \w+: React\.FC/.test(t)) cur = null;
      if (!cur) return;
      for (const s of t.matchAll(/label\((\d+)/g)) if (Number(s[1]) <= 20 && !/engraving|tick/.test(t)) cur.small.push(i + 1);
    });
  }
  const many = comps.filter((c) => c.small.length > 1);
  console.log(`   ${many.length ? "✗" : "✓"} G2 ≤ 1 small label per component (${comps.length} components read)`);
  for (const c of many) bad(`G2 ${path.basename(c.f)} ${c.name} prints ${c.small.length} small labels (lines ${c.small.join(", ")})`);
  if (comps.length < 10) bad(`G2 read only ${comps.length} components — the parser missed the film`);
  const drop = Number((read(`${MOD}/Composition.tsx`).match(/^const DROP = (\d+);/m) ?? [])[1]);
  const dropped = /translateY\(\$\{DROP\}px\)/.test(read(`${MOD}/Composition.tsx`));
  console.log(`   ${drop >= 110 && dropped ? "✓" : "✗"} G1 the construction layer rides ${drop || "?"} px lower${dropped ? "" : " — NOT APPLIED"}`);
  if (!(drop >= 110 && dropped)) bad("G1 the DROP is missing or under 110 px");
}

// ── 11 · ★★★★ THE CAMERA IS DRIVEN BY THE ACTION (user, 2026-10-20, V39: "the camera mainly just sits still, or doesn't even follow
//   any of the visuals … compare that to … bob, or … nike … Ensure that this applies to all future videos as well") ──────────────
//   Every construction (a file that stages a <Turn>) films through an ACTION CAMERA (actioncam.ts): a CamFn over actionCam(…) with
//   ≥ 2 focuses, at least one of them RIDING a moving thing (`ride:`) — or a smoothed follow of a moving head (the line charts).
//   Text-only and brand files are exempt BY NAME, with their reason. A bare <Cam keys> on a construction is a violation.
{
  console.log("\n11. the camera is driven by the action (2026-10-20)");
  const EXEMPT = { "close.tsx": "the brand close (fixed channel branding)" };
  const files = ALL.filter((f) => f.endsWith(".tsx") && /<Turn\b/.test(read(`${MOD}/${f}`)));
  let ok = 0;
  for (const f of files) {
    if (EXEMPT[f]) { console.log(`   · ${f} exempt: ${EXEMPT[f]}`); continue; }
    const s = read(`${MOD}/${f}`).replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
    const follow = /<CamFn at=\{\(g\) => smoothFollow\(g, raw\)\}>/.test(s);
    const action = /actionCam\(/.test(s);
    const focuses = (s.match(/\{\s*a:\s*[^,]+,(?:[^{}]|\{[^{}]*\})*?\bz:\s*[\d.]+/g) ?? []).length;
    const rides = (s.match(/\bride:\s*\{/g) ?? []).length;
    const bare = /<Cam keys=/.test(s);
    const pass = (follow || (action && focuses >= 2 && rides >= 1)) && !bare;
    if (pass) ok++;
    console.log(`   ${pass ? "✓" : "✗"} ${f}: ${follow ? "a smoothed follow of a moving head" : action ? `action camera, ${focuses} focus(es), ${rides} ride(s)` : "NO action camera"}${bare ? " + a bare <Cam keys>" : ""}`);
    if (!pass) bad(`11 ${f}: its camera is not driven by the action (need actionCam with ≥ 2 focuses and ≥ 1 ride, or a smoothed follow; no bare <Cam keys>)`);
  }
  if (files.length < 5) bad(`11 read only ${files.length} construction file(s) — the scan missed the film`);
  // the check proves itself: a planted bare-keyed construction must fail it, a planted action camera must pass
  const judge = (s) => { const a = /actionCam\(/.test(s), r = /\bride:\s*\{/.test(s), b = /<Cam keys=/.test(s); return a && r && !b; };
  const fx = [["<Turn><Cam keys={[{ at: 0, x: 0, z: 1 }]}>", false], ["const S=[{ a: 0, z: 1, at: still(1,2) }, { a: 9, z: 1.2, at: (g)=>p(g), ride: { a: 1, b: 2 } }]; <CamFn at={actionCam(S)}>", true]];
  const fxOk = fx.every(([s, want]) => judge(s) === want);
  console.log(`   ${fxOk ? "✓" : "✗"} the judge passes its fixtures (a bare keyed camera fails, a riding action camera passes)`);
  if (!fxOk) bad("11 the camera judge fails its own fixtures");
}

// ══ 12. ★★★ NO MASK OVER THE VISUALS (user, 2026-10-21, V40: "Do not ever add that into a 100 basis points video ever again") ══
//   No CSS mask (the old CAPTION_FADE top fade, V37's bottom fade) on any construction layer, in any module. Headroom is kept by
//   framing. The check proves itself: a planted mask must fail, a plain layer must pass.
{
  console.log("\n12. no black fade / mask over the visuals (2026-10-21)");
  const judge = (src) => !/\b(?:WebkitMaskImage|maskImage|CAPTION_FADE)\b/.test(src.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, ""));
  const fxOk = judge("<div style={{ filter: f }}>") === true && judge("<div style={{ WebkitMaskImage: CAPTION_FADE, maskImage: CAPTION_FADE }}>") === false;
  // (frame-level layers: the composition, and the old fade by name anywhere; an object's own reflection fade is not a frame mask)
  const masked = ALL.filter((f) => /\.tsx?$/.test(f) && (f === "Composition.tsx" ? !judge(read(`${MOD}/${f}`)) : /\bCAPTION_FADE\b/.test(read(`${MOD}/${f}`).replace(/\/\/.*$/gm, ""))));
  console.log(`   ${masked.length ? "✗" : "✓"} no module masks its visuals (${masked.join(", ") || "none"}) · ${fxOk ? "✓" : "✗"} the judge passes its fixtures`);
  if (masked.length) bad("12 a mask over the visuals: " + masked.join(", "));
  if (!fxOk) bad("12 the mask judge fails its own fixtures");
}

console.log(fail === 0
  ? `\n✓ style check clean${warn ? ` (${warn} advisory)` : ""}`
  : `\n✗ ${fail} violation(s)${warn ? `, ${warn} advisory` : ""}`);
process.exit(fail === 0 ? 0 : 1);
