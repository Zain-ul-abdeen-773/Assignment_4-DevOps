[CmdletBinding()]
param(
  [string]$Repo,
  [string]$Branch = "main",

  [string]$SshUser = "ubuntu",
  [string]$SshKeyPath = ".\Assignment-4-key.pem",
  [string]$SshPort = "22",
  [string]$TestingHost = "44.197.47.89",
  [string]$StagingHost = "54.208.194.141",
  [string]$ServerEnvPath = ".\server\.env",

  [string]$TestingUrl = "http://44.197.47.89",
  [string]$StagingUrl = "http://54.208.194.141",
  [string]$TestingApiUrl = "/api",
  [string]$StagingApiUrl = "/api",
  [ValidateSet("true", "false")]
  [string]$SeedOnDeploy = "true",

  [string]$SmtpHost = $(if ($env:SMTP_HOST) { $env:SMTP_HOST } else { "live.smtp.mailtrap.io" }),
  [string]$SmtpPort = $(if ($env:SMTP_PORT) { $env:SMTP_PORT } else { "587" }),
  [string]$SmtpUser = $(if ($env:SMTP_USER) { $env:SMTP_USER } else { "api" }),
  [string]$SmtpPass = $env:SMTP_PASS,
  [string]$SmtpFrom = $env:SMTP_FROM,
  [string]$QaEmail = $env:QA_EMAIL,
  [string]$DevEmails = $env:DEV_EMAILS,

  [switch]$SkipEmailSecrets,
  [switch]$SkipBranchProtection
)

$ErrorActionPreference = "Stop"

function Require-Command {
  param([string]$Name)

  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Required command '$Name' was not found on PATH."
  }
}

function ConvertTo-PlainText {
  param([Security.SecureString]$Value)

  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Value)
  try {
    [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
  }
  finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
  }
}

function Read-RequiredValue {
  param(
    [string]$Name,
    [string]$CurrentValue,
    [switch]$Secret
  )

  if (-not [string]::IsNullOrWhiteSpace($CurrentValue)) {
    return $CurrentValue
  }

  if ($Secret) {
    $secureValue = Read-Host "Enter $Name" -AsSecureString
    $CurrentValue = ConvertTo-PlainText $secureValue
  }
  else {
    $CurrentValue = Read-Host "Enter $Name"
  }

  if ([string]::IsNullOrWhiteSpace($CurrentValue)) {
    throw "$Name is required."
  }

  return $CurrentValue
}

function Resolve-Repo {
  param([string]$CurrentRepo)

  if (-not [string]::IsNullOrWhiteSpace($CurrentRepo)) {
    return $CurrentRepo
  }

  $remoteUrl = (& git config --get remote.origin.url).Trim()
  if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($remoteUrl)) {
    throw "Could not determine GitHub repository. Pass -Repo OWNER/REPO."
  }

  if ($remoteUrl -match "github\.com[:/](?<repo>[^/]+/[^/]+?)(?:\.git)?$") {
    return $Matches.repo
  }

  throw "Could not parse GitHub repository from remote.origin.url. Pass -Repo OWNER/REPO."
}

function Set-RepoSecret {
  param(
    [string]$Name,
    [string]$Value
  )

  Write-Host "Setting secret $Name"
  & gh secret set $Name --repo $Repo --app actions --body $Value | Out-Host
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to set secret $Name."
  }
}

function Set-RepoSecretFromFile {
  param(
    [string]$Name,
    [string]$Path
  )

  Write-Host "Setting secret $Name from $Path"
  Get-Content -LiteralPath $Path -Raw | & gh secret set $Name --repo $Repo --app actions | Out-Host
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to set secret $Name."
  }
}

function Set-RepoVariable {
  param(
    [string]$Name,
    [string]$Value
  )

  Write-Host "Setting variable $Name=$Value"
  & gh variable set $Name --repo $Repo --body $Value | Out-Host
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to set variable $Name."
  }
}

Require-Command git
Require-Command gh

