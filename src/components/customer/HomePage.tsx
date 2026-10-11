import React from 'react';
import { ArrowRight, Clock, ShieldCheck, MapPin, Sparkles, Phone, MessageSquare, UtensilsCrossed, CheckCircle2 } from 'lucide-react';
import { BusinessConfig, Category, FoodItem } from '../../types/index.ts';
import { FoodCard } from './FoodCard.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { LanguageToggle } from '../common/LanguageToggle.tsx';
import { BrandLogo } from '../common/BrandLogo.tsx';

interface HomePageProps {
  config: BusinessConfig;
  categories: Category[];
  foods: FoodItem[];
  onNavigate: (page: string, categoryId?: string) => void;
  onSelectFood: (food: FoodItem) => void;
  onQuickAdd: (food: FoodItem) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  config,
  categories,
  foods,
  onNavigate,
  onSelectFood,
  onQuickAdd
}) => {
  const { language, t } = useLanguage();
  const featuredFoods = foods.filter(f => f.isFeatured || f.isBestseller).slice(0, 6);
  const platterFoods = foods.filter(f => f.categoryId === 'platters-combos').slice(0, 3);
  const cleanPhone = config.whatsapp.replace(/[^0-9]/g, '');

  return (
    <div className="bg-white min-h-screen text-left">
      {/* 1. HERO SECTION (With English / Bangla Switcher & Bilingual Typography) */}
      <section className="relative bg-gradient-to-b from-[#F8F9F7] via-white to-white border-b border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-18">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Content Column (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Badges & Language Toggle Row */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-100/70 pl-2 pr-3.5 py-1.5 rounded-full border border-emerald-200/60 shadow-2xs">
                  <BrandLogo size="xs" className="ring-1 ring-emerald-600/30" />
                  <span>
                    {language === 'en'
                      ? `${config.brandNameEn} • ${config.taglineEn} • Araihazar, Dhaka`
                      : `${config.brandNameBn} • ${config.taglineBn} • ${config.primaryLocation}`}
                  </span>
                </div>

                {/* Direct Language Switcher in Hero */}
                <LanguageToggle variant="hero" />
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.18] text-balance">
                {t('heroHeadlinePrefix', 'ঘরের রান্নার ভালোবাসা,', 'Homemade Love & Fresh Taste,')}{' '}
                <span className="text-emerald-700">
                  {t('heroHeadlineHighlight', 'এবার আপনার দোরগোড়ায়', 'Delivered Right to Your Doorstep')}
                </span>
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
                {t('heroSubtitle')}
              </p>

              {/* Genuine Advance Order Advisory Box */}
              <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex items-start gap-3.5 max-w-xl">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="text-xs text-slate-700 space-y-1">
                  <span className="font-bold text-slate-900 block text-xs sm:text-sm">
                    {t('heroAdvanceTitle')}
                  </span>
                  <p className="leading-relaxed text-slate-600">
                    {t('heroAdvanceDesc')}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <button
                  onClick={() => onNavigate('menu')}
                  className="px-7 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl transition-all shadow-sm hover:shadow-md flex items-center gap-2 group cursor-pointer"
                >
                  <span>{t('viewMenuBtn', 'মেনু দেখুন', 'View Menu')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => onNavigate('catering')}
                  className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-sm rounded-xl transition-colors cursor-pointer"
                >
                  {t('learnCateringBtn', 'ক্যাটারিং সম্পর্কে জানুন', 'Learn About Catering')}
                </button>
              </div>

              {/* Highlights */}
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t('freshCooking')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t('pureIngredients')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t('localDelivery')}</span>
                </div>
              </div>
            </div>

            {/* Right Media Column (5 cols) */}
            <div className="lg:col-span-5 relative">
              {/* Floating Verified Brand Seal */}
              <div className="absolute -top-4 -left-4 sm:-top-5 sm:-left-5 bg-white p-1 rounded-full shadow-xl border border-emerald-100 z-20 hidden sm:block">
                <BrandLogo size="lg" className="ring-2 ring-emerald-600/30 shadow-sm" />
              </div>

              <div className="relative aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border border-slate-200/80 bg-slate-100 group">
                <img
                  src="/src/assets/images/hero_ghorer_shad_feast_1791709454258.jpg"
                  alt={language === 'en' ? 'Ghorer Shad Authentic Feast' : 'ঘরের স্বাদ ঐতিহ্যবাহী বাংলা ভোজ'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/75 via-slate-900/20 to-transparent flex items-end p-6">
                  <div className="text-white space-y-1">
                    <span className="text-xs font-semibold text-emerald-300 block uppercase tracking-wider">
                      {t('specialFeastTag')}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold leading-snug">
                      {t('specialFeastTitle')}
                    </h3>
                    <p className="text-xs text-slate-200">
                      {language === 'en' ? 'Araihazar, Dhaka • Hotline:' : 'আড়াইহাজার, ঢাকা • যোগাযোগ:'} {config.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mini Food Card Overlay Badge */}
              <div className="hidden sm:flex absolute -bottom-5 -left-5 bg-white p-3.5 rounded-2xl shadow-lg border border-slate-200/90 items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                  <img
                    src="/src/assets/images/food_ilish_bhapa_fish_1791709467165.jpg"
                    alt="ইলিশ মাছ"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    {t('specialIlishTag')}
                  </span>
                  <span className="text-[11px] text-emerald-700 font-semibold block">
                    {t('specialIlishDesc')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Menu Categories Grid */}
      <section className="py-14 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-emerald-700 font-semibold text-xs uppercase tracking-wider block mb-1">
                {t('menuCategoriesTitle')}
              </span>
              <h2 className="text-2xl font-bold text-slate-900">
                {t('pickFavoriteTitle')}
              </h2>
            </div>
            <button
              onClick={() => onNavigate('menu')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group cursor-pointer"
            >
              <span>{t('viewAllFoods')}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => onNavigate('menu', cat.id)}
                className="p-4 rounded-xl border border-slate-200/80 hover:border-emerald-600 hover:shadow-xs transition-all text-left bg-white group flex flex-col justify-between cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm mb-3 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                    {language === 'en' && cat.nameEn ? cat.nameEn : cat.nameBn}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                    {cat.descriptionBn}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Featured & Bestseller Foods Grid */}
      <section className="py-16 bg-[#F8F9F7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-emerald-700 font-semibold text-xs uppercase tracking-wider block mb-1">
                {t('customerFavoritesTag')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                {t('popularFoodsTitle')}
              </h2>
            </div>
            <button
              onClick={() => onNavigate('menu')}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {t('browseFullMenu')}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {featuredFoods.map(food => (
              <FoodCard
                key={food.id}
                food={food}
                onSelect={onSelectFood}
                onQuickAdd={onQuickAdd}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Food Platters & Family Packages Spotlight */}
      {platterFoods.length > 0 && (
        <section className="py-16 bg-white border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-emerald-800 rounded-2xl text-white p-8 sm:p-12 relative overflow-hidden mb-10 shadow-lg">
              <div className="max-w-2xl space-y-4">
                <span className="text-emerald-300 font-semibold text-xs tracking-wider uppercase">
                  {t('familySpecialTag')}
                </span>
                <h2 className="text-2xl sm:text-4xl font-bold leading-tight">
                  {t('plattersTitle')}
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
                  {t('plattersDesc')}
                </p>
                <button
                  onClick={() => onNavigate('platters')}
                  className="mt-2 px-6 py-3 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  {t('viewAllPlatters')}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {platterFoods.map(food => (
                <FoodCard
                  key={food.id}
                  food={food}
                  onSelect={onSelectFood}
                  onQuickAdd={onQuickAdd}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Service Areas in Araihazar & Delivery Commitment */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-5">
              <span className="text-emerald-700 font-semibold text-xs uppercase tracking-wider block">
                {t('deliveryAreasTag')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                {t('deliveryAreasTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t('deliveryAreasDesc')}
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs text-slate-700 pt-2">
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{language === 'en' ? 'Araihazar Sadar & Pourashava' : 'আড়াইহাজার সদর ও পৌরসভা'}</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{language === 'en' ? 'Duptara Union' : 'দুপতারা ইউনিয়ন'}</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{language === 'en' ? 'Gopaldi Bazar & Pourashava' : 'গোপালদী পৌরসভা ও বাজার'}</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{language === 'en' ? 'Uchitpur (Meghna Ghat Road)' : 'উচিতপুর (মেঘনা ঘাট রোড)'}</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{language === 'en' ? 'Brahmandi & Mahmudpur' : 'ব্রাহ্মন্দী ও মাহমুদপুর'}</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{language === 'en' ? 'Satgram & Bishnandi' : 'সাতগ্রাম ও বিশনন্দী'}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 bg-[#F8F9F7] p-6 sm:p-8 rounded-2xl border border-slate-200/80 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">
                {t('whyUnique')}
              </h3>
              <div className="space-y-3.5 text-xs text-slate-700">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">
                      {language === 'en' ? '100% Pure Spices & Oil' : '১০০% খাঁটি ঘরোয়া মশলা ও তেল'}
                    </span>
                    <span>
                      {language === 'en'
                        ? 'No artificial flavors, tasting salt, or harmful coloring agents are used.'
                        : 'কোনো কৃত্রিম ফ্লেভার, টেস্টিং সল্ট বা ক্ষতিকর রং ব্যবহার করা হয় না।'}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">
                      {language === 'en' ? 'Cooked Fresh After Order' : 'অর্ডারের পর তাজা রান্না'}
                    </span>
                    <span>
                      {language === 'en'
                        ? 'We never preserve cooked food. Preparation starts fresh directly after your order.'
                        : 'আমরা কোনো রান্না করা খাবার জমিয়ে রাখি না, অর্ডারের পর সরাসরি রান্না শুরু হয়।'}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <UtensilsCrossed className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">
                      {language === 'en' ? 'Hygienic Food-Grade Packaging' : 'পরিচ্ছন্ন ফুড-গ্রেড প্যাকেজিং'}
                    </span>
                    <span>
                      {language === 'en'
                        ? 'Premium sealed food-grade containers and foil to keep meals hot and fresh.'
                        : 'খাবার গরম ও তাজা রাখতে প্রিমিয়াম সিলড বক্স ও ফয়েল পেপার ব্যবহার করা হয়।'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {t('proprietor')}: <strong>{config.contactPerson}</strong>
                </span>
                <a
                  href={`https://wa.me/${cleanPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{t('whatsappChat')}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
