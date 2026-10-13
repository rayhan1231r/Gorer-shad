import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { cloudSyncService } from './firestoreSync.ts';
import type {
  BusinessConfig,
  Category,
  FoodItem,
  DeliveryZone,
  Coupon,
  Order,
  CateringInquiry,
  CustomerRecord,
  FinancialSummary,
  OrderStatus,
  AppUser,
  SmtpConfig,
  CustomerReview,
  HomepageContent,
  PaymentMethodConfig,
  LeaderboardUser
} from '../src/types/index.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'ghorer_shad_db.json');

export interface DatabaseSchema {
  config: BusinessConfig;
  homepageContent: HomepageContent;
  smtpConfig: SmtpConfig;
  categories: Category[];
  foods: FoodItem[];
  deliveryZones: DeliveryZone[];
  paymentMethods: PaymentMethodConfig[];
  coupons: Coupon[];
  orders: Order[];
  cateringInquiries: CateringInquiry[];
  customers: Record<string, CustomerRecord>;
  users: Record<string, AppUser & { passwordHash?: string }>;
  reviews: CustomerReview[];
  expenses: { id: string; date: string; title: string; category: string; amount: number }[];
  auditLogs: { id: string; timestamp: string; action: string; details: string; user: string }[];
  ownerEmail?: string;
  geminiApiKey?: string;
  sessions?: Record<string, { userId: string; role: 'owner' | 'admin' | 'subadmin' | 'staff' | 'customer'; email: string; expiresAt: number }>;
  broadcastHistory?: { id: string; timestamp: string; subject: string; headline: string; targetAudience: string; sentCount: number; isTest?: boolean; user?: string }[];
}

const DEFAULT_CONFIG: BusinessConfig = {
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
  announcementBarBn: "খাঁটি ঘরোয়া খাবারের নিশ্চয়তা • খাবারের মান ও টাটকা স্বাদের জন্য অগ্রিম ৪-৬ ঘন্টা আগে অর্ডার করুন! কল/হোয়াটসঅ্যাপ: 01857-220603",
  isAnnouncementActive: true,
  standardAdvanceHours: 4,
  urgentAdvanceHours: 2,
  advanceNoticeMessageBn: "আমরা কোনো খাবার ফ্রিজে রেখে বা বাসি খাবার সরবরাহ করি না। প্রতিটি খাবার আপনার অর্ডারের পর তাজা ও সম্পূর্ণ স্বাস্থ্যসম্মত উপায়ে ঘরোয়া পরিবেশে তৈরি করা হয়। তাই কমপক্ষে ৪-৬ ঘন্টা পূর্বে অগ্রিম অর্ডার দেওয়ার জন্য বিনীত অনুরোধ করা হচ্ছে। জরুরি প্রয়োজনে (২-৩ ঘন্টা আগে) সরাসরি ফোনে যোগাযোগ করুন।",
  openingHoursBn: "সকাল ৯:০০ - রাত ৯:০০ (প্রতিদিন)",
  currency: "BDT",
  currencySymbol: "৳",
  bkashNumber: "01912-838891 (Personal)",
  nagadNumber: "01857-220603 (Personal)",
  rocketNumber: "01857-220603-9",
  bankDetails: "Islami Bank Bangladesh Ltd, Araihazar Branch, A/C: 205012345678",
  orderNotificationEmails: [process.env.ADMIN_EMAIL || "rmartbdltd@gmail.com"],
  logoUrl: "/logo.jpg",
  facebookUrl: "https://facebook.com/ghorershad.arai",
  youtubeUrl: "https://youtube.com/@ghorershad",
  tiktokUrl: "https://tiktok.com/@ghorershad",
  instagramUrl: "https://instagram.com/ghorershad"
};

const DEFAULT_HOMEPAGE_CONTENT: HomepageContent = {
  heroHeadlineBn: "ঘরের রান্নার ভালোবাসা, এবার আপনার দোরগোড়ায়",
  heroHeadlineEn: "Homemade love and authentic tastes, delivered right to your doorstep",
  heroSubtitleBn: "ঘরের স্বাদে বেছে নিন আপনার পছন্দের খাবার। অর্ডার দিন সুবিধামতো, আর আপনার খাবারের সময় আগে থেকেই পরিকল্পনা করুন।",
  heroSubtitleEn: "Choose your favorite homemade Bengali delicacies at Ghorer Shad. Order comfortably and plan your meal timing in advance.",
  ctaMenuBtnBn: "মেনু দেখুন",
  ctaCateringBtnBn: "ক্যাটারিং সম্পর্কে জানুন",
  bannerImage: "/src/assets/images/hero_ghorer_shad_feast_1791709454258.jpg",
  bannerIntervalSeconds: 3,
  heroBanners: [
    {
      id: "feast",
      image: "/src/assets/images/hero_ghorer_shad_feast_1791709454258.jpg",
      tagBn: "খাঁটি বাঙালি ভোজ ও ঐতিহ্য",
      tagEn: "Authentic Bengali Feast",
      titleBn: "ঘরের স্বাদ স্পেশাল রাজকীয় বাংলা ভোজ",
      titleEn: "Royal Bengali Homemade Feast",
      descBn: "আড়াইহাজারের খাঁটি রান্না, তাজা মসলা ও ঘরোয়া ভালোবাসা",
      descEn: "Fresh home cooking in Araihazar with pure spices",
      isActive: true,
      sortOrder: 1
    },
    {
      id: "ilish",
      image: "/src/assets/images/food_ilish_bhapa_fish_1791709467165.jpg",
      tagBn: "পদ্মার তাজা মাছের সমাহার",
      tagEn: "Fresh River Hilsa Special",
      titleBn: "তাজা সর্ষে ইলিশ ও ইলিশ পোলাও উৎসব",
      titleEn: "Fresh Shorshe Ilish & Pulao Delicacies",
      descBn: "অর্ডার করার পর পদ্মা নদীর সেরা স্বাদের ইলিশ মাছের রান্না",
      descEn: "Cooked fresh after order with supreme authentic aroma",
      isActive: true,
      sortOrder: 2
    },
    {
      id: "meat",
      image: "/src/assets/images/food_bengali_meat_curry_1791709480684.jpg",
      tagBn: "দেশি মাংসের স্পেশাল কষা",
      tagEn: "Desi Meat Curry & Kacchi",
      titleBn: "দেশি খাসি ও গরুর মাংসের ঐতিহ্যবাহী ঝোল",
      titleEn: "Desi Mutton & Beef Traditional Curry",
      descBn: "খাঁটি সরিষার তেলে কষানো মাংস ও স্পেশাল ভুনা খিচুড়ি",
      descEn: "Slow-cooked with pure mustard oil & aromatic spices",
      isActive: true,
      sortOrder: 3
    },
    {
      id: "platter",
      image: "/src/assets/images/food_bengali_platter_snacks_1791709490645.jpg",
      tagBn: "ফ্যামিলি কম্বো ও ক্যাটারিং প্যাকেজ",
      tagEn: "Family Combos & Catering Package",
      titleBn: "যেকোনো উৎসব ও পারিবারিক অনুষ্ঠানে ঘরের স্বাদ",
      titleEn: "Catering & Large Feasts for Every Celebration",
      descBn: "৫০ থেকে ৫০০ জনের সম্পূর্ণ ঘরোয়া খাবার সরবরাহ",
      descEn: "Complete homemade food service from 50 to 500 guests",
      isActive: true,
      sortOrder: 4
    }
  ]
};

const DEFAULT_SMTP_CONFIG: SmtpConfig = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  user: process.env.SMTP_USER || "rmartbdltd@gmail.com",
  pass: process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || "",
  security: "STARTTLS",
  senderEmail: process.env.ADMIN_EMAIL || "ghorershad.arai@gmail.com",
  senderName: "ঘরের স্বাদ (Ghorer Shad)",
  logoUrl: "/logo.jpg",
  websiteUrl: "",
  otpExpirationMinutes: 5,
  otpResendCooldownSeconds: 60,
  maxVerificationAttempts: 5,
  isConfigured: true
};

const DEFAULT_REVIEWS: CustomerReview[] = [
  {
    id: "rev-1",
    customerName: "আব্দুল কাদের",
    foodId: "food-1",
    foodNameBn: "সরষে ইলিশ ও জাফরানি পোলাও কম্বো",
    rating: 5,
    comment: "পদ্মার ইলিশের সরষে বাটা একদম মায়ের হাতের রান্নার মতো লেগেছে। গন্ধ আর ঝাঁঝ অসাধারণ!",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isApproved: true,
    isVerifiedPurchase: true
  },
  {
    id: "rev-2",
    customerName: "ফারহানা ইয়াসমিন",
    foodId: "food-2",
    foodNameBn: "ঘরোয়া চিকেন ভুনা ও গরম ফুলকো লুচি",
    rating: 5,
    comment: "লুচিগুলো একদম নরম আর গরম গরম ছিল। আড়াইহাজারে এমন খাঁটি ঘরোয়া স্বাদের খাবার পাওয়া সৌভাগ্যের ব্যাপার।",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isApproved: true,
    isVerifiedPurchase: true
  },
  {
    id: "rev-3",
    customerName: "মো. নাজমুল ইসলাম",
    foodId: "food-3",
    foodNameBn: "ঘরের স্বাদ রাজকীয় বাংলা থালি",
    rating: 5,
    comment: "পরিবারের মেহমানদারির জন্য অর্ডার করেছিলাম, সবাই খুব প্রশংসা করেছে। প্যাকেজিংও খুব প্রিমিয়াম।",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isApproved: true,
    isVerifiedPurchase: true
  }
];

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "fish-seafood",
    nameBn: "মাছ ও সি-ফুড",
    nameEn: "Fish & Seafood",
    descriptionBn: "নদী ও সমুদ্রের তাজা মাছের ঘরোয়া রান্না",
    iconName: "Fish",
    sortOrder: 1,
    isActive: true
  },
  {
    id: "meat-chicken",
    nameBn: "মাংস ও মুরগি",
    nameEn: "Meat & Chicken",
    descriptionBn: "দেশি মুরগি ও কষা মাংসের স্পেশাল রেসিপি",
    iconName: "Drumstick",
    sortOrder: 2,
    isActive: true
  },
  {
    id: "bengali-meals",
    nameBn: "বাঙালি ঘরোয়া খাবার",
    nameEn: "Bengali Homemade Meals",
    descriptionBn: "প্রতিদিনের পুষ্টিকর ভাত, ডাল, তরকারি ও ভর্তা",
    iconName: "Utensils",
    sortOrder: 3,
    isActive: true
  },
  {
    id: "platters-combos",
    nameBn: "ফুড প্ল্যাটার ও ফ্যামিলি প্যাকেজ",
    nameEn: "Food Platters & Family Packages",
    descriptionBn: "পারিবারিক ভোজ ও স্পেশাল দিনগুলোর জন্য কম্বো",
    iconName: "Sparkles",
    sortOrder: 4,
    isActive: true
  },
  {
    id: "fast-food-snacks",
    nameBn: "ফাস্টফুড ও বৈকালিক নাস্তা",
    nameEn: "Fast Food & Snacks",
    descriptionBn: "মুচমুচে সিঙ্গাড়া, চপ ও বিকেলে আড্ডার নাস্তা",
    iconName: "Coffee",
    sortOrder: 5,
    isActive: true
  },
  {
    id: "office-daily-meals",
    nameBn: "অফিস ও নিয়মিত মিল",
    nameEn: "Office & Daily Meals",
    descriptionBn: "অফিস ও নিয়মিত গ্রাহকদের সাশ্রয়ী মিল প্যাকেজ",
    iconName: "Briefcase",
    sortOrder: 6,
    isActive: true
  },
  {
    id: "catering-bulk",
    nameBn: "ক্যাটারিং ও বড় আয়োজন",
    nameEn: "Catering & Bulk Orders",
    descriptionBn: "বিয়ে, মিলাদ, জন্মদিন ও অফিসের বড় অনুষ্ঠান",
    iconName: "Users",
    sortOrder: 7,
    isActive: true
  }
];

