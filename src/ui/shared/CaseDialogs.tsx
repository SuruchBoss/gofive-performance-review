import { useState } from 'react';
import { addDays, formatDate } from '../../domain/dates';
import { effectiveDeadline } from '../../domain/deadlines';
import { person } from '../../domain/selectors';
import { useStore } from '../../state/store';
import { Dialog, Notice } from '../components';
import { eligibilityHint } from '../../domain/eligibility';

export function RemindDialog({ personId, onClose }: { personId: string; onClose: () => void }) {
  const { state, dispatch, notify } = useStore();
  const p = state.participants.find((x) => x.personId === personId)!;
  const reviewer = person(state, p.reviewerId);
  const who = person(state, personId);
  return (
    <Dialog
      title={`Remind ${reviewer.name}?`}
      sub={`About the review of ${who.name}.`}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={() => { dispatch({ type: 'remind', personId, actorId: 'hr' }); notify(`Reminder recorded for ${reviewer.name}`); onClose(); }}>
            Send reminder
          </button>
        </>
      }
    >
      <p className="small">
        {reviewer.name.split(' ')[0]} gets an in-app reminder that the review of {who.name} was due {formatDate(effectiveDeadline(state, p))}.
        {p.lastRemindedOn && <> Last reminded {formatDate(p.lastRemindedOn)}.</>}
      </p>
      <p className="xs muted">Prototype: no email is sent. The reminder is recorded in the activity log.</p>
    </Dialog>
  );
}

export function ExtendDialog({ personId, onClose }: { personId: string; onClose: () => void }) {
  const { state, dispatch, notify } = useStore();
  const p = state.participants.find((x) => x.personId === personId)!;
  const who = person(state, personId);
  const current = effectiveDeadline(state, p);
  const min = addDays(current > state.today ? current : state.today, 1);
  const [until, setUntil] = useState(addDays(state.today, 5) > min ? addDays(state.today, 5) : min);
  const [reason, setReason] = useState('');
  const valid = until >= min && reason.trim().length > 0;
  return (
    <Dialog
      title={`Extend the deadline for ${who.name}`}
      sub={`Current deadline ${formatDate(current)}. Applies to this person only.`}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!valid}
            onClick={() => { dispatch({ type: 'extend', personId, until, reason, actorId: 'hr' }); notify(`Deadline extended to ${formatDate(until)}`); onClose(); }}
          >
            Extend deadline
          </button>
        </>
      }
    >
      {p.escalatedOn && (
        <Notice tone="warning">This review has already escalated to {person(state, p.reviewerId).name}. Extending gives them more time; it does not move the review back.</Notice>
      )}
      <div className="field">
        <label htmlFor="ext-date">New deadline</label>
        <input id="ext-date" type="date" className="input" min={min} value={until} onChange={(e) => setUntil(e.target.value)} />
        {!p.escalatedOn && <span className="hint">If still open, it escalates 3 days after this date.</span>}
      </div>
      <div className="field">
        <label htmlFor="ext-reason">Reason</label>
        <textarea id="ext-reason" className="textarea" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="For example: manager on sick leave until 16 Dec." />
        <span className="hint">Recorded in the activity log.</span>
      </div>
    </Dialog>
  );
}

const PRESETS = ['Joined less than 3 months before the period end', 'On long leave during the review period'];

export function RemoveDialog({ personId, onClose }: { personId: string; onClose: () => void }) {
  const { state, dispatch, notify } = useStore();
  const who = person(state, personId);
  const recent = !!eligibilityHint(state, who);
  const [preset, setPreset] = useState<string>(recent ? PRESETS[0] : 'other');
  const [detail, setDetail] = useState(recent ? `Started ${formatDate(who.startDate)}.` : '');
  const reason = preset === 'other' ? detail.trim() : `${preset}. ${detail.trim()}`.trim();
  const valid = preset === 'other' ? detail.trim().length > 0 : true;
  return (
    <Dialog
      title={`Remove ${who.name} from the cycle?`}
      sub="They will not be reviewed this cycle and are left out of all counts and flags."
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!valid}
            onClick={() => { dispatch({ type: 'remove', personId, reason, actorId: 'hr' }); notify(`${who.name} removed from the cycle`); onClose(); }}
          >
            Remove from cycle
          </button>
        </>
      }
    >
      <fieldset className="field choices">
        <legend className="label">Reason</legend>
        {[...PRESETS, 'other'].map((p) => (
          <label key={p} className="choice">
            <input type="radio" name="remove-reason" checked={preset === p} onChange={() => setPreset(p)} />
            <span>{p === 'other' ? 'Other reason' : p}</span>
          </label>
        ))}
      </fieldset>
      <div className="field">
        <label htmlFor="remove-detail">{preset === 'other' ? 'Describe the reason' : 'Details (optional)'}</label>
        <textarea id="remove-detail" className="textarea" value={detail} onChange={(e) => setDetail(e.target.value)} />
        <span className="hint">Recorded in the activity log.</span>
      </div>
    </Dialog>
  );
}
