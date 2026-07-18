$ErrorActionPreference = 'Stop'
$root = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$backend = Join-Path $root 'backend'
$web = Join-Path $root 'frontend-web'
$python = Join-Path $backend 'venv\Scripts\python.exe'

if (-not (Test-Path -LiteralPath $python)) {
    throw 'Falta backend/venv. Ejecuta primero scripts/setup-local.ps1.'
}
& $python -c 'import django' *> $null
if ($LASTEXITCODE -ne 0) {
    throw 'backend/venv está roto. Ejecuta scripts/setup-local.ps1 para recrearlo.'
}
if (-not (Test-Path -LiteralPath (Join-Path $web 'node_modules'))) {
    throw 'Faltan dependencias web. Ejecuta primero scripts/setup-local.ps1.'
}
if (-not (Test-NetConnection -ComputerName localhost -Port 5432 -InformationLevel Quiet)) {
    throw 'PostgreSQL no responde en localhost:5432.'
}

Push-Location $backend
try {
    & $python manage.py check
    if ($LASTEXITCODE -ne 0) { throw 'La configuración Django no es válida.' }
    & $python manage.py migrate --check
    if ($LASTEXITCODE -ne 0) {
        throw 'PostgreSQL no es accesible o tiene migraciones pendientes. Ejecuta scripts/setup-local.ps1.'
    }
}
finally {
    Pop-Location
}

$backendJob = Start-Job -Name 'parkingpati-backend' -ScriptBlock {
    param($workingDirectory, $pythonPath)
    Set-Location -LiteralPath $workingDirectory
    & $pythonPath manage.py runserver localhost:8000
    if ($LASTEXITCODE -ne 0) { throw 'Django terminó con error.' }
} -ArgumentList $backend, $python

$webJob = Start-Job -Name 'parkingpati-web' -ScriptBlock {
    param($workingDirectory)
    Set-Location -LiteralPath $workingDirectory
    & npm.cmd run dev
    if ($LASTEXITCODE -ne 0) { throw 'Vite terminó con error.' }
} -ArgumentList $web

Write-Host 'Web:     http://localhost:5173'
Write-Host 'API:     http://localhost:8000/api/v1/'
Write-Host 'Swagger: http://localhost:8000/api/v1/docs/'
Write-Host 'Presiona Ctrl+C para detener ambos procesos.'

try {
    while ($backendJob.State -in @('NotStarted', 'Running') -and $webJob.State -in @('NotStarted', 'Running')) {
        Receive-Job -Job $backendJob, $webJob
        Start-Sleep -Milliseconds 500
    }
    Receive-Job -Job $backendJob, $webJob
    if ($backendJob.State -eq 'Failed' -or $webJob.State -eq 'Failed') {
        throw 'Uno de los procesos locales terminó con error.'
    }
}
finally {
    Stop-Job -Job $backendJob, $webJob -ErrorAction SilentlyContinue
    Remove-Job -Job $backendJob, $webJob -Force -ErrorAction SilentlyContinue
}