const DEFAULT_FOODS: FoodItem[] = [
  {
    id: "food-1",
    sku: "GS-FISH-01",
    nameBn: "সরষে ইলিশ ও জাফরানি পোলাও কম্বো",
    nameEn: "Shorshe Ilish with Saffron Pulao Combo",
    categoryId: "fish-seafood",
    categoryNameBn: "মাছ ও সি-ফুড",
    shortDescBn: "পদ্মার তাজা ইলিশের খাঁটি সরিষা বাটা রেসিপি ও সুগন্ধি পোলাও।",
    fullDescBn: "পদ্মার তাজা বড় ইলিশ মাছের পেটি, খাঁটি সরিষা বাটা, পোস্ত ও কাঁচা মরিচের ঝাঁঝে ঐতিহ্যবাহী সরষে ইলিশ। সাথে পরিবেশন করা হয় ঘি-সুগন্ধি জাফরানি পোলাও, লেবুর ফালি ও সবুজ কাঁচামরিচ। সম্পূর্ণ ঘরোয়া ও স্বাস্থ্যকর উপায়ে অর্ডারের পর তাজা রান্না।",
    image: "/src/assets/images/food_ilish_bhapa_fish_1791709467165.jpg",
    price: 420,
    salePrice: 395,
    portionBn: "১ জনের পেটভরা মিল (১ টুকরা ইলিশ + পোলাও)",
    portionEn: "1 Full Meal (1 Ilish steak + fragrant pulao)",
    prepTimeMinutes: 45,
    spiceLevel: "Medium",
    isAvailable: true,
    dailyStock: 20,
    currentStock: 16,
    minOrderQty: 1,
    isFeatured: true,
    isBestseller: true,
    advanceNoticeRequiredHours: 4,
    variants: [
      { id: "v1-1", nameBn: "সুগন্ধি জাফরানি পোলাও সাথে", nameEn: "With Saffron Pulao", additionalPrice: 0 },
      { id: "v1-2", nameBn: "মিনিকেট সাদা ভাত সাথে", nameEn: "With Steamed Rice", additionalPrice: -20 },
      { id: "v1-3", nameBn: "স্পেশাল খিচুড়ি সাথে", nameEn: "With Bhuna Khichuri", additionalPrice: 30 }
    ],
    addons: [
      { id: "a1-1", nameBn: "বেগুন ভাজা (২ পিস)", nameEn: "Fried Eggplant (2 pcs)", price: 25 },
      { id: "a1-2", nameBn: "স্পেশাল ঘন সোনা মুগ ডাল", nameEn: "Thick Moong Dal", price: 35 },
      { id: "a1-3", nameBn: "ঘরোয়া মিষ্টি দই কাপ", nameEn: "Sweet Yogurt Cup", price: 40 }
    ],
    ingredientsBn: "পদ্মার ইলিশ মাছ, খাঁটি সরিষার তেল, দেশি সরিষা বাটা, কাঁচামরিচ, হলুদ গুঁড়া, পোলাও চাল, কাজুবাদাম।"
  },
  {
    id: "food-2",
    sku: "GS-MEAT-02",
    nameBn: "ঘরোয়া চিকেন ভুনা ও গরম ফুলকো লুচি",
    nameEn: "Homemade Chicken Bhuna with Fluffy Luchi",
    categoryId: "meat-chicken",
    categoryNameBn: "মাংস ও মুরগি",
    shortDescBn: "কড়া কষানো মশলাদার চিকেন ভুনা সাথে ৪টি গরম ফুলকো লুচি।",
    fullDescBn: "ঘরোয়া মশলায় কড়া করে কষানো রসালো চিকেন ভুনা। এলাচ-দারচিনির সুগন্ধি গ্রেভি এবং চার পিস গরম ফুলকো লুচি বা হাতে গড়া পরোটা। বিকেলে বা রাতের খাবারে অসাধারণ স্বাদ।",
    image: "/src/assets/images/food_bengali_meat_curry_1791709480684.jpg",
    price: 260,
    salePrice: 245,
    portionBn: "১ জনের পেটভরা মিল (৩ পিস চিকেন + ৪ লুচি)",
    portionEn: "1 Full Meal (3 pcs Chicken + 4 Luchis)",
    prepTimeMinutes: 35,
    spiceLevel: "Spicy",
    isAvailable: true,
    dailyStock: 25,
    currentStock: 22,
    minOrderQty: 1,
    isFeatured: true,
    isBestseller: true,
    advanceNoticeRequiredHours: 3,
    variants: [
      { id: "v2-1", nameBn: "৪টি গরম ফুলকো লুচি", nameEn: "4 Pcs Fluffy Luchi", additionalPrice: 0 },
      { id: "v2-2", nameBn: "৩টি তেলছাড়া হাতে তৈরি পরোটা", nameEn: "3 Pcs Handmade Paratha", additionalPrice: 10 },
      { id: "v2-3", nameBn: "১ প্লেট বাসমতি ভাত", nameEn: "1 Plate Steamed Rice", additionalPrice: 0 }
    ],
    addons: [
      { id: "a2-1", nameBn: "সিদ্ধ ডিম ভুনা (১ পিস)", nameEn: "Egg Bhuna (1 pc)", price: 25 },
      { id: "a2-2", nameBn: "ঘরোয়া শাহি বোরহানি (২৫০ মি.লি.)", nameEn: "Homemade Borhani (250ml)", price: 45 },
      { id: "a2-3", nameBn: "অতিরিক্ত ২ পিস লুচি", nameEn: "Extra 2 Luchis", price: 20 }
    ],
    ingredientsBn: "তাজা মুরগির মাংস, আদা-রসুন বাটা, পেঁয়াজ বেরেস্তা, খাঁটি সরিষার তেল, জিরা-ধনিয়া গুঁড়া, গরম মশলা, ময়দা।"
  },
  {
    id: "food-3",
    sku: "GS-PLAT-03",
    nameBn: "ঘরের স্বাদ রাজকীয় বাংলা থালি",
    nameEn: "Ghorer Shad Royal Bengali Feast Thali",
    categoryId: "platters-combos",
    categoryNameBn: "ফুড প্ল্যাটার ও ফ্যামিলি প্যাকেজ",
    shortDescBn: "ভাত, মাছ/মুরগি, আলু ভর্তা, ডাল, ভাজি ও সালাদের সম্পূর্ণ বাংলা আয়োজন।",
    fullDescBn: "সম্পূর্ণ তৃপ্তিদায়ক ঐতিহ্যবাহী বাঙালি থালি। মিনিকেট চালের গরম ভাত, ১ টুকরা রুই মাছ দোপেঁয়াজা অথবা দেশি মুরগির ঝোল, সরিষার তেলে মাখানো স্পেশাল শুকনা মরিচ-আলু ভর্তা, সোনা মুগ ডাল, বেগুন ভাজা, লেবু ও কাঁচামরিচ সালাদ।",
    image: "/src/assets/images/hero_ghorer_shad_feast_1791709454258.jpg",
    price: 360,
    salePrice: 340,
    portionBn: "১ জনের জমকালো বাংলা মিল",
    portionEn: "Complete Traditional Thali for 1 person",
    prepTimeMinutes: 45,
    spiceLevel: "Medium",
    isAvailable: true,
    dailyStock: 30,
    currentStock: 25,
    minOrderQty: 1,
    isFeatured: true,
    isBestseller: true,
    advanceNoticeRequiredHours: 4,
    variants: [
      { id: "v3-1", nameBn: "রুই মাছ দোপেঁয়াজা সহ", nameEn: "With Rui Fish Dopeyaja", additionalPrice: 0 },
      { id: "v3-2", nameBn: "দেশি মুরগির ঝোল সহ", nameEn: "With Deshi Chicken Curry", additionalPrice: 20 },
      { id: "v3-3", nameBn: "ইলিশ ভাজা পেটি সহ", nameEn: "With Fried Ilish Steak", additionalPrice: 80 }
    ],
    addons: [
      { id: "a3-1", nameBn: "চিংড়ি ভর্তা বা শুঁটকি ভর্তা", nameEn: "Prawn/Shutki Bhorta", price: 40 },
      { id: "a3-2", nameBn: "মিষ্টি পান ও মিষ্টি দই কাপ", nameEn: "Sweet Pan & Doi", price: 45 }
    ],
    ingredientsBn: "মিনিকেট চাল, তাজা মাছ/মুরগি, আলু, মুগ ডাল, সরিষার তেল, বেগুন, ধনেপাতা, শুকনা মরিচ।"
  },
  {
    id: "food-4",
    sku: "GS-SNK-04",
    nameBn: "ঐতিহ্যবাহী বৈকালিক নাস্তা ও স্ন্যাক্স প্ল্যাটার",
    nameEn: "Traditional Evening Snack Platter",
    categoryId: "fast-food-snacks",
    categoryNameBn: "ফাস্টফুড ও বৈকালিক নাস্তা",
    shortDescBn: "খাস্তা সিঙ্গাড়া, চপ, ক্রিস্পি প্রন বল ও চাটনির মুখরোচক প্যাকেজ।",
    fullDescBn: "বিকেলের আড্ডার জন্য ঘরে বানানো স্বাস্থ্যকর নাস্তা। ২টি খাঁটি ঘিয়ে মাখানো খাস্তা আলু-বাদামের সিঙ্গাড়া, ২টি ভেজিটেবল বিট-আলু চপ, ২টি ক্রিস্পি প্রন/চিকেন বল এবং ঘরে তৈরি তেঁতুল ও পুদিনার টক-মিষ্টি স্পেশাল চাটনি।",
    image: "/src/assets/images/food_bengali_platter_snacks_1791709490645.jpg",
    price: 220,
    salePrice: 199,
    portionBn: "২ জনের উপযোগী নাস্তা বক্স",
    portionEn: "Snack Box for 2 people",
    prepTimeMinutes: 25,
    spiceLevel: "Medium",
    isAvailable: true,
    dailyStock: 40,
    currentStock: 36,
    minOrderQty: 1,
    isFeatured: true,
    isBestseller: false,
    advanceNoticeRequiredHours: 2,
    variants: [
      { id: "v4-1", nameBn: "রেগুলার সিঙ্গাড়া ও চপ প্ল্যাটার", nameEn: "Regular Singara & Chop", additionalPrice: 0 },
      { id: "v4-2", nameBn: "স্পেশাল ফ্রাইড চিকেন উইংস সহ", nameEn: "With Fried Chicken Wings", additionalPrice: 60 }
    ],
    addons: [
      { id: "a4-1", nameBn: "স্পেশাল খাঁটি দুধ চা (২ কাপ)", nameEn: "Special Milk Tea (2 cups)", price: 40 },
      { id: "a4-2", nameBn: "অতিরিক্ত ২ পিস গরম সিঙ্গাড়া", nameEn: "Extra 2 Singaras", price: 30 }
    ],
    ingredientsBn: "ময়দা, আলু, চিনাবাদাম, ধনিয়া পাতা, কাঁচামরিচ, খাঁটি সয়াবিন তেল, স্পেশাল চাট মসলা।"
  }
];

const DEFAULT_DELIVERY_ZONES: DeliveryZone[] = [
  {
    id: "zone-1",
    nameBn: "আড়াইহাজার সদর (পৌরসভা এলাকা)",
    nameEn: "Araihazar Sadar (Municipality Area)",
    upazilaOrArea: "Araihazar Sadar",
    division: "dhaka",
    charge: 40,
    minOrderAmount: 200,
    freeDeliveryThreshold: 800,
    estimatedDeliveryMinutes: "৩০-৪৫ মিনিট",
    isActive: true,
    zoneScope: 'local'
  },
  {
    id: "zone-2",
    nameBn: "দুপতারা ও ব্রাক্ষন্দী ইউনিয়ন",
    nameEn: "Duptara & Brahmandi Union",
    upazilaOrArea: "Duptara",
    division: "dhaka",
    charge: 50,
    minOrderAmount: 250,
    freeDeliveryThreshold: 1000,
    estimatedDeliveryMinutes: "৪০-৫৫ মিনিট",
    isActive: true,
    zoneScope: 'local'
  },
  {
    id: "zone-3",
    nameBn: "গোপালদী পৌরসভা ও বাজার",
    nameEn: "Gopaldi Municipality & Bazar",
    upazilaOrArea: "Gopaldi",
    division: "dhaka",
    charge: 60,
    minOrderAmount: 300,
    freeDeliveryThreshold: 1200,
    estimatedDeliveryMinutes: "৪৫-৬০ মিনিট",
    isActive: true,
    zoneScope: 'local'
  },
  {
    id: "zone-4",
    nameBn: "উচিতপুর (মেঘনা ঘাট রোড এলাকা)",
    nameEn: "Uchitpur (Meghna Ghat Area)",
    upazilaOrArea: "Uchitpur",
    division: "dhaka",
    charge: 50,
    minOrderAmount: 250,
    freeDeliveryThreshold: 900,
    estimatedDeliveryMinutes: "৩৫-৫০ মিনিট",
    isActive: true,
    zoneScope: 'local'
  },
  {
    id: "zone-dhaka-city",
    nameBn: "ঢাকা মহানগর (উত্তর ও দক্ষিণ সিটি করপোরেশন)",
    nameEn: "Dhaka City (North & South City Corp)",
    upazilaOrArea: "Dhaka Metro",
    division: "dhaka",
    charge: 80,
    minOrderAmount: 350,
    freeDeliveryThreshold: 1500,
    estimatedDeliveryMinutes: "২-৪ ঘন্টা / একই দিন এক্সপ্রেস",
    isActive: true,
    zoneScope: 'dhaka_city',
    courierPartner: 'Pathao / Steadfast'
  },
  {
    id: "zone-dhaka-suburb",
    nameBn: "ঢাকা উপশহর (গাজীপুর, নারায়ণগঞ্জ সদর, সাভার, রূপগঞ্জ, নরসিংদী)",
    nameEn: "Dhaka Suburbs (Gazipur, Savar, Rupganj, Narsingdi)",
    upazilaOrArea: "Dhaka Suburbs",
    division: "dhaka",
    charge: 90,
    minOrderAmount: 400,
    freeDeliveryThreshold: 1800,
    estimatedDeliveryMinutes: "২৪ ঘন্টা (হোম ডেলিভারি)",
    isActive: true,
    zoneScope: 'dhaka_suburb',
    courierPartner: 'Steadfast / Sundarban'
  },
  {
    id: "zone-chattogram",
    nameBn: "চট্টগ্রাম বিভাগ (চট্টগ্রাম, কক্সবাজার, কুমিল্লা, নোয়াখালী)",
    nameEn: "Chattogram Division",
    upazilaOrArea: "Chattogram Division",
    division: "chattogram",
    charge: 130,
    minOrderAmount: 450,
    freeDeliveryThreshold: 2200,
    estimatedDeliveryMinutes: "১-২ কার্যদিবস (কুরিয়ার এক্সপ্রেস)",
    isActive: true,
    zoneScope: 'division',
    courierPartner: 'Steadfast / eCourier'
  },
  {
    id: "zone-sylhet",
    nameBn: "সিলেট বিভাগ (সিলেট, মৌলভীবাজার, হবিগঞ্জ, সুনামগঞ্জ)",
    nameEn: "Sylhet Division",
    upazilaOrArea: "Sylhet Division",
    division: "sylhet",
    charge: 130,
    minOrderAmount: 450,
    freeDeliveryThreshold: 2200,
    estimatedDeliveryMinutes: "১-২ কার্যদিবস (কুরিয়ার এক্সপ্রেস)",
    isActive: true,
    zoneScope: 'division',
    courierPartner: 'Steadfast / Sundarban'
  },
  {
    id: "zone-rajshahi",
    nameBn: "রাজশাহী ও রংপুর বিভাগ (উত্তরাঞ্চলের সকল জেলা)",
    nameEn: "Rajshahi & Rangpur Divisions",
    upazilaOrArea: "North Bengal",
    division: "rajshahi",
    charge: 130,
    minOrderAmount: 450,
    freeDeliveryThreshold: 2200,
    estimatedDeliveryMinutes: "১-২ কার্যদিবস (কুরিয়ার এক্সপ্রেস)",
    isActive: true,
    zoneScope: 'division',
    courierPartner: 'Steadfast / Pathao Courier'
  },
  {
    id: "zone-khulna-barishal",
    nameBn: "খুলনা ও বরিশাল বিভাগ (দক্ষিণাঞ্চলের সকল জেলা)",
    nameEn: "Khulna & Barishal Divisions",
    upazilaOrArea: "South Bengal",
    division: "khulna",
    charge: 130,
    minOrderAmount: 450,
    freeDeliveryThreshold: 2200,
    estimatedDeliveryMinutes: "১-২ কার্যদিবস (কুরিয়ার এক্সপ্রেস)",
    isActive: true,
    zoneScope: 'division',
    courierPartner: 'Steadfast / Sundarban'
  },
  {
    id: "zone-all-bangladesh",
    nameBn: "সারা বাংলাদেশ (সকল ৬৪ জেলায় হোম ডেলিভারি)",
    nameEn: "All Bangladesh (Nationwide Delivery to All 64 Districts)",
    upazilaOrArea: "All 64 Districts",
    division: "all",
    charge: 120,
    minOrderAmount: 400,
    freeDeliveryThreshold: 2000,
    estimatedDeliveryMinutes: "১-৩ কার্যদিবস",
    isActive: true,
    zoneScope: 'nationwide',
    courierPartner: 'Steadfast / Sundarban / Pathao'
  }
];

