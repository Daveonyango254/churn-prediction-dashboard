param(
    [Parameter(Mandatory = $true)]
    [string]$ProjectId,

    [Parameter(Mandatory = $true)]
    [string]$Region,

    [Parameter(Mandatory = $true)]
    [string]$ArtifactRepository,

    [Parameter(Mandatory = $true)]
    [string]$AllowedOrigins,

    [string]$ServiceName = "churn-platform-api",
    [string]$ImageTag = "latest",
    [int]$MaxInstances = 2,
    [int]$Concurrency = 10,
    [int]$DemoMaxConcurrentSessions = 1,
    [int]$DemoMaxEvents = 12,
    [int]$DemoCooldownSeconds = 45,
    [int]$DemoDurationSeconds = 45,
    [double]$DemoEventIntervalSeconds = 1.1
)

$ErrorActionPreference = "Stop"

$imageUri = "$Region-docker.pkg.dev/$ProjectId/$ArtifactRepository/$ServiceName`:$ImageTag"
$tempEnvFile = Join-Path ([System.IO.Path]::GetTempPath()) "$ServiceName-cloudrun-env.yaml"

Write-Host "Building backend image: $imageUri"
gcloud builds submit backend `
    --project $ProjectId `
    --tag $imageUri

if ($LASTEXITCODE -ne 0) {
    throw "Cloud Build image build failed."
}

@"
ALLOWED_ORIGINS: "$AllowedOrigins"
DEMO_MAX_CONCURRENT_SESSIONS: "$DemoMaxConcurrentSessions"
DEMO_MAX_EVENTS: "$DemoMaxEvents"
DEMO_COOLDOWN_SECONDS: "$DemoCooldownSeconds"
DEMO_DURATION_SECONDS: "$DemoDurationSeconds"
DEMO_EVENT_INTERVAL_SECONDS: "$DemoEventIntervalSeconds"
"@ | Set-Content -Path $tempEnvFile -Encoding UTF8

Write-Host "Deploying Cloud Run service: $ServiceName"
try {
    gcloud run deploy $ServiceName `
        --project $ProjectId `
        --region $Region `
        --image $imageUri `
        --platform managed `
        --port 8080 `
        --allow-unauthenticated `
        --min-instances 0 `
        --max-instances $MaxInstances `
        --concurrency $Concurrency `
        --timeout 120 `
        --cpu 1 `
        --memory 1Gi `
        --env-vars-file $tempEnvFile

    if ($LASTEXITCODE -ne 0) {
        throw "Cloud Run deployment failed."
    }
}
finally {
    if (Test-Path -LiteralPath $tempEnvFile) {
        Remove-Item -LiteralPath $tempEnvFile -Force
    }
}
