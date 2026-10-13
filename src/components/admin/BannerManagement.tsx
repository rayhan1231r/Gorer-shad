import React, { useState, useEffect } from 'react';
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
  Monitor,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  AlertCircle,
  X
} from 'lucide-react';
import { HomepageContent, BusinessConfig, HeroBannerSlide } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';
import heroFeastImg from '../../assets/images/hero_ghorer_shad_feast_1791709454258.jpg';
import ilishImg from '../../assets/images/food_ilish_bhapa_fish_1791709467165.jpg';
import meatCurryImg from '../../assets/images/food_bengali_meat_curry_1791709480684.jpg';
import platterImg from '../../assets/images/food_bengali_platter_snacks_1791709490645.jpg';

interface BannerManagementProps {
  config: BusinessConfig;
  onRefreshConfig: () => void;
}

const PRESET_IMAGES = [
  { label: 'রাজকীয় বাংলা ভোজ', src: heroFeastImg, key: 'feast' },
  { label: 'তাজা সর্ষে ইলিশ', src: ilishImg, key: 'ilish' },
  { label: 'দেশি মাংসের কষা ঝোল', src: meatCurryImg, key: 'meat' },
  { label: 'ক্যাটারিং ও ফ্যামিলি প্ল্যাটার', src: platterImg, key: 'platter' }
];

const DEFAULT_SLIDES: HeroBannerSlide[] = [
  {
    id: 'feast',
    image: heroFeastImg,
    tagBn: 'খাঁটি বাঙালি ভোজ ও ঐতিহ্য',
    tagEn: 'Authentic Bengali Feast',
    titleBn: 'ঘরের স্বাদ স্পেশাল রাজকীয় বাংলা ভোজ',
    titleEn: 'Royal Bengali Homemade Feast',
    descBn: 'আড়াইহাজারের খাঁটি রান্না, তাজা মসলা ও ঘরোয়া ভালোবাসা',
    descEn: 'Fresh home cooking in Araihazar with pure spices',
    isActive: true,
    sortOrder: 1
  },
  {
    id: 'ilish',
    image: ilishImg,
    tagBn: 'পদ্মার তাজা মাছের সমাহার',
    tagEn: 'Fresh River Hilsa Special',
    titleBn: 'তাজা সর্ষে ইলিশ ও ইলিশ পোলাও উৎসব',
    titleEn: 'Fresh Shorshe Ilish & Pulao Delicacies',
    descBn: 'অর্ডার করার পর পদ্মা নদীর সেরা স্বাদের ইলিশ মাছের রান্না',
    descEn: 'Cooked fresh after order with supreme authentic aroma',
    isActive: true,
    sortOrder: 2
  },
  {
    id: 'meat',
    image: meatCurryImg,
    tagBn: 'দেশি মাংসের স্পেশাল কষা',
    tagEn: 'Desi Meat Curry & Kacchi',
    titleBn: 'দেশি খাসি ও গরুর মাংসের ঐতিহ্যবাহী ঝোল',
    titleEn: 'Desi Mutton & Beef Traditional Curry',
    descBn: 'খাঁটি সরিষার তেলে কষানো মাংস ও স্পেশাল ভুনা খিচুড়ি',
    descEn: 'Slow-cooked with pure mustard oil & aromatic spices',
    isActive: true,
    sortOrder: 3
  },
  {
    id: 'platter',
    image: platterImg,
    tagBn: 'ফ্যামিলি কম্বো ও ক্যাটারিং প্যাকেজ',
    tagEn: 'Family Combos & Catering Package',
    titleBn: 'যেকোনো উৎসব ও পারিবারিক অনুষ্ঠানে ঘরের স্বাদ',
    titleEn: 'Catering & Large Feasts for Every Celebration',
    descBn: '৫০ থেকে ৫০০ জনের সম্পূর্ণ ঘরোয়া খাবার সরবরাহ',
    descEn: 'Complete homemade food service from 50 to 500 guests',
    isActive: true,
    sortOrder: 4
  }
];

