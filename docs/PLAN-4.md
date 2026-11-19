# PLAN-4 — Plain and clear: a usability round

**Status:** replaced by `docs/PLAN-5.md` after the PO changed direction (task-first homes, no guide). Not built, except decision 6. The audit and the word list below still apply.
**Already done:** PO decision 6 (the reason needs at least 20 characters, with a counter and a line in the submit list). It was asked for just before this ticket, and it is live on both builds.
**Fixed scope (PO):** rules, numbers, demo data and `docs/ANSWERS.md` do not change. `main` first, then `calibration`. Tips keep working. The start page changes only in wording.

## 1. Audit of the live main build

Done with the `web-uxui-design` skill (audit mode), as a first-time reviewer at 375 px and 1366 px, with the guide and tips on.

**Summary:** each screen is clear once you know it. The problem is the amount: three layers of help say the same thing, the HR guide changes person at least four times, and on a phone the manager's rating controls sit two screens down. The biggest quick win is to let the HR guide stay in HR.

| Dimension | Score | Why |
|---|---|---|
| Clarity | 2/5 | Purpose is clear on the start page, then lost under stacked help |
| Hierarchy and layout | 3/5 | Good inside each panel; no order between panels on the review page |
| Interaction and feedback | 4/5 | Locked and blocked states explain themselves |
| Accessibility | 4/5 | Keyboard, labels, contrast and 44 px targets are in place |
| Consistency | 3/5 | Same idea, several words (see the word list) |
| Visual craft | 4/5 | Calm and specific to the product |

**Measured on the live build:**

| Screen | Words on the page | Phone page height | Buttons and links |
|---|---|---|---|
| Manager review (Orn) | 399 | 2,755 px (3.7 screens) | 27 |
| Consistency | 337 | 2,822 px | 24 |
| HR Overview, first open | 283 | 2,226 px | 22 |
| Progress | 211 | 1,766 px | 10 |

The HR guide, done by hand to the end, takes more than 30 taps and typed notes and at least 4 changes of person (HR → Tom → HR → Anong → HR, plus Daniel if a review is sent back). That does not fit in 5 minutes on a phone.

**Findings** (PO = also found by the PO):

| # | Severity | Finding | Fix in this plan |
|---|---|---|---|
| A1 | Critical | **The HR guide makes HR play three managers.** Release needs Orn's and Ying's reviews and Daniel's answer, so the reviewer keeps changing person and loses the thread. | Section 2, cut 1 |
| A2 | Critical | **Three layers of help repeat each other.** On first open at 375 px the guide card says "See who is late… Open Progress →" and the tip under it says "Next: See who is late. This link opens the right screen." Below that comes "Viewing as…". | Cuts 2 and 3 |
| A3 | Major (PO 1) | **Review page: two columns with no labels.** On a 375 px phone the first rating control starts about 1,520 px down (two screens), after goal results, the suggestion and the self-review. The overall rating is at about 2,290 px. | Decision 1 and cut 4 |
| A4 | Major (PO 3) | **The way back is a 13 px text link** ("My team", 50 px wide) above the name. | Decision 3 |
| A5 | Major (PO 4) | **"Guide for: HR" is underlined while the bar above says "Manager · Tom Wattana".** Two different things look like one. | Decision 4 |
| A6 | Major (PO 2) | **Step 1 opens with a removal** and the title "See who is late" does not match the action. | Decision 2 |
| A7 | Major (PO 5) | **Long, hard wording.** Step 3 of the HR guide is 36 words in 4 sentences. "Escalate", "consistency", "calibration", "flag", "weighted" appear without explanation. | Section 3 |
| A8 | Major | **Consistency asks for 4 separate notes** before release (click, type, confirm, four times). | Cut 1 |
| A9 | Minor | **The review page shows an empty grey line** "Pick a level to see what it means" under every unrated behaviour. | Remove the placeholder; the description appears when a level is picked |
| A10 | Minor | **My team on a phone:** the row has no visible "open" action until you scroll to the button, and the warning box comes before the list. | Decision 3 |
| A11 | Minor | **A toast covers the last line of the screen** for a few seconds after an action. | Leave; it clears itself and no longer covers controls at the top |

