// Accessibility audit (report-only). Records the current state of index.html:
// axe-core violations, keyboard paths, accessible names, html lang, reduced motion
// and whether a screen reader can hear the current colour name.
// Findings never fail a test; only execution failures (page not loading, helpers
// timing out) do. Results go to test-results/a11y/*.json and are transcribed into
// docs/A11Y-CHECK.md. Synthetic canvas images only; camera is denied (helpers.js).
const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const { prepare, uploadSynthetic, openPhoto, startBalance, pickColors } = require('./helpers');

const AXE_PATH = require.resolve('axe-core/axe.min.js');
const OUT_DIR = path.join(__dirname, '../../test-results/a11y');
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

function save(testInfo, lang, name, data) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const file = path.join(OUT_DIR, `${testInfo.project.name}-${lang}-${name}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

async function axeScan(page, state) {
  if (!(await page.evaluate(() => !!window.axe))) await page.addScriptTag({ path: AXE_PATH });
  const result = await page.evaluate(tags => window.axe.run(document, {
    runOnly: { type: 'tag', values: tags }, resultTypes: ['violations'],
  }), AXE_TAGS);
  return {
    state,
    axe: result.testEngine.version,
    violations: result.violations.map(v => ({
      id: v.id, impact: v.impact, help: v.help, count: v.nodes.length,
      targets: v.nodes.slice(0, 6).map(n => n.target.join(' ')),
      summary: v.nodes[0] && v.nodes[0].failureSummary,
    })),
  };
}

// Describe the focused element and which dialog-like container it is in.
async function focusInfo(page) {
  return page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return { id: 'body', inside: null };
    const box = el.closest('#intro,#menu,#sheet,#wbTip,.console,#stage');
    const cs = getComputedStyle(el);
    return {
      id: el.id || `${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ')[0]}`,
      name: (el.getAttribute('aria-label') || el.textContent || el.title || '').trim().slice(0, 30),
      inside: box ? (box.id || box.className.split(' ')[0]) : 'other',
      outline: `${cs.outlineStyle} ${cs.outlineWidth}`,
      boxShadow: cs.boxShadow !== 'none',
    };
  });
}

// Press Tab until predicate(info) or limit; returns the path walked.
async function tabUntil(page, predicate, limit = 60, key = 'Tab') {
  const walked = [];
  for (let i = 0; i < limit; i++) {
    await page.keyboard.press(key);
    const info = await focusInfo(page);
    walked.push(info);
    if (predicate(info)) return { reached: true, presses: i + 1, walked };
  }
  return { reached: false, presses: limit, walked };
}

// Screenshot an element with an 8px margin so an outline drawn outside it is visible.
async function focusShot(page, sel, file) {
  const b = await page.locator(sel).boundingBox();
  await page.screenshot({ path: file, clip: { x: Math.max(0, b.x - 8), y: Math.max(0, b.y - 8), width: b.width + 16, height: b.height + 16 } });
}

const hidden = (page, sel) => page.locator(sel).evaluate(el => el.hidden || getComputedStyle(el).display === 'none');
const settle = page => page.waitForTimeout(250);

