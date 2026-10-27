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
  composition?: string;
  size?: string;
  freshness_guarantee?: string;
  tag?: string;
  tags?: string[];
}

export interface CartItem {
  id: string; // unique item id in cart (e.g. productId_addonsHash)
  product: Product;
  quantity: number;
  selectedAddons: Addon[];
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
  user_email?: string;
}

export interface OrderResponse {
  order_id: string;
  payment_qr_url: string;
  transfer_memo: string;
  total_amount: number;
  message: string;
}

export type OrderStatus = 'pending_payment' | 'arranging' | 'shipping' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  recipient_name: string;
  recipient_phone: string;
  delivery_address: string;
  delivery_date: string;
  delivery_time_slot: string;
  card_message?: string;
  is_anonymous?: boolean;
  items: OrderItem[];
  total_amount: number;
  user_email?: string;
  status: OrderStatus;
  created_at?: string;
  payment_qr_url?: string;
  transfer_memo?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  phone?: string;
}

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

export interface Category {
  id: string;
  label: string;
  description?: string;
}