$Repo = Resolve-Repo $Repo
$resolvedKeyPath = (Resolve-Path -LiteralPath $SshKeyPath).Path
$resolvedEnvPath = (Resolve-Path -LiteralPath $ServerEnvPath).Path

Write-Host "Using GitHub repository $Repo"
& gh auth status | Out-Host
if ($LASTEXITCODE -ne 0) {
  throw "GitHub CLI is not authenticated. Run: gh auth login -h github.com --web --git-protocol https --scopes repo,workflow"
}

if (-not $SkipEmailSecrets) {
  $SmtpHost = Read-RequiredValue "SMTP_HOST" $SmtpHost
  $SmtpPort = Read-RequiredValue "SMTP_PORT" $SmtpPort
  $SmtpUser = Read-RequiredValue "SMTP_USER" $SmtpUser
  $SmtpPass = Read-RequiredValue "SMTP_PASS" $SmtpPass -Secret
  $SmtpFrom = Read-RequiredValue "SMTP_FROM" $SmtpFrom
  $QaEmail = Read-RequiredValue "QA_EMAIL" $QaEmail
  $DevEmails = Read-RequiredValue "DEV_EMAILS" $DevEmails
}

$serverEnvB64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes([IO.File]::ReadAllText($resolvedEnvPath)))

Set-RepoSecret "SSH_USER" $SshUser
Set-RepoSecretFromFile "SSH_KEY" $resolvedKeyPath
Set-RepoSecret "SSH_PORT" $SshPort
Set-RepoSecret "TESTING_HOST" $TestingHost
Set-RepoSecret "STAGING_HOST" $StagingHost
Set-RepoSecret "SERVER_ENV_B64_TESTING" $serverEnvB64
Set-RepoSecret "SERVER_ENV_B64_STAGING" $serverEnvB64
if (-not $SkipEmailSecrets) {
  Set-RepoSecret "SMTP_HOST" $SmtpHost
  Set-RepoSecret "SMTP_PORT" $SmtpPort
  Set-RepoSecret "SMTP_USER" $SmtpUser
  Set-RepoSecret "SMTP_PASS" $SmtpPass
  Set-RepoSecret "SMTP_FROM" $SmtpFrom
  Set-RepoSecret "QA_EMAIL" $QaEmail
  Set-RepoSecret "DEV_EMAILS" $DevEmails
}
else {
  Write-Host "Skipping SMTP/email secrets."
}

Set-RepoVariable "TESTING_URL" $TestingUrl
Set-RepoVariable "STAGING_URL" $StagingUrl
Set-RepoVariable "TESTING_API_URL" $TestingApiUrl
Set-RepoVariable "STAGING_API_URL" $StagingApiUrl
Set-RepoVariable "SEED_ON_DEPLOY" $SeedOnDeploy

if (-not $SkipBranchProtection) {
  Write-Host "Configuring branch protection for $Branch"

  $protection = @{
    required_status_checks = @{
      strict = $true
      contexts = @(
        "Deploy to Testing / build-test-lint-deploy",
        "Deploy to Staging / build-test-lint-deploy"
      )
    }
    enforce_admins = $true
    required_pull_request_reviews = @{
      dismiss_stale_reviews = $true
      require_code_owner_reviews = $false
      required_approving_review_count = 0
    }
    restrictions = $null
    required_linear_history = $false
    allow_force_pushes = $false
    allow_deletions = $false
    block_creations = $false
    required_conversation_resolution = $true
  }

  $payloadPath = [IO.Path]::GetTempFileName()
  try {
    $protection | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $payloadPath -Encoding utf8
    & gh api -X PUT "repos/$Repo/branches/$Branch/protection" --input $payloadPath | Out-Host
    if ($LASTEXITCODE -ne 0) {
      throw "Failed to configure branch protection for $Branch."
    }
  }
  finally {
    Remove-Item -LiteralPath $payloadPath -Force -ErrorAction SilentlyContinue
  }
}

Write-Host "GitHub Actions setup completed."
