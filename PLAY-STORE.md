# 플레이 스토어 등록 절차 (PWABuilder → Google Play)

> 갱신: 2026-09-22 (세션 인계)
> 상태: **비공개 테스트 승인 완료.** Alpha 트랙 Active, 릴리스 1 (1.0.0). opt-in 링크 발급됨.
> 다음: 지인에게 계정 주소 받기 → Testers 목록에 추가 → 링크 배포 → 12명 설치 → 14일 시계
> 막힘: 테스터 12명 미모집 (현재 목록 `internal` 2명)
> 더 볼 곳: §9 새 세션 인계, 진행 상황의 '남은 순서' 표, §7-4 테스터 자격

Personal Color Mirror를 Google Play에 올리는 순서. 하나 끝내면 체크하고 다음으로.

배포 URL: https://altair-research.github.io/drape/
개인정보처리방침: https://altair-research.github.io/drape/privacy.html

## 진행 상황 (2026-09-19)

### 끝난 것

- 개발자 계정 인증, 콘솔에 앱 생성 (`com.altairresearchlab.colormirror`)
- 업로드 키 생성·AAB 서명 — 키는 `C:\Users\altai\keys\colormirror-upload.jks` (저장소 밖)
- 저장소 조직 이전에 맞춰 새 도메인용 AAB 재생성
- assetlinks 에 지문 4개 등록, Google 검증 통과 (§4-1 의 함정 주의)
- 내부 테스트 업로드 → 폰 설치 → **주소창 없이 전체화면으로 열림 확인**
- 스토어 문안(한/영), 아이콘, 그래픽 이미지, **스크린샷 4장**

### 남은 순서

| # | 할 일 | 누가 | 걸리는 시간 |
|---|---|---|---|
| ~~1~~ | ~~스토어 등록정보 — 문안·아이콘·그래픽·스크린샷 4장~~ | ✅ 09-22 | |
| ~~2~~ | ~~앱 콘텐츠 답변 (광고 ID 선언 포함)~~ | ✅ 09-22 | |
| ~~3~~ | ~~비공개 테스트 트랙 개설 + 릴리스 + 심사 제출~~ | ✅ 09-22 | |
| ~~4~~ | ~~심사 승인~~ — Alpha 트랙 Active, opt-in 링크 발급 | ✅ 09-22 | |
| 5 | **테스터 12명 모으기** — 안드로이드 쓰는 지인의 구글 계정 주소 | 사용자 | — |
| 6 | 받은 주소를 **Testers 탭 > 이메일 목록 `internal`** 에 추가 | 사용자 | 5분 |
| 7 | **opt-in 링크 배포** (Join on the web 쪽) | 사용자 | 5분 |
| 8 | **14일 연속 테스트** — 12명이 설치 상태 유지 | 대기 | **14일** |
| 9 | 프로덕션 액세스 신청 → 승인 | 사용자 + 대기 | 며칠 |
| 10 | 프로덕션 출시 → 심사 | 대기 | 며칠 |
| 11 | 출시 후: 조직 프로필에 스토어 링크, 한국어 번역 추가 | 같이 | 20분 |


**병목은 8번이고, 그 앞의 5번(사람 모으기)이 실제 관문이다.** 14일 시계는 테스터가 설치해야 돌기 시작한다.
테스터 12명은 계정당 한 번만 통과하면 되므로 WearCast 와 이 앱 중 먼저 준비되는 쪽으로 돌린다.

**메모**: JKS 형식 경고("migrate to PKCS12")는 무해하다. Play 는 JKS 로 서명한 AAB 를 정상 처리한다.
APK 는 만들지 않았다(build-tools 접근이 간헐적으로 실패). 내부 테스트로 설치해 확인하면 되므로 불필요하다.

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
  관례이고, 개인 GitHub 계정을 뒤집은 이름보다 오래 간다.
- 왜 `colormirror` 인가 (`tonemirror`가 아니라): 앱 이름이 Personal Color Mirror / Color Mirror로 확정됐다. `tonemirror`는 버린 이름(톤미러)이라
  영구 식별자에 남길 이유가 없다. **업로드 전 유일한 변경 기회**이므로 지금 바꿨다.
