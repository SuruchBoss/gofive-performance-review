import { IS_Q2_BUILD } from '../build';
import { useStore, type Role, type ViewState } from '../state/store';
import { go } from '../state/router';
import { IconMark } from './icons';

const REPO = 'https://github.com/SuruchBoss/gofive-performance-review';

/** Each choice opens that person's own home, which lists what they have to do now. */
const TRY: { role: Role; label: string; sub: string; view: Partial<ViewState>; path: string }[] = [
  { role: 'hr', label: 'HR', sub: 'Run the yearly review and catch ratings that do not match results', view: {}, path: '/hr' },
  { role: 'manager', label: 'Manager', sub: 'Write your team’s reviews as Tom Wattana', view: { managerId: 'm-ops' }, path: '/manager' },
  { role: 'employee', label: 'Employee', sub: 'Write your self-review as Ying Chen', view: { employeeId: 'e12' }, path: '/me' },
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
          Managers rate in different ways, so the same rating can mean different things in different teams. This helps HR catch that
          before people see their results.
        </p>
        {IS_Q2_BUILD && (
          <p className="landing-variant">
            This version adds one step, calibration: managers meet and agree final ratings across teams. No one sees a result before
            that is done.
          </p>
        )}
        <div className="landing-try" role="group" aria-label="Try the demo">
          {TRY.map((t, i) => (
            <button
              key={t.role}
              type="button"
              className={`landing-option${i === 0 ? ' first' : ''}`}
              onClick={() => {
                setView({ ...t.view, role: t.role });
                go(t.path);
              }}
            >
              <span className="landing-option-title">Try as {t.label}</span>
              <span className="landing-option-sub">{t.sub}</span>
              {i === 0 && <span className="landing-option-start">Start here to see a full review cycle.</span>}
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
