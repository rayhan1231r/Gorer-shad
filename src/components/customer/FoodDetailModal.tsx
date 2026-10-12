import React, { useState, useEffect } from 'react';
import { X, Clock, Users, MessageCircle, ShoppingBag, Plus, Minus, Star, ShieldCheck, Zap, Video, Image as ImageIcon, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { FoodItem, FoodVariant, FoodAddon, AppUser, CustomerReview } from '../../types/index.ts';
import { useCart } from '../../context/CartContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { api } from '../../services/api.ts';

interface FoodDetailModalProps {
  food: FoodItem | null;
  onClose: () => void;
  whatsappNumber: string;
  currentUser?: AppUser | null;
  onRequireLogin?: () => void;
  onBuyNow?: () => void;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({
  food,
  onClose,
  whatsappNumber,
  currentUser,
  onRequireLogin,
  onBuyNow
}) => {
  const { addToCart, setIsCartOpen } = useCart();
  const {
    language,
    t,
    formatPrice,
    getFoodTitle,
    getFoodFullDesc,
    getFoodPortion,
    getFoodCategory,
    getVariantTitle,
    getAddonTitle,
    getSpiceLevelText
  } = useLanguage();

  const [selectedVariant, setSelectedVariant] = useState<FoodVariant | undefined>(
    food && food.variants && food.variants.length > 0 ? food.variants[0] : undefined
  );
  const [selectedAddons, setSelectedAddons] = useState<FoodAddon[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [specialNotes, setSpecialNotes] = useState('');

  // Media Gallery & Video Mode State
  const allImages = (food?.images && food.images.length > 0) ? food.images : (food?.image ? [food.image] : []);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeMediaTab, setActiveMediaTab] = useState<'images' | 'video'>('images');

  // Auto 2-second slide for images
  useEffect(() => {
    if (activeMediaTab !== 'images' || allImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % allImages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [allImages.length, activeMediaTab]);

  // Product Reviews State
  const [productReviews, setProductReviews] = useState<CustomerReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewAuthorName, setReviewAuthorName] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewNotice, setReviewNotice] = useState<string | null>(null);

  useEffect(() => {
    if (food) {
      setSelectedVariant(food.variants && food.variants.length > 0 ? food.variants[0] : undefined);
      setSelectedAddons([]);
      setQuantity(1);
      setSpecialNotes('');
      setIsWritingReview(false);
      setNewComment('');
      setReviewNotice(null);

      // Fetch reviews specifically for this food
      setLoadingReviews(true);
      api.getReviews(false, food.id)
        .then(res => setProductReviews(res))
        .catch(() => setProductReviews([]))
        .finally(() => setLoadingReviews(false));
    }
  }, [food]);

  useEffect(() => {
    if (currentUser?.name) {
      setReviewAuthorName(currentUser.name);
    }
  }, [currentUser]);

  if (!food) return null;

  const toggleAddon = (addon: FoodAddon) => {
    setSelectedAddons(prev =>
      prev.some(a => a.id === addon.id)
        ? prev.filter(a => a.id !== addon.id)
        : [...prev, addon]
    );
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      if (onRequireLogin) onRequireLogin();
      return;
    }
    if (!newComment.trim()) return;

    setIsSubmittingReview(true);
    try {
      const added = await api.submitReview({
        customerId: currentUser.id,
        customerDisplayName: reviewAuthorName.trim() || currentUser.name,
        customerName: reviewAuthorName.trim() || currentUser.name,
        customerEmail: currentUser.email,
        productId: food.id,
        foodId: food.id,
        foodNameBn: food.nameBn,
        rating: newRating,
        comment: newComment.trim(),
      });
      setProductReviews(prev => [added, ...prev]);
      setNewComment('');
      setIsWritingReview(false);
      setReviewNotice(
        language === 'en'
          ? 'Your review has been successfully submitted and published!'
          : 'আপনার মূল্যবান রিভিউ সফলভাবে প্রকাশিত হয়েছে!'
      );
      setTimeout(() => setReviewNotice(null), 4000);
    } catch (err) {
      console.error(err);
      setReviewNotice(
        language === 'en'
          ? 'Failed to submit review. Please try again.'
          : 'রিভিউ পাঠাতে ত্রুটি হয়েছে। আবার চেষ্টা করুন।'
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const basePrice = food.salePrice !== undefined ? food.salePrice : food.price;
  const variantExtra = selectedVariant?.additionalPrice || 0;
  const addonsExtra = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const unitPrice = basePrice + variantExtra + addonsExtra;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = (openDrawer = false) => {
    if (!currentUser) {
      if (onRequireLogin) {
        onRequireLogin();
      }
      return;
    }
    addToCart(food, quantity, selectedVariant, selectedAddons, specialNotes.trim() || undefined);
    if (openDrawer) {
      setIsCartOpen(true);
    }
    onClose();
  };

  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');
  const title = getFoodTitle(food);
  const fullDesc = getFoodFullDesc(food);
  const portion = getFoodPortion(food);
  const categoryName = getFoodCategory(food);
  const spiceText = getSpiceLevelText(food.spiceLevel);

  const waText = encodeURIComponent(
    language === 'en'
      ? `Hello! I would like to order or inquire about "${title}" from Ghorer Shad.`
      : `আসসালামু আলাইকুম! ঘরের স্বাদ থেকে "${title}" সম্পর্কে জানতে চাচ্ছি।`
  );
  const waUrl = `https://wa.me/${cleanPhone}?text=${waText}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col relative text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white text-slate-600 hover:text-slate-900 rounded-full shadow-md transition-colors cursor-pointer"
          aria-label={t('closeBtn')}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Media Preview & Video Player Header */}
        <div className="relative aspect-[16/9] w-full bg-slate-900 overflow-hidden">
          {activeMediaTab === 'video' && food.videoUrl ? (
            <div className="w-full h-full flex items-center justify-center bg-black">
              {food.videoUrl.includes('youtube.com') || food.videoUrl.includes('youtu.be') ? (
                <iframe
                  src={food.videoUrl.replace('watch?v=', 'embed/')}
                  title="Food Video"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={food.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          ) : (
            <div className="relative w-full h-full">
              <img
                src={allImages[currentImageIndex] || food.image}
                alt={title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-all duration-500"
              />

              {allImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setCurrentImageIndex(prev => (prev - 1 + allImages.length) % allImages.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentImageIndex(prev => (prev + 1) % allImages.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 z-10">
                    {allImages.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          idx === currentImageIndex ? 'w-5 bg-emerald-500' : 'w-2 bg-white/70'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Media Switcher Tab (if video is available) */}
          {food.videoUrl && (
            <div className="absolute top-4 left-4 z-10 flex items-center bg-black/60 backdrop-blur-xs rounded-xl p-1 gap-1 border border-white/20">
              <button
                type="button"
                onClick={() => setActiveMediaTab('images')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeMediaTab === 'images' ? 'bg-white text-slate-900 shadow-xs' : 'text-white hover:text-emerald-300'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{language === 'en' ? `Photos (${allImages.length})` : `ছবি (${allImages.length})`}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMediaTab('video')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeMediaTab === 'video' ? 'bg-rose-600 text-white shadow-xs' : 'text-white hover:text-rose-300'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Watch Video' : 'ভিডিও দেখুন'}</span>
              </button>
            </div>
          )}

          <div className="absolute bottom-3 left-4 flex items-center gap-2 pointer-events-none">
            <span className="bg-white/95 backdrop-blur-xs text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-md shadow-xs">
              {categoryName}
            </span>
            {food.isBestseller && (
              <span className="bg-amber-600 text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow-xs">
                {language === 'en' ? 'Popular' : 'জনপ্রিয়'}
              </span>
            )}
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* Title & Price Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                {title}
              </h2>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  {language === 'en' ? 'Cooking time:' : 'রান্নার সময়:'} {food.prepTimeMinutes} {language === 'en' ? 'mins' : 'মিনিট'}
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  {portion}
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
            </div>

            <div className="text-right sm:self-center">
              <div className="text-2xl font-bold text-slate-900 tabular-nums">
                {formatPrice(unitPrice)}
              </div>
              {food.salePrice !== undefined && food.salePrice < food.price && (
                <div className="text-xs text-slate-400 line-through tabular-nums">
                  {formatPrice(food.price)}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {language === 'en' ? 'Description' : 'খাবারের বিবরণ'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {fullDesc}
            </p>
          </div>

          {/* Variants Selection */}
          {food.variants && food.variants.length > 0 && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                {language === 'en' ? 'Select Preferred Variant:' : 'পছন্দের ভ্যারিয়েন্ট বেছে নিন:'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {food.variants.map(variant => {
                  const isSelected = selectedVariant?.id === variant.id;
                  const vName = getVariantTitle(variant);
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariant(variant)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/60 text-emerald-900 font-semibold ring-1 ring-emerald-600'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <span>{vName}</span>
                      <span className="text-slate-500 tabular-nums">
                        {variant.additionalPrice > 0
                          ? `+${formatPrice(variant.additionalPrice)}`
                          : variant.additionalPrice < 0
                          ? `-${formatPrice(Math.abs(variant.additionalPrice))}`
                          : (language === 'en' ? 'Free' : 'ফ্রি')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Addons Selection */}
          {food.addons && food.addons.length > 0 && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                {language === 'en' ? 'Add Extra Items (Optional):' : 'অতিরিক্ত পদ যোগ করুন (ঐচ্ছিক):'}
              </label>
              <div className="space-y-2">
                {food.addons.map(addon => {
                  const isChecked = selectedAddons.some(a => a.id === addon.id);
                  const aName = getAddonTitle(addon);
                  return (
                    <label
                      key={addon.id}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? 'border-emerald-600 bg-emerald-50/40 text-emerald-900 font-semibold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleAddon(addon)}
                          className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 border-slate-300"
                        />
                        <span>{aName}</span>
                      </div>
                      <span className="text-slate-700 font-medium tabular-nums">
                        +{formatPrice(addon.price)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Cooking Notes */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              {language === 'en' ? 'Special Cooking Instructions (Optional):' : 'রান্নার বিশেষ অনুরোধ (ঐচ্ছিক):'}
            </label>
            <textarea
              value={specialNotes}
              onChange={e => setSpecialNotes(e.target.value)}
              placeholder={t('specialNotesPlaceholder')}
              rows={2}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 text-slate-800"
            />
          </div>

          {/* Quantity Selector & Main Cart Button */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-600">
                {language === 'en' ? 'Quantity:' : 'পরিমাণ:'}
              </span>
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-bold text-slate-900 tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {onBuyNow && (
                <button
                  type="button"
                  onClick={() => {
                    handleAddToCart(false);
                    onClose();
                    onBuyNow();
                  }}
                  className="px-5 py-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>{language === 'en' ? 'Buy Now' : 'এখনই কিনুন'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => handleAddToCart(true)}
                className="flex-1 sm:flex-none px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {language === 'en'
                    ? `Add to Bag • ${formatPrice(totalPrice)}`
                    : `ব্যাগে যোগ করুন • ${formatPrice(totalPrice)}`}
                </span>
              </button>
            </div>
          </div>

          {/* WhatsApp Direct Inquiry Option */}
          <div className="pt-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-emerald-700" />
              <span>{t('whatsappInquiryBtn')}</span>
            </a>
          </div>

          {/* Customer Reviews Section */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {t('reviewsHeading')}
                </h3>
                <span className="text-xs text-slate-500">
                  {language === 'en'
                    ? `${productReviews.length} Verified Reviews`
                    : `${productReviews.length}টি যাচাইকৃত রিভিউ`}
                </span>
              </div>

              {!isWritingReview && (
                <button
                  onClick={() => {
                    if (!currentUser) {
                      if (onRequireLogin) onRequireLogin();
                      return;
                    }
                    setIsWritingReview(true);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                >
                  {t('writeReviewBtn')}
                </button>
              )}
            </div>

            {reviewNotice && (
              <div className="p-3 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl font-medium">
                {reviewNotice}
              </div>
            )}

            {isWritingReview && (
              <form onSubmit={handleReviewSubmit} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">
                    {language === 'en' ? 'Select Rating:' : 'রেটিং নির্বাচন করুন:'}
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewRating(star)}
                        className="p-1 cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= newRating
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <textarea
                    rows={3}
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder={t('reviewPlaceholder')}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-600 text-slate-800"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsWritingReview(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    {language === 'en' ? 'Cancel' : 'বাতিল'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmittingReview ? (language === 'en' ? 'Publishing...' : 'প্রকাশ হচ্ছে...') : t('submitReviewBtn')}
                  </button>
                </div>
              </form>
            )}

            {/* Existing Reviews List */}
            <div className="space-y-3">
              {loadingReviews ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  {language === 'en' ? 'Loading reviews...' : 'রিভিউ লোড হচ্ছে...'}
                </div>
              ) : productReviews.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 bg-slate-50/60 rounded-xl p-4">
                  {t('noReviewsYet')}
                </div>
              ) : (
                productReviews.map(rev => (
                  <div key={rev.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{rev.customerName}</span>
                        {rev.isVerifiedPurchase && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded font-medium">
                            <ShieldCheck className="w-3 h-3" />
                            <span>{t('verifiedPurchase')}</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < rev.rating
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
