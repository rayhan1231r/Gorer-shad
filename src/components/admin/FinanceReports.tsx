import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Plus, Receipt, Calendar } from 'lucide-react';
import { FinancialSummary } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface FinanceReportsProps {
  summary: FinancialSummary;
  expenses: { id: string; date: string; title: string; category: string; amount: number }[];
  onRefreshData: () => void;
}

export const FinanceReports: React.FC<FinanceReportsProps> = ({ summary, expenses, onRefreshData }) => {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expTitle, setExpTitle] = useState('');
  const [expCategory, setExpCategory] = useState('Ingredients');
  const [expAmount, setExpAmount] = useState('');

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle || !expAmount) return;

    await api.addExpense(expTitle, expCategory, Number(expAmount));
    setExpTitle('');
    setExpAmount('');
    setShowAddExpense(false);
    onRefreshData();
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            আর্থিক হিসাব ও লাভ-ক্ষতি রিপোর্ট (Financials)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            মোট বিক্রয়, ডেলিভারি ফি, কুপন ছাড়, কাঁচামালের খরচ এবং আনুমানিক লাভ।
          </p>
        </div>

        <button
          onClick={() => setShowAddExpense(true)}
          className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন খরচ যোগ করুন</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 block">আজকের বিক্রয়</span>
          <span className="text-xl font-bold text-slate-900 tabular-nums">৳{summary.todaySales}</span>
          <span className="text-[11px] text-slate-400 block">{summary.todayOrdersCount}টি অর্ডার</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 block">মোট সংগৃহীত রাজস্ব</span>
          <span className="text-xl font-bold text-slate-900 tabular-nums">৳{summary.totalRevenue}</span>
          <span className="text-[11px] text-emerald-700 font-medium block">ডেলিভারি ফি: ৳{summary.totalDeliveryFees}</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 block">মোট ব্যবসায়িক খরচ</span>
          <span className="text-xl font-bold text-rose-700 tabular-nums">৳{summary.totalExpenses}</span>
          <span className="text-[11px] text-slate-400 block">কাঁচামাল ও প্যাকেজিং</span>
        </div>

        <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 shadow-xs space-y-1">
          <span className="text-xs text-emerald-800 font-semibold block">আনুমানিক নিট লাভ</span>
          <span className="text-xl font-bold text-emerald-900 tabular-nums">৳{summary.estimatedNetProfit}</span>
          <span className="text-[11px] text-emerald-700 block">ছাড়ের পর নীট আয়</span>
        </div>
      </div>

      {/* Expense History Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
          <span>ব্যবসায়িক খরচের তালিকা</span>
          <span className="text-xs text-slate-400 font-normal">মোট খরচ: ৳{summary.totalExpenses}</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="py-2.5 px-3">তারিখ</th>
                <th className="py-2.5 px-3">খরচের বিবরণ</th>
                <th className="py-2.5 px-3">ক্যাটাগরি</th>
                <th className="py-2.5 px-3 text-right">পরিমাণ (৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {expenses.map(exp => (
                <tr key={exp.id} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3 font-mono">{exp.date}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-900">{exp.title}</td>
                  <td className="py-2.5 px-3 text-slate-500">{exp.category}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-rose-700 tabular-nums">৳{exp.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">ব্যবসায়িক খরচ এন্ট্রি</h3>
            <form onSubmit={handleAddExpense} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">খরচের বিবরণ *</label>
                <input
                  type="text"
                  required
                  value={expTitle}
                  onChange={e => setExpTitle(e.target.value)}
                  placeholder="যেমন: ৩ কেজি তাজা ইলিশ ক্রয়"
                  className="w-full p-2.5 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">ক্যাটাগরি</label>
                <select
                  value={expCategory}
                  onChange={e => setExpCategory(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="Ingredients">কাঁচামাল ও খাদ্যসামগ্রী (Ingredients)</option>
                  <option value="Packaging">প্যাকেজিং ও বক্স (Packaging)</option>
                  <option value="Delivery">ডেলিভারি ফুয়েল বিল (Delivery)</option>
                  <option value="Utilities">গ্যাস ও বিদ্যুৎ (Utilities)</option>
                  <option value="Staff">স্টাফ ও হেল্পার (Staff)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">টাকার পরিমাণ (৳) *</label>
                <input
                  type="number"
                  required
                  value={expAmount}
                  onChange={e => setExpAmount(e.target.value)}
                  placeholder="যেমন: ১৫০০"
                  className="w-full p-2.5 rounded-lg border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddExpense(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold"
                >
                  খরচ সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