function resolveSlidePreview(img?: unknown, id?: string): string {
  if (!img || typeof img !== 'string') {
    if (id === 'ilish') return ilishImg;
    if (id === 'meat') return meatCurryImg;
    if (id === 'platter') return platterImg;
    return heroFeastImg;
  }
  if (img.includes('hero_ghorer_shad_feast')) return heroFeastImg;
  if (img.includes('food_ilish_bhapa_fish')) return ilishImg;
  if (img.includes('food_bengali_meat_curry')) return meatCurryImg;
  if (img.includes('food_bengali_platter_snacks')) return platterImg;
  return img;
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
    discountBannerTextBn: "অগ্রিম ৪-৬ ঘন্টা পূর্বে অর্ডারে মানসম্মত সেরা স্বাদের নিশ্চয়তা!",
    heroBanners: DEFAULT_SLIDES,
    bannerIntervalSeconds: 3
  });

  const [announcementText, setAnnouncementText] = useState(config.announcementBarBn || '');
  const [isAnnouncementActive, setIsAnnouncementActive] = useState(config.isAnnouncementActive ?? true);

  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isAutoPlayPreview, setIsAutoPlayPreview] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Edit / Add Modal or Inline Editor
  const [editingSlide, setEditingSlide] = useState<HeroBannerSlide | null>(null);
  const [isNewSlide, setIsNewSlide] = useState(false);
  const [slideUploadLoading, setSlideUploadLoading] = useState(false);

  // Active section tab
  const [activeTab, setActiveTab] = useState<'slider' | 'announcement' | 'typography'>('slider');

  // Load current homepage content on mount
  const loadData = async () => {
    try {
      const data = await api.getHomepageContent();
      if (data) {
        setContent(prev => ({
          ...prev,
          ...data,
          heroBanners: (data.heroBanners && Array.isArray(data.heroBanners) && data.heroBanners.length > 0) ? data.heroBanners : DEFAULT_SLIDES,
          bannerIntervalSeconds: data.bannerIntervalSeconds || 3
        }));
      }
    } catch (err) {
      console.warn('Failed to fetch homepage content:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const currentSlides = (content.heroBanners && Array.isArray(content.heroBanners) && content.heroBanners.length > 0)
    ? content.heroBanners
    : DEFAULT_SLIDES;
  const activeSlides = currentSlides.filter(s => s && typeof s === 'object' && s.isActive !== false);
  const safeActiveIndex = activeSlides.length > 0 ? (previewIndex % activeSlides.length) : 0;
  const currentPreviewSlide = (activeSlides.length > 0 ? activeSlides[safeActiveIndex] : currentSlides[0]) || DEFAULT_SLIDES[0];

  // Auto-slide preview
  useEffect(() => {
    if (!isAutoPlayPreview || activeSlides.length <= 1) return;
    const intervalTime = (content.bannerIntervalSeconds || 3) * 1000;
    const timer = setInterval(() => {
      setPreviewIndex(prev => (prev + 1) % activeSlides.length);
    }, intervalTime);
    return () => clearInterval(timer);
  }, [isAutoPlayPreview, activeSlides.length, content.bannerIntervalSeconds]);

  // Handle image upload for active editing slide
  const handleSlideImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingSlide) return;

    setSlideUploadLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = reader.result as string;
        const res = await api.uploadImage(dataUrl, `slide-${Date.now()}`);
        if (res.url) {
          setEditingSlide(prev => prev ? { ...prev, image: res.url } : null);
        }
      } catch (err) {
        console.error('Failed to upload slide image:', err);
      } finally {
        setSlideUploadLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Move slide up or down
  const moveSlide = (index: number, direction: 'up' | 'down') => {
    const newSlides = [...currentSlides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSlides.length) return;

    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIndex];
    newSlides[targetIndex] = temp;

    // re-assign sortOrder
    const updated = newSlides.map((s, idx) => ({ ...s, sortOrder: idx + 1 }));
    setContent(prev => ({ ...prev, heroBanners: updated }));
  };

  // Toggle active status of a slide
  const toggleSlideActive = (id: string) => {
    const updated = currentSlides.map(s => {
      if (s.id === id) {
        return { ...s, isActive: !s.isActive };
      }
      return s;
    });
    setContent(prev => ({ ...prev, heroBanners: updated }));
  };

  // Delete slide
  const deleteSlide = (id: string) => {
    if (currentSlides.length <= 1) {
      alert('ন্যূনতম একটি ব্যানার স্লাইড থাকতে হবে।');
      return;
    }
    if (confirm('আপনি কি নিশ্চিত যে এই ব্যানার স্লাইডটি মুছে ফেলতে চান?')) {
      const updated = currentSlides.filter(s => s.id !== id).map((s, idx) => ({ ...s, sortOrder: idx + 1 }));
      setContent(prev => ({ ...prev, heroBanners: updated }));
    }
  };

  // Open editor for new slide
  const handleAddNewSlide = () => {
    const newId = `slide-${Date.now()}`;
    setEditingSlide({
      id: newId,
      image: heroFeastImg,
      tagBn: 'নতুন স্পেশাল অফার',
      tagEn: 'Special Offer',
      titleBn: 'নতুন বাঙালি স্বাদের আয়োজন',
      titleEn: 'New Bengali Culinary Special',
      descBn: 'ঘরোয়া তাজা মসলায় রান্না করা সুস্বাদু খাবার',
      descEn: 'Fresh home-cooked traditional recipes',
      isActive: true,
      sortOrder: currentSlides.length + 1
    });
    setIsNewSlide(true);
  };

  // Save editing slide
  const handleSaveSlideModal = () => {
    if (!editingSlide) return;
    if (!editingSlide.titleBn.trim()) {
      alert('অনুগ্রহ করে ব্যানারের বাংলা শিরোনাম লিখুন।');
      return;
    }

    let updated: HeroBannerSlide[];
    if (isNewSlide) {
      updated = [...currentSlides, editingSlide];
    } else {
      updated = currentSlides.map(s => s.id === editingSlide.id ? editingSlide : s);
    }

    setContent(prev => ({ ...prev, heroBanners: updated }));
    setEditingSlide(null);
  };

  // Reset to authentic default photography
  const handleResetToDefaults = () => {
    if (confirm('আপনি কি পূর্বনির্ধারিত (Default) ৪টি ব্যানার পুনরায় সেট করতে চান?')) {
      setContent(prev => ({
        ...prev,
        heroBanners: DEFAULT_SLIDES,
        bannerIntervalSeconds: 3
      }));
    }
  };

  // Save all to backend API
  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setIsSaving(true);
      setSaveError(null);

      await Promise.all([
        api.updateHomepageContent(content),
        api.updateConfig({
          announcementBarBn: announcementText,
          isAnnouncementActive
        })
      ]);

      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
      onRefreshConfig();
    } catch (err: unknown) {
      console.error('Failed to update banner configuration:', err);
      setIsSaving(false);
      setSaveError(err instanceof Error ? err.message : 'ব্যানার সংরক্ষণ করতে সমস্যা হয়েছে');
    }
  };

  return (
    <div className="space-y-6 text-left max-w-6xl pb-16">
      {/* Top Banner Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {language === 'en' ? 'Homepage Hero & Banner Management' : 'হোমপেজ হিরো ও ব্যানার ম্যানেজমেন্ট'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'en'
                ? 'Manage dynamic carousel slides, images, timing, announcement bar, and typography.'
                : 'হোমপেজের চলমান স্লাইডার ব্যানার, নতুন ব্যানার যোগ, স্লাইড সময়, এবং অ্যানাউন্সমেন্ট কন্ট্রোল করুন।'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-xl text-xs font-bold border border-emerald-200 animate-fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>সফলভাবে আপডেট হয়েছে!</span>
            </div>
          )}

          {saveError && (
            <div className="flex items-center gap-1.5 text-rose-800 bg-rose-50 px-3.5 py-2 rounded-xl text-xs font-bold border border-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{saveError}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => handleSaveAll()}
            disabled={isSaving}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'সংরক্ষিত হচ্ছে...' : 'সব পরিবর্তন সেভ করুন'}</span>
          </button>
        </div>
      </div>

      {/* Live Interactive Preview Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              লাইভ প্রিভিউ (Real-Time Visual Slider Preview)
            </h3>
            <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              {activeSlides.length}টি সক্রিয় ব্যানার
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Play / Pause Autoplay in Preview */}
            <button
              type="button"
              onClick={() => setIsAutoPlayPreview(!isAutoPlayPreview)}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title={isAutoPlayPreview ? 'অটোপ্লে বন্ধ করুন' : 'অটোপ্লে চালু করুন'}
            >
              {isAutoPlayPreview ? <Pause className="w-3.5 h-3.5 text-amber-700" /> : <Play className="w-3.5 h-3.5 text-emerald-700" />}
              <span className="text-[11px]">{isAutoPlayPreview ? 'অটোপ্লে চলছে' : 'পজ'}</span>
            </button>

            {/* Desktop / Mobile Switch */}
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
        </div>

        {/* Mock Top Announcement Bar */}
        {isAnnouncementActive && announcementText && (
          <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white text-[11px] py-1.5 px-4 text-center rounded-lg font-medium shadow-xs">
            📢 {announcementText}
          </div>
        )}

        {/* Hero Slider Visual Container */}
        <div className={`mx-auto transition-all ${previewMode === 'mobile' ? 'max-w-sm border-4 border-slate-800 rounded-3xl p-3 bg-slate-50' : 'w-full'}`}>
          <div className="relative rounded-2xl overflow-hidden shadow-md border border-slate-200/90 bg-slate-950 group">
            <div className="relative aspect-[16/9] sm:aspect-[21/9] lg:aspect-[24/9] w-full overflow-hidden">
              <img
                key={currentPreviewSlide?.id || safeActiveIndex}
                src={resolveSlidePreview(currentPreviewSlide?.image, currentPreviewSlide?.id)}
                alt={currentPreviewSlide?.titleBn || 'Banner Preview'}
                className="w-full h-full object-cover transition-all duration-700 ease-out"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/15" />

              {/* Top Badges */}
              <div className="absolute top-3 left-3 sm:top-5 sm:left-5 flex items-center gap-2 z-20">
                <span className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-xs border border-white/60 text-[10px] sm:text-xs font-bold text-slate-900">
                  {config?.brandNameBn || 'ঘরের স্বাদ'}
                </span>
                <span className="bg-amber-500 text-slate-950 text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3 fill-slate-950" />
                  <span>স্লাইড #{safeActiveIndex + 1}</span>
                </span>
              </div>

              {/* Banner Caption */}
              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 right-4 sm:right-20 z-20 text-white space-y-1">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600/90 backdrop-blur-xs text-[9px] sm:text-xs font-bold uppercase tracking-wider text-emerald-100">
                  <span>{currentPreviewSlide?.tagBn || ''}</span>
                </div>
                <h2 className="text-base sm:text-2xl lg:text-3xl font-black text-white leading-tight drop-shadow-md">
                  {currentPreviewSlide?.titleBn || ''}
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-200 line-clamp-1 max-w-xl font-medium">
                  {currentPreviewSlide?.descBn || ''}
                </p>
              </div>

              {/* Nav Arrows */}
              <button
                type="button"
                onClick={() => setPreviewIndex(prev => (prev - 1 + activeSlides.length) % activeSlides.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all opacity-80 cursor-pointer z-20"
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setPreviewIndex(prev => (prev + 1) % activeSlides.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all opacity-80 cursor-pointer z-20"
                aria-label="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Dots */}
              <div className="absolute bottom-3 right-3 sm:bottom-5 sm:right-5 flex items-center gap-1.5 z-20">
                {activeSlides.map((b, idx) => (
                  <button
                    key={b.id || idx}
                    type="button"
                    onClick={() => setPreviewIndex(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      idx === safeActiveIndex ? 'w-6 bg-emerald-400' : 'w-1.5 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for Banner Controls */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('slider')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'slider' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>স্লাইডার ব্যানার তালিকা ({currentSlides.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('announcement')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'announcement' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>শীর্ষ অ্যানাউন্সমেন্ট বার</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('typography')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'typography' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Type className="w-4 h-4" />
          <span>হেডলাইন ও বাটন লেবেল</span>
        </button>
      </div>

      {/* TAB 1: SLIDER BANNER LIST & ACTIONS */}
      {activeTab === 'slider' && (
        <div className="space-y-6">
          {/* Controls Bar: Add New + Autoplay Speed + Reset */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleAddNewSlide}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন ব্যানার যোগ করুন</span>
              </button>

              <button
                type="button"
                onClick={handleResetToDefaults}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="আসল ৪টি ডিফল্ট ছবি পুনরায় সেট করুন"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                <span>ডিফল্ট ব্যানার রিস্টোর</span>
              </button>
            </div>

            {/* Slide Interval Speed Control */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-700 whitespace-nowrap">স্লাইড পরিবর্তনের গতি:</span>
              <select
                value={content.bannerIntervalSeconds || 3}
                onChange={e => setContent({ ...content, bannerIntervalSeconds: Number(e.target.value) })}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-emerald-600 cursor-pointer text-xs"
              >
                <option value={2}>২ সেকেন্ড (খুব দ্রুত)</option>
                <option value={2.5}>২.৫ সেকেন্ড (প্রস্তাবিত)</option>
                <option value={3}>৩ সেকেন্ড (স্বাভাবিক)</option>
                <option value={4}>৪ সেকেন্ড</option>
                <option value={5}>৫ সেকেন্ড (ধীর)</option>
                <option value={6}>৬ সেকেন্ড</option>
              </select>
            </div>
          </div>

          {/* List of Banner Slides */}
          <div className="space-y-4">
            {currentSlides.map((slide, index) => {
              const previewImg = resolveSlidePreview(slide.image, slide.id);
              const isActive = slide.isActive !== false;

              return (
                <div
                  key={slide.id || index}
                  className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isActive ? 'border-slate-200/90' : 'border-slate-200 bg-slate-50/70 opacity-75'
                  }`}
                >
                  {/* Left: Thumbnail & Content */}
                  <div className="flex items-start sm:items-center gap-4">
                    {/* Thumbnail Image */}
                    <div className="w-24 h-16 sm:w-32 sm:h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative group">
                      <img
                        src={previewImg}
                        alt={slide.titleBn}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/logo.jpg';
                        }}
                      />
                      <div className="absolute top-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        #{index + 1}
                      </div>
                    </div>

                    {/* Text Details */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          {slide.tagBn}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {isActive ? 'হোমপেজে সক্রিয়' : 'লুকানো (Hidden)'}
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                        {slide.titleBn}
                      </h4>
                      {slide.titleEn && (
                        <p className="text-xs text-slate-500 font-sans">
                          {slide.titleEn}
                        </p>
                      )}
                      <p className="text-xs text-slate-600 line-clamp-1">
                        {slide.descBn}
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    {/* Move Up */}
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveSlide(index, 'up')}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      title="উপরে নিন"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>

                    {/* Move Down */}
                    <button
                      type="button"
                      disabled={index === currentSlides.length - 1}
                      onClick={() => moveSlide(index, 'down')}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      title="নিচে নিন"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>

                    {/* Toggle Active */}
                    <button
                      type="button"
                      onClick={() => toggleSlideActive(slide.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </button>

                    {/* Edit Slide */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSlide({ ...slide });
                        setIsNewSlide(false);
                      }}
                      className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold transition-colors cursor-pointer flex items-center gap-1 text-xs"
                      title="সম্পাদনা করুন"
                    >
                      <Edit2 className="w-4 h-4 text-emerald-700" />
                      <span>এডিট</span>
                    </button>

                    {/* Delete Slide */}
                    <button
                      type="button"
                      onClick={() => deleteSlide(slide.id)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4 text-rose-600" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: ANNOUNCEMENT BAR */}
      {activeTab === 'announcement' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              শীর্ষ অ্যানাউন্সমেন্ট বার কনফিগারেশন
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <label className="flex items-center gap-2.5 cursor-pointer font-bold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                checked={isAnnouncementActive}
                onChange={e => setIsAnnouncementActive(e.target.checked)}
                className="rounded text-emerald-700 w-4 h-4 cursor-pointer"
              />
              <span>ওয়েবসাইটের একেবারে শীর্ষে অ্যানাউন্সমেন্ট বার চালু রাখুন (Enable Top Announcement Bar)</span>
            </label>

            <div>
              <label className="font-bold text-slate-800 block mb-1.5">
                অ্যানাউন্সমেন্ট টেক্সট (বাংলা)
              </label>
              <textarea
                rows={3}
                value={announcementText}
                onChange={e => setAnnouncementText(e.target.value)}
                placeholder="খাঁটি ঘরোয়া খাবারের নিশ্চয়তা • খাবারের মান ও টাটকা স্বাদের জন্য অগ্রিম ৪-৬ ঘন্টা আগে অর্ডার করুন! কল/হোয়াটসঅ্যাপ: 01857-220603"
                className="w-full p-3 rounded-xl border border-slate-200 font-medium focus:outline-none focus:border-emerald-600 leading-relaxed"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                এই মেসেজটি ওয়েবসাইটের সবচেয়ে উপরে সবুজ বারে গ্রাহকদের দেখানো হবে।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TYPOGRAPHY & CTA */}
      {activeTab === 'typography' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              হোমপেজ প্রধান শিরোনাম ও কল-টু-অ্যাকশন বাটন
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                প্রধান শিরোনাম (বাংলা) *
              </label>
              <textarea
                rows={2}
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
                উপ-শিরোনাম / বিবরণ (বাংলা)
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
          </div>
        </div>
      )}

      {/* Floating or Bottom Save Bar */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={() => handleSaveAll()}
          disabled={isSaving}
          className="px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'সংরক্ষিত হচ্ছে...' : 'সকল ব্যানার ও সেটিংস সংরক্ষণ করুন (Save)'}</span>
        </button>
      </div>

      {/* MODAL: EDIT OR ADD BANNER SLIDE */}
      {editingSlide && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">
                  {isNewSlide ? 'নতুন ব্যানার স্লাইড যোগ করুন' : 'ব্যানার স্লাইড সম্পাদনা (Edit Banner Slide)'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingSlide(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Slide Image Preview & Upload */}
            <div className="space-y-3">
              <label className="font-bold text-xs text-slate-800 block">
                ব্যানার ছবি নির্বাচন বা আপলোড *
              </label>

              {/* Current Preview */}
              <div className="relative aspect-[21/9] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner group">
                <img
                  src={resolveSlidePreview(editingSlide.image, editingSlide.id)}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-bold bg-black/60 px-3 py-1.5 rounded-lg">
                    ছবির বর্তমান প্রিভিউ
                  </span>
                </div>
              </div>

              {/* Quick Presets */}
              <div>
                <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
                  অথবা ডিফল্ট হাই-রেজুলুশন ছবি থেকে বেছে নিন:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_IMAGES.map(preset => (
                    <button
                      key={preset.key}
                      type="button"
                      onClick={() => setEditingSlide({ ...editingSlide, image: preset.src })}
                      className={`p-1.5 rounded-xl border text-[11px] font-bold text-left flex items-center gap-2 transition-all cursor-pointer ${
                        editingSlide.image === preset.src
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/30'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <img src={preset.src} alt={preset.label} className="w-7 h-7 rounded-lg object-cover shrink-0" />
                      <span className="truncate">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload Input & URL input */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <input
                  type="text"
                  value={editingSlide.image || ''}
                  onChange={e => setEditingSlide({ ...editingSlide, image: e.target.value })}
                  placeholder="ইমেজ URL অথবা ফাইল আপলোড করুন..."
                  className="flex-1 p-2.5 text-xs rounded-xl border border-slate-200 font-mono focus:outline-none focus:border-emerald-600"
                />

                <label className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer shrink-0 transition-colors text-xs">
                  <Upload className="w-4 h-4 text-emerald-700" />
                  <span>{slideUploadLoading ? 'আপলোড হচ্ছে...' : 'ছবি আপলোড'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSlideImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Title & Tag Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  ব্যানার শিরোনাম (বাংলা) *
                </label>
                <input
                  type="text"
                  required
                  value={editingSlide.titleBn}
                  onChange={e => setEditingSlide({ ...editingSlide, titleBn: e.target.value })}
                  placeholder="যেমন: ঘরের স্বাদ স্পেশাল রাজকীয় বাংলা ভোজ"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Banner Title (English)
                </label>
                <input
                  type="text"
                  value={editingSlide.titleEn}
                  onChange={e => setEditingSlide({ ...editingSlide, titleEn: e.target.value })}
                  placeholder="e.g. Royal Bengali Homemade Feast"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-sans focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  ব্যানার ব্যাজ / ট্যাগ (বাংলা)
                </label>
                <input
                  type="text"
                  value={editingSlide.tagBn}
                  onChange={e => setEditingSlide({ ...editingSlide, tagBn: e.target.value })}
                  placeholder="যেমন: খাঁটি বাঙালি ভোজ ও ঐতিহ্য"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold text-amber-900 bg-amber-50/50"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Banner Tag (English)
                </label>
                <input
                  type="text"
                  value={editingSlide.tagEn}
                  onChange={e => setEditingSlide({ ...editingSlide, tagEn: e.target.value })}
                  placeholder="e.g. Authentic Bengali Feast"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-sans"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-800 block mb-1">
                  সংক্ষিপ্ত বিবরণ (বাংলা)
                </label>
                <textarea
                  rows={2}
                  value={editingSlide.descBn}
                  onChange={e => setEditingSlide({ ...editingSlide, descBn: e.target.value })}
                  placeholder="যেমন: আড়াইহাজারের খাঁটি রান্না, তাজা মসলা ও ঘরোয়া ভালোবাসা"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-800 block mb-1">
                  Short Description (English)
                </label>
                <textarea
                  rows={2}
                  value={editingSlide.descEn}
                  onChange={e => setEditingSlide({ ...editingSlide, descEn: e.target.value })}
                  placeholder="e.g. Fresh home cooking in Araihazar with pure spices"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-sans focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    checked={editingSlide.isActive !== false}
                    onChange={e => setEditingSlide({ ...editingSlide, isActive: e.target.checked })}
                    className="rounded text-emerald-700 w-4 h-4 cursor-pointer"
                  />
                  <span>এই ব্যানারটি হোমপেজে প্রদর্শন করুন (Active on Homepage)</span>
                </label>
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingSlide(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                বাতিল করুন
              </button>

              <button
                type="button"
                onClick={handleSaveSlideModal}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>স্লাইড সংরক্ষণ করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
