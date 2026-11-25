// @ts-nocheck
// Video 36 "Bre-X Gold" — cloned from Video 35's recovered Root (transpiled JS; TS types were stripped by the build).
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { FPS, TOTAL_FRAMES } from "./bnx/captions";
import { TheranosBloodTest, HEIGHT, WIDTH } from "./bnx/Composition";
import { GlTest } from "./w3d/GlTest";

export const RemotionRoot = () => /* @__PURE__ */ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [ /* @__PURE__ */ (0,jsx_runtime.jsx)(
  esm.Composition,
  {
    id: "TheranosBloodTest",
    component: TheranosBloodTest,
    durationInFrames: TOTAL_FRAMES,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: { solo: void 0 }
  }
) , (0,jsx_runtime.jsx)(esm.Composition, { id: "GlTest", component: GlTest, durationInFrames: 60, fps: 30, width: 1080, height: 1920 }) ] });
