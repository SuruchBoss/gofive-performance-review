# Commit plan

Status: **proposed, waiting for PO approval.**

Working rule 4, as changed by the PO on 2026-11-18: after this plan is approved, the developer goes commit by commit without stopping. The next stop is when the prototype is done and deployed. `WORKLOG.md` is updated in every commit.

## Branch and deploy
- Work happens on the branch `prototype`, which starts from the current docs branch.
- At the end, `main` is fast-forwarded to `prototype`. GitHub Actions then builds and publishes to GitHub Pages. This is free for public repos.
- Commits 1–4 give the smallest slice that works end to end: open the app, switch role, a manager submits a review, HR sees the status change, and Reset restores the starting data.

## Commits

| # | Commit | What it contains | Tests |
|---|---|---|---|
| 1 | Scaffold the app | Vite + React + TypeScript, Vitest, npm scripts (`dev`, `build`, `test`), `.gitignore`. Empty shell with the label "a concept for empeo". | Smoke test that runs. |
| 2 | Add domain types, config and demo data | `src/domain/types.ts`, `config.ts` (all thresholds), `src/data/seed.ts` (Riverside Supply Co., section 5 of the design). | The seed has the agreed shape: 12 participants, 3 teams, 1 new joiner, the missing self-reviews, 2 Operations reviews open. |
| 3 | Add state store, demo clock and role switcher | Reducer, `localStorage` save/load, Reset, +1 day, top bar with role and person picker, hash routing. | Reducer actions, and Reset restoring the seed. |
| 4 | Add first end-to-end flow | Manager "My team" and a basic review form (behaviour and overall ratings, submit). HR "Progress" table, read-only. Employee "My result" in the locked state. | Submitting a review updates its status. |
| 5 | Add rating rules | Goal achievement, results score, suggested rating, the reason rule (≥ 1.0) and the evidence rule (overall 1, 2 or 5). Wired into the form, with anchors shown. | Boundaries: 60/80/100/120/140 %, clamping, lower-is-better goals, exactly 1.0 away, evidence length. |
| 6 | Add flags and the consistency screen | Individual "far from results" flags, the manager gap flag (minimum 3 reviews), flag keys that reopen when a rating changes. HR Consistency screen with "Mark reviewed". | Each seed manager gets the expected flag result. Gap at ±0.75 exactly. 2 reviews means no flag. Reopen on change. |
| 7 | Add employee goals and self-review | My goals, the self-review form, late submission until the manager submits, and "self-review missing" recorded on the manager's review. | On time, late, closed after the manager submits, and the missing marker. |
| 8 | Add deadline rules and HR actions | Overdue status, Remind, per-person Extend with a reason, automatic escalation at deadline + 3 days to the manager's own manager, and the head of company's "Escalated to you" list. | Overdue at deadline + 1. Escalation at exactly +3, not at +2. Runs once only. An extension before escalation moves it; one after does not. |
| 9 | Add eligibility hint and removal | Hint for joiners under 3 months. Remove from the cycle with a reason. Removed people are left out of counts and flags. | Hint boundary date, and removal excluding a person from the gap and the counts. |
| 10 | Add activity log screen | Lists every reminder, extension, escalation, removal, late self-review, flag review and release. | Each action writes exactly one entry. |
| 11 | Add release gate | Cycle screen with editable deadlines, the blocker checklist and Release. Employee results unlock after release. | Blocked by an open review, an unreviewed flag, or the un-removed new joiner. Allowed when all are clear. |
| 12 | Add results map and score sources | Two-axis map, team filter, rings on flagged dots, and a breakdown panel linking each score to its goals, anchors, reason and evidence. | The function that places a person in a grid cell. |
| 13 | Add intro box and guided path | Box that can be hidden, with the 5 steps from the design. Remembered in `localStorage`. | None (UI only). |
| 14 | Apply visual design and phone layout | Mint colour variables, type scale, status colours only for status, cards below 720 px, horizontal tabs on a phone. | Contrast is checked by hand and the ratios recorded in `WORKLOG.md`. |
| 15 | Add browser click-through | Playwright script that walks the guided path for every role at 1280 px and 390 px, checks for no horizontal scroll, and saves screenshots outside git. | The script itself. Output goes into `WORKLOG.md`. |
| 16 | Add GitHub Pages deploy | Actions workflow, the Vite `base` path, and `README.md` with the link, how to run it, and how to test it. | The workflow runs green on `main`. |
| 17 | Add draft answers to Part 2 | `docs/ANSWERS.md`: drafts of Q1 and Q2 for the PO to edit, and notes for Q3 taken from `WORKLOG.md`. | None. |

## Risks
- **Commit 8 (escalation) is the most complex rule.** If it runs long, the map in commit 12 keeps its scope and the polish in commit 14 is cut first.
- **Q3 asks about the PO's own experience with AI.** The developer can only offer candidate examples from the log. The PO should write the final answer.
