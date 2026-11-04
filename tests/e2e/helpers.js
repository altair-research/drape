const { expect } = require('@playwright/test');

async function prepare(page, lang = 'ko') {
  // Keep tests offline and deterministic; the optional CDN font is outside this audit.
  await page.route('https://cdn.jsdelivr.net/**', route => route.fulfill({
    status: 200, contentType: 'text/css', body: '',
  }));
  await page.addInitScript(language => {
    localStorage.setItem('drape.lang', language);
    if (navigator.mediaDevices) {
      Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
        configurable: true,
        value: () => Promise.reject(new DOMException('Synthetic camera denial', 'NotAllowedError')),
      });
    }
    window.__shares = [];
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async data => { window.__shares.push(data); },
    });
  }, lang);
  await page.goto('/index.html');
  await expect(page.locator('#intro')).toBeVisible();
  await expect(page.locator('#stage')).toHaveClass(/blocked/);
}

async function uploadSynthetic(page) {
  const png = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 800; canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgb(240,225,170)'; ctx.fillRect(0, 0, 400, 1000);
    ctx.fillStyle = 'rgb(220,170,130)'; ctx.fillRect(400, 0, 400, 1000);
    return canvas.toDataURL('image/png').split(',')[1];
  });
  await page.locator('#file').setInputFiles({
    name: 'synthetic-paper.png', mimeType: 'image/png', buffer: Buffer.from(png, 'base64'),
  });
  await expect(page.locator('#stage')).toHaveClass(/photo/);
  await expect(page.locator('#stage')).not.toHaveClass(/blocked/);
  await expect.poll(() => page.locator('#shot').evaluate(img => img.complete && img.naturalWidth)).toBe(800);
}

async function openPhoto(page, lang = 'ko') {
  await prepare(page, lang);
  await page.locator('#introGo').click();
  await expect(page.locator('#intro')).toBeHidden();
  await uploadSynthetic(page);
}

async function startBalance(page) {
  await page.locator('#menuBtn').click();
  await page.locator('#wbBtn').click();
  await expect(page.locator('#wbTip')).toBeVisible();
}

async function tapStage(page, fractionX) {
  const box = await page.locator('#stage').boundingBox();
  // Above the drape and below the readout/tip; also outside the face guide.
  await page.mouse.click(box.x + box.width * fractionX, box.y + box.height * 0.40);
}

async function pickColors(page, count = 5) {
  // Three spring, then two (or three) summer colors, using both navigation keys.
  for (let i = 0; i < count; i++) {
    if (i) await page.keyboard.press(i === 3 ? 'ArrowDown' : 'ArrowRight');
    await page.locator('#save').click();
  }
  await expect(page.locator('#savedCount')).toHaveText(String(count));
}

async function screenshotPixel(page, fractionX = 0.20) {
  const box = await page.locator('#stage').boundingBox();
  const png = await page.screenshot({ scale: 'css', animations: 'disabled' });
  const rgb = await page.evaluate(async ({ base64, x, y }) => {
    const img = new Image();
    img.src = `data:image/png;base64,${base64}`;
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = img.width; canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(x - 2, y - 2, 5, 5).data;
    const channels = [0, 0, 0];
    for (let i = 0; i < data.length; i += 4)
      for (let c = 0; c < 3; c++) channels[c] += data[i + c] / 25;
    return channels.map(Math.round);
  }, { base64: png.toString('base64'), x: Math.round(box.x + box.width * fractionX), y: Math.round(box.y + box.height * 0.40) });
  return { rgb, png };
}

module.exports = { prepare, uploadSynthetic, openPhoto, startBalance, tapStage, pickColors, screenshotPixel };
