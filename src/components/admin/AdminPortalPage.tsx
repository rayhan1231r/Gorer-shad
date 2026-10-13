import React, { useState } from 'react';
import {
  ShieldAlert,
  Lock,
  Mail,
  KeyRound,
  AlertCircle,
  LogIn,
  RefreshCw,
  ArrowLeft,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { BusinessConfig, AppUser } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { signInWithGoogle, signOutFirebase } from '../../services/firebase.ts';
import { AdminLayout } from './AdminLayout.tsx';
import { BrandLogo } from '../common/BrandLogo.tsx';

interface AdminPortalPageProps {
  config: BusinessConfig;
  currentUser: AppUser | null;
  isAdminLoggedIn: boolean;
  adminUserName: string;
  onLoginSuccess: (token: string, userName: string) => void;
  onRefreshConfig: () => void;
  onExitAdmin: () => void;
  onLogout: () => void;
}

export const AdminPortalPage: React.FC<AdminPortalPageProps> = ({
  config,
  currentUser,
  isAdminLoggedIn,
  adminUserName,
  onLoginSuccess,
  onRefreshConfig,
  onExitAdmin,
  onLogout
}) => {
  const [authMode, setAuthMode] = useState<'password' | 'google'>('password');
  const [password, setPassword] = useState('ghorer2026');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Authorized Admin: Render Full Admin Layout
  const isElevated = currentUser && ['owner', 'admin', 'subadmin', 'staff'].includes(currentUser.role);
  if (isElevated && isAdminLoggedIn) {
    return (
      <AdminLayout
        config={config}
        onRefreshConfig={onRefreshConfig}
        onExitAdmin={onExitAdmin}
        onLogout={onLogout}
        adminUserName={adminUserName}
      />
    );
  }

  // 2. Authenticated but Unauthorized (Normal customer): Show Strict Access Denied
  if (currentUser && !isElevated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-100">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
              403 • Access Denied
            </span>
            <h2 className="text-xl font-bold text-white mt-2">অননুমোদিত প্রবেশাধিকার</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              আপনি বর্তমানে <strong className="text-slate-200">{currentUser.email}</strong> গ্রাহক একাউন্ট হিসেবে লগইন আছেন। এই অ্যাকাউন্টে অ্যাডমিন প্যানেল অ্যাক্সেসের অনুমতি নেই।
            </p>
          </div>

          <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60 text-left text-xs text-slate-400 space-y-1">
            <p className="text-slate-300 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              প্রবেশের জন্য প্রয়োজনীয়:
            </p>
            <p className="text-[11px] leading-relaxed">
              শুধুমাত্র অনুমোদিত অ্যাডমিনিস্ট্রেটর জিমেইল (যেমন: <span className="font-mono text-emerald-400">rmartbdltd@gmail.com</span>, <span className="font-mono text-emerald-400">proxy6726@gmail.com</span>) দিয়ে প্রবেশ করতে পারবেন।
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3 text-xs font-semibold">
            <button
              onClick={async () => {
                try {
                  await signOutFirebase();
                } catch {}
                onLogout();
              }}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              লগআউট করে অ্যাডমিন জিমেইল দিয়ে সাইন ইন করুন
            </button>
            <button
              onClick={onExitAdmin}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>গ্রাহক ওয়েবসাইটে ফিরে যান</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Not Authenticated: Render Dedicated Admin Portal Login
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await api.adminLogin(password, email.trim() || undefined);
      if (res.success && res.token) {
        onLoginSuccess(res.token, res.user?.name || 'Administrator');
      } else {
        setErrorMsg(res.message || 'ভুল অ্যাডমিন পাসওয়ার্ড! আবার চেষ্টা করুন।');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'লগইন ব্যর্থ হয়েছে।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFirebaseGoogleLogin = async () => {
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const authRes = await signInWithGoogle();
      if (!authRes.success || !authRes.user || !authRes.user.email) {
        throw new Error(authRes.error || 'Google সাইন-ইন বাতিল হয়েছে অথবা ইমেইল পাওয়া যায়নি।');
      }

      const fbUser = authRes.user;
      const idTokenResult = await fbUser.getIdTokenResult().catch(() => null);
      const claimRole = (idTokenResult?.claims?.role as string) || undefined;

      const verifyRes = await api.adminVerifyFirebase({
        uid: fbUser.uid,
        email: fbUser.email || '',
        displayName: fbUser.displayName || 'Admin User',
        role: claimRole
      });

      if (verifyRes.success && verifyRes.token) {
        onLoginSuccess(verifyRes.token, verifyRes.user?.name || fbUser.displayName || 'Admin');
      } else {
        setErrorMsg(
          verifyRes.message ||
          'অননুমোদিত প্রবেশাধিকার! শুধুমাত্র "admin" অথবা "staff" রোলধারী ব্যবহারকারীগণ অ্যাডমিন প্যানেলে প্রবেশ করতে পারবেন।'
        );
      }
    } catch (err: unknown) {
      console.error('Admin Firebase auth error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(
        msg.includes('Access Denied') || msg.includes('অননুমোদিত')
          ? msg
          : 'Google লগইন যাচাইয়ে ব্যর্থ: ' + msg
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between p-4 text-slate-100">
      {/* Top back link */}
      <div className="max-w-md w-full mx-auto pt-4 flex justify-between items-center text-xs">
        <button
          onClick={onExitAdmin}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>গ্রাহক ওয়েবসাইটে ফিরে যান</span>
        </button>
        <span className="text-slate-500 font-mono text-[11px]">/admin portal</span>
      </div>

      {/* Login Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full mx-auto p-7 sm:p-8 shadow-2xl text-left relative overflow-hidden my-8">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500" />

        <div className="text-center mb-6 space-y-2">
          <div className="flex justify-center mb-1">
            <BrandLogo size="lg" className="ring-4 ring-emerald-500/20 shadow-md" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            অ্যাডমিন পোর্টাল লগইন
          </h2>
          <p className="text-xs text-slate-400">
            {config.brandNameBn} • সেন্ট্রাল ম্যানেজমেন্ট ড্যাশবোর্ড
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Tab switch: Google vs Master Password */}
        <div className="flex bg-slate-800/80 p-1 rounded-xl mb-5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setErrorMsg(null);
              setAuthMode('password');
            }}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              authMode === 'password'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>মাস্টার কী / পাসওয়ার্ড</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setErrorMsg(null);
              setAuthMode('google');
            }}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              authMode === 'google'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Google অ্যাডমিন জিমেইল</span>
          </button>
        </div>

        {authMode === 'password' ? (
          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">অ্যাডমিন ইমেইল (ঐচ্ছিক)</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="proxy6726@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">অ্যাডমিন পাসওয়ার্ড</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="অ্যাডমিন পাসওয়ার্ড..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                মাস্টার পাসওয়ার্ড: <span className="font-mono text-emerald-400">ghorer2026</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>যাচাই করা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>অ্যাডমিন প্যানেলে প্রবেশ করুন</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/80 text-slate-300 space-y-2 leading-relaxed">
              <p className="font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Firebase Google Admin Authentication:
              </p>
              <p className="text-[11px] text-slate-400">
                শুধুমাত্র অনুমোদিত অ্যাডমিন আইডি অথবা অ্যাডমিন জিমেইল (<span className="text-emerald-400 font-mono">proxy6726@gmail.com</span>, <span className="text-emerald-400 font-mono">ghorershad.arai@gmail.com</span>) দিয়ে সাইন-ইন করা যাবে।
              </p>
            </div>

            <button
              type="button"
              onClick={handleFirebaseGoogleLogin}
              disabled={isLoading}
              className="w-full py-3 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-600" />
                  <span>Google যাচাই হচ্ছে...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Google দিয়ে অ্যাডমিন প্রবেশ</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-500 pb-4">
        © 2026 {config.brandNameBn} • সুরক্ষিত অ্যাডমিন অঞ্চল (Protected Route)
      </div>
    </div>
  );
};
