// builder 3's own lab (temporary): the Future place drawn with a horizontal pan, on the stage at `light`. Not part of the film.
import React from "react";
import { registerRoot, Composition, AbsoluteFill, useCurrentFrame } from "remotion";
import { Field, KeyLight } from "../../../src/tsla/stage";
import { theme } from "../../../src/tsla/theme";
import "../../../src/tsla/fonts";
import { Future } from "../../../src/tsla/places/future";
import { Committee } from "../../../src/tsla/places/committee";
import { Unsigned } from "../../../src/tsla/places/unsigned";
import { FU_CUES, CM_CUES, UN_CUES } from "../../../src/tsla/places/registry";
import { CybercabLab } from "../../../src/tsla/RoadsterLab";
const CBV = ["threeq", "side", "rear", "under", "front", "wheel"] as const;
const D3: React.FC<{ pan: number; light: number; zoom: number }> = ({ pan, light, zoom }) => {
  useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg, overflow: "hidden" }}>
      <Field light={light} lightX={30} lightY={12} />
      <KeyLight at={-100} x={280} y={-270} angle={16} len={2200} spread={520} strength={0.35 * (1 - light)} />
      <div style={{ position: "absolute", inset: 0, transform: `scale(${zoom}) translate(${pan < 0 ? 0 : -pan}px, 0px)`, transformOrigin: "540px 960px" }}>
        {pan <= -3 ? <CybercabLab view={CBV[-pan - 3]} /> : pan === -1 ? <Committee {...CM_CUES} end={99999} /> : pan === -2 ? <Unsigned {...UN_CUES} end={99999} /> : <Future {...FU_CUES} end={99999} light={light} />}
      </div>
    </AbsoluteFill>
  );
};
const Root: React.FC = () => <Composition id="D3" component={D3 as React.FC<Record<string, unknown>>} durationInFrames={2400} fps={30} width={1080} height={1920} defaultProps={{ pan: 0, light: 0, zoom: 1 }} />;
registerRoot(Root);
