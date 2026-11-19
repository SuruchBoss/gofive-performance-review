import { useState } from 'react';
import { suggestedFor } from '../../domain/flags';
import { LEVEL_WORDS, showSuggestion, suggestionFor } from '../../domain/rating';
import { pct } from '../pages/manager/Review';
import { person } from '../../domain/selectors';
import { useStore } from '../../state/store';
import { Dialog } from '../components';

/**
 * HR sends a flagged review back to its manager with a question. For a team-level
 * flag HR picks which person's review to send back (the one furthest from results
 * is preselected). Release stays blocked until the manager answers.
 */
export function ReturnDialog({ flagKey, personIds, onClose }: { flagKey: string; personIds: string[]; onClose: () => void }) {
  const { state, dispatch, notify } = useStore();
  const reviews = personIds.map((id) => state.managerReviews.find((r) => r.personId === id)!).filter((r) => r.status === 'submitted');
  const furthest = [...reviews].sort((a, b) => Math.abs(b.overall! - suggestedFor(state, b)) - Math.abs(a.overall! - suggestedFor(state, a)))[0];
  const [personId, setPersonId] = useState(furthest?.personId ?? '');
  const [question, setQuestion] = useState('');
  const chosen = reviews.find((r) => r.personId === personId);
  const manager = chosen ? person(state, chosen.reviewerId) : undefined;
  const ready = !!chosen && question.trim().length > 0;

  return (
    <Dialog
      title="Return to manager"
      sub={manager ? `The review reopens for ${manager.name}. Release stays blocked until they answer, and every step is logged.` : 'No submitted review to return.'}
      onClose={onClose}
      footer={
        <>
          {!ready && <span className="foot-hint">Write your question to continue.</span>}
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!ready}
            onClick={() => {
              dispatch({ type: 'return_to_manager', personId, flagKey, question, actorId: 'hr' });
              notify(`Returned to ${manager!.name} with your question`);
              onClose();
            }}
          >
            Send back with question
          </button>
        </>
      }
    >
      {reviews.length > 1 && (
        <fieldset className="field choices">
          <legend className="label">Which review?</legend>
          {reviews.map((r) => (
            <label key={r.personId} className="choice">
              <input type="radio" name="return-person" checked={personId === r.personId} onChange={() => setPersonId(r.personId)} />
              <span>
                {person(state, r.personId).name}: rated {r.overall} ({LEVEL_WORDS[r.overall!]}), {pct(suggestionFor(state, r.personId).results)} of goal targets, which suggests {showSuggestion(suggestedFor(state, r))}
              </span>
            </label>
          ))}
        </fieldset>
      )}
      {reviews.length === 1 && chosen && (
        <p className="small">
          {person(state, chosen.personId).name}: rated {chosen.overall} ({LEVEL_WORDS[chosen.overall!]}), {pct(suggestionFor(state, chosen.personId).results)} of goal targets, which suggests {showSuggestion(suggestedFor(state, chosen))}.
        </p>
      )}
      <div className="field">
        <label htmlFor="return-question">Your question for {manager?.name ?? 'the manager'}</label>
        <span className="hint">They can change the rating, or keep it and answer. Either way the answer is logged.</span>
        <textarea id="return-question" className="textarea" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="For example: the renewal you mention falls after the review period. Is 5 still right?" />
      </div>
    </Dialog>
  );
}
