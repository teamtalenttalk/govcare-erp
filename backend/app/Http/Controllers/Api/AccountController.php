<?php

namespace App\Http\Controllers\Api;

use App\Models\Account;
use Illuminate\Http\Request;

class AccountController extends BaseResourceController
{
    protected string $modelClass = Account::class;
    protected array $searchFields = ['name', 'account_number', 'description'];
    protected string $resourceKey = 'accounts';

    public function store(Request $request)
    {
        $data = $request->validate([
            'account_number' => 'required|string',
            'name' => 'required|string',
            'account_type' => 'required|string',
            'normal_balance' => 'required|string',
            'cost_type' => 'nullable|string',
            'parent_id' => 'nullable|uuid',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $data['tenant_id'] = $this->getTenantId($request);
        $account = Account::create($data);
        return response()->json($account, 201);
    }

    public function update(Request $request, string $id)
    {
        $account = $this->baseQuery($request)->findOrFail($id);
        $data = $request->validate([
            'account_number' => 'nullable|string',
            'name' => 'nullable|string',
            'account_type' => 'nullable|string',
            'normal_balance' => 'nullable|string',
            'cost_type' => 'nullable|string',
            'parent_id' => 'nullable|uuid',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $account->update(array_filter($data, fn($v) => $v !== null));
        return response()->json($account);
    }
}
