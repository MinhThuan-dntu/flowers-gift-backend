import React, { useState } from 'react';
import {
  X,
  Truck,
  ShieldCheck,
  Clock,
  Minus,
  Plus,
  ShoppingCart,
} from 'lucide-react';
import type { Product, Addon } from '../types';
import { formatCurrency, DEFAULT_ADDONS } from '../data/mockData';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, addons: Addon[]) => void;
  onBuyNow: (product: Product, quantity: number, addons: Addon[]) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onBuyNow,
}) => {
  if (!isOpen || !product) return null;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedAddonNames, setSelectedAddonNames] = useState<string[]>([
    DEFAULT_ADDONS[0].name, // Free handwritten card selected by default
  ]);

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80'];

  const availableAddons = product.addons && product.addons.length > 0
    ? product.addons
    : DEFAULT_ADDONS;

  const toggleAddon = (addonName: string) => {
    setSelectedAddonNames((prev) =>
      prev.includes(addonName)
        ? prev.filter((name) => name !== addonName)
        : [...prev, addonName]
    );
  };

  const getChosenAddons = (): Addon[] => {
    return availableAddons.filter((a) => selectedAddonNames.includes(a.name));
  };

  const addonsTotal = getChosenAddons().reduce((sum, a) => sum + a.price, 0);
  const totalItemPrice = (product.price * quantity) + (addonsTotal * quantity);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-stone-100 overflow-hidden my-auto max-h-[92vh] flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/90 hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Images Gallery */}
        <div className="md:w-1/2 p-6 bg-stone-50/70 flex flex-col justify-between border-b md:border-b-0 md:border-r border-stone-100">
          <div>
            {/* Main Image */}
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white shadow-md border border-stone-200/60 mb-4">
              <img
                src={images[selectedImageIndex] || images[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-300 hover:scale-105"
              />
              {product.is_same_day && (
                <div className="absolute top-3 left-3 bg-emerald-600/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-xs flex items-center gap-1.5 shadow-sm">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Giao hỏa tốc 2h</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      selectedImageIndex === idx
                        ? 'border-rose-500 ring-2 ring-rose-200'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quality Guarantees */}
          <div className="mt-4 pt-4 border-t border-stone-200/60 grid grid-cols-2 gap-2 text-xs text-stone-600">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white/80 border border-stone-200/50">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Cam kết tươi 3 ngày</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white/80 border border-stone-200/50">
              <Truck className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Freeship đơn từ 300k</span>
            </div>
          </div>
        </div>

        {/* Right Side: Product Details & Customization */}
        <div className="md:w-1/2 p-6 sm:p-7 overflow-y-auto flex-1 flex flex-col justify-between">
          <div>
            {/* Category & Vendor & Tag */}
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-2 flex-wrap">
              <span className="text-rose-600">{product.category || 'Hoa Tươi Thiết Kế'}</span>
              <span className="text-stone-300">•</span>
              <span className="text-stone-400">{product.vendor_name || 'Potico Garden'}</span>
              {product.tag && (() => {
                const badge = product.tag.includes('Gấu') ? { icon: '🧸', style: 'bg-amber-100 text-amber-800 border-amber-200' }
                  : product.tag.includes('Thỏ') ? { icon: '🐰', style: 'bg-pink-100 text-pink-800 border-pink-200' }
                  : product.tag.includes('Nến') ? { icon: '🕯️', style: 'bg-orange-100 text-orange-800 border-orange-200' }
                  : product.tag.includes('Sáp') ? { icon: '🌸', style: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200' }
                  : { icon: '✨', style: 'bg-rose-100 text-rose-800 border-rose-200' };
                return (
                  <span className={`${badge.style} border text-[11px] font-bold px-2.5 py-0.5 rounded-full ml-auto flex items-center gap-1 shadow-xs`}>
                    <span>{badge.icon}</span>
                    <span>{product.tag}</span>
                  </span>
                );
              })()}
            </div>

            {/* Product Title */}
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 leading-tight mb-3">
              {product.name}
            </h2>

            {/* Price section */}
            <div className="flex items-baseline gap-3 mb-4 p-3.5 bg-rose-50/60 rounded-2xl border border-rose-100">
              <span className="text-2xl sm:text-3xl font-black text-rose-600">
                {formatCurrency(product.price)}
              </span>
              {product.original_price > product.price && (
                <span className="text-base text-stone-400 line-through font-medium">
                  {formatCurrency(product.original_price)}
                </span>
              )}
              {product.original_price > product.price && (
                <span className="ml-auto bg-rose-500 text-white text-xs font-black px-2.5 py-1 rounded-full">
                  Tiết kiệm {Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                </span>
              )}
            </div>

            {/* Description */}
            <div className="text-sm text-stone-600 space-y-2 mb-5 leading-relaxed">
              <p>{product.description}</p>
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/60 text-xs space-y-1">
                <p><strong>🌸 Thành phần hoa:</strong> {product.composition || 'Hoa hồng tuyển chọn, Baby trắng nhập khẩu, Lá bạc thơm dịu nhẹ'}</p>
                <p><strong>📏 Kích thước bó:</strong> {product.size || 'Cao ~50cm, Đường kính tán ~35cm'}</p>
                <p><strong>💧 Hướng dẫn bảo quản:</strong> Cắm bình nước sạch, thay nước mỗi ngày, tránh ánh nắng trực tiếp</p>
              </div>
            </div>

            {/* Add-ons Selector */}
            <div className="mb-5">
              <label className="block text-sm font-bold text-stone-800 mb-2.5 flex items-center justify-between">
                <span>Chọn Quà Tặng Kèm (Tùy chọn)</span>
                <span className="text-xs font-normal text-stone-400">Đã chọn {selectedAddonNames.length} phụ kiện</span>
              </label>

              <div className="space-y-2">
                {availableAddons.map((addon, index) => {
                  const isChecked = selectedAddonNames.includes(addon.name);
                  return (
                    <div
                      key={index}
                      onClick={() => toggleAddon(addon.name)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between select-none ${
                        isChecked
                          ? 'border-rose-400 bg-rose-50/60 text-rose-900 shadow-xs'
                          : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 text-rose-600 rounded-sm border-stone-300 focus:ring-rose-500 pointer-events-none"
                        />
                        <span className="text-sm font-medium">{addon.name}</span>
                      </div>
                      <span className="text-xs font-bold text-rose-600 shrink-0">
                        {addon.price === 0 ? 'Miễn Phí' : `+${formatCurrency(addon.price)}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between py-3 border-t border-stone-100 mb-5">
              <span className="text-sm font-bold text-stone-800">Số lượng:</span>
              <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden bg-stone-50">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2.5 hover:bg-stone-200/70 text-stone-600 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-bold text-sm text-stone-800">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2.5 hover:bg-stone-200/70 text-stone-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-stone-100">
            <div className="flex items-center justify-between mb-3 text-sm">
              <span className="text-stone-500 font-medium">Tổng thanh toán:</span>
              <span className="text-2xl font-black text-rose-600">
                {formatCurrency(totalItemPrice)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  onAddToCart(product, quantity, getChosenAddons());
                  onClose();
                }}
                className="py-3.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-sm rounded-2xl border border-rose-200/80 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Thêm Vào Giỏ</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onBuyNow(product, quantity, getChosenAddons());
                  onClose();
                }}
                className="py-3.5 px-4 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-rose-200 transition-all active:scale-95 text-center"
              >
                Mua Ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
