import React from 'react';
import { Plus, Clock, Users } from 'lucide-react';
import { FoodItem } from '../../types/index.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface FoodCardProps {
  food: FoodItem;
  onSelect: (food: FoodItem) => void;
  onQuickAdd: (food: FoodItem) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({ food, onSelect, onQuickAdd }) => {
  const {
    language,
    formatPrice,
    getFoodTitle,
    getFoodShortDesc,
    getFoodPortion,
    getFoodCategory,
    getSpiceLevelText
  } = useLanguage();

  const title = getFoodTitle(food);
  const shortDesc = getFoodShortDesc(food);
  const portion = getFoodPortion(food);
  const categoryName = getFoodCategory(food);
  const spiceText = getSpiceLevelText(food.spiceLevel);

  return (
    <div className="group bg-white rounded-xl border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden text-left">
      {/* Food Image Container */}
      <div
        onClick={() => onSelect(food)}
        className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 cursor-pointer"
      >
        <img
          src={food.image}
          alt={title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        
        {/* Status label */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {food.isBestseller && (
            <span className="bg-white/95 backdrop-blur-xs text-amber-900 text-xs font-semibold px-2.5 py-1 rounded-md shadow-xs">
              {language === 'en' ? 'Popular Dish' : 'জনপ্রিয় পদ'}
            </span>
          )}
          {food.isFeatured && !food.isBestseller && (
            <span className="bg-white/95 backdrop-blur-xs text-emerald-900 text-xs font-semibold px-2.5 py-1 rounded-md shadow-xs">
              {language === 'en' ? 'Special' : 'স্পেশাল পদ'}
            </span>
          )}
        </div>

        {!food.isAvailable && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center">
            <span className="bg-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-md">
              {language === 'en' ? 'Sold Out Today' : 'আজকের স্টক শেষ'}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
            <span>{categoryName}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{food.prepTimeMinutes} {language === 'en' ? 'mins' : 'মিনিট'}</span>
            </span>
            {food.spiceLevel && (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  {language === 'en' ? `Spice: ${spiceText}` : `ঝাল: ${spiceText}`}
                </span>
              </>
            )}
          </div>

          {/* Food Title */}
          <h3
            onClick={() => onSelect(food)}
            className="text-base font-semibold text-slate-900 hover:text-emerald-700 transition-colors cursor-pointer line-clamp-1"
          >
            {title}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {shortDesc}
          </p>

          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <Users className="w-3 h-3 text-slate-400" />
            <span>{portion}</span>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-slate-900 tabular-nums">
              {formatPrice(food.salePrice !== undefined ? food.salePrice : food.price)}
            </span>
            {food.salePrice !== undefined && food.salePrice < food.price && (
              <span className="text-xs text-slate-400 line-through tabular-nums">
                {formatPrice(food.price)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onSelect(food)}
              className="text-xs font-medium text-slate-600 hover:text-emerald-700 px-2 py-1.5 hover:bg-slate-50 rounded-md transition-colors cursor-pointer"
            >
              {language === 'en' ? 'Details' : 'বিস্তারিত'}
            </button>
            <button
              disabled={!food.isAvailable}
              onClick={() => onQuickAdd(food)}
              className={`p-2 rounded-lg flex items-center justify-center transition-colors shadow-xs cursor-pointer ${
                food.isAvailable
                  ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
              title={language === 'en' ? 'Add to Bag' : 'ব্যাগে যোগ করুন'}
              aria-label={language === 'en' ? 'Add to Bag' : 'ব্যাগে যোগ করুন'}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
