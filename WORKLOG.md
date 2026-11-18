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
