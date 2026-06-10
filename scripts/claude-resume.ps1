# Abre el selector interactivo de Claude Code para elegir una conversación anterior de este proyecto.
# Requiere: Claude Code instalado (comando claude en PATH).
# Uso: .\scripts\claude-resume.ps1

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $repoRoot
claude --resume
