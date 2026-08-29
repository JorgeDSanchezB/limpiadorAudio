[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$projectRoot = Split-Path -Parent $PSScriptRoot
$icons = Join-Path $projectRoot 'audio-platform\frontend\src-tauri\icons'
New-Item -ItemType Directory -Force -Path $icons | Out-Null

$bitmap = [System.Drawing.Bitmap]::new(256, 256)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.Clear([System.Drawing.Color]::FromArgb(37, 99, 235))
$white = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
$graphics.FillEllipse($white, 84, 38, 88, 118)
$pen = [System.Drawing.Pen]::new([System.Drawing.Color]::White, 18)
$graphics.DrawArc($pen, 59, 82, 138, 114, 0, 180)
$graphics.DrawLine($pen, 128, 190, 128, 222)
$graphics.DrawLine($pen, 88, 222, 168, 222)
$stream = [System.IO.MemoryStream]::new()
$bitmap.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png)
$png = $stream.ToArray()
$icon = [System.IO.MemoryStream]::new()
$writer = [System.IO.BinaryWriter]::new($icon)
$writer.Write([UInt16]0); $writer.Write([UInt16]1); $writer.Write([UInt16]1)
$writer.Write([Byte]0); $writer.Write([Byte]0); $writer.Write([Byte]0); $writer.Write([Byte]0)
$writer.Write([UInt16]1); $writer.Write([UInt16]32); $writer.Write([UInt32]$png.Length); $writer.Write([UInt32]22)
$writer.Write($png); $writer.Flush()
[System.IO.File]::WriteAllBytes((Join-Path $icons 'icon.ico'), $icon.ToArray())
$writer.Dispose(); $icon.Dispose(); $stream.Dispose(); $pen.Dispose(); $white.Dispose(); $graphics.Dispose(); $bitmap.Dispose()
