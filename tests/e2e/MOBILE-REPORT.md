# 작은 폰·WebKit 점검 — 2026-11-04

최종 전체 검사 **43통과·7실패**, skip 0. `codex/e2e-tests`의 `8e39e55` 위에서 `codex/mobile-fixes`로 작업했다. 수정 전 v35 → 검토용 v36. main 병합·푸시·배포 없음.

## 고친 문제

앱 수정은 CSS와 버전 숫자뿐이다. 기능·문구·색 데이터·이벤트 로직·SVG 보정 필터는 그대로다. 스타일 블록과 APP_VERSION을 제외한 index.html이 ①과 동일한지 비교했다. sw.js는 캐시 버전만 drape-v35 → drape-v36으로 바꿨다.

| 문제(관측은 확실) | 수정 | 전후 증거 |
|---|---|---|
| 320px 첫 안내 상단이 한국어 -180.5px, 영어 -259.5px까지 화면 밖 | 카드 높이 제한·내부 세로 스크롤 | [전](mobile-shots/before/chromium-320-ko-intro.png) / [후](mobile-shots/after/chromium-320-ko-intro.png) · [전](mobile-shots/before/webkit-320-en-intro.png) / [후](mobile-shots/after/webkit-320-en-intro.png) |
| 320px 좋아요 목록 내부 폭 408px, 전체 지우기 버튼이 오른쪽 밖 | 목록 조작 버튼 줄바꿈 | [전](mobile-shots/before/chromium-320-ko-saved.png) / [후](mobile-shots/after/chromium-320-ko-saved.png) · [전](mobile-shots/before/webkit-320-en-saved.png) / [후](mobile-shots/after/webkit-320-en-saved.png) |
| 320px 좋아요 취소 상태에서 콘솔 폭 344px, 메뉴 버튼 잘림 | 3개 유연 열 + 40px 메뉴 열, 긴 라벨 줄바꿈 | [전](mobile-shots/before/chromium-320-ko-levels.png) / [후](mobile-shots/after/chromium-320-ko-levels.png) |
| 단계 26px, 저장 색 28px, 취소 27.5px, 탭 33px, 손잡이 34px, 기본 버튼 약 37px | 검사 경로의 버튼 최소 40px, 하단 조작부 최소 44px | [전](mobile-shots/before/webkit-320-ko-levels.png) / [후](mobile-shots/after/webkit-320-ko-levels.png) · [전](mobile-shots/before/chromium-360-ko-balance.png) / [후](mobile-shots/after/chromium-360-ko-balance.png) |
| 모의 safe-area에서 패널 제목·하단 좌우 버튼 침범 | 앱 좌우·안내 네 방향·패널 상단/좌우에 env 여백 적용 | [전](mobile-shots/before/webkit-320-ko-safe-menu.png) / [후](mobile-shots/after/webkit-320-ko-safe-menu.png) |
| WebKit 패널에 뒤쪽 색 이름·조작부가 비쳐 글자가 겹쳐 보임 | 패널 불투명도 86% → 96% | [전](mobile-shots/before/webkit-375-ko-menu.png) / [후](mobile-shots/after/webkit-375-ko-menu.png) · [전](mobile-shots/before/webkit-375-ko-saved.png) / [후](mobile-shots/after/webkit-375-ko-saved.png) |

첫 수정 뒤 WebKit 375px 한국어 모의 safe-area에서 두 줄 '좋아요 취소' 버튼만 높이 52px로 계산되어 하단 안전 경계 778px를 4px 넘었다(버튼 y=730, h=52). 다른 버튼은 y=734, h=44였다. 하단 열의 세로 정렬을 stretch로 바꾸어 함께 맞췄다. 이 중간 실행은 49통과·1실패였으며, 최종 결과와 구분한다.

작은 화면의 안내 시작 버튼과 목록 마지막 버튼 줄은 **세로로 스크롤해서 접근**한다. 가로로 밀 필요는 없다. [안내 아래쪽](mobile-shots/after/chromium-320-ko-intro-bottom.png) · [목록 아래쪽](mobile-shots/after/chromium-320-ko-saved-bottom.png) · [WebKit 안내 아래쪽](mobile-shots/after/webkit-320-ko-intro-bottom.png) · [WebKit 목록 아래쪽](mobile-shots/after/webkit-320-ko-saved-bottom.png)

## 검사 결과

