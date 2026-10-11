/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { Header } from './components/common/Header.tsx';
import { Footer } from './components/common/Footer.tsx';
import { WhatsAppButton } from './components/common/WhatsAppButton.tsx';
import { HomePage } from './components/customer/HomePage.tsx';
import { MenuPage } from './components/customer/MenuPage.tsx';
import { FoodDetailModal } from './components/customer/FoodDetailModal.tsx';
import { CartDrawer } from './components/customer/CartDrawer.tsx';
import { CheckoutPage } from './components/customer/CheckoutPage.tsx';
import { OrderConfirmationPage } from './components/customer/OrderConfirmationPage.tsx';
import { TrackOrderPage } from './components/customer/TrackOrderPage.tsx';
import { CateringPage } from './components/customer/CateringPage.tsx';
import { PolicyPages } from './components/customer/PolicyPages.tsx';
import { SearchModal } from './components/customer/SearchModal.tsx';
import { AuthModal } from './components/customer/AuthModal.tsx';
import { AccountModal } from './components/customer/AccountModal.tsx';
import { AdminLoginModal } from './components/admin/AdminLoginModal.tsx';
import { AdminLayout } from './components/admin/AdminLayout.tsx';
import { BusinessConfig, Category, FoodItem, Order, AppUser } from './types/index.ts';
import { api } from './services/api.ts';

