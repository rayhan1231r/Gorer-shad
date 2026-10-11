import React, { useState } from 'react';
import { Users, Search, ShieldAlert, ShieldCheck, Phone, MapPin } from 'lucide-react';
import { CustomerRecord } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface CustomerManagementProps {
  customers: CustomerRecord[];
  onRefreshData: () => void;
}

export const CustomerManagement: React.FC<CustomerManagementProps> = ({ customers, onRefreshData }) => {
  const [search, setSearch] = useState('');

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const handleToggleBlock = async (phone: string, isBlocked: boolean) => {
    const reason = !isBlocked
      ? window.prompt('গ্রাহককে ব্লক করার কারণ লিখুন (যেমন: ভুয়া অর্ডার, অশালীন আচরণ):')
      : undefined;

    if (!isBlocked && reason === null) return;

    await api.toggleBlockCustomer(phone, reason || undefined);
    onRefreshData();
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            গ্রাহক ডিরেক্টরি (Customer Directory)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            নিয়মিত গ্রাহক, অর্ডার হিস্ট্রি, সর্বমোট খরচ ও কাস্টমার স্ট্যাটাস।
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="নাম বা ফোন দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">গ্রাহকের নাম ও ফোন</th>
              <th className="py-3 px-4">সর্বমোট অর্ডার</th>
              <th className="py-3 px-4">মোট কেনাকাটা</th>
              <th className="py-3 px-4">প্রধান ঠিকানা</th>
              <th className="py-3 px-4">ট্যাগ / নোট</th>
              <th className="py-3 px-4 text-right">স্ট্যাটাস ও অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filtered.map(cust => (
              <tr key={cust.phone} className="hover:bg-slate-50/60">
                <td className="py-3.5 px-4">
                  <span className="font-semibold text-slate-900 block">{cust.name}</span>
                  <a href={`tel:${cust.phone}`} className="font-mono text-[11px] text-slate-500 hover:text-emerald-700">
                    {cust.phone}
                  </a>
                </td>

                <td className="py-3.5 px-4 font-bold tabular-nums">
                  {cust.totalOrders}টি অর্ডার
                </td>

                <td className="py-3.5 px-4 font-bold tabular-nums text-slate-900">
                  ৳{cust.totalSpent}
                </td>

                <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                  {cust.addresses[0] || 'উল্লেখ নেই'}
                </td>

                <td className="py-3.5 px-4">
                  {cust.notes && <span className="text-[11px] text-slate-500 italic block">{cust.notes}</span>}
                  <div className="flex gap-1 mt-0.5">
                    {cust.tags.map((t, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                </td>

                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => handleToggleBlock(cust.phone, cust.isBlocked)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      cust.isBlocked
                        ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cust.isBlocked ? 'আনব্লক করুন' : 'ব্লক করুন'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
