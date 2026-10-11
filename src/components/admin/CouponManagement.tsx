import React, { useState } from 'react';
import { Tag, Plus, Check, X } from 'lucide-react';
import { Coupon } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface CouponManagementProps {
  coupons: Coupon[];
  onRefreshData: () => void;
}

export const CouponManagement: React.FC<CouponManagementProps> = ({ coupons, onRefreshData }) => {
  const { language } = useLanguage();
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon> | null>(null);

  const handleOpenAdd = () => {
    setEditingCoupon({
      code: '',
      discountType: 'percentage',
      discountValue: 10,
      minOrderAmount: 300,
      maxDiscountAmount: 100,
      expiresAt: '2026-12-31',
      isActive: true,
      usageCount: 0
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon || !editingCoupon.code) return;

    await api.saveCoupon({
      ...(editingCoupon as Coupon),
      code: editingCoupon.code.toUpperCase().trim()
    });
    setEditingCoupon(null);
    onRefreshData();
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {language === 'en' ? 'Coupons & Promotional Offers' : 'কুপন ও ডিসকাউন্ট অফার'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'en' ? 'Create promo discount codes, manage percentage/flat offers and expiration.' : 'বিশেষ ছাড় ও প্রোমো কোড তৈরি এবং ব্যবহার মনিটরিং।'}
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'en' ? 'Add Coupon' : 'নতুন কুপন যোগ'}</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">{language === 'en' ? 'Coupon Code' : 'কুপন কোড'}</th>
              <th className="py-3 px-4">{language === 'en' ? 'Discount Type & Value' : 'ছাড়ের ধরণ ও মান'}</th>
              <th className="py-3 px-4">{language === 'en' ? 'Min Order' : 'ন্যূনতম অর্ডার'}</th>
              <th className="py-3 px-4">{language === 'en' ? 'Validity / Expiry' : 'মেয়াদ'}</th>
              <th className="py-3 px-4">{language === 'en' ? 'Usage Count' : 'ব্যবহারের সংখ্যা'}</th>
              <th className="py-3 px-4">{language === 'en' ? 'Status' : 'অবস্থা'}</th>
              <th className="py-3 px-4 text-right">{language === 'en' ? 'Action' : 'অ্যাকশন'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {coupons.map(cp => (
              <tr key={cp.code} className="hover:bg-slate-50/60">
                <td className="py-3.5 px-4 font-mono font-bold text-emerald-800 text-sm">
                  {cp.code}
                </td>
                <td className="py-3.5 px-4 font-semibold text-slate-900">
                  {cp.discountType === 'percentage' ? `${cp.discountValue}% ছাড়` : `৳${cp.discountValue} ফ্ল্যাট ছাড়`}
                  {cp.maxDiscountAmount && <span className="text-[10px] text-slate-500 block">(সর্বোচ্চ ৳{cp.maxDiscountAmount})</span>}
                </td>
                <td className="py-3.5 px-4 tabular-nums">
                  ৳{cp.minOrderAmount}
                </td>
                <td className="py-3.5 px-4">
                  {cp.expiresAt}
                </td>
                <td className="py-3.5 px-4 tabular-nums font-bold">
                  {cp.usageCount} বার
                </td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${cp.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    {cp.isActive ? 'চলমান' : 'বন্ধ'}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => setEditingCoupon(cp)}
                    className="text-emerald-700 hover:underline font-semibold"
                  >
                    সম্পাদনা
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingCoupon && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">কুপন এডিটর</h3>
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">কুপন কোড *</label>
                <input
                  type="text"
                  required
                  value={editingCoupon.code || ''}
                  onChange={e => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
                  placeholder="যেমন: EID20"
                  className="w-full p-2.5 rounded-lg border border-slate-200 uppercase font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ধরণ</label>
                  <select
                    value={editingCoupon.discountType}
                    onChange={e => setEditingCoupon({ ...editingCoupon, discountType: e.target.value as any })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="percentage">শতকরা (%)</option>
                    <option value="fixed">নির্দিষ্ট টাকা (৳)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ছাড়ের পরিমাণ</label>
                  <input
                    type="number"
                    value={editingCoupon.discountValue || 10}
                    onChange={e => setEditingCoupon({ ...editingCoupon, discountValue: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ন্যূনতম অর্ডার (৳)</label>
                  <input
                    type="number"
                    value={editingCoupon.minOrderAmount || 0}
                    onChange={e => setEditingCoupon({ ...editingCoupon, minOrderAmount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">সর্বোচ্চ ছাড় (৳)</label>
                  <input
                    type="number"
                    value={editingCoupon.maxDiscountAmount || ''}
                    onChange={e => setEditingCoupon({ ...editingCoupon, maxDiscountAmount: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full p-2.5 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingCoupon.isActive}
                    onChange={e => setEditingCoupon({ ...editingCoupon, isActive: e.target.checked })}
                    className="rounded text-emerald-700"
                  />
                  <span>সক্রিয় রাখুন</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingCoupon(null)}
                  className="px-4 py-2 border rounded-lg"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold"
                >
                  সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
