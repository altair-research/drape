# 테스터 2분 체크리스트 — Color Mirror (2026-11-05)

> 테스터가 앱을 깐 뒤 **한 번만** 해 보면 되는 것. 메시지로 보낼 때는 아래 '보낼 글' 블록을 복사한다(보내는 건 사용자).
> 답을 받으면 `store/production-application.md` 맨 아래 **피드백 메모**에 "테스터 A" 처럼 한 줄씩 적는다 — 신청서 1번 칸이 이걸로 채워진다.
> 자동 테스트(크롬·사파리 엔진, 320~412px, 오프라인, 접근성)는 다 통과했지만 **진짜 폰 카메라·진짜 낭독기는 사람만 확인할 수 있다.** 그래서 이 다섯 개를 묻는다.

## 보낼 글 (한국어)

```
Color Mirror 깔아 줘서 고마워요! 시간 날 때 2분만 해 보고, 된 것/안 된 것만 짧게 알려 주세요.

1. 창가에서 앱을 열고 색을 좌우로 넘겨 보기 — 얼굴 아래 색 띠가 잘 바뀌나요?
2. 마음에 드는 색 3~5개에 ♥ → 아래 '목록' → 맨 위 '내가 고른 색' 한 줄이 나오나요?
3. ⋯ 메뉴 → '흰 종이로 색 맞추기' → 흰 종이(A4)를 화면에 비추고 종이를 톡 — 화면이 덜 노랗게/덜 파랗게 바뀌나요?
4. 폰 기종과 안드로이드 버전(설정 > 휴대전화 정보)
5. (해 볼 수 있으면) 톡백(TalkBack)을 켜고 색을 넘길 때 색 이름을 읽어 주나요?

이상하거나 불편했던 게 하나라도 있으면 그게 제일 도움이 돼요 🙏
```

## 보낼 글 (English)

```
Thanks for installing Color Mirror! When you have 2 minutes, try these and just tell me what worked and what didn't.

1. Open the app by a window and swipe through colors — does the color band under your face change smoothly?
2. Tap ♥ on 3–5 colors you like → "List" at the bottom → do you see a one-line "Colors I picked" summary at the top?
3. ⋯ menu → "White paper balance" → show a sheet of white paper to the camera and tap it — does the screen look less yellow/blue?
4. Your phone model and Android version (Settings > About phone)
5. (If you can) turn on TalkBack — does it read the color name when you swipe?

Anything odd or annoying is the most useful thing you can tell me 🙏
```

## 답을 받으면 (프로젝트 타워)

| 답 | 할 일 |
|---|---|
| 1·2 안 됨 | 기종을 받아 재현. 사이트 수정이면 검증 후 바로 배포(앱 재업로드 필요 없음) |
| 3 이 '안 바뀜'·'이상해짐' | 기종·조명을 받아 흰 종이 판별 한도(`index.html` 의 0.5~2.0·붉은기) 확인. iPhone 이면 영상 필터 지원 문제일 수 있음(`tests/e2e/WEBKIT-DIAG.md`) |
| 5 가 '안 읽음' | `docs/A11Y-CHECK.md` L3 — 색 이름 묶음의 aria-live 가 TalkBack 에서 안 먹는 것. 대안: 색이 바뀔 때 숨은 알림 칸에 글자 넣기 |
| 불편했던 것 | 피드백 메모에 적고, 고쳤으면 '고쳤나' 칸에 버전 |
