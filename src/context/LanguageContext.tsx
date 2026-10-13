import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, FoodItem, FoodVariant, FoodAddon, Category, DeliveryZone, PaymentMethodConfig, OrderStatus } from '../types/index.ts';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, bnFallback?: string, enFallback?: string) => string;
  formatPrice: (amount?: number | null) => string;
  formatDate: (dateInput?: string | number | Date | null) => string;
  getFoodTitle: (food: FoodItem) => string;
  getFoodShortDesc: (food: FoodItem) => string;
  getFoodFullDesc: (food: FoodItem) => string;
  getFoodPortion: (food: FoodItem) => string;
  getFoodCategory: (food: FoodItem) => string;
  getVariantTitle: (variant: FoodVariant) => string;
  getAddonTitle: (addon: FoodAddon) => string;
  getCategoryTitle: (cat: Category) => string;
  getCategoryDescription: (cat: Category) => string;
  getZoneTitle: (zone?: DeliveryZone | null) => string;
  getZoneETA: (zone?: DeliveryZone | null) => string;
  getPaymentMethodTitle: (pm: { id?: string; type?: string; nameBn?: string; nameEn?: string }) => string;
  getPaymentInstructions: (pm: PaymentMethodConfig) => string;
  getSpiceLevelText: (level?: string) => string;
  getOrderStatusText: (status: OrderStatus) => string;
  getOrderStatusDesc: (status: OrderStatus) => string;
}

// Complete Food English & Bengali Translations Registry
const FOOD_TRANSLATIONS: Record<string, {
  nameEn: string;
  nameBn: string;
  shortDescEn: string;
  shortDescBn: string;
  fullDescEn: string;
  fullDescBn: string;
  portionEn: string;
  portionBn: string;
  categoryNameEn: string;
}> = {
  'food-1': {
    nameEn: 'Shorshe Ilish with Saffron Pulao Combo',
    nameBn: 'সরষে ইলিশ ও জাফরানি পোলাও কম্বো',
    shortDescEn: 'Fresh Padma Hilsa cooked in authentic mustard paste served with fragrant pulao.',
    shortDescBn: 'পদ্মার তাজা ইলিশের খাঁটি সরিষা বাটা রেসিপি ও সুগন্ধি পোলাও।',
    fullDescEn: 'Fresh Padma Hilsa fish steak simmered in traditional mustard and poppy seed gravy with green chilies. Served alongside fragrant saffron ghee pulao, lemon slice, and fresh chilies. Prepared completely homemade and fresh after your order.',
    fullDescBn: 'পদ্মার তাজা বড় ইলিশ মাছের পেটি, খাঁটি সরিষা বাটা, পোস্ত ও কাঁচা মরিচের ঝাঁঝে ঐতিহ্যবাহী সরষে ইলিশ। সাথে পরিবেশন করা হয় ঘি-সুগন্ধি জাফরানি পোলাও, লেবুর ফালি ও সবুজ কাঁচামরিচ। সম্পূর্ণ ঘরোয়া ও স্বাস্থ্যকর উপায়ে অর্ডারের পর তাজা রান্না।',
    portionEn: '1 Person Full Meal (1 Hilsa steak + fragrant pulao)',
    portionBn: '১ জনের পেটভরা মিল (১ টুকরা ইলিশ + পোলাও)',
    categoryNameEn: 'Fish & Seafood'
  },
  'food-2': {
    nameEn: 'Homemade Chicken Bhuna with Fluffy Luchi',
    nameBn: 'ঘরোয়া চিকেন ভুনা ও গরম ফুলকো লুচি',
    shortDescEn: 'Spicy slow-cooked chicken bhuna served with 4 hot fluffy luchis.',
    shortDescBn: 'কড়া কষানো মশলাদার চিকেন ভুনা সাথে ৪টি গরম ফুলকো লুচি।',
    fullDescEn: 'Tender chicken slow-cooked with aromatic roasted spices, crispy onion beresta, and cinnamon-cardamom gravy. Served with four piping hot handmade luchis or handmade parathas. Pure homemade comfort dining.',
    fullDescBn: 'ঘরোয়া মশলায় কড়া করে কষানো রসালো চিকেন ভুনা। এলাচ-দারচিনির সুগন্ধি গ্রেভি এবং চার পিস গরম ফুলকো লুচি বা হাতে গড়া পরোটা। বিকেলে বা রাতের খাবারে অসাধারণ স্বাদ।',
    portionEn: '1 Person Full Meal (3 pcs chicken + 4 luchis)',
    portionBn: '১ জনের পেটভরা মিল (৩ পিস চিকেন + ৪ লুচি)',
    categoryNameEn: 'Meat & Chicken'
  },
  'food-3': {
    nameEn: 'Ghorer Shad Royal Bengali Feast Thali',
    nameBn: 'ঘরের স্বাদ রাজকীয় বাংলা থালি',
    shortDescEn: 'Complete traditional Bengali thali with steamed rice, fish or chicken, dal, bhorta and fries.',
    shortDescBn: 'ভাত, মাছ/মুরগি, আলু ভর্তা, ডাল, ভাজি ও সালাদের সম্পূর্ণ বাংলা আয়োজন।',
    fullDescEn: 'A satisfying royal Bengali feast featuring hot Miniket rice, Rui fish dopeyaja or deshi chicken curry, mustard oil mashed potato bhorta, golden moong dal, fried eggplant, fresh salad, and lemon.',
    fullDescBn: 'সম্পূর্ণ তৃপ্তিদায়ক ঐতিহ্যবাহী বাঙালি থালি। মিনিকেট চালের গরম ভাত, ১ টুকরা রুই মাছ দোপেঁয়াজা অথবা দেশি মুরগির ঝোল, সরিষার তেলে মাখানো স্পেশাল শুকনা মরিচ-আলু ভর্তা, সোনা মুগ ডাল, বেগুন ভাজা, লেবু ও কাঁচামরিচ সালাদ।',
    portionEn: '1 Person Grand Meal Platter',
    portionBn: '১ জনের জমকালো বাংলা মিল',
    categoryNameEn: 'Platters & Combos'
  },
  'food-4': {
    nameEn: 'Traditional Evening Snacks Platter',
    nameBn: 'ঐতিহ্যবাহী বৈকালিক নাস্তা ও স্ন্যাক্স প্ল্যাটার',
    shortDescEn: 'Crispy singaras, vegetable chops, fried bites and homemade tangy chutneys.',
    shortDescBn: 'খাস্তা সিঙ্গাড়া, চপ, ক্রিস্পি প্রন বল ও চাটনির মুখরোচক প্যাকেজ।',
    fullDescEn: 'Homemade afternoon snacks platter including 2 crispy potato-peanut singaras, 2 beetroot-vegetable chops, 2 crispy bites, and homemade mint-tamarind sweet and sour chutney.',
    fullDescBn: 'বিকেলের আড্ডার জন্য ঘরে বানানো স্বাস্থ্যকর নাস্তা। ২টি খাঁটি ঘিয়ে মাখানো খাস্তা আলু-বাদামের সিঙ্গাড়া, ২টি ভেজিটেবল বিট-আলু চপ, ২টি ক্রিস্পি প্রন/চিকেন বল এবং ঘরে তৈরি তেঁতুল ও পুদিনার টক-মিষ্টি স্পেশাল চাটনি।',
    portionEn: 'Snack Platter for 2 Persons',
    portionBn: '২ জনের উপযোগী নাস্তা বক্স',
    categoryNameEn: 'Fast Food & Snacks'
  },
  'food-1791740792587': {
    nameEn: 'Spicy Bengali Style Octopus Bhuna',
    nameBn: 'ঘরোয়া মশলায় কষা অক্টোপাস ভুনা',
    shortDescEn: 'Tender octopus slow-cooked with roasted mustard oil and homemade Bengali spices.',
    shortDescBn: 'খাঁটি সরিষার তেল ও ঘরোয়া মশলায় কষানো নরম ও লোভনীয় দেশি স্টাইলের অক্টোপাস ভুনা।',
    fullDescEn: 'Fresh octopus thoroughly cleaned and braised in authentic cold-pressed mustard oil with onions, garlic, ginger, and aromatic roasted cumin. Rich spicy gravy that pairs delightfully with hot rice.',
    fullDescBn: 'তাজা অক্টোপাস নিখুঁতভাবে পরিষ্কার করে পেঁয়াজ, রসুন ও আদা বাটার সাথে খাঁটি ঘানিভাঙা সরিষার তেলে কড়া আঁচে ভুনা করা হয়েছে। দেশি মশলা ও ভাজা জিরার দারুণ সুবাসে তৈরি এই মাঝারি ঝালের ঘন গ্রেভি গরম ভাতের সাথে সি-ফুডপ্রেমীদের মুখে এক অনন্য স্বাদ এনে দেবে।',
    portionEn: '1 Person Full Meal / Sharing for 2',
    portionBn: '১ জনের পেটভরা মিল অথবা ২ জনের শেয়ারিং',
    categoryNameEn: 'Fish & Seafood'
  }
};

