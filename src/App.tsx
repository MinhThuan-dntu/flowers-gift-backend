import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Flower2,
  Clock,
  Truck,
  ShieldCheck,
  Search,
  Sparkles,
  ShoppingBag,
  Gift,
  Heart,
  Calendar,
  X,
  CheckCircle2,
  Copy,
  ChevronRight,
  Store,
  Phone,
  MessageSquare,
  AlertCircle,
  Loader2,
  Percent,
  Bell,
  CalendarHeart,
  Mail,
  User,
  Tag,
  RefreshCw,
} from 'lucide-react';

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export interface Addon {
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  original_price: number;
  images: string[];
  description: string;
  is_same_day: boolean;
  vendor_name: string;
  stock: number;
  addons?: Addon[];
}

export interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  addons: string[];
}

export interface OrderCreateRequest {
  recipient_name: string;
  recipient_phone: string;
  delivery_address: string;
  delivery_date: string;
  delivery_time_slot: string;
  card_message?: string;
  is_anonymous: boolean;
  items: OrderItem[];
  total_amount: number;
}

export interface OrderResponse {
  order_id: string;
  payment_qr_url: string;
  transfer_memo: string;
  total_amount: number;
  message: string;
}

// Interface cho Reminder Service
export interface Reminder {
  id: string;
  user_email: string;
  recipient_name: string;
  occasion_name: string;
  event_date: string;
  remind_before_days: number;
  notes?: string;
  created_at?: string;
}

export interface ReminderCreateRequest {
  user_email: string;
  recipient_name: string;
  occasion_name: string;
  event_date: string;
  remind_before_days: number;
  notes?: string;
}

export interface ReminderResponse {
  reminder_id: string;
  message: string;
}

// Cấu hình URL Backend FastAPI
const API_BASE_URL = 'http://127.0.0.1:8000';

const CATEGORIES = [
  { id: 'all', label: 'Tất Cả Sản Phẩm', icon: Flower2 },
  { id: 'hoa-sinh-nhat', label: 'Hoa Sinh Nhật', icon: Sparkles },
  { id: 'hoa-khai-truong', label: 'Hoa Khai Trương', icon: Store },
  { id: 'hoa-tinh-yeu', label: 'Hoa Tình Yêu', icon: Heart },
  { id: 'qua-tang', label: 'Quà Tặng & Nến Thơm', icon: Gift },
];

const TIME_SLOTS = [
  '08:00 - 10:00',
  '10:00 - 12:00',
  '13:30 - 15:30',
  '15:30 - 17:30',
  '18:00 - 20:30',
];

const BEFORE_DAYS_OPTIONS = [
  { value: 1, label: 'Nhắc trước 1 ngày' },
  { value: 3, label: 'Nhắc trước 3 ngày (Khuyên dùng)' },
  { value: 7, label: 'Nhắc trước 7 ngày (1 tuần)' },
];

// Hàm định dạng tiền tệ Việt Nam Đồng (VND)
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};

// ==========================================
// 2. MAIN APP COMPONENT
// ==========================================