- 버린 것: 개인 GitHub 계정 도메인 + 옛 앱 이름으로 만든 첫 패키지. Play에 올린 적 없으므로 비용 없음.

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
**비밀번호는 파일에 적지 않는다.** 물을 때마다 같은 것을 넣는다. 보관처는 §3.

도구 출처: keytool·jarsigner는 Android Studio에 딸린 JDK(`...\Android Studio\jbr\bin`), zipalign·apksigner는
Android SDK build-tools 36.1.0. 둘 다 WearCast 때 깔린 것을 그대로 쓴다.

### 2-3. 서명 확인 (스크립트 마지막에 자동 출력)

- `keytool -printcert -jarfile ...aab` 첫 줄에 `CN=Altair Research Lab` 이 나와야 한다.
- `apksigner verify --print-certs ...apk` 의 SHA-256 이 assetlinks에 들어갈 지문이다. **이 값을 Claude에게 알려준다.**

### 2-4. 다음 버전을 올릴 때

PWABuilder API 호출의 `appVersion`/`appVersionCode`를 올려 서명 없는 패키지를 다시 받고, 같은 스크립트로 서명한다.
versionCode는 정수이고 **올릴 때마다 반드시 커진다.**

### 2-5. 도메인이 바뀌면 AAB 를 다시 만들어야 한다 (2026-09-18)

저장소가 개인 계정에서 **`altair-research` 조직**으로 이전되면서 배포 주소가 바뀌었다.

| | 전 | 후 |
|---|---|---|
| 사이트 | 개인 계정 도메인의 `/drape/` (**지금 404**) | https://altair-research.github.io/drape/ |
| 루트 저장소 | 개인 계정의 사용자 사이트 (2026-09-18 비공개로 전환) | **`altair-research/altair-research.github.io`** (새로 만듦) |

