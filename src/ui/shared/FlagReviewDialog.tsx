import { useState } from 'react';
import { useStore } from '../../state/store';
import { Dialog } from '../components';

export function FlagReviewDialog({ flagKey, label, context, onClose }: { flagKey: string; label: string; context: string; onClose: () => void }) {
  const { dispatch, notify } = useStore();
  const [note, setNote] = useState('');
  return (
    <Dialog
      title="Mark as checked"
      sub={context}
      onClose={onClose}
      footer={
        <>
          {!note.trim() && <span className="foot-hint">Write a short note to continue.</span>}
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!note.trim()}
            onClick={() => {
              dispatch({ type: 'review_flag', flagKey, note, actorId: 'hr', label });
              notify('Marked as checked');
              onClose();
            }}
          >
            Mark as checked
          </button>
        </>
      }
    >
      <div className="field">
        <label htmlFor="flag-note">What did you check, and what was the outcome?</label>
        <span className="hint">Saved in the activity log. Marking it as checked does not change any rating.</span>
        <textarea id="flag-note" className="textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="For example: talked to the manager; the reason holds because…" />
      </div>
    </Dialog>
  );
}
