# The canonical Bankers engine

These files are copied into every Bankers video's module folder **unchanged** (`Bankers/STYLE.md` §0):
world.tsx · kit.tsx · parts.tsx · theme.ts · fonts.ts · stage.tsx · s3.tsx · text.tsx · track.tsx · close.tsx ·
anim.ts · SfxLayer.tsx · Probe.tsx

- A video never edits them. `node Bankers/Resources/stylecheck.mjs "<video folder>"` compares each one byte for byte
  (line endings aside) and refuses on any difference.
- To change the engine, Timur asks for a style change. Then:
  1. edit `Bankers/STYLE.md` and log it in its §16;
  2. edit the file HERE;
  3. copy it into the video being built;
  4. re-run the checker.
- Taken from Video 2 on 2026-09-28. That is Video 1's engine plus the `"zoom"` camera easing (world.tsx) and the
  tilted-shape quad in the probe.
- 2026-09-29 (Timur's review of Video 2), world.tsx:
  - SETTLE (bezier 0.45, 0.05, 0.12, 1) drives every "zoom" and "io" move. It replaced smootherstep and INOUT, so every
    move now ends in one long deceleration.
  - `LayerSpec.cam`: a layer can be projected by its own camera. Video.tsx uses it to pin an entering FG piece to the
    landed camera.
  - `FgEnter` / `FG_ENTER`: an FG piece glides into its corner on a push.