| 브라우저 | 검사 | 통과 | 실패 | skip |
|---|---|---|---|---|
| chromium | e2e | 17 | 0 | 0 |
| chromium | mobile | 8 | 0 | 0 |
| webkit | e2e | 11 | 6 | 0 |
| webkit | mobile | 7 | 1 | 0 |

수정 전 모바일 기준 검사는 **0통과·16실패**였다. 모든 조합에서 작은 터치 영역 또는 내부 넘침을 관측했다. 첫 안내 상단 잘림은 두 브라우저 모두 320px에서 재현했다. 색칩의 ♥ 장식이 원 밖으로 나오는 것은 의도된 배치여서 검사에서 제외했다. 초기 before JSON 일부에는 이 측정 항목도 남아 있으며 결함 수로 세지 않는다.

수정 후 16개 모바일 조합 중 문제 목록이 비어 있는 조합은 16개다. 문서/패널의 가로 넘침, 버튼 경계·40px 크기, 버튼 간 겹침, 버튼 글자의 가로·세로 경계, 스크롤 뒤 하단 버튼 접근, 색 단계 팝업을 검사했다. 테스트는 `mobile.spec.js`, 수치는 `mobile-shots/before/*.json`·`after/*.json`, 최종 실행 요약은 `mobile-shots/run-summary.json`에 있다.

촬영 보충: WebKit 360×780 한국어 조합만 독립 재실행해 **1통과·0실패**를 확인했다. 이 결과로 해당 조합의 마지막 사진·측정값을 채웠으며, 위 전체 검사 표의 7실패는 그대로 남긴다.

① 보고서의 WebKit 영어 실패 5건은 이전 기록으로 보존했다. 이번 결과는 위 표에 별도로 기록한다. 앱 로직을 바꾸지 않았으므로 실행 환경 문제가 CSS 덕분에 해결됐다고 해석하지 않는다. 전체 재검사 전 로컬 서버 시작 대기 20초 초과가 한 번 있었고 서버 시작 한도만 60초로 늘렸다. 앱 E2E의 30초 제한·실패 조건·재시도 0은 유지했다.

## 범위와 남은 확인

- 320×640, 360×780, 375×812, 412×915 × ko/en × Chromium/WebKit. Windows, Playwright 1.64.1, Chromium 156.0.8078.4, WebKit 27.2.
- 사진은 ①의 canvas 합성 PNG뿐이다. 사람 사진 없음. 서비스워커 차단·카메라 거절·외부 폰트 빈 CSS 대체 조건도 ①과 같다. 실제 외부 공유나 메시지 발송은 하지 않았다.
- safe-area는 페이지 CSS의 env 값을 top 44 / bottom 34 / left·right 20px로 치환한 별도 기하 검사다. **확실:** 모의 여백 경계. **모름:** 실제 노치와 Safari 주소 표시줄의 동적 변화. 실기기 확인 필요.
- **확인 필요:** 실제 iOS 카메라 영상의 `filter:url(#wbf)`. Windows WebKit 합성 사진과 실제 iPhone 영상은 구분한다. 영상 필터 대안·카메라 로직은 수정하지 않았으며 프로젝트 타워가 후속 판단한다.
- 자동 경계 검사와 대표 스크린샷을 함께 검토했다. 모든 글리프와 외부 웹폰트 렌더링을 완전 검증했다는 뜻은 아니다.

## 실행법

```sh
npm install
npx playwright install chromium webkit
npm test
```

모바일만: `npx playwright test mobile.spec.js`. 기본은 after 촬영이다. before는 v35에서 저장한 기준 자료이므로 현재 v36으로 덮어쓰지 않는다. PNG·측정 JSON은 재현 근거로 커밋한다.

## 스크린샷 목록

필수 80장씩(16조합 × 5화면)에 상세 증거를 더해 총 **172장**, 최대 **96343 bytes**로 모두 한 장 200KB 이하다. before 84장 / after 88장. 각 JSON의 shots 배열에도 파일명과 크기를 기록했다.

