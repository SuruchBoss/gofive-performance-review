import { useState } from 'react';
import { useStore } from '../../state/store';
import { Dialog } from '../components';

/**
 * Demo shortcut, clearly marked as not part of the product. It replays the
 * remaining steps as the people who would do them, under the normal rules.
 */
export function DemoShortcut({ compact }: { compact?: boolean }) {
  const { state, dispatch, notify } = useStore();
  const [confirm, setConfirm] = useState(false);
  if (state.cycle.status !== 'open') return null;
  return (
    <div className={`demo-box${compact ? ' compact' : ''}`}>
      <div className="demo-box-tag">Demo only, not part of the product</div>
      {!compact && (
        <p className="small">
          To see a released result without playing HR and every manager, let the demo do the remaining steps. The normal rules still apply, and each step is logged.
        </p>
      )}
      <button type="button" className="btn btn-sm" onClick={() => setConfirm(true)}>Demo shortcut: skip to released results</button>
      {confirm && (
        <Dialog
          title="Skip to released results?"
          sub="The demo finishes what is left, as the people who would do it: it removes the new joiner with a reason, completes open reviews with placeholder text, accepts managers' answers, runs calibration with every manager without changing any rating, locks it with notes that say it was the demo, and releases."
          onClose={() => setConfirm(false)}
          footer={
            <>
              <button type="button" className="btn" onClick={() => setConfirm(false)}>Cancel</button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  dispatch({ type: 'demo_skip_to_release' });
                  setConfirm(false);
                  notify('Demo shortcut used: results released. Every step is in HR → Activity.');
                }}
              >
                Skip to released results
              </button>
            </>
          }
        >
          <p className="small muted">Nothing skips a rule: the release gate is the same as for HR. Demo ▾ → Reset demo starts again.</p>
        </Dialog>
      )}
    </div>
  );
}
