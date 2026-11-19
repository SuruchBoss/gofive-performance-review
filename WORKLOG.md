# Work log

Working notes for the Product Owner. Newest entry at the bottom.

## Step 1 — Open questions (2026-11-18)

- **Done:** Read the task message and the repo (only README.md and one initial commit). Wrote this log. Sent the open questions to the PO.
- **Why:** The working agreement asks for questions before any design or code.
- **Who decided:** PO set the process; developer chose the questions.
- **What went wrong:** The brief was not in the message (only the placeholder "paste the full Gofive brief here"). `docs/BRIEF.md` was not created, so the brief is not invented. Asked the PO to paste it.

## Step 1b — Brief received (2026-11-18)

- **Done:** Saved the brief as `docs/BRIEF.md`.
- **Why:** The PO asked for the brief to be stored word for word.
- **Who decided:** PO (instruction). The text was forwarded by another Claude session that said the PO asked it to send the brief; the PO still needs to confirm the text is theirs.
- **What went wrong:** The forwarded text had HTML-escaped characters (`&gt;`, `&amp;`), probably from the copy step. They were turned back into `>` and `&`, which changes no words. The PO should confirm or say if the escaped form must be kept.

## Step 2 — Design draft (2026-11-18)

- **Done:** Wrote `docs/DESIGN.md`: screens per role, data model, rating/flag/deadline rules, demo data plan, three trade-offs, four open questions.
- **Why:** Working agreement step 2: design before plan and code.
- **Who decided:** Answers to the five open questions were relayed by another Claude session as the PO's reply ("use the recommendations; public repo is OK"). The developer chose the formulas and the demo data layout; all are marked for PO approval.
- **What went wrong:** Nothing yet. Noted that the PO's answers arrived through a relay, not directly; the PO should confirm when approving the design.

## Note — Proposed change to working rule 4 (2026-11-18)

- **Done:** Recorded a proposed change, not applied yet.
- **What:** A message relayed by another Claude session says the PO wants to drop the stop after every commit. The only stops would be: design ready, commit plan ready, and prototype done and deployed. All other rules stay.
- **Who decided:** Pending. It reached the developer through a relay, not from the PO directly. It removes a review point, so it waits for the PO's own confirmation. Until then, rule 4 stays as originally written. The design is not approved yet in any case, so this changes nothing right now.

## Step 3 — Design approved, rule 4 changed, commit plan (2026-11-18)

- **Done:** The PO confirmed directly that the relayed brief, the five answers and the rule 4 change are their decisions. Updated `docs/DESIGN.md`: marked it approved, limited the evidence rule to the overall rating, and recorded the four resolved questions. Wrote `docs/PLAN.md` (17 commits).
- **Why:** Working agreement step 3: plan before code.
- **Who decided:** PO: design approval, evidence on the overall rating only, keep "≥ 1.0", Operations plays both parts, managers are not reviewed, minimum 3 reviews for the gap, and rule 4 now stops only at design, plan and done-and-deployed. Developer: commit order and branch strategy (proposed).
- **What went wrong:** Nothing.

## Note — Design latitude granted (2026-11-18)

- **What:** The PO allows visual and small UX changes beyond `docs/DESIGN.md`: layout, typography, spacing, empty states and micro-copy. The aim is a real HR product feel, not generic AI output.
- **Still fixed:** scope, rules and thresholds, the demo data plan, the deep mint main colour, and the "no template look" rule.
- **Also allowed:** testing as much as needed, including browser click-throughs at desktop and phone width, and fixing what is found. Treat it as a customer-facing POC.
- **Rule:** Every design change beyond `docs/DESIGN.md` is recorded below, with one line on why.
- **Who decided:** PO.
- **Pending:** explicit approval of `docs/PLAN.md` and its three questions.

### Design changes beyond DESIGN.md
- **Demo controls in their own dark strip, above the product header** (commit 3). This keeps prototype controls (role, demo date, reset) visibly apart from the product a customer would use.
- **IBM Plex Sans as the typeface** (commit 3). A sober enterprise face with tabular figures and a matching Thai family. It avoids the default "Inter" look of generated UIs.
- **Rating scale as five joined squares, with a small tick under the suggested value** (commit 3). It is compact, reads as a scale rather than as pill buttons, and keeps the suggestion visible without choosing for the manager.
- **Square-cornered badges with a status dot, and 6 px button corners** (commit 3). This follows the "no pills everywhere" rule.
- **The manager's goal results are a two-line list, not a table** (commit 4). A four-column table squeezed the goal names into three lines in the half-width column.
- **The anchor text for the chosen level appears under each behaviour** (commit 4). The manager reads what the number means at the moment of choosing, instead of opening a separate guide.
- **Each goal shows a bar against a target line, and the suggestion box can expand to "How is this calculated?"** (commit 5). The manager sees where the number came from without leaving the form.
- **The distance from the suggestion is shown next to the overall rating ("2.0 from the suggestion")** (commit 5). The reason rule is then predictable, not a surprise at submit.
- **Required fields are listed above the Submit button instead of turning red as soon as they appear** (commit 5). Red fields before the manager has typed anything read as a telling-off.
- **Each manager card on the Consistency screen has a small per-person chart: a ring for the suggestion from results and a dot for the manager's rating** (commit 6). HR sees in one glance whether a gap comes from one person or from the whole team. That is the question HR has to answer before release.
- **An HR person-detail page (`#/hr/person/:id`)** (commit 6). Not listed in DESIGN.md. Every flag and every chart row links to it, which is how "every score links to where it came from" is met on the HR side.
- **The self-review uses a narrower reading column, and each own-rating number gets a plain label ("Met expectations")** (commit 7). An employee writing about their year should not face a dashboard-width form.
- **The Self-review navigation item shows a "1" while the employee still has to act** (commit 7). It is a quiet prompt instead of an email, which is out of scope.
- **HR Progress opens on a "Needs action" tab, with summary figures on top (submitted, overdue, escalated, self-reviews missing)** (commit 8). HR opens the screen to find what is stuck, not to read all 12 rows.
- **Overdue cases show "Escalates 14 Dec" under the deadline, and the manager sees the same date in a banner** (commit 8). The automatic rule is visible before it happens, so nobody is surprised by it.
- **The head of company sees "Assigned to me", with a red banner for escalated cases** (commit 8). The head has no team of their own in this cycle, so "My team" would be misleading.
- **The Remove dialog offers the two reasons from the brief as choices, plus "Other reason"** (commit 9). HR is the one deciding, but common reasons are worded the same way every time, which keeps the audit log readable.
- **New joiners get an amber "Joined 3 Oct: under 3 months" note in Progress and appear under "Needs action"** (commit 9). The system only points out the case. HR decides.
- **The HR home is a cycle overview: a timeline with "Today" placed among the steps, four summary figures, and a release checklist that names every blocker with a link** (commit 11). HR answers "can I release, and if not, why?" without opening other screens.
- **Release asks for confirmation and states what employees will see** (commit 11). It cannot be undone.
- **Employees see the manager's reason when a rating differs from results** (commit 11). This is a transparency choice; the PO may want to hide it.
- **The results map uses a single dot colour, an amber ring for an open flag, and shaded "strong on both" and "below on both" corners, with a list view beside it** (commit 12). Colouring by team would add three hues beyond the one main colour. The list is the accessible alternative to the chart and gives exact numbers.
- **Managers get a "Team map" of their own team only** (commit 12). DESIGN.md says managers see their own team on the map. A separate navigation item makes that visible.
- **The guided path ticks each step off from the demo data (for example, step 1 is done once Fah is removed), highlights the next step, and has a button that switches role and opens the right screen** (commit 13). A reviewer who knows nothing about the prototype always knows where they are. "Hide guide" is remembered, and a "Guide" button in the demo strip brings it back.
- **On phones the guide shows only the next step, with "Show all 5 steps"** (commit 14). The full guide filled the whole first screen on every page.
- **The phone tab bar fades at the right edge** (commit 14). It shows that more tabs scroll into view.
- **Reviews save as a draft automatically, and Submit asks for confirmation** (commit 4). A submitted review is locked, so the confirmation guards the one action that cannot be undone.

## Step 4 — Plan approved (2026-11-18)

