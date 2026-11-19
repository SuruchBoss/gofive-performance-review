/*
 * Browser click-through of the guided path for every role, at desktop and phone width.
 * Usage: npm run build && npm run e2e
 * Needs Playwright with Chromium available (`npx playwright install chromium` if not).
 * Screenshots go to screenshots/ (ignored by git).
 */
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const PORT = 4179;
const BASE = `http://localhost:${PORT}/`;
const OUT = path.join(__dirname, '..', 'screenshots');
const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'phone', width: 390, height: 844 },
];

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function run(vp) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  const checks = [];
  const shot = async (name) => {
    const w = await page.evaluate(() => document.documentElement.scrollWidth);
    assert(w <= vp.width, `${name}: page is ${w}px wide at ${vp.width}px`);
    await page.screenshot({ path: path.join(OUT, `${vp.name}-${name}.png`), fullPage: true });
    checks.push(name);
  };
  const open = async (hash) => {
    await page.evaluate((h) => { window.location.hash = h; }, hash);
    await page.waitForTimeout(150);
  };
  // Every prototype control sits behind one "Demo" menu.
  const demo = async () => {
    if (!(await page.locator('#demo-menu').count())) await page.getByRole('button', { name: 'Demo', exact: true }).click();
  };
  const closeDemo = async () => {
    if (await page.locator('#demo-menu').count()) await page.keyboard.press('Escape');
  };
  const viewAs = async (role, who) => {
    await demo();
    await page.getByRole('group', { name: 'View as role' }).getByRole('button', { name: role }).click();
    if (who) await page.getByLabel(role, { exact: true }).selectOption({ label: who });
    await closeDemo();
  };
  const rate = async (overall) => {
    for (const name of ['Quality of work', 'Ownership', 'Collaboration', 'Customer focus']) {
      const g = page.getByRole('radiogroup', { name });
      if (!(await g.getByRole('radio', { checked: true }).count())) await g.getByRole('radio', { name: '3' }).click();
    }
    await page.getByRole('radiogroup', { name: 'Overall rating' }).getByRole('radio', { name: String(overall) }).click();
  };
  const submitReview = async () => {
    await page.getByRole('button', { name: 'Submit review' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Submit review' }).click();
  };
  const markAllFlags = async () => {
    while (await page.getByRole('button', { name: 'Mark reviewed' }).count()) {
      await page.getByRole('button', { name: 'Mark reviewed' }).first().click();
      await page.getByLabel('What did you check').fill('Discussed with the manager; reason accepted.');
      await page.getByRole('dialog').getByRole('button', { name: 'Mark reviewed' }).click();
    }
  };

  await page.goto(BASE);
  await page.evaluate(() => {
    localStorage.clear();
    // Coachmark tips have their own test (e2e/coachmarks.cjs); this path runs with them off.
    for (const key of ['pr-demo:tips', 'pr-cal:tips']) localStorage.setItem(key, JSON.stringify({ hr: true, manager: true, employee: true }));
  });
  await page.reload();
  // Landing page: calm, no demo controls, one main action.
  assert(await page.getByRole('button', { name: /Try as HR/ }).isVisible(), 'landing: Try as HR missing');
  assert((await page.locator('.demo-strip').count()) === 0, 'landing: demo controls should not show');
  await shot('00-landing');
  await page.getByRole('button', { name: /Try as HR/ }).click();
  await page.getByText('Annual performance review, one cycle end to end').waitFor();
  await shot('01-hr-cycle-start');

  // Step 1: HR removes the new joiner.
  await open('/hr/progress');
  await shot('02-hr-progress');
  await page.locator('tr', { hasText: 'Fah Inthira' }).getByRole('button', { name: 'Remove from cycle' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Remove from cycle' }).click();
  await page.getByRole('tab', { name: /Everyone/ }).click();
  assert((await page.locator('tr', { hasText: 'Fah Inthira' }).innerText()).includes('Removed'), 'Fah not removed');

  // Step 2: Manager Tom reviews Orn; the reason and evidence rules block a 5.
  await viewAs('Manager', 'Tom Wattana · Operations');
  await shot('03-manager-team');
  await open('/manager/review/e11');
  await rate(5);
  assert(await page.getByLabel('Why does your rating differ from the goal results?').isVisible(), 'reason field missing');
  assert(await page.getByLabel('Specific example').isVisible(), 'evidence field missing');
  assert(await page.getByRole('button', { name: 'Submit review' }).isDisabled(), 'submit should be blocked');
  await shot('04-manager-review-far');
  await rate(3);
  await submitReview();
  await open('/manager/map');
  await shot('05-manager-team-map');

  // Step 3: HR reviews one flag.
  await viewAs('HR');
  await open('/hr/consistency');
  await shot('06-hr-consistency');
  const sales = page.locator('.panel', { hasText: 'Daniel Reyes' }).first();
  await sales.getByRole('button', { name: 'Mark reviewed' }).click();
  await page.getByLabel('What did you check').fill('Talked to Daniel; Q1 renewals explain part of the gap.');
  await page.getByRole('dialog').getByRole('button', { name: 'Mark reviewed' }).click();

  // Return Nida's rating to her manager with a question; Daniel answers and confirms.
  const nida = page.locator('.flag-row', { hasText: 'Nida Phrom' });
  await nida.getByRole('button', { name: 'Return to manager' }).click();
  await page.getByLabel(/Your question for/).fill('Is 5 right when results suggest 3.9?');
  await page.getByRole('dialog').getByRole('button', { name: 'Send back with question' }).click();
  assert(await page.getByText('Waiting for managers').isVisible(), 'returned review not listed');
  await page.getByRole('link', { name: 'Open as Daniel' }).click();
  await page.getByLabel(/Answer to:/).fill('Kept 5: the August contract was the largest of the year.');
  await page.getByRole('button', { name: 'Confirm and send answer' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Submit review' }).click();
  await viewAs('HR');
  await open('/hr/activity');
  assert((await page.locator('.log-item').allInnerTexts()).some((t) => t.includes('Manager answered HR')), 'answer not logged');
  // HR accepts the answer; until then release stays blocked.
  await open('/hr/consistency');
  assert(await page.getByText('Answers from managers', { exact: true }).isVisible(), 'answer not listed for HR');
  await page.locator('.flag-row', { hasText: 'Kept 5' }).getByRole('button', { name: 'Accept answer' }).click();
  await open('/hr/activity');
  assert((await page.locator('.log-item').allInnerTexts()).some((t) => t.includes('HR accepted the answer')), 'acceptance not logged');

  // Step 4: two days pass; Ying's review escalates.
  await demo();
  await page.getByRole('region', { name: 'Prototype controls' }).getByRole('button', { name: '+1 day' }).click();
  await page.getByRole('region', { name: 'Prototype controls' }).getByRole('button', { name: '+1 day' }).click();
  await closeDemo();
  await open('/hr/activity');
  await page.getByRole('tab', { name: 'Escalations' }).click();
  const esc = await page.locator('.log-item').allInnerTexts();
  assert(esc.length === 1 && esc[0].includes('Ying Chen') && esc[0].includes('Anong Rattanakul'), `unexpected escalations: ${esc}`);
  await shot('07-hr-activity');

  // Employee Ying can still submit a late self-review (manager has not finished).
  await viewAs('Employee', 'Ying Chen');
  await open('/me/self-review');
  await page.getByLabel('What did you achieve').fill('Covered the night shift during the carrier change.');
  await page.getByRole('radiogroup', { name: 'Your own rating' }).getByRole('radio', { name: '3' }).click();
  await page.getByRole('button', { name: 'Submit self-review' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Submit self-review' }).click();
  assert((await page.locator('.page-head .badge').innerText()).includes('late'), 'self-review not marked late');
  await shot('08-employee-self-review');
  await open('/me/result');
  assert(await page.getByText('Your result is not released yet').isVisible(), 'result should be locked');
  await shot('09-employee-result-locked');

  // Step 5: the head of company finishes the escalated review; HR clears flags and releases.
  await viewAs('Manager', 'Anong Rattanakul · Managing Director');
  await shot('10-head-assigned');
  await open('/manager/review/e12');
  await rate(3);
  await submitReview();
  await viewAs('HR');
  await open('/hr/consistency');
  await markAllFlags();
  await open('/hr/map');
  await shot('11-hr-map');
  await open('/hr/person/e05');
  await shot('12-hr-person');
  await open('/hr');
  assert(await page.getByRole('button', { name: 'Release results' }).isEnabled(), 'release should be enabled');
  await page.getByRole('button', { name: 'Release results' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Release results' }).click();
  assert(await page.getByText(/^Released \d/).isVisible(), 'not released');
  await shot('13-hr-released');

  // Employees now see their result and its sources.
  await viewAs('Employee', 'Nida Phrom');
  await open('/me/result');
  assert(await page.getByText('Manager\'s assessment').isVisible(), 'Nida result not visible');
  await shot('14-employee-result');
  await viewAs('Employee', 'Fah Inthira');
  await open('/me/result');
  assert(await page.getByText('You are not part of this review cycle').isVisible(), 'removed employee message missing');

  // Exit goes back to the landing page.
  await demo();
  await page.getByRole('button', { name: 'Exit demo' }).click();
  await page.getByRole('button', { name: /Try as HR/ }).waitFor({ timeout: 3000 }).catch(() => {});
  assert(await page.getByRole('button', { name: /Try as HR/ }).isVisible(), `exit did not return to the landing page (at ${page.url()})`);
  await page.getByRole('button', { name: /Try as HR/ }).click();

  // Reset restores the start.
  await demo();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Reset demo' }).click();
  assert((await page.locator('.demo-date').innerText()).includes('12 Dec 2026'), 'reset failed');

  // Employee path: the labelled demo shortcut reaches a released result under the normal rules.
  await viewAs('Employee', 'Ying Chen');
  await open('/me/result');
  assert(await page.getByText('Demo only, not part of the product').isVisible(), 'demo shortcut not labelled');
  await page.getByRole('button', { name: 'Demo shortcut: skip to released results' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Skip to released results' }).click();
  assert(await page.getByText("Manager's assessment").isVisible(), 'shortcut did not release a result');
  await shot('15-employee-shortcut-result');
  await viewAs('HR');
  await open('/hr/activity');
  assert((await page.locator('.log-item').allInnerTexts()).some((t) => t.includes('Demo shortcut used')), 'shortcut not logged');

  await browser.close();
  assert(errors.length === 0, `console errors: ${errors.join(' | ')}`);
  return checks.length;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 1500));
  let failed = false;
  try {
    for (const vp of VIEWPORTS) {
      try {
        const n = await run(vp);
        console.log(`PASS ${vp.name} (${vp.width}px): guided path complete, ${n} screens checked, no sideways scroll, no console errors`);
      } catch (e) {
        failed = true;
        console.log(`FAIL ${vp.name} (${vp.width}px): ${e.message}`);
      }
    }
  } finally {
    server.kill();
  }
  process.exit(failed ? 1 : 0);
})();
