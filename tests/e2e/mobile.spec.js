const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const { prepare, uploadSynthetic, pickColors, startBalance } = require('./helpers');

const phase = process.env.MOBILE_CAPTURE || 'after';
if (!['before', 'after'].includes(phase)) throw new Error('MOBILE_CAPTURE must be before or after');
const directory = path.join(__dirname, 'mobile-shots', phase);
fs.mkdirSync(directory, { recursive: true });
test.use({ trace: 'off' });

async function measure(page, state) {
  return page.evaluate(state => {
    const root = document.querySelector(state === 'intro' ? '#intro' : state === 'menu' ? '#menu' : state === 'saved' ? '#sheet' : '.app');
    const issues = [], targets = [];
    const visible = el => {
      for (let a = el; a; a = a.parentElement) {
        const s = getComputedStyle(a);
        if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) === 0) return false;
      }
      const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0;
    };
    if (document.documentElement.scrollWidth > innerWidth) issues.push('document horizontal overflow');
    for (const selector of ['#menu', '#sheet', '.intro .card', '.console', '.actions', '#wbTip']) {
      for (const el of root.matches(selector) ? [root] : root.querySelectorAll(selector)) {
        if (visible(el) && el.scrollWidth > el.clientWidth + 1) issues.push(`${selector}: internal horizontal overflow ${el.scrollWidth}/${el.clientWidth}`);
      }
    }
    if (state === 'intro') {
      const r = root.querySelector('.card').getBoundingClientRect();
      if (r.top < 0 || r.bottom > innerHeight) issues.push(`intro card outside viewport: ${r.top.toFixed(1)}..${r.bottom.toFixed(1)}`);
    }
    for (const el of root.querySelectorAll('button, a, [role="tab"]')) {
      if (!visible(el)) continue;
      const r = el.getBoundingClientRect(), id = el.id || el.getAttribute('aria-label') || el.textContent.trim();
      targets.push({ id, width: +r.width.toFixed(1), height: +r.height.toFixed(1) });
      if (r.width < 39.9 || r.height < 39.9) issues.push(`${id}: target ${r.width.toFixed(1)}×${r.height.toFixed(1)} <40`);
      // Horizontal scrolling of the color strip is intentional; the page and panels are not.
      if (!el.closest('.strip') && (r.left < -0.5 || r.right > innerWidth + 0.5)) issues.push(`${id}: outside horizontal viewport`);
      if ((state === 'base' || state === 'balance') && !el.closest('.sheet,.intro') && (r.top < 0 || r.bottom > innerHeight + 0.5)) issues.push(`${id}: outside vertical viewport`);
      // A chip's decorative saved-heart badge intentionally overhangs its circle.
      if (el.scrollWidth > el.clientWidth + 1 && !el.matches('.handle,.chip')) issues.push(`${id}: text exceeds button width`);
      const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
      while(walker.nextNode()) {
        if(!walker.currentNode.textContent.trim()) continue;
        const range=document.createRange(); range.selectNodeContents(walker.currentNode);
        for(const textRect of range.getClientRects()) {
          if(textRect.height && (textRect.top<r.top-0.5||textRect.bottom>r.bottom+0.5)) issues.push(`${id}: text exceeds button height`);
        }
      }
    }
    const buttons = [...root.querySelectorAll('.actions button')].filter(visible);
    for (let i = 0; i < buttons.length; i++) for (let j = i + 1; j < buttons.length; j++) {
      if (buttons[i].parentElement !== buttons[j].parentElement) continue;
      const a = buttons[i].getBoundingClientRect(), b = buttons[j].getBoundingClientRect();
      if (Math.min(a.right,b.right)-Math.max(a.left,b.left)>1 && Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1)
        issues.push(`overlapping actions: ${buttons[i].id}/${buttons[j].id}`);
    }
    return { state, issues, targets };
  }, state);
}

