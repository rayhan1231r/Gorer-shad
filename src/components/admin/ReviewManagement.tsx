import React, { useState, useEffect } from 'react';
import {
  Star,
  CheckCircle,
  EyeOff,
  Trash2,
  AlertTriangle,
  Search,
  ShieldCheck,
  RefreshCw,
  MessageSquare,
  ThumbsUp,
  Filter
} from 'lucide-react';
import { CustomerReview } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface ReviewManagementProps {
  onRefreshStats?: () => void;
}

export const ReviewManagement: React.FC<ReviewManagementProps> = ({ onRefreshStats }) => {
  const { language } = useLanguage();
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'hidden' | 'reported'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const data = await api.getReviews(true);
      setReviews(data);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleStatusChange = async (id: string, newStatus: 'approved' | 'hidden' | 'pending') => {
    try {
      await api.updateReviewStatus(id, newStatus);
      setReviews(prev =>
        prev.map(r => (r.id === id ? { ...r, approvedStatus: newStatus, isApproved: newStatus === 'approved' } : r))
      );
      setActionNotice(
        newStatus === 'approved'
          ? 'রিভিউ সফলভাবে অনুমোদিত হয়েছে।'
          : newStatus === 'hidden'
          ? 'রিভিউ হাইড / লুকানো হয়েছে।'
          : 'রিভিউ পেন্ডিং করা হয়েছে।'
      );
      setTimeout(() => setActionNotice(null), 3000);
      if (onRefreshStats) onRefreshStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveReport = async (id: string) => {
    try {
      await api.resolveReportReview(id);
      setReviews(prev =>
        prev.map(r => (r.id === id ? { ...r, isReported: false, reportReason: undefined } : r))
      );
      setActionNotice('রিপোর্টের সমাধান সম্পন্ন হয়েছে।');
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteReview(id);
      setReviews(prev => prev.filter(r => r.id !== id));
      setActionNotice('রিভিউ মুছে ফেলা হয়েছে।');
      setTimeout(() => setActionNotice(null), 3000);
      if (onRefreshStats) onRefreshStats();
    } catch (err) {
      console.error(err);
    }
  };

  // Metrics
  const totalReviews = reviews.length;
  const approvedCount = reviews.filter(r => r.isApproved && !r.isReported).length;
  const hiddenCount = reviews.filter(r => r.approvedStatus === 'hidden' || (!r.isApproved && !r.isReported)).length;
  const reportedCount = reviews.filter(r => r.isReported).length;
  const avgRating = totalReviews > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1) : '5.0';

  // Filtered reviews
  const filtered = reviews.filter(r => {
    // Status filter
    if (filterStatus === 'approved' && (!r.isApproved || r.isReported)) return false;
    if (filterStatus === 'hidden' && (r.isApproved || r.isReported)) return false;
    if (filterStatus === 'reported' && !r.isReported) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = (r.customerDisplayName || r.customerName || '').toLowerCase().includes(q);
      const matchFood = (r.foodNameBn || '').toLowerCase().includes(q);
      const matchComment = (r.comment || '').toLowerCase().includes(q);
      const matchEmail = (r.customerEmail || '').toLowerCase().includes(q);
      return matchName || matchFood || matchComment || matchEmail;
    }

    return true;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-700" />
            <span>{language === 'en' ? 'Customer Product Reviews & Moderation' : 'গ্রাহক রিভিউ ও মডারেশন ব্যবস্থাপনা'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'en'
              ? 'Approve, hide, report or delete customer food reviews. Real customer feedback with verified purchase status.'
              : 'গ্রাহকদের রিভিউ অনুমোদন, হাইড, রিপোর্ট চেক এবং ডিলিট করুন। প্রতিটি রিভিউয়ের সত্যতা যাচাই করুন।'}
          </p>
        </div>

        <button
          onClick={loadReviews}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{language === 'en' ? 'Refresh' : 'রিফ্রেশ'}</span>
        </button>
      </div>

      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">মোট রিভিউ</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{totalReviews}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-emerald-700 font-medium block">অনুমোদিত (Live)</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">{approvedCount}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">লুকানো (Hidden)</span>
          <span className="text-2xl font-bold text-slate-600 mt-1 block">{hiddenCount}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-2xs">
          <span className="text-xs text-rose-700 font-medium block">রিপোর্টকৃত (Reported)</span>
          <span className="text-2xl font-bold text-rose-700 mt-1 block">{reportedCount}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-xs text-amber-700 font-medium block">গড় রেটিং</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-2xl font-bold text-amber-900">{avgRating}</span>
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {[
            { id: 'all', label: 'সকল রিভিউ', count: totalReviews },
            { id: 'approved', label: 'অনুমোদিত', count: approvedCount },
            { id: 'hidden', label: 'লুকানো', count: hiddenCount },
            { id: 'reported', label: 'রিপোর্টকৃত', count: reportedCount },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="খাবারের নাম বা গ্রাহক খুঁজুন..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
          />
        </div>
      </div>

      {/* Reviews Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 text-xs">রিভিউ লোড হচ্ছে...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">কোনো রিভিউ পাওয়া যায়নি</p>
            <p className="text-xs text-slate-400">এই ফিল্টারে বর্তমানে কোনো গ্রাহক রিভিউ নেই।</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(rev => (
              <div key={rev.id} className="p-5 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Content */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {rev.customerDisplayName || rev.customerName || 'গ্রাহক'}
                    </span>
                    {rev.customerEmail && (
                      <span className="text-xs text-slate-400">({rev.customerEmail})</span>
                    )}

                    {rev.isVerifiedPurchase && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        যাচাইকৃত ক্রেতা (Verified)
                      </span>
                    )}

                    {/* Status badge */}
                    {rev.isReported ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        রিপোর্টকৃত ({rev.reportReason || 'আপত্তিকর'})
                      </span>
                    ) : rev.isApproved ? (
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        লাইভ / অনুমোদিত
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                        লুকানো / হাইড
                      </span>
                    )}
                  </div>

                  {/* Rating Stars & Food item */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-amber-500">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${star <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                        />
                      ))}
                    </div>
                    {rev.foodNameBn && (
                      <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        খাবার: {rev.foodNameBn}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400">
                      {new Date(rev.createdAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  {/* Comment */}
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    "{rev.comment}"
                  </p>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                  {rev.isReported && (
                    <button
                      type="button"
                      onClick={() => handleResolveReport(rev.id)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                    >
                      রিপোর্ট সমাধান করুন
                    </button>
                  )}

                  {!rev.isApproved ? (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(rev.id, 'approved')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>অনুমোদন করুন</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(rev.id, 'hidden')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>হাইড করুন</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(rev.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 hover:border-rose-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>মুছে ফেলুন</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
