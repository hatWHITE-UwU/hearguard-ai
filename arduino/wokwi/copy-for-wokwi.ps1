# Copia sketch.ino, diagram.json o libraries.txt al portapapeles para pegar en wokwi.com (Ctrl+V).
# Uso (PowerShell, desde cualquier sitio):
#   & "c:\Proyectos\hearguard-ai\arduino\wokwi\copy-for-wokwi.ps1" sketch
#   & "c:\Proyectos\hearguard-ai\arduino\wokwi\copy-for-wokwi.ps1" diagram
#   & "c:\Proyectos\hearguard-ai\arduino\wokwi\copy-for-wokwi.ps1" libraries
#   & "c:\Proyectos\hearguard-ai\arduino\wokwi\copy-for-wokwi.ps1" all
# O bien: cd arduino\wokwi  →  .\copy-for-wokwi.ps1 sketch

param(
  [Parameter(Position = 0)]
  [ValidateSet('sketch', 'diagram', 'libraries', 'all')]
  [string]$Target = 'sketch'
)

$ErrorActionPreference = 'Stop'
$here = $PSScriptRoot

function Copy-One {
  param([string]$Name)
  $path = Join-Path $here $Name
  if (-not (Test-Path -LiteralPath $path)) {
    throw "No existe: $path"
  }
  Get-Content -Raw -LiteralPath $path | Set-Clipboard
  Write-Host "Listo: $Name -> portapapeles. Pega en Wokwi con Ctrl+V."
}

switch ($Target) {
  'sketch' { Copy-One 'sketch.ino' }
  'diagram' { Copy-One 'diagram.json' }
  'libraries' { Copy-One 'libraries.txt' }
  'all' {
    Copy-One 'sketch.ino'
    Write-Host ""
    Read-Host "Pega el sketch en el editor de Wokwi y pulsa Enter para copiar diagram.json"
    Copy-One 'diagram.json'
    Write-Host ""
    Read-Host "Pega diagram.json en Wokwi y pulsa Enter para copiar libraries.txt"
    Copy-One 'libraries.txt'
    Write-Host ""
    Write-Host "Pega libraries.txt en Wokwi (archivo nuevo o existente)."
  }
}
