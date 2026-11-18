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
  - Sales: gap about +0.9, with Nida Phrom far above her suggestion.
  - Support: gap about −0.9, with Mai Tran far below her suggestion.
  - Operations: 2 submitted reviews (gap about +0.1). The gap is not assessed until a 3rd review is in. This is a side effect of the "minimum 3" rule and makes a good demo step.
- **Note:** Fah Inthira (joined 3 Oct) has an open review, so she will also escalate on 14 Dec unless HR removes her first. That is realistic, so it was left in.
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
  - if Ying submits late before Tom reviews, her review is no longer recorded as missing.
- **Browser run:** Ying Chen submits late, the badge shows "Submitted late", and Tom's review form then shows her text and own rating. Width 390 on a phone. No errors.
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
- **What went wrong:** The Remind and Extend buttons wrapped onto two lines in the table. Fixed with `nowrap`. Also note: Fah Inthira (new joiner) escalates on 14 Dec too if HR has not removed her. This is expected and kept; it shows why the removal step matters.

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
  - Employee Nida sees her overall 5, goal results 3.9 and behaviours 4.8, with the reason and example.
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
  - Hovering Nida shows her tooltip with the open flag.
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
