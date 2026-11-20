# Part 2: Answers

## 1. Scope and prioritization

For v1 I built one full annual review cycle, from opening it to releasing results, for HR, managers and employees.

Most of the fairness work happens while the manager is rating. Every level has a written description. The system suggests a rating from the person's goal results. If the manager goes far from that suggestion, they have to write why, and any overall 1, 2 or 5 needs a real example. After that, HR compares each manager with their own team's results, can send a review back with a question, and can only release results once everything is cleared. Late reviews, missing self-reviews and people who are too new to review are all handled and recorded.

What I left out on purpose:
- Goal setting and mid-year check-ins. The brief is about the annual review, so I assumed goals already exist.
- 360 feedback. More inputs won't fix managers using different scales.
- Links to pay. That raises the stakes before people trust the ratings.
- AI ratings or summaries. Every rating should be something a person can explain.
- Calibration and forced ranking. I wanted to see how far per-team checks can go first, and calibration is question 2 anyway.

What I'd add next, based on testing: a way for employees to respond to their result, evidence when someone is rated below their results, and pro-rated targets for people who join mid-year. Each one needs a policy decision first.

Is it the right slice for a real customer next week? Close, but not yet. It still needs SSO and permissions, real notifications, and goal results imported from their systems. That last one is my riskiest assumption.

## 2. Calibration before release

It fits well. Release is already a single gate in the code (`releaseBlockers`), so calibration is just one more condition: "calibration locked".

I built it to make sure: https://suruchboss.github.io/gofive-performance-review/calibration/

- New: a calibration stage (not started, in session, locked), a session screen, and a change history, so the manager's original rating is never overwritten.
- Reused: the fairness flags became the meeting agenda. The map, activity log and person pages needed only a few lines each.
- Changed: one rule. HR's notes on flags no longer block release, because the group now talks those cases through. 4 of the 97 tests failed, which I expected, and I rewrote them. They showed me exactly where the change hit.
- Not there yet: a real meeting with several people in the app. HR records what the group agreed.

It took about an hour from the written plan to a working build. The details are in `WORKLOG.md`.

How I'd know it's working:
- each manager's gap to their own team's results gets smaller, without every team being pushed to the same average;
- the time from the manager deadline to release doesn't stretch past a limit we agree on;
- more employees, team by team, agree that "my rating reflects my results".

## 3. Working with AI

One example from a recent take-home case for a marketing agency. I built a tool that finds social media creators for a brand. The AI checked the first version against the brief line by line and said every requirement was covered. On paper, it was right. But when I looked at it as the marketing team who would actually use it, it didn't work for them. It ran from a command line they couldn't use, and the Facebook input they gave didn't visibly change the result.

The AI was checking against the spec. I was checking against the user. I pushed back the submission, and we rebuilt it as a simple web app that shows how each input changes the result.

It happened again in this exam. The AI told me the prototype was ready because its checks passed. I opened it on my phone as a first-time user and got lost, even with an on-screen guide. So I threw the guide away and redesigned the screens: each person's home is now a short list of what to do next. Now I don't count anything as done until I've used it myself.
