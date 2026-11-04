const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const { prepare, openPhoto, startBalance, tapStage, pickColors, screenshotPixel } = require('./helpers');
const source = fs.readFileSync(path.join(__dirname, '../../index.html'), 'utf8');
const version = source.match(/var APP_VERSION = "(\d+)"/)[1];

for (const lang of ['ko', 'en']) {
  test.describe(lang, () => {
    test('first load: no console errors, current version, intro closes', async ({ page }) => {
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
      await prepare(page, lang);
      await expect(page.locator('#ver')).toHaveText(`v${version}`);
      await page.locator('#introGo').click();
      await expect(page.locator('#intro')).toBeHidden();
      expect(errors).toEqual([]);
    });

    test('white paper: matrix gains and toggle off', async ({ page }) => {
      await openPhoto(page, lang);
      await startBalance(page);
      await tapStage(page, 0.20);
      await expect(page.locator('#wbTip')).toBeHidden();
      await expect(page.locator('#shot')).toHaveClass(/wb/);
      const values = (await page.locator('#wbm').getAttribute('values')).trim().split(/\s+/).map(Number);
      for (const [index, expected] of [[0, 0.78], [6, 0.90], [12, 1.68]])
        expect(Math.abs(values[index] - expected)).toBeLessThanOrEqual(0.05);
      await page.locator('#menuBtn').click();
      await page.locator('#wbBtn').click();
      await expect(page.locator('#shot')).not.toHaveClass(/wb/);
      await expect(page.locator('#wbTip')).toBeHidden();
    });

    test('white paper: rendered screenshot becomes gray', async ({ page }, testInfo) => {
      await openPhoto(page, lang);
      const before = await screenshotPixel(page);
      expect(Math.max(...before.rgb) - Math.min(...before.rgb)).toBeGreaterThan(50);
      await startBalance(page);
      await tapStage(page, 0.20);
      await expect(page.locator('#shot')).toHaveClass(/wb/);
      const after = await screenshotPixel(page);
      await testInfo.attach('white-balance-pixels', { body: JSON.stringify({ before: before.rgb, after: after.rgb }), contentType: 'application/json' });
      await testInfo.attach('white-balance-after', { body: after.png, contentType: 'image/png' });
      expect(Math.min(...after.rgb), 'A black/blank region must not count as neutral paper').toBeGreaterThan(180);
      expect(Math.max(...after.rgb) - Math.min(...after.rgb)).toBeLessThanOrEqual(12);
    });

    test('skin-colored patch is rejected', async ({ page }) => {
      await openPhoto(page, lang);
      await startBalance(page);
      const tip = await page.locator('#wbTipText').textContent();
      await tapStage(page, 0.80);
      await expect(page.locator('#wbTip')).toBeVisible();
      await expect(page.locator('#wbTipText')).not.toHaveText(tip);
      await expect(page.locator('#wbTipText')).toContainText(lang === 'ko' ? '찾지 못했어요' : 'Couldn’t read');
      await expect(page.locator('#shot')).not.toHaveClass(/wb/);
    });

    test('five picked colors: three summary rows, matching counts, empty state', async ({ page }) => {
      await openPhoto(page, lang);
      await page.locator('#openSaved').click();
      await expect(page.locator('#tally .lean')).toHaveCount(0);
      await expect(page.locator('#tally .palette')).toHaveCount(0);
      await page.locator('#closeSheet').click();
      await pickColors(page);
      await page.locator('#openSaved').click();
      await expect(page.locator('#tally')).toContainText(lang === 'ko' ? '내가 고른 색' : 'Colors I picked');
      await expect(page.locator('#tally .lean > span')).toHaveCount(6);
      const axes = lang === 'ko' ? ['온도', '채도', '밝기'] : ['Temperature', 'Saturation', 'Brightness'];
      for (const axis of axes) await expect(page.locator('#tally .lean')).toContainText(axis);
      await expect(page.locator('#tally .palette i')).toHaveCount(5);
      await expect(page.locator('#savedList button')).toHaveCount(5);
      await expect(page.locator('#tally h3 b')).toContainText('5');
      await page.locator('#clearSaved').click();
      await expect(page.locator('#savedCount')).toHaveText('0');
      await expect(page.locator('#tally .lean')).toHaveCount(0);
      await expect(page.locator('#tally .palette')).toHaveCount(0);
    });

    test('result share includes season counts and leaning', async ({ page }) => {
      await openPhoto(page, lang);
      await pickColors(page);
      await page.locator('#openSaved').click();
      await page.locator('#shareResult').click();
      const shares = await page.evaluate(() => window.__shares);
      expect(shares).toHaveLength(1);
      expect(shares[0].text).toContain(lang === 'ko' ? '봄 웜 3 · 여름 쿨 2' : 'Spring Warm 3 · Summer Cool 2');
      expect(shares[0].text).toContain(lang === 'ko' ? '쪽' : 'Leaning');
    });
  });
}

test('language switch updates menu and saved summary in both directions', async ({ page }) => {
  await openPhoto(page, 'ko');
  await pickColors(page);
  for (const lang of ['en', 'ko']) {
    await page.locator('#menuBtn').click();
    await page.locator('#langBtn').click();
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await expect(page.locator('#wbLabel')).toHaveText(lang === 'ko' ? '흰 종이로 색 맞추기' : 'White paper balance');
    await expect(page.locator('#guideLabel')).toHaveText(lang === 'ko' ? '얼굴 가이드' : 'Face guide');
    await page.locator('#closeMenu').click();
    await page.locator('#openSaved').click();
    await expect(page.locator('#tally')).toContainText(lang === 'ko' ? '내가 고른 색' : 'Colors I picked');
    await expect(page.locator('#tally .lean')).toContainText(lang === 'ko' ? '온도' : 'Temperature');
    await page.locator('#closeSheet').click();
  }
});

for (const viewport of [{ width: 360, height: 780 }, { width: 412, height: 915 }]) {
  for (const lang of ['ko', 'en']) {
    test(`no horizontal scroll ${viewport.width} ${lang}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await openPhoto(page, lang);
      await pickColors(page);
      for (const state of ['base', 'menu', 'sheet']) {
        if (state === 'menu') await page.locator('#menuBtn').click();
        if (state === 'sheet') await page.locator('#openSaved').click();
        const dimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, viewport: innerWidth }));
        expect.soft(dimensions.scroll, `${state}: document width`).toBeLessThanOrEqual(dimensions.viewport);
        if (state === 'menu') await page.locator('#closeMenu').click();
      }
    });
  }
}
