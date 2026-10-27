import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Sparkles,
  Truck,
  Tag,
} from 'lucide-react';
import type { CartItem } from '../types';
import { formatCurrency } from '../data/mockData';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) => {
  if (!isOpen) return null;

  const [voucherCode, setVoucherCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [voucherError, setVoucherError] = useState<string | null>(null);

  // Tính tổng phụ tính
  const subtotal = items.reduce((sum, item) => {
    const addonsSum = item.selectedAddons.reduce((aSum, a) => aSum + a.price, 0);
    return sum + (item.product.price + addonsSum) * item.quantity;
  }, 0);

  const discountAmount = Math.round(subtotal * appliedDiscount);
  const finalTotal = Math.max(0, subtotal - discountAmount);
  const freeShippingThreshold = 300000;
  const progressToFreeShip = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    setVoucherError(null);
    const code = voucherCode.trim().toUpperCase();
    if (code === 'POTICO2026' || code === 'HOATUOI10') {
      setAppliedDiscount(0.1); // 10% discount
    } else if (code === 'FREESHIP') {
      setAppliedDiscount(0.05); // 5% discount
    } else {
      setVoucherError('Mã ưu đãi không hợp lệ hoặc đã hết lượt.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-stone-800 text-lg">Giỏ Hàng Của Bạn</h3>
                <p className="text-xs text-stone-500 font-medium">{items.length} mặt hàng đã chọn</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="bg-rose-50/70 px-5 py-3 border-b border-rose-100/60">
            <div className="flex items-center justify-between text-xs font-semibold text-rose-900 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-rose-600" />
                {subtotal >= freeShippingThreshold ? (
                  <strong className="text-emerald-700">Đơn hàng của bạn đủ điều kiện FREESHIP!</strong>
                ) : (
                  <span>
                    Mua thêm <strong>{formatCurrency(freeShippingThreshold - subtotal)}</strong> để được <strong>FREESHIP</strong>
                  </span>
                )}
              </span>
              <span>{progressToFreeShip}%</span>
            </div>
            <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  subtotal >= freeShippingThreshold ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
                style={{ width: `${progressToFreeShip}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-stone-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
                <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-300 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h4 className="text-lg font-bold text-stone-700 mb-1">Giỏ hàng đang trống</h4>
                <p className="text-sm text-stone-500 max-w-xs mb-6">
                  Hãy dạo quanh bộ sưu tập hoa tươi tuyệt đẹp và thêm sản phẩm yêu thích nhé!
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-md shadow-rose-200 transition-all"
                >
                  Khám Phá Hoa Tươi Ngay
                </button>
              </div>
            ) : (
              items.map((item) => {
                const addonsPrice = item.selectedAddons.reduce((s, a) => s + a.price, 0);
                const itemTotalPrice = (item.product.price + addonsPrice) * item.quantity;

                return (
                  <div key={item.id} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                    {/* Item Image */}
                    <img
                      src={item.product.images[0] || 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=200&q=80'}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-2xl bg-stone-100 border border-stone-200/60 shrink-0"
                    />

                    {/* Item Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-stone-800 text-sm truncate leading-snug">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="text-stone-400 hover:text-red-500 p-1 rounded-md transition-colors"
                            title="Xóa sản phẩm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Addons List */}
                        {item.selectedAddons.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {item.selectedAddons.map((addon, aIdx) => (
                              <span
                                key={aIdx}
                                className="text-[11px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md font-medium"
                              >
                                + {addon.name} ({addon.price === 0 ? 'Free' : formatCurrency(addon.price)})
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Quantity & Price */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-stone-50">
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-stone-200 text-stone-600 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-stone-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-stone-200 text-stone-600 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="font-bold text-rose-600 text-sm">
                          {formatCurrency(itemTotalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout button */}
          {items.length > 0 && (
            <div className="p-5 border-t border-stone-100 bg-stone-50/50 space-y-4">
              {/* Voucher Code Form */}
              <form onSubmit={handleApplyVoucher} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Nhập mã ưu đãi (VD: POTICO2026)"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-white text-xs uppercase font-medium rounded-xl border border-stone-200 focus:border-rose-400 focus:ring-1 focus:ring-rose-200 outline-hidden"
                  />
                  <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-stone-800 hover:bg-stone-900 text-white font-semibold text-xs rounded-xl transition-colors shrink-0"
                >
                  Áp Dụng
                </button>
              </form>

              {appliedDiscount > 0 && (
                <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Đã áp dụng mã giảm giá 10% thành công!
                </p>
              )}
              {voucherError && (
                <p className="text-xs text-red-500 font-medium">{voucherError}</p>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Tạm tính ({items.length} món):</span>
                  <span className="font-semibold text-stone-800">{formatCurrency(subtotal)}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Mã giảm giá (10%):</span>
                    <span className="font-semibold">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Phí vận chuyển:</span>
                  <span className="font-semibold text-emerald-600">
                    {subtotal >= freeShippingThreshold ? 'Miễn phí (Freeship)' : '30.000đ'}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-stone-900 pt-2 border-t border-stone-200">
                  <span>Tổng tiền thanh toán:</span>
                  <span className="text-xl font-black text-rose-600">
                    {formatCurrency(finalTotal + (subtotal >= freeShippingThreshold ? 0 : 30000))}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  onClose();
                  onCheckout();
                }}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-rose-200 hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <span>Tiến Hành Đặt Hàng</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
