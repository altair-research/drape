# Personal Color Mirror — 안드로이드 패키지 서명 스크립트 (Windows PowerShell 5.1)
#
# 하는 일:
#   1) 업로드 키가 없으면 만든다  (비밀번호는 keytool이 직접 물어본다 — 이 파일에 적지 않는다)
#   2) PWABuilder가 준 '서명 없는' aab/apk 에 그 키로 서명한다
#   3) 서명이 제대로 붙었는지, 지문(SHA-256)이 무엇인지 출력한다
#
# 실행:  powershell -ExecutionPolicy Bypass -File C:\dev\drape\tools\sign-android.ps1
# 비밀번호는 물을 때마다 같은 것을 넣는다 (keystore 비밀번호 = 키 비밀번호로 통일).

$ErrorActionPreference = "Stop"

$JBR = "C:\Program Files\Android\Android Studio\jbr\bin"          # Android Studio 에 딸린 JDK (keytool, jarsigner)
$BT  = "$env:LOCALAPPDATA\Android\Sdk\build-tools\36.1.0"           # zipalign, apksigner
$K   = "C:\Users\altai\keys"                                        # 키 보관 폴더 (저장소 밖, WearCast 키와 같은 곳)
$JKS = "$K\colormirror-upload.jks"
$ALIAS = "upload"
$IN  = "$K\colormirror-build\unsigned"                              # PWABuilder 결과물 (서명 없음)
$OUT = "$K\colormirror-build"

foreach ($p in @("$JBR\keytool.exe", "$JBR\jarsigner.exe", "$BT\zipalign.exe", "$BT\apksigner.bat",
                 "$IN\Personal Color Mirror-unsigned.aab", "$IN\Personal Color Mirror-unsigned.apk")) {
    if (-not (Test-Path $p)) { throw "없음: $p" }
}

# ---------- 1) 업로드 키 ----------
if (-not (Test-Path $JKS)) {
    Write-Host "`n[1/4] 업로드 키를 만듭니다. 비밀번호를 정해서 입력하세요 (두 번 같은 것)." -ForegroundColor Cyan
    & "$JBR\keytool.exe" -genkeypair -v -keystore $JKS -storetype JKS -keyalg RSA -keysize 2048 -validity 10000 `
        -alias $ALIAS -dname "CN=Altair Research Lab, O=Altair Research Lab"
    if ($LASTEXITCODE -ne 0) { throw "keytool 실패" }
} else {
    Write-Host "`n[1/4] 업로드 키가 이미 있습니다: $JKS" -ForegroundColor Cyan
}

# ---------- 2) AAB 서명 (Play 업로드용) ----------
Write-Host "`n[2/4] AAB 서명 — 키 비밀번호를 물어봅니다." -ForegroundColor Cyan
Copy-Item "$IN\Personal Color Mirror-unsigned.aab" "$OUT\Personal Color Mirror.aab" -Force
& "$JBR\jarsigner.exe" -sigalg SHA256withRSA -digestalg SHA-256 -keystore $JKS "$OUT\Personal Color Mirror.aab" $ALIAS
if ($LASTEXITCODE -ne 0) { throw "jarsigner 실패" }

# ---------- 3) APK 서명 (폰 직접 설치용) ----------
Write-Host "`n[3/4] APK 정렬 + 서명 — 키 비밀번호를 다시 물어봅니다." -ForegroundColor Cyan
& "$BT\zipalign.exe" -p -f 4 "$IN\Personal Color Mirror-unsigned.apk" "$OUT\aligned.apk"
if ($LASTEXITCODE -ne 0) { throw "zipalign 실패" }
& "$BT\apksigner.bat" sign --ks $JKS --ks-key-alias $ALIAS --out "$OUT\Personal Color Mirror.apk" "$OUT\aligned.apk"
if ($LASTEXITCODE -ne 0) { throw "apksigner 실패" }
Remove-Item "$OUT\aligned.apk" -Force

# ---------- 4) 확인 ----------
Write-Host "`n[4/4] 확인" -ForegroundColor Cyan
Write-Host "AAB 서명자 (CN=Altair Research Lab 이어야 함):"
& "$JBR\keytool.exe" -printcert -jarfile "$OUT\Personal Color Mirror.aab" | Select-Object -First 2
Write-Host "`nAPK 지문 (이 SHA-256 을 assetlinks.json 에 넣는다):"
& "$BT\apksigner.bat" verify --print-certs "$OUT\Personal Color Mirror.apk" | Select-String "SHA-256"

Write-Host "`n끝. 결과물:" -ForegroundColor Green
Get-ChildItem $OUT -File | Select-Object Name, Length
