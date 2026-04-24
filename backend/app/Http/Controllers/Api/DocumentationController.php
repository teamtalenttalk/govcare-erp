<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

class DocumentationController extends Controller
{
    public function __invoke()
    {
        return response()->json([
            'name' => 'GovCare ERP API',
            'version' => '1.0.0',
            'description' => 'DCAA-compliant government contract accounting ERP system',
            'base_url' => url('/api'),
            'authentication' => [
                'type' => 'Bearer Token (Laravel Sanctum)',
                'login' => 'POST /api/login { email, password }',
                'logout' => 'POST /api/logout',
                'current_user' => 'GET /api/user',
            ],
            'rate_limits' => [
                'general' => '60 requests/minute',
                'auth' => '10 requests/minute',
                'reports' => '30 requests/minute',
            ],
            'endpoints' => [
                'health' => [
                    'GET /api/health' => 'System health check (public)',
                ],
                'auth' => [
                    'POST /api/login' => 'Authenticate user',
                    'POST /api/register' => 'Register new user',
                    'GET /api/user' => 'Get current user',
                    'POST /api/logout' => 'Logout',
                ],
                'accounting' => [
                    'GET|POST /api/accounts' => 'Chart of accounts CRUD',
                    'GET|PUT|DELETE /api/accounts/{id}' => 'Single account operations',
                    'GET|POST /api/journal-entries' => 'Journal entries CRUD',
                    'GET|PUT|DELETE /api/journal-entries/{id}' => 'Single journal entry operations',
                    'GET /api/audit-logs' => 'Audit log listing',
                ],
                'contracts_projects' => [
                    'GET|POST /api/contracts' => 'Contracts CRUD',
                    'GET|POST /api/projects' => 'Projects CRUD',
                    'GET|POST /api/tasks' => 'Tasks CRUD',
                    'GET|POST /api/budgets' => 'Budgets CRUD',
                ],
                'time_expense' => [
                    'GET|POST /api/timesheets' => 'Timesheet entries CRUD',
                    'GET|POST /api/expenses' => 'Expense reports CRUD',
                ],
                'ap_ar' => [
                    'GET|POST /api/vendors' => 'Vendors CRUD',
                    'GET|POST /api/bills' => 'Bills CRUD',
                    'GET|POST /api/customers' => 'Customers CRUD',
                    'GET|POST /api/invoices' => 'Invoices CRUD',
                ],
                'hr_payroll' => [
                    'GET|POST /api/employees' => 'Employees CRUD',
                    'GET|POST /api/leaves' => 'Leave requests CRUD',
                    'GET|POST /api/payroll' => 'Payroll runs CRUD',
                ],
                'inventory' => [
                    'GET|POST /api/products' => 'Products CRUD',
                    'GET|POST /api/purchase-orders' => 'Purchase orders CRUD',
                    'GET|POST /api/sales-orders' => 'Sales orders CRUD',
                ],
                'reports' => [
                    'GET /api/reports/trial-balance' => 'Trial balance report',
                    'GET /api/reports/income-statement' => 'Income statement',
                    'GET /api/reports/balance-sheet' => 'Balance sheet',
                ],
                'ai_assistant' => [
                    'POST /api/ai/ask' => 'Ask AI financial assistant a question',
                    'GET /api/ai/suggestions' => 'Get AI-generated suggestions',
                    'GET /api/ai/history' => 'Get AI conversation history',
                ],
                'bank_reconciliation' => [
                    'POST /api/bank/import' => 'Import bank statement CSV',
                    'GET /api/bank/unmatched' => 'List unmatched transactions',
                    'POST /api/bank/match/{id}' => 'Match a bank transaction',
                    'GET /api/bank/reconciliation-report' => 'Reconciliation summary report',
                ],
                'widgets' => [
                    'GET|POST /api/widgets' => 'Dashboard widgets CRUD',
                    'GET /api/widgets/data/{type}' => 'Get widget data by type (kpi, chart, trend)',
                ],
                'documents' => [
                    'GET|POST /api/documents' => 'Document management CRUD',
                    'GET|PUT|DELETE /api/documents/{id}' => 'Single document operations',
                    'POST /api/documents/{id}/tags' => 'Update document tags',
                    'GET /api/documents/search' => 'Search documents',
                ],
                'scheduled_reports' => [
                    'GET|POST /api/scheduled-reports' => 'Scheduled reports CRUD',
                    'GET|PUT|DELETE /api/scheduled-reports/{id}' => 'Single scheduled report operations',
                    'POST /api/scheduled-reports/{id}/run' => 'Manually trigger a scheduled report',
                ],
                'admin' => [
                    'GET /api/admin/entities' => 'List all setup entities',
                    'GET|POST /api/admin/{entity}' => 'Admin setup entity CRUD',
                    'PUT|DELETE /api/admin/{entity}/{id}' => 'Admin setup entity operations',
                ],
            ],
            'pagination' => [
                'params' => 'page (default 1), per_page (default 25, max 100)',
                'response' => '{ data: [], current_page, last_page, per_page, total, from, to }',
            ],
            'filtering' => [
                'search' => 'Generic text search across searchable fields',
                'status' => 'Filter by status field',
                'is_active' => 'Filter by active/inactive',
            ],
        ]);
    }
}
