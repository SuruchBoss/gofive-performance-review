/*
 * Coachmarks: one full HR guide run with tips on, then the Manager and Employee
 * guides, at 320, 375, 412 and 1366 px.
 * At every tip it checks that the highlight sits on the named control, the note is
 * fully on screen, and nothing covers the prototype top bar. It also checks the
 * keyboard (Tab, Esc, focus return), Skip and "Show tips again".
 *
 * Run: npm run build && npm run e2e:tips
 */
const { spawn } = require('node:child_process');
const { chromium } = require('playwright');

const PORT = 4181;
const BASE = process.env.LIVE || `http://localhost:${PORT}/`;
const WIDTHS = [320, 375, 412, 1366];

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function run(width) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width, height: width > 900 ? 900 : 780 } });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  const card = page.locator('.coach-card');
  const target = (name) => page.locator(`[data-tour="${name}"]:visible`).first();
  let checked = 0;

  /** Wait for the tip that points at `name`, then check highlight, note and top bar. */
  const tip = async (name, label) => {
    const read = () => page.evaluate((n) => {
      const c = document.querySelector('.coach-card');
      const hole = document.querySelector('[data-coach-hole]');
      const el = [...document.querySelectorAll(`[data-tour="${n}"]`)].find((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
      if (!c || !hole || !el) return { missing: !c ? 'card' : !hole ? 'highlight' : 'target' };
      const box = (r) => ({ top: r.top, left: r.left, right: r.right, bottom: r.bottom });
      const strip = document.querySelector('.demo-strip').getBoundingClientRect();
      return { card: box(c.getBoundingClientRect()), hole: box(hole.getBoundingClientRect()), el: box(el.getBoundingClientRect()), dimTop: document.querySelector('.coach-dim').getBoundingClientRect().top, stripBottom: Math.max(0, strip.bottom), vw: document.documentElement.clientWidth, vh: window.innerHeight };
    }, name);
    const problem = (g) => {
      if (g.missing) return `no ${g.missing}`;
      const pad = 6, tol = 2;
      if (Math.abs(g.hole.left - (g.el.left - pad)) > tol || Math.abs(g.hole.top - (g.el.top - pad)) > tol || Math.abs(g.hole.right - (g.el.right + pad)) > tol || Math.abs(g.hole.bottom - (g.el.bottom + pad)) > tol) return 'highlight is not on the target';
      if (g.el.bottom <= g.stripBottom || g.el.top >= g.vh) return 'target is off screen';
      if (g.card.left < 15.5 || g.card.right > g.vw - 15.5) return `note is not inside the side gutters (${g.card.left}–${g.card.right} of ${g.vw})`;
      if (g.card.top < g.stripBottom || g.card.bottom > g.vh) return `note is not fully on screen (${g.card.top}–${g.card.bottom}, bar ${g.stripBottom}, height ${g.vh})`;
      if (g.dimTop < g.stripBottom - 1) return 'the dim covers the top bar';
      const overlap = g.card.left < g.el.right && g.card.right > g.el.left && g.card.top < g.el.bottom && g.card.bottom > g.el.top;
      if (overlap) return 'note covers the target';
      return '';
    };
    let last = 'not shown';
    for (let i = 0; i < 40; i++) {
      last = problem(await read());
      if (!last) { checked += 1; return; }
      await page.waitForTimeout(150);
    }
    throw new Error(`${label} [${name}]: ${last}`);
  };
  const noTip = async (label) => { await page.waitForTimeout(700); assert((await card.count()) === 0, `${label}: a tip is showing`); };
  const next = () => card.getByRole('button', { name: 'Next' }).click();
  const follow = async (label) => { await tip('guide-link', label); await target('guide-link').click(); };
  const rate = async () => {
    for (const name of ['Quality of work', 'Ownership', 'Collaboration', 'Customer focus']) {
      const g = page.getByRole('radiogroup', { name });
      if (!(await g.getByRole('radio', { checked: true }).count())) await g.getByRole('radio', { name: '3' }).click();
    }
  };
  const confirm = (name) => page.locator('.dialog').getByRole('button', { name }).click();

  await page.goto(BASE);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  assert((await card.count()) === 0, 'start page: no tip expected');
  await page.getByRole('button', { name: /Try as HR/ }).click();

  // First tip: points at the guide's link to step 1. Keyboard: focus, Tab, Esc.
  await tip('guide-link', 'HR 1, off the step screen');
  assert((await card.innerText()).includes('Step 1 of 5'), 'step counter missing');
  assert(await page.evaluate(() => document.activeElement === document.querySelector('.coach-card')), 'focus did not move to the tip');
  await page.keyboard.press('Tab');
  assert((await page.evaluate(() => document.activeElement.textContent)) === 'Skip', 'Tab did not reach Skip');
  await page.keyboard.press('Tab');
  assert(['Next', 'Done'].includes(await page.evaluate(() => document.activeElement.textContent)), 'Tab did not reach Next');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  assert((await card.count()) === 0, 'Esc did not close the tip');
  assert(await page.evaluate(() => !!document.activeElement && document.activeElement !== document.body && !!document.getElementById('main') && (document.activeElement.id === 'main' || document.getElementById('main').contains(document.activeElement))), 'focus did not return to the page');

  // Skip turns tips off for this guide and is remembered; "Show tips again" brings them back.
  const showAgain = async () => { await page.getByRole('button', { name: 'Demo', exact: true }).click(); await page.getByRole('button', { name: 'Show tips again' }).click(); };
  await showAgain();
  await tip('guide-link', 'after Show tips again');
  await card.getByRole('button', { name: 'Skip' }).click();
  await page.reload();
  await noTip('after Skip and reload');
  await showAgain();

  // Step 1: remove the new joiner. Using the highlighted control moves on; dialogs hide the tip.
  await follow('HR 1 link');
  await tip('remove-ineligible', 'HR 1 Progress');
  await target('remove-ineligible').click();
  await page.locator('.dialog').waitFor();
  assert((await card.count()) === 0, 'tip should hide while a dialog is open');
  await confirm('Remove from cycle');

  // Step 2: Tom reviews Orn. Three tips, walked with Next.
  await follow('HR 2 link');
  await tip('review-behaviour', 'HR 2 behaviours');
  assert((await card.innerText()).includes('tip 1 of 3'), 'tip counter missing');
  await rate();
  await next();
  await tip('review-overall', 'HR 2 overall');
  await page.getByRole('radiogroup', { name: 'Overall rating' }).getByRole('radio', { name: '3' }).click();
  await next();
  await tip('review-submit', 'HR 2 submit');
  assert(await card.getByRole('button', { name: 'Done' }).isVisible(), 'last tip should say Done');
  await target('review-submit').click();
  await confirm('Submit review');

  // Step 3: consistency. Mark reviewed, then Return to manager.
  await follow('HR 3 link');
  await tip('flag-mark', 'HR 3 flags');
  await next();
  await tip('return-e01', 'HR 3 return');
  await target('return-e01').click();
  await page.getByLabel(/Your question for/).fill('Is 5 right when results suggest 3.9?');
  await confirm('Send back with question');

  // Step 4: let a deadline slip.
  await follow('HR 4 link');
  await tip('guide-clock', 'HR 4 clock');
  // If the target is not on screen (here: the guide is hidden), the note is centred and says it in words.
  await page.locator('.intro-bar').getByRole('button', { name: 'Show all steps' }).click();
  await page.getByRole('button', { name: 'Hide guide' }).click();
  await page.waitForTimeout(800);
  const fb = await page.evaluate(() => {
    const c = document.querySelector('.coach-card');
    if (!c) return null;
    const r = c.getBoundingClientRect();
    return { text: c.textContent, hole: !!document.querySelector('[data-coach-hole]'), mid: Math.abs((r.left + r.right) / 2 - document.documentElement.clientWidth / 2), inside: r.top >= 0 && r.bottom <= window.innerHeight };
  });
  assert(fb && !fb.hole && fb.mid < 2 && fb.inside && fb.text.includes('Open Demo ▾ at the top'), `fallback note wrong: ${JSON.stringify(fb)}`);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Demo', exact: true }).click();
  await page.getByRole('button', { name: 'Show the guide' }).click();
  await page.getByRole('button', { name: 'Demo', exact: true }).click();
  await page.getByRole('button', { name: 'Show tips again' }).click();
  await tip('guide-clock', 'HR 4 clock, guide shown again');
  await target('guide-clock').click();
  await target('guide-clock').click();

  // Step 5: release. The tips follow the work across screens.
  await follow('HR 5 link');
  await tip('blocker', 'HR 5 checklist');
  await target('blocker').click(); // Nida, returned to Daniel
  await tip('review-answer', 'HR 5 answer');
  await page.getByLabel(/Answer to:/).fill('Kept 5: the August contract was the largest of the year.');
  await next();
  await tip('review-submit', 'HR 5 send answer');
  await target('review-submit').click();
  await confirm('Submit review');
  await follow('HR 5 back to Overview');
  await tip('blocker', 'HR 5 checklist again');
  await target('blocker').click(); // Ying, escalated to the Managing Director
  await tip('review-behaviour', 'HR 5 escalated review');
  await rate();
  await page.getByRole('radiogroup', { name: 'Overall rating' }).getByRole('radio', { name: '3' }).click();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Submit review' }).click();
  await confirm('Submit review');
  await follow('HR 5 back to Overview 2');
  await tip('blocker', 'HR 5 checklist, flags left');
  await target('blocker').click(); // Consistency
  await tip('accept-answer', 'HR 5 accept answer');
  await target('accept-answer').click();
  await tip('flag-mark', 'HR 5 remaining flags');
  while (await page.getByRole('button', { name: 'Mark reviewed' }).count()) {
    await page.getByRole('button', { name: 'Mark reviewed' }).first().click();
    await page.getByLabel('What did you check').fill('Discussed with the manager; reason accepted.');
    await confirm('Mark reviewed');
  }
  await follow('HR 5 back to Overview 3');
  await tip('release', 'HR 5 release');
  await target('release').click();
  await confirm('Release results');
  await page.getByText(/^Released \d/).waitFor();
  await noTip('guide complete');

  // ---- Manager guide: 3 steps ----
  const restart = async (name) => {
    await page.goto(BASE);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByRole('button', { name }).click();
  };
  await restart(/Try as Manager/);
  await follow('Manager 1 link');
  await tip('review-behaviour', 'Manager 1 behaviours');
  await rate();
  await next();
  await tip('review-overall', 'Manager 1 overall');
  await page.getByRole('radiogroup', { name: 'Overall rating' }).getByRole('radio', { name: '3' }).click();
  await next();
  await tip('review-submit', 'Manager 1 submit');
  await target('review-submit').click();
  await confirm('Submit review');
  // Submitting returns to My team, which is already the screen for step 2.
  await tip('guide-clock', 'Manager 2 clock');
  await target('guide-clock').click();
  await target('guide-clock').click();
  await follow('Manager 3 link');
  await tip('return-e01', 'Manager 3 return');
  await target('return-e01').click();
  await page.getByLabel(/Your question for/).fill('Is 5 right when results suggest 3.9?');
  await confirm('Send back with question');
  await tip('open-returned', 'Manager 3 waiting');
  await target('open-returned').click();
  await tip('review-answer', 'Manager 3 answer');
  await page.evaluate(() => { window.location.hash = '/manager'; });
  await tip('answer-hr', 'Manager 3 Answer HR on the team list');
  await target('answer-hr').click();
  await tip('review-answer', 'Manager 3 answer again');
  await page.getByLabel(/Answer to:/).fill('Kept 5: the August contract was the largest of the year.');
  await next();
  await tip('review-submit', 'Manager 3 send');
  await target('review-submit').click();
  await confirm('Submit review');
  await noTip('manager guide complete');

  // ---- Employee guide: 3 steps ----
  await restart(/Try as Employee/);
  await tip('self-text', 'Employee 1 text');
  await page.getByLabel('What did you achieve').fill('Covered the night shift during the carrier change.');
  await next();
  await tip('self-rating', 'Employee 1 rating');
  await page.getByRole('radiogroup', { name: 'Your own rating' }).getByRole('radio', { name: '3' }).click();
  await next();
  await tip('self-submit', 'Employee 1 submit');
  await target('self-submit').click();
  await confirm('Submit self-review');
  await follow('Employee 2 link');
  await tip('result-locked', 'Employee 2 and 3 locked result');
  await next();
  await tip('demo-shortcut', 'Employee 3 shortcut');
  await target('demo-shortcut').click();
  await confirm('Skip to released results');
  await page.getByText("Manager's assessment").waitFor();
  await noTip('employee guide complete');

  const w = await page.evaluate(() => document.documentElement.scrollWidth);
  assert(w <= width, `page is ${w}px wide at ${width}px`);
  await browser.close();
  assert(errors.length === 0, `console errors: ${errors.join(' | ')}`);
  return checked;
}

(async () => {
  const server = process.env.LIVE ? null : spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
  if (server) await new Promise((r) => setTimeout(r, 2500));
  let failed = false;
  try {
    for (const width of WIDTHS) {
      try {
        const n = await run(width);
        console.log(`PASS ${width}px: HR, Manager and Employee guides with tips, ${n} tips checked (highlight on target, note on screen, top bar clear), keyboard and Skip / Show tips again OK`);
      } catch (e) {
        failed = true;
        console.log(`FAIL ${width}px: ${e.message.split('\n')[0]}`);
      }
    }
  } finally {
    if (server) server.kill();
  }
  process.exit(failed ? 1 : 0);
})();
