import React, { useState } from 'react';
import { Lock, X, KeyRound, AlertCircle, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api.ts';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string, userName: string) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [password, setPassword] = useState('ghorer2026');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await api.adminLogin(password);
      if (res.success && res.token) {
        onLoginSuccess(res.token, res.user?.name || 'Joynob Islam Kakoly');
        onClose();
      } else {
        setErrorMsg(res.message || 'ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।');
      }
    } catch {
      setErrorMsg('লগইন ব্যর্থ হয়েছে। সার্ভার সংযোগ চেক করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-left relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6 space-y-2">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            অ্যাডমিন প্যানেল প্রবেশ
          </h3>
          <p className="text-xs text-slate-500">
            ঘরের স্বাদ ব্যবসা ব্যবস্থাপনা ও কিচেন কন্ট্রোল
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              সিকিউরিটি পাসওয়ার্ড
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="পাসওয়ার্ড দিন..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
              />
            </div>
            <div className="mt-2 p-2 bg-slate-50 rounded-lg text-[11px] text-slate-500 flex items-center justify-between">
              <span>ডেমো পাসওয়ার্ড: <strong className="font-mono text-slate-800">ghorer2026</strong></span>
              <button
                type="button"
                onClick={() => setPassword('ghorer2026')}
                className="text-emerald-700 font-semibold hover:underline"
              >
                ব্যবহার করুন
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
          >
            {isLoading ? 'যাচাই হচ্ছে...' : 'লগইন করুন'}
          </button>
        </form>
      </div>
    </div>
  );
};
