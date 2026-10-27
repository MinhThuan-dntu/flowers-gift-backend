import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  MessageSquare,
  Loader2,
  Sparkles,
  MapPin,
  User as UserIcon,
} from 'lucide-react';
import type { Product, CartItem, OrderCreateRequest, User, Addon } from '../types';
import { formatCurrency, DEFAULT_ADDONS, TIME_SLOTS } from '../data/mockData';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Either a direct single product or cart items
  singleProduct: Product | null;
  singleQuantity?: number;
  initialAddons?: Addon[];
  initialVariant?: 'standard' | 'premium';
  initialDeliveryDate?: string;
  initialDeliveryTimeSlot?: string;
  cartItems?: CartItem[];
  currentUser: User | null;
  onSubmitOrder: (orderData: OrderCreateRequest) => Promise<void>;
  isSubmitting: boolean;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  singleProduct,
  singleQuantity = 1,
  initialAddons = [],
  initialVariant = 'standard',
  initialDeliveryDate = '',
  initialDeliveryTimeSlot = '',
  cartItems = [],
  currentUser,
  onSubmitOrder,
  isSubmitting,
}) => {
  if (!isOpen) return null;

  // Selected addons for single product order mode
  const [selectedAddons, setSelectedAddons] = useState<string[]>(() => {
    if (initialAddons && initialAddons.length > 0) {
      return initialAddons.map((a) => a.name);
    }
    return [DEFAULT_ADDONS[0].name];
  });

  // Form State
  const [recipientName, setRecipientName] = useState(currentUser?.name || '');
  const [recipientPhone, setRecipientPhone] = useState(currentUser?.phone || '');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(() => {
    if (initialDeliveryDate) return initialDeliveryDate;
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState(() => {
    if (initialDeliveryTimeSlot) {
      if (initialDeliveryTimeSlot === 'express' || initialDeliveryTimeSlot.includes('90 Phút')) {
        return 'Giao Nhanh 90 Phút (+30.000đ)';
      }
      return initialDeliveryTimeSlot;
    }
    return TIME_SLOTS[1];
  });
  const [cardMessage, setCardMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [userEmail, setUserEmail] = useState(currentUser?.email || '');

  // Sync when modal opens or initial props change
  useEffect(() => {
    if (isOpen) {
      if (initialAddons && initialAddons.length > 0) {
        setSelectedAddons(initialAddons.map((a) => a.name));
      } else {
        setSelectedAddons([DEFAULT_ADDONS[0].name]);
      }

      if (initialDeliveryDate) {
        setDeliveryDate(initialDeliveryDate);
      }

      if (initialDeliveryTimeSlot) {
        if (initialDeliveryTimeSlot === 'express' || initialDeliveryTimeSlot.includes('90 Phút')) {
          setDeliveryTimeSlot('Giao Nhanh 90 Phút (+30.000đ)');
        } else {
          setDeliveryTimeSlot(initialDeliveryTimeSlot);
        }
      }
    }
  }, [isOpen, initialAddons, initialDeliveryDate, initialDeliveryTimeSlot]);

  // Update recipient if currentUser changes
  useEffect(() => {
    if (currentUser) {
      if (!recipientName) setRecipientName(currentUser.name);
      if (!recipientPhone && currentUser.phone) setRecipientPhone(currentUser.phone);
      if (!userEmail) setUserEmail(currentUser.email);
    }
  }, [currentUser]);

  // Calculate items and total
  const isDirectOrder = !!singleProduct;

  const availableAddons = React.useMemo(() => {
    const list: Addon[] = [];
    const seen = new Set<string>();

    if (initialAddons && initialAddons.length > 0) {
      initialAddons.forEach((a) => {
        if (!seen.has(a.name)) {
          seen.add(a.name);
          list.push(a);
        }
      });
    }

    if (singleProduct?.addons && singleProduct.addons.length > 0) {
      singleProduct.addons.forEach((a) => {
        if (!seen.has(a.name)) {
          seen.add(a.name);
          list.push(a);
        }
      });
    }

    DEFAULT_ADDONS.forEach((a) => {
      if (!seen.has(a.name)) {
        seen.add(a.name);
        list.push(a);
      }
    });

    return list;
  }, [singleProduct, initialAddons]);

  const toggleSingleAddon = (addonName: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addonName)
        ? prev.filter((n) => n !== addonName)
        : [...prev, addonName]
    );
  };

  // Compute Total
  let totalAmount = 0;
  const variantSurcharge = initialVariant === 'premium' ? 150000 : 0;
  const isExpressSlot = deliveryTimeSlot === 'express' || deliveryTimeSlot.includes('90 Phút');
  const shippingFee = isExpressSlot ? 30000 : 0;

  if (isDirectOrder && singleProduct) {
    const addonsCost = availableAddons
      .filter((a) => selectedAddons.includes(a.name))
      .reduce((sum, a) => sum + a.price, 0);
    totalAmount = ((singleProduct.price + variantSurcharge) * singleQuantity) + addonsCost + shippingFee;
  } else {
    totalAmount = cartItems.reduce((sum, item) => {
      const aCost = item.selectedAddons.reduce((s, a) => s + a.price, 0);
      return sum + (item.product.price + aCost) * item.quantity;
    }, 0);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let itemsPayload = [];
    if (isDirectOrder && singleProduct) {
      itemsPayload = [
        {
          product_id: singleProduct.id,
          name: initialVariant === 'premium' ? `${singleProduct.name} (Cao Cấp)` : singleProduct.name,
          price: singleProduct.price + variantSurcharge,
          quantity: singleQuantity,
          addons: selectedAddons,
        },
      ];
    } else {
      itemsPayload = cartItems.map((ci) => ({
        product_id: ci.product.id,
        name: ci.product.name,
        price: ci.product.price,
        quantity: ci.quantity,
        addons: ci.selectedAddons.map((a) => a.name),
      }));
    }

    const orderData: OrderCreateRequest = {
      recipient_name: recipientName,
      recipient_phone: recipientPhone,
      delivery_address: deliveryAddress,
      delivery_date: deliveryDate,
      delivery_time_slot: deliveryTimeSlot,
      card_message: cardMessage,
      is_anonymous: isAnonymous,
      items: itemsPayload,
      total_amount: totalAmount,
      user_email: userEmail || currentUser?.email || '',
    };

    await onSubmitOrder(orderData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header: Must include 'Tùy Biến Quà Tặng' for E2E selector: //h3[contains(., 'Tùy Biến Quà Tặng')] */}
        <div className="px-6 py-4.5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div>
            <h3 className="font-display font-bold text-xl sm:text-2xl text-stone-900">
              Tùy Biến Quà Tặng & Đặt Hàng
            </h3>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              Hoàn tất thông tin nhận hoa & thanh toán an toàn qua VietQR
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Order Items Preview */}
          <div className="bg-rose-50/50 rounded-2xl p-4 border border-rose-100/70">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-rose-500" />
              Sản phẩm bạn đang đặt
            </h4>

            {isDirectOrder && singleProduct ? (
              <div className="flex items-center gap-3">
                <img
                  src={singleProduct.images[0] || 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=150&q=80'}
                  alt={singleProduct.name}
                  className="w-14 h-14 object-cover rounded-xl border border-stone-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h5 className="font-bold text-stone-800 text-sm truncate">{singleProduct.name}</h5>
                  <p className="text-xs text-stone-500">Số lượng: <strong>{singleQuantity}</strong> bó</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-rose-600 text-base">
                    {formatCurrency(singleProduct.price * singleQuantity)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {cartItems.map((ci) => (
                  <div key={ci.id} className="flex items-center justify-between text-sm py-1 border-b border-rose-100/50 last:border-0">
                    <span className="truncate max-w-[240px] font-medium text-stone-800">
                      {ci.product.name} (x{ci.quantity})
                    </span>
                    <span className="font-bold text-rose-600">
                      {formatCurrency(ci.product.price * ci.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add-ons Section for Direct Order (Contains //div[contains(@class, 'cursor-pointer') and .//input[@type='checkbox']] for E2E!) */}
          {isDirectOrder && availableAddons.length > 0 && (
            <div>
              <label className="block text-sm font-bold text-stone-800 mb-2">
                Tùy Chọn Phụ Kiện Kèm Theo:
              </label>
              <div className="space-y-2">
                {availableAddons.map((addon, idx) => {
                  const isChecked = selectedAddons.includes(addon.name);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleSingleAddon(addon.name)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between select-none ${
                        isChecked
                          ? 'border-rose-400 bg-rose-50/70 text-rose-900 shadow-xs'
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
          )}

          {/* Message Card Textarea (E2E looks for CSS_SELECTOR "textarea") */}
          <div>
            <label className="block text-sm font-bold text-stone-800 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-rose-500" />
                Nội dung thiệp chúc mừng viết tay (Miễn phí)
              </span>
              <span className="text-xs font-normal text-stone-400">Tối đa 250 ký tự</span>
            </label>
            <textarea
              rows={3}
              value={cardMessage}
              onChange={(e) => setCardMessage(e.target.value)}
              placeholder="VD: Chúc mừng sinh nhật bạn thân! Chúc bạn luôn rạng rỡ và hạnh phúc..."
              className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-hidden transition-all"
            />
          </div>

          {/* Recipient Information Form */}
          <div className="space-y-4 pt-2 border-t border-stone-100">
            <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-rose-500" />
              Thông Tin Người Nhận Hoa
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Recipient Name: E2E looks for input[placeholder*='người nhận *'] */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Họ và tên người nhận *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nhập họ tên người nhận *"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-hidden"
                />
              </div>

              {/* Recipient Phone: E2E looks for input[type='tel'] */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Số điện thoại người nhận *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="VD: 0908123456 *"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-hidden"
                />
              </div>
            </div>

            {/* Delivery Address: E2E looks for input[placeholder*='Địa chỉ giao hoa'] */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                Địa chỉ giao hoa chính xác *
              </label>
              <input
                type="text"
                required
                placeholder="Địa chỉ giao hoa (Số nhà, tên đường, phường/xã, quận/huyện) *"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-hidden"
              />
            </div>

            {/* Email for tracking */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Email người đặt (Để tra cứu đơn hàng & nhận thông báo)
              </label>
              <input
                type="email"
                placeholder="VD: yourname@gmail.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-hidden"
              />
            </div>

            {/* Delivery Date & Time Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  Ngày giao hoa *
                </label>
                <input
                  type="date"
                  required
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  Khung giờ giao hoa *
                </label>
                <select
                  value={deliveryTimeSlot}
                  onChange={(e) => setDeliveryTimeSlot(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-hidden"
                >
                  {[
                    'Giao Nhanh 90 Phút (+30.000đ)',
                    '14h - 16h',
                    '15h - 17h',
                    '16h - 18h',
                    '17h - 19h',
                    '18h - 20h',
                    '19h - 21h',
                    '08:00 - 10:00 (Buổi sáng tươi mát)',
                    '10:00 - 12:00 (Giao trưa đúng hẹn)',
                    '13:30 - 15:30 (Đầu giờ chiều)',
                    '15:30 - 17:30 (Cuối giờ chiều)',
                    '18:00 - 20:30 (Bữa tối lãng mạn)',
                  ].map((slot, sIdx) => (
                    <option key={sIdx} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Anonymous delivery option */}
            <label className="flex items-center gap-2.5 text-xs text-stone-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded-sm border-stone-300 focus:ring-rose-500"
              />
              <span>Giao hoa ẩn danh (Người nhận sẽ không biết thông tin người gửi nếu bạn muốn tạo bất ngờ)</span>
            </label>
          </div>

          {/* Total & Submit Button: Keeps exact button text 'Tiến Hành Thanh Toán' for E2E! */}
          <div className="pt-4 border-t border-stone-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-stone-600">Tổng tiền thanh toán:</span>
              <span className="text-2xl font-black text-rose-600">
                {formatCurrency(totalAmount)}
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-base rounded-2xl shadow-lg shadow-rose-200 hover:shadow-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2 active:scale-98"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang khởi tạo đơn & sinh mã VietQR...</span>
                </>
              ) : (
                <span>Tiến Hành Thanh Toán</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
