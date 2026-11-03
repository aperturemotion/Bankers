import React from "react";
import { Composition } from "remotion";
import { TeslaFlyingRoadster, VIDEO_FRAMES } from "./tsla/Video";
import { Lab } from "./tsla/Lab";
import { WhiteLab } from "./tsla/WhiteLab";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="TeslaFlyingRoadster" component={TeslaFlyingRoadster} durationInFrames={VIDEO_FRAMES}
      fps={30} width={1080} height={1920} defaultProps={{ solo: undefined }} />
    {/* the look lab (src/tsla/Lab.tsx) — not part of the film */}
    <Composition id="Lab" component={Lab} durationInFrames={60} fps={30} width={1080} height={1920} defaultProps={{ piece: "house" }} />
    {/* the white-stage lab for teachA / honestB / honestC (src/tsla/WhiteLab.tsx) — not part of the film */}
    <Composition id="WhiteLab" component={WhiteLab} durationInFrames={VIDEO_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ piece: "teachA" as const, light: 1 }} />
  </>
);
