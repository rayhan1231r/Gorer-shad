import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  ShoppingBag,
  LogOut,
  Clock,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { AppUser, Order } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { signOutFirebase } from '../../services/firebase.ts';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AppUser;
  onLogout: () => void;
  onTrackOrder: (orderNumber: string) => void;
  onOpenAdmin?: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  onTrackOrder,
  onOpenAdmin,
}) => {
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
      const orders = await api.getOrders(user.phone || undefined);
      // Filter orders matching customer email or phone
      const matched = orders.filter(
        o => (user.email && o.customerEmail?.toLowerCase() === user.email.toLowerCase()) ||
             (user.phone && o.customerPhone === user.phone)
      );
      setUserOrders(matched);
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
              {user.role === 'admin' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  অ্যাডমিন
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500 truncate block">
              {user.email}
            </span>
          </div>
          {user.role === 'admin' && onOpenAdmin && (
            <button
              onClick={() => {
                onClose();
                onOpenAdmin();
              }}
              className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
              title="অ্যাডমিন প্যানেল খুলুন"
            >
              অ্যাডমিন প্যানেল
            </button>
          )}
          <button
            onClick={handleLogoutClick}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            title="লগআউট"
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
            আমার পূর্ববর্তী অর্ডার ({userOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2.5 px-4 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'profile'
                ? 'border-emerald-700 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            অ্যাকাউন্ট তথ্য
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto py-4 text-xs space-y-3">
          {activeTab === 'orders' && (
            <div>
              {isLoadingOrders ? (
                <div className="py-8 text-center text-slate-400">
                  অর্ডার তালিকা লোড হচ্ছে...
                </div>
              ) : userOrders.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <p className="text-slate-600 font-semibold">
                    এখনও কোনো অর্ডার করেননি
                  </p>
                  <p className="text-[11px] text-slate-400">
                    মেনু থেকে সুস্বাদু খাবার পছন্দ করে অর্ডার করুন।
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
                            {ord.orderStatus === 'placed' && 'গৃহীত হয়েছে'}
                            {ord.orderStatus === 'preparing' && 'রান্না হচ্ছে'}
                            {ord.orderStatus === 'ready' && 'প্রস্তুত'}
                            {ord.orderStatus === 'out_for_delivery' && 'ডেলিভারিতে রয়েছে'}
                            {ord.orderStatus === 'delivered' && 'ডেলিভারি সম্পন্ন'}
                            {ord.orderStatus === 'cancelled' && 'বাতিল'}
                          </span>
                        </div>
                        <p className="text-slate-500 truncate text-[11px]">
                          {ord.items.map(i => `${i.nameBn} × ${i.quantity}`).join(', ')}
                        </p>
                        <span className="font-bold text-slate-800 text-xs block">
                          ৳{ord.totalAmount} • {new Date(ord.createdAt).toLocaleDateString('bn-BD')}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          onTrackOrder(ord.orderNumber);
                          onClose();
                        }}
                        className="p-2 bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 rounded-lg flex items-center gap-1 shrink-0 font-semibold cursor-pointer"
                        title="ট্র্যাক করুন"
                      >
                        <span>ট্র্যাক</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-3 p-1">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-slate-700">
                  <User className="w-4 h-4 text-emerald-700" />
                  <span>নাম: <strong>{user.name}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-4 h-4 text-emerald-700" />
                  <span>ইমেইল: <strong className="font-mono">{user.email}</strong></span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-4 h-4 text-emerald-700" />
                    <span>ফোন: <strong className="font-mono">{user.phone}</strong></span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="w-4 h-4 text-emerald-700" />
                  <span>নিবন্ধন: {new Date(user.createdAt).toLocaleDateString('bn-BD')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
