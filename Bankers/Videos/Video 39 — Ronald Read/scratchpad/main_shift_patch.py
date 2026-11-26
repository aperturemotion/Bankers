# rev 4c: Main.tsx / Root.tsx / stations.tsx on two clocks (src/w3d/shift.ts)
import os
os.chdir(os.path.join(os.path.dirname(__file__), "..", "src"))
def patch(p, pairs):
    s = open(p).read()
    for a, b in pairs:
        assert s.count(a) == 1, (p, a[:90], s.count(a))
        s = s.replace(a, b)
    open(p, "w").write(s)
patch("Root.tsx", [('import { TOTAL, FPS } from "./w3d/take";', 'import { TOTAL, FPS } from "./w3d/take_rt";   // rev 4c: REAL time (the new hook line)')])
patch("w3d/Main.tsx", [
 ('import { CHIPS, TOTAL, VO_END } from "./take";',
  'import { CHIPS, TOTAL, VO_END } from "./take_rt";   // rev 4c: REAL time — the voice, the karaoke, the close\nimport { HOOK_SHIFT as S, HOOK_ID } from "./shift";'),
 ('const BED_START = 3308;', 'const BED_START = 3308 - S;   // rev 4c: the drop still lands on "In 2003" (now real frame 255)\nconst BED_START_TAKE_B = 3308;'),
 ('const shotsAll = STATIONS.flatMap((s) => s.shots()).sort((p, q) => p.a - q.a);',
  '// rev 4c: every station but the hook is authored in STORY time (real − S): its shots move by +S\nconst real = (s) => (sh) => (s.id === HOOK_ID ? sh : { ...sh, a: sh.a + S, b: sh.b + S });\nconst shotsAll = STATIONS.flatMap((s) => s.shots().map(real(s))).sort((p, q) => p.a - q.a);\n'
  'const story = (s, f) => (s.id === HOOK_ID ? f : Math.max(0, f - S));   // the frame a station is handed'),
 ('export const DISSOLVES = [{ at: TEST_CUT(), pre: "rolldown", post: "test" }, { at: TOTAL_PUSH_END(), pre: "total", post: "rules" }].map((d) => ({',
  'export const DISSOLVES = [{ at: TEST_CUT() + S, pre: "rolldown", post: "test" }, { at: TOTAL_PUSH_END() + S, pre: "total", post: "rules" }].map((d) => ({'),
 ('const CUT_FLASH = [{ at: 481, o: 0.58, dur: 16, color: "#C8DBF4" }, { at: 883, o: 0.25, dur: 14, color: "#EEF3FA" }];',
  'const CUT_FLASH = [{ at: 481 + S, o: 0.58, dur: 16, color: "#C8DBF4" }, { at: 883 + S, o: 0.25, dur: 14, color: "#EEF3FA" }];   // story 481 / 883'),
 ('export const SFX = [...STATIONS.flatMap((s) => (s.sfx ? s.sfx() : [])), cueAt("whooshlong", CLOSE_AT + 6, 40, 0.5)];',
  'export const SFX = [...STATIONS.flatMap((s) => (s.sfx ? s.sfx().map((c) => (s.id === HOOK_ID ? c : { ...c, at: c.at + S })) : [])), cueAt("whooshlong", CLOSE_AT + 6, 40, 0.5)];'),
 ('  const live = STATIONS.filter((s) => f >= s.from && f <= s.to && !DISSOLVES.some((d) => (f <= d.at && s.id === d.post) || (f > d.at && s.id === d.pre)));',
  '  const live = STATIONS.filter((s) => { const g = s.id === HOOK_ID ? f : f - S; return (g >= s.from || s.from <= 0) && g <= s.to && !DISSOLVES.some((d) => (f <= d.at && s.id === d.post) || (f > d.at && s.id === d.pre)); });'),
 ('            <s.Scene f={f} />\n          </group>\n        ); })}\n      </World3D>',
  '            <s.Scene f={story(s, f)} />\n          </group>\n        ); })}\n      </World3D>'),
 ('                <dzOther.Scene f={f} />', '                <dzOther.Scene f={story(dzOther, f)} />'),
 ('      {live.map((s) => s.Overlay && <s.Overlay key={s.id} f={f} P={(p) => projectWith(k, [p[0] + s.origin[0], p[1] + s.origin[1], p[2] + s.origin[2]])} />)}',
  '      {/* rev 4c: a story-time station\'s overlay sits in a Sequence shifted by S, so its Tags/Counters (useCurrentFrame) read story frames too */}\n'
  '      {live.map((s) => { const P = (p) => projectWith(k, [p[0] + s.origin[0], p[1] + s.origin[1], p[2] + s.origin[2]]); return s.Overlay && (s.id === HOOK_ID\n'
  '        ? <s.Overlay key={s.id} f={f} P={P} />\n'
  '        : <Sequence key={s.id} from={S} layout="none"><s.Overlay f={f - S} P={P} /></Sequence>); })}'),
])
patch("w3d/stations.tsx", [("const hook = { ...hookRaw, to: Math.max(hookRaw.to, 335) };",
  "const hook = { ...hookRaw, to: Math.max(hookRaw.to, 335 + 43) };   // rev 4c: the hook runs in REAL time (shift.ts): story 335 + 43")])
print("patched")