const CATEGORY_TRANSLATIONS: Record<string, { nameEn: string; nameBn: string; descEn: string; descBn: string }> = {
  'fish-seafood': {
    nameEn: 'Fish & Seafood',
    nameBn: 'মাছ ও সি-ফুড',
    descEn: 'Fresh river and sea fish cooked in authentic homemade Bengali style',
    descBn: 'নদী ও সমুদ্রের তাজা মাছের ঘরোয়া রান্না'
  },
  'meat-chicken': {
    nameEn: 'Meat & Chicken',
    nameBn: 'মাংস ও মুরগি',
    descEn: 'Deshi chicken and spicy slow-cooked meat specialties',
    descBn: 'দেশি মুরগি ও কষা মাংসের স্পেশাল রেসিপি'
  },
  'bengali-meals': {
    nameEn: 'Bengali Homemade Meals',
    nameBn: 'বাঙালি ঘরোয়া খাবার',
    descEn: 'Daily wholesome meals with rice, lentils, seasonal curries and bhortas',
    descBn: 'প্রতিদিনের পুষ্টিকর ভাত, ডাল, তরকারি ও ভর্তা'
  },
  'platters-combos': {
    nameEn: 'Food Platters & Family Packages',
    nameBn: 'ফুড প্ল্যাটার ও ফ্যামিলি প্যাকেজ',
    descEn: 'Family feast packages and wholesome weekend combo platters',
    descBn: 'পারিবারিক ভোজ ও স্পেশাল দিনগুলোর জন্য কম্বো'
  },
  'fast-food-snacks': {
    nameEn: 'Fast Food & Evening Snacks',
    nameBn: 'ফাস্টফুড ও বৈকালিক নাস্তা',
    descEn: 'Crispy singaras, cutlets, chops and tea-time snacks',
    descBn: 'মুচমুচে সিঙ্গাড়া, চপ ও বিকেলে আড্ডার নাস্তা'
  },
  'office-daily-meals': {
    nameEn: 'Office & Daily Meal Subscriptions',
    nameBn: 'অফিস ও নিয়মিত মিল',
    descEn: 'Affordable, clean daily lunch boxes for offices and professionals',
    descBn: 'অফিস ও নিয়মিত গ্রাহকদের সাশ্রয়ী মিল প্যাকেজ'
  },
  'catering-bulk': {
    nameEn: 'Catering & Bulk Feasts',
    nameBn: 'ক্যাটারিং ও বড় আয়োজন',
    descEn: 'Catering for weddings, milads, corporate events, and family parties',
    descBn: 'বিয়ে, মিলাদ, জন্মদিন ও অফিসের বড় অনুষ্ঠান'
  }
};

const ZONE_TRANSLATIONS: Record<string, { nameEn: string; nameBn: string; etaEn: string; etaBn: string }> = {
  'zone-1': { nameEn: 'Araihazar Sadar (Municipality Area)', nameBn: 'আড়াইহাজার সদর (পৌরসভা এলাকা)', etaEn: '30-45 mins', etaBn: '৩০-৪৫ মিনিট' },
  'zone-2': { nameEn: 'Duptara Union', nameBn: 'দুপতারা ইউনিয়ন', etaEn: '40-55 mins', etaBn: '৪০-৫৫ মিনিট' },
  'zone-3': { nameEn: 'Gopaldi Municipality & Bazar', nameBn: 'গোপালদী পৌরসভা ও বাজার', etaEn: '45-60 mins', etaBn: '৪৫-৬০ মিনিট' },
  'zone-4': { nameEn: 'Uchitpur (Meghna Ghat Area)', nameBn: 'উচিতপুর (মেঘনা ঘাট রোড এলাকা)', etaEn: '35-50 mins', etaBn: '৩৫-৫০ মিনিট' },
  'zone-5': { nameEn: 'Brahmandi Union', nameBn: 'ব্রাহ্মন্দী ইউনিয়ন', etaEn: '40-55 mins', etaBn: '৪০-৫৫ মিনিট' },
  'zone-dhaka-city': { nameEn: 'Dhaka City (North & South)', nameBn: 'ঢাকা মহানগর (উত্তর ও দক্ষিণ)', etaEn: '2-4 hours / Express Delivery', etaBn: '২-৪ ঘন্টা / এক্সপ্রেস ডেলিভারি' },
  'zone-dhaka-suburb': { nameEn: 'Dhaka Suburbs (Gazipur, Savar, Narayanganj)', nameBn: 'ঢাকা উপশহর (গাজীপুর, সাভার, নারায়ণগঞ্জ)', etaEn: '24 hours Home Delivery', etaBn: '২৪ ঘন্টা হোম ডেলিভারি' },
  'zone-chattogram': { nameEn: 'Chattogram Division', nameBn: 'চট্টগ্রাম বিভাগ', etaEn: '1-2 business days', etaBn: '১-২ কার্যদিবস' },
  'zone-nationwide': { nameEn: 'All Over Bangladesh', nameBn: 'সারা বাংলাদেশ (সকল জেলা)', etaEn: '1-3 business days', etaBn: '১-৩ কার্যদিবস' }
};

