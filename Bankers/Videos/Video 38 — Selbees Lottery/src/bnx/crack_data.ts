// @ts-nocheck
// ★ V37 "Theranos" — crack's one dataset (builder C). The film's ONE pie is drawn to this share and nothing else.
//   SOURCE: SEC v. Holmes & Balwani complaint (N.D. Cal., Mar 14, 2018), ¶5: "Theranos' proprietary analyzer performed only
//   approximately 12 tests of the over 200 tests on Theranos' published patient testing menu, and Theranos used third-party
//   commercially available analyzers, some of which Theranos had modified … to process the remainder" (FACTCHECK.md line 7).
//   The disc is the menu (200, the "200+" floor), its lit sliver the Edison's ~12: 12 / 200 = 6 % = 21.6° of the disc.
//   (WSJ Oct 15, 2015 reported 15 of 240+ by end-2014, disputed by Theranos — the film uses the SEC's figure only.)
export const MENU_TESTS = 200;
export const EDISON_TESTS = 12;
export const EDISON_SHARE = EDISON_TESTS / MENU_TESTS;
// a guard against a silent edit: the share the disc is cut to must stay the SEC's ~12 of 200
const must = (ok, what) => {
  if (!ok) throw new Error(`crack_data: ${what}`);
};
must(MENU_TESTS === 200 && EDISON_TESTS === 12, "the SEC complaint ¶5 says ~12 of 200+ tests");
must(Math.abs(EDISON_SHARE - 0.06) < 1e-9, "the Edison's share must be 6 %");
must(Math.abs(360 * EDISON_SHARE - 21.6) < 1e-9, "the sliver must span 21.6°");
