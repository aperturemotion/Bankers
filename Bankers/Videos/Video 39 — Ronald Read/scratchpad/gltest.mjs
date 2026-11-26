import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill } from "@remotion/renderer";
import path from "path";
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
for (const gl of ["angle", "swangle", "swiftshader"]) {
  try {
    const composition = await selectComposition({ serveUrl, id: "GlTest", port: 3990, chromiumOptions: { gl } });
    const t = Date.now();
    for (const frame of [0, 30]) await renderStill({ serveUrl, composition, frame, port: 3990, chromiumOptions: { gl }, output: path.resolve(`out/gl_${gl}_${frame}.png`) });
    console.log(gl, "ok", ((Date.now() - t) / 2000).toFixed(2), "s/frame");
  } catch (e) { console.log(gl, "FAIL", String(e).slice(0, 200)); }
}
