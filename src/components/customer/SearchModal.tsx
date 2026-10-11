import React, { useState } from 'react';
import { Search, X, Plus } from 'lucide-react';
import { FoodItem } from '../../types/index.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  foods: FoodItem[];
  onSelectFood: (food: FoodItem) => void;
  onQuickAdd: (food: FoodItem) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  foods,
  onSelectFood,
  onQuickAdd
}) => {
  const { language, formatPrice, getFoodTitle, getFoodCategory, getFoodPortion } = useLanguage();
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const results = query.trim()
    ? foods.filter(f =>
        f.nameBn.toLowerCase().includes(query.toLowerCase()) ||
        f.nameEn.toLowerCase().includes(query.toLowerCase()) ||
        f.shortDescBn.toLowerCase().includes(query.toLowerCase()) ||
        f.categoryNameBn.toLowerCase().includes(query.toLowerCase())
      )
    : foods.slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-start justify-center p-4 pt-20">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden text-left">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-emerald-700 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={
              language === 'en'
                ? 'Search dishes by name (e.g. Ilish, Chicken, Luchi, Biryani)...'
                : 'খাবারের নাম লিখুন (যেমন: ইলিশ, মুরগি, লুচি, বিরিয়ানি)...'
            }
            className="w-full text-sm focus:outline-none text-slate-800 placeholder-slate-400"
          />
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
            aria-label={language === 'en' ? 'Close' : 'বন্ধ করুন'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 divide-y divide-slate-100">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
            {query.trim()
              ? (language === 'en' ? `Results (${results.length} dishes)` : `ফলাফল (${results.length}টি খাবার)`)
              : (language === 'en' ? 'Popular Specialties' : 'জনপ্রিয় কিছু পদ')}
          </div>

          {results.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              {language === 'en'
                ? 'No dishes found. Please try searching with a different keyword.'
                : 'কোনো খাবার খুঁজে পাওয়া যায়নি। অন্য শব্দ দিয়ে খুঁজুন।'}
            </div>
          ) : (
            results.map(food => {
              const fTitle = getFoodTitle(food);
              const fCat = getFoodCategory(food);
              const fPortion = getFoodPortion(food);

              return (
                <div
                  key={food.id}
                  className="p-2.5 hover:bg-slate-50 rounded-xl flex items-center justify-between gap-3 transition-colors cursor-pointer"
                  onClick={() => {
                    onSelectFood(food);
                    onClose();
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={food.image}
                      alt={fTitle}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                        {fTitle}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">
                        {fCat} • {fPortion}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 tabular-nums">
                      {formatPrice(food.salePrice || food.price)}
                    </span>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onQuickAdd(food);
                      }}
                      className="p-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors cursor-pointer"
                      title={language === 'en' ? 'Add to Bag' : 'ব্যাগে যোগ করুন'}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
