// @ts-nocheck
// Recovered from the published Studio bundle (webpack-concatenated output; TS types were stripped by the build).
import * as esm from "remotion";
import { AUDIO_DATA } from "./audiodata.gen";

const BLOBS = {};
const toBlob = (uri) => {
  try {
    if (typeof window === "undefined" || typeof URL === "undefined" || !URL.createObjectURL) return uri;
    const comma = uri.indexOf(",");
    const mime = uri.slice(5, uri.indexOf(";"));
    const bin = atob(uri.slice(comma + 1));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return URL.createObjectURL(new Blob([bytes], { type: mime }));
  } catch {
    return uri;
  }
};
export const aud = (name) => {
  const d = AUDIO_DATA[name];
  if (!d) return (0,esm.staticFile)(name);
  if (!d.startsWith("data:audio")) return d;
  return BLOBS[name] ??= toBlob(d);
};
