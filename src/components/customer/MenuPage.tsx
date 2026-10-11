import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown } from 'lucide-react';
import { Category, FoodItem } from '../../types/index.ts';
import { FoodCard } from './FoodCard.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface MenuPageProps {
  categories: Category[];
  foods: FoodItem[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  onSelectFood: (food: FoodItem) => void;
  onQuickAdd: (food: FoodItem) => void;
}

export const MenuPage: React.FC<MenuPageProps> = ({
  categories,
  foods,
  selectedCategoryId,
  onSelectCategory,
  onSelectFood,
  onQuickAdd
}) => {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'prep-time'>('featured');
  const [spiceFilter, setSpiceFilter] = useState<string>('all');
  const [availableOnly] = useState(false);

  const filteredFoods = useMemo(() => {
    return foods.filter(food => {
      // Category filter
      if (selectedCategoryId !== 'all' && food.categoryId !== selectedCategoryId) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchBn = food.nameBn.toLowerCase().includes(q);
        const matchEn = food.nameEn.toLowerCase().includes(q);
        const matchDesc = food.shortDescBn.toLowerCase().includes(q);
        if (!matchBn && !matchEn && !matchDesc) return false;
      }
      // Spice level
      if (spiceFilter !== 'all' && food.spiceLevel !== spiceFilter) {
        return false;
      }
      // Availability
      if (availableOnly && !food.isAvailable) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      const priceA = a.salePrice !== undefined ? a.salePrice : a.price;
      const priceB = b.salePrice !== undefined ? b.salePrice : b.price;

      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'prep-time') return a.prepTimeMinutes - b.prepTimeMinutes;
      // Default: featured/bestseller first
      if (a.isBestseller && !b.isBestseller) return -1;
      if (!a.isBestseller && b.isBestseller) return 1;
      return 0;
    });
  }, [foods, selectedCategoryId, searchQuery, sortBy, spiceFilter, availableOnly]);

  return (
    <div className="bg-slate-50/50 min-h-screen py-10 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900">
            {language === 'en' ? 'Complete Food Menu' : 'খাবারের সম্পূর্ণ তালিকা'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {language === 'en'
              ? 'Authentic homemade Bengali meals, Padma Hilsa, desi chicken, and delightful family combo platters.'
              : 'খাঁটি বাঙালি খাবার, ইলিশ, দেশি মুরগি, নাস্তা ও সুস্বাদু কম্বো প্যাকেজ। অর্ডারের পর তাজা প্রস্তুত করা হয়।'}
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={
                  language === 'en'
                    ? 'Search food by name (e.g., Ilish, Chicken, Luchi)...'
                    : 'খাবারের নাম লিখে খুঁজুন (যেমন: ইলিশ, চিকেন, লুচি)...'
                }
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-emerald-600 bg-white"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="bg-transparent focus:outline-none text-slate-700 font-medium cursor-pointer"
                >
                  <option value="featured">{language === 'en' ? 'Sort: Popularity' : 'জনপ্রিয়তা অনুযায়ী'}</option>
                  <option value="price-asc">{language === 'en' ? 'Price: Low to High' : 'দাম: কম থেকে বেশি'}</option>
                  <option value="price-desc">{language === 'en' ? 'Price: High to Low' : 'দাম: বেশি থেকে কম'}</option>
                  <option value="prep-time">{language === 'en' ? 'Cooking Time: Fast' : 'রান্নার সময় (দ্রুত)'}</option>
                </select>
              </div>

              {/* Spice Dropdown */}
              <select
                value={spiceFilter}
                onChange={e => setSpiceFilter(e.target.value)}
                className="px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
              >
                <option value="all">{language === 'en' ? 'All Spice Levels' : 'সকল ঝাল'}</option>
                <option value="Mild">{language === 'en' ? 'Mild Spice' : 'ঝাল কম (Mild)'}</option>
                <option value="Medium">{language === 'en' ? 'Medium Spice' : 'মাঝারি ঝাল (Medium)'}</option>
                <option value="Spicy">{language === 'en' ? 'Spicy' : 'বেশি ঝাল (Spicy)'}</option>
              </select>
            </div>
          </div>

          {/* Interactive Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
            <button
              onClick={() => onSelectCategory('all')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                selectedCategoryId === 'all'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
              }`}
            >
              {language === 'en' ? 'All Foods' : 'সব খাবার'} ({foods.length})
            </button>

            {categories.map(cat => {
              const count = foods.filter(f => f.categoryId === cat.id).length;
              const isSelected = selectedCategoryId === cat.id;
              const catName = language === 'en' && cat.nameEn ? cat.nameEn : cat.nameBn;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                  }`}
                >
                  {catName} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Food Items Grid */}
        {filteredFoods.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-slate-200/80 p-8 space-y-3">
            <h3 className="text-lg font-bold text-slate-800">
              {language === 'en' ? 'No food items found' : 'কোনো খাবার খুঁজে পাওয়া যায়নি'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {language === 'en'
                ? 'Please try searching with a different name or reset the category filter.'
                : 'অনুগ্রহ করে অন্য নাম দিয়ে খুঁজুন অথবা ক্যাটাগরি ফিল্টার পরিবর্তন করুন।'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                onSelectCategory('all');
                setSpiceFilter('all');
              }}
              className="mt-2 px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              {language === 'en' ? 'Reset Filters' : 'ফিল্টার রিসেট করুন'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFoods.map(food => (
              <FoodCard
                key={food.id}
                food={food}
                onSelect={onSelectFood}
                onQuickAdd={onQuickAdd}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
