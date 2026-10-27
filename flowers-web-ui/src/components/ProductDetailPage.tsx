import React, { useState, useMemo, useRef } from 'react';
import {
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Calendar,
  Check,
  Star,
  Minus,
  Plus,
  ArrowLeft,
} from 'lucide-react';
import type { Product, Addon } from '../types';
import { formatCurrency } from '../data/mockData';

interface ProductDetailPageProps {
  product: Product;
  allProducts: Product[];
  onBackToHome: () => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (
    product: Product,
    quantity: number,
    addons: Addon[],
    variant: 'standard' | 'premium',
    deliveryDate: string,
    timeSlot: string
  ) => void;
  onBuyNow: (
    product: Product,
    quantity: number,
    addons: Addon[],
    variant: 'standard' | 'premium',
    deliveryDate: string,
    timeSlot: string
  ) => void;
}

interface DetailedAddon {
  id: string;
  name: string;
  category: 'all' | 'banh-kem' | 'socola' | 'gau-bong' | 'thiep' | 'khac';
  price: number;
  image: string;
}

const EXTENDED_ADDONS: DetailedAddon[] = [
  {
    id: 'addon_gift_box',
    name: 'Gift Box',
    category: 'khac',
    price: 39000,
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'addon_teddy',
    name: 'Gấu Bông Đáng Yêu',
    category: 'gau-bong',
    price: 169000,
    image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'addon_card',
    name: 'Thiệp Tình Yêu',
    category: 'thiep',
    price: 39000,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'addon_choco_bouquet',
    name: 'Bó Socola Một Chút Ngọt Ngào',
    category: 'socola',
    price: 149000,
    image: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'addon_cake',
    name: 'Bánh Kem Mini Trái Cây',
    category: 'banh-kem',
    price: 180000,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'addon_ferrero',
    name: 'Hộp Socola Ferrero Rocher',
    category: 'socola',
    price: 65000,
    image: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'addon_led',
    name: 'Đèn Led Lung Linh',
    category: 'khac',
    price: 35000,
    image: 'https://images.unsplash.com/photo-1513297887119-d46091b24bfa?auto=format&fit=crop&w=300&q=80',
  },
];

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts,
  onBackToHome,
  onSelectProduct,
  onAddToCart,
  onBuyNow,
}) => {
  // Gallery - deduplicate images (never repeat duplicates when there's only 1 photo)
  const galleryImages = useMemo(() => {
    const rawList = product.images && product.images.length > 0 ? product.images : [];
    // Deduplicate images while preserving order
    const unique = Array.from(new Set(rawList.filter(Boolean)));
    if (unique.length === 0) {
      return ['https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80'];
    }
    return unique;
  }, [product]);

  const [selectedImgIndex, setSelectedImgIndex] = useState(0);

  // Reset selected image when product changes
  React.useEffect(() => {
    setSelectedImgIndex(0);
  }, [product.id, product.slug]);

  // Accordion Description
  const [isDescOpen, setIsDescOpen] = useState(true);

  // Configuration States
  const [city, setCity] = useState('Hồ Chí Minh');
  const [variant, setVariant] = useState<'standard' | 'premium'>('standard');
  const [quantity, setQuantity] = useState(1);

  // Add-ons
  const [addonCategory, setAddonCategory] = useState<string>('all');
  const [selectedAddons, setSelectedAddons] = useState<DetailedAddon[]>([]);
  const addonScrollRef = useRef<HTMLDivElement>(null);

  // Delivery Dates
  const today = useMemo(() => new Date(), []);
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  }, []);
  const dayAfter = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d;
  }, []);

  const formatShortDate = (d: Date) => `${d.getDate()} THÁNG ${d.getMonth() + 1}`;
  const getWeekdayName = (d: Date) => {
    const names = ['CHỦ NHẬT', 'THỨ HAI', 'THỨ BA', 'THỨ TƯ', 'THỨ NĂM', 'THỨ SÁU', 'THỨ BẢY'];
    return names[d.getDay()];
  };

  const [selectedDate, setSelectedDate] = useState('today');

  // Delivery Time Slots
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('express');

  const TIME_SLOTS_DATA = [
    { id: 'express', label: 'Giao Nhanh 90 Phút', surcharge: 30000, badge: '(+30.000đ)' },
    { id: '14h - 16h', label: '14h - 16h', surcharge: 0 },
    { id: '15h - 17h', label: '15h - 17h', surcharge: 0 },
    { id: '16h - 18h', label: '16h - 18h', surcharge: 0 },
    { id: '17h - 19h', label: '17h - 19h', surcharge: 0 },
    { id: '18h - 20h', label: '18h - 20h', surcharge: 0 },
    { id: '19h - 21h', label: '19h - 21h', surcharge: 0 },
  ];

  // Calculation
  const variantSurcharge = variant === 'premium' ? 150000 : 0;
  const baseUnitPrice = product.price + variantSurcharge;
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const subtotal = (baseUnitPrice * quantity) + addonsTotal;
  const expressFee = selectedTimeSlot === 'express' ? 30000 : 0;
  const grandTotal = subtotal + expressFee;

  // Addon Filtering
  const filteredAddons = useMemo(() => {
    if (addonCategory === 'all') return EXTENDED_ADDONS;
    return EXTENDED_ADDONS.filter((a) => a.category === addonCategory);
  }, [addonCategory]);

  const toggleAddon = (item: DetailedAddon) => {
    setSelectedAddons((prev) =>
      prev.some((a) => a.id === item.id)
        ? prev.filter((a) => a.id !== item.id)
        : [...prev, item]
    );
  };

  const scrollAddons = (direction: 'left' | 'right') => {
    if (addonScrollRef.current) {
      const offset = direction === 'left' ? -220 : 220;
      addonScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Related Products
  const relatedProducts = useMemo(() => {
    return allProducts.filter((p) => p.id !== product.id).slice(0, 4);
  }, [allProducts, product]);

  // Convert to standard Addon type for cart
  const convertedAddons: Addon[] = selectedAddons.map((a) => ({
    name: a.name,
    price: a.price,
  }));

  const getResolvedDeliveryDate = () => {
    if (selectedDate === 'tomorrow') return formatShortDate(tomorrow);
    if (selectedDate === 'dayAfter') return formatShortDate(dayAfter);
    return formatShortDate(today);
  };

  const getResolvedISODate = () => {
    const d = new Date();
    if (selectedDate === 'tomorrow') d.setDate(d.getDate() + 1);
    else if (selectedDate === 'dayAfter') d.setDate(d.getDate() + 2);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="min-h-screen bg-white text-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Navigation & Breadcrumb */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => {
              if (window.history.state?.page === 'detail') {
                window.history.back();
              } else {
                onBackToHome();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-600 text-xs font-semibold transition-colors cursor-pointer border border-stone-200 shadow-2xs"
            title="Quay lại danh mục hoa tươi"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại</span>
          </button>

          <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-stone-500">
            <button
              onClick={onBackToHome}
              className="hover:text-rose-600 transition-colors"
            >
              Trang chủ
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-stone-700 font-medium truncate max-w-md">
              {product.name}
            </span>
          </nav>
        </div>

        {/* 2-Column Product Layout matching Images 1 & 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* LEFT COLUMN: Gallery & Description & Related Products */}
          <div className="lg:col-span-6 space-y-8">
            {/* Gallery: Vertical Thumbnails + Big Preview */}
            <div className="flex gap-4 items-start">
              {/* Vertical Thumbnails */}
              <div className="flex flex-col gap-3 shrink-0">
                {galleryImages.map((img, idx) => {
                  const isActive = selectedImgIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedImgIndex(idx)}
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        isActive
                          ? 'border-[#5b6bb2] ring-1 ring-[#5b6bb2]'
                          : 'border-stone-200 hover:border-stone-400 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>

              {/* Main Image */}
              <div className="flex-1 aspect-4/5 sm:aspect-square rounded-2xl overflow-hidden bg-stone-50 border border-stone-200/80 shadow-xs relative">
                <img
                  src={galleryImages[selectedImgIndex] || galleryImages[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* MÔ TẢ (Accordion matching Image 1) */}
            <div className="border-t border-stone-200/80 pt-6">
              <button
                onClick={() => setIsDescOpen(!isDescOpen)}
                className="w-full flex items-center justify-between py-2 text-left text-base sm:text-lg font-bold text-stone-900 cursor-pointer"
              >
                <span>MÔ TẢ</span>
                {isDescOpen ? (
                  <ChevronUp className="w-5 h-5 text-stone-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-stone-600" />
                )}
              </button>

              {isDescOpen && (
                <div className="mt-4 text-xs sm:text-sm text-stone-700 space-y-4 leading-relaxed font-sans animate-fadeIn">
                  <p>
                    <strong className="text-stone-900">{product.name}</strong> – {product.description || 'Bó hoa ngọt ngào dành tặng người bạn yêu thương. Sắc màu tinh tế mang đến cảm giác ấm áp, phù hợp để gửi tặng vào sinh nhật, kỷ niệm, ngày đặc biệt hoặc đơn giản là để làm ai đó mỉm cười.'}
                  </p>

                  <div className="space-y-1">
                    <p className="font-semibold text-stone-900">
                      Bó hoa {product.name} (cơ bản) gồm:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-stone-600 pl-1">
                      <li>8 cành hoa Hồng / Hoa chủ đạo tuyển chọn</li>
                      <li>5 cành hoa Cẩm Chướng / Hoa phụ phối màu</li>
                      <li>Các loại hoa và lá phụ cao cấp khác</li>
                    </ul>
                  </div>

                  <div className="space-y-1">
                    <p className="font-semibold text-stone-900">
                      Bó hoa {product.name} (Nâng cấp) gồm:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-stone-600 pl-1">
                      <li>12 cành hoa Hồng / Hoa chủ đạo tuyển chọn</li>
                      <li>5 cành hoa Cẩm Chướng</li>
                      <li>5 cành hoa đồng tiền / Hoa ngoại nhập</li>
                      <li>Các loại hoa và lá phụ cao cấp khác</li>
                    </ul>
                  </div>

                  <p className="text-stone-500 italic text-xs pt-1">
                    Do mỗi sản phẩm được làm hoàn toàn thủ công & màu hoa có thể thay đổi theo mùa nên sẽ có chút khác biệt so với hình ảnh. *
                  </p>
                </div>
              )}
            </div>

            {/* SẢN PHẨM LIÊN QUAN (Matching Image 2) */}
            <div className="border-t border-stone-200/80 pt-8">
              <h3 className="text-base sm:text-lg font-bold text-stone-900 uppercase tracking-wide mb-5">
                SẢN PHẨM LIÊN QUAN
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {relatedProducts.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectProduct(rel)}
                    className="group cursor-pointer flex flex-col"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden bg-stone-100 mb-2.5 border border-stone-200/60">
                      <img
                        src={rel.images[0] || 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=400&q=80'}
                        alt={rel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h4 className="text-xs sm:text-sm font-medium text-stone-800 group-hover:text-rose-600 transition-colors line-clamp-2 leading-snug mb-1">
                      {rel.name}
                    </h4>
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-stone-900">
                        {formatCurrency(rel.price)}
                      </span>
                      {rel.original_price > rel.price && (
                        <span className="text-[11px] text-stone-400 line-through">
                          {formatCurrency(rel.original_price)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-amber-500 font-semibold mt-1">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>5.0 (35)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Product Configuration & Purchase Box */}
          <div className="lg:col-span-6 space-y-6">
            {/* Title & Pricing */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 uppercase tracking-tight">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-3 mt-3">
                <span className="text-2xl sm:text-3xl font-bold text-stone-900">
                  {formatCurrency(baseUnitPrice)}
                </span>
                {product.original_price > product.price && (
                  <span className="text-base text-stone-400 line-through">
                    {formatCurrency(product.original_price + variantSurcharge)}
                  </span>
                )}
              </div>
            </div>

            {/* Giao đến */}
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                Giao đến:
              </label>
              <div className="relative">
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full appearance-none bg-white border border-[#8a98c8] text-stone-800 text-sm rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-[#8a98c8]/30 font-medium cursor-pointer"
                >
                  <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Bình Dương">Bình Dương</option>
                  <option value="Đồng Nai">Đồng Nai</option>
                </select>
                <ChevronDown className="w-4 h-4 text-stone-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Chọn biến thể */}
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                Chọn biến thể:
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setVariant('standard')}
                  className={`px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all border ${
                    variant === 'standard'
                      ? 'border-[#5b6bb2] text-[#3e4d8f] bg-indigo-50/40 ring-1 ring-[#5b6bb2]'
                      : 'border-stone-300 text-stone-700 bg-white hover:border-stone-400'
                  }`}
                >
                  Tiêu chuẩn
                </button>
                <button
                  type="button"
                  onClick={() => setVariant('premium')}
                  className={`px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all border ${
                    variant === 'premium'
                      ? 'border-[#5b6bb2] text-[#3e4d8f] bg-indigo-50/40 ring-1 ring-[#5b6bb2]'
                      : 'border-stone-300 text-stone-700 bg-white hover:border-stone-400'
                  }`}
                >
                  Cao cấp (+150.000đ)
                </button>
              </div>
            </div>

            {/* Số lượng */}
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                Số lượng:
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-md border border-stone-300 bg-white hover:bg-stone-100 flex items-center justify-center text-stone-600 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-bold text-stone-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 rounded-md border border-stone-300 bg-white hover:bg-stone-100 flex items-center justify-center text-stone-600 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-stone-500 mt-2 italic">
                Đơn hàng sẽ được giao bởi một trong những đối tác của chúng tôi.
              </p>
            </div>

            {/* Chọn thêm sản phẩm (Addons Carousel with Categories) */}
            <div className="border-t border-stone-200/80 pt-5">
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2.5">
                Chọn thêm sản phẩm:
              </label>

              {/* Addon Category Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'banh-kem', label: 'Bánh Kem' },
                  { id: 'socola', label: 'Sô-cô-la' },
                  { id: 'gau-bong', label: 'Gấu Bông' },
                  { id: 'thiep', label: 'Thiệp' },
                  { id: 'khac', label: 'Khác' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setAddonCategory(cat.id)}
                    className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                      addonCategory === cat.id
                        ? 'bg-[#2b3562] text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Addon Carousel with Arrows */}
              <div className="relative group/carousel">
                <button
                  onClick={() => scrollAddons('left')}
                  className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white shadow-md border border-stone-200 flex items-center justify-center text-stone-600 hover:text-stone-900 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div
                  ref={addonScrollRef}
                  className="flex gap-3 overflow-x-auto pb-2 scrollbar-none scroll-smooth px-1"
                >
                  {filteredAddons.map((addon) => {
                    const isSelected = selectedAddons.some((a) => a.id === addon.id);
                    return (
                      <div
                        key={addon.id}
                        onClick={() => toggleAddon(addon)}
                        className={`w-32 sm:w-36 shrink-0 rounded-xl border p-2 flex flex-col justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#5b6bb2] bg-indigo-50/20 ring-2 ring-[#5b6bb2]'
                            : 'border-stone-200 bg-white hover:border-stone-300'
                        }`}
                      >
                        {/* Addon Title & Info */}
                        <div className="flex items-start justify-between gap-1 mb-1.5">
                          <span className="text-[11px] font-medium text-stone-700 line-clamp-1">
                            {addon.name}
                          </span>
                          <span className="text-[10px] bg-[#2b3562] text-white w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0">
                            i
                          </span>
                        </div>

                        {/* Addon Image */}
                        <div className="w-full aspect-square rounded-lg overflow-hidden bg-stone-50 mb-2 relative">
                          <img
                            src={addon.image}
                            alt={addon.name}
                            className="w-full h-full object-cover"
                          />
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#5b6bb2] text-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </div>

                        {/* Addon Price */}
                        <span className="text-xs font-bold text-stone-900 text-center">
                          {formatCurrency(addon.price)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => scrollAddons('right')}
                  className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white shadow-md border border-stone-200 flex items-center justify-center text-stone-600 hover:text-stone-900 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chọn ngày giao hàng (Matching Image 1) */}
            <div className="border-t border-stone-200/80 pt-5">
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2.5">
                Chọn ngày giao hàng:
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* Today */}
                <button
                  type="button"
                  onClick={() => setSelectedDate('today')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedDate === 'today'
                      ? 'border-[#5b6bb2] bg-indigo-50/20 ring-1 ring-[#5b6bb2]'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <p className="text-[11px] font-bold text-stone-800">
                    {formatShortDate(today)}
                  </p>
                  <p className="text-[10px] text-stone-500 font-semibold mt-0.5">
                    TODAY
                  </p>
                </button>

                {/* Tomorrow */}
                <button
                  type="button"
                  onClick={() => setSelectedDate('tomorrow')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedDate === 'tomorrow'
                      ? 'border-[#5b6bb2] bg-indigo-50/20 ring-1 ring-[#5b6bb2]'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <p className="text-[11px] font-bold text-stone-800">
                    {formatShortDate(tomorrow)}
                  </p>
                  <p className="text-[10px] text-stone-500 font-semibold mt-0.5">
                    TOMORROW
                  </p>
                </button>

                {/* Day 3 */}
                <button
                  type="button"
                  onClick={() => setSelectedDate('dayAfter')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedDate === 'dayAfter'
                      ? 'border-[#5b6bb2] bg-indigo-50/20 ring-1 ring-[#5b6bb2]'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <p className="text-[11px] font-bold text-stone-800">
                    {formatShortDate(dayAfter)}
                  </p>
                  <p className="text-[10px] text-stone-500 font-semibold mt-0.5">
                    {getWeekdayName(dayAfter)}
                  </p>
                </button>

                {/* Calendar */}
                <button
                  type="button"
                  className="p-3 rounded-xl border border-stone-200 hover:border-stone-300 bg-white text-center transition-all flex flex-col items-center justify-center"
                >
                  <Calendar className="w-4 h-4 text-stone-600 mb-0.5" />
                  <p className="text-[10px] text-stone-600 font-bold uppercase tracking-wider">
                    LỊCH
                  </p>
                </button>
              </div>
            </div>

            {/* Chọn thời gian giao hàng (Matching Image 1 & 2) */}
            <div className="border-t border-stone-200/80 pt-5">
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2.5">
                Chọn thời gian giao hàng:
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {TIME_SLOTS_DATA.map((slot) => {
                  const isSelected = selectedTimeSlot === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedTimeSlot(slot.id)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition-all text-center ${
                        isSelected
                          ? 'border-[#5b6bb2] text-[#3e4d8f] bg-indigo-50/30 ring-1 ring-[#5b6bb2]'
                          : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-white'
                      }`}
                    >
                      <span>{slot.label}</span>
                      {slot.badge && (
                        <span className="block text-[11px] text-rose-600 font-bold mt-0.5">
                          {slot.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-stone-500 mt-3 italic leading-relaxed">
                Sau khi hoàn tất các bước đặt hàng, sản phẩm sẽ được giao đến người nhận trong vòng {selectedTimeSlot === 'express' ? '90 phút' : 'khung giờ đã chọn'}.
              </p>
            </div>

            {/* Price Summary & Action Buttons */}
            <div className="border-t border-stone-200/80 pt-5 space-y-3">
              <div className="space-y-1.5 text-xs sm:text-sm text-stone-600">
                <div className="flex justify-between">
                  <span>Tạm tính :</span>
                  <span className="font-semibold text-stone-800">{formatCurrency(subtotal)}</span>
                </div>
                {expressFee > 0 && (
                  <div className="flex justify-between text-rose-600 font-medium">
                    <span>Express Shipping :</span>
                    <span>+{formatCurrency(expressFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base sm:text-lg font-bold text-stone-900 pt-2 border-t border-stone-100">
                  <span>Tổng:</span>
                  <span className="text-rose-600 text-xl font-black">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              {/* Action Buttons: [ Thêm vào giỏ hàng ] [ Mua ngay ] */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    onAddToCart(
                      product,
                      quantity,
                      convertedAddons,
                      variant,
                      getResolvedDeliveryDate(),
                      selectedTimeSlot
                    )
                  }
                  className="py-3 px-4 rounded-xl border border-stone-800 hover:bg-stone-50 text-stone-900 font-bold text-sm transition-all text-center"
                >
                  Thêm vào giỏ hàng
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onBuyNow(
                      product,
                      quantity,
                      convertedAddons,
                      variant,
                      getResolvedISODate(),
                      selectedTimeSlot
                    )
                  }
                  className="py-3 px-4 rounded-xl bg-[#d83a56] hover:bg-[#c52f4a] text-white font-bold text-sm shadow-md transition-all text-center"
                >
                  Mua ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
