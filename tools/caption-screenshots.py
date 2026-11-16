"""스토어 스크린샷에 위쪽 캡션 한 줄을 붙이고, 올릴 순서대로 번호를 매긴다 (2026-11-17, 서연 '스토어 3초' 검토).

- 입력: make-screenshots.py 가 만든 store/screenshots/*.png (영어) 와 store/screenshots/ko/*.png (한국어)
- 출력: store/screenshots/captioned/<en|ko>/1-main.png ... 5-intro.png  (1080x1920, Play 9:16)
- 순서 (서연 추천): 메인 → 결과 → ♥끼리 비교 → 3단계 → 안내 창. 같은 코랄 화면 세 장이 이어지지 않게 결과를 2번째로.
- 결과물은 git 에 넣지 않는다(store/screenshots/ 는 .gitignore). 콘솔에 올리는 건 사용자.

  python tools/make-screenshots.py              # 영어 5장
  python tools/make-screenshots.py --lang=ko    # 한국어 5장
  python tools/caption-screenshots.py
"""
import os
from PIL import Image, ImageDraw, ImageFont

BASE = r"C:\dev\drape\store\screenshots"
ORDER = [  # (원본 이름, 캡션 ko, 캡션 en)
    ("01-main",   "얼굴 아래 색을 천처럼 대 보세요",            "Hold colors under your face like fabric"),
    ("05-result", "♥한 색이 어느 쪽인지 한눈에",            "See where your liked colors gather"),
    ("03-liked",  "♥한 색끼리만 다시 비교해요",                  "Compare only the colors you liked"),
    ("02-levels", "한 색도 흐리게 · 기본 · 선명하게 3단계",      "Every color in 3 strengths"),
    ("04-intro",  "가입·광고 없음 · 영상은 폰 밖으로 안 나가요", "No sign-up, no ads. Video stays on your phone"),
]
W, H, TOP = 1080, 1920, 300
BG, FG = (21, 20, 26), (243, 242, 239)
FONT = {"ko": r"C:\Windows\Fonts\malgunbd.ttf", "en": r"C:\Windows\Fonts\segoeuib.ttf"}


def wrap(draw, text, font, maxw):
    words, lines, line = text.split(" "), [], ""
    for w in words:
        t = (line + " " + w).strip()
        if draw.textlength(t, font=font) > maxw and line:
            lines.append(line); line = w
        else:
            line = t
    return lines + [line]


def one(lang, i, name, cap):
    src = os.path.join(BASE, name + ".png") if lang == "en" else os.path.join(BASE, lang, name + ".png")
    shot = Image.open(src).convert("RGB")
    h = H - TOP - 40
    w = round(shot.width * h / shot.height)
    shot = shot.resize((w, h), Image.LANCZOS)
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, w - 1, h - 1), radius=44, fill=255)
    out = Image.new("RGB", (W, H), BG)
    out.paste(shot, ((W - w) // 2, TOP), mask)
    d = ImageDraw.Draw(out)
    size = 68
    font = ImageFont.truetype(FONT[lang], size)
    lines = wrap(d, cap, font, W - 140)
    while len(lines) > 2 and size > 48:
        size -= 4; font = ImageFont.truetype(FONT[lang], size); lines = wrap(d, cap, font, W - 140)
    lh = size * 1.3
    y = (TOP - lh * len(lines)) / 2 + 6
    for ln in lines:
        d.text(((W - d.textlength(ln, font=font)) / 2, y), ln, font=font, fill=FG)
        y += lh
    dst_dir = os.path.join(BASE, "captioned", lang)
    os.makedirs(dst_dir, exist_ok=True)
    dst = os.path.join(dst_dir, f"{i}-{name.split('-', 1)[1]}.png")
    out.save(dst)
    print(dst, out.size)


if __name__ == "__main__":
    for lang in ("ko", "en"):
        for i, (name, ko, en) in enumerate(ORDER, 1):
            one(lang, i, name, ko if lang == "ko" else en)
