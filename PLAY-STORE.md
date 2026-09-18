# 플레이 스토어 등록 절차 (PWABuilder → Google Play)

> 갱신: 2026-09-18 10:40
> 상태: AAB 서명 완료(업로드 키 지문 assetlinks 반영·Google 검증 통과). Play Console 입력 대기.
> 다음: 사용자가 콘솔에서 §6 순서대로 입력 → 내부 테스트에 AAB 업로드 → 앱 서명 키 지문을 Claude에게
> 막힘: 없음 (사용자 차례 — 콘솔 조작)
> 더 볼 곳: §6 콘솔 입력값, §7 출시 순서, tools/sign-android.ps1

Personal Color Mirror를 Google Play에 올리는 순서. 하나 끝내면 체크하고 다음으로.

배포 URL: https://altair0622.github.io/drape/
개인정보처리방침: https://altair0622.github.io/drape/privacy.html

## 진행 상황 (2026-09-18 10:40)

- [x] §1 개발자 계정 — altair.research.lab@gmail.com (09-17 인증 완료)
- [x] 패키지 ID `com.altairresearchlab.colormirror`, 앱 이름 Personal Color Mirror / Color Mirror
- [x] §2 업로드 키 + **AAB 서명 완료** — `C:\Users\altai\keys\colormirror-build\Personal Color Mirror.aab` (1.22MB)
      키: `C:\Users\altai\keys\colormirror-upload.jks`, 비밀번호 파일 `colormirror-upload.password.txt` (둘 다 저장소 밖)
      업로드 키 지문: `B2:09:7C:63:7A:45:5E:24:02:11:AD:65:1B:31:80:7F:C4:E1:5B:76:55:0B:F0:3D:8B:DC:42:A9:0F:54:B4:24`
- [x] §4 assetlinks.json — 새 패키지 + 업로드 키 지문. Google Digital Asset Links 검증 통과
- [x] 콘솔에 앱 생성 완료 (09-18) — Personal Color Mirror / com.altairresearchlab.colormirror, 상태 Draft
- [ ] §7-2 내부 테스트에 AAB 업로드 + 테스터 목록 연결 (사용자)
- [ ] §6 앱 콘텐츠 답변 (업로드가 막히면 그때 필요한 것만)
- [ ] **첫 업로드 후**: 콘솔 > 테스트 및 출시 > 설정 > 앱 서명 > 앱 서명 키 인증서의 SHA-256 을 Claude에게 → assetlinks 에 추가
- [ ] 폰 스크린샷 2~8장 (스토어 등록정보 필수), 테스터 12명 이메일
- [ ] APK 는 미생성 (build-tools 접근 실패로 건너뜀). 내부 테스트로 설치해 확인하면 되므로 불필요

메모: JKS 형식 경고("migrate to PKCS12")는 무해하다. Play 는 JKS 로 서명한 AAB 를 정상 처리한다. 바꾸지 않는다.

## 0. 원리 한 줄

PWABuilder는 우리 사이트를 여는 얇은 안드로이드 앱(TWA, Trusted Web Activity)을 만든다.
앱 안에 코드가 들어가는 게 아니라 **Chrome이 우리 URL을 전체화면으로 여는 것**이므로,
사이트를 고쳐 push하면 스토어 재심사 없이 앱도 바뀐다.
대신 "이 앱과 이 사이트는 같은 주인"임을 증명하는 파일(`assetlinks.json`)이 사이트에 있어야
주소창 없이 열린다. 이게 빠지면 앱 위에 브라우저 주소창이 뜬다.

## 1. 사전 준비 (사람이 해야 하는 일)

- [x] **Google Play 개발자 계정** — 2026-09-17 완료. 계정 = altair.research.lab@gmail.com (WearCast와 공용).
      기기 확인이 이틀 막혔던 원인과 해법은 `C:\dev\wearcast\docs\RELEASE.md` 머리말 참고.
- [ ] **개인 계정의 비공개 테스트 조건**: 프로덕션 출시 전에 **테스터 12명 × 14일**. 계정당 한 번 통과하면 되므로
      WearCast와 이 앱 중 먼저 준비되는 쪽으로 돌린다. 정책은 콘솔 안내를 최종 근거로.

## 2. 패키지 만들기 — PWABuilder(서명 없음) + 내 키로 서명

### 2-0. 패키지 ID 결정 (2026-09-18)

**`com.altairresearchlab.colormirror`** 로 확정. 한 번 올리면 영영 못 바꾼다.

