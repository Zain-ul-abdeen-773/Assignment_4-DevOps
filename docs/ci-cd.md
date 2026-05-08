# CI/CD Workflows

This repo includes two GitHub Actions workflows:
- `testing.yml`: runs on PRs to `main` and on manual dispatch.
- `staging.yml`: runs as a PR status check, then deploys only on pushes to `main` or manual dispatch.

Each workflow performs build, unit tests, linting, then deploys to EC2 and sends email notifications.

## Required repository secrets
- `SSH_USER` - EC2 SSH username (e.g., ubuntu)
- `SSH_KEY` - private key for SSH
- `SSH_PORT` - optional, defaults to 22
- `TESTING_HOST` - public IP or DNS for testing EC2
- `STAGING_HOST` - public IP or DNS for staging EC2
- `SERVER_ENV_B64_TESTING` - base64 of `server/.env` for testing (optional)
- `SERVER_ENV_B64_STAGING` - base64 of `server/.env` for staging (optional)
- `SMTP_HOST` - SMTP server host
- `SMTP_PORT` - SMTP server port
- `SMTP_USER` - SMTP username
- `SMTP_PASS` - SMTP password
- `SMTP_FROM` - from address (e.g., "DevOps CI <ci@example.com>")
- `QA_EMAIL` - instructor / QA email
- `DEV_EMAILS` - developer email list (comma-separated)

## Required repository variables
- `TESTING_URL` - e.g., `http://<Testing_Instance_IP>`
- `STAGING_URL` - e.g., `http://<Staging_Instance_IP>`
- `TESTING_API_URL` - optional, use `/api` when served behind Nginx
- `STAGING_API_URL` - optional, use `/api` when served behind Nginx
- `SEED_ON_DEPLOY` - `true` to seed on first deploy, otherwise `false`

## Automated setup
After authenticating GitHub CLI with a token that can manage repo secrets and branch protection, run:
```powershell
gh auth login -h github.com --web --git-protocol https --scopes repo,workflow
.\scripts\configure-github-actions.ps1
```

The script sets the required repository secrets, variables, and branch protection for `main`. It uses `Assignment-4-key.pem`, base64-encodes server env files (if provided), and prompts for SMTP and email values if they are not already available as environment variables.

To set only the known EC2, SSH, env, URL, and branch-protection values first:
```powershell
.\scripts\configure-github-actions.ps1 -SkipEmailSecrets
```

The script defaults Mailtrap SMTP to `live.smtp.mailtrap.io`, port `587`, username `api`; it still prompts for the token/password and sender/recipient emails.

By default, the script looks for `server/.env` and uses it for both `SERVER_ENV_B64_TESTING` and `SERVER_ENV_B64_STAGING` when present. To configure different env files per environment:
```powershell
.\scripts\configure-github-actions.ps1 -ServerEnvPathTesting .\server\.env.testing -ServerEnvPathStaging .\server\.env.staging
```

To skip server env secret upload entirely:
```powershell
.\scripts\configure-github-actions.ps1 -SkipServerEnv
```

## Base64 helper
Linux/macOS:
```bash
base64 -w 0 server/.env
```

Windows PowerShell:
```powershell
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes((Get-Content server/.env -Raw)))
```

## Notes
- The SSH user must have passwordless sudo for Nginx and PM2 operations.
- EC2 must be prepared using `deploy/remote_setup.sh` before the first deployment.
