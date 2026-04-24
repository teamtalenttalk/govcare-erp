<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // AI Assistant conversation history
        Schema::create('ai_conversations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->uuid('user_id');
            $table->text('question');
            $table->text('answer')->nullable();
            $table->string('category')->nullable(); // financial, compliance, hr, general
            $table->json('context')->nullable();
            $table->integer('confidence_score')->nullable();
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->index(['tenant_id', 'user_id', 'created_at'], 'ai_conv_tenant_user');
        });

        // Bank transactions (imported from CSV)
        Schema::create('bank_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('bank_account')->nullable();
            $table->date('transaction_date');
            $table->text('description');
            $table->decimal('amount', 19, 4);
            $table->string('type')->default('DEBIT'); // DEBIT or CREDIT
            $table->string('reference')->nullable();
            $table->string('status')->default('UNMATCHED'); // UNMATCHED, MATCHED, RECONCILED
            $table->uuid('matched_journal_entry_id')->nullable();
            $table->uuid('matched_by')->nullable();
            $table->timestamp('matched_at')->nullable();
            $table->string('import_batch')->nullable();
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->index(['tenant_id', 'status'], 'bt_tenant_status');
            $table->index(['tenant_id', 'transaction_date'], 'bt_tenant_date');
        });

        // Dashboard widgets
        Schema::create('dashboard_widgets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->uuid('user_id');
            $table->string('title');
            $table->string('widget_type'); // kpi, chart, trend, table
            $table->string('data_source'); // revenue, expenses, cash_flow, ar_aging, etc.
            $table->json('config')->nullable(); // chart type, colors, date range, etc.
            $table->integer('position_x')->default(0);
            $table->integer('position_y')->default(0);
            $table->integer('width')->default(4);
            $table->integer('height')->default(3);
            $table->boolean('is_visible')->default(true);
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->index(['tenant_id', 'user_id'], 'dw_tenant_user');
        });

        // Documents
        Schema::create('documents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->uuid('uploaded_by');
            $table->string('name');
            $table->string('original_filename');
            $table->string('mime_type')->nullable();
            $table->bigInteger('file_size')->default(0);
            $table->string('storage_path');
            $table->string('entity_type')->nullable(); // contract, invoice, expense, bill, etc.
            $table->uuid('entity_id')->nullable();
            $table->text('description')->nullable();
            $table->json('tags')->nullable();
            $table->string('category')->nullable();
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->index(['tenant_id', 'entity_type', 'entity_id'], 'doc_tenant_entity');
            $table->index(['tenant_id', 'category'], 'doc_tenant_category');
        });

        // Scheduled reports
        Schema::create('scheduled_reports', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->uuid('created_by');
            $table->string('name');
            $table->string('report_type'); // trial_balance, income_statement, balance_sheet, ar_aging, etc.
            $table->json('parameters')->nullable(); // date range, filters, etc.
            $table->string('frequency'); // daily, weekly, monthly, quarterly
            $table->string('delivery_method')->default('email'); // email, download
            $table->json('recipients')->nullable(); // email addresses
            $table->string('output_format')->default('pdf'); // pdf, csv, xlsx
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_run_at')->nullable();
            $table->timestamp('next_run_at')->nullable();
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->index(['tenant_id', 'is_active', 'next_run_at'], 'sr_tenant_active_next');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scheduled_reports');
        Schema::dropIfExists('documents');
        Schema::dropIfExists('dashboard_widgets');
        Schema::dropIfExists('bank_transactions');
        Schema::dropIfExists('ai_conversations');
    }
};