for (const viewport of [{ width:320,height:640 },{ width:360,height:780 },{ width:375,height:812 },{ width:412,height:915 }]) {
  for (const lang of ['ko','en']) {
    test(`mobile matrix ${viewport.width} ${lang}`, async ({ page }, testInfo) => {
      test.setTimeout(120_000);
      const prefix = `${testInfo.project.name}-${viewport.width}-${lang}`;
      const measurements = [], shots = [];
      async function capture(state, measuredState = state) {
        const file = `${prefix}-${state}.png`;
        const png = await page.screenshot({ path:path.join(directory,file), animations:'disabled', scale:'css' });
        expect(png.length, `${file}: maximum 200 KB`).toBeLessThanOrEqual(200_000);
        shots.push({ file, bytes:png.length });
        measurements.push(await measure(page,measuredState));
      }
      await page.setViewportSize(viewport);
      await prepare(page,lang);
      await uploadSynthetic(page);
      await capture('intro');
      if (phase === 'after' && viewport.width === 320 && lang === 'ko') {
        await page.locator('#introGo').scrollIntoViewIfNeeded();
        await capture('intro-bottom','intro');
      }
      await page.locator('#introGo').click();
      await capture('base');
      await page.locator('#menuBtn').click();
      await capture('menu');
      await page.locator('#closeMenu').click();
      await startBalance(page);
      await capture('balance');
      await page.locator('#wbCancel').click();
      await pickColors(page,6);
      await page.locator('#openSaved').click();
      await expect(page.locator('#savedList button')).toHaveCount(6);
      await capture('saved');

      // Controls below a scroll panel must remain reachable vertically, without horizontal panning.
      for (const id of ['compareKept','shareResult','closeSheet','clearSaved']) {
        await page.locator(`#${id}`).scrollIntoViewIfNeeded();
        const r = await page.locator(`#${id}`).boundingBox();
        if (r.x < -0.5 || r.x+r.width > viewport.width+0.5 || r.y < 0 || r.y+r.height > viewport.height+0.5)
          measurements.push({ state:'reachability', issues:[`${id}: cannot reach inside viewport`] });
      }
      if (phase === 'after' && viewport.width === 320 && lang === 'ko') await capture('saved-bottom','saved');
      await page.locator('#closeSheet').click();
      // Reveal the hidden level picker with the user's long-press gesture.
      await page.locator('#strip .chip').nth(1).click();
      const chip = await page.locator('#strip .chip').nth(1).boundingBox();
      await page.mouse.move(chip.x+chip.width/2,chip.y+chip.height/2);
      await page.mouse.down();
      await expect(page.locator('#levels')).toHaveClass(/show/);
      await page.mouse.up();
      if (viewport.width === 320 && lang === 'ko') await capture('levels','base');
      else measurements.push(await measure(page,'base'));

      // Desktop engines report zero env() insets. Substitute constants in the page's CSS
      // for a separate geometric probe; this is not an iPhone hardware test.
      await page.evaluate(() => {
        const style=document.querySelector('style');
        const insets={top:44,bottom:34,left:20,right:20};
        style.textContent=style.textContent.replace(/env\(safe-area-inset-(top|bottom|left|right)\)/g,(_,side)=>`${insets[side]}px`);
      });
      const safeIssues=[], safeTargets=[];
      for (const id of ['compare','save','openSaved','menuBtn']) {
        const r=await page.locator(`#${id}`).boundingBox();
        safeTargets.push({id,...r});
        if(r.x<20-0.5||r.x+r.width>viewport.width-20+0.5||r.y+r.height>viewport.height-34+0.5) safeIssues.push(`${id}: simulated safe area ${JSON.stringify(r)}`);
      }
      for (const [open,container,title,close] of [['menuBtn','menu','menuTitle','closeMenu'],['openSaved','sheet','sheetTitle','closeSheet']]) {
        await page.locator(`#${open}`).click();
        await page.locator(`#${container}`).evaluate(el=>{el.scrollTop=0;el.scrollLeft=0;});
        const r=await page.locator(`#${title}`).boundingBox();
        if(r.y<44-0.5||r.x<20-0.5||r.x+r.width>viewport.width-20+0.5) safeIssues.push(`${container}: simulated safe top/side`);
        if (container === 'menu' && viewport.width === 320 && lang === 'ko') await capture('safe-menu','menu');
        await page.locator(`#${close}`).click();
      }
      measurements.push({state:'simulated-safe-area',issues:safeIssues,targets:safeTargets});
      const cssSupport=await page.evaluate(()=>({backdrop:CSS.supports('backdrop-filter','blur(14px)'),webkitBackdrop:CSS.supports('-webkit-backdrop-filter','blur(14px)')}));
      const issues=measurements.flatMap(m=>m.issues.map(issue=>`${m.state}: ${issue}`));
      fs.writeFileSync(path.join(directory,`${prefix}.json`),JSON.stringify({phase,browser:testInfo.project.name,viewport,lang,cssSupport,shots,measurements,issues},null,2)+'\n');
      expect(issues).toEqual([]);
    });
  }
}
