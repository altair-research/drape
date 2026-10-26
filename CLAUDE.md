# drape — Personal Color Mirror

- 대표 인계 문서는 `HANDOFF.md`(맨 위 15줄 머리말이 정본). 세션 시작 때 먼저 읽는다. Play 절차 상세는 `PLAY-STORE.md`.
- 이 저장소는 **공개**다. 테스터 이메일·키·비밀번호를 적지 않는다. 서명 키는 `C:\Users\altai\keys\` (저장소 밖).
- 사이트를 고치면 `index.html` 의 `APP_VERSION` 과 `sw.js` 의 `VERSION` 숫자를 함께 올린다. 캐시 이름은 `drape-` 접두사 유지.
- 커밋 신원: `altair research lab` / `altair.research.lab@gmail.com`.

## 플랜 기록
`plans/plans.json` 이 설정이다(목표·단계·다섯 칸). 단계를 끝내면 `done` 날짜를 적고
`python C:/dev/_control-tower/tools/plans.py publish .` 후 생긴 `plans/` 변경을 커밋·푸시한다. 규칙은 `C:\dev\_control-tower\PLANS.md`.
