import { useState } from 'react';
import { formatDate } from '../../domain/dates';
import type { DemoState } from '../../domain/types';
import { useStore, type ViewState } from '../../state/store';
import { go } from '../../state/router';
import { IconCheck, IconClose } from '../icons';

interface Step {
  title: string;
  body: string;
  done: (s: DemoState) => boolean;
  view: Partial<ViewState>;
  path: string;
  cta: string;
}

const STEPS: Step[] = [
  {
    title: 'See who is late',
    body: 'HR → Progress. Three reviews are overdue. One is for Fah, who joined in October and should not be in this cycle: remove Fah with a reason.',
    done: (s) => !!s.participants.find((p) => p.personId === 'e08')?.removed,
    view: { role: 'hr' },
    path: '/hr/progress',
    cta: 'Open Progress',
  },
  {
    title: 'Review as a manager',
    body: "Tom finishes Orn's review. Results suggest a 3; try a 5 to see the reason and evidence rules.",
    done: (s) => s.managerReviews.find((r) => r.personId === 'e11')?.status === 'submitted',
    view: { role: 'manager', managerId: 'm-ops' },
    path: '/manager/review/e11',
    cta: "Open Orn's review",
  },
  {
    title: 'Check consistency',
    body: 'HR → Consistency. Sales rates above its own results, Support below. Mark a flag reviewed.',
    done: (s) => s.flagReviews.length > 0,
    view: { role: 'hr' },
    path: '/hr/consistency',
    cta: 'Open Consistency',
  },
  {
    title: 'Let a deadline slip',
    body: "Press +1 day twice. Ying's open review moves to Anong Rattanakul, the Managing Director; the log records it.",
    done: (s) => s.log.some((l) => l.type === 'escalation'),
    view: { role: 'hr' },
    path: '/hr/activity',
    cta: 'Open Activity log',
  },
  {
    title: 'Release results',
    body: "Clear what the Cycle overview lists, release, then view as an Employee.",
    done: (s) => s.cycle.status === 'released',
    view: { role: 'hr' },
    path: '/hr',
    cta: 'Open Cycle overview',
  },
];

export function Intro() {
  const { state, view, setView } = useStore();
  const [allSteps, setAllSteps] = useState(false);
  if (view.introHidden) return null;
  const doneCount = STEPS.filter((s) => s.done(state)).length;
  const next = STEPS.findIndex((s) => !s.done(state));

  return (
    <section className="intro" aria-labelledby="intro-title">
      <div className="intro-head">
        <div>
          <div className="intro-kicker">Prototype · a concept for empeo</div>
          <h2 id="intro-title">Annual performance review, one cycle end to end</h2>
          <p>
            A clickable prototype for a fictional company, {state.company}, with HR, manager and employee views. Demo data only: nothing
            is saved outside this browser and no email is sent. The demo starts on {formatDate('2026-12-12')}, the day after manager
            reviews were due, so there is work waiting.
          </p>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setView({ introHidden: true })}>
          <IconClose size={14} /> Hide guide
        </button>
      </div>
      <ol className={`intro-steps${allSteps ? ' show-all' : ''}`}>
        {STEPS.map((s, i) => {
          const done = s.done(state);
          return (
            <li key={s.title} className={done ? 'done' : i === next ? 'next' : ''}>
              <span className="intro-num" aria-hidden="true">{done ? <IconCheck size={13} /> : i + 1}</span>
              <div className="stack-sm" style={{ gap: 4 }}>
                <span className="strong">{s.title}{done && <span className="sr-only"> (done)</span>}</span>
                <span className="small">{s.body}</span>
                <button type="button" className="link-btn" onClick={() => { setView(s.view); go(s.path); }}>{s.cta}{'\u00a0'}→</button>
              </div>
            </li>
          );
        })}
      </ol>
      <button type="button" className="link-btn intro-more" onClick={() => setAllSteps((v) => !v)}>
        {allSteps ? 'Show only the next step' : `Show all ${STEPS.length} steps`}
      </button>
      <div className="intro-foot small muted">
        {doneCount} of {STEPS.length} done. Switch between <strong>HR</strong>, <strong>Manager</strong> and <strong>Employee</strong> at the top at any time, and <strong>Reset demo</strong> to start again.
      </div>
    </section>
  );
}