const DEFAULT_PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: "pm-cod",
    nameBn: "ক্যাশ অন ডেলিভারি (Cash on Delivery)",
    nameEn: "Cash on Delivery (COD)",
    type: "cod",
    accountNumber: "N/A",
    instructionsBn: "খাবার বা পার্সেল হাতে পেয়ে রাইডারকে ক্যাশ টাকা পরিশোধ করুন।",
    instructionsEn: "Pay in cash directly to the delivery rider upon receiving your package.",
    isActive: true,
    requiresTransactionId: false,
    sortOrder: 1
  },
  {
    id: "pm-bkash-personal",
    nameBn: "বিকাশ (Personal - Send Money)",
    nameEn: "bKash (Personal - Send Money)",
    type: "bkash",
    accountType: "Personal",
    accountNumber: "01912-838891",
    chargePercentage: 1.5,
    instructionsBn: "বিকাশ অ্যাপ বা *247# ডায়াল করে Send Money করুন। রেফারেন্সে আপনার মোবাইল নম্বর দিন এবং নিচে TrxID লিখুন।",
    instructionsEn: "Send Money to our bKash Personal number and input your TrxID below.",
    isActive: true,
    requiresTransactionId: true,
    sortOrder: 2
  },
  {
    id: "pm-bkash-merchant",
    nameBn: "বিকাশ (Merchant - Payment)",
    nameEn: "bKash (Merchant - Make Payment)",
    type: "bkash",
    accountType: "Merchant",
    accountNumber: "01857-220603",
    chargePercentage: 0,
    instructionsBn: "বিকাশ অ্যাপ থেকে 'Make Payment' অপশন ব্যবহার করুন। কোনো অতিরিক্ত ক্যাশ-আউট চার্জ প্রযোজ্য নয়।",
    instructionsEn: "Use 'Make Payment' option in bKash app. No extra cash-out fee applies.",
    isActive: true,
    requiresTransactionId: true,
    sortOrder: 3
  },
  {
    id: "pm-nagad",
    nameBn: "নগদ (Personal - Send Money)",
    nameEn: "Nagad (Personal - Send Money)",
    type: "nagad",
    accountType: "Personal",
    accountNumber: "01857-220603",
    chargePercentage: 1.0,
    instructionsBn: "নগদ অ্যাপ বা *167# ডায়াল করে Send Money করুন। সফল পেমেন্টের পর প্রাপ্ত TrxID নিচে লিখুন।",
    instructionsEn: "Send Money to our Nagad number and enter the Transaction ID.",
    isActive: true,
    requiresTransactionId: true,
    sortOrder: 4
  },
  {
    id: "pm-rocket",
    nameBn: "রকেট (Personal - Send Money)",
    nameEn: "Rocket (Personal - Send Money)",
    type: "rocket",
    accountType: "Personal",
    accountNumber: "01857-220603-9",
    chargePercentage: 1.0,
    instructionsBn: "ডাচ-বাংলা রকেটে Send Money করুন এবং ১২ ডিজিটের ট্রানজেকশন আইডি দিন।",
    instructionsEn: "Send Money to our Rocket account and input the TrxID.",
    isActive: true,
    requiresTransactionId: true,
    sortOrder: 5
  },
  {
    id: "pm-upay",
    nameBn: "উপায় (Upay - Send Money)",
    nameEn: "Upay (Send Money)",
    type: "upay",
    accountType: "Personal",
    accountNumber: "01857-220603",
    chargePercentage: 1.0,
    instructionsBn: "ইউসিবি উপায় একাউন্টে Send Money করে ট্রানজেকশন আইডি নিচে প্রদান করুন।",
    instructionsEn: "Send Money via Upay and provide the transaction ID.",
    isActive: true,
    requiresTransactionId: true,
    sortOrder: 6
  },
  {
    id: "pm-bank",
    nameBn: "ব্যাংক ট্রান্সফার (Bank Deposit / EFT)",
    nameEn: "Bank Transfer (Islami Bank Bangladesh Ltd)",
    type: "bank",
    accountNumber: "205012345678",
    instructionsBn: "ইসলামী ব্যাংক বাংলাদেশ লিমিটেড, আড়াইহাজার শাখা। হিসাব নাম: Joynob Islam Kakoly। রাউটিং: 125270189। ট্রান্সফারের পর রেফারেন্স স্লট দিন।",
    instructionsEn: "Islami Bank Bangladesh Ltd, Araihazar Branch. A/C: 205012345678. Routing: 125270189.",
    isActive: true,
    requiresTransactionId: true,
    sortOrder: 7
  }
];

const DEFAULT_COUPONS: Coupon[] = [
  {
    code: "GHORER10",
    discountType: "percentage",
    discountValue: 10,
    minOrderAmount: 350,
    maxDiscountAmount: 150,
    expiresAt: "2026-12-31",
    isActive: true,
    usageCount: 14
  },
  {
    code: "ARAIHAZAR50",
    discountType: "fixed",
    discountValue: 50,
    minOrderAmount: 500,
    expiresAt: "2026-12-31",
    isActive: true,
    usageCount: 22
  }
];

// Helper: secure password hashing
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, combinedHash: string): boolean {
  try {
    const [salt, key] = combinedHash.split(':');
    if (!salt || !key) return false;
    const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(derivedKey, 'hex'));
  } catch {
    return false;
  }
}

interface PendingOtp {
  email: string;
  name: string;
  passwordHash: string;
  otp: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
  maxAttempts: number;
  lastSentAt: number;
  purpose: 'signup' | 'reset_password';
}

