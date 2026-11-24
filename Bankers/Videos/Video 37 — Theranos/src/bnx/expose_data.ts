// @ts-nocheck
// ★ V37 "Theranos" — expose's printed words (builder C, REV 1). The ONE readable sentence on the newspaper is the real front-page
//   headline of the story the line names: The Wall Street Journal, Oct 15, 2015 (online 12:05 a.m. ET; print Oct 16), by John
//   Carreyrou — "Hot Startup Theranos Has Struggled With Its Blood-Test Technology" (FACTCHECK.md line 9; REV1.md allows it). The
//   rest of the page is neutral texture (expose_page). The masthead and the dateline are labels (episode.json: exposeMast,
//   exposeDate).
export const EXPOSE_HEADLINE = "Hot Startup Theranos Has Struggled With Its Blood-Test Technology";
export const EXPOSE_BYLINE = "By John Carreyrou";
if (EXPOSE_HEADLINE.split(" ").length !== 9) throw new Error("expose_data: the headline must be the WSJ's own, word for word");
