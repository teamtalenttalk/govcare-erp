<?php
namespace App\Http\Controllers\Api;

use App\Models\ExpenseReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExpenseController extends BaseResourceController
{
    protected string $modelClass = ExpenseReport::class;
    protected array $searchFields = ['report_number', 'title', 'description'];
    protected array $with = ['items'];
    protected string $resourceKey = 'expenses';

    public function store(Request $request)
    {
        $data = $request->validate([
            'report_number' => 'required|string',
            'project_id' => 'nullable|uuid',
            'title' => 'required|string',
            'description' => 'nullable|string',
            'total_amount' => 'nullable|numeric',
            'status' => 'nullable|string',
            'items' => 'nullable|array',
            'items.*.category' => 'nullable|string',
            'items.*.description' => 'nullable|string',
            'items.*.amount' => 'required|numeric',
            'items.*.expense_date' => 'nullable|date',
            'items.*.vendor_name' => 'nullable|string',
            'items.*.cost_type' => 'nullable|string',
            'items.*.is_billable' => 'nullable|boolean',
        ]);

        return DB::transaction(function () use ($data, $request) {
            $items = $data['items'] ?? [];
            unset($data['items']);
            $data['tenant_id'] = $this->getTenantId($request);
            $data['user_id'] = $request->user()->id;
            if (empty($data['total_amount'])) {
                $data['total_amount'] = collect($items)->sum('amount');
            }
            $report = ExpenseReport::create($data);
            foreach ($items as $item) {
                $report->items()->create($item);
            }
            return response()->json($report->load('items'), 201);
        });
    }

    public function update(Request $request, string $id)
    {
        $item = $this->baseQuery($request)->findOrFail($id);
        $data = $request->only($item->getFillable());
        $items = $request->input('items');

        return DB::transaction(function () use ($data, $items, $item) {
            if ($items !== null) {
                $item->items()->delete();
                foreach ($items as $lineItem) {
                    $item->items()->create($lineItem);
                }
                $data['total_amount'] = collect($items)->sum('amount');
            }
            $item->update($data);
            return response()->json($item->load('items'));
        });
    }
}