const PAYMENT_METHOD_TRANSLATIONS: Record<string, { nameEn: string; nameBn: string }> = {
  'pm-cod': {
    nameEn: 'Cash on Delivery (COD)',
    nameBn: 'ক্যাশ অন ডেলিভারি (হাতে পেয়ে মূল্য পরিশোধ)'
  },
  'pm-bkash-personal': {
    nameEn: 'bKash (Personal - Send Money)',
    nameBn: 'বিকাশ (ব্যক্তিগত - সেন্ড মানি)'
  },
  'pm-bkash-merchant': {
    nameEn: 'bKash (Merchant - Make Payment)',
    nameBn: 'বিকাশ (মার্চেন্ট - পেমেন্ট)'
  },
  'pm-nagad': {
    nameEn: 'Nagad (Personal - Send Money)',
    nameBn: 'নগদ (ব্যক্তিগত - সেন্ড মানি)'
  },
  'pm-rocket': {
    nameEn: 'Rocket (Personal - Send Money)',
    nameBn: 'রকেট (ব্যক্তিগত - সেন্ড মানি)'
  },
  'pm-upay': {
    nameEn: 'Upay (Personal - Send Money)',
    nameBn: 'উপায় (ব্যক্তিগত - সেন্ড মানি)'
  },
  'pm-bank': {
    nameEn: 'Bank Transfer (Islami Bank Bangladesh Ltd)',
    nameBn: 'ব্যাংক ট্রান্সফার (ইসলামী ব্যাংক বাংলাদেশ লিমিটেড)'
  }
};

const COMMON_VARIANTS_EN: Record<string, string> = {
  'সুগন্ধি জাফরানি পোলাও সাথে': 'With Fragrant Saffron Pulao',
  'মিনিকেট সাদা ভাত সাথে': 'With Steamed Miniket Rice',
  'স্পেশাল খিচুড়ি সাথে': 'With Special Bhuna Khichuri',
  '৪টি গরম ফুলকো লুচি': '4 Hot Fluffy Luchis',
  '৩টি তেলছাড়া হাতে তৈরি পরোটা': '3 Handmade Oil-free Parathas',
  '১ প্লেট বাসমতি ভাত': '1 Plate Steamed Rice',
  'রুই মাছ দোপেঁয়াজা সহ': 'With Rui Fish Dopeyaja',
  'দেশি মুরগির ঝোল সহ': 'With Deshi Chicken Curry',
  'ইলিশ ভাজা পেটি সহ': 'With Fried Hilsa Steak',
  'রেগুলার সিঙ্গাড়া ও চপ প্ল্যাটার': 'Regular Singara & Chop Platter',
  'স্পেশাল ফ্রাইড চিকেন উইংস সহ': 'With Crispy Fried Chicken Wings'
};

const COMMON_ADDONS_EN: Record<string, string> = {
  'বেগুন ভাজা (২ পিস)': 'Fried Eggplant (2 pcs)',
  'স্পেশাল ঘন সোনা মুগ ডাল': 'Thick Golden Moong Dal',
  'ঘরোয়া মিষ্টি দই কাপ': 'Sweet Homemade Yogurt Cup',
  'সিদ্ধ ডিম ভুনা (১ পিস)': 'Boiled Egg Bhuna (1 pc)',
  'ঘরোয়া শাহি বোরহানি (২৫০ মি.লি.)': 'Homemade Shahi Borhani (250ml)',
  'অতিরিক্ত ২ পিস লুচি': 'Extra 2 Luchis',
  'চিংড়ি ভর্তা বা শুঁটকি ভর্তা': 'Shrimp / Dried Fish Bhorta',
  'মিষ্টি পান ও মিষ্টি দই কাপ': 'Sweet Betel Leaf & Yogurt',
  'স্পেশাল খাঁটি দুধ চা (২ কাপ)': 'Special Milk Tea (2 cups)',
  'অতিরিক্ত ২ পিস গরম সিঙ্গাড়া': 'Extra 2 Fresh Singaras'
};