**Keep:** the start page, the release checklist with its links, the locked states, the dialogs, and the 44 px touch targets.

## 2. What I would cut, hide or merge

The aim is one thing at a time: one person, one screen, one action, one short sentence.

1. **The HR guide stays in HR: 3 steps instead of 5.** *(needs your yes)*
   - Step 1 **Check who is in this review** (Progress: remove Fah).
   - Step 2 **Check fairness** (handle one case yourself: mark it checked, or send it back with a question).
   - Step 3 **Release results** (Overview). The checklist stays. Under it, the existing demo shortcut appears in its dashed "Demo only" box: "Let the demo finish the managers' part". It plays the managers and the remaining checks through the normal actions and logs each one, as it does today on the employee path. A reviewer who wants to do it by hand still can.
   - Moved out of the HR guide, not deleted: "Review as a manager" and "Let a deadline slip" already exist as steps 1 and 2 of the Manager guide.
   - Result: about 10 taps, no change of person. I expect about 3 minutes; the fresh-reviewer pass in commit 8 will measure it.
2. **One help layer at a time.** *(recommended)* When a tip is showing, the guide bar shrinks to its title line ("HR guide · step 1 of 3"). The off-screen tip becomes four words on the link ("Start here"). The "Viewing as…" line goes away, because "You are now: …" in the guide bar (decision 4) replaces it.
3. **Shorter first screen.** *(recommended)* The first-open guide card shows only the current step, with "Show all steps" as today. The intro sentence about the demo date goes.
4. **Review page on a phone: the rating first, the data folded.** *(needs your yes)* "What the data says" shows three lines (goal results 101% → suggests 3.0; self-review: own rating 3) with "Show details". "Your rating" then starts on the first screen. On a computer both columns stay open, side by side, under the two headings.
5. **Consistency: only what needs a check.** *(recommended)* Managers who are "in line" or have "not enough reviews" fold into one line at the bottom ("2 managers need no check"). The explanation line under each heading shrinks to one sentence.

Nothing above changes a rule: the release gate, the thresholds, the reasons and the log are as they are. The three answers still hold. Q2's metrics and Q1's scope do not mention the guide's step count.

## 3. Word list (old → new)

Target: everyday English, about B1. A guide step is at most two short sentences.

| Old | New | Where |
|---|---|---|
| Consistency / Consistency check | **Fairness** (tab) / **Check fairness** (page) | HR tab, page title, guide, tips, links |
| escalate, escalated, escalation | **move to their manager**, "Moved to Anong", "Moved up" (log filter) | Progress, My team, review page, Activity, toasts |
| ineligible, eligibility | **should not be reviewed yet** | Progress, remove dialog |
| calibration | Kept once: "Calibration: managers meet and **agree final ratings** across teams". After that: "Agree final ratings" (tab: **Final ratings**) | Calibration build |
| flag, flagged | **rating to check** ("4 ratings to check") | Fairness, Overview, Map |
| Mark reviewed | **Mark as checked** | Fairness |
| Return to manager | **Send back with a question** | Fairness, dialog, log |
| Manager gap | **Difference from the team's results** | Fairness |
| far from results / Rating 1.0+ from results | **1 or more away from results** | Fairness, Map |
| Results suggest | **Goal results suggest** | review, result, Fairness |
| of goal targets, weighted | **of goal targets** ("weighted" moves into "How is this calculated?") | goals, result |
| evidence | **example** | review hints |
| Specific example | stays | review |
| Behaviours | stays, with "how the person works" on first use | review, result |
| cycle | **review** ("Remove from this review") | Progress, dialogs, Overview |
| Release results | stays ("everyone sees their result") | Overview |
| self-review, submitted, overdue, deadline | stay | all |
| Activity | stays | HR tab |

