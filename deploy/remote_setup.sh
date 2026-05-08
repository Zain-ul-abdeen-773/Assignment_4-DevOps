#!/usr/bin/env bash
set -euo pipefail

APP_DIR=${APP_DIR:-/opt/ai-model-registry}
NODE_MAJOR=${NODE_MAJOR:-18}

sudo apt-get update
sudo apt-get install -y git curl nginx postgresql postgresql-contrib

if ! command -v node >/dev/null 2>&1; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | sudo -E bash -
  sudo apt-get install -y nodejs
fi

sudo npm install -g pm2

sudo systemctl enable nginx
sudo systemctl start nginx

sudo -u postgres psql -c "CREATE DATABASE ai_model_registry;" || true

if [ ! -d "$APP_DIR" ]; then
  sudo mkdir -p "$APP_DIR"
  sudo chown "$USER":"$USER" "$APP_DIR"
fi

echo "Setup complete. Run deploy/remote_deploy.sh for deployments."
