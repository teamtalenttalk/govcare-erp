# GovCare ERP - Backend

DCAA-compliant government contract accounting ERP system built with Laravel 13 + PHP 8.3 + SQLite.

## Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate --force
php artisan serve --port=8001
```

## API Overview

- **Auth**: POST /api/login, POST /api/register, POST /api/logout
- **Health**: GET /api/health (public)
- **Docs**: GET /api/docs (public)
- **CRUD Resources**: accounts, journal-entries, contracts, projects, tasks, budgets, timesheets, expenses, vendors, bills, customers, invoices, employees, leaves, payroll, products, purchase-orders, sales-orders
- **Reports**: /api/reports/trial-balance, /api/reports/income-statement, /api/reports/balance-sheet
- **AI Assistant**: POST /api/ai/ask, GET /api/ai/suggestions, GET /api/ai/history
- **Bank Reconciliation**: POST /api/bank/import, GET /api/bank/unmatched, POST /api/bank/match/{id}, GET /api/bank/reconciliation-report
- **Dashboard Widgets**: CRUD /api/widgets, GET /api/widgets/data/{type}
- **Document Management**: CRUD /api/documents, POST /api/documents/{id}/tags, GET /api/documents/search
- **Scheduled Reports**: CRUD /api/scheduled-reports, POST /api/scheduled-reports/{id}/run
- **Admin Setup**: /api/admin/entities, /api/admin/{entity}

## Rate Limits

| Limiter | Rate |
|---------|------|
| api | 60/min |
| auth | 10/min |
| reports | 30/min |
| ai | 20/min |
| uploads | 15/min |

## Docker

```bash
# From project root
docker compose up --build
# App available at http://localhost:8080
```

## Testing

```bash
php artisan test
```

## Deployment

```bash
./scripts/deploy.sh production
```

## Backup

```bash
./scripts/backup.sh [destination_dir]
```
