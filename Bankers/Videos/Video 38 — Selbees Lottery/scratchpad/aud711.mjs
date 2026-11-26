import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia } from "@remotion/renderer";
import path from "path";
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const comp = await selectComposition({ serveUrl, id: "SelbeesLottery", port: 5895, inputProps: { solo: "audio" } });
await renderMedia({ serveUrl, composition: { ...comp, props: { ...comp.props, solo: "audio" } }, codec: "wav", outputLocation: path.resolve("out/aud711.wav"), port: 5895, inputProps: { solo: "audio" }, concurrency: 1 });
console.log("done");
