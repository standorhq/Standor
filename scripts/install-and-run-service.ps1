# Install and run backend and install cloudflared as a Windows service.
# Run this script from an elevated PowerShell prompt (Run as Administrator).

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition

# Resolve source config in repo and copy it to the current user profile.
$src = Join-Path $scriptDir '..\deploy\cloudflared\config.yml'
try { $src = (Resolve-Path $src).Path } catch { Write-Error "Cannot find source config at $src"; exit 1 }

$userCloudflared = Join-Path $env:USERPROFILE '.cloudflared'
New-Item -ItemType Directory -Path $userCloudflared -Force | Out-Null

Copy-Item -Path $src -Destination (Join-Path $userCloudflared 'config.yml') -Force
Write-Host "Copied config to $userCloudflared\config.yml"

# Install backend deps and start backend (in a new window)
$backendPath = Join-Path $scriptDir '..\app\backend'
try { $backendPath = (Resolve-Path $backendPath).Path } catch { Write-Error "Cannot find backend at $backendPath"; exit 1 }
Push-Location $backendPath

Write-Host "Running npm ci in $backendPath"
npm ci

Write-Host "Starting backend (npm start) in new window"
Start-Process -FilePath "cmd.exe" -ArgumentList '/c','npm start' -WorkingDirectory $backendPath

Pop-Location

$cloudflaredRunner = Join-Path $scriptDir 'run-cloudflared.ps1'

Write-Host "Starting cloudflared in a new window using the working user-profile config..."
Start-Process -FilePath "powershell.exe" -ArgumentList @('-NoProfile','-ExecutionPolicy','Bypass','-File', $cloudflaredRunner) -WorkingDirectory $scriptDir

Write-Host "Completed. Verify: curl https://api.standor.in/health"
