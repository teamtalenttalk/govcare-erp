<?php
namespace App\Http\Controllers\Api;

use App\Models\Bill;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BillController extends BaseResourceController
{
    protected string $modelClass = Bill::class;
    protected array $searchFields = ['bill_number', 'description', 'reference_number'];
    protected array $with = ['vendor', 'items', 'payments'];
    protected string $resourceKey = 'bills';

    public function store(Request $request)
    {
        $data = $request->validate([
            'bill_number' => 'required|string',
            'vendor_id' => 'nullable|uuid',
            'project_id' => 'nullable|uuid',
            'bill_date' => 'required|date',
            'due_date' => 'nullable|date',
            'description' => 'nullable|string',
            'reference_number' => 'nullable|string',
            'cost_type' => 'nullable|string',
            'subtotal' => 'nullable|numeric',
            'tax_amount' => 'nullable|numeric',
            'total_amount' => 'nullable|numeric',
            'status' => 'nullable|string',
            'notes' => 'nullable|string',
            'items' => 'nullable|array',
            'items.*.account_id' => 'nullable|uuid',
            'items.*.description' => 'nullable|string',
            'items.*.quantity' => 'nullable|numeric',
            'items.*.unit_price' => 'nullable|numeric',
            'items.*.amount' => 'nullable|numeric',
            'items.*.cost_type' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($data, $request) {
            $items = $data['items'] ?? [];
            unset($data['items']);
            $data['tenant_id'] = $this->getTenantId($request);
            $data['balance'] = $data['total_amount'] ?? 0;
            $bill = Bill::create($data);
            foreach ($items as $item) {
                $bill->items()->create($item);
            }
            return response()->json($bill->load('items', 'vendor'), 201);
        });
    }

    public function update(Request $request, string $id)
    {
        $bill = $this->baseQuery($request)->findOrFail($id);
        $data = $request->only($bill->getFillable());
        $items = $request->input('items');

        return DB::transaction(function () use ($data, $items, $bill) {
            if ($items !== null) {
                $bill->items()->delete();
                foreach ($items as $item) { $bill->items()->create($item); }
            }
            $bill->update($data);
            return response()->json($bill->load('items', 'vendor', 'payments'));
        });
    }
}
