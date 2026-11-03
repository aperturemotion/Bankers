/** one station's ring: 16 points from the +z sill, up over the roof, down the −z side (y, z): the sill chamfer, the lower body (cladding),
 *  a PANEL CREASE standing 1.6 proud, the door, the shoulder, the belt deck, the glass, the roof edge, the roof */
const cabRing = (s: St): [number, number][] => {
  // (every height strictly climbs round the ring, however low the station: a short nose once folded its sill over its shoulder — the
  // white shards at the Cybercab's nose)
  const gap = s.yr - s.yb, low = s.yb - s.ys;
  const p1 = s.ys + Math.min(12, low * 0.3), p2 = Math.max(s.yb - 10, s.ys + low * 0.65), pc = p1 + (p2 - p1) * 0.32;
  const p4 = s.yb + Math.min(2, gap * 0.25), p5 = Math.max(p4 + Math.min(1, gap * 0.2), s.yr - Math.min(7, gap * 0.55));
  const h: [number, number][] = [[-s.ys, s.wB * 0.86], [-p1, s.wB], [-pc, s.wB + 1.6], [-p2, s.wB], [-s.yb, s.wB - 3], [-p4, s.wB - 9], [-p5, s.wR], [-s.yr, s.wR * 0.5]];
  return [...h, ...h.slice().reverse().map(([y, z]) => [y, -z] as [number, number])];
};
const CAB_N = 16;
const cabX = (u: number) => -CAB_L / 2 + u * CAB_L;
/** a facet's PART by its ring index (mirrored onto the +z half) and its station: the bottom and the lower body are CLADDING; the side
 *  glass, the glass roof (with the windscreen and rear glass) are GLASS; the rest is paint */
