import React, { useState, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Mail,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  RefreshCw,
  UtensilsCrossed,
  Tag,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink,
  Edit3
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { FoodItem, Coupon, BusinessConfig } from '../../types/index.ts';
import { BrandLogo } from '../common/BrandLogo.tsx';

interface BroadcastEmailManagementProps {
  config: BusinessConfig;
  foods: FoodItem[];
  coupons: Coupon[];
  onRefreshData?: () => void;
}

export const BroadcastEmailManagement: React.FC<BroadcastEmailManagementProps> = ({
  config,
  foods,
  coupons
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'ai' | 'manual' | 'history'>('ai');

  // AI Compose State
  const [aiPrompt, setAiPrompt] = useState('আজকের দুপুরের স্পেশাল বাঙালি ভোজ প্যাকেজ ও ১০% ক্যাশব্যাক অফার');
  const [aiTone, setAiTone] = useState('আকর্ষণীয় ও রসালো');
  const [selectedFoodId, setSelectedFoodId] = useState('');
  const [selectedCouponCode, setSelectedCouponCode] = useState('');
  const [isComposingAi, setIsComposingAi] = useState(false);

  // Email Content (Shared by AI & Manual)
  const [emailSubject, setEmailSubject] = useState('🎉 [ঘরের স্বাদ] আজকের স্পেশাল ঘরোয়া সুস্বাদু আয়োজন!');
  const [emailHeadline, setEmailHeadline] = useState('মায়ের হাতের খাঁটি বাঙালি স্বাদের এক অনন্য অভিজ্ঞতা!');
  const [emailBody, setEmailBody] = useState(`প্রিয় খাদ্যপ্রেমী ভাই ও বোনেরা,\n\nঘরের স্বাদ-এ আমরা প্রস্তুত করছি খাঁটি বাটা মশলায় রান্না করা টাটকা সুস্বাদু খাবার।\n\nকোনো ফ্রিজের বাসি খাবার নয়—প্রতিটি পদ আপনার অর্ডারের পর তাজা ও সম্পূর্ণ স্বাস্থ্যসম্মত উপায়ে ঘরোয়া পরিবেশে তৈরি করা হয়।\n\nদেরি না করে আজই আপনার পছন্দের পদটি অর্ডার করুন এবং পরিবার নিয়ে উপভোগ করুন খাঁটি বাঙালি ভোজ!`);
  const [buttonText, setButtonText] = useState('এখনই খাবার অর্ডার করুন');
  const [buttonUrl, setButtonUrl] = useState('/');

  // Audience & Sending State
  const [targetAudience, setTargetAudience] = useState<'all' | 'with_orders' | 'admins' | 'single'>('all');
  const [customSingleEmail, setCustomSingleEmail] = useState('');
  const [testEmailAddress, setTestEmailAddress] = useState(config.email || 'rmartbdltd@gmail.com');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // History State
  const [historyList, setHistoryList] = useState<Array<{
    id: string;
    timestamp: string;
    subject: string;
    headline: string;
    targetAudience: string;
    sentCount: number;
    isTest?: boolean;
    user?: string;
  }>>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await api.getBroadcastHistory();
      if (res.history) {
        setHistoryList(res.history);
      }
    } catch (err) {
      console.warn('Failed to fetch broadcast history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // AI Generation Trigger
  const handleGenerateAi = async () => {
    if (!aiPrompt.trim()) return;
    setIsComposingAi(true);
    setSendResult(null);

    let enrichedPrompt = aiPrompt.trim();
    if (selectedCouponCode) {
      enrichedPrompt += `। কুপন কোড: "${selectedCouponCode}" যুক্ত করুন।`;
    }

    try {
      const res = await api.composeEmailWithAi(enrichedPrompt, aiTone, selectedFoodId || undefined);
      if (res.subject) setEmailSubject(res.subject);
      if (res.headline) setEmailHeadline(res.headline);
      if (res.contentText) setEmailBody(res.contentText);
    } catch (err) {
      console.warn('AI Email fallback:', err);
    } finally {
      setIsComposingAi(false);
    }
  };

  // Quick Prompt Chips
  const promptPresets = [
    'আজকের দুপুরের স্পেশাল ভোজ ও ১০% ক্যাশব্যাক',
    'শুক্রবার স্পেশাল পদ্মার ইলিশ ও জাফরানি পোলাও কম্বো',
    'বিকেলের গরম গরম সিঙ্গাড়া, সমুচা ও নাস্তা উৎসব',
    'পারিবারিক বা অফিস মেহমানদারির জন্য প্রিমিয়াম ক্যাটারিং সার্ভিস'
  ];

  // Send Test Email
  const handleSendTest = async () => {
    if (!testEmailAddress || !testEmailAddress.includes('@')) {
      alert('সঠিক টেস্ট ইমেইল ঠিকানা দিন।');
      return;
    }

    setIsSending(true);
    setSendResult(null);

    try {
      const res = await api.broadcastEmail({
        subject: emailSubject,
        headline: emailHeadline,
        contentText: emailBody,
        targetAudience: 'admins',
        foodId: selectedFoodId || undefined,
        ctaUrl: buttonUrl,
        testEmail: testEmailAddress.trim()
      });

      setSendResult({
        success: res.success,
        message: res.message || `টেস্ট ইমেইল সফলভাবে পাঠানো হয়েছে (${testEmailAddress})!`
      });
      fetchHistory();
    } catch (err: unknown) {
      setSendResult({
        success: false,
        message: err instanceof Error ? err.message : 'টেস্ট ইমেইল পাঠাতে ব্যর্থ হয়েছে।'
      });
    } finally {
      setIsSending(false);
    }
  };

  // Execute Full Broadcast
  const handleExecuteBroadcast = async () => {
    setIsConfirmModalOpen(false);
    setIsSending(true);
    setSendResult(null);

    try {
      const payload: any = {
        subject: emailSubject,
        headline: emailHeadline,
        contentText: emailBody,
        targetAudience: targetAudience === 'single' ? 'admins' : targetAudience,
        foodId: selectedFoodId || undefined,
        ctaUrl: buttonUrl,
        testEmail: targetAudience === 'single' ? customSingleEmail.trim() : undefined
      };

      const res = await api.broadcastEmail(payload);

      setSendResult({
        success: res.success,
        count: res.sentCount,
        message: res.message || `${res.sentCount} জন প্রাপকের কাছে ব্রডকাস্ট পাঠানো সম্পন্ন হয়েছে!`
      });
      fetchHistory();
    } catch (err: unknown) {
      setSendResult({
        success: false,
        message: err instanceof Error ? err.message : 'ব্রডকাস্ট পাঠাতে ব্যর্থ হয়েছে।'
      });
    } finally {
      setIsSending(false);
    }
  };

  const selectedFood = foods.find(f => f.id === selectedFoodId);

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-emerald-100 text-xs font-semibold">
            <Send className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Direct Email Marketing & Broadcast' : 'স্মার্ট ইমেইল মার্কেটিং ও ব্রডকাস্ট ইঞ্জিন'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {language === 'en' ? 'Email Broadcast & AI Campaign Studio' : 'ইমেইল ব্রডকাস্ট ও এআই ক্যাম্পেইন স্টুডিও'}
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
            {language === 'en'
              ? 'Generate persuasive promotional emails using Gemini AI or compose manually. Send beautifully branded emails to all your registered customers in one click.'
              : 'Google Gemini এআই দিয়ে মাত্র এক ক্লিকে আকর্ষণীয় লোভনীয় বাংলা প্রমোশনাল ইমেইল তৈরি করুন অথবা ম্যানুয়ালি লিখে এক ক্লিকে সকল গ্রাহকের ইনবক্সে ব্রডকাস্ট পাঠান।'}
          </p>
        </div>

        {/* Decorative background circle */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/5 rounded-full pointer-events-none" />
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('ai')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'ai'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>{language === 'en' ? '1. AI Email Creator & Send' : '১. এআই ইমেইল তৈরি ও সেন্ড'}</span>
        </button>

        <button
          onClick={() => setActiveTab('manual')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'manual'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Edit3 className="w-4 h-4 text-teal-600" />
          <span>{language === 'en' ? '2. Manual Composer & Send' : '২. ম্যানুয়াল ইমেইল কম্পোজার ও সেন্ড'}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('history');
            fetchHistory();
          }}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'history'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4 text-slate-500" />
          <span>{language === 'en' ? '3. Broadcast History & Logs' : '৩. ব্রডকাস্ট হিস্টোরি ও লগ'}</span>
        </button>
      </div>

      {/* Status Notifications */}
      {sendResult && (
        <div
          className={`p-4 rounded-2xl flex items-start gap-3 text-xs sm:text-sm animate-in fade-in ${
            sendResult.success
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          {sendResult.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <span className="font-bold">{sendResult.message}</span>
            {sendResult.count !== undefined && (
              <p className="text-xs text-emerald-700 mt-0.5 font-medium">
                মোট প্রাপক: {sendResult.count} জন সফলভাবে ডেলিভারি করা হয়েছে।
              </p>
            )}
          </div>
          <button
            onClick={() => setSendResult(null)}
            className="text-xs text-slate-400 hover:text-slate-700 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {activeTab !== 'history' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form & Settings */}
          <div className="lg:col-span-7 space-y-6">
            {/* AI Generator Settings (Only for Tab 1) */}
            {activeTab === 'ai' && (
              <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-2xs space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {language === 'en' ? 'AI Promotional Email Prompt' : 'এআই প্রমোশনাল প্রম্পট ও নির্দেশনা'}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {language === 'en' ? 'Describe the offer or occasion you want to promote' : 'আপনার আজকের ক্যাম্পেইন বা অফারের লক্ষ্য বর্ণনা করুন'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {language === 'en' ? 'Campaign Topic / Offer Idea' : 'ক্যাম্পেইনের বিষয় বা অফার'}
                  </label>
                  <textarea
                    rows={2}
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                    placeholder="যেমন: আজকের ছুটির দিনের স্পেশাল বিরিয়ানি কম্বো ও ফ্রি ডেলিভারি..."
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 text-xs bg-slate-50/50"
                  />
                  {/* Preset chips */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {promptPresets.map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAiPrompt(chip)}
                        className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 transition-colors cursor-pointer"
                      >
                        + {chip}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {language === 'en' ? 'Writing Tone' : 'লেখার ধরন / টোন'}
                    </label>
                    <select
                      value={aiTone}
                      onChange={e => setAiTone(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-emerald-600"
                    >
                      <option value="আকর্ষণীয় ও রসালো">আকর্ষণীয় ও রসালো (Luscious)</option>
                      <option value="মার্জিত ও প্রফেশনাল">মার্জিত ও প্রফেশনাল (Formal)</option>
                      <option value="সীমিত সময়ের জরুরি অফার">জরুরি সীমিত সময়ের অফার (Urgent)</option>
                      <option value="মেহমানদারি ও পারিবারিক ভোজ">পারিবারিক মেহমানদারি (Warm)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {language === 'en' ? 'Featured Dish (Optional)' : 'স্পেশাল খাদ্যপদ (ঐচ্ছিক)'}
                    </label>
                    <select
                      value={selectedFoodId}
                      onChange={e => setSelectedFoodId(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-emerald-600"
                    >
                      <option value="">-- কোনো নির্দিষ্ট পদ নয় --</option>
                      {foods.map(f => (
                        <option key={f.id} value={f.id}>
                          {f.nameBn} (৳{f.salePrice || f.price})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {language === 'en' ? 'Include Coupon' : 'কুপন কোড (ঐচ্ছিক)'}
                    </label>
                    <select
                      value={selectedCouponCode}
                      onChange={e => setSelectedCouponCode(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-emerald-600"
                    >
                      <option value="">-- কোনো কুপন নয় --</option>
                      {coupons.filter(c => c.isActive).map(c => (
                        <option key={c.code} value={c.code}>
                          {c.code} ({c.discountType === 'percentage' ? `${c.discountValue}%` : `৳${c.discountValue}`} ছাড়)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isComposingAi || !aiPrompt.trim()}
                  onClick={handleGenerateAi}
                  className="w-full py-2.8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {isComposingAi
                      ? (language === 'en' ? 'Gemini AI is crafting email...' : 'এআই আকর্ষণীয় ইমেইল রচনা করছে...')
                      : (language === 'en' ? 'Generate Email with AI' : 'এআই দিয়ে ইমেইল তৈরি করুন')}
                  </span>
                </button>
              </div>
            )}

            {/* Email Drafting Fields */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-700" />
                  <h3 className="font-bold text-slate-900 text-sm">
                    {language === 'en' ? 'Email Content Review & Edit' : 'ইমেইল বার্তা সম্পাদনা ও প্রস্তুতি'}
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">প্রেরণের পূর্বে সম্পাদনাযোগ্য</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'en' ? 'Subject Line' : 'ইমেইল সাবজেক্ট (বিষয়)'}
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  placeholder="ইমেইল সাবজেক্ট লিখুন..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-emerald-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'en' ? 'Main Headline / Banner Title' : 'প্রধান শিরোনাম (Headline)'}
                </label>
                <input
                  type="text"
                  value={emailHeadline}
                  onChange={e => setEmailHeadline(e.target.value)}
                  placeholder="ব্যানারের বড় শিরোনাম..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-emerald-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'en' ? 'Email Message Body' : 'ইমেইল বার্তার মূল বিবরণ'}
                </label>
                <textarea
                  rows={6}
                  value={emailBody}
                  onChange={e => setEmailBody(e.target.value)}
                  placeholder="বিস্তারিত বর্ণনা লিখুন..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-emerald-600 leading-relaxed font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'en' ? 'Call-to-Action Button Text' : 'অ্যাকশন বাটন টেক্সট'}
                  </label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={e => setButtonText(e.target.value)}
                    placeholder="যেমন: এখনই খাবার অর্ডার করুন"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'en' ? 'Action Button URL' : 'বাটন লিংক'}
                  </label>
                  <input
                    type="text"
                    value={buttonUrl}
                    onChange={e => setButtonUrl(e.target.value)}
                    placeholder="/ অথবা /menu"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Target Audience & Broadcast Action */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-sm">
                  {language === 'en' ? 'Target Audience & Sending Mode' : 'প্রাপক নির্বাচন ও ব্রডকাস্ট প্রেরণ'}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTargetAudience('all')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    targetAudience === 'all'
                      ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-semibold'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold">👥 সকল নিবন্ধিত গ্রাহক</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">সকল কাস্টমার ও নিবন্ধিত অ্যাকাউন্টধারী</div>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetAudience('with_orders')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    targetAudience === 'with_orders'
                      ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-semibold'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold">🛍️ পূর্ববর্তী ক্রেতাগণ</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">যারা ইতিপূর্বে কমপক্ষে ১টি অর্ডার করেছেন</div>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetAudience('admins')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    targetAudience === 'admins'
                      ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-semibold'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold">👑 শুধুমাত্র অ্যাডমিন ও স্টাফ</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">অভ্যন্তরীণ নোটিফিকেশন বা যাচাইকরণ</div>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetAudience('single')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    targetAudience === 'single'
                      ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-semibold'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold">✉️ নির্দিষ্ট একক ইমেইল</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">যেকোনো নির্দিষ্ট ইমেইলে সরাসরি প্রেরণ</div>
                </button>
              </div>

              {/* Single custom recipient input */}
              {targetAudience === 'single' && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 block">
                    প্রাপকের ইমেইল এড্রেস লিখুন:
                  </label>
                  <input
                    type="email"
                    value={customSingleEmail}
                    onChange={e => setCustomSingleEmail(e.target.value)}
                    placeholder="customer@gmail.com"
                    className="w-full p-2 bg-white rounded-lg border border-slate-300 text-xs font-mono"
                  />
                </div>
              )}

              {/* Send Actions Bar */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Test Send input & button */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="email"
                    value={testEmailAddress}
                    onChange={e => setTestEmailAddress(e.target.value)}
                    placeholder="admin@gmail.com"
                    className="p-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white w-48 font-mono"
                    title="টেস্ট ইমেইল এড্রেস"
                  />
                  <button
                    type="button"
                    disabled={isSending || !emailSubject.trim()}
                    onClick={handleSendTest}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {isSending ? '...' : 'টেস্ট পাঠান'}
                  </button>
                </div>

                {/* Primary Broadcast Button */}
                <button
                  type="button"
                  disabled={isSending || !emailSubject.trim() || !emailBody.trim()}
                  onClick={() => setIsConfirmModalOpen(true)}
                  className="w-full sm:w-auto px-6 py-2.8 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {targetAudience === 'single'
                      ? 'নির্দিষ্ট ইমেইলে পাঠান'
                      : 'ব্রডকাস্ট ইমেইল সেন্ড করুন'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Email Preview Card */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-emerald-600" />
                <span>লাইভ ইমেইল প্রিভিউ (Live Preview)</span>
              </span>
              <span className="text-[10px] text-slate-400">গ্রাহকের ইনবক্সে ঠিক যেমন দেখাবে</span>
            </div>

            {/* Email Container Mockup */}
            <div className="bg-slate-100 p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-inner">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden text-left">
                {/* Mock Email Header */}
                <div className="bg-gradient-to-r from-emerald-800 to-teal-800 p-4 text-white text-center">
                  <div className="flex justify-center mb-1">
                    <BrandLogo size="sm" className="ring-2 ring-white/20" />
                  </div>
                  <h4 className="font-bold text-sm tracking-wide">{config.brandNameBn}</h4>
                  <p className="text-[10px] text-emerald-100">{config.taglineBn}</p>
                </div>

                {/* Mock Email Content */}
                <div className="p-4 sm:p-5 space-y-3.5">
                  <div className="border-b border-slate-100 pb-2">
                    <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider block">
                      অফিসিয়াল অফার বার্তা
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5 leading-snug">
                      {emailHeadline || 'প্রধান শিরোনাম'}
                    </h3>
                  </div>

                  {/* Body Paragraphs */}
                  <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line space-y-2">
                    {emailBody}
                  </div>

                  {/* Featured Food Card in Preview if selected */}
                  {selectedFood && (
                    <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 flex items-center gap-3">
                      {selectedFood.image ? (
                        <img
                          src={selectedFood.image}
                          alt={selectedFood.nameBn}
                          className="w-12 h-12 rounded-lg object-cover border border-amber-300"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-amber-200 flex items-center justify-center text-amber-800 font-bold">
                          🍲
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-slate-900 text-xs truncate">{selectedFood.nameBn}</h5>
                        <p className="text-[11px] text-emerald-700 font-bold">
                          ৳{selectedFood.salePrice || selectedFood.price}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Call to action button */}
                  <div className="text-center pt-2">
                    <div className="inline-block px-5 py-2.5 bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs">
                      {buttonText || 'অর্ডার করুন'}
                    </div>
                  </div>
                </div>

                {/* Mock Email Footer */}
                <div className="bg-slate-50 p-3 border-t border-slate-100 text-center text-[10px] text-slate-400 space-y-0.5">
                  <p className="font-medium text-slate-600">কল / হোয়াটসঅ্যাপ: {config.phone}</p>
                  <p>{config.fullAddressBn || config.primaryLocation}</p>
                  <p className="text-[9px]">© ২০২৬ {config.brandNameBn}। সর্বস্বত্ব সংরক্ষিত।</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* History & Logs Tab */
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {language === 'en' ? 'Previous Broadcast Campaigns' : 'পূর্ববর্তী ব্রডকাস্ট ক্যাম্পেইনের তালিকা'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {language === 'en' ? 'History of all promotional and transactional announcements sent' : 'সকল সফলভাবে প্রেরিত ইমেইল ব্রডকাস্টের তালিকা'}
              </p>
            </div>
            <button
              onClick={fetchHistory}
              disabled={isLoadingHistory}
              className="p-1.5 text-slate-500 hover:text-emerald-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingHistory ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {historyList.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <Mail className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>এখনো কোনো ব্রডকাস্ট ক্যাম্পেইন পাঠানো হয়নি।</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {historyList.map(item => (
                <div key={item.id} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-xs">{item.subject}</span>
                      {item.isTest && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                          TEST
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">{item.headline}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                      <span>প্রাপক: <strong className="text-slate-600">{item.targetAudience}</strong></span>
                      <span>সময়: {new Date(item.timestamp).toLocaleString('bn-BD')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-700 block">
                        {item.sentCount} জন
                      </span>
                      <span className="text-[10px] text-slate-400">সফল ডেলিভারি</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-left">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Send className="w-5 h-5" />
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-base">
                {language === 'en' ? 'Confirm Email Broadcast?' : 'ইমেইল ব্রডকাস্ট প্রেরণের নিশ্চিতকরণ'}
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                আপনি কি নিশ্চিত যে নিচের বিষয়টি দিয়ে নির্বাচিত গ্রাহকদের কাছে ইমেইল পাঠাতে চান?
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 font-medium">
              <p><span className="text-slate-400">বিষয়:</span> {emailSubject}</p>
              <p><span className="text-slate-400">লক্ষ্য:</span> {targetAudience === 'all' ? 'সকল নিবন্ধিত গ্রাহক' : targetAudience}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleExecuteBroadcast}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs cursor-pointer"
              >
                হ্যাঁ, ব্রডকাস্ট প্রেরণ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
