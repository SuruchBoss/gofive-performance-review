# Design — Annual Performance Review (concept for empeo)

Status: **draft, waiting for PO approval.**
Inputs: `docs/BRIEF.md`, the PO decisions in the task message, and the answers to the five open questions (all accepted as recommended).

## 1. Scope recap

One annual review cycle, three roles (HR, Manager, Employee), demo data only, no backend. State lives in the browser (`localStorage`) and is rebuilt from seed data by the Reset button.

The cycle reviews the **12 individual contributors**. The 3 managers and the head of company are reviewers, not reviewees, in this demo (see open question Q3).

Out of scope for v1, as decided: goal setting and mid-year check-ins, 360/peer feedback, pay links, AI rating or summaries, calibration, real login and real email.

## 2. Screens

### Shared frame (all roles)
- **Top bar:** product label "Performance Review — a concept for empeo", the role switcher (HR / Manager / Employee, plus a person picker for Manager and Employee), the demo date, a **+1 day** button and a **Reset demo** button.
- **Intro box:** what this is, plus a 5-step guided path (below). It can be hidden; whether it is hidden is remembered in the browser.
- **Layout:** left navigation on desktop, horizontal tabs on a phone. Tables turn into stacked cards below 720 px.

### Guided path (intro box)
1. **HR → Progress.** Operations has 2 reviews overdue. One new joiner is still in the cycle.
2. **Manager (Operations) → finish a review.** See the goal results, the suggested rating and the behaviour anchors. Pick a rating far from the suggestion and see the reason requirement.
3. **HR → Consistency.** Sales rates above its results and Support rates below. Open a flag and mark it reviewed with a note.
4. **Press +1 day twice.** The remaining overdue review escalates to the head of company. Try a per-person extension with a reason. Check the Activity log.
5. **HR → Release.** Clear the blockers, release, then switch to Employee to see a result.

### HR
| Screen | Purpose |
|---|---|
| **Cycle** | Cycle name, period, status (Open / Released), self-review and manager deadlines (editable), and the release checklist with the Release button. |
| **Progress** | One row per participant: team, reviewer, self-review status, manager-review status, effective deadline, days overdue. Row actions: **Remind**, **Extend** (date + reason), **Remove from cycle** (reason). Hints such as "Joined 3 Oct — under 3 months" are shown but never act on their own. |
| **Consistency** | One card per manager: average rating vs average suggested rating for their own team, the gap, and the flag status. Below it, the list of individual "far from results" flags. Each flag opens the review and can be marked **Reviewed** with a note. |
| **Results map** | Two-axis map of all submitted reviews (section 4.5). Filter by team. Clicking a dot opens that person's breakdown. |
| **Activity log** | Time-ordered list of reminders, extensions, escalations, removals, late self-reviews, flag reviews and the release. |

### Manager (3 team managers + head of company)
| Screen | Purpose |
|---|---|
| **My team** | Status per person and their deadline. For the head of company, a section "Escalated to you". |
| **Review form** | Left: goals with target, actual, achievement and source, then the **suggested rating** and how it was calculated. Middle: the self-review (text + self-rating), or a "Self-review missing" notice. Right: 4 behaviours, each rated 1–5 with its anchor text shown, then the **overall rating**, the reason field (required when far from the suggestion) and the evidence fields (required for 1, 2 or 5). Save draft / Submit. Read-only after submit. |

### Employee
| Screen | Purpose |
|---|---|
| **My goals** | Goals with target, actual and source. |
| **Self-review** | Text + own rating 1–5. Shows the deadline. After the deadline it can still be submitted, marked "late", until the manager submits. Then it closes. |
| **My result** | Locked ("Results are released after HR finishes the review") until release. Then: overall rating, behaviour ratings with the anchors, the manager's comments and evidence, and the goal results. |

## 3. Data model

TypeScript types. All IDs are strings. Dates are ISO `YYYY-MM-DD` on the demo clock.

