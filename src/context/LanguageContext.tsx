import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types/index.ts';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, bnFallback?: string, enFallback?: string) => string;
}

const UI_TRANSLATIONS: Record<string, { bn: string; en: string }> = {
  // Navigation
  home: { bn: 'হোম', en: 'Home' },
  menu: { bn: 'খাবারের তালিকা', en: 'Menu' },
  platters: { bn: 'প্ল্যাটার ও প্যাকেজ', en: 'Platters' },
  catering: { bn: 'ক্যাটারিং ও বড় আয়োজন', en: 'Catering' },
  track: { bn: 'অর্ডার ট্র্যাক', en: 'Track Order' },
  about: { bn: 'আমাদের কথা', en: 'About Us' },
  faq: { bn: 'সাধারণ জিজ্ঞাসা', en: 'FAQ' },
  deliveryPolicy: { bn: 'ডেলিভারি নীতিমালা', en: 'Delivery Policy' },
  refundPolicy: { bn: 'রিফান্ড ও ক্যান্সেলেশন', en: 'Refund Policy' },

  // Header & Actions
  searchFood: { bn: 'খাবার খুঁজুন', en: 'Search Food' },
  bag: { bn: 'ব্যাগ', en: 'Bag' },
  login: { bn: 'লগইন', en: 'Login' },
  register: { bn: 'রেজিস্টার', en: 'Register' },
  myAccount: { bn: 'আমার অ্যাকাউন্ট', en: 'My Account' },
  adminPanel: { bn: 'অ্যাডমিন ড্যাশবোর্ড', en: 'Admin Dashboard' },
  adminLogin: { bn: 'অ্যাডমিন প্রবেশ', en: 'Admin Login' },

  // Hero Section
  heroBadge: {
    bn: 'ঘরের স্বাদ • সব স্বাদের এক ঠিকানা • আড়াইহাজার, ঢাকা',
    en: 'Ghorer Shad • One Destination for Every Taste • Araihazar, Dhaka'
  },
  heroHeadlinePrefix: { bn: 'ঘরের রান্নার ভালোবাসা,', en: 'Homemade Love & Fresh Taste,' },
  heroHeadlineHighlight: { bn: 'এবার আপনার দোরগোড়ায়', en: 'Delivered Right to Your Doorstep' },
  heroSubtitle: {
    bn: 'ঘরের স্বাদে বেছে নিন আপনার পছন্দের খাবার। অর্ডার দিন সুবিধামতো, আর আপনার খাবারের সময় আগে থেকেই পরিকল্পনা করুন।',
    en: 'Choose your favorite homemade delicacies at Ghorer Shad. Order comfortably and plan your meal timing in advance.'
  },
  heroAdvanceTitle: {
    bn: 'অগ্রিম অর্ডারের পরিকল্পনা ও প্রস্তুতি সময়:',
    en: 'Advance Order Planning & Preparation Time:'
  },
  heroAdvanceDesc: {
    bn: 'আমরা কোনো খাবার জমিয়ে রাখি না। অর্ডারের পর খাঁটি তেলে তাজা রান্না হয়। খাবারের সর্বোচ্চ স্বাদ ও গুণমানের জন্য কমপক্ষে ৪-৬ ঘন্টা পূর্বে অর্ডার দিন। জরুরি প্রয়োজনে সরাসরি ফোনে যোগাযোগ করুন।',
    en: 'We never preserve precooked dishes. Every meal is freshly prepared with pure oil and spices after your order. Please order 4-6 hours in advance for the finest taste.'
  },
  viewMenuBtn: { bn: 'মেনু দেখুন', en: 'View Menu' },
  learnCateringBtn: { bn: 'ক্যাটারিং সম্পর্কে জানুন', en: 'Learn About Catering' },
  freshCooking: { bn: 'অর্ডারের পর তাজা রান্না', en: 'Cooked Fresh After Order' },
  pureIngredients: { bn: 'খাঁটি ঘরোয়া মশলা ও তেল', en: 'Pure Homemade Spices' },
  localDelivery: { bn: 'আড়াইহাজারে হোম ডেলিভারি', en: 'Araihazar Home Delivery' },
  specialFeastTag: { bn: 'ঘরের স্পেশাল ঐতিহ্যবাহী রান্না', en: 'Traditional Homemade Delicacy' },
  specialFeastTitle: { bn: 'পদ্মার ইলিশ, দেশি মাংস ও পারিবারিক ভোজ', en: 'Padma Hilsa, Desi Meat & Family Feasts' },
  specialIlishTag: { bn: 'স্পেশাল সরষে ইলিশ', en: 'Special Shorshe Ilish' },
  specialIlishDesc: { bn: '১০০% খাঁটি সর্ষে বাটা ও তাজা ইলিশ', en: 'Fresh Hilsa with Pure Mustard Gravy' },

  // Categories & Foods
  menuCategoriesTitle: { bn: 'মেনু ক্যাটাগরি', en: 'Menu Categories' },
  pickFavoriteTitle: { bn: 'আপনার পছন্দের পদ বেছে নিন', en: 'Choose Your Favorite Dishes' },
  viewAllFoods: { bn: 'সকল খাবার দেখুন', en: 'View All Menu' },
  customerFavoritesTag: { bn: 'ঘরের স্বাদের বিশেষ আয়োজন', en: 'Special Selections' },
  popularFoodsTitle: { bn: 'জনপ্রিয় খাবার ও স্পেশাল পদসমূহ', en: 'Popular Foods & Chef Specials' },
  browseFullMenu: { bn: 'পুরো মেনু ব্রাউজ করুন', en: 'Browse Full Menu' },

  // Platters
  familySpecialTag: { bn: 'ফ্যামিলি স্পেশাল', en: 'Family Special' },
  plattersTitle: { bn: 'উইকেন্ড ও পারিবারিক আড্ডায় স্পেশাল ফুড প্ল্যাটার', en: 'Special Food Platters for Weekend Gatherings' },
  plattersDesc: {
    bn: 'পারিবারিক ভোজ ও মেহমানদারির জন্য প্রস্তুত ৪-১০ জনের পেটভরা কম্বো প্যাকেজ। পোলাও, রোস্ট, ইলিশ মাছ ভাজা, বোরহানি ও শাহি মিষ্টির পরিপূর্ণ আয়োজন।',
    en: 'Wholesome 4-10 person combo packages crafted for family dining. Fragrant pulao, roast chicken, crispy fish, borhani, and sweet treats.'
  },
  viewAllPlatters: { bn: 'সব প্ল্যাটার দেখুন', en: 'View All Platters' },

  // Delivery Areas
  deliveryAreasTag: { bn: 'ডেলিভারি আওতাভুক্ত এলাকা', en: 'Delivery Areas' },
  deliveryAreasTitle: { bn: 'আড়াইহাজার উপজেলার প্রধান এলাকাগুলোতে নিরাপদ হোম ডেলিভারি', en: 'Safe Home Delivery Across Araihazar Upazila' },
  deliveryAreasDesc: {
    bn: 'আমরা সরাসরি আমাদের নিজস্ব রাইডারদের মাধ্যমে গরম ও পরিচ্ছন্নভাবে খাবার পৌঁছে দিই। আপনার অর্ডার নিশ্চিত হওয়ার সাথে সাথেই খাবার রান্নার সময়সূচী নির্ধারিত হয়।',
    en: 'We deliver hot and hygienic meals through our own dedicated riders. Preparation begins promptly upon order confirmation.'
  },
  whyUnique: { bn: 'কেন "ঘরের স্বাদ" সবার চেয়ে আলাদা?', en: 'Why Choose Ghorer Shad?' },
  proprietor: { bn: 'পরিচালক', en: 'Proprietor' },
  whatsappChat: { bn: 'হোয়াটসঅ্যাপে যোগাযোগ করুন', en: 'Chat on WhatsApp' },
  callNow: { bn: 'কল করুন', en: 'Call Now' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gs_lang');
      if (saved === 'en' || saved === 'bn') return saved;
    }
    return 'bn'; // Default language is Bangla
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gs_lang', lang);
    }
  };

  const toggleLanguage = () => {
    const nextLang = language === 'bn' ? 'en' : 'bn';
    setLanguage(nextLang);
  };

  const t = (key: string, bnFallback?: string, enFallback?: string): string => {
    const entry = UI_TRANSLATIONS[key];
    if (entry) {
      return language === 'en' ? entry.en : entry.bn;
    }
    if (language === 'en' && enFallback) return enFallback;
    if (bnFallback) return bnFallback;
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