const cabPart = (i: number, u: number): "clad" | "glass" | "paint" => {
  const m = i === 15 ? -1 : i <= 7 ? i : 14 - i;
  if (m <= 1) return "clad";
  if (m === 5) return u > 0.1 && u < 0.74 ? "glass" : "paint";
  if (m >= 6) return u > 0.035 && u < 0.79 ? "glass" : "paint";
  return "paint";
};
const cybercab = (r: Rig, k: string, M: Mx, spin: number, blur: number, dive: number): Face[] => {
  const Mb = cat(M, tr(0, -45, 0), rz(-dive), tr(0, 45, 0));
  const glass = (n: V) => mix("#03122A", "#3A6AA6", 0.18 + 0.42 * Math.pow(lightOf(r, n), 1.3));
  const paint = (n: V) => metal(r, n, 0.16);
  const clad = (n: V) => mix("#020D1C", "#3D618F", lightOf(r, n) * 0.78);
  const dark = () => "#020A16";
  // ── the body loft ──
  const rings = CAB_ST.map((s) => ({ x: cabX(s.u), u: s.u, p: cabRing(s) }));
  const body: Face[] = [];
  for (let j = 0; j < rings.length - 1; j++) {
    const A = rings[j], B = rings[j + 1], um = (A.u + B.u) / 2;
    for (let i = 0; i < CAB_N; i++) {
      const i2 = (i + 1) % CAB_N;
      const c: V[] = [[A.x, A.p[i][0], A.p[i][1]], [A.x, A.p[i2][0], A.p[i2][1]], [B.x, B.p[i2][0], B.p[i2][1]], [B.x, B.p[i][0], B.p[i][1]]];
      const ins: V = [(A.x + B.x) / 2, -55, 0];
      const part = cabPart(i, um);
      const q = pface(r, `${k}b${j}_${i}`, Mb, c, part === "glass" ? glass : part === "clad" ? clad : paint, {}, ins);
      if (q) body.push(q);
    }
  }
  // the tail and the nose: closed with their own facets (a lit flat plane each)
  const endCap = (R: (typeof rings)[number], kk: string) => pface(r, kk, Mb, R.p.map(([y, z]) => [R.x, y, z] as V), paint, {}, [0, -55, 0]);
  body.push(...([endCap(rings[0], `${k}tail`), endCap(rings[rings.length - 1], `${k}nose`)].filter(Boolean) as Face[]));
  // ── the bumpers: a satin front SPLITTER under the nose, the rear DIFFUSER (a dark tray with four fins) under the tail ──
  const lip = (n: V) => satin(r, n, -0.12);
  body.push(...mbox(r, `${k}spl`, Mb, cabX(0.95), cabX(1) + 5, -27, -23.5, -54, 54, lip));
  body.push(...mbox(r, `${k}dif`, Mb, cabX(0) - 5, cabX(0.05), -33, -25, -56, 56, clad));
  for (const fz of [-36, -12, 12, 36]) body.push(...mbox(r, `${k}fin${fz}`, Mb, cabX(0) - 5, cabX(0.045), -33, -22, fz - 1.2, fz + 1.2, lip));
  // (the body's broad side panel is the sweep's measured shape)
  const side = body.find((q) => q.k === `${k}b5_3`) ?? body.find((q) => q.k === `${k}b5_12`);
  if (side) side.skip = false;
  // which side faces the camera
  const near = depthOf(r, xp(M, [0, -50, 100])) > depthOf(r, xp(M, [0, -50, -100])) ? 1 : -1;
  // ── a contact shadow under each tyre (the tread's patch on the ground: darkest, tight) ──
  const patches = CAB_WX.flatMap((wx, i) => [1, -1].flatMap((s) => softShadow(r, `${k}cp${i}${s}`, M, wx - 15, wx + 15, s > 0 ? 60 : -86, s > 0 ? 86 : -60, -0.3, 2.4, 5)));
  // ── the wheels: a tyre (tread blocks with two grooves, shoulders, a bulging sidewall), the rim's lit lip, a dished aero cover with five
  //    slots that follow its dish, five lug nuts and a hub cap, all turning about the axle ──
  const wheel = (wx: number, s: 1 | -1, kk: string): Face[] => {
    const Mw = cat(M, tr(wx, -CAB_WR, s * 73), rx(90 * s), ry((spin * 180) / Math.PI * s));
    const rub = (g: number) => (n: V) => mix("#020812", "#2E4A6E", Math.min(1, lightOf(r, n) * 0.75 * g));
    const blockOf = (a: number) => (Math.floor((a / (Math.PI * 2)) * 40) % 2 ? 0.8 : 1);
    const fs = lathe(r, kk, Mw, [
      { y: -13, R: 28 }, { y: -13, R: 33 }, { y: -10.5, R: CAB_WR },
      { y: -4, R: CAB_WR }, { y: -4, R: 33.6 }, { y: -2.4, R: 33.6 }, { y: -2.4, R: CAB_WR }, { y: 2.4, R: CAB_WR }, { y: 2.4, R: 33.6 }, { y: 4, R: 33.6 }, { y: 4, R: CAB_WR },
      { y: 10.5, R: CAB_WR }, { y: 13, R: 33.2 }, { y: 14.1, R: 30 }, { y: 14.3, R: 27.5 },
      { y: 14.3, R: 27 }, { y: 15.3, R: 26 }, { y: 15.3, R: 24.8 }, { y: 14.7, R: 24.3 },
      { y: 15.7, R: 19.5 }, { y: 16.4, R: 12 }, { y: 16.4, R: 6.4 }, { y: 17.4, R: 5.6 }, { y: 17.4, R: 0 },
    ], (n, a, j) => {
      if (j <= 1 || j === 11) return rub(0.9)(n);
      if (j === 2 || j === 6 || j === 10) return rub(blur > 0.5 ? 0.9 : blockOf(a))(n);
      if (j <= 9) return rub(0.45)(n);
      if (j === 12) return rub(0.95)(n);
      if (j === 13) return rub(1.15)(n);
      if (j === 14 || j === 15) return satin(r, n, 0.3);
      if (j === 16) return satin(r, n, -0.35);
      if (j <= 19) return satin(r, n, 0.12);
      return satin(r, n, 0.4);
    }, 40);
    // the cover's five aero slots, lying in its dish (they turn; above ~0.3 rad a frame they melt into a blurred band and never strobe),
    // and five lug nuts round the hub
    const slots: Face[] = [];
    if (blur < 0.999) for (let i = 0; i < 5; i++) {
      const t0 = (i / 5) * Math.PI * 2 + 0.3, t1 = t0 + 0.46;
      const q = pface(r, `${kk}sl${i}`, Mw, [[12.5 * Math.cos(t0), 16.55, 12.5 * Math.sin(t0)], [21.5 * Math.cos(t0 + 0.14), 15.6, 21.5 * Math.sin(t0 + 0.14)], [21.5 * Math.cos(t1 + 0.14), 15.6, 21.5 * Math.sin(t1 + 0.14)], [12.5 * Math.cos(t1), 16.55, 12.5 * Math.sin(t1)]],
        () => "#061A36", { op: 1 - blur }, [0, 0, 0]);
      if (q) slots.push(q);
      const ta = (i / 5) * Math.PI * 2;
      const nut = pface(r, `${kk}nt${i}`, Mw, Array.from({ length: 8 }, (_, m) => [9.2 * Math.cos(ta) + 1.7 * Math.cos((m / 8) * Math.PI * 2), 16.6, 9.2 * Math.sin(ta) + 1.7 * Math.sin((m / 8) * Math.PI * 2)] as V),
        (n) => satin(r, n, 0.5), { op: 1 - blur }, [0, 0, 0]);
      if (nut) slots.push(nut);
    }
    const band = blur > 0.001 ? lathe(r, `${kk}bl`, Mw, [{ y: 16.5, R: 8 }, { y: 16.5, R: 12.4 }, { y: 15.62, R: 21.6 }], () => "#3D6699", 40, { op: 0.7 * blur }) : [];
    return units(fs, slots, band);
  };
  // ── the near side's arch liners (dark, the tyre stands in them) ──
  const zs = near * 90.4;
  const arch = (wx: number, kk: string) => {
    const pts: V[] = [];
    for (let i = 0; i <= 24; i++) { const a = Math.PI + (i / 24) * Math.PI, y = -CAB_WR + 41 * Math.sin(a); pts.push([wx + 41 * Math.cos(a), Math.min(y, -23), zs]); }
    return pface(r, kk, Mb, pts, dark, {}, [wx, -40, 0]);
  };
  const cut = (pts: V[]) => {
    const p = pts.map((q) => P(r, xp(Mb, q)));
    return p.map((q, i) => `${i ? "L" : "M"}${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join(" ");
  };
  /** a point ON the near flank at station u, ring point `pi` (0 sill … 7 roof), a hair proud of it */
  const onRing = (u: number, pi: number, out = 0.7): V => {
    let a = CAB_ST[0], b = CAB_ST[1];
    for (let i = 0; i < CAB_ST.length - 1; i++) if (u >= CAB_ST[i].u && u <= CAB_ST[i + 1].u) { a = CAB_ST[i]; b = CAB_ST[i + 1]; }
    const t = (u - a.u) / Math.max(1e-6, b.u - a.u), pa = cabRing(a)[pi], pb = cabRing(b)[pi];
    const y = pa[0] + (pb[0] - pa[0]) * t, z = pa[1] + (pb[1] - pa[1]) * t;
    return [cabX(u), y, near * (z + out)];
  };
  /** a point on the near flank's door skin (between ring points 3 and 4 by `f`) */
  const onDoor = (u: number, f: number): V => { const a = onRing(u, 3), b = onRing(u, 4); return [a[0], a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]; };
  const span = (u0: number, u1: number, pi: number, n = 10, out = 0.7) => Array.from({ length: n + 1 }, (_, i) => onRing(u0 + ((u1 - u0) * i) / n, pi, out));
  const DR = 0.315, DF = 0.69;   // the butterfly door's rear and front edges
  const details = (
    <g data-probe-skip>
      {/* the arches' lit lips (the key catches their upper left) */}
      {CAB_WX.map((wx, i) => (
        <path key={i} d={cut(Array.from({ length: 13 }, (_, m) => { const a = Math.PI + (m / 12) * Math.PI * 0.62; return [wx + 41.5 * Math.cos(a), Math.min(-CAB_WR + 41.5 * Math.sin(a), -23), zs + near * 0.4] as V; }))} fill="none" stroke={alpha("#B3CEEF", 0.55)} strokeWidth={1.4} strokeLinecap="round" />
      ))}
      {/* the BUTTERFLY DOOR's shut lines: up its rear edge from the sill through the belt and the glass to the roof edge, along the roof edge,
          down the A-pillar and its front edge, and along the sill — a dark gap with a lit edge beside it */}
      {[[0, "#011226", 1.9, 0.85], [1, "#B3CEEF", 0.9, 0.42]].map(([o, col, w, op]) => {
        const d = Number(o) * 1.2;
        const path = [onRing(DR - 0.004 + d / 400, 1), onRing(DR + d / 400, 3), onRing(DR + 0.012 + d / 400, 5), onRing(DR + 0.03 + d / 400, 6), ...span(DR + 0.04, DF - 0.07, 6, 8).map((q) => [q[0], q[1] + d, q[2]] as V), onRing(DF - 0.035 - d / 400, 5), onRing(DF - d / 400, 3), onRing(DF + 0.005 - d / 400, 1)];
        return <path key={String(o)} d={`${cut(path)} M${cut([onRing(DR, 1, 0.9), onRing(DF, 1, 0.9)]).slice(1)}`} fill="none" stroke={alpha(String(col), Number(op))} strokeWidth={Number(w)} strokeLinejoin="round" />;
      })}
      {/* the flush handle (a recessed pad with a lit lower lip) and the door's sensor */}
      <path d={cut([onDoor(0.37, 0.25), onDoor(0.43, 0.25), onDoor(0.43, 0.42), onDoor(0.37, 0.42)]) + "Z"} fill="#03132A" stroke={alpha("#011226", 0.9)} strokeWidth={0.8} />
      <path d={cut([onDoor(0.372, 0.43), onDoor(0.428, 0.43)])} fill="none" stroke={alpha("#DCE8F6", 0.7)} strokeWidth={1} />
      <circle cx={P(r, xp(Mb, onDoor(0.355, 0.33))).x} cy={P(r, xp(Mb, onDoor(0.355, 0.33))).y} r={2.1} fill="#020A16" stroke={alpha("#9DC0EA", 0.7)} strokeWidth={0.7} />
      {/* the panel crease's catchlight, and the shoulder's: each one line along the whole flank (never per facet) */}
      <path d={cut(span(0.04, 0.95, 2, 24, 0.5))} fill="none" stroke={alpha("#DCE8F6", 0.5)} strokeWidth={1.1} strokeLinecap="round" />
      <path d={cut(span(0.04, 0.95, 4, 24, 0.4))} fill="none" stroke={alpha("#E6F0FB", 0.78)} strokeWidth={1.6} strokeLinecap="round" />
      {/* the glasshouse FRAME: a dark surround along the glass base and the roof edge, and the satin ROOF RAIL trim along the roof edge */}
      <path d={cut(span(0.04, 0.79, 5, 20, 0.6))} fill="none" stroke={alpha("#010B18", 0.85)} strokeWidth={2.4} strokeLinejoin="round" />
      <path d={cut(span(0.04, 0.79, 6, 20, 0.6))} fill="none" stroke={alpha("#010B18", 0.75)} strokeWidth={2.2} strokeLinejoin="round" />
      <path d={cut(span(0.09, 0.74, 6, 20, 1.6).map((q) => [q[0], q[1] - 1.6, q[2]] as V))} fill="none" stroke={alpha("#E3EDF9", 0.85)} strokeWidth={2} strokeLinecap="round" />
      {/* the camera/sensor pods: one on the front fender, one at the roof's front corner, one at the rear quarter (each a housing and a lens) */}
      {([[0.8, 0.42, 3.2], [0.17, 0.3, 2.8]] as [number, number, number][]).map(([u, f, w], i) => {
        const c0 = onDoor(u, f), p0 = P(r, xp(Mb, [c0[0], c0[1], c0[2] + near * 1.2]));
        return <g key={i}><ellipse cx={p0.x} cy={p0.y} rx={w * 2.2} ry={w * 1.25} fill="#06152B" stroke={alpha("#9DC0EA", 0.55)} strokeWidth={0.8} /><circle cx={p0.x + 1.5} cy={p0.y} r={w * 0.55} fill="#3A6AA6" /><circle cx={p0.x + 1} cy={p0.y - 0.6} r={w * 0.22} fill="#FFFFFF" opacity={0.8} /></g>;
      })}
      {(() => { const c0 = onRing(0.72, 7, 1.5), p0 = P(r, xp(Mb, [c0[0], c0[1] - 2.5, c0[2]])); return <g><ellipse cx={p0.x} cy={p0.y} rx={8} ry={3.4} fill="#06152B" stroke={alpha("#9DC0EA", 0.5)} strokeWidth={0.8} /><circle cx={p0.x + 2} cy={p0.y} r={1.6} fill="#5E8FCB" /></g>; })()}
      {/* the FULL-WIDTH LIGHT BARS, each a dark housing with its inner lamp line, segmented by the lamp's cells: the front round the nose,
          the tail round the tail (the near halves, meeting the centre line) */}
      {[{ pts: [onRing(0.88, 4, 0.4), onRing(0.95, 4, 0.4), onRing(0.985, 4, 0.4), [cabX(1) + 0.6, -(CAB_ST[12].yb - 2), near * 36] as V, [cabX(1) + 0.6, -(CAB_ST[12].yb - 2), 0] as V], lamp: "#F5FAFF" },
        { pts: [onRing(0.11, 4, 0.4), onRing(0.05, 4, 0.4), onRing(0.015, 4, 0.4), [cabX(0) - 0.6, -(CAB_ST[0].yb - 3), near * 46] as V, [cabX(0) - 0.6, -(CAB_ST[0].yb - 3), 0] as V], lamp: "#8FBFF2" }].map((b, i) => (
        <g key={i}>
          <path d={cut(b.pts)} fill="none" stroke="#020A16" strokeWidth={7.5} strokeLinecap="round" strokeLinejoin="round" />
          <path d={cut(b.pts)} fill="none" stroke={b.lamp} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" />
          <path d={cut(b.pts)} fill="none" stroke="#0A2346" strokeWidth={3} strokeDasharray="0.9 5.2" />
          <path d={cut(b.pts.map((q) => [q[0], q[1] - 2.6, q[2]] as V))} fill="none" stroke={alpha("#DCE8F6", 0.45)} strokeWidth={0.9} />
        </g>
      ))}
      {/* the front bumper's lower intake (a dark slot over the splitter), the near half to the centre */}
      <path d={cut([onRing(0.93, 1, 0.6), onRing(0.975, 1, 0.6), [cabX(1) + 0.6, -(CAB_ST[12].ys + 4), near * 40], [cabX(1) + 0.6, -(CAB_ST[12].ys + 4), 0]])} fill="none" stroke="#020A16" strokeWidth={5} strokeLinecap="round" />
    </g>
  );
  // the glasshouse's ONE reflection: a soft band laid across the whole side glass and one thin bright streak in it (panel-wide, never per facet)
  const gl = CAB_ST.filter((s) => s.u > 0.12 && s.u < 0.72);
  const zg = (s: St) => near * ((s.wB - 9) * 0.55 + s.wR * 0.45 + 0.6);
  const refl = (
    <g data-probe-skip>
      <path d={cut([...gl.map((s) => [cabX(s.u), -(s.yb + (s.yr - s.yb) * 0.4), zg(s)] as V), ...gl.slice().reverse().map((s) => [cabX(s.u) - 16, -(s.yb + (s.yr - s.yb) * 0.62), zg(s)] as V)])} fill={alpha("#B3CEEF", 0.24)} />
      <path d={cut(gl.map((s) => [cabX(s.u) - 6, -(s.yb + (s.yr - s.yb) * 0.66), zg(s)] as V))} fill="none" stroke={alpha("#FFFFFF", 0.4)} strokeWidth={1.2} />
    </g>
  );
  const nearW = CAB_WX.map((wx, i) => wheel(wx, near as 1 | -1, `${k}wn${i}`)), farW = CAB_WX.map((wx, i) => wheel(wx, -near as 1 | -1, `${k}wf${i}`));
  return units(patches, ...farW, body, [arch(CAB_WX[0], `${k}a0`), arch(CAB_WX[1], `${k}a1`)], [slot(`${k}refl`, refl), slot(`${k}det`, details)], ...nearW);
};

