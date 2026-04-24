#!/usr/bin/env bash
# GovCare ERP - Deploy Script
# Usage: ./scripts/deploy.sh [environment]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENV="${1:-production}"

echo "=== GovCare ERP Deploy ==="
echo "Environment: $ENV"
echo "Project dir: $PROJECT_DIR"
echo ""

# Pull latest code
echo "[1/7] Pulling latest code..."
cd "$PROJECT_DIR"
git pull origin main

# Backend setup
echo "[2/7] Installing backend dependencies..."
cd "$PROJECT_DIR/backend"
composer install --no-dev --optimize-autoloader --no-interaction

echo "[3/7] Running migrations..."
php artisan migrate --force

echo "[4/7] Clearing and rebuilding caches..."
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Frontend build
echo "[5/7] Installing frontend dependencies..."
cd "$PROJECT_DIR/frontend"
npm ci --ignore-scripts

echo "[6/7] Building frontend..."
npm run build

# Restart services
echo "[7/7] Restarting services..."
if command -v supervisorctl &> /dev/null; then
    supervisorctl restart all
elif [ -f "$PROJECT_DIR/docker-compose.yml" ]; then
    cd "$PROJECT_DIR"
    docker compose restart
else
    echo "  No supervisor or docker found. Please restart manually."
fi

echo ""
echo "Deploy complete!"
echo "Run 'curl -s http://localhost/api/health | jq .' to verify."
