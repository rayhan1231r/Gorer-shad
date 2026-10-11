import React, { useState } from 'react';
import { ShoppingBag, Search, Phone, User, Menu as MenuIcon, X, ShieldAlert } from 'lucide-react';
import { useCart } from '../../context/CartContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { LanguageToggle } from './LanguageToggle.tsx';
import { BusinessConfig, AppUser } from '../../types/index.ts';

interface HeaderProps {
  config: BusinessConfig;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSearch: () => void;
  isAdminLoggedIn: boolean;
  onAdminClick: () => void;
  currentUser?: AppUser | null;
  onOpenAuth?: () => void;
  onOpenAccount?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  activeTab,
  setActiveTab,
  onOpenSearch,
  isAdminLoggedIn,
  onAdminClick,
  currentUser,
  onOpenAuth,
  onOpenAccount
}) => {
  const { totalItemsCount, setIsCartOpen } = useCart();
  const { language, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', labelBn: 'হোম', labelEn: 'Home' },
    { id: 'menu', labelBn: 'খাবারের তালিকা', labelEn: 'Menu' },
    { id: 'platters', labelBn: 'প্ল্যাটার ও প্যাকেজ', labelEn: 'Platters' },
    { id: 'catering', labelBn: 'ক্যাটারিং ও বড় আয়োজন', labelEn: 'Catering' },
    { id: 'track', labelBn: 'অর্ডার ট্র্যাক', labelEn: 'Track Order' },
    { id: 'about', labelBn: 'আমাদের কথা', labelEn: 'About' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] text-left">
      {/* Announcement Bar */}
      {config.isAnnouncementActive && (
        <div className="bg-emerald-800 text-white text-xs py-1.5 px-4 font-medium transition-colors">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <p className="truncate text-emerald-50">
              {config.announcementBarBn}
            </p>
            <div className="flex items-center gap-3 shrink-0 text-emerald-100 text-xs">
              <a
                href={`tel:${config.phone}`}
                className="hidden sm:flex items-center gap-1 hover:text-white transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{config.phone}</span>
              </a>
              <span className="hidden sm:inline text-emerald-500">·</span>
              
              {/* Language Switcher in announcement bar */}
              <LanguageToggle variant="compact" className="bg-emerald-900/80 border-emerald-700/80 text-white" />

              {/* Admin Panel button - ONLY visible when admin Gmail/account is logged in */}
              {isAdminLoggedIn && (
                <>
                  <span className="hidden sm:inline text-emerald-500">·</span>
                  <button
                    onClick={onAdminClick}
                    className="inline-flex items-center gap-1 bg-emerald-700/90 hover:bg-emerald-600 text-white px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    <ShieldAlert className="w-3 h-3 text-amber-300" />
                    <span>{language === 'en' ? 'Admin Panel' : 'অ্যাডমিন প্যানেল'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Header - Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 sm:gap-6 h-20">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={() => {
                setActiveTab('home');
                setMobileMenuOpen(false);
              }}
              className="text-left group flex items-center gap-3 cursor-pointer"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xl shadow-sm">
                স্বাদ
              </div>
              <div>
                <span className="block text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-tight group-hover:text-emerald-700 transition-colors">
                  {language === 'en' ? config.brandNameEn : config.brandNameBn}
                </span>
                <span className="block text-xs font-medium text-slate-500 tracking-wider">
                  {language === 'en' ? config.taglineEn : config.taglineBn}
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
                  activeTab === link.id
                    ? 'text-emerald-700 font-semibold border-b-2 border-emerald-700'
                    : 'hover:text-slate-900'
                }`}
              >
                {language === 'en' ? link.labelEn : link.labelBn}
              </button>
            ))}
          </nav>

          {/* Zone 3: Primary Action & Shortcuts */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Desktop Language Switcher */}
            <div className="hidden md:block">
              <LanguageToggle variant="compact" />
            </div>

            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              title={t('searchFood')}
              aria-label={t('searchFood')}
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Customer Account & Admin Button */}
            {currentUser ? (
              <div className="flex items-center gap-1.5">
                {isAdminLoggedIn && (
                  <button
                    onClick={onAdminClick}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg transition-colors cursor-pointer"
                    title={language === 'en' ? 'Open Admin Panel' : 'অ্যাডমিন প্যানেলে প্রবেশ'}
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-emerald-800" />
                    <span className="hidden sm:inline font-bold">
                      {language === 'en' ? 'Admin' : 'অ্যাডমিন'}
                    </span>
                  </button>
                )}
                <button
                  onClick={onOpenAccount}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  title={t('myAccount')}
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">
                    {currentUser.name ? currentUser.name.slice(0, 1).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden md:inline max-w-[80px] truncate">{currentUser.name}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-emerald-700" />
                <span>{t('login')}</span>
              </button>
            )}

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-sm cursor-pointer"
              aria-label={t('bag')}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">{t('bag')}</span>
              {totalItemsCount > 0 && (
                <span className="bg-white text-emerald-800 font-bold text-xs px-1.5 py-0.2 rounded-md tabular-nums min-w-[20px] text-center">
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg cursor-pointer"
              aria-label="মেনু খুলুন"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 py-3 shadow-lg">
          <nav className="flex flex-col space-y-2">
            {/* Language selector prominently on mobile */}
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl mb-1">
              <span className="text-xs font-semibold text-slate-700">Language / ভাষা:</span>
              <LanguageToggle variant="compact" />
            </div>

            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => {
                  setActiveTab(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer ${
                  activeTab === link.id
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {language === 'en' ? link.labelEn : link.labelBn}
              </button>
            ))}

            {/* Mobile Account button */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              {currentUser ? (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAccount?.();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold bg-slate-50 text-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-700" />
                      <span>{t('myAccount')} ({currentUser.name})</span>
                    </div>
                  </button>

                  {isAdminLoggedIn && (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onAdminClick();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-2 cursor-pointer"
                    >
                      <ShieldAlert className="w-4 h-4 text-emerald-800" />
                      <span>{language === 'en' ? 'Admin Dashboard' : 'অ্যাডমিন ড্যাশবোর্ড'}</span>
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth?.();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-emerald-700" />
                  <span>{t('login')} / {t('register')}</span>
                </button>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  {config.phone}
                </span>
                <span className="text-[11px] text-slate-400">
                  {config.primaryLocation}
                </span>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
