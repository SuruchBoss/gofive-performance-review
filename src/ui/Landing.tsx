import { IS_Q2_BUILD } from '../build';
import { useStore } from '../state/store';
import { go } from '../state/router';
import { IconMark } from './icons';

const REPO = 'https://github.com/SuruchBoss/gofive-performance-review';

/** First screen: calm, no demo data, one main action. */
export function Landing() {
  const { setView } = useStore();
  return (
    <main className="landing">
      <div className="landing-inner">
        <div className="landing-brand">
          <span className="brand-mark landing-mark"><IconMark size={24} /></span>
          <h1>Performance Review</h1>
          <div className="landing-tags">
            <span className="concept-tag">Concept for empeo</span>
            {IS_Q2_BUILD && <span className="variant-tag static">Requirement change from question 2</span>}
          </div>
        </div>
        <p className="landing-problem">
          Managers rate on different scales, so the same rating can mean different things in different teams. This lets HR catch that
          before results reach employees.
        </p>
        {IS_Q2_BUILD && (
          <p className="landing-variant">
            This version adds one step: managers calibrate ratings together across teams, and no one sees a result until calibration is
            locked.
          </p>
        )}
        <button
          type="button"
          className="btn btn-primary landing-cta"
          onClick={() => {
            setView({ role: 'hr', introHidden: false });
            go('/hr');
          }}
        >
          Open demo
        </button>
        <p className="landing-note">Fictional company and people. Nothing is sent anywhere.</p>
        <nav className="landing-links" aria-label="More">
          {IS_Q2_BUILD ? <a href="../">Main version</a> : <a href="./calibration/">Calibration version (question 2)</a>}
          <span aria-hidden="true">·</span>
          <a href={`${REPO}#how-this-was-built`} target="_blank" rel="noreferrer">How this was built</a>
        </nav>
      </div>
    </main>
  );
}
