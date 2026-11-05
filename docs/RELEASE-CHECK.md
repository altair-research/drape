# 출시 전 점검 (오프라인·캐시 교체·manifest·assetlinks·링크)

2026-11-04 · 브랜치 `claude/release-checks` · 기준 커밋 `b859d7a`(main, 앱 v36) · `index.html`·`sw.js` 는 고치지 않음

## 한 줄로
**전부 통과.** 서비스워커가 오프라인에서 앱을 띄우고, 버전 숫자를 올리면 실제로 새 화면(#ver)과 새 캐시로 바뀐다는 것을 처음으로 자동 테스트로 확인했다.
점검 도구는 37통과·0실패·1경고(assetlinks 는 루트 저장소에서 따로 확인해야 한다는 알림).

## 돌리는 법 (3줄)
```
node tools/check-release.mjs                                   # 버전·manifest·아이콘·assetlinks·링크 표, 실패 있으면 종료코드 1
node node_modules/@playwright/test/cli.js test tests/e2e/release.spec.js --project=chromium   # 오프라인·캐시 교체·사진 모드
node node_modules/@playwright/test/cli.js test --project=chromium                             # 기존 전체(Chromium) + 위 3개
```

## 1. 서비스워커 테스트 `tests/e2e/release.spec.js` (Chromium 전용)
사이트를 임시 폴더에 복사해 자체 서버(8770, 8771 포트)로 띄우므로 저장소 파일은 건드리지 않는다. 이 파일만 `serviceWorkers: 'allow'`.
WebKit 프로젝트는 `playwright.config.js` 의 `testIgnore` 로 건너뛴다(파일 안에서도 Chromium 이 아니면 skip).

| # | 내용 | 결과 |
|---|---|---|
| 1 | SW 설치 → 캐시 `drape-v36` 하나 → 오프라인으로 새로고침해도 앱과 `v36` 표시 | 통과 (4.3초) |
| 2 | 복사본에서 `APP_VERSION`·`VERSION` 을 37로 올림 → 다시 열기 → `v37` 표시, `drape-` 캐시는 `drape-v37` 하나뿐 | 통과 (10.1초, 새로고침 1번 안에 바뀜) |
| 3 | 오프라인에서 사진 모드: 합성 캔버스 그림(사람 사진 아님) 올리기 → 사진 화면 | 통과 (3.4초) |

두 번째 테스트가 이 저장소의 규칙 "사이트를 고치면 두 숫자를 함께 올린다" 가 **실제로 새 파일을 배달한다**는 증거다.
(옛 SW 가 캐시된 옛 화면을 먼저 보여 주고 → 새 sw.js 설치 → 옛 캐시 삭제·주도권 → `controllerchange` 로 한 번 자동 새로고침 → 새 화면.)

## 2. 점검 도구 `tools/check-release.mjs` (외부 패키지·네트워크 요청 없음)

| 영역 | 항목 | 결과 |
|---|---|---|
| 버전 | APP_VERSION 36 == sw.js `drape-v36`, 캐시 접두사 `drape-`, index.html 이 sw.js 등록 | 통과 5/5 |
| manifest | `manifest.json`(index.html 의 link 에서 찾음) JSON, name·short_name·start_url·scope·display, short_name 12자 이하 | 통과 9/9 |
| 아이콘 | 192·512·maskable 512 파일 존재, PNG 헤더의 실제 크기 = 선언 크기, `<link rel=icon sizes>` 도 일치 | 통과 7/7 |
| assetlinks | JSON, relation `handle_all_urls`, `android_app`, package_name, 지문 4개 모두 `AA:BB:…` 32바이트 형식(보고에는 끝 2바이트만) | 통과 9/9 |
| assetlinks | 도메인 루트에 실제로 있는가 | **경고** — 이 도구는 확인 안 함 (아래 문제 1) |
| 링크 | index.html·privacy.html·plans/*.html 의 상대 링크·이미지 31개 모두 파일 있음 | 통과 7/7 |
| 외부 링크 | 11개 목록만 출력(요청 안 함): jsdelivr 폰트, 앱스토어·경쟁 앱 주소, 운영 사이트 주소 등 | 목록만 |

## 3. 기존 Chromium 테스트
`--project=chromium` 전체 실행: **28통과·0실패** (기존 25개 + release 3개, 3.1분, 2026-11-04 재부팅 후 재실행).

## 4. 문제와 제안 (확신도)

1. **assetlinks 는 이 저장소 파일이 아니라 루트 저장소가 진짜다.** 안드로이드는 `altair-research.github.io/.well-known/` 만 읽고 `/drape/.well-known/` 은 무시한다(PLAY-STORE.md §4 에 이미 적혀 있음).
   이 저장소 사본만 고치고 루트 저장소를 안 고치면 앱에 주소창이 뜬다. 제안: 지문을 바꿀 때 두 파일을 같이 고치고, 출시 전에 PLAY-STORE.md §4 의 Google 확인 주소로 한 번 본다. — **확실**(위치 규칙), 루트 파일의 현재 내용은 **모름**(네트워크 요청을 안 했다).
2. **외부 폰트 CSS 는 오프라인용으로 캐시되지 않는다.** `index.html` 17행의 jsdelivr 스타일시트에 `crossorigin` 이 없어 응답이 "불투명(opaque)" 이 되고, `sw.js` 36행은 `res.ok` 가 참일 때만 캐시하는데 불투명 응답은 항상 거짓이다.
   실험에서 여러 번 열어도 캐시에 jsdelivr 항목이 생기지 않았다. 결과: 오프라인에서는 기본 글꼴로 보인다(앱은 정상 작동). 제안: `res.ok || res.type === "opaque"` 로 바꾸거나 그냥 둔다(영향 작음). — 원인 **추정**, 캐시가 안 생기는 현상은 **확실**(Chromium).
3. **(이론상) 옛 캐시가 다시 생길 수 있다.** `sw.js` 28·36행은 응답이 온 뒤 `caches.open(VERSION)` 을 연다. 새 SW 가 옛 캐시를 지운 직후 옛 SW 의 늦은 갱신 요청이 끝나면 `drape-v36` 이 빈 채로 다시 생길 수 있다.
   테스트 2 에서는 일어나지 않았고, 생겨도 다음 버전 활성화 때 지워진다. 고칠 필요는 낮다. — **추정**(관찰 안 됨).
4. 같은 버전에서 index.html 만 고치면 사용자에게는 **두 번째 실행 때** 반영된다(캐시 먼저 → 뒤에서 갱신). 실험에서 갱신 저장은 정상 동작. 그래서 숫자를 함께 올리는 지금 규칙이 맞다. — **확실**(Chromium).
5. 이 PC 에서 release.spec.js 3개는 테스트 자체 18초인데 전체 시간은 약 2.6분이었다(브라우저·서버 시작 대기로 보임). — 원인 **추정**.

## 바꾼 파일
- `tests/e2e/release.spec.js` (새로), `tools/check-release.mjs` (새로), `docs/RELEASE-CHECK.md` (이 문서)
- `playwright.config.js`: webkit 프로젝트에 `testIgnore: /release[.]spec[.]js/` 한 줄
- 다른 실행과 포트가 겹치지 않게 로컬에서는 8772 포트로 바꾼 임시 설정으로 돌렸다(커밋 안 함, 삭제).
