import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Plus, Receipt, Calendar } from 'lucide-react';
import { FinancialSummary } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface FinanceReportsProps {
  summary: FinancialSummary;
  expenses: { id: string; date: string; title: string; category: string; amount: number }[];
  onRefreshData: () => void;
}

export const FinanceReports: React.FC<FinanceReportsProps> = ({ summary, expenses, onRefreshData }) => {
  const { language } = useLanguage();
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
            {language === 'en' ? 'Financial Reports & Profit-Loss Analysis' : 'আর্থিক হিসাব ও লাভ-ক্ষতি রিপোর্ট (Financials)'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'en' ? 'Total sales revenue, delivery fees, discounts, direct expenses, and estimated net earnings.' : 'মোট বিক্রয়, ডেলিভারি ফি, কুপন ছাড়, কাঁচামালের খরচ এবং আনুমানিক লাভ।'}
          </p>
        </div>

        <button
          onClick={() => setShowAddExpense(true)}
          className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'en' ? 'Add New Expense' : 'নতুন খরচ যোগ করুন'}</span>
        </button>
      </div>

      {/* Comprehensive Revenue & Sales KPI Cards (Daily, Weekly, Monthly, Yearly) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Today */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">
              {language === 'en' ? "Today's Sales" : 'আজকের বিক্রয়'}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums block">৳{summary.todaySales}</span>
          <span className="text-[11px] text-slate-500 font-medium block">
            {language === 'en' ? `${summary.todayOrdersCount} orders today` : `${summary.todayOrdersCount}টি সফল অর্ডার`}
          </span>
        </div>

        {/* Weekly */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">
              {language === 'en' ? 'Weekly Sales (7d)' : 'সাপ্তাহিক বিক্রয় (৭ দিন)'}
            </span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums block">৳{summary.weeklySales}</span>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>{language === 'en' ? `${summary.weeklyOrdersCount} orders` : `${summary.weeklyOrdersCount}টি অর্ডার`}</span>
            {summary.lastWeekSales > 0 && (
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1 rounded">
                বিগত সপ্তাহে ৳{summary.lastWeekSales}
              </span>
            )}
          </div>
        </div>

        {/* Monthly */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">
              {language === 'en' ? 'Monthly Sales' : 'মাসিক বিক্রয় (চলতি মাস)'}
            </span>
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums block">৳{summary.monthSales}</span>
          <span className="text-[11px] text-blue-700 font-medium block">
            চলতি মাসের অর্জিত বিক্রয়
          </span>
        </div>

        {/* Yearly */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">
              {language === 'en' ? 'Annual Sales (Year)' : 'বার্ষিক বিক্রয় (চলতি বছর)'}
            </span>
            <DollarSign className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums block">৳{summary.yearSales}</span>
          <span className="text-[11px] text-amber-800 font-medium block">
            {language === 'en' ? `${summary.yearOrdersCount || 0} orders in year` : `বছরে ${summary.yearOrdersCount || 0}টি অর্ডার`}
          </span>
        </div>
      </div>

      {/* Secondary Financial Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-0.5">
          <span className="text-[11px] text-slate-500 block">মোট রাজস্ব (Total Gross)</span>
          <span className="text-lg font-bold text-slate-900 tabular-nums">৳{summary.totalRevenue}</span>
          <span className="text-[10px] text-slate-400 block">ডেলিভারি ফি: ৳{summary.totalDeliveryFees}</span>
        </div>

        <div className="p-3.5 bg-rose-50/70 rounded-xl border border-rose-100 space-y-0.5">
          <span className="text-[11px] text-rose-700 block">মোট পরিচালন খরচ</span>
          <span className="text-lg font-bold text-rose-900 tabular-nums">৳{summary.totalExpenses}</span>
          <span className="text-[10px] text-rose-500 block">কাঁচামাল, প্যাকেজিং ও ডেলিভারি</span>
        </div>

        <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-100 space-y-0.5">
          <span className="text-[11px] text-amber-800 block">মোট কুপন ও ডিসকাউন্ট</span>
          <span className="text-lg font-bold text-amber-900 tabular-nums">৳{summary.totalDiscounts}</span>
          <span className="text-[10px] text-amber-600 block">গ্রাহকদের দেওয়া মোট ছাড়</span>
        </div>

        <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-0.5">
          <span className="text-[11px] text-emerald-800 font-bold block">আনুমানিক নীট মুনাফা</span>
          <span className="text-lg font-extrabold text-emerald-950 tabular-nums">৳{summary.estimatedNetProfit}</span>
          <span className="text-[10px] text-emerald-700 font-medium block">সব খরচ ও ছাড় বাদে নীট আয়</span>
        </div>
      </div>

      {/* Visual Analytics Charts (Daily Breakdown & Monthly Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Daily Sales Trend (Past 7 Days) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
              <span>বিগত ৭ দিনের দৈনিক বিক্রয়ের গ্রাফ</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">সাপ্তাহিক মোট: ৳{summary.weeklySales}</span>
          </div>

          <div className="space-y-2 pt-2">
            {summary.dailySalesBreakdown && summary.dailySalesBreakdown.length > 0 ? (
              summary.dailySalesBreakdown.map((item, idx) => {
                const maxAmount = Math.max(...summary.dailySalesBreakdown!.map(d => d.amount), 1);
                const pct = Math.round((item.amount / maxAmount) * 100);
                return (
                  <div key={idx} className="space-y-0.5 text-xs">
                    <div className="flex items-center justify-between font-mono text-[11px] text-slate-600">
                      <span>{item.day} ({item.date.slice(5)})</span>
                      <span className="font-bold text-slate-900">৳{item.amount} ({item.count}টি)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(pct, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">উপাত্ত প্রস্তুত হচ্ছে...</div>
            )}
          </div>
        </div>

        {/* 12-Month Annual Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-700" />
              <span>চলতি বছরের ১২ মাসের বিক্রয় বিশ্লেষণ</span>
            </h3>
            <span className="text-[11px] text-blue-700 font-bold">বার্ষিক: ৳{summary.yearSales}</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
            {summary.monthlySalesBreakdown && summary.monthlySalesBreakdown.length > 0 ? (
              summary.monthlySalesBreakdown.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 text-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 block">{item.month}</span>
                  <span className="text-xs font-bold text-slate-900 block tabular-nums">৳{item.amount}</span>
                  <span className="text-[9px] text-slate-400 block">{item.count} অর্ডার</span>
                </div>
              ))
            ) : (
              <div className="col-span-4 text-center py-6 text-xs text-slate-400">উপাত্ত প্রস্তুত হচ্ছে...</div>
            )}
          </div>
        </div>
      </div>


      {/* Expense History Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
          <span>{language === 'en' ? 'Operating Expenses Ledger' : 'ব্যবসায়িক খরচের তালিকা'}</span>
          <span className="text-xs text-slate-400 font-normal">{language === 'en' ? `Total Costs: ৳${summary.totalExpenses}` : `মোট খরচ: ৳${summary.totalExpenses}`}</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="py-2.5 px-3">{language === 'en' ? 'Date' : 'তারিখ'}</th>
                <th className="py-2.5 px-3">{language === 'en' ? 'Expense Title' : 'খরচের বিবরণ'}</th>
                <th className="py-2.5 px-3">{language === 'en' ? 'Category' : 'ক্যাটাগরি'}</th>
                <th className="py-2.5 px-3 text-right">{language === 'en' ? 'Amount (৳)' : 'পরিমাণ (৳)'}</th>
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
