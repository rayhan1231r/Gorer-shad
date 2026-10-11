import React, { useState } from 'react';
import { MapPin, Plus, Edit2, Check, X } from 'lucide-react';
import { DeliveryZone } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface DeliveryZoneManagementProps {
  zones: DeliveryZone[];
  onRefreshData: () => void;
}

export const DeliveryZoneManagement: React.FC<DeliveryZoneManagementProps> = ({ zones, onRefreshData }) => {
  const [editingZone, setEditingZone] = useState<Partial<DeliveryZone> | null>(null);

  const handleOpenAdd = () => {
    setEditingZone({
      id: `zone-${Date.now()}`,
      nameBn: '',
      nameEn: '',
      upazilaOrArea: 'Araihazar',
      charge: 50,
      minOrderAmount: 250,
      freeDeliveryThreshold: 1000,
      estimatedDeliveryMinutes: '40-50 মিনিট',
      isActive: true
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingZone || !editingZone.nameBn) return;

    await api.saveDeliveryZone(editingZone as DeliveryZone);
    setEditingZone(null);
    onRefreshData();
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            ডেলিভারি এলাকা ও চার্জ ব্যবস্থাপনা
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            আড়াইহাজার ও আশেপাশের ইউনিয়নে ডেলিভারি ফি, ন্যূনতম অর্ডার এবং ফ্রি ডেলিভারির সীমা।
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন এলাকা যোগ</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">এলাকার নাম</th>
              <th className="py-3 px-4">ডেলিভারি চার্জ</th>
              <th className="py-3 px-4">ন্যূনতম অর্ডার</th>
              <th className="py-3 px-4">ফ্রি ডেলিভারি সীমা</th>
              <th className="py-3 px-4">আনুমানিক সময়</th>
              <th className="py-3 px-4">অবস্থা</th>
              <th className="py-3 px-4 text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {zones.map(zone => (
              <tr key={zone.id} className="hover:bg-slate-50/60">
                <td className="py-3.5 px-4 font-semibold text-slate-900">
                  {zone.nameBn}
                  <span className="block text-[11px] text-slate-400 font-normal">{zone.nameEn}</span>
                </td>
                <td className="py-3.5 px-4 font-bold tabular-nums text-slate-900">
                  ৳{zone.charge}
                </td>
                <td className="py-3.5 px-4 tabular-nums">
                  ৳{zone.minOrderAmount}
                </td>
                <td className="py-3.5 px-4 tabular-nums text-emerald-700 font-semibold">
                  ৳{zone.freeDeliveryThreshold}+
                </td>
                <td className="py-3.5 px-4">
                  {zone.estimatedDeliveryMinutes}
                </td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${zone.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {zone.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => setEditingZone(zone)}
                    className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Zone Modal */}
      {editingZone && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              এলাকা কনফিগারেশন
            </h3>
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">এলাকার নাম (বাংলা) *</label>
                <input
                  type="text"
                  required
                  value={editingZone.nameBn || ''}
                  onChange={e => setEditingZone({ ...editingZone, nameBn: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">এলাকার নাম (ইংরেজি)</label>
                <input
                  type="text"
                  value={editingZone.nameEn || ''}
                  onChange={e => setEditingZone({ ...editingZone, nameEn: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ডেলিভারি ফি (৳) *</label>
                  <input
                    type="number"
                    required
                    value={editingZone.charge || 0}
                    onChange={e => setEditingZone({ ...editingZone, charge: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ন্যূনতম অর্ডার (৳)</label>
                  <input
                    type="number"
                    value={editingZone.minOrderAmount || 200}
                    onChange={e => setEditingZone({ ...editingZone, minOrderAmount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ফ্রি ডেলিভারি সীমা (৳)</label>
                  <input
                    type="number"
                    value={editingZone.freeDeliveryThreshold || 1000}
                    onChange={e => setEditingZone({ ...editingZone, freeDeliveryThreshold: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">আনুমানিক সময়</label>
                  <input
                    type="text"
                    value={editingZone.estimatedDeliveryMinutes || '30-45 মিনিট'}
                    onChange={e => setEditingZone({ ...editingZone, estimatedDeliveryMinutes: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingZone.isActive}
                    onChange={e => setEditingZone({ ...editingZone, isActive: e.target.checked })}
                    className="rounded text-emerald-700"
                  />
                  <span>এলাকাটি সক্রিয় রাখুন</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingZone(null)}
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
