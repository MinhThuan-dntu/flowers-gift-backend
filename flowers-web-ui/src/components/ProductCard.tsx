import React from 'react';
import { ShoppingCart, Clock } from 'lucide-react';
import type { Product } from '../types';
import { formatCurrency } from '../data/mockData';

interface ProductCardProps {
  product: Product;
  onViewDetail: (product: Product) => void;
  onQuickOrder: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetail,
  onQuickOrder,
  onAddToCart,
}) => {
  const discountPercent =
    product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : 0;

  return (
    <div className="group bg-white rounded-2xl border border-stone-200/80 hover:border-stone-300 hover:shadow-lg transition-all duration-300 flex flex-col p-3 relative h-full">
      {/* Product Image */}
      <div
        onClick={() => onViewDetail(product)}
        className="relative w-full aspect-square rounded-xl overflow-hidden bg-stone-100 cursor-pointer"
      >
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Subtle Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start pointer-events-none">
          {product.is_same_day && (
            <span className="bg-emerald-600/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs backdrop-blur-xs">
              <Clock className="w-2.5 h-2.5" />
              <span>2H</span>
            </span>
          )}
        </div>

        {discountPercent > 0 && (
          <span className="absolute top-2 right-2 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-xs pointer-events-none">
            -{discountPercent}%
          </span>
        )}
      </div>

      {/* Product Information */}
      <div className="flex-1 flex flex-col justify-between pt-2.5">
        <div>
          {/* Title */}
          <h3
            onClick={() => onViewDetail(product)}
            className="text-sm font-medium text-stone-800 hover:text-rose-600 transition-colors line-clamp-2 cursor-pointer leading-snug min-h-[2.5rem]"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Pricing */}
          <div className="flex items-baseline gap-2 mt-1 mb-2.5">
            <span className="text-sm sm:text-base font-bold text-stone-900">
              {formatCurrency(product.price)}
            </span>
            {product.original_price > product.price && (
              <span className="text-xs text-stone-400 line-through">
                {formatCurrency(product.original_price)}
              </span>
            )}
          </div>
        </div>

        {/* Clean Action Buttons (Compatible with E2E tests & Cart) */}
        <div className="mt-auto pt-1 flex items-center gap-1.5">
          <button
            onClick={() => onQuickOrder(product)}
            className="flex-1 py-1.5 px-2 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200/90 hover:border-rose-600 text-xs font-semibold rounded-lg transition-colors text-center truncate active:scale-95 shadow-2xs"
          >
            Đặt Hàng Ngay
          </button>
          <button
            onClick={() => onAddToCart(product)}
            className="p-1.5 bg-stone-50 hover:bg-rose-50 text-stone-600 hover:text-rose-600 border border-stone-200 hover:border-rose-300 rounded-lg transition-colors shrink-0 active:scale-95"
            title="Thêm vào giỏ"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
