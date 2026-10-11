import React, { useState } from 'react';
import { CheckCircle, Copy, Check, MessageSquare, Phone, ArrowRight, Clock, MapPin } from 'lucide-react';
import { Order, BusinessConfig } from '../../types/index.ts';
import { BrandLogo } from '../common/BrandLogo.tsx';

interface OrderConfirmationPageProps {
  order: Order;
  config: BusinessConfig;
  onTrackOrder: (orderNumber: string) => void;
  onBackToHome: () => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  order,
  config,
  onTrackOrder,
  onBackToHome
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cleanPhone = config.whatsapp.replace(/[^0-9]/g, '');
  const waMsg = encodeURIComponent(
    `আসসালামু আলাইকুম! আমি ঘরের স্বাদ-এ একটি অর্ডার দিয়েছি।\nঅর্ডার নং: ${order.orderNumber}\nনাম: ${order.customerName}\nমোট বিল: ৳${order.totalAmount}`
  );
  const waUrl = `https://wa.me/${cleanPhone}?text=${waMsg}`;

  return (
    <div className="bg-slate-50/60 min-h-screen py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-left">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          {/* Header */}
          <div className="text-center space-y-3 pb-6 border-b border-slate-100">
            <div className="flex justify-center mb-1">
              <BrandLogo size="xl" className="ring-4 ring-emerald-100 shadow-md" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>অর্ডার সফলভাবে কনফার্ম হয়েছে</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              অর্ডারটি সফলভাবে গৃহীত হয়েছে!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              ধন্যবাদ <strong>{order.customerName}</strong>! আমাদের কিচেন টিম খুব শীঘ্রই খাবার প্রস্তুতি শুরু করবে।
            </p>
          </div>

          {/* Order ID Box */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 block">আপনার অর্ডার নম্বর:</span>
              <span className="text-xl font-mono font-bold text-emerald-800 tracking-wide">
                {order.orderNumber}
              </span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>কপি হয়েছে</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>কপি করুন</span>
                </>
              )}
            </button>
          </div>

          {/* Key Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1">
              <span className="text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                ডেলিভারি সময়:
              </span>
              <p className="font-semibold text-slate-900">{order.requestedTimeSlot}</p>
              <p className="text-slate-500 text-[11px]">তারিখ: {order.requestedDate}</p>
            </div>

            <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1">
              <span className="text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                ডেলিভারি এলাকা:
              </span>
              <p className="font-semibold text-slate-900">{order.deliveryZoneName}</p>
              <p className="text-slate-500 text-[11px] truncate">{order.deliveryAddress}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              অর্ডারকৃত খাবার
            </h4>
            <div className="space-y-2 text-xs">
              {order.items.map((it, idx) => (
                <div key={idx} className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-800">
                    {it.nameBn} × {it.quantity} {it.selectedVariantName ? `(${it.selectedVariantName})` : ''}
                  </span>
                  <span className="font-semibold text-slate-900 tabular-nums">৳{it.itemTotal}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-sm text-slate-900 pt-2">
                <span>সর্বমোট বিল:</span>
                <span className="text-emerald-800 tabular-nums">৳{order.totalAmount}</span>
              </div>
              <p className="text-[11px] text-slate-500">
                পেমেন্ট পদ্ধতি: <span className="font-semibold uppercase">{order.paymentMethod}</span> ({order.paymentStatus === 'paid' || order.paymentStatus === 'verified' ? 'পরিশোধিত' : 'বাকি / সিওডি'})
              </p>
            </div>
          </div>

          {/* WhatsApp Direct Confirmation */}
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 space-y-2">
            <span className="text-xs font-bold text-emerald-950 block">
              দ্রুত নিশ্চিতকরণের জন্য হোয়াটসঅ্যাপে জানান:
            </span>
            <p className="text-xs text-emerald-900 leading-relaxed">
              আপনার কোনো বিশেষ নির্দেশনা থাকলে সরাসরি আমাদের সাথে হোয়াটসঅ্যাপে যোগাযোগ করতে পারেন।
            </p>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>হোয়াটসঅ্যাপে অর্ডার তথ্য পাঠান</span>
            </a>
          </div>

          {/* Action Navigation */}
          <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => onTrackOrder(order.orderNumber)}
              className="w-full sm:flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <span>অর্ডারের অবস্থা ট্র্যাক করুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onBackToHome}
              className="w-full sm:w-auto px-6 py-2.5 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors"
            >
              হোমপেজে ফিরুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