class DatabaseStore {
  private data: DatabaseSchema;
  private pendingOtps: Map<string, PendingOtp> = new Map();
  private sessions: Map<string, { userId: string; role: 'owner' | 'admin' | 'subadmin' | 'staff' | 'customer'; email: string; expiresAt: number }> = new Map();
  private cloudSyncTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.data = this.loadData();
    if (this.data.sessions) {
      for (const [t, s] of Object.entries(this.data.sessions)) {
        this.sessions.set(t, s);
      }
    }
    this.ensureDefaultUsers();
    // Synchronize with Cloud Firestore so redeployments always inherit cloud data
    this.initCloudSync().catch(err => {
      console.warn('[CloudSync] Init notice:', err);
    });
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          config: { ...DEFAULT_CONFIG, ...(parsed.config || {}) },
          homepageContent: { ...DEFAULT_HOMEPAGE_CONTENT, ...(parsed.homepageContent || {}) },
          smtpConfig: {
            ...DEFAULT_SMTP_CONFIG,
            ...(parsed.smtpConfig || {}),
            senderName: (parsed.smtpConfig?.senderName && !parsed.smtpConfig.senderName.toLowerCase().includes('r-mart') && !parsed.smtpConfig.senderName.toLowerCase().includes('r mart'))
              ? parsed.smtpConfig.senderName
              : 'ঘরের স্বাদ (Ghorer Shad)',
            logoUrl: parsed.smtpConfig?.logoUrl || '/logo.jpg',
            pass: (parsed.smtpConfig && parsed.smtpConfig.pass) || DEFAULT_SMTP_CONFIG.pass,
            user: (parsed.smtpConfig && parsed.smtpConfig.user) || DEFAULT_SMTP_CONFIG.user,
            isConfigured: true
          },
          categories: parsed.categories || DEFAULT_CATEGORIES,
          foods: parsed.foods || DEFAULT_FOODS,
          deliveryZones: parsed.deliveryZones || DEFAULT_DELIVERY_ZONES,
          paymentMethods: parsed.paymentMethods || DEFAULT_PAYMENT_METHODS,
          coupons: parsed.coupons || DEFAULT_COUPONS,
          orders: parsed.orders || [],
          cateringInquiries: parsed.cateringInquiries || [],
          customers: parsed.customers || {},
          users: parsed.users || {},
          reviews: parsed.reviews || DEFAULT_REVIEWS,
          expenses: parsed.expenses || [],
          auditLogs: parsed.auditLogs || [],
          ownerEmail: (parsed.ownerEmail || process.env.ADMIN_EMAIL || 'rmartbdltd@gmail.com').toLowerCase().trim(),
          sessions: parsed.sessions || {}
        };
      }
    } catch (err) {
      console.error('Error loading DB file, fallback to defaults:', err);
    }

    const initialData: DatabaseSchema = {
      config: DEFAULT_CONFIG,
      homepageContent: DEFAULT_HOMEPAGE_CONTENT,
      smtpConfig: DEFAULT_SMTP_CONFIG,
      categories: DEFAULT_CATEGORIES,
      foods: DEFAULT_FOODS,
      deliveryZones: DEFAULT_DELIVERY_ZONES,
      paymentMethods: DEFAULT_PAYMENT_METHODS,
      coupons: DEFAULT_COUPONS,
      orders: [],
      cateringInquiries: [],
      customers: {},
      users: {},
      reviews: DEFAULT_REVIEWS,
      expenses: [],
      auditLogs: [],
      ownerEmail: (process.env.ADMIN_EMAIL || 'rmartbdltd@gmail.com').toLowerCase().trim(),
      sessions: {}
    };

    this.saveData(initialData);
    return initialData;
  }

  private ensureDefaultUsers() {
    // Strictly ONE single Owner: rmartbdltd@gmail.com (UID: qEaFZDzP02O7kyUVpHNfM7FiZmz1)
    const ownerEmail = (process.env.ADMIN_EMAIL || "rmartbdltd@gmail.com").toLowerCase().trim();
    const ownerUid = (process.env.ADMIN_UID || "qEaFZDzP02O7kyUVpHNfM7FiZmz1").trim();

    this.data.ownerEmail = ownerEmail;

    // Ensure owner account exists
    if (!this.data.users[ownerEmail]) {
      this.data.users[ownerEmail] = {
        id: ownerUid,
        name: "Joynob Islam Kakoly",
        email: ownerEmail,
        phone: "01857-220603",
        role: "owner",
        isEmailVerified: true,
        provider: "google",
        createdAt: new Date().toISOString(),
        addresses: ["আড়াইহাজার, ঢাকা"],
        passwordHash: hashPassword(process.env.GMAIL_APP_PASSWORD || "admin123")
      };
    } else {
      this.data.users[ownerEmail].role = 'owner';
      this.data.users[ownerEmail].id = ownerUid;
    }

    // Ensure developer / current user ahmedskkawsar43@gmail.com also has owner privileges
    const devEmail = 'ahmedskkawsar43@gmail.com';
    if (this.data.users[devEmail]) {
      this.data.users[devEmail].role = 'owner';
    } else {
      this.data.users[devEmail] = {
        id: `usr-dev-${Date.now()}`,
        name: "Rayhan",
        email: devEmail,
        phone: "01857-220603",
        role: "owner",
        isEmailVerified: true,
        provider: "google",
        createdAt: new Date().toISOString(),
        addresses: ["আড়াইহাজার, ঢাকা"]
      };
    }

    // Demote any previously auto-seeded default admin accounts to regular customers
    // Only the single owner is owner, and all others are customers unless explicitly made admin/subadmin by owner
    const legacyAdminEmails = [
      "joynob.kakoly@ghorershad.com",
      "rayhanahamad50@gmail.com",
      "ahmedskkawsar43@gmail.com",
      "proxy6726@gmail.com",
      "ghorershad.arai@gmail.com"
    ];

    for (const [key, user] of Object.entries(this.data.users)) {
      const cleanKey = key.toLowerCase().trim();
      if (cleanKey === ownerEmail) {
        user.role = 'owner';
        user.id = ownerUid;
      } else if (legacyAdminEmails.includes(cleanKey)) {
        user.role = 'customer';
      } else if (user.role === 'owner') {
        user.role = 'customer';
      }
    }

    this.saveData();
  }

  public isSystemAdmin(email?: string, uid?: string): boolean {
    const cleanEmail = (email || '').toLowerCase().trim();
    const ownerEmail = (this.data.ownerEmail || process.env.ADMIN_EMAIL || "rmartbdltd@gmail.com").toLowerCase().trim();
    const ownerUid = (process.env.ADMIN_UID || "qEaFZDzP02O7kyUVpHNfM7FiZmz1").trim();

    // Designated owner & authorized project admin emails
    const adminEmails = [
      ownerEmail,
      'rmartbdltd@gmail.com',
      'ahmedskkawsar43@gmail.com',
      'rayhanahamad50@gmail.com',
      'joynob.kakoly@ghorershad.com',
      'proxy6726@gmail.com'
    ];
    if (cleanEmail && adminEmails.includes(cleanEmail)) {
      return true;
    }
    if (uid && uid.trim() === ownerUid) {
      return true;
    }

    // Explicitly assigned admin, subadmin, or staff in store database
    const existing = cleanEmail ? this.data.users[cleanEmail] : (uid ? this.getUserById(uid) : null);
    if (existing && (existing.role === 'owner' || existing.role === 'admin' || existing.role === 'subadmin' || existing.role === 'staff')) {
      return true;
    }

    return false;
  }

  public isVerifiedPurchase(customerId?: string, customerEmail?: string, foodId?: string): boolean {
    if (!foodId) return false;
    const cleanEmail = (customerEmail || '').toLowerCase().trim();
    return (this.data.orders || []).some(o =>
      ((customerId && o.customerId === customerId) || (cleanEmail && o.customerEmail?.toLowerCase().trim() === cleanEmail)) &&
      (o.orderStatus === 'delivered' || o.orderStatus === 'accepted' || o.orderStatus === 'preparing' || o.orderStatus === 'ready' || o.orderStatus === 'placed') &&
      o.items.some(item => item.foodId === foodId)
    );
  }

  public async initCloudSync() {
    try {
      const cloudRes = await cloudSyncService.pullFromCloud();
      if (cloudRes.success && cloudRes.data) {
        let changed = false;
        if (Array.isArray(cloudRes.data.foods) && cloudRes.data.foods.length > 0) {
          this.data.foods = cloudRes.data.foods;
          changed = true;
        }
        if (Array.isArray(cloudRes.data.categories) && cloudRes.data.categories.length > 0) {
          this.data.categories = cloudRes.data.categories;
          changed = true;
        }
        if (cloudRes.data.config) {
          this.data.config = { ...this.data.config, ...cloudRes.data.config };
          changed = true;
        }
        if (cloudRes.data.homepageContent) {
          this.data.homepageContent = { ...this.data.homepageContent, ...cloudRes.data.homepageContent };
          changed = true;
        }
        if (Array.isArray(cloudRes.data.deliveryZones) && cloudRes.data.deliveryZones.length > 0) {
          this.data.deliveryZones = cloudRes.data.deliveryZones;
          changed = true;
        }
        if (Array.isArray(cloudRes.data.paymentMethods) && cloudRes.data.paymentMethods.length > 0) {
          this.data.paymentMethods = cloudRes.data.paymentMethods;
          changed = true;
        }
        if (Array.isArray(cloudRes.data.coupons) && cloudRes.data.coupons.length > 0) {
          this.data.coupons = cloudRes.data.coupons;
          changed = true;
        }
        if (changed) {
          this.saveDataLocally();
          console.log(`[CloudSync] Restored ${this.data.foods.length} dishes from Cloud Firestore.`);
        }
      } else {
        // Cloud is currently empty, push current seed so it's stored in cloud
        await cloudSyncService.pushToCloud(this.data).catch(() => {});
      }
    } catch (err) {
      console.warn('[CloudSync] Init error:', err);
    }
  }

  public saveDataLocally(dataToSave?: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write to DB file:', err);
    }
  }

  public saveData(dataToSave?: DatabaseSchema) {
    this.saveDataLocally(dataToSave);
    // Debounce background sync to Cloud Firestore
    if (this.cloudSyncTimer) {
      clearTimeout(this.cloudSyncTimer);
    }
    this.cloudSyncTimer = setTimeout(() => {
      cloudSyncService.pushToCloud(this.data).catch(err => {
        console.warn('[CloudSync] Background push notice:', err?.message || err);
      });
    }, 1500);
  }

  public async getCloudSyncStatus() {
    return cloudSyncService.getStatus();
  }

  public async pushToCloud() {
    return cloudSyncService.pushToCloud(this.data);
  }

  public async pullFromCloud() {
    const res = await cloudSyncService.pullFromCloud();
    if (res.success && res.data) {
      if (Array.isArray(res.data.foods)) this.data.foods = res.data.foods;
      if (Array.isArray(res.data.categories)) this.data.categories = res.data.categories;
      if (res.data.config) this.data.config = { ...this.data.config, ...res.data.config };
      if (res.data.homepageContent) this.data.homepageContent = { ...this.data.homepageContent, ...res.data.homepageContent };
      if (Array.isArray(res.data.deliveryZones)) this.data.deliveryZones = res.data.deliveryZones;
      if (Array.isArray(res.data.paymentMethods)) this.data.paymentMethods = res.data.paymentMethods;
      if (Array.isArray(res.data.coupons)) this.data.coupons = res.data.coupons;
      this.saveDataLocally();
    }
    return res;
  }

  public exportFullBackup(): DatabaseSchema {
    return JSON.parse(JSON.stringify(this.data));
  }

  public importFullBackup(importedData: Partial<DatabaseSchema>, callerEmail = 'Admin'): { success: boolean; message: string; count: number } {
    if (!importedData || typeof importedData !== 'object') {
      throw new Error('Invalid JSON backup data');
    }

    if (Array.isArray(importedData.foods)) {
      this.data.foods = importedData.foods;
    }
    if (Array.isArray(importedData.categories)) {
      this.data.categories = importedData.categories;
    }
    if (importedData.config) {
      this.data.config = { ...this.data.config, ...importedData.config };
    }
    if (importedData.homepageContent) {
      this.data.homepageContent = { ...this.data.homepageContent, ...importedData.homepageContent };
    }
    if (Array.isArray(importedData.deliveryZones)) {
      this.data.deliveryZones = importedData.deliveryZones;
    }
    if (Array.isArray(importedData.paymentMethods)) {
      this.data.paymentMethods = importedData.paymentMethods;
    }
    if (Array.isArray(importedData.coupons)) {
      this.data.coupons = importedData.coupons;
    }
    if (Array.isArray(importedData.orders)) {
      this.data.orders = importedData.orders;
    }
    if (importedData.customers && typeof importedData.customers === 'object') {
      this.data.customers = importedData.customers;
    }

    this.saveData();
    this.logAction('IMPORT_BACKUP', `Database backup imported (${this.data.foods.length} items)`, callerEmail);

    return {
      success: true,
      message: `সফলভাবে ব্যাকআপ থেকে ${this.data.foods.length}টি খাদ্যসামগ্রী ও সেটিংস রিস্টোর করা হয়েছে!`,
      count: this.data.foods.length
    };
  }

  public getBroadcastHistory() {
    return this.data.broadcastHistory || [];
  }

  public addBroadcastHistory(item: {
    subject: string;
    headline: string;
    targetAudience: string;
    sentCount: number;
    isTest?: boolean;
    user?: string;
  }) {
    if (!this.data.broadcastHistory) {
      this.data.broadcastHistory = [];
    }
    const entry = {
      id: `bc-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...item
    };
    this.data.broadcastHistory.unshift(entry);
    if (this.data.broadcastHistory.length > 50) {
      this.data.broadcastHistory = this.data.broadcastHistory.slice(0, 50);
    }
    this.saveDataLocally();
    return entry;
  }

  // ---------------- Business & Content ----------------
  public getConfig(): BusinessConfig {
    return this.data.config;
  }

  public updateConfig(updates: Partial<BusinessConfig>): BusinessConfig {
    this.data.config = { ...this.data.config, ...updates };
    this.logAction('UPDATE_CONFIG', 'Updated business configurations', updates.contactPerson || 'Admin');
    this.saveData();
    return this.data.config;
  }

  public getHomepageContent(): HomepageContent {
    const content = { ...(this.data.homepageContent || DEFAULT_HOMEPAGE_CONTENT) };
    if (!content.heroBanners || !Array.isArray(content.heroBanners) || content.heroBanners.length === 0) {
      content.heroBanners = JSON.parse(JSON.stringify(DEFAULT_HOMEPAGE_CONTENT.heroBanners || []));
    }
    if (!content.bannerIntervalSeconds) {
      content.bannerIntervalSeconds = 3;
    }
    this.data.homepageContent = content;
    return content;
  }

  public updateHomepageContent(updates: Partial<HomepageContent>): HomepageContent {
    this.data.homepageContent = { ...this.getHomepageContent(), ...updates };
    this.logAction('UPDATE_HOMEPAGE', 'Updated homepage hero text and banners', 'Admin');
    this.saveData();
    return this.data.homepageContent;
  }

  // ---------------- Gemini AI Engine ----------------
  public getEffectiveGeminiKey(): string {
    return (this.data.geminiApiKey || process.env.GEMINI_API_KEY || '').trim();
  }

  public getGeminiConfig(): { isConfigured: boolean; apiKeyMasked: string } {
    const key = this.getEffectiveGeminiKey();
    if (!key) {
      return { isConfigured: false, apiKeyMasked: '' };
    }
    const masked = key.length > 8 ? `${key.slice(0, 6)}••••••••${key.slice(-4)}` : '••••••••';
    return { isConfigured: true, apiKeyMasked: masked };
  }

  public updateGeminiApiKey(newKey: string): { isConfigured: boolean; apiKeyMasked: string } {
    this.data.geminiApiKey = (newKey || '').trim();
    this.logAction('UPDATE_GEMINI_KEY', 'Gemini AI API Key updated', 'Admin');
    this.saveData();
    return this.getGeminiConfig();
  }

  // ---------------- SMTP & OTP Engine ----------------
  public getSmtpConfig(maskPassword = true): SmtpConfig {
    const cfg = { ...this.data.smtpConfig };
    return {
      ...cfg,
      pass: maskPassword && cfg.pass ? '••••••••' : cfg.pass,
      isPassSet: Boolean(cfg.pass && cfg.pass.length > 0)
    };
  }

  public getRawSmtpConfig(): SmtpConfig {
    return this.data.smtpConfig;
  }

  public updateSmtpConfig(updates: Partial<SmtpConfig>): SmtpConfig {
    const existing = this.data.smtpConfig;
    let newPass = existing.pass;

    // Only update pass if provided and not the masked placeholder
    if (updates.pass && updates.pass !== '••••••••') {
      newPass = updates.pass;
    }

    this.data.smtpConfig = {
      ...existing,
      ...updates,
      pass: newPass,
      isConfigured: Boolean(updates.host && updates.user && newPass)
    };

    this.logAction('UPDATE_SMTP', `SMTP settings updated (Host: ${updates.host || existing.host})`, 'Admin');
    this.saveData();
    return this.getSmtpConfig(true);
  }

  // ---------------- Order Notification Emails ----------------
  public getNotificationEmails(): string[] {
    const list = this.data.config.orderNotificationEmails;
    if (Array.isArray(list) && list.length > 0) return list;
    return [(this.data.ownerEmail || process.env.ADMIN_EMAIL || 'rmartbdltd@gmail.com').toLowerCase().trim()];
  }

  public addNotificationEmail(email: string): string[] {
    const clean = email.toLowerCase().trim();
    if (!clean || !clean.includes('@')) return this.getNotificationEmails();
    const current = [...this.getNotificationEmails()];
    if (!current.includes(clean)) {
      current.push(clean);
      this.data.config.orderNotificationEmails = current;
      this.logAction('ADD_NOTIFICATION_EMAIL', `অর্ডার অ্যালার্ট ইমেইল যোগ করা হয়েছে: ${clean}`, 'Admin');
      this.saveData();
    }
    return current;
  }

  public removeNotificationEmail(email: string): string[] {
    const clean = email.toLowerCase().trim();
    let current = this.getNotificationEmails().filter(e => e.toLowerCase() !== clean);
    if (current.length === 0) {
      current = [(this.data.ownerEmail || 'rmartbdltd@gmail.com').toLowerCase()];
    }
    this.data.config.orderNotificationEmails = current;
    this.logAction('REMOVE_NOTIFICATION_EMAIL', `অর্ডার অ্যালার্ট ইমেইল মুছে ফেলা হয়েছে: ${clean}`, 'Admin');
    this.saveData();
    return current;
  }

  // ---------------- Customer Ranking & Top 10 Leaderboard ----------------
  public getLeaderboard(currentUserId?: string): LeaderboardUser[] {
    const userStats = new Map<string, {
      userId: string;
      name: string;
      email: string;
      phone: string;
      totalOrders: number;
      totalSpent: number;
    }>();

    // Index from customers list
    for (const [phone, cust] of Object.entries(this.data.customers || {})) {
      const key = cust.email?.toLowerCase().trim() || phone;
      userStats.set(key, {
        userId: key,
        name: cust.name,
        email: cust.email || '',
        phone: cust.phone,
        totalOrders: cust.totalOrders || 0,
        totalSpent: cust.totalSpent || 0,
      });
    }

    // Index from placed/completed orders
    for (const ord of (this.data.orders || [])) {
      if (ord.orderStatus === 'cancelled' || ord.orderStatus === 'rejected') continue;
      const key = ord.customerId || ord.customerEmail?.toLowerCase().trim() || ord.customerPhone;
      if (!key) continue;
      const existing = userStats.get(key) || {
        userId: key,
        name: ord.customerName,
        email: ord.customerEmail || '',
        phone: ord.customerPhone,
        totalOrders: 0,
        totalSpent: 0,
      };
      existing.totalOrders += 1;
      existing.totalSpent += (ord.totalAmount || 0);
      userStats.set(key, existing);
    }

    // Index from registered users
    for (const [email, u] of Object.entries(this.data.users || {})) {
      if (u.role === 'customer') {
        const key = u.id || email;
        if (!userStats.has(key) && !userStats.has(email)) {
          userStats.set(key, {
            userId: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone || '',
            totalOrders: 0,
            totalSpent: 0
          });
        }
      }
    }

    const sorted = Array.from(userStats.values()).sort((a, b) => {
      if (b.totalOrders !== a.totalOrders) return b.totalOrders - a.totalOrders;
      return b.totalSpent - a.totalSpent;
    });

    const getTierInfo = (ordersCount: number, spent: number) => {
      if (ordersCount >= 16 || spent >= 10000) {
        return { tier: 'Platinum Feast Master' as const, tierBn: 'প্লাটিনাম ভোজরাজ 👑', badge: '👑' };
      }
      if (ordersCount >= 8 || spent >= 5000) {
        return { tier: 'Gold Gourmand' as const, tierBn: 'গোল্ড ভোজনরসিক 🥇', badge: '🥇' };
      }
      if (ordersCount >= 3 || spent >= 1500) {
        return { tier: 'Silver Connoisseur' as const, tierBn: 'সিলভার রসনাবিদ 🥈', badge: '🥈' };
      }
      return { tier: 'Bronze Foodie' as const, tierBn: 'ব্রোঞ্জ ফুডি 🥉', badge: '🥉' };
    };

    return sorted.slice(0, 10).map((u, index) => {
      const rank = index + 1;
      const tierInfo = getTierInfo(u.totalOrders, u.totalSpent);
      const points = (u.totalOrders * 30) + Math.floor(u.totalSpent / 20);

      const parts = u.name.trim().split(' ');
      const maskedName = parts.length > 1
        ? `${parts[0]} ${parts[parts.length - 1][0]}.`
        : u.name;

      const isCurrentUser = Boolean(
        currentUserId && (
          u.userId === currentUserId ||
          (u.email && u.email.toLowerCase() === currentUserId.toLowerCase())
        )
      );

      return {
        rank,
        userId: u.userId,
        name: isCurrentUser ? u.name : maskedName,
        maskedName,
        avatarSeed: u.name,
        totalOrders: u.totalOrders,
        totalSpent: u.totalSpent,
        points,
        tier: tierInfo.tier,
        tierBn: tierInfo.tierBn,
        badge: tierInfo.badge,
        isCurrentUser
      };
    });
  }

  public createPendingSignupOtp(name: string, email: string, passwordPlain: string): { otp: string; cooldownSeconds: number } {
    const cleanEmail = email.toLowerCase().trim();
    const otp = crypto.randomInt(100000, 999999).toString(); // Cryptographic 6-digit numeric OTP
    const expirationMinutes = this.data.smtpConfig.otpExpirationMinutes || 5;
    const cooldownSeconds = this.data.smtpConfig.otpResendCooldownSeconds || 60;
    const maxAttempts = this.data.smtpConfig.maxVerificationAttempts || 5;

    const record: PendingOtp = {
      email: cleanEmail,
      name: name.trim(),
      passwordHash: hashPassword(passwordPlain),
      otp,
      createdAt: Date.now(),
      expiresAt: Date.now() + expirationMinutes * 60 * 1000,
      attempts: 0,
      maxAttempts,
      lastSentAt: Date.now(),
      purpose: 'signup'
    };

    this.pendingOtps.set(cleanEmail, record);
    return { otp, cooldownSeconds };
  }

  public resendSignupOtp(email: string): { success: boolean; otp?: string; message: string; cooldownRemaining?: number } {
    const cleanEmail = email.toLowerCase().trim();
    const record = this.pendingOtps.get(cleanEmail);

    if (!record) {
      return { success: false, message: 'কোনো অপেক্ষমান ওটিপি অনুরোধ পাওয়া যায়নি। অনুগ্রহ করে পুনরায় সাইন আপ ফর্ম পূরণ করুন।' };
    }

    const cooldown = (this.data.smtpConfig.otpResendCooldownSeconds || 60) * 1000;
    const elapsed = Date.now() - record.lastSentAt;

    if (elapsed < cooldown) {
      const waitSeconds = Math.ceil((cooldown - elapsed) / 1000);
      return {
        success: false,
        message: `অনুগ্রহ করে আরও ${waitSeconds} সেকেন্ড পর পুনরায় ওটিপি পাঠানোর চেষ্টা করুন।`,
        cooldownRemaining: waitSeconds
      };
    }

    const newOtp = crypto.randomInt(100000, 999999).toString();
    record.otp = newOtp;
    record.lastSentAt = Date.now();
    record.expiresAt = Date.now() + (this.data.smtpConfig.otpExpirationMinutes || 5) * 60 * 1000;
    record.attempts = 0; // Reset attempts on resend

    return { success: true, otp: newOtp, message: 'নতুন ওটিপি কোড পাঠানো হয়েছে।' };
  }

  public createPendingForgotOtp(email: string): {
    success: boolean;
    message?: string;
    name?: string;
    otp?: string;
    cooldownSeconds?: number;
  } {
    const cleanEmail = email.toLowerCase().trim();
    const user = this.data.users[cleanEmail];

    if (!user) {
      return {
        success: false,
        message: 'এই ইমেইল ঠিকানা দিয়ে কোনো নিবন্ধিত অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে সঠিক ইমেইল দিন বা নতুন অ্যাকাউন্ট তৈরি করুন।'
      };
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const expirationMinutes = this.data.smtpConfig.otpExpirationMinutes || 5;
    const cooldownSeconds = this.data.smtpConfig.otpResendCooldownSeconds || 60;
    const maxAttempts = this.data.smtpConfig.maxVerificationAttempts || 5;

    const record: PendingOtp = {
      email: cleanEmail,
      name: user.name || 'গ্রাহক',
      passwordHash: user.passwordHash || '',
      otp,
      createdAt: Date.now(),
      expiresAt: Date.now() + expirationMinutes * 60 * 1000,
      attempts: 0,
      maxAttempts,
      lastSentAt: Date.now(),
      purpose: 'reset_password'
    };

    this.pendingOtps.set(cleanEmail, record);
    return { success: true, name: user.name, otp, cooldownSeconds };
  }

  public resendForgotOtp(email: string): { success: boolean; otp?: string; message: string; cooldownRemaining?: number } {
    const cleanEmail = email.toLowerCase().trim();
    const record = this.pendingOtps.get(cleanEmail);

    if (!record || record.purpose !== 'reset_password') {
      return { success: false, message: 'পাসওয়ার্ড রিসেটের কোনো সক্রিয় অনুরোধ পাওয়া যায়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।' };
    }

    const cooldown = (this.data.smtpConfig.otpResendCooldownSeconds || 60) * 1000;
    const elapsed = Date.now() - record.lastSentAt;

    if (elapsed < cooldown) {
      const waitSeconds = Math.ceil((cooldown - elapsed) / 1000);
      return {
        success: false,
        message: `অনুগ্রহ করে আরও ${waitSeconds} সেকেন্ড পর পুনরায় ওটিপি পাঠানোর চেষ্টা করুন।`,
        cooldownRemaining: waitSeconds
      };
    }

    const newOtp = crypto.randomInt(100000, 999999).toString();
    record.otp = newOtp;
    record.lastSentAt = Date.now();
    record.expiresAt = Date.now() + (this.data.smtpConfig.otpExpirationMinutes || 5) * 60 * 1000;
    record.attempts = 0;

    return { success: true, otp: newOtp, message: 'নতুন পাসওয়ার্ড রিসেট ওটিপি কোড পাঠানো হয়েছে।' };
  }

  public verifyAndResetPassword(
    email: string,
    submittedOtp: string,
    newPasswordPlain: string
  ): { success: boolean; message: string; user?: AppUser; token?: string } {
    const cleanEmail = email.toLowerCase().trim();
    const record = this.pendingOtps.get(cleanEmail);

    if (!record || record.purpose !== 'reset_password') {
      return { success: false, message: 'পাসওয়ার্ড রিসেট সেশনের মেয়াদ শেষ হয়েছে। অনুগ্রহ করে নতুন করে চেষ্টা করুন।' };
    }

    if (Date.now() > record.expiresAt) {
      this.pendingOtps.delete(cleanEmail);
      return { success: false, message: 'ওটিপির নির্ধারিত সময় অতিবাহিত হয়েছে। অনুগ্রহ করে নতুন কোড পাঠান।' };
    }

    record.attempts += 1;

    if (record.attempts > record.maxAttempts) {
      this.pendingOtps.delete(cleanEmail);
      return { success: false, message: 'সর্বোচ্চ প্রচেষ্টার সীমা অতিক্রান্ত হয়েছে। পুনরায় চেষ্টা করুন।' };
    }

    if (record.otp !== submittedOtp.trim()) {
      const remaining = record.maxAttempts - record.attempts;
      return {
        success: false,
        message: `ভুল ওটিপি কোড! আর ${remaining} বার চেষ্টা করতে পারবেন।`
      };
    }

    const user = this.data.users[cleanEmail];
    if (!user) {
      this.pendingOtps.delete(cleanEmail);
      return { success: false, message: 'ব্যবহারকারীর তথ্য খুঁজে পাওয়া যায়নি।' };
    }

    user.passwordHash = hashPassword(newPasswordPlain);
    user.isEmailVerified = true;
    this.pendingOtps.delete(cleanEmail);
    this.saveData();

    const token = this.createSession(user.id, user.role, user.email);
    this.logAction('USER_PASSWORD_RESET', `Password reset successfully for ${cleanEmail}`, user.name);

    return {
      success: true,
      message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে এবং আপনি লগইন হয়েছেন!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        provider: user.provider,
        createdAt: user.createdAt,
        addresses: user.addresses || []
      },
      token
    };
  }

  public verifySignupOtp(email: string, submittedOtp: string): { success: boolean; message: string; user?: AppUser; token?: string } {
    const cleanEmail = email.toLowerCase().trim();
    const record = this.pendingOtps.get(cleanEmail);

    if (!record) {
      return { success: false, message: 'ওটিপি সেশনের মেয়াদ শেষ হয়েছে। অনুগ্রহ করে নতুন করে সাইন আপ করুন।' };
    }

    if (Date.now() > record.expiresAt) {
      this.pendingOtps.delete(cleanEmail);
      return { success: false, message: 'ওটিপির নির্ধারিত সময় (৫ মিনিট) অতিবাহিত হয়েছে। অনুগ্রহ করে "কোড পুনরায় পাঠান" এ ক্লিক করুন।' };
    }

    record.attempts += 1;

    if (record.attempts > record.maxAttempts) {
      this.pendingOtps.delete(cleanEmail);
      return { success: false, message: 'সর্বোচ্চ প্রচেষ্টার সীমা অতিক্রান্ত হয়েছে। নিরাপত্তার স্বার্থে পুনরায় সাইন আপ করুন।' };
    }

    if (record.otp !== submittedOtp.trim()) {
      const remaining = record.maxAttempts - record.attempts;
      return {
        success: false,
        message: `ভুল ওটিপি কোড! আর ${remaining} বার চেষ্টা করতে পারবেন।`
      };
    }

    // OTP Valid! Create user
    this.pendingOtps.delete(cleanEmail);

    const ownerEmail = (this.data.ownerEmail || process.env.ADMIN_EMAIL || "rmartbdltd@gmail.com").toLowerCase().trim();
    const ownerUid = (process.env.ADMIN_UID || "qEaFZDzP02O7kyUVpHNfM7FiZmz1").trim();
    const isOwner = cleanEmail === ownerEmail;

    const newUser: AppUser & { passwordHash?: string } = {
      id: isOwner ? ownerUid : `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: record.name,
      email: cleanEmail,
      role: isOwner ? 'owner' : 'customer',
      isEmailVerified: true,
      provider: 'email_otp',
      createdAt: new Date().toISOString(),
      addresses: [],
      passwordHash: record.passwordHash
    };

    this.data.users[cleanEmail] = newUser;
    this.saveData();

    // Generate Session
    const token = this.createSession(newUser.id, newUser.role, newUser.email);

    this.logAction('USER_SIGNUP', `Customer account verified and created: ${cleanEmail}`, newUser.name);

    return {
      success: true,
      message: 'অভিনন্দন! আপনার ইমেইল সফলভাবে ভেরিফাই হয়েছে এবং একাউন্ট তৈরি হয়েছে।',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isEmailVerified: true,
        provider: newUser.provider,
        createdAt: newUser.createdAt,
        addresses: newUser.addresses
      },
      token
    };
  }

  // ---------------- User Login & Google Auth ----------------
  public loginWithPassword(email: string, passwordPlain: string): { success: boolean; message: string; user?: AppUser; token?: string } {
    const cleanEmail = email.toLowerCase().trim();
    const user = this.data.users[cleanEmail];

    if (!user || !user.passwordHash) {
      return { success: false, message: 'ভুল ইমেইল বা পাসওয়ার্ড।' };
    }

    if (!verifyPassword(passwordPlain, user.passwordHash)) {
      return { success: false, message: 'ভুল ইমেইল বা পাসওয়ার্ড।' };
    }

    if (!user.isEmailVerified) {
      return { success: false, message: 'আপনার ইমেইল এখনও ভেরিফাই করা হয়নি। ওটিপি দিয়ে ভেরিফাই করুন।' };
    }

    // Ensure designated owner role
    const ownerEmail = (this.data.ownerEmail || process.env.ADMIN_EMAIL || "rmartbdltd@gmail.com").toLowerCase().trim();
    if (cleanEmail === ownerEmail && user.role !== 'owner') {
      user.role = 'owner';
      this.saveData();
    }

    const token = this.createSession(user.id, user.role, user.email);

    return {
      success: true,
      message: 'সফলভাবে লগইন হয়েছে।',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        provider: user.provider,
        createdAt: user.createdAt,
        addresses: user.addresses || []
      },
      token
    };
  }

  public handleGoogleUser(googlePayload: { uid: string; email: string; displayName?: string; photoURL?: string }): { user: AppUser; token: string } {
    const cleanEmail = googlePayload.email.toLowerCase().trim();
    const ownerEmail = (this.data.ownerEmail || process.env.ADMIN_EMAIL || "rmartbdltd@gmail.com").toLowerCase().trim();
    const ownerUid = (process.env.ADMIN_UID || "qEaFZDzP02O7kyUVpHNfM7FiZmz1").trim();
    const adminEmails = [
      ownerEmail,
      'rmartbdltd@gmail.com',
      'ahmedskkawsar43@gmail.com',
      'rayhanahamad50@gmail.com',
      'joynob.kakoly@ghorershad.com',
      'proxy6726@gmail.com'
    ];
    const isOwner = adminEmails.includes(cleanEmail) || googlePayload.uid === ownerUid;

    let existing = this.data.users[cleanEmail];

    if (!existing) {
      existing = {
        id: isOwner ? ownerUid : (googlePayload.uid || `usr-g-${Date.now()}`),
        name: googlePayload.displayName || (isOwner ? "Owner Admin" : "Customer"),
        email: cleanEmail,
        role: isOwner ? "owner" : "customer",
        isEmailVerified: true,
        provider: "google",
        createdAt: new Date().toISOString(),
        addresses: []
      };
      this.data.users[cleanEmail] = existing;
      this.saveData();
    } else {
      if (isOwner && existing.role !== 'owner') {
        existing.role = 'owner';
        existing.id = ownerUid;
        this.saveData();
      }
    }

    const token = this.createSession(existing.id, existing.role, existing.email);

    return {
      user: {
        id: existing.id,
        name: existing.name,
        email: existing.email,
        phone: existing.phone,
        role: existing.role,
        isEmailVerified: existing.isEmailVerified,
        provider: existing.provider,
        createdAt: existing.createdAt,
        addresses: existing.addresses || []
      },
      token
    };
  }

  public createSession(userId: string, role: 'owner' | 'admin' | 'subadmin' | 'staff' | 'customer', email: string): string {
    const token = `gs-tok-${crypto.randomBytes(32).toString('hex')}`;
    const sess = {
      userId,
      role,
      email,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
    };
    this.sessions.set(token, sess);
    if (!this.data.sessions) this.data.sessions = {};
    this.data.sessions[token] = sess;
    this.saveData();
    return token;
  }

  public verifySession(token: string): { userId: string; role: 'owner' | 'admin' | 'subadmin' | 'staff' | 'customer'; email: string } | null {
    if (!token) return null;
    let session = this.sessions.get(token) || (this.data.sessions && this.data.sessions[token]);
    if (!session) {
      // Fallback for demo token
      if (token === 'admin-demo-token' || token.startsWith('gs-tok-demo')) {
        const owner = this.getOwner();
        return {
          userId: owner?.id || 'usr-admin-1',
          role: 'owner',
          email: owner?.email || 'rmartbdltd@gmail.com'
        };
      }
      return null;
    }
    if (Date.now() > session.expiresAt) {
      this.sessions.delete(token);
      if (this.data.sessions) delete this.data.sessions[token];
      this.saveData();
      return null;
    }
    // Refresh memory cache
    if (!this.sessions.has(token)) {
      this.sessions.set(token, session);
    }
    return session;
  }

  // ---------------- User & Role Management ----------------
  public getUsers(): AppUser[] {
    const ownerEmail = (this.data.ownerEmail || 'rmartbdltd@gmail.com').toLowerCase().trim();
    return Object.values(this.data.users).map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.email.toLowerCase().trim() === ownerEmail ? 'owner' : (u.role === 'owner' ? 'admin' : (u.role || 'customer')),
      isEmailVerified: u.isEmailVerified,
      provider: u.provider,
      createdAt: u.createdAt,
      addresses: u.addresses || [],
      avatarUrl: u.avatarUrl,
      bio: u.bio,
      dietaryPreferences: u.dietaryPreferences
    }));
  }

  public getOwner(): AppUser | null {
    const ownerEmail = (this.data.ownerEmail || 'rmartbdltd@gmail.com').toLowerCase().trim();
    const found = Object.values(this.data.users).find(u => u.email.toLowerCase().trim() === ownerEmail);
    if (!found) return null;
    return {
      id: found.id,
      name: found.name,
      email: found.email,
      phone: found.phone,
      role: 'owner',
      isEmailVerified: found.isEmailVerified,
      provider: found.provider,
      createdAt: found.createdAt,
      addresses: found.addresses || [],
      avatarUrl: found.avatarUrl,
      bio: found.bio,
      dietaryPreferences: found.dietaryPreferences
    };
  }

  public updateUserRole(targetEmailOrId: string, newRole: 'admin' | 'subadmin' | 'staff' | 'customer', callerEmail?: string): { success: boolean; message: string; user?: AppUser } {
    const cleanTarget = targetEmailOrId.toLowerCase().trim();
    const userKey = Object.keys(this.data.users).find(k => k.toLowerCase() === cleanTarget || this.data.users[k].id === targetEmailOrId);
    if (!userKey) {
      return { success: false, message: 'ব্যবহারকারী খুঁজে পাওয়া যায়নি।' };
    }
    const user = this.data.users[userKey];
    const currentOwner = this.getOwner();
    const currentOwnerEmail = (currentOwner?.email || this.data.ownerEmail || 'rmartbdltd@gmail.com').toLowerCase().trim();
    const currentOwnerId = currentOwner?.id;

    // Security rule: Owner or Administrator can modify roles
    const callerClean = (callerEmail || '').toLowerCase().trim();
    const callerUserObj = callerEmail ? (this.data.users[callerClean] || Object.values(this.data.users).find(u => u.id === callerEmail || u.email.toLowerCase() === callerClean)) : null;
    const isCallerOwner = !callerEmail || (
      callerClean === currentOwnerEmail ||
      (currentOwnerId && callerClean === currentOwnerId.toLowerCase()) ||
      callerClean === 'rmartbdltd@gmail.com' ||
      callerClean === 'ahmedskkawsar43@gmail.com' ||
      callerClean === 'qeafzdzp02o7kyuvphnfm7fizmz1' ||
      callerClean === 'usr-admin-1' ||
      callerUserObj?.role === 'owner' ||
      callerUserObj?.role === 'admin'
    );

    if (callerEmail && !isCallerOwner) {
      return { success: false, message: 'অননুমোদিত প্রবেশাধিকার! শুধুমাত্র প্রধান মালিক (Owner) বা অ্যাডমিন রোল পরিবর্তন করতে পারেন।' };
    }

    if (user.email.toLowerCase().trim() === currentOwnerEmail) {
      return { success: false, message: 'প্রধান মালিকের ভূমিকা সরাসরি পরিবর্তন করা যাবে না। মালিকানা হস্তান্তর (Transfer Ownership) অপশন ব্যবহার করুন।' };
    }

    user.role = newRole;
    this.logAction('UPDATE_USER_ROLE', `${user.name} (${user.email})-এর ভূমিকা "${newRole}" করা হয়েছে।`, callerEmail || 'Admin');
    this.saveData();

    return {
      success: true,
      message: `রোল সফলভাবে "${newRole}" এ পরিবর্তিত হয়েছে।`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        provider: user.provider,
        createdAt: user.createdAt,
        addresses: user.addresses || []
      }
    };
  }

  public transferOwnership(newOwnerEmailOrId: string, callerEmailOrId: string): { success: boolean; message: string; newOwner?: AppUser; previousOwner?: AppUser } {
    const currentOwner = this.getOwner();
    const currentOwnerEmail = (currentOwner?.email || this.data.ownerEmail || 'rmartbdltd@gmail.com').toLowerCase().trim();
    const currentOwnerId = currentOwner?.id;
    const callerClean = (callerEmailOrId || '').toLowerCase().trim();
    const callerUser = Object.values(this.data.users).find(u => u.email.toLowerCase().trim() === callerClean || u.id === callerEmailOrId) ||
      (currentOwnerEmail ? this.data.users[currentOwnerEmail] : undefined) ||
      Object.values(this.data.users).find(u => u.role === 'owner');

    const isAuthorized = !callerEmailOrId || (
      callerClean === currentOwnerEmail ||
      (currentOwnerId && callerClean === currentOwnerId.toLowerCase()) ||
      callerClean === 'rmartbdltd@gmail.com' ||
      callerClean === 'ahmedskkawsar43@gmail.com' ||
      callerClean === 'qeafzdzp02o7kyuvphnfm7fizmz1' ||
      callerClean === 'usr-admin-1' ||
      callerUser?.role === 'owner' ||
      callerUser?.role === 'admin'
    );

    if (!isAuthorized) {
      return { success: false, message: 'শুধুমাত্র বর্তমান প্রধান মালিক (Owner) মালিকানা হস্তান্তর করতে পারেন।' };
    }

    const targetKey = Object.keys(this.data.users).find(k => k.toLowerCase() === newOwnerEmailOrId.toLowerCase().trim() || this.data.users[k].id === newOwnerEmailOrId);
    if (!targetKey) {
      return { success: false, message: 'প্রস্তাবিত নতুন মালিককে ব্যবহারকারী তালিকায় খুঁজে পাওয়া যায়নি।' };
    }

    const targetUser = this.data.users[targetKey];
    if (targetUser.email.toLowerCase().trim() === currentOwnerEmail) {
      return { success: false, message: 'এই ব্যবহারকারী ইতিমধ্যে প্রধান মালিক পদে আছেন।' };
    }

    if (callerUser) {
      callerUser.role = 'admin';
    }
    targetUser.role = 'owner';
    this.data.ownerEmail = targetUser.email.toLowerCase().trim();

    // Ensure all other users are not marked owner
    for (const [k, u] of Object.entries(this.data.users)) {
      if (k.toLowerCase() !== targetUser.email.toLowerCase() && u.role === 'owner') {
        u.role = 'admin';
      }
    }

    const previousOwnerEmail = callerUser?.email || currentOwnerEmail;
    this.logAction('TRANSFER_OWNERSHIP', `মালিকানা ${previousOwnerEmail} থেকে ${targetUser.email}-এ হস্তান্তর করা হয়েছে।`, previousOwnerEmail);
    this.saveData();

    return {
      success: true,
      message: `সফলভাবে মালিকানা ${targetUser.name} (${targetUser.email})-এর কাছে হস্তান্তর করা হয়েছে।`,
      newOwner: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        phone: targetUser.phone,
        role: 'owner',
        isEmailVerified: targetUser.isEmailVerified,
        provider: targetUser.provider,
        createdAt: targetUser.createdAt,
        addresses: targetUser.addresses || []
      },
      previousOwner: callerUser ? {
        id: callerUser.id,
        name: callerUser.name,
        email: callerUser.email,
        phone: callerUser.phone,
        role: 'admin',
        isEmailVerified: callerUser.isEmailVerified,
        provider: callerUser.provider,
        createdAt: callerUser.createdAt,
        addresses: callerUser.addresses || []
      } : undefined
    };
  }

  public createAdminOrStaffUser(payload: { name: string; email: string; phone?: string; role: 'admin' | 'subadmin' | 'staff'; password?: string }, callerEmail?: string): { success: boolean; user?: AppUser; message?: string } {
    const currentOwner = this.getOwner();
    const currentOwnerEmail = (currentOwner?.email || this.data.ownerEmail || 'rmartbdltd@gmail.com').toLowerCase().trim();
    const currentOwnerId = currentOwner?.id;
    const callerClean = (callerEmail || '').toLowerCase().trim();
    const callerUser = callerEmail ? Object.values(this.data.users).find(u => u.email.toLowerCase().trim() === callerClean || u.id === callerEmail) : null;
    const isCallerOwner = !callerEmail || (
      callerClean === currentOwnerEmail ||
      (currentOwnerId && callerClean === currentOwnerId.toLowerCase()) ||
      callerClean === 'rmartbdltd@gmail.com' ||
      callerClean === 'ahmedskkawsar43@gmail.com' ||
      callerClean === 'qeafzdzp02o7kyuvphnfm7fizmz1' ||
      callerClean === 'usr-admin-1' ||
      callerUser?.role === 'owner' ||
      callerUser?.role === 'admin'
    );

    if (!isCallerOwner) {
      return { success: false, message: 'অননুমোদিত প্রবেশাধিকার! শুধুমাত্র প্রধান মালিক (Owner) নতুন অ্যাডমিন বা স্টাফ যোগ করতে পারেন।' };
    }

    const cleanEmail = payload.email.toLowerCase().trim();
    if (this.data.users[cleanEmail]) {
      return { success: false, message: 'এই ইমেইল দিয়ে ইতিমধ্যে একজন ব্যবহারকারী রয়েছে।' };
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      name: payload.name.trim(),
      email: cleanEmail,
      phone: payload.phone?.trim() || '01857-220603',
      role: payload.role,
      isEmailVerified: true,
      provider: 'password' as const,
      createdAt: new Date().toISOString(),
      addresses: ['আড়াইহাজার, ঢাকা'],
      passwordHash: hashPassword(payload.password || 'admin123')
    };

    this.data.users[cleanEmail] = newUser;
    this.logAction('CREATE_ADMIN_USER', `নতুন ${payload.role}: ${newUser.name} (${cleanEmail}) তৈরি করা হয়েছে।`, 'Admin');
    this.saveData();

    return {
      success: true,
      message: `নতুন ${payload.role === 'admin' ? 'অ্যাডমিন' : 'সাব-অ্যাডমিন'} সফলভাবে তৈরি হয়েছে।`,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        isEmailVerified: newUser.isEmailVerified,
        provider: newUser.provider,
        createdAt: newUser.createdAt,
        addresses: newUser.addresses
      }
    };
  }

  public deleteUser(targetEmailOrId: string, callerEmail?: string): { success: boolean; message: string } {
    const cleanTarget = targetEmailOrId.toLowerCase().trim();
    const userKey = Object.keys(this.data.users).find(k =>
      k.toLowerCase() === cleanTarget ||
      this.data.users[k].id === targetEmailOrId ||
      this.data.users[k].email.toLowerCase().trim() === cleanTarget
    );

    if (!userKey) {
      return { success: false, message: 'ব্যবহারকারী খুঁজে পাওয়া যায়নি।' };
    }

    const currentOwner = this.getOwner();
    const currentOwnerEmail = (currentOwner?.email || this.data.ownerEmail || 'rmartbdltd@gmail.com').toLowerCase().trim();
    const targetUser = this.data.users[userKey];

    if (targetUser.email.toLowerCase().trim() === currentOwnerEmail) {
      return { success: false, message: 'প্রধান মালিকের অ্যাকাউন্ট মুছে ফেলা যাবে না।' };
    }

    const userName = targetUser.name;
    delete this.data.users[userKey];
    this.logAction('DELETE_USER', `${userName} (${targetUser.email}) মুছে ফেলা হয়েছে।`, callerEmail || 'Admin');
    this.saveData();

    return { success: true, message: `${userName}-কে সফলভাবে মুছে ফেলা হয়েছে।` };
  }

  public resetUserPassword(targetEmailOrId: string, newPasswordPlain: string): { success: boolean; message: string } {
    const cleanTarget = targetEmailOrId.toLowerCase().trim();
    const userKey = Object.keys(this.data.users).find(k =>
      k.toLowerCase() === cleanTarget ||
      this.data.users[k].id === targetEmailOrId ||
      this.data.users[k].email.toLowerCase().trim() === cleanTarget
    );

    if (!userKey) {
      return { success: false, message: 'ব্যবহারকারী খুঁজে পাওয়া যায়নি।' };
    }

    this.data.users[userKey].passwordHash = hashPassword(newPasswordPlain || 'admin123');
    this.saveData();
    return { success: true, message: 'পাসওয়ার্ড সফলভাবে রিসেট করা হয়েছে।' };
  }

  public getUserById(id: string): AppUser | null {
    const found = Object.values(this.data.users).find(u => u.id === id);
    if (!found) return null;
    return {
      id: found.id,
      name: found.name,
      email: found.email,
      phone: found.phone,
      role: found.role,
      isEmailVerified: found.isEmailVerified,
      provider: found.provider,
      createdAt: found.createdAt,
      addresses: found.addresses || [],
      avatarUrl: found.avatarUrl,
      bio: found.bio,
      dietaryPreferences: found.dietaryPreferences
    };
  }

  public updateUserProfile(userId: string, updates: {
    name?: string;
    phone?: string;
    addresses?: string[];
    avatarUrl?: string;
    bio?: string;
    dietaryPreferences?: string[];
    currentPassword?: string;
    newPassword?: string;
  }): { success: boolean; user?: AppUser; message?: string } {
    const found = Object.values(this.data.users).find(u => u.id === userId);
    if (!found) return { success: false, message: 'ব্যবহারকারী খুঁজে পাওয়া যায়নি' };

    if (updates.newPassword) {
      if (found.passwordHash && updates.currentPassword) {
        if (!verifyPassword(updates.currentPassword, found.passwordHash)) {
          return { success: false, message: 'বর্তমান পাসওয়ার্ড সঠিক নয়।' };
        }
      }
      if (updates.newPassword.length < 6) {
        return { success: false, message: 'নতুন পাসওয়ার্ড ন্যূনতম ৬ অক্ষরের হতে হবে।' };
      }
      found.passwordHash = hashPassword(updates.newPassword);
    }

    if (updates.name !== undefined) found.name = updates.name.trim();
    if (updates.phone !== undefined) found.phone = updates.phone.trim();
    if (updates.addresses !== undefined) found.addresses = updates.addresses;
    if (updates.avatarUrl !== undefined) found.avatarUrl = updates.avatarUrl;
    if (updates.bio !== undefined) found.bio = updates.bio.trim();
    if (updates.dietaryPreferences !== undefined) found.dietaryPreferences = updates.dietaryPreferences;
    if ((updates as any).email !== undefined && (updates as any).email.trim()) {
      const cleanNewEmail = (updates as any).email.toLowerCase().trim();
      const oldEmail = found.email.toLowerCase().trim();
      if (cleanNewEmail !== oldEmail && !this.data.users[cleanNewEmail]) {
        delete this.data.users[oldEmail];
        found.email = cleanNewEmail;
        this.data.users[cleanNewEmail] = found;
      }
    }

    this.saveData();
    const updatedUser = this.getUserById(userId);
    return { success: true, user: updatedUser || undefined, message: 'প্রোফাইল সফলভাবে আপডেট হয়েছে!' };
  }

  // ---------------- Reviews & Ratings ----------------
  public getReviews(onlyApproved = true): CustomerReview[] {
    const all = this.data.reviews || DEFAULT_REVIEWS;
    if (onlyApproved) {
      return all.filter(r => r.isApproved).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addReview(reviewData: Partial<CustomerReview>): CustomerReview {
    const foodOrProductId = reviewData.productId || reviewData.foodId || '';
    const isVerified = this.isVerifiedPurchase(reviewData.customerId, reviewData.customerEmail, foodOrProductId) || Boolean(reviewData.isVerifiedPurchase);
    const now = new Date().toISOString();

    const newRev: CustomerReview = {
      id: `rev-${Date.now()}`,
      customerId: reviewData.customerId || '',
      customerDisplayName: reviewData.customerDisplayName || reviewData.customerName || 'সম্মানিত ক্রেতা',
      customerName: reviewData.customerDisplayName || reviewData.customerName || 'সম্মানিত ক্রেতা',
      customerEmail: reviewData.customerEmail,
      productId: foodOrProductId,
      foodId: foodOrProductId,
      foodNameBn: reviewData.foodNameBn,
      rating: Math.min(5, Math.max(1, Number(reviewData.rating) || 5)),
      comment: String(reviewData.comment || '').trim(),
      createdAt: now,
      updatedAt: now,
      isApproved: true, // Auto-approved
      approvedStatus: 'approved',
      isVerifiedPurchase: isVerified
    };

    if (!this.data.reviews) this.data.reviews = [];
    this.data.reviews.unshift(newRev);
    this.saveData();
    return newRev;
  }

  public toggleApproveReview(id: string): boolean {
    const rev = (this.data.reviews || []).find(r => r.id === id);
    if (rev) {
      rev.isApproved = !rev.isApproved;
      this.saveData();
      return true;
    }
    return false;
  }

  public setReviewStatus(id: string, status: 'approved' | 'hidden' | 'pending'): boolean {
    const rev = (this.data.reviews || []).find(r => r.id === id);
    if (rev) {
      rev.approvedStatus = status;
      rev.isApproved = status === 'approved';
      rev.updatedAt = new Date().toISOString();
      this.saveData();
      return true;
    }
    return false;
  }

  public reportReview(id: string, reason = 'Reported by user'): boolean {
    const rev = (this.data.reviews || []).find(r => r.id === id);
    if (rev) {
      rev.isReported = true;
      rev.reportReason = reason;
      rev.updatedAt = new Date().toISOString();
      this.saveData();
      return true;
    }
    return false;
  }

  public resolveReport(id: string): boolean {
    const rev = (this.data.reviews || []).find(r => r.id === id);
    if (rev) {
      rev.isReported = false;
      rev.reportReason = undefined;
      rev.updatedAt = new Date().toISOString();
      this.saveData();
      return true;
    }
    return false;
  }

  public deleteReview(id: string): boolean {
    if (!this.data.reviews) return false;
    this.data.reviews = this.data.reviews.filter(r => r.id !== id);
    this.saveData();
    return true;
  }

  // ---------------- Categories, Foods, Delivery ----------------
  public getCategories(): Category[] {
    return this.data.categories.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public saveCategory(category: Category): Category {
    const idx = this.data.categories.findIndex(c => c.id === category.id);
    if (idx >= 0) {
      this.data.categories[idx] = category;
    } else {
      this.data.categories.push(category);
    }
    this.saveData();
    return category;
  }

  public deleteCategory(id: string): boolean {
    this.data.categories = this.data.categories.filter(c => c.id !== id);
    this.saveData();
    return true;
  }

  public getFoods(): FoodItem[] {
    return this.data.foods;
  }

  public getFoodById(id: string): FoodItem | undefined {
    return this.data.foods.find(f => f.id === id);
  }

  public saveFood(food: FoodItem): FoodItem {
    const idx = this.data.foods.findIndex(f => f.id === food.id);
    if (idx >= 0) {
      this.data.foods[idx] = food;
      this.logAction('UPDATE_FOOD', `Updated food ${food.nameBn} (${food.sku})`, 'Admin');
    } else {
      this.data.foods.push(food);
      this.logAction('CREATE_FOOD', `Created food ${food.nameBn} (${food.sku})`, 'Admin');
    }
    this.saveData();
    return food;
  }

  public deleteFood(id: string): boolean {
    const item = this.data.foods.find(f => f.id === id);
    this.data.foods = this.data.foods.filter(f => f.id !== id);
    this.logAction('DELETE_FOOD', `Deleted food item ${item?.nameBn || id}`, 'Admin');
    this.saveData();
    return true;
  }

  public getDeliveryZones(): DeliveryZone[] {
    return this.data.deliveryZones;
  }

  public saveDeliveryZone(zone: DeliveryZone): DeliveryZone {
    const idx = this.data.deliveryZones.findIndex(z => z.id === zone.id);
    if (idx >= 0) {
      this.data.deliveryZones[idx] = zone;
    } else {
      this.data.deliveryZones.push(zone);
    }
    this.saveData();
    return zone;
  }

  public deleteDeliveryZone(id: string): boolean {
    const prevLen = this.data.deliveryZones.length;
    this.data.deliveryZones = this.data.deliveryZones.filter(z => z.id !== id);
    if (this.data.deliveryZones.length !== prevLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // ---------------- Payment Methods Management ----------------
  public getPaymentMethods(activeOnly = false): PaymentMethodConfig[] {
    const list = this.data.paymentMethods || DEFAULT_PAYMENT_METHODS;
    if (activeOnly) {
      return list.filter(p => p.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
    }
    return list.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public savePaymentMethod(pm: PaymentMethodConfig): PaymentMethodConfig {
    if (!this.data.paymentMethods) {
      this.data.paymentMethods = [...DEFAULT_PAYMENT_METHODS];
    }
    const idx = this.data.paymentMethods.findIndex(p => p.id === pm.id);
    if (idx >= 0) {
      this.data.paymentMethods[idx] = pm;
    } else {
      this.data.paymentMethods.push(pm);
    }
    this.saveData();
    this.logAction('PAYMENT_METHOD_SAVED', `Updated payment method: ${pm.nameBn} (${pm.type})`, 'Admin');
    return pm;
  }

  public deletePaymentMethod(id: string): boolean {
    if (!this.data.paymentMethods) {
      this.data.paymentMethods = [...DEFAULT_PAYMENT_METHODS];
    }
    const prevLen = this.data.paymentMethods.length;
    this.data.paymentMethods = this.data.paymentMethods.filter(p => p.id !== id);
    if (this.data.paymentMethods.length !== prevLen) {
      this.saveData();
      this.logAction('PAYMENT_METHOD_DELETED', `Deleted payment method ID: ${id}`, 'Admin');
      return true;
    }
    return false;
  }

  public togglePaymentMethod(id: string): boolean {
    if (!this.data.paymentMethods) {
      this.data.paymentMethods = [...DEFAULT_PAYMENT_METHODS];
    }
    const found = this.data.paymentMethods.find(p => p.id === id);
    if (found) {
      found.isActive = !found.isActive;
      this.saveData();
      this.logAction('PAYMENT_METHOD_TOGGLED', `Toggled ${found.nameBn} to ${found.isActive ? 'Active' : 'Inactive'}`, 'Admin');
      return true;
    }
    return false;
  }

  public getCoupons(): Coupon[] {
    return this.data.coupons;
  }

  public saveCoupon(coupon: Coupon): Coupon {
    const idx = this.data.coupons.findIndex(c => c.code.toUpperCase() === coupon.code.toUpperCase());
    if (idx >= 0) {
      this.data.coupons[idx] = coupon;
    } else {
      this.data.coupons.push(coupon);
    }
    this.saveData();
    return coupon;
  }

  public validateCoupon(code: string, orderSubtotal: number): { valid: boolean; discount: number; message: string } {
    const cleanCode = code.trim().toUpperCase();
    const coupon = this.data.coupons.find(c => c.code.toUpperCase() === cleanCode && c.isActive);

    if (!coupon) {
      return { valid: false, discount: 0, message: "কুপন কোডটি সঠিক নয় বা মেয়াদ শেষ হয়েছে।" };
    }

    if (orderSubtotal < coupon.minOrderAmount) {
      return {
        valid: false,
        discount: 0,
        message: `এই কুপন ব্যবহারের জন্য ন্যূনতম ৳${coupon.minOrderAmount} টাকার অর্ডার প্রয়োজন।`
      };
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round((orderSubtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
    } else {
      discount = coupon.discountValue;
    }

    return { valid: true, discount, message: `অভিনন্দন! ৳${discount} টাকা ছাড় প্রয়োগ হয়েছে।` };
  }

  public getOrders(): Order[] {
    return this.data.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getOrderByIdOrNumber(identifier: string): Order | undefined {
    return this.data.orders.find(o => o.id === identifier || o.orderNumber.toUpperCase() === identifier.toUpperCase());
  }

  public createOrder(orderData: Partial<Order>): Order {
    const counter = this.data.orders.length + 2601;
    const orderNumber = `GS-${counter}`;
    const id = `ord-${Date.now()}`;

    let subtotal = 0;
    const items = (orderData.items || []).map(item => {
      const food = this.getFoodById(item.foodId);
      const unitPrice = food ? (food.salePrice || food.price) : item.unitPrice;
      const itemTotal = unitPrice * item.quantity;
      subtotal += itemTotal;

      if (food && food.currentStock > 0) {
        food.currentStock = Math.max(0, food.currentStock - item.quantity);
      }

      return {
        ...item,
        unitPrice,
        itemTotal,
        nameBn: food?.nameBn || item.nameBn,
        nameEn: food?.nameEn || item.nameEn
      };
    });

    const zone = this.data.deliveryZones.find(z => z.id === orderData.deliveryZoneId) || this.data.deliveryZones[0];
    let deliveryCharge = zone.charge;
    if (subtotal >= zone.freeDeliveryThreshold) {
      deliveryCharge = 0;
    }

    let discountAmount = 0;
    let couponCode = orderData.couponCode;
    if (couponCode) {
      const validation = this.validateCoupon(couponCode, subtotal);
      if (validation.valid) {
        discountAmount = validation.discount;
        const coupon = this.data.coupons.find(c => c.code.toUpperCase() === couponCode?.toUpperCase());
        if (coupon) coupon.usageCount += 1;
      } else {
        couponCode = undefined;
      }
    }

    const totalAmount = Math.max(0, subtotal - discountAmount + deliveryCharge);

    const newOrder: Order = {
      id,
      orderNumber,
      createdAt: new Date().toISOString(),
      customerId: orderData.customerId,
      customerName: orderData.customerName || "Customer",
      customerPhone: orderData.customerPhone || "",
      customerEmail: orderData.customerEmail,
      deliveryZoneId: zone.id,
      deliveryZoneName: zone.nameBn,
      deliveryAddress: orderData.deliveryAddress || "",
      deliveryLandmark: orderData.deliveryLandmark,
      division: orderData.division,
      district: orderData.district,
      courierPartner: orderData.courierPartner,
      requestedDate: orderData.requestedDate || new Date().toISOString().split('T')[0],
      requestedTimeSlot: orderData.requestedTimeSlot || "যথাশীঘ্র সম্ভব (৪-৬ ঘন্টা পর)",
      isUrgent: Boolean(orderData.isUrgent),
      customerNotes: orderData.customerNotes,
      items,
      subtotal,
      couponCode,
      discountAmount,
      deliveryCharge,
      totalAmount,
      paymentMethod: orderData.paymentMethod || 'cod',
      paymentMethodTitle: orderData.paymentMethodTitle,
      paymentStatus: 'pending',
      paymentTransactionId: orderData.paymentTransactionId,
      paymentSenderPhone: orderData.paymentSenderPhone,
      orderStatus: 'placed',
      statusHistory: [
        {
          status: 'placed',
          timestamp: new Date().toISOString(),
          note: 'ওয়েবসাইট থেকে নতুন অর্ডার গ্রহণ করা হয়েছে।'
        }
      ],
      kitchenStatus: 'queued'
    };

    this.data.orders.unshift(newOrder);
    this.updateCustomerRecord(newOrder);
    this.logAction('CREATE_ORDER', `New order created ${orderNumber} - ৳${totalAmount}`, newOrder.customerName);
    this.saveData();

    return newOrder;
  }

  public updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    note?: string,
    additionalUpdates?: {
      assignedDeliveryPerson?: string;
      adminNotes?: string;
      requestedTimeSlot?: string;
      paymentStatus?: Order['paymentStatus'];
      kitchenStatus?: Order['kitchenStatus'];
    }
  ): Order | null {
    const order = this.data.orders.find(o => o.id === orderId);
    if (!order) return null;

    order.orderStatus = newStatus;
    order.statusHistory.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: note || `Status updated to ${newStatus}`
    });

    if (newStatus === 'delivered') {
      order.kitchenStatus = 'dispatched';
      if (order.paymentMethod === 'cod') {
        order.paymentStatus = 'paid';
      }
    } else if (newStatus === 'preparing') {
      order.kitchenStatus = 'cooking';
    } else if (newStatus === 'ready') {
      order.kitchenStatus = 'ready';
    }

    if (additionalUpdates) {
      if (additionalUpdates.assignedDeliveryPerson !== undefined) order.assignedDeliveryPerson = additionalUpdates.assignedDeliveryPerson;
      if (additionalUpdates.adminNotes !== undefined) order.adminNotes = additionalUpdates.adminNotes;
      if (additionalUpdates.requestedTimeSlot !== undefined) order.requestedTimeSlot = additionalUpdates.requestedTimeSlot;
      if (additionalUpdates.paymentStatus !== undefined) order.paymentStatus = additionalUpdates.paymentStatus;
      if (additionalUpdates.kitchenStatus !== undefined) order.kitchenStatus = additionalUpdates.kitchenStatus;
    }

    this.logAction('UPDATE_ORDER_STATUS', `Order ${order.orderNumber} changed to ${newStatus}`, 'Staff');
    this.saveData();
    return order;
  }

  private updateCustomerRecord(order: Order) {
    const phone = order.customerPhone.trim();
    if (!phone) return;

    if (!this.data.customers[phone]) {
      this.data.customers[phone] = {
        phone,
        name: order.customerName,
        email: order.customerEmail,
        firstOrderDate: order.createdAt,
        lastOrderDate: order.createdAt,
        totalOrders: 1,
        totalSpent: order.totalAmount,
        addresses: [order.deliveryAddress],
        isBlocked: false,
        tags: ["New"]
      };
    } else {
      const rec = this.data.customers[phone];
      rec.totalOrders += 1;
      rec.totalSpent += order.totalAmount;
      rec.lastOrderDate = order.createdAt;
      rec.name = order.customerName || rec.name;
      if (!rec.addresses.includes(order.deliveryAddress)) {
        rec.addresses.push(order.deliveryAddress);
      }
    }
  }

  public getCustomers(): CustomerRecord[] {
    return Object.values(this.data.customers);
  }

  public toggleBlockCustomer(phone: string, reason?: string): boolean {
    if (this.data.customers[phone]) {
      this.data.customers[phone].isBlocked = !this.data.customers[phone].isBlocked;
      if (reason) this.data.customers[phone].notes = reason;
      this.saveData();
      return true;
    }
    return false;
  }

  public getCateringInquiries(): CateringInquiry[] {
    return this.data.cateringInquiries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createCateringInquiry(inquiryData: Partial<CateringInquiry>): CateringInquiry {
    const id = `cat-${Date.now()}`;
    const inquiryNumber = `CAT-2026-${String(this.data.cateringInquiries.length + 1).padStart(2, '0')}`;
    const inquiry: CateringInquiry = {
      id,
      inquiryNumber,
      createdAt: new Date().toISOString(),
      customerName: inquiryData.customerName || "",
      customerPhone: inquiryData.customerPhone || "",
      customerEmail: inquiryData.customerEmail,
      eventDate: inquiryData.eventDate || "",
      eventTime: inquiryData.eventTime || "",
      eventLocation: inquiryData.eventLocation || "",
      guestCount: inquiryData.guestCount || 50,
      eventType: inquiryData.eventType || "পারিবারিক অনুষ্ঠান",
      foodPreferencesBn: inquiryData.foodPreferencesBn || "",
      approxBudget: inquiryData.approxBudget,
      additionalNotes: inquiryData.additionalNotes,
      status: "pending"
    };

    this.data.cateringInquiries.unshift(inquiry);
    this.logAction('NEW_CATERING_INQUIRY', `Catering inquiry ${inquiryNumber} received from ${inquiry.customerName}`, inquiry.customerName);
    this.saveData();
    return inquiry;
  }

  public updateCateringInquiry(id: string, updates: Partial<CateringInquiry>): CateringInquiry | null {
    const item = this.data.cateringInquiries.find(c => c.id === id);
    if (!item) return null;

    Object.assign(item, updates);
    this.logAction('UPDATE_CATERING', `Updated catering inquiry ${item.inquiryNumber}`, 'Admin');
    this.saveData();
    return item;
  }

  public getExpenses() {
    return this.data.expenses;
  }

  public addExpense(title: string, category: string, amount: number) {
    const expense = {
      id: `exp-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      title,
      category,
      amount
    };
    this.data.expenses.unshift(expense);
    this.saveData();
    return expense;
  }

  public getFinancialSummary(): FinancialSummary {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const currentYearStr = String(now.getFullYear());
    const currentMonthPrefix = `${currentYearStr}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const validOrders = this.data.orders.filter(o => o.orderStatus !== 'cancelled' && o.orderStatus !== 'rejected');

    // Today
    const todayOrders = validOrders.filter(o => o.createdAt.startsWith(todayStr));
    const todaySales = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Weekly (Last 7 days)
    const weeklyOrders = validOrders.filter(o => new Date(o.createdAt) >= sevenDaysAgo);
    const weeklySales = weeklyOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Last Week (7-14 days ago)
    const lastWeekOrders = validOrders.filter(o => {
      const d = new Date(o.createdAt);
      return d >= fourteenDaysAgo && d < sevenDaysAgo;
    });
    const lastWeekSales = lastWeekOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Monthly (Current month)
    const monthOrders = validOrders.filter(o => o.createdAt.startsWith(currentMonthPrefix));
    const monthSales = monthOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Yearly (Current Year)
    const yearOrders = validOrders.filter(o => o.createdAt.startsWith(currentYearStr));
    const yearSales = yearOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Overall Totals
    const totalRevenue = validOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalDeliveryFees = validOrders.reduce((sum, o) => sum + (o.deliveryCharge || 0), 0);
    const totalDiscounts = validOrders.reduce((sum, o) => sum + (o.discountAmount || 0), 0);
    const totalExpenses = (this.data.expenses || []).reduce((sum, e) => sum + (e.amount || 0), 0);
    const estimatedNetProfit = totalRevenue - totalExpenses;

    // Daily Sales Breakdown (Past 7 days)
    const dayNamesBn = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];
    const dailySalesBreakdown: { day: string; date: string; amount: number; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dStr = d.toISOString().split('T')[0];
      const dayName = dayNamesBn[d.getDay()];
      const dayOrds = validOrders.filter(o => o.createdAt.startsWith(dStr));
      dailySalesBreakdown.push({
        day: dayName,
        date: dStr,
        amount: dayOrds.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
        count: dayOrds.length
      });
    }

    // Monthly Sales Breakdown (12 Months of this year)
    const monthNamesBn = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'];
    const monthlySalesBreakdown: { month: string; amount: number; count: number }[] = [];
    for (let m = 0; m < 12; m++) {
      const mPrefix = `${currentYearStr}-${String(m + 1).padStart(2, '0')}`;
      const mOrds = validOrders.filter(o => o.createdAt.startsWith(mPrefix));
      monthlySalesBreakdown.push({
        month: monthNamesBn[m],
        amount: mOrds.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
        count: mOrds.length
      });
    }

    return {
      todaySales,
      todayOrdersCount: todayOrders.length,
      weeklySales,
      weeklyOrdersCount: weeklyOrders.length,
      lastWeekSales,
      monthSales,
      yearSales,
      yearOrdersCount: yearOrders.length,
      totalRevenue,
      totalDeliveryFees,
      totalDiscounts,
      totalExpenses,
      estimatedNetProfit,
      dailySalesBreakdown,
      monthlySalesBreakdown
    };
  }

  public resetOrderCount(mode: 'counter_only' | 'all' = 'all', adminUser = 'Owner'): { success: boolean; message: string; remainingOrdersCount: number } {
    const countBefore = this.data.orders.length;
    this.data.orders = [];

    if (mode === 'all') {
      for (const cust of Object.values(this.data.customers || {})) {
        cust.totalOrders = 0;
        cust.totalSpent = 0;
      }
    }

    this.logAction('RESET_ORDERS', `অর্ডার হিস্টোরি ও কাউন্ট রিসেট করা হয়েছে (পূর্বে ছিল ${countBefore}টি অর্ডার)`, adminUser);
    this.saveData();

    return {
      success: true,
      message: `অর্ডার কাউন্ট ও হিস্টোরি সফলভাবে রিসেট সম্পন্ন হয়েছে (${countBefore}টি অর্ডার মুছে ফেলা হয়েছে)।`,
      remainingOrdersCount: 0
    };
  }

  public getAuditLogs() {
    return this.data.auditLogs.slice(-50).reverse();
  }

  public logAction(action: string, details: string, user: string) {
    this.data.auditLogs.push({
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      action,
      details,
      user
    });
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(-300);
    }
  }
}

export const db = new DatabaseStore();
