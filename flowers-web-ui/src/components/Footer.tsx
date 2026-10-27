import React, { useState } from 'react';
import {
  Flower2,
  Phone,
  Mail,
  MapPin,
  Truck,
  RotateCcw,
  QrCode,
  Send,
  CheckCircle2,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      {/* Top Features Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-stone-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-stone-800/40 border border-stone-800">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
              <Flower2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Hoa Tươi Loại 1</h4>
              <p className="text-xs text-stone-400">Cam kết tươi lâu tối thiểu 3 ngày</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-stone-800/40 border border-stone-800">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Giao Nhanh 2 Giờ</h4>
              <p className="text-xs text-stone-400">Nội thành TP.HCM & Hà Nội đúng hẹn</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-stone-800/40 border border-stone-800">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">100% Đổi Mới</h4>
              <p className="text-xs text-stone-400">Nếu hoa dập héo hoặc không ưng ý</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-stone-800/40 border border-stone-800">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Thanh Toán VietQR</h4>
              <p className="text-xs text-stone-400">Quét mã tiện lợi, bảo mật tuyệt đối</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main 4 Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Cột 1: Thương hiệu & Địa chỉ */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center text-white">
                <Flower2 className="w-6 h-6" />
              </div>
              <span className="text-2xl font-display font-bold text-white">
                Potico Garden
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Dịch vụ điện hoa tươi & quà tặng trực tuyến hàng đầu, mang niềm vui và thông điệp yêu thương tới người thân trọn vẹn từng khoảnh khắc.
            </p>
            <div className="space-y-2.5 text-xs text-stone-400 pt-2">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>Showroom 1: 123 Nguyễn Huệ, P. Bến Nghé, Quận 1, TP.HCM</span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>Showroom 2: 45 Thái Hà, P. Trung Liệt, Q. Đống Đa, Hà Nội</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-rose-500 shrink-0" />
                <a
                  href="https://zalo.me/0987270812"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-white hover:text-rose-400 transition-colors"
                >
                  Zalo / Hotline: 0987 270 812 (24/7)
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Email: contact@poticogarden.vn</span>
              </div>
            </div>
          </div>

          {/* Cột 2: Chính sách dịch vụ */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Chính Sách & Cam Kết
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li className="hover:text-rose-400 transition-colors cursor-pointer">
                • Cam kết hoa tươi 3 ngày nguyên vẹn
              </li>
              <li className="hover:text-rose-400 transition-colors cursor-pointer">
                • Chính sách đổi trả & hoàn tiền 100%
              </li>
              <li className="hover:text-rose-400 transition-colors cursor-pointer">
                • Giao hàng hỏa tốc trong 2 giờ
              </li>
              <li className="hover:text-rose-400 transition-colors cursor-pointer">
                • Chụp ảnh sản phẩm thực tế trước khi giao
              </li>
              <li className="hover:text-rose-400 transition-colors cursor-pointer">
                • Chính sách bảo mật thông tin khách hàng
              </li>
              <li className="hover:text-rose-400 transition-colors cursor-pointer">
                • Điều khoản & điều kiện dịch vụ
              </li>
            </ul>
          </div>

          {/* Cột 3: Hướng dẫn & Thanh toán */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Hướng Dẫn & Thanh Toán
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400 mb-4">
              <li className="hover:text-rose-400 transition-colors cursor-pointer">
                • Hướng dẫn đặt hoa trực tuyến dễ dàng
              </li>
              <li className="hover:text-rose-400 transition-colors cursor-pointer">
                • Hướng dẫn chăm sóc hoa tươi lâu tàn
              </li>
              <li className="hover:text-rose-400 transition-colors cursor-pointer">
                • Ý nghĩa các loài hoa & cách tặng quà
              </li>
              <li className="hover:text-rose-400 transition-colors cursor-pointer">
                • Dịch vụ hoa định kỳ cho doanh nghiệp
              </li>
            </ul>

            <h5 className="text-xs font-bold text-white uppercase">Phương thức thanh toán:</h5>
            <div className="flex flex-wrap gap-2 text-xs text-stone-400">
              <span className="px-2.5 py-1 bg-stone-800 rounded-md border border-stone-700">VietQR</span>
              <span className="px-2.5 py-1 bg-stone-800 rounded-md border border-stone-700">MoMo</span>
              <span className="px-2.5 py-1 bg-stone-800 rounded-md border border-stone-700">ZaloPay</span>
              <span className="px-2.5 py-1 bg-stone-800 rounded-md border border-stone-700">Visa / Master</span>
            </div>
          </div>

          {/* Cột 4: Khuyến mãi & Mạng xã hội */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Ưu Đãi & Kết Nối
            </h4>
            <p className="text-xs text-stone-400">
              Đăng ký nhận mã giảm giá <strong>50.000đ</strong> cho đơn hàng đầu tiên và thông tin ưu đãi sớm nhất!
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="Nhập email của bạn..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-500 focus:border-rose-400 focus:ring-1 focus:ring-rose-400 outline-hidden"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

              {subscribed && (
                <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Đăng ký thành công! Hãy kiểm tra hộp thư nhé.
                </p>
              )}
            </form>

            <div className="pt-2">
              <h5 className="text-xs font-bold text-white uppercase mb-2">Theo dõi chúng tôi:</h5>
              <div className="flex gap-2.5">
                <a
                  href="#facebook"
                  className="w-8 h-8 rounded-full bg-stone-800 hover:bg-rose-600 text-stone-300 hover:text-white flex items-center justify-center transition-colors text-xs font-bold"
                >
                  f
                </a>
                <a
                  href="#instagram"
                  className="w-8 h-8 rounded-full bg-stone-800 hover:bg-rose-600 text-stone-300 hover:text-white flex items-center justify-center transition-colors text-xs font-bold"
                >
                  ig
                </a>
                <a
                  href="#zalo"
                  className="w-8 h-8 rounded-full bg-stone-800 hover:bg-rose-600 text-stone-300 hover:text-white flex items-center justify-center transition-colors text-xs font-bold"
                >
                  zl
                </a>
                <a
                  href="#tiktok"
                  className="w-8 h-8 rounded-full bg-stone-800 hover:bg-rose-600 text-stone-300 hover:text-white flex items-center justify-center transition-colors text-xs font-bold"
                >
                  tk
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-12 pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© 2026 Potico Garden. All rights reserved. GPĐKKD số: 0316892410 do Sở KH&ĐT TP.HCM cấp.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-stone-400 cursor-pointer">Bảo mật</span>
            <span>•</span>
            <span className="hover:text-stone-400 cursor-pointer">Điều khoản</span>
            <span>•</span>
            <span className="hover:text-stone-400 cursor-pointer">Sitemap</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
