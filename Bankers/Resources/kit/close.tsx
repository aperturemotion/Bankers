// ══ BANKERS CLONE of Style 3 Video 26 — the Bankers pass applied (Bankers/CLAUDE.md §2): greys → the blue
// family by Resources/apply-palette.mjs, every face Anton 400, the outro carries the Bankers logo.

import React from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
// ★ the outro sets the logo in the LOGO BLUE, #005DC8 — the colour of the client's own logo file (Timur,
// 2026-09-25: "make the bankers text at the very end the right color, look at their logo reference")
// ⚠ brand files load from this project's public/ (Bankers/CLAUDE.md §3.3), never imported
const LOGO_WHITE = staticFile("brand/bankers-logo-blue.svg");

/** the logo file's own aspect (viewBox 530.2 × 160) and the width it takes in the outro */
const LOGO_ASPECT = 530.2 / 160;
const LOGO_W = 620;
import { theme } from "./theme";
import { VOICE } from "./fonts";
import { alpha, clamp01, mixHex, rIn, rOut, rInOut } from "./anim";
import { figure, label, mono, Turn } from "./kit";
import { CX, Cam, Pool3D } from "./s3";

const O = { x: 540, y: 883 };
const aim = (x: number, y: number) => ({ x: O.x - x, y: O.y - y });

// ══ THE TAKEAWAY — one night, ten years ═══════════════════════════════════════════════════════
// "The Fed sets the price of one night. / The bond market sets the price of 10 years. / And it
// just decided the next decade costs 5%. / Everything else is now doing the math."
// Calm (brief: "one night vs ten years, calm"). ONE small plate engraved with a crescent moon —
// a single night, the Fed's. Then a rail of TEN year-plates runs out beside it — the bond
// market's. On "5%" the ten plates light in one sweep and the figure rises over the rail. On
// "doing the math" a row of small odometers under the rail rolls and settles.
// ★ STACKED, not side by side: a night plate on the rail's baseline read as "1 unit against 10",
// a scale the objects don't claim (one night is 1/3,652 of a decade). The night stands ABOVE, as
// its own object; the decade runs below it (stills sweep, 2026-09-23).
const NIGHT_Y = 700, PL = 118, RAIL_Y = 1000, RAIL_W = 70, RAIL_GAP = 8;
const RAIL_X0 = CX - (10 * RAIL_W + 9 * RAIL_GAP) / 2;
const RAIL_MID = CX;

