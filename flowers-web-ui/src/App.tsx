import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import {
  Flower2,
  Gift,
  Clock,
  ShieldCheck,
  RotateCcw,
  RefreshCw,
  AlertCircle,
  Search,
  ChevronDown,
} from 'lucide-react';

import type { Product, CartItem, Addon, OrderCreateRequest, OrderResponse, User } from './types';
import { API_BASE_URL, CATEGORIES, DEFAULT_ADDONS } from './data/mockData';

import { Header } from './components/Header';
import { PoticoHeroBanner } from './components/PoticoHeroBanner';
import { ProductCard } from './components/ProductCard';
import { ProductDetailPage } from './components/ProductDetailPage';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { VietQRPaymentModal } from './components/VietQRPaymentModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { ReminderModal } from './components/ReminderModal';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { Footer } from './components/Footer';
import { ZaloBubble } from './components/ZaloBubble';
import { Toast } from './components/Toast';
import type { ToastMessage } from './components/Toast';

export default function App() {
  // 1. Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 2. Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sameDayOnly, setSameDayOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [budgetFilter, setBudgetFilter] = useState<string>('all');

  // 3. Persistent User State
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('potico_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // 4. Persistent Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem('potico_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  // 5. Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Save cart & user to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('potico_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('potico_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('potico_user');
      }
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  // 6. Modals Control State
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  // Open Product Detail with HTML5 History API
  const handleOpenProductDetail = useCallback((product: Product, pushHistory = true) => {
    setDetailProduct(product);
    if (pushHistory) {
      const slug = product.slug || product.id;
      window.history.pushState(
        { page: 'detail', slug, productId: product.id },
        '',
        `?product=${encodeURIComponent(slug)}`
      );
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Close Product Detail / Return to Catalog
  const handleCloseProductDetail = useCallback((fromPopState = false) => {
    setDetailProduct(null);
    if (!fromPopState) {
      window.history.pushState({ page: 'home' }, '', window.location.pathname);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Checkout modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutSingleProduct, setCheckoutSingleProduct] = useState<Product | null>(null);
  const [checkoutSingleQty, setCheckoutSingleQty] = useState(1);
  const [checkoutAddons, setCheckoutAddons] = useState<Addon[]>([]);
  const [checkoutVariant, setCheckoutVariant] = useState<'standard' | 'premium'>('standard');
  const [checkoutDeliveryDate, setCheckoutDeliveryDate] = useState<string>('');
  const [checkoutTimeSlot, setCheckoutTimeSlot] = useState<string>('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Payment QR modal
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [orderResult, setOrderResult] = useState<OrderResponse | null>(null);

  // Other modals
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // 7. Fetch Products from Backend API
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `${API_BASE_URL}/api/products`;
      const params: Record<string, any> = {};

      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      if (sameDayOnly) {
        params.same_day = true;
      }
      if (searchQuery.trim()) {
        params.q = searchQuery.trim();
      }

      const response = await axios.get<Product[]>(url, { params });
      setProducts(response.data);
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách sản phẩm:', err);
      setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại dịch vụ.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, sameDayOnly, searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Synchronize browser history (Back / Forward buttons) to prevent blank pages
  useEffect(() => {
    // Initialize history state on first render
    if (!window.history.state) {
      window.history.replaceState(
        { page: 'home' },
        '',
        window.location.pathname + window.location.search
      );
    }

    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const productSlug = urlParams.get('product');

      if (productSlug) {
        // Forward or back into a product detail
        const found = products.find((p) => p.slug === productSlug || p.id === productSlug);
        if (found) {
          setDetailProduct(found);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        // Back to home/catalog: smooth return without any blank page
        setDetailProduct(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [products]);

  // Restore product on page reload if URL has ?product=...
  useEffect(() => {
    if (products.length > 0 && !detailProduct) {
      const urlParams = new URLSearchParams(window.location.search);
      const productSlug = urlParams.get('product');
      if (productSlug) {
        const found = products.find((p) => p.slug === productSlug || p.id === productSlug);
        if (found) {
          setDetailProduct(found);
        }
      }
    }
  }, [products, detailProduct]);

  // 8. Sorting & Filtering
  const processedProducts = useMemo(() => {
    let list = [...products];

    // Filter by budget
    if (budgetFilter === 'under-300') {
      list = list.filter((p) => p.price < 300000);
    } else if (budgetFilter === '300-600') {
      list = list.filter((p) => p.price >= 300000 && p.price <= 600000);
    } else if (budgetFilter === '600-1000') {
      list = list.filter((p) => p.price > 600000 && p.price <= 1000000);
    } else if (budgetFilter === 'above-1000') {
      list = list.filter((p) => p.price > 1000000);
    }

    // Sort
    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    }
    return list;
  }, [products, sortBy, budgetFilter]);

  // 9. Cart Actions
  const totalCartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const handleAddToCart = (product: Product, quantity = 1, addons: Addon[] = []) => {
    const chosenAddons = addons.length > 0 ? addons : [DEFAULT_ADDONS[0]];
    const addonsKey = chosenAddons.map((a) => a.name).sort().join('_');
    const itemId = `${product.id}_${addonsKey}`;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      if (existing) {
        return prev.map((item) =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          id: itemId,
          product,
          quantity,
          selectedAddons: chosenAddons,
        },
      ];
    });

    addToast('success', `Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  const handleUpdateCartQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveCartItem(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveCartItem = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
    addToast('info', 'Đã xóa sản phẩm khỏi giỏ hàng.');
  };

  // 10. Purchase Actions
  // "Đặt Hàng Ngay" button on Card
  const handleQuickOrder = (product: Product) => {
    setCheckoutSingleProduct(product);
    setCheckoutSingleQty(1);
    setCheckoutAddons([DEFAULT_ADDONS[0]]);
    setCheckoutVariant('standard');
    setCheckoutDeliveryDate('');
    setCheckoutTimeSlot('');
    setIsCheckoutOpen(true);
  };

  // "Mua Ngay" in Detail Page
  const handleBuyNowFromDetail = (
    product: Product,
    quantity: number,
    addons: Addon[],
    variant: 'standard' | 'premium' = 'standard',
    deliveryDate = '',
    timeSlot = ''
  ) => {
    setCheckoutSingleProduct(product);
    setCheckoutSingleQty(quantity);
    setCheckoutAddons(addons);
    setCheckoutVariant(variant);
    setCheckoutDeliveryDate(deliveryDate);
    setCheckoutTimeSlot(timeSlot);
    setIsCheckoutOpen(true);
  };

  // "Tiến Hành Đặt Hàng" in Cart Drawer
  const handleCheckoutFromCart = () => {
    setCheckoutSingleProduct(null);
    setIsCheckoutOpen(true);
  };

  // Submit Order to Backend
  const handleSubmitOrder = async (orderData: OrderCreateRequest) => {
    setIsSubmittingOrder(true);
    try {
      const response = await axios.post<OrderResponse>(`${API_BASE_URL}/api/orders`, orderData);
      setOrderResult(response.data);
      setIsCheckoutOpen(false);
      setIsPaymentOpen(true);

      // If purchased from cart, clear cart
      if (!checkoutSingleProduct) {
        setCart([]);
      }

      addToast('success', 'Khởi tạo đơn hàng thành công! Quét mã VietQR để thanh toán.');
    } catch (err: any) {
      console.error('Lỗi khi gửi đơn hàng:', err);
      addToast('error', err.response?.data?.detail || 'Không thể tạo đơn hàng. Vui lòng thử lại!');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // User Auth Actions
  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    addToast('success', `Chào mừng ${loggedInUser.name} đã đăng nhập!`);
  };

  const handleLogout = () => {
    setUser(null);
    addToast('info', 'Bạn đã đăng xuất khỏi tài khoản.');
  };

  return (
    <div className="min-h-screen bg-[#fdfbf9] text-stone-800 flex flex-col font-sans selection:bg-rose-100 selection:text-rose-800">
      {/* 1. Header with Cart Badge, Search, Google Auth */}
      <Header
        user={user}
        cartCount={totalCartCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onOpenReminders={() => setIsRemindersOpen(true)}
        onLogout={handleLogout}
        onGoHome={() => {
          handleCloseProductDetail();
          setSearchQuery('');
        }}
      />

      {detailProduct ? (
        /* Full Product Detail Page (Potico Style - Replicating Reference Images 1 & 2) */
        <ProductDetailPage
          product={detailProduct}
          allProducts={products}
          onBackToHome={() => handleCloseProductDetail()}
          onSelectProduct={(p) => handleOpenProductDetail(p)}
          onAddToCart={(p, qty, addons, variant) => {
            const productWithVariant =
              variant === 'premium'
                ? { ...p, price: p.price + 150000, name: `${p.name} (Gói Cao Cấp)` }
                : p;
            handleAddToCart(productWithVariant, qty, addons);
          }}
          onBuyNow={(p, qty, addons, variant, date, time) => {
            handleBuyNowFromDetail(p, qty, addons, variant, date, time);
          }}
        />
      ) : (
        <>
          {/* 2. Potico Hero Interactive Carousel Banner with Special Reload Effects */}
          <PoticoHeroBanner
            onSelectCategory={(catId) => {
              setSelectedCategory(catId);
              const catalogElem = document.getElementById('product-catalog');
              if (catalogElem) {
                catalogElem.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            onSelectFlashSaleProduct={() => {
              const flashProduct =
                products.find((p) => p.category === 'hoa-tinh-yeu') || products[0];
              if (flashProduct) {
                handleOpenProductDetail(flashProduct);
              }
            }}
          />

          {/* Guarantees Strip */}
          <div className="bg-white border-b border-rose-100/60 py-3 relative z-10 shadow-2xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-stone-600">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-500" /> Giao hỏa tốc trong 2 giờ
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Cam kết hoa tươi tối thiểu 3 ngày
              </span>
              <span className="flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-amber-500" /> Đổi mới 100% nếu dập héo
              </span>
              <span className="flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-purple-500" /> Miễn phí thiệp thiết kế riêng
              </span>
            </div>
          </div>

      {/* 3. Category Bar & Filter Controls (Clean & Minimalist style) */}
      <section className="sticky top-20 z-30 bg-white/95 backdrop-blur-md py-3.5 border-b border-stone-200/70 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          {/* Minimal Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Minimalist Filter & Search Toolbar (Matching Reference Screenshot) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-stone-100">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Dropdown 1: Liên quan nhất */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="appearance-none bg-white border border-stone-300 hover:border-stone-400 text-stone-700 text-xs sm:text-sm font-medium rounded-lg pl-3.5 pr-8 py-2 focus:outline-none focus:border-[#8a98c8] focus:ring-1 focus:ring-[#8a98c8] cursor-pointer shadow-2xs transition-colors"
                >
                  <option value="default">Liên quan nhất</option>
                  <option value="price-asc">Giá: Thấp đến Cao</option>
                  <option value="price-desc">Giá: Cao đến Thấp</option>
                </select>
                <ChevronDown className="w-4 h-4 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Dropdown 2: Ngân sách (with highlighted active border) */}
              <div className="relative">
                <select
                  value={budgetFilter}
                  onChange={(e) => setBudgetFilter(e.target.value)}
                  className={`appearance-none bg-white border text-stone-700 text-xs sm:text-sm font-medium rounded-lg pl-3.5 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-[#8a98c8]/30 cursor-pointer shadow-2xs transition-colors ${
                    budgetFilter !== 'all'
                      ? 'border-[#8a98c8] ring-1 ring-[#8a98c8]'
                      : 'border-[#8a98c8] hover:border-indigo-400'
                  }`}
                >
                  <option value="all">Ngân sách</option>
                  <option value="under-300">Dưới 300.000đ</option>
                  <option value="300-600">300.000đ - 600.000đ</option>
                  <option value="600-1000">600.000đ - 1.000.000đ</option>
                  <option value="above-1000">Trên 1.000.000đ</option>
                </select>
                <ChevronDown className="w-4 h-4 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Toggle Same Day */}
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:border-emerald-300 text-xs font-semibold text-stone-700 cursor-pointer transition-colors shadow-2xs">
                <input
                  type="checkbox"
                  checked={sameDayOnly}
                  onChange={(e) => setSameDayOnly(e.target.checked)}
                  className="w-3.5 h-3.5 text-emerald-600 rounded-sm border-stone-300 focus:ring-emerald-500"
                />
                <span className="text-emerald-700 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Giao 2H
                </span>
              </label>
            </div>

            {/* Search Input + TÌM KIẾM Button Group */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSearchQuery(searchInput);
              }}
              className="flex items-center w-full sm:w-auto"
            >
              <div className="relative flex-1 sm:w-56 md:w-64">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    if (e.target.value === '' && searchQuery !== '') {
                      setSearchQuery('');
                    }
                  }}
                  className="w-full bg-white border border-stone-300 rounded-l-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#8a98c8] shadow-2xs"
                />
              </div>
              <button
                type="submit"
                className="bg-[#8a98c8] hover:bg-[#7887b8] text-white px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-r-lg shadow-2xs transition-colors shrink-0"
              >
                TÌM KIẾM
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 4. Product Catalog Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Section Header */}
        <div className="flex items-end justify-between mb-6 pb-2.5 border-b border-stone-200/80">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
              {CATEGORIES.find((c) => c.id === selectedCategory)?.label || 'Bộ Sưu Tập'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              {searchQuery
                ? `Kết quả tìm kiếm cho: "${searchQuery}"`
                : 'Hoa tươi thiết kế tinh xảo & quà tặng cao cấp'}
            </p>
          </div>

          <span className="text-xs sm:text-sm font-medium text-stone-500">
            {processedProducts.length} sản phẩm
          </span>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-stone-400">
            <RefreshCw className="w-10 h-10 animate-spin text-rose-500 mb-3" />
            <p className="text-sm font-medium">Đang tải danh sách hoa tươi...</p>
          </div>
        ) : processedProducts.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-stone-200/80 p-8 shadow-xs max-w-md mx-auto">
            <Flower2 className="w-14 h-14 text-stone-300 mx-auto mb-3 stroke-[1.5]" />
            <h3 className="text-base font-bold text-stone-800 mb-1">
              Không tìm thấy sản phẩm phù hợp
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 mb-5">
              Vui lòng thử tìm kiếm từ khóa khác hoặc thiết lập lại bộ lọc.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSameDayOnly(false);
                setSearchQuery('');
                setSearchInput('');
                setBudgetFilter('all');
                setSortBy('default');
              }}
              className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all"
            >
              Xem Tất Cả Sản Phẩm
            </button>
          </div>
        ) : (
          /* Products Grid (6 Columns on XL Screens) */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {processedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetail={(p) => handleOpenProductDetail(p)}
                onQuickOrder={handleQuickOrder}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </main>
        </>
      )}

      {/* 5. Modals & Drawers */}
      {/* Shopping Cart Drawer */}

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={handleCheckoutFromCart}
      />

      {/* Checkout / Order Customization Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        singleProduct={checkoutSingleProduct}
        singleQuantity={checkoutSingleQty}
        initialAddons={checkoutAddons}
        initialVariant={checkoutVariant}
        initialDeliveryDate={checkoutDeliveryDate}
        initialDeliveryTimeSlot={checkoutTimeSlot}
        cartItems={cart}
        currentUser={user}
        onSubmitOrder={handleSubmitOrder}
        isSubmitting={isSubmittingOrder}
      />

      {/* VietQR Payment Modal */}
      <VietQRPaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        orderResult={orderResult}
        onViewMyOrders={() => setIsOrdersOpen(true)}
      />

      {/* Order History Modal */}
      <OrderHistoryModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        currentUser={user}
        onOpenQR={(res) => {
          setOrderResult(res);
          setIsPaymentOpen(true);
        }}
      />

      {/* Anniversary Reminder Modal */}
      <ReminderModal
        isOpen={isRemindersOpen}
        onClose={() => setIsRemindersOpen(false)}
        currentUser={user}
      />

      {/* Google Auth Modal */}
      <GoogleAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Floating Zalo Chat Bubble */}
      <ZaloBubble phoneNumber="0987270812" />

      {/* 6. Footer (4 Columns) */}
      <Footer />
    </div>
  );
}
