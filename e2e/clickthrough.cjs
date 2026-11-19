/*
 * Browser click-through of one full review cycle, every role, at desktop and phone width.
 * There is no guide: each step starts from that person's own home.
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
  // The one place to switch person: the "You are" list in the demo bar.
  const become = async (name) => {
    const value = await page.getByLabel('You are').evaluate((el, n) => [...el.options].find((o) => o.textContent.startsWith(n)).value, name);
    await page.getByLabel('You are').selectOption(value);
    await page.waitForTimeout(150);
  };
  const more = async (item) => {
    await page.getByRole('button', { name: /^More/ }).click();
    await page.locator('#demo-menu').getByRole('button', { name: item }).click();
  };
  // "Where do I start?": the first thing to do must be on the first screen, without scrolling.
  const startsOnFirstScreen = async (locator, label) => {
    await page.evaluate(() => window.scrollTo(0, 0));
    const box = await locator.first().boundingBox();
    assert(box && box.y + box.height <= vp.height, `${label}: the first thing to do is not on the first screen (${box ? Math.round(box.y + box.height) : 'missing'} of ${vp.height})`);
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
  const checkAllRatings = async () => {
    while (await page.getByRole('button', { name: 'Mark as checked' }).count()) {
      await page.getByRole('button', { name: 'Mark as checked' }).first().click();
      await page.getByLabel('What did you check').fill('Discussed with the manager; reason accepted.');
      await page.getByRole('dialog').getByRole('button', { name: 'Mark as checked' }).click();
    }
  };

  await page.goto(BASE);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  // Start page: calm, no demo bar, HR is the clear first choice.
  assert(await page.getByRole('button', { name: /Try as HR/ }).isVisible(), 'start page: Try as HR missing');
  assert(await page.getByText('Requirement change from question 2').isVisible(), 'start page: build label missing');
  assert(await page.getByText('Start here to see a full review cycle.').isVisible(), 'start page: "Start here" line missing');
  assert((await page.locator('.demo-strip').count()) === 0, 'start page: demo bar should not show');
  await startsOnFirstScreen(page.getByRole('button', { name: /Try as HR/ }), 'start page');
  await shot('00-start');
  await page.getByRole('button', { name: /Try as HR/ }).click();

  // HR home: what needs attention now. No guide, no tips.
  await page.getByRole('heading', { name: 'Needs your attention' }).waitFor();
  assert((await page.locator('.intro, .intro-bar, .coach-card').count()) === 0, 'the guide and tips should be gone');
  await startsOnFirstScreen(page.getByRole('button', { name: 'Leave Fah out' }), 'HR home');
  assert(await page.getByRole('button', { name: /Release results/ }).isDisabled(), 'release should be locked at the start');
  // Both late reviews are Tom's: one reminder button, not two.
  assert((await page.getByRole('button', { name: /^Remind/ }).count()) === 1 && await page.getByRole('button', { name: 'Remind Tom (2 reviews)' }).isVisible(), 'late reviews should be one reminder per manager');
  await shot('01-hr-home');

  // Eligibility: HR confirms the system's suggestion to leave the new joiner out.
  await page.getByRole('button', { name: 'Leave Fah out' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Leave out of this review' }).click();
  assert((await page.getByRole('button', { name: 'Leave Fah out' }).count()) === 0, 'Fah should be left out');
  await open('/hr/progress');
  await page.getByRole('tab', { name: /Everyone/ }).click();
  assert((await page.locator('tr', { hasText: 'Fah Inthira' }).innerText()).includes('Left out'), 'Fah not marked as left out');
  await shot('02-hr-people');

  // Manager home: a to-do list. A row opens the review; the back button returns.
  await become('Tom Wattana');
  await page.getByRole('heading', { name: '2 reviews to write' }).waitFor();
  await startsOnFirstScreen(page.locator('.task-row'), 'manager home');
  await shot('03-manager-home');
  await page.locator('.task-row', { hasText: 'Orn Lertsak' }).click();
  await page.getByRole('heading', { name: 'What the data says' }).waitFor();
  assert(await page.getByRole('heading', { name: 'Your rating' }).isVisible(), 'review: "Your rating" heading missing');
  assert(await page.getByRole('link', { name: '← Back to my team' }).isVisible(), 'review: back button missing');
  await startsOnFirstScreen(page.getByRole('heading', { name: 'Your rating' }), 'review page');
  // Quiet form: the suggestion is a label on its button, and the reason and example appear only when needed.
  assert(await page.getByRole('radio', { name: '3, suggested' }).isVisible(), 'the suggested rating should be labelled on its button');
  assert((await page.getByLabel('Why does your rating differ from the goal results?').count()) === 0, 'the reason box should not show before it is needed');
  assert((await page.getByText(/things? left before you can submit/).count()) === 0, 'the repeated "things left" line should be gone');
  await shot('04-manager-review');
  await rate(5);
  assert(await page.getByLabel('Why does your rating differ from the goal results?').isVisible(), 'reason field missing');
  assert(await page.getByLabel('Specific example').isVisible(), 'example field missing');
  assert(await page.getByRole('button', { name: 'Submit review' }).isDisabled(), 'submit should be blocked');
  // A two-character reason is not a reason.
  await page.getByLabel('Why does your rating differ from the goal results?').fill('aa');
  assert(await page.getByText('2 / 20 characters minimum').isVisible(), 'reason counter missing');
  assert((await page.getByText('Explain why the rating differs from the goal results (at least 20 characters).').count()) > 0, 'short reason should still be listed');
  await page.getByLabel('Why does your rating differ from the goal results?').fill('');
  await shot('05-manager-review-far');
  await page.getByRole('link', { name: '← Back to my team' }).click();
  await page.getByRole('heading', { name: '2 reviews to write' }).waitFor();
  await page.locator('.task-row', { hasText: 'Orn Lertsak' }).click();
  await rate(3);
  await submitReview();
  await page.getByRole('heading', { name: '1 review to write' }).waitFor();
  await open('/manager/map');
  await shot('06-manager-team-map');

  // HR checks fairness: one rating marked as checked, one sent back with a question.
  await become('Pim Chaiyaporn');
  // Calibration build: ratings to check are the list for the final-ratings meeting, so Fairness is reached by its tab.
  await open('/hr/consistency');
  await page.getByRole('heading', { name: 'Check fairness' }).waitFor();
  // Fairness: the finding and the buttons come first; the chart is folded; nothing-to-check managers are one line.
  await page.locator('.mgr-finding', { hasText: 'Daniel rates 0.90 points above' }).waitFor();
  assert((await page.locator('.dumbbell, .db-row').count()) === 0 || !(await page.locator('.db-row').first().isVisible()), 'the people chart should be folded by default');
  assert(await page.locator('.quiet-line', { hasText: 'Tom Wattana' }).isVisible(), 'a manager with nothing to check should be one quiet line');
  await shot('07-hr-fairness');
  const sales = page.locator('.panel', { hasText: 'Daniel Reyes' }).first();
  await sales.getByRole('button', { name: 'Mark as checked' }).click();
  await page.getByLabel('What did you check').fill('Talked to Daniel; two large renewals explain part of the difference.');
  await page.getByRole('dialog').getByRole('button', { name: 'Mark as checked' }).click();
  const nida = page.locator('.flag-row', { hasText: 'Nida Phrom' });
  await nida.getByRole('button', { name: 'Send back with a question' }).click();
  await page.getByLabel(/Your question for/).fill('Is 5 right when results suggest 3.9?');
  await page.getByRole('dialog').getByRole('button', { name: 'Send back with question' }).click();
  assert(await page.getByText('Waiting for managers').isVisible(), 'sent-back review not listed');

  // Daniel's home shows HR's question first; he answers and keeps the rating.
  await become('Daniel Reyes');
  await page.getByRole('heading', { name: '1 question from HR' }).waitFor();
  await page.locator('.task-row', { hasText: 'Nida Phrom' }).click();
  await page.getByLabel(/Answer to:/).fill('Kept 5: the August contract was the largest of the year.');
  await page.getByRole('button', { name: 'Confirm and send answer' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Submit review' }).click();

  // HR home lists the answer; HR accepts it. Until then release stays locked.
  await become('Pim Chaiyaporn');
  await page.getByRole('link', { name: 'Read the answer' }).click();
  await page.locator('.flag-row', { hasText: 'Kept 5' }).getByRole('button', { name: 'Accept answer' }).click();
  await open('/hr/activity');
  const log = await page.locator('.log-item').allInnerTexts();
  assert(log.some((t) => t.includes('Manager answered HR')) && log.some((t) => t.includes('HR accepted the answer')), 'answer or acceptance not logged');

  // Two days pass: Ying's late review moves to the manager's own manager.
  await page.getByRole('region', { name: 'Prototype controls' }).getByRole('button', { name: '+1 day' }).click();
  await page.getByRole('region', { name: 'Prototype controls' }).getByRole('button', { name: '+1 day' }).click();
  await open('/hr/activity');
  await page.getByRole('tab', { name: 'Moved up' }).click();
  const moved = await page.locator('.log-item').allInnerTexts();
  assert(moved.length === 1 && moved[0].includes('Ying Chen') && moved[0].includes('Anong Rattanakul'), `unexpected moved reviews: ${moved}`);
  await shot('08-hr-activity');

  // Employee home: one card. Ying can still send a late self-review.
  await become('Ying Chen');
  await page.getByRole('heading', { name: 'Write your self-review' }).waitFor();
  await startsOnFirstScreen(page.getByRole('link', { name: 'Write my self-review' }), 'employee home');
  await shot('09-employee-home');
  await page.getByRole('link', { name: 'Write my self-review' }).click();
  await page.getByLabel('What did you achieve').fill('Covered the night shift during the carrier change.');
  await page.getByRole('radiogroup', { name: 'Your own rating' }).getByRole('radio', { name: '3' }).click();
  await page.getByRole('button', { name: 'Submit self-review' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Submit self-review' }).click();
  assert((await page.locator('.page-head .badge').innerText()).includes('late'), 'self-review not marked late');
  await page.getByRole('link', { name: '← Back to home' }).click();
  await page.getByRole('heading', { name: 'Nothing to do now' }).waitFor();
  await open('/me/result');
  assert(await page.getByText('Your result is not released yet').isVisible(), 'result should be locked');
  await shot('10-employee-result-locked');

  // The Managing Director writes the review that moved up; HR checks the rest and releases.
  await become('Anong Rattanakul');
  await page.getByRole('heading', { name: '1 review to write' }).waitFor();
  await shot('11-head-home');
  await page.locator('.task-row', { hasText: 'Ying Chen' }).click();
  await rate(3);
  await submitReview();
  await become('Pim Chaiyaporn');
  // Calibration build: managers meet and agree final ratings before release.
  assert(await page.getByRole('heading', { name: 'Final ratings are not agreed yet' }).isVisible(), 'HR home should ask for final ratings');
  await page.getByRole('link', { name: 'Agree final ratings' }).click();
  await page.getByRole('button', { name: 'Start the meeting' }).click();
  await shot('11a-hr-final-ratings');
  const changeButtons = page.locator('.agenda-item.open').getByRole('button', { name: 'Change rating' });
  for (let i = 0; i < (await changeButtons.count()) && !(await page.getByRole('radiogroup', { name: /Final rating for Nida/ }).count()); i++) await changeButtons.nth(i).click();
  await page.getByRole('radiogroup', { name: /Final rating for Nida/ }).getByRole('radio', { name: '4' }).click();
  await page.locator('.agenda-item.open').getByLabel('Why the group changed it').first().fill('Peers at similar results are at 4.');
  await page.locator('.agenda-item.open').getByRole('button', { name: 'Save change' }).first().click();
  for (let i = 0; i < 8 && (await page.locator('.agenda-item.open textarea').count()); i++) {
    const it = page.locator('.agenda-item.open');
    await it.getByLabel('What did the group agree?').fill('Discussed and agreed.');
    await it.getByRole('button', { name: 'Mark as agreed' }).click();
  }
  await page.getByRole('button', { name: 'Lock final ratings' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Lock final ratings' }).click();
  await shot('11b-hr-final-ratings-locked');
  await open('/hr/map');
  await shot('12-hr-map');
  await open('/hr/person/e05');
  await shot('13-hr-person');
  await open('/hr');
  assert(await page.getByText('Nothing needs your attention').isVisible(), `HR home should be clear: ${(await page.locator('main .panel').first().innerText()).replace(/\s+/g, ' ').slice(0, 300)}`);
  await page.getByRole('button', { name: 'Release results' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Release results' }).click();
  assert(await page.getByText(/^Results released \d/).first().isVisible(), 'not released');
  await shot('14-hr-released');

  // Employees now see their result and where it came from.
  await become('Nida Phrom');
  await page.getByRole('heading', { name: 'Your result is ready' }).waitFor();
  await page.getByRole('link', { name: 'See my result' }).click();
  await page.getByText("Manager's assessment").waitFor();
  assert(await page.getByText('Changed from 5 to 4').first().isVisible(), 'Nida should see the agreed change');
  await shot('15-employee-result');
  await become('Fah Inthira');
  assert(await page.getByRole('heading', { name: 'You are not in this review' }).isVisible(), 'left-out employee message missing');

  // Exit goes back to the start page; Reset restores the start.
  await more('Exit demo');
  await page.getByRole('button', { name: /Try as HR/ }).waitFor({ timeout: 3000 }).catch(() => {});
  assert(await page.getByRole('button', { name: /Try as HR/ }).isVisible(), `exit did not return to the start page (at ${page.url()})`);
  await page.getByRole('button', { name: /Try as HR/ }).click();
  await more('Reset demo');
  await page.getByRole('dialog').getByRole('button', { name: 'Reset demo' }).click();
  assert((await page.locator('.demo-date').innerText()).includes('12 Dec 2026'), 'reset failed');
  await page.getByRole('heading', { name: 'Needs your attention' }).waitFor();

  // Demo shortcut 1: the managers finish their reviews; HR's own work stays.
  await more('Let the managers finish their reviews');
  assert((await page.getByRole('button', { name: /^Remind/ }).count()) === 0, 'late reviews should be gone after the shortcut');
  assert(await page.getByRole('button', { name: 'Leave Fah out' }).isVisible(), 'the new joiner should be left for HR');
  assert(await page.getByRole('button', { name: /Release results/ }).isDisabled(), 'release should still wait for HR');
  // Demo shortcut 2, from the employee side: skip to released results under the normal rules.
  await become('Ying Chen');
  await more('Skip to released results');
  await page.getByRole('heading', { name: 'Your result is ready' }).waitFor();
  await page.getByRole('link', { name: 'See my result' }).click();
  await page.getByText("Manager's assessment").waitFor();
  await shot('16-employee-shortcut-result');
  await become('Pim Chaiyaporn');
  await open('/hr/activity');
  assert((await page.locator('.log-item').allInnerTexts()).some((t) => t.includes('Demo shortcut used')), 'shortcut not logged');

  await browser.close();
  assert(errors.length === 0, `console errors: ${errors.join(' | ')}`);
  return checks.length;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 3000));
  let failed = false;
  try {
    for (const vp of VIEWPORTS) {
      try {
        const n = await run(vp);
        console.log(`PASS ${vp.name} (${vp.width}px): full review cycle complete, ${n} screens checked, no sideways scroll, no console errors`);
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
