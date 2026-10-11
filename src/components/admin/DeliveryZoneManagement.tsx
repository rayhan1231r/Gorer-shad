import React, { useState } from 'react';
import { MapPin, Plus, Edit2, Trash2, Check, X, Truck, Globe, Search, Filter } from 'lucide-react';
import { DeliveryZone } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { BD_DIVISIONS } from '../../data/bangladeshLocations.ts';

interface DeliveryZoneManagementProps {
  zones: DeliveryZone[];
  onRefreshData: () => void;
}

export const DeliveryZoneManagement: React.FC<DeliveryZoneManagementProps> = ({
  zones,
  onRefreshData
}) => {
  const { language } = useLanguage();
  const [editingZone, setEditingZone] = useState<Partial<DeliveryZone> | null>(null);
  const [selectedDivisionFilter, setSelectedDivisionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingZone({
      id: `zone-${Date.now()}`,
      nameBn: '',
      nameEn: '',
      upazilaOrArea: '',
      division: 'dhaka',
      charge: 80,
      minOrderAmount: 300,
      freeDeliveryThreshold: 1500,
      estimatedDeliveryMinutes: '১-২ কার্যদিবস',
      isActive: true,
      zoneScope: 'nationwide',
      courierPartner: 'Steadfast / Pathao'
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingZone || !editingZone.nameBn) return;

    await api.saveDeliveryZone(editingZone as DeliveryZone);
    setEditingZone(null);
    onRefreshData();
  };

  const handleDelete = async (id: string) => {
    await api.deleteDeliveryZone(id);
    setDeletingId(null);
    onRefreshData();
  };

  const filteredZones = zones.filter(zone => {
    const matchesDiv =
      selectedDivisionFilter === 'all' ||
      zone.division === selectedDivisionFilter ||
      zone.zoneScope === selectedDivisionFilter;
    const matchesSearch =
      searchQuery === '' ||
      zone.nameBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      zone.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      zone.upazilaOrArea.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDiv && matchesSearch;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner & Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {language === 'en' ? 'Nationwide Delivery & Zone Management' : 'সারা বাংলাদেশ ডেলিভারি এলাকা ও চার্জ'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'en'
                ? 'Coverage across all 64 districts of Bangladesh including local Araihazar riders and courier express.'
                : 'আড়াইহাজার স্থানীয় ডেলিভারি ও সারা বাংলাদেশের ৬৪ জেলায় কুরিয়ার হোম ডেলিভারি ফি কনফিগারেশন।'}
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'en' ? 'Add Delivery Zone' : 'নতুন এলাকা বা জেলা যোগ'}</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between text-xs">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={language === 'en' ? 'Search zone, area or district...' : 'এলাকা, থানা বা জেলা খুঁজুন...'}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-slate-400 font-semibold shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            {language === 'en' ? 'Division:' : 'বিভাগ:'}
          </span>
          <button
            onClick={() => setSelectedDivisionFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
              selectedDivisionFilter === 'all'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {language === 'en' ? 'All (Nationwide)' : 'সকল (সারা দেশ)'}
          </button>
          {BD_DIVISIONS.map(div => (
            <button
              key={div.id}
              onClick={() => setSelectedDivisionFilter(div.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
                selectedDivisionFilter === div.id
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {language === 'en' ? div.nameEn : div.nameBn}
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">{language === 'en' ? 'Zone / Area' : 'এলাকার নাম ও আওতা'}</th>
                <th className="py-3.5 px-4">{language === 'en' ? 'Division' : 'বিভাগ'}</th>
                <th className="py-3.5 px-4">{language === 'en' ? 'Delivery Fee' : 'ডেলিভারি চার্জ'}</th>
                <th className="py-3.5 px-4">{language === 'en' ? 'Min Order' : 'ন্যূনতম অর্ডার'}</th>
                <th className="py-3.5 px-4">{language === 'en' ? 'Free Delivery' : 'ফ্রি ডেলিভারি সীমা'}</th>
                <th className="py-3.5 px-4">{language === 'en' ? 'Est. Time' : 'সময় ও কুরিয়ার'}</th>
                <th className="py-3.5 px-4">{language === 'en' ? 'Status' : 'অবস্থা'}</th>
                <th className="py-3.5 px-4 text-right">{language === 'en' ? 'Actions' : 'অ্যাকশন'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredZones.map(zone => (
                <tr key={zone.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    <span className="block text-sm">{zone.nameBn}</span>
                    <span className="text-[11px] text-slate-400 font-normal">{zone.nameEn}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                      {zone.division || 'Dhaka'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold tabular-nums text-slate-900 text-sm">
                    ৳{zone.charge}
                  </td>
                  <td className="py-3.5 px-4 tabular-nums">
                    ৳{zone.minOrderAmount}
                  </td>
                  <td className="py-3.5 px-4 tabular-nums text-emerald-700 font-bold">
                    ৳{zone.freeDeliveryThreshold}+
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="block font-medium">{zone.estimatedDeliveryMinutes}</span>
                    {zone.courierPartner && (
                      <span className="text-[10px] text-slate-400 block">{zone.courierPartner}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.8 rounded-full text-[10px] font-bold ${
                      zone.isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {zone.isActive ? (language === 'en' ? 'Active' : 'সক্রিয়') : (language === 'en' ? 'Inactive' : 'নিষ্ক্রিয়')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setEditingZone(zone)}
                        className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="সম্পাদনা করুন"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingId(zone.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {language === 'en' ? 'Delete Delivery Zone?' : 'এলাকাটি ডিলিট করতে চান?'}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'en' ? 'This area will be removed from checkout.' : 'ডিলিট করলে চেকআউট তালিকা থেকে এই এলাকাটি মুছে যাবে।'}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 border rounded-xl text-xs font-semibold"
              >
                {language === 'en' ? 'Cancel' : 'বাতিল'}
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                {language === 'en' ? 'Confirm Delete' : 'ডিলিট করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Add Modal */}
      {editingZone && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingZone.nameBn ? (language === 'en' ? 'Edit Delivery Zone' : 'ডেলিভারি এলাকা সম্পাদনা') : (language === 'en' ? 'Add Delivery Zone' : 'নতুন এলাকা যোগ')}
              </h3>
              <button
                onClick={() => setEditingZone(null)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {language === 'en' ? 'Zone Name (Bengali) *' : 'এলাকার নাম (বাংলা) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editingZone.nameBn || ''}
                    onChange={e => setEditingZone({ ...editingZone, nameBn: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {language === 'en' ? 'Zone Name (English)' : 'এলাকার নাম (ইংরেজি)'}
                  </label>
                  <input
                    type="text"
                    value={editingZone.nameEn || ''}
                    onChange={e => setEditingZone({ ...editingZone, nameEn: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {language === 'en' ? 'Division *' : 'বিভাগ *'}
                  </label>
                  <select
                    value={editingZone.division || 'dhaka'}
                    onChange={e => setEditingZone({ ...editingZone, division: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="all">{language === 'en' ? 'All Bangladesh' : 'সারা বাংলাদেশ'}</option>
                    {BD_DIVISIONS.map(d => (
                      <option key={d.id} value={d.id}>{d.nameBn} ({d.nameEn})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {language === 'en' ? 'Scope / Scope Type' : 'ডেলিভারি ধরন'}
                  </label>
                  <select
                    value={editingZone.zoneScope || 'nationwide'}
                    onChange={e => setEditingZone({ ...editingZone, zoneScope: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="local">স্থানীয় (Local Araihazar)</option>
                    <option value="dhaka_city">ঢাকা মহানগর (Dhaka City)</option>
                    <option value="dhaka_suburb">ঢাকা উপশহর (Dhaka Suburb)</option>
                    <option value="division">বিভাগীয় কুরিয়ার (Division Courier)</option>
                    <option value="nationwide">সারা দেশ (Nationwide All BD)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {language === 'en' ? 'Fee (৳) *' : 'চার্জ (৳) *'}
                  </label>
                  <input
                    type="number"
                    required
                    value={editingZone.charge || 0}
                    onChange={e => setEditingZone({ ...editingZone, charge: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {language === 'en' ? 'Min Order (৳)' : 'মিনিমাম (৳)'}
                  </label>
                  <input
                    type="number"
                    value={editingZone.minOrderAmount || 250}
                    onChange={e => setEditingZone({ ...editingZone, minOrderAmount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {language === 'en' ? 'Free Over (৳)' : 'ফ্রি সীমা (৳)'}
                  </label>
                  <input
                    type="number"
                    value={editingZone.freeDeliveryThreshold || 1200}
                    onChange={e => setEditingZone({ ...editingZone, freeDeliveryThreshold: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {language === 'en' ? 'Estimated Time' : 'আনুমানিক ডেলিভারি সময়'}
                  </label>
                  <input
                    type="text"
                    value={editingZone.estimatedDeliveryMinutes || '১-২ কার্যদিবস'}
                    onChange={e => setEditingZone({ ...editingZone, estimatedDeliveryMinutes: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {language === 'en' ? 'Courier Partner' : 'কুরিয়ার পার্টনার (ঐচ্ছিক)'}
                  </label>
                  <input
                    type="text"
                    value={editingZone.courierPartner || 'Steadfast / Pathao'}
                    onChange={e => setEditingZone({ ...editingZone, courierPartner: e.target.value })}
                    placeholder="যেমন: Steadfast, Sundarban"
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingZone.isActive}
                    onChange={e => setEditingZone({ ...editingZone, isActive: e.target.checked })}
                    className="rounded text-emerald-700"
                  />
                  <span>{language === 'en' ? 'Enable this zone at checkout' : 'চেকআউটে এলাকাটি সক্রিয় রাখুন'}</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingZone(null)}
                  className="px-4 py-2 border rounded-xl font-semibold"
                >
                  {language === 'en' ? 'Cancel' : 'বাতিল'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs"
                >
                  {language === 'en' ? 'Save Zone' : 'সেভ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