- 왜 `com.altairresearchlab.*` 인가: WearCast가 09-18에 "개발자 계정 이름을 따른다"로 정했다. 같은 계정의 앱은 같은 접두사를 쓰는 게
  관례이고, GitHub 계정(`io.github.altair0622`)보다 오래 갈 이름이다.
- 왜 `colormirror` 인가 (`tonemirror`가 아니라): 앱 이름이 Personal Color Mirror / Color Mirror로 확정됐다. `tonemirror`는 버린 이름(톤미러)이라
  영구 식별자에 남길 이유가 없다. **업로드 전 유일한 변경 기회**이므로 지금 바꿨다.
- 버린 것: `io.github.altair0622.tonemirror` (PWABuilder 첫 패키지). Play에 올린 적 없으므로 비용 없음.

### 2-1. 서명 없는 aab/apk 받기 (Claude가 함, 09-18 완료)

PWABuilder 웹사이트 대신 같은 백엔드 API를 `signingMode: "none"` 으로 호출했다.
이유: 웹사이트가 만들어 주는 키는 비밀번호를 PWABuilder가 정하고, "내 키 사용" 경로는 서버 오류(500)가 났다.
서명을 우리 PC에서 하면 **키와 비밀번호가 처음부터 우리 손에만 있다.**

결과: `C:\Users\altai\keys\colormirror-build\unsigned\Personal Color Mirror-unsigned.{aab,apk}`
확인함: 패키지 `com.altairresearchlab.colormirror`, versionCode 1, targetSdk 36, 라벨 "Personal Color Mirror".

### 2-2. 업로드 키 만들고 서명하기 (사용자가 함)

```powershell
powershell -ExecutionPolicy Bypass -File C:\dev\drape\tools\sign-android.ps1
```

스크립트가 하는 일: 키가 없으면 `C:\Users\altai\keys\colormirror-upload.jks` 생성(비밀번호는 keytool이 물음) →
aab는 jarsigner, apk는 zipalign+apksigner로 서명 → 서명자와 SHA-256 지문 출력.
**비밀번호는 어디에도 적히지 않는다.** 물을 때마다 같은 것을 넣고, 비밀번호 관리자에 보관한다.

도구 출처: keytool·jarsigner는 Android Studio에 딸린 JDK(`...\Android Studio\jbr\bin`), zipalign·apksigner는
Android SDK build-tools 36.1.0. 둘 다 WearCast 때 깔린 것을 그대로 쓴다.

### 2-3. 서명 확인 (스크립트 마지막에 자동 출력)

- `keytool -printcert -jarfile ...aab` 첫 줄에 `CN=Altair Research Lab` 이 나와야 한다.
- `apksigner verify --print-certs ...apk` 의 SHA-256 이 assetlinks에 들어갈 지문이다. **이 값을 Claude에게 알려준다.**

### 2-4. 다음 버전을 올릴 때

PWABuilder API 호출의 `appVersion`/`appVersionCode`를 올려 서명 없는 패키지를 다시 받고, 같은 스크립트로 서명한다.
versionCode는 정수이고 **올릴 때마다 반드시 커진다.**

## 3. 서명 키 보관

- 위치: **`C:\Users\altai\keys\colormirror-upload.jks`** — 저장소 밖, WearCast 키(`wearcast-upload.jks`)와 같은 폴더.
- 백업: `.jks`와 비밀번호를 사용자 계정 밖(비밀번호 관리자·외장 저장소)에 한 벌 더.
- 이 키는 **업로드 키**다. 실제 앱 서명은 Google이 보관하는 앱 서명 키가 한다(Play App Signing).
  업로드 키를 잃으면 Google에 재설정을 요청할 수 있어 앱이 영영 죽지는 않지만 며칠 걸린다.
