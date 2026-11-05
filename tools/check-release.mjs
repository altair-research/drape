#!/usr/bin/env node
// Release sanity checks for the drape site (no external packages, no network requests).
// Usage: node tools/check-release.mjs [repoRoot]   → prints a table, exit 1 if any FAIL.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(process.argv[2] || path.join(path.dirname(fileURLToPath(import.meta.url)), '..'));
const rows = [];
const external = new Set();
const add = (area, item, ok, detail = '') => rows.push({ area, item, result: ok === null ? 'WARN' : ok ? 'PASS' : 'FAIL', detail });
const read = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const exists = rel => fs.existsSync(path.join(ROOT, rel));

// ---------- 1. versions ----------
const index = read('index.html');
const sw = exists('sw.js') ? read('sw.js') : '';
const appVer = (index.match(/var\s+APP_VERSION\s*=\s*["'](\d+)["']/) || [])[1];
const swVer = (sw.match(/var\s+VERSION\s*=\s*["']drape-v(\d+)["']/) || [])[1];
const prefix = (sw.match(/var\s+PREFIX\s*=\s*["']([^"']+)["']/) || [])[1];
add('version', 'APP_VERSION found', !!appVer, appVer ? `v${appVer}` : 'not found in index.html');
add('version', 'sw.js VERSION = drape-vNN', !!swVer, swVer ? `drape-v${swVer}` : 'not found / wrong prefix');
add('version', 'APP_VERSION == sw VERSION', !!appVer && appVer === swVer, `${appVer} vs ${swVer}`);
add('version', 'cache PREFIX is drape-', prefix === 'drape-', String(prefix));
add('version', 'index.html registers sw.js', /serviceWorker\.register\(\s*["']\.?\/?sw\.js["']/.test(index), '');

// ---------- 2. manifest ----------
function pngSize(rel) {
  const b = fs.readFileSync(path.join(ROOT, rel));
  const sig = '89504e470d0a1a0a';
  if (b.length < 24 || b.subarray(0, 8).toString('hex') !== sig || b.subarray(12, 16).toString() !== 'IHDR') return null;
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}
const manHref = (index.match(/<link[^>]+rel=["']manifest["'][^>]*>/i) || [''])[0].match(/href=["']([^"']+)["']/);
if (!manHref) add('manifest', 'link rel=manifest', false, 'missing in index.html');
else {
  const manRel = manHref[1].replace(/^\.\//, '');
  let man = null;
  try { man = JSON.parse(read(manRel)); add('manifest', `${manRel} valid JSON`, true); }
  catch (e) { add('manifest', `${manRel} valid JSON`, false, e.message); }
  if (man) {
    for (const k of ['name', 'short_name', 'start_url', 'scope', 'display'])
      add('manifest', k, typeof man[k] === 'string' && man[k].length > 0, man[k] ?? 'missing');
    add('manifest', 'short_name <= 12 chars', (man.short_name || '').length <= 12 ? true : null,
      `${(man.short_name || '').length} chars (launcher may truncate longer)`);
    add('manifest', 'display is standalone/fullscreen', ['standalone', 'fullscreen'].includes(man.display), man.display);
    const icons = Array.isArray(man.icons) ? man.icons : [];
    add('manifest', 'icons array', icons.length > 0, `${icons.length} icons`);
    const declared = new Set();
    let maskable = false;
    for (const ic of icons) {
      const rel = path.posix.join(path.posix.dirname(manRel), ic.src.replace(/^\.\//, ''));
      const purposes = (ic.purpose || 'any').split(/\s+/);
      if (purposes.includes('maskable')) maskable = true;
      if (!exists(rel)) { add('icon', rel, false, 'file missing'); continue; }
      const real = pngSize(rel);
      const sizes = (ic.sizes || '').split(/\s+/);
      sizes.forEach(s => declared.add(s));
      const ok = real && sizes.includes(`${real.w}x${real.h}`) && (!ic.type || ic.type === 'image/png');
      add('icon', `${rel} (${ic.purpose || 'any'})`, !!ok, real ? `declared ${ic.sizes}, actual ${real.w}x${real.h}` : 'not a PNG');
    }
    add('manifest', 'has 192x192', declared.has('192x192'));
    add('manifest', 'has 512x512', declared.has('512x512'));
    add('manifest', 'has maskable icon', maskable);
  }
}
for (const m of index.matchAll(/<link[^>]+rel=["'](?:apple-touch-icon|icon)["'][^>]*>/gi)) {
  const href = (m[0].match(/href=["']([^"']+)["']/) || [])[1];
  const sz = (m[0].match(/sizes=["'](\d+x\d+)["']/) || [])[1];
  if (!href || /^https?:/.test(href) || !exists(href)) continue;
  const real = pngSize(href);
  if (sz) add('icon', `${href} (<link sizes>)`, !!real && sz === `${real.w}x${real.h}`, real ? `declared ${sz}, actual ${real.w}x${real.h}` : 'not a PNG');
}

// ---------- 3. assetlinks ----------
const alRel = '.well-known/assetlinks.json';
if (!exists(alRel)) add('assetlinks', alRel, null, 'not present (skip)');
else {
  let al = null;
  try { al = JSON.parse(read(alRel)); add('assetlinks', 'valid JSON', true); }
  catch (e) { add('assetlinks', 'valid JSON', false, e.message); }
  if (al) {
    const list = Array.isArray(al) ? al : [];
    add('assetlinks', 'top level is a non-empty array', list.length > 0, `${list.length} statement(s)`);
    list.forEach((s, i) => {
      const rel = Array.isArray(s.relation) && s.relation.includes('delegate_permission/common.handle_all_urls');
      add('assetlinks', `[${i}] relation handle_all_urls`, rel);
      const t = s.target || {};
      add('assetlinks', `[${i}] namespace android_app`, t.namespace === 'android_app', t.namespace);
      add('assetlinks', `[${i}] package_name`, /^[a-zA-Z][\w]*(\.[a-zA-Z][\w]*)+$/.test(t.package_name || ''), t.package_name);
      const fps = Array.isArray(t.sha256_cert_fingerprints) ? t.sha256_cert_fingerprints : [];
      add('assetlinks', `[${i}] fingerprints present`, fps.length > 0, `${fps.length}`);
      const seen = new Set();
      fps.forEach((fp, j) => {
        const ok = /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/.test(fp);
        // Never reprint the full fingerprint: show only the last 2 bytes.
        add('assetlinks', `[${i}] fingerprint #${j + 1} format`, ok, ok ? `…${fp.slice(-5)}` : 'expected 32 uppercase hex bytes joined by ":"');
        if (seen.has(fp)) add('assetlinks', `[${i}] fingerprint #${j + 1} unique`, false, 'duplicate');
        seen.add(fp);
      });
    });
    // GitHub Pages project sites live under /<repo>/, but Android only reads https://<host>/.well-known/assetlinks.json.
    add('assetlinks', 'served at domain root?', null,
      'Android reads only the domain root; the live copy is in the altair-research.github.io repo (PLAY-STORE.md 4). Keep both in sync; not checked here');
  }
}

// ---------- 4. links ----------
function walkHtml(dir, out = []) {
  for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    if (['node_modules', '.git', 'test-results', 'playwright-report'].includes(e.name)) continue;
    const rel = path.posix.join(dir, e.name);
    if (e.isDirectory()) walkHtml(rel, out);
    else if (e.name.endsWith('.html')) out.push(rel);
  }
  return out;
}
let linkCount = 0;
for (const file of walkHtml('.').map(f => f.replace(/^\.\//, ''))) {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8').replace(/<script[\s\S]*?<\/script>/gi, '');
  const missing = [];
  for (const m of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)) {
    const ref = m[1].trim();
    if (/^(https?:)?\/\//i.test(ref)) { external.add(ref.replace(/^\/\//, 'https://')); continue; }
    if (/^(mailto:|tel:|data:|javascript:|#)/i.test(ref) || ref.includes('${')) continue;
    const clean = decodeURIComponent(ref.split(/[?#]/)[0]);
    let target = clean.startsWith('/') ? clean.replace(/^\/drape\//, '').replace(/^\//, '') : path.posix.join(path.posix.dirname(file), clean);
    if (target === '' || target.endsWith('/')) target = path.posix.join(target, 'index.html');
    linkCount++;
    if (!exists(target)) missing.push(`${ref} → ${target}`);
  }
  add('links', `${file} relative links exist`, missing.length === 0, missing.length ? missing.join(', ') : 'ok');
}
add('links', 'relative links checked', true, String(linkCount));

// ---------- output ----------
console.table(rows);
if (external.size) {
  console.log('\nExternal links (listed only, not requested):');
  for (const u of [...external].sort()) console.log('  ' + u);
}
const count = r => rows.filter(x => x.result === r).length;
console.log(`\nPASS ${count('PASS')} · FAIL ${count('FAIL')} · WARN ${count('WARN')}`);
process.exit(count('FAIL') ? 1 : 0);
