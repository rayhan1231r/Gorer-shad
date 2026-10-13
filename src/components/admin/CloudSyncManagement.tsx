import React, { useState, useEffect } from 'react';
import {
  Cloud,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  Database,
  CheckCircle2,
  AlertCircle,
  FileDown,
  FileUp,
  Server,
  Layers,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { FoodItem, Category } from '../../types/index.ts';

interface CloudSyncManagementProps {
  foods: FoodItem[];
  categories: Category[];
  onRefreshData: () => void;
}

export const CloudSyncManagement: React.FC<CloudSyncManagementProps> = ({
  foods,
  categories,
  onRefreshData
}) => {
  const { language } = useLanguage();
  const [syncStatus, setSyncStatus] = useState<{
    isConfigured: boolean;
    projectId: string;
    connected: boolean;
    lastSyncedAt: string | null;
    cloudFoodsCount: number;
    cloudCategoriesCount: number;
    lastError?: string | null;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ success: boolean; message: string } | null>(null);
  const [importFileJson, setImportFileJson] = useState<string | null>(null);
  const [importFileName, setImportFileName] = useState<string>('');

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const st = await api.getCloudSyncStatus();
      setSyncStatus(st);
    } catch (err: unknown) {
      console.warn('Failed to fetch cloud sync status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handlePushToCloud = async () => {
    setIsLoading(true);
    setActionNotice(null);
    try {
      const res = await api.pushToCloud();
      setActionNotice({
        success: true,
        message: res.message || 'সকল পণ্য ও সেটিংস সফলভাবে Firebase Firestore ক্লাউডে সংরক্ষিত হয়েছে!'
      });
      await fetchStatus();
      onRefreshData();
    } catch (err: unknown) {
      setActionNotice({
        success: false,
        message: err instanceof Error ? err.message : 'ক্লাউডে সংরক্ষণ ব্যর্থ হয়েছে।'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePullFromCloud = async () => {
    setIsLoading(true);
    setActionNotice(null);
    try {
      const res = await api.pullFromCloud();
      setActionNotice({
        success: true,
        message: res.message || 'ক্লাউড থেকে সফলভাবে পণ্য ও ডেটা রিস্টোর করা হয়েছে!'
      });
      await fetchStatus();
      onRefreshData();
    } catch (err: unknown) {
      setActionNotice({
        success: false,
        message: err instanceof Error ? err.message : 'ক্লাউড থেকে লোড ব্যর্থ হয়েছে।'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportBackup = () => {
    window.location.href = '/api/admin/backup/export';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const text = event.target?.result as string;
        JSON.parse(text); // validate JSON syntax
        setImportFileJson(text);
      } catch {
        alert('ত্রুটি: নির্বাচিত ফাইলটি সঠিক JSON ফরম্যাটে নেই।');
        setImportFileJson(null);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = async () => {
    if (!importFileJson) return;
    setIsLoading(true);
    setActionNotice(null);
    try {
      const parsed = JSON.parse(importFileJson);
      const res = await api.importDatabaseBackup(parsed);
      setActionNotice({
        success: true,
        message: res.message || 'ব্যাকআপ সফলভাবে রিস্টোর করা হয়েছে!'
      });
      setImportFileJson(null);
      setImportFileName('');
      await fetchStatus();
      onRefreshData();
    } catch (err: unknown) {
      setActionNotice({
        success: false,
        message: err instanceof Error ? err.message : 'ব্যাকআপ রিস্টোর ব্যর্থ হয়েছে।'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-emerald-100 text-xs font-semibold">
            <Cloud className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Persistent Multi-Deployment Cloud Sync' : 'ক্লাউড সিঙ্ক ও স্থায়ী ডেটাবেস ব্যাকআপ'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {language === 'en' ? 'Firebase Firestore Cloud Synchronization' : 'ফায়ারবেস ক্লাউড সিঙ্ক ও স্থায়ী ডেটা সংরক্ষণ'}
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
            {language === 'en'
              ? 'Your products and configurations are permanently preserved in Google Cloud Firestore. When deploying to a new server or another account using the same API, all dishes and settings are instantly restored.'
              : 'আপনার যোগ করা সকল খাবার, ক্যাটাগরি ও সেটিংস স্থায়ীভাবে Google Cloud Firestore ক্লাউডে সংরক্ষিত থাকে। ফাইলগুলো অন্য কোথাও ডিপ্লয় করলেও একই Firebase API সংযুক্ত থাকলে পূর্বের কোনো পণ্য মুছে যাবে না।'}
          </p>
        </div>
      </div>

      {/* Action Notification */}
      {actionNotice && (
        <div
          className={`p-4 rounded-2xl flex items-start gap-3 text-xs sm:text-sm animate-in fade-in ${
            actionNotice.success
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          {actionNotice.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <span className="font-bold">{actionNotice.message}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-xs text-slate-400 hover:text-slate-700 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Cloud Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Project Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Firebase প্রজেক্ট</span>
            <Server className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-lg font-extrabold text-slate-900 font-mono truncate">
            {syncStatus?.projectId || 'r-mart-7897a'}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>ক্লাউড ফায়ারবেস সক্রিয়</span>
          </div>
        </div>

        {/* Cloud Dishes Count */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">ক্লাউডে সংরক্ষিত পণ্য</span>
            <Database className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-lg font-extrabold text-slate-900">
            {syncStatus?.cloudFoodsCount !== undefined ? syncStatus.cloudFoodsCount : foods.length} টি পদ
          </p>
          <span className="text-[11px] text-slate-500">
            স্থানীয় পণ্য সংখ্যা: {foods.length} টি
          </span>
        </div>

        {/* Categories Count */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">ক্যাটাগরি সমূহ</span>
            <Layers className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-lg font-extrabold text-slate-900">
            {syncStatus?.cloudCategoriesCount !== undefined && syncStatus.cloudCategoriesCount > 0
              ? syncStatus.cloudCategoriesCount
              : categories.length} টি
          </p>
          <span className="text-[11px] text-slate-500">
            সর্বমোট অ্যাক্টিভ ক্যাটাগরি
          </span>
        </div>

        {/* Last Sync Timestamp */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">সর্বশেষ ক্লাউড সিঙ্ক</span>
            <Cloud className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xs font-bold text-slate-800">
            {syncStatus?.lastSyncedAt
              ? new Date(syncStatus.lastSyncedAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
              : 'সক্রিয় (স্বয়ংক্রিয়)'}
          </p>
          <span className="text-[10px] text-slate-400">
            {syncStatus?.lastSyncedAt
              ? new Date(syncStatus.lastSyncedAt).toLocaleDateString('bn-BD')
              : 'প্রতিটি পরিবর্তনের সাথে স্বয়ংক্রিয় সিঙ্ক'}
          </span>
        </div>
      </div>

      {/* Action Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Cloud Firestore Sync Actions */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Cloud className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {language === 'en' ? 'Direct Firestore Cloud Actions' : 'ফায়ারবেস ক্লাউড অ্যাকশনসমূহ'}
              </h3>
              <p className="text-[11px] text-slate-500">
                এক ক্লিকে ক্লাউডে আপলোড অথবা ক্লাউড থেকে ডেটা রিস্টোর
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            আপনি যখন নতুন কোনো খাবার যোগ করেন বা পরিবর্তন করেন, তা ব্যাকগ্রাউন্ডে ক্লাউডে সেভ হয়। অন্য হোস্টিংয়ে ফাইল স্থানান্তর করলে নিচের বাটনগুলোর সাহায্যে সম্পূর্ণ সিঙ্ক নিশ্চিত করতে পারেন:
          </p>

          <div className="space-y-3 pt-2">
            {/* Push Button */}
            <button
              type="button"
              disabled={isLoading}
              onClick={handlePushToCloud}
              className="w-full p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-950 flex items-center justify-between transition-all cursor-pointer shadow-2xs group"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm">
                    {language === 'en' ? 'Push All Data to Cloud Firestore' : 'ক্লাউড ফায়ারবেসে সব পণ্য সংরক্ষণ করুন (Push)'}
                  </h4>
                  <p className="text-[11px] text-emerald-800/80">
                    বর্তমান সকল খাদ্যসামগ্রী, ক্যাটাগরি ও কনফিগ ক্লাউডে ব্যাকআপ রাখে
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition-transform">
                সংরক্ষণ →
              </span>
            </button>

            {/* Pull Button */}
            <button
              type="button"
              disabled={isLoading}
              onClick={handlePullFromCloud}
              className="w-full p-4 rounded-xl border border-teal-200 bg-teal-50/70 hover:bg-teal-100/70 text-teal-950 flex items-center justify-between transition-all cursor-pointer shadow-2xs group"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <DownloadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm">
                    {language === 'en' ? 'Restore All Data from Cloud Firestore' : 'ক্লাউড থেকে ডেটা রিস্টোর করুন (Pull / Sync)'}
                  </h4>
                  <p className="text-[11px] text-teal-800/80">
                    অন্য ডিভাইসে ডিপ্লয় করার পর ক্লাউডের পূর্বের সব খাবার লোড করে
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-teal-700 group-hover:translate-x-1 transition-transform">
                রিস্টোর →
              </span>
            </button>
          </div>
        </div>

        {/* Panel 2: Offline JSON Backup & Restore */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Database className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {language === 'en' ? 'Offline JSON Backup & Restore' : 'অফলাইন JSON ফাইল ব্যাকআপ ও রিস্টোর'}
              </h3>
              <p className="text-[11px] text-slate-500">
                আপনার পুরো ডেটাবেস কম্পিউটারে সেভ রাখুন এবং যেকোনো সময় আপলোড করুন
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            ক্লাউড সুরক্ষার পাশাপাশি আপনার ডিভাইসে সম্পূর্ণ ডেটাবেসের একটি ব্যাকআপ ফাইল ডাউনলোড করে রাখতে পারেন:
          </p>

          <div className="space-y-3 pt-2">
            {/* Download Backup */}
            <button
              type="button"
              onClick={handleExportBackup}
              className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 flex items-center justify-between transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-9 h-9 rounded-lg bg-slate-700 text-white flex items-center justify-center shrink-0">
                  <FileDown className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs">
                    {language === 'en' ? 'Download JSON Backup File' : 'সম্পূর্ণ ব্যাকআপ ফাইল ডাউনলোড করুন (.json)'}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    সকল পণ্য, কুপন, ডেলিভারি জোন ও সেটিংস সমৃদ্ধ ফাইল
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-700">ডাউনলোড</span>
            </button>

            {/* Upload / Restore Backup */}
            <div className="p-3.5 rounded-xl border border-dashed border-slate-300 bg-white space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                {language === 'en' ? 'Upload Backup JSON File to Restore' : 'ব্যাকআপ ফাইল আপলোড করে রিস্টোর করুন:'}
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
              />
              {importFileJson && (
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-700 font-semibold truncate max-w-xs">
                    ✓ ফাইল নির্বাচিত: {importFileName}
                  </span>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleExecuteImport}
                    className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                  >
                    {isLoading ? 'রিস্টোর হচ্ছে...' : 'রিস্টোর কার্যকর করুন'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Explanatory Info Card */}
      <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-5 space-y-2">
        <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>ক্রস-ডিপ্লয়মেন্ট ও ডেটা স্থায়িত্ব নির্দেশিকা (Persistence Architecture)</span>
        </div>
        <p className="text-slate-600 text-xs leading-relaxed">
          • <strong>Firebase Firestore প্রজেক্ট:</strong> এই অ্যাপ্লিকেশনটির সাথে <code className="bg-emerald-100 px-1 py-0.5 rounded text-emerald-900 font-mono">r-mart-7897a</code> ক্লাউড ডাটাবেস স্থায়ীভাবে সংযুক্ত রয়েছে।<br />
          • <strong>স্বয়ংক্রিয় সিঙ্ক্রোনাইজেশন:</strong> আপনি অ্যাডমিন প্যানেল থেকে যেকোনো খাবার যোগ, পরিবর্তন বা মুছে ফেললে তা ক্লাউডে স্থায়ী হয়।<br />
          • <strong>অন্য কোথাও ডিপ্লয় করলে:</strong> কোডটি গিটহাবে পুশ করে অন্য হোস্টিং বা সার্ভারে ডিপ্লয় করলেও একই ফায়ারবেস কনফিগারেশন থাকলে স্বয়ংক্রিয়ভাবে ক্লাউড থেকে পূর্বের সকল খাবার লোড হবে। নতুন করে পুনরায় কোনো খাবার এন্ট্রি করতে হবে না।
        </p>
      </div>
    </div>
  );
};
