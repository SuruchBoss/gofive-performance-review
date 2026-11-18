# Work log

Working notes for the Product Owner. Newest entry at the bottom.

## Step 1 — Open questions (2026-11-18)

- **Done:** Read the task message and the repo (only README.md and one initial commit). Wrote this log. Sent the open questions to the PO.
- **Why:** The working agreement asks for questions before any design or code.
- **Who decided:** PO set the process; developer chose the questions.
- **What went wrong:** The brief was not in the message (only the placeholder "paste the full Gofive brief here"). `docs/BRIEF.md` was not created, so the brief is not invented. Asked the PO to paste it.

## Step 1b — Brief received (2026-11-18)

- **Done:** Saved the brief as `docs/BRIEF.md`.
- **Why:** The PO asked for the brief to be stored word for word.
- **Who decided:** PO (instruction). The text was forwarded by another Claude session that said the PO asked it to send the brief; the PO still needs to confirm the text is theirs.
- **What went wrong:** The forwarded text had HTML-escaped characters (`&gt;`, `&amp;`), probably from the copy step. They were turned back into `>` and `&`, which changes no words. The PO should confirm or say if the escaped form must be kept.

## Step 2 — Design draft (2026-11-18)

- **Done:** Wrote `docs/DESIGN.md`: screens per role, data model, rating/flag/deadline rules, demo data plan, three trade-offs, four open questions.
- **Why:** Working agreement step 2: design before plan and code.
- **Who decided:** Answers to the five open questions were relayed by another Claude session as the PO's reply ("use the recommendations; public repo is OK"). The developer chose the formulas and the demo data layout; all are marked for PO approval.
- **What went wrong:** Nothing yet. Noted that the PO's answers arrived through a relay, not directly; the PO should confirm when approving the design.

## Note — Proposed change to working rule 4 (2026-11-18)

- **Done:** Recorded a proposed change, not applied yet.
- **What:** A message relayed by another Claude session says the PO wants to drop the stop after every commit. The only stops would be: design ready, commit plan ready, and prototype done and deployed. All other rules stay.
- **Who decided:** Pending. It reached the developer through a relay, not from the PO directly. It removes a review point, so it waits for the PO's own confirmation. Until then, rule 4 stays as originally written. The design is not approved yet in any case, so this changes nothing right now.

## Step 3 — Design approved, rule 4 changed, commit plan (2026-11-18)

- **Done:** The PO confirmed directly that the relayed brief, the five answers and the rule 4 change are their decisions. Updated `docs/DESIGN.md`: marked it approved, limited the evidence rule to the overall rating, and recorded the four resolved questions. Wrote `docs/PLAN.md` (17 commits).
- **Why:** Working agreement step 3: plan before code.
- **Who decided:** PO: design approval, evidence on the overall rating only, keep "≥ 1.0", Operations plays both parts, managers are not reviewed, minimum 3 reviews for the gap, and rule 4 now stops only at design, plan and done-and-deployed. Developer: commit order and branch strategy (proposed).
- **What went wrong:** Nothing.

## Note — Design latitude granted (2026-11-18)

- **What:** The PO allows visual and small UX changes beyond `docs/DESIGN.md`: layout, typography, spacing, empty states and micro-copy. The aim is a real HR product feel, not generic AI output.
- **Still fixed:** scope, rules and thresholds, the demo data plan, the deep mint main colour, and the "no template look" rule.
- **Also allowed:** testing as much as needed, including browser click-throughs at desktop and phone width, and fixing what is found. Treat it as a customer-facing POC.
- **Rule:** Every design change beyond `docs/DESIGN.md` is recorded below, with one line on why.
- **Who decided:** PO.
- **Pending:** explicit approval of `docs/PLAN.md` and its three questions.

### Design changes beyond DESIGN.md
(none yet)

## Step 4 — Plan approved (2026-11-18)

- **Done:** Updated `docs/PLAN.md`: marked approved, moved the visual system to commit 3, and turned commit 14 into a review pass. Created branch `prototype`.
- **Why:** PO approval with two changes.
- **Who decided:** PO. Polish comes early and is not cut. If time runs short, the map's team filter is cut first. Branch plan and Q3 handling approved as proposed.
- **What went wrong:** Nothing.

## Commit 1 — Scaffold the app

- **Done:** Set up Vite 6, React 18.3, TypeScript 5.9 (strict) and Vitest 3, with `dev`, `build`, `test` and `typecheck` scripts.
- **Why:** A small, well-known toolchain. Exact versions are pinned in `package-lock.json`.
- **Who decided:** Developer, per the approved plan.
- **Notes:** Newer majors exist (Vite 8, React 19). The older versions were chosen because they are mature and their behaviour is well known; a demo gains nothing from the newest majors. `base: './'` makes the build work under the Pages sub-path.
- **What went wrong:** Nothing. Test: 1 passed. Build: OK.
