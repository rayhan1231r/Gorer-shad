import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { useCart } from '../../context/CartContext.tsx';
import { DeliveryZone, AppUser } from '../../types/index.ts';

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
    setCouponMsg({ text: res.message, isError: !res.success });
    if (res.success) setCouponCodeInput('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-2xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between text-left relative">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900">
              আপনার শপিং ব্যাগ
            </h3>
            <span className="text-xs text-slate-500 tabular-nums">
              ({cart.reduce((sum, i) => sum + i.quantity, 0)} আইটেম)
            </span>
          </div>

          <div className="flex items-center gap-3">
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-rose-600 hover:text-rose-700 underline"
              >
                সব মুছুন
              </button>
            )}
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"
              aria-label="ব্যাগ বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Advance Preparation Alert */}
        <div className="bg-emerald-50 px-4 py-2.5 border-b border-emerald-100/60 text-xs text-emerald-900 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <span>খাবার সম্পূর্ণ টাটকা প্রস্তুত করা হয়। অর্ডার কমপক্ষে ৪-৬ ঘন্টা পূর্বে পৌঁছানো জরুরি।</span>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center text-2xl font-bold">
                ০
              </div>
              <h4 className="text-base font-semibold text-slate-800">
                আপনার ব্যাগ এখনো খালি
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                আমাদের সুস্বাদু ঘরোয়া খাবার মেনু থেকে আপনার পছন্দের আইটেম বেছে নিন।
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-2 px-4 py-2 bg-emerald-700 text-white text-xs font-semibold rounded-lg hover:bg-emerald-800"
              >
                মেনু দেখুন
              </button>
            </div>
          ) : (
            cart.map(item => (
              <div
                key={item.cartItemId}
                className="p-3 rounded-xl border border-slate-200/80 hover:border-slate-300 flex items-start gap-3 bg-white"
              >
                <img
                  src={item.food.image}
                  alt={item.food.nameBn}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-lg object-cover bg-slate-100 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="text-sm font-semibold text-slate-900 truncate">
                      {item.food.nameBn}
                    </h4>
                    <button
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="text-slate-400 hover:text-rose-600 p-0.5"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {item.selectedVariant && (
                    <p className="text-[11px] text-slate-500">
                      ভ্যারিয়েন্ট: {item.selectedVariant.nameBn}
                    </p>
                  )}

                  {item.selectedAddons.length > 0 && (
                    <p className="text-[11px] text-slate-500">
                      যুক্ত: {item.selectedAddons.map(a => a.nameBn).join(', ')}
                    </p>
                  )}

                  {item.specialNotes && (
                    <p className="text-[10px] text-emerald-700 italic">
                      নির্দেশ: {item.specialNotes}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center border border-slate-200 rounded-md">
                      <button
                        onClick={() => updateQuantity(item.cartItemId, -1)}
                        className="px-2 py-0.5 text-slate-500 hover:text-slate-900"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-semibold text-slate-800 tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.cartItemId, 1)}
                        className="px-2 py-0.5 text-slate-500 hover:text-slate-900"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-sm font-bold text-slate-900 tabular-nums">
                      ৳{item.itemTotal}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Summary */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 space-y-3.5">
            {/* Delivery Zone Select */}
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                ডেলিভারি এলাকা নির্বাচন করুন:
              </label>
              <select
                value={selectedZone?.id || ''}
                onChange={e => {
                  const z = deliveryZones.find(dz => dz.id === e.target.value);
                  if (z) setSelectedZone(z);
                }}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-emerald-600 text-slate-800"
              >
                {deliveryZones.map(z => (
                  <option key={z.id} value={z.id}>
                    {z.nameBn} — চার্জ ৳{z.charge} (৳{z.freeDeliveryThreshold}+ ফ্রি)
                  </option>
                ))}
              </select>
            </div>

            {/* Coupon Code Section */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-xs text-emerald-900">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>কুপন <strong>{appliedCoupon.code}</strong> (-৳{appliedCoupon.discount})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-rose-600 hover:underline font-medium"
                  >
                    বাতিল
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCodeInput}
                    onChange={e => setCouponCodeInput(e.target.value.toUpperCase())}
                    placeholder="কুপন কোড (যেমন: GHORER10)"
                    className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-emerald-600 uppercase"
                  />
                  <button
                    type="submit"
                    disabled={isApplying}
                    className="px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg"
                  >
                    {isApplying ? 'যাচাই হচ্ছে...' : 'প্রয়োগ'}
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
                <span>খাবারের মোট (Subtotal):</span>
                <span className="font-semibold text-slate-900 tabular-nums">৳{subtotal}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700">
                  <span>কুপন ডিসকাউন্ট:</span>
                  <span className="font-semibold tabular-nums">-৳{appliedCoupon.discount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>ডেলিভারি চার্জ ({selectedZone?.nameBn || 'আড়াইহাজার'}):</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {deliveryCharge === 0 ? (
                    <span className="text-emerald-700">ফ্রি ডেলিভারি</span>
                  ) : (
                    `৳${deliveryCharge}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>সর্বমোট প্রদেয়:</span>
                <span className="text-base text-emerald-800 tabular-nums">৳{total}</span>
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
              <span>{currentUser ? 'চেকআউট ও ঠিকানা দিন' : 'লগইন করে অর্ডার করুন'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
