import { useState } from 'react';
import { formatDate } from '../../domain/dates';
import type { DemoState } from '../../domain/types';
import { useStore, type Role, type ViewState } from '../../state/store';
import { useAdvanceDay } from '../DemoStrip';
import { go, useHashPath } from '../../state/router';
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
  done: (s: DemoState, v: ViewState) => boolean;
  links: Link[];
  /** Step 4 moves the demo clock; it gets its own +1 day button. */
  clock?: boolean;
}

const HR = { as: 'HR · Pim Chaiyaporn', view: { role: 'hr' as const } };

const HR_STEPS: Step[] = [
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
    body: 'HR → Consistency. Sales rates above its own results, Support below. Mark a flag reviewed, or return it to the manager with a question.',
    done: (s) => s.flagReviews.length > 0 || s.managerReviews.some((r) => r.returns?.length),
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
    title: 'Calibrate, then release',
    body: 'Once every review is in, run Calibration across teams: agree each case, lock it and release. Then see a result the way an employee does.',
    done: (s) => s.cycle.status === 'released',
    links: [
      { ...HR, path: '/hr/calibration', cta: 'Open Calibration' },
      { as: 'Employee · Nida Phrom', view: { role: 'employee', employeeId: 'e01' }, path: '/me/result', cta: "See Nida's result" },
    ],
  },
];

const TOM = { as: 'Manager · Tom Wattana', view: { role: 'manager' as const, managerId: 'm-ops' } };

const MANAGER_STEPS: Step[] = [
  {
    title: "Finish Orn's review",
    body: 'Goal results suggest about a 3. Rate the four behaviours, then pick an overall rating; try a 5 to see when a reason and an example are needed.',
    done: (s) => s.managerReviews.find((r) => r.personId === 'e11')?.status === 'submitted',
    links: [{ ...TOM, path: '/manager/review/e11', cta: "Open Orn's review" }],
  },
  {
    title: 'Watch a deadline slip',
    body: "Ying's review is overdue. Move the date on two days and it moves to your own manager, Anong Rattanakul.",
    done: (s) => s.log.some((l) => l.type === 'escalation' && l.targetId === 'e12') || s.managerReviews.find((r) => r.personId === 'e12')?.status === 'submitted',
    clock: true,
    links: [{ ...TOM, path: '/manager', cta: 'Open My team' }],
  },
  {
    title: 'Answer a question from HR',
    body: "HR can send a review back with a question. As HR, use \u201cReturn to manager\u201d on Nida's flag, then answer it as her manager, Daniel Reyes.",
    done: (s) => s.managerReviews.some((r) => r.returns?.some((x) => x.answeredOn)),
    links: [
      { as: 'HR · Pim Chaiyaporn', view: { role: 'hr' }, path: '/hr/consistency', cta: 'Open Consistency' },
      { as: 'Manager · Daniel Reyes', view: { role: 'manager', managerId: 'm-sales' }, path: '/manager', cta: "Open Daniel's team" },
    ],
  },
];

const YING = { as: 'Employee · Ying Chen', view: { role: 'employee' as const, employeeId: 'e12' } };

const EMPLOYEE_STEPS: Step[] = [
  {
    title: 'Write your self-review',
    body: 'The deadline has passed, but you can still submit until your manager finishes your review. It will be marked late.',
    done: (s) => s.selfReviews.find((r) => r.personId === 'e12')?.status === 'submitted',
    links: [{ ...YING, path: '/me/self-review', cta: 'Open Self-review' }],
  },
  {
    title: 'See why your result is locked',
    body: 'Results open for everyone at once, after every review is in and HR has checked them for consistency.',
    done: (_s, v) => !!v.seen?.includes('/me/result'),
    links: [{ ...YING, path: '/me/result', cta: 'Open My result' }],
  },
  {
    title: 'See a released result',
    body: 'HR has to release results first. Follow the HR guide to the end, then open a result as an employee.',
    done: (s) => s.cycle.status === 'released',
    links: [
      { as: 'HR · Pim Chaiyaporn', view: { role: 'hr', track: 'hr' }, path: '/hr', cta: 'Switch to the HR guide' },
      { as: 'Employee · Nida Phrom', view: { role: 'employee', employeeId: 'e01' }, path: '/me/result', cta: "See Nida's result" },
    ],
  },
];

const STEPS_FOR: Record<Role, Step[]> = { hr: HR_STEPS, manager: MANAGER_STEPS, employee: EMPLOYEE_STEPS };


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
  const [expanded, setExpanded] = useState(false);
  const path = useHashPath();
  // Open the step's screen and scroll past the guide to it, so the result of the tap is visible.
  const openStep = (l: Link) => {
    setView(l.view);
    go(l.path);
    setTimeout(() => document.querySelector('.page-head')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
  };
  if (view.introHidden) return null;
  const track: Role = view.track ?? 'hr';
  const STEPS = STEPS_FOR[track];
  const doneCount = STEPS.filter((s) => s.done(state, view)).length;
  const next = STEPS.findIndex((s) => !s.done(state, view));
  const nextStep = next >= 0 ? STEPS[next] : undefined;

  // On a phone, when you are already on the step's screen, the full card would hide that
  // screen's form, so it shrinks to one line as well.
  const onStepScreen =
    !!nextStep && isCurrent(nextStep.links[0]) && path.split('?')[0] === nextStep.links[0].path.split('?')[0] &&
    window.matchMedia('(max-width: 640px)').matches;
  if (nextStep && onStepScreen && !expanded) {
    return (
      <section className="intro-bar" aria-label="Guide">
        <span className="small">
          <strong>Guide, step {next + 1} of {STEPS.length}:</strong> {nextStep.title}. You are on this screen: it starts below.
        </span>
        <span className="row" style={{ gap: 12 }}>
          <button type="button" className="link-btn muted-link" onClick={() => setExpanded(true)}>Show the guide</button>
        </span>
      </section>
    );
  }

  // In another role's view the full guide would push that person's own screen down,
  // so it shrinks to one line that says whose step is next and switches for you.
  if (nextStep && nextStep.links[0].view.role !== view.role && !expanded) {
    const l = nextStep.links[0];
    return (
      <section className="intro-bar" aria-label="Guide">
        <span className="small">
          <strong>Guide, step {next + 1} of {STEPS.length}:</strong> {nextStep.title}. In this step you play {roleName[l.view.role]}.
        </span>
        <span className="row" style={{ gap: 12 }}>
          <button type="button" className="link-btn" onClick={() => openStep(l)}>{label(l)}{'\u00a0'}→</button>
          <button type="button" className="link-btn muted-link" onClick={() => setExpanded(true)}>Show all steps</button>
        </span>
      </section>
    );
  }

  return (
    <section className="intro" aria-labelledby="intro-title">
      <div className="intro-head">
        <div>
          <div className="intro-kicker">Prototype · a concept for empeo · requirement change from question 2</div>
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
          const done = s.done(state, view);
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
                  <button key={l.path} type="button" className="link-btn" onClick={() => openStep(l)}>
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
      <div className="intro-tracks small" role="group" aria-label="Choose a guide">
        <span className="muted">Guide for:</span>
        {(['hr', 'manager', 'employee'] as Role[]).map((t) => (
          <button key={t} type="button" className="link-btn" aria-pressed={track === t} onClick={() => setView({ track: t })}>
            {roleName[t]}
          </button>
        ))}
      </div>
    </section>
  );
}