| 조합 | 첫 안내 | 기본 | 메뉴 | 종이 안내 | 6색 목록 |
|---|---|---|---|---|---|
| chromium-320-ko | [전](mobile-shots/before/chromium-320-ko-intro.png) / [후](mobile-shots/after/chromium-320-ko-intro.png) | [전](mobile-shots/before/chromium-320-ko-base.png) / [후](mobile-shots/after/chromium-320-ko-base.png) | [전](mobile-shots/before/chromium-320-ko-menu.png) / [후](mobile-shots/after/chromium-320-ko-menu.png) | [전](mobile-shots/before/chromium-320-ko-balance.png) / [후](mobile-shots/after/chromium-320-ko-balance.png) | [전](mobile-shots/before/chromium-320-ko-saved.png) / [후](mobile-shots/after/chromium-320-ko-saved.png) |
| chromium-320-en | [전](mobile-shots/before/chromium-320-en-intro.png) / [후](mobile-shots/after/chromium-320-en-intro.png) | [전](mobile-shots/before/chromium-320-en-base.png) / [후](mobile-shots/after/chromium-320-en-base.png) | [전](mobile-shots/before/chromium-320-en-menu.png) / [후](mobile-shots/after/chromium-320-en-menu.png) | [전](mobile-shots/before/chromium-320-en-balance.png) / [후](mobile-shots/after/chromium-320-en-balance.png) | [전](mobile-shots/before/chromium-320-en-saved.png) / [후](mobile-shots/after/chromium-320-en-saved.png) |
| chromium-360-ko | [전](mobile-shots/before/chromium-360-ko-intro.png) / [후](mobile-shots/after/chromium-360-ko-intro.png) | [전](mobile-shots/before/chromium-360-ko-base.png) / [후](mobile-shots/after/chromium-360-ko-base.png) | [전](mobile-shots/before/chromium-360-ko-menu.png) / [후](mobile-shots/after/chromium-360-ko-menu.png) | [전](mobile-shots/before/chromium-360-ko-balance.png) / [후](mobile-shots/after/chromium-360-ko-balance.png) | [전](mobile-shots/before/chromium-360-ko-saved.png) / [후](mobile-shots/after/chromium-360-ko-saved.png) |
| chromium-360-en | [전](mobile-shots/before/chromium-360-en-intro.png) / [후](mobile-shots/after/chromium-360-en-intro.png) | [전](mobile-shots/before/chromium-360-en-base.png) / [후](mobile-shots/after/chromium-360-en-base.png) | [전](mobile-shots/before/chromium-360-en-menu.png) / [후](mobile-shots/after/chromium-360-en-menu.png) | [전](mobile-shots/before/chromium-360-en-balance.png) / [후](mobile-shots/after/chromium-360-en-balance.png) | [전](mobile-shots/before/chromium-360-en-saved.png) / [후](mobile-shots/after/chromium-360-en-saved.png) |
| chromium-375-ko | [전](mobile-shots/before/chromium-375-ko-intro.png) / [후](mobile-shots/after/chromium-375-ko-intro.png) | [전](mobile-shots/before/chromium-375-ko-base.png) / [후](mobile-shots/after/chromium-375-ko-base.png) | [전](mobile-shots/before/chromium-375-ko-menu.png) / [후](mobile-shots/after/chromium-375-ko-menu.png) | [전](mobile-shots/before/chromium-375-ko-balance.png) / [후](mobile-shots/after/chromium-375-ko-balance.png) | [전](mobile-shots/before/chromium-375-ko-saved.png) / [후](mobile-shots/after/chromium-375-ko-saved.png) |
| chromium-375-en | [전](mobile-shots/before/chromium-375-en-intro.png) / [후](mobile-shots/after/chromium-375-en-intro.png) | [전](mobile-shots/before/chromium-375-en-base.png) / [후](mobile-shots/after/chromium-375-en-base.png) | [전](mobile-shots/before/chromium-375-en-menu.png) / [후](mobile-shots/after/chromium-375-en-menu.png) | [전](mobile-shots/before/chromium-375-en-balance.png) / [후](mobile-shots/after/chromium-375-en-balance.png) | [전](mobile-shots/before/chromium-375-en-saved.png) / [후](mobile-shots/after/chromium-375-en-saved.png) |
| chromium-412-ko | [전](mobile-shots/before/chromium-412-ko-intro.png) / [후](mobile-shots/after/chromium-412-ko-intro.png) | [전](mobile-shots/before/chromium-412-ko-base.png) / [후](mobile-shots/after/chromium-412-ko-base.png) | [전](mobile-shots/before/chromium-412-ko-menu.png) / [후](mobile-shots/after/chromium-412-ko-menu.png) | [전](mobile-shots/before/chromium-412-ko-balance.png) / [후](mobile-shots/after/chromium-412-ko-balance.png) | [전](mobile-shots/before/chromium-412-ko-saved.png) / [후](mobile-shots/after/chromium-412-ko-saved.png) |
| chromium-412-en | [전](mobile-shots/before/chromium-412-en-intro.png) / [후](mobile-shots/after/chromium-412-en-intro.png) | [전](mobile-shots/before/chromium-412-en-base.png) / [후](mobile-shots/after/chromium-412-en-base.png) | [전](mobile-shots/before/chromium-412-en-menu.png) / [후](mobile-shots/after/chromium-412-en-menu.png) | [전](mobile-shots/before/chromium-412-en-balance.png) / [후](mobile-shots/after/chromium-412-en-balance.png) | [전](mobile-shots/before/chromium-412-en-saved.png) / [후](mobile-shots/after/chromium-412-en-saved.png) |
| webkit-320-ko | [전](mobile-shots/before/webkit-320-ko-intro.png) / [후](mobile-shots/after/webkit-320-ko-intro.png) | [전](mobile-shots/before/webkit-320-ko-base.png) / [후](mobile-shots/after/webkit-320-ko-base.png) | [전](mobile-shots/before/webkit-320-ko-menu.png) / [후](mobile-shots/after/webkit-320-ko-menu.png) | [전](mobile-shots/before/webkit-320-ko-balance.png) / [후](mobile-shots/after/webkit-320-ko-balance.png) | [전](mobile-shots/before/webkit-320-ko-saved.png) / [후](mobile-shots/after/webkit-320-ko-saved.png) |
| webkit-320-en | [전](mobile-shots/before/webkit-320-en-intro.png) / [후](mobile-shots/after/webkit-320-en-intro.png) | [전](mobile-shots/before/webkit-320-en-base.png) / [후](mobile-shots/after/webkit-320-en-base.png) | [전](mobile-shots/before/webkit-320-en-menu.png) / [후](mobile-shots/after/webkit-320-en-menu.png) | [전](mobile-shots/before/webkit-320-en-balance.png) / [후](mobile-shots/after/webkit-320-en-balance.png) | [전](mobile-shots/before/webkit-320-en-saved.png) / [후](mobile-shots/after/webkit-320-en-saved.png) |
| webkit-360-ko | [전](mobile-shots/before/webkit-360-ko-intro.png) / [후](mobile-shots/after/webkit-360-ko-intro.png) | [전](mobile-shots/before/webkit-360-ko-base.png) / [후](mobile-shots/after/webkit-360-ko-base.png) | [전](mobile-shots/before/webkit-360-ko-menu.png) / [후](mobile-shots/after/webkit-360-ko-menu.png) | [전](mobile-shots/before/webkit-360-ko-balance.png) / [후](mobile-shots/after/webkit-360-ko-balance.png) | [전](mobile-shots/before/webkit-360-ko-saved.png) / [후](mobile-shots/after/webkit-360-ko-saved.png) |
| webkit-360-en | [전](mobile-shots/before/webkit-360-en-intro.png) / [후](mobile-shots/after/webkit-360-en-intro.png) | [전](mobile-shots/before/webkit-360-en-base.png) / [후](mobile-shots/after/webkit-360-en-base.png) | [전](mobile-shots/before/webkit-360-en-menu.png) / [후](mobile-shots/after/webkit-360-en-menu.png) | [전](mobile-shots/before/webkit-360-en-balance.png) / [후](mobile-shots/after/webkit-360-en-balance.png) | [전](mobile-shots/before/webkit-360-en-saved.png) / [후](mobile-shots/after/webkit-360-en-saved.png) |
| webkit-375-ko | [전](mobile-shots/before/webkit-375-ko-intro.png) / [후](mobile-shots/after/webkit-375-ko-intro.png) | [전](mobile-shots/before/webkit-375-ko-base.png) / [후](mobile-shots/after/webkit-375-ko-base.png) | [전](mobile-shots/before/webkit-375-ko-menu.png) / [후](mobile-shots/after/webkit-375-ko-menu.png) | [전](mobile-shots/before/webkit-375-ko-balance.png) / [후](mobile-shots/after/webkit-375-ko-balance.png) | [전](mobile-shots/before/webkit-375-ko-saved.png) / [후](mobile-shots/after/webkit-375-ko-saved.png) |
| webkit-375-en | [전](mobile-shots/before/webkit-375-en-intro.png) / [후](mobile-shots/after/webkit-375-en-intro.png) | [전](mobile-shots/before/webkit-375-en-base.png) / [후](mobile-shots/after/webkit-375-en-base.png) | [전](mobile-shots/before/webkit-375-en-menu.png) / [후](mobile-shots/after/webkit-375-en-menu.png) | [전](mobile-shots/before/webkit-375-en-balance.png) / [후](mobile-shots/after/webkit-375-en-balance.png) | [전](mobile-shots/before/webkit-375-en-saved.png) / [후](mobile-shots/after/webkit-375-en-saved.png) |
| webkit-412-ko | [전](mobile-shots/before/webkit-412-ko-intro.png) / [후](mobile-shots/after/webkit-412-ko-intro.png) | [전](mobile-shots/before/webkit-412-ko-base.png) / [후](mobile-shots/after/webkit-412-ko-base.png) | [전](mobile-shots/before/webkit-412-ko-menu.png) / [후](mobile-shots/after/webkit-412-ko-menu.png) | [전](mobile-shots/before/webkit-412-ko-balance.png) / [후](mobile-shots/after/webkit-412-ko-balance.png) | [전](mobile-shots/before/webkit-412-ko-saved.png) / [후](mobile-shots/after/webkit-412-ko-saved.png) |
| webkit-412-en | [전](mobile-shots/before/webkit-412-en-intro.png) / [후](mobile-shots/after/webkit-412-en-intro.png) | [전](mobile-shots/before/webkit-412-en-base.png) / [후](mobile-shots/after/webkit-412-en-base.png) | [전](mobile-shots/before/webkit-412-en-menu.png) / [후](mobile-shots/after/webkit-412-en-menu.png) | [전](mobile-shots/before/webkit-412-en-balance.png) / [후](mobile-shots/after/webkit-412-en-balance.png) | [전](mobile-shots/before/webkit-412-en-saved.png) / [후](mobile-shots/after/webkit-412-en-saved.png) |

