import React, { useState, useEffect } from 'react';
import {
  User,
  ShoppingBag,
  Award,
  Crown,
  Trophy,
  Flame,
  Star,
  MapPin,
  Phone,
  Mail,
  Calendar,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Edit3,
  Clock,
  ArrowRight,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { AppUser, Order, LeaderboardUser } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface ProfilePageProps {
  currentUser: AppUser | null;
  onNavigateMenu: () => void;
  onTrackOrder: (orderNumber: string) => void;
  onRequireLogin: () => void;
  onProfileUpdated?: (user: AppUser) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  currentUser,
  onNavigateMenu,
  onTrackOrder,
  onRequireLogin,
  onProfileUpdated
}) => {
  const { language, formatPrice, formatDate, getOrderStatusText } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'leaderboard'>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Edit Profile Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [editAddress, setEditAddress] = useState(currentUser?.addresses?.[0] || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name || '');
      setEditPhone(currentUser.phone || '');
      setEditAddress(currentUser.addresses?.[0] || '');
      loadUserData();
    } else {
      setIsLoading(false);
    }
  }, [currentUser]);

  const loadUserData = async () => {
    try {
      setIsRefreshing(true);
      const [myOrders, board] = await Promise.all([
        api.getMyOrders().catch(() => []),
        api.getLeaderboard().catch(() => [])
      ]);
      setOrders(myOrders);
      setLeaderboard(board);
    } catch (err) {
      console.warn('Failed to load user profile data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    try {
      setIsSavingProfile(true);
      const res = await api.updateProfile({
        name: editName.trim(),
        phone: editPhone.trim() || undefined,
        addresses: editAddress.trim() ? [editAddress.trim()] : undefined
      });
      if (res.user) {
        onProfileUpdated?.(res.user);
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
          setIsEditModalOpen(false);
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-16 px-4 bg-slate-50/60">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-100">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {language === 'en' ? 'Sign In to View Your Foodie Profile' : 'আপনার প্রোফাইল দেখতে লগইন করুন'}
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {language === 'en'
              ? 'View your personal orders, food rewards points, ranking badge, and Top 10 Foodies leaderboard.'
              : 'আপনার ব্যক্তিগত অর্ডার, ফুডি রিওয়ার্ড পয়েন্ট, র‌্যাঙ্কিং ব্যাজ ও শীর্ষ ১০ ভোজনরসিকের লিডারবোর্ড দেখতে অনুগ্রহ করে লগইন করুন।'}
          </p>
          <button
            onClick={onRequireLogin}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
          >
            {language === 'en' ? 'Log In / Register' : 'লগইন / নতুন অ্যাকাউন্ট'}
          </button>
        </div>
      </div>
    );
  }

  // Calculate user stats & tier
  const completedOrders = orders.filter(o => o.orderStatus !== 'cancelled' && o.orderStatus !== 'rejected');
  const totalOrdersCount = completedOrders.length;
  const totalSpent = completedOrders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
  const loyaltyPoints = (totalOrdersCount * 30) + Math.floor(totalSpent / 20);

  // Determine tier & progress
  let tierName = language === 'en' ? 'Bronze Foodie' : 'ব্রোঞ্জ ফুডি';
  let tierBadge = '🥉';
  let tierColor = 'from-amber-600 to-amber-700';
  let tierTextColor = 'text-amber-800 bg-amber-50 border-amber-200';
  let nextTierName = language === 'en' ? 'Silver Connoisseur' : 'সিলভার রসনাবিদ';
  let nextTierReq = 3;
  let progressPercent = Math.min(100, Math.round((totalOrdersCount / 3) * 100));

  if (totalOrdersCount >= 16 || totalSpent >= 10000) {
    tierName = language === 'en' ? 'Platinum Feast Master' : 'প্লাটিনাম ভোজরাজ';
    tierBadge = '👑';
    tierColor = 'from-purple-600 to-indigo-700';
    tierTextColor = 'text-purple-800 bg-purple-50 border-purple-200';
    nextTierName = language === 'en' ? 'Maximum Rank Achieved' : 'সর্বোচ্চ পদমর্যাদা অর্জিত!';
    nextTierReq = totalOrdersCount;
    progressPercent = 100;
  } else if (totalOrdersCount >= 8 || totalSpent >= 5000) {
    tierName = language === 'en' ? 'Gold Gourmand' : 'গোল্ড ভোজনরসিক';
    tierBadge = '🥇';
    tierColor = 'from-amber-500 to-yellow-600';
    tierTextColor = 'text-amber-900 bg-amber-100/80 border-amber-300';
    nextTierName = language === 'en' ? 'Platinum Feast Master' : 'প্লাটিনাম ভোজরাজ (১৬ অর্ডার)';
    nextTierReq = 16;
    progressPercent = Math.min(100, Math.round(((totalOrdersCount - 8) / 8) * 100));
  } else if (totalOrdersCount >= 3 || totalSpent >= 1500) {
    tierName = language === 'en' ? 'Silver Connoisseur' : 'সিলভার রসনাবিদ';
    tierBadge = '🥈';
    tierColor = 'from-slate-500 to-slate-700';
    tierTextColor = 'text-slate-800 bg-slate-100 border-slate-300';
    nextTierName = language === 'en' ? 'Gold Gourmand' : 'গোল্ড ভোজনরসিক (৮ অর্ডার)';
    nextTierReq = 8;
    progressPercent = Math.min(100, Math.round(((totalOrdersCount - 3) / 5) * 100));
  }

  // Find user rank in leaderboard
  const myLeaderboardEntry = leaderboard.find(l => l.isCurrentUser);
  const myRank = myLeaderboardEntry ? myLeaderboardEntry.rank : (leaderboard.length + 1);

  return (
    <div className="bg-[#F8F9F7] min-h-screen py-8 sm:py-12 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* User Hero Banner */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-emerald-100/40 via-amber-100/30 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Left: User Identity */}
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-900 text-white flex items-center justify-center font-bold text-2xl sm:text-3xl shadow-md shrink-0 ring-4 ring-emerald-50">
                {currentUser.name ? currentUser.name.slice(0, 1).toUpperCase() : 'U'}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                    {currentUser.name}
                  </h1>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${tierTextColor}`}>
                    <span>{tierBadge}</span>
                    <span>{tierName}</span>
                  </span>
                  {currentUser.role !== 'customer' && (
                    <span className="bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                      {currentUser.role}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {currentUser.email}
                  </span>
                  {currentUser.phone && (
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {currentUser.phone}
                    </span>
                  )}
                  {currentUser.addresses?.[0] && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="max-w-[200px] truncate">{currentUser.addresses[0]}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3 self-start md:self-auto">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Edit Profile' : 'তথ্য পরিবর্তন'}</span>
              </button>

              <button
                onClick={loadUserData}
                disabled={isRefreshing}
                className="p-2.5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                title={language === 'en' ? 'Refresh data' : 'রিফ্রেশ করুন'}
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Quick Metrics & Tier Progress */}
          <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100/80">
              <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block mb-1">
                {language === 'en' ? 'Total Completed Orders' : 'সর্বমোট সফল অর্ডার'}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-emerald-950 tabular-nums">
                {totalOrdersCount} টি
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100/80">
              <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block mb-1">
                {language === 'en' ? 'Total Spent' : 'মোট খাবার খরচ'}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-amber-950 tabular-nums">
                ৳{totalSpent}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100/80">
              <span className="text-[11px] font-semibold text-indigo-800 uppercase tracking-wider block mb-1">
                {language === 'en' ? 'Foodie Reward Points' : 'ফুডি রিওয়ার্ড পয়েন্ট'}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-indigo-950 tabular-nums flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                {loyaltyPoints}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100/80">
              <span className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider block mb-1">
                {language === 'en' ? 'Leaderboard Rank' : 'লিডারবোর্ড র‌্যাঙ্কিং'}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-rose-950 tabular-nums flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-rose-600" />
                #{myRank}
              </span>
            </div>
          </div>

          {/* Tier Progress Bar */}
          {totalOrdersCount < 16 && (
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-600 font-medium">
                  {language === 'en'
                    ? `Level up to ${nextTierName}`
                    : `পরবর্তী পদবী: ${nextTierName}-এ পৌঁছাতে আর ${Math.max(1, nextTierReq - totalOrdersCount)}টি অর্ডার প্রয়োজন`}
                </span>
                <span className="font-bold text-emerald-800 tabular-nums">
                  {progressPercent}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-600 to-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>{language === 'en' ? 'My Foodie Ranking' : 'আমার ফুডি র‌্যাঙ্কিং ও স্ট্যাটাস'}</span>
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'leaderboard'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>{language === 'en' ? 'Top 10 Foodies Leaderboard' : 'শীর্ষ ১০ ভোজনরসিক লিডারবোর্ড'}</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'orders'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{language === 'en' ? 'My Orders' : 'আমার অর্ডারসমূহ'} ({orders.length})</span>
          </button>
        </div>

        {/* TAB 1: Ranking Overview & Perks */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Current Tier Perks */}
              <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {tierBadge} {tierName} — {language === 'en' ? 'Current Privileges' : 'আপনার বর্তমান বিশেষ সুবিধাসমূহ'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {language === 'en' ? 'Exclusive home food perks unlocked with your loyalty' : 'ঘরের স্বাদ নিয়মিত গ্রাহক হিসেবে আপনার অর্জিত সম্মাননা'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800 block">তাজা কিচেন অগ্রাধিকার (Kitchen Priority)</span>
                      <span className="text-slate-500 text-[11px]">আপনার খাবার প্রস্তুতকালে শেফের বিশেষ মনযোগ ও ফ্রেশ কোয়ালিটি নিশ্চয়তা।</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800 block">গোপন শেফ স্পেশাল আইটেম</span>
                      <span className="text-slate-500 text-[11px]">উৎসবের দিনে অগ্রিম প্রি-বুকিং সুবিধা ও নতুন স্বাদের অগ্রিম দাওয়াত।</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800 block">ক্যাটারিং পরামর্শ ও ডিসকাউন্ট</span>
                      <span className="text-slate-500 text-[11px]">পারিবারিক অনুষ্ঠানের ক্যাটারিং অর্ডারে ফ্রি টেস্ট বক্স ও স্পেশাল কোটেশন।</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800 block">লিডারবোর্ড সম্মাননা ও ব্যাজ</span>
                      <span className="text-slate-500 text-[11px]">ঘরের স্বাদের শীর্ষ খাদ্যরসিকদের তালিকায় আপনার নামের বিশেষ তারকা।</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* All Tiers Roadmap */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>{language === 'en' ? 'Foodie Tier Roadmap' : 'র‌্যাঙ্কিং রোডম্যাপ'}</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div className={`p-3 rounded-xl border flex items-center justify-between ${totalOrdersCount >= 16 ? 'bg-purple-50/70 border-purple-200 font-bold' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-base">👑</span>
                      <span>প্লাটিনাম ভোজরাজ (Platinum)</span>
                    </div>
                    <span className="text-[11px] font-mono">১৬+ অর্ডার</span>
                  </div>

                  <div className={`p-3 rounded-xl border flex items-center justify-between ${totalOrdersCount >= 8 && totalOrdersCount < 16 ? 'bg-amber-50/70 border-amber-300 font-bold text-amber-950' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-base">🥇</span>
                      <span>গোল্ড ভোজনরসিক (Gold)</span>
                    </div>
                    <span className="text-[11px] font-mono">৮-১৫ অর্ডার</span>
                  </div>

                  <div className={`p-3 rounded-xl border flex items-center justify-between ${totalOrdersCount >= 3 && totalOrdersCount < 8 ? 'bg-slate-100 border-slate-300 font-bold text-slate-900' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-base">🥈</span>
                      <span>সিলভার রসনাবিদ (Silver)</span>
                    </div>
                    <span className="text-[11px] font-mono">৩-৭ অর্ডার</span>
                  </div>

                  <div className={`p-3 rounded-xl border flex items-center justify-between ${totalOrdersCount < 3 ? 'bg-amber-50/60 border-amber-200 font-bold text-amber-900' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-base">🥉</span>
                      <span>ব্রোঞ্জ ফুডি (Bronze)</span>
                    </div>
                    <span className="text-[11px] font-mono">০-২ অর্ডার</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Top 10 Foodies Leaderboard */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-8">
            {/* Top 3 Podium Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-4">
              {/* 2nd Place */}
              {leaderboard[1] && (
                <div className="order-2 sm:order-1 bg-white rounded-3xl border border-slate-200 p-6 text-center shadow-xs space-y-3 relative overflow-hidden">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xl mx-auto border-2 border-slate-300">
                    🥈
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">২য় স্থান (2nd Rank)</span>
                    <h4 className="text-base font-bold text-slate-900 mt-0.5">{leaderboard[1].name}</h4>
                    <span className="inline-block mt-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                      {leaderboard[1].tierBn}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 flex justify-around">
                    <div>
                      <span className="font-bold text-slate-900 block">{leaderboard[1].totalOrders} টি</span>
                      <span className="text-[10px]">অর্ডার</span>
                    </div>
                    <div>
                      <span className="font-bold text-emerald-700 block">{leaderboard[1].points}</span>
                      <span className="text-[10px]">পয়েন্ট</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 1st Place (Champion) */}
              {leaderboard[0] && (
                <div className="order-1 sm:order-2 bg-gradient-to-b from-amber-50 to-white rounded-3xl border-2 border-amber-300 p-7 text-center shadow-md space-y-3 relative overflow-hidden scale-105 z-10">
                  <div className="absolute top-2 right-3 text-2xl">🏆</div>
                  <div className="w-14 h-14 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-2xl mx-auto ring-4 ring-amber-100 shadow-sm">
                    🥇
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-widest block">সেরা ভোজনরসিক (#1 Champion)</span>
                    <h4 className="text-lg font-bold text-slate-950 mt-0.5">{leaderboard[0].name}</h4>
                    <span className="inline-block mt-1 text-[11px] font-bold text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-full border border-amber-300">
                      {leaderboard[0].tierBn}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-amber-200/80 text-xs text-slate-600 flex justify-around">
                    <div>
                      <span className="font-bold text-slate-900 block text-sm">{leaderboard[0].totalOrders} টি</span>
                      <span className="text-[10px]">অর্ডার</span>
                    </div>
                    <div>
                      <span className="font-bold text-amber-800 block text-sm">{leaderboard[0].points}</span>
                      <span className="text-[10px]">পয়েন্ট</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {leaderboard[2] && (
                <div className="order-3 bg-white rounded-3xl border border-slate-200 p-6 text-center shadow-xs space-y-3 relative overflow-hidden">
                  <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center font-bold text-xl mx-auto border-2 border-amber-200">
                    🥉
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">৩য় স্থান (3rd Rank)</span>
                    <h4 className="text-base font-bold text-slate-900 mt-0.5">{leaderboard[2].name}</h4>
                    <span className="inline-block mt-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
                      {leaderboard[2].tierBn}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 flex justify-around">
                    <div>
                      <span className="font-bold text-slate-900 block">{leaderboard[2].totalOrders} টি</span>
                      <span className="text-[10px]">অর্ডার</span>
                    </div>
                    <div>
                      <span className="font-bold text-emerald-700 block">{leaderboard[2].points}</span>
                      <span className="text-[10px]">পয়েন্ট</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Top 10 Table */}
            <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-500" />
                    <span>সেরা ১০ খাদ্যরসিকের পূর্ণ তালিকা (Top 10 Leaderboard)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ঘরের স্বাদে সবচেয়ে বেশি অর্ডার ও সক্রিয় গ্রাহকদের রিয়েল-টাইম তালিকা
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">র‌্যাঙ্ক</th>
                      <th className="py-3 px-4">ভোজনরসিক</th>
                      <th className="py-3 px-4">পদবী ও ব্যাজ</th>
                      <th className="py-3 px-4 text-center">মোট অর্ডার</th>
                      <th className="py-3 px-4 text-right">ফুডি পয়েন্ট</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leaderboard.map((item) => (
                      <tr
                        key={item.userId}
                        className={`transition-colors ${
                          item.isCurrentUser
                            ? 'bg-amber-50/70 font-semibold border-l-4 border-l-amber-500'
                            : 'hover:bg-slate-50/60'
                        }`}
                      >
                        <td className="py-3.5 px-4 font-bold text-slate-700">
                          {item.rank === 1 ? '🥇 #1' : item.rank === 2 ? '🥈 #2' : item.rank === 3 ? '🥉 #3' : `#${item.rank}`}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                              {item.name.slice(0, 1)}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block">
                                {item.name} {item.isCurrentUser && <span className="text-[10px] bg-emerald-700 text-white px-1.5 py-0.2 rounded ml-1 font-bold">আপনি</span>}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <span className="inline-flex items-center gap-1 text-[11px]">
                            <span>{item.badge}</span>
                            <span>{item.tierBn}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold tabular-nums text-slate-800">
                          {item.totalOrders} টি
                        </td>
                        <td className="py-3.5 px-4 text-right font-extrabold tabular-nums text-emerald-700">
                          {item.points} pts
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: My Orders List */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {language === 'en' ? 'No Orders Placed Yet' : 'আপনার এখনও কোনো অর্ডার নেই'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {language === 'en'
                    ? 'Explore authentic homemade Bengali dishes, Hilsa fish, and delicious platters!'
                    : 'আমাদের তাজা খাঁটি ঘরোয়া বাঙালি খাবার, পদ্মার ইলিশ ও মজাদার প্ল্যাটার থেকে পছন্দের খাবার বেছে নিন।'}
                </p>
                <button
                  onClick={onNavigateMenu}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer inline-flex items-center gap-2"
                >
                  <span>{language === 'en' ? 'Browse Food Menu' : 'মেনু দেখুন'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orders.map(order => (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3.5 hover:border-emerald-600/50 transition-colors"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <span className="font-mono font-bold text-slate-900 text-sm block">
                          {order.orderNumber}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {getOrderStatusText(order.orderStatus)}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="space-y-1.5 text-xs">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-slate-700">
                          <span className="line-clamp-1">
                            {it.nameBn || it.nameEn} <span className="text-slate-400 font-semibold">×{it.quantity}</span>
                          </span>
                          <span className="font-semibold tabular-nums">৳{it.itemTotal}</span>
                        </div>
                      ))}
                    </div>

                    {/* Payment & TrxID details */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                      <div>
                        <span>পদ্ধতি: <strong>{order.paymentMethod?.toUpperCase()}</strong></span>
                        {order.paymentTransactionId && (
                          <span className="ml-2 font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                            TrxID: {order.paymentTransactionId}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-extrabold text-emerald-800 tabular-nums">
                        ৳{order.totalAmount}
                      </span>
                    </div>

                    {/* Track Button */}
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => onTrackOrder(order.orderNumber)}
                        className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{language === 'en' ? 'Live Track' : 'লাইভ ট্র্যাক করুন'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 text-left relative space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {language === 'en' ? 'Update Profile Details' : 'প্রোফাইল তথ্য পরিবর্তন করুন'}
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {language === 'en' ? 'Full Name' : 'পূর্ণ নাম'} *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {language === 'en' ? 'Mobile Number' : 'মোবাইল নম্বর'}
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  placeholder="018XXXXXXXX"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {language === 'en' ? 'Default Delivery Address' : 'ডিফল্ট ডেলিভারি ঠিকানা'}
                </label>
                <textarea
                  rows={2}
                  value={editAddress}
                  onChange={e => setEditAddress(e.target.value)}
                  placeholder="বাসা/রোড, এলাকা, আড়াইহাজার, ঢাকা"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                />
              </div>

              {saveSuccess && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>তথ্য সফলভাবে সংরক্ষিত হয়েছে!</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  {language === 'en' ? 'Cancel' : 'বাতিল'}
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold cursor-pointer shadow-xs"
                >
                  {isSavingProfile ? (language === 'en' ? 'Saving...' : 'সংরক্ষিত হচ্ছে...') : (language === 'en' ? 'Save Changes' : 'পরিবর্তন সংরক্ষণ')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
