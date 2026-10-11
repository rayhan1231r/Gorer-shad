import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { useCart } from '../../context/CartContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { AppUser } from '../../types/index.ts';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
  currentUser?: AppUser | null;
  onRequireLogin?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onProceedToCheckout,
  currentUser,
  onRequireLogin
}) => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    deliveryZones,
    selectedZone,
    setSelectedZone,
    deliveryCharge,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    total,
    clearCart
  } = useCart();

  const {
    language,
    t,
    formatPrice,
    getFoodTitle,
    getVariantTitle,
    getAddonTitle,
    getZoneTitle
  } = useLanguage();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    setIsApplying(true);
    setCouponMsg(null);
    const res = await applyCoupon(couponCodeInput.trim());
    setIsApplying(false);
    setCouponMsg({
      text: res.success
        ? (language === 'en' ? 'Coupon code applied successfully!' : 'কুপন সফলভাবে প্রয়োগ করা হয়েছে!')
        : (language === 'en' ? res.message || 'Invalid coupon code' : res.message || 'অকার্যকর কুপন কোড'),
      isError: !res.success
    });
    if (res.success) setCouponCodeInput('');
  };

  const totalItemsCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-2xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between text-left relative">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900">
              {t('cartTitle')}
            </h3>
            <span className="text-xs text-slate-500 tabular-nums">
              ({totalItemsCount} {t('itemsCount')})
            </span>
          </div>

          <div className="flex items-center gap-3">
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-rose-600 hover:text-rose-700 underline cursor-pointer"
              >
                {t('clearAll')}
              </button>
            )}
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
              aria-label={t('closeBtn')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Advance Preparation Alert */}
        <div className="bg-emerald-50 px-4 py-2.5 border-b border-emerald-100/60 text-xs text-emerald-900 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <span>{t('cartFreshNotice')}</span>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center text-2xl font-bold">
                {language === 'en' ? '0' : '০'}
              </div>
              <h4 className="text-base font-semibold text-slate-800">
                {t('emptyCartTitle')}
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {t('emptyCartDesc')}
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-2 px-4 py-2 bg-emerald-700 text-white text-xs font-semibold rounded-lg hover:bg-emerald-800 cursor-pointer"
              >
                {t('viewMenuAction')}
              </button>
            </div>
          ) : (
            cart.map(item => {
              const itemTitle = getFoodTitle(item.food);
              const variantName = item.selectedVariant ? getVariantTitle(item.selectedVariant) : null;
              const addonsNames = item.selectedAddons.map(a => getAddonTitle(a)).join(', ');

              return (
                <div
                  key={item.cartItemId}
                  className="p-3 rounded-xl border border-slate-200/80 hover:border-slate-300 flex items-start gap-3 bg-white"
                >
                  <img
                    src={item.food.image}
                    alt={itemTitle}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-lg object-cover bg-slate-100 shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="text-sm font-semibold text-slate-900 truncate">
                        {itemTitle}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.cartItemId)}
                        className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                        title={language === 'en' ? 'Remove' : 'মুছে ফেলুন'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {item.selectedVariant && (
                      <p className="text-[11px] text-slate-500">
                        {t('variantLabel')} {variantName}
                      </p>
                    )}

                    {item.selectedAddons.length > 0 && (
                      <p className="text-[11px] text-slate-500">
                        {t('addonsLabel')} {addonsNames}
                      </p>
                    )}

                    {item.specialNotes && (
                      <p className="text-[10px] text-emerald-700 italic">
                        {t('instructionsLabel')} {item.specialNotes}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center border border-slate-200 rounded-md">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, -1)}
                          className="px-2 py-0.5 text-slate-500 hover:text-slate-900 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-semibold text-slate-800 tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, 1)}
                          className="px-2 py-0.5 text-slate-500 hover:text-slate-900 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-sm font-bold text-slate-900 tabular-nums">
                        {formatPrice(item.itemTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer / Summary */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 space-y-3.5">
            {/* Delivery Zone Select */}
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                {t('deliveryAreaSelectLabel')}
              </label>
              <select
                value={selectedZone?.id || ''}
                onChange={e => {
                  const z = deliveryZones.find(dz => dz.id === e.target.value);
                  if (z) setSelectedZone(z);
                }}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-emerald-600 text-slate-800 cursor-pointer"
              >
                {deliveryZones.map(z => {
                  const zTitle = getZoneTitle(z);
                  return (
                    <option key={z.id} value={z.id}>
                      {zTitle} — {language === 'en'
                        ? `Fee ${formatPrice(z.charge)} (Free above ${formatPrice(z.freeDeliveryThreshold)})`
                        : `চার্জ ${formatPrice(z.charge)} (${formatPrice(z.freeDeliveryThreshold)}+ ফ্রি)`}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Coupon Code Section */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-xs text-emerald-900">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      {language === 'en' ? 'Coupon' : 'কুপন'} <strong>{appliedCoupon.code}</strong> (-{formatPrice(appliedCoupon.discount)})
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-rose-600 hover:underline font-medium cursor-pointer"
                  >
                    {t('couponCancelBtn')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCodeInput}
                    onChange={e => setCouponCodeInput(e.target.value.toUpperCase())}
                    placeholder={t('couponPlaceholder')}
                    className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-emerald-600 uppercase"
                  />
                  <button
                    type="submit"
                    disabled={isApplying}
                    className="px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    {isApplying ? (language === 'en' ? 'Checking...' : 'যাচাই হচ্ছে...') : t('couponApplyBtn')}
                  </button>
                </form>
              )}
              {couponMsg && (
                <p className={`text-[11px] mt-1 ${couponMsg.isError ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {couponMsg.text}
                </p>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-600 pt-1">
              <div className="flex justify-between">
                <span>{t('subtotalLabel')}</span>
                <span className="font-semibold text-slate-900 tabular-nums">{formatPrice(subtotal)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700">
                  <span>{t('discountLabel')}</span>
                  <span className="font-semibold tabular-nums">-{formatPrice(appliedCoupon.discount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>
                  {t('deliveryChargeLabel')} ({getZoneTitle(selectedZone)}):
                </span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {deliveryCharge === 0 ? (
                    <span className="text-emerald-700">{t('freeDeliveryLabel')}</span>
                  ) : (
                    formatPrice(deliveryCharge)
                  )}
                </span>
              </div>

              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>{t('totalPayableLabel')}</span>
                <span className="text-base text-emerald-800 tabular-nums">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={() => {
                if (!currentUser) {
                  setIsCartOpen(false);
                  if (onRequireLogin) onRequireLogin();
                  return;
                }
                setIsCartOpen(false);
                onProceedToCheckout();
              }}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <span>{currentUser ? t('checkoutBtn') : t('loginToOrderBtn')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
