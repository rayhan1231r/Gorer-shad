import React, { useState, useEffect } from 'react';
import {
  Mail,
  Save,
  CheckCircle,
  AlertCircle,
  Send,
  Eye,
  EyeOff,
  ShieldCheck,
  Clock,
  RefreshCw,
  KeyRound,
  Server,
  HelpCircle,
  Sparkles,
  Image as ImageIcon,
  Upload,
  Trash2
} from 'lucide-react';
import { SmtpConfig } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';
import logoFallback from '../../assets/images/ghorer_shad_logo_1791731962583.jpg';

interface TestLogItem {
  id: string;
  timestamp: string;
  targetEmail: string;
  success: boolean;
  message: string;
}

export const SmtpSettings: React.FC = () => {
  const { language } = useLanguage();
  const [formData, setFormData] = useState<SmtpConfig>({
    host: 'smtp.gmail.com',
    port: 587,
    user: '',
    pass: '',
    security: 'STARTTLS',
    senderEmail: 'ghorershad.arai@gmail.com',
    senderName: 'ঘরের স্বাদ (Ghorer Shad)',
    logoUrl: '/logo.jpg',
    websiteUrl: '',
    otpExpirationMinutes: 5,
    otpResendCooldownSeconds: 60,
    maxVerificationAttempts: 5,
    isConfigured: false,
    isPassSet: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Testing connection state
  const [testEmail, setTestEmail] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testLogs, setTestLogs] = useState<TestLogItem[]>([]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const cfg = await api.getSmtpConfig();
      setFormData(cfg);
      if (cfg.user) {
        setTestEmail(cfg.user);
      }
    } catch (err) {
      console.warn('Failed to load SMTP settings:', err);
    }
  };

  const handleApplyPreset = (presetName: 'gmail' | 'outlook' | 'cpanel') => {
    if (presetName === 'gmail') {
      setFormData(prev => ({
        ...prev,
        host: 'smtp.gmail.com',
        port: 587,
        security: 'STARTTLS',
      }));
    } else if (presetName === 'outlook') {
      setFormData(prev => ({
        ...prev,
        host: 'smtp.office365.com',
        port: 587,
        security: 'STARTTLS',
      }));
    } else if (presetName === 'cpanel') {
      setFormData(prev => ({
        ...prev,
        host: 'mail.ghorershad.com',
        port: 465,
        security: 'SSL',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      // Don't send masked password string if unchanged
      const payload: Partial<SmtpConfig> = { ...formData };
      if (payload.pass === '••••••••') {
        delete payload.pass;
      }
      payload.isConfigured = Boolean(payload.host && payload.user && (payload.pass || formData.isPassSet));

      const updated = await api.updateSmtpConfig(payload);
      setFormData(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    const target = testEmail.trim() || formData.user || formData.senderEmail;
    if (!target) {
      setTestResult({
        success: false,
        message: 'অনুগ্রহ করে টেস্ট ইমেইল ঠিকানা দিন।',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await api.testSmtp(target);
      setTestResult(res);
      setTestLogs(prev => [
        {
          id: String(Date.now()),
          timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          targetEmail: target,
          success: res.success,
          message: res.message,
        },
        ...prev.slice(0, 4),
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'টেস্ট সংযোগ ব্যর্থ হয়েছে';
      setTestResult({ success: false, message: msg });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-4xl">
      {/* Header card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Mail className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {language === 'en' ? 'Email / SMTP Setup & OTP Configuration' : 'Email / SMTP Settings (ইমেইল ও ওটিপি কনফিগারেশন)'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'en'
              ? 'Configure your SMTP server to send customer verification OTPs, password reset emails, and order notifications.'
              : 'গ্রাহক একাউন্ট ভেরিফিকেশন ও পাসওয়ার্ড রিসেট ওটিপি (OTP) পাঠাতে আপনার নিজস্ব SMTP সার্ভার কনফিগার করুন।'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {formData.isConfigured ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>সক্রিয় ও কনফিগার করা</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>অসম্পূর্ণ / আনকনফিগারড</span>
            </span>
          )}
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-700" />
          <span>SMTP কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে!</span>
        </div>
      )}

      {saveError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Preset Buttons */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <span className="text-xs font-semibold text-slate-700 block mb-2.5">
          সাধারণ প্রোভাইডার প্রিসেট (এক ক্লিকে সেটিংস পূরণ করুন):
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleApplyPreset('gmail')}
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Gmail SMTP (Port 587, STARTTLS)</span>
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('outlook')}
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <Server className="w-3.5 h-3.5 text-emerald-600" />
            <span>Outlook / Office 365 (Port 587)</span>
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('cpanel')}
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <Server className="w-3.5 h-3.5 text-emerald-600" />
            <span>Custom cPanel / SSL (Port 465)</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Server Credentials */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-700" />
            <span>১. সার্ভার ও ক্রেডেনশিয়াল তথ্য</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                SMTP Host (হোস্ট) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.host}
                onChange={e => setFormData({ ...formData, host: e.target.value })}
                placeholder="যেমন: smtp.gmail.com"
                className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600 font-mono text-slate-900"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Gmail-এর জন্য: <strong className="font-mono">smtp.gmail.com</strong>
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                SMTP Port (পোর্ট) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                value={formData.port}
                onChange={e => setFormData({ ...formData, port: Number(e.target.value) })}
                placeholder="587"
                className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600 font-mono text-slate-900"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                সাধারণত STARTTLS এর জন্য <strong className="font-mono">587</strong> এবং SSL এর জন্য <strong className="font-mono">465</strong>
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                SMTP Username / Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.user}
                onChange={e => setFormData({ ...formData, user: e.target.value })}
                placeholder="sender.ghorer@gmail.com"
                className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600 text-slate-900"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                আপনার প্রেরক ইমেইল বা SMTP ইউজারনেম
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center justify-between">
                <span>
                  SMTP Password / App Password <span className="text-rose-500">*</span>
                </span>
                {formData.isPassSet && (
                  <span className="text-emerald-700 text-[10px] font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                    পাসওয়ার্ড সেট করা আছে
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.pass}
                  onChange={e => setFormData({ ...formData, pass: e.target.value })}
                  placeholder={formData.isPassSet ? '•••••••• (অপরিবর্তিত রাখতে খালি রাখুন)' : 'গুগল অ্যাপ পাসওয়ার্ড দিন...'}
                  className="w-full p-2.5 pr-10 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600 font-mono text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Gmail ব্যবহার করলে ১৬-সংখ্যার Google App Password ব্যবহার করুন।
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                SMTP Security (সিকিউরিটি প্রোটোকল) <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.security}
                onChange={e => setFormData({ ...formData, security: e.target.value as any })}
                className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white text-slate-900 font-medium"
              >
                <option value="STARTTLS">STARTTLS (Port 587 - Recommended)</option>
                <option value="SSL">SSL / TLS (Port 465)</option>
                <option value="NONE">None / Plain (Local development only)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. Sender Identity & Email Branding */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-700" />
                <span>২. প্রেরকের পরিচিতি ও ইমেইল লোগো ব্র্যান্ডিং (Sender & Logo Settings)</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                ওয়েবসাইট থেকে পাঠানো যেকোনো ইমেইলে (OTP, পাসওয়ার্ড রিসেট, নোটিফিকেশন) এই প্রেরক নাম ও ওয়েবসাইটের লোগো সংযুক্ত থাকবে।
              </p>
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold shrink-0">
              R-Mart মুক্ত খাঁটি ব্র্যান্ডিং
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Sender Email (প্রেরকের ইমেইল ঠিকানা) <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.senderEmail}
                onChange={e => setFormData({ ...formData, senderEmail: e.target.value })}
                placeholder="ghorershad.arai@gmail.com"
                className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600 text-slate-900"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                গ্রাহক এই ইমেইল ঠিকানা থেকে বার্তা পাবেন।
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Sender Display Name (প্রেরকের নাম — কোনো R-Mart থাকবে না) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.senderName}
                onChange={e => setFormData({ ...formData, senderName: e.target.value })}
                placeholder="ঘরের স্বাদ (Ghorer Shad)"
                className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600 font-semibold text-slate-900"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                ইমেইল ইনবক্সে প্রেরকের নাম হিসেবে প্রদর্শিত হবে।
              </span>
            </div>
          </div>

          {/* Email Logo Management & Upload */}
          <div className="pt-2 border-t border-slate-100">
            <label className="font-semibold text-slate-800 text-xs block mb-2 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-emerald-700" />
              <span>ইমেইলের ভেতরে প্রদর্শিত ওয়েবসাইটের লোগো (Email Header Logo)</span>
            </label>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              {/* Logo Preview */}
              <div className="relative group shrink-0">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-white border-2 border-emerald-600 shadow-xs flex items-center justify-center p-1">
                  <img
                    src={formData.logoUrl || '/logo.jpg'}
                    alt="Email Brand Logo"
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = logoFallback;
                    }}
                  />
                </div>
                <div className="text-[10px] text-center font-bold text-emerald-800 mt-1">
                  সক্রিয় লোগো
                </div>
              </div>

              {/* Upload Controls & URL Input */}
              <div className="flex-1 space-y-2.5 text-xs w-full">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold text-xs transition-colors shadow-2xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingLogo ? 'আপলোড হচ্ছে...' : 'নতুন লোগো আপলোড করুন'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingLogo}
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          setIsUploadingLogo(true);
                          const reader = new FileReader();
                          reader.onload = async () => {
                            try {
                              const res = await api.uploadImage(reader.result as string, file.name);
                              setFormData(prev => ({ ...prev, logoUrl: res.url }));
                            } catch (err) {
                              console.error('Logo upload failed:', err);
                              alert('লোগো আপলোড ব্যর্থ হয়েছে');
                            } finally {
                              setIsUploadingLogo(false);
                            }
                          };
                          reader.readAsDataURL(file);
                        } catch (err) {
                          console.error(err);
                          setIsUploadingLogo(false);
                        }
                      }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, logoUrl: '/logo.jpg' }))}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-semibold text-xs transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                    <span>ডিফল্ট লোগো সেট করুন</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 shrink-0 font-medium">লোগো পাথ / URL:</span>
                  <input
                    type="text"
                    value={formData.logoUrl || ''}
                    onChange={e => setFormData({ ...formData, logoUrl: e.target.value })}
                    placeholder="/logo.jpg অথবা পূর্ণ ইমেজ URL"
                    className="flex-1 p-1.5 rounded-lg border border-slate-200 text-[11px] font-mono text-slate-800 focus:outline-none focus:border-emerald-600 bg-white"
                  />
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  ইমেইল প্রেরণের সময় এই লোগোটি স্বয়ংক্রিয়ভাবে ইমেইলের ভেতরে এম্বেড (CID) হয়ে যাবে, যাতে যেকোনো ইনবক্সে লোগোটি নিখুঁতভাবে দৃশ্যমান হয়।
                </p>
              </div>
            </div>
          </div>

          {/* Email Preview Card */}
          <div className="mt-3 p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs">
            <div className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>ইমেইল হেডার প্রিভিউ (গ্রাহক যেভাবে দেখবেন):</span>
              <span className="text-[10px] text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">Live Preview</span>
            </div>
            <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-2xs space-y-2">
              <div className="text-slate-500 text-[11px]">
                <strong className="text-slate-800">From:</strong> "{formData.senderName || 'ঘরের স্বাদ (Ghorer Shad)'}" &lt;{formData.senderEmail || 'ghorershad.arai@gmail.com'}&gt;
              </div>
              <div className="text-slate-500 text-[11px]">
                <strong className="text-slate-800">Subject:</strong> [{formData.senderName || 'ঘরের স্বাদ (Ghorer Shad)'}] একাউন্ট ভেরিফিকেশন ওটিপি: 123456
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
                <img
                  src={formData.logoUrl || '/logo.jpg'}
                  alt="Email Logo"
                  className="w-8 h-8 rounded-full border border-emerald-600 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = logoFallback;
                  }}
                />
                <div>
                  <div className="font-bold text-xs text-emerald-800">{formData.senderName || 'ঘরের স্বাদ (Ghorer Shad)'}</div>
                  <div className="text-[10px] text-slate-500">সব স্বাদের এক ঠিকানা • আড়াইহাজার, ঢাকা</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. OTP Policies */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>৩. ওটিপি মেয়াদ ও নিরাপত্তা নীতিমালা (OTP Policies)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                OTP Expiration Time (মেয়াদ মিনিট)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="60"
                  required
                  value={formData.otpExpirationMinutes}
                  onChange={e => setFormData({ ...formData, otpExpirationMinutes: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600 font-mono"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                ডিফল্ট: ৫ মিনিট
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                OTP Resend Cooldown (পুনরায় পাঠানোর ব্যবধান - সেকেন্ড)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="15"
                  max="300"
                  required
                  value={formData.otpResendCooldownSeconds}
                  onChange={e => setFormData({ ...formData, otpResendCooldownSeconds: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600 font-mono"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                ডিফল্ট: ৬০ সেকেন্ড
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Maximum Attempts (সর্বোচ্চ ভুল চেষ্টা)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="3"
                  max="10"
                  required
                  value={formData.maxVerificationAttempts}
                  onChange={e => setFormData({ ...formData, maxVerificationAttempts: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600 font-mono"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                ডিফল্ট: ৫ বার ভুল হলে বাতিল
              </span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'সংরক্ষিত হচ্ছে...' : 'SMTP সেটিংস সংরক্ষণ করুন'}</span>
          </button>
        </div>
      </form>

      {/* 4. Instant Connection Test Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-700" />
              <span>রিয়েল-টাইম SMTP টেস্ট সংযোগ (Test Connection)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              সংরক্ষিত ক্রেডেনশিয়াল দিয়ে সরাসরি টেস্ট ইমেইল পাঠিয়ে যাচাই করুন যে ইমেইল ডেলিভারি কাজ করছে কি না।
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <input
            type="email"
            value={testEmail}
            onChange={e => setTestEmail(e.target.value)}
            placeholder="টেস্ট ইমেইল ঠিকানা (যেমন: your-email@gmail.com)"
            className="flex-1 p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 text-slate-900"
          />
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
          >
            {isTesting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>যাচাই হচ্ছে...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>টেস্ট ইমেইল পাঠান</span>
              </>
            )}
          </button>
        </div>

        {/* Test Result Alert */}
        {testResult && (
          <div
            className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
              testResult.success
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : 'bg-rose-50/80 border-rose-200 text-rose-900'
            }`}
          >
            {testResult.success ? (
              <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <span className="font-bold block">
                {testResult.success ? 'টেস্ট সফল হয়েছে!' : 'টেস্ট ব্যর্থ হয়েছে!'}
              </span>
              <p className="leading-relaxed">{testResult.message}</p>
            </div>
          </div>
        )}

        {/* Recent Test Logs */}
        {testLogs.length > 0 && (
          <div className="pt-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              সাম্প্রতিক টেস্ট লগ (Recent Logs):
            </span>
            <div className="space-y-1.5">
              {testLogs.map(log => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 text-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        log.success ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                    <span className="font-mono text-slate-700">{log.targetEmail}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 truncate max-w-xs">{log.message}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Helpful Instructions Guide Card */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5 space-y-3">
        <div className="flex items-center gap-2 text-slate-800 text-xs font-bold">
          <HelpCircle className="w-4 h-4 text-emerald-700" />
          <span>Google Gmail App Password তৈরির সহায়িকা:</span>
        </div>
        <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1.5 leading-relaxed pl-1">
          <li>আপনার Google Account (myaccount.google.com)-এ যান।</li>
          <li><strong>Security (নিরাপত্তা)</strong> ট্যাবে যান এবং <strong>2-Step Verification</strong> চালু করুন।</li>
          <li>নিচে স্ক্রোল করে <strong>App passwords</strong> অপশনে ক্লিক করুন।</li>
          <li>একটি নাম দিন (যেমন: &quot;Ghorer Shad Web&quot;) এবং <strong>Generate</strong> বাটনে চাপুন।</li>
          <li>১৬-সংখ্যার জেনারেট হওয়া কোডটি কপি করে উপরে <strong>SMTP Password</strong> ঘরে বসিয়ে দিন।</li>
        </ol>
      </div>
    </div>
  );
};