export default function App() {
  // State dữ liệu danh sách sản phẩm
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State bộ lọc & tìm kiếm
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sameDayOnly, setSameDayOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // State Modal đặt hàng
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  // State Form thông tin giao hàng
  const [recipientName, setRecipientName] = useState<string>('');
  const [recipientPhone, setRecipientPhone] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState<string>(TIME_SLOTS[1]);
  const [cardMessage, setCardMessage] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);

  // State gửi đơn & kết quả mã QR thanh toán
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [orderResult, setOrderResult] = useState<OrderResponse | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [copiedMemo, setCopiedMemo] = useState<boolean>(false);

  // ==========================================
  // STATE CHO TÍNH NĂNG NHẮC NHỞ (REMINDER)
  // ==========================================
  const [isReminderModalOpen, setIsReminderModalOpen] = useState<boolean>(false);
  const [reminderTab, setReminderTab] = useState<'create' | 'list'>('create');

  // Hàm tiện ích tính ngày trong tương lai
  const getFutureDate = (daysAhead: number = 7) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split('T')[0];
  };

  // Form đăng ký nhắc nhở
  const [reminderEmail, setReminderEmail] = useState<string>('');
  const [reminderRecipient, setReminderRecipient] = useState<string>('');
  const [reminderOccasion, setReminderOccasion] = useState<string>('');
  const [reminderEventDate, setReminderEventDate] = useState<string>(getFutureDate(7));
  const [reminderBeforeDays, setReminderBeforeDays] = useState<number>(3);
  const [reminderNotes, setReminderNotes] = useState<string>('');
  const [isReminderSubmitting, setIsReminderSubmitting] = useState<boolean>(false);
  const [reminderSuccessMsg, setReminderSuccessMsg] = useState<string | null>(null);
  const [reminderErrorMsg, setReminderErrorMsg] = useState<string | null>(null);

  // Xem danh sách nhắc nhở đã lưu
  const [searchReminderEmail, setSearchReminderEmail] = useState<string>('');
  const [myReminders, setMyReminders] = useState<Reminder[]>([]);
  const [isFetchingReminders, setIsFetchingReminders] = useState<boolean>(false);
  const [hasSearchedReminders, setHasSearchedReminders] = useState<boolean>(false);

  // Mặc định ngày giao hàng là ngày mai
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDeliveryDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  // Lấy danh sách sản phẩm từ backend API (hỗ trợ lọc category & same_day)
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | boolean> = {};
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      if (sameDayOnly) {
        params.same_day = true;
      }
      if (searchQuery.trim()) {
        params.q = searchQuery.trim();
      }

      const response = await axios.get<Product[]>(`${API_BASE_URL}/api/products`, {
        params,
      });
      setProducts(response.data);
    } catch (err: unknown) {
      console.error('Lỗi lấy danh sách sản phẩm:', err);
      setError('Không thể kết nối đến máy chủ backend (http://127.0.0.1:8000). Vui lòng đảm bảo FastAPI đang chạy.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sameDayOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  // Mở modal đặt hàng
  const handleOpenOrderModal = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setSelectedAddons([]);
    setCardMessage('');
    setIsAnonymous(false);
    setIsOrderModalOpen(true);
  };

  // Chọn / Bỏ chọn quà kèm (Add-on)
  const toggleAddon = (addonName: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addonName) ? prev.filter((name) => name !== addonName) : [...prev, addonName]
    );
  };

  // Tính tổng tiền realtime bao gồm hoa + quà kèm theo + số lượng
  const calculatedTotal = useMemo(() => {
    if (!selectedProduct) return 0;
    const basePrice = selectedProduct.price;
    const addonsPrice = (selectedProduct.addons || [])
      .filter((a) => selectedAddons.includes(a.name))
      .reduce((sum, a) => sum + a.price, 0);

    return (basePrice + addonsPrice) * quantity;
  }, [selectedProduct, selectedAddons, quantity]);

  // Submit đơn hàng lên POST /api/orders
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    if (!recipientName.trim() || !recipientPhone.trim() || !deliveryAddress.trim() || !deliveryDate) {
      alert('Vui lòng điền đầy đủ thông tin người nhận và địa chỉ giao hàng!');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload: OrderCreateRequest = {
        recipient_name: recipientName.trim(),
        recipient_phone: recipientPhone.trim(),
        delivery_address: deliveryAddress.trim(),
        delivery_date: deliveryDate,
        delivery_time_slot: deliveryTimeSlot,
        card_message: cardMessage.trim(),
        is_anonymous: isAnonymous,
        items: [
          {
            product_id: selectedProduct.id,
            name: selectedProduct.name,
            price: selectedProduct.price,
            quantity: quantity,
            addons: selectedAddons,
          },
        ],
        total_amount: calculatedTotal,
      };

      const response = await axios.post<OrderResponse>(
        `${API_BASE_URL}/api/orders`,
        orderPayload
      );

      setOrderResult(response.data);
      setIsOrderModalOpen(false);
      setIsPaymentModalOpen(true);
    } catch (err: unknown) {
      console.error('Lỗi tạo đơn hàng:', err);
      alert('Không thể tạo đơn hàng. Vui lòng kiểm tra kết nối tới Backend API!');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sao chép nội dung chuyển khoản
  const handleCopyMemo = (memo: string) => {
    navigator.clipboard.writeText(memo);
    setCopiedMemo(true);
    setTimeout(() => setCopiedMemo(false), 2500);
  };

  // ==========================================
  // XỬ LÝ REMINDER SERVICE
  // ==========================================

  // Submit đăng ký nhắc nhở mới (POST /api/reminders)
  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    setReminderErrorMsg(null);
    setReminderSuccessMsg(null);

    if (!reminderEmail.trim() || !reminderRecipient.trim() || !reminderOccasion.trim() || !reminderEventDate) {
      setReminderErrorMsg('Vui lòng điền đầy đủ email, người nhận, dịp kỷ niệm và ngày diễn ra!');
      return;
    }

    setIsReminderSubmitting(true);
    try {
      const payload: ReminderCreateRequest = {
        user_email: reminderEmail.trim(),
        recipient_name: reminderRecipient.trim(),
        occasion_name: reminderOccasion.trim(),
        event_date: reminderEventDate,
        remind_before_days: Number(reminderBeforeDays),
        notes: reminderNotes.trim(),
      };

      const response = await axios.post<ReminderResponse>(
        `${API_BASE_URL}/api/reminders`,
        payload
      );

      setReminderSuccessMsg(response.data.message || 'Đã đăng ký nhắc nhở thành công!');
      // Reset form sau khi gửi
      setReminderRecipient('');
      setReminderOccasion('');
      setReminderEventDate(getFutureDate(7));
      setReminderNotes('');
      // Ghi nhớ email để người dùng tiện tra cứu
      setSearchReminderEmail(reminderEmail.trim());
    } catch (err: unknown) {
      console.error('Lỗi lưu nhắc nhở:', err);
      setReminderErrorMsg('Không thể lưu nhắc nhở. Vui lòng kiểm tra lại kết nối backend!');
    } finally {
      setIsReminderSubmitting(false);
    }
  };

  // Tra cứu danh sách nhắc nhở theo email (GET /api/reminders?email=...)
  const handleFetchMyReminders = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchReminderEmail.trim()) {
      alert('Vui lòng nhập địa chỉ email của bạn để tra cứu!');
      return;
    }

    setIsFetchingReminders(true);
    try {
      const response = await axios.get<Reminder[]>(`${API_BASE_URL}/api/reminders`, {
        params: { email: searchReminderEmail.trim() },
      });
      setMyReminders(response.data);
      setHasSearchedReminders(true);
    } catch (err: unknown) {
      console.error('Lỗi lấy danh sách nhắc nhở:', err);
      alert('Không thể tải danh sách nhắc nhở. Vui lòng thử lại!');
    } finally {
      setIsFetchingReminders(false);
    }
  };

  return (
    <div className="min-h-screen bg-rose-50/30 text-stone-800 font-sans antialiased">
      {/* ==========================================
          1. HEADER & NAVIGATION
      ========================================== */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-sm">
        {/* Top Announcement Bar */}
        <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-pink-500 text-white text-xs sm:text-sm py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
          <Truck className="w-4 h-4" />
          <span>Freeship cho đơn hàng hoa tươi từ 500.000đ • Giao nhanh trong 2h tại TP.HCM & Hà Nội</span>
        </div>

        {/* Main Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shadow-inner">
              <Flower2 className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-rose-700 font-serif">
                Potico Garden
              </span>
              <p className="text-[10px] sm:text-xs text-stone-500 tracking-normal uppercase font-semibold">
                Flower & Gift Delivery
              </p>
            </div>
          </div>

          {/* Search bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-md items-center relative"
          >
            <input
              type="text"
              placeholder="Tìm hoa sinh nhật, hoa tình yêu, nến thơm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-24 py-2 text-sm bg-stone-50 border border-stone-200 rounded-full focus:outline-none focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100 transition-all"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5" />
            <button
              type="submit"
              className="absolute right-1.5 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium rounded-full transition-colors"
            >
              Tìm kiếm
            </button>
          </form>

          {/* Action buttons: Reminder + Hotline + Fast delivery badge */}
          <div className="flex items-center gap-3 text-sm font-medium">
            {/* NÚT KÍCH HOẠT DỊCH VỤ NHẮC NGÀY KỶ NIỆM */}
            <button
              type="button"
              onClick={() => {
                setIsReminderModalOpen(true);
                setReminderSuccessMsg(null);
                setReminderErrorMsg(null);
              }}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 shadow-sm transition-all duration-200 active:scale-95"
            >
              <Bell className="w-4 h-4 text-rose-600 animate-bounce" />
              <span>Nhắc ngày kỷ niệm</span>
            </button>

            <div className="hidden lg:flex items-center gap-2 text-stone-600">
              <Phone className="w-4 h-4 text-rose-500" />
              <span>Hotline: <strong className="text-rose-700">1900 633 800</strong></span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 bg-amber-50 text-amber-800 px-3 py-1.5 rounded-full text-xs font-semibold border border-amber-200">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Giao 2H Có Ngay</span>
            </div>
          </div>
        </div>
      </header>

      {/* ==========================================
          2. HERO BANNER
      ========================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-rose-100/60 to-transparent py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-rose-200 rounded-full text-rose-600 text-xs font-medium shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Thiết Kế Độc Quyền Theo Yêu Cầu</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 font-serif leading-tight">
                Giao Hoa Tươi Nhanh, <br />
                <span className="text-rose-600">Trao Trọn Yêu Thương</span>
              </h1>
              <p className="text-sm sm:text-base text-stone-600 max-w-lg leading-relaxed">
                Tặng hoa tươi nhập khẩu phối quà sang trọng, kèm thiệp viết tay miễn phí. Cam kết hoa tươi nguyên bản trên 3 ngày cùng chính sách đổi trả minh bạch.
              </p>

              {/* Service Badges */}
              <div className="grid grid-cols-3 gap-3 pt-2 text-center sm:text-left">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="text-xs font-medium text-stone-700">Giao nhanh 2H</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="text-xs font-medium text-stone-700">Hoa Tươi 100%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="text-xs font-medium text-stone-700">Tặng Thiệp & Nơ</span>
                </div>
              </div>
            </div>

            {/* Banner Showcase Image */}
            <div className="relative flex justify-center">
              <div className="relative w-full max-w-md h-64 sm:h-80 rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800&auto=format&fit=crop&q=80"
                  alt="Hoa tươi sang trọng"
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent flex items-end p-5 text-white">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 bg-rose-600 text-white text-[11px] font-bold rounded-md mb-1.5 uppercase tracking-normal">
                      Bộ sưu tập mới
                    </span>
                    <h3 className="text-base sm:text-lg font-bold">Pastel Romantic Collection</h3>
                    <p className="text-xs text-stone-200">Giảm thêm 10% khi đặt trước cho sự kiện</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          3. CATEGORIES & FILTER BAR
      ========================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-rose-100">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 shadow-sm ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-rose-200'
                      : 'bg-white text-stone-600 hover:bg-rose-50 hover:text-rose-600 border border-stone-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Same-day checkbox */}
          <label className="inline-flex items-center gap-2.5 cursor-pointer bg-white px-4 py-2 rounded-full border border-stone-200 text-xs sm:text-sm font-medium text-stone-700 select-none hover:border-rose-300 transition-colors">
            <input
              type="checkbox"
              checked={sameDayOnly}
              onChange={(e) => setSameDayOnly(e.target.checked)}
              className="w-4 h-4 text-rose-600 rounded border-stone-300 focus:ring-rose-500 focus:ring-offset-0"
            />
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-rose-600" />
              Chỉ hiện giao nhanh trong ngày
            </span>
          </label>
        </div>
      </section>

      {/* ==========================================
          4. PRODUCT GRID
      ========================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Loading Indicator */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-stone-500">
            <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
            <p className="text-sm font-medium">Đang tải danh sách hoa và quà tặng tươi mới...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="max-w-lg mx-auto my-12 bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-800">
            <AlertCircle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
            <h3 className="text-base font-bold mb-1">Không thể tải dữ liệu</h3>
            <p className="text-xs text-rose-600 mb-4">{error}</p>
            <button
              onClick={fetchProducts}
              className="px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 transition-colors"
            >
              Thử lại ngay
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-300 p-8 max-w-md mx-auto my-8">
            <Flower2 className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-stone-700">Chưa có sản phẩm phù hợp</h3>
            <p className="text-xs text-stone-500 mt-1 mb-4">
              Hãy thử chọn danh mục khác hoặc bỏ chọn bộ lọc giao nhanh trong ngày.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSameDayOnly(false);
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-full hover:bg-rose-700"
            >
              Xem tất cả sản phẩm
            </button>
          </div>
        )}

        {/* Grid List */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const discountPercent =
                product.original_price > product.price
                  ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
                  : 0;

              return (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl overflow-hidden border border-rose-100/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  {/* Thumbnail & Badges */}
                  <div className="relative aspect-square overflow-hidden bg-stone-100">
                    <img
                      src={product.images[0] || 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Same-day Tag */}
                    {product.is_same_day && (
                      <div className="absolute top-2.5 left-2.5 bg-amber-500/90 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[10px] font-bold tracking-normal flex items-center gap-1 shadow-sm">
                        <Clock className="w-3 h-3" />
                        Giao 2H
                      </div>
                    )}

                    {/* Discount Badge */}
                    {discountPercent > 0 && (
                      <div className="absolute top-2.5 right-2.5 bg-rose-600 text-white px-2 py-0.5 rounded-full text-[11px] font-extrabold flex items-center gap-0.5 shadow-sm">
                        <Percent className="w-3 h-3" />
                        -{discountPercent}%
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      {/* Vendor */}
                      <div className="flex items-center gap-1 text-[11px] font-medium text-stone-500 mb-1">
                        <Store className="w-3 h-3 text-rose-500" />
                        <span>{product.vendor_name || 'Tiệm Hoa Sài Gòn'}</span>
                      </div>

                      {/* Product Name */}
                      <h3 className="font-semibold text-stone-900 text-sm line-clamp-2 leading-snug group-hover:text-rose-600 transition-colors">
                        {product.name}
                      </h3>

                      {/* Description */}
                      <p className="text-stone-500 text-xs mt-1 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    {/* Price & Order Button */}
                    <div className="pt-2 border-t border-stone-100">
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-base sm:text-lg font-bold text-rose-600 font-serif">
                          {formatCurrency(product.price)}
                        </span>
                        {product.original_price > product.price && (
                          <span className="text-xs text-stone-400 line-through">
                            {formatCurrency(product.original_price)}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleOpenOrderModal(product)}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Đặt Hàng Ngay</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ==========================================
          5. MODAL ĐẶT HÀNG & TÙY BIẾN QUÀ TẶNG
      ========================================== */}
      {isOrderModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-rose-100 my-8">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flower2 className="w-5 h-5 text-rose-600" />
                <h3 className="text-base sm:text-lg font-bold text-stone-900 font-serif">
                  Tùy Biến Quà Tặng & Đặt Hàng
                </h3>
              </div>
              <button
                onClick={() => setIsOrderModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitOrder} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Product Brief Summary */}
              <div className="flex items-center gap-4 p-3.5 bg-rose-50/50 rounded-2xl border border-rose-100">
                <img
                  src={selectedProduct.images[0]}
                  alt={selectedProduct.name}
                  className="w-16 h-16 rounded-xl object-cover shrink-0 border border-white shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-stone-900 truncate">{selectedProduct.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm font-bold text-rose-600 font-serif">
                      {formatCurrency(selectedProduct.price)}
                    </span>
                    <span className="text-[11px] text-stone-500">| Tồn kho: {selectedProduct.stock}</span>
                  </div>
                </div>

                {/* Quantity Controller */}
                <div className="flex items-center border border-stone-200 rounded-lg bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-2.5 py-1 text-stone-600 hover:bg-stone-100 font-bold text-xs"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-xs font-bold text-stone-800">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(selectedProduct.stock, q + 1))}
                    className="px-2.5 py-1 text-stone-600 hover:bg-stone-100 font-bold text-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Addons Selection */}
              {selectedProduct.addons && selectedProduct.addons.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-800 uppercase tracking-normal flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-rose-600" />
                    Chọn thêm quà tặng kèm (Add-ons)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedProduct.addons.map((addon) => {
                      const isSelected = selectedAddons.includes(addon.name);
                      return (
                        <div
                          key={addon.name}
                          onClick={() => toggleAddon(addon.name)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all select-none ${
                            isSelected
                              ? 'bg-rose-50/80 border-rose-500 font-medium text-rose-900 shadow-sm'
                              : 'bg-white border-stone-200 text-stone-700 hover:border-rose-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              readOnly
                              checked={isSelected}
                              className="rounded text-rose-600 focus:ring-0"
                            />
                            <span>{addon.name}</span>
                          </div>
                          <span className="font-bold text-rose-600 font-serif">
                            {addon.price === 0 ? 'Miễn phí' : `+${formatCurrency(addon.price)}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Greeting Card Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-800 uppercase tracking-normal flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-rose-600" />
                  Nội dung thiệp chúc mừng viết tay (Miễn phí)
                </label>
                <textarea
                  rows={2}
                  value={cardMessage}
                  onChange={(e) => setCardMessage(e.target.value)}
                  placeholder="Ví dụ: Chúc mừng sinh nhật em yêu! Chúc em luôn rạng rỡ và hạnh phúc..."
                  className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                />
              </div>

              {/* Delivery Schedule */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-800 uppercase tracking-normal flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-rose-600" />
                    Ngày giao hàng
                  </label>
                  <input
                    type="date"
                    required
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    max="2035-12-31"
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-800 uppercase tracking-normal flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-rose-600" />
                    Khung giờ nhận hoa
                  </label>
                  <select
                    value={deliveryTimeSlot}
                    onChange={(e) => setDeliveryTimeSlot(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 bg-white"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Recipient Details */}
              <div className="space-y-3 pt-2 border-t border-stone-100">
                <h5 className="text-xs font-bold text-stone-800 uppercase tracking-normal">
                  Thông tin người nhận
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Họ và tên người nhận *"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Số điện thoại người nhận *"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    className="text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                  />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Địa chỉ giao hoa chi tiết (Số nhà, tên đường, phường/xã, quận/huyện) *"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                />

                {/* Anonymous gift checkbox */}
                <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-600 select-none">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-0"
                  />
                  <span>Giữ bí mật thông tin người gửi (Tạo bất ngờ cho người nhận)</span>
                </label>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-stone-500 block">Tổng thanh toán dự kiến:</span>
                  <span className="text-xl sm:text-2xl font-bold text-rose-600 font-serif">
                    {formatCurrency(calculatedTotal)}
                  </span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsOrderModalOpen(false)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 border border-stone-200"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-200 transition-all disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      <>
                        <span>Tiến Hành Thanh Toán</span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          6. MODAL HIỂN THỊ VIETQR THANH TOÁN
      ========================================== */}
      {isPaymentModalOpen && orderResult && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-rose-100 p-6 text-center my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Success Checkmark Icon */}
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-stone-900 font-serif">Khởi Tạo Đơn Hàng Thành Công!</h3>
            <p className="text-xs text-stone-500 mt-1">
              Mã đơn hàng: <strong className="text-stone-800 font-mono">#{orderResult.order_id}</strong>
            </p>

            {/* Render VietQR Code Image */}
            <div className="my-5 p-4 bg-stone-50 rounded-2xl border border-stone-200 inline-block shadow-sm">
              <img
                src={orderResult.payment_qr_url}
                alt="VietQR Payment Code"
                className="w-56 h-auto mx-auto rounded-lg shadow-sm"
              />
              <p className="text-[11px] text-stone-500 mt-2 font-medium">
                Quét mã qua ứng dụng Ngân hàng hoặc ví điện tử (MoMo/ZaloPay)
              </p>
            </div>

            {/* Payment Details */}
            <div className="bg-rose-50/70 rounded-xl p-3.5 text-xs text-left space-y-2 border border-rose-100 mb-5">
              <div className="flex justify-between items-center">
                <span className="text-stone-600">Số tiền thanh toán:</span>
                <span className="font-bold text-rose-600 font-serif text-sm">
                  {formatCurrency(orderResult.total_amount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-600">Nội dung chuyển khoản:</span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-stone-900 bg-white px-2 py-0.5 rounded border border-rose-200">
                  <span>{orderResult.transfer_memo}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyMemo(orderResult.transfer_memo)}
                    title="Sao chép nội dung"
                    className="text-rose-600 hover:text-rose-800"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {copiedMemo && (
                <p className="text-[10px] text-emerald-600 text-right font-medium">
                  ✓ Đã sao chép nội dung chuyển khoản!
                </p>
              )}
            </div>

            {/* Action Button */}
            <button
              onClick={() => setIsPaymentModalOpen(false)}
              className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-200 transition-all"
            >
              Đã Chuyển Khoản & Đóng
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          7. MODAL DỊCH VỤ NHẮC NHỞ NGÀY KỶ NIỆM (REMINDER SERVICE)
      ========================================== */}
      {isReminderModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-rose-100 my-8">
            {/* Header Modal */}
            <div className="px-6 py-4 bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 border-b border-rose-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shadow-inner">
                  <CalendarHeart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 font-serif">
                    Dịch Vụ Nhắc Nhở Ngày Kỷ Niệm
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Không bỏ lỡ bất kỳ dịp đặc biệt nào của người thân yêu
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReminderModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-stone-200 bg-stone-50/50 px-6 pt-3 gap-4">
              <button
                type="button"
                onClick={() => setReminderTab('create')}
                className={`pb-2.5 text-xs font-bold transition-all relative ${
                  reminderTab === 'create'
                    ? 'text-rose-600 border-b-2 border-rose-600'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Đăng ký sự kiện mới
              </button>
              <button
                type="button"
                onClick={() => {
                  setReminderTab('list');
                  if (reminderEmail.trim() && !hasSearchedReminders) {
                    setSearchReminderEmail(reminderEmail.trim());
                  }
                }}
                className={`pb-2.5 text-xs font-bold transition-all relative ${
                  reminderTab === 'list'
                    ? 'text-rose-600 border-b-2 border-rose-600'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Sự kiện của tôi
              </button>
            </div>

            {/* TAB 1: FORM ĐĂNG KÝ NHẮC NHỞ */}
            {reminderTab === 'create' && (
              <form onSubmit={handleCreateReminder} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {/* Banner Thông báo kết quả */}
                {reminderSuccessMsg && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="flex-1 font-medium">{reminderSuccessMsg}</span>
                  </div>
                )}

                {reminderErrorMsg && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-800 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="flex-1 font-medium">{reminderErrorMsg}</span>
                  </div>
                )}

                {/* Email nhận thông báo */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-rose-500" />
                    <span>Email của bạn (Nhận thông báo nhắc nhở) *</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="example@gmail.com"
                    value={reminderEmail}
                    onChange={(e) => setReminderEmail(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                  />
                </div>

                {/* Tên người nhận & Dịp kỷ niệm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-rose-500" />
                      <span>Người nhận quà *</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Vợ yêu, Mẹ, Bạn gái..."
                      value={reminderRecipient}
                      onChange={(e) => setReminderRecipient(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-rose-500" />
                      <span>Tên dịp kỷ niệm *</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Sinh nhật, Kỷ niệm ngày cưới..."
                      value={reminderOccasion}
                      onChange={(e) => setReminderOccasion(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                    />
                  </div>
                </div>

                {/* Ngày diễn ra sự kiện & Thời gian nhắc trước */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-rose-500" />
                        <span>Ngày diễn ra sự kiện *</span>
                      </label>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setReminderEventDate(getFutureDate(7))}
                          className="px-1.5 py-0.5 text-[10px] bg-rose-50 text-rose-700 hover:bg-rose-100 rounded font-medium transition-colors"
                        >
                          +7 ngày
                        </button>
                        <button
                          type="button"
                          onClick={() => setReminderEventDate(getFutureDate(14))}
                          className="px-1.5 py-0.5 text-[10px] bg-rose-50 text-rose-700 hover:bg-rose-100 rounded font-medium transition-colors"
                        >
                          +14 ngày
                        </button>
                        <button
                          type="button"
                          onClick={() => setReminderEventDate(getFutureDate(30))}
                          className="px-1.5 py-0.5 text-[10px] bg-rose-50 text-rose-700 hover:bg-rose-100 rounded font-medium transition-colors"
                        >
                          +30 ngày
                        </button>
                      </div>
                    </div>
                    <input
                      type="date"
                      required
                      value={reminderEventDate}
                      onChange={(e) => setReminderEventDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      max="2035-12-31"
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-rose-500" />
                      <span>Thời điểm nhắc trước</span>
                    </label>
                    <select
                      value={reminderBeforeDays}
                      onChange={(e) => setReminderBeforeDays(Number(e.target.value))}
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 bg-white"
                    >
                      {BEFORE_DAYS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Ghi chú sở thích/loại quà */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-rose-500" />
                    <span>Ghi chú sở thích / quà tặng dự kiến (Tùy chọn)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={reminderNotes}
                    onChange={(e) => setReminderNotes(e.target.value)}
                    placeholder="Ví dụ: Thích hoa tulip pastel, tone màu hồng ngọt ngào, kèm nến thơm..."
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsReminderModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl border border-stone-200"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    disabled={isReminderSubmitting}
                    className="flex items-center gap-2 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-200 transition-all disabled:opacity-60"
                  >
                    {isReminderSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang lưu...</span>
                      </>
                    ) : (
                      <>
                        <Bell className="w-4 h-4" />
                        <span>Lưu Nhắc Nhở</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: DANH SÁCH SỰ KIỆN CỦA TÔI */}
            {reminderTab === 'list' && (
              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {/* Thanh tìm kiếm theo email */}
                <form onSubmit={handleFetchMyReminders} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="email"
                      required
                      placeholder="Nhập email của bạn để tra cứu sự kiện..."
                      value={searchReminderEmail}
                      onChange={(e) => setSearchReminderEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                    />
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  </div>
                  <button
                    type="submit"
                    disabled={isFetchingReminders}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-60"
                  >
                    {isFetchingReminders ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    <span>Tra cứu</span>
                  </button>
                </form>

                {/* Danh sách các sự kiện đã lưu */}
                {isFetchingReminders && (
                  <div className="py-12 flex flex-col items-center justify-center text-stone-400 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-rose-600" />
                    <p className="text-xs">Đang tìm kiếm các dịp kỷ niệm...</p>
                  </div>
                )}

                {!isFetchingReminders && hasSearchedReminders && myReminders.length === 0 && (
                  <div className="text-center py-10 bg-rose-50/50 rounded-2xl border border-dashed border-rose-200 p-6">
                    <CalendarHeart className="w-8 h-8 text-rose-300 mx-auto mb-2" />
                    <h5 className="text-xs font-bold text-stone-700">Chưa có sự kiện nào được lưu</h5>
                    <p className="text-[11px] text-stone-500 mt-1 mb-3">
                      Email này chưa đăng ký ngày kỷ niệm nào. Hãy chuyển qua tab "Đăng ký sự kiện mới"!
                    </p>
                    <button
                      type="button"
                      onClick={() => setReminderTab('create')}
                      className="text-xs text-rose-600 font-bold hover:underline"
                    >
                      + Đăng ký ngay
                    </button>
                  </div>
                )}

                {!isFetchingReminders && myReminders.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-stone-500 font-medium pb-1 border-b border-stone-100">
                      <span>Tìm thấy {myReminders.length} ngày kỷ niệm:</span>
                      <button
                        type="button"
                        onClick={() => handleFetchMyReminders()}
                        className="text-rose-600 hover:text-rose-700 flex items-center gap-1 text-[11px] font-semibold"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Làm mới</span>
                      </button>
                    </div>

                    {myReminders.map((reminder) => (
                      <div
                        key={reminder.id}
                        className="p-3.5 bg-stone-50 hover:bg-rose-50/40 rounded-2xl border border-stone-200 transition-all flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900 text-xs">
                              {reminder.occasion_name}
                            </span>
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-700 font-bold text-[10px] rounded-full">
                              Tặng: {reminder.recipient_name}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-stone-500 pt-0.5">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-rose-500" />
                              <strong>Ngày: {reminder.event_date}</strong>
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-stone-400" />
                              Nhắc trước {reminder.remind_before_days} ngày
                            </span>
                          </div>

                          {reminder.notes && (
                            <p className="text-[11px] text-stone-600 italic bg-white p-2 rounded-lg border border-stone-100 mt-1.5">
                              "{reminder.notes}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==========================================
          8. FOOTER
      ========================================== */}
      <footer className="bg-white border-t border-rose-100 text-stone-600 text-xs py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-rose-700 font-bold font-serif text-base">
            <Flower2 className="w-5 h-5" />
            <span>Potico Garden - Trao Hoa Tươi, Gửi Yêu Thương</span>
          </div>
          <p className="text-stone-400">
            Dịch vụ điện hoa & quà tặng chuyên nghiệp toàn quốc • Hỗ trợ 24/7
          </p>
          <p className="text-[11px] text-stone-400 pt-2">
            © 2026 Flowers Websites. Powered by FastAPI, MongoDB Atlas & React TypeScript.
          </p>
        </div>
      </footer>
    </div>
  );
}