```ts
Person      { id, name, title, teamId?, managerId?, startDate,
              kind: 'employee' | 'manager' | 'head' | 'hr' }
Team        { id, name, managerId }
Cycle       { id, name, periodStart, periodEnd, openedOn,
              selfReviewDeadline, managerDeadline,
              status: 'open' | 'released', releasedOn? }
Competency  { id, name, anchors: Record<1|2|3|4|5, string> }
Goal        { id, personId, title, weight, target, actual, unit,
              direction: 'higher' | 'lower', source }   // e.g. "CRM export, 30 Nov"
Participant { personId, reviewerId,                      // reviewerId changes on escalation
              removed?: { on, reason, by },
              extension?: { until, reason, by },
              escalatedOn?, lastRemindedOn? }
SelfReview  { personId, status: 'not_started' | 'draft' | 'submitted',
              text, selfRating?, submittedOn?, late: boolean }
ManagerReview { personId, reviewerId, status: 'not_started' | 'draft' | 'submitted',
              behaviour: { competencyId, rating, evidence? }[],
              overall?, overallEvidence?, deviationReason?,
              suggestedAtSubmit?, selfReviewMissing: boolean, submittedOn? }
FlagReview  { flagKey, note, by, on }                    // flags are derived; only HR's review is stored
LogEntry    { id, on, actorId, type, targetId?, detail }
  type: 'reminder' | 'extension' | 'escalation' | 'removal'
      | 'self_review_late' | 'flag_reviewed' | 'release' | 'deadline_change'
DemoState   { today, cycle, people, teams, goals, participants,
              selfReviews, managerReviews, flagReviews, log }
```

Flags are **calculated from the state**, never stored. This keeps them consistent after any change. Only HR's "reviewed" mark is stored, keyed by a stable `flagKey` (for example `far:p07` or `gap:m-sales`). If a review changes after HR marked its flag reviewed, the key includes the submitted rating, so the flag reopens.

All rules are pure functions in `src/domain/` and take `(state, today)`. The user interface only calls them. This is what the tests cover.

## 4. Rules and calculations

All thresholds sit in one file, `src/domain/config.ts`, so they can be changed.

| Constant | Value |
|---|---|
| `FAR_FROM_SUGGESTION` | 1.0 |
| `MANAGER_GAP_FLAG` | 0.75 |
| `MIN_REVIEWS_FOR_GAP` | 3 |
| `ESCALATION_DAYS` | 3 |
| `ELIGIBILITY_MIN_MONTHS` | 3 |
| `EVIDENCE_MIN_CHARS` | 40 |

### 4.1 Goal results → suggested rating
- Goal achievement: `a = actual / target` (or `target / actual` when lower is better), clamped to 0–1.5.
- Results score: `R = Σ(weight × a) / Σ weight`.
- Suggested rating (continuous): `s = clamp(3 + (R − 1.0) / 0.2, 1, 5)`. So 60 % → 1, 80 % → 2, 100 % → 3 ("met target"), 120 % → 4, 140 % → 5.
- It is shown as "Suggested: 3 (3.4)". The integer is `round(s)`.

### 4.2 Overall rating and the reason rule
- The manager picks the overall rating as an integer from 1 to 5.
- If `|overall − s| ≥ FAR_FROM_SUGGESTION`, a reason is required before submit.
- The submitted review also raises an individual **"far from results"** flag for HR.
- `s` is saved on the review at submit (`suggestedAtSubmit`) so the record shows what the manager saw.

### 4.3 Evidence rule
- Any behaviour rating or overall rating of **1, 2 or 5** needs an evidence text of at least `EVIDENCE_MIN_CHARS` characters.
- The field prompt asks for "what happened, when, and the effect". The system can check that the text is present and long enough, not that the example is real (see trade-off C).

### 4.4 HR consistency check (per manager, against their own team)
- For reviewer `m`, over their submitted reviews: `gap = mean(overall) − mean(s)`.
- If `n < MIN_REVIEWS_FOR_GAP`, the card shows "Not enough reviews yet" and raises no flag.
- If `|gap| ≥ MANAGER_GAP_FLAG`, a **manager gap** flag is raised: "rates above results" (gap > 0) or "rates below results" (gap < 0).
- There is no comparison between teams, no forced distribution and no adjustment of ratings. The flag asks HR to look; it changes nothing by itself.

### 4.5 Two-axis map
- X axis = results score (`s`, 1–5). Y axis = behaviour score (mean of the 4 behaviour ratings).
- A 3×3 grid with cuts at 2.5 and 3.5. The corners are labelled, for example "Strong on both" and "Below on both". The middle band is neutral.
- A dot has a ring if the review has an open flag.
- Clicking a dot shows the breakdown: each goal and its source, each behaviour rating with its anchor and evidence, and the overall rating with its reason. This is the "every score links to where it came from" rule.
- Only submitted reviews are plotted. HR sees everyone; a manager sees only their own team.

