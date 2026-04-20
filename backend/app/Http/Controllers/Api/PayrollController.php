<?php
namespace App\Http\Controllers\Api;

use App\Models\PayrollRun;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PayrollController extends BaseResourceController
{
    protected string $modelClass = PayrollRun::class;
    protected array $searchFields = ['run_number', 'notes'];
    protected array $with = ['items', 'items.employee'];
    protected string $resourceKey = 'payrollRuns';

    public function store(Request $request)
    {
        $data = $request->validate([
            'run_number' => 'required|string',
            'pay_period_start' => 'required|date',
            'pay_period_end' => 'required|date',
            'pay_date' => 'required|date',
            'status' => 'nullable|string',
            'notes' => 'nullable|string',
            'items' => 'nullable|array',
            'items.*.employee_id' => 'required|uuid',
            'items.*.earnings' => 'nullable|array',
            'items.*.deductions' => 'nullable|array',
            'items.*.taxes' => 'nullable|array',
            'items.*.gross_pay' => 'nullable|numeric',
            'items.*.total_deductions' => 'nullable|numeric',
            'items.*.total_taxes' => 'nullable|numeric',
            'items.*.net_pay' => 'nullable|numeric',
        ]);

        return DB::transaction(function () use ($data, $request) {
            $items = $data['items'] ?? [];
            unset($data['items']);
            $data['tenant_id'] = $this->getTenantId($request);
            $data['employee_count'] = count($items);
            $data['total_gross'] = collect($items)->sum('gross_pay');
            $data['total_deductions'] = collect($items)->sum('total_deductions');
            $data['total_taxes'] = collect($items)->sum('total_taxes');
            $data['total_net'] = collect($items)->sum('net_pay');
            $run = PayrollRun::create($data);
            foreach ($items as $item) { $run->items()->create($item); }
            return response()->json($run->load('items.employee'), 201);
        });
    }

    public function update(Request $request, string $id)
    {
        $run = $this->baseQuery($request)->findOrFail($id);
        $run->update($request->only($run->getFillable()));
        return response()->json($run->load('items.employee'));
    }
}
