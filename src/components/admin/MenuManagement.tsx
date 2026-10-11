import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Check,
  X,
  UploadCloud,
  Search,
  Filter,
  Sparkles,
  UtensilsCrossed,
  Clock,
  Flame,
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { FoodItem, Category, FoodVariant, FoodAddon } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface MenuManagementProps {
  foods: FoodItem[];
  categories: Category[];
  onRefreshData: () => void;
}

export const MenuManagement: React.FC<MenuManagementProps> = ({
  foods,
  categories,
  onRefreshData
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'foods' | 'categories'>('foods');
  const [editingFood, setEditingFood] = useState<Partial<FoodItem> | null>(null);
  const [formSection, setFormSection] = useState<'basic' | 'pricing' | 'prep' | 'variants' | 'media'>('basic');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAiFilling, setIsAiFilling] = useState(false);
  const [broadcastToAllUsers, setBroadcastToAllUsers] = useState(false);

  const handleAiFillDescription = async () => {
    if (!editingFood?.nameBn?.trim()) return;
    setIsAiFilling(true);
    try {
      const cat = categories.find(c => c.id === editingFood.categoryId);
      const res = await api.adminGenerateFoodWithAi(editingFood.nameBn, cat?.nameBn || 'বাঙালি খাবার', editingFood.spiceLevel);
      setEditingFood(prev => prev ? {
        ...prev,
        shortDescBn: res.shortDescBn || prev.shortDescBn,
        fullDescBn: res.fullDescBn || prev.fullDescBn,
        portionBn: res.portionBn || prev.portionBn,
        price: prev.price || res.suggestedPrice || 250,
        prepTimeMinutes: res.prepTimeMinutes || prev.prepTimeMinutes || 30,
        advanceNoticeRequiredHours: res.advanceNoticeRequiredHours || prev.advanceNoticeRequiredHours || 4
      } : null);
    } catch (err) {
      console.error('AI fill error:', err);
    } finally {
      setIsAiFilling(false);
    }
  };

  // Category state
  const [newCatNameBn, setNewCatNameBn] = useState('');
  const [newCatNameEn, setNewCatNameEn] = useState('');
  const [newCatDescBn, setNewCatDescBn] = useState('');

  const handleOpenAddFood = () => {
    setFormSection('basic');
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
      salePrice: undefined,
      portionBn: '১ জনের পেটভরা মিল',
      portionEn: '1 Full Meal',
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

      if (broadcastToAllUsers) {
        api.broadcastEmail({
          subject: `🍲 [নতুন খাবার] ${payload.nameBn} এখন ঘরের স্বাদ-এ প্রস্তুত!`,
          headline: `${payload.nameBn} — জিভে জল আনা খাঁটি ঘরোয়া স্বাদের নতুন আয়োজন!`,
          contentText: `প্রিয় খাদ্যপ্রেমী,\n\nঘরের স্বাদ-এ আপনাদের জন্য যুক্ত হয়েছে নতুন মুখরোচক খাবার "${payload.nameBn}"। খাঁটি ঘরোয়া মশলা আর নিখাদ ভালোবাসায় তৈরি এই পদটি এখন অর্ডার করা যাচ্ছে।\n\n• খাবারের নাম: ${payload.nameBn} (${payload.nameEn || ''})\n• সংক্ষিপ্ত বিবরণ: ${payload.shortDescBn || payload.fullDescBn || 'ঘরোয়া তাজা রান্না'}\n• মূল্য: ৳${payload.salePrice || payload.price}\n\nদেরি না করে এখনই ভিজিট করুন এবং অগ্রিম অর্ডার দিন!`,
          foodId: payload.id
        }).catch(err => console.warn('Product add broadcast error:', err));
      }

      setIsSaving(false);
      setEditingFood(null);
      setBroadcastToAllUsers(false);
      onRefreshData();
    } catch (err) {
      console.error(err);
      setIsSaving(false);
    }
  };

  const handleDeleteFood = async (id: string) => {
    try {
      await api.deleteFood(id);
      onRefreshData();
    } catch (err) {
      console.error('Delete food error:', err);
    }
  };

  const handleToggleAvailable = async (food: FoodItem) => {
    await api.saveFood({
      ...food,
      isAvailable: !food.isAvailable
    });
    onRefreshData();
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
      nameBn: 'অতিরিক্ত পদ',
      nameEn: 'Extra Side Item',
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

    await api.saveCategory({
      id: `cat-${Date.now()}`,
      nameBn: newCatNameBn.trim(),
      nameEn: newCatNameEn.trim() || newCatNameBn.trim(),
      descriptionBn: newCatDescBn.trim() || '',
      sortOrder: categories.length + 1,
      isActive: true
    });

    setNewCatNameBn('');
    setNewCatNameEn('');
    setNewCatDescBn('');
    onRefreshData();
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await api.deleteCategory(id);
      onRefreshData();
    } catch (err) {
      console.error('Delete category error:', err);
    }
  };

  const filteredFoods = foods.filter(f => {
    const matchesCat = categoryFilter === 'all' || f.categoryId === categoryFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      searchQuery === '' ||
      f.nameBn.toLowerCase().includes(q) ||
      f.nameEn.toLowerCase().includes(q) ||
      f.sku.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Top Bar Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {language === 'en' ? 'Menu & Dishes Catalog' : 'মেনু ও খাদ্যসামগ্রী ব্যবস্থাপনা'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'en'
                ? 'Create, edit, price, and manage inventory for all authentic dishes.'
                : 'সকল খাবার, রেসিপি বিবরণ, মূল্য, ভ্যারিয়েন্ট ও দৈনিক স্টক নিয়ন্ত্রণ করুন।'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tabs */}
          <div className="p-1 bg-slate-100 rounded-xl flex items-center text-xs font-semibold">
            <button
              onClick={() => setActiveTab('foods')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'foods'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'en' ? `Dishes (${foods.length})` : `খাবারের তালিকা (${foods.length})`}
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'categories'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'en' ? `Categories (${categories.length})` : `ক্যাটাগরি (${categories.length})`}
            </button>
          </div>

          {activeTab === 'foods' && (
            <button
              onClick={handleOpenAddFood}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'en' ? 'Add Food' : 'নতুন খাবার'}</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'foods' ? (
        <div className="space-y-4">
          {/* Search & Category Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between text-xs">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={language === 'en' ? 'Search by food name or SKU...' : 'খাবারের নাম বা এসকেইউ (SKU) দিয়ে খুঁজুন...'}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <span className="text-slate-400 font-semibold shrink-0 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                {language === 'en' ? 'Category:' : 'ক্যাটাগরি:'}
              </span>
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
                  categoryFilter === 'all'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {language === 'en' ? 'All' : 'সব'}
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setCategoryFilter(c.id)}
                  className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
                    categoryFilter === c.id
                      ? 'bg-emerald-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {language === 'en' ? c.nameEn : c.nameBn}
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Food Data Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">{language === 'en' ? 'Dish' : 'খাবারের তথ্য'}</th>
                    <th className="py-3.5 px-4">{language === 'en' ? 'Category' : 'ক্যাটাগরি'}</th>
                    <th className="py-3.5 px-4">{language === 'en' ? 'Price' : 'মূল্য'}</th>
                    <th className="py-3.5 px-4">{language === 'en' ? 'Stock & Time' : 'স্টক ও প্রস্তুতি'}</th>
                    <th className="py-3.5 px-4">{language === 'en' ? 'Availability' : 'উপলব্ধতা'}</th>
                    <th className="py-3.5 px-4 text-right">{language === 'en' ? 'Actions' : 'অ্যাকশন'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredFoods.map(food => (
                    <tr key={food.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={food.image}
                            alt={food.nameBn}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block text-sm">{food.nameBn}</span>
                            <span className="text-[11px] text-slate-400 font-mono">{food.sku} • {food.nameEn}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-100 text-[11px]">
                          {food.categoryNameBn}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold tabular-nums text-slate-900 text-sm">
                          ৳{food.salePrice || food.price}
                          {food.salePrice && (
                            <span className="text-slate-400 text-[11px] line-through ml-1.5 font-normal">
                              ৳{food.price}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-800 block">
                            {language === 'en' ? 'Stock:' : 'স্টক:'} {food.currentStock}/{food.dailyStock}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {food.prepTimeMinutes} মি. • {food.advanceNoticeRequiredHours || 4}h অগ্রিম
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleAvailable(food)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                            food.isAvailable
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          {food.isAvailable
                            ? (language === 'en' ? '● Available' : '● স্টকে আছে')
                            : (language === 'en' ? '○ Unavailable' : '○ অনুপলব্ধ')}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingFood(food);
                              setFormSection('basic');
                            }}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="সম্পাদনা করুন"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteFood(food.id)}
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
        </div>
      ) : (
        /* Categories List & Add */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              {language === 'en' ? 'Existing Categories' : 'বর্তমান ক্যাটাগরি তালিকা'}
            </h3>
            <div className="divide-y divide-slate-100 text-xs">
              {categories.map(cat => (
                <div key={cat.id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{cat.nameBn}</h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">{cat.nameEn} • {cat.descriptionBn}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              {language === 'en' ? 'Create New Category' : 'নতুন ক্যাটাগরি তৈরি'}
            </h3>
            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {language === 'en' ? 'Name (Bengali) *' : 'বাংলা নাম *'}
                </label>
                <input
                  type="text"
                  required
                  value={newCatNameBn}
                  onChange={e => setNewCatNameBn(e.target.value)}
                  placeholder="যেমন: মিষ্টি ও ডেজার্ট"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {language === 'en' ? 'Name (English)' : 'ইংরেজি নাম'}
                </label>
                <input
                  type="text"
                  value={newCatNameEn}
                  onChange={e => setNewCatNameEn(e.target.value)}
                  placeholder="Sweets & Desserts"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {language === 'en' ? 'Short Description' : 'সংক্ষিপ্ত বিবরণ'}
                </label>
                <input
                  type="text"
                  value={newCatDescBn}
                  onChange={e => setNewCatDescBn(e.target.value)}
                  placeholder="ঘরোয়া মিষ্টি, দই ও পায়েস"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs transition-colors"
              >
                {language === 'en' ? 'Save Category' : 'ক্যাটাগরি সেভ করুন'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced Food Edit / Create Modal with Clean Form Layout */}
      {editingFood && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-emerald-100 flex flex-col my-6">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingFood.nameBn ? (language === 'en' ? 'Edit Dish Profile' : 'খাবার তথ্য সম্পাদনা') : (language === 'en' ? 'Add New Dish to Catalog' : 'নতুন খাবার যোগ করুন')}
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  SKU: {editingFood.sku || 'GS-AUTO'}
                </span>
              </div>
              <button
                onClick={() => setEditingFood(null)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Section Navigation Tabs */}
            <div className="px-5 border-b border-slate-100 flex gap-1 overflow-x-auto bg-white text-xs font-semibold py-2">
              <button
                type="button"
                onClick={() => setFormSection('basic')}
                className={`px-3 py-1.8 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  formSection === 'basic' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {language === 'en' ? '1. General Info' : '১. সাধারণ তথ্য'}
              </button>
              <button
                type="button"
                onClick={() => setFormSection('pricing')}
                className={`px-3 py-1.8 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  formSection === 'pricing' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {language === 'en' ? '2. Pricing & Stock' : '২. মূল্য ও স্টক'}
              </button>
              <button
                type="button"
                onClick={() => setFormSection('prep')}
                className={`px-3 py-1.8 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  formSection === 'prep' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {language === 'en' ? '3. Prep & Diet' : '৩. প্রস্তুতি ও বৈশিষ্ট্য'}
              </button>
              <button
                type="button"
                onClick={() => setFormSection('variants')}
                className={`px-3 py-1.8 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  formSection === 'variants' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {language === 'en' ? '4. Variants & Addons' : '৪. ভ্যারিয়েন্ট ও অ্যাড-অন'}
              </button>
              <button
                type="button"
                onClick={() => setFormSection('media')}
                className={`px-3 py-1.8 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  formSection === 'media' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {language === 'en' ? '5. Media & Photos' : '৫. ছবি ও ভিজ্যুয়াল'}
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveFood} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {/* Section 1: Basic */}
              {formSection === 'basic' && (
                <div className="space-y-4">
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
                        placeholder="যেমন: সরষে ইলিশ ও জাফরানি পোলাও"
                        className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
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
                        placeholder="Shorshe Ilish with Saffron Pulao"
                        className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        ক্যাটাগরি <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={editingFood.categoryId || ''}
                        onChange={e => setEditingFood({ ...editingFood, categoryId: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-600"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.nameBn} ({c.nameEn})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        এসকেইউ কোড (SKU)
                      </label>
                      <input
                        type="text"
                        value={editingFood.sku || ''}
                        onChange={e => setEditingFood({ ...editingFood, sku: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="font-bold text-slate-700">খাবারের বিবরণ ও রেসিপি</span>
                    <button
                      type="button"
                      disabled={isAiFilling || !editingFood.nameBn?.trim()}
                      onClick={handleAiFillDescription}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 cursor-pointer transition-colors shadow-2xs"
                    >
                      <Sparkles className={`w-3.5 h-3.5 text-amber-500 ${isAiFilling ? 'animate-spin' : ''}`} />
                      <span>{isAiFilling ? 'এআই দিয়ে লেখা হচ্ছে...' : '✨ এআই দিয়ে বিবরণ পূরণ করুন'}</span>
                    </button>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      সংক্ষিপ্ত বিবরণ (কার্ড ও মেনু প্রিভিউ)
                    </label>
                    <textarea
                      rows={2}
                      value={editingFood.shortDescBn || ''}
                      onChange={e => setEditingFood({ ...editingFood, shortDescBn: e.target.value })}
                      placeholder="পদ্মার তাজা ইলিশের খাঁটি সরিষা বাটা রেসিপি ও সুগন্ধি পোলাও।"
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      সম্পূর্ণ রেসিপি ও উপকরণ বিবরণ
                    </label>
                    <textarea
                      rows={3}
                      value={editingFood.fullDescBn || ''}
                      onChange={e => setEditingFood({ ...editingFood, fullDescBn: e.target.value })}
                      placeholder="খাবারের বিস্তারিত প্রস্তুতি, স্বাস্থ্যসম্মত উপায়ে রান্নার নিয়ম..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              )}

              {/* Section 2: Pricing */}
              {formSection === 'pricing' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        নিয়মিত মূল্য (৳) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        value={editingFood.price || 0}
                        onChange={e => setEditingFood({ ...editingFood, price: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        ছাড়কৃত অফার মূল্য (৳, ঐচ্ছিক)
                      </label>
                      <input
                        type="number"
                        value={editingFood.salePrice || ''}
                        onChange={e => setEditingFood({ ...editingFood, salePrice: e.target.value ? Number(e.target.value) : undefined })}
                        placeholder="অফার না থাকলে ফাঁকা রাখুন"
                        className="w-full p-2.5 rounded-xl border border-slate-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        দৈনিক সক্ষমতা / সর্বোচ্চ স্টক
                      </label>
                      <input
                        type="number"
                        value={editingFood.dailyStock || 25}
                        onChange={e => setEditingFood({ ...editingFood, dailyStock: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl border border-slate-200"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        বর্তমান লাইভ স্টক
                      </label>
                      <input
                        type="number"
                        value={editingFood.currentStock || 25}
                        onChange={e => setEditingFood({ ...editingFood, currentStock: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-emerald-800"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        ন্যূনতম অর্ডার পরিমাণ
                      </label>
                      <input
                        type="number"
                        value={editingFood.minOrderQty || 1}
                        onChange={e => setEditingFood({ ...editingFood, minOrderQty: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl border border-slate-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Section 3: Prep */}
              {formSection === 'prep' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        পরিমাণ / পরিবেশন বিবরণ (বাংলা)
                      </label>
                      <input
                        type="text"
                        value={editingFood.portionBn || ''}
                        onChange={e => setEditingFood({ ...editingFood, portionBn: e.target.value })}
                        placeholder="যেমন: ১ জনের পেটভরা মিল (১ টুকরা ইলিশ + পোলাও)"
                        className="w-full p-2.5 rounded-xl border border-slate-200"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        পরিবেশন বিবরণ (ইংরেজি)
                      </label>
                      <input
                        type="text"
                        value={editingFood.portionEn || ''}
                        onChange={e => setEditingFood({ ...editingFood, portionEn: e.target.value })}
                        placeholder="1 Full Meal"
                        className="w-full p-2.5 rounded-xl border border-slate-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        রান্নার সময় (মিনিট)
                      </label>
                      <input
                        type="number"
                        value={editingFood.prepTimeMinutes || 30}
                        onChange={e => setEditingFood({ ...editingFood, prepTimeMinutes: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl border border-slate-200"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        অগ্রিম নোটিশ আবশ্যক (ঘন্টা)
                      </label>
                      <input
                        type="number"
                        value={editingFood.advanceNoticeRequiredHours || 4}
                        onChange={e => setEditingFood({ ...editingFood, advanceNoticeRequiredHours: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl border border-slate-200"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        ঝাল মাত্রা (Spice Level)
                      </label>
                      <select
                        value={editingFood.spiceLevel || 'Medium'}
                        onChange={e => setEditingFood({ ...editingFood, spiceLevel: e.target.value as any })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                      >
                        <option value="Mild">মৃদু (Mild)</option>
                        <option value="Medium">মাঝারি (Medium)</option>
                        <option value="Spicy">ঝাল (Spicy)</option>
                      </select>
                    </div>
                  </div>

                  {/* Badges toggles */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-wrap gap-5">
                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={editingFood.isAvailable}
                        onChange={e => setEditingFood({ ...editingFood, isAvailable: e.target.checked })}
                        className="rounded text-emerald-700"
                      />
                      <span>খাবারটি বিক্রির জন্য সক্রিয় রাখুন</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={editingFood.isFeatured}
                        onChange={e => setEditingFood({ ...editingFood, isFeatured: e.target.checked })}
                        className="rounded text-emerald-700"
                      />
                      <span>হোমপেজে ফিচারড দেখান</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={editingFood.isBestseller}
                        onChange={e => setEditingFood({ ...editingFood, isBestseller: e.target.checked })}
                        className="rounded text-emerald-700"
                      />
                      <span>বেস্টসেলার ব্যাজ যুক্ত করুন</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Section 4: Variants & Addons */}
              {formSection === 'variants' && (
                <div className="space-y-6">
                  {/* Variants */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900">
                        খাবারের ভ্যারিয়েন্ট বা সাইজ অপশন
                      </h4>
                      <button
                        type="button"
                        onClick={handleAddVariant}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-emerald-700 font-bold hover:bg-emerald-50 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>ভ্যারিয়েন্ট যোগ</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {editingFood.variants?.map((v, i) => (
                        <div key={v.id} className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                          <input
                            type="text"
                            value={v.nameBn}
                            onChange={e => {
                              const updated = [...(editingFood.variants || [])];
                              updated[i].nameBn = e.target.value;
                              setEditingFood({ ...editingFood, variants: updated });
                            }}
                            placeholder="ভ্যারিয়েন্টের নাম (যেমন: হাফ প্লেট / ফুল প্লেট)"
                            className="flex-1 p-1.5 border rounded-lg"
                          />
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-slate-400">৳</span>
                            <input
                              type="number"
                              value={v.additionalPrice}
                              onChange={e => {
                                const updated = [...(editingFood.variants || [])];
                                updated[i].additionalPrice = Number(e.target.value);
                                setEditingFood({ ...editingFood, variants: updated });
                              }}
                              className="w-20 p-1.5 border rounded-lg font-bold"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(v.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Addons */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900">
                        অতিরিক্ত পদ / অ্যাড-অন অপশন
                      </h4>
                      <button
                        type="button"
                        onClick={handleAddAddon}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-emerald-700 font-bold hover:bg-emerald-50 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>অ্যাড-অন যোগ</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {editingFood.addons?.map((a, i) => (
                        <div key={a.id} className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                          <input
                            type="text"
                            value={a.nameBn}
                            onChange={e => {
                              const updated = [...(editingFood.addons || [])];
                              updated[i].nameBn = e.target.value;
                              setEditingFood({ ...editingFood, addons: updated });
                            }}
                            placeholder="অ্যাড-অনের নাম (যেমন: ডিম ভুনা বা বোরহানি)"
                            className="flex-1 p-1.5 border rounded-lg"
                          />
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-slate-400">৳</span>
                            <input
                              type="number"
                              value={a.price}
                              onChange={e => {
                                const updated = [...(editingFood.addons || [])];
                                updated[i].price = Number(e.target.value);
                                setEditingFood({ ...editingFood, addons: updated });
                              }}
                              className="w-20 p-1.5 border rounded-lg font-bold"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveAddon(a.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Section 5: Media */}
              {formSection === 'media' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                    <div className="space-y-3">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">
                          খাবারের ছবি ইউআরএল (Image URL)
                        </label>
                        <input
                          type="text"
                          value={editingFood.image || ''}
                          onChange={e => setEditingFood({ ...editingFood, image: e.target.value })}
                          placeholder="/src/assets/images/... বা ওয়েব লিংক"
                          className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-[11px]"
                        />
                      </div>

                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2">
                        <UploadCloud className="w-8 h-8 text-emerald-700 mx-auto" />
                        <span className="font-semibold text-slate-800 block">
                          কম্পিউটার বা মোবাইল থেকে ছবি আপলোড করুন
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          disabled={isUploading}
                          className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-700 file:text-white hover:file:bg-emerald-800 cursor-pointer"
                        />
                        {isUploading && (
                          <span className="text-[11px] text-emerald-700 font-bold block">
                            ছবি আপলোড হচ্ছে...
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="font-semibold text-slate-700 block mb-2">
                        লাইভ প্রিভিউ (Customer Card Preview)
                      </span>
                      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                        <img
                          src={editingFood.image}
                          alt="Preview"
                          className="w-full h-44 object-cover"
                        />
                        <div className="p-3">
                          <h5 className="font-bold text-slate-900 text-sm">
                            {editingFood.nameBn || 'খাবারের নাম'}
                          </h5>
                          <span className="text-emerald-700 font-bold text-sm block mt-1">
                            ৳{editingFood.salePrice || editingFood.price || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Broadcast Announcement Option */}
              <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">📢</span>
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">
                      নতুন খাবারের ঘোষণা ইমেইল ব্রডকাস্ট করুন
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      সেভ করার সাথে সাথে সকল নিবন্ধিত গ্রাহকের কাছে এই খাবারের সুস্বাদু বিবরণী সহ ইমেইল চলে যাবে।
                    </span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={broadcastToAllUsers}
                    onChange={e => setBroadcastToAllUsers(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-700"></div>
                </label>
              </div>

              {/* Bottom Form Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex gap-2">
                  {formSection !== 'basic' && (
                    <button
                      type="button"
                      onClick={() => {
                        const sections: ('basic' | 'pricing' | 'prep' | 'variants' | 'media')[] = ['basic', 'pricing', 'prep', 'variants', 'media'];
                        const curr = sections.indexOf(formSection);
                        if (curr > 0) setFormSection(sections[curr - 1]);
                      }}
                      className="px-3 py-1.8 border rounded-xl"
                    >
                      পূর্ববর্তী
                    </button>
                  )}
                  {formSection !== 'media' && (
                    <button
                      type="button"
                      onClick={() => {
                        const sections: ('basic' | 'pricing' | 'prep' | 'variants' | 'media')[] = ['basic', 'pricing', 'prep', 'variants', 'media'];
                        const curr = sections.indexOf(formSection);
                        if (curr < sections.length - 1) setFormSection(sections[curr + 1]);
                      }}
                      className="px-3 py-1.8 bg-slate-100 text-slate-800 rounded-xl font-semibold"
                    >
                      পরবর্তী ধাপ
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingFood(null)}
                    className="px-4 py-2 border rounded-xl font-semibold"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isSaving ? 'সংরক্ষণ হচ্ছে...' : 'খাবার সেভ করুন'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
