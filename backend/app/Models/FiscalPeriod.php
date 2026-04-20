<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class FiscalPeriod extends Model
{
    use HasUuids;

    protected $fillable = ['tenant_id', 'name', 'start_date', 'end_date', 'is_closed'];

    protected $casts = ['is_closed' => 'boolean', 'start_date' => 'date', 'end_date' => 'date'];

    public function tenant() { return $this->belongsTo(Tenant::class); }
}
