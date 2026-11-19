# PLAN-5 — A real product: task-first homes, no guide

**Status:** draft, waiting for PO approval. Nothing here is built yet.
**Replaces:** `docs/PLAN-4.md`. Its audit, word list and the PO's decisions 1–6 carry over where they fit. Its cuts 1–3 (fewer guide steps, one help layer) are replaced by the PO's new direction: no guide at all.
**Fixed (PO):** the rules, the numbers, the demo data and `docs/ANSWERS.md`. `main` first, then `calibration`.

## The idea

Each person opens on a home that says what they have to do now, and by when. That list is the guide. The step guide and the on-screen tips go. Everything that exists only for the demo sits in one dark bar at the top, separate from the product.

## What each person sees

**Manager home (Tom)**

```
┌──────────────────────────────────┐
│ Hello Tom                        │
│ 2 reviews to write · due 11 Dec  │
│ (1 day late)                     │
│ ┌──────────────────────────────┐ │
│ │ Orn Lertsak      Draft     › │ │
│ │ Ying Chen        Not started›│ │
│ └──────────────────────────────┘ │
│ Done (2)                         │
│   (name)         Submitted     › │
│   (name)         Submitted     › │
└──────────────────────────────────┘
```

- A row opens that person's review. "← Back to my team" returns here.
- A review HR sent back shows at the top of the list: "HR asked a question about Nida".
- A late review says what happens next, in plain words: "If not sent by 14 Dec, it moves to your manager."

**Review page: one form, top to bottom**

```
← Back to my team
Orn Lertsak · Inventory Analyst            Due 11 Dec (1 day late)

1  What the data says
   Goal results 101% of targets → suggest 3.0      [Show details]
   Orn's self-review: own rating 3                 [Read]

2  Your rating
   How Orn works (4 behaviours, 1–5)
   Overall rating (1–5)
   Reason, if far from 3.0 (20 characters or more)
   Example, if 1, 2 or 5 (40 characters or more)
   Comment for Orn

3  Send
   2 things left: …                         [Submit review]
```

- Phone: one column in this order, with section 1 folded to its two summary lines.
- Computer: sections 1 and 2 side by side under their headings; section 3 below.

**Employee home (Ying):** one card.

| State | The card says |
|---|---|
| Self-review open | "Write your self-review. It was due 27 Nov; you can still send it until Tom finishes your review." [Write it] |
| Sent, or closed | "Nothing to do now. You will see your result when HR releases results for everyone." |
| Released | "Your result is ready." [See my result] |
| Left out | "You are not in this review", with HR's reason |

Goal results sit under the card. Tabs: Home, My result.

**HR home (Pim)**

```
┌──────────────────────────────────────────┐
│ Annual Review 2026 · Open                │
│ 9 of 12 reviews in · results not released│
│                                          │
│ Needs your attention                     │
│ ① 1 person joined less than 3 months ago │
│    Fah Inthira, joined 3 Oct             │
│    Suggested: leave out of this review   │
│    [Leave Fah out]                       │
│ ② 2 reviews are late                     │
│    Orn, Ying (Tom Wattana) [Remind Tom]  │
│ ③ 4 ratings do not match results         │
│    Sales, Support, Nida, Mai   [Check]   │
│                                          │
│ Release results  🔒 7 things left        │
└──────────────────────────────────────────┘
```

- Each group opens the screen where it is handled. A group disappears when it is empty, and "Release results" unlocks when all are.
- Managers' answers to HR's questions and reviews waiting for an answer appear as groups when they exist.
- The cycle dates and deadline settings move below, folded.
- Tabs: Home, People, Fairness, Map, Activity.

## PO points and how they are built

1. **Task-first homes:** as above. The numbers and dates come from the existing rules (deadlines, late days, who reviews whom), with no new data.
2. **The to-do list is the guide:** the step guide, the tips, "Viewing as…", "Show tips again" and "Switch guide" are removed. One short line stays, in the demo bar (see point 5).
3. **Eligibility at the start:**
   - The system already marks people who joined under 3 months before the period end.
   - HR home now presents this as the first attention item: a suggestion to leave the person out, which HR confirms with one button. The reason is prefilled ("Joined less than 3 months before the end of the review period") and can be edited.
   - It is the same rule and the same logged action as today's "remove with a reason". Only the framing changes: HR confirms a suggestion instead of hunting for a remove button.
   - If HR does not confirm, the person stays in and their manager reviews them, as today.
