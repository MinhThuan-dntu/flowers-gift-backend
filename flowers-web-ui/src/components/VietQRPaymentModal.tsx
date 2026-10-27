import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
} from 'lucide-react';
import type { OrderResponse } from '../types';
import { formatCurrency } from '../data/mockData';

interface VietQRPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderResult: OrderResponse | null;
  onViewMyOrders?: () => void;
}

export const VietQRPaymentModal: React.FC<VietQRPaymentModalProps> = ({
  isOpen,
  onClose,
  orderResult,
  onViewMyOrders,
}) => {
  if (!isOpen || !orderResult) return null;

  const [copiedMemo, setCopiedMemo] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);

  const bankAccount = '0901234567';
  const bankName = 'MB Bank (Quân Đội)';
  const accountHolder = 'POTICO GARDEN VIETNAM';

  const handleCopyMemo = () => {
    navigator.clipboard.writeText(orderResult.transfer_memo);
    setCopiedMemo(true);
    setTimeout(() => setCopiedMemo(false), 2500);
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(bankAccount);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2500);
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(orderResult.total_amount.toString());
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header: Must include 'Khởi Tạo Đơn Hàng Thành Công' for E2E */}
        <div className="p-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl sm:text-2xl text-white">
                Khởi Tạo Đơn Hàng Thành Công!
              </h3>
              <p className="text-xs text-emerald-100 font-medium mt-0.5">
                Mã đơn: <strong>#{orderResult.order_id.slice(-8).toUpperCase()}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* VietQR Dynamic Code Image: Must have alt containing 'VietQR' for E2E selector: img[alt*='VietQR'] */}
          <div className="flex flex-col items-center justify-center p-5 bg-rose-50/50 rounded-2xl border border-rose-100/80">
            <div className="bg-white p-3 rounded-2xl shadow-lg border border-stone-200 mb-3">
              <img
                src={orderResult.payment_qr_url}
                alt="Mã thanh toán VietQR chuyển khoản nhanh"
                className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-xl"
              />
            </div>
            <p className="text-xs text-stone-500 font-medium text-center">
              Mở app ngân hàng bất kỳ (Vietcombank, MB, Techcombank, MoMo...) và quét mã QR trên
            </p>
          </div>

          {/* Transfer Info Details */}
          <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200/70 text-sm">
            <div className="flex items-center justify-between py-1 border-b border-stone-200/60">
              <span className="text-stone-500 font-medium">Ngân hàng:</span>
              <span className="font-bold text-stone-800">{bankName}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-stone-200/60">
              <span className="text-stone-500 font-medium">Chủ tài khoản:</span>
              <span className="font-bold text-stone-800">{accountHolder}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-stone-200/60">
              <span className="text-stone-500 font-medium">Số tài khoản:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-stone-800 text-base">{bankAccount}</span>
                <button
                  type="button"
                  onClick={handleCopyAccount}
                  className="p-1 hover:bg-stone-200 rounded text-stone-500 hover:text-stone-800 transition-colors"
                  title="Sao chép số tài khoản"
                >
                  {copiedAccount ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-stone-200/60">
              <span className="text-stone-500 font-medium">Số tiền chuyển:</span>
              <div className="flex items-center gap-2">
                <span className="font-black text-rose-600 text-lg">
                  {formatCurrency(orderResult.total_amount)}
                </span>
                <button
                  type="button"
                  onClick={handleCopyAmount}
                  className="p-1 hover:bg-stone-200 rounded text-stone-500 hover:text-stone-800 transition-colors"
                  title="Sao chép số tiền"
                >
                  {copiedAmount ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-stone-500 font-medium">Nội dung chuyển khoản:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-rose-700 bg-rose-100/70 px-2.5 py-0.5 rounded-lg text-sm">
                  {orderResult.transfer_memo}
                </span>
                <button
                  type="button"
                  onClick={handleCopyMemo}
                  className="p-1 hover:bg-stone-200 rounded text-stone-500 hover:text-stone-800 transition-colors"
                  title="Sao chép nội dung chuyển khoản"
                >
                  {copiedMemo ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Notice */}
          <div className="flex items-start gap-2.5 text-xs text-stone-500 bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Hệ thống sẽ tự động xác nhận sau 1-2 phút kể từ khi chuyển khoản. Florist của Potico Garden sẽ bắt đầu cắm hoa tươi và gửi ảnh xác nhận cho bạn qua Zalo/Email.
            </span>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={onClose}
              className="py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-sm rounded-xl transition-colors"
            >
              Để Sau
            </button>

            {onViewMyOrders ? (
              <button
                onClick={() => {
                  onClose();
                  onViewMyOrders();
                }}
                className="py-3 px-4 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-sm rounded-xl shadow-md transition-all text-center"
              >
                Xem Đơn Hàng Của Tôi
              </button>
            ) : (
              <button
                onClick={onClose}
                className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all text-center"
              >
                Tôi Đã Chuyển Khoản Xong
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
