// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as esm from "remotion";
import * as jsx_runtime from "react/jsx-runtime";
import { FPS, TOTAL_FRAMES } from "./bnx/captions";
import { HEIGHT, LotteryTear, WIDTH } from "./bnx/Composition";

export const RemotionRoot = () => /* @__PURE__ */ (0,jsx_runtime.jsx)(jsx_runtime.Fragment, { children: /* @__PURE__ */ (0,jsx_runtime.jsx)(
  esm.Composition,
  {
    id: "LotteryTear",
    component: LotteryTear,
    durationInFrames: TOTAL_FRAMES,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    defaultProps: { solo: void 0 }
  }
) });
