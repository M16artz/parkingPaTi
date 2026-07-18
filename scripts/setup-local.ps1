param(
    [switch]$SkipDependencies
)

$ErrorActionPreference = 'Stop'
$root = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$backend = [System.IO.Path]::GetFullPath((Join-Path $root 'backend'))
$venv = [System.IO.Path]::GetFullPath((Join-Path $backend 'venv'))
$venvPython = Join-Path $venv 'Scripts\python.exe'

if ((Split-Path $venv -Parent) -ne $backend -or (Split-Path $venv -Leaf) -ne 'venv') {
    throw 'La ruta calculada del entorno virtual no es segura.'
}

$activeVenvProcesses = @(
    Get-Process python -ErrorAction SilentlyContinue |
        Where-Object { $_.Path -and ([System.IO.Path]::GetFullPath($_.Path) -eq $venvPython) }
)
if ($activeVenvProcesses.Count -gt 0) {
    $processIds = ($activeVenvProcesses.Id -join ', ')
    throw "Cierra los procesos que usan backend/venv antes de prepararlo. PID: $processIds"
}

$nodeVersion = (& node --version).Trim()
if ($LASTEXITCODE -ne 0 -or $nodeVersion -notmatch '^v22\.') {
    throw "Se requiere Node 22 LTS (DP-15). Versión detectada: $nodeVersion"
}

& py -3.13 -c 'import sys; print(sys.version)'
if ($LASTEXITCODE -ne 0) {
    throw 'No se encontró Python 3.13 mediante el launcher py.'
}

$venvWorks = $false
if (Test-Path -LiteralPath $venvPython) {
    & $venvPython -c 'import django' *> $null
    $venvWorks = $LASTEXITCODE -eq 0
}

if (-not $venvWorks) {
    Write-Host 'El entorno backend/venv está roto; se recreará sin tocar código ni datos.'
    & py -3.13 -m venv --clear $venv
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo crear backend/venv.' }
}

if (-not $SkipDependencies) {
    & $venvPython -m pip install -r (Join-Path $backend 'requirements\dev.txt')
    if ($LASTEXITCODE -ne 0) { throw 'Falló la instalación de dependencias backend.' }

    & npm.cmd --prefix (Join-Path $root 'frontend-web') ci
    if ($LASTEXITCODE -ne 0) { throw 'Falló npm ci de frontend-web.' }

    & npm.cmd --prefix (Join-Path $root 'frontend-movil') ci
    if ($LASTEXITCODE -ne 0) { throw 'Falló npm ci de frontend-movil.' }
}

$postgresReady = Test-NetConnection -ComputerName localhost -Port 5432 -InformationLevel Quiet
if (-not $postgresReady) {
    throw 'PostgreSQL no responde en localhost:5432.'
}

Push-Location $backend
try {
    & $venvPython manage.py check
    if ($LASTEXITCODE -ne 0) { throw 'Django detectó una configuración inválida.' }

    & $venvPython manage.py migrate --noinput
    if ($LASTEXITCODE -ne 0) {
        throw 'No se pudo acceder o migrar PostgreSQL. Revisa backend/.env local.'
    }
}
finally {
    Pop-Location
}

Write-Host 'Entorno local preparado. No se creó ningún archivo .env.'