**TWA 는 여는 주소가 패키지 안에 구워져 있다.** 그래서 도메인이 바뀌면 사이트를 고치는 것만으로는 안 되고
패키지를 다시 만들어야 한다 (사이트 내용만 바뀔 때는 재생성이 필요 없다 — §0 참고).
옛 AAB 는 `C:\Users\altai\keys\colormirror-build\old-domain\` 로 치웠다.

GitHub 은 저장소를 옮겨도 **프로젝트 페이지 주소를 리다이렉트해 주지 않는다** (확인함: 옛 주소 404).
그러므로 옛 주소로 구운 앱은 빈 화면이 된다.

### 2-6. 이 저장소는 공개다 (비공개로 바꿀 수 없다)

`altair-research/drape` 는 **공개 저장소**다. 비공개로 바꾸면 **GitHub Pages 가 멈추고 앱이 빈 화면이 된다** —
무료 플랜에서 Pages 는 공개 저장소에서만 서비스되기 때문이다 (조직 플랜: free, 2026-09-18 확인).
Pro/Team 으로 올리면 비공개 저장소에서도 Pages 가 되지만, 지금은 아니다.

그래서 **이 저장소에 적는 것은 남이 그대로 읽는다고 보아야 한다.** 개인 이메일·실명·개인 계정 아이디를
문서에 적지 않는다. 앱이 서비스하는 파일(`index.html`, `privacy.html`, `manifest.json`)에도 마찬가지다.

커밋 작성자 정보(이름·이메일)는 이력에 남아 공개로 보인다. 그래서 **이 저장소의 커밋 신원을 바꿨다**
(2026-09-18): 저장소별 `git config` 로 `altair research lab <altair.research.lab@gmail.com>`.
비공개 개인 저장소는 기존 신원을 그대로 쓴다 — 전역 규칙(`~/.claude/CLAUDE.md`)에 정리돼 있다.

**과거 커밋의 작성자는 그대로 둔다.** 파일 내용에 있던 개인 이메일은 이미 이력에서 지웠지만(filter-repo),
작성자 이름·아이디까지 바꾸려면 전체 이력을 다시 쓰고 강제 푸시해야 한다. 지금은 하지 않는다.

**남는 노출 하나**: 푸시하는 GitHub 계정은 여전히 개인 계정이므로, 저장소 Activity 탭에는 그 계정이 보인다.
커밋 목록(사람들이 실제로 보는 곳)에는 안 보인다.

## 3. 서명 키 보관

- 위치: **`C:\Users\altai\keys\colormirror-upload.jks`** — 저장소 밖, WearCast 키(`wearcast-upload.jks`)와 같은 폴더.
- **비밀번호: 구글 비밀번호 관리자** — 항목 이름 `drape 업로드 키 (colormirror-upload.jks)`, 메모에 키 위치와 alias `upload`.
  (2026-09-24 정리. 예전의 `colormirror-upload.password.txt` 는 삭제했다. 서명 스크립트는 파일이 없으면 비밀번호를 묻는다.)
- 백업: `.jks` 는 `Dropbox (Personal)\99 drape\keys\colormirror-upload.jks` 에 한 벌 더. 비밀번호는 Dropbox 에 두지 않는다 — 키와 비밀번호가 한 폴더에 있으면 백업이 아니라 유출 경로다.
- 이 키는 **업로드 키**다. 실제 앱 서명은 Google이 보관하는 앱 서명 키가 한다(Play App Signing).
  업로드 키를 잃으면 Google에 재설정을 요청할 수 있어 앱이 영영 죽지는 않지만 며칠 걸린다.
- **git에 절대 넣지 않는다.** 이 저장소는 공개다. `.gitignore`에 `*.jks`, `*.keystore`.
- 예전 PWABuilder 키(`signing.keystore`, alias `colormirror`)는 Play에 올린 적 없으므로 폐기 대상. 그 비밀번호 메모
  (`PASSWORDS-DO-NOT-SHARE.txt`, `signing-key-info.txt`)는 Dropbox 에서 빼서 `C:\Users\altai\keys` 로 옮겼다(로컬 전용).
  **함정: 그 txt 의 비밀번호는 옛 키 것이다.** 업로드 키 비밀번호가 필요하면 txt 가 아니라 구글 비밀번호 관리자를 본다.

## 4. assetlinks.json 올리기

1. **위치가 중요하다.** 안드로이드는 `https://altair-research.github.io/.well-known/assetlinks.json` — **도메인 루트**에서만 찾는다.
   `/drape/.well-known/`은 무시된다 (2026-09-17 실제로 이 때문에 주소창이 떴다).
   루트는 별도 저장소 `altair-research/altair-research.github.io`가 담당한다. 지문이 바뀌면 **그 저장소**의 파일을 고친다.
2. 확인: https://altair-research.github.io/.well-known/assetlinks.json 이 JSON으로 열려야 한다.
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

### 4-1. 함정 — 콘솔이 보여 주는 지문이 실제 배포 서명과 다를 수 있다 (2026-09-18)

주소창이 사라지지 않아 반나절을 썼다. 원인은 **콘솔에서 복사한 앱 서명 키 지문이 실제로 배포되는
APK 의 서명과 달랐기** 때문이다.

- 콘솔 > Protected with Play > Protect app signing key > Manage Play app signing 에는
  **Classical key** 와 **Post-quantum cryptography key** 가 있었고, 그 화면의 앱 서명 키는
  **`Quantum-ready (beta)` 전환 중이라 `Install base 0.0%`** 였다. 즉 **아직 아무 설치본도 그 키를 쓰지 않는다.**
  화면 아래 **Previous app signing keys** 표에 있는 이전 키가 실제 배포에 쓰이고 있었다.
- 그래서 콘솔 값(Classical/PQC)만 넣었더니 검증이 실패했다.

**확실한 확인 방법 — 설치된 앱에서 직접 읽는다.** 추측하지 말고 이걸 한다.

```powershell
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
& $adb shell pm path com.altairresearchlab.colormirror        # base.apk 경로 확인
& $adb pull "<위에서 나온 base.apk 경로>" "$env:TEMP\base.apk"
& "$env:LOCALAPPDATA\Android\Sdk\build-tools\36.1.0\apksigner.bat" verify --print-certs "$env:TEMP\base.apk"
```