4. **Review page as a form:** as above.
5. **One demo bar:**
   - The dark bar reads: "Demo · You are Tom Wattana, Manager [Switch person ▾] · Sat 12 Dec [+1 day] · [More ▾]".
   - "More" holds Reset, Exit, About this prototype and the demo shortcut.
   - The product header below it has only the product name, the person and the tabs. "About" leaves the product header.
6. **Plain English and ticket decisions 1–6:** the word list from PLAN-4 applies (Fairness, "moves to their manager", "rating to check", "should not be reviewed yet", "Send back with a question", "this review" for "cycle"). Decision 4 (guide and person apart) is met by removing the guide. Decision 6 is already live.

## Keep, cut, rebuild

| | What |
|---|---|
| **Keep** | All rules, tests of rules, thresholds and demo data. The start page ("Try as HR / Manager / Employee"). Fairness, Map, Activity and person pages (wording only). Dialogs. Locked and blocked states. The release gate. The calibration screen. |
| **Cut** | The step guide (`Intro.tsx`, 243 lines). The on-screen tips built earlier today (`src/ui/coach/`, about 640 lines with tests, and `e2e/coachmarks.cjs`). "Viewing as…". The dashed demo box on My result (its action moves into the demo bar). They stay in git history. |
| **Rebuild** | HR home, Manager home, Employee home, the review page layout, the demo bar, tab names. |
| **Rewrite** | The e2e click-through (it follows the guide's path today), the README section "What to try first", and the wording across the UI. |

**How a visitor reaches "results released" without a guide:** HR home's list leads to it. Two reviews belong to managers, as they would in real life. For the demo, "More ▾" in the demo bar offers "Demo: let the managers finish their reviews". It plays the managers through the normal actions and logs each one. HR's own work (the fairness checks and the release) stays with the visitor.

## Commits and rough time

| # | Commit | Estimate |
|---|---|---|
| 1 | Demo bar: person switcher in the bar, "More" menu, About moved; guide and tips removed | 20 min |
| 2 | Manager home and review page as a form, with the back button | 30 min |
| 3 | Employee home (one card, four states) | 15 min |
| 4 | HR home: status, "Needs your attention", eligibility as a confirmed suggestion, release | 30 min |
| 5 | Plain wording across the UI and the start page; tab names | 20 min |
| 6 | Tests: unit tests for the home lists, new e2e at 1280 and 390 px, width and header scans; README | 25 min |
| 7 | `calibration`: merge, "Agree final ratings" as an HR attention item, deploy both, check live | 25 min |
| 8 | Fresh-reviewer pass on a 375 px phone (HR home to release, timed, hesitations reported), and fixes | 25 min |

About **3 hours** in total, not counting your approvals. The estimate is rough: earlier pieces of this size took between half and double my guess.

## Questions (my recommendation first)

1. **Removing the tips built today.** *Recommended: remove them fully.* You said to drop the guide and the tips "or keep at most one short line". I would keep one line in the demo bar only, for example "Demo tip: switch person to see the same review from the other side."
2. **"Demo: let the managers finish their reviews" in the demo bar.** *Recommended: yes.* Without it, a visitor playing HR must switch to two managers and write two reviews before release. The alternative is to leave that to "Switch person".
3. **Employee tabs: Home and My result** (self-review opens from the card; goals sit on Home). *Recommended.* Alternative: keep four tabs.
4. **HR tab names: Home, People, Fairness, Map, Activity.** *Recommended.* "People" replaces "Progress".
5. **The start page** keeps its three buttons; only wording changes, as you said. *Confirm.*
6. **`docs/ANSWERS.md` stays untouched.** Two sentences in it will then describe things by older words or shapes: "can return a review with a question" (the button becomes "Send back with a question") and, in Q3, "the first screen guides a reviewer who knows nothing about the product" (true of the homes, but there is no step guide any more). *Recommended: leave both; they stay true.*
