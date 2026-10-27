import React, { useState, useEffect } from 'react';
import {
  X,
  Package,
  Search,
  Clock,
  CheckCircle2,
  Truck,
  Flower2,
  QrCode,
  Calendar,
  Phone,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import type { Order, OrderResponse, User } from '../types';
import { formatCurrency, API_BASE_URL } from '../data/mockData';
import axios from 'axios';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onOpenQR: (orderRes: OrderResponse) => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenQR,
}) => {
  if (!isOpen) return null;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(currentUser?.email || currentUser?.phone || '');
  const [searched, setSearched] = useState(false);

  const fetchOrders = async (queryTerm?: string) => {
    setLoading(true);
    setSearched(true);
    try {
      const term = (queryTerm !== undefined ? queryTerm : searchTerm).trim();
      let url = `${API_BASE_URL}/api/orders`;
      if (term) {
        if (term.includes('@')) {
          url += `?email=${encodeURIComponent(term)}`;
        } else {
          url += `?phone=${encodeURIComponent(term)}`;
        }
      }
      const response = await axios.get<Order[]>(url);
      setOrders(response.data);
    } catch (err) {
      console.error('Lỗi khi tải lịch sử đơn hàng:', err);
      // Fallback empty
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.email || currentUser?.phone) {
      fetchOrders(currentUser.email || currentUser.phone);
    } else {
      fetchOrders('');
    }
  }, [currentUser]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Giao Thành Công
          </span>
        );
      case 'shipping':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
            <Truck className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
            Đang Giao Hàng
          </span>
        );
      case 'arranging':
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            <Flower2 className="w-3.5 h-3.5 text-blue-600" />
            Đang Cắm Hoa
          </span>
        );
      case 'pending_payment':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Chờ Thanh Toán
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl sm:text-2xl text-stone-900">
                Lịch Sử Đơn Hàng Của Tôi
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                Theo dõi tiến độ cắm hoa & hành trình giao hàng thời gian thực
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar inside Modal */}
        <div className="p-4 bg-stone-50 border-b border-stone-100">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Nhập email hoặc số điện thoại để tra cứu đơn hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-white text-sm rounded-xl border border-stone-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-hidden"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl transition-colors shrink-0 flex items-center gap-1.5"
            >
              <span>Tìm Kiếm</span>
            </button>
            <button
              type="button"
              onClick={() => fetchOrders()}
              className="p-2.5 text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 rounded-xl transition-colors"
              title="Làm mới"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </form>
        </div>

        {/* Orders List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="py-16 text-center text-stone-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-rose-500" />
              <p className="text-sm">Đang tải danh sách đơn hàng...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center text-stone-400">
              <Package className="w-16 h-16 mx-auto mb-3 text-stone-300 stroke-[1.5]" />
              <h4 className="text-base font-bold text-stone-700 mb-1">
                {searched ? 'Không tìm thấy đơn hàng nào phù hợp' : 'Chưa có đơn hàng nào'}
              </h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Hãy thử tìm kiếm với số điện thoại hoặc email bạn đã dùng khi đặt hàng hoa.
              </p>
            </div>
          ) : (
            orders.map((order) => {
              const orderId = order.id || '';
              const shortId = orderId.length > 8 ? orderId.slice(-8).toUpperCase() : orderId.toUpperCase();
              const isUnpaid = order.status === 'pending_payment';

              return (
                <div
                  key={orderId}
                  className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs hover:shadow-md transition-shadow space-y-3"
                >
                  {/* Top: ID & Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-rose-600 text-sm">
                        #{shortId}
                      </span>
                      {order.created_at && (
                        <span className="text-xs text-stone-400">
                          • {new Date(order.created_at).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  {/* Recipient & Delivery */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-600 bg-stone-50 p-3 rounded-xl">
                    <div className="space-y-1">
                      <p className="font-semibold text-stone-800 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-stone-400" />
                        Người nhận: {order.recipient_name} ({order.recipient_phone})
                      </p>
                      <p className="flex items-center gap-1.5 text-stone-500">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="truncate">{order.delivery_address}</span>
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        Ngày giao: <strong>{order.delivery_date}</strong>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        Khung giờ: {order.delivery_time_slot}
                      </p>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="space-y-1.5 pt-1">
                    {order.items && order.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="font-medium text-stone-800">
                          🌸 {it.name} <span className="text-stone-400">(x{it.quantity})</span>
                        </span>
                        <span className="font-bold text-stone-700">
                          {formatCurrency(it.price * it.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer: Total & Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100">
                    <div>
                      <span className="text-xs text-stone-500">Tổng thanh toán: </span>
                      <strong className="text-lg font-black text-rose-600">
                        {formatCurrency(order.total_amount)}
                      </strong>
                    </div>

                    {isUnpaid && order.payment_qr_url && (
                      <button
                        onClick={() =>
                          onOpenQR({
                            order_id: order.id,
                            payment_qr_url: order.payment_qr_url || '',
                            transfer_memo: order.transfer_memo || `HOA_${order.id.slice(-6).toUpperCase()}`,
                            total_amount: order.total_amount,
                            message: 'Mở lại thông tin thanh toán VietQR',
                          })
                        }
                        className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Mở Mã VietQR</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