`Signer #1 certificate SHA-256 digest` 가 **진짜 검증에 쓰이는 값**이다.
(`keytool -printcert -jarfile` 은 v1 서명만 읽으므로 apksigner 를 쓴다.)

**결론: assetlinks 에는 지문을 넉넉히 넣는다.** 여러 개를 넣을 수 있고 하나만 맞으면 통과한다.
지금 넣은 것 4개 — 실제 배포 서명(43:B0:FC), Play classical(56:77:B5), Play PQC(C0:62:AC), 업로드 키(B2:09:7C).

**서버 쪽 확인은 `list` 말고 `check` 로 한다.** 특정 지문이 연결됐는지 참/거짓으로 답한다.

```
https://digitalassetlinks.googleapis.com/v1/assetlinks:check?source.web.site=https://altair-research.github.io&relation=delegate_permission/common.handle_all_urls&target.android_app.package_name=com.altairresearchlab.colormirror&target.android_app.certificate.sha256_fingerprint=<지문>
```

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
| 스토어 등록정보 연락처 | 이메일 `altair.research.lab@gmail.com`, 웹사이트 `https://altair-research.github.io/drape/` |
| 개인정보처리방침 URL | `https://altair-research.github.io/drape/privacy.html` |

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
| **개인정보처리방침 URL** | https://altair-research.github.io/drape/privacy.html |
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

**App name** (30자 한도, 현재 21자)
```
Personal Color Mirror
```

**Short description** (80자 한도, 현재 67자)
```
Hold seasonal colors up to your face on camera. No sign-up, no ads.
```

**Full description** (4000자 한도)
```
A mirror for personal color draping.

Hold 48 everyday clothing colors from the four seasons under your face like fabric
swatches, and tap the heart on the ones that make your face look clearer. When your
picks cluster in one season, that season is likely yours.

WHAT MAKES IT DIFFERENT

No verdicts. Most color apps take a selfie and announce a season. Lighting changes
that answer, and you cannot see why. This app shows you the colors instead and lets
you judge with your own eyes, the way a draping session works.

WHAT YOU CAN DO

- 48 colors across Spring, Summer, Autumn and Winter, chosen from clothes people
  actually wear: beige, grey, navy, brown, olive, burgundy, coral.
- Three saturation levels for every color. The same red can suit you muted and fight
  you vivid. Press and hold a color to switch.
- Compare only your liked colors. Tap the heart tab to narrow down to your shortlist.
- Hold to compare with the previous color.
- Switch to the rear camera so a friend can drape you.
- Lock the light so the camera stops re-adjusting while you swipe.
- Korean and English.

PRIVACY

No account. No ads. No payments. The camera feed is drawn on your screen and never
leaves your phone. Liked colors are saved in your browser storage on the device.

A NOTE ON ACCURACY

This is a suggestion, not a diagnosis. Screens and lighting change how colors look,
so try it in daylight near a window, and try again another day to see what overlaps.
```

**참고**: 한국어는 등록 후 **스토어 설정 → 번역 관리**에서 ko-KR 을 추가하고 §6-2 문안을 넣는다.

### 6-3. 스토어 등록정보에 필요한 이미지

| 이미지 | 크기 | 상태 / 파일 |
|---|---|---|
| 앱 아이콘 | 512×512 PNG | ✅ `C:\dev\drape\icon-512.png` |
| 그래픽 이미지 (feature graphic) | 1024×500 PNG | ✅ `C:\dev\drape\storeeature-graphic.png` |
| 휴대전화 스크린샷 | 1080×1920 (9:16) 4장 | ✅ `store/screenshots/01-main.png` ~ `04-intro.png` |

**얼굴은 일러스트를 쓴다.** 스토어 스크린샷은 영구히 공개되므로 실제 얼굴을 넣지 않는다.
`tools/make-model.py` 가 단정한 일러스트 인물(`model.png`)을 그리고,
`tools/make-screenshots.py` 가 실제 앱을 headless Chrome 으로 띄워 4장을 캡처한다.

```powershell
python C:\dev\drape	ools\make-model.py
python C:\dev\drape	ools\make-screenshots.py
```

