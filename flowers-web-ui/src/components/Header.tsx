import React, { useState, useRef, useEffect } from 'react';
import {
  Flower2,
  Search,
  ShoppingCart,
  CalendarHeart,
  LogOut,
  Package,
  ChevronDown,
  X,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';
import type { User } from '../types';

interface HeaderProps {
  user: User | null;
  cartCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onOpenOrders: () => void;
  onOpenReminders: () => void;
  onLogout: () => void;
  onGoHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  cartCount,
  searchQuery,
  onSearchChange,
  onOpenCart,
  onOpenAuth,
  onOpenOrders,
  onOpenReminders,
  onLogout,
  onGoHome,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-rose-100/70 shadow-xs transition-all">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white text-xs sm:text-sm py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 animate-pulse shrink-0" />
        <span>Ưu đãi đặc biệt: <strong>Freeship</strong> đơn hoa từ 300.000đ & Tặng kèm thiệp thiết kế riêng</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4 sm:gap-6">
          {/* Logo */}
          <div
            onClick={() => {
              if (onGoHome) onGoHome();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center text-white shadow-md shadow-rose-200 group-hover:scale-105 transition-transform duration-300">
              <Flower2 className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-display font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 bg-clip-text text-transparent">
                Potico Garden
              </span>
              <p className="text-xs text-stone-500 font-medium tracking-wider hidden sm:block">
                HOA TƯƠI & QUÀ TẶNG TOÀN QUỐC
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-2 hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm hoa tươi, hoa sinh nhật, quà tặng..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-11 pr-10 py-2.5 bg-stone-50 hover:bg-stone-100/70 focus:bg-white text-stone-800 placeholder-stone-400 text-sm rounded-full border border-stone-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-50 outline-hidden transition-all duration-200"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Actions & Utilities */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">

            {/* Anniversary Reminder Button */}
            <button
              onClick={onOpenReminders}
              className="flex items-center gap-2 px-3 py-2 text-stone-700 hover:text-rose-600 hover:bg-rose-50/70 rounded-full text-sm font-medium transition-colors"
              title="Nhắc nhở ngày kỷ niệm"
            >
              <CalendarHeart className="w-5 h-5 text-rose-500" />
              <span className="hidden xl:inline">Nhắc Kỷ Niệm</span>
            </button>

            {/* Shopping Cart Button */}
            <button
              id="header-cart-btn"
              onClick={onOpenCart}
              className="relative p-2.5 rounded-full text-stone-700 hover:text-rose-600 hover:bg-rose-50/70 transition-all group"
              title="Giỏ hàng"
            >
              <ShoppingCart className="w-6 h-6 text-stone-700 group-hover:text-rose-600 transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-rose-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md animate-bounce-short">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {/* Google Auth / User Account */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 py-1.5 px-3 rounded-full border border-stone-200 hover:border-rose-300 hover:bg-rose-50/40 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-stone-800 max-w-[110px] truncate hidden sm:inline-block">
                    {user.name}
                  </span>
                  <ChevronDown className="w-4 h-4 text-stone-400" />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-stone-100 py-2.5 z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-xs text-stone-400 font-medium">Tài khoản Google</p>
                      <p className="text-sm font-bold text-stone-800 truncate">{user.name}</p>
                      <p className="text-xs text-stone-500 truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenOrders();
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-stone-700 hover:bg-rose-50 hover:text-rose-600 flex items-center gap-3 transition-colors"
                    >
                      <Package className="w-4 h-4 text-rose-500" />
                      <span>Đơn hàng của tôi</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenReminders();
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-stone-700 hover:bg-rose-50 hover:text-rose-600 flex items-center gap-3 transition-colors"
                    >
                      <CalendarHeart className="w-4 h-4 text-rose-500" />
                      <span>Nhắc nhở ngày kỷ niệm</span>
                    </button>

                    <div className="my-1 border-t border-stone-100"></div>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-stone-300 hover:border-rose-400 bg-white hover:bg-rose-50/50 text-stone-700 hover:text-rose-600 text-sm font-semibold shadow-xs transition-all duration-200"
              >
                {/* Official Google G Logo */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                <span className="hidden sm:inline">Đăng nhập Google</span>
                <span className="sm:hidden">Đăng nhập</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm hoa tươi, hoa sinh nhật..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-stone-50 text-stone-800 text-sm rounded-full border border-stone-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-hidden"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
