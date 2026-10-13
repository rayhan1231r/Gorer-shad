import React, { useState, useEffect } from 'react';
import { Search, Check, AlertCircle, Phone, MessageSquare, Truck } from 'lucide-react';
import { Order, OrderStatus, BusinessConfig } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface TrackOrderPageProps {
  initialOrderNumber?: string;
  config: BusinessConfig;
}

export const TrackOrderPage: React.FC<TrackOrderPageProps> = ({ initialOrderNumber, config }) => {
  const { language, t, formatPrice, getOrderStatusText, getOrderStatusDesc } = useLanguage();
  const [query, setQuery] = useState(initialOrderNumber || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialOrderNumber) {
      handleSearch(initialOrderNumber);
    }
  }, [initialOrderNumber]);

  const handleSearch = async (targetQuery?: string) => {
    const q = (targetQuery || query).trim();
    if (!q) {
      setErrorMsg(language === 'en' ? 'Please enter Order Number or Phone Number.' : 'অর্ডার নম্বর অথবা মোবাইল নম্বর লিখুন।');
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (q.toUpperCase().startsWith('GS-') || q.startsWith('ord-')) {
        const res = await api.getOrder(q);
        setOrder(res);
      } else {
        const results = await api.getOrders(q);
        if (results.length > 0) {
          setOrder(results[0]);
        } else {
          setOrder(null);
          setErrorMsg(language === 'en' ? 'No order found with this phone number.' : 'এই নম্বরে কোনো অর্ডার পাওয়া যায়নি।');
        }
      }
    } catch {
      setOrder(null);
      setErrorMsg(language === 'en' ? 'Order not found. Please enter valid Order Number (e.g. GS-2601).' : 'অর্ডারটি খুঁজে পাওয়া যায়নি। সঠিক অর্ডার নম্বর দিন (যেমন: GS-2601)।');
    } finally {
      setIsLoading(false);
    }
  };

  const steps: OrderStatus[] = [
    'placed',
    'accepted',
    'preparing',
    'ready',
    'out_for_delivery',
    'delivered'
  ];

  const getStepIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'placed': return 0;
      case 'accepted': return 1;
      case 'preparing': return 2;
      case 'ready': return 3;
      case 'out_for_delivery': return 4;
      case 'delivered': return 5;
      case 'cancelled':
      case 'rejected': return -1;
      default: return 0;
    }
  };

  const currentStepIdx = order ? getStepIndex(order.orderStatus) : -1;
  const isTerminated = order?.orderStatus === 'cancelled' || order?.orderStatus === 'rejected';

  return (
    <div className="bg-slate-50/60 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-left">
        {/* Title */}
        <div className="mb-8 text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {language === 'en' ? 'Track Your Order Live' : 'অর্ডার ট্র্যাকিং'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {language === 'en'
              ? 'Enter your Order Number (e.g. GS-2601) or Mobile Number to check real-time status'
              : 'আপনার অর্ডার নম্বর (যেমন: GS-2601) বা ফোন নম্বর দিয়ে বর্তমান অবস্থা জানুন'}
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs mb-8">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={t('orderSearchPlaceholder')}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-600 bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              {isLoading ? (language === 'en' ? 'Searching...' : 'খোঁজা হচ্ছে...') : t('trackNowBtn')}
            </button>
          </form>

          {errorMsg && (
            <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Order Result Card */}
        {order && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-xs text-slate-400 block">{language === 'en' ? 'Order No:' : 'অর্ডার নং:'}</span>
                <span className="text-xl font-mono font-bold text-emerald-800">
                  {order.orderNumber}
                </span>
                <p className="text-xs text-slate-500 mt-1">
                  {language === 'en' ? 'Customer:' : 'গ্রাহক:'} <strong>{order.customerName}</strong> ({order.customerPhone})
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-slate-400 block">{language === 'en' ? 'Preferred Delivery Time:' : 'কাঙ্ক্ষিত সময়:'}</span>
                <span className="text-sm font-semibold text-slate-900 block">
                  {order.requestedTimeSlot}
                </span>
                <span className="text-xs text-slate-500">{language === 'en' ? 'Date:' : 'তারিখ:'} {order.requestedDate}</span>
              </div>
            </div>

            {/* Cancelled / Rejected State Banner */}
            {isTerminated ? (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
                <span className="font-bold block text-sm mb-1">
                  {language === 'en'
                    ? `This order was ${order.orderStatus === 'cancelled' ? 'Cancelled' : 'Rejected'}`
                    : `অর্ডারটি ${order.orderStatus === 'cancelled' ? 'বাতিল' : 'প্রত্যাখ্যাত'} করা হয়েছে`}
                </span>
                <p>
                  {language === 'en'
                    ? `For inquiries, please contact our hotline directly (${config.phone}) or message us on WhatsApp.`
                    : `বিস্তারিত জানতে আমাদের হটলাইনে (${config.phone}) অথবা হোয়াটসঅ্যাপে যোগাযোগ করুন।`}
                </p>
              </div>
            ) : (
              /* Timeline */
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-6">
                  {language === 'en' ? 'Live Delivery Progress Timeline' : 'লাইভ ডেলিভারি অগ্রগতি'}
                </h4>
                <div className="relative">
                  {/* Vertical / Responsive Stepper */}
                  <div className="space-y-6">
                    {steps.map((stepKey, idx) => {
                      const isCompleted = idx <= currentStepIdx;
                      const isCurrent = idx === currentStepIdx;
                      const label = getOrderStatusText(stepKey);
                      const desc = getOrderStatusDesc(stepKey);

                      return (
                        <div key={stepKey} className="flex items-start gap-4 relative">
                          {/* Indicator line */}
                          {idx < steps.length - 1 && (
                            <div
                              className={`absolute left-3.5 top-7 bottom-0 w-0.5 -mb-6 ${
                                idx < currentStepIdx ? 'bg-emerald-600' : 'bg-slate-200'
                              }`}
                            />
                          )}

                          {/* Dot / Icon */}
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${
                              isCurrent
                                ? 'bg-emerald-700 text-white ring-4 ring-emerald-100'
                                : isCompleted
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-400 border border-slate-300'
                            }`}
                          >
                            {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                          </div>

                          <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex items-center justify-between gap-2">
                              <h5 className={`text-sm font-semibold ${isCurrent ? 'text-emerald-800 font-bold' : isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                                {label}
                              </h5>
                              {isCurrent && (
                                <span className="bg-emerald-50 text-emerald-700 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                                  {language === 'en' ? 'In Progress' : 'চলমান অবস্থা'}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Rider & Delivery Info if assigned */}
            {order.assignedDeliveryPerson && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">{language === 'en' ? 'Assigned Delivery Rider:' : 'দায়িত্বপ্রাপ্ত ডেলিভারিম্যান:'}</span>
                    <span className="font-semibold text-slate-900">{order.assignedDeliveryPerson}</span>
                  </div>
                </div>
                <a
                  href={`tel:${config.phone}`}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 font-medium"
                >
                  {language === 'en' ? 'Call Helpline' : 'হেল্পলাইন কল'}
                </a>
              </div>
            )}

            {/* Order Items & Breakdown */}
            <div className="border-t border-slate-100 pt-6 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                {language === 'en' ? 'Order Summary' : 'অর্ডার সংক্ষেপ'}
              </h4>
              <div className="divide-y divide-slate-100 text-xs">
                {order.items.map((it, idx) => (
                  <div key={idx} className="py-2 flex justify-between">
                    <div>
                      <span className="font-medium text-slate-800">
                        {language === 'en' ? (it.nameEn || it.nameBn) : it.nameBn}
                      </span>
                      <span className="text-slate-500 ml-2">× {it.quantity}</span>
                      {it.selectedVariantName && (
                        <span className="text-[11px] text-slate-400 block">{it.selectedVariantName}</span>
                      )}
                    </div>
                    <span className="font-bold text-slate-900 tabular-nums">{formatPrice(it.itemTotal)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200">
                <span>{language === 'en' ? 'Total Payable:' : 'সর্বমোট পরিশোধযোগ্য:'}</span>
                <span className="text-emerald-800 tabular-nums">{formatPrice(order.totalAmount)}</span>
              </div>
              <p className="text-[11px] text-slate-500">
                {language === 'en' ? 'Payment:' : 'পেমেন্ট:'} {order.paymentMethod.toUpperCase()} • {language === 'en' ? 'Status:' : 'অবস্থা:'} {order.paymentStatus === 'paid' ? (language === 'en' ? 'Paid' : 'পরিশোধিত') : (language === 'en' ? 'Pending' : 'অপেক্ষমান')}
              </p>
            </div>

            {/* Contact Support Footer */}
            <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-slate-600">
                {language === 'en' ? 'For any inquiry or changes, contact us directly:' : 'কোনো জিজ্ঞাসা বা সংশোধনের জন্য কল করুন:'}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${config.phone}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold hover:bg-slate-50"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{config?.phone || '01857-220603'}</span>
                </a>
                <a
                  href={`https://wa.me/${String(config?.whatsapp || '+8801912838891').replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 text-white rounded-lg font-semibold hover:bg-emerald-800 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'WhatsApp' : 'হোয়াটসঅ্যাপ'}</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
