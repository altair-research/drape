"""스토어 스크린샷용 일러스트 인물. 실제 얼굴 대신 쓴다. 평면적이고 단정하게."""
from PIL import Image, ImageDraw, ImageFilter
import os

S = 3                      # 수퍼샘플링 배율
W, H = 720, 960
w, h = W * S, H * S

SKIN       = (233, 199, 173)
SKIN_DARK  = (214, 176, 150)
HAIR       = (54, 40, 34)
LIP        = (196, 120, 110)
BROW       = (86, 62, 50)
EYE        = (52, 40, 34)
TOP        = (208, 203, 196)

def sc(*v):
    return [x * S for x in v]

im = Image.new("RGB", (w, h), (0, 0, 0))
d = ImageDraw.Draw(im)

# 배경 — 아주 옅은 세로 그라데이션
for y in range(h):
    t = y / h
    d.line([(0, y), (w, y)], fill=(int(240 - 16 * t), int(236 - 16 * t), int(230 - 15 * t)))

cx = w // 2

# 어깨·상의
d.rounded_rectangle(sc(cx // S - 290, 600, cx // S + 290, H), radius=70 * S, fill=TOP)

# 목
d.rounded_rectangle(sc(cx // S - 72, 400, cx // S + 72, 620), radius=36 * S, fill=SKIN_DARK)

# 머리 뒤쪽 — 얼굴보다 살짝 크게, 아래로 자연스럽게 흐르는 단발
d.ellipse(sc(cx // S - 176, 104, cx // S + 176, 470), fill=HAIR)
d.rounded_rectangle(sc(cx // S - 176, 280, cx // S - 116, 500), radius=30 * S, fill=HAIR)
d.rounded_rectangle(sc(cx // S + 116, 280, cx // S + 176, 500), radius=30 * S, fill=HAIR)

# 얼굴
d.ellipse(sc(cx // S - 144, 128, cx // S + 144, 496), fill=SKIN)

# 앞머리 — 이마 위를 덮는 낮은 아치
d.chord(sc(cx // S - 150, 110, cx // S + 150, 330), start=180, end=360, fill=HAIR)

# 눈썹
d.arc(sc(cx // S - 104, 262, cx // S - 34, 300), start=198, end=342, fill=BROW, width=6 * S)
d.arc(sc(cx // S + 34, 262, cx // S + 104, 300), start=198, end=342, fill=BROW, width=6 * S)

# 눈 — 작고 단순하게
for s in (-1, 1):
    ex = cx // S + s * 68
    d.ellipse(sc(ex - 21, 314, ex + 21, 342), fill=(250, 248, 246))
    d.ellipse(sc(ex - 11, 318, ex + 11, 340), fill=EYE)
    d.line(sc(ex - 22, 316, ex + 22, 314), fill=EYE, width=4 * S)

# 코
d.arc(sc(cx // S - 17, 348, cx // S + 17, 396), start=20, end=160, fill=SKIN_DARK, width=5 * S)

# 입
d.ellipse(sc(cx // S - 36, 408, cx // S + 36, 440), fill=LIP)

# 볼 — 블러로 아주 은은하게
blush = Image.new("RGB", (w, h), (0, 0, 0))
mask = Image.new("L", (w, h), 0)
bd, md = ImageDraw.Draw(blush), ImageDraw.Draw(mask)
for s in (-1, 1):
    bx = cx // S + s * 92
    bd.ellipse(sc(bx - 36, 352, bx + 36, 392), fill=(234, 166, 150))
    md.ellipse(sc(bx - 36, 352, bx + 36, 392), fill=46)
mask = mask.filter(ImageFilter.GaussianBlur(14 * S))
im = Image.composite(blush, im, mask)

im = im.resize((W, H), Image.LANCZOS)
out = r"C:\dev\drape\store\screenshots\model.png"
os.makedirs(os.path.dirname(out), exist_ok=True)
im.save(out, optimize=True)
print("saved", out, im.size, f"{os.path.getsize(out)/1024:.0f}KB")
