import React, { useState, useEffect } from 'react';
import { X, Clock, Users, ShieldAlert, MessageCircle, ShoppingBag, Plus, Minus, Check, Star, ShieldCheck, Send, MessageSquare } from 'lucide-react';
import { FoodItem, FoodVariant, FoodAddon, AppUser, CustomerReview } from '../../types/index.ts';
import { useCart } from '../../context/CartContext.tsx';
import { api } from '../../services/api.ts';

interface FoodDetailModalProps {
  food: FoodItem | null;
  onClose: () => void;
  whatsappNumber: string;
  currentUser?: AppUser | null;
  onRequireLogin?: () => void;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({
  food,
  onClose,
  whatsappNumber,
  currentUser,
  onRequireLogin
}) => {
  const { addToCart, setIsCartOpen } = useCart();

  const [selectedVariant, setSelectedVariant] = useState<FoodVariant | undefined>(
    food && food.variants && food.variants.length > 0 ? food.variants[0] : undefined
  );
  const [selectedAddons, setSelectedAddons] = useState<FoodAddon[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [specialNotes, setSpecialNotes] = useState('');

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
      setReviewNotice('আপনার মূল্যবান রিভিউ সফলভাবে প্রকাশিত হয়েছে!');
      setTimeout(() => setReviewNotice(null), 4000);
    } catch (err) {
      console.error(err);
      setReviewNotice('রিভিউ পাঠাতে ত্রুটি হয়েছে। আবার চেষ্টা করুন।');
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
  const waText = encodeURIComponent(
    `আসসালামু আলাইকুম! ঘরের স্বাদ থেকে "${food.nameBn}" সম্পর্কে জানতে চাচ্ছি।`
  );
  const waUrl = `https://wa.me/${cleanPhone}?text=${waText}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col relative text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white text-slate-600 hover:text-slate-900 rounded-full shadow-md transition-colors"
          aria-label="বন্ধ করুন"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Media Preview */}
        <div className="relative aspect-[16/9] w-full bg-slate-100">
          <img
            src={food.image}
            alt={food.nameBn}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 left-4 flex items-center gap-2">
            <span className="bg-white/90 backdrop-blur-xs text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-md shadow-xs">
              {food.categoryNameBn}
            </span>
            {food.isBestseller && (
              <span className="bg-amber-600 text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow-xs">
                জনপ্রিয়
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
                {food.nameBn}
              </h2>
              {food.nameEn && (
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {food.nameEn}
                </p>
              )}
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  রান্নার সময়: {food.prepTimeMinutes} মিনিট
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  {food.portionBn}
                </span>
              </div>
            </div>

            <div className="text-right sm:self-center">
              <div className="text-2xl font-bold text-slate-900 tabular-nums">
                ৳{unitPrice}
              </div>
              {food.salePrice !== undefined && food.salePrice < food.price && (
                <div className="text-xs text-slate-400 line-through tabular-nums">
                  ৳{food.price}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              বিবরণ ও স্বাদ
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              {food.fullDescBn || food.shortDescBn}
            </p>
            {food.ingredientsBn && (
              <p className="text-xs text-slate-500 pt-1">
                <span className="font-medium text-slate-700">উপকরণ: </span>
                {food.ingredientsBn}
              </p>
            )}
          </div>

          {/* Advance Preparation Notice */}
          <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3.5 text-xs text-emerald-900 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">টাটকা রান্নার নিশ্চয়তা:</span>
              এই খাবারটি আপনার অর্ডারের পর খাঁটি ঘরোয়া মশলায় তাজা রান্না করা হয়। অগ্রিম {food.advanceNoticeRequiredHours || 4} ঘন্টা আগে অর্ডার করতে অনুরোধ করা হচ্ছে।
            </div>
          </div>

          {/* Selectable Variants */}
          {food.variants.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                পছন্দের ভ্যারিয়েন্ট বেছে নিন
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {food.variants.map(variant => {
                  const isSelected = selectedVariant?.id === variant.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariant(variant)}
                      className={`text-left p-3 rounded-lg border text-xs transition-colors flex items-center justify-between ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/50 text-slate-900 font-semibold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className="truncate pr-2">{variant.nameBn}</span>
                      <span className="shrink-0 text-slate-500 font-medium tabular-nums">
                        {variant.additionalPrice > 0 ? `+৳${variant.additionalPrice}` : variant.additionalPrice < 0 ? `-৳${Math.abs(variant.additionalPrice)}` : 'মূল্য অন্তর্ভুক্ত'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add-ons */}
          {food.addons.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                সাথে অতিরিক্ত যুক্ত করতে পারেন (ঐচ্ছিক)
              </h4>
              <div className="space-y-2">
                {food.addons.map(addon => {
                  const isChecked = selectedAddons.some(a => a.id === addon.id);
                  return (
                    <label
                      key={addon.id}
                      onClick={() => toggleAddon(addon)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? 'border-emerald-600 bg-emerald-50/30 font-medium text-slate-900'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            isChecked
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                        <span>{addon.nameBn}</span>
                      </div>
                      <span className="text-slate-500 tabular-nums font-semibold">
                        +৳{addon.price}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Instructions */}
          <div className="space-y-2">
            <label htmlFor="modal-notes" className="text-xs font-semibold text-slate-900 uppercase tracking-wider block">
              রান্না সম্পর্কিত বিশেষ নির্দেশ (ঐচ্ছিক)
            </label>
            <textarea
              id="modal-notes"
              rows={2}
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              placeholder="যেমন: ঝাল কম রাখবেন, লবণ হালকা, তেল কম ইত্যাদি..."
              className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600 text-slate-800"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Quantity Selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-600">পরিমাণ:</span>
            <div className="flex items-center border border-slate-200 rounded-lg bg-white">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 text-slate-600 hover:text-slate-900 disabled:opacity-40"
                disabled={quantity <= 1}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-3 text-sm font-semibold text-slate-900 tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 text-slate-600 hover:text-slate-900"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-right ml-2">
              <span className="text-xs text-slate-500 block">মোট মূল্য:</span>
              <span className="text-base font-bold text-slate-900 tabular-nums">
                ৳{totalPrice}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 text-emerald-700 bg-white border border-emerald-200 hover:bg-emerald-50 rounded-lg transition-colors"
              title="হোয়াটসঅ্যাপে জিজ্ঞাসা করুন"
            >
              <MessageCircle className="w-5 h-5" />
            </a>

            <button
              onClick={() => handleAddToCart(false)}
              disabled={!food.isAvailable}
              className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>ব্যাগে যোগ</span>
            </button>

            <button
              onClick={() => handleAddToCart(true)}
              disabled={!food.isAvailable}
              className="flex-1 sm:flex-initial px-5 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs"
            >
              এখনই অর্ডার
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
