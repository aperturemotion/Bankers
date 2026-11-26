// @ts-nocheck
// Video 38 "The Couple Who Beat the Lottery" — the Bankers 3-D World style (Timur, 2026-11-25).
import React from "react";
import { Composition } from "remotion";
import { SelbeesLottery } from "./w3d/Main";
import { TOTAL, FPS } from "./w3d/take_rt";   // rev 4c: REAL time (the new hook line)
export const RemotionRoot = () => (
  <>
    <Composition id="SelbeesLottery" component={SelbeesLottery} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} defaultProps={{ solo: undefined }} />
  </>
);
