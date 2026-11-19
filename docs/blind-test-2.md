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

