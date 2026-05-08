# CI/CD Workflows

This repo includes two GitHub Actions workflows:
- `testing.yml`: runs on PRs to `main` and on manual dispatch.
- `staging.yml`: runs on pushes to `main` and on manual dispatch.

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
