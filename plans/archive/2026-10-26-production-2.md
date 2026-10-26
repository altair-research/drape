# 프로덕션 액세스 신청서 — 답변 초안 (2026-10-26, 같은 날 v30 반영)

> 출시 순서(11-16 테스트 끝 → 신청 → 승인 → 11-30 출시): ① 이 신청서 ② 승인 메일 ③ `PLAY-STORE.md` §6-2c 릴리스 노트로 프로덕션 릴리스.
> 테스트 동안 할 일: 테스터에게 받은 말을 **아래 '피드백 메모'에 그날그날 한 줄씩** 적어 두면 신청서 1번이 저절로 채워진다.

14일 비공개 테스트가 끝나면 Play Console 대시보드의 **Apply for production** 에서 쓴다. 제출은 사용자가 한다.
질문 항목은 개인 개발자 계정 신청서 기준(2026 중반까지 알려진 형태). 실제 문구가 다르면 같은 뜻의 칸에 옮긴다.
`<…>` 는 테스트가 끝난 뒤 실제 값으로 채운다. **없는 피드백을 지어 쓰지 않는다** — 구글이 거르는 1순위다.

## 1. 비공개 테스트에 대해

**테스터를 어떻게 모았나 (How did you recruit users for your closed test?)**
> Friends and family who use Android phones. I asked each person directly by messenger, collected the Google account they use on Play, and added them to the closed testing email list. <N> testers joined.

**모집이 얼마나 쉬웠나 (How easy was it to recruit testers?)** — 보기에서 고른다: `<쉬움/보통/어려움>`

**테스터 참여 설명 (Describe the engagement you received from testers during your closed test)**
> Testers used the app in different lighting (daylight by a window, indoor lamps) and held colors next to their face, both with the front camera and with a friend holding the phone using the rear camera. <구체적으로: 몇 명이 ♥ 를 남겼는지, 다시 열어 봤는지 — 앱은 수집하지 않으므로 테스터에게 물어 받은 것만>

**받은 피드백 요약 (Provide a summary of the feedback that you received from testers)**
> <실제 피드백 3~5개. 예시 형식: "Two testers said the color name was hard to read on bright drapes" → what changed>

**피드백을 어떻게 모았나 (How did you collect feedback?)**
> An in-app "Send feedback" menu item (opens email), direct messages<, and results testers sent with the in-app "Share result" button — 실제로 받았을 때만 남긴다>. The app has no analytics or tracking, so all feedback was voluntary.

## 2. 앱에 대해

**대상 사용자 (Who is the intended audience of your app?)**
> People curious about personal color analysis (seasonal colors) who want to check colors against their own face themselves, instead of trusting an AI verdict from one photo. Mostly Korean and English speakers, adults.

**앱이 주는 가치 (Describe how your app provides value to users)**
> It works like a draping mirror: the camera shows your face and a color band sits under it, so you can swipe through 48 seasonal colors in 3 saturation levels and compare them side by side. It does not judge your season; you see it yourself, and you can repeat it when lighting changes. No sign-up, no ads, no payment, and the camera image never leaves the phone.

**첫해 예상 설치 수 (How many installs do you expect in your first year?)** — 보기에서: `0~10K` 권장(과장하지 않는다)

## 3. 출시 준비

**테스트로 무엇을 바꿨나 (What changes did you make to your app based on what you learned during closed testing?)**
> <테스트 중 실제로 고친 것. 테스트 전 이미 한 것: v1.0.1 link scope fixed so links to other apps on the same domain no longer open in this app; v29–v30 added share, share-result and feedback menu items, and the privacy policy was updated to match.>

**출시 준비가 됐다고 판단한 이유 (How did you decide that your app is ready for production?)**
> All testers could install and use it without crashes; core flow (camera → swipe colors → like → compare) worked on <기기 수> devices; the remaining feedback was about <…>, which does not block use.

## 쓰기 전에 확인

- 테스터 수 12명 이상이 **14일 연속** 참여였는지(콘솔 대시보드에 표시)
- 1-참여·1-피드백·3번 칸은 **실제 내용**으로. 비어 있으면 거절 사유가 된다
- 거절되면 다시 14일이 필요할 수 있다 — 서두르지 말고 피드백을 먼저 모은다

## 피드백 메모 (테스트 기간에 한 줄씩 — 이름 대신 "테스터 A" 처럼)

| 날짜 | 누가 | 무슨 말 | 고쳤나 |
|---|---|---|---|
| | | | |
