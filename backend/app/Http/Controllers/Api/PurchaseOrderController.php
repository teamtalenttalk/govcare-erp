<?php
namespace App\Http\Controllers\Api;

use App\Models\PurchaseOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseOrderController extends BaseResourceController
{
    protected string $modelClass = PurchaseOrder::class;
    protected array $searchFields = ['po_number', 'notes'];
    protected array $with = ['vendor', 'items'];
    protected string $resourceKey = 'purchaseOrders';

    public function store(Request $request)
    {
        $data = $request->validate([
            'po_number' => 'required|string',
            'vendor_id' => 'nullable|uuid',
            'project_id' => 'nullable|uuid',
            'order_date' => 'required|date',
            'expected_date' => 'nullable|date',
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
            $po = PurchaseOrder::create($data);
            foreach ($items as $item) { $po->items()->create($item); }
            return response()->json($po->load('items', 'vendor'), 201);
        });
    }

    public function update(Request $request, string $id)
    {
        $po = $this->baseQuery($request)->findOrFail($id);
        $po->update($request->only($po->getFillable()));
        return response()->json($po->load('items', 'vendor'));
    }
}
