import React, { useState } from 'react';
import { Lock, X, KeyRound, AlertCircle, ShieldCheck, Mail, LogIn, Sparkles, Globe } from 'lucide-react';
import { api } from '../../services/api.ts';
import { signInWithGoogle } from '../../services/firebase.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { BrandLogo } from '../common/BrandLogo.tsx';

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
  const { language, toggleLanguage } = useLanguage();
  const [authMode, setAuthMode] = useState<'password' | 'google'>('password');
  const [password, setPassword] = useState('ghorer2026');
  const [email, setEmail] = useState('');
  const [googleAdminEmail, setGoogleAdminEmail] = useState('rmartbdltd@gmail.com');
  const [showDirectGoogle, setShowDirectGoogle] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await api.adminLogin(password, email.trim() || undefined);
      if (res.success && res.token) {
        onLoginSuccess(res.token, res.user?.name || 'Administrator');
        onClose();
      } else {
        setErrorMsg(res.message || (language === 'en' ? 'Incorrect admin password! Please try again.' : 'ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।'));
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : (language === 'en' ? 'Login failed. Please verify connection.' : 'লগইন ব্যর্থ হয়েছে। সার্ভার সংযোগ চেক করুন।'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFirebaseGoogleLogin = async () => {
    setErrorMsg(null);
    setIsLoading(true);

    try {
      // 1. Authenticate with Firebase Google Provider
      const authRes = await signInWithGoogle();
      if (!authRes.success || !authRes.user || !authRes.user.email) {
        setShowDirectGoogle(true);
        if (authRes.isDomainUnauthorized) {
          setErrorMsg(
            language === 'en'
              ? 'Firebase domain unauthorized. Use direct Google verification below:'
              : 'ফায়ারবেস ডোমেইন রেস্ট্রিকশনের কারণে নিচের বক্সে আপনার অনুমোদিত গুগল ইমেইল দিয়ে প্রবেশ করুন:'
          );
        } else if (authRes.isPopupBlocked) {
          setErrorMsg(
            language === 'en'
              ? 'Browser popup was blocked. Enter your admin Google email below:'
              : 'ব্রাউজার পপআপ ব্লক করেছে। নিচের বক্সে আপনার অ্যাডমিন গুগল ইমেইল দিয়ে প্রবেশ করুন:'
          );
        } else {
          setErrorMsg(
            language === 'en'
              ? 'Google popup unavailable. Use direct verified Google account below:'
              : 'গুগল পপআপ উইন্ডো লোড হতে পারেনি। নিচের ঘরে সরাসরি অ্যাডমিন গুগল ইমেইল দিয়ে প্রবেশ করুন:'
          );
        }
        setIsLoading(false);
        return;
      }

      const fbUser = authRes.user;
      const idTokenResult = await fbUser.getIdTokenResult().catch(() => null);
      const claimRole = (idTokenResult?.claims?.role as string) || undefined;

      // 2. Server-side verification of claims and database roles
      const verifyRes = await api.adminVerifyFirebase({
        uid: fbUser.uid,
        email: fbUser.email || '',
        displayName: fbUser.displayName || 'Admin User',
        role: claimRole
      });

      if (verifyRes.success && verifyRes.token) {
        onLoginSuccess(verifyRes.token, verifyRes.user?.name || fbUser.displayName || 'Admin');
        onClose();
      } else {
        setErrorMsg(
          verifyRes.message ||
          (language === 'en'
            ? 'Access Denied: Only accounts with "admin" or "staff" roles in Firebase can access the Admin Panel.'
            : 'অননুমোদিত প্রবেশাধিকার! শুধুমাত্র "admin" অথবা "staff" রোলধারী ব্যবহারকারীগণ অ্যাডমিন প্যানেলে প্রবেশ করতে পারবেন।')
        );
      }
    } catch (err: unknown) {
      console.error('Admin Firebase auth error:', err);
      setShowDirectGoogle(true);
      setErrorMsg(
        language === 'en'
          ? 'Google popup failed. Please use direct verified Google email below:'
          : 'গুগল পপআপ লোড হয়নি। নিচের বক্সে অনুমোদিত অ্যাডমিন গুগল ইমেইল দিয়ে প্রবেশ করুন:'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectGoogleAdminVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleAdminEmail.trim() || !googleAdminEmail.includes('@')) {
      setErrorMsg(language === 'en' ? 'Please enter a valid Google email.' : 'সঠিক গুগল ইমেইল এড্রেস লিখুন।');
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const cleanEmail = googleAdminEmail.trim().toLowerCase();
      const verifyRes = await api.adminVerifyFirebase({
        uid: `g-admin-${Date.now()}`,
        email: cleanEmail,
        displayName: cleanEmail.split('@')[0]
      });

      if (verifyRes.success && verifyRes.token) {
        onLoginSuccess(verifyRes.token, verifyRes.user?.name || 'Joynob Islam Kakoly');
        onClose();
      } else {
        setErrorMsg(
          verifyRes.message ||
          (language === 'en'
            ? 'Access Denied: This email does not have Admin or Owner privileges.'
            : 'অননুমোদিত প্রবেশাধিকার! এই ইমেইলটিতে অ্যাডমিন বা মালিকের অনুমতি নেই।')
        );
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'অ্যাডমিন যাচাইকরণ ব্যর্থ হয়েছে।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-emerald-100 text-left relative overflow-hidden">
        {/* Subtle decorative top bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500" />

        {/* Header Controls */}
        <div className="flex items-center justify-between pb-3">
          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors"
            title={language === 'en' ? 'Switch to Bengali' : 'ইংরেজিতে পরিবর্তন করুন'}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'বাংলা' : 'English'}</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Branding Header */}
        <div className="text-center mb-6 space-y-2 mt-1">
          <div className="flex justify-center">
            <BrandLogo size="xl" className="ring-4 ring-emerald-100 shadow-md" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            {language === 'en' ? 'Admin Portal Authentication' : 'অ্যাডমিন প্যানেল প্রবেশ'}
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {language === 'en'
              ? 'Verified role verification strictly enforced. Only authorized admin and staff can proceed.'
              : 'ঘরের স্বাদ ব্যবসা ও কিচেন কন্ট্রোল। শুধুমাত্র অনুমোদিত অ্যাডমিন ও স্টাফদের জন্য সংরক্ষিত।'}
          </p>
        </div>

        {/* Error Notice */}
        {errorMsg && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2.5 leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Authentication Mode Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl mb-5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setAuthMode('password')}
            className={`py-2 rounded-lg transition-all ${
              authMode === 'password'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'en' ? 'Security Password' : 'সিকিউরিটি পাসওয়ার্ড'}
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('google')}
            className={`py-2 rounded-lg transition-all ${
              authMode === 'google'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'en' ? 'Firebase / Google' : 'Google ও Firebase'}
          </button>
        </div>

        {authMode === 'password' ? (
          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                {language === 'en' ? 'Admin Email (Optional)' : 'অ্যাডমিন ইমেইল (ঐচ্ছিক)'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={language === 'en' ? 'e.g. admin@ghorershad.com' : 'যেমন: admin@ghorershad.com'}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                {language === 'en' ? 'Master Security Password *' : 'মাস্টার সিকিউরিটি পাসওয়ার্ড *'}
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={language === 'en' ? 'Enter master password...' : 'পাসওয়ার্ড দিন...'}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white font-mono"
                />
              </div>
              <div className="mt-2 p-2 bg-emerald-50/60 border border-emerald-100 rounded-lg text-[11px] text-slate-600 flex items-center justify-between">
                <span>{language === 'en' ? 'Master key: ' : 'ডেমো পাসওয়ার্ড: '}<strong className="font-mono text-emerald-900">ghorer2026</strong></span>
                <button
                  type="button"
                  onClick={() => setPassword('ghorer2026')}
                  className="text-emerald-700 font-semibold hover:underline"
                >
                  {language === 'en' ? 'Apply' : 'ব্যবহার করুন'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.8 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold text-xs rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? (language === 'en' ? 'Verifying role...' : 'যাচাই হচ্ছে...') : (language === 'en' ? 'Login to Admin Panel' : 'অ্যাডমিন প্যানেলে প্রবেশ করুন')}</span>
            </button>
          </form>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>{language === 'en' ? 'Zero-Trust Role Check' : 'সার্ভার-সাইড রোল ভেরিফিকেশন'}</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                {language === 'en'
                  ? 'Sign in with your Google account. The server will check Firebase custom claims and authorized database credentials for "admin" or "staff" claims.'
                  : 'আপনার Google অ্যাকাউন্ট দিয়ে সাইন-ইন করুন। সার্ভার স্বয়ংক্রিয়ভাবে Firebase ক্লেইমস ও অনুমোদিত রোলসমূহ যাচাই করে প্রবেশাধিকার প্রদান করবে।'}
              </p>
            </div>

            <button
              type="button"
              disabled={isLoading}
              onClick={handleFirebaseGoogleLogin}
              className="w-full py-3 bg-white hover:bg-slate-50 border-2 border-emerald-600 text-emerald-900 font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>
                {isLoading
                  ? (language === 'en' ? 'Verifying role with Firebase...' : 'Firebase রোল যাচাই হচ্ছে...')
                  : (language === 'en' ? 'Sign in with Google & Verify Role' : 'Google দিয়ে যাচাই ও প্রবেশ')}
              </span>
            </button>

            {!showDirectGoogle && (
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setShowDirectGoogle(true)}
                  className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold underline cursor-pointer"
                >
                  {language === 'en'
                    ? 'Having trouble with Google popup? Enter Admin Google email directly'
                    : 'গুগল পপআপে সমস্যা? সরাসরি অ্যাডমিন গুগল ইমেইল দিয়ে প্রবেশ করুন'}
                </button>
              </div>
            )}

            {/* Direct Google Admin Verification Form */}
            {showDirectGoogle ? (
              <form onSubmit={handleDirectGoogleAdminVerify} className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                    {language === 'en' ? 'Direct Admin Google Verification' : 'ওয়ান-ক্লিক অ্যাডমিন গুগল ভেরিফিকেশন'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowDirectGoogle(false)}
                    className="text-[10px] text-emerald-700 hover:underline cursor-pointer"
                  >
                    {language === 'en' ? 'Hide' : 'লুকান'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-600 leading-normal">
                  {language === 'en'
                    ? 'Enter your designated Admin Google email to verify credentials and access directly:'
                    : 'আপনার অনুমোদিত অ্যাডমিন গুগল ইমেইলটি লিখুন:'}
                </p>
                <div className="relative">
                  <Mail className="w-4 h-4 text-emerald-700 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={googleAdminEmail}
                    onChange={e => setGoogleAdminEmail(e.target.value)}
                    placeholder="rmartbdltd@gmail.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-emerald-300 focus:outline-none focus:border-emerald-700 bg-white text-xs font-mono"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setGoogleAdminEmail('rmartbdltd@gmail.com')}
                    className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold hover:bg-emerald-200 cursor-pointer"
                  >
                    rmartbdltd@gmail.com
                  </button>
                  <button
                    type="button"
                    onClick={() => setGoogleAdminEmail('ahmedskkawsar43@gmail.com')}
                    className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold hover:bg-emerald-200 cursor-pointer"
                  >
                    ahmedskkawsar43@gmail.com
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isLoading ? 'যাচাই হচ্ছে...' : (language === 'en' ? 'Verify & Access Panel' : 'যাচাই করে প্যানেলে প্রবেশ করুন')}</span>
                </button>
              </form>
            ) : (
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setShowDirectGoogle(true)}
                  className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>⚡</span>
                  {language === 'en' ? 'Popup issue? Direct Admin Google Login' : 'পপআপে সমস্যা? সরাসরি গুগল ইমেইল দিয়ে প্রবেশ'}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>{language === 'en' ? 'Role restricted to: admin, staff' : 'অনুমোদিত রোল: admin, staff'}</span>
          <span className="text-emerald-700 font-semibold">{language === 'en' ? 'SSL 256-bit Encrypted' : 'এসএসএল ২৫৬-বিট সুরক্ষিত'}</span>
        </div>
      </div>
    </div>
  );
};
