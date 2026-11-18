# Performance Review — a concept for empeo

A clickable prototype of one annual performance review cycle, with HR, manager and employee views. It was built for a Product Owner take-home exam at Gofive (brief: [`docs/BRIEF.md`](docs/BRIEF.md)).

**Live prototype:** https://suruchboss.github.io/gofive-performance-review/

Demo data only. The company, people and numbers are fictional. There is no backend, no login and no email. State is kept in your browser, and **Reset demo** restores the starting data. This is a concept for empeo, not an empeo product, and uses none of empeo's branding.

## What to try first

The guide at the top of the page walks through five steps. Each step ticks itself off as you complete it:

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
