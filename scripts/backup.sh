#!/usr/bin/env bash
# GovCare ERP - Backup Script
# Usage: ./scripts/backup.sh [destination_dir]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${1:-$PROJECT_DIR/backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="govcare_backup_${TIMESTAMP}"

echo "=== GovCare ERP Backup ==="
echo "Timestamp: $TIMESTAMP"

mkdir -p "$BACKUP_DIR"

# Backup SQLite database
DB_FILE="$PROJECT_DIR/backend/database/database.sqlite"
if [ -f "$DB_FILE" ]; then
    echo "Backing up SQLite database..."
    cp "$DB_FILE" "$BACKUP_DIR/${BACKUP_NAME}_database.sqlite"
    echo "  -> ${BACKUP_NAME}_database.sqlite"
else
    echo "No SQLite database found at $DB_FILE"
fi

# Backup .env
ENV_FILE="$PROJECT_DIR/backend/.env"
if [ -f "$ENV_FILE" ]; then
    echo "Backing up .env..."
    cp "$ENV_FILE" "$BACKUP_DIR/${BACKUP_NAME}_env"
    echo "  -> ${BACKUP_NAME}_env"
fi

# Backup uploaded files
STORAGE_DIR="$PROJECT_DIR/backend/storage/app"
if [ -d "$STORAGE_DIR" ]; then
    echo "Backing up storage..."
    tar -czf "$BACKUP_DIR/${BACKUP_NAME}_storage.tar.gz" -C "$PROJECT_DIR/backend" storage/app
    echo "  -> ${BACKUP_NAME}_storage.tar.gz"
fi

# Clean old backups (keep last 10)
echo "Cleaning old backups (keeping last 10)..."
ls -t "$BACKUP_DIR"/govcare_backup_* 2>/dev/null | tail -n +31 | xargs -r rm --

echo ""
echo "Backup complete! Files saved to: $BACKUP_DIR"
ls -lh "$BACKUP_DIR"/${BACKUP_NAME}*
