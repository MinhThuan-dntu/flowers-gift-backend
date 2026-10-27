import React, { useState, useEffect } from 'react';
import {
  X,
  CalendarHeart,
  Calendar,
  Bell,
  Mail,
  User as UserIcon,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import type { Reminder, ReminderCreateRequest, User } from '../types';
import { BEFORE_DAYS_OPTIONS, API_BASE_URL } from '../data/mockData';
import axios from 'axios';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');

  // Form State
  const [email, setEmail] = useState(currentUser?.email || '');
  const [recipientName, setRecipientName] = useState('');
  const [occasionName, setOccasionName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [remindBeforeDays, setRemindBeforeDays] = useState(3);
  const [notes, setNotes] = useState('');

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // List State
  const [myReminders, setMyReminders] = useState<Reminder[]>([]);
  const [searchEmail, setSearchEmail] = useState(currentUser?.email || '');
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (currentUser?.email) {
      setEmail(currentUser.email);
      setSearchEmail(currentUser.email);
    }
  }, [currentUser]);

  // Set default future date
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    setEventDate(d.toISOString().split('T')[0]);
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const payload: ReminderCreateRequest = {
        user_email: email.trim(),
        recipient_name: recipientName.trim(),
        occasion_name: occasionName.trim(),
        event_date: eventDate,
        remind_before_days: Number(remindBeforeDays),
        notes: notes.trim(),
      };

      await axios.post(`${API_BASE_URL}/api/reminders`, payload);
      setSuccessMsg(`Đã lưu lời nhắc cho dịp "${payload.occasion_name}" thành công!`);
      // Reset form fields
      setRecipientName('');
      setOccasionName('');
      setNotes('');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Không thể kết nối đến máy chủ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchMyReminders = async (mailToQuery?: string) => {
    const qEmail = (mailToQuery !== undefined ? mailToQuery : searchEmail).trim();
    if (!qEmail) return;

    setIsLoadingList(true);
    setHasSearched(true);
    try {
      const res = await axios.get<Reminder[]>(
        `${API_BASE_URL}/api/reminders?email=${encodeURIComponent(qEmail)}`
      );
      setMyReminders(res.data);
    } catch (err) {
      console.error(err);
      setMyReminders([]);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'list' && (searchEmail || currentUser?.email)) {
      fetchMyReminders(searchEmail || currentUser?.email);
    }
  }, [activeTab]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <CalendarHeart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl sm:text-2xl text-stone-900">
                Nhắc Nhở Ngày Kỷ Niệm
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                Đừng bao giờ quên ngày sinh nhật hay kỷ niệm quan trọng của người thương!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-100 px-6 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`py-3.5 px-4 font-bold text-sm border-b-2 transition-all ${
              activeTab === 'create'
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Tạo Nhắc Nhở Mới
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`py-3.5 px-4 font-bold text-sm border-b-2 transition-all ${
              activeTab === 'list'
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Sự Kiện Đã Lưu Của Tôi
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'create' ? (
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {successMsg && (
                <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}
              {errorMsg && (
                <div className="p-3.5 bg-red-50 text-red-800 rounded-2xl border border-red-200 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-stone-400" />
                    Email nhận thông báo *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="VD: yourname@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                    <UserIcon className="w-3.5 h-3.5 text-stone-400" />
                    Tên người thân yêu *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Vợ yêu, Mẹ, Bạn thân..."
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-stone-400" />
                  Tên dịp kỷ niệm *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Sinh nhật vợ, Kỷ niệm 3 năm ngày cưới, Ngày 8/3..."
                  value={occasionName}
                  onChange={(e) => setOccasionName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    Ngày diễn ra sự kiện *
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                    <Bell className="w-3.5 h-3.5 text-stone-400" />
                    Gửi email nhắc trước *
                  </label>
                  <select
                    value={remindBeforeDays}
                    onChange={(e) => setRemindBeforeDays(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-hidden"
                  >
                    {BEFORE_DAYS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Ghi chú sở thích/loại hoa (Tùy chọn)
                </label>
                <textarea
                  rows={2}
                  placeholder="VD: Thích hoa hồng đỏ và hoa baby trắng, tone màu pastel dịu dàng..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-hidden"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-rose-200 hover:shadow-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2 active:scale-98"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang lưu nhắc nhở...</span>
                    </>
                  ) : (
                    <span>Lưu Lời Nhắc Ngay</span>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Search Email */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="email"
                    placeholder="Nhập email đã đăng ký..."
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 text-sm rounded-xl border border-stone-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-hidden"
                  />
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <button
                  type="button"
                  onClick={() => fetchMyReminders()}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors"
                >
                  Tìm Kiếm
                </button>
              </div>

              {/* Reminders List */}
              {isLoadingList ? (
                <div className="py-12 text-center text-stone-400">
                  <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-2 text-rose-500" />
                  <p className="text-xs">Đang tải danh sách sự kiện...</p>
                </div>
              ) : myReminders.length === 0 ? (
                <div className="py-12 text-center text-stone-400">
                  <CalendarHeart className="w-12 h-12 mx-auto mb-2 text-stone-300 stroke-[1.5]" />
                  <p className="text-sm font-semibold text-stone-600">
                    {hasSearched ? 'Chưa có sự kiện nào cho email này' : 'Nhập email để xem các sự kiện đã lưu'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myReminders.map((rem) => (
                    <div
                      key={rem.id}
                      className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 hover:border-rose-200 hover:bg-rose-50/30 transition-all flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-800 text-sm">{rem.occasion_name}</span>
                          <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-semibold">
                            Tặng {rem.recipient_name}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          Ngày diễn ra: <strong>{rem.event_date}</strong> (Nhắc trước {rem.remind_before_days} ngày)
                        </p>
                        {rem.notes && (
                          <p className="text-xs text-stone-600 italic">
                            Ghi chú: "{rem.notes}"
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
    </div>
  );
};
