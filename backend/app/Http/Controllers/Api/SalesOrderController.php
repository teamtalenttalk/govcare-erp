<?php
namespace App\Http\Controllers\Api;

use App\Models\SalesOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SalesOrderController extends BaseResourceController
{
    protected string $modelClass = SalesOrder::class;
    protected array $searchFields = ['so_number', 'notes'];
    protected array $with = ['customer', 'items'];
    protected string $resourceKey = 'salesOrders';

    public function store(Request $request)
    {
        $data = $request->validate([
            'so_number' => 'required|string',
            'customer_id' => 'nullable|uuid',
            'project_id' => 'nullable|uuid',
            'order_date' => 'required|date',
            'delivery_date' => 'nullable|date',
            'shipping_address' => 'nullable|string',
            'status' => 'nullable|string',
            'subtotal' => 'nullable|numeric',
            'tax_amount' => 'nullable|numeric',
            'total_amount' => 'nullable|numeric',
            'notes' => 'nullable|string',
            'items' => 'nullable|array',
            'items.*.product_id' => 'nullable|uuid',
            'items.*.description' => 'nullable|string',
            'items.*.quantity_ordered' => 'nullable|integer',
            'items.*.unit_price' => 'nullable|numeric',
            'items.*.amount' => 'nullable|numeric',
        ]);

        return DB::transaction(function () use ($data, $request) {
            $items = $data['items'] ?? [];
            unset($data['items']);
            $data['tenant_id'] = $this->getTenantId($request);
            $so = SalesOrder::create($data);
            foreach ($items as $item) { $so->items()->create($item); }
            return response()->json($so->load('items', 'customer'), 201);
        });
    }

    public function update(Request $request, string $id)
    {
        $so = $this->baseQuery($request)->findOrFail($id);
        $so->update($request->only($so->getFillable()));
        return response()->json($so->load('items', 'customer'));
    }
}
