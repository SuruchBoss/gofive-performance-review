# PLAN-6 — Quieter screens

**Status:** approved in the ticket ("short plan, then build without stopping"). This round only removes and moves things: no new features, help text or tips. Rules, data and `docs/ANSWERS.md` do not change. `main` first, then `calibration`.

**Rule for every screen:** one main action stands out; a button sits where the screen says the thing can be done; no sentence explains what the screen can show.

**Before (live main, 375 × 780 px):** content starts 279 px down on every screen. Full-page length: HR home 1,516 px, Fairness 2,726 px, review page 2,125 px.

## Commits

1. **Top of the phone screen.**
   - Demo bar in two rows: "You are" with the person's name only (the role is in the list's group headings, so no name is cut), then the date, "+1 day" and "More".
   - The tip line leaves the bar on phones and tablets; it becomes the first line inside "More".
   - Product header on phones: one line, smaller mark and name; the "Concept for empeo" tag shows from tablet width up.
2. **Review page.**
   - Remove the Behaviours paragraph.
   - "Suggested" label on the suggested button of the overall rating; remove "Underlined: nearest whole rating…".
   - Remove the rule paragraph and the "needs a reason (below)" status. The reason and example boxes appear only when the chosen rating needs them, each with one short line.
   - Send: the list of what is left only; the "N things left (listed above)" sentence goes.
3. **HR home.**
   - Late reviews grouped by manager: one "Remind Tom (2 reviews)" button per manager, with the people named on the row.
   - Each group's sentence cut to one short line, or dropped where the title says it.
4. **Fairness page.**
   - Manager card: the one-line finding and the two buttons first; "Show people" folded by default.
   - One short line under the heading instead of the "Difference from the team's results…" paragraph; shorter page intro.
   - Managers with nothing to check become one quiet line each.
5. **Words:** "self-review in" → "self-review received"; "moves up on 14 Dec" → "goes to Anong on 14 Dec".
6. **Tests and e2e** updated; one fresh-reviewer pass on a 375 px phone reporting, per screen, what it read before it found the main action.
7. **`calibration`:** merge, deploy both, check live; full-page 375 px screenshots of the review page, HR home and Fairness, with lengths before and after.
