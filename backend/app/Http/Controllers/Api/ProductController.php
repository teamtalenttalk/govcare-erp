<?php
namespace App\Http\Controllers\Api;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends BaseResourceController
{
    protected string $modelClass = Product::class;
    protected array $searchFields = ['sku', 'name', 'description', 'category'];
    protected array $with = ['stockMovements'];
    protected string $resourceKey = 'products';

    public function store(Request $request)
    {
        $data = $request->validate([
            'sku' => 'required|string',
            'name' => 'required|string',
            'description' => 'nullable|string',
            'product_type' => 'nullable|string',
            'category' => 'nullable|string',
            'unit' => 'nullable|string',
            'cost_price' => 'nullable|numeric',
            'selling_price' => 'nullable|numeric',
            'quantity_on_hand' => 'nullable|integer',
            'reorder_point' => 'nullable|integer',
            'reorder_quantity' => 'nullable|integer',
            'warehouse' => 'nullable|string',
            'location' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);
        $data['tenant_id'] = $this->getTenantId($request);
        return response()->json(Product::create($data), 201);
    }

    public function update(Request $request, string $id)
    {
        $item = $this->baseQuery($request)->findOrFail($id);
        $item->update($request->only($item->getFillable()));
        return response()->json($item->load('stockMovements'));
    }
}
