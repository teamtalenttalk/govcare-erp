<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\JournalEntryController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\ContractController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\BudgetController;
use App\Http\Controllers\Api\TimesheetController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\VendorController;
use App\Http\Controllers\Api\BillController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\LeaveController;
use App\Http\Controllers\Api\PayrollController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\PurchaseOrderController;
use App\Http\Controllers\Api\SalesOrderController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\AdminSetupController;

// Public auth routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Core resources
    Route::apiResource('accounts', AccountController::class);
    Route::apiResource('journal-entries', JournalEntryController::class);
    Route::apiResource('audit-logs', AuditLogController::class)->only(['index', 'show']);

    // Contracts & Projects
    Route::apiResource('contracts', ContractController::class);
    Route::apiResource('projects', ProjectController::class);
    Route::apiResource('tasks', TaskController::class);
    Route::apiResource('budgets', BudgetController::class);

    // Time & Expense
    Route::apiResource('timesheets', TimesheetController::class);
    Route::apiResource('expenses', ExpenseController::class);

    // AP
    Route::apiResource('vendors', VendorController::class);
    Route::apiResource('bills', BillController::class);

    // AR
    Route::apiResource('customers', CustomerController::class);
    Route::apiResource('invoices', InvoiceController::class);

    // HRMS & Payroll
    Route::apiResource('employees', EmployeeController::class);
    Route::apiResource('leaves', LeaveController::class);
    Route::apiResource('payroll', PayrollController::class);

    // Inventory
    Route::apiResource('products', ProductController::class);
    Route::apiResource('purchase-orders', PurchaseOrderController::class);
    Route::apiResource('sales-orders', SalesOrderController::class);

    // Reports
    Route::prefix('reports')->group(function () {
        Route::get('/trial-balance', [ReportController::class, 'trialBalance']);
        Route::get('/income-statement', [ReportController::class, 'incomeStatement']);
        Route::get('/balance-sheet', [ReportController::class, 'balanceSheet']);
    });

    // Admin Setup
    Route::prefix('admin')->group(function () {
        Route::get('/entities', [AdminSetupController::class, 'entities']);
        Route::get('/{entity}', [AdminSetupController::class, 'index']);
        Route::post('/{entity}', [AdminSetupController::class, 'store']);
        Route::get('/{entity}/{id}', [AdminSetupController::class, 'show']);
        Route::put('/{entity}/{id}', [AdminSetupController::class, 'update']);
        Route::patch('/{entity}/{id}/toggle', [AdminSetupController::class, 'toggle']);
        Route::delete('/{entity}/{id}', [AdminSetupController::class, 'destroy']);
    });
});