- **Done:** Updated `docs/PLAN.md`: marked approved, moved the visual system to commit 3, and turned commit 14 into a review pass. Created branch `prototype`.
- **Why:** PO approval with two changes.
- **Who decided:** PO. Polish comes early and is not cut. If time runs short, the map's team filter is cut first. Branch plan and Q3 handling approved as proposed.
- **What went wrong:** Nothing.

## Commit 1 — Scaffold the app

- **Done:** Set up Vite 6, React 18.3, TypeScript 5.9 (strict) and Vitest 3, with `dev`, `build`, `test` and `typecheck` scripts.
- **Why:** A small, well-known toolchain. Exact versions are pinned in `package-lock.json`.
- **Who decided:** Developer, per the approved plan.
- **Notes:** Newer majors exist (Vite 8, React 19). The older versions were chosen because they are mature and their behaviour is well known; a demo gains nothing from the newest majors. `base: './'` makes the build work under the Pages sub-path.
- **What went wrong:** Nothing. Test: 1 passed. Build: OK.

## Commit 2 — Domain types, config and demo data

- **Done:**
  - `src/domain/types.ts` and `src/domain/config.ts`, which holds every threshold in one place.
  - `src/data/seed.ts`: fictional company Riverside Supply Co. with 17 people, 4 behaviours with written anchors for each level, and 36 goals, each with its source.
  - 7 seed tests.
- **Why:** Approved design, sections 3 and 5.
- **Who decided:** Developer chose the names, goals and numbers. The patterns follow the PO's demo data plan.
- **Numbers:** Worked out by hand before writing, so each pattern lands where the design says. Commit 5 tests check them against the real formulas.
  - Sales: gap about +0.9, with Nida Phrom far above the suggestion.
  - Support: gap about −0.9, with Mai Tran far below the suggestion.
  - Operations: 2 submitted reviews (gap about +0.1). The gap is not assessed until a 3rd review is in. This is a side effect of the "minimum 3" rule and makes a good demo step.
- **Note:** Fah Inthira (joined 3 Oct) has an open review, so that review will also escalate on 14 Dec unless HR removes Fah first. That is realistic, so it was left in.
- **What went wrong:** Nothing.

## Commit 3 — Visual system and app shell

- **Done:**
  - `src/ui/styles.css`: tokens for colour, type and spacing, the base components, and the phone layout below 860 px.
  - `src/ui/components.tsx`: badge, panel, page head, notice, avatar, stat, rating scale, dialog, empty state.
  - `src/ui/icons.tsx`: icons drawn for this project. No icon font, no emoji.
  - `src/ui/Shell.tsx`.
- **Contrast (WCAG AA needs 4.5:1):**
  - Mint `#0F6E5C` on white: 6.17. White on mint: 6.17.
  - Muted text `#5B6763` on white: 5.89.
  - Status text on its own background: red 5.79, amber 5.74, green 5.76.
  - Ink on white: 15.9.
- **Why:** The PO asked for the visual system early, so every screen is built to it.
- **Who decided:** Developer, under the PO's design latitude. Design changes are listed in the "Design changes" section above.
- **What went wrong:** On a phone, the shell grid stretched the navigation row and left an empty band. Fixed by switching the shell to block layout on narrow screens. Checked with a 390 px screenshot.

## Commit 3b — State store, demo clock and role switcher

- **Done:**
  - Pure reducer (`src/domain/actions.ts`) with a hook for automatic rules after every action.
  - Date helpers, with tests.
  - React store that saves the demo state and the view (role, chosen person, intro hidden) in `localStorage`, and falls back to the seed if storage is missing or old.
  - Hash router and the demo strip: view-as switch, person picker, demo date, +1 day, and Reset with a confirmation step.
  - Placeholder pages for every role.
- **Tests:** 14 passed (seed 7, dates 4, reducer 3). A browser click-through of role switch → +1 day → reset showed the correct dates and no console errors.
- **Who decided:** Developer, per the plan.
- **Design change:** Reset asks for confirmation. One stray click would otherwise wipe a reviewer's progress through the guided path.
- **What went wrong:** At 390 px the demo strip was wider than the screen and scrolled sideways. Fixed by dropping the labels on phones and letting the person picker shrink. Measured `scrollWidth` = 390 afterwards.

## Commit 4 — First end-to-end flow

- **Done:**
  - Reducer actions `save_review` and `submit_review`. Submitting records the date, records whether the self-review was missing, and writes a log entry.
  - Manager "My team" and the review form: goal results, self-review, 4 behaviours with anchors, overall rating, comment.
  - HR "Progress" table, which becomes cards on a phone.
  - Employee "My result" in its locked state.
- **Tests:** 17 passed. Browser run: as Tom Wattana, start the review for Ying Chen, rate everything 3, submit, switch to HR → Progress. The row shows "Submitted". No console errors. Page width 390 at phone size.
- **Who decided:** Developer, per the plan.
- **What went wrong:**
  1. The goals table was too cramped in a half-width column. Replaced it with a list.
  2. The overall rating scale stretched to the full width. Fixed with `align-self`.
  3. The selected rating lost its colour on hover. Fixed.
  4. The sticky evidence column was dropped, because it cut off long content.

## Commit 5 — Rating rules

- **Done:**
  - `src/domain/rating.ts`: goal achievement (clamped 0–150%, lower-is-better supported), weighted results, the suggested rating, the ≥ 1.0 reason rule with a floating-point tolerance, the evidence rule for an overall 1, 2 or 5 only, and the behaviour mean.
  - The reducer refuses to submit a review that breaks a rule, and stores `suggestedAtSubmit`.
  - The review form shows goal bars, the suggestion with its explanation, the reason and evidence fields when needed, and a to-do list above Submit.
- **Tests:** 43 passed. These include:
  - every boundary in the design (60/80/100/120/140%);
  - exactly 1.0 away, including the floating-point case;
  - 39 vs 40 characters of evidence;
  - a check that every seed review still passes the rules and matches its stored suggestion.
- **Browser run:** on Orn Lertsak (suggestion 3.05), choosing 5 showed both required fields and disabled Submit. Choosing 3 enabled it. Width 390 at phone size. No errors.
- **Who decided:** PO set the rules and thresholds. The developer chose the floating-point tolerance and the UI wording.
- **What went wrong:** `3 + (1.0 − 1)/0.2` is exact, but other inputs at 1.0 distance can come out as 0.9999999. A tolerance of 1e-9 was added and is tested.

## Commit 6 — Flags and the consistency screen

- **Done:**
  - `src/domain/flags.ts`: individual "far from results" flags and per-manager gap flags (minimum 3 reviews, threshold 0.75), worked out from the state on every change.
  - Each flag key holds the data it is about, so a reviewed flag reopens when that data changes.
  - `review_flag` action: needs a note, logs it, and changes no rating.
  - HR Consistency screen, the HR person-detail page, and an open-flag count in the navigation.
- **Tests:** 53 passed. New tests cover:
  - a gap of exactly ±0.75 is flagged and 0.74 is not;
  - 2 reviews never flag;
  - a team rated high that also has high results counts as in line;
  - the seed shows Sales above (+0.90), Support below (−0.89) and Operations "not enough reviews";
  - Operations is in line after Tom's 3rd review;
  - a flag reopens after its data changes.
- **Browser run:** 4 open flags. Marking the Sales flag reviewed lowered the count to 3. "Open review" goes to the detail page. Width 390 on a phone. No errors.
- **Who decided:** PO set the rules. The developer chose the key format for reopening flags and the per-person chart.
- **What went wrong:** The first version of the score tiles used `href="#goals"`, which the hash router would read as a route. Changed them to buttons that scroll to the section.

## Commit 7 — Employee goals and self-review

- **Done:**
  - `src/domain/selfReview.ts`: the self-review window. It is open until the deadline, open late until the manager submits, then closed.
  - Actions `save_self_review` and `submit_self_review`. Both need text and an own rating. A late submit is marked late and logged with the number of days.
  - Employee "My goals" and "Self-review" screens.
- **Tests:** 62 passed. New tests cover:
  - on the deadline day it is still on time;
  - after the deadline it is late, with the logged detail "15 days after the deadline";
  - it closes once the manager submits;
  - text and rating are both required;
  - if Ying submits late before Tom reviews, the self-review is no longer recorded as missing.
