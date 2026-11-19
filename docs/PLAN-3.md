# PLAN-3 — On-screen coachmarks for the demo

**Status:** approved by the PO on 19 Nov 2026, with the recommended answer on all six questions. Built; see `WORKLOG.md`.
**Scope (PO):** coachmarks layered on top of the existing guide. `main` first, then `calibration`. Step text, demo data, rules, `docs/ANSWERS.md` and the start page do not change.

## How it works

- **When a mark shows:**
  - Tips are on for a guide (HR, Manager or Employee) the first time that guide is opened.
  - The mark shown is for the guide's current step (the first step not done).
  - It appears when the reviewer is on the page that step's link opens.
- **What it looks like:**
  - A light dim over the page, with a rounded cut-out around the target control.
  - A small card next to the target: one or two sentences, "Step 2 of 5", and **Next** / **Skip**.
  - App colours and type. No animation when `prefers-reduced-motion` is set.
- **Targets:**
  - Found by `data-tour="…"` attributes added to existing controls; no CSS class or text lookups.
  - Some marks depend on state. For example, on Consistency the mark points at "Accept answer" once a manager has answered.
- **Fallback:** if the target is missing or hidden at this width, the card is centred and gives the instruction in words.
- **Placement:**
  - The card goes below the target, or above it if there is no room. It is clamped to a 16 px margin on each side.
  - The target is scrolled into view under the top bar and header, so nothing overlaps the top bar.
  - It repositions on scroll and resize.
- **Keyboard:**
  - Focus moves to the card when it opens.
  - Tab cycles between Next and Skip.
  - Esc closes it, and focus returns to the element that had it before.
- **Memory:**
  - The tips on/off state per guide is kept in `localStorage`, wrapped in try/catch.
  - Without storage, the state lives in memory, so tips show once per session.
  - "Skip" turns tips off for that guide. **Demo ▾ → Show tips again** turns them back on for every guide.
- **No new dependency.** About 200 lines of React and CSS, plus pure helpers for placement and for choosing the mark, so they can be unit-tested.

## Marks per step (main build)

| Guide · step | Page | Target |
|---|---|---|
| HR 1 See who is late | Progress | Fah's "Remove from cycle" |
| HR 2 Review as a manager | Orn's review | behaviour ratings → Overall rating → Submit review |
| HR 3 Check consistency | Consistency | Nida's "Return to manager" (or "Mark reviewed"); after an answer, "Accept answer" |
| HR 4 Let a deadline slip | Activity | the guide's "+1 day" button |
| HR 5 Release results | Overview | the first open checklist item; once clear, "Release results" |
| Manager 1 Finish Orn's review | Orn's review | as HR 2 |
| Manager 2 Watch a deadline slip | My team | the guide's "+1 day" button |
| Manager 3 Answer a question from HR | Consistency, then Daniel's team | Nida's "Return to manager", then "Answer HR" |
| Employee 1 Write your self-review | Self-review | the text box → "Submit self-review" |
| Employee 2 See why your result is locked | My result | the locked panel |
| Employee 3 See a released result | My result | "Demo shortcut: skip to released results" |

Calibration build: HR 5 is "Calibrate, then release". It points at "Start calibration session", then "Lock calibration".

## Commits

1. **Coachmark engine:** the overlay, card, placement, keyboard and storage, with unit tests for placement, mark choice and storage without `localStorage`.
2. **Targets:** `data-tour` attributes and the marks for all 11 steps.
3. **Show tips again:** the option in Demo ▾, plus one README line in "What to try first" (the README has no section called "How to try it"; see question 6).
4. **e2e:** a new `e2e/coachmarks.cjs` runs the full HR guide with tips on at 320, 375, 412 and 1366 px. At each step it checks:
   - the cut-out matches the target's box;
   - the card is fully on screen and below the top bar;
   - Esc closes the card and returns focus;
   - Tab reaches Next and Skip;
   - "Show tips again" works.
   
   The existing e2e turns tips off at its start, so its steps are unchanged.
5. **Calibration:** merge into `calibration`, add the HR 5 calibration marks, deploy both builds, check them live, log.

## Questions for the PO (my recommendation first)

1. **What "Next" does.** *Recommended:* a step can have 1–3 marks on its page (for example, HR 2: behaviours, then overall, then Submit). Next walks through them and becomes "Done" on the last. *Alternative:* one mark per step, and Next just closes it.
2. **Off the step's page.** For example, HR opens on Overview but step 1 is on Progress. *Recommended:* point at the guide's step link ("Open Progress →"), so the reviewer is never left searching. *Alternative:* show nothing until they reach the page.
3. **"Per role" means per guide.** The HR guide's step 2 happens in the Manager view. *Recommended:* tips are on or off per guide (HR / Manager / Employee), because the steps belong to the guide. *Alternative:* per view role.
4. **Clicks while a mark is shown.** *Recommended:* the dim is visual only, so the page stays clickable, including the highlighted control. Using the control moves the mark on. *Alternative:* block clicks outside the cut-out.
5. **Existing e2e.** *Recommended:* it turns tips off at its start (one line), and the new e2e covers them. *Alternative:* the existing e2e dismisses each mark as it goes.
6. **README.** The section is called "What to try first", not "How to try it". *Recommended:* add the line there and keep the heading.