const Plate: React.FC<{ x: number; y: number; w: number; on: number; lit: number; children?: React.ReactNode }> = ({ x, y, w, on, lit, children }) => {
  if (on <= 0.01) return null;
  const h = w, D = 16;
  return (
    <div style={{ position: "absolute", left: x, top: y - h / 2, width: w + D, height: h + D * 0.7, opacity: on,
      transform: `translateY(${((1 - on) * 30).toFixed(1)}px)`,
      filter: `drop-shadow(0 20px 26px rgba(0,0,0,0.85))${lit > 0.01 ? ` drop-shadow(0 0 ${(24 * lit).toFixed(0)}px ${alpha(theme.accent, 0.55 * lit)})` : ""}` }}>
      <div style={{ position: "absolute", inset: 0, clipPath: `polygon(${w - 1}px ${D * 0.7}px, ${w + D}px 0px, ${w + D}px ${h}px, ${w - 1}px ${h + D * 0.7}px)`,
        background: "linear-gradient(180deg, #00499C 0%, #001731 100%)" }} />
      <div style={{ position: "absolute", inset: 0, clipPath: `polygon(0px ${D * 0.7 + 1}px, ${D}px 0px, ${w + D}px 0px, ${w}px ${D * 0.7 + 1}px)`,
        background: `linear-gradient(120deg, ${mixHex("#9CC0EA", "#ffffff", lit)} 0%, #3C83D5 100%)` }} />
      <div style={{ position: "absolute", left: 0, top: D * 0.7 - 1, width: w + 1, height: h + 1,
        background: `linear-gradient(168deg, ${mixHex("#6BA1DF", "#F1F6FC", lit)} 0%, ${mixHex("#005BC4", "#85B2E5", lit)} 46%, #002652 100%)`,
        boxShadow: `inset 0 1px 0 ${alpha("#ffffff", 0.5)}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {children}
      </div>
    </div>
  );
};

/** a small odometer: three digit wheels that roll, then ease onto their digits.
 *  ⚠ each wheel's position is ONE eased roll (d + n → d), never "spin × (1 − settle)": that
 *  product's derivative ran the wheels BACKWARDS at speed while the settle was ramping. */
const Odometer: React.FC<{ x: number; y: number; seed: number; a: number; b: number }> = ({ x, y, seed, a, b }) => {
  const f = useCurrentFrame();
  const final = [(seed * 7) % 10, (seed * 3 + 1) % 10, (seed * 9 + 4) % 10];
  return (
    <div style={{ position: "absolute", left: x - 45, top: y, width: 90, height: 40, borderRadius: 6, overflow: "hidden",
      background: "linear-gradient(180deg, #000E1D, #001F44 50%, #000E1D)", boxShadow: `inset 0 0 0 2px ${alpha("#6BA1DF", 0.5)}` }}>
      {final.map((d, i) => {
        // a wheel is a column of digits scrolling past a window; it rolls down n digits and stops
        const n = 14 + 6 * i + (seed % 3) * 3;
        const pos = d + n * (1 - rOut(f, a, b + 5 * i + 2 * seed));
        const frac = pos % 1, cur = Math.floor(pos) % 10;
        return (
          <div key={i} style={{ position: "absolute", left: 8 + i * 26, top: 0, width: 22, height: 40, overflow: "hidden" }}>
            {[0, 1].map((k) => (
              <div key={k} style={{ position: "absolute", left: 0, width: 22, top: 6 + (k - frac) * 34, textAlign: "center", ...mono(26, "#DEEAF8") }}>
                {(cur + k) % 10}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export const NightDecade: React.FC<{ at: number; end: number; nightAt: number; tenAt: number; costsAt: number; mathAt: number; mathEnd: number }> = ({
  at, end, nightAt, tenAt, costsAt, mathAt, mathEnd,
}) => {
  const f = useCurrentFrame();
  const born = rOut(f, at + 2, at + 24);
  // ★ the takeaway field COLLAPSES TO CENTRE instead of leaving sideways (spec §4)
  const out = rInOut(f, end - 14, end);
  const night = rOut(f, at + 4, nightAt + 14);
  // the rail runs out once the camera has begun to pull back (a first plate entering at the tight
  // framing's edge read as a stray block — stills sweep)
  const rail = rInOut(f, tenAt, tenAt + 32);
  const cost = rInOut(f, costsAt - 10, costsAt + 16);
  const spin = rOut(f, mathAt - 6, mathAt + 8);
  const rollEnd = Math.max(mathAt + 30, mathEnd);
  return (
    <div style={{
      position: "absolute", inset: 0, opacity: clamp01(born * 2) * (1 - out),
      transform: `scale(${(1 - 0.62 * out).toFixed(3)})`, transformOrigin: "50% 50%",
    }}>
     <Cam keys={[
       { at: at - 3, ...aim(CX, NIGHT_Y + 20), z: 1.5, dur: 1 },
       { at: tenAt - 16, ...aim(CX, 930), z: 1.0, dur: 46, ease: "io" },
       { at: mathAt - 8, ...aim(CX, 1010), z: 1.0, dur: 30, ease: "io" },
     ]}>
      <Turn at={at} end={end} from={-6} to={4} amp={0.9}>
        {/* ONE NIGHT — the Fed's */}
        <Plate x={CX - PL / 2 - 70} y={NIGHT_Y} w={PL} on={night} lit={0.3}>
          <svg width={70} height={70} viewBox="0 0 70 70">
            <path d="M 46 10 A 26 26 0 1 0 60 48 A 21 21 0 1 1 46 10 Z" fill="#002652" />
          </svg>
        </Plate>
        {night > 0.01 && (
          <>
            <div style={{ position: "absolute", left: CX + 26, top: NIGHT_Y - 30, opacity: night, ...label(28, "#D5E4F6") }}>ONE NIGHT</div>
            <div style={{ position: "absolute", left: CX + 26, top: NIGHT_Y + 10, opacity: 0.8 * night, ...label(22) }}>THE FED</div>
          </>
        )}
        {/* TEN YEARS — the bond market's */}
        {[...Array(10)].map((_, i) => {
          const g = clamp01(rail * 12 - i);
          const lit = clamp01(cost * 12 - i);
          return (
            <Plate key={i} x={RAIL_X0 + i * (RAIL_W + RAIL_GAP)} y={RAIL_Y} w={RAIL_W} on={g} lit={lit}>
              <span style={mono(26, mixHex("#002652", "#000E1D", lit))}>{i + 1}</span>
            </Plate>
          );
        })}
        {/* the price the market set on the decade — under the rail, over its names (spec §7) */}
        {cost > 0.01 && (
          <div style={{ position: "absolute", left: RAIL_MID, top: RAIL_Y + 62, transform: `translate(-50%, ${((1 - cost) * 24).toFixed(1)}px)`, opacity: cost, ...figure(104) }}>5%</div>
        )}
        {rail > 0.01 && (
          <>
            <div style={{ position: "absolute", left: RAIL_MID, top: RAIL_Y + 178, transform: "translateX(-50%)", opacity: clamp01(rail * 2 - 1), ...label(26, "#D5E4F6") }}>TEN YEARS</div>
            <div style={{ position: "absolute", left: RAIL_MID, top: RAIL_Y + 214, transform: "translateX(-50%)", opacity: 0.8 * clamp01(rail * 2 - 1), ...label(22) }}>THE BOND MARKET</div>
          </>
        )}
        {/* everything else, doing the math */}
        {spin > 0.01 && [...Array(8)].map((_, i) => (
          <div key={i} style={{ opacity: spin }}>
            <Odometer x={CX - 371 + i * 106} y={RAIL_Y + 290} seed={i + 2} a={mathAt - 6} b={rollEnd} />
          </div>
        ))}
        <Pool3D x={CX} y={RAIL_Y + 380} w={1000} on={0.5 * born} />
      </Turn>
     </Cam>
    </div>
  );
};

// ══ THE QUESTION — WHITE STAGE (designed story beat 2 of 2) ═══════════════════════════════════
// "Have you checked what your mortgage rate would be today? / Let me know below."
// A rate-quote form on the white stage (paper on paper, dark ink). Its fields fill as the
// question runs — the loan, the term — and the one that matters, YOUR RATE TODAY, stays EMPTY,
// its caret blinking. ⚠ No lender's name or logo — the form is generic.
export const RateQuote: React.FC<{ at: number; end: number; rateAt: number; todayAt: number }> = ({ at, end, rateAt, todayAt }) => {
  const f = useCurrentFrame();
  const born = rInOut(f, at - 2, at + 26);
  const out = rIn(f, end - 12, end);
  const rows = rInOut(f, at + 6, rateAt);
  const box = rOut(f, rateAt - 6, rateAt + 12);
  const pulse = rInOut(f, todayAt - 6, todayAt + 10) * (1 - rInOut(f, todayAt + 24, todayAt + 60));
  // the caret blinks SOFTLY — a hard on/off is a one-frame pop twice a second (V21)
  const caret = 0.15 + 0.85 * clamp01(0.5 + 1.6 * Math.sin(f / 5));
  const W = 620, H = 720, X = CX - W / 2, Y = 620;
  const INK = "#001F44";
  const field = (y: number, name: string, value: string, g: number) => (
    <>
      <div style={{ position: "absolute", left: 44, top: y, opacity: clamp01(g * 3), ...label(20, "#0B64CA") }}>{name}</div>
      <div style={{ position: "absolute", left: 44, top: y + 30, width: W - 88, height: 2, background: alpha(INK, 0.35) }} />
      <div style={{ position: "absolute", left: 44, top: y + 34, width: (W - 88) * g, overflow: "hidden", whiteSpace: "nowrap", ...mono(34, INK) }}>{value}</div>
    </>
  );
  return (
    <div style={{
      position: "absolute", inset: 0, opacity: clamp01(born * 1.6),
      transform: `translateY(${((1 - born) * 300 + 1250 * out).toFixed(1)}px) rotate(${(-3 + 1.4 * born).toFixed(2)}deg)`,
      transformOrigin: "50% 55%",
    }}>
      <div style={{
        position: "absolute", left: X, top: Y, width: W, height: H, borderRadius: 6,
        background: "linear-gradient(170deg, #FAFCFE 0%, #E7F0FA 70%, #D5E4F6 100%)",
        boxShadow: "0 30px 50px rgba(0,0,0,0.16), 0 2px 4px rgba(0,0,0,0.08)",
      }}>
        <div style={{ position: "absolute", left: 44, top: 44, ...figure(54, INK), letterSpacing: 2 }}>MORTGAGE RATE QUOTE</div>
        <div style={{ position: "absolute", left: 44, right: 44, top: 116, height: 4, background: INK, opacity: 0.85 }} />
        {field(160, "LOAN AMOUNT", "$400,000", clamp01(rows * 2))}
        {field(270, "TERM", "30-YEAR FIXED", clamp01(rows * 2 - 1))}
        {/* the empty one */}
        <div style={{ position: "absolute", left: 44, top: 400, opacity: box, ...label(24, INK) }}>YOUR RATE TODAY</div>
        <div style={{
          position: "absolute", left: 44, top: 444, width: W - 88, height: 150, borderRadius: 10, opacity: box,
          border: `3px solid ${alpha(INK, 0.55 + 0.4 * pulse)}`,
          boxShadow: pulse > 0.01 ? `0 0 ${(40 * pulse).toFixed(0)}px ${alpha("#000000", 0.12 * pulse)}` : undefined,
          transform: `scale(${(1 + 0.03 * pulse).toFixed(3)})`,
        }}>
          <div style={{ position: "absolute", left: 30, top: 34, width: 5, height: 80, background: INK, opacity: caret }} />
          <div style={{ position: "absolute", right: 30, top: 28, ...figure(92, alpha(INK, 0.25)) }}>%</div>
        </div>
      </div>
    </div>
  );
};

// ══ THE CLOSE — Style 3's outro, with the Bankers logo ═══════════════
export const BrandClose: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const p = rOut(f, at, at + 44);
  if (p <= 0.001) return null;
  const halo = 0.7 + 0.3 * (0.5 + 0.5 * Math.sin((f - at) / 52));
  // ★ BANKERS (Timur, 2026-09-25: "center the bankers in the very end, and make it look sort of better
  // and shinier in a way like you do with Style 3"): centred in the frame; the source close's halo kept;
  // the glow the source gives its accented wordmark, given to the logo; one specular sweep across the
  // letters once it has landed; and the mirror floor every Style 3 object stands on.
  const sweep = rInOut(f, at + 16, at + 42);
  const LH = LOGO_W / LOGO_ASPECT;
  const glow = `drop-shadow(0 0 ${(16 * halo).toFixed(1)}px rgba(0,93,200,0.9)) drop-shadow(0 0 ${(46 * halo).toFixed(1)}px ${alpha(theme.accent, 0.55)})`;
  const mask = {
    WebkitMaskImage: `url(${LOGO_WHITE})`, maskImage: `url(${LOGO_WHITE})`,
    WebkitMaskSize: "100% 100%", maskSize: "100% 100%",
    WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat",
  } as React.CSSProperties;
  return (
    <div style={{
      position: "absolute", left: CX, top: 960,
      transform: `translate(-50%,-50%) scale(${(0.84 + 0.16 * p).toFixed(3)})`, opacity: clamp01(p * 2),
    }}>
      {/* the source close's halo, wider for a wider mark */}
      <div style={{
        position: "absolute", left: -520, top: -230, width: 1040, height: 460, borderRadius: "50%",
        opacity: 0.55 * halo,
        background: `radial-gradient(ellipse, ${alpha(theme.accent, 0.36)} 0%, ${alpha(theme.accent, 0.09)} 46%, transparent 72%)`,
        filter: "blur(26px)", mixBlendMode: "screen",
      }} />
      {/* the mirror floor: the mark flipped, blurred and fading — as every Style 3 object stands */}
      <Img src={LOGO_WHITE} style={{
        position: "absolute", left: 0, top: LH / 2 + 14, transform: "translate(-50%, 0) scaleY(-1)",
        width: LOGO_W, height: LH, opacity: 0.16 * p, filter: "blur(3px)",
        WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.9), transparent 70%)",
        maskImage: "linear-gradient(to top, rgba(0,0,0,0.9), transparent 70%)",
      }} />
      {/* the mark, glowing. ★ Its letters are filled with a gradient in the LOGO BLUE'S OWN FAMILY — white at
          the top through the logo blue's 70% and 30% tints — because the flat #005DC8 sat at 2.8:1 on the
          navy ground and read as the same colour (Timur, 2026-09-25: "change the bankers text in the end to
          be more visible considering the background is almost the same color"). The file's shape is the
          mask; nothing is redrawn. The glow stays the logo blue. */}
      <div style={{ position: "absolute", left: 0, top: 0, transform: "translate(-50%,-50%)", width: LOGO_W, height: LH, filter: glow }}>
        <div style={{
          position: "absolute", inset: 0, ...mask,
          background: `linear-gradient(180deg, #FFFFFF 0%, ${theme.accentBright} 46%, ${theme.accent} 100%)`,
        }} />
      </div>
      {/* the specular sweep, clipped to the letters themselves */}
      {sweep > 0.001 && sweep < 0.999 && (
        <div style={{
          position: "absolute", left: 0, top: 0, transform: "translate(-50%,-50%)",
          width: LOGO_W, height: LH, ...mask, mixBlendMode: "screen",
          background: `linear-gradient(105deg, transparent ${(sweep * 140 - 30).toFixed(1)}%, rgba(255,255,255,0.9) ${(sweep * 140 - 18).toFixed(1)}%, transparent ${(sweep * 140 - 6).toFixed(1)}%)`,
        }} />
      )}
    </div>
  );
};
