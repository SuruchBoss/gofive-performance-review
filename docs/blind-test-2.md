# Blind test 2: five personas

**Date:** 19 Nov 2026.
**Build tested:** the live main version with the new landing page (https://suruchboss.github.io/gofive-performance-review/), before the fixes below.
**Method:** five fresh agents, run independently. Each got only the live link, one short persona and "Someone sent you this link. Try it and evaluate it." (plus how to drive a browser). No repo, docs, guide hints or task list. Personas 1 and 2 used a 1366×900 desktop; personas 3 to 5 used a Pixel 7 phone (412 px, touch).
**Report format:** what they thought it was in the first 10 seconds, where they got stuck (quoting the screen), whether it felt fair from their role, one change, and a score.

## Scores

| # | Persona | Screen | Score |
|---|---|---|---|
| 1 | HR manager, 50-person company, runs reviews every year | desktop | **7/10** |
| 2 | Team manager, 6 direct reports, finds review season stressful | desktop | **7/10** |
| 3 | Employee in sales, wants to know if their rating is fair | phone | **6/10** |
| 4 | Employee, 2 years in, not technical, on the bus | phone | **6/10** |
| 5 | Employee who felt underrated last year, sceptical | phone | **6/10** |

**Common thread:** all five understood the problem straight away. HR and managers found it calm, clear and fair in method. All three employees saw it as an HR tool. They found that HR can see unfairness but cannot act on it, and that the employee is never told and cannot answer back.

## Fixed (clear bugs or clear confusion)

| Finding | From | Fix |
|---|---|---|
| The suggested rating showed as 3 on the manager form but 3.9 / 4.17 / 4.2 on other screens, and "2 needs no reason, 4 does" looked arbitrary against a visible 3 | 2, 3, 4, 5 | The suggestion is shown with one decimal on every screen (manager form, dialogs, flags, employee result). Under the overall rating: "No reason needed for 2 or 3. Any other rating needs a written reason, and a 1, 2 or 5 also needs a specific example." Next to the chosen rating: "Above expectations · needs a reason (see below)". |
| The example rule for 1, 2 or 5 was only found by trying | 2, 5 | Stated in the same line, before choosing. |
| Level descriptions only appeared after picking a level | 2 | Hovering a number shows what that level means (behaviour anchors and overall level words). The glossary line now says so. |
| "It does not change the rating your manager is suggested." (broken grammar) | 3, 4, 5 | "Your manager sees it next to your goal results. It does not change the suggested rating, which comes from goal results only." |
| The self-review locked with no "are you sure" | 4 | A confirmation dialog, like the manager's. |
| A bare "Overall rating 4" with no meaning | 3 | The level words sit under the number ("Above expectations"). The same words are used everywhere. |
| "Not submitted" next to "Submitted", and "Submitted" next to "1 day overdue", with unclear meaning | 3 | Badges say what they refer to: "No self-review yet", "Self-review in, late", "Review submitted", "Review 1 day overdue", "Review escalated". |
| The Employee view opened as Ying with no hint to pick someone else | 3, 4 | Manager and employee screens start with "Viewing as Ying Chen, Logistics Coordinator. To be someone else, pick a name in the list at the top." |
| In Employee view the big guide card ("This step is for HR…") pushed the person's own screen down | 3, 4, 5 | When the next step is for another role, the guide shrinks to one line: "Guide, step 1 of 5: See who is late. This step is for HR." with the switch link and "Show all steps". |
| The manager form says the "why it differs" note is for HR, but the employee sees it after release | 1 | The hint now says "HR sees it when checking consistency, and the employee sees it with their result." Whether employees *should* see it is listed below for the PO. |
| Ying's result said only "By Anong Rattanakul" | 1 | "…(moved from Tom Wattana after a missed deadline)". |
| "Late or escalated" read as wrong after the escalated reviews were done | 1 | Renamed "Late or escalated, still open". |
| Removed Fah still saw "Your manager sees the same figures when they review you" | 1 | That sentence is hidden for people removed from the cycle. |
| Nothing said how the scores became the overall rating | 3 | The "Manager's assessment" panel says "The overall rating is the manager's call, informed by both scores above." |

## For the PO to decide (scope or rule changes, not made)

1. **Follow-through on a flag** (personas 1, 3, 4, 5). Today HR can only add a note; "Reviewing a flag does not change any rating." Options: "Return to manager" (reopens the review and blocks release until the manager answers), or require a different note per flag. This changes the review lifecycle and the release rule.
2. **An employee's voice** (3, 4, 5). A "Respond / request a conversation" button on My result. Out of the v1 scope as written.
3. **Tell employees about the consistency check** (3, 4, 5). For example "Your team's ratings ran 0.9 above results; HR checked yours." Today "Flags and their HR notes stay visible to HR only." This changes what employees see.
4. **Who sees the manager's "why it differs" reason** (1). Employees see it now (an earlier developer assumption). The HR persona expected it to be HR-only. The PO should choose.
5. **Evidence when rating someone down** (5). Today a specific example is needed only for an overall 1, 2 or 5. A rating 1.0 or more *below* results could also require one. This changes the evidence rule.
6. **Behaviour vs overall mismatch** (1). Warn or require a reason when the overall rating is far from the behaviour average (all 3s, overall 5). This is a new rule.
7. **A live team-gap meter for managers** (2). Show managers their team's gap against the 0.75 line before they submit. It also raises the "threshold cliff" point (+0.74 vs 0.75).
8. **Landing page framing** (2, 3, 4, 5). The sentence reads as HR-only, and "Open demo" starts as HR. Add a line such as "Try it as HR, a manager or an employee", or let the visitor choose a role first. The PO set the landing content, so this is the PO's call.
9. **Demo data detail** (3). Nida's reason refers to a Q1 renewal, which falls after the review period. Keep it as an example of a weak reason HR should catch, or reword it.

Not acted on, because the screen already covers it: persona 5 said nothing told Ying that her self-review window had closed. The Self-review screen does say so ("…completed your review on … without a self-review. This is recorded."). It is just not pushed to her as a notice.

---

# The five reports

## Persona 1 — HR manager at a 50-person company who runs the annual review every year (desktop, 1366×900)

Went through all five guided steps: removed Fah, submitted Orn's review as Tom with a 5, marked all flags reviewed, moved the date on 2 days to trigger the escalation, completed Ying's review as Anong, released, and checked the employee view for Ying, Orn and Fah.

**First 10 seconds.** The start page is clear ("Managers rate on different scales… This lets HR catch that before results reach employees"). I read it as a calibration add-on for an HR suite. The 5-step guide made the story easy to follow, though it takes most of the first screen until "Hide guide".

**Where I got stuck**
- **What happens after a flag.** The only action is "Mark reviewed", and the dialog says "Reviewing a flag does not change any rating." The manager is told "You cannot change it after submitting." As HR I found no way to send a review back. I typed the same note on all 5 flags and nothing questioned it.
- **Who sees the manager's reason.** The manager form says the "Why does your rating differ…" box is something "HR sees this when checking consistency." After release, Orn's own result shows that text under "Why it differs from results". A manager would expect it to stay with HR.
- **The threshold cliff.** After my 5 for Orn, Tom's team sat at "+0.74 … In line with results … No action needed", just under the 0.75 flag.
- **No warning on a mismatch.** Behaviours all 3, overall 5: the form only asked for a reason and an example.
- **Escalation from Ying's side.** Ying's result says only "By Anong Rattanakul", with no reason why.
- **Small slips:**
  - "Late or escalated" dropped to 0 after the escalation was resolved.
  - Fah, who was removed, still sees "Your manager sees the same figures when they review you."

**Fair from my role?** Mostly yes. Each team is compared only with its own results ("no forced distribution"). Each behaviour level has a written description, far-off ratings need a reason, removals and escalations are logged, and release stays locked until everything is done. The weak spot is fairness to employees: HR can see bias but can't correct it, so a flagged rating goes out unchanged.

**One change.** A "Return to manager" option on each flag: HR's question goes back to the manager, the review reopens, and release stays blocked until the manager answers.

**Score: 7/10.** Clean and solves a real problem. It loses points because flags have no real follow-through and a note managers think is HR-only is shown to the employee.

## Persona 2 — Team manager with 6 direct reports, finds review season stressful (desktop, 1366×900)

Tested mostly as Manager → Tom Wattana (4 reports in the demo, not 6).

**First 10 seconds.** The landing line ("Managers rate on different scales… This lets HR catch that before results reach employees") read as a tool for HR to police managers, not one that helps me. "Open demo" landed in the HR view under a five-card guide, and it took a moment to see that "View as: Manager" was my part.

**Where I got stuck**
- **The flag rule didn't match the number I was shown.** Ying's "Suggested overall rating" displays as 3. Picking 2 showed "Close to the suggestion". Picking 4 showed "Far from the suggestion: add a reason below" ("Required when the rating is 1.0 or more from the suggestion"). Both are one step from the 3 I can see, but only one needs a reason. HR's screen uses decimals ("results suggest 3.9", "3.0"), so Ying's real suggestion seems to be about 2.6, and that number is hidden from me.
- **Level descriptions only appear after I commit.** "Each level 1–5 has a short written description (shown when you pick it)". Hovering shows nothing ("Pick a level to see what it means."), so I have to click through levels one by one to compare them.
- **I'm close to a team-level flag.** After a justified 5 for Orn, HR shows me "In line with results +0.74" next to "0.75 or more is flagged". One more generous rating would flag me, and nothing on my screens warned me.
- **Smaller points:** "1.0" is an odd way to describe a gap between whole-number ratings. The "Specific example" rule (at least 40 characters) for ratings of 1, 2 and 5 only showed up when I tried them.

**Fair from my role?** Mostly yes. Goals come from company systems with dates, and "How is this calculated?" is clear. The confirm dialog says "HR will check this rating against the results". "No forced distribution", and teams are compared only with their own results. Autosave and the exact escalation date lower the stress. It is less fair that I'm judged against decimals I can't see, and that I can't see my team's gap before submitting.

**One change.** Show managers the exact suggestion (e.g. 2.6) and a live team-gap meter on the review screen.

**Score: 7/10.** Calm, clear and well built, but hidden rounding takes away trust right where a stressed manager needs it.

## Persona 3 — Employee in sales who wants to know if their rating is fair (phone, Pixel 7)

**First 10 seconds.** An HR tool, not something for me. The start page says "This lets HR catch that before results reach employees". "Open demo" put me in the HR view with the guide's first step, "See who is late · As HR".

**Where I got stuck**
- **Finding myself.** Switching to "Employee" defaulted to Ying Chen (Logistics Coordinator). I had to open the dropdown to find the sales people. On every employee tab the guide said "This step is for HR. You are viewing as Employee: the link below switches for you."
- **No rating to see.** "Your result is not released yet… Nothing to do now." To see a rating I had to act as HR and a manager: remove Fah, submit Tom's two reviews, mark 4 flags reviewed, then press Release. A real employee couldn't do that.
- **Unclear status labels.** The manager list shows Ploy as "Not submitted" next to "Submitted", with no column names. Progress shows Orn as "Submitted" and also "1 day overdue".
- **Broken grammar.** "It does not change the rating your manager is suggested."
- **A bare number.** "Overall rating 4" with no word beside it. Only the self-review screen told me 4 means "Above expectations".

**Fair from my role (as James, Account Executive)?**
- **What works:** it's partly fair because it's open. I see "104% of goal targets… That suggests an overall 3", my behaviours average (3.8) and my manager's comment. "How is this calculated?" is clear and I can check it myself.
- **Flagged, but nothing changed:** HR's Consistency page shows my manager Daniel "Rates above results +0.90". Marking a flag reviewed "does not change any rating", and "Flags and their HR notes stay visible to HR only." I wrote "reason accepted" and released. Every sales rating stayed inflated, and I'm never told my team was flagged.
- **Doesn't explain my rating:** nothing says how results of 3 plus behaviours of 3.8 became a 4.
- **Nida's numbers don't match:** HR sees "results suggest 3.9", but Nida's own screen says it "suggests an overall 4". Her reason for the 5 is a contract renewal "in Q1", which falls after the review period.
- **No way to respond:** there is nowhere to question or dispute the result.

So the app shows the right numbers but doesn't make the rating fairer. HR's check is only a note.

**One change.** Make a reviewed flag lead to something: HR can send the rating back to the manager, or the employee sees "Your team's ratings ran 0.9 above results; HR confirmed yours", plus a "Question this result" button.

**Score: 6/10.** Clear goal numbers and formula, and it works well on a phone. But it starts from HR's side, I had to play three roles to see my own rating, and the fairness check never reaches the employee.

## Persona 4 — Employee, joined 2 years ago, not technical, on the bus (phone, Pixel 7)

Went from the landing page to released results, viewed as Nida and as Mai.

**First 10 seconds.** "Performance Review" made me think it was my own review form. "This lets HR catch that before results reach employees" told me it's an HR tool and I'm the one being reviewed. "Open demo" put me in as HR ("Pim Chaiyaporn") with a 5-step guide for HR and managers. I had to find the small "Employee" tab myself.

**Where I got stuck**
- The Employee tab dropped me in as "Ying Chen" without asking who I wanted to be. Nothing tells you to pick a person.
- The guide box takes most of the phone screen in every role. On the Employee tab its first card says "This step is for HR. You are viewing as Employee", which isn't much use to me.
- **Self-review locked with no warning.** "Submit self-review" went straight to "It cannot be changed." The manager's submit asks "…You cannot change it after submitting."; the employee's doesn't.
- "It does not change the rating your manager is suggested." I had to read it twice.
- Numbers don't match: HR saw "results suggest 4.2" for Mai, but Mai's page says "That suggests an overall 4".

**Fair from my role?** Partly. Goal numbers come "from company systems" and "Your manager sees the same figures". Managers must explain a rating far from the suggestion. Everyone's results are released on the same day. But Mai hit 123% of target and still got a 3. "Reviewing a flag does not change any rating", so HR could only note it and release. Mai's page shows the manager's reason ("picks the easy tickets"), but not that HR checked it, and there is no button to respond or ask. It catches unfairness but doesn't act on it.

**One change.** A "Respond / request a conversation" option on My result, a note when HR has looked at a rating far from results, and an "Are you sure?" step before a self-review locks.

**Score: 6/10.** Clear, easy to read on a phone and fairer than now, but built around HR; the employee sees things last and can't answer back.

## Persona 5 — Employee who felt underrated last year, sceptical (phone, Pixel 7)

Ran the whole cycle to release.

**First 10 seconds.** An HR tool, not something for me ("…This lets HR catch that before results reach employees."). "Open demo" dropped me in as HR, and I had to find the "Employee" tab myself.

**Where I got stuck**
- **The guide crowds my screen.** As an employee, the large guide card stays at the top ("This step is for HR. You are viewing as Employee.") and pushes my goals and review below the fold on a phone.
- **The self-review wording.** "Your own rating — For information only. It does not change the rating your manager is suggested." The grammar is off, and it tells me my view of myself counts for nothing.
- **Numbers don't match across screens.** The flag card says "results suggest 4.2", the dialog says "4.17", and my result page says "That suggests an overall 4". Which is real?
- **No closing notice.** As Ying I was told "You can still submit until Tom finishes your review." Tom then submitted without it ("Self-review: Missing; this will be recorded"), and nothing told Ying her window had closed.

**Fair from my role?** Partly. Goal results come from company systems, the suggestion is shown, and a gap of 1.0 or more must be explained: real progress. But as Mai Tran, the underrated case (123% of target, rated 3), the flag caught it, and then as HR I cleared all four flags in seconds with the same pasted note ("Reviewing a flag does not change any rating"). After release Mai sees the manager's reason ("picks the easy tickets"), with no evidence and no way to respond. Nida, rated above her results, has a concrete "Example"; Mai has none. Testing as a manager, a written example was only required for an overall 1, so a full point down can rest on opinion. And "Flags and their HR notes stay visible to HR only": Mai never learns HR noticed. It catches the problem but doesn't protect me from it.

**One change.** When a rating is more than 1.0 below my results, require a specific dated example (as for a 1). Show me that HR checked it, and add a "respond / request discussion" button on My result.

**Score: 6/10.** Clear, honest about the numbers and looks good on mobile, but the safety net for underrated people ends with an HR checkbox, not a fix or a voice.



---

# Re-test (round 2), 19 Nov 2026

**Build tested:** live main after the PO's decisions on the list above were built (commit 2d02854): "Return to manager", the light consistency notice on the employee result, Nida's reworded reason, and the landing page offering "Try as HR / Manager / Employee". Items 2, 5, 6 and 7 went to the Q1 "next" list in `docs/ANSWERS.md`.
**Method:** the same five personas, run as fresh agents with the same brief, plus two additions asked for by the PO: an **ease-of-use score** out of 10 and the **one screen that felt hardest**. A sixth agent, a **senior product designer**, reviewed UX/UI only, on a 1366×900 desktop and a 412 px phone, starting from the landing page with only the link. The designer reported a top 5 issues (screens described by name and quoted text) and a UX score.
**Note:** the fixes listed below came from this round and were checked with the unit tests, the scripted click-through (1280 px and 390 px), the 320–500 px sideways-scroll scan and the header-overlap scan. They have not been scored by the personas a third time.

## Scores

| # | Persona | Screen | Round 1 | Round 2 | Ease of use | Hardest screen |
|---|---|---|---|---|---|---|
| 1 | HR manager, runs reviews every year | desktop | 7 | **7.5** | **8** | HR · Consistency check |
| 2 | Team manager, 6 reports, stressed by review season | desktop | 7 | **7** | **7** | Manager · individual review form |
| 3 | Employee in sales, wants to know if their rating is fair | phone | 6 | **7** | **6** | HR · Consistency on a phone |
| 4 | Employee, 2 years in, not technical, on the bus | phone | 6 | **6.5** | **6** | Employee · Self-review on a phone |
| 5 | Employee who felt underrated last year, sceptical | phone | 6 | **6** | **6** | Employee · locked My result with the guide |
| 6 | Senior product designer, UX/UI only | both | – | UX **7** | – | Consistency, and phone density |

**Average** of personas 1–5: 6.4 → 6.8. Ease of use averages 6.6.

**Common thread:** "Return to manager" was understood and used by HR and the manager. Hard spots were the Consistency check (dense, especially on a phone), the manager form's reason rules, and the guide card covering the employee's form on a phone. The employees still see it as an HR tool: to see any result they had to play HR and the manager, and they still have no way to answer back (out of v1 by the PO's decision 2).

## Fixed after round 2 (clear UX issues)

| Finding | From | Fix |
|---|---|---|
| The rule line "No reason needed for 2 or 3… a 1, 2 or 5 also needs an example" read as contradictory | 2, 4, 6 | Before choosing: "Within 1 of the suggestion (3 or 4): no reason needed. Further away: a written reason. Any 1, 2 or 5: also a specific example." After choosing, the line is replaced by what that rating needs: "needs a reason and an example (below)", "needs a reason (below)", "needs an example (below)" or "nothing else needed". |
| Submit blockers appeared twice, far from the fields | 2, 6 | Shown once: the count on a computer, the first missing item on a phone. |
| A sticky, disabled "Submit review" / "Release results" / "Submit self-review" bar was the strongest thing on the phone screen | 4, 6 | The bar sticks only when the action is usable; otherwise it sits at the end of the form with the reason. |
| The suggestion showed "3.0" while the far rule used 3.049 (Orn) | 2 | The suggestion is rounded to one decimal where it is calculated, so the screen and the rule always use the same number. *Developer decision, flagged for the PO below.* |
| Consistency: "Mark reviewed" was the filled main button on every card, with the evidence collapsed | 6, 1 | Both decisions are equal-weight buttons; the people list and the manager's reason start open on flags not yet checked. |
| Consistency: counts changed without explanation, reviewed gaps stayed amber, labels varied ("Rates / Rated / ratings: above results") | 6, 1 | One label pair, "Above results" / "Below results" (and "Checked · above results"); checked gaps in neutral; the header and the nav badge count reviews waiting for a manager's answer; "While returned, a review is left out of its manager's gap."; a manager below 3 reviews shows "N submitted reviews so far; at least 3 are needed to compare." |
| The Return dialog showed only the suggested score | 1 | It shows "% of goal targets, which suggests X" for each person. |
| Phone touch targets of 15–30 px; "hover over a number" on a phone | 6 | Links, buttons, demo controls, tabs and rating buttons are at least 44 px tall on phones (scales 48×44). The glossary says "shown when you pick it; on a computer, also on hover". |
| The employee start screen (My goals) had no next action | 6 | "Try as Employee" opens Self-review; My goals shows "Your self-review is overdue… Write it now →". |
| On a phone, "Open Self-review →" changed the tab but the guide card still filled the screen | 3, 4 | A guide link now scrolls to the screen it opens. On a phone, when you are already on the step's screen, the guide shrinks to one line ("You are on this screen: it starts below.") with "Show the guide". |
| Guide bar "This step is for HR" in the Employee guide | 4, 5 | "In this step you play HR." |
| Locked My result: "Your review: not completed yet. Nothing to do now." was a dead end and did not say whose review | 4, 5, 6 | "Your manager's review: not done yet. Your self-review: submitted." and "In this demo, the guide's last step lets you play HR and release results." |
| My result said HR "followed up where they did not match", which promised more than happened | 4, 5 | It now says exactly what was checked: "Before release, HR compared each manager's ratings with their own team's goal results, and checked every rating 1.0 or more away from what goal results suggest." |
| The employee's own rating appeared nowhere on their result | 4, 5 | The released result has a "Your self-review" section ("Your own rating 4") with their text. Only their own self-review; nothing about others changed. |
| "92 % · Target 95 · 97%": unclear which number is the score | 4 | "92 %", "Target 95 %", "97% of target". |
| Remove dialog did not say the person is told | 1 | "Recorded in the activity log. Fah sees the reason and details on their result page." |
| Moved-away reviews: what happens to a draft | 2 | "…3 days past the deadline. Any draft went with it." |
| Self-review scale gave no meaning for the numbers | 4, 5 | "1 = well below expectations, 3 = met, 5 = well above" under the scale, and the level word once a number is picked. |

## For the PO to decide (scope or rule changes, not made)

1. **HR accepts or rejects a manager's answer** (1). Today the manager's answer to "Return to manager" closes the flag, as decided. The HR persona wants to accept it or ask again. This adds a step to the flag lifecycle.
2. **Flag underrating when the self-rating is higher** (5). Mai and Ying were rated below their results by less than 1.0, so nothing flagged them. Option: also flag a rating below the suggestion when the employee's own rating is higher. This is a new rule and uses the self-rating, which today is "for information only".
3. **Show the employee their suggested rating before the review** (4). The formula and the 2.6 are visible only after release. Showing them on My goals during the cycle changes what employees see, and when.
4. **Say on My result whether my team was flagged** (3). Raised again; the PO chose the light version (decision 3).
5. **Pro-rated targets for people who joined during the year** (1). Fah's annual target was not scaled to her start date (69%). A data/rule change.
6. **The suggestion uses goals only** (1). Nida was flagged although her behaviours averaged 4.8. Adding behaviours changes the suggestion formula.
7. **One "Demo ▾" menu and the same nav labels at every width** (6). The demo bar (role, person, date, +1 day, Reset, Exit) takes about a third of a phone screen, and nav labels shorten on phones ("Log" vs "Activity log"). A layout change across every screen. Worth doing; I did not do it unasked because it moves every control the guide refers to.
8. **Demo data: Ying opens already 15 days late** (4, 6). "It felt like a telling-off before I'd done anything." Changing it moves the demo dates that show escalation.
9. **Employees can see a result only by playing HR and the manager** (3, 4, 5). A "Skip to released results" demo control would let an employee see a result straight away, but it skips the check the demo is about.
10. **Developer decision to confirm:** the suggested rating is now rounded to one decimal where it is calculated (3.049 → 3.0), and the "far" rule uses that rounded value. Before, the screen showed 3.0 while the rule used 3.049. Same thresholds; borderline cases now follow what the manager sees.

# The round-2 reports

## Persona 1 (re-test) — HR manager at a 50-person company (desktop)

Ran a full cycle: removed Fah, reviewed the 4 flags, sent Ploy's review back to her manager, finished Orn's review as Tom, moved the date past the escalation, completed Ying's review as the MD, released, and checked the employee views.

**First 10 seconds.** A calibration tool for annual reviews; the start page says it plainly. The 5-step guide was useful.

**Where I got stuck**
- **The flag closes itself when the manager answers.** After Daniel answered, his card read "Reviewed by Daniel Reyes, 12 Dec 2026 · Returned to manager. Answer: …" and release was unblocked. I never got to accept or reject his answer.
- **Removal note shown to the employee.** The dialog says "Details (optional) … Recorded in the activity log", but Fah then sees my note word for word ("HR removed you from Annual Review 2026: Joined less than 3 months before the period end. Started 3 Oct 2026."). I didn't know she would.
- Contradictory rule text on Ploy's review: "No reason needed for 2 or 3. Any other rating needs a written reason, and a 1, 2 or 5 also needs a specific example."
- Tom rated Orn 4 against "Suggested 3.0" and it wasn't flagged, though the rule is "1.0 or more away". The real suggestion is probably about 3.05, but the screen shows 3.0.
- **Counts disagree.** The Consistency card said "2 of 3 reviews in" for Tom; Tom's page said "2 of 4 reviews submitted". Daniel's gap moved from +0.90 to +0.93 when I sent one review back, with no explanation.

**Fair from my role?** Mostly, and better than what I run today: each manager is compared only with their own team, there is no forced distribution, reasons and examples are shown to the employee, and escalations are automatic and logged. Concerns: "results suggest" uses only goals (Nida was flagged despite behaviours of 4.8), and Fah's goals were annual targets not scaled to her start date ("Target 450", 69%).

**One change.** A manager's answer should go back to HR, who accepts it or asks again. Today the flagged manager's answer clears his own flag.

**Score: 7.5/10.** **Ease of use: 8/10.** Hardest screen: Consistency check. It mixes manager gaps, single-rating flags, collapsed people lists and three possible actions. The Return dialog shows only the suggested score, not the goal %. After acting, it wasn't clear what still blocked release.

## Persona 2 (re-test) — Team manager with 6 direct reports (desktop)

Tested as Tom Wattana (4 reports), plus the HR view and the "answer HR" flow as Daniel Reyes.

**First 10 seconds.** A clickable concept for empeo's annual review: "Managers rate on different scales", so HR catches inconsistent ratings before release. Clear right away. Picked "Try as Manager".

**Where I got stuck**
- **The reason rules contradict each other.** For Orn the suggestion shows 3.0 and the note says "No reason needed for 3 or 4", but the field says a reason is "Required when the rating is 1.0 or more from the suggestion". A 4 is exactly 1.0 away, yet it submitted without a reason and HR didn't flag it.
- **A 2 is described two ways.** For Ying (suggested 2.6), choosing 2 shows "Below expectations · no reason needed", and right under it "An overall 2 needs a real example". Submit stayed blocked with "Give a specific example (at least 40 characters)."
- **The counts don't match.** My team says "2 of 4 reviews submitted"; HR's Consistency says "2 of 3 reviews in. Too few to compare yet."
- **The escalation felt like losing work.** After "+1 day" twice, Orn's review ("Draft saved") disappeared under "Moved to your manager · Nothing to do", with no warning on the day and no way to ask for it back.
- **The guide box is in the way.** It sits on top of My team, and after a role switch it came back showing "0 of 3 done".

**Fair from my role?** Mostly, and it lowered my stress. Goal results come from company systems, there is "How is this calculated?", the written levels keep my 3s honest, and HR compares me only with my own team ("no forced distribution"). Justifying a 5 against a 3.0 is reasonable. Less fair: losing a saved draft after 3 days with no warning feels punitive. Nida's 5 was flagged despite 125% of revenue target, but "Return to manager" let her manager explain.

**One change.** One clear sentence that matches what blocks Submit and what HR flags: "Within 1 of the suggestion: no reason. Further away: reason. Any 1 or 5: also an example."

**Score: 7/10.** **Ease of use: 7/10.** Hardest screen: the individual review form. It's long, the reason rules contradict each other, and the blocking messages appear three times at the bottom, far from the controls they refer to.

## Persona 3 (re-test) — Employee in sales who wants to know if their rating is fair (phone, Pixel 7)

**First 10 seconds.** A performance-review prototype for "empeo". "Managers rate on different scales…" hooked me, because it's exactly my question. "Try as Employee" made me Ying Chen (Logistics Coordinator), not a salesperson; I had to find the name dropdown to become James, Ploy or Nida.

**Where I got stuck**
- On a phone the guide card and the dark role bar fill the first screen. Tapping "Open Self-review →" changed the tab but didn't scroll, so I still only saw the guide.
- "Your result is not released yet." Guide step 3: "This step is for HR… Follow the HR guide to the end, then open a result as an employee." To see any rating I had to play HR: remove Fah, write two reviews as Tom, mark 4 flags, release. A lot to ask of an employee.
- Manager form: "No reason needed for 2 or 3. Any other rating needs a written reason, and a 1, 2 or 5 also needs a specific example." So does a 2 need an example or not? "Hover over a number" doesn't work on a phone.
- The confirmation toast covered the role switcher for a moment.

**Fair (as sales)?** Mostly. My result shows "104% of goal targets… suggests 3.2" next to my manager's 4, and "How is this calculated?" is plain. Nida's 5 against 3.9 came with a written reason and an example, which I respect. But HR flagged Sales "Rates above results +0.90" and "Reviewing a flag does not change any rating"; my page only says a vague "Checked for consistency before release", so I can't tell if my team was flagged or what HR decided. And everything rests on targets being equally hard across teams; nothing says who set my 12m target or why.

**One change.** On My result, say whether my rating differs from the suggestion and whether my team was flagged, and add an "Ask about my rating" button.

**Score: 7/10.** **Ease of use: 6/10.** Hardest screen: HR → Consistency on a phone ("Manager gap", the dot-and-line chart, stacked "Mark reviewed / Return to manager" buttons). I only went there because the employee path was blocked.

## Persona 4 (re-test) — Employee, 2 years in, not technical, on the bus (phone, Pixel 7)

Tested the Employee path as Ying Chen, then followed the guide through Manager and HR to release, and viewed Ying's and Mai Tran's released results.

**First 10 seconds:** A demo of a new review tool for "empeo". The start page was clear: "Try as Employee – Write your self-review and see your result as Ying Chen." I didn't feel lost.

**Where I got stuck or confused:**
- I tapped "Open Self-review →" and the screen barely changed. The big guide card fills the whole first screen, so the form is below the fold. All I could see was a greyed-out "Submit self-review" bar.
- On My goals, "Orders dispatched on time 92 % · Target 95 · 97%" puts three numbers on one line. I couldn't tell which one was my score.
- I opened the app and was already 15 days late: "It will be marked as 15 days late." It felt like a telling-off before I'd done anything.
- In the Employee guide: "Guide, step 3 of 3: See a released result. This step is for HR." Why is my guide sending me to HR?
- After I submitted, My result said: "Your review: not completed yet. Nothing to do now." That was a dead end. To see a result I had to play HR and the manager myself.
- On the manager screen: "No reason needed for 2 or 3… a 1, 2 or 5 also needs a specific example." Does a 2 need something or not?

**Did it feel fair from my role?** Partly. Good: the result page explains itself ("92% of goal targets… suggests 2.6 on the 1–5 scale (100% of target is a 3)"), the manager has to write "Why it differs from results", and Ying received Tom's comment. But my own rating (4) doesn't appear anywhere on my result. Mai Tran hit 123% of her targets and still got a 3; HR flagged it, but "Mark reviewed" "does not change any rating", and Mai still sees "HR… followed up where they did not match." That reads like reassurance, not a check. 92% of target being "below a 3" feels harsh, and I only learn the formula after release.

**One thing I would change:** Show the employee the formula and their suggested rating (e.g. 2.6) on My goals before the review, and show my self-rating next to the manager's rating on the result page.

**Score:** 6.5/10 · **Ease of use:** 6/10 · **Hardest screen:** Self-review on a phone (the guide card hides the form; the submit button stays greyed out with no visible field).

## Persona 5 (re-test) — Employee who felt underrated last year, sceptical (phone, Pixel 7)

Tested as Ying Chen from self-review to released result; had to act as HR and Tom because the result stays locked until release.

**First 10 seconds.** An HR tool that stops managers rating on different scales. "HR catch that before results reach employees" is exactly what I suspect happened to me.

**Where I got stuck**
- **Late before I started:** "It will be marked as 15 days late." My result then says "Submitted late", which the demo caused, not me.
- **No hover on a phone:** managers are told to "hover over a number".
- **Self-review numbers:** my own 1–5 buttons don't say what they mean until I tap one.
- **Blocked as an employee:** after submitting, "Your result is not released yet", and the guide says "This step is for HR. You are viewing as Employee." I had to switch to HR, then Tom, then back.
- **Contradictory rule:** Tom's 2 showed "Below expectations · no reason needed" right above "An overall 2 needs a real example".

**Fair?** No, and this is the main finding. I hit 92% (suggested 2.6). As Tom I gave myself 2 on every behaviour and 2 overall with a one-line example. Nothing flagged it: Tom is "In line with results −0.10", a single rating is only flagged "1.0 or more away" (mine was 0.6 below), and behaviours are left out of the check. Then my result said "HR compared every manager's ratings… and followed up where they did not match." Nobody looked at mine. My own rating of 4 is "for information only" and not on my result, and I can't respond.

**One change.** Flag any rating below the suggestion when the employee's own rating is higher, and add an "I disagree" response that HR must read.

**Score: 6/10.** **Ease of use: 6/10.** Hardest screen: the locked My result together with the guide's "This step is for HR"; as an employee there was no next step except pretending to be HR and my manager.

## Agent 6 — Senior product designer, UX/UI only (desktop 1366×900 and phone 412 px)

Tested every role. In HR: removed a person, marked a flag reviewed, returned one to the manager. As Manager: filled in Orn's review and tried an overall 5. As Employee: goals, self-review and result.

**Top 5 issues**
1. **Phone: the main action is pushed down or wrong.** HR Overview at 412 px: the dark demo bar, the app header and the tabs take about 30% of the screen, then the large guide card. The strongest element is a sticky, disabled "Release results" bar ("7 items left before release."), while the guide's next step is "Open Progress →". The Manager review is the same, plus a picker row and a sticky disabled "Submit review". *Fix:* fold the demo controls into one "Demo ▾" menu; make the sticky bar point to the next blocker, or show it only when usable.
2. **Touch targets too small (phone).** "About" 33×18; "Open Progress →" and "Show all 5 steps" 20 px tall; "Guide for: HR" 18×20; "Open as Tom →" 17 px; "See progress" 70×15; "+1 day", "Reset", "Exit", "Mark reviewed", "Return to manager" 30 px; rating buttons 40×38. The Behaviours card says "hover over a number", which touch can't do. *Fix:* at least 44×44; "tap a number".
3. **The Employee start screen has no next action.** After "Try as Employee" and "Hide guide", "My goals" shows three progress bars and no button; the only cue is a small amber "1" by "Self-review", although it is "15 days late". *Fix:* open on Self-review, or add a banner "Your self-review is overdue – Write it now".
4. **Consistency: the easy option is the main button; counts change unexplained.** Every card has the same filled green "Mark reviewed" (4 at once), while the evidence is collapsed ("▸ Show the 4 people", "▸ Manager's reason"), which invites approving without reading. After one "Mark reviewed" and one "Return to manager", the header went from "4 flags to check" to "1 flag to check", Kanya's card quietly became "Not enough reviews yet", and the sidebar badge showed "1" although release was also blocked by "Waiting for managers". A reviewed card still shows "+0.90" in amber. *Fix:* give the two decisions equal weight with the evidence first, explain each change, count waiting items in the badge, and show reviewed values in neutral.
5. **Same thing, different labels; repeated messages.** "Above results" appears in five forms ("Rates above results", "Rated above results", "ratings: above results", "Far from results", "Open flag: overall rating far from results"). Desktop "Cycle overview / Results map / Activity log / Reset demo / About this prototype" become "Overview / Map / Log / Reset / About" on phone, but the guide says "Open Activity log →". Manager review blockers appear twice (bullets and the footer "(+1 more)"). The rule line stays after the reason fields appear. "Concept for empeo"/"Prototype" three times on HR's first screen. "Your review: not completed yet" on My result doesn't say whose. *Fix:* one term, the same nav labels at every width, each blocker once, name the reviewer.

**Keep:** the start page (one primary, two secondary); the release checklist with links; disabled buttons that say why; the Remove and Return dialogs; the locked My result; written-out escalation dates; behaviour levels shown once picked; consistent colours (green done/primary, amber attention); the collapsible guide that switches role.

**UX score: 7/10.** The flows and locked/blocked states are well thought through. Points off for phone density and touch targets, competing actions on Consistency, and drifting labels.
