"use client";

import { useState } from "react";
import ProductImage from "../ui/ProductImage";
import { Prisma } from "@prisma/client";
import { ShoppingCart, Check, Star, AlertCircle } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";

type ProductWithUnits = Prisma.ProductGetPayload<{
  include: { units: true; category: true }
}>;

export default function ProductClient({ product }: { product: ProductWithUnits }) {
  const addItem = useCartStore((state) => state.addItem);
  
  // Sort units by unitRate so the smallest unit (piece) is first
  const sortedUnits = [...product.units].sort((a, b) => a.unitRate - b.unitRate);
  
  const [selectedUnitId, setSelectedUnitId] = useState(
    sortedUnits.find(u => u.isDefaultUnit)?.id || sortedUnits[0]?.id
  );

  const [quantity, setQuantity] = useState(1);

  const selectedUnit = sortedUnits.find(u => u.id === selectedUnitId) || sortedUnits[0];
  const pieceUnit = sortedUnits[0]; // Assuming first is piece (rate=1)

  // Calculate savings percentage
  const calcSavingsPercent = (piece: typeof pieceUnit, bulk: typeof selectedUnit) => {
    if (!piece || !bulk || piece.id === bulk.id) return 0;
    const piecePriceInBulk = piece.price * bulk.unitRate;
    const saved = piecePriceInBulk - bulk.price;
    return saved > 0 ? Math.round((saved / piecePriceInBulk) * 100) : 0;
  };

  const savings = calcSavingsPercent(pieceUnit, selectedUnit);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      unitId: selectedUnit.id,
      nameAr: product.nameAr,
      matCode: product.matCode,
      unitName: selectedUnit.unitName,
      unitRate: selectedUnit.unitRate,
      price: selectedUnit.price,
      imageUrl: product.mainImageUrl || `/images/products/${product.matCode}.jpg`,
      quantity,
    });
    alert('تم إضافة المنتج إلى السلة بنجاح!');
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Breadcrumb */}
      <div className="text-sm text-shopay-black/50 mb-6 flex items-center gap-2">
        <span>الرئيسية</span>
        <span>/</span>
        <span>{product.category?.nameAr}</span>
        <span>/</span>
        <span className="text-shopay-black truncate">{product.nameAr}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Product Image */}
        <div className="bg-shopay-gray-light rounded-2xl aspect-square relative overflow-hidden border border-shopay-black/5 flex-shrink-0">
          <ProductImage
            matCode={product.matCode}
            databaseImageUrl={product.mainImageUrl}
            alt={product.nameAr}
            fill
            className="object-cover"
          />
        </div>

        {/* Product Details */}
        <div className="flex flex-col">
          <div className="mb-2 text-shopay-black/50 text-sm">
            رمز المادة: {product.matCode}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-shopay-black mb-4 leading-tight">
            {product.nameAr}
          </h1>

          {/* Dummy Reviews */}
          <div className="flex items-center gap-1 text-yellow-400 mb-6">
            <Star className="w-5 h-5 fill-current" />
            <Star className="w-5 h-5 fill-current" />
            <Star className="w-5 h-5 fill-current" />
            <Star className="w-5 h-5 fill-current" />
            <Star className="w-5 h-5 fill-current text-shopay-gray-light" />
            <span className="text-shopay-black/50 text-sm mr-2">(12 تقييم)</span>
          </div>

          <div className="text-4xl font-bold text-shopay-purple mb-6">
            ${selectedUnit.price.toFixed(2)}
            <span className="text-base font-normal text-shopay-black/50 ml-2">
              لكل {selectedUnit.unitName}
            </span>
          </div>

          {/* Unit Selector */}
          <div className="mb-8">
            <h3 className="font-semibold text-shopay-black mb-3">اختر خيار التعبئة:</h3>
            <div className="flex flex-col gap-3">
              {sortedUnits.map(unit => {
                const isSelected = selectedUnitId === unit.id;
                const unitSavings = calcSavingsPercent(pieceUnit, unit);
                
                return (
                  <label 
                    key={unit.id}
                    className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                      isSelected ? 'border-shopay-purple bg-shopay-purple/5 ring-1 ring-shopay-purple' : 'border-shopay-gray-light hover:border-shopay-purple/50'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="unit" 
                      className="sr-only" 
                      checked={isSelected}
                      onChange={() => setSelectedUnitId(unit.id)}
                    />
                    
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-3 ${
                      isSelected ? 'border-shopay-purple bg-shopay-purple' : 'border-shopay-black/20'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-shopay-white" />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="font-semibold text-shopay-black">
                        {unit.unitName} <span className="text-shopay-black/50 text-sm font-normal">({unit.unitRate} قطع)</span>
                      </div>
                      <div className="text-sm text-shopay-black/60">
                        الباركود: {unit.barcode10}
                      </div>
                    </div>
                    
                    <div className="text-left flex flex-col items-end">
                      <div className="font-bold text-shopay-purple text-lg">
                        ${unit.price.toFixed(2)}
                      </div>
                      {unitSavings > 0 && (
                        <div className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded font-bold">
                          وفّر {unitSavings}%
                        </div>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Add to Cart */}
          <div className="flex items-center gap-4 mt-auto">
            <div className="flex items-center border border-shopay-gray-light rounded-full h-12 w-32 shrink-0">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-full flex items-center justify-center text-shopay-black hover:text-shopay-purple"
              >
                -
              </button>
              <div className="flex-1 text-center font-bold">{quantity}</div>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-full flex items-center justify-center text-shopay-black hover:text-shopay-purple"
              >
                +
              </button>
            </div>
            
            <button 
              onClick={handleAddToCart}
              className="flex-1 bg-shopay-gradient text-shopay-white h-12 rounded-full font-bold shadow-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              أضف للسلة
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-shopay-gray-light/50">
            <div className="flex items-center gap-2 text-sm text-shopay-black/70">
              <Check className="w-4 h-4 text-shopay-purple" />
              منتج أصلي 100%
            </div>
            <div className="flex items-center gap-2 text-sm text-shopay-black/70">
              <AlertCircle className="w-4 h-4 text-shopay-purple" />
              إمكانية الإرجاع
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
