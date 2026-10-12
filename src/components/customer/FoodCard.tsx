import React, { useState, useEffect } from 'react';
import { Plus, Clock, Users, Zap, Video } from 'lucide-react';
import { FoodItem } from '../../types/index.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface FoodCardProps {
  food: FoodItem;
  onSelect: (food: FoodItem) => void;
  onQuickAdd: (food: FoodItem) => void;
  onBuyNow?: (food: FoodItem) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({ food, onSelect, onQuickAdd, onBuyNow }) => {
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

  // Auto 2-second image slider for 1-10 food images
  const allImages = (food.images && food.images.length > 0) ? food.images : [food.image];
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    if (allImages.length <= 1) return;
    const timer = setInterval(() => {
      setImgIndex(prev => (prev + 1) % allImages.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [allImages.length]);

  return (
    <div className="group bg-white rounded-xl border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden text-left">
      {/* Food Image Container */}
      <div
        onClick={() => onSelect(food)}
        className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 cursor-pointer"
      >
        <img
          src={allImages[imgIndex] || food.image}
          alt={title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        
        {/* Status labels */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
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
          {food.videoUrl && (
            <span className="bg-rose-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1 backdrop-blur-xs">
              <Video className="w-3 h-3" />
              <span>{language === 'en' ? 'Video' : 'ভিডিও সহ'}</span>
            </span>
          )}
        </div>

        {/* Multi-image indicators if multiple images */}
        {allImages.length > 1 && (
          <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1 z-10">
            {allImages.map((_, idx) => (
              <span
                key={idx}
                className={`h-1 rounded-full transition-all duration-300 ${
                  idx === imgIndex ? 'w-4 bg-emerald-600' : 'w-1.5 bg-white/70'
                }`}
              />
            ))}
          </div>
        )}

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
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
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
            {onBuyNow && food.isAvailable && (
              <button
                type="button"
                onClick={() => onBuyNow(food)}
                className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                title={language === 'en' ? 'Buy Now' : 'এখনই কিনুন'}
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                <span>{language === 'en' ? 'Buy Now' : 'এখনই কিনুন'}</span>
              </button>
            )}
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
