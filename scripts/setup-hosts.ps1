# Setup hosts file for local development
# Requires: Run as Administrator

param(
    [switch]$Remove
)

$ErrorActionPreference = "Stop"

$hostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"
$domains = @(
    "devtools.local",
    "sonarqube.devtools.local",
    "smtp.devtools.local",
    "alcstronghold.local",
    "backend.alcstronghold.local"
)

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Error "This script requires Administrator privileges. Run PowerShell as Administrator."
    exit 1
}

# Read current hosts file
$hostsContent = Get-Content $hostsPath -Raw

if ($Remove) {
    Write-Host "Removing development domains from hosts file..." -ForegroundColor Yellow

    foreach ($domain in $domains) {
        $pattern = "(?m)^127\.0\.0\.1\s+$([regex]::Escape($domain))\s*$\r?\n?"
        $hostsContent = $hostsContent -replace $pattern, ""
    }

    # Clean up extra blank lines
    $hostsContent = $hostsContent -replace "(\r?\n){3,}", "`r`n`r`n"

    Set-Content -Path $hostsPath -Value $hostsContent.TrimEnd() -NoNewline
    Write-Host "Domains removed successfully!" -ForegroundColor Green
} else {
    Write-Host "Adding development domains to hosts file..." -ForegroundColor Cyan

    $newEntries = @()

    foreach ($domain in $domains) {
        if ($hostsContent -notmatch "127\.0\.0\.1\s+$([regex]::Escape($domain))") {
            $newEntries += "127.0.0.1`t$domain"
            Write-Host "  + $domain" -ForegroundColor Green
        } else {
            Write-Host "  = $domain (already exists)" -ForegroundColor Gray
        }
    }

    if ($newEntries.Count -gt 0) {
        $separator = "`r`n`r`n# Local Development Domains (traefik-proxy)`r`n"
        $newContent = $hostsContent.TrimEnd() + $separator + ($newEntries -join "`r`n") + "`r`n"
        Set-Content -Path $hostsPath -Value $newContent -NoNewline
        Write-Host ""
        Write-Host "Hosts file updated successfully!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "All domains already configured." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Current development entries in hosts:" -ForegroundColor Cyan
Select-String -Path $hostsPath -Pattern "\.local" | ForEach-Object { Write-Host "  $_" }
