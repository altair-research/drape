# drape — Personal Color Mirror

## 세션을 시작하면 이것부터
1. `HANDOFF.md` 맨 위 15줄(머리말) — 이 저장소의 대표 인계 문서. 상태·다음·막힘·AI 결정이 여기 있다.
2. 필요하면 `docs/OUTPUTS.md`(산출물 목록) → Play 일이면 `PLAY-STORE.md`.
3. 지금 진행 중인 축: Play 14일 비공개 테스트 → 프로덕션 출시(~11-30, 테스터 명단 들어온 날 기준). 사이트(`index.html`)는 운영 중이라 검증 후 혼자 배포.
   **정상인 막힘:** 테스터 12명 명단은 사용자 몫이라 기다리는 게 정상. 안드로이드 앱(TWA)은 사이트를 그대로 띄우므로 사이트 수정에 AAB 재업로드가 필요 없다.

## 직무 카드 (개발자 — 2026-11-13 전역 §6 "팀처럼 일한다")
- **할 일:** Personal Color Mirror 사이트(`index.html`·`sw.js`)와 Play 앱(TWA) 개발·검증·배포, Play 출시 준비 문서, 머리말 관리.
- **성공 기준:** 배포 전 Playwright 크로미움·웹킷 전부 통과(따로 실행) + axe critical/serious 0 + 운영 `sw.js` 버전 확인 · 점수 실험은 같은 사람 6번 측정에서 가장 덜 겹친 두 번도 상위 5색 중 3색 이상 · 테스터 명단 받은 날부터 ~23일 안에 프로덕션 출시.
- **쓸 도구:** Playwright(`tests/e2e`), 내장 브라우저 미리보기, `plans.py publish`, 결과물이 나오면 `[drape → 사용자 패널]`(`C:\dev\_team\user-panel`)·`[drape → 마케팅]`(`C:\dev\_team\marketing`)에 의뢰(결과물 경로·대상 고객 한 문단·궁금한 점).
- **물어볼 것:** 돈·계정·스토어 제출·첫 공개, 앱 동작이나 접근 방식 바꾸기, 점수 기능을 화면에 넣을지·유료로 할지, 테스터 명단. 다음 일 전에 `HANDOFF.md` "사용자 피드백" 절을 읽는다.

- 대표 인계 문서는 `HANDOFF.md`(맨 위 15줄 머리말이 정본). 세션 시작 때 먼저 읽는다. Play 절차 상세는 `PLAY-STORE.md`.
- 이 저장소는 **공개**다. 테스터 이메일·키·비밀번호를 적지 않는다. 서명 키는 `C:\Users\altai\keys\` (저장소 밖).
- 사이트를 고치면 `index.html` 의 `APP_VERSION` 과 `sw.js` 의 `VERSION` 숫자를 함께 올린다. 캐시 이름은 `drape-` 접두사 유지.
- 산출물 목록(전역 CLAUDE.md §6)은 이 저장소에서는 `docs/OUTPUTS.md` 에 둔다.
- 커밋 신원: `altair research lab` / `altair.research.lab@gmail.com`.

## 플랜 기록
`plans/plans.json` 이 설정이다(목표·단계·다섯 칸). 단계를 끝내면 `done` 날짜를 적고
`python C:/dev/_control-tower/tools/plans.py publish .` 후 생긴 `plans/` 변경을 커밋·푸시한다. 규칙은 `C:\dev\_control-tower\PLANS.md`.
