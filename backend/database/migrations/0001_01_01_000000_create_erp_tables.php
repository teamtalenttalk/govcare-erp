<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // TENANTS
        Schema::create('tenants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // USERS
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->nullable();
            $table->string('email')->unique();
            $table->string('password');
            $table->string('first_name');
            $table->string('last_name');
            $table->string('role')->default('EMPLOYEE');
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_login_at')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->nullOnDelete();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignUuid('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });

        // ACCOUNTS (Chart of Accounts)
        Schema::create('accounts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('account_number');
            $table->string('name');
            $table->string('account_type'); // ASSET/LIABILITY/EQUITY/REVENUE/EXPENSE
            $table->string('normal_balance'); // DEBIT/CREDIT
            $table->string('cost_type')->nullable(); // DIRECT/OVERHEAD/GA/FRINGE/UNALLOWABLE/N_A
            $table->uuid('parent_id')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('parent_id')->references('id')->on('accounts')->nullOnDelete();
        });

        // FISCAL PERIODS
        Schema::create('fiscal_periods', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('name');
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('is_closed')->default(false);
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        // JOURNAL ENTRIES
        Schema::create('journal_entries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('entry_number');
            $table->date('entry_date');
            $table->text('description')->nullable();
            $table->string('reference_number')->nullable();
            $table->string('status')->default('DRAFT'); // DRAFT/POSTED/VOIDED
            $table->decimal('total_debit', 19, 4)->default(0);
            $table->decimal('total_credit', 19, 4)->default(0);
            $table->uuid('created_by')->nullable();
            $table->uuid('posted_by')->nullable();
            $table->timestamp('posted_at')->nullable();
            $table->uuid('voided_by')->nullable();
            $table->timestamp('voided_at')->nullable();
            $table->text('void_reason')->nullable();
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        // JOURNAL ENTRY LINES
        Schema::create('journal_entry_lines', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('journal_entry_id');
            $table->uuid('account_id');
            $table->text('description')->nullable();
            $table->decimal('debit', 19, 4)->default(0);
            $table->decimal('credit', 19, 4)->default(0);
            $table->timestamps();
            $table->foreign('journal_entry_id')->references('id')->on('journal_entries')->onDelete('cascade');
            $table->foreign('account_id')->references('id')->on('accounts')->onDelete('cascade');
        });

        // AUDIT LOGS
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->uuid('user_id')->nullable();
            $table->string('entity_type');
            $table->uuid('entity_id')->nullable();
            $table->string('action');
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address')->nullable();
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        // CONTRACTS
        Schema::create('contracts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('contract_number');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('contract_type')->nullable();
            $table->string('client_name')->nullable();
            $table->string('client_contact')->nullable();
            $table->string('client_email')->nullable();
            $table->string('client_phone')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->decimal('total_value', 19, 4)->default(0);
            $table->decimal('funded_value', 19, 4)->default(0);
            $table->decimal('ceiling_value', 19, 4)->default(0);
            $table->string('billing_frequency')->nullable();
            $table->string('payment_terms')->nullable();
            $table->string('status')->default('DRAFT');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        // PROJECTS
        Schema::create('projects', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->uuid('contract_id')->nullable();
            $table->string('project_number');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('status')->default('PLANNING');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->decimal('budget_total', 19, 4)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('contract_id')->references('id')->on('contracts')->nullOnDelete();
        });

        // TASKS
        Schema::create('tasks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->uuid('project_id');
            $table->string('task_number');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('status')->default('OPEN');
            $table->string('priority')->default('MEDIUM');
            $table->uuid('assigned_to')->nullable();
            $table->date('start_date')->nullable();
            $table->date('due_date')->nullable();
            $table->decimal('estimated_hours', 8, 2)->default(0);
            $table->decimal('actual_hours', 8, 2)->default(0);
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('project_id')->references('id')->on('projects')->onDelete('cascade');
        });

        // PROJECT BUDGETS
        Schema::create('project_budgets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->uuid('project_id');
            $table->string('category'); // LABOR/MATERIALS/SUBCONTRACTS/TRAVEL/ODC/OVERHEAD/GA/FRINGE
            $table->text('description')->nullable();
            $table->decimal('budgeted', 19, 4)->default(0);
            $table->decimal('actual', 19, 4)->default(0);
            $table->decimal('committed', 19, 4)->default(0);
            $table->string('fiscal_year')->nullable();
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('project_id')->references('id')->on('projects')->onDelete('cascade');
        });

        // TIMESHEET ENTRIES
        Schema::create('timesheet_entries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->uuid('user_id');
            $table->uuid('project_id')->nullable();
            $table->uuid('task_id')->nullable();
            $table->date('entry_date');
            $table->decimal('hours', 8, 2)->default(0);
            $table->text('description')->nullable();
            $table->string('cost_type')->nullable();
            $table->decimal('labor_rate', 10, 2)->default(0);
            $table->string('status')->default('DRAFT');
            $table->timestamp('submitted_at')->nullable();
            $table->uuid('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->uuid('rejected_by')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        // EXPENSE REPORTS
        Schema::create('expense_reports', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('report_number');
            $table->uuid('user_id');
            $table->uuid('project_id')->nullable();
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('total_amount', 19, 4)->default(0);
            $table->string('status')->default('DRAFT');
            $table->timestamp('submitted_at')->nullable();
            $table->uuid('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->uuid('rejected_by')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        // EXPENSE ITEMS
        Schema::create('expense_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('expense_report_id');
            $table->string('category')->nullable();
            $table->text('description')->nullable();
            $table->decimal('amount', 19, 4)->default(0);
            $table->date('expense_date')->nullable();
            $table->string('vendor_name')->nullable();
            $table->string('cost_type')->nullable();
            $table->boolean('is_billable')->default(false);
            $table->string('receipt_url')->nullable();
            $table->timestamps();
            $table->foreign('expense_report_id')->references('id')->on('expense_reports')->onDelete('cascade');
        });

        // VENDORS
        Schema::create('vendors', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('vendor_number');
            $table->string('name');
            $table->string('contact_name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('zip')->nullable();
            $table->string('tax_id')->nullable();
            $table->string('payment_terms')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        // BILLS
        Schema::create('bills', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('bill_number');
            $table->uuid('vendor_id')->nullable();
            $table->uuid('project_id')->nullable();
            $table->date('bill_date');
            $table->date('due_date')->nullable();
            $table->text('description')->nullable();
            $table->string('reference_number')->nullable();
            $table->string('cost_type')->nullable();
            $table->decimal('subtotal', 19, 4)->default(0);
            $table->decimal('tax_amount', 19, 4)->default(0);
            $table->decimal('total_amount', 19, 4)->default(0);
            $table->decimal('amount_paid', 19, 4)->default(0);
            $table->decimal('balance', 19, 4)->default(0);
            $table->string('status')->default('DRAFT');
            $table->text('notes')->nullable();
            $table->uuid('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('vendor_id')->references('id')->on('vendors')->nullOnDelete();
        });

        // BILL ITEMS
        Schema::create('bill_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('bill_id');
            $table->uuid('account_id')->nullable();
            $table->text('description')->nullable();
            $table->decimal('quantity', 10, 2)->default(1);
            $table->decimal('unit_price', 19, 4)->default(0);
            $table->decimal('amount', 19, 4)->default(0);
            $table->string('cost_type')->nullable();
            $table->timestamps();
            $table->foreign('bill_id')->references('id')->on('bills')->onDelete('cascade');
        });

        // BILL PAYMENTS
        Schema::create('bill_payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('bill_id');
            $table->decimal('amount', 19, 4)->default(0);
            $table->date('payment_date');
            $table->string('payment_method')->nullable();
            $table->string('reference')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->foreign('bill_id')->references('id')->on('bills')->onDelete('cascade');
        });

        // CUSTOMERS
        Schema::create('customers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('customer_number');
            $table->string('name');
            $table->string('contact_name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('zip')->nullable();
            $table->string('tax_id')->nullable();
            $table->string('payment_terms')->nullable();
            $table->decimal('credit_limit', 19, 4)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        // INVOICES
        Schema::create('invoices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('invoice_number');
            $table->uuid('customer_id')->nullable();
            $table->uuid('project_id')->nullable();
            $table->uuid('contract_id')->nullable();
            $table->date('invoice_date');
            $table->date('due_date')->nullable();
            $table->text('description')->nullable();
            $table->string('terms')->nullable();
            $table->decimal('subtotal', 19, 4)->default(0);
            $table->decimal('tax_amount', 19, 4)->default(0);
            $table->decimal('total_amount', 19, 4)->default(0);
            $table->decimal('amount_paid', 19, 4)->default(0);
            $table->decimal('balance', 19, 4)->default(0);
            $table->string('status')->default('DRAFT');
            $table->text('notes')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('customer_id')->references('id')->on('customers')->nullOnDelete();
        });

        // INVOICE ITEMS
        Schema::create('invoice_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('invoice_id');
            $table->uuid('account_id')->nullable();
            $table->text('description')->nullable();
            $table->decimal('quantity', 10, 2)->default(1);
            $table->decimal('unit_price', 19, 4)->default(0);
            $table->decimal('amount', 19, 4)->default(0);
            $table->timestamps();
            $table->foreign('invoice_id')->references('id')->on('invoices')->onDelete('cascade');
        });

        // INVOICE PAYMENTS
        Schema::create('invoice_payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('invoice_id');
            $table->decimal('amount', 19, 4)->default(0);
            $table->date('payment_date');
            $table->string('payment_method')->nullable();
            $table->string('reference')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->foreign('invoice_id')->references('id')->on('invoices')->onDelete('cascade');
        });

        // EMPLOYEES
        Schema::create('employees', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('employee_number');
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('zip')->nullable();
            $table->string('department')->nullable();
            $table->string('job_title')->nullable();
            $table->string('employment_type')->default('FULL_TIME');
            $table->string('employment_status')->default('ACTIVE');
            $table->date('hire_date')->nullable();
            $table->date('termination_date')->nullable();
            $table->decimal('pay_rate', 10, 2)->default(0);
            $table->string('pay_frequency')->default('BIWEEKLY');
            $table->uuid('manager_id')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        // LEAVE BALANCES
        Schema::create('leave_balances', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->uuid('employee_id');
            $table->string('leave_type');
            $table->decimal('entitled', 5, 1)->default(0);
            $table->decimal('used', 5, 1)->default(0);
            $table->decimal('balance', 5, 1)->default(0);
            $table->integer('year');
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('employee_id')->references('id')->on('employees')->onDelete('cascade');
        });

        // LEAVE REQUESTS
        Schema::create('leave_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->uuid('employee_id');
            $table->string('leave_type');
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('days', 3, 1)->default(1);
            $table->text('reason')->nullable();
            $table->string('status')->default('PENDING');
            $table->uuid('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->uuid('rejected_by')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('employee_id')->references('id')->on('employees')->onDelete('cascade');
        });

        // PAYROLL RUNS
        Schema::create('payroll_runs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('run_number');
            $table->date('pay_period_start');
            $table->date('pay_period_end');
            $table->date('pay_date');
            $table->string('status')->default('DRAFT');
            $table->decimal('total_gross', 19, 4)->default(0);
            $table->decimal('total_deductions', 19, 4)->default(0);
            $table->decimal('total_taxes', 19, 4)->default(0);
            $table->decimal('total_net', 19, 4)->default(0);
            $table->integer('employee_count')->default(0);
            $table->text('notes')->nullable();
            $table->uuid('processed_by')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        // PAYROLL ITEMS
        Schema::create('payroll_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('payroll_run_id');
            $table->uuid('employee_id');
            $table->json('earnings')->nullable();
            $table->json('deductions')->nullable();
            $table->json('taxes')->nullable();
            $table->decimal('gross_pay', 19, 4)->default(0);
            $table->decimal('total_deductions', 19, 4)->default(0);
            $table->decimal('total_taxes', 19, 4)->default(0);
            $table->decimal('net_pay', 19, 4)->default(0);
            $table->timestamps();
            $table->foreign('payroll_run_id')->references('id')->on('payroll_runs')->onDelete('cascade');
            $table->foreign('employee_id')->references('id')->on('employees')->onDelete('cascade');
        });

        // PRODUCTS
        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('sku');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('product_type')->nullable();
            $table->string('category')->nullable();
            $table->string('unit')->nullable();
            $table->decimal('cost_price', 19, 4)->default(0);
            $table->decimal('selling_price', 19, 4)->default(0);
            $table->integer('quantity_on_hand')->default(0);
            $table->integer('reorder_point')->default(0);
            $table->integer('reorder_quantity')->default(0);
            $table->string('warehouse')->nullable();
            $table->string('location')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        // STOCK MOVEMENTS
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('product_id');
            $table->uuid('tenant_id');
            $table->string('movement_type'); // IN/OUT/ADJUSTMENT
            $table->integer('quantity')->default(0);
            $table->decimal('unit_cost', 19, 4)->default(0);
            $table->string('reference')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        // PURCHASE ORDERS
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('po_number');
            $table->uuid('vendor_id')->nullable();
            $table->uuid('project_id')->nullable();
            $table->date('order_date');
            $table->date('expected_date')->nullable();
            $table->text('shipping_address')->nullable();
            $table->string('status')->default('DRAFT');
            $table->decimal('subtotal', 19, 4)->default(0);
            $table->decimal('tax_amount', 19, 4)->default(0);
            $table->decimal('total_amount', 19, 4)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('vendor_id')->references('id')->on('vendors')->nullOnDelete();
        });

        // PURCHASE ORDER ITEMS
        Schema::create('purchase_order_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('purchase_order_id');
            $table->uuid('product_id')->nullable();
            $table->text('description')->nullable();
            $table->integer('quantity_ordered')->default(0);
            $table->integer('quantity_received')->default(0);
            $table->decimal('unit_price', 19, 4)->default(0);
            $table->decimal('amount', 19, 4)->default(0);
            $table->timestamps();
            $table->foreign('purchase_order_id')->references('id')->on('purchase_orders')->onDelete('cascade');
        });

        // SALES ORDERS
        Schema::create('sales_orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('so_number');
            $table->uuid('customer_id')->nullable();
            $table->uuid('project_id')->nullable();
            $table->date('order_date');
            $table->date('delivery_date')->nullable();
            $table->text('shipping_address')->nullable();
            $table->string('status')->default('DRAFT');
            $table->decimal('subtotal', 19, 4)->default(0);
            $table->decimal('tax_amount', 19, 4)->default(0);
            $table->decimal('total_amount', 19, 4)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('customer_id')->references('id')->on('customers')->nullOnDelete();
        });

        // SALES ORDER ITEMS
        Schema::create('sales_order_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('sales_order_id');
            $table->uuid('product_id')->nullable();
            $table->text('description')->nullable();
            $table->integer('quantity_ordered')->default(0);
            $table->integer('quantity_shipped')->default(0);
            $table->decimal('unit_price', 19, 4)->default(0);
            $table->decimal('amount', 19, 4)->default(0);
            $table->timestamps();
            $table->foreign('sales_order_id')->references('id')->on('sales_orders')->onDelete('cascade');
        });

        // ===== PHASE 6: ADMIN SETUP TABLES =====

        Schema::create('cost_elements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('code');
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        Schema::create('cost_pool_groups', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('pool_type')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        Schema::create('cost_structures', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('name');
            $table->text('description')->nullable();
            $table->json('structure')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        Schema::create('posting_groups', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('name');
            $table->text('description')->nullable();
            $table->json('rules')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        Schema::create('labor_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('code');
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('billing_rate', 10, 2)->default(0);
            $table->decimal('cost_rate', 10, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        Schema::create('pay_codes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('code');
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('multiplier', 5, 2)->default(1.00);
            $table->boolean('is_billable')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        Schema::create('expense_types', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('code');
            $table->string('name');
            $table->text('description')->nullable();
            $table->uuid('account_id')->nullable();
            $table->boolean('requires_receipt')->default(false);
            $table->decimal('max_amount', 19, 4)->nullable();
            $table->boolean('is_billable')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        Schema::create('mileage_rate_sets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('name');
            $table->decimal('rate_per_mile', 6, 4)->default(0);
            $table->date('effective_date');
            $table->date('end_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        Schema::create('approval_groups', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('name');
            $table->string('category')->nullable();
            $table->text('description')->nullable();
            $table->json('approvers')->nullable();
            $table->decimal('min_amount', 19, 4)->default(0);
            $table->decimal('max_amount', 19, 4)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        Schema::create('holidays', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('name');
            $table->date('date');
            $table->boolean('is_paid')->default(true);
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        Schema::create('locations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('code');
            $table->string('name');
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('zip')->nullable();
            $table->string('country')->default('US');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        Schema::create('skills', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('name');
            $table->string('skill_type')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        Schema::create('units_of_measure', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('code');
            $table->string('name');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        Schema::create('currencies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('code');
            $table->string('name');
            $table->string('symbol')->nullable();
            $table->decimal('exchange_rate', 12, 6)->default(1.000000);
            $table->boolean('is_base')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        Schema::create('payment_terms_config', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('code');
            $table->string('name');
            $table->integer('days')->default(30);
            $table->decimal('discount_pct', 5, 2)->default(0);
            $table->integer('discount_days')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        Schema::create('budget_names', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('fiscal_year')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        Schema::create('statistical_accounts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('account_number');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('unit')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        Schema::create('fee_calc_methods', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('name');
            $table->text('description')->nullable();
            $table->text('formula')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        Schema::create('email_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('name');
            $table->string('subject')->nullable();
            $table->text('body')->nullable();
            $table->string('category')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        Schema::create('custom_fields', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('entity_type');
            $table->string('field_name');
            $table->string('field_label');
            $table->string('field_type')->default('text');
            $table->json('options')->nullable();
            $table->boolean('is_required')->default(false);
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        $tables = [
            'custom_fields', 'email_templates', 'fee_calc_methods', 'statistical_accounts',
            'budget_names', 'payment_terms_config', 'currencies', 'units_of_measure',
            'skills', 'locations', 'holidays', 'approval_groups', 'mileage_rate_sets',
            'expense_types', 'pay_codes', 'labor_categories', 'posting_groups',
            'cost_structures', 'cost_pool_groups', 'cost_elements',
            'sales_order_items', 'sales_orders', 'purchase_order_items', 'purchase_orders',
            'stock_movements', 'products', 'payroll_items', 'payroll_runs',
            'leave_requests', 'leave_balances', 'employees',
            'invoice_payments', 'invoice_items', 'invoices', 'customers',
            'bill_payments', 'bill_items', 'bills', 'vendors',
            'expense_items', 'expense_reports', 'timesheet_entries',
            'project_budgets', 'tasks', 'projects', 'contracts',
            'audit_logs', 'journal_entry_lines', 'journal_entries',
            'fiscal_periods', 'accounts', 'sessions', 'password_reset_tokens',
            'users', 'tenants',
        ];
        foreach ($tables as $table) {
            Schema::dropIfExists($table);
        }
    }
};
