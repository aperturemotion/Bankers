// Split the webpack-concatenated project IIFE back into ES modules, restoring webpack's
// collision renames (<module>_<name> → <name>) where that is safe, and `export` keywords inline.
// usage: node extract2.mjs <proj_iife.js> <outProjectDir>
import fs from "node:fs";
import path from "node:path";
import { parse } from "@babel/parser";
import _traverse from "@babel/traverse";
const traverse = _traverse.default || _traverse;

const [, , inFile, outDir] = process.argv;
const lines = fs.readFileSync(inFile, "utf8").split("\n");
if (!/^\(\(\) => \{\s*$/.test(lines[0])) throw new Error("unexpected head");
while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();
if (lines[lines.length - 1].trim() !== "})();") throw new Error("unexpected tail");
const body = lines.slice(1, -1).join("\n");

const markers = [];
{
  const re = /^(;\/\/ (\.\/\S+)|\/\/ EXTERNAL MODULE: (\.\/\S+))$/gm;
  let m;
  while ((m = re.exec(body))) markers.push({ pos: m.index, end: m.index + m[0].length, kind: m[2] ? "section" : "external", path: m[2] || m[3] });
}
const ast = parse(body, { sourceType: "script" });
const markerOf = (pos) => { let lo = -1; for (let i = 0; i < markers.length; i++) if (markers[i].pos <= pos) lo = i; else break; return lo; };
const sections = markers.map((mk, i) => ({ ...mk, idx: i, stmts: [], decls: new Set(), free: new Set() }));
for (const s of ast.program.body) sections[markerOf(s.start)].stmts.push(s);
const isSrc = (s) => s.kind === "section" && s.path.startsWith("./src/");
const isFont = (s) => s.kind === "section" && s.path.startsWith("./node_modules/@remotion/google-fonts/");

const externals = {};
const pkgOf = (p) => ({
  "./node_modules/remotion/dist/esm/index.mjs": "remotion",
  "./node_modules/remotion/dist/esm/no-react.mjs": "remotion/no-react",
  "./node_modules/react/jsx-runtime.js": "react/jsx-runtime",
  "./node_modules/react/index.js": "react",
})[p] ?? (() => { throw new Error("unknown external " + p); })();
for (const sec of sections) if (sec.kind === "external") {
  const d = sec.stmts.filter((s) => s.type !== "EmptyStatement")[0].declarations[0];
  externals[d.id.name] = pkgOf(sec.path); sec.extVar = d.id.name;
}

// ---- scope analysis on the whole program ----
let programScope;
const bindingSection = new Map();
const idNodes = new Map(); // name -> [{start,end}] every identifier occurrence bound to that program binding
const shorthandAt = new Set(); // start offsets of identifiers that are the value of a shorthand property
const refs = sections.map(() => new Map());
traverse(ast, {
  Program(p) {
    programScope = p.scope;
    for (const [name, b] of Object.entries(p.scope.bindings)) {
      const mi = markerOf(b.identifier.start);
      bindingSection.set(name, mi);
      sections[mi].decls.add(name);
    }
  },
  ObjectProperty(p) {
    if (!p.node.shorthand) return;
    const v = p.node.value.type === "AssignmentPattern" ? p.node.value.left : p.node.value;
    if (v.type === "Identifier") shorthandAt.add(v.start);
  },
  Identifier(p) {
    const name = p.node.name;
    const b = p.scope.getBinding(name);
    const at = markerOf(p.node.start);
    const isRef = p.isReferencedIdentifier();
    const isBind = p.isBindingIdentifier();
    const isLhs = (p.parentPath.isAssignmentExpression() && p.parent.left === p.node) || (p.parentPath.isUpdateExpression());
    if (!isRef && !isBind && !isLhs) return; // property keys, member props, labels…
    if (!b) { if (isRef || isLhs) sections[at].free.add(name); return; }
    if (b.scope.block.type !== "Program") return;
    if (!idNodes.has(name)) idNodes.set(name, []);
    idNodes.get(name).push({ start: p.node.start, end: p.node.end, scope: p.scope });
    const from = bindingSection.get(name);
    if (from !== at) refs[at].set(name, from);
  },
});
// de-dup occurrences (shorthand key/value share a start)
for (const [n, arr] of idNodes) idNodes.set(n, [...new Map(arr.map((o) => [o.start, o])).values()]);

// ---- original-name restoration ----
const GLOBALS = new Set([...Object.getOwnPropertyNames(globalThis), "window", "document", "navigator", "location", "history", "screen",
  "name", "status", "close", "open", "print", "top", "parent", "self", "frames", "length", "origin", "event", "find", "alert", "confirm",
  "prompt", "scroll", "stop", "focus", "blur", "Image", "Audio", "Option", "React", "jsx", "jsxs", "Fragment", "arguments", "undefined"]);
const baseOf = (p) => path.basename(p).replace(/\.(tsx|ts|jsx|js|json|mjs)$/, "").replace(/[^A-Za-z0-9_$]/g, "_");
const finalName = new Map(); // program binding name -> name in its defining module
for (const s of sections.filter(isSrc)) {
  const base = baseOf(s.path);
  const taken = new Set([...s.decls, ...s.free, ...[...refs[s.idx].keys()]]);
  for (const n of s.decls) {
    let o = n;
    const isJson = s.path.endsWith(".json");
    if (isJson || (n.startsWith(base + "_") && n.length > base.length + 1)) {
      const cand = isJson ? base : n.slice(base.length + 1);
      if (/^[A-Za-z_$][\w$]*$/.test(cand) && !s.decls.has(cand) && !refs[s.idx].has(cand) && !s.free.has(cand) && !GLOBALS.has(cand)) o = cand;
    }
    finalName.set(n, o);
    if (o !== n) taken.add(o);
  }
}
// an occurrence would be captured by an inner-scope binding of the new name → keep webpack's name
const shadowed = (n, nn, secIdx) => (idNodes.get(n) ?? []).some((o) => {
  if (markerOf(o.start) !== secIdx) return false;
  const b = o.scope.getBinding(nn);
  return b && b.scope.block.type !== "Program";
});
let shadowReverts = 0;
for (const [n, o] of finalName) if (o !== n && shadowed(n, o, bindingSection.get(n))) { finalName.set(n, n); shadowReverts++; }
// local names per importing module
const localName = sections.map(() => new Map()); // secIdx -> Map(programName -> local)
for (const s of sections.filter(isSrc)) {
  const used = new Set([...s.decls].map((n) => finalName.get(n)));
  for (const n of s.free) used.add(n);
  for (const n of Object.keys(externals)) used.add(n);
  const want = [];
  for (const [n, f] of refs[s.idx]) if (isSrc(sections[f])) want.push([n, f]);
  want.sort((a, b) => a[1] - b[1]);
  // first pass: names whose export name equals the bundle name keep it (they can't collide)
  for (const [n] of want) if (finalName.get(n) === n) { localName[s.idx].set(n, n); used.add(n); }
  for (const [n] of want) {
    if (localName[s.idx].has(n)) continue;
    const o = finalName.get(n);
    // a free (unbound) use of `o` in this module is dead code webpack left un-rewritten: it meant this very import
    const ok = !used.has(o) || (s.free.has(o) && ![...localName[s.idx].values()].includes(o) && ![...s.decls].map((d) => finalName.get(d)).includes(o));
    const pick = ok && !GLOBALS.has(o) && !shadowed(n, o, s.idx) ? o : n;
    localName[s.idx].set(n, pick); used.add(pick);
  }
}

// ---- generate ----
const relSpec = (fromFile, toFile) => { let r = path.posix.relative(path.posix.dirname(fromFile), toFile); if (!r.startsWith(".")) r = "./" + r; return r.replace(/\.(tsx|ts|jsx|js)$/, ""); };
const exportsOf = sections.map(() => new Set());
for (const s of sections.filter(isSrc)) for (const [n, f] of refs[s.idx]) if (isSrc(sections[f])) exportsOf[f].add(n);
const stats = { renamedDecls: 0, inlineExports: 0, listExports: 0, aliasImports: 0 };
const files = [];
for (const s of sections.filter(isSrc)) {
  const rel = s.path.slice(2);
  const start = s.end + 1, stop = markers[s.idx + 1] ? markers[s.idx + 1].pos : body.length;
  if (rel.endsWith(".json")) {
    const st = s.stmts.filter((x) => x.type !== "EmptyStatement");
    const init = st[0].declarations[0].init;
    const val = init.type === "ObjectExpression" && init.properties.length === 0 ? {} : JSON.parse(init.arguments[0].value);
    files.push({ rel, content: JSON.stringify(val, null, 2) + "\n" });
    continue;
  }
  const edits = []; // [start, end, text] in body coordinates
  const nameHere = (n) => (bindingSection.get(n) === s.idx ? finalName.get(n) : localName[s.idx].get(n) ?? n);
  for (const [n, occ] of idNodes) {
    for (const o of occ) {
      if (o.start < start || o.end > stop) continue;
      const nn = nameHere(n);
      if (nn === n) continue;
      edits.push([o.start, o.end, shorthandAt.has(o.start) ? `${n}: ${nn}` : nn]);
    }
  }
  // inline exports
  const exp = [...exportsOf[s.idx]];
  const listExp = [];
  for (const n of exp) {
    const declStmt = s.stmts.find((st) =>
      (st.type === "VariableDeclaration" && st.declarations.length === 1 && st.declarations[0].id.type === "Identifier" && st.declarations[0].id.name === n) ||
      ((st.type === "FunctionDeclaration" || st.type === "ClassDeclaration") && st.id?.name === n));
    if (declStmt) { edits.push([declStmt.start, declStmt.start, "export "]); stats.inlineExports++; }
    else { listExp.push(finalName.get(n)); stats.listExports++; }
  }
  for (const n of s.decls) if (finalName.get(n) !== n) stats.renamedDecls++;
  edits.sort((a, b) => b[0] - a[0] || b[1] - a[1]);
  let text = body.slice(start, stop);
  for (const [a, b, t] of edits) text = text.slice(0, a - start) + t + text.slice(b - start);
  // imports
  const imp = [];
  const extUsed = [...refs[s.idx].entries()].filter(([, f]) => sections[f].kind === "external").map(([n]) => n).sort();
  for (const v of extUsed) imp.push(`import * as ${v} from "${externals[v]}";`);
  const fontsBy = {};
  for (const [n, f] of refs[s.idx]) if (isFont(sections[f])) {
    const b = path.basename(sections[f].path, ".mjs");
    const orig = n.startsWith(b + "_") ? n.slice(b.length + 1) : n;
    (fontsBy["@remotion/google-fonts/" + b] ||= []).push(orig === n ? n : `${orig} as ${n}`);
  }
  for (const [pkg, names] of Object.entries(fontsBy)) imp.push(`import { ${names.join(", ")} } from "${pkg}";`);
  const bySec = new Map();
  for (const [n, f] of refs[s.idx]) if (isSrc(sections[f])) { if (!bySec.has(f)) bySec.set(f, []); bySec.get(f).push(n); }
  for (const [f, names] of [...bySec.entries()].sort((a, b) => a[0] - b[0])) {
    const trel = sections[f].path.slice(2);
    if (trel.endsWith(".json")) { imp.push(`import ${localName[s.idx].get(names[0])} from "${relSpec(rel, trel)}";`); continue; }
    const specs = names.map((n) => { const e = finalName.get(n), l = localName[s.idx].get(n); if (e !== l) stats.aliasImports++; return e === l ? e : `${e} as ${l}`; }).sort();
    imp.push(`import { ${specs.join(", ")} } from "${relSpec(rel, trel)}";`);
  }
  let out = "// @ts-nocheck\n// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).\n";
  out += imp.join("\n") + (imp.length ? "\n" : "");
  out += text.replace(/^\n+/, "\n").replace(/\s+$/, "\n");
  if (listExp.length) out += `\nexport { ${listExp.sort().join(", ")} };\n`;
  files.push({ rel, content: out });
}
for (const f of files) {
  const p = path.join(outDir, f.rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, f.content);
}
const renames = [...finalName].filter(([a, b]) => a !== b);
fs.writeFileSync(path.join(path.dirname(inFile), "extract2_renames.json"), JSON.stringify(renames, null, 0));
console.error("wrote", files.length, "files", JSON.stringify(stats), "renamed:", renames.length, "shadowReverts:", shadowReverts);
