$ErrorActionPreference = 'Stop'

$cloudflared = (Get-Command cloudflared.exe -ErrorAction SilentlyContinue).Source
if (-not $cloudflared) {
    $cloudflared = 'C:\ProgramData\chocolatey\bin\cloudflared.exe'
}

$configPath = Join-Path $env:USERPROFILE '.cloudflared\config.yml'
if (-not (Test-Path $configPath)) {
    throw "Missing cloudflared config: $configPath"
}

while ($true) {
    & $cloudflared tunnel --config $configPath run standor-backend
    $exitCode = $LASTEXITCODE
    Write-Host "cloudflared exited with code $exitCode. Restarting in 5 seconds..."
    Start-Sleep -Seconds 5
}
