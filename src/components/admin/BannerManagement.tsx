import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Save,
  CheckCircle,
  Eye,
  Sparkles,
  Upload,
  RefreshCw,
  Sliders,
  Type,
  Megaphone,
  Smartphone,
  Monitor
} from 'lucide-react';
import { HomepageContent, BusinessConfig } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';
import heroFeastImg from '../../assets/images/hero_ghorer_shad_feast_1791709454258.jpg';

interface BannerManagementProps {
  config: BusinessConfig;
  onRefreshConfig: () => void;
}

export const BannerManagement: React.FC<BannerManagementProps> = ({
  config,
  onRefreshConfig
}) => {
  const { language } = useLanguage();
  const [content, setContent] = useState<HomepageContent>({
    heroHeadlineBn: "ঘরের রান্নার ভালোবাসা, এবার আপনার দোরগোড়ায়",
    heroHeadlineEn: "Homemade love and authentic tastes, delivered right to your doorstep",
    heroSubtitleBn: "ঘরের স্বাদে বেছে নিন আপনার পছন্দের খাবার। অর্ডার দিন সুবিধামতো, আর আপনার খাবারের সময় আগে থেকেই পরিকল্পনা করুন।",
    heroSubtitleEn: "Choose your favorite homemade Bengali delicacies at Ghorer Shad. Order comfortably and plan your meal timing in advance.",
    ctaMenuBtnBn: "মেনু দেখুন",
    ctaCateringBtnBn: "ক্যাটারিং সম্পর্কে জানুন",
    bannerImage: heroFeastImg,
    offerBadgeBn: "খাঁটি বাঙালি ঐতিহ্য • তাজা রান্না",
    offerBadgeEn: "Authentic Bengali Feast • Fresh Cooking",
    showDiscountBanner: true,
    discountBannerTextBn: "অগ্রিম ৪-৬ ঘন্টা পূর্বে অর্ডারে মানসম্মত সেরা স্বাদের নিশ্চয়তা!"
  });

  const [announcementText, setAnnouncementText] = useState(config.announcementBarBn || '');
  const [isAnnouncementActive, setIsAnnouncementActive] = useState(config.isAnnouncementActive ?? true);

  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Load current homepage content on mount
  React.useEffect(() => {
    fetch('/api/homepage')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setContent(prev => ({ ...prev, ...data }));
        }
      })
      .catch(() => {});
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = reader.result as string;
        const res = await api.uploadImage(dataUrl, 'hero-banner');
        if (res.url) {
          setContent(prev => ({ ...prev, bannerImage: res.url }));
        }
      } catch (err) {
        console.error('Failed to upload image:', err);
      } finally {
        setUploadLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await Promise.all([
        api.updateHomepageContent(content),
        api.updateConfig({
          announcementBarBn: announcementText,
          isAnnouncementActive
        })
      ]);
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      onRefreshConfig();
    } catch (err) {
      console.error('Failed to update banner:', err);
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 text-left max-w-6xl">
      {/* Top Banner Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {language === 'en' ? 'Advanced Hero & Banner Designer' : 'অ্যাডভান্সড হোমপেজ হিরো ও ব্যানার ডিজাইনার'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'en'
                ? 'Customize headline typography, promotional badges, background feast images, and live announcement banner.'
                : 'হোমপেজের প্রধান ব্যানার, ছবির প্রিভিউ, স্পেশাল অফার ব্যাজ এবং অ্যানাউন্সমেন্ট টেক্সট রিয়েল-টাইমে পরিবর্তন করুন।'}
            </p>
          </div>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-xl text-xs font-bold border border-emerald-200">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>সফলভাবে সেভ হয়েছে!</span>
          </div>
        )}
      </div>

      {/* Live Preview Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              লাইভ প্রিভিউ (Real-Time Visual Preview)
            </h3>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setPreviewMode('desktop')}
              className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                previewMode === 'desktop' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>ডেস্কটপ</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('mobile')}
              className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                previewMode === 'mobile' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>মোবাইল</span>
            </button>
          </div>
        </div>

        {/* Mock Announcement Bar */}
        {isAnnouncementActive && announcementText && (
          <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white text-[11px] py-1.5 px-4 text-center rounded-lg font-medium">
            📢 {announcementText}
          </div>
        )}

        {/* Mock Hero Component */}
        <div className={`mx-auto transition-all ${previewMode === 'mobile' ? 'max-w-sm border-4 border-slate-800 rounded-3xl p-4 bg-slate-50' : 'w-full'}`}>
          <div className="bg-gradient-to-br from-emerald-50/50 via-white to-amber-50/30 rounded-2xl p-6 sm:p-8 border border-emerald-100/60 shadow-xs">
            <div className={`grid gap-6 items-center ${previewMode === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'}`}>
              <div className={`${previewMode === 'mobile' ? '' : 'lg:col-span-7'} space-y-4`}>
                {content.offerBadgeBn && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100/80 text-amber-900 border border-amber-300">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>{content.offerBadgeBn}</span>
                  </span>
                )}
                <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                  {content.heroHeadlineBn}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {content.heroSubtitleBn}
                </p>
                <div className="flex flex-wrap gap-2.5 pt-2">
                  <span className="px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs">
                    {content.ctaMenuBtnBn || 'মেনু দেখুন'}
                  </span>
                  <span className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-bold">
                    {content.ctaCateringBtnBn || 'ক্যাটারিং সম্পর্কে জানুন'}
                  </span>
                </div>
              </div>

              <div className={`${previewMode === 'mobile' ? '' : 'lg:col-span-5'}`}>
                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-slate-200/80 bg-slate-100 relative group">
                  <img
                    src={content.bannerImage || heroFeastImg}
                    alt="Hero Banner Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logo.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-4 text-white text-xs font-semibold">
                    <span>{config.brandNameBn} • খাঁটি ঘরোয়া খাবার</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Headline & Subtitle */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              ১. শিরোনাম ও বিবরণ (Typography & Copy)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                প্রধান শিরোনাম (বাংলা) *
              </label>
              <textarea
                rows={2}
                required
                value={content.heroHeadlineBn}
                onChange={e => setContent({ ...content, heroHeadlineBn: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Main Headline (English)
              </label>
              <textarea
                rows={2}
                value={content.heroHeadlineEn}
                onChange={e => setContent({ ...content, heroHeadlineEn: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                উপ-শিরোনাম / বর্ণনা (বাংলা)
              </label>
              <textarea
                rows={3}
                value={content.heroSubtitleBn}
                onChange={e => setContent({ ...content, heroSubtitleBn: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 leading-relaxed"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Subtitle Description (English)
              </label>
              <textarea
                rows={3}
                value={content.heroSubtitleEn}
                onChange={e => setContent({ ...content, heroSubtitleEn: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Banner Image & Badges */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              ২. ব্যানার ইমেজ ও স্পেশাল অফার ব্যাজ
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                স্পেশাল অফার ব্যাজ টেক্সট (বাংলা)
              </label>
              <input
                type="text"
                value={content.offerBadgeBn || ''}
                onChange={e => setContent({ ...content, offerBadgeBn: e.target.value })}
                placeholder="যেমন: আজকের স্পেশাল অফার • ২০% ছাড়"
                className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold text-amber-900 bg-amber-50/50"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Offer Badge Text (English)
              </label>
              <input
                type="text"
                value={content.offerBadgeEn || ''}
                onChange={e => setContent({ ...content, offerBadgeEn: e.target.value })}
                placeholder="e.g. Special Deal • 20% OFF"
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div className="md:col-span-2">
              <label className="font-bold text-slate-800 block mb-1">
                ব্যানার ইমেজের URL অথবা ফাইল আপলোড
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={content.bannerImage || ''}
                  onChange={e => setContent({ ...content, bannerImage: e.target.value })}
                  placeholder="https://... অথবা /src/assets/images/..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-xs"
                />

                <label className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer shrink-0 transition-colors">
                  <Upload className="w-4 h-4 text-emerald-700" />
                  <span>{uploadLoading ? 'আপলোড হচ্ছে...' : 'নতুন ছবি আপলোড'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Call-To-Action & Announcement Bar */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              ৩. বাটন টেক্সট ও অ্যানাউন্সমেন্ট বার
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                ১ম বাটন লেবেল (মেনু বাটন)
              </label>
              <input
                type="text"
                value={content.ctaMenuBtnBn}
                onChange={e => setContent({ ...content, ctaMenuBtnBn: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                ২য় বাটন লেবেল (ক্যাটারিং বাটন)
              </label>
              <input
                type="text"
                value={content.ctaCateringBtnBn}
                onChange={e => setContent({ ...content, ctaCateringBtnBn: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
              />
            </div>

            <div className="sm:col-span-2 pt-2 border-t border-slate-100 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={isAnnouncementActive}
                  onChange={e => setIsAnnouncementActive(e.target.checked)}
                  className="rounded text-emerald-700 w-4 h-4"
                />
                <span>শীর্ষ অ্যানাউন্সমেন্ট বার চালু রাখুন (Top Announcement Bar Active)</span>
              </label>
              <input
                type="text"
                value={announcementText}
                onChange={e => setAnnouncementText(e.target.value)}
                placeholder="ঘরোয়া খাবারের নিশ্চয়তা • খাবারের মান ও টাটকা স্বাদের জন্য অগ্রিম অর্ডার করুন..."
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-7 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'সংরক্ষিত হচ্ছে...' : 'ব্যানার ও সেটিংস সংরক্ষণ করুন'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
