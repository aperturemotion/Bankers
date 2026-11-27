// @ts-nocheck
// ★ V38 rev 5 (builder R) — THE DRIVE: how far the Selbees' sedan has gone along the road at every (story) frame, and where it sits
//   across the road. Timur, 2026-11-27: "slower camera movement overall, more seamless transitions … no fade outs".
//   Rev 2 had the sedan cruising past the Michigan store at highway speed (the world scrolled 0.85 m a frame from frame 1000), so the
//   camera had to leave a STANDING store and catch a car doing 57 mph in 34 frames: a whip of ≥ 400 px/f. Now the car is PARKED in the
//   store's lot, outside the window behind the lottery terminal; on "Then" its lamps come on and it pulls out and away, accelerating
//   gently onto the interstate. The camera rides along from rest — no relative speed ever has to be caught up.
//   The road station holds the car at its origin and scrolls the ground by S(f); the store (company_store.tsx) stands on the ground.
export const V = 0.85;                 // cruising: m per frame (~57 mph on screen; reads as cruising without strobing the 12-m lane period)
export const STORE_GX = 78;            // the store's window foot on the ground (company_store STORE[0])
export const CAR_SX = -0.4, CAR_SZ = -4.2;   // the parked car, store-local: just left of the terminal, 4.2 m out from the glass
export const S_PARK = STORE_GX + CAR_SX;     // the ground x of the parked car
export const CAR_Z0 = 11.5 + CAR_SZ;          // its ground z (lot); the lane centre is z 0
export const LIGHTS_ON = 1084;         // the lamps come on (on "Then", 1085)
export const FD = 1110;                // the car starts to roll
export const RAMP = 58;                // … and reaches cruising speed RAMP frames later (smootherstep)
const F = (x) => x * x * x * x * (x * x - 3 * x + 2.5);   // ∫ smootherstep
/** the ground distance the car has driven at story frame f (the road station's scroll) */
export const S = (f) => {
  if (f <= FD) return S_PARK;
  const x = (f - FD) / RAMP;
  return S_PARK + V * (x < 1 ? RAMP * F(x) : RAMP / 2 + (f - FD - RAMP));
};
const smoother = (t) => { const x = Math.max(0, Math.min(1, t)); return x * x * x * (x * (x * 6 - 15) + 10); };
/** the car's lateral position: parked in the lot (z CAR_Z0), it eases across the open shoulder into the right lane over 46 m */
export const carZ = (f) => CAR_Z0 * (1 - smoother((S(f) - S_PARK - 3) / 46));
/** its heading (rotation about y) from the path: atan2(−dz, dx) */
export const carYaw = (f) => { const dx = S(f + 0.5) - S(f - 0.5), dz = carZ(f + 0.5) - carZ(f - 0.5); return dx < 1e-5 ? 0 : Math.atan2(-dz, dx); };
/** the stretch of ground with no guardrail (the store's lot opens onto the shoulder) */
export const GAP = [S_PARK - 26, S_PARK + 64];
/** the MASSACHUSETTS gantry's ground x. rev 7: its LED band rolls "900 MILES" on the word (1213), when it stands 36 m ahead of the
 *  camera; the rising aerial then clears its truss by ~2 m as it passes over (st_road shots) */
export const GANTRY_GX = S_PARK + 87.4;
/** rev 7: the LED message trailer ("6 YEARS", 1169) on the left shoulder, 34 m ahead of the camera on the word */
export const VMS_GX = S_PARK + 54.3;