for (const lang of ['ko', 'en']) {
  test.describe(`a11y ${lang}`, () => {
    test('axe scan: intro, fallback, main, menu, white-paper tip, liked list', async ({ page }, testInfo) => {
      const scans = [];
      await prepare(page, lang);
      scans.push(await axeScan(page, 'intro'));
      await page.locator('#introGo').click();
      await expect(page.locator('#intro')).toBeHidden();
      scans.push(await axeScan(page, 'fallback (camera denied)'));
      await uploadSynthetic(page);
      scans.push(await axeScan(page, 'main'));
      await page.locator('#menuBtn').click();
      await expect(page.locator('#menu')).toBeVisible();
      scans.push(await axeScan(page, 'menu'));
      await page.locator('#wbBtn').click();
      await expect(page.locator('#wbTip')).toBeVisible();
      scans.push(await axeScan(page, 'wbTip'));
      await page.locator('#wbCancel').click();
      await pickColors(page, 5);
      await page.locator('#openSaved').click();
      await expect(page.locator('#sheet')).toBeVisible();
      await expect(page.locator('#savedList button')).toHaveCount(5);
      scans.push(await axeScan(page, 'sheet (5 liked)'));
      save(testInfo, lang, 'axe', scans);
      await testInfo.attach('axe', { body: JSON.stringify(scans, null, 2), contentType: 'application/json' });
      expect(scans).toHaveLength(6);
    });

    test('keyboard only: intro, menu, white paper, colour, like, liked list', async ({ page }, testInfo) => {
      // ~300 key presses; WebKit needs more than the default 30s when the machine is busy.
      test.setTimeout(90_000);
      const r = {};
      const shots = path.join(OUT_DIR, `${testInfo.project.name}-${lang}-focus`);
      fs.mkdirSync(shots, { recursive: true });
      await prepare(page, lang);

      // Intro dialog
      r.introInitialFocus = await focusInfo(page);
      await focusShot(page, '#introGo', path.join(shots, 'introGo.png'));
      const introTab = await tabUntil(page, () => false, 4);
      r.introTabWalk = introTab.walked.map(w => `${w.id}@${w.inside}`);
      r.introFocusTrapped = introTab.walked.every(w => w.inside === 'intro');
      await page.locator('#introGo').focus(); // restore a known start if focus escaped
      await page.keyboard.press('Escape'); await settle(page);
      r.introClosesOnEscape = await hidden(page, '#intro');
      if (!r.introClosesOnEscape) await page.keyboard.press('Enter');
      await expect(page.locator('#intro')).toBeHidden();
      r.focusAfterIntroClose = await focusInfo(page);

      // Camera denied: is "use a photo" reachable by keyboard? (the file chooser itself is OS UI)
      const toPick = await tabUntil(page, i => i.id === 'pick', 40);
      r.pickButton = { reached: toPick.reached, presses: toPick.presses, walk: toPick.walked.slice(0, 8).map(w => w.id) };
      await uploadSynthetic(page);

      // Main screen: Tab order to the menu button
      await page.evaluate(() => document.activeElement && document.activeElement.blur());
      const toMenu = await tabUntil(page, i => i.id === 'menuBtn', 80);
      r.tabToMenu = { reached: toMenu.reached, presses: toMenu.presses, order: toMenu.walked.slice(0, 12).map(w => w.id) };
      if (!toMenu.reached) await page.locator('#menuBtn').focus(); // record, then continue the path
      r.menuBtnFocusStyle = await focusInfo(page);
      await focusShot(page, '#menuBtn', path.join(shots, 'menuBtn.png'));

      // Menu
      await page.keyboard.press('Enter');
      await expect(page.locator('#menu')).toBeVisible();
      r.focusAfterMenuOpen = await focusInfo(page);
      const toWb = await tabUntil(page, i => i.id === 'wbBtn', 30);
      r.tabToWhitePaper = { reached: toWb.reached, presses: toWb.presses, order: toWb.walked.map(w => `${w.id}@${w.inside}`) };
      if (!toWb.reached) await page.locator('#wbBtn').focus();
      r.wbBtnFocusStyle = await focusInfo(page);
      await focusShot(page, '#wbBtn', path.join(shots, 'wbBtn.png'));
      const menuWalk = await tabUntil(page, () => false, 16);
      r.menuFocusTrapped = menuWalk.walked.every(w => w.inside === 'menu');
      r.menuWalkAfterWb = menuWalk.walked.map(w => `${w.id}@${w.inside}`);
      await page.keyboard.press('Escape'); await settle(page);
      r.menuClosesOnEscape = await hidden(page, '#menu');
      if (r.menuClosesOnEscape) {
        r.focusAfterMenuEscape = await focusInfo(page);
        await page.locator('#menuBtn').focus(); await page.keyboard.press('Enter');
      }
      // Activate white paper from the keyboard
      await page.locator('#wbBtn').focus();
      await page.keyboard.press('Enter');
      await expect(page.locator('#wbTip')).toBeVisible();
      r.focusAfterWhitePaper = await focusInfo(page);
      const toCancel = await tabUntil(page, i => i.id === 'wbCancel', 40);
      r.tabToWbCancel = { reached: toCancel.reached, presses: toCancel.presses };
      await page.keyboard.press('Escape'); await settle(page);
      r.wbTipClosesOnEscape = await hidden(page, '#wbTip');
      if (!r.wbTipClosesOnEscape) { await page.locator('#wbCancel').focus(); await page.keyboard.press('Enter'); }
      await expect(page.locator('#wbTip')).toBeHidden();
      r.focusAfterWbCancel = await focusInfo(page);

      // Colour + like
      const before = await page.locator('#cName').textContent();
      await page.keyboard.press('ArrowRight');
      r.arrowChangesColour = (await page.locator('#cName').textContent()) !== before;
      await page.evaluate(() => document.activeElement && document.activeElement.blur());
      const toSave = await tabUntil(page, i => i.id === 'save', 80);
      r.tabToLike = { reached: toSave.reached, presses: toSave.presses };
      if (!toSave.reached) await page.locator('#save').focus();
      r.likeFocusStyle = await focusInfo(page);
      await focusShot(page, '#save', path.join(shots, 'save.png'));
      await page.keyboard.press('Enter');
      r.enterLikes = (await page.locator('#savedCount').textContent()) === '1';
      // Space on the focused ♥ button (a previous colour exists, so the global Space = compare handler is armed)
      await page.keyboard.press('ArrowRight');
      await page.locator('#save').focus();
      await page.keyboard.press('Space');
      r.spaceLikes = (await page.locator('#savedCount').textContent()) === '2';
      // Fill up to 5 with Enter
      while (Number(await page.locator('#savedCount').textContent()) < 5) {
        await page.keyboard.press('ArrowRight');
        await page.locator('#save').focus();
        await page.keyboard.press('Enter');
      }
      // Liked list
      const toList = await tabUntil(page, i => i.id === 'openSaved', 10);
      r.tabToLikedList = { reached: toList.reached, presses: toList.presses };
      if (!toList.reached) await page.locator('#openSaved').focus();
      await page.keyboard.press('Enter');
      await expect(page.locator('#sheet')).toBeVisible();
      r.focusAfterSheetOpen = await focusInfo(page);
      const sheetWalk = await tabUntil(page, () => false, 14);
      r.sheetFocusTrapped = sheetWalk.walked.every(w => w.inside === 'sheet');
      r.sheetWalk = sheetWalk.walked.map(w => `${w.id}@${w.inside}`);
      await page.keyboard.press('Escape'); await settle(page);
      r.sheetClosesOnEscape = await hidden(page, '#sheet');
      if (!r.sheetClosesOnEscape) { await page.locator('#closeSheet').focus(); await page.keyboard.press('Enter'); }
      await expect(page.locator('#sheet')).toBeHidden();
      r.focusAfterSheetClose = await focusInfo(page);
      r.focusReturnedToOpener = r.focusAfterSheetClose.id === 'openSaved';

      // Drape handle: any keyboard way to move it?
      const top0 = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--drape-top'));
      await page.locator('#handle').focus();
      await page.keyboard.press('ArrowUp');
      r.handleMovesWithKeys = (await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--drape-top'))) !== top0;

      save(testInfo, lang, 'keyboard', r);
      await testInfo.attach('keyboard', { body: JSON.stringify(r, null, 2), contentType: 'application/json' });
      expect(await page.locator('#savedCount').textContent()).toBe('5');
    });

    test('names, html lang, reduced motion, colour announcements', async ({ page, browser }, testInfo) => {
      const r = {};
      await openPhoto(page, lang);
      r.htmlLangAtStart = await page.evaluate(() => document.documentElement.lang);
      const names = () => page.evaluate(() => {
        const pick = sel => { const el = document.querySelector(sel); return el ? (el.getAttribute('aria-label') || el.textContent.trim() || el.title || '') : null; };
        const levels = [...document.querySelectorAll('#levels button')].map(b => b.getAttribute('aria-label'));
        return {
          menuBtn: pick('#menuBtn'), heartTab: pick('#heartTab'), handle: pick('#handle'), flipTop: pick('#flipTop'),
          save: pick('#save'), wbCancel: pick('#wbCancel'), firstChip: pick('#strip .chip'), levels,
          levelsGroupName: document.querySelector('#levels').getAttribute('aria-label'),
          shotAlt: document.querySelector('#shot').alt,
          unnamedButtons: [...document.querySelectorAll('button')].filter(b => !(b.getAttribute('aria-label') || b.textContent.trim() || b.title)).map(b => b.id || b.className),
        };
      });
      r.names = await names();
      await page.locator('#menuBtn').click();
      await page.locator('#langBtn').click();
      await page.locator('#closeMenu').click();
      r.htmlLangAfterSwitch = await page.evaluate(() => document.documentElement.lang);
      r.namesAfterSwitch = await names();
      // Strings that are not translated by applyLang (static Korean in markup).
      r.untranslated = await page.evaluate(() => ({
        cMatchTitle: document.querySelector('#cMatchWrap').title,
        hintText: document.querySelector('#hint').textContent,
      }));

      // Reduced motion: this context runs with reducedMotion 'reduce' (playwright.config.js)
      const motion = p => p.evaluate(() => ({
        introAnimation: getComputedStyle(document.querySelector('.intro .card')).animationName,
        chipTransition: getComputedStyle(document.querySelector('.chip')).transitionDuration,
        matchesReduce: matchMedia('(prefers-reduced-motion: reduce)').matches,
      }));
      r.motionReduce = await motion(page);
      const ctx = await browser.newContext({ reducedMotion: 'no-preference', serviceWorkers: 'block', viewport: { width: 360, height: 780 }, baseURL: testInfo.project.use.baseURL });
      const p2 = await ctx.newPage();
      await prepare(p2, lang);
      r.motionNoPreference = await motion(p2);
      await ctx.close();
      // JS-driven smooth scroll ignores the media query (setIdx -> scrollIntoView behavior:"smooth")
      r.jsSmoothScrollRespectsReduce = /prefers-reduced-motion/.test(fs.readFileSync(path.join(__dirname, '../../index.html'), 'utf8').split('<script>')[1]);

      // Screen reader: is there a live region or does the colour name live in a named/focused element?
      r.liveRegions = await page.evaluate(() => [...document.querySelectorAll('[aria-live],[role=status],[role=alert],output')].map(e => e.id || e.tagName));
      const nameBefore = await page.locator('#cName').textContent();
      await page.keyboard.press('ArrowRight');
      r.cName = {
        before: nameBefore, after: await page.locator('#cName').textContent(),
        attrs: await page.locator('#cName').evaluate(el => ({ role: el.getAttribute('role'), live: el.getAttribute('aria-live') || (el.closest('[aria-live]') && el.closest('[aria-live]').id) || null })),
        focusAfterArrow: await focusInfo(page),
        chipPressedName: await page.locator('#strip .chip[aria-pressed="true"]').getAttribute('aria-label'),
      };
      r.readoutAriaSnapshot = await page.locator('.readout').ariaSnapshot();

      save(testInfo, lang, 'names-motion-sr', r);
      await testInfo.attach('names-motion-sr', { body: JSON.stringify(r, null, 2), contentType: 'application/json' });
      expect(r.htmlLangAtStart).toBeTruthy();
    });
  });
}
