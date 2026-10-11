import React, { useState } from 'react';
import { Users, Calendar, MapPin, Phone, MessageSquare, CheckCircle, ShieldCheck, Clock, Sparkles } from 'lucide-react';
import { BusinessConfig, CateringInquiry } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface CateringPageProps {
  config: BusinessConfig;
}

export const CateringPage: React.FC<CateringPageProps> = ({ config }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('দুপুর ১:০০');
  const [eventLocation, setEventLocation] = useState('');
  const [guestCount, setGuestCount] = useState<number>(50);
  const [eventType, setEventType] = useState('পারিবারিক মেহমানদারি ও দাওয়াত');
  const [foodPreferencesBn, setFoodPreferencesBn] = useState('');
  const [approxBudget, setApproxBudget] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedInquiry, setSubmittedInquiry] = useState<CateringInquiry | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!customerName.trim() || !customerPhone.trim() || !eventDate || !eventLocation.trim()) {
      setErrorMsg('অনুগ্রহ করে নাম, মোবাইল নম্বর, অনুষ্ঠানের তারিখ ও স্থান পূরণ করুন।');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.createCateringInquiry({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        eventDate,
        eventTime,
        eventLocation: eventLocation.trim(),
        guestCount: Number(guestCount) || 50,
        eventType,
        foodPreferencesBn: foodPreferencesBn.trim() || 'ঘরোয়া পোলাও, রোস্ট ও ঐতিহ্যবাহী বাঙালি মেনু',
        approxBudget: approxBudget ? Number(approxBudget) : undefined,
        additionalNotes: additionalNotes.trim() || undefined
      });
      setSubmittedInquiry(res);
    } catch {
      setErrorMsg('অনুরোধ পাঠাতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cleanPhone = config.whatsapp.replace(/[^0-9]/g, '');
  const waUrl = submittedInquiry
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`আসসালামু আলাইকুম! ঘরের স্বাদ-এ ক্যাটারিং অনুরোধ (${submittedInquiry.inquiryNumber}) করেছি। মেহমান: ${submittedInquiry.guestCount} জন, তারিখ: ${submittedInquiry.eventDate}। কোটেশন নিয়ে কথা বলতে চাই।`)}`
    : `https://wa.me/${cleanPhone}?text=${encodeURIComponent('আসসালামু আলাইকুম! ঘরের স্বাদ থেকে ক্যাটারিং ও বাল্ক অর্ডার সম্পর্কে জানতে চাচ্ছি।')}`;

  return (
    <div className="bg-slate-50/60 min-h-screen py-12 text-left">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="text-emerald-700 font-semibold text-xs tracking-wider uppercase">
            ক্যাটারিং ও বাল্ক সার্ভিস
          </span>
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 leading-tight">
            যেকোনো পারিবারিক বা অফিস আয়োজনে খাঁটি ঘরোয়া ভোজ
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            বিয়ে, আকিকা, মিলাদ, জন্মদিন, কর্পোরেট মিটিং বা যেকোনো উৎসবে আড়াইহাজার ও ঢাকার যেকোনো স্থানে সম্পূর্ণ স্বাস্থ্যসম্মত ও ঘরোয়া স্বাদে খাবার সরবরাহের দায়িত্ব আমাদের।
          </p>
        </div>

        {submittedInquiry ? (
          /* Confirmation Card */
          <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm text-center space-y-5">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              ক্যাটারিং অনুরোধ সফলভাবে গৃহীত হয়েছে!
            </h3>
            <p className="text-xs text-slate-600">
              আপনার অনুসন্ধান ট্র্যাকিং নম্বর:
            </p>
            <div className="inline-block px-4 py-2 bg-slate-100 rounded-lg font-mono text-base font-bold text-emerald-800">
              {submittedInquiry.inquiryNumber}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
              আমাদের ক্যাটারিং স্পেশালিস্ট <strong>{config.contactPerson}</strong> আপনার সাথে শীঘ্রই ফোনে যোগাযোগ করে সঠিক কোটেশন ও মেনু পরিকল্পনা চূড়ান্ত করবেন।
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>হোয়াটসঅ্যাপে কোটেশন নিশ্চিত করুন</span>
              </a>
              <button
                onClick={() => setSubmittedInquiry(null)}
                className="w-full sm:w-auto px-5 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-medium hover:bg-slate-50 transition-colors"
              >
                নতুন অনুরোধ পাঠান
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Information & Trust Cards (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-slate-900">
                  আমরা যেসব অনুষ্ঠানে সেবা প্রদান করি:
                </h3>
                <ul className="space-y-3 text-xs text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>পারিবারিক অনুষ্ঠান:</strong> বিয়ে, গায়ে হলুদ, আকিকা, খতনা ও জন্মদিন।</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>অফিস ও কর্পোরেট:</strong> বার্ষিক সভা, সেমিনার ও নিয়মিত অফিস লাঞ্চ প্যাক।</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>ধর্মীয় ও সামাজিক আয়োজন:</strong> মিলাদ মাহফিল, দোয়া ও স্মৃতিচারণ সভা।</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>বিশেষ পিকনিক ও গেট টুগেদার:</strong> যেকোনো স্থানে গরম ও তাজা খাবারের ডেলিভারি।</span>
                  </li>
                </ul>
              </div>

              {/* Advance Booking Policy */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-6 text-xs text-emerald-950 space-y-3">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                  <Clock className="w-4 h-4" />
                  <span>অগ্রিম বুকিং ও প্রস্তুতি নির্দেশিকা</span>
                </div>
                <p className="leading-relaxed">
                  যেহেতু আমাদের প্রতিটি খাবার সম্পূর্ণ ঘরোয়াভাবে এবং অভিজ্ঞ গৃহিণীদের তত্ত্বাবধানে রান্না হয়, তাই ৫০-৩০০ জনের যেকোনো আয়োজনে ন্যূনতম ২-৩ দিন পূর্বে যোগাযোগ করে বুকিং নিশ্চিত করার অনুরোধ করা হচ্ছে।
                </p>
                <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between font-semibold text-emerald-800">
                  <span>সরাসরি কল করুন:</span>
                  <a href={`tel:${config.phone}`} className="underline font-mono">
                    {config.phone}
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Inquiry Form (7 cols) */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  ক্যাটারিং কোটেশন ফরম
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  অনুগ্রহ করে অনুষ্ঠানের বিবরণ দিন, আমরা দ্রুত যোগাযোগ করে কাস্টমাইজড কোটেশন প্রদান করব।
                </p>

                {errorMsg && (
                  <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        আপনার নাম <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        placeholder="নাম লিখুন"
                        className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        মোবাইল নম্বর <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={e => setCustomerPhone(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        অনুষ্ঠানের তারিখ <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={eventDate}
                        onChange={e => setEventDate(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        সময়
                      </label>
                      <input
                        type="text"
                        value={eventTime}
                        onChange={e => setEventTime(e.target.value)}
                        placeholder="যেমন: দুপুর ১:৩০"
                        className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        মেহমান সংখ্যা (আনুমানিক) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        min={10}
                        max={1000}
                        required
                        value={guestCount}
                        onChange={e => setGuestCount(Number(e.target.value))}
                        className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        অনুষ্ঠানের ধরণ
                      </label>
                      <select
                        value={eventType}
                        onChange={e => setEventType(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                      >
                        <option value="পারিবারিক মেহমানদারি ও দাওয়াত">পারিবারিক মেহমানদারি ও দাওয়াত</option>
                        <option value="বিয়ে ও গায়ে হলুদ">বিয়ে ও গায়ে হলুদ</option>
                        <option value="আকিকা ও জন্মদিন">আকিকা ও জন্মদিন</option>
                        <option value="মিলাদ ও দোয়া মাহফিল">মিলাদ ও দোয়া মাহফিল</option>
                        <option value="অফিস ও কর্পোরেট ইভেন্ট">অফিস ও কর্পোরেট ইভেন্ট</option>
                        <option value="অন্যান্য বড় আয়োজন">অন্যান্য বড় আয়োজন</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        আনুমানিক বাজেট (ঐচ্ছিক)
                      </label>
                      <input
                        type="number"
                        value={approxBudget}
                        onChange={e => setApproxBudget(e.target.value)}
                        placeholder="যেমন: ২৫০০০ ৳"
                        className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      অনুষ্ঠানের সুনির্দিষ্ট ঠিকানা / এলাকা <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={eventLocation}
                      onChange={e => setEventLocation(e.target.value)}
                      placeholder="বাড়ি/কমিউনিটি সেন্টার, থানা/ইউনিয়ন (যেমন: গোপালদী বাজার, আড়াইহাজার)"
                      className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      কাঙ্ক্ষিত খাবারের মেনু বা পছন্দ
                    </label>
                    <textarea
                      rows={3}
                      value={foodPreferencesBn}
                      onChange={e => setFoodPreferencesBn(e.target.value)}
                      placeholder="যেমন: কাচ্চি বিরিয়ানি অথবা পোলাও-রোস্ট, রুই মাছ ভাজা, বোরহানি, ফিরনি ইত্যাদি..."
                      className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      অতিরিক্ত তথ্য বা সার্ভিসিং চাহিদা (ঐচ্ছিক)
                    </label>
                    <textarea
                      rows={2}
                      value={additionalNotes}
                      onChange={e => setAdditionalNotes(e.target.value)}
                      placeholder="যেমন: ডিসপোজেবল বক্স দরকার, ওয়েটার সার্ভিস প্রয়োজন..."
                      className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
                  >
                    {isSubmitting ? 'প্রস্তুত হচ্ছে...' : 'কোটেশন অনুরোধ পাঠান'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
