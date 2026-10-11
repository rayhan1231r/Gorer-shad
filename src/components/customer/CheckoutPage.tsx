import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Clock,
  MapPin,
  Phone,
  CreditCard,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Truck,
  Copy,
  Check,
  Globe,
  Sparkles,
  Building,
  Smartphone,
  Banknote
} from 'lucide-react';
import { useCart } from '../../context/CartContext.tsx';
import { BusinessConfig, Order, PaymentMethod, PaymentMethodConfig, DeliveryZone } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { BD_DIVISIONS, BD_DISTRICTS, District } from '../../data/bangladeshLocations.ts';

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

  // Nationwide location states
  const [selectedDivision, setSelectedDivision] = useState('dhaka');
  const [selectedDistrict, setSelectedDistrict] = useState('narayanganj');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryLandmark, setDeliveryLandmark] = useState('');
  const [requestedDate, setRequestedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [requestedTimeSlot, setRequestedTimeSlot] = useState('আজ দুপুর ১:৩০ - ২:৩০');
  const [isUrgent, setIsUrgent] = useState(false);
  const [customerNotes, setCustomerNotes] = useState('');

  // Payment Methods
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<PaymentMethodConfig[]>([]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>('pm-cod');
  const [paymentTransactionId, setPaymentTransactionId] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load User and Payment Methods on mount
  useEffect(() => {
    Promise.all([
      api.getCurrentUser().catch(() => null),
      api.getPaymentMethods(true).catch(() => [])
    ]).then(([user, methods]) => {
      if (user) {
        if (user.name) setCustomerName(user.name);
        if (user.email) setCustomerEmail(user.email);
        if (user.phone) setCustomerPhone(user.phone);
        if (user.addresses && user.addresses[0]) setDeliveryAddress(user.addresses[0]);
      }
      if (methods && methods.length > 0) {
        setAvailablePaymentMethods(methods);
        const defaultMethod = methods.find(m => m.isActive) || methods[0];
        setSelectedPaymentMethodId(defaultMethod.id);
      }
    });
  }, []);

  // Update delivery zone based on division & district
  useEffect(() => {
    const dist = BD_DISTRICTS.find(d => d.id === selectedDistrict);
    if (!dist) return;

    if (dist.zoneType === 'local') {
      const localZone = deliveryZones.find(z => z.id === 'zone-1' || z.zoneScope === 'local');
      if (localZone) setSelectedZone(localZone);
    } else if (dist.zoneType === 'dhaka_city') {
      const cityZone = deliveryZones.find(z => z.id === 'zone-dhaka-city' || z.zoneScope === 'dhaka_city');
      if (cityZone) setSelectedZone(cityZone);
    } else if (dist.zoneType === 'dhaka_suburb') {
      const suburbZone = deliveryZones.find(z => z.id === 'zone-dhaka-suburb' || z.zoneScope === 'dhaka_suburb');
      if (suburbZone) setSelectedZone(suburbZone);
    } else {
      const nationwideZone =
        deliveryZones.find(z => z.division === selectedDivision) ||
        deliveryZones.find(z => z.id === 'zone-all-bangladesh' || z.zoneScope === 'nationwide');
      if (nationwideZone) setSelectedZone(nationwideZone);
    }
  }, [selectedDivision, selectedDistrict, deliveryZones]);

  const activeMethod = availablePaymentMethods.find(m => m.id === selectedPaymentMethodId);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">আপনার ব্যাগ খালি</h2>
        <p className="text-slate-500 text-sm mb-6">অর্ডার করার জন্য প্রথমে মেনু থেকে পছন্দের খাবার ব্যাগে যোগ করুন।</p>
        <button
          onClick={onBackToMenu}
          className="px-6 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-semibold hover:bg-emerald-800 transition-colors shadow-xs"
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
      setErrorMsg('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 018XXXXXXXX)।');
      return;
    }
    if (!deliveryAddress.trim()) {
      setErrorMsg('ডেলিভারির সম্পূর্ণ ঠিকানা লিখুন (বাসা/রোড/এলাকা)।');
      return;
    }
    if (selectedZone && subtotal < selectedZone.minOrderAmount) {
      setErrorMsg(`এই এলাকায় সর্বনিম্ন অর্ডারের পরিমাণ ৳${selectedZone.minOrderAmount} টাকা।`);
      return;
    }
    if (activeMethod?.requiresTransactionId && !paymentTransactionId.trim()) {
      setErrorMsg(`মোবাইল ব্যাংকিং বা অনলাইন পেমেন্টের ক্ষেত্রে ট্রানজেকশন আইডি (TrxID) দেওয়া আবশ্যক।`);
      return;
    }

    const divisionObj = BD_DIVISIONS.find(d => d.id === selectedDivision);
    const districtObj = BD_DISTRICTS.find(d => d.id === selectedDistrict);

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
        division: divisionObj ? `${divisionObj.nameBn} (${divisionObj.nameEn})` : selectedDivision,
        district: districtObj ? `${districtObj.nameBn} (${districtObj.nameEn})` : selectedDistrict,
        courierPartner: selectedZone?.courierPartner || 'Steadfast / Pathao Courier',
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
        paymentMethod: activeMethod ? (activeMethod.type as PaymentMethod) : 'cod',
        paymentMethodTitle: activeMethod ? activeMethod.nameBn : 'ক্যাশ অন ডেলিভারি',
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

  const currentDistricts = BD_DISTRICTS.filter(d => d.divisionId === selectedDivision);

  return (
    <div className="bg-[#F8FAF7] min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-left">
        {/* Navigation & Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={onBackToMenu}
            className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>মেনুতে ফিরে যান</span>
          </button>
          <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>নিরাপদ চেকআউট • ঘরের স্বাদ</span>
          </div>
        </div>

        {/* Nationwide Bangladesh Delivery Notice Banner */}
        <div className="mb-6 bg-white border border-emerald-200 rounded-2xl p-4 sm:p-5 shadow-xs flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0 mt-0.5">
            <Truck className="w-5 h-5" />
          </div>
          <div className="text-xs leading-relaxed">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">
                সারা বাংলাদেশে (সকল ৬৪ জেলায়) হোম ডেলিভারি ও কুরিয়ার সুবিধা
              </span>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Nationwide
              </span>
            </div>
            <p className="text-slate-600 mt-1">
              আড়াইহাজার ও নারায়ণগঞ্জে নিজস্ব রাইডার দ্বারা গরম খাবার সরাসরি হোম ডেলিভারি। ঢাকা মহানগর এবং দেশের অন্যান্য সকল জেলায় (চট্টগ্রাম, সিলেট, রাজশাহী, খুলনা, বরিশাল, রংপুর, ময়মনসিংহ) পার্সেল ও ফুড আইটেম কুরিয়ার সার্ভিসের মাধ্যমে দ্রুত ও নিরাপদে পৌঁছে দেওয়া হয়।
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form: Inputs */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Customer Contact Info */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs">১</span>
                <span>গ্রাহকের তথ্য ও মোবাইল নম্বর</span>
              </h3>
              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    আপনার পুরো নাম <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="যেমন: মো. নাজমুল ইসলাম"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      মোবাইল নম্বর <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      placeholder="018XXXXXXXX"
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      ইমেইল (ঐচ্ছিক)
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={e => setCustomerEmail(e.target.value)}
                      placeholder="customer@gmail.com"
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Delivery Area Across Entire Bangladesh */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs">২</span>
                <span>ডেলিভারি এলাকা ও ঠিকানা (সারা বাংলাদেশ)</span>
              </h3>

              <div className="space-y-3.5 text-xs">
                {/* Division & District Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      বিভাগ (Division) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedDivision}
                      onChange={e => {
                        const newDiv = e.target.value;
                        setSelectedDivision(newDiv);
                        const firstDist = BD_DISTRICTS.find(d => d.divisionId === newDiv);
                        if (firstDist) setSelectedDistrict(firstDist.id);
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white font-medium"
                    >
                      {BD_DIVISIONS.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.nameBn} ({d.nameEn})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      জেলা / শহর (District) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedDistrict}
                      onChange={e => setSelectedDistrict(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white font-medium"
                    >
                      {currentDistricts.map(dist => (
                        <option key={dist.id} value={dist.id}>
                          {dist.nameBn} ({dist.deliveryTime})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Specific Delivery Zone Dropdown */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    ডেলিভারি জোন ও চার্জ নির্ধারণ
                  </label>
                  <select
                    value={selectedZone?.id || ''}
                    onChange={e => {
                      const z = deliveryZones.find(dz => dz.id === e.target.value);
                      if (z) setSelectedZone(z);
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white font-medium"
                  >
                    {deliveryZones.map(z => (
                      <option key={z.id} value={z.id}>
                        {z.nameBn} — ডেলিভারি চার্জ ৳{z.charge} (ন্যূনতম অর্ডার ৳{z.minOrderAmount})
                      </option>
                    ))}
                  </select>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    আনুমানিক সময়: <strong>{selectedZone?.estimatedDeliveryMinutes}</strong> {selectedZone?.courierPartner ? `• কুরিয়ার: ${selectedZone.courierPartner}` : ''}
                  </span>
                </div>

                {/* Address Textarea */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    সম্পূর্ণ বিস্তারিত ঠিকানা (বাসা/রোড/থানা/গ্রাম) <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={deliveryAddress}
                    onChange={e => setDeliveryAddress(e.target.value)}
                    placeholder="যেমন: বাড়ি নং ১২, রোড নং ৪, আড়াইহাজার বাজার / উত্তরা সেক্টর ৩, ঢাকা..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    পরিচিত ল্যান্ডমার্ক / নিকটস্থ স্থান (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={deliveryLandmark}
                    onChange={e => setDeliveryLandmark(e.target.value)}
                    placeholder="যেমন: সরকারি হাসপাতালের বিপরীতে, সোনালী ব্যাংকের পাশে"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Date & Time slot */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs">৩</span>
                <span>কাঙ্ক্ষিত ডেলিভারির তারিখ ও সময়</span>
              </h3>
              <div className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      ডেলিভারির তারিখ
                    </label>
                    <input
                      type="date"
                      value={requestedDate}
                      onChange={e => setRequestedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      সময় স্লট
                    </label>
                    <select
                      value={requestedTimeSlot}
                      onChange={e => setRequestedTimeSlot(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                    >
                      <option value="আজ দুপুর ১:৩০ - ২:৩০">আজ দুপুর ১:৩০ - ২:৩০</option>
                      <option value="আজ বিকাল ৪:০০ - ৫:০০">আজ বিকাল ৪:০০ - ৫:০০</option>
                      <option value="আজ সন্ধ্যা ৭:০০ - ৮:০০">আজ সন্ধ্যা ৭:০০ - ৮:০০</option>
                      <option value="আজ রাত ৮:৩০ - ৯:৩০">আজ রাত ৮:৩০ - ৯:৩০</option>
                      <option value="আগামীকাল দুপুর ১:০০ - ২:০০">আগামীকাল দুপুর ১:০০ - ২:০০</option>
                      <option value="আগামীকাল রাত ৮:০০ - ৯:০০">আগামীকাল রাত ৮:০০ - ৯:০০</option>
                      <option value="যেকোনো সময় (কুরিয়ার সময়সূচী অনুযায়ী)">যেকোনো সময় (কুরিয়ার সময়সূচী অনুযায়ী)</option>
                    </select>
                  </div>
                </div>

                {/* Urgent Checkbox */}
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isUrgent}
                      onChange={e => setIsUrgent(e.target.checked)}
                      className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-amber-900 block">
                        জরুরি এক্সপ্রেস ডেলিভারি (২-৩ ঘন্টার মধ্যে)
                      </span>
                      <span className="text-amber-800 text-[11px]">
                        জরুরি অর্ডার কিচেনের সক্ষমতা ও আড়াইহাজার/ঢাকা মেট্রোর আওতাধীন।
                      </span>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    খাবার বা প্যাকেজিং সংক্রান্ত বিশেষ নোট (ঐচ্ছিক)
                  </label>
                  <textarea
                    rows={2}
                    value={customerNotes}
                    onChange={e => setCustomerNotes(e.target.value)}
                    placeholder="যেমন: ঝাল কম হবে, অতিরিক্ত কাঁচামরিচ..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Step 4: Dynamic Payment Methods (From Admin Config) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs">৪</span>
                <span>পেমেন্ট পদ্ধতি নির্বাচন</span>
              </h3>

              <div className="space-y-2.5 text-xs">
                {availablePaymentMethods.length === 0 ? (
                  /* Fallback if still loading */
                  <div className="p-3 text-slate-400">পেমেন্ট মেথড লোড হচ্ছে...</div>
                ) : (
                  availablePaymentMethods.map(pm => {
                    const isSelected = selectedPaymentMethodId === pm.id;
                    return (
                      <label
                        key={pm.id}
                        className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/40 shadow-2xs font-semibold'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="checkoutPaymentMethod"
                            checked={isSelected}
                            onChange={() => {
                              setSelectedPaymentMethodId(pm.id);
                              setPaymentTransactionId('');
                            }}
                            className="text-emerald-700"
                          />
                          <div>
                            <span className="text-slate-900 block font-bold">{pm.nameBn}</span>
                            {pm.accountNumber && pm.accountNumber !== 'N/A' && (
                              <span className="text-slate-500 font-mono text-[11px] block">
                                {pm.accountType ? `[${pm.accountType}] ` : ''}{pm.accountNumber}
                              </span>
                            )}
                          </div>
                        </div>

                        {pm.type === 'cod' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            প্রস্তাবিত
                          </span>
                        )}
                        {pm.chargePercentage !== undefined && pm.chargePercentage > 0 && (
                          <span className="text-[11px] text-slate-400">
                            +{pm.chargePercentage}% Fee
                          </span>
                        )}
                      </label>
                    );
                  })
                )}

                {/* Selected Method Detail & Instructions Box */}
                {activeMethod && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 mt-3">
                    {activeMethod.accountNumber !== 'N/A' && (
                      <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                        <div>
                          <span className="text-[10px] uppercase text-slate-400 font-bold block">
                            পেমেন্ট নম্বর / হিসাব
                          </span>
                          <span className="font-mono font-bold text-slate-900 text-sm">
                            {activeMethod.accountNumber}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(activeMethod.accountNumber, activeMethod.id)}
                          className="px-2.5 py-1 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-md font-semibold flex items-center gap-1 transition-colors"
                        >
                          {copiedId === activeMethod.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedId === activeMethod.id ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                        </button>
                      </div>
                    )}

                    {activeMethod.instructionsBn && (
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {activeMethod.instructionsBn}
                      </p>
                    )}

                    {activeMethod.requiresTransactionId && (
                      <div>
                        <label className="font-bold text-slate-800 block mb-1">
                          ট্রানজেকশন আইডি (TrxID) প্রদান করুন <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={paymentTransactionId}
                          onChange={e => setPaymentTransactionId(e.target.value)}
                          placeholder="যেমন: 9J3K4L2M বা ট্রানজেকশন রেফারেন্স"
                          className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white font-mono uppercase"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Summary: Sticky Cart & Submit */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs sticky top-24 space-y-5 text-xs">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
                অর্ডার সারাংশ ({cart.length} টি পদ)
              </h3>

              {/* Items List */}
              <div className="space-y-3 max-h-60 overflow-y-auto divide-y divide-slate-100 pr-1">
                {cart.map(item => (
                  <div key={item.cartItemId} className="pt-2.5 first:pt-0 flex items-start justify-between gap-3">
                    <div>
                      <span className="font-bold text-slate-900 block">
                        {item.food.nameBn} <span className="text-emerald-700">× {item.quantity}</span>
                      </span>
                      {item.selectedVariant && (
                        <span className="text-[11px] text-slate-500 block">
                          সাইজ: {item.selectedVariant.nameBn}
                        </span>
                      )}
                      {item.selectedAddons.length > 0 && (
                        <span className="text-[11px] text-slate-400 block">
                          অ্যাড-অন: {item.selectedAddons.map(a => a.nameBn).join(', ')}
                        </span>
                      )}
                    </div>
                    <span className="font-bold tabular-nums text-slate-900 shrink-0">
                      ৳{item.itemTotal}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="pt-3 border-t border-slate-100 space-y-2 text-slate-600">
                <div className="flex justify-between">
                  <span>খাবারের মোট মূল্য:</span>
                  <span className="font-semibold text-slate-900 tabular-nums">৳{subtotal}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>কুপন ছাড় ({appliedCoupon.code}):</span>
                    <span className="tabular-nums">-৳{appliedCoupon.discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>ডেলিভারি ফি ({selectedZone?.nameBn}):</span>
                  <span className="font-semibold text-slate-900 tabular-nums">৳{deliveryCharge}</span>
                </div>
                <div className="pt-3 border-t border-slate-200 flex justify-between text-base font-bold text-slate-900">
                  <span>সর্বমোট প্রদেয়:</span>
                  <span className="text-emerald-800 tabular-nums text-lg">৳{total}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>অর্ডার প্রসেস হচ্ছে...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>অর্ডার নিশ্চিত করুন (৳{total})</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-[11px] text-slate-400 space-y-1">
                <p>🔒 নিরাপদ পেমেন্ট ও খাঁটি ঘরোয়া স্বাদের নিশ্চয়তা</p>
                <p>আড়াইহাজার সদর, ঢাকা • কল: 01857-220603</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
