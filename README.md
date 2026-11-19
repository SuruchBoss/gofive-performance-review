# Performance Review — a concept for empeo

A clickable prototype of one annual performance review cycle, with HR, manager and employee views. It was built for a Product Owner take-home exam at Gofive (brief: [`docs/BRIEF.md`](docs/BRIEF.md)).

**Live prototype:** https://suruchboss.github.io/gofive-performance-review/

**Requirement change from question 2 (calibration):** https://suruchboss.github.io/gofive-performance-review/calibration/ is built from the `calibration` branch. It is not merged into `main`. On that build, release needs a locked calibration instead of HR flag notes, because the flags become the calibration agenda; the other release conditions are the same.

Demo data only. The company, people and numbers are fictional. There is no backend, no login and no email. State is kept in your browser; **Demo ▾ → Reset demo** restores the starting data. This is a concept for empeo, not an empeo product, and uses none of empeo's branding.

## What to try first

The link opens a short start page with three choices: **Try as HR**, **Try as Manager** (Tom Wattana) and **Try as Employee** (Ying Chen). Each opens the demo in that role, with a guide for it: five steps for HR, three for the manager and three for the employee. Each step names the role it uses, switches to it for you, and ticks itself off when done. After the first screen the guide shrinks to one line with the next step. All prototype controls (switch role or person, **+1 day**, **Reset demo**, **Exit demo** back to the start page) sit in the **Demo ▾** menu at the top.

The HR guide:

1. **HR → Progress:** three reviews are overdue. One is for Fah, a new joiner who should not be in this cycle: remove Fah with a reason.
2. **Manager (Tom Wattana) → Orn's review:** goal results suggest a 3. Try a 5 to see the reason and evidence rules.
3. **HR → Consistency:** Sales rates above its own results and Support rates below. Mark a flag reviewed, or **Return to manager** with a question. When the manager answers, **accept the answer or ask again**.
4. **Press +1 day twice:** an open review escalates to the reviewer's own manager 3 days after its deadline. If you did steps 1 and 2, only Ying's review is still open, and it moves to Anong Rattanakul, the Managing Director. See it in **Activity**.
5. **Release:** clear what the **Overview** checklist lists, release, then see a result as an employee.

On the Employee path, the locked **My result** page has a clearly marked **Demo shortcut: skip to released results**. It plays HR and the managers for you through the normal actions, so every rule still applies, and logs each step.

## How fairness works here

- **Anchors:** every rating level of every behaviour has a written description.
- **Suggested rating from measured goal results:** 100% of target suggests a 3, and each 20 points moves it one level (shown to one decimal). It uses goal results only, so it stays independent of the manager's own ratings. A rating 1.0 or more away from the suggestion needs a written reason.
- **Evidence:** an overall rating of 1, 2 or 5 needs a specific example (at least 40 characters).
- **Consistency check:** each manager's average rating is compared with what their own team's results suggest. A gap of 0.75 or more (with at least 3 submitted reviews) is flagged for HR, and so is any single rating 1.0 or more from its suggestion. There is no forced distribution and no comparison across teams.
- **Return to manager:** HR can send a flagged review back with a question. The review reopens for its manager, who changes the rating or keeps it and answers. HR then accepts the answer or asks again. Every step is logged.
- **Results map:** measured results against manager-rated behaviour. Every score links to where it came from.
- **When things go wrong:**
  - a missing self-review is recorded, and the employee can still submit late until the manager finishes;
  - HR can remind, or extend a deadline per person with a reason;
  - an open review escalates to the manager's own manager 3 days after its deadline;
  - HR can remove an ineligible person (joined under 3 months before the period end) with a reason.
- **Release gate:** results stay locked until every manager review is submitted (ineligible people removed), every flag is reviewed by HR, every review returned to a manager has been answered, and HR has accepted each answer. Everyone then sees their result at the same time.

All thresholds are in [`src/domain/config.ts`](src/domain/config.ts). The full design is in [`docs/DESIGN.md`](docs/DESIGN.md).

## How this was built

The Product Owner made the product decisions. An AI coding agent (Claude Code) worked as the developer: it asked questions, proposed options and built the code. Every step is recorded in [`WORKLOG.md`](WORKLOG.md), with what was done, why, who decided and what went wrong.

**Time, from the git history (18 Nov 2026, UTC+7):**

| Step | From → to | What happened |
|---|---|---|
| Questions | 21:43 → 21:44 | 5 open questions, each with a recommendation. The brief was saved to `docs/BRIEF.md`. |
| Design | 21:47 → 21:56 | `docs/DESIGN.md` drafted. The PO approved it with one change. |
| Plan | 21:56 → 22:01 | `docs/PLAN.md` (17 commits). The PO approved it with two changes. |
| Build | 22:02 → 22:30 | One concern per commit, each with tests and a browser check at desktop and phone width. |
| Test | → 22:32 | Browser click-through of every role at 1280 px and 390 px. |
| Deploy | 22:32 | GitHub Pages workflow added. The first run needed a repository setting (see `WORKLOG.md`). |

From the first commit after the brief (21:43) to the deploy workflow (22:32): **49 minutes**. That includes the time the PO took to answer.

**Who decided what** (each decision is in `WORKLOG.md`):

- **Product Owner:**
  - format and roles;
  - the fairness rules and what not to build (no forced distribution, no calibration);
  - how late, missing and ineligible cases are handled;
  - v1 scope;
  - the demo data plan;
  - the main colour and the "no template look" rule;
  - the thresholds (1.0, 0.75, minimum 3 reviews);
  - evidence for the overall rating only;
  - approval of the design and the plan, and the change to the working rules.
- **AI developer** (proposed, then approved or allowed by the PO):
  - tech stack and hosting;
  - the formula that turns goal results into a suggested rating;
  - demo names and numbers;
  - the visual system and the design changes beyond `DESIGN.md`, each listed in `WORKLOG.md` with a reason, under the latitude the PO gave;
  - smaller rule details: calendar days for escalation, flags reopening when their data changes, preset removal reasons.

## Run it locally

```bash
npm ci
npm run dev        # http://localhost:5173
npm test           # unit tests for the rating, flag, deadline, return and release rules
npm run build
npm run e2e        # browser click-through at 1280px and 390px (needs Playwright + Chromium)
```

Stack: React 18, TypeScript, Vite and Vitest, with plain CSS. Each push to `main` runs the tests and deploys to GitHub Pages ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)).

## Repository map

| Path | What it is |
|---|---|
| `src/domain/` | The rules as pure functions, with their tests (`*.test.ts`) |
| `src/data/seed.ts` | The fictional demo company |
| `src/ui/` | Screens, components and styles |
| `e2e/` | Browser click-through |
| `docs/` | Brief, design, commit plan, Part 2 answers |
| `WORKLOG.md` | Step-by-step log of what was done, why, and who decided |
