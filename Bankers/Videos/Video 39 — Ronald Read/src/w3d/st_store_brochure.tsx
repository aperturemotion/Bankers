// @ts-nocheck
// ★ V38 — the WINFALL BROCHURE for the store station. Rev 2 (builder B, Timur 2026-11-26: "make the brochure a lot more detailed …
//   having actual text"): the leaflet is printed ONCE in ./print_leaflet.tsx (a real tri-fold: cover, HOW TO PLAY, PRIZES & ODDS,
//   THE ROLL-DOWN with its diagram, a sample play slip, small print, barcode) and shared with the rules station, so the leaflet in
//   the store and the leaflet at the close are the same object. Same exports and the same design-plane geometry as rev 1.
export { Brochure, BrochureStack, broPt, pxToDesign, RULE, BRO } from "./print_leaflet";
