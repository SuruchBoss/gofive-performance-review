import { useState } from 'react';
import { formatDate } from '../../domain/dates';
import type { DemoState } from '../../domain/types';
import { useStore, type Role, type ViewState } from '../../state/store';
import { useAdvanceDay } from '../DemoStrip';
import { go } from '../../state/router';
import { IconCheck, IconClose } from '../icons';

interface Link {
  /** Who the link acts as, shown on the step and used in "Switch to …". */
  as: string;
  view: Partial<ViewState> & { role: Role };
  path: string;
  cta: string;
}

interface Step {
  title: string;
  body: string;
  done: (s: DemoState) => boolean;
  links: Link[];
  /** Step 4 moves the demo clock; it gets its own +1 day button. */
  clock?: boolean;
}

const HR = { as: 'HR · Pim Chaiyaporn', view: { role: 'hr' as const } };

const STEPS: Step[] = [
  {
    title: 'See who is late',
    body: 'HR → Progress. Three reviews are overdue. One is for Fah, who joined in October and should not be in this cycle: remove Fah with a reason.',
    done: (s) => !!s.participants.find((p) => p.personId === 'e08')?.removed,
    links: [{ ...HR, path: '/hr/progress', cta: 'Open Progress' }],
  },
  {
    title: 'Review as a manager',
    body: "Tom finishes Orn's review. Results suggest a 3; try a 5 to see the reason and evidence rules.",
    done: (s) => s.managerReviews.find((r) => r.personId === 'e11')?.status === 'submitted',
    links: [{ as: 'Manager · Tom Wattana', view: { role: 'manager', managerId: 'm-ops' }, path: '/manager/review/e11', cta: "Open Orn's review" }],
  },
  {
    title: 'Check consistency',
    body: 'HR → Consistency. Sales rates above its own results, Support below. Mark a flag reviewed.',
    done: (s) => s.flagReviews.length > 0,
    links: [{ ...HR, path: '/hr/consistency', cta: 'Open Consistency' }],
  },
  {
    title: 'Let a deadline slip',
    body: "Move the demo date on by two days. Ying's open review moves to Anong Rattanakul, the Managing Director, and the log records it.",
    done: (s) => s.log.some((l) => l.type === 'escalation'),
    clock: true,
    links: [{ ...HR, path: '/hr/activity', cta: 'Open Activity log' }],
  },
  {
    title: 'Release results',
    body: "Clear what the Cycle overview lists and release. Then see a result the way an employee does.",
    done: (s) => s.cycle.status === 'released',
    links: [
      { ...HR, path: '/hr', cta: 'Open Cycle overview' },
      { as: 'Employee · Nida Phrom', view: { role: 'employee', employeeId: 'e01' }, path: '/me/result', cta: "See Nida's result" },
    ],
  },
];

export function Intro() {
  const { state, view, setView } = useStore();
  const advanceDay = useAdvanceDay();
  const [allSteps, setAllSteps] = useState(false);
  const roleName = { hr: 'HR', manager: 'Manager', employee: 'Employee' } as const;
  const isCurrent = (l: Link) =>
    l.view.role === view.role &&
    (l.view.role !== 'manager' || l.view.managerId === view.managerId) &&
    (l.view.role !== 'employee' || l.view.employeeId === view.employeeId);
  const label = (l: Link) => (isCurrent(l) ? l.cta : `Switch to ${l.as.split(' · ')[0] === 'HR' ? 'HR' : l.as.replace(' · ', ' ')} and ${l.cta[0].toLowerCase()}${l.cta.slice(1)}`);
  if (view.introHidden) return null;
  const doneCount = STEPS.filter((s) => s.done(state)).length;
  const next = STEPS.findIndex((s) => !s.done(state));

  return (
    <section className="intro" aria-labelledby="intro-title">
      <div className="intro-head">
        <div>
          <div className="intro-kicker">Prototype · a concept for empeo</div>
          <h2 id="intro-title">Annual performance review, one cycle end to end</h2>
          <p className="intro-problem">
            <strong>The problem:</strong> every manager rates on their own scale, so a 4 in one team is not a 4 in another. This shows
            how HR catches that before results reach employees.
          </p>
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
                <span className="intro-as">As {s.links.map((l) => l.as).join(', then ')}</span>
                {!done && s.links[0].view.role !== view.role && (
                  <span className="intro-elsewhere">
                    This step is for {roleName[s.links[0].view.role]}. You are viewing as {roleName[view.role]}: the link below switches for you.
                  </span>
                )}
                <span className="small">{s.body}</span>
                {s.clock && (
                  <button type="button" className="btn btn-sm intro-clock" onClick={advanceDay}>+1 day <span className="muted">(now {formatDate(state.today, true)})</span></button>
                )}
                {s.links.map((l) => (
                  <button key={l.path} type="button" className="link-btn" onClick={() => { setView(l.view); go(l.path); }}>
                    {label(l)}{'\u00a0'}→
                  </button>
                ))}
              </div>
            </li>
          );
        })}
      </ol>
      <button type="button" className="link-btn intro-more" onClick={() => setAllSteps((v) => !v)}>
        {allSteps ? 'Show only the next step' : `Show all ${STEPS.length} steps`}
      </button>
      <div className="intro-foot small muted">
        {doneCount} of {STEPS.length} done. You are viewing as <strong>{roleName[view.role]}</strong>; each step's link switches role for you. <strong>Reset demo</strong> starts again.
      </div>
    </section>
  );
}