### 4.6 Deadlines, reminders, extension, escalation
- **Effective deadline** for a participant = `extension.until ?? cycle.managerDeadline`.
- **Overdue** = `today > effective deadline` and the manager review is not submitted.
- **Escalation:** when `today ≥ effective deadline + ESCALATION_DAYS` (calendar days) and the review is not submitted, `reviewerId` moves to the current reviewer's own manager. The case gets `escalatedOn`, and a log entry is written.
  - It runs after every clock change and every state change. It is idempotent: it escalates once per participant.
  - An extension granted before escalation moves the escalation date. An extension after escalation does not move the review back.
- **Remind:** sets `lastRemindedOn` and logs. No email is sent; the UI says so.
- **Self-review:** it can be submitted while `today ≤ selfReviewDeadline`. After that it can be submitted with `late: true` (logged) until the manager review is submitted. Once the manager submits without one, `selfReviewMissing = true` and the self-review closes.

### 4.7 Eligibility and removal
- **Hint:** `startDate` later than `periodEnd − ELIGIBILITY_MIN_MONTHS`. Long leave is entered as a reason by HR; it is not detected.
- **Remove:** needs a reason and is logged. Removed people drop out of all counts, flags and the release gate.

### 4.8 Release gate
**Release** is enabled only when every remaining participant has a submitted manager review **and** every current flag (individual and manager gap) has an HR review note. Otherwise the checklist lists each blocker with a link to fix it. Release is logged. Employees then see their results.

## 5. Demo data (fictional "Riverside Supply Co.")

- **People:** head of company (1), HR officer (1), 3 managers, 12 employees (4 per team).
- **Dates:**
  - Cycle "Annual Review 2026": period 1 Jan – 31 Dec 2026, opened 2 Nov.
  - Self-review deadline 27 Nov. Manager deadline **11 Dec**.
  - **Demo starts 12 Dec**, so escalation happens on 14 Dec, two clicks away.

| Team | Manager pattern | Data |
|---|---|---|
| Sales | **Rates above results** (gap ≈ +1.0) | 4/4 submitted. One review is far above its suggestion and has a reason. One self-review is missing, and the manager went ahead. |
| Support | **Rates below results** (gap ≈ −0.9) | 3/3 submitted for eligible people. The 4th person **joined 3 Oct 2026** (under 3 months), was not reviewed, and blocks release until HR removes them. |
| Operations | **In line** with results (gap ≈ 0.1) but **not finished** | 2/4 submitted. One draft and one not started, both overdue. One of the two open cases has no self-review yet, so the employee can still submit late. |

Each employee has 3–4 goals with a source label. The results spread so that the map shows at least one person in each corner.

## 6. Tech
- **Stack:** React 18 + TypeScript + Vite, plain CSS with custom properties (deep mint primary, for example `#0F6E5C`, at least 4.5:1 contrast on white), and Vitest for `src/domain/`.
- **Routing:** hash routing, so GitHub Pages needs no server rules.
- **Deploy:** GitHub Actions builds `main` and publishes it to GitHub Pages. The repo will be made public by the PO.
- **Browser check:** Playwright, clicking through every role at 1280 px and 390 px. Screenshots are kept out of git unless the PO wants them.

## 7. Trade-offs

**A. The suggestion uses goal results only, not behaviour.**
- *Why:* It gives every manager the same measured anchor that their own opinion cannot move.
- *Cost:* Roles with weak or easy goals get a poor suggestion. Mitigation: a manager can always disagree, with a reason. It is a nudge, not a block.

**B. The consistency check compares each manager with their own team's results, not across teams.**
- *Why:* It catches lenient or harsh raters without forced distribution or calibration, both out of scope.
- *Cost:* If a team's goals were set too easy, the results and the ratings are both inflated and no flag appears. Comparing across teams is the calibration work in exam question 2.

**C. The rules are checked by the system; judgement stays with people.**
- *Why:* Evidence length, reasons and flags are enforced, but nothing is auto-rejected or auto-adjusted. This fits "no AI that rates people".
- *Cost:* A determined manager can write filler text. HR's flag review is the backstop.

## 8. Open questions for the PO
1. **The 1.0 threshold is strict at exact integers.** With "≥ 1.0", a suggestion of exactly 3.0 makes ratings 2 and 4 both need a reason; at 3.4, ratings 3 and 4 are free. Keep "≥ 1.0", or use "> 1.0"?
2. **Operations is both "in line" and "not finished".** With only 3 managers, one manager must play two parts. I chose Operations for both, so the late case is not confused with a rating-gap flag. OK?
3. **Managers are not reviewed in this cycle.** It keeps the demo small. The alternative is to have the head of company review the 3 managers.
4. **The manager gap needs at least 3 submitted reviews** before it can flag. OK?