const UI_TRANSLATIONS: Record<string, { bn: string; en: string }> = {
  // Navigation
  home: { bn: 'হোম', en: 'Home' },
  menu: { bn: 'খাবারের তালিকা', en: 'Menu' },
  platters: { bn: 'প্ল্যাটার ও প্যাকেজ', en: 'Platters' },
  catering: { bn: 'ক্যাটারিং ও বড় আয়োজন', en: 'Catering' },
  track: { bn: 'অর্ডার ট্র্যাক', en: 'Track Order' },
  about: { bn: 'আমাদের পরিচিতি', en: 'About Us' },
  faq: { bn: 'সাধারণ জিজ্ঞাসা', en: 'FAQ' },
  deliveryPolicy: { bn: 'ডেলিভারি নীতিমালা', en: 'Delivery Policy' },
  refundPolicy: { bn: 'রিফান্ড ও ক্যান্সেলেশন', en: 'Refund Policy' },
  privacyPolicy: { bn: 'গোপনীয়তা নীতিমালা', en: 'Privacy Policy' },
  termsOfService: { bn: 'শর্তাবলী ও নিয়মাবলী', en: 'Terms of Service' },

  // Header & Controls
  searchFood: { bn: 'খাবার খুঁজুন', en: 'Search Food' },
  bag: { bn: 'ব্যাগ', en: 'Bag' },
  login: { bn: 'লগইন', en: 'Login' },
  register: { bn: 'নিবন্ধন', en: 'Register' },
  myAccount: { bn: 'আমার অ্যাকাউন্ট', en: 'My Account' },
  adminPanel: { bn: 'অ্যাডমিন প্যানেল', en: 'Admin Panel' },
  adminLogin: { bn: 'অ্যাডমিন প্রবেশ', en: 'Admin Login' },
  logout: { bn: 'লগআউট', en: 'Logout' },
  announcementText: {
    bn: 'খাঁটি ঘরোয়া খাবারের নিশ্চয়তা • খাবারের মান ও তাজা স্বাদের জন্য অগ্রিম ৪-৬ ঘন্টা আগে অর্ডার করুন! কল: 01857-220603',
    en: 'Authentic homemade food guaranteed • Please order 4-6 hours in advance for fresh meals! Call: 01857-220603'
  },
  brandName: { bn: 'ঘরের স্বাদ', en: 'Ghorer Shad' },
  brandTagline: { bn: 'সব স্বাদের এক ঠিকানা', en: 'One destination for every authentic taste' },
  brandAddress: {
    bn: 'আড়াইহাজার বাজার রোড, আড়াইহাজার, নারায়ণগঞ্জ / ঢাকা, বাংলাদেশ',
    en: 'Araihazar Bazar Road, Araihazar, Narayanganj / Dhaka, Bangladesh'
  },
  brandHours: {
    bn: 'সকাল ৯:০০ - রাত ৯:০০ (প্রতিদিন)',
    en: '9:00 AM - 9:00 PM (Daily)'
  },

  // Hero Section
  heroBadge: {
    bn: 'ঘরের স্বাদ • সব স্বাদের এক ঠিকানা • আড়াইহাজার, ঢাকা',
    en: 'Ghorer Shad • Authentic Homemade Taste • Araihazar, Dhaka'
  },
  heroHeadlinePrefix: { bn: 'ঘরের রান্নার ভালোবাসা,', en: 'Homemade Love & Fresh Taste,' },
  heroHeadlineHighlight: { bn: 'এবার আপনার দোরগোড়ায়', en: 'Delivered Right to Your Doorstep' },
  heroSubtitle: {
    bn: 'ঘরের স্বাদে বেছে নিন আপনার পছন্দের খাবার। অর্ডার দিন সুবিধামতো, আর আপনার খাবারের সময় আগে থেকেই পরিকল্পনা করুন।',
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
  ratingLabel: { bn: '৪.৯ / ৫.০', en: '4.9 / 5.0' },
  freshTag: { bn: '১০০% তাজা', en: '100% Fresh' },
  homeDeliveryBadge: { bn: 'আড়াইহাজারে হোম ডেলিভারি', en: 'Home Delivery in Araihazar' },

  // Categories & Foods Section
  menuCategoriesTitle: { bn: 'মেনু ক্যাটাগরি', en: 'Menu Categories' },
  pickFavoriteTitle: { bn: 'আপনার পছন্দের পদ বেছে নিন', en: 'Choose Your Favorite Dishes' },
  viewAllFoods: { bn: 'সকল খাবার দেখুন', en: 'View All Dishes' },
  customerFavoritesTag: { bn: 'ঘরের স্বাদের বিশেষ আয়োজন', en: 'Chef Specials & Favorites' },
  popularFoodsTitle: { bn: 'জনপ্রিয় খাবার ও স্পেশাল পদসমূহ', en: 'Popular Foods & Chef Specials' },
  browseFullMenu: { bn: 'পুরো মেনু ব্রাউজ করুন', en: 'Browse Full Menu' },
  popularDishTag: { bn: 'জনপ্রিয় ডিশ', en: 'Popular Dish' },
  specialDishTag: { bn: 'স্পেশাল', en: 'Special' },
  soldOutTag: { bn: 'আজকের স্টক শেষ', en: 'Sold Out Today' },
  detailsBtn: { bn: 'বিস্তারিত', en: 'Details' },
  addToBagBtn: { bn: 'ব্যাগে যোগ করুন', en: 'Add to Bag' },
  minutesShort: { bn: 'মিনিট', en: 'mins' },
  spiceMild: { bn: 'মৃদু ঝাল', en: 'Mild Spice' },
  spiceMedium: { bn: 'মাঝারি ঝাল', en: 'Medium Spice' },
  spiceSpicy: { bn: 'বেশি ঝাল', en: 'Spicy' },
  allSpiceLevels: { bn: 'সকল ঝাল', en: 'All Spice Levels' },
  sortPopularity: { bn: 'জনপ্রিয়তা অনুযায়ী', en: 'Sort: Popularity' },
  sortPriceAsc: { bn: 'দাম: কম থেকে বেশি', en: 'Price: Low to High' },
  sortPriceDesc: { bn: 'দাম: বেশি থেকে কম', en: 'Price: High to Low' },
  sortPrepTime: { bn: 'রান্নার সময় (দ্রুত)', en: 'Cooking Time: Fast' },
  allFoodsTab: { bn: 'সব খাবার', en: 'All Foods' },
  searchPlaceholder: {
    bn: 'খাবারের নাম লিখে খুঁজুন (যেমন: ইলিশ, মুরগি, লুচি)...',
    en: 'Search dishes by name (e.g., Ilish, Chicken, Luchi)...'
  },
  noFoodFoundTitle: { bn: 'কোনো খাবার খুঁজে পাওয়া যায়নি', en: 'No dishes found' },
  noFoodFoundDesc: {
    bn: 'অনুগ্রহ করে অন্য নাম দিয়ে খুঁজুন অথবা ক্যাটাগরি ফিল্টার পরিবর্তন করুন।',
    en: 'Please try searching with another keyword or change your category filter.'
  },
  resetFiltersBtn: { bn: 'ফিল্টার রিসেট করুন', en: 'Reset Filters' },

  // Platters Section
  familySpecialTag: { bn: 'ফ্যামিলি স্পেশাল', en: 'Family Special' },
  plattersTitle: { bn: 'উইকেন্ড ও পারিবারিক আড্ডায় স্পেশাল ফুড প্ল্যাটার', en: 'Special Food Platters for Family Gatherings' },
  plattersDesc: {
    bn: 'পারিবারিক ভোজ ও মেহমানদারির জন্য প্রস্তুত ৪-১০ জনের পেটভরা কম্বো প্যাকেজ। পোলাও, রোস্ট, ইলিশ মাছ ভাজা, বোরহানি ও শাহি মিষ্টির পরিপূর্ণ আয়োজন।',
    en: 'Wholesome 4-10 person combo packages crafted for family dining. Fragrant pulao, roast chicken, crispy fish, borhani, and sweet treats.'
  },
  viewAllPlatters: { bn: 'সব প্ল্যাটার দেখুন', en: 'View All Platters' },

  // Delivery Areas
  deliveryAreasTag: { bn: 'ডেলিভারি আওতাভুক্ত এলাকা', en: 'Delivery Coverage Areas' },
  deliveryAreasTitle: { bn: 'আড়াইহাজার উপজেলার প্রধান এলাকাগুলোতে নিরাপদ হোম ডেলিভারি', en: 'Safe Home Delivery Across Araihazar Upazila' },
  deliveryAreasDesc: {
    bn: 'আমরা সরাসরি আমাদের নিজস্ব রাইডারদের মাধ্যমে গরম ও পরিচ্ছন্নভাবে খাবার পৌঁছে দিই। আপনার অর্ডার নিশ্চিত হওয়ার সাথে সাথেই খাবার রান্নার সময়সূচী নির্ধারিত হয়।',
    en: 'We deliver hot and hygienic meals through our dedicated riders. Preparation begins promptly upon order confirmation.'
  },
  area1: { bn: 'আড়াইহাজার সদর ও পৌরসভা', en: 'Araihazar Sadar & Pourashava' },
  area2: { bn: 'দুপতারা ইউনিয়ন', en: 'Duptara Union' },
  area3: { bn: 'গোপালদী পৌরসভা ও বাজার', en: 'Gopaldi Pourashava & Bazar' },
  area4: { bn: 'উচিতপুর (মেঘনা ঘাট রোড)', en: 'Uchitpur (Meghna Ghat Road)' },
  area5: { bn: 'ব্রাহ্মন্দী ও মাহমুদপুর', en: 'Brahmandi & Mahmudpur' },
  area6: { bn: 'সাতগ্রাম ও বিশনন্দী', en: 'Satgram & Bishnandi' },

  whyUnique: { bn: 'কেন "ঘরের স্বাদ" সবার চেয়ে আলাদা?', en: 'Why Choose Ghorer Shad?' },
  uniqueP1Title: { bn: '১০০% খাঁটি ঘরোয়া মশলা ও তেল', en: '100% Pure Spices & Mustard Oil' },
  uniqueP1Desc: {
    bn: 'কোনো কৃত্রিম ফ্লেভার, টেস্টিং সল্ট বা ক্ষতিকর রং ব্যবহার করা হয় না।',
    en: 'No artificial flavors, tasting salt, or harmful chemical coloring are used.'
  },
  uniqueP2Title: { bn: 'অর্ডারের পর তাজা রান্না', en: 'Cooked Fresh After Every Order' },
  uniqueP2Desc: {
    bn: 'আমরা কোনো রান্না করা খাবার জমিয়ে রাখি না, অর্ডারের পর সরাসরি রান্না শুরু হয়।',
    en: 'We never preserve cooked food; preparation starts immediately upon order confirmation.'
  },
  uniqueP3Title: { bn: 'পরিচ্ছন্ন ফুড-গ্রেড প্যাকেজিং', en: 'Hygienic Food-Grade Packaging' },
  uniqueP3Desc: {
    bn: 'খাবার গরম ও তাজা রাখতে প্রিমিয়াম সিলড বক্স ও ফয়েল পেপার ব্যবহার করা হয়।',
    en: 'Premium sealed food-grade containers and foil wrapping to keep food hot and fresh.'
  },
  proprietor: { bn: 'পরিচালনায়', en: 'Proprietor' },
  whatsappChat: { bn: 'হোয়াটসঅ্যাপে যোগাযোগ করুন', en: 'Chat on WhatsApp' },
  callNow: { bn: 'কল করুন', en: 'Call Now' },

  // Cart Drawer
  cartTitle: { bn: 'আপনার শপিং ব্যাগ', en: 'Your Shopping Bag' },
  itemsCount: { bn: 'আইটেম', en: 'items' },
  clearAll: { bn: 'সব মুছুন', en: 'Clear All' },
  closeBtn: { bn: 'বন্ধ করুন', en: 'Close' },
  cartFreshNotice: {
    bn: 'খাবার সম্পূর্ণ তাজা প্রস্তুত করা হয়। অর্ডার কমপক্ষে ৪-৬ ঘন্টা পূর্বে পৌঁছানো জরুরি।',
    en: 'All meals are prepared completely fresh. Please order at least 4-6 hours in advance.'
  },
  emptyCartTitle: { bn: 'আপনার ব্যাগ এখনো খালি', en: 'Your bag is empty' },
  emptyCartDesc: {
    bn: 'আমাদের সুস্বাদু ঘরোয়া খাবার মেনু থেকে আপনার পছন্দের পদ বেছে নিন।',
    en: 'Pick your favorite authentic dishes from our fresh homemade menu.'
  },
  viewMenuAction: { bn: 'মেনু দেখুন', en: 'View Menu' },
  variantLabel: { bn: 'ভ্যারিয়েন্ট:', en: 'Variant:' },
  addonsLabel: { bn: 'যুক্ত:', en: 'Add-ons:' },
  instructionsLabel: { bn: 'নির্দেশনা:', en: 'Notes:' },
  deliveryAreaSelectLabel: { bn: 'ডেলিভারি এলাকা নির্বাচন করুন:', en: 'Select Delivery Area:' },
  couponPlaceholder: { bn: 'কুপন কোড লিখুন', en: 'Enter Coupon Code' },
  couponApplyBtn: { bn: 'প্রয়োগ করুন', en: 'Apply' },
  couponCancelBtn: { bn: 'বাতিল', en: 'Cancel' },
  subtotalLabel: { bn: 'খাবারের মোট:', en: 'Subtotal:' },
  discountLabel: { bn: 'কুপন ডিসকাউন্ট:', en: 'Coupon Discount:' },
  deliveryChargeLabel: { bn: 'ডেলিভারি চার্জ:', en: 'Delivery Fee:' },
  freeDeliveryLabel: { bn: 'ফ্রি ডেলিভারি', en: 'Free Delivery' },
  totalPayableLabel: { bn: 'সর্বমোট প্রদেয়:', en: 'Total Payable:' },
  checkoutBtn: { bn: 'চেকআউট ও ঠিকানা দিন', en: 'Proceed to Checkout' },
  loginToOrderBtn: { bn: 'লগইন করে অর্ডার করুন', en: 'Login to Place Order' },

  // Food Detail Modal
  cookingTimeLabel: { bn: 'রান্নার সময়:', en: 'Cooking Time:' },
  portionLabel: { bn: 'পরিমাণ:', en: 'Portion:' },
  spiceLevelLabel: { bn: 'ঝালের মাত্রা:', en: 'Spice Level:' },
  ingredientsTitle: { bn: 'ব্যবহৃত খাঁটি উপাদানসমূহ:', en: 'Pure Ingredients Used:' },
  selectVariantTitle: { bn: 'পছন্দের ভ্যারিয়েন্ট বেছে নিন:', en: 'Select Variant:' },
  selectAddonsTitle: { bn: 'অতিরিক্ত পদ যোগ করুন (ঐচ্ছিক):', en: 'Add-on Extras (Optional):' },
  specialNotesPlaceholder: {
    bn: 'রান্নার বিশেষ নির্দেশ (যেমন: ঝাল কম দিন, তেল কম দিন)...',
    en: 'Cooking instructions (e.g., less oil, milder spice)...'
  },
  whatsappInquiryBtn: {
    bn: 'হোয়াটসঅ্যাপে অর্ডার / পরামর্শ',
    en: 'Order / Inquire via WhatsApp'
  },
  reviewsHeading: { bn: 'গ্রাহকদের রিভিউ ও রেটিং', en: 'Customer Reviews & Ratings' },
  writeReviewBtn: { bn: 'রিভিউ লিখুন', en: 'Write a Review' },
  reviewPlaceholder: {
    bn: 'খাবারের স্বাদ, মান ও ডেলিভারি নিয়ে আপনার মন্তব্য লিখুন...',
    en: 'Share your thoughts on food taste, quality and delivery...'
  },
  submitReviewBtn: { bn: 'রিভিউ প্রকাশ করুন', en: 'Submit Review' },
  verifiedPurchase: { bn: 'যাচাইকৃত ক্রেতা', en: 'Verified Purchase' },
  noReviewsYet: { bn: 'এখনো কোনো রিভিউ নেই। আপনিই প্রথম রিভিউ দিন!', en: 'No reviews yet. Be the first to review!' },

  // Checkout Page
  checkoutBackBtn: { bn: 'মেনুতে ফিরে যান', en: 'Back to Menu' },
  secureCheckoutTitle: { bn: 'নিরাপদ চেকআউট • ঘরের স্বাদ', en: 'Secure Checkout • Ghorer Shad' },
  customerInfoHeading: { bn: '১. গ্রাহকের তথ্য', en: '1. Customer Details' },
  fullNameLabel: { bn: 'আপনার পুরো নাম *', en: 'Full Name *' },
  fullNamePlaceholder: { bn: 'আপনার নাম লিখুন', en: 'Enter your full name' },
  phoneLabel: { bn: 'মোবাইল নম্বর (১১ ডিজিট) *', en: 'Phone Number (11 digits) *' },
  emailLabel: { bn: 'ইমেইল ঠিকানা (ঐচ্ছিক)', en: 'Email Address (Optional)' },
  deliveryAddressHeading: { bn: '২. ডেলিভারির পূর্ণ ঠিকানা', en: '2. Delivery Address' },
  divisionLabel: { bn: 'বিভাগ *', en: 'Division *' },
  districtLabel: { bn: 'জেলা / অঞ্চল *', en: 'District / Area *' },
  fullAddressLabel: { bn: 'বিস্তারিত ঠিকানা (বাড়ি, ফ্ল্যাট, রোড, এলাকা) *', en: 'Detailed Address (House, Flat, Road, Area) *' },
  landmarkLabel: { bn: 'পরিচিত ল্যান্ডমার্ক (ঐচ্ছিক)', en: 'Nearby Landmark (Optional)' },
  deliveryScheduleHeading: { bn: '৩. ডেলিভারি তারিখ ও সময়', en: '3. Delivery Date & Time' },
  deliveryDateLabel: { bn: 'ডেলিভারির তারিখ *', en: 'Delivery Date *' },
  timeSlotLabel: { bn: 'পছন্দের সময় স্লট *', en: 'Preferred Time Slot *' },
  urgentCheckbox: {
    bn: 'জরুরি ডেলিভারি প্রয়োজন (২-৩ ঘন্টা পূর্বে সরাসরি রন্ধন)',
    en: 'Urgent delivery requested (prepare within 2-3 hours)'
  },
  orderNotesPlaceholder: {
    bn: 'রান্না বা ডেলিভারির বিশেষ নোট (ঐচ্ছিক)...',
    en: 'Special notes for cooking or delivery (optional)...'
  },
  paymentMethodHeading: { bn: '৪. পেমেন্ট পদ্ধতি নির্বাচন করুন', en: '4. Select Payment Method' },
  trxIdLabel: { bn: 'ট্রানজেকশন আইডি (TrxID) *', en: 'Transaction ID (TrxID) *' },
  trxIdPlaceholder: { bn: 'পেমেন্ট সম্পন্ন করে প্রাপ্ত TrxID দিন', en: 'Enter payment TrxID received from SMS' },
  copiedText: { bn: 'কপি হয়েছে!', en: 'Copied!' },
  copyNumberBtn: { bn: 'নম্বর কপি করুন', en: 'Copy Number' },
  orderSummaryHeading: { bn: 'অর্ডার সারাংশ', en: 'Order Summary' },
  confirmOrderBtn: { bn: 'অর্ডার নিশ্চিত করুন', en: 'Confirm Order' },
  processingBtn: { bn: 'অর্ডার প্রক্রিয়াধীন...', en: 'Processing Order...' },

  // Order Confirmation & Tracking
  orderConfirmedBadge: { bn: 'অর্ডার সফলভাবে নিশ্চিত হয়েছে', en: 'Order Confirmed Successfully' },
  orderConfirmedTitle: { bn: 'আপনার অর্ডারটি সফলভাবে গৃহীত হয়েছে!', en: 'Your Order Has Been Placed Successfully!' },
  orderThankYou: {
    bn: 'ধন্যবাদ! আমাদের কিচেন টিম খুব শীঘ্রই খাবার প্রস্তুতি শুরু করবে।',
    en: 'Thank you! Our kitchen team will begin preparing your fresh meal promptly.'
  },
  yourOrderNumber: { bn: 'আপনার অর্ডার নম্বর:', en: 'Your Order Number:' },
  trackOrderBtn: { bn: 'অর্ডারের বর্তমান অবস্থা ট্র্যাক করুন', en: 'Track Your Order Live' },
  backToHomeBtn: { bn: 'হোমে ফিরে যান', en: 'Back to Home' },
  notifyWhatsAppBtn: { bn: 'হোয়াটসঅ্যাপে অর্ডার নিশ্চিতকরণ পাঠান', en: 'Notify on WhatsApp' },
  orderTimelineTitle: { bn: 'অর্ডার ট্র্যাকিং টাইমলাইন', en: 'Order Tracking Timeline' },
  orderSearchPlaceholder: { bn: 'অর্ডার নম্বর লিখুন (যেমন: GS-101)...', en: 'Enter Order Number (e.g. GS-101)...' },
  trackNowBtn: { bn: 'ট্র্যাক করুন', en: 'Track Now' },

  // Tracking Steps
  stepPlaced: { bn: 'অর্ডার গৃহীত', en: 'Order Placed' },
  stepAccepted: { bn: 'নিশ্চিত করা হয়েছে', en: 'Order Confirmed' },
  stepPreparing: { bn: 'রান্না হচ্ছে', en: 'Cooking in Progress' },
  stepReady: { bn: 'প্যাকেজিং প্রস্তুত', en: 'Packed & Ready' },
  stepDispatched: { bn: 'ডেলিভারির পথে', en: 'Out for Delivery' },
  stepDelivered: { bn: 'ডেলিভারি সম্পন্ন', en: 'Delivered' },
  stepCancelled: { bn: 'অর্ডার বাতিল', en: 'Cancelled' },
  stepRejected: { bn: 'অর্ডার প্রত্যাখ্যাত', en: 'Rejected' },

  // Catering Page
  cateringHeroTitle: { bn: 'পারিবারিক ও কর্পোরেট ক্যাটারিং সার্ভিস', en: 'Family & Corporate Catering Services' },
  cateringHeroSubtitle: {
    bn: '১৫ জন থেকে ৫০০+ জনের যেকোনো মেহমানদারি, মিলাদ, বিয়ে বা অফিসের জমকালো আয়োজনে খাঁটি ঘরোয়া স্বাদের বাংলা খাবার।',
    en: 'Authentic homemade Bengali catering for 15 to 500+ guests for weddings, milad, parties, and office banquets.'
  },
  cateringFormTitle: { bn: 'ক্যাটারিং বুকিং ও উদ্ধৃতি ফর্ম', en: 'Catering Booking & Quote Request' },
  eventTypeLabel: { bn: 'অনুষ্ঠানের ধরন *', en: 'Event Type *' },
  guestCountLabel: { bn: 'অতিথির সংখ্যা (জন) *', en: 'Estimated Guest Count *' },
  eventDateLabel: { bn: 'অনুষ্ঠানের তারিখ *', en: 'Event Date *' },
  eventTimeLabel: { bn: 'খাবার পরিবেশনের সময় *', en: 'Serving Time *' },
  eventLocationLabel: { bn: 'অনুষ্ঠানের স্থান ও পূর্ণ ঠিকানা *', en: 'Event Venue & Address *' },
  foodPreferencesLabel: { bn: 'মেনু পছন্দ বা খাবারের বিশেষ পদ *', en: 'Menu Preferences & Dishes *' },
  approxBudgetLabel: { bn: 'সম্ভাব্য বাজেট (টাকা, ঐচ্ছিক)', en: 'Approximate Budget (BDT, Optional)' },
  submitCateringBtn: { bn: 'ক্যাটারিং অনুরোধ পাঠান', en: 'Submit Catering Request' },
  cateringSuccessTitle: { bn: 'ক্যাটারিং অনুরোধ সফলভাবে জমা হয়েছে!', en: 'Catering Request Submitted Successfully!' },

  // Policy Pages
  aboutUsTitle: { bn: 'আমাদের পরিচিতি', en: 'About Us' },
  deliveryPolicyTitle: { bn: 'ডেলিভারি নীতিমালা', en: 'Delivery Policy' },
  refundPolicyTitle: { bn: 'রিফান্ড ও ক্যান্সেলেশন নীতিমালা', en: 'Refund & Cancellation Policy' },
  faqTitle: { bn: 'সাধারণ জিজ্ঞাসা ও উত্তর', en: 'Frequently Asked Questions' },

  // Customer Account
  accountDetailsTab: { bn: 'অ্যাকাউন্ট তথ্য', en: 'Account Information' },
  orderHistoryTab: { bn: 'আমার পূর্ববর্তী অর্ডার', en: 'Order History' },
  noOrdersYet: { bn: 'এখনো কোনো অর্ডার করেননি', en: 'No orders placed yet' },
  noOrdersDesc: {
    bn: 'মেনু থেকে সুস্বাদু খাবার পছন্দ করে অর্ডার করুন।',
    en: 'Browse our menu to order fresh, delicious homemade dishes.'
  },

  // AI Support Widget
  aiChatTitle: { bn: 'ঘরের স্বাদ এআই সহকারী', en: 'Ghorer Shad AI Assistant' },
  aiChatSubtitle: { bn: 'খাবার, মেনু ও অর্ডারের তথ্যে সার্বক্ষণিক সহায়তা', en: 'Always here to assist with food, menu & orders' },
  aiChatPlaceholder: { bn: 'বাংলা বা ইংরেজিতে প্রশ্ন লিখুন...', en: 'Ask a question in English or Bangla...' },
  aiSendBtn: { bn: 'পাঠান', en: 'Send' },
  aiMenuSuggestion: { bn: 'আজকের মেনু দেখুন', en: 'View Today Menu' },
  aiRulesSuggestion: { bn: 'অর্ডারের নিয়মাবলী', en: 'Ordering Rules' },
  aiCateringSuggestion: { bn: 'ক্যাটারিং তথ্য', en: 'Catering Services' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gs_lang');
      if (saved === 'en' || saved === 'bn') return saved;
    }
    return 'bn';
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

  // Synchronize document lang & document title
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      if (language === 'en') {
        document.title = 'Ghorer Shad — Authentic Homemade Food & Catering | Araihazar, Dhaka';
      } else {
        document.title = 'ঘরের স্বাদ — সব স্বাদের এক ঠিকানা | খাঁটি ঘরোয়া খাবার ও ক্যাটারিং';
      }
    }
  }, [language]);

  const t = (key: string, bnFallback?: string, enFallback?: string): string => {
    const entry = UI_TRANSLATIONS[key];
    if (entry) {
      return language === 'en' ? entry.en : entry.bn;
    }
    if (language === 'en' && enFallback) return enFallback;
    if (bnFallback) return bnFallback;
    return key;
  };

  // Format currency: English uses "Tk 450", Bangla uses "৳৪৫০"
  const formatPrice = (amount?: number | null): string => {
    if (amount === undefined || amount === null) return language === 'en' ? 'Tk 0' : '৳০';
    if (language === 'en') {
      return `Tk ${amount}`;
    }
    // Bangla digits conversion
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    const bnStr = String(amount).replace(/[0-9]/g, d => bnDigits[Number(d)]);
    return `৳${bnStr}`;
  };

  // Format date cleanly in English or Bangla
  const formatDate = (dateInput?: string | number | Date | null): string => {
    if (!dateInput) return '';
    try {
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return String(dateInput);
      if (language === 'en') {
        return d.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
      return d.toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return String(dateInput);
    }
  };

  // Pure linguistic helpers for Food Items
  const getFoodTitle = (food: FoodItem): string => {
    const registry = FOOD_TRANSLATIONS[food.id];
    if (language === 'en') {
      if (registry?.nameEn) return registry.nameEn;
      if (food.nameEn && food.nameEn.trim() && !/[\u0980-\u09FF]/.test(food.nameEn)) {
        return food.nameEn.trim();
      }
      if (food.sku?.includes('FISH') || food.id.includes('fish')) return 'Fresh Fish Delicacy';
      if (food.sku?.includes('MEAT') || food.id.includes('meat')) return 'Spicy Meat Curry';
      return 'Authentic Homemade Dish';
    }

    // Bangla mode: ensure no English residues
    if (registry?.nameBn) return registry.nameBn;
    if (food.nameBn) {
      // Strip English in parens or trailing English words
      const cleaned = food.nameBn.replace(/\([A-Za-z\s-]+\)/g, '').replace(/[A-Za-z]/g, '').trim();
      if (cleaned) return cleaned;
    }
    return food.nameBn || 'ঘরের তৈরি সুস্বাদু খাবার';
  };

  const getFoodShortDesc = (food: FoodItem): string => {
    const registry = FOOD_TRANSLATIONS[food.id];
    if (language === 'en') {
      if (registry?.shortDescEn) return registry.shortDescEn;
      return 'Freshly cooked authentic Bengali homemade dish prepared to order.';
    }
    return registry?.shortDescBn || food.shortDescBn;
  };

  const getFoodFullDesc = (food: FoodItem): string => {
    const registry = FOOD_TRANSLATIONS[food.id];
    if (language === 'en') {
      if (registry?.fullDescEn) return registry.fullDescEn;
      return 'Prepared fresh with pure spices and mustard oil after your order. Authentic homemade quality and taste.';
    }
    return registry?.fullDescBn || food.fullDescBn;
  };

  const getFoodPortion = (food: FoodItem): string => {
    const registry = FOOD_TRANSLATIONS[food.id];
    if (language === 'en') {
      if (registry?.portionEn) return registry.portionEn;
      if (food.portionEn && !/[\u0980-\u09FF]/.test(food.portionEn)) return food.portionEn;
      return '1 Person Full Meal';
    }
    return registry?.portionBn || food.portionBn;
  };

  const getFoodCategory = (food: FoodItem): string => {
    const registry = FOOD_TRANSLATIONS[food.id];
    if (language === 'en') {
      if (registry?.categoryNameEn) return registry.categoryNameEn;
      const cat = CATEGORY_TRANSLATIONS[food.categoryId];
      if (cat?.nameEn) return cat.nameEn;
      return 'Bengali Cuisine';
    }
    const cat = CATEGORY_TRANSLATIONS[food.categoryId];
    return cat?.nameBn || food.categoryNameBn;
  };

  // Variants & Addons helpers
  const getVariantTitle = (variant: FoodVariant): string => {
    if (language === 'en') {
      if (variant.nameEn && !/[\u0980-\u09FF]/.test(variant.nameEn)) return variant.nameEn;
      if (COMMON_VARIANTS_EN[variant.nameBn]) return COMMON_VARIANTS_EN[variant.nameBn];
      return variant.nameEn || 'Standard Option';
    }
    // Bangla: strip English in parens
    return String(variant?.nameBn || variant?.nameEn || 'বিকল্প').replace(/\([A-Za-z\s-]+\)/g, '').trim();
  };

  const getAddonTitle = (addon: FoodAddon): string => {
    if (!addon) return '';
    if (language === 'en') {
      if (addon.nameEn && !/[\u0980-\u09FF]/.test(addon.nameEn)) return addon.nameEn;
      if (addon.nameBn && COMMON_ADDONS_EN[addon.nameBn]) return COMMON_ADDONS_EN[addon.nameBn];
      return addon.nameEn || 'Side Dish';
    }
    // Bangla: strip English in parens
    return String(addon?.nameBn || addon?.nameEn || 'এড-অন').replace(/\([A-Za-z\s-]+\)/g, '').trim();
  };

  // Category helpers
  const getCategoryTitle = (cat: Category): string => {
    const registry = CATEGORY_TRANSLATIONS[cat.id];
    if (language === 'en') {
      if (registry?.nameEn) return registry.nameEn;
      if (cat.nameEn && !/[\u0980-\u09FF]/.test(cat.nameEn)) return cat.nameEn;
      return 'Cuisine Category';
    }
    return registry?.nameBn || cat.nameBn;
  };

  const getCategoryDescription = (cat: Category): string => {
    const registry = CATEGORY_TRANSLATIONS[cat.id];
    if (language === 'en') {
      if (registry?.descEn) return registry.descEn;
      return 'Fresh authentic homemade delicacies prepared after order';
    }
    return registry?.descBn || cat.descriptionBn;
  };

  // Zone helpers
  const getZoneTitle = (zone?: DeliveryZone | null): string => {
    if (!zone) return language === 'en' ? 'Araihazar Sadar' : 'আড়াইহাজার সদর';
    const reg = ZONE_TRANSLATIONS[zone.id];
    if (language === 'en') {
      return reg?.nameEn || zone.nameEn || 'Araihazar Local Area';
    }
    return reg?.nameBn || zone.nameBn;
  };

  const getZoneETA = (zone?: DeliveryZone | null): string => {
    if (!zone) return language === 'en' ? '30-45 mins' : '৩০-৪৫ মিনিট';
    const reg = ZONE_TRANSLATIONS[zone.id];
    if (language === 'en') {
      return reg?.etaEn || '30-45 mins';
    }
    return reg?.etaBn || zone.estimatedDeliveryMinutes || '৩০-৪৫ মিনিট';
  };

  // Payment Method helpers
  const getPaymentMethodTitle = (pm: { id?: string; type?: string; nameBn?: string; nameEn?: string }): string => {
    const key = pm.id || `pm-${pm.type}`;
    const custom = PAYMENT_METHOD_TRANSLATIONS[key];
    if (language === 'en') {
      if (custom) return custom.nameEn;
      if (pm.nameEn) return pm.nameEn;
      return pm.type === 'cod' ? 'Cash on Delivery (COD)' : 'Online Payment';
    }
    if (custom) return custom.nameBn;
    // Strip English from Bengali name if present
    return (pm.nameBn || '').replace(/\([A-Za-z\s-]+\)/g, '').trim() || 'পেমেন্ট মাধ্যম';
  };

  const getPaymentInstructions = (pm: PaymentMethodConfig): string => {
    if (language === 'en') {
      if (pm.type === 'cod') return 'Pay with cash directly to the delivery rider upon receiving your package.';
      if (pm.instructionsEn) return pm.instructionsEn;
      return 'Make payment to our official account and enter the transaction ID below.';
    }
    if (pm.type === 'cod') return 'খাবার বা পার্সেল হাতে পেয়ে রাইডারকে ক্যাশ টাকা পরিশোধ করুন।';
    return pm.instructionsBn || 'নির্দিষ্ট নম্বরে মূল্য পরিশোধ করে ট্রানজেকশন আইডি প্রদান করুন।';
  };

  const getSpiceLevelText = (level?: string): string => {
    if (!level) return '';
    if (language === 'en') {
      return level === 'Mild' ? 'Mild' : level === 'Medium' ? 'Medium' : 'Spicy';
    }
    return level === 'Mild' ? 'মৃদু ঝাল' : level === 'Medium' ? 'মাঝারি ঝাল' : 'বেশি ঝাল';
  };

  const getOrderStatusText = (status: OrderStatus): string => {
    if (language === 'en') {
      switch (status) {
        case 'placed': return 'Order Placed';
        case 'accepted': return 'Order Confirmed';
        case 'preparing': return 'Cooking in Progress';
        case 'ready': return 'Packed & Ready';
        case 'out_for_delivery': return 'Out for Delivery';
        case 'delivered': return 'Delivered';
        case 'cancelled': return 'Cancelled';
        case 'rejected': return 'Rejected';
        default: return 'Processing';
      }
    }
    switch (status) {
      case 'placed': return 'গৃহীত হয়েছে';
      case 'accepted': return 'নিশ্চিত করা হয়েছে';
      case 'preparing': return 'রান্না হচ্ছে';
      case 'ready': return 'প্যাকেজিং প্রস্তুত';
      case 'out_for_delivery': return 'ডেলিভারিতে রয়েছে';
      case 'delivered': return 'ডেলিভারি সম্পন্ন';
      case 'cancelled': return 'বাতিল';
      case 'rejected': return 'প্রত্যাখ্যাত';
      default: return 'প্রক্রিয়াধীন';
    }
  };

  const getOrderStatusDesc = (status: OrderStatus): string => {
    if (language === 'en') {
      switch (status) {
        case 'placed': return 'Order has been received in the system';
        case 'accepted': return 'Kitchen team verified your order';
        case 'preparing': return 'Freshly cooking with authentic pure spices';
        case 'ready': return 'Hygienically packed in delivery containers';
        case 'out_for_delivery': return 'Rider has departed towards your address';
        case 'delivered': return 'Delivered successfully to recipient';
        case 'cancelled': return 'This order was cancelled';
        case 'rejected': return 'This order was rejected';
        default: return '';
      }
    }
    switch (status) {
      case 'placed': return 'অর্ডার সিস্টেমে গৃহীত হয়েছে';
      case 'accepted': return 'কিচেন টিম নিশ্চিত করেছে';
      case 'preparing': return 'খাঁটি ঘরোয়া মশলায় তাজা রান্না চলছে';
      case 'ready': return 'ডেলিভারি ব্যাগে পরিচ্ছন্নভাবে প্যাক করা হয়েছে';
      case 'out_for_delivery': return 'রাইডার আপনার ঠিকানার দিকে রওনা দিয়েছেন';
      case 'delivered': return 'গ্রাহকের নিকট সফলভাবে পৌঁছেছে';
      case 'cancelled': return 'অর্ডারটি বাতিল করা হয়েছে';
      case 'rejected': return 'অর্ডারটি প্রত্যাখ্যাত হয়েছে';
      default: return '';
    }
  };

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      toggleLanguage,
      t,
      formatPrice,
      formatDate,
      getFoodTitle,
      getFoodShortDesc,
      getFoodFullDesc,
      getFoodPortion,
      getFoodCategory,
      getVariantTitle,
      getAddonTitle,
      getCategoryTitle,
      getCategoryDescription,
      getZoneTitle,
      getZoneETA,
      getPaymentMethodTitle,
      getPaymentInstructions,
      getSpiceLevelText,
      getOrderStatusText,
      getOrderStatusDesc
    }}>
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
