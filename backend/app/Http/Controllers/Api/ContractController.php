<?php
namespace App\Http\Controllers\Api;

use App\Models\Contract;
use Illuminate\Http\Request;

class ContractController extends BaseResourceController
{
    protected string $modelClass = Contract::class;
    protected array $searchFields = ['contract_number', 'title', 'client_name'];
    protected array $with = ['projects'];
    protected string $resourceKey = 'contracts';

    public function store(Request $request)
    {
        $data = $request->validate([
            'contract_number' => 'required|string',
            'title' => 'required|string',
            'description' => 'nullable|string',
            'contract_type' => 'nullable|string',
            'client_name' => 'nullable|string',
            'client_contact' => 'nullable|string',
            'client_email' => 'nullable|email',
            'client_phone' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'total_value' => 'nullable|numeric',
            'funded_value' => 'nullable|numeric',
            'ceiling_value' => 'nullable|numeric',
            'billing_frequency' => 'nullable|string',
            'payment_terms' => 'nullable|string',
            'status' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);
        $data['tenant_id'] = $this->getTenantId($request);
        return response()->json(Contract::create($data), 201);
    }

    public function update(Request $request, string $id)
    {
        $item = $this->baseQuery($request)->findOrFail($id);
        $item->update($request->only($item->getFillable()));
        return response()->json($item);
    }
}
