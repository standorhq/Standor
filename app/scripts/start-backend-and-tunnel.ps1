$ErrorActionPreference = 'Stop'

# Helper script to start the backend and expose it through Cloudflare Tunnel.
# Run this from PowerShell as the user who owns the tunnel.

$repoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Definition)
$backendDir = Join-Path $repoRoot 'backend'
$tunnelConfig = Join-Path $env:USERPROFILE '.cloudflared\config.yml'

if (-not (Test-Path $backendDir)) {
	throw "Backend directory not found: $backendDir"
}

if (-not (Test-Path $tunnelConfig)) {
	throw "Cloudflared config not found: $tunnelConfig"
}

Write-Host "Starting backend from $backendDir..."
Push-Location $backendDir

Write-Host "Installing dependencies (npm install --omit=dev)..."
npm install --omit=dev --no-audit --no-fund

Write-Host "Starting backend (npm start) in a new window..."
Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', 'npm start' -WorkingDirectory $backendDir

Pop-Location

Write-Host "Using tunnel config: $tunnelConfig"
Write-Host "Starting cloudflared tunnel (this console will stay attached). Ctrl+C to stop."
$cloudflared = (Get-Command cloudflared.exe -ErrorAction SilentlyContinue).Source
if (-not $cloudflared) {
	$cloudflared = 'C:\ProgramData\chocolatey\bin\cloudflared.exe'
}

if (-not (Test-Path $cloudflared)) {
	throw "cloudflared.exe not found. Install cloudflared or add it to PATH."
}

& $cloudflared tunnel --config $tunnelConfig run standor-backend
