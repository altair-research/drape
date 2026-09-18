# 플레이 스토어 등록 절차 (PWABuilder → Google Play)

> 갱신: 2026-09-18 09:20
> 상태: 개발자 계정 인증 완료(09-17). 서명 없는 aab/apk 준비됨(패키지 com.altairresearchlab.colormirror). 사용자 키 서명 대기.
> 다음: 사용자가 `tools\sign-android.ps1` 실행(키 생성+서명) → Claude가 지문을 assetlinks에 반영 → 콘솔 입력(§6) → 내부 테스트(§7)
> 막힘: 없음 (사용자 차례)
> 더 볼 곳: 이 문서 §2(패키지·서명), §6(콘솔 입력값), tools/sign-android.ps1

Personal Color Mirror를 Google Play에 올리는 순서. 하나 끝내면 체크하고 다음으로.

배포 URL: https://altair0622.github.io/drape/
개인정보처리방침: https://altair0622.github.io/drape/privacy.html

## 진행 상황 (2026-09-18 갱신)

- [x] §1 Google Play 개발자 계정 — altair.research.lab@gmail.com. 09-17 신분확인·기기·전화 인증 전부 완료
- [x] 앱 이름 Personal Color Mirror, 한/영 UI, 개인정보처리방침(한/영), 그래픽 이미지, 스토어 문안(§6)
- [x] 패키지 ID 결정 — `com.altairresearchlab.colormirror` (§2-0에 이유)
- [x] §2-1 서명 없는 aab/apk — `C:\Users\altai\keys\colormirror-build\unsigned\` (PWABuilder API, 09-18)
- [ ] §2-2 업로드 키 생성 + 서명 — **사용자**가 `tools\sign-android.ps1` 실행 (비밀번호는 사용자가 정함)
- [ ] §4 assetlinks.json — 서명 뒤 새 지문으로 교체 (Claude)
- [ ] 폰에서 새 apk 설치 확인 — 옛 앱(톤미러, Color Mirror) 먼저 삭제
- [ ] §6 콘솔 입력 → §7 내부 테스트 업로드 → 두 계정으로 설치 확인
- [ ] 첫 업로드 후 Play 앱 서명 키 지문을 assetlinks에 추가
- [ ] 폰 스크린샷 2~8장, 테스터 12명 이메일

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

### 스토어 등록정보에 필요한 이미지

| 이미지 | 크기 | 비고 |
|---|---|---|
| 앱 아이콘 | 512×512 PNG | `icon-512.png` 그대로 사용 가능 |
| **그래픽 이미지(feature graphic)** | **1024×500** PNG/JPG | 필수. 아직 없음 → 만들어야 한다 |
| 휴대전화 스크린샷 | 2~8장, 세로 16:9 권장 (예 1080×1920) | 필수. 실제 폰에서 찍는다 |

### 스토어 문안 초안 — 한국어 (기본 언어)

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

### 스토어 문안 초안 — English

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

## 7. 출시 순서

1. **테스트 → 내부 테스트**에 aab 업로드 → 본인 폰에 설치해 확인 (주소창이 안 떠야 정상).
2. **비공개 테스트** 트랙 만들고 테스터 이메일 목록 등록 → 14일 유지 (개인 계정 조건).
3. 조건 충족 후 **프로덕션 액세스 신청** → 승인되면 프로덕션에 같은 aab 승격.
4. 심사는 보통 며칠. 첫 앱은 더 걸릴 수 있다.

## 8. 이후 업데이트

- **사이트만 고칠 때**: push하면 끝. 스토어 작업 없음. `sw.js`의 `VERSION` 문자열을 바꿔야 캐시가 갈린다.
- **앱 껍데기를 고칠 때**(이름, 아이콘, 패키지 설정): PWABuilder에서 다시 생성.
  이때 **Signing key → Use mine**으로 Dropbox의 keystore를 넣고, version code를 올린다.