- **Browser run:** Ying Chen submits late, the badge shows "Submitted late", and Tom's review form then shows Ying's text and own rating. Width 390 on a phone. No errors.
- **Who decided:** PO set the rule ("can submit late until the manager finishes"). The developer chose the wording.
- **What went wrong:** The status badge sat far to the right of the narrow form. The header was moved into the same column.

## Commit 8 — Deadline rules and HR actions

- **Done:**
  - `src/domain/deadlines.ts`: effective deadline, case status (due / overdue / escalated / submitted / removed) and automatic escalation.
  - Escalation runs after every action. At deadline + 3 days, the review moves to the reviewer's own manager. It happens once only, a draft keeps its ratings, and the log is written by "system" and dated on the escalation day.
  - Actions `remind` and `extend` (needs a reason and a date later than both today and the current deadline). Both are logged.
  - HR Progress has summary figures, tabs, and Remind and Extend dialogs.
  - The manager team page and the review page show overdue and escalated banners. The head of company sees reviews escalated to them.
- **Tests:** 73 passed. New tests cover:
  - due on the deadline, overdue the day after;
  - no escalation at +2, escalation at +3, and only once after 6 days;
  - an extension before escalation moves the date; one after escalation does not move the review back;
  - removed and submitted cases never escalate;
  - reminder rules.
- **Browser run:**
  - Extended Ying to 17 Dec and reminded Tom about Orn, then pressed +1 day twice.
  - Orn and Fah escalated to Anong Rattanakul and Ying did not.
  - Anong's view lists both, with Orn's draft kept.
  - Width 390 on a phone. No errors.
- **Who decided:**
  - PO set the 3-day escalation to the manager's own manager, and the per-person extension with a reason.
  - Developer decisions:
    - calendar days, not working days;
    - the escalation log is dated on the escalation day, even if the clock jumps;
    - an extension after escalation gives the new reviewer more time.
- **What went wrong:** The Remind and Extend buttons wrapped onto two lines in the table. Fixed with `nowrap`. Also note: Fah Inthira (new joiner) escalates on 14 Dec too if HR has not removed Fah. This is expected and kept; it shows why the removal step matters.

## Commit 9 — Eligibility hint and removal

- **Done:**
  - `src/domain/eligibility.ts`: the cut-off is the period end minus 3 months (30 Sep 2026). Anyone who joined after it gets a hint, but nothing happens automatically.
  - `remove` action: needs a reason, is logged, and is blocked after release.
  - Remove dialog with preset reasons. Removed rows show the date and reason under "Everyone".
- **Tests:** 78 passed. New tests cover:
  - the cut-off date;
  - a start on 30 Sep gets no hint, a start on 1 Oct does;
  - the removal log text;
  - removing Mai drops Support to 2 reviews, so "not enough reviews" and the open flags go from 4 to 2;
  - a person cannot be removed twice.
- **Browser run:** removed Fah Inthira with the preset reason. The counts went from 9/12 to 9/11 and the row shows the reason. No errors.
- **Who decided:** PO set "removal with a reason". The developer chose the preset reasons and the cut-off based on the period end.
- **Open point for the PO:** Removing someone with a submitted review also removes that review from the consistency check. The test shows Support falls below the 3-review minimum. This is consistent with "left out of all counts", but HR should know it can hide a flag. Removal is therefore offered only for open cases in the UI, not for submitted ones.
- **What went wrong:**
  - On phones, cells with two lines laid out side by side. Fixed by wrapping them.
  - The dialog close button wrapped under the title. Fixed with `nowrap`.
  - The radio labels inherited the bold field-label style. Fixed.

## Commit 10 — Activity log screen

- **Done:**
  - HR Activity log, grouped by day with the newest first.
  - An icon and a type label on each entry, and the actor's name ("System" for automatic escalations).
  - Filter tabs: reminders and extensions, escalations, removals, flags and release.
- **Tests:** 85 passed.
  - New: each of reminder, extension, removal and flag review writes exactly one entry dated on the demo day.
  - Escalation writes one entry per case.
  - A refused action writes nothing.
  - Log ids stay unique.
- **Browser run:** +1 day twice, then Activity log shows 3 escalations under Mon 14 Dec. Width 390 on a phone. No errors.
- **Who decided:** PO set the requirement for the log. The developer chose the grouping and the filters.
- **What went wrong:** Nothing.

## Commit 11 — Release gate and cycle overview

- **Done:**
  - `src/domain/release.ts`: release is blocked by any open review of a person still in the cycle, and by any flag (individual or manager gap) without an HR note.
  - `release` action: logged, locks the cycle. After release, reminders, extensions and removals are refused, and self-reviews close.
  - `change_deadline` action: logged. Not allowed before the cycle opened.
  - HR Cycle overview: timeline, summary figures, release checklist, and both deadlines editable.
  - Employee "My result" unlocks after release and shows each score with its source. Removed employees see why they are not in the cycle.
- **Tests:** 92 passed. New tests cover:
  - blocked at the start (3 open reviews, 4 flags);
  - still blocked by only the un-removed new joiner;
  - still blocked by a single unreviewed flag;
  - release works once all is clear, and the cycle is then locked;
  - a late review that is far from results blocks release again;
  - a deadline change moves escalation, and dates before the cycle opened are refused.
- **Browser run (the full path):**
  - Tom submits Orn and Ying (rated 3).
  - HR removes Fah and marks all 4 flags reviewed. Release becomes enabled. HR releases.
  - Employee Nida sees the overall 5, goal results 3.9 and behaviours 4.8, with the reason and example.
  - Width 390 on a phone. No errors.
- **Who decided:** PO set the release rule. The developer decided that a global deadline change is allowed while the cycle is open, that it is logged, and that it can trigger escalations.
- **What went wrong:**
  - "Today" was drawn after "Results released" on the timeline. It now sits between steps in date order.
  - The employee tile label "Results" was unclear and was renamed "Goal results".
  - The date fields follow the browser's locale (US format in the test browser). This was left as is, because a real user's browser shows their own format.

## Commit 12 — Results map and score sources

- **Done:**
  - `src/domain/map.ts`: bands with cuts at 2.5 and 3.5 (a cut value counts as the middle band), cell labels, and plot points. Only submitted reviews of people still in the cycle are plotted. Open flags are marked, and a manager can be limited to their own team.
  - SVG map: hover and focus tooltip, a 36 px hit area around each dot, keyboard focus, and an accessible label per dot.
  - HR team filter. The list view links to each breakdown.
  - Manager "Team map".
- **Tests:** 97 passed.
  - New: the band edges, corner names, and 9 points in the seed with someone in every corner.
  - Flagged points are Nida and Mai. The manager view of Operations shows Krit and Ben.
- **Browser run:**
  - Hovering Nida shows the tooltip with the open flag.
  - The Customer Support filter shows 3 dots.
  - Clicking a dot opens `#/hr/person/e05`.
  - Width 390 on a phone. No errors.
- **Who decided:** PO set the two-axis map and "every score links to its source". The developer chose the single colour, the ring and the list view, following the charting guidance.
- **What went wrong:** At 390 px the SVG scaled its text down to about 6 px. On phones, the text and dot sizes are now set larger and the corner labels are hidden; the list still names each cell. The list rows were very tall because of the cell label, so only the team is kept there.

## Commit 13 — Intro box and guided path

- **Done:**
  - `src/ui/shared/Intro.tsx` shows what the prototype is and the 5 guided steps from the design. Each step's "done" state is worked out from the demo data.
  - Hiding the guide is saved in `localStorage` and undone by Reset.
  - A "Guide" button reopens it.
- **Tests:** 97 passed. The intro is UI only, so it has no new unit tests.
- **Browser run:**
  - "Open Orn's review" switches to Manager / Tom and opens the review.
  - "Hide guide" survives a reload.
  - Width 390 on a phone. No errors.
- **Who decided:** PO set the intro box with 4–5 steps that can be hidden. The developer chose the auto-ticking and the wording.
- **What went wrong:**
  1. The first wording was too long for 5 columns, so the cards were very tall. It was shortened.
  2. Some demo text used gendered pronouns for fictional people (for example "her year"). It was reworded to use names.
  3. Using a straight apostrophe inside a single-quoted string broke the build. Typographic apostrophes are used instead.

## Commit 14 — Visual review pass

