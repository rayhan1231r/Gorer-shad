import React, { useState, useEffect } from 'react';
import { ShieldCheck, Clock, MapPin, Phone, CreditCard, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext.tsx';
import { BusinessConfig, Order, PaymentMethod } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface CheckoutPageProps {
  config: BusinessConfig;
  onBackToMenu: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ config, onBackToMenu, onOrderSuccess }) => {
  const {
    cart,
    subtotal,
    deliveryCharge,
    appliedCoupon,
    total,
    selectedZone,
    deliveryZones,
    setSelectedZone,
    clearCart
  } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryLandmark, setDeliveryLandmark] = useState('');
  const [requestedDate, setRequestedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [requestedTimeSlot, setRequestedTimeSlot] = useState('আজ দুপুর ১:৩০ - ২:৩০');
  const [isUrgent, setIsUrgent] = useState(false);
  const [customerNotes, setCustomerNotes] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [paymentTransactionId, setPaymentTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    api.getCurrentUser().then(user => {
      if (user) {
        if (user.name) setCustomerName(user.name);
        if (user.email) setCustomerEmail(user.email);
        if (user.phone) setCustomerPhone(user.phone);
        if (user.addresses && user.addresses[0]) setDeliveryAddress(user.addresses[0]);
      }
    }).catch(() => {});
  }, []);

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">আপনার ব্যাগ খালি</h2>
        <p className="text-slate-500 text-sm mb-6">অর্ডার করার জন্য প্রথমে মেনু থেকে পছন্দের খাবার ব্যাগে যোগ করুন।</p>
        <button
          onClick={onBackToMenu}
          className="px-6 py-2.5 bg-emerald-700 text-white rounded-lg text-sm font-semibold hover:bg-emerald-800"
        >
          মেনু দেখুন
        </button>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!customerName.trim()) {
      setErrorMsg('অনুগ্রহ করে আপনার পুরো নাম লিখুন।');
      return;
    }
    const cleanPhone = customerPhone.trim().replace(/[^0-9]/g, '');
    if (cleanPhone.length < 11) {
      setErrorMsg('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।');
      return;
    }
    if (!deliveryAddress.trim()) {
      setErrorMsg('ডেলিভারির সম্পূর্ণ ঠিকানা লিখুন (বাড়ি/রোড/এলাকা)।');
      return;
    }
    if (selectedZone && subtotal < selectedZone.minOrderAmount) {
      setErrorMsg(`এই এলাকায় সর্বনিম্ন অর্ডারের পরিমাণ ৳${selectedZone.minOrderAmount} টাকা।`);
      return;
    }
    if ((paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'rocket') && !paymentTransactionId.trim()) {
      setErrorMsg('মোবাইল ব্যাংকিং পেমেন্টের ক্ষেত্রে ট্রানজেকশন আইডি (TrxID) দেওয়া আবশ্যক।');
      return;
    }

    try {
      setIsSubmitting(true);
      const orderPayload: Partial<Order> = {
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        customerEmail: customerEmail.trim() || undefined,
        deliveryZoneId: selectedZone?.id || 'zone-1',
        deliveryZoneName: selectedZone?.nameBn || 'আড়াইহাজার সদর',
        deliveryAddress: deliveryAddress.trim(),
        deliveryLandmark: deliveryLandmark.trim() || undefined,
        requestedDate,
        requestedTimeSlot: requestedTimeSlot + (isUrgent ? ' (জরুরি অনুরোধ)' : ''),
        isUrgent,
        customerNotes: customerNotes.trim() || undefined,
        items: cart.map(item => ({
          foodId: item.foodId,
          sku: item.food.sku,
          nameBn: item.food.nameBn,
          nameEn: item.food.nameEn,
          quantity: item.quantity,
          selectedVariantName: item.selectedVariant?.nameBn,
          selectedAddonsNames: item.selectedAddons.map(a => a.nameBn),
          unitPrice: item.unitPrice,
          itemTotal: item.itemTotal,
          specialNotes: item.specialNotes
        })),
        subtotal,
        couponCode: appliedCoupon?.code,
        discountAmount: appliedCoupon?.discount || 0,
        deliveryCharge,
        totalAmount: total,
        paymentMethod,
        paymentTransactionId: paymentTransactionId.trim() || undefined
      };

      const createdOrder = await api.createOrder(orderPayload);
      clearCart();
      onOrderSuccess(createdOrder);
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg('অর্ডার সম্পন্ন করতে সমস্যা হয়েছে। অনুগ্রহ করে ইন্টারনেট সংযোগ চেক করে পুনরায় চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50/60 min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-left">
        {/* Navigation & Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={onBackToMenu}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>মেনুতে ফিরে যান</span>
          </button>
          <span className="text-xs text-slate-500">
            নিরাপদ চেকআউট • ঘরের স্বাদ
          </span>
        </div>

        {/* Advance Pre-Order Notice */}
        <div className="mb-8 bg-white border border-emerald-200/80 rounded-xl p-4 sm:p-5 shadow-xs flex items-start gap-3.5">
          <Clock className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <span className="font-bold text-slate-900 block text-sm mb-1">
              অগ্রিম অর্ডার নীতি (Freshly Prepared Homemade Food)
            </span>
            <p className="text-slate-600">
              {config.advanceNoticeMessageBn}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form Details (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Customer Details */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span>১. গ্রাহকের পরিচয় ও যোগাযোগ</span>
              </h3>
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">
                    পুরো নাম <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="যেমন: তানভীর হাসান"
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-slate-700 block mb-1">
                      মোবাইল নম্বর <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      placeholder="018XXXXXXXX"
                      className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-slate-700 block mb-1">
                      ইমেইল (ঐচ্ছিক)
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={e => setCustomerEmail(e.target.value)}
                      placeholder="customer@gmail.com"
                      className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Address & Zone */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span>২. ডেলিভারি এলাকা ও ঠিকানা</span>
              </h3>
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">
                    ডেলিভারি এলাকা (আড়াইহাজার) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedZone?.id || ''}
                    onChange={e => {
                      const z = deliveryZones.find(dz => dz.id === e.target.value);
                      if (z) setSelectedZone(z);
                    }}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                  >
                    {deliveryZones.map(z => (
                      <option key={z.id} value={z.id}>
                        {z.nameBn} — ডেলিভারি চার্জ ৳{z.charge} (ন্যূনতম অর্ডার ৳{z.minOrderAmount})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">
                    সম্পূর্ণ ঠিকানা (বাসা/রোড/গ্রাম) <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={deliveryAddress}
                    onChange={e => setDeliveryAddress(e.target.value)}
                    placeholder="যেমন: বাড়ি নং ১২, পাইলট হাই স্কুল সংলগ্ন গলি, আড়াইহাজার বাজার"
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">
                    নিকটস্থ পরিচিত স্থান / ল্যান্ডমার্ক (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={deliveryLandmark}
                    onChange={e => setDeliveryLandmark(e.target.value)}
                    placeholder="যেমন: সরকারি হাসপাতালের বিপরীত পাশে"
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* Preferred Delivery Time */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span>৩. ডেলিভারির কাঙ্ক্ষিত তারিখ ও সময়</span>
              </h3>
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-slate-700 block mb-1">
                      অর্ডারের তারিখ
                    </label>
                    <input
                      type="date"
                      value={requestedDate}
                      onChange={e => setRequestedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-slate-700 block mb-1">
                      কাঙ্ক্ষিত ডেলিভারি সময় স্লট
                    </label>
                    <select
                      value={requestedTimeSlot}
                      onChange={e => setRequestedTimeSlot(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                    >
                      <option value="আজ দুপুর ১:৩০ - ২:৩০">আজ দুপুর ১:৩০ - ২:৩০</option>
                      <option value="আজ বিকাল ৪:০০ - ৫:০০">আজ বিকাল ৪:০০ - ৫:০০</option>
                      <option value="আজ সন্ধ্যা ৭:০০ - ৮:০০">আজ সন্ধ্যা ৭:০০ - ৮:০০</option>
                      <option value="আজ রাত ৮:৩০ - ৯:৩০">আজ রাত ৮:৩০ - ৯:৩০</option>
                      <option value="আগামীকাল দুপুর ১:০০ - ২:০০">আগামীকাল দুপুর ১:০০ - ২:০০</option>
                      <option value="আগামীকাল রাত ৮:০০ - ৯:০০">আগামীকাল রাত ৮:০০ - ৯:০০</option>
                    </select>
                  </div>
                </div>

                {/* Urgent Order Checkbox */}
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isUrgent}
                      onChange={e => setIsUrgent(e.target.checked)}
                      className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-amber-900 block">
                        জরুরি ডেলিভারি প্রয়োজন (২-৩ ঘন্টার মধ্যে)
                      </span>
                      <span className="text-amber-800 text-[11px]">
                        জরুরি অর্ডার কিচেনের সক্ষমতা ও অনুমোদনের ওপর নির্ভরশীল। অর্ডারের পর আমাদের টিম ফোন করে নিশ্চিত করবে।
                      </span>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">
                    রান্না বা খাবার সম্পর্কিত বিশেষ নোট (ঐচ্ছিক)
                  </label>
                  <textarea
                    rows={2}
                    value={customerNotes}
                    onChange={e => setCustomerNotes(e.target.value)}
                    placeholder="যেমন: খাবারে ঝাল কম হবে, প্যাকেজিং এ অতিরিক্ত ঢাকনা..."
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span>৪. পেমেন্ট পদ্ধতি নির্বাচন</span>
              </h3>
              <div className="space-y-3 text-xs">
                {/* Cash on Delivery */}
                <label className={`p-3.5 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-emerald-600 bg-emerald-50/40 font-semibold' : 'border-slate-200'}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="text-emerald-600"
                    />
                    <div>
                      <span className="text-slate-900 block">ক্যাশ অন ডেলিভারি (Cash on Delivery)</span>
                      <span className="text-slate-500 font-normal text-[11px]">খাবার হাতে পেয়ে মূল্য পরিশোধ করুন</span>
                    </div>
                  </div>
                  <span className="text-emerald-700 font-medium">প্রস্তাবিত</span>
                </label>

                {/* bKash */}
                <label className={`p-3.5 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${paymentMethod === 'bkash' ? 'border-pink-600 bg-pink-50/40 font-semibold' : 'border-slate-200'}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bkash"
                      checked={paymentMethod === 'bkash'}
                      onChange={() => setPaymentMethod('bkash')}
                      className="text-pink-600"
                    />
                    <div>
                      <span className="text-slate-900 block">বিকাশ (bKash Send Money)</span>
                      <span className="text-slate-500 font-normal text-[11px]">{config.bkashNumber}</span>
                    </div>
                  </div>
                  <span className="text-pink-600 font-bold">bKash</span>
                </label>

                {/* Nagad */}
                <label className={`p-3.5 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${paymentMethod === 'nagad' ? 'border-orange-600 bg-orange-50/40 font-semibold' : 'border-slate-200'}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="nagad"
                      checked={paymentMethod === 'nagad'}
                      onChange={() => setPaymentMethod('nagad')}
                      className="text-orange-600"
                    />
                    <div>
                      <span className="text-slate-900 block">নগদ (Nagad Send Money)</span>
                      <span className="text-slate-500 font-normal text-[11px]">{config.nagadNumber}</span>
                    </div>
                  </div>
                  <span className="text-orange-600 font-bold">Nagad</span>
                </label>

                {/* Rocket */}
                <label className={`p-3.5 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${paymentMethod === 'rocket' ? 'border-purple-600 bg-purple-50/40 font-semibold' : 'border-slate-200'}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="rocket"
                      checked={paymentMethod === 'rocket'}
                      onChange={() => setPaymentMethod('rocket')}
                      className="text-purple-600"
                    />
                    <div>
                      <span className="text-slate-900 block">রকেট (Rocket)</span>
                      <span className="text-slate-500 font-normal text-[11px]">{config.rocketNumber}</span>
                    </div>
                  </div>
                  <span className="text-purple-600 font-bold">Rocket</span>
                </label>

                {/* TrxID Field if mobile banking */}
                {(paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'rocket') && (
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 mt-2 space-y-2">
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      অনুগ্রহ করে উপরের নম্বরে সর্বমোট <strong>৳{total}</strong> টাকা সেন্ড মানি করুন এবং প্রাপ্ত TrxID নিচে লিখুন। অ্যাডমিন যাচাই করে অর্ডারটি নিশ্চিত করবে।
                    </p>
                    <div>
                      <label className="font-semibold text-slate-800 block mb-1">
                        ট্রানজেকশন আইডি (TrxID) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={paymentTransactionId}
                        onChange={e => setPaymentTransactionId(e.target.value.toUpperCase())}
                        placeholder="যেমন: BK9X7721QA"
                        className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-mono uppercase focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-xs sticky top-28">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-3 border-b border-slate-100">
                অর্ডার সংক্ষেপ
              </h3>

              {/* Items List */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {cart.map(item => (
                  <div key={item.cartItemId} className="flex items-center justify-between text-xs gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900 truncate">
                        {item.food.nameBn}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {item.quantity} × ৳{item.unitPrice}
                        {item.selectedVariant ? ` (${item.selectedVariant.nameBn})` : ''}
                      </p>
                    </div>
                    <span className="font-bold text-slate-900 tabular-nums shrink-0">
                      ৳{item.itemTotal}
                    </span>
                  </div>
                ))}
              </div>

              {/* Cost Breakdown */}
              <div className="mt-5 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>সাবটোটাল:</span>
                  <span className="font-semibold text-slate-900 tabular-nums">৳{subtotal}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-700">
                    <span>কুপন ({appliedCoupon.code}):</span>
                    <span className="font-semibold tabular-nums">-৳{appliedCoupon.discount}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>ডেলিভারি চার্জ ({selectedZone?.nameBn || 'আড়াইহাজার'}):</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {deliveryCharge === 0 ? 'ফ্রি ডেলিভারি' : `৳${deliveryCharge}`}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between text-base font-bold text-slate-900">
                  <span>সর্বমোট বিল:</span>
                  <span className="text-emerald-800 tabular-nums">৳{total}</span>
                </div>
              </div>

              {/* Security & Confirmation */}
              <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>অর্ডার সংরক্ষিত হচ্ছে...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>অর্ডার নিশ্চিত করুন (৳{total})</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>কোনো লুকানো চার্জ নেই • শতভাগ নিরাপদ প্রক্রিয়া</span>
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
