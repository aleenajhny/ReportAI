$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontend = Join-Path $root "frontend"

Write-Host ""
Write-Host "ReportAI local runner"
Write-Host "====================="
Write-Host ""

if (-not (Test-Path (Join-Path $frontend "package.json"))) {
  throw "Could not find frontend package.json at $frontend"
}

if (-not (Get-Command node.exe -ErrorAction SilentlyContinue)) {
  throw "Node.js was not found on PATH. Install Node.js 20+ and try again."
}

if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
  throw "npm.cmd was not found on PATH. Install Node.js 20+ and try again."
}

Set-Location $frontend

if (-not (Test-Path "node_modules")) {
  Write-Host "Installing frontend dependencies..."
  & npm.cmd install
} else {
  Write-Host "Dependencies already installed."
}

Write-Host ""
Write-Host "Starting ReportAI at http://127.0.0.1:3000"
Write-Host "Press Ctrl+C in this window to stop the server."
Write-Host ""

& npm.cmd run dev -- --hostname 127.0.0.1 --port 3000
