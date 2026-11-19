# Part 2 — Answers

## 1. Scope and prioritization

**In v1:** one annual review cycle, end to end, for HR, managers and employees. Fairness is built into the moment of rating: a written description for each level, a suggested rating from measured goal results, a written reason when the manager's rating is far from it, and a specific example for any 1, 2 or 5. HR compares each manager with their own team's results, can return a review with a question, and releases results only when everything is resolved. Late, missing and ineligible cases are handled and logged.

**Left out on purpose:**
- **Goal setting and mid-year check-ins.** The brief is about the annual review, so I assumed goals already exist.
- **360 feedback.** More inputs do not fix inconsistent scales.
- **Links to pay.** They raise the stakes before the ratings are trusted.
- **AI ratings or summaries.** A person must be able to explain every rating.
- **Calibration and forced distribution.** I wanted to see how far per-team checks go first, and calibration is question 2.

**Next, from user testing:** a way for employees to respond to their result, evidence when rating someone below their results, and pro-rated targets for people who join mid-year. Each needs a policy decision before it becomes a feature.

**Right slice for a real customer next week?** Close. It would still need SSO and permissions, real notifications, and goal results imported from their systems, which is the riskiest assumption.

## 2. The requirement change: calibration before release

**It fits well**, because release is already one gate in the code (`releaseBlockers`). Calibration becomes one more condition: "calibration locked".

**I built it to check:** https://suruchboss.github.io/gofive-performance-review/calibration/
- **New:** a calibration stage (not started → in session → locked), a session screen, and a change history, so the manager's own rating is never overwritten.
- **Reused:** flags became the meeting agenda, and the map, activity log and person pages worked unchanged.
- **Changed:** one rule. HR's flag notes no longer gate release, because the group now discusses those cases. 4 of 97 tests failed as expected and were rewritten, which shows exactly where the change lands.
- **Not done:** a real multi-person session. HR records what the group agrees.

It took about an hour from written plan to working build. The details are in `WORKLOG.md`.

**How I would know it works:**
- each manager's gap to their own team's results shrinks, without every team converging on the same average;
- the time from the manager deadline to release does not grow beyond an agreed limit;
- more employees agree that "my rating reflects my results", measured per team.

## 3. Working with AI: an example of disagreeing or reworking

In a recent take-home case for a marketing agency, I built a tool that finds social media creators for a brand. The AI checked the first version against the brief line by line and reported every requirement as covered. That was technically true. But when I looked at it as the marketing team who would use it, it failed them: it ran from a command line they could not use, and the Facebook input they gave never visibly affected the result.

The AI was checking against the spec, and I was checking against the user. I delayed the submission and we reworked it into a simple web app that shows how each input shapes the result. Since then, when AI tells me something is done, I also check it from the user's side. In this exam, that is why the first screen guides a reviewer who knows nothing about the product.
