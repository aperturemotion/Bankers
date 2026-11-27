import { bundle } from "@remotion/bundler";
import { selectComposition, renderFrames } from "@remotion/renderer";
import path from "path"; import fs from "fs";
const [a, b, nth = "2", scale = "0.4", outd = "out/seq"] = process.argv.slice(2);
fs.mkdirSync(outd, { recursive: true });
const PORT = Number(process.env.PORT_STILL ?? 5964);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const chromiumOptions = { gl: "swangle" };
const inputProps = { solo: "picture" };
const composition = await selectComposition({ serveUrl, id: "RonaldRead", port: PORT, chromiumOptions, inputProps });
const t = Date.now();
await renderFrames({ serveUrl, composition, inputProps, chromiumOptions, port: PORT, outputDir: path.resolve(outd), imageFormat: "png", scale: Number(scale), concurrency: 1,
  frameRange: [Number(a), Number(b)], everyNthFrame: Number(nth), timeoutInMilliseconds: 600000, onStart: () => {}, onFrameUpdate: (n) => console.log("done", n, ((Date.now() - t) / 1000).toFixed(0) + "s"),
  imageSequencePattern: "f[frame].[ext]" });