상세(320px 한국어): [전](mobile-shots/before/chromium-320-ko-levels.png) / [후](mobile-shots/after/chromium-320-ko-levels.png) · [전](mobile-shots/before/chromium-320-ko-safe-menu.png) / [후](mobile-shots/after/chromium-320-ko-safe-menu.png) · [전](mobile-shots/before/webkit-320-ko-levels.png) / [후](mobile-shots/after/webkit-320-ko-levels.png) · [전](mobile-shots/before/webkit-320-ko-safe-menu.png) / [후](mobile-shots/after/webkit-320-ko-safe-menu.png)

## 실패와 막힘

- webkit: language switch updates menu and saved summary in both directions — [31mTest timeout of 30000ms exceeded.[39m
- webkit: no horizontal scroll 360 ko — [31mTest timeout of 30000ms exceeded.[39m
- webkit: five picked colors: three summary rows, matching counts, empty state — [31mTest timeout of 30000ms exceeded.[39m
- webkit: white paper: rendered screenshot becomes gray — [31mTest timeout of 30000ms exceeded.[39m
- webkit: skin-colored patch is rejected — [31mTest timeout of 30000ms exceeded.[39m
- webkit: five picked colors: three summary rows, matching counts, empty state — [31mTest timeout of 30000ms exceeded.[39m
- webkit: mobile matrix 360 ko — Error: locator.click: Target page, context or browser has been closed

**확실:** 최종 전체 검사의 WebKit 실패는 30초 시간 초과 6건과 브라우저/컨텍스트 종료 1건이다. 한국어 요약(span 개수 대기), 영어 보정(무대 좌표 읽기), 영어 피부색 거절(메뉴 버튼 클릭), 영어 요약(목록 열기), 양방향 언어 변경, 360px 한국어 폭 검사에서 시간 초과를 관측했다. 언어 변경은 마지막 대기에서 lang의 빈 값도 보고했으므로 단순 지연이라고 단정하지 않는다. 모바일 360px 한국어는 색을 담는 중 브라우저가 닫혔다.

**추정:** Windows WebKit 실행 지연·종료의 영향. **모름:** 근본 원인, 실제 iOS에서도 재현되는지. 중간 전체 실행에서 기능 34건은 통과했지만 최종 전체 실행은 위 실패를 유지한다. 실패를 skip·기대된 실패로 바꾸거나 앱 E2E 제한 시간을 늘리지 않았다. 제안: 같은 경로를 macOS WebKit·실기기에서 재현하고 브라우저 종료 로그를 확인한다.

최종 전체 실행의 원시 JSON·trace는 로컬 `node_modules/.cache/drape-final-run/`에 보존했다(Git 제외). 공개 재현 기록은 `mobile-shots/run-summary.json`과 위 전후 이미지다. 보충 실행은 누락된 촬영을 채우기 위한 것으로 전체 실패 집계를 대체하지 않는다.
