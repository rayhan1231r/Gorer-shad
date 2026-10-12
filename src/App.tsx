/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext.tsx';
import { CartProvider, useCart } from './context/CartContext.tsx';
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
import { ProfilePage } from './components/customer/ProfilePage.tsx';
import { AdminLoginModal } from './components/admin/AdminLoginModal.tsx';
import { AdminLayout } from './components/admin/AdminLayout.tsx';
import { AiCustomerSupport } from './components/customer/AiCustomerSupport.tsx';
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

function AppContent() {
  const { language } = useLanguage();
  const { addToCart } = useCart();
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
  const [adminUserEmail, setAdminUserEmail] = useState('rmartbdltd@gmail.com');

  // Customer Authentication & Account
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalNotice, setAuthModalNotice] = useState<string | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // Order & Tracking Flow
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [trackingOrderNumber, setTrackingOrderNumber] = useState('');

  // Dynamically update document title & language tag
  useEffect(() => {
    document.documentElement.lang = language;
    if (language === 'en') {
      document.title = 'Ghorer Shad — Authentic Homemade Food & Catering';
      document.body.className = 'bg-white text-slate-900 antialiased font-sans';
    } else {
      document.title = 'ঘরের স্বাদ (Ghorer Shad) — ঘরোয়া খাবার অর্ডার ও ক্যাটারিং';
      document.body.className = 'bg-white text-slate-900 antialiased font-bengali';
    }
  }, [language]);

  const handleRequireLogin = (reason?: string) => {
    const defaultReason = language === 'en'
      ? 'Please log in to add food to your bag or place an order.'
      : 'কার্টে খাবার যোগ করতে বা অর্ডার করতে অনুগ্রহ করে আগে লগইন করুন।';
    setAuthModalNotice(reason || defaultReason);
    setIsAuthModalOpen(true);
  };

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
        const isElevated = ['owner', 'admin', 'subadmin', 'staff'].includes(user.role);
        if (isElevated) {
          setIsAdminLoggedIn(true);
          setAdminUserName(user.name);
        } else {
          setIsAdminLoggedIn(false);
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
    const isElevated = currentUser && ['owner', 'admin', 'subadmin', 'staff'].includes(currentUser.role);
    if (isAdminLoggedIn && isElevated) {
      setActivePage('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const verify = await api.verifyAdminRole();
    if (verify.verified) {
      setIsAdminLoggedIn(true);
      if (verify.user?.name) setAdminUserName(verify.user.name);
      if (verify.user?.email) setAdminUserEmail(verify.user.email);
      setActivePage('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleLoginSuccess = (token: string, userName: string) => {
    if (token) api.setToken(token);
    setIsAdminLoggedIn(true);
    setAdminUserName(userName);
    loadInitialData();
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
    if (!currentUser) {
      handleRequireLogin();
      return;
    }
    setSelectedFoodForModal(food);
  };

  const handleBuyNow = (food: FoodItem) => {
    if (!currentUser) {
      handleRequireLogin(
        language === 'en'
          ? 'Please log in to proceed with direct checkout.'
          : 'সরাসরি অর্ডার করতে অনুগ্রহ করে আগে লগইন করুন।'
      );
      return;
    }
    addToCart(food, 1, food.variants?.[0], []);
    setSelectedFoodForModal(null);
    setActivePage('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    setAuthModalNotice(null);
    const isElevated = ['owner', 'admin', 'subadmin', 'staff'].includes(user.role);
    if (isElevated) {
      setIsAdminLoggedIn(true);
      setAdminUserName(user.name);
      setAdminUserEmail(user.email);
    } else {
      setIsAdminLoggedIn(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAdminLoggedIn(false);
    api.setToken('');
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      {activePage === 'admin' && isAdminLoggedIn ? (
        /* Admin Panel View */
        <AdminLayout
          config={config}
          onRefreshConfig={loadInitialData}
          onExitAdmin={() => {
            loadInitialData();
            setActivePage('home');
          }}
          onLogout={() => {
            setIsAdminLoggedIn(false);
            loadInitialData();
            setActivePage('home');
          }}
          adminUserName={adminUserName}
          adminUserEmail={adminUserEmail}
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
            onOpenAuth={() => {
              setAuthModalNotice(null);
              setIsAuthModalOpen(true);
            }}
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
                onBuyNow={handleBuyNow}
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
                onBuyNow={handleBuyNow}
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
                currentUser={currentUser}
                onRequireLogin={() =>
                  handleRequireLogin(
                    language === 'en'
                      ? 'Please log in to complete your order.'
                      : 'অর্ডার সম্পন্ন করতে অনুগ্রহ করে আগে লগইন করুন।'
                  )
                }
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

            {activePage === 'profile' && (
              <ProfilePage
                currentUser={currentUser}
                onNavigateMenu={() => {
                  setActivePage('menu');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onTrackOrder={handleTrackOrderFromConfirmation}
                onRequireLogin={() =>
                  handleRequireLogin(
                    language === 'en'
                      ? 'Please log in to view your profile and rankings.'
                      : 'প্রোফাইল ও র‌্যাঙ্কিং দেখতে অনুগ্রহ করে লগইন করুন।'
                  )
                }
                onProfileUpdated={updatedUser => setCurrentUser(updatedUser)}
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
          <AiCustomerSupport
            config={config}
            onNavigate={handleNavigate}
            foods={foods}
          />
          <CartDrawer
            onProceedToCheckout={() => {
              setActivePage('checkout');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            currentUser={currentUser}
            onRequireLogin={() =>
              handleRequireLogin(
                language === 'en'
                  ? 'Please log in to complete your order.'
                  : 'অর্ডার সম্পন্ন করতে অনুগ্রহ করে আগে লগইন করুন।'
              )
            }
          />
        </>
      )}

      {/* Global Modals */}
      {selectedFoodForModal && (
        <FoodDetailModal
          food={selectedFoodForModal}
          onClose={() => setSelectedFoodForModal(null)}
          whatsappNumber={config.whatsapp}
          currentUser={currentUser}
          onBuyNow={() => handleBuyNow(selectedFoodForModal)}
          onRequireLogin={() =>
            handleRequireLogin(
              language === 'en'
                ? 'Please log in to add items to your cart or place an order.'
                : 'কার্টে খাবার যোগ করতে বা অর্ডার করতে অনুগ্রহ করে আগে লগইন করুন।'
            )
          }
        />
      )}

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        foods={foods}
        onSelectFood={food => setSelectedFoodForModal(food)}
        onQuickAdd={handleQuickAdd}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setAuthModalNotice(null);
        }}
        onAuthSuccess={handleAuthSuccess}
        customNotice={authModalNotice}
      />

      {currentUser && (
        <AccountModal
          isOpen={isAccountModalOpen}
          onClose={() => setIsAccountModalOpen(false)}
          user={currentUser}
          onLogout={handleLogout}
          onTrackOrder={handleTrackOrderFromConfirmation}
          onOpenAdmin={handleAdminClick}
          onNavigateProfile={() => {
            setIsAccountModalOpen(false);
            setActivePage('profile');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </LanguageProvider>
  );
}
