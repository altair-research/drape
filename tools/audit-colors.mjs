import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const script = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].at(-1)?.[1];
if (!script) throw new Error('Last inline script not found');
const version = script.match(/var APP_VERSION\s*=\s*"(\d+)"/)?.[1];

// Extract balanced declarations, ignoring braces in comments and strings.
// Only selected local source is evaluated; no DOM, network, require or process is exposed.
function balanced(start, open, close) {
  const from = script.indexOf(open, start);
  if (from < 0) throw new Error(`Opening ${open} missing`);
  let depth = 0, quote = '', comment = '';
  for (let i = from; i < script.length; i++) {
    const c = script[i], next = script[i + 1];
    if (comment === 'line') { if (c === '\n') comment = ''; continue; }
    if (comment === 'block') { if (c === '*' && next === '/') { comment = ''; i++; } continue; }
    if (quote) { if (c === '\\') i++; else if (c === quote) quote = ''; continue; }
    if (c === '/' && next === '/') { comment = 'line'; i++; continue; }
    if (c === '/' && next === '*') { comment = 'block'; i++; continue; }
    if (c === '"' || c === "'") { quote = c; continue; }
    if (c === open) depth++;
    if (c === close && --depth === 0) return script.slice(from, i + 1);
  }
  throw new Error(`Unbalanced ${open}`);
}
function declaration(name, open, close) {
  const match = new RegExp(`\\bvar ${name}\\s*=`).exec(script);
  if (!match) throw new Error(`Missing ${name}`);
  return `var ${name} = ${balanced(match.index, open, close)};`;
}
function fn(name) {
  const match = new RegExp(`\\bfunction ${name}\\([^)]*\\)`).exec(script);
  if (!match) throw new Error(`Missing function ${name}`);
  return `${match[0]}${balanced(match.index + match[0].length, '{', '}')}`;
}
const functions = ['hexToHsl', 'hslToHex', 'isNeutral', 'variantHex', 'parseKey', 'findFlat',
  'seasonSwatch', 'srgbToLab', 'polar', 'hexLab', 'colorWarmth', 'leanCuts', 'leanOf', 'leanWords', 't'];
const context = vm.createContext(Object.create(null), { codeGeneration: { strings: false, wasm: false } });
vm.runInContext([
  declaration('SEASONS', '[', ']'), declaration('LEVELS', '[', ']'), declaration('T', '{', '}'),
  'var FLAT = []; SEASONS.forEach((s,si) => s.colors.forEach((c,ci) => FLAT.push({...c,s,si,ci})));',
  'var LANG = "ko", leanCut = null;', ...functions.map(fn),
].join('\n'), context, { timeout: 1000 });
const app = context;
const checks = [];
const check = (name, ok) => checks.push({ name, ok: Boolean(ok) });
const fmt = n => n.toFixed(2);
const percent = (n, d) => d ? `${(100 * n / d).toFixed(1)}%` : 'N/A';
const table = (heads, rows) => `| ${heads.join(' | ')} |\n| ${heads.map(() => '---').join(' | ')} |\n${rows.map(r => `| ${r.join(' | ')} |`).join('\n')}\n`;

