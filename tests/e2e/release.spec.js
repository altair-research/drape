// Release checks: does the service worker really deliver the app offline and swap to a new version?
// Chromium only. Service workers are allowed in this file only (config blocks them elsewhere).
// The site is copied to a temp folder and served by its own python server, so repo files are never edited.
const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { uploadSynthetic } = require('./helpers');

const ROOT = path.join(__dirname, '../..');
const SITE_FILES = ['index.html', 'sw.js', 'manifest.json', 'privacy.html',
  'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];
const version = Number(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').match(/var APP_VERSION = "(\d+)"/)[1]);

test.use({ serviceWorkers: 'allow' });
test.describe.configure({ mode: 'serial' });
test.skip(({ browserName }) => browserName !== 'chromium', 'release checks run on Chromium only');

function copySite() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'drape-release-'));
  for (const f of SITE_FILES) fs.copyFileSync(path.join(ROOT, f), path.join(dir, f));
  return dir;
}

async function serve(dir, port) {
  const proc = spawn('python', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: dir, stdio: 'ignore' });
  const url = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch(`${url}/index.html`)).ok) return { proc, url }; } catch {}
    await new Promise(r => setTimeout(r, 100));
  }
  proc.kill();
  throw new Error(`server on ${port} did not start`);
}

function bump(dir, to) {
  const idx = path.join(dir, 'index.html');
  const sw = path.join(dir, 'sw.js');
  const html = fs.readFileSync(idx, 'utf8').replace(/var APP_VERSION = "\d+"/, `var APP_VERSION = "${to}"`);
  const js = fs.readFileSync(sw, 'utf8').replace(/var VERSION = "drape-v\d+"/, `var VERSION = "drape-v${to}"`);
  if (!html.includes(`APP_VERSION = "${to}"`) || !js.includes(`"drape-v${to}"`)) throw new Error('bump failed');
  fs.writeFileSync(idx, html);
  fs.writeFileSync(sw, js);
}

async function setup(context) {
  // The optional CDN font is outside this check; context.route also covers requests made by the SW.
  await context.route('https://cdn.jsdelivr.net/**', route => route.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await context.addInitScript(() => {
    localStorage.setItem('drape.lang', 'ko');
    if (navigator.mediaDevices) {
      Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
        configurable: true,
        value: () => Promise.reject(new DOMException('Synthetic camera denial', 'NotAllowedError')),
      });
    }
  });
}

async function visitUntilControlled(page, url) {
  await page.goto(`${url}/index.html`);
  await page.evaluate(() => navigator.serviceWorker.ready);
  // First install does not reload; the SW claims the page, so wait for a controller.
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller), { timeout: 15_000 }).toBe(true);
}

const drapeCaches = page => page.evaluate(async () => (await caches.keys()).filter(k => k.startsWith('drape-')).sort());

let shared;
test.beforeAll(async () => { shared = await serve(copySite(), 8770); });
test.afterAll(() => { shared && shared.proc.kill(); });

test('1) SW installs; offline reload still shows the app and the same version', async ({ context, page }) => {
  await setup(context);
  await visitUntilControlled(page, shared.url);
  await expect(page.locator('#ver')).toHaveText(`v${version}`);
  expect(await drapeCaches(page)).toEqual([`drape-v${version}`]);

  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('#ver')).toHaveText(`v${version}`);
  await expect(page.locator('#stage')).toBeVisible();
  await context.setOffline(false);
});

test('2) version bump in a copy: revisit shows new #ver and no stale drape- cache', async ({ context, page }) => {
  test.setTimeout(90_000);
  const dir = copySite();
  const own = await serve(dir, 8771);
  try {
    await setup(context);
    await visitUntilControlled(page, own.url);
    await expect(page.locator('#ver')).toHaveText(`v${version}`);

    const next = version + 1;
    bump(dir, next);

    // Revisit. The old SW may serve the cached page first; the new SW then takes over and the page
    // reloads itself once (controllerchange). Allow up to 3 manual reloads before failing.
    let shown = '';
    for (let attempt = 0; attempt < 3 && shown !== `v${next}`; attempt++) {
      await page.reload();
      try { await expect(page.locator('#ver')).toHaveText(`v${next}`, { timeout: 10_000 }); } catch {}
      shown = await page.locator('#ver').textContent();
      test.info().annotations.push({ type: 'reload', description: `attempt ${attempt + 1}: ${shown}` });
    }
    expect(shown).toBe(`v${next}`);

    await expect.poll(() => drapeCaches(page), { timeout: 10_000 }).toEqual([`drape-v${next}`]);
  } finally {
    own.proc.kill();
  }
});

test('3) photo mode works offline with a synthetic image', async ({ context, page }) => {
  await setup(context);
  await visitUntilControlled(page, shared.url);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('#ver')).toHaveText(`v${version}`);
  if (await page.locator('#intro').isVisible()) {
    await page.locator('#introGo').click();
    await expect(page.locator('#intro')).toBeHidden();
  }
  await uploadSynthetic(page);
  await context.setOffline(false);
});