const FALLBACK_CONFIG: BusinessConfig = {
  brandNameBn: "ঘরের স্বাদ",
  brandNameEn: "Ghorer Shad",
  taglineBn: "সব স্বাদের এক ঠিকানা",
  taglineEn: "One destination for every authentic taste",
  contactPerson: "Joynob Islam Kakoly",
  phone: "01857-220603",
  whatsapp: "+8801912838891",
  email: "ghorershad.arai@gmail.com",
  primaryLocation: "আড়াইহাজার, ঢাকা",
  fullAddressBn: "আড়াইহাজার বাজার রোড, আড়াইহাজার, নারায়ণগঞ্জ / ঢাকা, বাংলাদেশ",
  announcementBarBn: "খাঁটি ঘরোয়া খাবারের নিশ্চয়তা • খাবারের মান ও টাটকা স্বাদের জন্য অগ্রিম ৪-৬ ঘন্টা আগে অর্ডার করুন! কল: 01857-220603",
  isAnnouncementActive: true,
  standardAdvanceHours: 4,
  urgentAdvanceHours: 2,
  advanceNoticeMessageBn: "আমরা কোনো খাবার ফ্রিজে রেখে বা বাসি খাবার সরবরাহ করি না। প্রতিটি খাবার আপনার অর্ডারের পর তাজা ও সম্পূর্ণ স্বাস্থ্যসম্মত উপায়ে ঘরোয়া পরিবেশে তৈরি করা হয়। তাই কমপক্ষে ৪-৬ ঘন্টা পূর্বে অগ্রিম অর্ডার দেওয়ার জন্য বিনীত অনুরোধ করা হচ্ছে। জরুরি প্রয়োজনে সরাসরি ফোনে যোগাযোগ করুন।",
  openingHoursBn: "সকাল ৯:০০ - রাত ৯:০০ (প্রতিদিন)",
  currency: "BDT",
  currencySymbol: "৳",
  bkashNumber: "01912-838891 (Personal)",
  nagadNumber: "01857-220603 (Personal)",
  rocketNumber: "01857-220603-9",
  bankDetails: "Islami Bank Bangladesh Ltd, Araihazar Branch"
};

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [config, setConfig] = useState<BusinessConfig>(FALLBACK_CONFIG);
  const [categories, setCategories] = useState<Category[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);

  // Modals & Overlays
  const [selectedFoodForModal, setSelectedFoodForModal] = useState<FoodItem | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUserName, setAdminUserName] = useState('Joynob Islam Kakoly');

  // Customer Authentication & Account
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // Order & Tracking Flow
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [trackingOrderNumber, setTrackingOrderNumber] = useState('');

  const loadInitialData = async () => {
    try {
      const [cfg, cats, fds, user] = await Promise.all([
        api.getConfig(),
        api.getCategories(),
        api.getFoods(),
        api.getCurrentUser()
      ]);
      setConfig(cfg);
      setCategories(cats);
      setFoods(fds);
      if (user) {
        setCurrentUser(user);
        if (user.role === 'admin' || user.role === 'staff') {
          setIsAdminLoggedIn(true);
          setAdminUserName(user.name);
        }
      }
    } catch (err) {
      console.warn('Using local fallback config:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleAdminClick = async () => {
    if (isAdminLoggedIn) {
      const verify = await api.verifyAdminRole();
      if (verify.verified) {
        setActivePage('admin');
      } else {
        setIsAdminLoggedIn(false);
        setIsAdminLoginOpen(true);
      }
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleLoginSuccess = (_token: string, userName: string) => {
    setIsAdminLoggedIn(true);
    setAdminUserName(userName);
    setActivePage('admin');
  };

  const handleNavigate = (page: string, categoryId?: string) => {
    if (categoryId) {
      setSelectedCategoryId(categoryId);
    }
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickAdd = (food: FoodItem) => {
    setSelectedFoodForModal(food);
  };

  const handleOrderSuccess = (order: Order) => {
    setConfirmedOrder(order);
    setActivePage('confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTrackOrderFromConfirmation = (orderNumber: string) => {
    setTrackingOrderNumber(orderNumber);
    setActivePage('track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = (user: AppUser) => {
    setCurrentUser(user);
    if (user.role === 'admin' || user.role === 'staff') {
      setIsAdminLoggedIn(true);
      setAdminUserName(user.name);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAdminLoggedIn(false);
    api.setToken('');
  };

  return (
    <LanguageProvider>
      <CartProvider>
      <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900">
        {activePage === 'admin' && isAdminLoggedIn ? (
          /* Admin Panel View */
          <AdminLayout
            config={config}
            onRefreshConfig={loadInitialData}
            onExitAdmin={() => setActivePage('home')}
            onLogout={() => {
              setIsAdminLoggedIn(false);
              setActivePage('home');
            }}
            adminUserName={adminUserName}
          />
        ) : (
          /* Customer Facing Interface */
          <>
            <Header
              config={config}
              activeTab={activePage}
              setActiveTab={handleNavigate}
              onOpenSearch={() => setIsSearchOpen(true)}
              isAdminLoggedIn={isAdminLoggedIn}
              onAdminClick={handleAdminClick}
              currentUser={currentUser}
              onOpenAuth={() => setIsAuthModalOpen(true)}
              onOpenAccount={() => setIsAccountModalOpen(true)}
            />

            <main className="flex-1">
              {activePage === 'home' && (
                <HomePage
                  config={config}
                  categories={categories}
                  foods={foods}
                  onNavigate={handleNavigate}
                  onSelectFood={food => setSelectedFoodForModal(food)}
                  onQuickAdd={handleQuickAdd}
                />
              )}

              {(activePage === 'menu' || activePage === 'platters') && (
                <MenuPage
                  categories={categories}
                  foods={activePage === 'platters' ? foods.filter(f => f.categoryId === 'platters-combos') : foods}
                  selectedCategoryId={activePage === 'platters' ? 'platters-combos' : selectedCategoryId}
                  onSelectCategory={setSelectedCategoryId}
                  onSelectFood={food => setSelectedFoodForModal(food)}
                  onQuickAdd={handleQuickAdd}
                />
              )}

              {activePage === 'catering' && (
                <CateringPage config={config} />
              )}

              {activePage === 'checkout' && (
                <CheckoutPage
                  config={config}
                  onBackToMenu={() => setActivePage('menu')}
                  onOrderSuccess={handleOrderSuccess}
                />
              )}

              {activePage === 'confirmation' && confirmedOrder && (
                <OrderConfirmationPage
                  order={confirmedOrder}
                  config={config}
                  onTrackOrder={handleTrackOrderFromConfirmation}
                  onBackToHome={() => setActivePage('home')}
                />
              )}

              {activePage === 'track' && (
                <TrackOrderPage
                  initialOrderNumber={trackingOrderNumber}
                  config={config}
                />
              )}

              {(activePage === 'about' ||
                activePage === 'faq' ||
                activePage === 'delivery-policy' ||
                activePage === 'refund-policy' ||
                activePage === 'privacy-policy' ||
                activePage === 'terms') && (
                <PolicyPages
                  pageType={activePage as any}
                  config={config}
                  onNavigateMenu={() => setActivePage('menu')}
                />
              )}
            </main>

            <Footer
              config={config}
              onNavigate={handleNavigate}
            />

            {/* Persistent Customer Utilities */}
            <WhatsAppButton phone={config.whatsapp} />
            <CartDrawer
              onProceedToCheckout={() => {
                setActivePage('checkout');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </>
        )}

        {/* Global Modals */}
        <FoodDetailModal
          food={selectedFoodForModal}
          onClose={() => setSelectedFoodForModal(null)}
          whatsappNumber={config.whatsapp}
        />

        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          foods={foods}
          onSelectFood={food => setSelectedFoodForModal(food)}
          onQuickAdd={handleQuickAdd}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />

        {currentUser && (
          <AccountModal
            isOpen={isAccountModalOpen}
            onClose={() => setIsAccountModalOpen(false)}
            user={currentUser}
            onLogout={handleLogout}
            onTrackOrder={handleTrackOrderFromConfirmation}
            onOpenAdmin={handleAdminClick}
          />
        )}

        <AdminLoginModal
          isOpen={isAdminLoginOpen}
          onClose={() => setIsAdminLoginOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    </CartProvider>
  </LanguageProvider>
  );
}