- **git에 절대 넣지 않는다.** 이 저장소는 공개다. `.gitignore`에 `*.jks`, `*.keystore`.
- 예전 PWABuilder 키(`Dropbox (Personal)\99 drape\keys\`)는 Play에 올린 적 없으므로 폐기 대상.

## 4. assetlinks.json 올리기

1. **위치가 중요하다.** 안드로이드는 `https://altair0622.github.io/.well-known/assetlinks.json` — **도메인 루트**에서만 찾는다.
   `/drape/.well-known/`은 무시된다 (2026-09-17 실제로 이 때문에 주소창이 떴다).
   루트는 별도 저장소 `altair0622/altair0622.github.io`가 담당한다. 지문이 바뀌면 **그 저장소**의 파일을 고친다.
2. 확인: https://altair0622.github.io/.well-known/assetlinks.json 이 JSON으로 열려야 한다.
3. **함정**: Play Console에 aab를 올리면 Google이 **자기 키로 다시 서명**한다(Play App Signing).
   그러면 사용자 폰에 설치되는 앱의 지문은 업로드 키가 아니라 **Google 키**다.
   Play Console → 앱 → **설정 → 앱 무결성 → 앱 서명 키 인증서**의 SHA-256을 복사해
   `assetlinks.json`에 **두 지문 모두** 넣는다:

   ```json
   [{
     "relation": ["delegate_permission/common.handle_all_urls"],
     "target": {
       "namespace": "android_app",
       "package_name": "com.altairresearchlab.colormirror",
       "sha256_cert_fingerprints": [
         "업로드_키_지문(apksigner가_출력)",
         "Play_Console_앱_서명_키_지문"
       ]
     }
   }]
   ```
   지문이 하나라도 빠지면 그 경로로 설치된 앱에 주소창이 뜬다.

## 5. 매니페스트 점수 올리기 (선택)

PWABuilder가 노란 경고를 내는 항목. 없어도 패키징되지만 스토어 심사에서 스크린샷은 어차피 필요하다.

- `screenshots`: 폰 세로 스크린샷 2장 이상 (예: 1080×1920). `manifest.json`에 추가.
- `shortcuts`, `share_target` 등은 이 앱에 불필요.

## 6. Play Console 입력 항목

### 6-0. 입력 순서 (콘솔 화면 그대로, 사용자가 조작)

**A. 앱 만들기** — 모든 앱 > 앱 만들기

| 칸 | 넣을 값 |
|---|---|
| 앱 이름 | `Personal Color Mirror` |
| 기본 언어 | **영어(미국) - en-US** (2026-09-18 사용자 선택). 한국어는 스토어 설정 > 번역 관리에서 추가한다 |
| 앱 또는 게임 | 앱 |
| 무료 또는 유료 | 무료 — **앱 가격만 뜻한다.** 유료→무료는 되지만 무료→유료는 영영 안 된다. 인앱 결제·구독은 무료 앱에도 나중에 얼마든지 붙일 수 있다 (§8-1) |
| 선언 | 프로그램 정책·미국 수출법 둘 다 체크 |

**B. 대시보드 > 앱 설정** (순서대로 나오는 질문들)

| 항목 | 답 |
|---|---|
| 앱 액세스 권한 | 모든 기능을 제한 없이 사용 가능 |
| 광고 | 아니요, 광고 없음 |
| 콘텐츠 등급 | 이메일 `altair.research.lab@gmail.com`, 카테고리 **유틸리티·생산성·커뮤니케이션·기타**, 이후 모든 질문에 "아니요" (폭력·성적 내용·욕설·약물·도박 전부 없음) |
| 타겟층 | 18세 이상. "아동의 관심을 끌 수 있나요" → 아니요 |
| 뉴스 앱 | 아니요 |
| 코로나19 접촉 확인 앱 | 아니요 |
| 데이터 보안 | **데이터를 수집하거나 공유하지 않음**. 아래 6-1 참고 |
| 정부 앱 | 아니요 |
| 금융 기능 | 해당 없음 |
| 앱 카테고리 | 앱 > **뷰티** (없으면 라이프스타일) |
| 태그 | 최대 5개. 뷰티/스타일 관련만 |
| 스토어 등록정보 연락처 | 이메일 `altair.research.lab@gmail.com`, 웹사이트 `https://altair0622.github.io/drape/` |
| 개인정보처리방침 URL | `https://altair0622.github.io/drape/privacy.html` |

**C. 스토어 등록정보** — 문안은 아래 6-2, 이미지는 6-3.

**D. 내부 테스트** — §7 참고. AAB 는 `C:\Users\altai\keys\colormirror-build\Personal Color Mirror.aab`

### 6-1. 데이터 보안 답안 (왜 "수집 없음"인가)

카메라 영상은 화면에 그려지기만 하고 기기를 떠나지 않는다. 좋아요한 색 목록은 브라우저 localStorage
(기기 내부)에 있고 서버가 없다. Google Play 의 "수집"은 **개발자 서버로 전송하거나 제3자와 공유**하는 것을
뜻하므로 해당 없음. 글꼴을 jsDelivr CDN 에서 받는 것은 앱 기능 수행을 위한 일반 네트워크 요청이며
사용자 데이터 전송이 아니다.

- 데이터 수집·공유: **없음**
- 전송 중 암호화: 해당 없음 (전송하는 사용자 데이터가 없음)
- 삭제 요청 방법 제공: 해당 없음


앱 만들기 → 기본 정보 → 왼쪽 메뉴 순서대로. 대부분 한 번만 한다.

| 항목 | 입력값 / 판단 |
|---|---|
| 앱 이름 | Personal Color Mirror |
| 기본 언어 | 한국어 |
| 앱/게임 | 앱 |
| 무료/유료 | 무료 (유료→무료는 되지만 반대는 안 된다) |
| **개인정보처리방침 URL** | https://altair0622.github.io/drape/privacy.html |
| 앱 액세스 권한 | 모든 기능이 제한 없이 사용 가능 |
| 광고 | 광고 없음 |
| 콘텐츠 등급 | 설문 → 전체이용가 예상 |
| 타겟 연령 | 18세 이상 (아동 대상으로 하면 정책 부담이 크게 늘어난다) |
| 뉴스 앱 | 아니요 |
| **데이터 보안** | **"데이터를 수집하거나 공유하지 않음"**. 카메라 영상은 기기 밖으로 나가지 않으므로 '수집'이 아니다. 저장 색 목록도 기기 안 localStorage. |
| 카테고리 | 뷰티 (또는 라이프스타일) |
| 연락처 이메일 | altair.research.lab@gmail.com |


### 6-2. 스토어 문안 — 한국어 (번역 관리에서 추가)

**앱 이름 (30자)**: Personal Color Mirror

**짧은 설명 (80자)**
> 카메라에 비친 얼굴에 사계절 색을 직접 대보는 퍼스널컬러 거울. 회원가입·광고 없음

**자세한 설명 (4000자)**
> 퍼스널컬러 진단에서 쓰는 '드레이핑'을 폰 카메라로 해 보는 거울입니다.
> 봄·여름·가을·겨울 네 계절의 옷 색 48가지를 얼굴 아래에 천처럼 대보고,
> 얼굴이 맑아 보이는 색에 ♥를 눌러 모으세요. 한 계절에 몰리면 그쪽이 유력합니다.
>
> • 판정하지 않습니다. 눈으로 직접 비교합니다.
> • 색마다 흐리게·기본·선명하게 3단계. 같은 빨강도 어울리는 톤이 다릅니다.
> • ♥한 색끼리만 모아 다시 비교
> • 직전 색과 꾹 눌러 비교
> • 후면 카메라로 바꾸면 친구가 대신 대봐 줄 수 있어요
> • 회원가입, 광고, 결제 없음. 카메라 영상은 폰 밖으로 나가지 않습니다.
>
> 결과는 절대적인 답이 아니라 참고용입니다. 조명에 따라 다르게 보이니 창가 자연광에서 해 보세요.

### 6-2b. 스토어 문안 — English (기본 언어, 먼저 입력)

**Short description**
> Drape four-season colors over your face with the live camera. No sign-up, no ads.

**Full description**
> A mirror for personal color draping. Hold 48 everyday clothing colors from the four seasons
> under your face like fabric swatches, and tap ♥ on the ones that make your face look clearer.
> If they cluster in one season, that season is likely yours.
>
> • No verdicts. You compare with your own eyes.
> • Three saturation levels per color: muted, base, vivid.
> • Compare only your liked colors.
> • Hold to compare with the previous color.
> • Switch to the rear camera so a friend can drape you.
> • No account, no ads, no payments. The camera feed never leaves your phone.
>
> It's a suggestion, not a diagnosis. Lighting changes everything, so try it in daylight by a window.

### 6-3. 스토어 등록정보에 필요한 이미지

| 이미지 | 크기 | 상태 / 파일 |
|---|---|---|
| 앱 아이콘 | 512×512 PNG | ✅ `C:\dev\drape\icon-512.png` |
| 그래픽 이미지 (feature graphic) | 1024×500 PNG | ✅ `C:\dev\drape\storeeature-graphic.png` |
| 휴대전화 스크린샷 | 2~8장, 세로 (예 1080×1920) | ⬜ **사용자가 폰에서 찍는다** |

찍을 화면 4장 권장: ① 색을 대본 카메라 화면 ② ♥ 탭으로 좋아요한 색끼리 비교 ③ 색을 꾹 눌러 채도 3단계가 뜬 화면 ④ 처음 안내 팝업.
얼굴을 넣고 싶지 않으면 ⋯ 메뉴에서 후면 카메라로 바꾸거나 '사진 올리기'로 다른 사진을 쓴다.

## 7. 출시 순서

1. **테스트 → 내부 테스트**에 aab 업로드 → 테스터 목록 연결 → 본인 폰에 설치해 확인 (주소창이 안 떠야 정상).
2. **비공개 테스트** 트랙 만들고 테스터 12명 등록 → 14일 유지 (개인 계정 조건).
3. 조건 충족 후 **프로덕션 액세스 신청** → 승인되면 프로덕션에 같은 aab 승격.
4. 심사는 보통 며칠. 첫 앱은 더 걸릴 수 있다.

### 7-2. 내부 테스트 업로드 순서 (사용자가 조작)

1. 왼쪽 **Test and release → Testing → Internal testing**
2. 오른쪽 위 **Create new release**
3. **App bundles** 에 업로드: `C:\Users\altai\keys\colormirror-build\Personal Color Mirror.aab`
   (첫 업로드 때 **Play App Signing** 안내가 나오면 그대로 동의. 신규 앱 필수이고, 이때 Google 이 앱 서명 키를 만든다)
4. **Release name** 은 자동값(`1 (1.0.0)`) 그대로 둔다
5. **Release notes** (en-US): `First internal test build.`
6. **Next → Save → Review release → Start rollout to Internal testing**
7. 같은 화면의 **Testers** 탭에서 이메일 목록 `internal` 체크 → **Save**
   (목록은 계정 공통이지만 연결은 앱마다 해야 한다 — 7-1 참고)
8. 아래 **Copy link** 로 opt-in 링크를 받아 폰에서 두 계정으로 각각 열어 설치

**업로드 직후 Claude 에게 줄 것**: Test and release → **Setup → App signing** 의
**App signing key certificate** 의 SHA-256 값. assetlinks 에 추가해야 스토어로 설치한 앱에 주소창이 안 뜬다.

### 7-1. 계정 공통인 것 / 앱마다 해야 하는 것 (2026-09-18 확인)

테스터 **이메일 목록은 개발자 계정 하나에 저장되고 모든 앱이 같은 것을 쓴다.** WearCast 에서 만든
`internal` 목록(altair.research.lab@gmail.com, [removed])이 이 앱에서도 그대로 보인다.
다시 만들 필요 없다.

| 계정 공통 (한 번만) | 앱마다 (앱별로) |
|---|---|
| 이메일 목록(테스터 명단) | 그 목록을 **이 앱의 트랙에 연결**하는 것 |
| 개발자 계정 정보·결제 프로필 | AAB 업로드, 버전 |
| 프로덕션 액세스 권한(12명×14일 1회) | 스토어 등록정보, 앱 콘텐츠 답변, 콘텐츠 등급 |

**함정**: 목록이 공통이라도 **연결은 앱마다 해야 한다.** 내부 테스트 > 테스터 탭에서 `internal` 을 체크하지 않으면
테스터에게 안 보인다.

## 8. 이후 업데이트

### 8-1. 나중에 유료 기능을 붙이려면

앱은 무료로 두고 기능만 유료화하는 것(freemium)은 가능하다. 단 TWA 는 한 가지 준비가 더 필요하다.

- **웹 결제(신용카드·토스 등)를 앱 안에서 쓰는 것은 Play 정책 위반**이다. 디지털 상품은 Play 결제를 거쳐야 한다.
- TWA 에서 Play 결제를 쓰려면 **Digital Goods API + Play Billing** 을 켠 패키지로 다시 만들어야 한다
  (PWABuilder 호출의 `features.playBilling.enabled` 를 true 로. 지금은 false).
  즉 **앱 껍데기를 새로 올리는 업데이트**가 필요하고, 사이트만 고쳐서는 안 된다.
- 콘솔에서 인앱 상품/구독을 만들고, 사이트 코드에서 결제를 호출한다.
- 실물·서비스 판매(예: 오프라인 진단 예약)는 Play 결제 의무가 아니다. 디지털 기능 잠금 해제가 의무 대상이다.

지금 결정할 것은 없다. 무료로 올려 두면 나중에 둘 다 가능하다.

- **사이트만 고칠 때**: push하면 끝. 스토어 작업 없음. `sw.js`의 `VERSION` 문자열을 바꿔야 캐시가 갈린다.
- **앱 껍데기를 고칠 때**(이름, 아이콘, 패키지 설정): PWABuilder에서 다시 생성.
  이때 **Signing key → Use mine**으로 Dropbox의 keystore를 넣고, version code를 올린다.
