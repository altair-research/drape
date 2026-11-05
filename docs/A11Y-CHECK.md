# 접근성 점검 (보고만, 앱 변경 없음) — 2026-11-05

> 브랜치 `claude/a11y-check` · 검사 코드 `tests/e2e/a11y.spec.js` · 대상 사이트 v36(`index.html`, origin/main a090be5 시점)
> 도구: axe-core **4.14.0**(2026-10-05 배포, `package.json` devDependencies 에 정확한 버전으로 고정), Playwright 1.64.1 의 Chromium·WebKit(Windows 빌드).
> 사진은 합성 캔버스 그림만, 카메라는 거부 상태로 흉내, 서비스워커 차단(helpers.js 그대로).
> 원자료: 실행하면 `test-results/a11y/<브라우저>-<언어>-{axe,keyboard,names-motion-sr}.json` 이 생긴다(git 제외). 아래 표는 그 JSON 을 옮긴 것.
> 이 검사는 **현재 상태를 기록**만 한다 — 위반이 있어도 테스트는 통과하고, 페이지가 안 뜨는 등 실행 실패만 실패로 친다.

## 한 줄로
axe 기준 **치명(critical) 2건·심각(serious) 2종(3개 요소)** — 두 언어·두 엔진에서 같다. 치명 2건은 둘 다 ♥ 탭(`#heartTab`) 한 요소 때문이라 **속성 하나(`role="tab"`, 677행)** 로 없어진다.
그보다 실사용에 큰 문제는 키보드다: **Esc 로 아무 창도 안 닫히고, 창을 열고 닫을 때 초점이 옮겨지지 않으며, 초점이 창 안에 갇히지 않는다.** ♥ 버튼에 초점을 두고 **스페이스를 누르면 좋아요가 안 된다**(전역 스페이스=직전 색 비교가 가로챔). 화면 낭독기는 **지금 색 이름 변화를 듣지 못한다**(aria-live 없음).

## v37 적용 (2026-11-05 새벽, 프로젝트 타워)

적용: S1~S9, M1(창 열고 닫기·Esc·Tab 가두기), M2(버튼 위 스페이스), M3(창 열린 동안 뒤 화면 키 무시), M7(움직임 줄이기), 흰 종이 안내 취소 뒤 초점을 ⋯ 로. 덤: 글꼴 CSS 에 crossorigin 을 붙여 서비스워커가 오프라인용으로 저장할 수 있게 함.
결과(같은 a11y.spec, 두 브라우저 × 한/영): axe critical·serious **0** (남은 것 moderate `page-has-heading-one` 1). Esc 로 안내·메뉴·목록·흰 종이 안내 닫힘, 열면 제목으로 초점, 닫으면 연 버튼으로, 창 안 Tab 순환, 스페이스로 ♥. 전체 테스트 Chromium 34/34, WebKit 31/31.
v38 에서 M4(Tab 57→10)·M5(Enter/Space 누르는 동안 비교)·M6(손잡이 slider, 화살표 5%) 적용. v39 에서 L1(inert)·L2(숨은 h1) 적용 → axe 위반 0. v41 에서 M8 적용. 남김: L3(실기기 낭독기 시험 — 사용자 폰).

## 1. axe 위반 (WCAG 2.0/2.1/2.2 A·AA + best-practice 태그)

ko·en, Chromium·WebKit **네 조합 모두 결과가 같았다**(규칙·요소·개수 일치). 숫자는 "그 화면에서 걸린 요소 수".

