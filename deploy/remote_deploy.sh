#!/usr/bin/env bash
set -euo pipefail

APP_DIR=${APP_DIR:-/opt/ai-model-registry}
SERVER_ENV_PATH="$APP_DIR/server/.env"

cd "$APP_DIR"

npm install
npm --prefix server install
npm --prefix client install

if [ -n "${SERVER_ENV_B64:-}" ]; then
  echo "$SERVER_ENV_B64" | base64 -d > "$SERVER_ENV_PATH"
fi

if [ ! -f "$SERVER_ENV_PATH" ] && [ -f "$APP_DIR/server/.env.example" ]; then
  cp "$APP_DIR/server/.env.example" "$SERVER_ENV_PATH"
fi

if [ -n "${CLIENT_ORIGIN:-}" ]; then
  if [ -f "$SERVER_ENV_PATH" ] && grep -q "^CLIENT_ORIGIN=" "$SERVER_ENV_PATH"; then
    sed -i "s|^CLIENT_ORIGIN=.*|CLIENT_ORIGIN=$CLIENT_ORIGIN|" "$SERVER_ENV_PATH"
  else
    echo "CLIENT_ORIGIN=$CLIENT_ORIGIN" >> "$SERVER_ENV_PATH"
  fi
fi

npm --prefix server run db:init
if [ "${SEED_ON_DEPLOY:-false}" = "true" ]; then
  npm --prefix server run db:seed
fi

VITE_API_URL=${VITE_API_URL:-/api} npm --prefix client run build

if [ -f "$APP_DIR/deploy/nginx.conf" ]; then
  sudo cp "$APP_DIR/deploy/nginx.conf" /etc/nginx/sites-available/ai-model-registry.conf
  sudo ln -sf /etc/nginx/sites-available/ai-model-registry.conf /etc/nginx/sites-enabled/ai-model-registry.conf
  sudo rm -f /etc/nginx/sites-enabled/default
  sudo nginx -t
  sudo systemctl reload nginx
fi

if ! command -v pm2 >/dev/null 2>&1; then
  sudo npm install -g pm2
fi

APP_DIR="$APP_DIR" pm2 start "$APP_DIR/deploy/ecosystem.config.cjs" --update-env
pm2 save