**Guide steps, rewritten** (HR, if cut 1 is approved):

| Step | Title | Text |
|---|---|---|
| HR 1 | Check who is in this review | Fah joined less than 3 months ago and should not be reviewed yet. Remove Fah and give a reason. |
| HR 2 | Check fairness | Sales rates above its own results, and Support below. Check one case: mark it as checked, or send it back with a question. |
| HR 3 | Release results | The list shows what is still open. Finish it, or let the demo do it, then release. |
| Manager 1 | Review Orn | Goal results suggest a 3. Rate how Orn works, then choose the overall rating. |
| Manager 2 | See a late review move | Ying's review is late. Press "+1 day" twice and it moves to your manager. |
| Manager 3 | Answer HR | HR can send a review back with a question. Send one back as HR, then answer it as Daniel. |
| Employee 1 | Write your self-review | You are late, but you can still send it. It will be marked late. |
| Employee 2 | See why your result is locked | Everyone sees their result at the same time, after HR has checked all reviews. |
| Employee 3 | See your result | Use the demo shortcut on this page to release results now. |

If cut 1 is not approved, HR keeps 5 steps, with "Review as a manager" and "See a late review move" in the wording above.

## 4. The PO's decisions, as built

1. **Review page:** two headed sections, "What the data says" (goal results, the suggestion, self-review) and "Your rating" (behaviours, overall, comment). Same order on a phone.
2. **HR step 1:** "Check who is in this review", with the one-line reason. I would keep it first: it is one tap and one dialog, and it explains itself once reframed.
3. **Going back:** a "← Back to my team" button at the top of a review. On My team each person is one row that opens, with their status and an arrow.
4. **Guide and person apart:** the bar reads "HR guide · step 2 of 3" and, on its own line, "You are now: Tom Wattana (Manager)". The switcher reads "Switch guide:" and marks the guide only.
5. **Plain English:** the word list above, in the UI, the guide, the tips and the start page.
6. **Reason, 20 characters:** done.

## 5. Commits

1. Guide and person apart (decision 4), "Viewing as" merged in (cut 2), shorter first card (cut 3).
2. Review page headings, back button, placeholder removed (decisions 1 and 3, A9); phone summary (cut 4, if approved).
3. My team rows (decision 3).
4. Word list across the UI, tips and start page; guide steps rewritten (decisions 2 and 5).
5. HR guide in 3 steps with the demo shortcut on Overview (cut 1, if approved); Fairness folds what needs no check (cut 5).
6. Tests: unit tests, both e2e files, and the README wording.
7. `calibration`: merge, its own wording ("Agree final ratings"), deploy both, check live.
8. **Fresh-reviewer pass:** a new agent with only the live link, on a 375 px phone, follows the HR guide to the end. I report the time, every place it hesitated, and its one-sentence description of the product. Then I fix what blocks it.

## 6. Questions (my recommendation first)

1. **Cut 1, HR guide in 3 steps with the demo shortcut on Overview.** *Recommended: yes.* It is the only change that makes "5 minutes on a phone" realistic. Without it the guide needs at least 4 changes of person.
2. **Cut 4, fold "What the data says" on a phone.** *Recommended: yes.* The alternative is headings only, with the rating still two screens down.
3. **"flag" → "rating to check" and "Return to manager" → "Send back with a question".** *Recommended: yes for both.* Note: `docs/ANSWERS.md` says "return a review with a question" and "flags", so the answers stay true but use the older words. I will not touch that file.
4. **Tab name "Fairness"** (page title "Check fairness"). *Recommended.* A tab named with a verb reads oddly next to Overview, Progress, Map and Activity.
5. **Calibration build:** tab "Final ratings", with "Calibration" explained once on that page. *Recommended.* The build's label "Requirement change from question 2" stays.
