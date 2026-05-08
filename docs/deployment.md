# EC2 Deployment (Testing and Staging)

These scripts support Ubuntu Server 24 LTS instances for the testing and staging environments.

## 1) Instance setup (one-time)
SSH into each EC2 instance and run:
```bash
sudo apt-get update
sudo apt-get install -y git
```

Clone the repo and run the setup script:
```bash
git clone https://github.com/Zain-ul-abdeen-773/Assignment_4-DevOps.git
cd Assignment_4-DevOps
bash deploy/remote_setup.sh
```

## 2) Database configuration
Update PostgreSQL credentials in `server/.env` on the instance, or provide them using the GitHub secret `SERVER_ENV_B64_TESTING` / `SERVER_ENV_B64_STAGING` (base64-encoded .env content).

## 3) Nginx + app deployment
GitHub Actions runs `deploy/remote_deploy.sh` via SSH. The script builds the client, initializes the DB schema, and restarts the server with PM2.

If you change the instance IP, update `TESTING_URL` or `STAGING_URL` repo variables to match.
