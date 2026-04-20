<?php
namespace App\Http\Controllers\Api;

use App\Models\Vendor;
use Illuminate\Http\Request;

class VendorController extends BaseResourceController
{
    protected string $modelClass = Vendor::class;
    protected array $searchFields = ['vendor_number', 'name', 'email', 'contact_name'];
    protected string $resourceKey = 'vendors';

    public function store(Request $request)
    {
        $data = $request->validate([
            'vendor_number' => 'required|string',
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
            'is_active' => 'nullable|boolean',
        ]);
        $data['tenant_id'] = $this->getTenantId($request);
        return response()->json(Vendor::create($data), 201);
    }

    public function update(Request $request, string $id)
    {
        $item = $this->baseQuery($request)->findOrFail($id);
        $item->update($request->only($item->getFillable()));
        return response()->json($item);
    }
}
