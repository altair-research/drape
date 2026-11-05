# drape 산출물 목록

> 규칙(11-02 사용자): 이 프로젝트에서 만든 보고서·시안·주요 문서·배포 주소를 여기 한 곳에 모은다. 최신이 위. 새 산출물은 같은 커밋에 한 줄 추가.
> 얼굴 사진·열쇠 붙은 링크는 넣지 않는다. 이 저장소는 공개이고 GitHub Pages 가 저장소 파일을 그대로 내보내므로, 이 목록도 공개다.

| 날짜 | 제목 | 경로 / 주소 | 한 줄 설명 |
|---|---|---|---|
| 2026-11-05 | 앱 v41 (운영) | https://altair-research.github.io/drape/ | v41 카메라 전환 이름, v40 가을 막대 카키 그린, v39 axe 위반 0(inert·h1), v38 키보드(색 띠 Tab 57→10·손잡이·비교 키), v37 접근성(키보드·낭독기·대비, axe critical·serious 0), v36 작은 폰, v35 종이 판별, v34 흰 종이 보정·내가 고른 색 요약 |
| 2026-11-05 | WebKit 실패 원인 메모 | `tests/e2e/WEBKIT-DIAG.md` | 9회 실행: 동시 실행 때만 실패, 혼자 4회 연속 통과(추정). 앱 버그 아님 |
| 2026-11-05 | 접근성 점검 (axe·키보드·낭독기) | `docs/A11Y-CHECK.md` · `tests/e2e/a11y.spec.js` | critical 2·serious 2종, Esc·초점 이동 없음·Space ♥ 막힘·aria-live 없음, 고칠 제안 작은/중간/큰(미적용). 브랜치 claude/a11y-check |
| 2026-11-04 | 출시 전 점검 (SW·manifest·assetlinks) | `docs/RELEASE-CHECK.md` · `node tools/check-release.mjs` · `tests/e2e/release.spec.js` | 오프라인·버전 올림 캐시 교체 실증, 점검 37통과·0실패·1경고. |
| 2026-11-04 | Codex 오늘 밤 지시문 A·B·C | `docs/codex-2026-11-04.md` | WebKit 실패 원인·출시 전 점검(오프라인·캐시·manifest)·접근성. 붙여넣기용, 동시 가능 |
| 2026-11-04 | ③ 작은 폰·WebKit 점검 보고서 | `tests/e2e/MOBILE-REPORT.md` | 320~412px × 한/영 × 두 엔진, 고친 문제 전후 24장(`tests/e2e/mobile-evidence/`) |
| 2026-11-04 | ② 색 데이터 감사 | `docs/COLOR-AUDIT.md` · `node tools/audit-colors.mjs` | 267통과·0실패, 유사색 3쌍, 가을 요약 '선명한 쪽', 봄·가을 막대색 대안 제안(미적용) |
| 2026-11-04 | ① 자동 테스트 보고서 | `tests/e2e/REPORT.md` | Chromium 17통과, WebKit 12통과·5실패. 합성 사진·화면 픽셀 검사, 앱 변경 없음 |
| 2026-11-03 | 바뀐 점 보고서 (v34·v35) | `plans/archive/2026-11-03-report.html` | 흰 종이 보정 메뉴·안내·전후, 내가 고른 색 요약을 스크린샷으로(시험 그림, 사람 사진 없음) |
| 2026-11-03 | Codex 지시문 3개 | `docs/codex-2026-11-03.md` | e2e 테스트(크롬+사파리 엔진)·색 데이터 감사·작은 폰 점검. 붙여넣기용, 결과는 codex/ 브랜치 |
| 2026-11-02 | 앱 소개·차별점 보고서 | `plans/archive/2026-11-02-report.html` | 경쟁 앱 비교, 배경 따라 바뀌는 얼굴색 보정 방법, 다른 앱 매칭 점수, 매칭 유료판 선택지 |
| 2026-11-02 | 대표 인계 문서 | `HANDOFF.md` | 맨 위 15줄 머리말이 정본(상태·다음·막힘·AI 결정) |
| 2026-10-28 | Play 등록 절차 (계속 갱신) | `PLAY-STORE.md` | 서명·assetlinks·콘솔 입력값, §6-2 스토어 문구, §6-2c 릴리스 노트, §7-5 가장 빠른 출시일·출시 날 순서 |
| 2026-10-28 | 스토어 스크린샷 5번째 시안 (결과 화면) | `store/screenshots/05-result.png` (로컬, git 제외) | 좋아요 목록 계절 분포 + 결과 공유 버튼. 일러스트 인물. `python tools/make-screenshots.py 05-result` 로 다시 찍음 |
| 2026-10-28 | 스크린샷 생성기 | `tools/make-screenshots.py` | 실제 앱을 headless Chrome 으로 띄워 1080×1920 캡처. 장 이름을 주면 그 장만 |
| 2026-10-26 | 플랜 기록 입구 | `plans/index.html` (로컬) · 휴대폰은 전체 입구 북마크 | 목표 11-20 출시, 단계·결정 다섯 칸. 설정 `plans/plans.json` |
| 2026-10-26 | 프로덕션 신청서 답변 초안 | `store/production-application.md` | Play "Apply for production" 칸별 영어 답 + 피드백 메모 표. 14일 뒤 사용자가 제출 |
| 2026-10-26 | 테스터 넣기 순서 | `store/tester-invite.md` | 콘솔 Testers 탭 클릭 순서. 보낼 메시지는 wearcast `docs/TESTER-INVITE.md` §0 |
| 2026-10-26 | 개인정보처리방침 (10-26 시행) | https://altair-research.github.io/drape/privacy.html | 카메라·좋아요·의견 메일·공유 처리. 한/영 |
| 2026-09-22 | 스토어 그래픽·스크린샷 4장 | `store/feature-graphic.png`, `store/screenshots/01~04` (스크린샷은 로컬) | Play 등록정보에 올라간 이미지 |
| 2026-09-05 | 시장 조사 | `MARKET.md` | 경쟁 앱 지형, "판정하지 않는 거울" 자리, 할 것·하지 말 것 |
