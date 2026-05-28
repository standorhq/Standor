# Helper script to start backend and run cloudflared tunnel.
# Usage (run as Administrator in PowerShell):
# 1. Copy the config: Copy-Item -Path ".\deploy\cloudflared\config.yml" -Destination "$env:USERPROFILE\.cloudflared\config.yml" -Force
# 2. Run this script: .\scripts\start-backend-and-tunnel.ps1

Write-Host "Starting backend (in repo path) and cloudflared tunnel..."

Push-Location "E:\Major Project\Standor\Standor\app\backend"

Write-Host "Installing dependencies (npm ci)..."
npm ci

Write-Host "Starting backend (npm start) in a new window..."
Start-Process -FilePath "cmd.exe" -ArgumentList '/c', 'npm start' -WorkingDirectory (Get-Location)

Write-Host "Ensure you have copied config to $env:USERPROFILE\.cloudflared\config.yml"
Write-Host "Running cloudflared tunnel (will attach to this console). Ctrl+C to stop."
cloudflared tunnel run standor-backend

Pop-Location
