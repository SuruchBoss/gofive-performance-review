# Part 2 — Answers (draft for the PO to edit)

Status: **draft.** Q1 and Q2 were drafted by the developer from `docs/DESIGN.md` and `WORKLOG.md`. Q3 is about the PO's own experience, so it lists candidate examples only; the PO writes the final answer.

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

## 3. Working with AI: an example of disagreeing or reworking

*For the PO to write. Candidate examples from this build (see `WORKLOG.md`):*

- **Evidence on every behaviour rating (changed by the PO).** The developer's first design asked for evidence on any behaviour or overall rating of 1, 2 or 5. The PO limited it to the overall rating. Evidence on four behaviours per person would add a lot of writing for managers, and the fairness benefit sits mainly on the final rating.
- **The relayed instructions.** The developer (AI) would not apply a change to the working rules that came through another AI session until the PO confirmed it directly. A small example of keeping the human as the decision-maker.
- **The "≥ 1.0" edge case.** The AI flagged that "1.0 or more" is strict when the suggestion is exactly 3.0, because ratings 2 and 4 then both need a reason. The PO kept the stricter rule on purpose.
- **Escalation of the new joiner.** The demo data made the new joiner escalate too if HR did not remove them first. It was kept as realistic rather than "fixed" away.
- **Design latitude.** The PO allowed visual changes but held scope and rules fixed, so the AI could not widen the feature through the UI. For example, it added a per-manager chart, but no cross-team comparison.
