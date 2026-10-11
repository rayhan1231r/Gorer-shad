import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  ShoppingBag,
  LogOut,
  Clock,
  Phone,
  Mail,
  ChevronRight
} from 'lucide-react';
import { AppUser, Order } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { signOutFirebase } from '../../services/firebase.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AppUser;
  onLogout: () => void;
  onTrackOrder: (orderNumber: string) => void;
  onOpenAdmin?: () => void;
  onNavigateProfile?: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  onTrackOrder,
  onOpenAdmin,
  onNavigateProfile,
}) => {
  const { language, formatPrice, formatDate, getOrderStatusText } = useLanguage();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('orders');
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadOrders();
    }
  }, [isOpen, user]);

  const loadOrders = async () => {
    try {
      setIsLoadingOrders(true);
      const orders = await api.getMyOrders();
      setUserOrders(orders);
    } catch (err) {
      console.warn('Failed to fetch user orders:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleLogoutClick = async () => {
    try {
      await signOutFirebase();
      api.setToken('');
      onLogout();
      onClose();
    } catch (err) {
      console.error('Logout error:', err);
      onLogout();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 text-left relative flex flex-col max-h-[85vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
          aria-label={language === 'en' ? 'Close' : 'বন্ধ করুন'}
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Card Header */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg shrink-0">
            {user.name ? user.name.slice(0, 1).toUpperCase() : 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 truncate">
                {user.name}
              </h3>
              {(user.role === 'admin' || user.role === 'staff' || user.role === 'owner') && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {user.role === 'owner'
                    ? (language === 'en' ? 'Owner' : 'মালিক')
                    : user.role === 'admin'
                    ? (language === 'en' ? 'Admin' : 'অ্যাডমিন')
                    : (language === 'en' ? 'Staff' : 'স্টাফ')}
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500 truncate block">
              {user.email}
            </span>
          </div>
          {(user.role === 'admin' || user.role === 'staff' || user.role === 'owner') && onOpenAdmin && (
            <button
              onClick={() => {
                onClose();
                onOpenAdmin();
              }}
              className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
              title={language === 'en' ? 'Open Admin Panel' : 'অ্যাডমিন প্যানেল খুলুন'}
            >
              {language === 'en' ? 'Admin Panel' : 'অ্যাডমিন প্যানেল'}
            </button>
          )}
          <button
            onClick={handleLogoutClick}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            title={language === 'en' ? 'Log Out' : 'লগআউট'}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 mt-3 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-2.5 px-4 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'orders'
                ? 'border-emerald-700 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {language === 'en' ? `Order History (${userOrders.length})` : `আমার পূর্ববর্তী অর্ডার (${userOrders.length})`}
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2.5 px-4 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'profile'
                ? 'border-emerald-700 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {language === 'en' ? 'Account Details' : 'অ্যাকাউন্ট তথ্য'}
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto py-4 text-xs space-y-3">
          {activeTab === 'orders' && (
            <div>
              {isLoadingOrders ? (
                <div className="py-8 text-center text-slate-400">
                  {language === 'en' ? 'Loading order history...' : 'অর্ডার তালিকা লোড হচ্ছে...'}
                </div>
              ) : userOrders.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <p className="text-slate-600 font-semibold">
                    {language === 'en' ? 'No orders placed yet' : 'এখনও কোনো অর্ডার করেননি'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {language === 'en'
                      ? 'Browse our fresh homemade menu to place an order.'
                      : 'মেনু থেকে সুস্বাদু খাবার পছন্দ করে অর্ডার করুন।'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {userOrders.map(ord => (
                    <div
                      key={ord.id}
                      className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">
                            #{ord.orderNumber}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            {getOrderStatusText(ord.orderStatus)}
                          </span>
                        </div>
                        <p className="text-slate-500 truncate text-[11px]">
                          {ord.items.map(i => `${language === 'en' ? (i.nameEn || i.nameBn) : i.nameBn} × ${i.quantity}`).join(', ')}
                        </p>
                        <span className="font-bold text-slate-800 text-xs block">
                          {formatPrice(ord.totalAmount)} • {formatDate(ord.createdAt)}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          onTrackOrder(ord.orderNumber);
                          onClose();
                        }}
                        className="p-2 bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 rounded-lg flex items-center gap-1 shrink-0 font-semibold cursor-pointer"
                        title={language === 'en' ? 'Track order' : 'ট্র্যাক করুন'}
                      >
                        <span>{language === 'en' ? 'Track' : 'ট্র্যাক'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profile Details */}
          {activeTab === 'profile' && (
            <div className="space-y-3 p-1">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-slate-700">
                  <User className="w-4 h-4 text-emerald-700" />
                  <span>{language === 'en' ? 'Name:' : 'নাম:'} <strong>{user.name}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-4 h-4 text-emerald-700" />
                  <span>{language === 'en' ? 'Email:' : 'ইমেইল:'} <strong className="font-mono">{user.email}</strong></span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-4 h-4 text-emerald-700" />
                    <span>{language === 'en' ? 'Phone:' : 'ফোন:'} <strong className="font-mono">{user.phone}</strong></span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="w-4 h-4 text-emerald-700" />
                  <span>{language === 'en' ? 'Registered:' : 'নিবন্ধন:'} {formatDate(user.createdAt)}</span>
                </div>
              </div>

              {onNavigateProfile && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigateProfile();
                  }}
                  className="w-full py-3 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <span>🏆 {language === 'en' ? 'View Profile & Leaderboard' : 'আমার পূর্ণ প্রোফাইল, ফুডি ব্যাজ ও শীর্ষ ১০ লিডারবোর্ড'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
