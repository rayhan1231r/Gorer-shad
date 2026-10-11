import React, { useState, useEffect } from 'react';
import { Search, Package, Clock, CheckCircle2, Truck, Check, AlertCircle, Phone, MessageSquare } from 'lucide-react';
import { Order, OrderStatus, BusinessConfig } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface TrackOrderPageProps {
  initialOrderNumber?: string;
  config: BusinessConfig;
}

export const TrackOrderPage: React.FC<TrackOrderPageProps> = ({ initialOrderNumber, config }) => {
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
      setErrorMsg('অর্ডার নম্বর অথবা মোবাইল নম্বর লিখুন।');
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
          setErrorMsg('এই নম্বরে কোনো অর্ডার পাওয়া যায়নি।');
        }
      }
    } catch {
      setOrder(null);
      setErrorMsg('অর্ডারটি খুঁজে পাওয়া যায়নি। সঠিক অর্ডার নম্বর দিন (যেমন: GS-2601)।');
    } finally {
      setIsLoading(false);
    }
  };

  const steps: { key: OrderStatus; labelBn: string; descBn: string }[] = [
    { key: 'placed', labelBn: 'অর্ডার গৃহীত', descBn: 'অর্ডার সিস্টেমে গৃহীত হয়েছে' },
    { key: 'accepted', labelBn: 'নিশ্চিত করা হয়েছে', descBn: 'কিচেন টিম নিশ্চিত করেছে' },
    { key: 'preparing', labelBn: 'রান্না হচ্ছে', descBn: 'খাঁটি ঘরোয়া মশলায় রান্না চলছে' },
    { key: 'ready', labelBn: 'প্যাকেজিং প্রস্তুত', descBn: 'ডেলিভারি ব্যাগে প্যাক করা হচ্ছে' },
    { key: 'out_for_delivery', labelBn: 'ডেলিভারির পথে', descBn: 'রাইডার আপনার ঠিকানার দিকে রওনা দিয়েছেন' },
    { key: 'delivered', labelBn: 'ডেলিভার সম্পন্ন', descBn: 'গ্রাহকের নিকট সফলভাবে পৌঁছেছে' },
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
            অর্ডার ট্র্যাকিং
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            আপনার অর্ডার নম্বর (যেমন: GS-2601) বা ফোন নম্বর দিয়ে বর্তমান অবস্থা জানুন
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
                placeholder="অর্ডার নম্বর (GS-2601) অথবা মোবাইল নম্বর..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-600 bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs"
            >
              {isLoading ? 'খোঁজা হচ্ছে...' : 'অবস্থা দেখুন'}
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
                <span className="text-xs text-slate-400 block">অর্ডার নং:</span>
                <span className="text-xl font-mono font-bold text-emerald-800">
                  {order.orderNumber}
                </span>
                <p className="text-xs text-slate-500 mt-1">
                  গ্রাহক: <strong>{order.customerName}</strong> ({order.customerPhone})
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-slate-400 block">কাঙ্ক্ষিত সময়:</span>
                <span className="text-sm font-semibold text-slate-900 block">
                  {order.requestedTimeSlot}
                </span>
                <span className="text-xs text-slate-500">তারিখ: {order.requestedDate}</span>
              </div>
            </div>

            {/* Cancelled / Rejected State Banner */}
            {isTerminated ? (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
                <span className="font-bold block text-sm mb-1">
                  অর্ডারটি {order.orderStatus === 'cancelled' ? 'বাতিল' : 'প্রত্যাখ্যাত'} করা হয়েছে
                </span>
                <p>
                  বিস্তারিত জানতে আমাদের হটলাইনে (01857-220603) অথবা হোয়াটসঅ্যাপে যোগাযোগ করুন।
                </p>
              </div>
            ) : (
              /* Timeline */
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-6">
                  লাইভ ডেলিভারি অগ্রগতি
                </h4>
                <div className="relative">
                  {/* Vertical / Responsive Stepper */}
                  <div className="space-y-6">
                    {steps.map((step, idx) => {
                      const isCompleted = idx <= currentStepIdx;
                      const isCurrent = idx === currentStepIdx;

                      return (
                        <div key={step.key} className="flex items-start gap-4 relative">
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
                                {step.labelBn}
                              </h5>
                              {isCurrent && (
                                <span className="bg-emerald-50 text-emerald-700 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                                  চলমান অবস্থা
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {step.descBn}
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
                    <span className="text-slate-400 block text-[11px]">দায়িত্বপ্রাপ্ত ডেলিভারিম্যান:</span>
                    <span className="font-semibold text-slate-900">{order.assignedDeliveryPerson}</span>
                  </div>
                </div>
                <a
                  href={`tel:${config.phone}`}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 font-medium"
                >
                  হেল্পলাইন কল
                </a>
              </div>
            )}

            {/* Order Items & Breakdown */}
            <div className="border-t border-slate-100 pt-6 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                অর্ডার সংক্ষেপ
              </h4>
              <div className="divide-y divide-slate-100 text-xs">
                {order.items.map((it, idx) => (
                  <div key={idx} className="py-2 flex justify-between">
                    <div>
                      <span className="font-medium text-slate-800">{it.nameBn}</span>
                      <span className="text-slate-500 ml-2">× {it.quantity}</span>
                      {it.selectedVariantName && (
                        <span className="text-[11px] text-slate-400 block">{it.selectedVariantName}</span>
                      )}
                    </div>
                    <span className="font-bold text-slate-900 tabular-nums">৳{it.itemTotal}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200">
                <span>সর্বমোট পরিশোধযোগ্য:</span>
                <span className="text-emerald-800 tabular-nums">৳{order.totalAmount}</span>
              </div>
              <p className="text-[11px] text-slate-500">
                পেমেন্ট: {order.paymentMethod.toUpperCase()} • অবস্থা: {order.paymentStatus === 'paid' ? 'পরিশোধিত' : 'অপেক্ষমান'}
              </p>
            </div>

            {/* Contact Support Footer */}
            <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-slate-600">কোনো জিজ্ঞাসা বা সংশোধনের জন্য কল করুন:</span>
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${config.phone}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold hover:bg-slate-50"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{config.phone}</span>
                </a>
                <a
                  href={`https://wa.me/${config.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 text-white rounded-lg font-semibold hover:bg-emerald-800"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>হোয়াটসঅ্যাপ</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
