[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$backendRoot = Join-Path $projectRoot 'audio-platform\backend'
$tauriRoot = Join-Path $projectRoot 'audio-platform\frontend\src-tauri'
$python = Join-Path $backendRoot '.venv\Scripts\python.exe'
$ffmpeg = Join-Path $env:LOCALAPPDATA 'Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0-full_build\bin\ffmpeg.exe'

if (-not (Test-Path -LiteralPath $python)) { throw 'No se encontró el entorno Python del proyecto.' }
if (-not (Test-Path -LiteralPath $ffmpeg)) { throw 'No se encontró FFmpeg instalado por Winget.' }

& $python -m pip install -r (Join-Path $backendRoot 'requirements-build.txt')
Push-Location $backendRoot
try {
    & $python -m PyInstaller --noconfirm --clean --onefile --name audio-backend --add-binary "$ffmpeg;." --paths $backendRoot app\sidecar.py
    $targetTriple = (& rustc --print host-tuple).Trim()
    $binaries = Join-Path $tauriRoot 'binaries'
    New-Item -ItemType Directory -Force -Path $binaries | Out-Null
    Copy-Item -LiteralPath (Join-Path $backendRoot 'dist\audio-backend.exe') -Destination (Join-Path $binaries "audio-backend-$targetTriple.exe") -Force
}
finally { Pop-Location }
