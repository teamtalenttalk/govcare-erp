<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ExpenseItem extends Model
{
    use HasUuids;

    protected $fillable = [
        'expense_report_id', 'category', 'description', 'amount',
        'expense_date', 'vendor_name', 'cost_type', 'is_billable', 'receipt_url',
    ];

    protected $casts = ['amount' => 'float', 'expense_date' => 'date', 'is_billable' => 'boolean'];

    public function expenseReport() { return $this->belongsTo(ExpenseReport::class); }
}
