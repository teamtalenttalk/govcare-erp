<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Journal entries - heavily queried for reports
        Schema::table('journal_entries', function (Blueprint $table) {
            $table->index(['tenant_id', 'status', 'entry_date'], 'je_tenant_status_date');
            $table->index(['tenant_id', 'entry_date'], 'je_tenant_date');
            $table->index('entry_number');
        });

        Schema::table('journal_entry_lines', function (Blueprint $table) {
            $table->index(['account_id', 'journal_entry_id'], 'jel_account_entry');
        });

        // Invoices - AR aging, payment tracking
        Schema::table('invoices', function (Blueprint $table) {
            $table->index(['tenant_id', 'status', 'due_date'], 'inv_tenant_status_due');
            $table->index(['tenant_id', 'customer_id'], 'inv_tenant_customer');
            $table->index('invoice_number');
        });

        // Bills - AP aging, payment tracking
        Schema::table('bills', function (Blueprint $table) {
            $table->index(['tenant_id', 'status', 'due_date'], 'bill_tenant_status_due');
            $table->index(['tenant_id', 'vendor_id'], 'bill_tenant_vendor');
            $table->index('bill_number');
        });

        // Timesheets - labor reports, utilization
        Schema::table('timesheet_entries', function (Blueprint $table) {
            $table->index(['tenant_id', 'user_id', 'entry_date'], 'ts_tenant_user_date');
            $table->index(['tenant_id', 'project_id', 'entry_date'], 'ts_tenant_project_date');
            $table->index(['tenant_id', 'status'], 'ts_tenant_status');
        });

        // Employees - HR queries
        Schema::table('employees', function (Blueprint $table) {
            $table->index(['tenant_id', 'employment_status'], 'emp_tenant_status');
            $table->index(['tenant_id', 'department'], 'emp_tenant_dept');
            $table->index('employee_number');
        });

        // Payroll - pay period lookups
        Schema::table('payroll_runs', function (Blueprint $table) {
            $table->index(['tenant_id', 'status', 'pay_date'], 'pr_tenant_status_paydate');
        });

        Schema::table('payroll_items', function (Blueprint $table) {
            $table->index(['payroll_run_id', 'employee_id'], 'pi_run_employee');
        });

        // Contracts & Projects
        Schema::table('contracts', function (Blueprint $table) {
            $table->index(['tenant_id', 'status'], 'contract_tenant_status');
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->index(['tenant_id', 'status'], 'project_tenant_status');
            $table->index(['tenant_id', 'contract_id'], 'project_tenant_contract');
        });

        // Expense reports
        Schema::table('expense_reports', function (Blueprint $table) {
            $table->index(['tenant_id', 'status'], 'exp_tenant_status');
            $table->index(['tenant_id', 'user_id'], 'exp_tenant_user');
        });

        // Audit logs
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->index(['tenant_id', 'entity_type', 'entity_id'], 'audit_tenant_entity');
            $table->index(['tenant_id', 'created_at'], 'audit_tenant_created');
        });
    }

    public function down(): void
    {
        Schema::table('journal_entries', function (Blueprint $table) {
            $table->dropIndex('je_tenant_status_date');
            $table->dropIndex('je_tenant_date');
            $table->dropIndex(['entry_number']);
        });
        Schema::table('journal_entry_lines', function (Blueprint $table) {
            $table->dropIndex('jel_account_entry');
        });
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropIndex('inv_tenant_status_due');
            $table->dropIndex('inv_tenant_customer');
            $table->dropIndex(['invoice_number']);
        });
        Schema::table('bills', function (Blueprint $table) {
            $table->dropIndex('bill_tenant_status_due');
            $table->dropIndex('bill_tenant_vendor');
            $table->dropIndex(['bill_number']);
        });
        Schema::table('timesheet_entries', function (Blueprint $table) {
            $table->dropIndex('ts_tenant_user_date');
            $table->dropIndex('ts_tenant_project_date');
            $table->dropIndex('ts_tenant_status');
        });
        Schema::table('employees', function (Blueprint $table) {
            $table->dropIndex('emp_tenant_status');
            $table->dropIndex('emp_tenant_dept');
            $table->dropIndex(['employee_number']);
        });
        Schema::table('payroll_runs', function (Blueprint $table) {
            $table->dropIndex('pr_tenant_status_paydate');
        });
        Schema::table('payroll_items', function (Blueprint $table) {
            $table->dropIndex('pi_run_employee');
        });
        Schema::table('contracts', function (Blueprint $table) {
            $table->dropIndex('contract_tenant_status');
        });
        Schema::table('projects', function (Blueprint $table) {
            $table->dropIndex('project_tenant_status');
            $table->dropIndex('project_tenant_contract');
        });
        Schema::table('expense_reports', function (Blueprint $table) {
            $table->dropIndex('exp_tenant_status');
            $table->dropIndex('exp_tenant_user');
        });
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropIndex('audit_tenant_entity');
            $table->dropIndex('audit_tenant_created');
        });
    }
};
