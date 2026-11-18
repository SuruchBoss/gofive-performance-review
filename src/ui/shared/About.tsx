import { Dialog } from '../components';

const REPO = 'https://github.com/SuruchBoss/gofive-performance-review';

/** "About this prototype": how it was built. Facts come from the git history and WORKLOG.md. */
export function AboutDialog({ onClose }: { onClose: () => void }) {
  return (
    <Dialog
      title="About this prototype"
      sub="A concept for empeo, built for a Product Owner take-home exam. Demo data only."
      onClose={onClose}
      footer={<button type="button" className="btn btn-primary" onClick={onClose}>Close</button>}
    >
      <div className="stack-sm small">
        <p>
          The Product Owner made the product decisions. An AI coding agent (Claude Code) worked as the developer: it asked questions,
          proposed options and wrote the code.
        </p>
        <p className="strong">How it was built (18 Nov 2026, from the git history)</p>
        <ol className="about-steps">
          <li><strong>Questions</strong>: five open questions, answered by the PO.</li>
          <li><strong>Design</strong>: written up, approved by the PO with one change.</li>
          <li><strong>Plan</strong>: 17 commits, approved with two changes.</li>
          <li><strong>Build</strong>: one concern per commit, each with tests and a desktop and phone check.</li>
          <li><strong>Test</strong>: 97 unit tests (rules and demo data), and a browser click-through of every role at desktop and phone width.</li>
        </ol>
        <p>49 minutes from the first commit to the deploy workflow, including the PO's answer times.</p>
        <p>
          <strong>PO decided</strong> the scope, the fairness rules, the thresholds and the look. <strong>The AI proposed</strong> the
          stack, the formulas, the demo data and the visual details, for the PO to approve.
        </p>
        <div className="about-cal">
          <div className="strong">Requirement change from question 2</div>
          <p>A second build adds cross-team calibration before results are released, as asked in exam question 2. It is kept separate from this version.</p>
          <a href="./calibration/" className="btn btn-sm">Open the calibration build →</a>
        </div>
        <p>
          <a href={`${REPO}#how-this-was-built`} target="_blank" rel="noreferrer">How this was built</a> ·{' '}
          <a href={`${REPO}/blob/main/WORKLOG.md`} target="_blank" rel="noreferrer">Full work log</a> ·{' '}
          <a href={`${REPO}/blob/main/docs/DESIGN.md`} target="_blank" rel="noreferrer">Design</a>
        </p>
      </div>
    </Dialog>
  );
}
