# Continúa la sesión más reciente de Claude Code para esta carpeta del repo (sin menú).
# Uso: .\scripts\claude-continue.ps1

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $repoRoot
claude --continue
