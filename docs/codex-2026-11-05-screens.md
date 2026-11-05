# Codex 요청문 — 스토어 스크린샷 v41 새로 찍기 (2026-11-05, 30~50분)

> 이미지 작업 한 창. 사이트가 v35→v41 로 바뀌어(가을 막대 카키색, 접근성 표시) 스토어 스크린샷 4장 + 결과 화면 ⑤ 시안이 옛 모습이다.
> 붙여 넣기용은 아래 코드블록. main 병합은 프로젝트 타워가 검수 후 한다.

```
작업 폴더: C:\dev\drape  (저장소 altair-research/drape, 공개 저장소)
브랜치: origin/main 에서 새 브랜치 codex/store-screens-v41 를 만들어 작업한다. main 에 병합·푸시하지 말 것. 브랜치 푸시까지만.
커밋 신원: altair research lab <altair.research.lab@gmail.com>. AI 공동저자 줄 넣지 말 것.

목표: Play 스토어 휴대전화 스크린샷을 현재 사이트(v41)로 다시 찍어, 한국어·영어 두 벌을 만든다.

1. 먼저 읽기: PLAY-STORE.md §6-3(스크린샷 원리), tools/make-screenshots.py, tools/make-model.py.
2. python tools/make-model.py → python tools/make-screenshots.py 로 5장(01-main~04-intro + 05-result)을 찍는다.
   - 1080×1920, 얼굴은 반드시 일러스트(model.png). 실제 사람 얼굴·카메라 캡처 금지.
   - 05-result 는 계절 분포 막대가 보여야 한다. 가을 막대가 카키 녹색(#5E6B3C)인지 확인.
3. make-screenshots.py 에 언어 인자를 추가해(예: --lang en) 영어판 5장도 찍는다. 기존 사용법(이름 인자)은 그대로 동작해야 한다.
4. 산출물(일러스트뿐이라 커밋해도 된다):
   - store/screens-v41/ko/01-main.png … 05-result.png
   - store/screens-v41/en/01-main.png … 05-result.png
   - store/screens-v41/index.html — 10장을 한 화면에 나란히 보는 검수 페이지(파일명·크기 표시, 상대경로 이미지)
   - store/screens-v41/CHECK.md — 장마다 한 줄: 무엇을 보여주나 / 잘린 것·겹친 것·글자 넘침 / 확신도(확실·추정)
   기존 store/screenshots/ 는 .gitignore 그대로 둔다.
5. 하지 말 것: index.html·sw.js(사이트 코드) 수정, 스토어 콘솔 업로드, 테스터·키·비밀번호 기록.
6. 끝나면 커밋 → 브랜치 푸시 → CHECK.md 요약 5줄로 보고.
```

## 검수 (프로젝트 타워)
- 10장 직접 열어 보기: 얼굴 일러스트인지, ♥ 탭·⋯ 이 화면 안인지, 05 가을 막대 카키인지.
- 통과하면 store/screens-v41 만 main 으로 가져오고, PLAY-STORE.md §6-3 표를 5장·두 언어로 고친다. 콘솔 업로드는 사용자.
