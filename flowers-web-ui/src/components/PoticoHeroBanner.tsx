import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Flame,
  Sparkles,
  ShoppingBag,
  Star,
} from 'lucide-react';

interface BannerSlide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  categoryLink: string;
  badge: string;
  accentColor: string;
}

const BANNERS: BannerSlide[] = [
  {
    id: 'tot-nghiep',
    image: '/banners/banner_tot_nghiep.png',
    title: 'Chúc Mừng Tốt Nghiệp',
    subtitle: 'Ưu đãi lên đến 56%',
    categoryLink: 'gau-bong',
    badge: 'MÙA TỐT NGHIỆP',
    accentColor: '#e11d48',
  },
  {
    id: 'lang-man',
    image: '/banners/banner_lang_man.png',
    title: 'Gợi Ý Quà Tặng Đầy Lãng Mạn',
    subtitle: 'Tặng người thương trọn vẹn yêu thương',
    categoryLink: 'hoa-tinh-yeu',
    badge: 'LÃNG MẠN & HOA HỒNG',
    accentColor: '#db2777',
  },
  {
    id: 'san-pham-kem',
    image: '/banners/banner_san_pham_kem.png',
    title: 'Tiết Kiệm Hơn Khi Mua Kèm',
    subtitle: 'Gấu bông, socola & nến thơm cao cấp',
    categoryLink: 'qua-tang',
    badge: 'COMBO TIẾT KIỆM',
    accentColor: '#7c3aed',
  },
];

interface PoticoHeroBannerProps {
  onSelectCategory: (category: string) => void;
  onSelectFlashSaleProduct?: () => void;
}

