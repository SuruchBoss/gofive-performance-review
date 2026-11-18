/**
 * Every threshold used by the rules. Change values here only.
 * See docs/DESIGN.md section 4.
 */
export const CONFIG = {
  /** A rating this far (or further) from the suggestion needs a reason and raises a flag. */
  FAR_FROM_SUGGESTION: 1.0,
  /** A manager whose team average differs from the suggested average by this much is flagged. */
  MANAGER_GAP_FLAG: 0.75,
  /** Minimum submitted reviews before the manager gap is assessed. */
  MIN_REVIEWS_FOR_GAP: 3,
  /** Calendar days after the effective deadline before a review escalates. */
  ESCALATION_DAYS: 3,
  /** People who joined within this many months of the period end get an eligibility hint. */
  ELIGIBILITY_MIN_MONTHS: 3,
  /** Minimum length of the evidence text for an overall rating of 1, 2 or 5. */
  EVIDENCE_MIN_CHARS: 40,
  /** Goal achievement is clamped to this range. */
  ACHIEVEMENT_MIN: 0,
  ACHIEVEMENT_MAX: 1.5,
  /** Ratings that need written evidence. */
  EVIDENCE_RATINGS: [1, 2, 5] as const,
} as const;
