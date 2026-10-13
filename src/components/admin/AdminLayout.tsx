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
  Menu as MenuIcon,
  X,
  User,
  Mail,
  CreditCard,
  Truck,
  Globe,
  RefreshCw,
  ShieldCheck,
  Bell,
  MessageSquare,
  Sparkles,
  Crown,
  Image as ImageIcon,
  Megaphone,
  Cloud,
  Send
} from 'lucide-react';
import {
  BusinessConfig,
  Category,
  FoodItem,
  Order,
  CateringInquiry,
  CustomerRecord,
  FinancialSummary,
  DeliveryZone,
  Coupon,
  PaymentMethodConfig
} from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { DashboardOverview } from './DashboardOverview.tsx';
import { OrderManagement } from './OrderManagement.tsx';
import { KitchenDisplay } from './KitchenDisplay.tsx';
import { MenuManagement } from './MenuManagement.tsx';
import { CateringManagement } from './CateringManagement.tsx';
import { DeliveryZoneManagement } from './DeliveryZoneManagement.tsx';
import { PaymentManagement } from './PaymentManagement.tsx';
import { CouponManagement } from './CouponManagement.tsx';
import { CustomerManagement } from './CustomerManagement.tsx';
import { FinanceReports } from './FinanceReports.tsx';
import { SettingsManagement } from './SettingsManagement.tsx';
import { SmtpSettings } from './SmtpSettings.tsx';
import { ReviewManagement } from './ReviewManagement.tsx';
import { UserRoleManagement } from './UserRoleManagement.tsx';
import { AdminAiHub } from './AdminAiHub.tsx';
import { BannerManagement } from './BannerManagement.tsx';
import { BroadcastEmailManagement } from './BroadcastEmailManagement.tsx';
import { CloudSyncManagement } from './CloudSyncManagement.tsx';
import { BrandLogo } from '../common/BrandLogo.tsx';

