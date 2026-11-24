import { hookTimes, hookCamAt } from "../src/bnx/hook";
const [today, year, down, pct, acc, more, than] = process.argv.slice(2).map(Number);
const t = hookTimes(today, year, down, pct, acc, more, than);
const rows: string[] = [];
for (let f = 0; f <= 230; f++) { const c = hookCamAt(t, f); rows.push(`${f},${c.x.toFixed(3)},${c.y.toFixed(3)},${c.z.toFixed(5)}`); }
console.log(JSON.stringify(t));
console.log(rows.join("\n"));
