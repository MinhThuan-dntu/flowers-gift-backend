import React, { useState } from 'react';
import { X, ShieldCheck, Plus, ArrowRight, User as UserIcon } from 'lucide-react';
import type { User } from '../types';
import { MOCK_USERS } from '../data/mockData';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  if (!isOpen) return null;

  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');

  const handleSelectMock = (user: User) => {
    onLoginSuccess(user);
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customEmail.trim()) return;

    const newUser: User = {
      id: `user_${Date.now()}`,
      name: customName.trim(),
      email: customEmail.trim(),
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(customName)}`,
      phone: '0908123456',
    };

    onLoginSuccess(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-100 overflow-hidden my-auto">
        {/* Header with Google Logo */}
        <div className="p-6 text-center border-b border-stone-100 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Google G Logo */}
          <div className="w-12 h-12 rounded-2xl bg-stone-50 border border-stone-200 shadow-xs mx-auto flex items-center justify-center mb-3">
            <svg className="w-7 h-7" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>

          <h3 className="text-xl font-bold text-stone-900">Đăng Nhập Với Google</h3>
          <p className="text-xs text-stone-500 mt-1">
            Chọn tài khoản Google của bạn để tiếp tục mua hoa & nhận ưu đãi tại Potico Garden
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {!isCustomMode ? (
            <>
              <div className="space-y-2.5">
                {MOCK_USERS.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectMock(user)}
                    className="w-full p-3.5 rounded-2xl border border-stone-200 hover:border-rose-300 hover:bg-rose-50/50 flex items-center gap-3.5 transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-full bg-stone-100 group-hover:bg-rose-100 text-stone-600 group-hover:text-rose-600 flex items-center justify-center transition-colors shrink-0">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-stone-800 truncate group-hover:text-rose-600 transition-colors">
                        {user.name}
                      </p>
                      <p className="text-xs text-stone-500 truncate">{user.email}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomMode(true)}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Sử dụng tài khoản Google khác</span>
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Họ và tên của bạn *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Lê Hoàng Yến"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Địa chỉ Email Google (@gmail.com) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="VD: hoangyen.le@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-hidden"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  className="flex-1 py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs rounded-xl transition-colors"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  className="flex-2 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                >
                  Đăng Nhập Ngay
                </button>
              </div>
            </form>
          )}

          {/* Privacy Note */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Thông tin được bảo mật và tự động lưu phiên làm việc.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
