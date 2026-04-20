<?php
namespace App\Http\Controllers\Api;

use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InvoiceController extends BaseResourceController
{
    protected string $modelClass = Invoice::class;
    protected array $searchFields = ['invoice_number', 'description'];
    protected array $with = ['customer', 'items', 'payments'];
    protected string $resourceKey = 'invoices';

    public function store(Request $request)
    {
        $data = $request->validate([
            'invoice_number' => 'required|string',
            'customer_id' => 'nullable|uuid',
            'project_id' => 'nullable|uuid',
            'contract_id' => 'nullable|uuid',
            'invoice_date' => 'required|date',
            'due_date' => 'nullable|date',
            'description' => 'nullable|string',
            'terms' => 'nullable|string',
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
        ]);

        return DB::transaction(function () use ($data, $request) {
            $items = $data['items'] ?? [];
            unset($data['items']);
            $data['tenant_id'] = $this->getTenantId($request);
            $data['balance'] = $data['total_amount'] ?? 0;
            $invoice = Invoice::create($data);
            foreach ($items as $item) {
                $invoice->items()->create($item);
            }
            return response()->json($invoice->load('items', 'customer'), 201);
        });
    }

    public function update(Request $request, string $id)
    {
        $invoice = $this->baseQuery($request)->findOrFail($id);
        $data = $request->only($invoice->getFillable());
        $items = $request->input('items');

        return DB::transaction(function () use ($data, $items, $invoice) {
            if ($items !== null) {
                $invoice->items()->delete();
                foreach ($items as $item) { $invoice->items()->create($item); }
            }
            $invoice->update($data);
            return response()->json($invoice->load('items', 'customer', 'payments'));
        });
    }
}
