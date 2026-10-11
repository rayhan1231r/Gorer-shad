import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Image, Check, X, UploadCloud, Eye, Sparkles } from 'lucide-react';
import { FoodItem, Category, FoodVariant, FoodAddon } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface MenuManagementProps {
  foods: FoodItem[];
  categories: Category[];
  onRefreshData: () => void;
}

export const MenuManagement: React.FC<MenuManagementProps> = ({ foods, categories, onRefreshData }) => {
  const [activeTab, setActiveTab] = useState<'foods' | 'categories'>('foods');
  const [editingFood, setEditingFood] = useState<Partial<FoodItem> | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // New Category State
  const [newCatNameBn, setNewCatNameBn] = useState('');
  const [newCatNameEn, setNewCatNameEn] = useState('');
  const [newCatDescBn, setNewCatDescBn] = useState('');

  const handleOpenAddFood = () => {
    setEditingFood({
      id: `food-${Date.now()}`,
      sku: `GS-${Math.floor(1000 + Math.random() * 9000)}`,
      nameBn: '',
      nameEn: '',
      categoryId: categories[0]?.id || 'bengali-meals',
      categoryNameBn: categories[0]?.nameBn || 'বাঙালি খাবার',
      shortDescBn: '',
      fullDescBn: '',
      image: '/src/assets/images/hero_ghorer_shad_feast_1791709454258.jpg',
      price: 250,
      portionBn: '১ জনের পেটভরা মিল',
      prepTimeMinutes: 30,
      advanceNoticeRequiredHours: 4,
      spiceLevel: 'Medium',
      isAvailable: true,
      dailyStock: 25,
      currentStock: 25,
      minOrderQty: 1,
      isFeatured: false,
      isBestseller: false,
      variants: [],
      addons: []
    });
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        setIsUploading(true);
        const res = await api.uploadImage(reader.result as string, file.name);
        setEditingFood(prev => prev ? { ...prev, image: res.url } : null);
      } catch (err) {
        console.error('Image upload failed:', err);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFood || !editingFood.nameBn || !editingFood.price) return;

    try {
      setIsSaving(true);
      const cat = categories.find(c => c.id === editingFood.categoryId);
      const payload: FoodItem = {
        ...(editingFood as FoodItem),
        categoryNameBn: cat?.nameBn || editingFood.categoryNameBn || ''
      };

      await api.saveFood(payload);
      setIsSaving(false);
      setEditingFood(null);
      onRefreshData();
    } catch (err) {
      console.error(err);
      setIsSaving(false);
    }
  };

  const handleDeleteFood = async (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিতভাবে এই খাবারটি ডিলিট করতে চান?')) {
      await api.deleteFood(id);
      onRefreshData();
    }
  };

  const handleAddVariant = () => {
    if (!editingFood) return;
    const newVariant: FoodVariant = {
      id: `var-${Date.now()}`,
      nameBn: 'নতুন ভ্যারিয়েন্ট',
      nameEn: 'New Variant',
      additionalPrice: 0
    };
    setEditingFood({
      ...editingFood,
      variants: [...(editingFood.variants || []), newVariant]
    });
  };

  const handleRemoveVariant = (id: string) => {
    if (!editingFood) return;
    setEditingFood({
      ...editingFood,
      variants: (editingFood.variants || []).filter(v => v.id !== id)
    });
  };

  const handleAddAddon = () => {
    if (!editingFood) return;
    const newAddon: FoodAddon = {
      id: `add-${Date.now()}`,
      nameBn: 'নতুন অতিরিক্ত আইটেম',
      nameEn: 'New Addon',
      price: 30
    };
    setEditingFood({
      ...editingFood,
      addons: [...(editingFood.addons || []), newAddon]
    });
  };

  const handleRemoveAddon = (id: string) => {
    if (!editingFood) return;
    setEditingFood({
      ...editingFood,
      addons: (editingFood.addons || []).filter(a => a.id !== id)
    });
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatNameBn.trim()) return;

    const id = newCatNameEn.trim().toLowerCase().replace(/[^a-z0-9]/g, '-') || `cat-${Date.now()}`;
    await api.saveCategory({
      id,
      nameBn: newCatNameBn.trim(),
      nameEn: newCatNameEn.trim() || newCatNameBn.trim(),
      descriptionBn: newCatDescBn.trim(),
      sortOrder: categories.length + 1,
      isActive: true
    });

    setNewCatNameBn('');
    setNewCatNameEn('');
    setNewCatDescBn('');
    onRefreshData();
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('এই ক্যাটাগরিটি মুছে ফেলতে চান?')) {
      await api.deleteCategory(id);
      onRefreshData();
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Tab Switcher & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            খাবার মেনু ও ক্যাটাগরি ম্যানেজমেন্ট
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            নতুন খাবার যোগ করুন, দাম ও স্টক পরিবর্তন করুন, ইমেজ আপলোড করুন।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('foods')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'foods' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              খাবারের তালিকা ({foods.length})
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'categories' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ক্যাটাগরি ({categories.length})
            </button>
          </div>

          {activeTab === 'foods' && (
            <button
              onClick={handleOpenAddFood}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন খাবার যোগ</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'foods' ? (
        /* Foods List Table */
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">ছবি</th>
                  <th className="py-3 px-4">খাবারের নাম ও SKU</th>
                  <th className="py-3 px-4">ক্যাটাগরি</th>
                  <th className="py-3 px-4">মূল্য (বিক্রয়)</th>
                  <th className="py-3 px-4">সময় ও স্টক</th>
                  <th className="py-3 px-4">উপলব্ধতা</th>
                  <th className="py-3 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {foods.map(food => (
                  <tr key={food.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <img
                        src={food.image}
                        alt={food.nameBn}
                        referrerPolicy="no-referrer"
                        className="w-12 h-10 rounded-lg object-cover bg-slate-100"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block">{food.nameBn}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{food.sku}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-medium">
                      {food.categoryNameBn}
                    </td>
                    <td className="py-3 px-4 font-bold tabular-nums text-slate-900">
                      ৳{food.salePrice || food.price}
                      {food.salePrice && <span className="text-slate-400 text-[10px] line-through ml-1">৳{food.price}</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span>{food.prepTimeMinutes} মি.</span>
                      <span className="block text-[11px] text-slate-500">স্টক: {food.currentStock}/{food.dailyStock}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        food.isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {food.isAvailable ? 'স্টকে আছে' : 'অনুপলব্ধ'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingFood(food)}
                          className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg"
                          title="সম্পাদনা করুন"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteFood(food.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg"
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
      ) : (
        /* Categories List & Add */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              বর্তমান ক্যাটাগরি তালিকা
            </h3>
            <div className="divide-y divide-slate-100 text-xs">
              {categories.map(cat => (
                <div key={cat.id} className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">{cat.nameBn}</h4>
                    <p className="text-slate-500 text-[11px]">{cat.nameEn} • {cat.descriptionBn}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              নতুন ক্যাটাগরি তৈরি
            </h3>
            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  বাংলা নাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCatNameBn}
                  onChange={e => setNewCatNameBn(e.target.value)}
                  placeholder="যেমন: মিষ্টি ও ডেজার্ট"
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  ইংরেজি নাম
                </label>
                <input
                  type="text"
                  value={newCatNameEn}
                  onChange={e => setNewCatNameEn(e.target.value)}
                  placeholder="Sweets & Desserts"
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  সংক্ষিপ্ত বিবরণ
                </label>
                <input
                  type="text"
                  value={newCatDescBn}
                  onChange={e => setNewCatDescBn(e.target.value)}
                  placeholder="ঘরোয়া মিষ্টি, দই ও পায়েস"
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg transition-colors"
              >
                ক্যাটাগরি সেভ করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Food Edit / Create Modal */}
      {editingFood && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingFood.nameBn ? 'খাবার সম্পাদনা করুন' : 'নতুন খাবার যোগ করুন'}
              </h3>
              <button
                onClick={() => setEditingFood(null)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFood} className="space-y-4 text-xs">
              {/* Row 1: Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    খাবারের নাম (বাংলা) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingFood.nameBn || ''}
                    onChange={e => setEditingFood({ ...editingFood, nameBn: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    খাবারের নাম (ইংরেজি)
                  </label>
                  <input
                    type="text"
                    value={editingFood.nameEn || ''}
                    onChange={e => setEditingFood({ ...editingFood, nameEn: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Row 2: Category & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    ক্যাটাগরি
                  </label>
                  <select
                    value={editingFood.categoryId || ''}
                    onChange={e => setEditingFood({ ...editingFood, categoryId: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-emerald-600"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.nameBn}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    SKU কোড
                  </label>
                  <input
                    type="text"
                    value={editingFood.sku || ''}
                    onChange={e => setEditingFood({ ...editingFood, sku: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Row 3: Prices & Portion */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    নিয়মিত মূল্য (৳) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={editingFood.price || 0}
                    onChange={e => setEditingFood({ ...editingFood, price: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    অফার মূল্য / সেল প্রাইস (ঐচ্ছিক)
                  </label>
                  <input
                    type="number"
                    value={editingFood.salePrice || ''}
                    onChange={e => setEditingFood({ ...editingFood, salePrice: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    পরিমাণ / পরিবেশন (যেমন: ১ জন)
                  </label>
                  <input
                    type="text"
                    value={editingFood.portionBn || ''}
                    onChange={e => setEditingFood({ ...editingFood, portionBn: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Row 4: Prep Time & Advance Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    রান্নার সময় (মিনিট)
                  </label>
                  <input
                    type="number"
                    value={editingFood.prepTimeMinutes || 30}
                    onChange={e => setEditingFood({ ...editingFood, prepTimeMinutes: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    দৈনিক স্টক সীমা
                  </label>
                  <input
                    type="number"
                    value={editingFood.dailyStock || 20}
                    onChange={e => setEditingFood({ ...editingFood, dailyStock: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    বর্তমান স্টক
                  </label>
                  <input
                    type="number"
                    value={editingFood.currentStock || 20}
                    onChange={e => setEditingFood({ ...editingFood, currentStock: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Image Upload & Preview */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="font-semibold text-slate-800 block">
                  খাবারের ছবি আপলোড / URL
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={editingFood.image || '/src/assets/images/hero_ghorer_shad_feast_1791709454258.jpg'}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-16 h-14 rounded-lg object-cover bg-white border border-slate-200"
                  />
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-700 file:text-white hover:file:bg-emerald-800 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={editingFood.image || ''}
                      onChange={e => setEditingFood({ ...editingFood, image: e.target.value })}
                      placeholder="বা ইমেজ পাথ/ইউআরএল লিখুন..."
                      className="w-full mt-1.5 p-1.5 rounded-md border border-slate-200 bg-white text-[11px]"
                    />
                  </div>
                </div>
                {isUploading && <span className="text-[11px] text-emerald-700">ইমেজ আপলোড হচ্ছে...</span>}
              </div>

              {/* Descriptions */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  সংক্ষিপ্ত বিবরণ (কার্ডের জন্য)
                </label>
                <input
                  type="text"
                  value={editingFood.shortDescBn || ''}
                  onChange={e => setEditingFood({ ...editingFood, shortDescBn: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  পূর্ণাঙ্গ বিবরণ ও উপাদান
                </label>
                <textarea
                  rows={2}
                  value={editingFood.fullDescBn || ''}
                  onChange={e => setEditingFood({ ...editingFood, fullDescBn: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Checkboxes: Available, Featured, Bestseller */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingFood.isAvailable}
                    onChange={e => setEditingFood({ ...editingFood, isAvailable: e.target.checked })}
                    className="rounded text-emerald-700"
                  />
                  <span>উপলব্ধ (Available)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingFood.isFeatured}
                    onChange={e => setEditingFood({ ...editingFood, isFeatured: e.target.checked })}
                    className="rounded text-emerald-700"
                  />
                  <span>স্পেশাল ফিচারড (Featured)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingFood.isBestseller}
                    onChange={e => setEditingFood({ ...editingFood, isBestseller: e.target.checked })}
                    className="rounded text-amber-600"
                  />
                  <span>বেস্টসেলার (Bestseller)</span>
                </label>
              </div>

              {/* Variants Builder */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">ভ্যারিয়েন্ট তালিকা (পোলাও/ভাত/পরোটা ইত্যাদি)</span>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="text-xs text-emerald-700 font-semibold hover:underline"
                  >
                    + ভ্যারিয়েন্ট যোগ
                  </button>
                </div>
                {(editingFood.variants || []).map((v, i) => (
                  <div key={v.id || i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={v.nameBn}
                      onChange={e => {
                        const next = [...(editingFood.variants || [])];
                        next[i].nameBn = e.target.value;
                        setEditingFood({ ...editingFood, variants: next });
                      }}
                      className="flex-1 p-1.5 border rounded bg-white text-xs"
                      placeholder="ভ্যারিয়েন্টের নাম"
                    />
                    <input
                      type="number"
                      value={v.additionalPrice}
                      onChange={e => {
                        const next = [...(editingFood.variants || [])];
                        next[i].additionalPrice = Number(e.target.value);
                        setEditingFood({ ...editingFood, variants: next });
                      }}
                      className="w-24 p-1.5 border rounded bg-white text-xs"
                      placeholder="অতিরিক্ত ৳"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(v.id)}
                      className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Addons Builder */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">অতিরিক্ত অ্যাড-অন (ডিম/বোরহানি/দই ইত্যাদি)</span>
                  <button
                    type="button"
                    onClick={handleAddAddon}
                    className="text-xs text-emerald-700 font-semibold hover:underline"
                  >
                    + অ্যাড-অন যোগ
                  </button>
                </div>
                {(editingFood.addons || []).map((a, i) => (
                  <div key={a.id || i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={a.nameBn}
                      onChange={e => {
                        const next = [...(editingFood.addons || [])];
                        next[i].nameBn = e.target.value;
                        setEditingFood({ ...editingFood, addons: next });
                      }}
                      className="flex-1 p-1.5 border rounded bg-white text-xs"
                      placeholder="অ্যাড-অন নাম"
                    />
                    <input
                      type="number"
                      value={a.price}
                      onChange={e => {
                        const next = [...(editingFood.addons || [])];
                        next[i].price = Number(e.target.value);
                        setEditingFood({ ...editingFood, addons: next });
                      }}
                      className="w-24 p-1.5 border rounded bg-white text-xs"
                      placeholder="মূল্য ৳"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveAddon(a.id)}
                      className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingFood(null)}
                  className="px-4 py-2 border rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-xs"
                >
                  {isSaving ? 'সংরক্ষিত হচ্ছে...' : 'খাবার সেভ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
