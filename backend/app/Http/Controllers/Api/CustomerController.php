<?php
namespace App\Http\Controllers\Api;

use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends BaseResourceController
{
    protected string $modelClass = Customer::class;
    protected array $searchFields = ['customer_number', 'name', 'email', 'contact_name'];
    protected string $resourceKey = 'customers';

    public function store(Request $request)
    {
        $data = $request->validate([
            'customer_number' => 'required|string',
            'name' => 'required|string',
            'contact_name' => 'nullable|string',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'state' => 'nullable|string',
            'zip' => 'nullable|string',
            'tax_id' => 'nullable|string',
            'payment_terms' => 'nullable|string',
            'credit_limit' => 'nullable|numeric',
            'is_active' => 'nullable|boolean',
        ]);
        $data['tenant_id'] = $this->getTenantId($request);
        return response()->json(Customer::create($data), 201);
    }

    public function update(Request $request, string $id)
    {
        $item = $this->baseQuery($request)->findOrFail($id);
        $item->update($request->only($item->getFillable()));
        return response()->json($item);
    }
}