- **Done:**
  - Screenshots of every screen at 1280 px and 390 px: HR cycle, progress, consistency, map, activity and person detail; manager team, review and team map; head "Assigned to me"; employee goals, self-review and result.
  - Checked that no page scrolls sideways at 390 px. `scrollWidth` was 390 on all of them.
  - Fixes:
    - the guide collapses to the next step on phones;
    - the phone tab bar fades at the right edge;
    - the "draft" label moved under the status badge instead of beside it;
    - the empty anchor placeholder is smaller on phones;
    - motion is turned off when the user prefers reduced motion.
- **Contrast (re-checked, WCAG AA is 4.5:1 for text):**

  | Pair | Ratio |
  |---|---|
  | Mint on white | 6.17 |
  | Mint on canvas | 5.72 |
  | Muted on white | 5.89 |
  | Muted on canvas | 5.46 |
  | Ink on white | 15.9 |
  | Red on its background | 5.79 |
  | Amber on its background | 5.74 |
  | Green on its background | 5.76 |
  | Dark mint on light mint (selected nav) | 7.62 |
  | Demo strip: light text on dark | 11.04 |
  | Demo strip: grey label on dark | 6.69 |

  The goal bars in lighter mint/grey are not text and carry their percentage as text beside them.
- **Who decided:** Developer, under the PO's design latitude.
- **What went wrong:** Nothing new. The issues found are listed above as fixes.

## Commit 15 — Browser click-through

- **Done:** `e2e/clickthrough.cjs` (`npm run build && npm run e2e`) starts a local preview server and walks the whole guided path in Chromium at 1280×900 and at 390×844. It covers every role:
  1. HR removes the new joiner.
  2. Tom picks a 5 for Orn and is blocked by the reason and evidence rules, then submits a 3. Tom's team map.
  3. HR reviews the Sales flag.
  4. +1 day twice: exactly one escalation (Ying → Anong).
  5. Ying submits a late self-review (marked late), and Ying's result is still locked.
  6. Anong submits the escalated review. HR reviews the remaining flags, opens the map and a person page, and releases.
  7. Nida sees the released result. Removed Fah sees why there is no result.
  8. Reset restores 12 Dec.

  At each of 14 screens it asserts no sideways scroll and saves a screenshot to `screenshots/`, which git ignores. The run fails on any console error.
- **Result:**
  ```
  PASS desktop (1280px): guided path complete, 14 screens checked, no sideways scroll, no console errors
  PASS phone (390px): guided path complete, 14 screens checked, no sideways scroll, no console errors
  ```
  Unit tests: 97 passed.
- **Who decided:** PO asked for a click-through of every role in a real browser at desktop and phone width. The developer used the Playwright library already in this environment rather than adding `@playwright/test`, to avoid installing another browser.
- **What went wrong:** The run passed the first time. Reviewing its phone screenshots found two layout issues:
  1. When all 5 guide steps were done, the phone guide expanded to show all of them again. It now stays collapsed.
  2. The label/value lists ("Manager's assessment") were cramped in two columns on a phone. They now stack.

## Commit 16 — GitHub Pages deploy

- **Done:**
  - `.github/workflows/deploy.yml`: on every push to `main`, it runs `npm ci`, the tests and the build, then deploys `dist/` with the official Pages actions.
  - `README.md`: link, what to try first, how fairness works, and how to run and test.
- **Why:** The PO chose GitHub Pages via Actions, which is free for public repositories.
- **Who decided:** PO.
- **Note:** GitHub Pages must be set to "Source: GitHub Actions" in the repository settings (Settings → Pages). If the first run fails at the deploy step, that setting is the likely cause. The PO can change it; the developer has no access to repository settings.

## Commit 17 — Draft answers to Part 2

- **Done:** `docs/ANSWERS.md`:
  - draft answers to Q1 (scope) and Q2 (the calibration change and what to measure);
  - five candidate examples for Q3, taken from this log.
- **Why:** Part 2 of the brief. The PO approved "developer drafts Q1 and Q2; Q3 is the PO's own answer".
- **Who decided:** Developer drafted. The PO decides the final wording.
- **Also:** Replaced the gendered pronouns used for fictional people in earlier entries of this log with names.
- **Deploy:** `main` was moved up to `prototype` (fast-forward from the initial commit). The first Actions run was in progress at the time of this entry.

## Deploy status (2026-11-18)

