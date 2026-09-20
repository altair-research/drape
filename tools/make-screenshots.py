"""스토어 스크린샷 4장을 실제 앱에서 만든다.

- 앱을 임시 폴더에 복사하고, 화면마다 '상태를 미리 세팅하는 스크립트'를 끼워 넣은 html 을 만든다.
- headless Chrome 으로 540x960 CSS 뷰포트 x2 배율 = 1080x1920 (Play 요구 9:16) 로 캡처한다.
- 카메라 대신 일러스트 인물(model.png)을 쓴다.
"""
import os, re, shutil, subprocess, threading, http.server, socketserver, functools, time

SRC = r"C:\dev\drape"
TMP = r"C:\Users\altai\AppData\Local\Temp\cm-shots"
OUT = r"C:\dev\drape\store\screenshots"
CHROME = r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
PORT = 8791

LIKED = '["#FF7F6E","#FFB088","#FF8FA3","#E7A0B8"]'   # 코랄·피치·살몬핑크·로즈핑크

SHOTS = [
    # (파일명, intro 표시, 담은 색, 추가 동작)
    ("01-main",    "1", "[]",    "chips[4].click();"),                       # 코랄을 얼굴 아래 댄 기본 화면
    ("02-levels",  "1", "[]",    "chips[4].click(); q('levels').classList.add('show'); hideHint();"),
    ("03-liked",   "1", LIKED,   "q('heartTab').click(); hideHint();"),      # 좋아요한 색끼리 비교
    ("04-intro",   "",  "[]",    "chips[4].click();"),                       # 처음 안내 팝업
]

HEAD = """<script>
try{
  localStorage.setItem('drape.lang','en');
  %s
  localStorage.setItem('drape.saved','%s');
}catch(e){}
try{ navigator.mediaDevices.getUserMedia = undefined; }catch(e){}
</script>
"""

TAIL = """<script>
(function(){
  var q=function(id){return document.getElementById(id);};
  var chips=document.querySelectorAll('#strip .chip');
  var hideHint=function(){ q('hint').classList.add('off'); };
  q('stage').classList.remove('blocked');
  q('shot').src='model.png';
  q('stage').classList.add('photo');
  %s
})();
</script>
"""

def build():
    if os.path.isdir(TMP):
        shutil.rmtree(TMP)
    os.makedirs(TMP)
    for f in ("index.html", "manifest.json", "icon-192.png", "icon-512.png",
              "icon-maskable-512.png", "apple-touch-icon.png"):
        shutil.copy(os.path.join(SRC, f), TMP)
    shutil.copy(os.path.join(OUT, "model.png"), TMP)

    base = open(os.path.join(TMP, "index.html"), encoding="utf-8").read()
    # 서비스워커는 캡처에 방해만 되므로 뺀다
    base = base.replace('navigator.serviceWorker.register("sw.js")', 'Promise.resolve()')

    for name, intro, saved, extra in SHOTS:
        intro_line = "localStorage.setItem('drape.intro','1');" if intro else "localStorage.removeItem('drape.intro');"
        html = base.replace("</head>", HEAD % (intro_line, saved) + "</head>", 1)
        html = html.replace("</body>", TAIL % extra + "</body>", 1)
        open(os.path.join(TMP, name + ".html"), "w", encoding="utf-8", newline="\n").write(html)
    print("built", len(SHOTS), "pages in", TMP)

def serve():
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=TMP)
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.TCPServer(("127.0.0.1", PORT), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd

def shoot():
    os.makedirs(OUT, exist_ok=True)
    for name, *_ in SHOTS:
        dst = os.path.join(OUT, name + ".png")
        if os.path.exists(dst):
            os.remove(dst)
        cmd = [CHROME, "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
               "--window-size=540,960", "--force-device-scale-factor=2",
               "--virtual-time-budget=9000", "--screenshot=" + dst,
               f"http://127.0.0.1:{PORT}/{name}.html"]
        subprocess.run(cmd, capture_output=True, timeout=180)
        size = os.path.getsize(dst) if os.path.exists(dst) else 0
        print(f"  {name}.png  {size/1024:.0f}KB")

if __name__ == "__main__":
    build()
    httpd = serve()
    time.sleep(1)
    shoot()
    httpd.shutdown()
    from PIL import Image
    for name, *_ in SHOTS:
        p = os.path.join(OUT, name + ".png")
        if os.path.exists(p):
            print(name, Image.open(p).size)
