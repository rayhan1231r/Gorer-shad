import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { signInWithGoogle } from '../../services/firebase.ts';
import { AppUser } from '../../types/index.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: AppUser) => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'verify_otp'>(initialMode);

  // Form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // OTP state
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [cooldownSeconds, setCooldownSeconds] = useState(60);
  const [expiresSeconds, setExpiresSeconds] = useState(300);
  const [debugNotice, setDebugNotice] = useState<string | null>(null);

  // Status state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // OTP Input references
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialMode]);

  // Cooldown & expiration timers
  useEffect(() => {
    if (mode !== 'verify_otp') return;

    const interval = setInterval(() => {
      setCooldownSeconds(prev => (prev > 0 ? prev - 1 : 0));
      setExpiresSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [mode]);

  if (!isOpen) return null;

  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric digit
    const cleaned = value.replace(/[^0-9]/g, '').slice(-1);
    const updated = [...otpDigits];
    updated[index] = cleaned;
    setOtpDigits(updated);

    // Auto-advance focus
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePasteOtp = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!paste) return;
    const digits = paste.split('');
    const updated = [...otpDigits];
    digits.forEach((d, i) => {
      if (i < 6) updated[i] = d;
    });
    setOtpDigits(updated);
    const nextIndex = Math.min(digits.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  // Submit Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await api.login(email.trim(), password);
      if (res.user) {
        onAuthSuccess(res.user);
        onClose();
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'লগইন ব্যর্থ হয়েছে।');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Signup Request (Triggers SMTP OTP)
  const handleSignupRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg('পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মেলেনি।');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('পাসওয়ার্ড ন্যূনতম ৬ অক্ষরের হতে হবে।');
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.signupRequest({
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword,
      });

      if (res.success) {
        setMaskedEmail(res.maskedEmail);
        setCooldownSeconds(res.cooldownSeconds || 60);
        setExpiresSeconds(300);
        setOtpDigits(['', '', '', '', '', '']);
        setDebugNotice(res.debugNotice || null);
        setMode('verify_otp');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'ওটিপি পাঠাতে সমস্যা হয়েছে।');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit OTP Verification
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otpDigits.join('');
    if (otpCode.length !== 6) {
      setErrorMsg('সম্পূর্ণ ৬-সংখ্যার ওটিপি কোডটি লিখুন।');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await api.signupVerify(email.trim(), otpCode);
      if (res.success && res.user) {
        setSuccessMsg('আপনার একাউন্ট সফলভাবে যাচাইকৃত ও সক্রিয় হয়েছে!');
        setTimeout(() => {
          onAuthSuccess(res.user!);
          onClose();
        }, 1200);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'ওটিপি যাচাইকরণ ব্যর্থ হয়েছে।');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (cooldownSeconds > 0) return;
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await api.resendOtp(email.trim());
      if (res.success) {
        setCooldownSeconds(60);
        setExpiresSeconds(300);
        setOtpDigits(['', '', '', '', '', '']);
        if (res.debugNotice) setDebugNotice(res.debugNotice);
        setSuccessMsg('নতুন ওটিপি কোড পাঠানো হয়েছে।');
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'ওটিপি পুনরায় পাঠাতে ব্যর্থ হয়েছে।');
    } finally {
      setIsLoading(false);
    }
  };

  // Google Login via Firebase
  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const fbUser = await signInWithGoogle();
      if (!fbUser || !fbUser.email) {
        throw new Error('Google থেকে ইমেইল পাওয়া যায়নি।');
      }

      const syncRes = await api.googleAuthSync({
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName || undefined,
        photoURL: fbUser.photoURL || undefined,
      });

      if (syncRes.user) {
        onAuthSuccess(syncRes.user);
        onClose();
      }
    } catch (err: unknown) {
      console.error('Google Sign In Error:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Google সাইন-ইন সম্পন্ন করা যায়নি।');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-left relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6 space-y-1.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
            {mode === 'verify_otp' ? (
              <ShieldCheck className="w-6 h-6 text-emerald-700" />
            ) : (
              <User className="w-6 h-6 text-emerald-700" />
            )}
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            {mode === 'login' && 'গ্রাহক অ্যাকাউন্টে লগইন'}
            {mode === 'signup' && 'নতুন গ্রাহক অ্যাকাউন্ট তৈরি'}
            {mode === 'verify_otp' && 'ইমেইল ওটিপি (OTP) যাচাইকরণ'}
          </h3>
          <p className="text-xs text-slate-500">
            {mode === 'verify_otp'
              ? `${maskedEmail} ঠিকানায় ৬-সংখ্যার ওটিপি পাঠানো হয়েছে`
              : 'ঘরের স্বাদ • খাঁটি ঘরোয়া খাবারের নিশ্চয়তা'}
          </p>
        </div>

        {/* Feedback messages */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {debugNotice && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl">
            <span className="font-semibold">{debugNotice}</span>
          </div>
        )}

        {/* ---------------- 1. LOGIN MODE ---------------- */}
        {mode === 'login' && (
          <div className="space-y-4 text-xs">
            {/* Google Sign-in Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-200 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-2xs cursor-pointer"
            >
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
              <span>Google দিয়ে সহজে লগইন করুন</span>
            </button>

            <div className="flex items-center gap-3 my-3">
              <div className="h-px bg-slate-200 flex-1" />
              <span className="text-[11px] text-slate-400 font-medium">অথবা ইমেইল দিয়ে</span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>

            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">ইমেইল ঠিকানা</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">পাসওয়ার্ড</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="আপনার পাসওয়ার্ড..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>যাচাই হচ্ছে...</span>
                  </>
                ) : (
                  <span>লগইন করুন</span>
                )}
              </button>
            </form>

            <div className="pt-2 text-center text-slate-500">
              <span>অ্যাকাউন্ট নেই? </span>
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setMode('signup');
                }}
                className="text-emerald-700 font-bold hover:underline cursor-pointer"
              >
                নতুন অ্যাকাউন্ট খুলুন
              </button>
            </div>
          </div>
        )}

        {/* ---------------- 2. SIGNUP MODE ---------------- */}
        {mode === 'signup' && (
          <div className="space-y-4 text-xs">
            {/* Google Sign-in Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-200 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-2xs cursor-pointer"
            >
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
              <span>Google দিয়ে এক ক্লিকে রেজিস্ট্রেশন</span>
            </button>

            <div className="flex items-center gap-3 my-3">
              <div className="h-px bg-slate-200 flex-1" />
              <span className="text-[11px] text-slate-400 font-medium">অথবা ওটিপি ভেরিফিকেশন সহ</span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>

            <form onSubmit={handleSignupRequest} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">আপনার পূর্ণ নাম</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="যেমন: তানভীর আহমেদ"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">ইমেইল ঠিকানা</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  এই ইমেইলে ৬-সংখ্যার ওটিপি যাচাই কোড পাঠানো হবে।
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">পাসওয়ার্ড</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="কমপক্ষে ৬ অক্ষর"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">পাসওয়ার্ড নিশ্চিত করুন</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="একই পাসওয়ার্ড দিন"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>ওটিপি কোড পাঠানো হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <span>ওটিপি কোড পাঠান ও এগিয়ে যান</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center text-slate-500">
              <span>ইতিমধ্যে অ্যাকাউন্ট আছে? </span>
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setMode('login');
                }}
                className="text-emerald-700 font-bold hover:underline cursor-pointer"
              >
                লগইন করুন
              </button>
            </div>
          </div>
        )}

        {/* ---------------- 3. VERIFY OTP MODE ---------------- */}
        {mode === 'verify_otp' && (
          <div className="space-y-5 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <span className="text-slate-600 block">
                ভেরিফিকেশন কোড পাঠানো হয়েছে:
              </span>
              <strong className="text-slate-900 font-mono text-sm block mt-0.5">
                {maskedEmail}
              </strong>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {/* 6-Digit Numeric OTP Inputs */}
              <div>
                <label className="font-semibold text-slate-700 block text-center mb-3">
                  ৬-সংখ্যার কোডটি প্রবেশ করান:
                </label>
                <div className="flex items-center justify-center gap-2 sm:gap-2.5" onPaste={handlePasteOtp}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => {
                        inputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleDigitChange(idx, e.target.value)}
                      onKeyDown={e => handleKeyDown(idx, e)}
                      className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono rounded-xl border-2 border-slate-200 focus:border-emerald-600 focus:outline-none bg-white text-slate-900 shadow-2xs"
                    />
                  ))}
                </div>
              </div>

              {/* Expiration Timer & Resend */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-1">
                <span>
                  মেয়াদ বাকি: <strong className="font-mono text-emerald-800">{formatTimer(expiresSeconds)}</strong>
                </span>

                {cooldownSeconds > 0 ? (
                  <span>পুনরায় পাঠানো যাবে: {cooldownSeconds} সে. পর</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    আবার কোড পাঠান (Resend)
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || otpDigits.join('').length !== 6 || expiresSeconds === 0}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>যাচাই হচ্ছে...</span>
                  </>
                ) : (
                  <span>ওটিপি যাচাই করে অ্যাকাউন্ট চালু করুন</span>
                )}
              </button>
            </form>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setMode('signup');
                }}
                className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                ইমেইল ঠিকানা পরিবর্তন করুন
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
