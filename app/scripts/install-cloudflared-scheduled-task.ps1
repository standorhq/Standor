<#
Create a Scheduled Task (current user) that runs the run-cloudflared.ps1 runner at logon.

Usage: run this as the user who should own the tunnel (no elevation required).
If you want the task to run with elevated privileges or system-wide, run from an
Administrator PowerShell and adjust the -User / -RunLevel options accordingly.
#>

[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$runner = Join-Path $scriptDir 'run-cloudflared.ps1'

if (-not (Test-Path $runner)) {
    Write-Error "Runner not found at $runner"
    exit 1
}

$taskName = 'Standor - cloudflared tunnel (user)'

Write-Host "Creating scheduled task '$taskName' to run at user logon..."

try {
    $action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$runner`""
    $trigger = New-ScheduledTaskTrigger -AtLogOn
    $principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

    # Remove existing task if present
    if (Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue) {
        Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
    }

    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Description 'Runs cloudflared tunnel runner for Standor at user logon'

    Write-Host "Scheduled task created. It will run when user $env:USERNAME logs in."
    Write-Host "If you want it to run now, run: Start-ScheduledTask -TaskName '$taskName' (requires Interactive session)."
}
catch {
    Write-Error "Failed to create scheduled task: $_"
    exit 1
}

# Try to stop and disable the system cloudflared service if it exists (best-effort)
try {
    if (Get-Service -Name cloudflared -ErrorAction SilentlyContinue) {
        Write-Host "Stopping and disabling system 'cloudflared' service (requires admin)..."
        Stop-Service -Name cloudflared -Force -ErrorAction SilentlyContinue
        Set-Service -Name cloudflared -StartupType Disabled -ErrorAction SilentlyContinue
        Write-Host "Service stop/disable attempted."
    }
}
catch {
    Write-Host "Could not stop/disable system service (likely not running as Administrator). You can disable it later if desired."
}

Write-Host "Done. Verify the task exists with: Get-ScheduledTask -TaskName '$taskName'"