export const PoticoHeroBanner: React.FC<PoticoHeroBannerProps> = ({
  onSelectCategory,
  onSelectFlashSaleProduct,
}) => {
  // Rotate starting slide on each reload so each page visit/reload shows a fresh banner
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    try {
      const lastIndexStr = sessionStorage.getItem('potico_banner_index');
      const nextIndex = lastIndexStr ? (parseInt(lastIndexStr, 10) + 1) % BANNERS.length : 0;
      sessionStorage.setItem('potico_banner_index', nextIndex.toString());
      return nextIndex;
    } catch {
      return 0;
    }
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isReloadShimmer, setIsReloadShimmer] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const slideDuration = 4500; // 4.5 seconds per slide
  const timerRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  // Real-time flash sale countdown
  const [countdown, setCountdown] = useState({ hours: 9, minutes: 9, seconds: 59 });

  useEffect(() => {
    const cdTimer = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(cdTimer);
  }, []);

  // Shimmer & special entrance animation on page load / reload
  useEffect(() => {
    setIsReloadShimmer(true);
    const shimmerTimer = window.setTimeout(() => {
      setIsReloadShimmer(false);
    }, 1600);
    return () => clearTimeout(shimmerTimer);
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % BANNERS.length);
    setProgress(0);
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + BANNERS.length) % BANNERS.length);
    setProgress(0);
  }, []);

  // Handle slide auto-rotation & progress indicator
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    setProgress(0);
    const startTime = Date.now();

    progressIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / slideDuration) * 100);
      setProgress(pct);
    }, 50);

    timerRef.current = window.setInterval(() => {
      goToNext();
    }, slideDuration);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [currentIndex, isPlaying, goToNext]);

  const currentBanner = BANNERS[currentIndex];

  return (
    <section className="relative bg-[#fcf8f6] pt-3 pb-6 border-b border-rose-100/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Potico 3-column Hero Grid matching reference */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
          
          {/* ======================================================== */}
          {/* 1. MAIN CAROUSEL BANNER (6 cols = 50% width)              */}
          {/* ======================================================== */}
          <div className="lg:col-span-6 relative group rounded-2xl overflow-hidden bg-[#fdf7f0] shadow-xs border border-stone-200/80 flex flex-col justify-between min-h-[220px] sm:min-h-[260px]">
            
            {/* Banner Clickable Image Canvas */}
            <div
              onClick={() => onSelectCategory(currentBanner.categoryLink)}
              className="relative w-full h-full min-h-[220px] sm:min-h-[260px] cursor-pointer overflow-hidden flex items-center justify-center bg-[#fdf7f0]"
            >
              {/* Slides Container */}
              {BANNERS.map((banner, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <div
                    key={banner.id}
                    className={`absolute inset-0 transition-all duration-700 ease-out flex items-center justify-center bg-[#fdf7f0] ${
                      isActive
                        ? 'opacity-100 scale-100 z-10'
                        : 'opacity-0 scale-98 pointer-events-none z-0'
                    }`}
                  >
                    <img
                      src={banner.image}
                      alt={banner.title}
                      className="w-full h-full object-contain object-center transform transition-transform duration-1000 group-hover:scale-101"
                      loading="eager"
                    />
                  </div>
                );
              })}

              {/* Special Reload Shimmer / Flash Effect */}
              {isReloadShimmer && (
                <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
                  {/* Glowing diagonal beam sweep */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-shimmer" />
                  
                  {/* Floating welcome sparkle badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 bg-white/95 backdrop-blur-md text-rose-600 rounded-full text-xs font-bold shadow-md border border-rose-100 animate-fadeIn">
                    <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
                    <span>Ưu đãi hôm nay</span>
                  </div>
                </div>
              )}

              {/* Top Category Badge */}
              <div className="absolute top-3 right-3 z-20 hidden sm:flex items-center gap-1 px-2.5 py-1 bg-stone-900/60 backdrop-blur-sm text-white rounded-full text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                <span>{currentBanner.badge}</span>
              </div>

              {/* Floating Bottom Pagination Dots (Potico Style) */}
              <div className="absolute bottom-2.5 left-3.5 z-20 flex items-center gap-1.5 bg-black/25 backdrop-blur-xs px-2.5 py-1 rounded-full">
                {BANNERS.map((banner, idx) => (
                  <button
                    key={banner.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(idx);
                      setProgress(0);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentIndex
                        ? 'w-5 bg-white'
                        : 'w-1.5 bg-white/50 hover:bg-white/80'
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Floating Play / Pause Button at Bottom Right */}
              <div className="absolute bottom-2.5 right-3.5 z-20">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPlaying(!isPlaying);
                  }}
                  className="w-6 h-6 rounded-full bg-black/25 hover:bg-black/40 backdrop-blur-xs text-white flex items-center justify-center transition-colors"
                  title={isPlaying ? 'Tạm dừng chạy' : 'Tiếp tục chạy'}
                >
                  {isPlaying ? (
                    <Pause className="w-3 h-3" />
                  ) : (
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  )}
                </button>
              </div>

              {/* Left / Right Nav Chevrons */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrev();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white/85 hover:bg-white text-stone-700 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 border border-stone-200"
                aria-label="Previous banner"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white/85 hover:bg-white text-stone-700 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 border border-stone-200"
                aria-label="Next banner"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Subtle Progress Bar along bottom edge */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/10 z-20 overflow-hidden">
                <div
                  className="h-full bg-rose-500 transition-all duration-75"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 2. MIDDLE TWO PROMO CARDS (3 cols = 25% width)            */}
          {/* ======================================================== */}
          <div className="lg:col-span-3 flex flex-col gap-2.5 justify-between">
            {/* Card 1: Quà Tặng Sinh Nhật */}
            <div
              onClick={() => onSelectCategory('hoa-sinh-nhat')}
              className="group relative flex-1 min-h-[110px] rounded-2xl overflow-hidden bg-[#fdf7f0] shadow-xs border border-stone-200/80 cursor-pointer hover:border-rose-300 hover:shadow-md transition-all duration-300 flex items-center justify-center p-0.5"
            >
              <img
                src="/banners/sub_banner_sinh_nhat.png"
                alt="Quà Tặng Sinh Nhật"
                className="w-full h-full object-contain object-center group-hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                <span className="text-[11px] font-bold text-white bg-rose-600 px-2 py-0.5 rounded-full shadow-xs">
                  Xem ngay &rarr;
                </span>
              </div>
            </div>

            {/* Card 2: Miễn Phí Giao Hàng */}
            <div
              onClick={() => onSelectCategory('all')}
              className="group relative flex-1 min-h-[110px] rounded-2xl overflow-hidden bg-[#fdf7f0] shadow-xs border border-stone-200/80 cursor-pointer hover:border-rose-300 hover:shadow-md transition-all duration-300 flex items-center justify-center p-0.5"
            >
              <img
                src="/banners/sub_banner_giao_hang.png"
                alt="Miễn Phí Giao Hàng"
                className="w-full h-full object-contain object-center group-hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                <span className="text-[11px] font-bold text-white bg-emerald-600 px-2 py-0.5 rounded-full shadow-xs">
                  Freeship 2H &rarr;
                </span>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 3. RIGHT FLASH SALE WIDGET (3 cols = 25% width)           */}
          {/* ======================================================== */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-2.5 shadow-xs border border-stone-200/80 flex flex-col justify-between group">
            {/* Flash Sale Header with Countdown */}
            <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
              <div className="flex items-center gap-1 text-rose-600 font-extrabold text-xs uppercase tracking-wide">
                <Flame className="w-4 h-4 fill-rose-600 animate-bounce-short" />
                <span>GIẢM GIÁ SỐC</span>
              </div>

              {/* Ticking Countdown Boxes */}
              <div className="flex items-center gap-1 font-mono text-[11px] font-bold text-white">
                <span className="bg-stone-800 px-1.5 py-0.5 rounded-sm">
                  {String(countdown.hours).padStart(2, '0')}
                </span>
                <span className="text-stone-400">:</span>
                <span className="bg-stone-800 px-1.5 py-0.5 rounded-sm">
                  {String(countdown.minutes).padStart(2, '0')}
                </span>
                <span className="text-stone-400">:</span>
                <span className="bg-stone-800 px-1.5 py-0.5 rounded-sm">
                  {String(countdown.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Product Image & Info */}
            <div
              onClick={() => {
                if (onSelectFlashSaleProduct) onSelectFlashSaleProduct();
                else onSelectCategory('hoa-tinh-yeu');
              }}
              className="py-1 flex flex-col items-center cursor-pointer"
            >
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center overflow-hidden">
                <img
                  src="/banners/nang_dep_thumb.png"
                  alt="Nàng Đẹp - Bó hoa hồng lãng mạn"
                  className="w-full h-full object-contain transform group-hover:scale-108 transition-transform duration-500"
                />
                <span className="absolute top-0 right-0 bg-rose-600 text-white font-bold text-[10px] px-1.5 py-0.5 rounded-full shadow-xs">
                  -57%
                </span>
              </div>

              <div className="w-full text-center mt-0.5">
                <h4 className="font-bold text-stone-900 text-sm group-hover:text-rose-600 transition-colors truncate">
                  Bó Hoa Nàng Đẹp
                </h4>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-extrabold text-rose-600 text-sm">299,000₫</span>
                  <span className="text-stone-400 text-xs line-through">699,000₫</span>
                </div>
                <div className="flex items-center justify-center gap-1 text-[11px] text-amber-500 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>5.0</span>
                  <span className="text-stone-400 font-normal">(49 đã bán)</span>
                </div>
              </div>
            </div>

            {/* Direct Order Button */}
            <button
              onClick={() => {
                if (onSelectFlashSaleProduct) onSelectFlashSaleProduct();
                else onSelectCategory('hoa-tinh-yeu');
              }}
              className="w-full py-1.5 px-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 group-hover:shadow-md"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Săn Deal 299K</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