원리: 앱을 임시 폴더에 복사해 화면마다 상태(언어·좋아요 목록·팝업 표시)를 미리 세팅하는 스크립트를 끼워 넣고,
카메라 대신 일러스트를 `#shot` 에 물린 뒤 **540×960 CSS 뷰포트 ×2 배율 = 1080×1920** 으로 찍는다.
뷰포트를 좁게(360·432) 잡으면 ♥ 탭과 ⋯ 버튼이 화면 밖으로 밀리니 540 을 쓴다.

찍는 4장: ① 색을 얼굴 아래 댄 기본 화면 ② 채도 3단계가 뜬 화면 ③ ♥ 탭으로 좋아요한 색끼리 비교 ④ 처음 안내 팝업.
결과물은 `store/screenshots/` 에 생기고 **git 에는 올리지 않는다**(폰 캡처에 개인 정보가 섞일 수 있어 `.gitignore` 에 넣었다).

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

**업로드 직후 Claude 에게 줄 것**: **앱 서명 키 인증서의 SHA-256**.
위치는 왼쪽 **Test and release → App integrity** 인데, 2026-09 개편으로 그 화면이 비었고
**Go to Protected with Play** 버튼으로 옮겨 갔다. 거기 **App signing** 항목의
**App signing key certificate** 에서 SHA-256 을 복사한다.
assetlinks 에 추가해야 스토어로 설치한 앱에 주소창이 안 뜬다.

### 7-1. 계정 공통인 것 / 앱마다 해야 하는 것 (2026-09-18 확인)

테스터 **이메일 목록은 개발자 계정 하나에 저장되고 모든 앱이 같은 것을 쓴다.** WearCast 에서 만든
`internal` 목록(개발자 계정 + 개인 계정 2개)이 이 앱에서도 그대로 보인다. 주소는 콘솔에서 확인한다 — 공개 저장소에 적지 않는다.
다시 만들 필요 없다.

| 계정 공통 (한 번만) | 앱마다 (앱별로) |
|---|---|
| 이메일 목록(테스터 명단) | 그 목록을 **이 앱의 트랙에 연결**하는 것 |
| 개발자 계정 정보·결제 프로필 | AAB 업로드, 버전 |
| 프로덕션 액세스 권한(12명×14일 1회) | 스토어 등록정보, 앱 콘텐츠 답변, 콘텐츠 등급 |

**함정**: 목록이 공통이라도 **연결은 앱마다 해야 한다.** 내부 테스트 > 테스터 탭에서 `internal` 을 체크하지 않으면
테스터에게 안 보인다.

### 7-3. 비공개 테스트 기록 (2026-09-22)

- 트랙: **Closed testing - Alpha** (콘솔이 기본 제공한 트랙을 그대로 씀)
- 릴리스: `1 (1.0.0)` — 내부 테스트에 올린 것과 **같은 번들**을 `Add from library` 로 붙였다.
  같은 versionCode 를 새로 업로드하면 "Version code 1 has already been used" 로 막힌다. 재빌드할 필요 없다.
- 국가: 대한민국, 미국 (비공개 테스트는 트랙마다 국가를 따로 정해야 한다)
- 테스터: 이메일 목록 `internal` (현재 2명). **12명까지 채워야 프로덕션 자격이 생긴다.**
  목록은 계정 공통이라 주소만 추가하면 되고 트랙은 다시 손대지 않아도 된다.
- 제출 전에 자동 점검이 **광고 ID 선언 누락**을 잡았다 → "광고 ID 사용 안 함"으로 답해 해결.
  이 앱은 광고·분석·추적 코드가 없다. Android 13 이상 타겟은 안 써도 신고해야 한다.
- **Managed publishing 은 끈 채로 둔다.** 켜면 심사 통과 후에도 수동으로 눌러야 배포된다.

**비공개 테스트는 내부 테스트와 달리 구글 심사를 거친다.** 그래서 테스터가 다 모이기 전에 먼저 제출해
심사 기간과 모집 기간을 겹치게 하는 편이 빠르다.

### 7-4. 테스터 자격 (자주 헷갈리는 것)