| 영향 | 규칙 | 요소 | 안내 팝업 | 카메라 거부 화면 | 메인(사진) | 메뉴 | 흰 종이 안내 | 좋아요 목록(5색) |
|---|---|---|---|---|---|---|---|---|
| **critical** | `aria-allowed-attr` — 역할 없는 버튼에 `aria-selected` | `#heartTab` | 1 | 1 | 1 | 1 | 1 | 1 |
| **critical** | `aria-required-children` — tablist 안에 tab 이 아닌 자식 | `#tabs` (원인은 `#heartTab`) | 1 | 1 | 1 | 1 | 1 | 1 |
| **serious** | `label-content-name-mismatch` — 보이는 글자(개수 "5")가 이름("좋아요끼리 비교")에 없음 | `#heartTab` | 1 | 1 | 1 | 1 | 1 | 1 |
| **serious** | `color-contrast` — 2.34:1 (#e2e0db / #999280, 11.5px) | `#hint` (색 넘기기 안내) | – | – | 1 | – | 1 | – |
| **serious** | `color-contrast` — 3.55:1 (#6c6b6c / #121112, 11px) | `#ver` (메뉴 아래 버전) | – | – | – | 1 | – | – |
| moderate | `region` — 랜드마크 밖 내용 | `#cam`/`#shot`, `.readout`, `#hint`, 계절 탭 등 | 10 | 10 | 7 | 11 | 8 | 11 |
| moderate | `landmark-one-main` — `<main>` 없음 | `html` | – | 1 | 1 | – | 1 | – |
| moderate | `page-has-heading-one` — `<h1>` 없음 | `html` | – | 1 | 1 | – | 1 | – |

- 고유 위반: critical 2규칙(요소 2) · serious 2규칙(요소 3: `#heartTab`, `#hint`, `#ver`) · moderate 3규칙.
- `#hint` 대비는 **배경 사진에 따라 달라진다**. 2.34:1 은 합성 그림(밝은 노랑) 위에서 잰 값 — 실제 얼굴·방 배경에서는 더 좋을 수도 나쁠 수도 있다(확신도 **추정**). 밝은 배경에서 기준(4.5:1) 미달인 건 **확실**.
- 안내 팝업·메뉴·목록이 떠 있을 때 `landmark-one-main` 이 안 잡히는 건 axe 가 덮인 화면을 건너뛰기 때문으로 보인다(**추정**). 위반이 없어진 게 아니다.
- axe 가 못 보는 것(아래 2~4절에서 따로 확인): 키보드로 실제 움직이는지, 초점 이동·복귀, 낭독기에 바뀐 내용이 들리는지.

## 2. 키보드만으로 (Tab·Enter·Space·Esc·화살표)

| 확인 | Chromium | WebKit | 비고 |
|---|---|---|---|
| 안내 팝업 열릴 때 초점 | ✅ `시작하기`에 감 | ✅ | 1328행 `introGo.focus()` |
| 팝업 안에 초점 갇힘 | ❌ Tab 한 번에 밖(손잡이·뒤 화면)으로 | ❌ | `aria-modal="true"` 인데 실제로는 안 막힘 |
| Esc 로 팝업 닫힘 | ❌ | ❌ | Enter 로 `시작하기`는 됨 |
| 팝업 닫힌 뒤 초점 | ❌ `body`(문서 처음) | ❌ `body` — **이후 Tab 이 계속 `body` 에 머묾** | 아래 'WebKit 초점 멈춤' |
| 카메라 거부 화면의 `사진 올리기`까지 Tab | ✅ 7번 | ❌ 40번 눌러도 못 감(멈춤) | 파일 고르는 창 자체는 OS 화면이라 검사 밖 |
| 메인 → `더보기(⋯)`까지 Tab | ✅ **57번** | ❌ 80번 눌러도 못 감(멈춤) | 계절 탭 4 + ♥탭 + **색 칩 48개** + 버튼 3 을 다 지나야 한다 |
| `더보기` 초점 표시 | ✅ 흰 2px 테두리 | ✅ | `.btn:focus-visible`(270행) |
| 메뉴 열 때 초점 | ❌ `더보기`에 그대로 | ❌ | 다음 Tab 이 마침 메뉴 첫 줄이라 1번에 닿음 |
| 메뉴 → `흰 종이로 색 맞추기`까지 | ✅ 1번 | ✅ 1번 | (카메라 없어 `카메라`·`빛 고정` 줄이 숨은 상태) |
| `흰 종이` 줄 초점 표시 | ✅ 브라우저 기본 링(흰색) | △ 기본 링이 **매우 옅음** | `.mrow` 에 `:focus-visible` 스타일 없음. 스크린샷 육안(확신도 **추정**) |
| 메뉴 안에 초점 갇힘 | ❌ `닫기` 다음 Tab 이 뒤 화면으로 | ❌ | WebKit 은 메뉴의 링크 2개(의견·개인정보)를 Tab 으로 건너뜀 — 사파리 기본 설정(링크는 Option+Tab) |
| Esc 로 메뉴 닫힘 | ❌ | ❌ | |
| 흰 종이 시작(Enter) 뒤 초점 | ❌ `body` | ❌ `body` | 메뉴가 닫히며 초점 잃음 |
| `취소`까지 Tab | ✅ 5번 | ❌ 40번 눌러도 못 감(멈춤) | |
| Esc 로 흰 종이 안내 닫힘 | ❌ | ❌ | |
| 화살표로 색 바꾸기 | ✅ | ✅ | 852~861행, 초점 위치와 무관하게 동작 |
| `좋아요`까지 Tab | ✅ 48번 | ✅ 55번 | |
| `좋아요` 초점 표시 | ✅ 흰 2px | ✅ | |
| `좋아요`에서 **Enter** | ✅ 담김 | ✅ | |
| `좋아요`에서 **Space** | ❌ **안 담김** | ❌ | 860행 전역 스페이스(직전 색 비교)가 `preventDefault` 로 버튼 클릭을 막음. 직전 색이 생긴 뒤부터 |
| 좋아요 목록 열기(Enter) | ✅ | ✅ | |
| 목록 열 때 초점 | ❌ `담은 색` 버튼에 그대로 | ❌ | 다음 Tab 이 `⋯` 를 거쳐 목록으로 |
| 목록 안에 초점 갇힘 | ❌ `전체 지우기` 다음 뒤 화면으로 | ❌ | |
| Esc 로 목록 닫힘 | ❌ | ❌ | `돌아가기` Enter 는 됨 |
| 닫은 뒤 초점이 `담은 색`으로 돌아옴 | ❌ `body` | ❌ `body` | |
| 드레이프 손잡이를 키보드로 | ❌ 화살표 무반응 | ❌ | 포인터 드래그만(825~836행). 화살표 위/아래는 계절 이동으로 쓰임 |
| `직전 색 비교` 버튼 Enter | ❌ 반응 없음(코드 확인) | ❌ | `pointerdown`만 들음(874행). 초점이 버튼 밖일 때 Space 는 됨 |

**WebKit 초점 멈춤**(확신도 **추정**): 초점이 있던 요소가 숨겨지면(팝업·메뉴가 닫힘) 이 WebKit 빌드에서는 그 뒤 Tab 이 계속 `body` 에 머물렀다. 화면을 한 번 클릭하면 풀린다. Chromium 은 문서 처음부터 다시 돈다. 따로 짧은 시험(팝업 Enter 로 닫기·마우스로 닫기 → Tab 6번 모두 `body`)으로 재현했다. 실제 iPhone Safari 에서도 같은지는 **모름**(Safari 는 키보드 Tab 이 기본으로 버튼에 가지도 않는다). 어느 쪽이든 '닫을 때 초점을 연 버튼으로 돌려주기'(중간 M1)로 함께 풀린다(**추정**).

**초점 링**: 스크린샷(커밋 안 함)으로 보니 `.btn`·칩·탭은 흰 2px 테두리가 또렷하다. 메뉴 줄(`.mrow`)만 브라우저 기본 링에 기대 WebKit 에서 옅다.

## 3. 버튼 이름·언어·움직임 줄이기

- **아이콘 버튼 이름: 두 언어 모두 있음 ✅** (이름 없는 버튼 0개)
  | 버튼 | ko | en |
  |---|---|---|
  | `⋯` `#menuBtn` | 더보기 | More |
  | ♥ 탭 `#heartTab` | 좋아요끼리 비교 *(개수 빠짐 → serious)* | Compare liked colors |
  | 손잡이 `#handle` | 드레이프 높이 조절 | Adjust drape height |
  | 카메라 전환 `#flipTop` | 전면/후면 카메라 전환… (문장 전체) | Switch front/rear camera… |
  | 색 칩 | 봄 웜 · 아이보리 | Spring Warm · Ivory |
  | 채도 단계 | 흐리게/기본/선명하게 | Muted/Base/Vivid |
  | 사진 `#shot` alt | 업로드한 사진 | Uploaded photo |
  - 빈 곳: 채도 단계 묶음 `#levels`(418행) 은 `role="group"` 인데 이름이 없다. `#flipTop` 이름이 설명문 전체라 낭독이 길다(짧은 이름 + `title` 권장).
  - 번역 안 되는 글: `#cMatchWrap` 의 `title`(414행, 한국어 고정) — 지금은 어울림 %가 꺼져 있어(`MATCH_ENABLED=false`) 화면에 안 나온다.
- **`<html lang>` 이 언어 전환을 따라감 ✅** — ko 로 시작 → `lang="ko"`, 언어 버튼 → `lang="en"`(1260행). en 시작도 반대로 확인.
- **prefers-reduced-motion ✅(CSS) / △(JS)** — 줄이기 설정에서 안내 팝업 애니메이션 `none`, 칩 전환 `0s`; 설정 없음에서는 `introUp`·`0.16s`(381~383행 동작 확인). 다만 색을 넘길 때 칩 띠를 `scrollIntoView({behavior:"smooth"})`(690행)로 부드럽게 굴리는 건 미디어쿼리를 보지 않는다(코드 확인, **확실**). 움직임이 작아 우선순위는 낮다.

## 4. 화면 낭독기가 지금 색 이름을 알 수 있나 — **아니오**

- `aria-live`·`role="status"` 영역이 **0개**. 화살표·스와이프로 색을 바꾸면 `#cName`(408행) 글자는 바뀌지만 초점은 `body` 에 그대로라 아무것도 읽히지 않는다(확실 — DOM 확인. 실제 TalkBack/VoiceOver 소리는 **모름**, 기기 시험 안 함).
- 대신 들을 방법: 색 칩에 Tab 으로 가면 "봄 웜 · 웜 베이지, 눌림" 처럼 이름과 `aria-pressed` 가 읽힌다(확실: 속성 존재). 하지만 칩 48개를 Tab 으로 지나야 해서 실용적이지 않다.
- 낭독 트리에서 읽히는 상단 글: "Warm Beige Spring Warm · bright & clear · yellow undertone" — 이름은 있으니 **알림만 붙이면 된다.**
- 제안: 407행 `<div>`(색 이름+계절을 감싼 것)에 `aria-live="polite" aria-atomic="true"` (작은 S3). 빨리 넘길 때 여러 번 읽힐 수 있어, 원하면 300ms 쯤 모아 마지막 것만 읽게 한다(중간).

## 5. 고칠 제안 (적용 안 함 — 프로젝트 타워가 고른다)

행 번호는 이 브랜치의 `index.html`(v36). 확신도: 확실 = 실행·코드로 확인, 추정 = 근거는 있으나 기기·사용자 시험 없음, 모름 = 확인 수단 없음.

### 작은 것 (속성·값 하나)
| # | 행 | 고칠 것 | 효과 | 확신도 |
|---|---|---|---|---|
| S1 | 677 | `heartTab` 에 `heartTab.setAttribute("role","tab")` (또는 `heartTab.role="tab"`) | **critical 2건 → 0** (`aria-allowed-attr`, `aria-required-children`) | 확실(규칙 정의상) |
| S2 | 1271 (+805) | ♥탭 `aria-label` 에 개수 포함: `t("keptCompare")+" "+kn` 을 805행 개수 갱신 때 함께 | serious `label-content-name-mismatch` 해소 | 확실 |
| S3 | 407 | 색 이름 묶음 `<div>` 에 `aria-live="polite" aria-atomic="true"` | 낭독기가 바뀐 색 이름을 읽음 | 효과 추정(기기 시험 필요) |
| S4 | 157 | `.menu .ver` 색 `rgba(255,255,255,.38)` → `.6` | 3.55:1 → 약 7:1, serious 해소 | 확실(계산) |
| S5 | 179 | `.hint` 배경 `rgba(0,0,0,.4)` → `.62`(흰 종이 안내 `.wbtip` 과 같은 값), 글자 `.72` → `.9` | 흰 배경 위에서도 약 5:1(계산) | 추정(배경 사진 따라 다름) |
| S6 | 418 | `#levels` 에 `aria-label` (applyLang 에서 "채도"/"Saturation") | 묶음 이름 생김 | 확실 |
| S7 | 155 다음 | `.mrow:focus-visible{outline:2px solid var(--fg);outline-offset:2px}` 한 줄 | WebKit 에서도 메뉴 줄 초점이 또렷 | 추정(육안) |
| S8 | 391 | `<div class="app">` → `<main class="app">` | moderate `landmark-one-main`·`region` 대부분 해소 | 확실 |
| S9 | 464·483 | 메뉴·목록에 `role="dialog" aria-modal="true" aria-labelledby="menuTitle"`/`"sheetTitle"` | 낭독기가 '대화상자'로 알림 — **M1 과 함께** 넣어야 함(초점이 안 들어가면 오히려 헷갈림) | 확실(속성) / 효과 추정 |

### 중간 (함수 하나·수십 줄)
| # | 행 | 고칠 것 | 확신도 |
|---|---|---|---|
| M1 | 852~861, 899~900, 1226~1232, 1328~1333, 1357~1358 | **창 열고 닫기 정리**: 열면 첫 버튼(또는 제목, `tabindex="-1"`)으로 초점, 닫으면 연 버튼(`⋯`·`담은 색`)으로 돌려줌, **Esc 로 팝업·메뉴·목록·흰 종이 안내 닫기**. 열려 있는 동안 Tab 을 창 안에서 돌리기(첫↔끝) | 확실(없음을 확인). WebKit 초점 멈춤도 함께 풀릴 것 — 추정 |
| M2 | 860 | 전역 스페이스(직전 색 비교)를 `if(e.target.closest("button,a")) return;` 로 버튼 위에서는 건너뛰기 → **Space 로 ♥ 가능** | 확실(Space 로 안 담김 재현) |
| M3 | 852 | 창(메뉴·목록·팝업)이 열려 있으면 화살표·`[` `]`·스페이스를 무시 — 지금은 목록을 보는 중에도 뒤에서 색이 바뀐다 | 확실(코드) |
| M4 | 668~675, 786~789 (+탭 661~666) | 색 칩 48개를 '대표 1개만 Tab'(roving tabindex: 선택된 칩만 `tabindex=0`, 나머지 `-1`) — 화살표로 이미 넘길 수 있으니 Tab 57번 → 약 10번 | 확실(횟수) |
| M5 | 874~875 | `직전 색 비교`에 키보드: Enter/Space 를 누르는 동안 비교(keydown/keyup), 또는 누를 때마다 전환 | 확실(없음) |
| M6 | 404, 825~836 | 손잡이를 `role="slider"`(`aria-valuemin=24` `max=82` `now`)로, 초점 있을 때 위/아래 화살표로 5%씩 — 전역 화살표보다 먼저 처리하고 `stopPropagation` | 확실(없음) |
| M7 | 690 | `matchMedia("(prefers-reduced-motion: reduce)").matches` 면 `behavior:"auto"` | 확실 |
| M8 | 1303 | `#flipTop` 이름을 짧게("카메라 전환"/"Switch camera"), 긴 설명은 `title` 에만 | 확실 |

### 큰 것 (구조)
| # | 고칠 것 | 확신도 |
|---|---|---|
| L1 | 창이 열리면 뒤 화면(`.stage`·`.console`)에 `inert` — 초점 가두기와 낭독기 차단을 한 번에. Safari 15.5+·Chrome 102+ 지원 | 확실(사양) / 구형 기기 영향 모름 |
| L2 | 보이지 않는 `<h1>Personal Color Mirror</h1>` 과 제목 구조(`h2` 메뉴·목록) 정리, 계절 탭에 `aria-controls`(칩 띠를 `tabpanel` 로) | 확실 |
| L3 | **실기기 낭독기 시험** — Android TalkBack(Play 앱 TWA)·iPhone VoiceOver 로 처음 실행→색 넘기기→♥→목록. 자동 검사로는 소리를 못 듣는다 | 모름(아직 안 함) |

**제일 먼저 하나만**: S1(677행 `role="tab"`) — 한 줄로 critical 이 0 이 된다. 실사용 영향이 가장 큰 건 M1+M2(키보드·초점), 낭독기 쪽은 S3.

## 6. 기존 테스트 전체 실행 (브라우저 하나씩, 동시 실행 없음 — `WEBKIT-DIAG.md` 방침)

| 브라우저 | 결과 | 시간 | 구성 |
|---|---|---|---|
| Chromium | **34 통과 / 0 실패** | 3.1분 | app 17 + mobile 8 + release 3 + a11y 6 |
| WebKit | **30 통과 / 1 실패(시간 초과)** → 그 1건 혼자 재실행 **통과** | 3.8분 | app 17 + mobile 8 + a11y 6 (release 는 Chromium 전용) |

a11y.spec.js 단독: Chromium 6/6, WebKit 6/6 통과. WebKit 키보드 테스트는 처음 판에서 2건 실패했는데 앱 문제가 아니라 **검사 코드가 'Tab 으로 `⋯` 에 닿는다'고 가정**했기 때문이었다(위 'WebKit 초점 멈춤'). 닿지 못하면 기록하고 그 버튼에 직접 초점을 준 뒤 이어가도록 고쳐 6/6.

WebKit 전체 실행의 1 실패는 새 a11y 키보드 테스트(en)가 기본 제한 30초를 넘긴 것이다(키를 약 300번 누름, 혼자 돌리면 21초). 앱 기존 테스트(app·mobile 25건)는 전부 통과. 방침대로 혼자 다시 돌려 통과를 확인했고, 이 테스트만 제한을 90초로 늘린 뒤 a11y WebKit 6/6 을 다시 확인했다(앱 문제 아님 — 확신도 **추정**: 시간 초과 지점이 매번 같은 곳은 아니었을 수 있으나 재실행 통과).

## 다시 해 보는 법
```sh
node node_modules/@playwright/test/cli.js test tests/e2e/a11y.spec.js --project=chromium --reporter=line
node node_modules/@playwright/test/cli.js test tests/e2e/a11y.spec.js --project=webkit --reporter=line   # Chromium 끝난 뒤
```
결과 JSON: `test-results/a11y/`. 초점 링 스크린샷: `test-results/a11y/<브라우저>-<언어>-focus/*.png`(커밋하지 않는다).
