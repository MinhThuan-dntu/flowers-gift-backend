import type { Addon } from '../types';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://127.0.0.1:8000';

export const DEFAULT_ADDONS: Addon[] = [
  { name: 'Thiệp viết tay cao cấp (Miễn phí)', price: 0 },
  { name: 'Hộp Socola Ferrero Rocher (5 viên)', price: 65000 },
  { name: 'Gấu bông mini ôm tim tình yêu', price: 85000 },
  { name: 'Đèn led đom đóm phát sáng lung linh', price: 35000 },
];

export const TIME_SLOTS = [
  '08:00 - 10:00 (Buổi sáng tươi mát)',
  '10:00 - 12:00 (Giao trưa đúng hẹn)',
  '13:30 - 15:30 (Đầu giờ chiều)',
  '15:30 - 17:30 (Cuối giờ chiều)',
  '18:00 - 20:30 (Bữa tối lãng mạn)',
];

export const BEFORE_DAYS_OPTIONS = [
  { value: 1, label: 'Nhắc trước 1 ngày' },
  { value: 3, label: 'Nhắc trước 3 ngày (Khuyên dùng)' },
  { value: 7, label: 'Nhắc trước 7 ngày (1 tuần)' },
];

export const CATEGORIES = [
  { id: 'all', label: 'Tất Cả Sản Phẩm' },
  { id: 'gau-bong', label: 'Gấu Bông' },
  { id: 'hoa-sinh-nhat', label: 'Hoa Sinh Nhật' },
  { id: 'hoa-tinh-yeu', label: 'Hoa Tình Yêu & Hồng' },
  { id: 'hoa-khai-truong', label: 'Khai Trương & Hướng Dương' },
  { id: 'cam-tu-cau', label: 'Cẩm Tú Cầu' },
  { id: 'tulip', label: 'Hoa Tulip Hà Lan' },
  { id: 'baby-flower', label: 'Hoa Baby' },
  { id: 'qua-tang', label: 'Cây Mọng & Quà Tặng' },
];

export const MOCK_USERS = [
  {
    id: 'user_1',
    name: 'Vũ Minh Thuận',
    email: 'thuan.vu@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    phone: '0908123456',
  },
  {
    id: 'user_2',
    name: 'Trần Phương Thảo',
    email: 'thao.tp@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    phone: '0912345678',
  },
  {
    id: 'user_3',
    name: 'Nguyễn Hoàng Nam',
    email: 'nam.nguyen@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    phone: '0987654321',
  },
];

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};
