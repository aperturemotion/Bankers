// BANKERS — the palette pass over a cloned Style 3 source folder (Bankers/CLAUDE.md §2.1).
//
//   node Bankers/Resources/apply-palette.mjs <folder> [--dry]
//
// Rewrites every GREY colour literal in every .ts/.tsx file of <folder> through bk(): 6- and 3-digit
// hex ("#aab1bd", "#fff") and rgb/rgba triples ("rgba(220,228,246,0.26)"). Non-greys (Style 3's red,
// any chart colour) and pure black / white are left exactly as they are. theme.ts is SKIPPED — its
// tokens are written by hand from BANKERS (the stage tint is a rule, not a mapping).
// Prints every distinct mapping it made, per file, so the result can be read, not trusted.

import fs from "node:fs";
import path from "node:path";
import { bk, bkRgb, isGrey } from "./bankers-palette.mjs";

const [dir, flag] = process.argv.slice(2);
if (!dir || !fs.existsSync(dir)) throw new Error("usage: node apply-palette.mjs <folder> [--dry]");
const dry = flag === "--dry";

const HEX = /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?![0-9a-fA-F])/g;
const RGB = /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/g;

let total = 0;
for (const name of fs.readdirSync(dir).sort()) {
  if (!/\.tsx?$/.test(name) || name === "theme.ts") continue;
  const file = path.join(dir, name);
  const src = fs.readFileSync(file, "utf8");
  const seen = new Map();
  let out = src.replace(HEX, (m) => {
    const to = bk(m);
    if (to.toLowerCase() !== m.toLowerCase()) seen.set(m.toLowerCase(), to);
    return to.toLowerCase() === m.toLowerCase() ? m : to;
  });
  out = out.replace(RGB, (m, r, g, b) => {
    const rgb = [Number(r), Number(g), Number(b)];
    if (!isGrey(rgb)) return m;
    const [R, G, B] = bkRgb(rgb).map((v) => Math.round(v));
    if (R === rgb[0] && G === rgb[1] && B === rgb[2]) return m;
    seen.set(`rgb(${r},${g},${b})`, `rgb(${R},${G},${B})`);
    return m.slice(0, m.indexOf("(") + 1) + `${R},${G},${B}`;
  });
  if (seen.size) {
    total += seen.size;
    console.log(`${name}: ${seen.size} grey(s) → blue family`);
    for (const [a, b] of seen) console.log(`    ${a} → ${b}`);
    if (!dry) fs.writeFileSync(file, out);
  }
}
console.log(dry ? `(dry run) ${total} mappings` : `${total} mappings written`);
