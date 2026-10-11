import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  UtensilsCrossed,
  TrendingUp,
  Share2,
  Copy,
  Check,
  RefreshCw,
  Lightbulb,
  DollarSign,
  Clock,
  Layers,
  ChefHat,
  Mail,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  Users
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { Category, FoodItem } from '../../types/index.ts';

interface AdminAiHubProps {
  categories: Category[];
  foods: FoodItem[];
  onRefreshData: () => void;
  onNavigateTab: (tab: string) => void;
}

export const AdminAiHub: React.FC<AdminAiHubProps> = ({
  categories,
  foods,
  onRefreshData,
  onNavigateTab
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'copywriter' | 'advisor' | 'promotions' | 'broadcast'>('copywriter');

  // Copywriter state
  const [dishName, setDishName] = useState('');
  const [selectedCat, setSelectedCat] = useState(categories[0]?.nameBn || 'বাঙালি খাবার');
  const [spiceLevel, setSpiceLevel] = useState('Medium');
  const [isGeneratingFood, setIsGeneratingFood] = useState(false);
  const [generatedFood, setGeneratedFood] = useState<{
    shortDescBn: string;
    fullDescBn: string;
    portionBn: string;
    suggestedPrice: number;
    prepTimeMinutes: number;
    advanceNoticeRequiredHours?: number;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Business Advisor state
  const [advisorInput, setAdvisorInput] = useState('');
  const [isAdvising, setIsAdvising] = useState(false);
  const [advisorChat, setAdvisorChat] = useState<Array<{ sender: 'admin' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: `আসসালামু আলাইকুম! আমি "ঘরের স্বাদ" অ্যাডমিন এআই বিজনেস অ্যাডভাইজার।\n\nআপনি আমাকে জিজ্ঞেস করতে পারেন:\n• "ছুটির দিনের স্পেশাল কম্বো অফার কি কি হতে পারে?"\n• "কিচেনের অগ্রিম অর্ডার ম্যানেজমেন্ট ও প্রস্তুতি বাড়ানোর উপায় কি?"\n• "আড়াইহাজারে ক্যাটারিং ব্যবসা কীভাবে আরও বড় করা যায়?"`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Social Promo state
  const [promoType, setPromoType] = useState('weekend');
  const [promoGenerated, setPromoGenerated] = useState('');
  const [isGeneratingPromo, setIsGeneratingPromo] = useState(false);

  // Email Broadcast & AI Generator state
  const [emailPrompt, setEmailPrompt] = useState('আজকের দুপুরের স্পেশাল বাঙালি ভোজ প্যাকেজ ও ১০% ক্যাশব্যাক অফার');
  const [emailTone, setEmailTone] = useState('আকর্ষণীয় ও রসালো');
  const [selectedFoodIdForEmail, setSelectedFoodIdForEmail] = useState('');
  const [isComposingEmail, setIsComposingEmail] = useState(false);
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastHeadline, setBroadcastHeadline] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [targetAudience, setTargetAudience] = useState<'all' | 'with_orders' | 'admins'>('all');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);

  const handleAiComposeEmail = async () => {
    if (!emailPrompt.trim()) return;
    setIsComposingEmail(true);
    setBroadcastResult(null);
    try {
      const res = await api.composeEmailWithAi(emailPrompt.trim(), emailTone, selectedFoodIdForEmail || undefined);
      setBroadcastSubject(res.subject || '');
      setBroadcastHeadline(res.headline || '');
      setBroadcastContent(res.contentText || '');
    } catch (err) {
      console.error(err);
      setBroadcastSubject('🎉 [ঘরের স্বাদ] আজকের স্পেশাল ঘরোয়া সুস্বাদু আয়োজন!');
      setBroadcastHeadline('মায়ের হাতের খাঁটি বাঙালি স্বাদের এক অনন্য অভিজ্ঞতা!');
      setBroadcastContent(`প্রিয় ভোজনরসিক ভাই ও বোনেরা,\n\nঘরের স্বাদ-এ আমরা প্রস্তুত করছি খাঁটি বাটা মশলায় রান্না করা টাটকা সুস্বাদু খাবার।\nদেরি না করে আজই আপনার পছন্দের পদটি অর্ডার করুন এবং পরিবার নিয়ে উপভোগ করুন খাঁটি স্বাদ।`);
    } finally {
      setIsComposingEmail(false);
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastSubject.trim() || !broadcastContent.trim()) {
      setBroadcastResult({ success: false, message: 'অনুগ্রহ করে ইমেইল সাবজেক্ট ও বিস্তারিত বিবরণ লিখুন।' });
      return;
    }

    setIsSendingBroadcast(true);
    setBroadcastResult(null);
    try {
      const res = await api.broadcastEmail({
        subject: broadcastSubject.trim(),
        headline: broadcastHeadline.trim() || broadcastSubject.trim(),
        contentText: broadcastContent.trim(),
        targetAudience,
        foodId: selectedFoodIdForEmail || undefined
      });
      setBroadcastResult({
        success: true,
        message: res.message || 'সকল গ্রাহকের কাছে সফলভাবে ব্রডকাস্ট পাঠানো হয়েছে!',
        count: res.sentCount
      });
    } catch (err: unknown) {
      setBroadcastResult({
        success: false,
        message: err instanceof Error ? err.message : 'ব্রডকাস্ট পাঠাতে ব্যর্থ হয়েছে'
      });
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  const handleGenerateFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim()) return;

    setIsGeneratingFood(true);
    setSaveStatus(null);
    try {
      const res = await api.adminGenerateFoodWithAi(dishName.trim(), selectedCat, spiceLevel);
      setGeneratedFood(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingFood(false);
    }
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleAddDirectlyToMenu = async () => {
    if (!generatedFood || !dishName.trim()) return;

    try {
      setSaveStatus('সংরক্ষণ হচ্ছে...');
      const targetCat = categories.find(c => c.nameBn === selectedCat) || categories[0];
      const newFood: FoodItem = {
        id: `food-${Date.now()}`,
        sku: `GS-${Math.floor(1000 + Math.random() * 9000)}`,
        nameBn: dishName.trim(),
        nameEn: dishName.trim(),
        categoryId: targetCat?.id || 'bengali-meals',
        categoryNameBn: targetCat?.nameBn || 'বাঙালি খাবার',
        shortDescBn: generatedFood.shortDescBn,
        fullDescBn: generatedFood.fullDescBn,
        image: '/src/assets/images/hero_ghorer_shad_feast_1791709454258.jpg',
        price: generatedFood.suggestedPrice || 280,
        portionBn: generatedFood.portionBn || '১ জনের পেটভরা মিল',
        prepTimeMinutes: generatedFood.prepTimeMinutes || 30,
        advanceNoticeRequiredHours: generatedFood.advanceNoticeRequiredHours || 4,
        spiceLevel: spiceLevel as any,
        isAvailable: true,
        dailyStock: 25,
        currentStock: 25,
        minOrderQty: 1,
        isFeatured: false,
        isBestseller: false,
        variants: [],
        addons: []
      };

      await api.saveFood(newFood);
      setSaveStatus('সফলভাবে মেনুতে যোগ করা হয়েছে!');
      onRefreshData();
      setTimeout(() => {
        setSaveStatus(null);
        onNavigateTab('menu');
      }, 1500);
    } catch (err) {
      console.error(err);
      setSaveStatus('সংরক্ষণ ব্যর্থ হয়েছে');
    }
  };

  const handleAskAdvisor = async (customQuery?: string) => {
    const q = (customQuery || advisorInput).trim();
    if (!q || isAdvising) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAdvisorChat(prev => [...prev, { sender: 'admin', text: q, time }]);
    setAdvisorInput('');
    setIsAdvising(true);

    try {
      const res = await api.askAdminAi(q);
      setAdvisorChat(prev => [...prev, {
        sender: 'ai',
        text: res.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      setAdvisorChat(prev => [...prev, {
        sender: 'ai',
        text: 'পরামর্শ প্রদান করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsAdvising(false);
    }
  };

  const handleGeneratePromo = async (type: string) => {
    setPromoType(type);
    setIsGeneratingPromo(true);

    let query = '';
    if (type === 'weekend') {
      query = 'শুক্রবার ও ছুটির দিনের স্পেশাল পারিবারিক ভূরিভোজের জন্য ফেসবুক ও হোয়াটসঅ্যাপে প্রচার করার মতো আবেগঘন ও মিষ্টি বাংলা পোস্ট ক্যাপশন লিখুন, যেখানে অগ্রিম অর্ডারের কথা উল্লেখ থাকবে।';
    } else if (type === 'catering') {
      query = 'বিয়ে, জন্মদিন বা মেহমানদারির ক্যাটারিং সার্ভিসের জন্য একটি আকর্ষণীয় বিজনেস প্রমোশনাল ফেসবুক পোস্ট লিখে দিন (১৫-৫০০+ জনের স্পেশাল প্যাকেজ)।';
    } else {
      query = 'খাঁটি সরিষার তেলের বাটা মশলায় মায়ের হাতের ঘরোয়া রান্নার স্বাদ নিয়ে একটি চমৎকার কাস্টমার রিভিউ ও পোস্ট ক্যাপশন তৈরি করুন।';
    }

    try {
      const res = await api.askAdminAi(query);
      setPromoGenerated(res.reply);
    } catch (err) {
      setPromoGenerated('ক্যাপশন তৈরিতে সমস্যা হয়েছে।');
    } finally {
      setIsGeneratingPromo(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold mb-2 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>ঘরের স্বাদ ইন্টেলিজেন্স হাব • AI Hub</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              স্মার্ট এআই অ্যাসিস্ট্যান্ট ও বিজনেস কো-পাইলট
            </h2>
            <p className="text-xs text-emerald-100/90 mt-1 max-w-xl">
              খাবারের আকর্ষণীয় বাংলা বর্ণনা লেখা, কিচেন প্রস্তুতি বিশ্লেষণ এবং সোশ্যাল মিডিয়া পোস্ট ক্যাপশন তৈরি করুন এক ক্লিকে।
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('copywriter')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'copywriter'
                  ? 'bg-white text-emerald-900 shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              🍲 মেনু ও খাবার রাইটার
            </button>
            <button
              onClick={() => setActiveTab('advisor')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'advisor'
                  ? 'bg-white text-emerald-900 shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              📈 কিচেন ও বিজনেস অ্যাডভাইজার
            </button>
            <button
              onClick={() => setActiveTab('promotions')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'promotions'
                  ? 'bg-white text-emerald-900 shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              📣 প্রচার ও অফার পোস্ট
            </button>
            <button
              onClick={() => setActiveTab('broadcast')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'broadcast'
                  ? 'bg-white text-emerald-900 shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              🚀 ইমেইল ব্রডকাস্ট ও এআই ক্যাম্পেইন
            </button>
          </div>
        </div>
      </div>

      {/* Tab 4: Email Broadcast & AI Campaign */}
      {activeTab === 'broadcast' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">
                  গ্রাহক ইমেইল ব্রডকাস্ট ও এআই ক্যাম্পেইন (Broadcast Engine)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                এআই-এর সাহায্যে মুখরোচক বাংলা অফার ইমেইল তৈরি করুন অথবা যেকোনো গুরুত্বপূর্ণ বার্তা এক ক্লিকে সকল গ্রাহকের ইমেইলে ব্রডকাস্ট করুন।
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">প্রাপক ফিল্টার:</span>
              <select
                value={targetAudience}
                onChange={e => setTargetAudience(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600"
              >
                <option value="all">👥 সকল নিবন্ধিত গ্রাহক ও ইউজার</option>
                <option value="with_orders">🛍️ পূর্বে অর্ডার করেছেন এমন গ্রাহক</option>
                <option value="admins">🛡️ শুধুমাত্র অ্যাডমিন ও স্টাফ</option>
              </select>
            </div>
          </div>

          {/* AI Generator Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50/60 via-teal-50/40 to-amber-50/40 border border-emerald-100/90 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>এআই প্রমোশনাল ইমেইল কম্পোজার</span>
              </span>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-medium">টোন:</span>
                <select
                  value={emailTone}
                  onChange={e => setEmailTone(e.target.value)}
                  className="px-2.5 py-1 rounded-lg border border-emerald-200 bg-white text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="আকর্ষণীয় ও রসালো">আকর্ষণীয় ও রসালো</option>
                  <option value="উৎসবমুখর ও আনন্দময়">উৎসবমুখর ও আনন্দময়</option>
                  <option value="জরুরি অফার ও ডিসকাউন্ট">জরুরি অফার ও ডিসকাউন্ট</option>
                  <option value="আন্তরিক ও ঐতিহ্যবাহী">আন্তরিক ও ঐতিহ্যবাহী</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">
                অফার বা বার্তার প্রম্পট লিখুন:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={emailPrompt}
                  onChange={e => setEmailPrompt(e.target.value)}
                  placeholder="যেমন: আজকের স্পেশাল ইলিশ পোলাও কম্বো অর্ডার করলে ডেলিভারি ফ্রি!"
                  className="flex-1 p-2.5 rounded-xl border border-emerald-200 bg-white text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
                <button
                  type="button"
                  disabled={isComposingEmail || !emailPrompt.trim()}
                  onClick={handleAiComposeEmail}
                  className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
                >
                  <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isComposingEmail ? 'animate-spin' : ''}`} />
                  <span>{isComposingEmail ? 'তৈরি হচ্ছে...' : '✨ এআই দিয়ে লিখুন'}</span>
                </button>
              </div>
            </div>

            {/* Quick Prompt Presets */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-slate-500 text-[11px]">কুইক টপিক:</span>
              {[
                'আজকের স্পেশাল দুপুরের ভোজ',
                'পদ্মার তাজা ইলিশ আগমনী উৎসব',
                '১০% ক্যাশব্যাক উইকএন্ড ভাউচার',
                'বড় ক্যাটারিং অর্ডারে বিশেষ ছাড়'
              ].map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setEmailPrompt(preset)}
                  className="px-2.5 py-1 rounded-lg bg-white/90 hover:bg-white text-slate-700 hover:text-emerald-800 text-[11px] font-medium border border-emerald-100 transition-colors cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Food item attachment */}
            <div className="pt-2 border-t border-emerald-100 flex items-center gap-3 text-xs">
              <span className="text-slate-600 font-medium">খাবার সংযুক্ত করুন (ঐচ্ছিক):</span>
              <select
                value={selectedFoodIdForEmail}
                onChange={e => setSelectedFoodIdForEmail(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-emerald-200 bg-white text-xs text-slate-800 focus:outline-none"
              >
                <option value="">কোনো নির্দিষ্ট খাবার নয় (সাধারণ ঘোষণা)</option>
                {foods.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.nameBn} — ৳{f.salePrice || f.price}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Broadcast Composer Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            {/* Left: Email Editor */}
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  ইমেইল সাবজেক্ট (Email Subject Line) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={broadcastSubject}
                  onChange={e => setBroadcastSubject(e.target.value)}
                  placeholder="যেমন: 🎉 [ঘরের স্বাদ] আজকের স্পেশাল ঘরোয়া আয়োজন!"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  প্রধান শিরোনাম (Banner Headline)
                </label>
                <input
                  type="text"
                  value={broadcastHeadline}
                  onChange={e => setBroadcastHeadline(e.target.value)}
                  placeholder="যেমন: মায়ের হাতের খাঁটি বাঙালি স্বাদের এক অনন্য অভিজ্ঞতা!"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  বার্তার মূল বিবরণ (Email Body Content) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={8}
                  value={broadcastContent}
                  onChange={e => setBroadcastContent(e.target.value)}
                  placeholder="গ্রাহকদের উদ্দেশ্যে আপনার বিস্তারিত সুস্বাদু বর্ণনা ও অর্ডারের আহ্বান..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 leading-relaxed font-sans"
                />
              </div>

              {/* Status Message */}
              {broadcastResult && (
                <div className={`p-4 rounded-xl border text-xs flex items-start gap-2.5 ${
                  broadcastResult.success ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-rose-50 text-rose-900 border-rose-200'
                }`}>
                  {broadcastResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold block">{broadcastResult.success ? 'ব্রডকাস্ট সফল হয়েছে!' : 'ব্রডকাস্ট ব্যর্থ হয়েছে!'}</span>
                    <p className="mt-0.5 leading-relaxed">{broadcastResult.message}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setBroadcastSubject('');
                    setBroadcastHeadline('');
                    setBroadcastContent('');
                    setBroadcastResult(null);
                  }}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-semibold"
                >
                  রিসেট
                </button>

                <button
                  type="button"
                  disabled={isSendingBroadcast || !broadcastSubject.trim() || !broadcastContent.trim()}
                  onClick={handleSendBroadcast}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  {isSendingBroadcast ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>ইমেইল পাঠানো হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>🚀 সকল গ্রাহকের কাছে ব্রডকাস্ট পাঠান</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right: Live Email Visual Preview */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                ইমেইল লাইভ প্রিভিউ (Customer Inbox Preview):
              </span>
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs text-xs">
                {/* Email Header */}
                <div className="bg-emerald-800 text-white p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm">ঘরের স্বাদ (Ghorer Shad)</h4>
                    <span className="text-[10px] text-emerald-200">সব স্বাদের এক ঠিকানা</span>
                  </div>
                  <span className="text-[10px] bg-emerald-900/60 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-700">
                    অফিসিয়াল ইমেইল
                  </span>
                </div>

                {/* Email Content Area */}
                <div className="p-5 space-y-4">
                  {broadcastHeadline && (
                    <h3 className="font-bold text-base text-slate-900 leading-snug">
                      {broadcastHeadline}
                    </h3>
                  )}

                  {selectedFoodIdForEmail && (
                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center font-bold text-lg text-emerald-800 shrink-0">
                        🍛
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">বিশেষ আকর্ষণ</span>
                        <span className="font-bold text-slate-900">
                          {foods.find(f => f.id === selectedFoodIdForEmail)?.nameBn}
                        </span>
                        <span className="text-emerald-700 font-bold block">
                          ৳{foods.find(f => f.id === selectedFoodIdForEmail)?.salePrice || foods.find(f => f.id === selectedFoodIdForEmail)?.price}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-xl border border-slate-100 min-h-[140px]">
                    {broadcastContent || 'উপরে প্রম্পট লিখে "এআই দিয়ে লিখুন" বাটনে ক্লিক করুন অথবা নিজে সাবজেক্ট ও বার্তা লিখুন। এখানে লাইভ প্রিভিউ প্রদর্শিত হবে।'}
                  </div>

                  <div className="text-center pt-2">
                    <div className="inline-block px-5 py-2.5 bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs pointer-events-none">
                      এখনই অর্ডার করুন (Visit Website)
                    </div>
                  </div>
                </div>

                {/* Email Footer */}
                <div className="bg-slate-50 p-3 border-t border-slate-100 text-center text-[10px] text-slate-400">
                  © 2026 ঘরের স্বাদ (Ghorer Shad) • আড়াইহাজার, ঢাকা • 01857-220603
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: AI Food Copywriter */}
      {activeTab === 'copywriter' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form (5 cols) */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-emerald-700" />
              <span>খাবারের নাম দিন — এআই বিবরণ লিখবে</span>
            </h3>

            <form onSubmit={handleGenerateFood} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  খাবারের নাম (বাংলায়) *
                </label>
                <input
                  type="text"
                  required
                  value={dishName}
                  onChange={e => setDishName(e.target.value)}
                  placeholder="যেমন: হাঁসের মাংস ভুনা ও চালের রুটি"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50/50 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  ক্যাটাগরি
                </label>
                <select
                  value={selectedCat}
                  onChange={e => setSelectedCat(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.nameBn}>
                      {c.nameBn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  ঝালের মাত্রা
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Mild', 'Medium', 'Spicy'].map(lvl => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setSpiceLevel(lvl)}
                      className={`py-2 rounded-xl border font-bold text-xs ${
                        spiceLevel === lvl
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      {lvl === 'Mild' ? 'কম ঝাল' : lvl === 'Medium' ? 'মাঝারি' : 'ঝাল ঝাল'}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isGeneratingFood || !dishName.trim()}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                {isGeneratingFood ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>এআই দিয়ে চমৎকার বিবরণ লেখা হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>এআই দিয়ে বিবরণ জেনারেট করুন</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-3 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 block mb-2">
                ক্লিক করে দ্রুত চেষ্টা করুন:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'খাসির কাচ্চি বিরিয়ানি ও বোরহানি',
                  'পদ্মার সরষে ইলিশ ও জাফরানি পোলাও',
                  'চুইঝাল গরুর মাংস ভুনা',
                  'ঘরোয়া চিকেন খিচুড়ি ও বেগুন ভাজা',
                  'দুধপুলি ও পাটিসাপটা পিঠা প্ল্যাটার'
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setDishName(item);
                    }}
                    className="text-[11px] px-2 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 rounded-lg transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Preview (7 cols) */}
          <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-emerald-700" />
                  <h3 className="font-bold text-sm text-slate-900">
                    এআই জেনারেটেড কনটেন্ট প্রিভিউ
                  </h3>
                </div>
                {generatedFood && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    তৈরি সম্পন্ন
                  </span>
                )}
              </div>

              {generatedFood ? (
                <div className="space-y-4 text-xs">
                  {/* Short desc */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 relative">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-600 text-[11px]">সংক্ষিপ্ত বিবরণ (১ লাইন):</span>
                      <button
                        onClick={() => handleCopy(generatedFood.shortDescBn, 'short')}
                        className="text-slate-400 hover:text-slate-800 p-1"
                        title="কপি করুন"
                      >
                        {copiedField === 'short' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-slate-900 font-medium">{generatedFood.shortDescBn}</p>
                  </div>

                  {/* Full desc */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-600 text-[11px]">বিস্তারিত বিবরণ ও ঘরোয়া উপাদান:</span>
                      <button
                        onClick={() => handleCopy(generatedFood.fullDescBn, 'full')}
                        className="text-slate-400 hover:text-slate-800 p-1"
                        title="কপি করুন"
                      >
                        {copiedField === 'full' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-slate-800 leading-relaxed">{generatedFood.fullDescBn}</p>
                  </div>

                  {/* Quick specs */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-center">
                      <span className="text-[10px] text-emerald-700 block font-semibold">প্রস্তাবিত দাম</span>
                      <span className="text-base font-extrabold text-emerald-900">৳{generatedFood.suggestedPrice || 280}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-500 block font-semibold">পরিমাণ</span>
                      <span className="text-xs font-bold text-slate-800 truncate block mt-0.5">{generatedFood.portionBn || '১ জনের'}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-500 block font-semibold">রান্নার সময়</span>
                      <span className="text-xs font-bold text-slate-800 block mt-0.5">{generatedFood.prepTimeMinutes || 30} মিনিট</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <Bot className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-xs font-medium">
                    বামপাশের ফরমটিতে খাবারের নাম লিখে জেনারেট বাটনে চাপ দিন।
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            {generatedFood && (
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => handleCopy(`${dishName}\n\n${generatedFood.shortDescBn}\n\n${generatedFood.fullDescBn}\nমূল্য: ৳${generatedFood.suggestedPrice}`, 'all')}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-xs text-slate-700 flex items-center gap-1.5"
                >
                  {copiedField === 'all' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>সব টেক্সট কপি করুন</span>
                </button>

                <div className="flex items-center gap-2">
                  {saveStatus && (
                    <span className="text-xs font-semibold text-emerald-700">
                      {saveStatus}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleAddDirectlyToMenu}
                    className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>সরাসরি মেনুতে যোগ করুন</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Advisor */}
      {activeTab === 'advisor' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-700" />
                <span>কিচেন প্রস্তুতি ও ব্যবসায়িক গ্রোথ অ্যাডভাইজার</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                আপনার ক্লাউড কিচেনের সেলস বৃদ্ধি, প্রি-অর্ডার বৃদ্ধি এবং কাস্টমার সন্তুষ্টি সংক্রান্ত যেকোনো প্রশ্ন করুন।
              </p>
            </div>
          </div>

          {/* Chat history */}
          <div className="h-80 overflow-y-auto space-y-3 p-3 bg-slate-50/70 rounded-xl border border-slate-200/60 text-xs">
            {advisorChat.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.sender === 'admin' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed whitespace-pre-line shadow-2xs ${
                    msg.sender === 'admin'
                      ? 'bg-emerald-700 text-white rounded-br-2xs font-medium'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-2xs'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {msg.time}
                </span>
              </div>
            ))}
            {isAdvising && (
              <div className="flex items-center gap-2 text-slate-400 text-xs bg-white px-3 py-2 rounded-2xl border border-slate-200/60 w-fit">
                <Bot className="w-4 h-4 text-emerald-600 animate-spin" />
                <span>অ্যাডভাইজার বিশ্লেষণ করছেন...</span>
              </div>
            )}
          </div>

          {/* Quick Questions */}
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              'সপ্তাহান্তে সেলস ২০% বাড়ানোর টিপস দিন',
              'কিচেন প্রস্তুতি ও নষ্ট হওয়া (ওয়েস্টেজ) কমানোর নিয়ম',
              'আড়াইহাজারে ক্যাটারিং অর্ডারের জন্য স্পেশাল মেনু কম্বো কেমন হওয়া উচিত?',
              'অগ্রিম ৪-৬ ঘন্টা অর্ডার নিশ্চিত করার কৌশল কি?'
            ].map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAskAdvisor(q)}
                className="text-[11px] font-medium px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/70 transition-colors"
              >
                💡 {q}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleAskAdvisor();
            }}
            className="flex items-center gap-2 pt-2"
          >
            <input
              type="text"
              value={advisorInput}
              onChange={e => setAdvisorInput(e.target.value)}
              placeholder="কিচেন বা ব্যবসা সংক্রান্ত প্রশ্ন লিখুন..."
              className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
            />
            <button
              type="submit"
              disabled={isAdvising || !advisorInput.trim()}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>জিজ্ঞাসা করুন</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Social Promo Generator */}
      {activeTab === 'promotions' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-emerald-700" />
                <span>সোশ্যাল মিডিয়া ও উৎসব অফার পোস্ট জেনারেটর</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ফেসবুক পেজ ও হোয়াটসঅ্যাপে প্রচার করার জন্য সরাসরি কপিযোগ্য চমৎকার বাংলা ক্যাপশন।
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleGeneratePromo('weekend')}
              className={`p-3 rounded-xl border text-left transition-all ${
                promoType === 'weekend'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-2xs'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span className="font-bold text-xs block mb-1">🎉 শুক্রবার ও ছুটির দিনের স্পেশাল</span>
              <span className="text-[11px] text-slate-500 block">পারিবারিক ভূরিভোজ ও ইলিশ/মাংস কম্বো</span>
            </button>

            <button
              type="button"
              onClick={() => handleGeneratePromo('catering')}
              className={`p-3 rounded-xl border text-left transition-all ${
                promoType === 'catering'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-2xs'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span className="font-bold text-xs block mb-1">👑 মেহমানদারি ও ক্যাটারিং প্যাকেজ</span>
              <span className="text-[11px] text-slate-500 block">১৫ থেকে ৫০০+ জনের খাঁটি ঘরোয়া আয়োজন</span>
            </button>

            <button
              type="button"
              onClick={() => handleGeneratePromo('quality')}
              className={`p-3 rounded-xl border text-left transition-all ${
                promoType === 'quality'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-2xs'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span className="font-bold text-xs block mb-1">✨ খাঁটি ঘরোয়া রান্নার নিশ্চয়তা</span>
              <span className="text-[11px] text-slate-500 block">টাটকা মশলা ও কোনো বাসি খাবার না থাকার অঙ্গীকার</span>
            </button>
          </div>

          {/* Generated promo container */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">জেনারেটেড পোস্ট ক্যাপশন:</span>
              {promoGenerated && (
                <button
                  type="button"
                  onClick={() => handleCopy(promoGenerated, 'promo')}
                  className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 font-bold flex items-center gap-1.5"
                >
                  {copiedField === 'promo' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>কপি করুন</span>
                </button>
              )}
            </div>

            {isGeneratingPromo ? (
              <div className="py-8 text-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
                <span>আকর্ষণীয় বাংলা পোস্ট প্রস্তুত হচ্ছে...</span>
              </div>
            ) : promoGenerated ? (
              <div className="bg-white p-4 rounded-xl border border-slate-200 leading-relaxed text-slate-800 whitespace-pre-line shadow-2xs font-sans">
                {promoGenerated}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400">
                উপরের যেকোনো ক্যাটাগরিতে ক্লিক করে এক ক্লিকে পোস্ট তৈরি করুন।
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
