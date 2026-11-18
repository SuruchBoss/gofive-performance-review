# Part 2 — Answers (draft for the PO to edit)

Status: Q1 and Q2 are **drafts**, written by the developer from `docs/DESIGN.md` and `WORKLOG.md` for the PO to edit. Q3 is the PO's final wording.

---

## 1. Scope and prioritization

**In v1:**
- One annual cycle, with HR, manager and employee views in one place.
- Fairness built into the moment of rating:
  - written anchors for every level;
  - a suggested rating from measured goal results;
  - a required reason when a rating is far from that suggestion;
  - evidence for an overall rating of 1, 2 or 5.
- An HR consistency check that compares each manager only with their own team's results.
- A results map of results against behaviour, where every score links to its source.
- The "not to plan" cases:
  - a late or missing self-review;
  - reminders and per-person extensions;
  - automatic escalation 3 days after a deadline;
  - removal for eligibility;
  - an audit log;
  - a release gate that keeps results locked until everything is resolved.

**Left out on purpose:**
- **Goal setting and mid-year check-ins.** They matter, but the brief's question is about the annual review. I assumed goals and results already exist.
- **360 and peer feedback.** More inputs do not fix inconsistent scales; they add a second calibration problem.
- **Links to pay.** These raise the stakes before the ratings are trusted.
- **AI rating or summaries.** Ratings must be explainable by a person.
- **Cross-team calibration and forced distribution.** I wanted to see how far per-team checks against measured results go first, and calibration is the change in question 2.
- **Real login and email.** Not needed to test the flow.

**Is this the right slice for a real customer next week?** Mostly yes. It is the smallest set that lets a company run a cycle from start to release with an audit trail. Before shipping it would need four things: SSO and permissions; real notifications; importing goal results from their systems, which is the riskiest assumption; and a way to correct a submitted review, which v1 locks.

## 2. The requirement change: calibration before release

> "Before results are opened to employees, every manager has to calibrate ratings together across teams first, and no employee can see their own result until calibration is locked."

**How well the build absorbs it:**

- **Well, because the release gate already exists.** Release is a single rule (`releaseBlockers` in `src/domain/release.ts`): every review submitted and every flag reviewed. Calibration becomes one more blocker, "calibration locked", and employees stay locked out with no change to their screens.
- **The inputs are already there.** Each review stores the suggestion from results at submit time, and the consistency screen already shows each manager's ratings against their own team's results. That is the starting material for a calibration meeting.

**What I would change:**

1. **A new stage between "all reviews submitted" and "release": Calibration.**
   - Its states are open, in session and locked.
   - Reviews stay editable only by the calibration group while it is open. Today they lock at submit.
2. **A calibration screen** that is the existing results map and consistency cards for all teams at once. During the session:
   - ratings can be moved;
   - each change records old rating, new rating, a reason and who agreed;
   - every change appears in the activity log.
3. **Flags feed the agenda.** Manager-gap flags and "far from results" flags become the list of cases to discuss, so the meeting spends its time on the outliers.
4. **The gap measure stays per team, alongside a cross-team view.** Comparing teams to each other is the point of calibration, so the cross-team view is needed. Keeping the per-team measure as well stops a team with genuinely better results from being pulled down.
5. **Calibration still does not force a distribution.**

**How I would know it works:**

| What to measure | Signal that it works |
|---|---|
| Gap between each manager's average rating and their team's suggested average, before and after calibration | Shrinks towards 0 without every team converging on the same average |
| Share of ratings 1.0 or more from the suggestion that have a reason | 100%; after calibration, fewer of them |
| Spread of manager gaps across the company | Narrower from cycle to cycle |
| Time from the manager deadline to release | Does not grow beyond an agreed limit (calibration should not stall the cycle) |
| Escalations and extensions per cycle | Falling |
| Employee survey: "My rating reflects my results and how I worked" | Rising; split by team to catch unfair teams |
| Next year: share of last year's top and bottom performers whose results stay in the same band | High, which means the ratings were predictive |

### What happened when it was built

The change was built on the branch `calibration` and never merged into `main`. It is live as a second build: https://suruchboss.github.io/gofive-performance-review/calibration/

**How long it took** (commit timestamps, 18 Nov 2026, UTC+7):

| Step | Time |
|---|---|
| Plan written (`docs/PLAN-2.md`) | 22:36 |
| Plan approved by the PO | in chat; the approval time is not in git |
| Deploy setup for the second build (on `main`) | 23:36 |
| Branch created from `main` | 23:36 |
| Rules and tests (C1) | 23:39 |
| HR calibration screen (C2) | 23:41 |
| Manager and employee views, build label (C3) | 23:42 |
| Guide and browser test (C4) | 23:44 |

That is about **8 minutes** of build time from branch to last commit, for 4 commits. The total does not include writing and approving the plan.

**What changed:** 24 files, +726 / −80 lines in `src/`, plus the work log.
- **New:**
  - `src/domain/calibration.ts`: start, agenda, final rating, lock, before/after per team.
  - `src/domain/calibration.test.ts`: 11 tests.
  - `src/ui/pages/hr/Calibration.tsx`: the session screen, about 300 lines and the largest single piece.
- **Changed:**
  - `types.ts`: calibration state, plus a calibrated rating kept next to the manager's own rating.
  - `actions.ts`: 4 actions, and no removals once calibration starts.
  - `release.ts`: the gate now needs "calibration locked" instead of "every flag has an HR note".
  - `release.test.ts`: rewritten for the new rule.
  - Small edits in the Cycle overview, manager team and review pages, employee result, map, activity log, guide, and the e2e test.
- **Outside the app:** the Pages workflow builds both branches into one site, because only `main` may deploy. The calibration build uses its own browser storage keys, because both builds share one web address.

**What the existing design already handled:**
- **The release gate was one function.** Calibration became one more blocker in it. The employee's locked screen needed only new wording.
- **Flags became the agenda unchanged.** The agenda is built from the same `managerConsistency` and `farFlags` functions as the consistency check, so there was no new logic for "what to discuss".
- **The suggested rating was already stored on each review at submit.** So the "before → after against results" view per team came almost for free.
- **The activity log, the person page, the results map and the review summary were reused as they were.** One helper (`finalRating`) makes them show the calibrated rating.
- **The prediction above held.** The calibration screen is the consistency view for all teams at once, flags are the agenda, and the per-team measure stays.

**What had to be added or changed:**
- **A new stage with its own state:** not started → in session → locked. Plus a change history (before, after, reason, date), so the manager's own rating is never overwritten.
- **One rule changed meaning:** HR's flag notes no longer gate release, because the group now discusses those cases. 4 of the 97 existing tests failed as expected and were rewritten for the new rule. That is the clearest sign of where the requirement change lands.
- **A new screen for the session,** and status messages for managers and employees.
- **Not done in the prototype:** a real multi-person session. HR records what the group agrees on everyone's behalf. A real product would need each manager in their own account, plus permissions for who may change whose rating.

## 3. Working with AI: an example of disagreeing or reworking

In a recent take-home case for a marketing agency, I built a tool that finds social media creators for a brand. The AI checked the first version against the brief line by line and reported every requirement as covered. That was technically true. But when I looked at it as the marketing team who would use it, it failed them: it ran from a command line they could not use, and the Facebook input they gave never visibly affected the result.

The AI was checking against the spec, and I was checking against the user. I delayed the submission and we reworked it into a simple web app that shows how each input shapes the result. Since then, when AI tells me something is done, I also check it from the user's side. In this exam, that is why the first screen guides a reviewer who knows nothing about the product.
