import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  ChefHat,
  UtensilsCrossed,
  Users,
  MapPin,
  Tag,
  DollarSign,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  User,
  Mail
} from 'lucide-react';
import { BusinessConfig, Category, FoodItem, Order, CateringInquiry, CustomerRecord, FinancialSummary, DeliveryZone, Coupon } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { DashboardOverview } from './DashboardOverview.tsx';
import { OrderManagement } from './OrderManagement.tsx';
import { KitchenDisplay } from './KitchenDisplay.tsx';
import { MenuManagement } from './MenuManagement.tsx';
import { CateringManagement } from './CateringManagement.tsx';
import { DeliveryZoneManagement } from './DeliveryZoneManagement.tsx';
import { CouponManagement } from './CouponManagement.tsx';
import { CustomerManagement } from './CustomerManagement.tsx';
import { FinanceReports } from './FinanceReports.tsx';
import { SettingsManagement } from './SettingsManagement.tsx';
import { SmtpSettings } from './SmtpSettings.tsx';

interface AdminLayoutProps {
  config: BusinessConfig;
  onRefreshConfig: () => void;
  onExitAdmin: () => void;
  onLogout: () => void;
  adminUserName: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  config,
  onRefreshConfig,
  onExitAdmin,
  onLogout,
  adminUserName
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Live state
  const [orders, setOrders] = useState<Order[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [catering, setCatering] = useState<CateringInquiry[]>([]);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    todaySales: 0,
    todayOrdersCount: 0,
    monthSales: 0,
    totalRevenue: 0,
    totalDeliveryFees: 0,
    totalDiscounts: 0,
    totalExpenses: 0,
    estimatedNetProfit: 0
  });
  const [expenses, setExpenses] = useState<{ id: string; date: string; title: string; category: string; amount: number }[]>([]);

  const fetchAllData = async () => {
    try {
      const [ordList, foodList, catList, zoneList, cpnList, catInquiries, custList, rep] = await Promise.all([
        api.getOrders(),
        api.getFoods(),
        api.getCategories(),
        api.getDeliveryZones(),
        api.getCoupons(),
        api.getCateringInquiries(),
        api.getCustomers(),
        api.getReports()
      ]);

      setOrders(ordList);
      setFoods(foodList);
      setCategories(catList);
      setZones(zoneList);
      setCoupons(cpnList);
      setCatering(catInquiries);
      setCustomers(custList);
      setFinancialSummary(rep.summary);
      setExpenses(rep.expenses);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const navItems = [
    { id: 'overview', label: 'ওভারভিউ ড্যাশবোর্ড', icon: LayoutDashboard },
    { id: 'orders', label: 'অর্ডার ম্যানেজমেন্ট', icon: ShoppingBag, badge: orders.filter(o => o.orderStatus === 'placed').length },
    { id: 'kitchen', label: 'কিচেন ডিসপ্লে (KDS)', icon: ChefHat, badge: orders.filter(o => o.orderStatus === 'preparing').length },
    { id: 'menu', label: 'মেনু ও খাদ্যসামগ্রী', icon: UtensilsCrossed },
    { id: 'catering', label: 'ক্যাটারিং অনুসন্ধান', icon: Users, badge: catering.filter(c => c.status === 'pending').length },
    { id: 'zones', label: 'ডেলিভারি এলাকা ও ফি', icon: MapPin },
    { id: 'coupons', label: 'কুপন ও অফার', icon: Tag },
    { id: 'customers', label: 'গ্রাহক ডিরেক্টরি', icon: User },
    { id: 'finance', label: 'আর্থিক হিসাব ও খরচ', icon: DollarSign },
    { id: 'smtp', label: 'Email / SMTP সেটিংস', icon: Mail },
    { id: 'settings', label: 'ব্যবসা ও ব্রান্ড সেটিংস', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9F7] flex flex-col text-slate-800">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200/90 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white font-bold flex items-center justify-center text-base">
                স্বাদ
              </div>
              <div>
                <span className="font-bold text-slate-900 text-sm leading-tight block">
                  {config.brandNameBn} অ্যাডমিন
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  ব্যবসায়িক ম্যানেজমেন্ট পোর্টাল
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onExitAdmin}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              <span>ওয়েবসাইটে ফিরুন</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-slate-800 block">
                {config.contactPerson || adminUserName}
              </span>
              <span className="text-[10px] text-emerald-700 font-medium">
                মালিক / প্রধান প্রশাসক
              </span>
            </div>

            <button
              onClick={onLogout}
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-slate-50 rounded-lg transition-colors"
              title="লগআউট"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full flex gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs h-fit sticky top-24">
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors text-left ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold tabular-nums ${
                      isActive ? 'bg-white text-emerald-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Sidebar Modal */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 flex lg:hidden">
            <div className="bg-white w-72 h-full p-4 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-bold text-slate-900 text-sm">মেনু নেভিগেশন</span>
                <button onClick={() => setMobileSidebarOpen(false)}>
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <nav className="space-y-1">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold ${
                        isActive ? 'bg-emerald-700 text-white' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-800">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {activeTab === 'overview' && (
            <DashboardOverview
              orders={orders}
              foods={foods}
              catering={catering}
              financialSummary={financialSummary}
              config={config}
              onNavigateTab={tab => setActiveTab(tab)}
              onSelectOrder={() => setActiveTab('orders')}
            />
          )}

          {activeTab === 'orders' && (
            <OrderManagement
              orders={orders}
              config={config}
              onRefreshOrders={fetchAllData}
            />
          )}

          {activeTab === 'kitchen' && (
            <KitchenDisplay
              orders={orders}
              config={config}
              onRefreshOrders={fetchAllData}
            />
          )}

          {activeTab === 'menu' && (
            <MenuManagement
              foods={foods}
              categories={categories}
              onRefreshData={fetchAllData}
            />
          )}

          {activeTab === 'catering' && (
            <CateringManagement
              inquiries={catering}
              config={config}
              onRefreshData={fetchAllData}
            />
          )}

          {activeTab === 'zones' && (
            <DeliveryZoneManagement
              zones={zones}
              onRefreshData={fetchAllData}
            />
          )}

          {activeTab === 'coupons' && (
            <CouponManagement
              coupons={coupons}
              onRefreshData={fetchAllData}
            />
          )}

          {activeTab === 'customers' && (
            <CustomerManagement
              customers={customers}
              onRefreshData={fetchAllData}
            />
          )}

          {activeTab === 'finance' && (
            <FinanceReports
              summary={financialSummary}
              expenses={expenses}
              onRefreshData={fetchAllData}
            />
          )}

          {activeTab === 'smtp' && (
            <SmtpSettings />
          )}

          {activeTab === 'settings' && (
            <SettingsManagement
              config={config}
              onRefreshConfig={() => {
                fetchAllData();
                onRefreshConfig();
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
};