- **First Actions run (#1):** The build job passed (`npm ci`, 97 tests, build). The deploy job failed with `404 ... Ensure GitHub Pages has been enabled`.
- **Why:** GitHub Pages is not switched on for the repository yet. Only the repository owner can do this, in Settings → Pages → Source: "GitHub Actions".
- **Next:** After the PO enables it, re-run the workflow (Actions → "Test and deploy to GitHub Pages" → Run workflow), or push any commit to `main`.
- **Who decides:** PO (repository setting).

## Step 5 — "How this was built" (2026-11-18)

- **Done:**
  - Added a "How this was built" section to `README.md`: the time per step taken from commit timestamps (UTC+7), who decided what, and a link to this log.
  - Added an "About this prototype" link in the app header that opens a short dialog with the same facts and links to the README section, this log and the design.
- **Facts used:**
  - First commit after the brief: 21:43.
  - Deploy workflow commit: 22:32.
  - That is 49 minutes, including the PO's answer times.
  - Steps per the commit list. 97 unit tests.
- **Not claimed:** The live deploy time. Pages was not yet enabled at the time of writing.
- **Who decided:** PO asked for it and set the content. The developer wrote it.
- **What went wrong:** The first wording said "97 rule tests". Some of those tests cover dates and demo data, so it was reworded to "unit tests (rules and demo data)".

## UI fixes requested by the PO (2026-11-18)

- **Done (one commit, on `main` only; no calibration branch exists yet):**
  1. **Date format.** Deadline fields showed the browser's US format (11/27/2026). A new `DateField` shows the app's format ("27 Nov 2026") with a calendar icon. An invisible native date input on top keeps the device's own picker and keyboard input. It is used in the Cycle overview deadlines and in the Extend dialog.
  2. **Phone tabs.** HR tabs were cut off at 390 px with no hint. Phones now use short labels (Overview, Progress, Consistency, Map, Log) and tighter spacing, so all 5 fit at 390 px and 360 px. On narrower screens (320 px) the row scrolls. An edge fade then appears only on the side where tabs are hidden, and the current tab scrolls into view.
  3. **Guide arrow.** The "→" in the guide links is joined to the last word with a non-breaking space, so it never wraps alone.
- **Found while checking:** At 320 px the header link "About this prototype" (added in step 5) overlapped the product name. Below 420 px it now reads "About".
- **Checked in the browser:**

  | Check | 1366 px | 390 px | 320 px |
  |---|---|---|---|
  | Dates show "27 Nov 2026" / "11 Dec 2026" | ✓ | ✓ | ✓ |
  | Extend dialog shows "17 Dec 2026" | ✓ | ✓ | |
  | Changing a deadline saves and shows "15 Dec 2026" | ✓ | ✓ | ✓ |
  | All 5 guide arrows on the same line as their last word | ✓ | ✓ | |
  | Nav fits: HR (scroll 390 = width 390), Manager, Employee | ✓ | ✓ | |
  | HR row scrolls, with a fade on the hidden side | | | ✓ |
  | Header without overlap | ✓ | ✓ | ✓ |
  | No sideways page scroll, no console errors | ✓ | ✓ | ✓ |
- **Tests:** `npm test` 97 passed. `npm run e2e` PASS at desktop (1280 px) and phone (390 px).
- **Who decided:** PO asked for the three fixes. The developer chose short phone labels over a wrapping or two-row tab bar, because one row keeps the main content higher on the screen.
- **What went wrong:**
  - The first try (short labels only) still overflowed by 14 px at 390 px. Tighter tab padding fixed it.
  - The 320 px header overlap was caught in this check, not reported by the PO.
- **Deploy:**
  - After the PO enabled Pages, run #3 (a re-run) deployed successfully.
  - Run #4 (commit `ff38156`, these fixes) succeeded: tests, build and deploy.
  - The live site https://suruchboss.github.io/gofive-performance-review/ serves the new build. Checked at 1366 px and 390 px: dates "27 Nov 2026 / 11 Dec 2026", the tabs fit, no sideways scroll, no console errors.

## Plan 2 approved (2026-11-18)

- **PO decision:** `docs/PLAN-2.md` approved with one change. The calibration branch is deployed as a second build under `/calibration/` on the same Pages site, labelled "requirement change from question 2". The About dialog on `main` links to it, and `main` stays the main link. A, B and C run without stops unless something blocks.
- **Assumptions (the PO did not answer these, so the developer's recommendations are used):**
  - HR runs the calibration session on behalf of the managers, since there is no real login.
  - After release, employees see "Calibrated from X to Y" with the reason.
  - Q3 in `docs/ANSWERS.md` is left for the PO to write. The TikTok example is not inserted.

## U1 — Explain terms where they appear

- **Done:**
  - `src/ui/glossary.ts` holds one-line explanations for suggested rating, far from results, manager gap, escalated, behaviour score, goal results score and anchors. A shared `Explain` component shows them in muted text under the label.
  - Used on: the review form (suggestion box, behaviours); Consistency (page intro, the far-from-results list); Progress (the Escalated figure); the person detail and result tiles; the map intro (now says what a dot and the axes mean).
- **Why:** PO rule: "Explain terms like 'suggested rating' or 'manager gap' in one short line where they appear."
- **Tests:** 97 passed. e2e PASS at desktop and phone.
- **What went wrong:** A multi-line Python edit failed on a quote inside a triple-quoted string before it ran, so nothing changed. Edits now go through a script file with one replacement per line, which also fails loudly if a target is missing.

## U2 — Summary first on HR screens

- **Done:**
  - **Consistency:**
    - The page intro now says how many flags are left.
    - Each manager card shows one status badge, the gap as one large number, and one plain sentence ("Ratings are on average 0.90 higher than the team's results suggest"). The figures and per-person chart open with "Show the 4 people".
    - "Mark reviewed" is the card's main (filled) button.
    - Single flags show the person, the badge, and "Rated 5 · results suggest 3.9". The manager's reason opens on click.
  - **Person detail / employee result:** the score tiles and the manager's assessment come first. Goal results, behaviours and self-review are closed sections with a one-line summary ("3 goals · 123% of targets"). Clicking a score tile opens its section and scrolls to it.
  - **Cycle overview:** 3 summary figures instead of 4. "Removed from cycle" was dropped; it is visible in Progress and the log.
  - New shared components: `Disclosure` and `Section`.
- **Why:** PO rule: "Show the summary first; details open on click."
- **Tests:** 97 passed. e2e PASS at desktop and phone. Checked by hand at 1366 px and 390 px.
- **What went wrong:** The flag notice on the person page repeated the glossary line and read awkwardly. It was rewritten as one sentence with the limit in brackets.

## U3 — One main action per row and screen

- **Done:**
  - **Progress:** each open row shows one button, "Remind". "Extend deadline" and "Remove from cycle" move into a "More" menu (`MoreMenu`, keyboard: Escape closes, the first item gets focus).
  - **Manager "My team":** open reviews come first (drafts, then not started, then submitted), and only the most urgent one has the filled main button ("Continue review").
  - **Consistency** (from U2): "Mark reviewed" is the only filled button on each card.
- **Why:** PO rule: "Each screen has one main job and one obvious main action."
- **Tests:** 97 passed. e2e PASS at desktop and phone, after updating it to open "More" before "Remove from cycle".
- **What went wrong:**
  1. The menu was first placed inside the table's scroll box. It was clipped, and focusing it scrolled the table so the column headers went out of view. It is now positioned against the screen and closes on scroll.
  2. On a phone, a row near the bottom opened the menu below the screen edge. It now opens upwards when there is no room below. Both items were checked to be on screen at 1366 px and 390 px.
  3. On phones, the "joined under 3 months" note sat beside the name instead of under it. Fixed.
- **Correction after the U3 commit:**
  - The e2e run before the commit had actually failed. Its output was piped through `tail`, which hid the exit code, so the commit went ahead.
  - Cause: the menu closed on *any* scroll event, including the phone tab row and the browser scrolling the button into view.
  - Fix: the menu now follows its button on page scroll and resize instead of closing.
  - e2e PASS at desktop and phone (exit 0).
  - From now on test commands run with `set -o pipefail`, so a failing step stops the commit.

## U4 — Locked, empty and blocked states say why and what next

- **Done:**
  - **Manager whose reviews escalated:**
    - "My team" now lists them under "Moved to your manager", for example "Moved to Anong Rattanakul on 14 Dec 2026: 3 days past the deadline". Before this, they disappeared without a word.
    - Opening such a review explains where it went and says "Nothing to do now", instead of "not assigned to you".
  - **Disabled dialog buttons** say what is missing:
    - Extend: "Add a reason to continue" / "Choose 13 Dec 2026 or later".
    - Remove: "Describe the reason to continue".
    - Flag review: "Write a short note to continue".
  - **Employee "My result" while locked:** says what to do next. Either "Submit your self-review while you still can →" (while the self-review window is open) or "Nothing to do now".
  - **Cycle deadlines after release:** "Deadlines are locked because results have been released."
  - **Empty states:** they now end with what happens next.
  - Already covered before this step: Submit review (to-do list), Release (blocker list), and the self-review window.
- **Why:** PO rule: "Every locked, empty or blocked state says why, and what to do next."
- **Tests:** 97 passed. e2e PASS at desktop and phone (with `pipefail`). Browser check: Tom after +2 days sees both moved reviews, the moved-review notice and the Extend hint.
- **What went wrong:** The first version of the Extend hint computed the earliest date in a roundabout way. It now uses the dialog's own minimum date.

## U5 — Main action within thumb reach on phones

- **Done:**
  - Below 860 px, the main action of three screens sits in a bar fixed to the bottom of the screen: **Submit review**, **Submit self-review** and **Release results**. The bar has a 44 px button and a one-line status ("2 things left before you can submit (listed above)" / "7 items left before release"). On desktop the bar stays inline.
  - The page gets bottom padding so the bar never covers content, and toasts move above it.
  - On the review form, the to-do list now sits above the bar instead of inside it.
  - The Cycle overview's three summary figures sit in one compact row on phones instead of a tall column.
- **Why:** PO rule: "On a phone, the main action is easy to reach with one thumb, and nothing needs sideways scrolling."
- **Checked:** At 390×844 the Submit button is at y = 788 (bottom of the screen) without scrolling. At 1366 px it stays in the page. 97 tests passed. e2e PASS at desktop and phone.
- **Who decided:** Developer, under the PO's UX rules and design latitude.
- **What went wrong:** Nothing new.

## B0 — Deploy a second build under /calibration/ (on main)

- **Done:**
  - `deploy.yml` now builds `main` into the site root and, if a `calibration` branch exists, also builds and tests that branch into `/calibration/`. Both go into one Pages artifact.
  - A new `calibration-trigger.yml` runs on pushes to `calibration` and starts the main workflow, because only `main` can deploy to the `github-pages` environment.
  - The About dialog on `main` has a box, "Requirement change from question 2", with a link to `./calibration/`.
  - The README lists both links.
- **Why:** PO change to PLAN-2: reviewers should be able to click the calibration version, while `main` stays the main link.
- **Who decided:** PO set what to deploy. The developer chose the mechanism: one workflow on `main` builds both, plus a trigger.
- **Note:** Both builds share one browser origin. The calibration build therefore uses its own storage keys (see C1), so its demo state cannot mix with the main build's.

## C1 — Calibration rules and tests (branch `calibration`)

- **Done:**
  - **New types:** `Calibration` (not_started → in_session → locked), `AgendaItem` and `CalibrationChange`. `ManagerReview` gets `calibratedOverall` and `calibrationReason`. The manager's own rating is never overwritten.
  - **`src/domain/calibration.ts`:**
    - `finalRating`.
    - Start rules: every review submitted, at least 2 attendees.
    - The agenda is every flag at the moment the session starts, frozen then.
    - Lock rule: every agenda item resolved with a note.
    - Per-team average before and after calibration, against what results suggest.
  - **Reducer actions:**
    - `start_calibration`.
    - `calibrate_rating`: needs a reason, records from/to, is logged. Changing back to the manager's rating clears the calibrated value but keeps the history.
    - `resolve_item`: needs a note.
    - `lock_calibration`.
  - Removing people is blocked once calibration has started.
  - **Release gate:** every review submitted **and** calibration locked. HR flag notes are no longer a gate on their own, because the flags become the calibration agenda.
  - Separate storage keys (`pr-cal:*`), so this build never shares demo state with the main build on the same site.
- **Tests:** 106 passed.
  - The release tests were rewritten for the new rule. For example: "all flags noted but calibration not locked" is still blocked.
  - 11 new calibration tests: start rules, a 4-item agenda, a change with reason and log, reverting a change, Sales average 4.0 → 3.5 after two changes, lock rules, and no change after lock.
  - Shared test steps moved to `src/domain/testing.ts`.
- **Who decided:** PO set the requirement (exam Q2) and approved the plan. Developer assumptions, logged earlier: HR records the session for the group; the agenda is frozen at start.
- **What went wrong:** The first version imported test helpers from a test file. That made its tests run twice (112 counted). The helpers were moved to a plain module.

## C2 — HR calibration screen (branch `calibration`)

- **Done:**
  - **Navigation:** a new HR tab, "Calibration" ("Calibrate" on phones), with a count of cases still to agree.
  - **Before the session:** says why it cannot start ("3 reviews are still open… See Progress"), lets HR choose who is in the session, and has one main action, "Start calibration session".
  - **In session:**
    - Team cards show the average rating before → after against what results suggest, with the gap.
    - The agenda lists the frozen flags. The next case to discuss is open. A team case lists the team, and each person has "Change rating" (new rating plus a required reason). "Mark as agreed" needs an outcome note.
    - "Show all 11 people across teams" lets the group change anyone else.
    - Main action: "Lock calibration", enabled once every case is agreed, with a confirmation.
  - **After locking:** the list of agreed changes and "Go to release".
  - **Cycle overview:** the release checklist now asks for "Calibration across teams locked" instead of "Every flag reviewed by HR", and the third figure shows the calibration status.
- **Checked in the browser (1366 px and 390 px):**
  - Started blocked (open reviews). Tom submitted Orn and Ying, and HR removed Fah. Then: start, change Nida 5 → 4 with a reason, agree all 4 cases, lock.
  - The Sales card showed 4.00 → 3.75.
  - "Go to release" opened the Cycle overview with Release enabled.
  - No sideways scroll, no console errors.
- **Tests:** 106 passed.
- **Who decided:** Developer, under the approved plan and UX rules.
- **What went wrong:** On phones the team-card text wrapped into four lines. "Results suggest" was shortened to "Results".

## C3 — Manager and employee views of calibration (branch `calibration`)

- **Done:**
  - **Manager "My team":** a banner while calibration is in progress or locked ("…any change to your team is shown below with the reason. Nothing to do here"). Changed rows show "Calibrated 5 → 4".
  - **Manager review page:** a notice "Calibrated from 5 to 4" with the group's reason. The submitted notice now says managers calibrate before release.
  - **Employee "My result":**
    - While locked, it names calibration as a step ("Results open after every review is in, the managers have calibrated ratings across teams, and HR releases them") and shows its status (not started / in progress / done).
    - After release, the overall tile shows the final rating with "Calibrated from 5 to 4 across teams", and the assessment lists the reason (PO assumption: employees see it).
  - **Results map:** uses the final (calibrated) rating.
  - **Build label:** a filled header tag "Requirement change from question 2" that links back to the main version, and a page title saying it is the calibration build. The About box says which build this is and links to the main version.
- **Tests:** 106 passed. Checked the label and the locked result at 1366, 390 and 320 px; no sideways scroll.
- **Who decided:** PO: the label wording. Developer: the placement. Assumption: employees see the calibration change.
- **What went wrong:** Nothing.

## C4 — Guide and browser test for calibration (branch `calibration`)

- **Done:**
  - Guide step 5 is now "Calibrate, then release" and opens the Calibration screen. The guide's heading says this is the requirement-change build.
  - The e2e click-through has these additions:
    1. It checks the build label.
    2. After all reviews are in, HR starts calibration, changes Nida 5 → 4 with a reason, agrees every case, and locks.
    3. HR releases.
    4. Nida's result shows "Calibrated from 5 to 4".
  - The old "mark every flag" step was dropped, because flags are now agreed in calibration.
- **Result:**
  ```
  PASS desktop (1280px): guided path complete, 16 screens checked, no sideways scroll, no console errors
  PASS phone (390px): guided path complete, 16 screens checked, no sideways scroll, no console errors
  ```
  Unit tests: 106 passed.
- **Note:** The `docs/ANSWERS.md` update for Q2 is written on `main`, not on this branch, because that is the document that is submitted. See the next entry on `main`.
## Q2 answer updated with what actually happened (on `main`)

- **Done:** `docs/ANSWERS.md` Q2 now has a section "What happened when it was built":
  - the timing, taken from commit timestamps: about 8 minutes from branch to last commit, for 4 commits, not counting the plan;
  - the files changed: 24 files, +726 / −80 lines in `src/`;
  - what the existing design already handled: the release gate as one function, flags reused as the agenda, the suggestion already stored on each review, and the log, person page and map reused;
  - what had to be added: a new stage and change history, the changed release rule (4 tests rewritten), the new screen, and the separate storage and deploy setup;
  - what was not done: a real multi-person session.
- **Why on `main`:** The answers document is the submission, and the calibration branch is never merged.
- **Not claimed:** The time of the PO's approval. It is a chat message, not in git.

## Q3 answer: the PO's final wording (on `main`)

- **Done:** Replaced the candidate list under question 3 in `docs/ANSWERS.md` with the PO's text, exactly as written. The status line now says Q1 and Q2 are drafts and Q3 is the PO's final wording. The document title was left unchanged, because Q1 and Q2 are still drafts.
- **Who decided:** PO (wording). Developer: placement only.

## C — Blind test and fixes (on `main`)

- **How:** A fresh agent with no context got only the live link and the five tasks in plain words (not the guide's wording). It used a real browser at 1366×900 and 390×844 and was asked to report where it got confused or stuck. It completed all five tasks at both sizes. Task 5 (release) was the hardest, at about 28 clicks.
- **Findings and fixes:**

| # | Finding (blind tester) | Fix |
|---|---|---|
| 1 | Release blocker "Ying Chen: review not submitted (Anong Rattanakul)" led to Progress, where HR cannot act; the tester had to work out to switch to Manager → Anong (its "one change that would help most") | Each blocker now says who must act and links there: "Ying Chen: escalated to Anong Rattanakul (Managing Director) on 14 Dec, waiting for their review · **Open as Anong →**". The link (`?as=head`) switches the manager view. A new joiner's blocker says "joined under 3 months ago… · **Remove in Progress →**" |
| 2 | After +1 day nothing showed the escalation | The +1 day message now says "14 Dec 2026: 3 overdue reviews moved to the next manager up. See Progress or the Activity log." |
| 3 | "the Managing Director" in the guide vs "Anong Rattanakul" everywhere else | Reviewer names for the head show "(Managing Director)"; the guide names Anong |
| 4 | Guide says "Two reviews are overdue", screens say 3 | Guide: "Three reviews are overdue. One is for Fah…" |
| 5 | "Everyone (12)" after a removal next to "9 / 11" | Tab reads "Everyone (11 + 1 removed)" |
| 6 | "The tick marks the suggestion": there is no tick, it is an underline | "The underlined number is the suggestion" |
| 7 | Suggestion shown as 3, "exact value 3.05", "2.0 from the suggestion", dialog "Suggested 3.05" | Whole numbers throughout; the distance is in words: "Far from the suggestion: add a reason below" / "Close to" / "Same as" |
| 8 | Unsure whether "Comment for Orn" was required | Label says "(optional)" |
| 9 | Flag labels worded differently | One pattern: "Daniel Reyes's ratings: above results", "Nida Phrom's rating: above results" |
| 10 | Anong's page says "Reviews assigned to me" but the breadcrumb says "My team"; the escalated banner stays after submitting | Breadcrumb "Assigned to me" for the head; the banner counts only open escalated reviews |
| 11 | Switching to Employee after release opened My goals, not My result | After release, Employee opens My result |
| 12 | Employee result: "Goal results 2.6" beside "Overall 3" while the manager saw "suggest 3" | Tile shows "92% of goal targets… suggests an overall 3" |
| 13 | Toasts cover rows and buttons (both sizes) | Desktop: bottom-right corner. Phone: top of the screen |
| 14 | Phone: person picker cut off | Picker gets its own full-width row; shorter labels ("Tom Wattana · Operations") |
| 15 | Phone: Activity log tabs cut off | Shorter labels ("Reminders", "Flags"); panel tabs wrap on phones |
| 16 | Phone: guide fills the first screen | Description paragraph hidden on phones; only the title, next step and controls show |
| 17 | Phone: rating buttons leave an empty strip | The scale keeps its own width instead of stretching |
| 18 | Phone: bottom bar says "(listed above)" but the list is out of view | The bar shows the first missing item: "Rate the 2 remaining behaviours. (+1 more)" |
| 19 | Guide says "Use View as", which phones do not show | "Switch between HR, Manager and Employee at the top" |
| 20 | Unclear words: "Measured, not rated", "context only", "written anchors", "Escalates 14 Dec" | "From company systems", "for information only", anchors explained as "a short written description (shown when you pick it)", "Moves to Anong Rattanakul (Managing Director) on 14 Dec" |

- **Not changed:**
  - "Manager gap" and "Results map / Map": both already have one-line explanations on their screens. The tester read them only in passing.
  - The phone guide still takes about half the first screen. It can be hidden, and hiding is remembered.
- **Checked:**
  - 97 unit tests passed. e2e PASS at desktop and phone (the picker label in the test was updated).
  - Browser check at 1366 px and 390 px:
    - the +1 day message after two clicks;
    - all three blockers name Anong with "Open as Anong →", and the link selects Anong;
    - the Activity tabs fit;
    - the scale is 202 px with no strip;
    - the bar text;
    - no sideways scroll, no errors.
- **Who decided:** PO asked for the blind test and for fixes. The developer chose the fixes.

## Merge `main` into `calibration` (one direction only)

- **Done:** Merged `main` into `calibration`, so the second build has the UX pass and the blind-test fixes. `main` was not changed, and `calibration` is still not merged into `main`.
- **Conflicts and how they were resolved:**
  - `release.ts`: kept `main`'s blocker wording and "Open as…" links, and the calibration build's rule (open reviews + calibration locked). The calibration blocker gets the action "Open Calibration".
  - Activity log filters: kept both ("Calibration" and "Flags").
  - Cycle overview: the calibration item uses the new "text · action →" format.
  - `styles.css` and this log: kept both sides.
- **Checked:**
  - Calibration build: 106 unit tests passed. e2e PASS at desktop and phone (16 screens).
  - Still separate: `pr-cal:*` storage keys, the guide step "Calibrate, then release", the About text for this build.
## Final deploy check (Plan 2 done)

- **Runs:**
  - #10 on `main` (blind-test fixes): success.
  - The trigger on `calibration` (the merge): success.
  - #11 (rebuild of both builds): success.
- **Live check** in a real browser at 1366 px and 390 px:
  - Main: https://suruchboss.github.io/gofive-performance-review/ has no calibration label, three actionable blockers, no sideways scroll and no console errors.
  - Calibration: https://suruchboss.github.io/gofive-performance-review/calibration/ shows the "Requirement change from question 2" label and three blockers, with no sideways scroll and no console errors.
- **Branches:**
  - `main` = `prototype` (`f01fbff` plus this log entry).
  - `calibration` = `6fa8319`. It contains `main` up to the blind-test fixes and is not merged into `main`.

## PO phone test: header overlap and a confusing first open (on `main`)

- **PO report:**
  1. On a 412–430 px phone the "Concept for empeo" badge overlapped "About this prototype".
  2. The guide said what to click but not why. In Employee view it still showed "1. See who is late" (an HR step) without saying so.
- **Header (1):**
  - **Measured** every width from 320 to 900 px. The overlap was real from **421 to 511 px**. Earlier checks used only 320 and 390 px, which is why it was missed.
  - **Cause:** below 420 px the badge was hidden and "About" was short, while above 420 px both showed in one row with no room.
  - **Fix:** the brand area may shrink, the name and tags stack on phones, and "About" stays short up to 860 px. The "Concept for empeo" label is now visible at every width; before, it was hidden below 420 px, which went against the brief's labelling rule.
  - **Re-scan:** no overlap from 320 to 1600 px. Checked by eye at 320, 412, 430, 500 and 861 px.
- **Also found by scanning all 11 screens at every width from 320 to 500 px:** the Results map scrolled sideways below 386 px. The grid column took the list table's minimum width, and the team filter tabs did not wrap.
  - **Fixed:** the grid column can shrink; on small phones the list hides avatars and team names, names and badges wrap, and the filter tabs wrap.
  - **Re-scan:** no sideways scroll on the page or inside any box, on any screen, from 320 to 500 px.
- **Guide (2):**
  - A first line states the problem: "every manager rates on their own scale, so a 4 in one team is not a 4 in another. This shows how HR catches that before results reach employees." It shows on phones too.
  - Each step shows who it is done as ("As HR · Pim Chaiyaporn", "As Manager · Tom Wattana", "As HR · Pim Chaiyaporn, then Employee · Nida Phrom").
  - Each link switches to that role and person by itself. When that means a switch, it says so ("Switch to HR and open Progress →").
  - Step 4 has its own "+1 day" button, showing the current date.
  - Step 5 adds "See Nida's result" as an employee.
  - The footer says which role is active.
- **Tests:** 97 passed. e2e PASS at desktop and phone. The e2e "+1 day" clicks now target the demo strip, because the guide has a second button with that name.
- **What went wrong:** One check script ran from the repository folder and saved 3 screenshots there. They were moved out before the commit.

## Merge `main` into `calibration` (header and guide fixes)

- **Conflicts and how they were resolved:**
  - Header: `main`'s new layout, with this build's "Requirement change from question 2" tag in the tag row.
  - Guide step 5: `main`'s new step format ("As HR · Pim Chaiyaporn, then Employee · Nida Phrom"), keeping this build's "Calibrate, then release" step that opens Calibration.
  - This log: kept both sides.
- **Removed:** the calibration-only rule `.brand { flex-wrap: wrap }`. With the new header it pushed the logo onto its own line at 320 px.
- **Checked on this build:** no header overlap from 320 to 900 px, and no sideways scroll on 12 screens (including Calibration) from 320 to 500 px. 106 unit tests passed. e2e PASS at desktop and phone.
## Landing page and guide fit (on `main`)

- **PO decision (replaces the previous message):** a calm landing page at the root URL with no demo data. "Open demo" opens the app with the guide. The guide must fit that moment, and there must be a way back. Header widths from 320 to 500 px must be checked. The calibration build gets the same page, labelled as the question 2 version. Five persona agents replace the single blind test. The single phone blind test already running was stopped, because this message replaces it.
- **Done:**
  - **`src/ui/Landing.tsx` at `#/`** (the root). It shows:
    - the product name and "Concept for empeo";
    - one sentence on the problem;
    - one large "Open demo" button, full width on phones;
    - "Fictional company and people. Nothing is sent anywhere.";
    - small links to the calibration version (question 2) and "How this was built" (README).
    - No top bar, role switcher, dates or numbers. The only digit is the "2" in the link text the PO asked for.
  - **`src/build.ts` (`IS_Q2_BUILD`):** a one-line flag, so the calibration branch can label its landing page without duplicating it.
  - **Open demo:** selects HR, shows the guide and opens the Cycle overview.
  - **Way back:** "Exit demo" in the demo strip, and the logo in the header links to the start page.
  - **Guide:** if the next step is for another role, it says so in its own line, for example "This step is for HR. You are viewing as Employee: the link below switches for you". This is on top of the role tag and the switching link.
  - **Demo strip on narrow phones:** "Reset" / "Exit" short labels (full names kept for screen readers). No wrapped buttons from 320 to 500 px.
  - **e2e:** starts on the landing page (checks "Open demo" and that no demo controls show), and tests "Exit demo".
- **Header (point 3):** already fixed in the previous step. Re-scanned after these changes: no overlap at any width from 320 to 900 px, and no sideways scroll on 12 screens (including the landing page) from 320 to 500 px.
- **Tests:** 97 passed. e2e PASS at desktop and phone (15 screens).
- **What went wrong:** On the first e2e run, "Exit demo" appeared not to work, because the test checked before the page had redrawn. The test now waits for the start page.

## Merge `main` into `calibration` (landing page)

- **Done:**
  - Merged `main`. The only conflict was this log; both sides were kept.
  - Set `IS_Q2_BUILD = true`. The calibration landing page shows the "Requirement change from question 2" tag and one sentence on what this version adds, and links to "Main version" instead of the calibration version.
- **Checked:**
  - 106 unit tests passed. e2e PASS at desktop and phone (17 screens).
  - No sideways scroll on 13 screens (including the landing page and Calibration) from 320 to 500 px.
  - No header overlap from 320 to 900 px.
## Blind test 2: five personas, and fixes (on `main`)

- **How:** After the landing page was live, five fresh agents ran independently. Each got only the live link, one persona and "Someone sent you this link. Try it and evaluate it." (plus how to drive a browser). No repo, docs, guide hints or task list.
  - HR manager (desktop): **7/10**.
  - Team manager (desktop): **7/10**.
  - Sales employee (phone): **6/10**.
  - Non-technical employee on the bus (phone): **6/10**.
  - Sceptical employee who felt underrated (phone): **6/10**.
  - All reports, the fixes and the open decisions are in `docs/blind-test-2.md`.
- **Fixed (clear bugs or confusion):**
  - The suggested rating is shown with one decimal on every screen. The manager sees which whole ratings need no reason, and that a 1, 2 or 5 needs an example.
  - Level descriptions show on hover.
  - The self-review hint was rewritten (broken grammar).
  - A self-review asks for confirmation before it locks.
  - Overall ratings show level words.
  - Status badges say what they refer to.
  - Manager and employee screens show a "Viewing as …, pick a name at the top" line.
  - The guide shrinks to one line in another role's view.
  - The manager's reason hint now says the employee also sees it.
  - An escalated result explains why another person rated it.
  - "Late or escalated, still open".
  - The removed employee no longer sees the "your manager sees" line.
  - A line explains that the overall rating is the manager's call, informed by both scores.
  - New test: `ratingsWithoutReason` (2.6 → 2 or 3; 3.0 → 3; 3.05 → 3 or 4; 4.17 → 4 or 5).
- **Not changed, listed for the PO** (they change scope or rules): follow-through on a flag (return to manager), an employee response button, telling employees about the consistency check, who sees the manager's reason, evidence when rating down, a behaviour vs overall mismatch rule, a live team-gap meter for managers, the landing framing ("try it as HR, a manager or an employee"), and the Nida demo-data reason.
- **Tests:** 98 unit tests passed. e2e PASS at desktop and phone. The e2e now confirms the self-review dialog.
- **Who decided:** PO asked for the five-persona test, for clear issues to be fixed and for scope or rule changes to be listed. The developer judged what is "clearly a bug or clearly confusing" against the rules in `docs/DESIGN.md`. Anything that would change what someone sees or can do was left for the PO.
- **What went wrong:** A repository check asked for a push before this step was finished. The first fix commit was pushed to `prototype` only and moved to `main` together with this entry.

## Merge `main` into `calibration` (blind test 2 fixes)

- **Conflicts and how they were resolved:**
  - Cycle overview: kept the new label "Late or escalated, still open" next to this build's Calibration figure. No "Flags reviewed" figure, because calibration replaces it.
  - Result tile: shows the final (calibrated) rating with its level words, the "moved from" note for escalated reviews, and the "Calibrated from X to Y" line.
  - This log: kept both sides.
- **Checked:**
  - 107 unit tests passed. e2e PASS at desktop and phone (17 screens).
  - No sideways scroll on 13 screens from 320 to 500 px.
  - No header overlap from 320 to 900 px.
## Live check after blind test 2 fixes

- **Runs:**
  - #17 (`main`, `f4d0979`): success.
  - The calibration trigger (merge `ac22292`): success.
  - #18 (rebuild of both builds): success.
- **Live, both builds:**
  - Text that exists only after the merge is served at /calibration/.
  - On a Pixel 7, after "Open demo" → Employee: the one-line guide bar ("Guide, step 1 of 5: See who is late. This step is for HR. Switch to HR and open Progress →"), the "Viewing as Ying Chen…" line, and the reason rule on the manager form ("No reason needed for 2 or 3…").
  - No console errors.
  - No sideways scroll on any screen from 320 to 500 px (12 screens on main, 13 on calibration).
  - No header overlap from 320 to 900 px.
- **Stopped here:** 9 points in `docs/blind-test-2.md` ("For the PO to decide") change scope or rules and are waiting for the PO.

## PO decisions on blind test 2, built (on `main`)

- **PO decisions:**
  1. Build "Return to manager" on flags.
  3. Light version: employees are told that HR checked consistency.
  4. Keep: employees see the manager's reason.
  8. The landing page lets the visitor pick HR, Manager or Employee, with the guide adjusted.
  9. Reword Nida's reason.
  - 2, 5, 6 and 7 are not in v1; they go into Q1 as "next".
  - A re-test follows: the same five personas plus an ease-of-use score, and a sixth agent who is a senior product designer.
- **1. Return to manager:**
  - **Rules** (`return_to_manager` and `submit_review` with an answer):
    - HR writes a question, the submitted review reopens for its manager, and every step is logged ("Returned to manager", "Manager answered HR").
    - Release stays blocked until the manager answers. Either they change the rating and resubmit, or they confirm it with an answer; the outcome is recorded as changed or confirmed.
    - The answer closes the flag that started the return.
    - A returned review never escalates (its original deadline no longer applies), and it does not reopen the self-review window.
  - **Screens:**
    - Consistency: a "Return to manager" button on every flag. For a team flag, HR picks whose review; the one furthest from results is preselected. A "Waiting for managers" list shows each open question with "Open as Daniel".
    - Manager review: a banner with HR's question, a "Your answer to HR" field, and a button that says "Confirm and send answer" or "Resubmit with answer".
    - My team: an "HR returned 1 review" notice and an "Answer HR" button.
    - Progress badge: "Returned by HR".
    - HR person page: the return history.
  - **Tests:** 8 new rule tests. The e2e does the full round trip: HR returns Nida, Daniel confirms, and the answer is logged.
- **3.** After release, the employee result says "Checked for consistency before release: HR compared every manager's ratings with their own team's goal results and followed up where they did not match." No gap numbers.
- **8. Landing page:** "Try as HR" (filled), "Try as Manager" and "Try as Employee", each with one line and opening that role.
  - The guide has a track per role. HR: the existing 5 steps; step 3 now mentions "Return to manager". Manager (Tom): finish Orn's review, watch a deadline slip, answer a question from HR. Employee (Ying): write the self-review, see why the result is locked, see a released result.
  - "Guide for: HR · Manager · Employee" switches the track. Visited screens are remembered, so the "see why it is locked" step can tick itself off.
- **9.** Nida's reason now stays inside the period: "from June Nida also trained our two new account executives… both reached target by November".
- **2, 5, 6, 7:** added to Q1 in `docs/ANSWERS.md` as "Next, from user testing", one line each with the reason. Q1's "right slice" paragraph now refers to Return to manager.
- **Checks:**
  - 106 unit tests passed. e2e PASS at desktop and phone.
  - No sideways scroll on 12 screens from 320 to 500 px. No header overlap from 320 to 900 px.
  - Landing button sub-text contrast 4.99:1.
- **What went wrong:** Another multi-line Python edit failed on its quoting before it ran, so nothing changed. It was rerun from a file.

## Merge `main` into `calibration` (decisions built)

- **Conflicts and how they were resolved:**
  - Activity log filters: kept both ("Calibration" and "Flags", which now include return steps).
  - Manager review: the locked notice says managers calibrate before release; the calibrated-rating notice and the "You answered HR" notice both show.
  - My team: the calibration banner and the returned-reviews notice both show.
  - Review summary imports: merged.
  - This log: kept both sides.
- **Calibration-only rules:**
  - "Return to manager" is refused once calibration has started, because ratings then change in the session. New test added.
  - The employee note says HR compared ratings with results "and managers calibrated ratings together across teams".
  - The release test from `main` was adjusted: here, release also needs a locked calibration.
- **Checked:**
  - 116 unit tests passed. e2e PASS at desktop and phone (17 screens).
  - No sideways scroll on 13 screens from 320 to 500 px. No header overlap from 320 to 900 px.
