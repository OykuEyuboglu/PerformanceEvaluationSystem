$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Performance Evaluation System" -ForegroundColor Cyan
Write-Host " Backend Coverage" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$Root = Split-Path -Parent $PSScriptRoot

$CoverageTemp = Join-Path $Root "coverage-temp"
$CoverageReport = Join-Path $Root "coverage-report"
$Settings = Join-Path $Root "coverage-config\coverage.runsettings"

$UnitProject = Join-Path $Root "tests\PerformanceEvaluation.UnitTests\PerformanceEvaluation.UnitTests.csproj"
$IntegrationProject = Join-Path $Root "tests\PerformanceEvaluation.IntegrationTests\PerformanceEvaluation.IntegrationTests.csproj"

# --------------------------------------------------
# 1. Clean previous coverage results
# --------------------------------------------------

Write-Host "[1/5] Cleaning previous coverage results..." -ForegroundColor Yellow

if (Test-Path $CoverageTemp) {
    Remove-Item -Recurse -Force $CoverageTemp
}

if (Test-Path $CoverageReport) {
    Remove-Item -Recurse -Force $CoverageReport
}

New-Item -ItemType Directory -Force $CoverageTemp | Out-Null

# --------------------------------------------------
# 2. Unit Tests
# --------------------------------------------------

Write-Host ""
Write-Host "[2/5] Running Unit Tests..." -ForegroundColor Yellow

dotnet test `
    $UnitProject `
    --settings $Settings `
    --collect:"XPlat Code Coverage" `
    --results-directory (Join-Path $CoverageTemp "unit") `
    --no-restore

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Unit tests failed." -ForegroundColor Red
    exit 1
}

# --------------------------------------------------
# 3. Integration Tests
# --------------------------------------------------

Write-Host ""
Write-Host "[3/5] Running Integration Tests..." -ForegroundColor Yellow

dotnet test `
    $IntegrationProject `
    --settings $Settings `
    --collect:"XPlat Code Coverage" `
    --results-directory (Join-Path $CoverageTemp "integration") `
    --no-restore

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Integration tests failed." -ForegroundColor Red
    exit 1
}

# --------------------------------------------------
# 4. Generate combined coverage report
# --------------------------------------------------

Write-Host ""
Write-Host "[4/5] Generating combined coverage report..." -ForegroundColor Yellow

$Reports = "$(Join-Path $CoverageTemp 'unit\**\coverage.cobertura.xml');$(Join-Path $CoverageTemp 'integration\**\coverage.cobertura.xml')"

$BackendReport = Join-Path $CoverageReport "backend"

reportgenerator `
    "-reports:$Reports" `
    "-targetdir:$BackendReport" `
    "-reporttypes:Html;Cobertura;TextSummary" `
    "-classfilters:-PerformanceEvaluation.Infrastructure.Migrations.*"

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Coverage report generation failed." -ForegroundColor Red
    exit 1
}

# --------------------------------------------------
# 5. Display summary
# --------------------------------------------------

Write-Host ""
Write-Host "[5/5] Coverage Summary" -ForegroundColor Green
Write-Host ""

$SummaryFile = Join-Path $BackendReport "Summary.txt"

if (Test-Path $SummaryFile) {
    Get-Content $SummaryFile
}
else {
    Write-Host "Summary.txt could not be found." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " Coverage report generated successfully" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "HTML Report:" -ForegroundColor Cyan
Write-Host $BackendReport

Write-Host ""
Write-Host "Open report with:" -ForegroundColor Cyan
Write-Host "start `"$BackendReport\index.html`""