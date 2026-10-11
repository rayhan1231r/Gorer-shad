import React from 'react';
import { X, Printer } from 'lucide-react';
import { Order, BusinessConfig } from '../../types/index.ts';
import { BrandLogo } from '../common/BrandLogo.tsx';

interface PrintSlipModalProps {
  order: Order | null;
  config?: BusinessConfig;
  type: 'kitchen' | 'receipt';
  onClose: () => void;
}

const DEFAULT_CONFIG: BusinessConfig = {
  brandNameBn: "ঘরের স্বাদ",
  brandNameEn: "Ghorer Shad",
  taglineBn: "সব স্বাদের এক ঠিকানা",
  taglineEn: "One destination for every authentic taste",
  contactPerson: "Joynob Islam Kakoly",
  phone: "01857-220603",
  whatsapp: "+8801912838891",
  email: "ghorershad.arai@gmail.com",
  primaryLocation: "আড়াইহাজার, ঢাকা",
  fullAddressBn: "আড়াইহাজার বাজার রোড, আড়াইহাজার, নারায়ণগঞ্জ / ঢাকা, বাংলাদেশ",
  announcementBarBn: "",
  isAnnouncementActive: false,
  standardAdvanceHours: 4,
  urgentAdvanceHours: 2,
  advanceNoticeMessageBn: "",
  openingHoursBn: "সকাল ৯:০০ - রাত ৯:০০ (প্রতিদিন)",
  currency: "BDT",
  currencySymbol: "৳",
  bkashNumber: "01912-838891",
  nagadNumber: "01857-220603",
  rocketNumber: "01857-220603-9",
  bankDetails: "Islami Bank Bangladesh Ltd"
};

export const PrintSlipModal: React.FC<PrintSlipModalProps> = ({ order, config = DEFAULT_CONFIG, type, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 text-left relative max-h-[90vh] flex flex-col">
        {/* Modal Controls */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-700" />
            <h3 className="text-base font-bold text-slate-900">
              {type === 'kitchen' ? 'কিচেন স্লিপ (Kitchen Ticket)' : 'গ্রাহক রসিদ (Customer Bill)'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>প্রিন্ট করুন</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Surface */}
        <div className="flex-1 overflow-y-auto p-4 bg-white text-slate-900 font-mono text-xs space-y-4 print:p-0">
          {/* Header */}
          <div className="text-center border-b border-dashed border-slate-400 pb-3">
            <div className="flex justify-center mb-2">
              <BrandLogo size="lg" className="border border-slate-300 shadow-2xs" />
            </div>
            <h2 className="text-lg font-bold font-sans tracking-tight">
              {config.brandNameBn}
            </h2>
            <p className="text-[11px] font-sans text-slate-600">{config.taglineBn}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{config.fullAddressBn}</p>
            <p className="text-[10px] text-slate-500">ফোন: {config.phone}</p>
            <div className="mt-2 text-xs font-bold uppercase tracking-wider py-1 border-y border-dashed border-slate-400">
              {type === 'kitchen' ? '★ কিচেন অর্ডার টিকেট ★' : 'ক্যাশ মেমো / রসিদ'}
            </div>
          </div>

          {/* Metadata */}
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>অর্ডার নং: <strong>{order.orderNumber}</strong></span>
              <span>তারিখ: {new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>কাঙ্ক্ষিত সময়: <strong>{order.requestedTimeSlot}</strong></span>
              {order.isUrgent && <span className="text-rose-600 font-bold">[জরুরি অর্ডার]</span>}
            </div>
            {type === 'receipt' && (
              <>
                <div>গ্রাহক: {order.customerName} ({order.customerPhone})</div>
                <div>ঠিকানা: {order.deliveryAddress}, {order.deliveryZoneName}</div>
                {order.deliveryLandmark && <div>ল্যান্ডমার্ক: {order.deliveryLandmark}</div>}
              </>
            )}
          </div>

          {/* Items */}
          <div className="border-t border-dashed border-slate-400 pt-2">
            <div className="flex justify-between font-bold pb-1 border-b border-slate-200">
              <span>আইটেম বিবরণ</span>
              <span>পরিমাণ</span>
              {type === 'receipt' && <span>মূল্য</span>}
            </div>
            <div className="divide-y divide-slate-100 py-1">
              {order.items.map((it, idx) => (
                <div key={idx} className="py-1.5 flex justify-between items-start">
                  <div className="max-w-[240px]">
                    <div className="font-sans font-semibold text-slate-900">{it.nameBn}</div>
                    {it.selectedVariantName && (
                      <div className="text-[10px] text-slate-500">[{it.selectedVariantName}]</div>
                    )}
                    {it.selectedAddonsNames && it.selectedAddonsNames.length > 0 && (
                      <div className="text-[10px] text-slate-500">+{it.selectedAddonsNames.join(', ')}</div>
                    )}
                    {it.specialNotes && (
                      <div className="text-[10px] text-amber-900 italic font-sans font-bold">নোট: {it.specialNotes}</div>
                    )}
                  </div>
                  <span className="font-bold tabular-nums">×{it.quantity}</span>
                  {type === 'receipt' && (
                    <span className="tabular-nums font-semibold">৳{it.itemTotal}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Special Instructions in Kitchen Slip */}
          {order.customerNotes && (
            <div className="p-2 bg-slate-100 rounded border border-slate-300 font-sans text-xs">
              <span className="font-bold block">গ্রাহকের বিশেষ নির্দেশ:</span>
              <span>{order.customerNotes}</span>
            </div>
          )}

          {/* Financials for Receipt */}
          {type === 'receipt' && (
            <div className="border-t border-dashed border-slate-400 pt-2 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>খাবারের মোট:</span>
                <span className="tabular-nums">৳{order.subtotal}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-800">
                  <span>কুপন ছাড়:</span>
                  <span className="tabular-nums">-৳{order.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>ডেলিভারি চার্জ:</span>
                <span className="tabular-nums">৳{order.deliveryCharge}</span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-1 border-t border-slate-400">
                <span>সর্বমোট বিল:</span>
                <span className="tabular-nums">৳{order.totalAmount}</span>
              </div>
              <div className="pt-2 text-[10px] text-slate-600">
                পেমেন্ট পদ্ধতি: {order.paymentMethod.toUpperCase()} • অবস্থা: {order.paymentStatus}
                {order.paymentTransactionId && <span> • TrxID: {order.paymentTransactionId}</span>}
              </div>
            </div>
          )}

          {/* Footer Sign */}
          <div className="text-center border-t border-dashed border-slate-400 pt-3 text-[10px] text-slate-500 font-sans">
            <p>ঘরের স্বাদ বেছে নেওয়ার জন্য ধন্যবাদ!</p>
            <p>পরিচালনায়: {config.contactPerson}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