| 질문 | 답 |
|---|---|
| 안드로이드여야 하나 | **그렇다.** 아이폰은 Play 스토어가 없어 설치가 불가능하다. 크롬북·에뮬레이터도 원칙상 가능 |
| Gmail 이어야 하나 | 아니다. **구글 계정이면 된다** — 워크스페이스 회사 메일, 구글 계정으로 가입한 다른 주소도 된다 |
| 무엇이 맞아야 하나 | 목록에 넣은 주소 = **그 사람 폰의 Play 스토어에 로그인된 계정** |
| 조건이 정확히 뭔가 | **12명이 14일 연속 참여(opt-in) 상태 유지.** 사용 빈도가 자동 집계되지는 않는다 |
| 그럼 안 써도 되나 | 프로덕션 신청서에 "테스트에서 무엇을 배웠는지" 쓰는 칸이 있다. 실제로 써 본 사람이 있어야 채울 수 있다 |
| 계정 여러 개로 채워도 되나 | **안 된다.** 서로 다른 사람이어야 하고, 구글이 걸러내면 프로덕션 승인이 거부된다 |

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
  이때 §2 대로 서명 없는 패키지를 받아 `tools/sign-android.ps1` 로 `C:\Users\altai\keys\colormirror-upload.jks` 서명을 하고, version code를 올린다.

---

## 9. 새 세션 인계 (2026-09-22)

### 지금 어디까지 왔나

앱은 **완성돼 있고 비공개 테스트로 배포 중**이다. 코드 작업은 남은 게 없다.
남은 것은 전부 **사람을 모으고 기다리는 일**이다.

- 앱: https://altair-research.github.io/drape/ (v27, 한/영, 48색 × 채도 3단계)
- 콘솔: Personal Color Mirror / `com.altairresearchlab.colormirror`, Alpha 트랙 Active
- 폰에서 **주소창 없이 전체화면으로 열리는 것까지 확인 완료**

### 다음 세션이 할 일

1. 사용자가 지인 계정 주소를 모아 오면 → 콘솔 Testers 목록에 넣는 방법 안내 (콘솔 조작은 사용자가 한다)
2. 12명이 설치하면 14일을 센다. 중간에 누가 앱을 지우면 집계에서 빠진다
3. 14일 뒤 **프로덕션 액세스 신청** → 신청서에 "테스트에서 무엇을 배웠는지" 쓰는 칸이 있다
4. 프로덕션 출시 후 §8-1(인앱 결제), 한국어 스토어 번역, 조직 프로필 README

### 알고 있어야 하는 것들

| 주제 | 어디 |
|---|---|
| 서명 키·비밀번호 위치, AAB 만드는 법 | §2, §3, `tools/sign-android.ps1` |
| **콘솔 지문 ≠ 실제 배포 서명** (반나절 날린 함정) | §4-1 |
| 콘솔 각 칸에 넣을 값 | §6-0 |
| 스토어 문안 (영/한) | §6-2b, §6-2 |
| 스크린샷 다시 만들기 | §6-3, `tools/make-model.py`, `tools/make-screenshots.py` |
| 테스터 자격 (안드로이드 필수, Gmail 불필요) | §7-4 |
| 같은 versionCode 재업로드 불가 → Add from library | §7-3 |

### 사용자 방침 (어기면 안 되는 것)

- 공개 저장소에 **개인 아이디·실명·개인 이메일을 쓰지 않는다.** 커밋 신원은 저장소별 git config 로
  `altair research lab <altair.research.lab@gmail.com>` 이 박혀 있다.
- 스토어 스크린샷에 **실제 얼굴을 쓰지 않는다.** 일러스트(`tools/make-model.py`)로 대체한다.
- **'판정'하는 기능을 다시 제안하지 않는다.** 2026-09-17 에 어울림 % 점수를 넣었다가 뺐다.
  카메라 화이트밸런스와 화면 반사 부재로 근거가 약하고, 이 앱의 차별점은 "판정하지 않는 것"이다.

### 사람만 할 수 있는 일 (Claude 가 못 함)

- 지인에게 연락해 계정 주소 받기
- Play Console 조작 (사용자가 직접 하기로 정함 — Claude 는 각 칸에 넣을 값만 알려준다)
- 폰에서 설치·확인
