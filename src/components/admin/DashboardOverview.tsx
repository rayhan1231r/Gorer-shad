import React from 'react';
import {
  ShoppingBag,
  TrendingUp,
  Clock,
  ChefHat,
  Truck,
  Users,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Plus
} from 'lucide-react';
import { Order, FoodItem, CateringInquiry, FinancialSummary, BusinessConfig } from '../../types/index.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface DashboardOverviewProps {
  orders: Order[];
  foods: FoodItem[];
  catering: CateringInquiry[];
  summary?: FinancialSummary;
  financialSummary?: FinancialSummary;
  config?: BusinessConfig;
  onNavigateTab: (tab: string) => void;
  onSelectOrder?: (order: Order) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  orders,
  foods,
  catering,
  summary,
  financialSummary,
  config,
  onNavigateTab,
  onSelectOrder
}) => {
  const { language } = useLanguage();
  const fin = summary || financialSummary || {
    todaySales: 0,
    todayOrdersCount: 0,
    monthSales: 0,
    totalRevenue: 0,
    totalDeliveryFees: 0,
    totalDiscounts: 0,
    totalExpenses: 0,
    estimatedNetProfit: 0
  };

  const pendingCount = orders.filter(o => o.orderStatus === 'placed' || o.orderStatus === 'accepted').length;
  const cookingCount = orders.filter(o => o.orderStatus === 'preparing').length;
  const readyCount = orders.filter(o => o.orderStatus === 'ready' || o.orderStatus === 'out_for_delivery').length;
  const deliveredCount = orders.filter(o => o.orderStatus === 'delivered').length;

  const lowStockFoods = foods.filter(f => f.currentStock <= 5 && f.isAvailable);
  const pendingCateringCount = catering.filter(c => c.status === 'pending').length;
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6 text-left">
      {/* Welcome Banner */}
      <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-emerald-700 text-xs font-bold uppercase tracking-wider block mb-1">
            {language === 'en' ? 'Kitchen & Business Control System' : 'ব্যবসায়িক কন্ট্রোল প্যানেল'}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            {language === 'en'
              ? `Welcome, ${config?.contactPerson || 'Administrator'}!`
              : `স্বাগতম, ${config?.contactPerson || 'অ্যাডমিন'}!`}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'en'
              ? `Today, ${fin.todayOrdersCount} orders have been received across all zones.`
              : `আড়াইহাজার ও সারা বাংলাদেশে আজ মোট ${fin.todayOrdersCount}টি অর্ডার পরিচালিত হয়েছে।`}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigateTab('kitchen')}
            className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <ChefHat className="w-4 h-4 text-amber-700" />
            <span>{language === 'en' ? `Kitchen KDS (${cookingCount})` : `কিচেন ডিসপ্লে (${cookingCount})`}</span>
          </button>

          <button
            onClick={() => onNavigateTab('orders')}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{language === 'en' ? `All Orders (${orders.length})` : `সকল অর্ডার (${orders.length})`}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{language === 'en' ? "Today's Sales" : 'আজকের বিক্রয়'}</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-bold text-slate-900 block tabular-nums">
            ৳{fin.todaySales}
          </span>
          <span className="text-[11px] text-slate-400 block">
            {language === 'en' ? `Orders today: ${fin.todayOrdersCount}` : `আজকের অর্ডার: ${fin.todayOrdersCount}টি`}
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{language === 'en' ? 'New Pending' : 'নতুন অপেক্ষমান'}</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl font-bold text-slate-900 block tabular-nums">
            {pendingCount}
          </span>
          <span className="text-[11px] text-slate-400 block">
            {language === 'en' ? 'Awaiting acceptance' : 'গৃহীত হতে বাকি'}
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{language === 'en' ? 'Cooking in Kitchen' : 'কিচেনে রান্না চলছে'}</span>
            <ChefHat className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-bold text-amber-900 block tabular-nums">
            {cookingCount}
          </span>
          <span className="text-[11px] text-slate-400 block">
            {language === 'en' ? 'Fresh dishes preparing' : 'তাজা খাবার প্রস্তুত হচ্ছে'}
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{language === 'en' ? 'Out for Delivery / Ready' : 'ডেলিভারির জন্য প্রস্তুত'}</span>
            <Truck className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-bold text-slate-900 block tabular-nums">
            {readyCount}
          </span>
          <span className="text-[11px] text-slate-400 block">
            {language === 'en' ? 'Dispatched with rider/courier' : 'রাইডার বা কুরিয়ারে হস্তান্তর'}
          </span>
        </div>
      </div>

      {/* Alerts Row */}
      {(lowStockFoods.length > 0 || pendingCateringCount > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lowStockFoods.length > 0 && (
            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-amber-950 block">
                  {language === 'en' ? 'Low Stock Warning:' : 'কম স্টক সতর্কতা:'}
                </span>
                <span className="text-amber-900">
                  {lowStockFoods.map(f => `${f.nameBn} (অবশিষ্ট: ${f.currentStock})`).join(', ')}
                </span>
              </div>
            </div>
          )}

          {pendingCateringCount > 0 && (
            <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl flex items-start gap-3">
              <Users className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-blue-950 block">
                  {language === 'en' ? 'New Catering Inquiries:' : 'নতুন ক্যাটারিং অনুসন্ধান:'}
                </span>
                <span className="text-blue-900">
                  {language === 'en'
                    ? `${pendingCateringCount} catering requests pending. Visit the Catering tab to create quotations.`
                    : `${pendingCateringCount}টি নতুন ক্যাটারিং অনুরোধ অপেক্ষমান রয়েছে। কোটেশন তৈরি করতে ক্যাটারিং ট্যাবে যান।`}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Orders List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            {language === 'en' ? 'Recent Orders' : 'সাম্প্রতিক অর্ডারসমূহ'}
          </h3>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <span>{language === 'en' ? 'View All' : 'সব দেখুন'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {recentOrders.length === 0 ? (
            <div className="py-6 text-center text-slate-400">
              {language === 'en' ? 'No orders yet.' : 'এখনও কোনো অর্ডার আসেনি।'}
            </div>
          ) : (
            recentOrders.map(order => (
              <div
                key={order.id}
                onClick={() => onSelectOrder?.(order) || onNavigateTab('orders')}
                className="py-3 flex items-center justify-between hover:bg-slate-50/60 rounded-xl px-2 cursor-pointer transition-colors"
              >
                <div>
                  <span className="font-mono font-bold text-slate-900">{order.orderNumber}</span>
                  <span className="text-slate-500 ml-2">
                    {order.customerName} ({order.deliveryZoneName})
                  </span>
                  <span className="block text-[11px] text-slate-400 mt-0.5">
                    {order.requestedTimeSlot} • {order.items.length} {language === 'en' ? 'items' : 'টি পদ'}
                  </span>
                </div>

                <div className="text-right">
                  <span className="font-bold text-slate-900 block tabular-nums">৳{order.totalAmount}</span>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold mt-0.5 ${
                    order.orderStatus === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                    order.orderStatus === 'preparing' ? 'bg-amber-50 text-amber-800' :
                    order.orderStatus === 'ready' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {order.orderStatus}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