interface AdminLayoutProps {
  config: BusinessConfig;
  onRefreshConfig: () => void;
  onExitAdmin: () => void;
  onLogout: () => void;
  adminUserName: string;
  adminUserEmail?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  config,
  onRefreshConfig,
  onExitAdmin,
  onLogout,
  adminUserName,
  adminUserEmail
}) => {
  const { language, toggleLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Live state
  const [orders, setOrders] = useState<Order[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [catering, setCatering] = useState<CateringInquiry[]>([]);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    todaySales: 0,
    todayOrdersCount: 0,
    weeklySales: 0,
    weeklyOrdersCount: 0,
    lastWeekSales: 0,
    monthSales: 0,
    yearSales: 0,
    yearOrdersCount: 0,
    totalRevenue: 0,
    totalDeliveryFees: 0,
    totalDiscounts: 0,
    totalExpenses: 0,
    estimatedNetProfit: 0
  });
  const [expenses, setExpenses] = useState<{ id: string; date: string; title: string; category: string; amount: number }[]>([]);

  const fetchAllData = async () => {
    setIsRefreshing(true);
    try {
      const [ordList, foodList, catList, zoneList, pmList, cpnList, catInquiries, custList, rep] = await Promise.all([
        api.getOrders(),
        api.getFoods(),
        api.getCategories(),
        api.getDeliveryZones(),
        api.getPaymentMethods(true),
        api.getCoupons(),
        api.getCateringInquiries(),
        api.getCustomers(),
        api.getReports()
      ]);

      setOrders(ordList);
      setFoods(foodList);
      setCategories(catList);
      setZones(zoneList);
      setPaymentMethods(pmList);
      setCoupons(cpnList);
      setCatering(catInquiries);
      setCustomers(custList);
      setFinancialSummary(rep.summary);
      setExpenses(rep.expenses);
      onRefreshConfig();
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const navItems = [
    {
      id: 'overview',
      labelBn: 'ওভারভিউ ড্যাশবোর্ড',
      labelEn: 'Dashboard Overview',
      icon: LayoutDashboard
    },
    {
      id: 'orders',
      labelBn: 'অর্ডার ম্যানেজমেন্ট',
      labelEn: 'Order Management',
      icon: ShoppingBag,
      badge: orders.filter(o => o.orderStatus === 'placed').length
    },
    {
      id: 'kitchen',
      labelBn: 'কিচেন ডিসপ্লে (KDS)',
      labelEn: 'Kitchen Display (KDS)',
      icon: ChefHat,
      badge: orders.filter(o => o.orderStatus === 'preparing').length
    },
    {
      id: 'menu',
      labelBn: 'মেনু ও খাদ্যসামগ্রী',
      labelEn: 'Menu & Dishes',
      icon: UtensilsCrossed
    },
    {
      id: 'payments',
      labelBn: 'পেমেন্ট মাধ্যম ব্যবস্থাপনা',
      labelEn: 'Payment Methods',
      icon: CreditCard
    },
    {
      id: 'banners',
      labelBn: 'অ্যাডভান্সড ব্যানার ও অফার',
      labelEn: 'Banners & Hero Offers',
      icon: Megaphone
    },
    {
      id: 'zones',
      labelBn: 'ডেলিভারি এরিয়া ও চার্জ',
      labelEn: 'Delivery Areas & Charges',
      icon: Truck
    },
    {
      id: 'catering',
      labelBn: 'ক্যাটারিং অনুসন্ধান',
      labelEn: 'Catering Inquiries',
      icon: Users,
      badge: catering.filter(c => c.status === 'pending').length
    },
    {
      id: 'coupons',
      labelBn: 'কুপন ও ডিসকাউন্ট',
      labelEn: 'Coupons & Offers',
      icon: Tag
    },
    {
      id: 'customers',
      labelBn: 'গ্রাহক ডিরেক্টরি',
      labelEn: 'Customer Directory',
      icon: User
    },
    {
      id: 'finance',
      labelBn: 'আর্থিক হিসাব ও খরচ',
      labelEn: 'Finance & Expenses',
      icon: DollarSign
    },
    {
      id: 'reviews',
      labelBn: 'গ্রাহক রিভিউ ও রেটিং',
      labelEn: 'Reviews & Ratings',
      icon: MessageSquare
    },
    {
      id: 'smtp',
      labelBn: 'Email / SMTP সেটিংস',
      labelEn: 'Email / SMTP Setup',
      icon: Mail
    },
    {
      id: 'broadcast',
      labelBn: 'ইমেইল ব্রডকাস্ট ও প্রচার',
      labelEn: 'Email Broadcast',
      icon: Send
    },
    {
      id: 'cloud-sync',
      labelBn: 'ক্লাউড সিঙ্ক ও ব্যাকআপ',
      labelEn: 'Cloud Sync & Backup',
      icon: Cloud
    },
    {
      id: 'roles',
      labelBn: 'ভূমিকা ও অ্যাডমিন কন্ট্রোল',
      labelEn: 'Roles & Admins',
      icon: Crown
    },
    {
      id: 'ai-hub',
      labelBn: 'এআই অ্যাসিস্ট্যান্ট হাব',
      labelEn: 'AI Intelligence Hub',
      icon: Sparkles
    },
    {
      id: 'settings',
      labelBn: 'ব্যবসা ও ব্রান্ড কনফিগ',
      labelEn: 'Business Settings',
      icon: Settings
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6F8F5] flex flex-col text-slate-800">
      {/* Top Navbar */}
      <header className="bg-white border-b border-emerald-100/80 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Mobile Toggle & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-emerald-800 rounded-xl hover:bg-emerald-50 transition-colors"
            >
              <MenuIcon className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <BrandLogo size="sm" className="ring-2 ring-emerald-600/30 shadow-2xs" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm leading-tight block">
                    {language === 'en' ? config.brandNameEn : config.brandNameBn} {language === 'en' ? 'Admin Portal' : 'অ্যাডমিন'}
                  </span>
                  <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Verified
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium hidden sm:block">
                  {language === 'en' ? 'Kitchen & Business Control System' : 'ব্যবসায়িক ম্যানেজমেন্ট পোর্টাল'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Actions, Language Toggle, and User Info */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Language Switch Button */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition-colors shadow-2xs"
              title={language === 'en' ? 'বাংলা ভাষায় পরিবর্তন করুন' : 'Switch to English'}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-700" />
              <span>{language === 'en' ? 'বাংলা' : 'English'}</span>
            </button>

            {/* Refresh Data Button */}
            <button
              onClick={fetchAllData}
              disabled={isRefreshing}
              className="p-2 text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition-colors"
              title={language === 'en' ? 'Refresh All Data' : 'তথ্য রিফ্রেশ করুন'}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-700' : ''}`} />
            </button>

            {/* Back to Customer Website */}
            <button
              onClick={onExitAdmin}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              <span>{language === 'en' ? 'View Store' : 'ওয়েবসাইটে ফিরুন'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            {/* Admin User Info */}
            <div className="text-right hidden sm:block pl-2 border-l border-slate-100">
              <span className="text-xs font-bold text-slate-800 block truncate max-w-[140px]">
                {adminUserName || config.contactPerson}
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold block">
                {language === 'en' ? 'Super Admin / Owner' : 'মালিক / প্রধান প্রশাসক'}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              title={language === 'en' ? 'Log Out' : 'লগআউট'}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex gap-6">
        {/* Desktop Sidebar */}
        <aside className="w-64 shrink-0 hidden lg:block text-left">
          <div className="bg-white rounded-2xl border border-emerald-100/80 p-3 shadow-xs sticky top-22 space-y-1">
            <div className="px-3 py-2 text-[11px] font-bold text-emerald-900/60 uppercase tracking-wider">
              {language === 'en' ? 'Management Menu' : 'ম্যানেজমেন্ট মেনু'}
            </div>

            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const label = language === 'en' ? item.labelEn : item.labelBn;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-emerald-50/60 hover:text-emerald-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-1.8 py-0.2 rounded-full text-[10px] font-bold tabular-nums ${
                      isActive ? 'bg-white text-emerald-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Quick Website Switch on Sidebar */}
            <div className="pt-3 border-t border-slate-100 mt-2">
              <button
                onClick={onExitAdmin}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-emerald-700 hover:bg-slate-50 transition-colors"
              >
                <span>{language === 'en' ? 'Customer Website' : 'কাস্টমার ভিউ'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Drawer Sidebar */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative w-72 max-w-full bg-white h-full p-4 overflow-y-auto shadow-2xl flex flex-col justify-between text-left">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2">
                    <BrandLogo size="xs" className="ring-1 ring-emerald-600/30 shadow-2xs" />
                    <span className="font-bold text-slate-900 text-sm">
                      {language === 'en' ? 'Admin Navigation' : 'অ্যাডমিন মেনু'}
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-1">
                  {navItems.map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    const label = language === 'en' ? item.labelEn : item.labelBn;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4" />
                          <span>{label}</span>
                        </div>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                            isActive ? 'bg-white text-emerald-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => {
                    toggleLanguage();
                    setMobileSidebarOpen(false);
                  }}
                  className="w-full py-2 bg-emerald-50 text-emerald-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2"
                >
                  <Globe className="w-4 h-4" />
                  <span>{language === 'en' ? 'Switch to বাংলা' : 'Switch to English'}</span>
                </button>
                <button
                  onClick={onLogout}
                  className="w-full py-2 bg-rose-50 text-rose-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{language === 'en' ? 'Log Out' : 'লগআউট'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Pane */}
        <main className="flex-1 min-w-0">
          {activeTab === 'overview' && (
            <DashboardOverview
              summary={financialSummary}
              orders={orders}
              foods={foods}
              catering={catering}
              onNavigateTab={tab => setActiveTab(tab)}
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

          {activeTab === 'payments' && (
            <PaymentManagement
              paymentMethods={paymentMethods}
              onRefreshData={fetchAllData}
            />
          )}

          {activeTab === 'banners' && (
            <BannerManagement
              config={config}
              onRefreshConfig={onRefreshConfig}
            />
          )}

          {activeTab === 'zones' && (
            <DeliveryZoneManagement
              zones={zones}
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

          {activeTab === 'reviews' && (
            <ReviewManagement
              onRefreshStats={fetchAllData}
            />
          )}

          {activeTab === 'smtp' && (
            <SmtpSettings />
          )}

          {activeTab === 'broadcast' && (
            <BroadcastEmailManagement
              config={config}
              foods={foods}
              coupons={coupons}
              onRefreshData={fetchAllData}
            />
          )}

          {activeTab === 'cloud-sync' && (
            <CloudSyncManagement
              foods={foods}
              categories={categories}
              onRefreshData={fetchAllData}
            />
          )}

          {activeTab === 'roles' && (
            <UserRoleManagement
              currentAdminEmail={adminUserEmail || 'rmartbdltd@gmail.com'}
              onRefreshData={fetchAllData}
            />
          )}

          {activeTab === 'ai-hub' && (
            <AdminAiHub
              categories={categories}
              foods={foods}
              onRefreshData={fetchAllData}
              onNavigateTab={tab => setActiveTab(tab)}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsManagement
              config={config}
              onRefreshConfig={onRefreshConfig}
            />
          )}
        </main>
      </div>
    </div>
  );
};
