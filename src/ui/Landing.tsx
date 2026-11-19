import { IS_Q2_BUILD } from '../build';
import { useStore, type Role, type ViewState } from '../state/store';
import { go } from '../state/router';
import { IconMark } from './icons';

const REPO = 'https://github.com/SuruchBoss/gofive-performance-review';

/** Each choice opens the demo in that role, with the guide written for it. */
const TRY: { role: Role; label: string; sub: string; view: Partial<ViewState>; path: string }[] = [
  { role: 'hr', label: 'HR', sub: 'Run the review cycle and catch ratings that do not match results', view: {}, path: '/hr' },
  { role: 'manager', label: 'Manager', sub: 'Review your team as Tom Wattana, Operations Manager', view: { managerId: 'm-ops' }, path: '/manager' },
  { role: 'employee', label: 'Employee', sub: 'Write your self-review and see your result as Ying Chen', view: { employeeId: 'e12' }, path: '/me/self-review' },
];

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
        <div className="landing-try" role="group" aria-label="Try the demo">
          {TRY.map((t, i) => (
            <button
              key={t.role}
              type="button"
              className={`landing-option${i === 0 ? ' first' : ''}`}
              onClick={() => {
                setView({ ...t.view, role: t.role, track: t.role, introHidden: false });
                go(t.path);
              }}
            >
              <span className="landing-option-title">Try as {t.label}</span>
              <span className="landing-option-sub">{t.sub}</span>
            </button>
          ))}
        </div>
        <p className="landing-note">Fictional company and people. Nothing is sent anywhere.</p>
        <nav className="landing-links" aria-label="More">
          {IS_Q2_BUILD ? <a href="../">See the version without calibration</a> : <a href="./calibration/">See the requirement change: calibration before release</a>}
          <span className="landing-sep" aria-hidden="true">·</span>
          <a href={`${REPO}#how-this-was-built`} target="_blank" rel="noreferrer">How this was built</a>
        </nav>
      </div>
    </main>
  );
}
