[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$backendRoot = Join-Path $projectRoot 'audio-platform\backend'
$frontendRoot = Join-Path $projectRoot 'audio-platform\frontend'
$python = Join-Path $backendRoot '.venv\Scripts\python.exe'

if (-not (Test-Path -LiteralPath $python)) {
    throw 'Falta el entorno Python. Ejecuta: cd audio-platform\backend; python -m venv .venv; .\.venv\Scripts\python.exe -m pip install -r requirements.txt'
}

$backend = Start-Process -FilePath $python -ArgumentList '-m', 'app.main' -WorkingDirectory $backendRoot -WindowStyle Hidden -PassThru
try {
    Set-Location -LiteralPath $frontendRoot
    npm run tauri dev
}
finally {
    if (-not $backend.HasExited) { Stop-Process -Id $backend.Id -Force }
}
