<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminSetupController extends Controller
{
    private array $entityMap = [
        'cost-elements' => \App\Models\CostElement::class,
        'cost-pool-groups' => \App\Models\CostPoolGroup::class,
        'cost-structures' => \App\Models\CostStructure::class,
        'posting-groups' => \App\Models\PostingGroup::class,
        'labor-categories' => \App\Models\LaborCategory::class,
        'pay-codes' => \App\Models\PayCode::class,
        'expense-types' => \App\Models\ExpenseType::class,
        'mileage-rate-sets' => \App\Models\MileageRateSet::class,
        'approval-groups' => \App\Models\ApprovalGroup::class,
        'holidays' => \App\Models\Holiday::class,
        'locations' => \App\Models\Location::class,
        'skills' => \App\Models\Skill::class,
        'units-of-measure' => \App\Models\UnitOfMeasure::class,
        'currencies' => \App\Models\Currency::class,
        'payment-terms' => \App\Models\PaymentTermsConfig::class,
        'budget-names' => \App\Models\BudgetName::class,
        'statistical-accounts' => \App\Models\StatisticalAccount::class,
        'fee-calc-methods' => \App\Models\FeeCalcMethod::class,
        'email-templates' => \App\Models\EmailTemplate::class,
        'custom-fields' => \App\Models\CustomField::class,
    ];

    private function getModelClass(string $entity): ?string
    {
        return $this->entityMap[$entity] ?? null;
    }

    private function getTenantId(Request $request): ?string
    {
        return $request->user()?->tenant_id;
    }

    public function entities()
    {
        $entities = collect($this->entityMap)->keys()->map(function ($key) {
            return [
                'key' => $key,
                'label' => Str::title(str_replace('-', ' ', $key)),
            ];
        });

        return response()->json(['entities' => $entities]);
    }

    public function index(Request $request, string $entity)
    {
        $modelClass = $this->getModelClass($entity);
        if (!$modelClass) {
            return response()->json(['message' => 'Entity not found'], 404);
        }

        $query = $modelClass::where('tenant_id', $this->getTenantId($request));

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->query('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        $perPage = min((int) ($request->query('per_page', 25)), 100);
        $paginator = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($paginator);
    }

    public function store(Request $request, string $entity)
    {
        $modelClass = $this->getModelClass($entity);
        if (!$modelClass) {
            return response()->json(['message' => 'Entity not found'], 404);
        }

        $data = $request->all();
        $data['tenant_id'] = $this->getTenantId($request);

        $item = $modelClass::create($data);
        return response()->json($item, 201);
    }

    public function show(Request $request, string $entity, string $id)
    {
        $modelClass = $this->getModelClass($entity);
        if (!$modelClass) {
            return response()->json(['message' => 'Entity not found'], 404);
        }

        $item = $modelClass::where('tenant_id', $this->getTenantId($request))->findOrFail($id);
        return response()->json($item);
    }

    public function update(Request $request, string $entity, string $id)
    {
        $modelClass = $this->getModelClass($entity);
        if (!$modelClass) {
            return response()->json(['message' => 'Entity not found'], 404);
        }

        $item = $modelClass::where('tenant_id', $this->getTenantId($request))->findOrFail($id);
        $item->update($request->all());
        return response()->json($item);
    }

    public function toggle(Request $request, string $entity, string $id)
    {
        $modelClass = $this->getModelClass($entity);
        if (!$modelClass) {
            return response()->json(['message' => 'Entity not found'], 404);
        }

        $item = $modelClass::where('tenant_id', $this->getTenantId($request))->findOrFail($id);

        if (isset($item->is_active)) {
            $item->update(['is_active' => !$item->is_active]);
        } elseif (isset($item->is_paid)) {
            $item->update(['is_paid' => !$item->is_paid]);
        }

        return response()->json($item);
    }

    public function destroy(Request $request, string $entity, string $id)
    {
        $modelClass = $this->getModelClass($entity);
        if (!$modelClass) {
            return response()->json(['message' => 'Entity not found'], 404);
        }

        $item = $modelClass::where('tenant_id', $this->getTenantId($request))->findOrFail($id);
        $item->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
