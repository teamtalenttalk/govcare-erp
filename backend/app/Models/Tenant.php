<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Tenant extends Model
{
    use HasUuids;

    protected $fillable = ['name', 'slug', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function users() { return $this->hasMany(User::class); }
    public function accounts() { return $this->hasMany(Account::class); }
    public function contracts() { return $this->hasMany(Contract::class); }
    public function projects() { return $this->hasMany(Project::class); }
}
