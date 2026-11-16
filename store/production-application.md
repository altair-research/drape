# 프로덕션 액세스 신청서 — 답변 초안 (2026-10-26, v39 까지 반영 11-05, 하루 바깥 눈 반영 11-16)

> 출시 순서(테스터 12명 들어온 날 = D0 → D14 테스트 끝 → 신청 → 승인 ~7일 → 심사 1~2일 ≈ **D0 + 23일 출시**, 근거 `PLAY-STORE.md` §7-5. 11-16 현재 명단 대기라 날짜는 D0 가 정해지면 적는다): ① 이 신청서 ② 승인 메일 ③ `PLAY-STORE.md` §6-2c 릴리스 노트로 프로덕션 릴리스.
> 테스트 동안 할 일: **D3·D10 에 전원에게 안부**(문안 `C:\dev\_team\marketing\drafts\play-launch\2026-11-16-테스터유지-메시지.md` ③·④, 보내는 건 대표님) — 보낸 날을 아래 '안부 보낸 날' 표에 적어야 1번 참여 칸 문장이 사실이 된다. 테스터에게 받은 말을 **아래 '피드백 메모'에 그날그날 한 줄씩** 적어 두면 신청서 1번이 저절로 채워진다.

14일 비공개 테스트가 끝나면 Play Console 대시보드의 **Apply for production** 에서 쓴다. 제출은 사용자가 한다.
질문 항목은 개인 개발자 계정 신청서 기준(2026 중반까지 알려진 형태). 실제 문구가 다르면 같은 뜻의 칸에 옮긴다.
`<…>` 는 테스트가 끝난 뒤 실제 값으로 채운다. **없는 피드백을 지어 쓰지 않는다** — 구글이 거르는 1순위다.

## 1. 비공개 테스트에 대해

**테스터를 어떻게 모았나 (How did you recruit users for your closed test?)**
> Friends and family who use Android phones. I asked each person directly by messenger, collected the Google account they use on Play, and added them to the closed testing email list. The same group also tests my other apps, so I reused the tester list I already had and added new people. <N> testers joined.

**모집이 얼마나 쉬웠나 (How easy was it to recruit testers?)** — 보기에서 고른다: `<쉬움/보통/어려움>`

**테스터 참여 설명 (Describe the engagement you received from testers during your closed test)**
> <N> testers opted in and kept the app installed for the full 14 days. They held colors next to their face in different lighting — by a window and under indoor lamps — with the front camera, and some with a friend holding the phone on the rear camera. [확인: <N> testers tried the white-paper step.] I checked in with everyone on day 3 and day 10 and collected replies by message and through the in-app "Send feedback" email.
>
> (하루 11-16 틀. `[확인]`·`<N>` 은 D10 안부의 한 줄 질문 답으로만 채운다 — 앱은 사용 기록을 모으지 않는다. 답이 없으면 그 문장을 지운다.)

**받은 피드백 요약 (Provide a summary of the feedback that you received from testers)**
> <실제 피드백 3~5개. 예시 형식: "Two testers said the color name was hard to read on bright drapes" → what changed>

**피드백을 어떻게 모았나 (How did you collect feedback?)**
> Check-in messages to every tester on day 3 and day 10, an in-app "Send feedback" menu item (opens email), direct messages<, and results testers sent with the in-app "Share result" button — 실제로 받았을 때만 남긴다>. The app has no analytics or tracking, so all feedback was voluntary.

## 2. 앱에 대해

**대상 사용자 (Who is the intended audience of your app?)**
> People curious about personal color analysis (seasonal colors) who want to check colors against their own face themselves, instead of trusting an AI verdict from one photo. Mostly Korean and English speakers, adults.

**앱이 주는 가치 (Describe how your app provides value to users)**
> Personal Color Mirror is a draping mirror on your phone: your face is on camera with a color band under it, and you compare 48 seasonal colors in 3 strengths with your own eyes. It doesn't judge your season — you see it yourself, and you can repeat it when lighting changes. A one-tap white-balance step (tap a sheet of white paper) removes the color cast of the room light, and the liked-colors list sums up which way your picks lean (warm/cool, soft/vivid, light/deep). No sign-up, no ads, no payment, and the camera image never leaves the phone.

**첫해 예상 설치 수 (How many installs do you expect in your first year?)** — 보기에서: `0~10K` 권장(과장하지 않는다)

## 3. 출시 준비

**테스트로 무엇을 바꿨나 (What changes did you make to your app based on what you learned during closed testing?)**
> <맨 위에 테스트 중 실제로 고친 것(피드백 메모 '고쳤나' 칸에서). 하루 11-16: 질문은 "테스트에서 배워서 바꾼 것"이라 테스트 전 것은 아래처럼 1~2줄로 줄여 맨 뒤에.>
>
> Before testing started, I had already: fixed link scope, added sharing and a feedback menu, white-paper white balance, a liked-colors summary, small-phone layout and full keyboard/screen-reader support (0 automated accessibility violations).
>
> <참고용 긴 목록 — 신청서에는 안 씀: v1.0.1 link scope fixed so links to other apps on the same domain no longer open in this app; v29–v30 added share, share-result and feedback menu items, and the privacy policy was updated to match; v34–v35 added white-paper white balance and the liked-colors summary; v36 fixed layout on small phones (320px) and enlarged touch targets to 40px+; v37–v39 made the app fully usable by keyboard and screen reader (automated accessibility check: 0 violations).>

**출시 준비가 됐다고 판단한 이유 (How did you decide that your app is ready for production?)**
> All testers could install and use it without crashes; automated end-to-end tests (Chromium and WebKit, phone sizes 320–412px, offline mode, accessibility) pass on every release; core flow (camera → swipe colors → like → compare) worked on <기기 수> devices; the remaining feedback was about <…>, which does not block use.

## 쓰기 전에 확인

- 테스터 수 12명 이상이 **14일 연속** 참여였는지(콘솔 대시보드에 표시)
- 1-참여·1-피드백·3번 칸은 **실제 내용**으로. 비어 있으면 거절 사유가 된다
- 거절되면 다시 14일이 필요할 수 있다 — 서두르지 말고 피드백을 먼저 모은다

## 피드백 메모 (테스트 기간에 한 줄씩 — 이름 대신 "테스터 A" 처럼)

| 날짜 | 누가 | 무슨 말 | 고쳤나 |
|---|---|---|---|
| | | | |

## 안부 보낸 날 (D3·D10 — 신청서 1번 참여 칸 문장의 근거)

| 언제 | 실제 보낸 날 | 몇 명에게 | 답 몇 명 |
|---|---|---|---|
| D3 | | | |
| D10 (흰 종이 써 봤나 한 줄 질문) | | | |
