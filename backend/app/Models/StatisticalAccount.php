<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class StatisticalAccount extends Model
{
    use HasUuids;

    protected $table = 'statistical_accounts';

    protected $fillable = ['tenant_id', 'account_number', 'name', 'description', 'unit', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function tenant() { return $this->belongsTo(Tenant::class); }
}