// CIEDE2000, kL=kC=kH=1. Independent implementation of Sharma/Wu/Dalal eqs. 2–22.
function deltaE(p, q) {
  const rad = Math.PI / 180, cos = a => Math.cos(a * rad), sin = a => Math.sin(a * rad);
  const cbar = (Math.hypot(p.a, p.b) + Math.hypot(q.a, q.b)) / 2;
  const g = 0.5 * (1 - Math.sqrt(cbar ** 7 / (cbar ** 7 + 25 ** 7)));
  const a1 = (1 + g) * p.a, a2 = (1 + g) * q.a;
  const c1 = Math.hypot(a1, p.b), c2 = Math.hypot(a2, q.b);
  const hue = (a, b) => a === 0 && b === 0 ? 0 : (Math.atan2(b, a) / rad + 360) % 360;
  const h1 = hue(a1, p.b), h2 = hue(a2, q.b);
  let dh = h2 - h1;
  if (c1 * c2 === 0) dh = 0;
  else if (dh > 180) dh -= 360;
  else if (dh < -180) dh += 360;
  const dH = 2 * Math.sqrt(c1 * c2) * sin(dh / 2);
  const lb = (p.L + q.L) / 2, cb = (c1 + c2) / 2;
  let hb = h1 + h2;
  if (c1 * c2 !== 0) {
    if (Math.abs(h1 - h2) <= 180) hb /= 2;
    else hb = (hb + (hb < 360 ? 360 : -360)) / 2;
  }
  const t = 1 - 0.17 * cos(hb - 30) + 0.24 * cos(2 * hb) + 0.32 * cos(3 * hb + 6) - 0.20 * cos(4 * hb - 63);
  const sl = 1 + 0.015 * (lb - 50) ** 2 / Math.sqrt(20 + (lb - 50) ** 2);
  const sc = 1 + 0.045 * cb, sh = 1 + 0.015 * cb * t;
  const rt = -2 * Math.sqrt(cb ** 7 / (cb ** 7 + 25 ** 7)) * sin(60 * Math.exp(-(((hb - 275) / 25) ** 2)));
  const dl = (q.L - p.L) / sl, dc = (c2 - c1) / sc, hh = dH / sh;
  return Math.sqrt(Math.max(0, dl * dl + dc * dc + hh * hh + rt * dc * hh));
}

// Reference pairs 1–16, including zero chroma and the 180-degree discontinuity.
// https://hajim.rochester.edu/ece/sites/gsharma/ciede2000/dataNprograms/ciede2000testdata.txt
const reference = [
  [50,2.6772,-79.7751,50,0,-82.7485,2.0425], [50,3.1571,-77.2803,50,0,-82.7485,2.8615],
  [50,2.8361,-74.0200,50,0,-82.7485,3.4412], [50,-1.3802,-84.2814,50,0,-82.7485,1],
  [50,-1.1848,-84.8006,50,0,-82.7485,1], [50,-0.9009,-85.5211,50,0,-82.7485,1],
  [50,0,0,50,-1,2,2.3669], [50,-1,2,50,0,0,2.3669],
  [50,2.49,-0.001,50,-2.49,0.0009,7.1792], [50,2.49,-0.001,50,-2.49,0.001,7.1792],
  [50,2.49,-0.001,50,-2.49,0.0011,7.2195], [50,2.49,-0.001,50,-2.49,0.0012,7.2195],
  [50,-0.001,2.49,50,0.0009,-2.49,4.8045], [50,-0.001,2.49,50,0.001,-2.49,4.8045],
  [50,-0.001,2.49,50,0.0011,-2.49,4.7461], [50,2.5,0,50,0,-2.5,4.3065],
];
reference.forEach(([L,a,b,L2,a2,b2,expected], i) => {
  const p = { L,a,b }, q = { L:L2,a:a2,b:b2 };
  check(`CIEDE2000 reference ${i + 1} and symmetry`, Math.abs(deltaE(p,q) - expected) < 0.00005 && Math.abs(deltaE(p,q) - deltaE(q,p)) < 1e-10);
});
if (checks.some(c => !c.ok)) throw new Error(`CIEDE2000 self-check failed: ${checks.filter(c => !c.ok).map(c => c.name)}`);

