# Personal Color Mirror — 안드로이드 패키지 서명 스크립트 (Windows PowerShell 5.1)
#
# 하는 일:
#   1) 업로드 키가 없으면 만든다
#   2) PWABuilder 가 준 '서명 없는' aab 에 그 키로 서명한다  ← Play 에 올리는 것은 이것뿐
#   3) (build-tools 가 있으면) apk 도 서명한다  ← 폰에 직접 설치해 볼 때만 필요. 없으면 건너뛴다
#   4) 서명자와 지문(SHA-256)을 출력한다
#
# 실행:  powershell -ExecutionPolicy Bypass -File C:\dev\drape\tools\sign-android.ps1
# 비밀번호: C:\Users\altai\keys\colormirror-upload.password.txt 가 있으면 그 파일에서 읽는다 (묻지 않음).
#           없으면 도구가 직접 물어본다. keystore 비밀번호 = 키 비밀번호로 통일.

$ErrorActionPreference = "Stop"

$JBR = "C:\Program Files\Android\Android Studio\jbr\bin"          # Android Studio 에 딸린 JDK (keytool, jarsigner)
$K   = "C:\Users\altai\keys"                                      # 키 보관 폴더 (저장소 밖, WearCast 키와 같은 곳)
$JKS = "$K\colormirror-upload.jks"
$ALIAS = "upload"
$PWFILE = "$K\colormirror-upload.password.txt"                    # 비밀번호 파일 (있으면 자동, 없으면 프롬프트)
$usePw = Test-Path $PWFILE
$IN  = "$K\colormirror-build\unsigned"                            # PWABuilder 결과물 (서명 없음)
$OUT = "$K\colormirror-build"

# AAB 서명에 반드시 있어야 하는 것만 확인한다.
foreach ($p in @("$JBR\keytool.exe", "$JBR\jarsigner.exe", "$IN\Personal Color Mirror-unsigned.aab")) {
    if (-not (Test-Path $p)) { throw "없음: $p" }
}
if ($usePw) { Write-Host "비밀번호 파일 사용: $PWFILE" -ForegroundColor DarkGray }

# APK 서명용 build-tools (zipalign, apksigner) — 있으면 쓰고 없으면 APK 를 건너뛴다.
# 백신이 SDK 폴더를 잠그면 Test-Path 가 '접근 거부'를 false 로 돌려주므로 여기서 실패해도 멈추지 않는다.
$BT = $null
foreach ($root in @("$env:LOCALAPPDATA\Android\Sdk\build-tools", "C:\Users\altai\AppData\Local\Android\Sdk\build-tools",
                    "$env:ANDROID_HOME\build-tools", "$env:ANDROID_SDK_ROOT\build-tools")) {
    if (-not $root -or $BT) { continue }
    foreach ($ver in @("36.1.0", "36.0.0", "35.0.0", "34.0.0")) {
        if (Test-Path "$root\$ver\zipalign.exe") { $BT = "$root\$ver"; break }
    }
    if (-not $BT) {
        $found = Get-ChildItem $root -Directory -ErrorAction SilentlyContinue |
                 Where-Object { Test-Path "$($_.FullName)\zipalign.exe" } |
                 Sort-Object { [version]$_.Name } -Descending | Select-Object -First 1 -ExpandProperty FullName
        if ($found) { $BT = $found }
    }
}
if ($BT) { Write-Host "build-tools: $BT" -ForegroundColor DarkGray }
else     { Write-Host "build-tools 를 못 찾음 -> APK 는 건너뜁니다. Play 업로드용 AAB 는 그대로 만들어집니다." -ForegroundColor DarkYellow }

# ---------- 1) 업로드 키 ----------
if (-not (Test-Path $JKS)) {
    Write-Host "`n[1/4] 업로드 키를 만듭니다." -ForegroundColor Cyan
    $pwArgs = @(); if ($usePw) { $pwArgs = @("-storepass:file", $PWFILE, "-keypass:file", $PWFILE) }
    & "$JBR\keytool.exe" -genkeypair -v -keystore $JKS -storetype JKS -keyalg RSA -keysize 2048 -validity 10000 `
        -alias $ALIAS -dname "CN=Altair Research Lab, O=Altair Research Lab" @pwArgs
    if ($LASTEXITCODE -ne 0) { throw "keytool 실패" }
} else {
    Write-Host "`n[1/4] 업로드 키가 이미 있습니다: $JKS" -ForegroundColor Cyan
}

# ---------- 2) AAB 서명 (Play 업로드용) ----------
Write-Host "`n[2/4] AAB 서명" -ForegroundColor Cyan
Copy-Item "$IN\Personal Color Mirror-unsigned.aab" "$OUT\Personal Color Mirror.aab" -Force
$pwArgs = @(); if ($usePw) { $pwArgs = @("-storepass:file", $PWFILE) }
& "$JBR\jarsigner.exe" -sigalg SHA256withRSA -digestalg SHA-256 -keystore $JKS @pwArgs "$OUT\Personal Color Mirror.aab" $ALIAS
if ($LASTEXITCODE -ne 0) { throw "jarsigner 실패" }

# ---------- 3) APK 서명 (선택 — 폰에 직접 설치할 때만) ----------
if ($BT -and (Test-Path "$IN\Personal Color Mirror-unsigned.apk")) {
    Write-Host "`n[3/4] APK 정렬 + 서명" -ForegroundColor Cyan
    & "$BT\zipalign.exe" -p -f 4 "$IN\Personal Color Mirror-unsigned.apk" "$OUT\aligned.apk"
    if ($LASTEXITCODE -ne 0) { throw "zipalign 실패" }
    $pwArgs = @(); if ($usePw) { $pwArgs = @("--ks-pass", "file:$PWFILE") }
    & "$BT\apksigner.bat" sign --ks $JKS --ks-key-alias $ALIAS @pwArgs --out "$OUT\Personal Color Mirror.apk" "$OUT\aligned.apk"
    if ($LASTEXITCODE -ne 0) { throw "apksigner 실패" }
    Remove-Item "$OUT\aligned.apk" -Force
} else {
    Write-Host "`n[3/4] APK 건너뜀 (build-tools 없음). Play 내부 테스트로 설치해 확인하면 됩니다." -ForegroundColor DarkYellow
}

# ---------- 4) 확인 ----------
Write-Host "`n[4/4] 확인" -ForegroundColor Cyan
Write-Host "AAB 서명자 (CN=Altair Research Lab 이어야 함):"
& "$JBR\keytool.exe" -printcert -jarfile "$OUT\Personal Color Mirror.aab" | Select-String "Owner:", "SHA256:" | Select-Object -First 4

Write-Host "`n== assetlinks.json 에 넣을 업로드 키 지문 (아래 SHA256 값) ==" -ForegroundColor Green
$pwArgs = @(); if ($usePw) { $pwArgs = @("-storepass:file", $PWFILE) }
& "$JBR\keytool.exe" -list -v -keystore $JKS @pwArgs -alias $ALIAS | Select-String "SHA256:"

Write-Host "`n끝. 결과물:" -ForegroundColor Green
Get-ChildItem $OUT -File | Select-Object Name, Length
