// The look lab's own entry (scratchpad/lab.mjs): only the Lab composition, so a piece can be stilled while the film is mid-build.
import { registerRoot } from "remotion";
import React from "react";
import { Composition } from "remotion";
import { Lab } from "./tsla/Lab";
const LabRoot: React.FC = () => React.createElement(Composition, { id: "Lab", component: Lab as React.FC<Record<string, unknown>>, durationInFrames: 2400, fps: 30, width: 1080, height: 1920, defaultProps: { piece: "limbo" } });
registerRoot(LabRoot);
