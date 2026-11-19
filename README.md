# Performance Review — a concept for empeo

A clickable prototype of one annual performance review cycle, with HR, manager and employee views. It was built for a Product Owner take-home exam at Gofive (brief: [`docs/BRIEF.md`](docs/BRIEF.md)).

**Live prototype:** https://suruchboss.github.io/gofive-performance-review/

**Requirement change from question 2 (calibration):** https://suruchboss.github.io/gofive-performance-review/calibration/ is built from the `calibration` branch. It is not merged into `main`.

Demo data only. The company, people and numbers are fictional. There is no backend, no login and no email. State is kept in your browser, and **Reset demo** restores the starting data. This is a concept for empeo, not an empeo product, and uses none of empeo's branding.

## What to try first

The link opens a short start page. **Open demo** loads the demo data and a guide with five steps. Each step names the role it uses, switches to it for you, and ticks itself off when done. **Exit demo** returns to the start page.

1. **HR → Progress:** two reviews are overdue, and a new joiner is still in the cycle. Remove the new joiner with a reason.
2. **Manager (Tom Wattana) → Orn's review:** goal results suggest a 3. Try a 5 to see the reason and evidence rules.
3. **HR → Consistency:** Sales rates above its own results and Support rates below. Mark a flag reviewed.
4. **Press +1 day twice:** the remaining overdue review escalates to the Managing Director. See it in the Activity log.
5. **Release:** clear what the Cycle overview lists, release, then view as an Employee.

## How fairness works here

- **Anchors:** every rating level of every behaviour has a written description.
- **Suggested rating from measured goal results:** 100% of target suggests a 3, and each 20 points moves it one level. A rating 1.0 or more away from the suggestion needs a written reason.
- **Evidence:** an overall rating of 1, 2 or 5 needs a specific example.
- **Consistency check:** each manager's average rating is compared with what their own team's results suggest. A gap of 0.75 or more (with at least 3 reviews) is flagged for HR. There is no forced distribution and no comparison across teams.
- **Results map:** measured results against manager-rated behaviour. Every score links to where it came from.
- **When things go wrong:**
  - a missing self-review is recorded, and the employee can still submit late until the manager finishes;
  - HR can remind, or extend a deadline per person with a reason;
  - an open review escalates to the manager's own manager 3 days after its deadline;
  - HR can remove an ineligible person with a reason;
  - results stay locked until every review is in and every flag has an HR note.

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
npm test           # unit tests for the rating, flag, deadline and release rules
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
