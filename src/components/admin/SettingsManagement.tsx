import React, { useState } from 'react';
import { Settings, Save, CheckCircle, Phone, MessageSquare, ShieldCheck, User, UploadCloud, Image as ImageIcon, Share2, Globe, Trash2 } from 'lucide-react';
import { BusinessConfig } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { BrandLogo } from '../common/BrandLogo.tsx';

interface SettingsManagementProps {
  config: BusinessConfig;
  onRefreshConfig: () => void;
}

export const SettingsManagement: React.FC<SettingsManagementProps> = ({ config, onRefreshConfig }) => {
  const { language } = useLanguage();
  const [formData, setFormData] = useState<BusinessConfig>({ ...config });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        setIsUploadingLogo(true);
        const res = await api.uploadImage(reader.result as string, file.name);
        setFormData(prev => ({ ...prev, logoUrl: res.url }));
      } catch (err) {
        console.error('Logo upload error:', err);
      } finally {
        setIsUploadingLogo(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await api.updateConfig(formData);
      setIsSaving(false);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
      onRefreshConfig();
    } catch (err) {
      console.error(err);
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-4xl">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {language === 'en' ? 'Business Settings & Brand Configuration' : 'ব্যবসা সেটিংস ও ব্র্যান্ড কনফিগারেশন'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'en' ? 'Update owner contact, hotline, WhatsApp, advance ordering notice, and default accounts.' : 'মালিকের নাম, ফোন, হোয়াটসঅ্যাপ, অগ্রিম অর্ডারের সময়সীমা এবং পেমেন্ট নম্বর নিয়ন্ত্রণ করুন।'}
          </p>
        </div>

        {successMsg && (
          <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg text-xs font-semibold">
            <CheckCircle className="w-4 h-4" />
            <span>{language === 'en' ? 'Successfully saved!' : 'সফলভাবে সংরক্ষিত হয়েছে!'}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Brand & Proprietor Details */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-700" />
            <span>১. ব্র্যান্ড পরিচয় ও স্বত্বাধিকারী</span>
          </h3>

          {/* Logo Upload & Customizer */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-5">
            <div className="shrink-0 flex flex-col items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500">বর্তমান লোগো</span>
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white border-2 border-emerald-500/40 p-1 shadow-xs flex items-center justify-center">
                <img
                  src={formData.logoUrl || '/logo.jpg'}
                  alt="Logo"
                  className="w-full h-full object-contain rounded-xl"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/logo.jpg'; }}
                />
              </div>
            </div>

            <div className="flex-1 w-full space-y-2 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  ওয়েবসাইট লোগো পরিবর্তন করুন (Logo Change / Upload)
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs">
                    <UploadCloud className="w-4 h-4" />
                    <span>{isUploadingLogo ? 'আপলোড হচ্ছে...' : 'নতুন লোগো ছবি আপলোড করুন'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileChange}
                      disabled={isUploadingLogo}
                      className="hidden"
                    />
                  </label>
                  {formData.logoUrl && formData.logoUrl !== '/logo.jpg' && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, logoUrl: '/logo.jpg' }))}
                      className="px-2.5 py-2 text-slate-500 hover:text-rose-600 rounded-xl hover:bg-rose-50 border border-slate-200 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>রিসেট ডিফল্ট</span>
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block mb-0.5">
                  অথবা সরাসরি লোগো ইমেজ লিঙ্ক / পাথ দিন:
                </label>
                <input
                  type="text"
                  value={formData.logoUrl || ''}
                  onChange={e => setFormData({ ...formData, logoUrl: e.target.value })}
                  placeholder="/logo.jpg বা https://..."
                  className="w-full p-2 rounded-lg border border-slate-200 font-mono text-[11px]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                পাবলিক ব্যবসায়িক পরিচিতি / পরিচালকের নাম (Editable)
              </label>
              <input
                type="text"
                required
                value={formData.contactPerson}
                onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="যেমন: Joynob Islam Kakoly"
                className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600 bg-emerald-50/20 font-semibold text-slate-900"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                এই নামটি ফুটার এবং মেমোতে পরিচালনায় প্রদর্শিত হবে।
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                ব্র্যান্ড নাম (বাংলা)
              </label>
              <input
                type="text"
                value={formData.brandNameBn}
                onChange={e => setFormData({ ...formData, brandNameBn: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                ট্যাগলাইন (বাংলা)
              </label>
              <input
                type="text"
                value={formData.taglineBn}
                onChange={e => setFormData({ ...formData, taglineBn: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                প্রধান অবস্থান
              </label>
              <input
                type="text"
                value={formData.primaryLocation}
                onChange={e => setFormData({ ...formData, primaryLocation: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Brand Theme & Design System */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-emerald-600 inline-block border border-emerald-700" />
              <span>২. ব্র্যান্ড কালার ও ভিজ্যুয়াল থিম সিস্টেম</span>
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
              UI/UX Consistency
            </span>
          </h3>

          <p className="text-xs text-slate-500">
            গ্রাহক ওয়েবসাইট (হেডার, বাটন, প্রাইস, ব্যাজ, চেকআউট) এবং অ্যাডমিন প্যানেলে ব্র্যান্ড কালার সিস্টেমের প্রয়োগ নিয়ন্ত্রণ করুন।
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                প্রাইমারি ব্র্যান্ড কালার (Primary Brand Color)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.primaryColor || '#166534'}
                  onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-10 h-10 rounded-lg border border-slate-300 p-0.5 cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={formData.primaryColor || '#166534'}
                  onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                  placeholder="#166534"
                  className="w-full p-2.5 rounded-lg border border-slate-200 font-mono uppercase"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                ব্যবহৃত হবে: হেডার, প্রধান বাটনসমূহ, ক্যাটাগরি পিল, অ্যাডমিন সাইডবার ও অ্যাক্টিভ স্টেট।
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                অ্যাকসেন্ট কালার (Accent / Highlight Color)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.accentColor || '#d97706'}
                  onChange={e => setFormData({ ...formData, accentColor: e.target.value })}
                  className="w-10 h-10 rounded-lg border border-slate-300 p-0.5 cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={formData.accentColor || '#d97706'}
                  onChange={e => setFormData({ ...formData, accentColor: e.target.value })}
                  placeholder="#d97706"
                  className="w-full p-2.5 rounded-lg border border-slate-200 font-mono uppercase"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                ব্যবহৃত হবে: জনপ্রিয় ব্যাজ, স্টার রেটিং, ডিসকাউন্ট অফার, স্পেশাল প্রমোশন।
              </span>
            </div>
          </div>

          {/* Color Presets */}
          <div className="pt-2">
            <span className="text-xs font-semibold text-slate-700 block mb-2">রেকমেন্ডেড কালার প্যালেট প্রিসেট:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, primaryColor: '#166534', accentColor: '#d97706' })}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 flex items-center justify-between text-left transition-colors cursor-pointer bg-slate-50/50"
              >
                <div>
                  <span className="font-bold text-slate-800 block">হেরিটেজ বেঙ্গল</span>
                  <span className="text-[10px] text-slate-400">এমারেল্ড গ্রিন + অ্যাম্বার</span>
                </div>
                <div className="flex gap-1 shrink-0">
                  <span className="w-4 h-4 rounded-full bg-[#166534]" />
                  <span className="w-4 h-4 rounded-full bg-[#d97706]" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, primaryColor: '#0f766e', accentColor: '#ea580c' })}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 flex items-center justify-between text-left transition-colors cursor-pointer bg-slate-50/50"
              >
                <div>
                  <span className="font-bold text-slate-800 block">ন্যাচারাল টিল</span>
                  <span className="text-[10px] text-slate-400">ডিপ টিল + বার্ন অরেঞ্জ</span>
                </div>
                <div className="flex gap-1 shrink-0">
                  <span className="w-4 h-4 rounded-full bg-[#0f766e]" />
                  <span className="w-4 h-4 rounded-full bg-[#ea580c]" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, primaryColor: '#1e3a5f', accentColor: '#b45309' })}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 flex items-center justify-between text-left transition-colors cursor-pointer bg-slate-50/50"
              >
                <div>
                  <span className="font-bold text-slate-800 block">রয়্যাল ঢাকা</span>
                  <span className="text-[10px] text-slate-400">ক্লাসিক নেভি + গোল্ডেন ট্যারাকোটা</span>
                </div>
                <div className="flex gap-1 shrink-0">
                  <span className="w-4 h-4 rounded-full bg-[#1e3a5f]" />
                  <span className="w-4 h-4 rounded-full bg-[#b45309]" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Contact & Hotline */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-700" />
            <span>২. যোগাযোগের তথ্য ও সোশ্যাল লিংক</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                হটলাইন ফোন নম্বর
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                হোয়াটসঅ্যাপ নম্বর (আন্তর্জাতিক ফরম্যাটে)
              </label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                ইমেইল এড্রেস
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                দৈনিক খোলা থাকার সময়
              </label>
              <input
                type="text"
                value={formData.openingHoursBn}
                onChange={e => setFormData({ ...formData, openingHoursBn: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">
                সম্পূর্ণ ঠিকানা
              </label>
              <input
                type="text"
                value={formData.fullAddressBn}
                onChange={e => setFormData({ ...formData, fullAddressBn: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Pre-Order Advance Policy & Notice */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>৩. অগ্রিম অর্ডার ও প্রস্তুতি সময় নীতিমালা</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                স্ট্যান্ডার্ড অগ্রিম সময় (ঘন্টা)
              </label>
              <input
                type="number"
                value={formData.standardAdvanceHours}
                onChange={e => setFormData({ ...formData, standardAdvanceHours: Number(e.target.value) })}
                className="w-full p-2.5 rounded-lg border border-slate-200"
              />
              <span className="text-[11px] text-slate-400 block mt-0.5">ডিফল্ট: ৪-৬ ঘন্টা পূর্বে</span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                জরুরি অগ্রিম সময় (ঘন্টা)
              </label>
              <input
                type="number"
                value={formData.urgentAdvanceHours}
                onChange={e => setFormData({ ...formData, urgentAdvanceHours: Number(e.target.value) })}
                className="w-full p-2.5 rounded-lg border border-slate-200"
              />
              <span className="text-[11px] text-slate-400 block mt-0.5">জরুরি ক্ষেত্রে সরাসরি ফোন যোগাযোগ</span>
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">
                অগ্রিম অর্ডারের পাবলিক নোটিশ বার্তা (বাংলা)
              </label>
              <textarea
                rows={3}
                value={formData.advanceNoticeMessageBn}
                onChange={e => setFormData({ ...formData, advanceNoticeMessageBn: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Announcement Bar & Mobile Banking */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            ৪. অ্যানাউন্সমেন্ট বার ও মোবাইল ব্যাংকিং অ্যাকাউন্ট
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="flex items-center gap-2 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={formData.isAnnouncementActive}
                  onChange={e => setFormData({ ...formData, isAnnouncementActive: e.target.checked })}
                  className="rounded text-emerald-700"
                />
                <span className="font-semibold text-slate-800">অ্যানাউন্সমেন্ট বার চালু রাখুন</span>
              </label>
              <input
                type="text"
                value={formData.announcementBarBn}
                onChange={e => setFormData({ ...formData, announcementBarBn: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">বিকাশ পার্সোনাল নম্বর</label>
                <input
                  type="text"
                  value={formData.bkashNumber}
                  onChange={e => setFormData({ ...formData, bkashNumber: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">নগদ পার্সোনাল নম্বর</label>
                <input
                  type="text"
                  value={formData.nagadNumber}
                  onChange={e => setFormData({ ...formData, nagadNumber: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">রকেট নম্বর</label>
                <input
                  type="text"
                  value={formData.rocketNumber}
                  onChange={e => setFormData({ ...formData, rocketNumber: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 5. Social Media & Online Channels */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Share2 className="w-4 h-4 text-emerald-700" />
            <span>৫. সোশ্যাল মিডিয়া ও অনলাইন চ্যানেল লিংক (FB, YT, TT, IG, WhatsApp)</span>
          </h3>
          <p className="text-xs text-slate-500">
            এই লিংকগুলো ওয়েবসাইটের ফুটার এবং কাস্টমার যোগাযোগ সেকশনে সরাসরি প্রদর্শিত হবে।
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
                <span className="w-5 h-5 rounded-md bg-[#1877F2] text-white flex items-center justify-center font-bold text-[10px]">FB</span>
                <span>Facebook পেজ বা গ্রুপ লিংক</span>
              </label>
              <input
                type="url"
                value={formData.facebookUrl || ''}
                onChange={e => setFormData({ ...formData, facebookUrl: e.target.value })}
                placeholder="https://facebook.com/ghorershad..."
                className="w-full p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
                <span className="w-5 h-5 rounded-md bg-[#FF0000] text-white flex items-center justify-center font-bold text-[10px]">YT</span>
                <span>YouTube চ্যানেল বা ভিডিও লিংক</span>
              </label>
              <input
                type="url"
                value={formData.youtubeUrl || ''}
                onChange={e => setFormData({ ...formData, youtubeUrl: e.target.value })}
                placeholder="https://youtube.com/@ghorershad..."
                className="w-full p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
                <span className="w-5 h-5 rounded-md bg-black text-white flex items-center justify-center font-bold text-[10px]">TT</span>
                <span>TikTok প্রোফাইল লিংক</span>
              </label>
              <input
                type="url"
                value={formData.tiktokUrl || ''}
                onChange={e => setFormData({ ...formData, tiktokUrl: e.target.value })}
                placeholder="https://tiktok.com/@ghorershad..."
                className="w-full p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
                <span className="w-5 h-5 rounded-md bg-gradient-to-tr from-amber-500 to-fuchsia-600 text-white flex items-center justify-center font-bold text-[10px]">IG</span>
                <span>Instagram প্রোফাইল লিংক</span>
              </label>
              <input
                type="url"
                value={formData.instagramUrl || ''}
                onChange={e => setFormData({ ...formData, instagramUrl: e.target.value })}
                placeholder="https://instagram.com/ghorershad..."
                className="w-full p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
                <span className="w-5 h-5 rounded-md bg-[#25D366] text-white flex items-center justify-center font-bold text-[10px]">WA</span>
                <span>WhatsApp হটলাইন নম্বর (আন্তর্জাতিক ফরম্যাটে, যেমন: +8801912838891)</span>
              </label>
              <input
                type="text"
                value={formData.whatsapp || ''}
                onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="+8801912838891"
                className="w-full p-2.5 rounded-lg border border-slate-200 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'সংরক্ষিত হচ্ছে...' : 'সকল সেটিংস সংরক্ষণ করুন'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
