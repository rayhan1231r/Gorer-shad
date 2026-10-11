import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Copy,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Building,
  Smartphone,
  Banknote
} from 'lucide-react';
import { PaymentMethodConfig } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface PaymentManagementProps {
  paymentMethods: PaymentMethodConfig[];
  onRefreshData: () => void;
}

export const PaymentManagement: React.FC<PaymentManagementProps> = ({
  paymentMethods,
  onRefreshData
}) => {
  const { language } = useLanguage();
  const [editingMethod, setEditingMethod] = useState<Partial<PaymentMethodConfig> | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenAdd = () => {
    setEditingMethod({
      id: `pm-${Date.now()}`,
      nameBn: '',
      nameEn: '',
      type: 'bkash',
      accountType: 'Personal',
      accountNumber: '',
      chargePercentage: 0,
      instructionsBn: '',
      instructionsEn: '',
      isActive: true,
      requiresTransactionId: true,
      sortOrder: (paymentMethods.length + 1)
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMethod || !editingMethod.nameBn || !editingMethod.accountNumber) return;

    try {
      setIsSaving(true);
      await api.savePaymentMethod(editingMethod as PaymentMethodConfig);
      setEditingMethod(null);
      onRefreshData();
    } catch (err) {
      console.error('Failed to save payment method:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deletePaymentMethod(id);
      setIsDeletingId(null);
      onRefreshData();
    } catch (err) {
      console.error('Failed to delete payment method:', err);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await api.togglePaymentMethod(id);
      onRefreshData();
    } catch (err) {
      console.error('Failed to toggle payment method:', err);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(id);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'bank':
        return <Building className="w-5 h-5 text-blue-600" />;
      case 'cod':
        return <Banknote className="w-5 h-5 text-emerald-600" />;
      default:
        return <Smartphone className="w-5 h-5 text-emerald-700" />;
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
              <CreditCard className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {language === 'en' ? 'Payment Methods Management' : 'পেমেন্ট মাধ্যম ও অ্যাকাউন্ট ব্যবস্থাপনা'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'en'
                  ? 'Add, delete, update numbers, and toggle active payment channels shown at customer checkout.'
                  : 'গ্রাহকদের চেকআউটে প্রদর্শিত বিকাশ, নগদ, রকেট, ব্যাংক ও ক্যাশ অন ডেলিভারি অ্যাকাউন্ট নিয়ন্ত্রণ করুন।'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'en' ? 'Add Payment Method' : 'নতুন পেমেন্ট মেথড যোগ'}</span>
        </button>
      </div>

      {/* Grid of Payment Method Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paymentMethods.map(pm => (
          <div
            key={pm.id}
            className={`bg-white rounded-2xl border transition-all p-5 shadow-xs flex flex-col justify-between ${
              pm.isActive ? 'border-emerald-200 hover:border-emerald-300' : 'border-slate-200 opacity-75'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                    {getMethodIcon(pm.type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">
                      {language === 'en' ? (pm.nameEn || pm.nameBn) : pm.nameBn}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.2 rounded-md bg-slate-100 text-slate-600">
                        {pm.type}
                      </span>
                      {pm.accountType && (
                        <span className="text-[10px] font-semibold px-2 py-0.2 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                          {pm.accountType}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Active Toggle Switch */}
                <button
                  onClick={() => handleToggle(pm.id)}
                  className={`p-1 rounded-lg transition-colors cursor-pointer ${
                    pm.isActive ? 'text-emerald-700 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'
                  }`}
                  title={pm.isActive ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Inactive)'}
                >
                  {pm.isActive ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
                </button>
              </div>

              {/* Account Number Box */}
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 my-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold block tracking-wider">
                    {pm.type === 'bank' ? (language === 'en' ? 'A/C Number' : 'অ্যাকাউন্ট নম্বর') : (language === 'en' ? 'Mobile Number' : 'মোবাইল নম্বর')}
                  </span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {pm.accountNumber}
                  </span>
                </div>
                {pm.accountNumber !== 'N/A' && (
                  <button
                    onClick={() => handleCopy(pm.accountNumber, pm.id)}
                    className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-white rounded-lg transition-colors"
                    title="কপি করুন"
                  >
                    {copyFeedback === pm.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
              </div>

              {/* Instructions preview */}
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3">
                {language === 'en' ? (pm.instructionsEn || pm.instructionsBn) : pm.instructionsBn}
              </p>
            </div>

            {/* Bottom Details & Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[11px]">
                {pm.requiresTransactionId && (
                  <span className="text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                    TrxID {language === 'en' ? 'Required' : 'আবশ্যক'}
                  </span>
                )}
                {pm.chargePercentage !== undefined && pm.chargePercentage > 0 && (
                  <span className="text-slate-500">
                    +{pm.chargePercentage}% Fee
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditingMethod(pm)}
                  className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors"
                  title="সম্পাদনা করুন"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsDeletingId(pm.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeletingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {language === 'en' ? 'Delete Payment Method?' : 'পেমেন্ট মেথড ডিলিট করতে চান?'}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'en'
                ? 'This payment method will no longer be visible to customers at checkout.'
                : 'এই পেমেন্ট মাধ্যমটি মুছে ফেললে গ্রাহকেরা চেকআউটে আর এটি দেখতে পাবেন না।'}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeletingId(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-xs rounded-xl font-semibold hover:bg-slate-50"
              >
                {language === 'en' ? 'Cancel' : 'বাতিল'}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(isDeletingId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs rounded-xl font-bold shadow-xs"
              >
                {language === 'en' ? 'Confirm Delete' : 'ডিলিট করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Create Payment Method Modal */}
      {editingMethod && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingMethod.nameBn ? (language === 'en' ? 'Edit Payment Method' : 'পেমেন্ট মাধ্যম সম্পাদনা') : (language === 'en' ? 'Add New Payment Method' : 'নতুন পেমেন্ট মাধ্যম যোগ')}
              </h3>
              <button
                onClick={() => setEditingMethod(null)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {language === 'en' ? 'Method Name (Bengali) *' : 'মাধ্যমের নাম (বাংলা) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editingMethod.nameBn || ''}
                    onChange={e => setEditingMethod({ ...editingMethod, nameBn: e.target.value })}
                    placeholder="যেমন: বিকাশ পার্সোনাল"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {language === 'en' ? 'Method Name (English)' : 'মাধ্যমের নাম (ইংরেজি)'}
                  </label>
                  <input
                    type="text"
                    value={editingMethod.nameEn || ''}
                    onChange={e => setEditingMethod({ ...editingMethod, nameEn: e.target.value })}
                    placeholder="e.g. bKash Personal"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {language === 'en' ? 'Payment Type *' : 'পেমেন্ট টাইপ *'}
                  </label>
                  <select
                    value={editingMethod.type || 'bkash'}
                    onChange={e => setEditingMethod({ ...editingMethod, type: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                  >
                    <option value="bkash">বিকাশ (bKash)</option>
                    <option value="nagad">নগদ (Nagad)</option>
                    <option value="rocket">রকেট (Rocket)</option>
                    <option value="upay">উপায় (Upay)</option>
                    <option value="bank">ব্যাংক ডিপোজিট (Bank Transfer)</option>
                    <option value="cod">ক্যাশ অন ডেলিভারি (Cash on Delivery)</option>
                    <option value="card">কার্ড পেমেন্ট (Card / POS)</option>
                    <option value="other">অন্যান্য (Other)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {language === 'en' ? 'Account Type' : 'অ্যাকাউন্ট ধরন'}
                  </label>
                  <select
                    value={editingMethod.accountType || 'Personal'}
                    onChange={e => setEditingMethod({ ...editingMethod, accountType: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                  >
                    <option value="Personal">পার্সোনাল (Personal / Send Money)</option>
                    <option value="Merchant">মার্চেন্ট (Merchant / Payment)</option>
                    <option value="Agent">এজেন্ট (Agent / Cash In)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {language === 'en' ? 'Account / Mobile Number *' : 'অ্যাকাউন্ট বা মোবাইল নম্বর *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editingMethod.accountNumber || ''}
                    onChange={e => setEditingMethod({ ...editingMethod, accountNumber: e.target.value })}
                    placeholder="01XXXXXXXXX বা হিসাব নম্বর"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {language === 'en' ? 'Gateway / Cash-Out Fee (%)' : 'অতিরিক্ত ফি / চার্জ (%)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={editingMethod.chargePercentage || 0}
                    onChange={e => setEditingMethod({ ...editingMethod, chargePercentage: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {language === 'en' ? 'Instructions for Customer (Bengali)' : 'গ্রাহকের জন্য নির্দেশিকা (বাংলা)'}
                </label>
                <textarea
                  rows={2}
                  value={editingMethod.instructionsBn || ''}
                  onChange={e => setEditingMethod({ ...editingMethod, instructionsBn: e.target.value })}
                  placeholder="যেমন: বিকাশ অ্যাপে গিয়ে Send Money করুন এবং ট্রানজেকশন আইডি দিন..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-2 pt-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingMethod.requiresTransactionId}
                    onChange={e => setEditingMethod({ ...editingMethod, requiresTransactionId: e.target.checked })}
                    className="rounded text-emerald-700"
                  />
                  <span>{language === 'en' ? 'Requires Transaction ID (TrxID) input' : 'গ্রাহককে ট্রানজেকশন আইডি (TrxID) দিতে হবে'}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingMethod.isActive}
                    onChange={e => setEditingMethod({ ...editingMethod, isActive: e.target.checked })}
                    className="rounded text-emerald-700"
                  />
                  <span>{language === 'en' ? 'Enable this payment method immediately' : 'পেমেন্ট মাধ্যমটি এখনই সক্রিয় রাখুন'}</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingMethod(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50"
                >
                  {language === 'en' ? 'Cancel' : 'বাতিল'}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white rounded-xl font-bold shadow-xs"
                >
                  {isSaving ? (language === 'en' ? 'Saving...' : 'সংরক্ষণ হচ্ছে...') : (language === 'en' ? 'Save Method' : 'সেভ করুন')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
