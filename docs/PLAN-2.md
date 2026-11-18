# Plan 2: UX pass, calibration branch, blind test

Status: **proposed, waiting for PO approval.**

## A. UX pass on `main` (before the branch, so calibration inherits it)

Checked against the PO's five UX rules:
1. one main job and one main action per screen;
2. summary first, details on click;
3. plain words, with key terms explained;
4. locked, empty and blocked states say why and what to do next;
5. on a phone, the main action is in thumb reach and nothing scrolls sideways.

| # | Commit | Change |
|---|---|---|
| U1 | Explain terms where they appear | One-line hints for: suggested rating, manager gap, far from results, escalated, behaviour score. They sit next to labels and in the stat cards. A shared `Term` component keeps the wording the same everywhere. |
| U2 | Summary first on HR screens | **Consistency:** each manager card shows status, gap and one sentence; the per-person chart opens with "Show people". "Far from results" becomes a short list, with the details shown on expand. **Person detail:** score tiles and the manager's assessment first; goals, behaviours and self-review in sections that open on click. **Cycle overview:** 3 summary figures instead of 4. Release stays the one main action. |
| U3 | One main action per row and screen | **Progress:** "Remind" stays as the row button; Extend and Remove move into a "More" menu. **Manager team:** the next review to do is highlighted as the main action. |
| U4 | Missing states | Tom's list currently loses an escalated review without a word. It will show "Moved to Anong Rattanakul on 14 Dec, because 3 days past the deadline". Every disabled button will say why and what to do next. |
| U5 | Thumb-reach actions on phones | A sticky bottom bar holds the main action on phones: Submit review, Submit self-review, Release. Content gets enough padding that the bar never covers it. |

Each commit keeps all 97 tests and the e2e run green at 1280 px and 390 px, with a screenshot check.

## B. Calibration on branch `calibration` (never merged into `main`)

**Rule:** after every review is submitted, managers calibrate ratings together across teams. Results stay locked until HR locks the calibration.

| # | Commit | Change |
|---|---|---|
| C1 | Calibration rules and tests | The cycle gets a `calibration` stage: not started → in session → locked. Starting it needs every review submitted. During the session an overall rating can be changed; each change records the rating before, the rating after, a reason and the date. Every flag becomes an agenda item, marked "keep" or "change" with a note. This replaces the separate flag review. Lock needs every agenda item resolved. Release needs calibration locked. All of it is logged. |
| C2 | HR calibration screen | Summary first: per team, the average rating against what the results suggest. Below it, the agenda (flagged cases), then all people across teams with the map. Main action: resolve the next agenda item, then "Lock calibration". |
| C3 | Manager and employee views | Managers see "Calibration in progress" and any changes to their team, with the reasons. Employees stay locked, and the message names calibration as the reason. After release, a changed rating shows as "Calibrated from 5 to 4", with the reason. |
| C4 | Guide, e2e, answers | Guide step 5 becomes "Calibrate, lock, release". The e2e run is extended. `docs/ANSWERS.md` Q2 records the time taken, files changed, what the existing design already handled, and what had to be added. |

The calibration branch is not deployed. The live link stays on `main`.

## C. Blind test (before the final stop)

- A fresh agent with no context gets only the app link and the five guided-path tasks, and reports where it got confused or stuck.
- It runs on `main` after the UX pass.
- Needs the live link, so Pages must be enabled. Otherwise it uses a local preview link and the log says so.
- Fixes go into `main`. Findings and fixes go into `WORKLOG.md`.