check('Four seasons', app.SEASONS.length === 4);
check('48 base colors', app.FLAT.length === 48);
check('Three levels', app.LEVELS.length === 3);
const levels = ['흐리게', '기본', '선명하게'];
const entries = app.FLAT.flatMap(c => app.LEVELS.map((_, lv) => {
  const hex = app.variantHex(c.h, lv);
  check(`${c.n}/${lv} hex`, /^#[0-9A-F]{6}$/.test(hex));
  return { c, lv, hex, lab: app.hexLab(hex), neutral: app.isNeutral(c.h), label: `${c.n} · ${levels[lv]}` };
}));
const nameIssues = [];
for (const [key, lang] of [['n', 'ko'], ['e', 'en']]) {
  const names = new Map();
  for (const c of app.FLAT) {
    const name = typeof c[key] === 'string' ? c[key].trim() : '';
    check(`${lang} name ${c.h}`, Boolean(name));
    if (!name) nameIssues.push(`${lang} 누락: ${c.h}`);
    const normalized = name.normalize('NFKC').toLocaleLowerCase('en');
    if (names.has(normalized)) nameIssues.push(`${lang} 중복: ${name} (${names.get(normalized)}, ${c.h})`);
    names.set(normalized, c.h);
  }
  check(`${lang} unique names`, names.size === app.FLAT.length);
}

const similar = [], intentional = [];
for (let i = 0; i < entries.length; i++) for (let j = i + 1; j < entries.length; j++) {
  const a = entries[i], b = entries[j];
  if (a.c.si !== b.c.si) continue;
  const de = deltaE(a.lab, b.lab);
  if (de >= 3) continue;
  const row = [a.c.s.ko, a.label, a.hex, b.label, b.hex, fmt(de)];
  if (a.c.h === b.c.h && a.neutral) intentional.push(row);
  else similar.push({ row, de });
}
similar.sort((a,b) => a.de - b.de);

const dark = html.match(/--ink:\s*(#[0-9a-f]{6})/i)?.[1];
if (!dark) throw new Error('CSS --ink not found');
function luminance(hex) {
  const n = parseInt(hex.slice(1), 16);
  const lin = v => (v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  return 0.2126 * lin(n >> 16) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
}
function contrast(a,b) {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x,y) + 0.05) / (Math.min(x,y) + 0.05);
}
check('WCAG black/white reference', contrast('#000000','#FFFFFF') === 21);
const contrastRows = entries.map(e => ({ e, white:contrast(e.hex,'#FFFFFF'), dark:contrast(e.hex,dark) }));
const swatches = app.SEASONS.map(s => ({ s, h:app.seasonSwatch(s) }));
function pairRows(colors) {
  const rows = [];
  for (let i = 0; i < colors.length; i++) for (let j = i + 1; j < colors.length; j++)
    rows.push([colors[i].s.ko, colors[j].s.ko, deltaE(app.hexLab(colors[i].h),app.hexLab(colors[j].h))]);
  return rows;
}
const originalPairs = pairRows(swatches);
// Exhaustive 12^4 candidates; maximize the smallest of the six pairwise distances.
// This is geometric separation only, not a claim about seasonal symbolism or color vision.
const lookup = new Map();
function deHex(a,b) {
  const key = [a,b].sort().join('/');
  if (!lookup.has(key)) lookup.set(key,deltaE(app.hexLab(a),app.hexLab(b)));
  return lookup.get(key);
}
let best = null;
function choose(selected) {
  if (selected.length === app.SEASONS.length) {
    const distances = selected.flatMap((a,i) => selected.slice(i+1).map(b => deHex(a.h,b.h)));
    const min = Math.min(...distances), sum = distances.reduce((a,b)=>a+b,0);
    if (!best || min > best.min + 1e-10 || (Math.abs(min-best.min)<1e-10 && sum>best.sum)) best={selected:[...selected],min,sum};
    return;
  }
  for (const c of app.SEASONS[selected.length].colors) choose([...selected,c]);
}
choose([]);
const alternatives = best.selected.map((c,i) => ({ s:app.SEASONS[i], h:c.h, name:c.n }));

const cut = app.leanCuts();
function bucket(e) {
  const w=app.colorWarmth(e.lab);
  return { temp:w>0.25?'warm':w< -0.25?'cool':'neutral', chroma:e.lab.C<cut.c1?'soft':e.lab.C>cut.c2?'vivid':'middle', light:e.lab.L>cut.l2?'light':e.lab.L<cut.l1?'deep':'middle' };
}
function distribution(list) {
  const d={warm:0,cool:0,neutral:0,soft:0,chromaMiddle:0,vivid:0,light:0,lightMiddle:0,deep:0};
  list.forEach(e => { const b=bucket(e); d[b.temp]++; d[b.chroma==='middle'?'chromaMiddle':b.chroma]++; d[b.light==='middle'?'lightMiddle':b.light]++; });
  return d;
}
const chromatic = entries.filter(e => !e.neutral);
const distributions = [null,...app.SEASONS].map(s => {
  const list=chromatic.filter(e => !s || e.c.s.key===s.key), d=distribution(list);
  check(`Distribution totals ${s?.key||'all'}`, d.warm+d.cool+d.neutral===list.length && d.soft+d.chromaMiddle+d.vivid===list.length && d.light+d.lightMiddle+d.deep===list.length);
  return [s?.ko||'전체',list.length,d.warm,d.cool,d.neutral,d.soft,d.chromaMiddle,d.vivid,d.light,d.lightMiddle,d.deep];
});
const expected = [['warm','light','vivid'],['cool','light','soft'],['warm','deep','soft'],['cool','deep','vivid']];
const agreement = [], summaries=[];
app.SEASONS.forEach((s,si) => {
  for (const [label, list] of [['기본',chromatic.filter(e=>e.c.si===si&&e.lv===1)],['3단계',chromatic.filter(e=>e.c.si===si)]]) {
    const targets=expected[si];
    const matches=list.map(e=>{const b=bucket(e);return [b.temp===targets[0],b.light===targets[1],b.chroma===targets[2]];});
    const counts=[0,1,2].map(i=>matches.filter(m=>m[i]).length);
    agreement.push([s.ko,label,list.length,`${targets[0]} ${percent(counts[0],list.length)}`,`${targets[1]} ${percent(counts[1],list.length)}`,`${targets[2]} ${percent(counts[2],list.length)}`,percent(counts.reduce((a,b)=>a+b,0),list.length*3),percent(matches.filter(m=>m.every(Boolean)).length,list.length)]);
  }
  const keys=s.colors.map(c=>c.h); // Actual UI keys for liking all twelve base colors.
  const result=app.leanOf(keys), words=app.leanWords(result);
  summaries.push([s.ko,keys.length,words.length?app.t('leanOf')(words):'(동률: 요약 문장 없음)',JSON.stringify(result.n)]);
});

const failures=checks.filter(c=>!c.ok), passed=checks.length-failures.length;
const directionWarnings=app.SEASONS.flatMap((s,i)=>{
  const words=app.leanOf(s.colors.map(c=>c.h)).words;
  return expected[i].every(w=>words.includes(w))?[]:[`${s.ko}: 기대 ${expected[i].map(w=>app.T.ko.lw[w]).join('·')}, 실제 **${summaries[i][2]}**`];
});
const sourceHash=createHash('sha256').update(html).digest('hex');
const sections=[
  '# 색 데이터 감사 — 2026-11-04',
  `실행: \`node tools/audit-colors.mjs\`. Node 내장 모듈만 사용. 앱 v${version}, 마지막 script에서 실제 상수·함수를 추출한다. 앱 코드는 수정하지 않는다.`,
  `데이터·계산 무결성 검사 **${passed}통과·${failures.length}실패**. ΔE < 3 검토 경고 **${similar.length}쌍**(의도된 무채색 단계 반복 ${intentional.length}쌍 별도). 대비 부족은 정보용이며 실패로 막지 않는다.`,
  `꼭 검토할 요약 방향: ${directionWarnings.length?directionWarnings.join('; '):'기본색 전체 선택에서 기대 세 방향과 일치'}. 계산은 확실하며, 기대 방향의 타당성은 이번 감사에서 검증하지 않았다.`,
  '## 1. 색 형식과 유사색',
  `${app.FLAT.length}색 × ${app.LEVELS.length}단계 = ${entries.length}건. #RRGGBB 검사 실패 ${checks.filter(c=>c.name.endsWith(' hex')&&!c.ok).length}. **확실:** 출력은 sRGB 8비트 범위다. hslToHex가 채도와 RGB를 clamp하므로 원래 지각적 색역이나 단계 차이까지 보장하지는 않는다.`,
  '같은 계절의 모든 단계 조합을 비교한다(서로 다른 색·같은 색의 단계 포함). ΔE < 3은 이번 작업에서 지정한 검토 기준이며 모든 화면·관찰자에게 통하는 식별 한계라는 뜻은 아니다. **확실:** 계산값. **추정:** 사용자에게 비슷하게 보일 가능성.',
  table(['계절','색 A','A HEX','색 B','B HEX','ΔE00'],similar.map(x=>x.row)),
  `무채색은 앱이 세 단계를 같은 색으로 반환한다. 아래 ${intentional.length}쌍은 의도된 반복으로 경고에서 제외했다.`,
  table(['계절','색 A','A HEX','색 B','B HEX','ΔE00'],intentional),
  '## 2. 이름',
  `ko(n)·en(e) ${app.FLAT.length*2}개에 대해 빈 값과 전체 팔레트 중복(NFKC·trim·영어 대소문자 무시)을 검사했다. ${nameIssues.length?nameIssues.join('; '):'누락·중복 없음. 확실.'}`,
  '## 3. 글자 대비 (정보용)',
  `흰색 #FFFFFF와 CSS --ink에서 읽은 ${dark}를 각각 모든 변형 색과 비교한다. 흰색 미달 ${contrastRows.filter(r=>r.white<4.5).length}/${entries.length}, 어두운색 미달 ${contrastRows.filter(r=>r.dark<4.5).length}/${entries.length}. 판정은 반올림 전 4.5:1을 기준으로 한다.`,
  '[W3C WCAG 2.2 대비 설명](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)의 상대 휘도 비율을 사용했다. **확실:** 색쌍의 대비. 실제 앱 텍스트는 패널·그라데이션 위에 놓이는 경우도 있어 이 표만으로 화면 전체의 WCAG 적합성을 판정하지 않는다. **제안:** 색 위에 글자를 직접 놓는 경우 밝기에 따라 전경색 또는 불투명 배경을 선택한다.',
  ...[['흰 글자','#FFFFFF','white'],['어두운 글자',dark,'dark']].flatMap(([title,color,key])=>[
    `### ${title} ${color}: 4.5 미만 전부`,
    table(['계절','색·단계','HEX','대비'],contrastRows.filter(r=>r[key]<4.5).map(r=>[r.e.c.s.ko,r.e.label,r.e.hex,fmt(r[key])])),
  ]),
  '## 4. 계절 막대 대표색',
  table(['계절','현재','제안(계절 팔레트 안)','제안 HEX'],swatches.map((w,i)=>[w.s.ko,w.h,alternatives[i].name,alternatives[i].h])),
  table(['계절 A','계절 B','현재 ΔE00','제안 ΔE00'],originalPairs.map((p,i)=>[p[0],p[1],fmt(p[2]),fmt(pairRows(alternatives)[i][2])])),
  `현재 6쌍의 최소 ΔE ${fmt(Math.min(...originalPairs.map(p=>p[2])))} → 제안 ${fmt(best.min)}. 각 계절 기본 12색에서 한 색씩 고르는 12⁴ 조합을 전수 비교해 최소 쌍별 거리를 최대화했다(동률이면 거리 합). **확실:** 이 후보 집합의 계산상 최적. **추정:** 막대가 더 구분될 가능성. 계절 상징성·색각 다양성은 별도 사용자 검토가 필요하다. 제안만 하고 앱에는 적용하지 않았다.`,
  '## 5. 요약 경계값과 기대 방향',
  `앱의 isNeutral(HSL saturation < 0.08)로 ${entries.length-chromatic.length}개 변형을 제외해 ${chromatic.length}개를 사용. 경계: C₁=${cut.c1.toFixed(6)}, C₂=${cut.c2.toFixed(6)}, L₁=${cut.l1.toFixed(6)}, L₂=${cut.l2.toFixed(6)}. 앱의 floor(p×(N−1)) 분위수와 엄격한 <, >를 그대로 따른다. 경계와 같은 값은 중간이며 온도 ±0.25 안쪽은 무(무채색과 별개)다.`,
  table(['계절','N','웜','쿨','무','부드러움','채도 중간','선명','밝음','명도 중간','깊음'],distributions),
  '기대 방향은 작업 지시의 가정이다. 분모는 각 계절의 무채색 제외 개수. 축 평균은 세 축 적중률의 평균, 모두 일치는 세 방향을 동시에 만족한 비율이다. 기본색과 3단계 전체를 나누어 밝기·채도 변형에 따른 차이를 보인다. 이것은 개인에게 어울리는지의 정확도가 아니다.',
  table(['계절','범위','N','온도 일치','밝기 일치','채도 일치','축 평균','모두 일치'],agreement),
  '### 한 계절의 기본색 12개만 모두 ♥했을 때 (앱 leanOf·leanWords·한국어 문구 그대로)',
  table(['계절','담은 수','실제 한 줄','실제 축별 개수'],summaries),
  '**제안:** 계절 명칭과 요약 축이 다를 때 우선 실제 단색·경계 부근을 검토한다. 요약을 계절 이름에 억지로 맞추거나 경계를 변경하지 않는다. 무채색 제외 규칙·온도 대리식의 의미와 실제 사용자 인식을 따로 검증한다. **모름:** 실기기·조명별 지각 차이와 퍼스널컬러 타당성.',
  '## 검증과 한계',
  `[Sharma·Wu·Dalal의 수식과 참조 데이터](https://hajim.rochester.edu/ece/sites/gsharma/ciede2000/)로 CIEDE2000을 구현했다. 공개 참조 쌍 1–16 및 대칭성을 매 실행 확인하며 허용 오차는 0.00005다. sRGB→Lab는 앱 함수를 그대로 사용한다. 계산 자체가 틀리면 중단하며 데이터 검사 실패 시 보고서 작성 후 종료 코드 1, 검토 경고만 있으면 0이다.`,
  `추출 함수: ${functions.join(', ')}. 이 vm은 신뢰하는 로컬 저장소 코드를 제한된 문맥에서 평가하기 위한 것으로 보안 샌드박스라는 뜻은 아니다. 소스 SHA-256(UTF-8 텍스트): \`${sourceHash}\`.`,
  failures.length?`실패 목록: ${failures.map(c=>c.name).join(', ')}`:'데이터·계산 무결성 검사 실패 없음. 유사색·대표색·기대 방향 문제는 위의 검토 항목에 남긴다.',
];
mkdirSync(resolve(root,'docs'),{recursive:true});
writeFileSync(resolve(root,'docs/COLOR-AUDIT.md'),sections.join('\n\n')+'\n');
console.table([{검사:checks.length,통과:passed,실패:failures.length,유사색경고:similar.length,의도된반복:intentional.length}]);
console.table(similar.map(({row})=>({계절:row[0],색A:row[1],색B:row[3],색차:row[5]})));
console.table([{전경:'#FFFFFF',미달:contrastRows.filter(r=>r.white<4.5).length,전체:entries.length},{전경:dark,미달:contrastRows.filter(r=>r.dark<4.5).length,전체:entries.length}]);
console.table(distributions.map(r=>Object.fromEntries(['계절','N','웜','쿨','무','부드러움','채도중간','선명','밝음','명도중간','깊음'].map((k,i)=>[k,r[i]]))));
console.table(originalPairs.map((p,i)=>({계절:`${p[0]} / ${p[1]}`,현재:fmt(p[2]),제안:fmt(pairRows(alternatives)[i][2])})));
console.table(summaries.map(r=>({계절:r[0],요약:r[2]})));
console.log('Report: docs/COLOR-AUDIT.md');
process.exitCode=failures.length?1:0;
