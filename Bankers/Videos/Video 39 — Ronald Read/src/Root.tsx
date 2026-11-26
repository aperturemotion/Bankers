// @ts-nocheck
// Video 39 "The Janitor Who Died With $8 Million" (Ronald Read) — the Bankers 3-D World style, cloned from Video 38's engine.
import React from "react";
import { Composition } from "remotion";
import { RonaldRead } from "./w3d/Main";
import { TOTAL, FPS } from "./w3d/take";
export const RemotionRoot = () => (
  <>
    <Composition id="RonaldRead" component={RonaldRead} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} defaultProps={{ solo: undefined }} />
  </>
);
