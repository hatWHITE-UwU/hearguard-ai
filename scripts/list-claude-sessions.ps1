# Lista las sesiones de Claude Code guardadas para este repo (por carpeta del proyecto).
# Uso: desde la raiz del repo:  .\scripts\list-claude-sessions.ps1

$ErrorActionPreference = 'Stop'
$sessionsRoot = Join-Path $env:USERPROFILE '.claude\projects\c--Proyectos-hearguard-ai'

if (-not (Test-Path -LiteralPath $sessionsRoot)) {
  Write-Host 'No existe aun la carpeta de sesiones para este proyecto:' -ForegroundColor Yellow
  Write-Host "  $sessionsRoot"
  Write-Host 'Abre Claude Code al menos una vez desde C:\Proyectos\hearguard-ai (claude o claude -c).'
  exit 1
}

Write-Host ''
Write-Host 'Sesiones Claude Code (hearguard-ai), mas recientes primero:' -ForegroundColor Cyan
Write-Host ''

Get-ChildItem -LiteralPath $sessionsRoot -Filter '*.jsonl' -File -ErrorAction SilentlyContinue |
  Sort-Object LastWriteTime -Descending |
  ForEach-Object {
    [PSCustomObject]@{
      Archivo    = $_.Name
      Modificado = $_.LastWriteTime
      KB         = [math]::Round($_.Length / 1KB, 1)
    }
  } |
  Format-Table -AutoSize

Write-Host ''
Write-Host 'Para abrir el selector y continuar una conversacion:' -ForegroundColor DarkGray
Write-Host '  .\scripts\claude-resume.ps1' -ForegroundColor DarkGray
Write-Host 'Ultima sesion de esta carpeta (sin menu):' -ForegroundColor DarkGray
Write-Host '  .\scripts\claude-continue.ps1' -ForegroundColor DarkGray
Write-Host ''
