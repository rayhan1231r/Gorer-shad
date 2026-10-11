import React, { useState } from 'react';
import { Users, Phone, Calendar, MapPin, DollarSign, CheckCircle, Edit3, MessageCircle, Clock } from 'lucide-react';
import { CateringInquiry, BusinessConfig } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface CateringManagementProps {
  inquiries: CateringInquiry[];
  config: BusinessConfig;
  onRefreshData: () => void;
}

export const CateringManagement: React.FC<CateringManagementProps> = ({
  inquiries,
  config,
  onRefreshData
}) => {
  const [selectedInquiry, setSelectedInquiry] = useState<CateringInquiry | null>(null);
  const [quoteAmount, setQuoteAmount] = useState<number>(0);
  const [advanceRequired, setAdvanceRequired] = useState<number>(0);
  const [advancePaid, setAdvancePaid] = useState<number>(0);
  const [proposedMenu, setProposedMenu] = useState('');
  const [status, setStatus] = useState<CateringInquiry['status']>('pending');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleOpenDrawer = (item: CateringInquiry) => {
    setSelectedInquiry(item);
    setQuoteAmount(item.quotation?.totalEstimatedAmount || item.approxBudget || 0);
    setAdvanceRequired(item.quotation?.advanceRequired || Math.round((item.approxBudget || 0) * 0.4));
    setAdvancePaid(item.quotation?.advancePaid || 0);
    setProposedMenu(item.quotation?.proposedMenu || item.foodPreferencesBn || '');
    setStatus(item.status);
  };

  const handleSaveQuotation = async () => {
    if (!selectedInquiry) return;
    try {
      setIsUpdating(true);
      await api.updateCateringInquiry(selectedInquiry.id, {
        status,
        quotation: {
          totalEstimatedAmount: Number(quoteAmount),
          advanceRequired: Number(advanceRequired),
          advancePaid: Number(advancePaid),
          proposedMenu,
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          notes: `বাকি ব্যালেন্স: ৳${Math.max(0, Number(quoteAmount) - Number(advancePaid))}`
        }
      });
      setIsUpdating(false);
      setSelectedInquiry(null);
      onRefreshData();
    } catch (err) {
      console.error(err);
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            ক্যাটারিং ও বাল্ক অর্ডার অনুসন্ধান
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            পারিবারিক অনুষ্ঠান, বিয়ে, মিলাদ ও অফিসের বড় খাবারের অনুরোধ ও কোটেশন।
          </p>
        </div>
        <button
          onClick={onRefreshData}
          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
        >
          রিফ্রেশ
        </button>
      </div>

      {/* Inquiries Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {inquiries.length === 0 ? (
          <div className="col-span-2 p-12 bg-white rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
            বর্তমানে কোনো ক্যাটারিং অনুরোধ জমা নেই
          </div>
        ) : (
          inquiries.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono font-bold text-emerald-800 text-sm block">
                    {item.inquiryNumber}
                  </span>
                  <h4 className="font-bold text-slate-900 text-base">{item.customerName}</h4>
                  <a href={`tel:${item.customerPhone}`} className="text-xs font-mono text-slate-500 hover:underline">
                    {item.customerPhone}
                  </a>
                </div>

                <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                  item.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                  item.status === 'quoted' ? 'bg-blue-50 text-blue-700' :
                  item.status === 'rejected' ? 'bg-rose-50 text-rose-700' :
                  'bg-amber-50 text-amber-800'
                }`}>
                  {item.status === 'pending' ? 'অপেক্ষমান' :
                   item.status === 'quoted' ? 'কোটেশন প্রেরিত' :
                   item.status === 'approved' ? 'অনুমোদিত' :
                   item.status === 'converted' ? 'অর্ডারে রূপান্তরিত' : 'প্রত্যাখ্যাত'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>তারিখ: <strong>{item.eventDate}</strong> ({item.eventTime})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>মেহমান: <strong>{item.guestCount} জন</strong> • ধরণ: {item.eventType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate">স্থান: {item.eventLocation}</span>
                </div>
              </div>

              <div className="text-xs space-y-1">
                <span className="font-semibold text-slate-800 block">কাঙ্ক্ষিত মেনু:</span>
                <p className="text-slate-600 line-clamp-2">{item.foodPreferencesBn}</p>
              </div>

              {item.quotation && (
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center justify-between text-xs text-emerald-950">
                  <div>
                    <span className="block text-[11px] text-emerald-800">মোট আনুমানিক কোটেশন:</span>
                    <span className="font-bold text-sm">৳{item.quotation.totalEstimatedAmount}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[11px] text-emerald-800">অগ্রিম জমা:</span>
                    <span className="font-bold">৳{item.quotation.advancePaid}</span>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                <a
                  href={`https://wa.me/${item.customerPhone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                  <span>হোয়াটসঅ্যাপ</span>
                </a>

                <button
                  onClick={() => handleOpenDrawer(item)}
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>কোটেশন এডিট করুন</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Quotation Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              কোটেশন প্রস্তুত ও আপডেট: {selectedInquiry.inquiryNumber}
            </h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">মোট প্রস্তাবিত মূল্য (৳)</label>
                  <input
                    type="number"
                    value={quoteAmount}
                    onChange={e => setQuoteAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">প্রয়োজনীয় অগ্রিম (৳)</label>
                  <input
                    type="number"
                    value={advanceRequired}
                    onChange={e => setAdvanceRequired(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">গৃহীত অগ্রিম (৳)</label>
                  <input
                    type="number"
                    value={advancePaid}
                    onChange={e => setAdvancePaid(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">স্ট্যাটাস</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="pending">অপেক্ষমান (Pending)</option>
                    <option value="quoted">কোটেশন প্রেরিত (Quoted)</option>
                    <option value="approved">অনুমোদিত (Approved)</option>
                    <option value="converted">অর্ডারে কনভার্ট (Converted)</option>
                    <option value="rejected">বাতিল (Rejected)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">চূড়ান্ত মেনু পরিকল্পনা</label>
                <textarea
                  rows={3}
                  value={proposedMenu}
                  onChange={e => setProposedMenu(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedInquiry(null)}
                className="px-4 py-2 border rounded-lg text-xs"
              >
                বাতিল
              </button>
              <button
                onClick={handleSaveQuotation}
                disabled={isUpdating}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold"
              >
                {isUpdating ? 'সেভ হচ্ছে...' : 'কোটেশন সেভ করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
