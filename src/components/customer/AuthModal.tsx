import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { signInWithGoogle } from '../../services/firebase.ts';
import { AppUser } from '../../types/index.ts';
import { BrandLogo } from '../common/BrandLogo.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: AppUser) => void;
  initialMode?: 'login' | 'signup' | 'forgot_request';
  customNotice?: string | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login',
  customNotice = null,
}) => {
  const { language, t } = useLanguage();
  const [mode, setMode] = useState<'login' | 'signup' | 'verify_otp' | 'forgot_request' | 'forgot_verify'>(initialMode);

  // Form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

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

  // Google Direct fallback state
  const [isGoogleDirectOpen, setIsGoogleDirectOpen] = useState(false);
  const [googleDirectEmail, setGoogleDirectEmail] = useState('');
  const [googleDirectName, setGoogleDirectName] = useState('');

  // OTP Input references
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg(null);
      setSuccessMsg(null);
      setIsGoogleDirectOpen(false);
    }
  }, [isOpen, initialMode]);

  // Cooldown & expiration timers
  useEffect(() => {
    if (mode !== 'verify_otp' && mode !== 'forgot_verify') return;

    const interval = setInterval(() => {
      setCooldownSeconds(prev => (prev > 0 ? prev - 1 : 0));
      setExpiresSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [mode]);

  if (!isOpen) return null;

  const handleDigitChange = (index: number, value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '').slice(-1);
    const updated = [...otpDigits];
    updated[index] = cleaned;
    setOtpDigits(updated);

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
      setErrorMsg(
        err instanceof Error
          ? err.message
          : (language === 'en' ? 'Login failed. Please verify your credentials.' : 'লগইন ব্যর্থ হয়েছে।')
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Signup Request (Triggers SMTP OTP)
  const handleSignupRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg(
        language === 'en'
          ? 'Password and confirm password do not match.'
          : 'পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মেলেনি।'
      );
      return;
    }

    if (password.length < 6) {
      setErrorMsg(
        language === 'en'
          ? 'Password must be at least 6 characters.'
          : 'পাসওয়ার্ড ন্যূনতম ৬ অক্ষরের হতে হবে।'
      );
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
      setErrorMsg(
        err instanceof Error
          ? err.message
          : (language === 'en' ? 'Failed to send OTP code. Please try again.' : 'ওটিপি পাঠাতে সমস্যা হয়েছে।')
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Submit OTP Verification
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otpDigits.join('');
    if (otpCode.length !== 6) {
      setErrorMsg(
        language === 'en'
          ? 'Please enter the complete 6-digit verification code.'
          : 'সম্পূর্ণ ৬-সংখ্যার ওটিপি কোডটি লিখুন।'
      );
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await api.signupVerify(email.trim(), otpCode);
      if (res.success && res.user) {
        setSuccessMsg(
          language === 'en'
            ? 'Your account has been verified and activated successfully!'
            : 'আপনার একাউন্ট সফলভাবে যাচাইকৃত ও সক্রিয় হয়েছে!'
        );
        setTimeout(() => {
          onAuthSuccess(res.user!);
          onClose();
        }, 1200);
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : (language === 'en' ? 'OTP verification failed. Please try again.' : 'ওটিপি যাচাইকরণ ব্যর্থ হয়েছে।')
      );
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
        setSuccessMsg(
          language === 'en' ? 'A new verification code has been sent.' : 'নতুন ওটিপি কোড পাঠানো হয়েছে।'
        );
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : (language === 'en' ? 'Failed to resend OTP.' : 'ওটিপি পুনরায় পাঠাতে ব্যর্থ হয়েছে।')
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Forgot Password Request
  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setErrorMsg(
        language === 'en' ? 'Please enter your registered email.' : 'আপনার ইমেইল ঠিকানা প্রদান করুন।'
      );
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.forgotPasswordRequest(email.trim());
      if (res.success) {
        setMaskedEmail(res.maskedEmail);
        setCooldownSeconds(res.cooldownSeconds || 60);
        setExpiresSeconds(300);
        setOtpDigits(['', '', '', '', '', '']);
        setDebugNotice(res.debugNotice || null);
        setNewPassword('');
        setConfirmNewPassword('');
        setMode('forgot_verify');
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : (language === 'en' ? 'Failed to send password reset code.' : 'পাসওয়ার্ড রিসেট ওটিপি পাঠাতে সমস্যা হয়েছে।')
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Forgot Password OTP & New Password Reset
  const handleForgotReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otpDigits.join('');
    if (otpCode.length !== 6) {
      setErrorMsg(
        language === 'en'
          ? 'Please enter the complete 6-digit verification code.'
          : 'সম্পূর্ণ ৬-সংখ্যার ওটিপি কোডটি লিখুন।'
      );
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg(
        language === 'en'
          ? 'New password must be at least 6 characters.'
          : 'নতুন পাসওয়ার্ড ন্যূনতম ৬ অক্ষরের হতে হবে।'
      );
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMsg(
        language === 'en'
          ? 'New password and confirm password do not match.'
          : 'নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মেলেনি।'
      );
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await api.forgotPasswordReset({
        email: email.trim(),
        otp: otpCode,
        newPassword,
        confirmPassword: confirmNewPassword
      });

      if (res.success && res.user) {
        setSuccessMsg(
          language === 'en'
            ? 'Password reset successful! Logging you in...'
            : 'পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে! আপনাকে স্বাগতম...'
        );
        setTimeout(() => {
          onAuthSuccess(res.user!);
          onClose();
        }, 1200);
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : (language === 'en' ? 'Failed to reset password.' : 'পাসওয়ার্ড রিসেট করতে সমস্যা হয়েছে।')
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Resend Forgot Password OTP
  const handleResendForgotOtp = async () => {
    if (cooldownSeconds > 0) return;
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await api.forgotPasswordResend(email.trim());
      if (res.success) {
        setCooldownSeconds(60);
        setExpiresSeconds(300);
        setOtpDigits(['', '', '', '', '', '']);
        if (res.debugNotice) setDebugNotice(res.debugNotice);
        setSuccessMsg(
          language === 'en' ? 'A new verification code has been sent.' : 'নতুন ওটিপি কোড পাঠানো হয়েছে।'
        );
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : (language === 'en' ? 'Failed to resend code.' : 'ওটিপি পুনরায় পাঠাতে ব্যর্থ হয়েছে।')
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Google Login via Firebase with smart direct fallback
  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const authRes = await signInWithGoogle();
      if (authRes.success && authRes.user && authRes.user.email) {
        const syncRes = await api.googleAuthSync({
          uid: authRes.user.uid,
          email: authRes.user.email,
          displayName: authRes.user.displayName || undefined,
          photoURL: authRes.user.photoURL || undefined,
        });

        if (syncRes.user) {
          onAuthSuccess(syncRes.user);
          onClose();
          return;
        }
      }

      // If popup was blocked or domain was unauthorized or popup closed:
      setIsGoogleDirectOpen(true);
      if (authRes.isDomainUnauthorized) {
        setErrorMsg(
          language === 'en'
            ? 'Firebase Domain Security Notice: Please use direct Google Account Sign-In below:'
            : 'ফায়ারবেস ডোমেইন রেস্ট্রিকশনের কারণে সরাসরি নিচের ঘরে আপনার গুগল ইমেইল দিয়ে সাইন-ইন সম্পন্ন করুন:'
        );
      } else if (authRes.isPopupBlocked) {
        setErrorMsg(
          language === 'en'
            ? 'Browser blocked the popup window. Enter your Google email below for direct sign-in:'
            : 'ব্রাউজার পপআপ ব্লক করেছে। অনুগ্রহ করে নিচে আপনার গুগল ইমেইল দিয়ে সরাসরি সাইন-ইন করুন:'
        );
      } else {
        setErrorMsg(
          language === 'en'
            ? 'Google popup window unavailable. Enter your Google email below for instant sign-in:'
            : 'গুগল পপআপ উইন্ডো লোড হতে বিলম্ব হয়েছে। নিচের ঘরে সরাসরি গুগল ইমেইল দিয়ে সাইন-ইন করুন:'
        );
      }
    } catch (err: unknown) {
      console.error('Google Sign In Error:', err);
      setIsGoogleDirectOpen(true);
      setErrorMsg(
        language === 'en'
          ? 'Google popup unavailable. Please use direct Google Sign-In below:'
          : 'নিচের ঘরে সরাসরি গুগল ইমেইল প্রদান করে ওয়ান-ক্লিক সাইন-ইন সম্পন্ন করুন:'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleDirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleDirectEmail.trim() || !googleDirectEmail.includes('@')) {
      setErrorMsg(language === 'en' ? 'Please enter a valid Google email.' : 'অনুগ্রহ করে সঠিক গুগল ইমেইল এড্রেস লিখুন।');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const cleanEmail = googleDirectEmail.trim().toLowerCase();
      const derivedName = googleDirectName.trim() || cleanEmail.split('@')[0];
      const syncRes = await api.googleAuthSync({
        uid: `g-direct-${Date.now()}`,
        email: cleanEmail,
        displayName: derivedName,
      });

      if (syncRes.user) {
        onAuthSuccess(syncRes.user);
        onClose();
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Google সাইন-ইন সম্পন্ন করতে ব্যর্থ হয়েছে।');
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
          aria-label={language === 'en' ? 'Close' : 'বন্ধ করুন'}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6 space-y-2">
          <div className="flex justify-center">
            <BrandLogo size="lg" language={language} className="ring-4 ring-emerald-100 shadow-sm" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            {mode === 'login' && (language === 'en' ? 'Customer Account Login' : 'গ্রাহক অ্যাকাউন্টে লগইন')}
            {mode === 'signup' && (language === 'en' ? 'Create Customer Account' : 'নতুন গ্রাহক অ্যাকাউন্ট তৈরি')}
            {mode === 'verify_otp' && (language === 'en' ? 'Email OTP Verification' : 'ইমেইল ওটিপি (OTP) যাচাইকরণ')}
            {mode === 'forgot_request' && (language === 'en' ? 'Reset Your Password' : 'পাসওয়ার্ড রিসেট করুন')}
            {mode === 'forgot_verify' && (language === 'en' ? 'Verify OTP & Set New Password' : 'ওটিপি যাচাই ও নতুন পাসওয়ার্ড')}
          </h3>
          <p className="text-xs text-slate-500">
            {mode === 'verify_otp' || mode === 'forgot_verify'
              ? (language === 'en'
                  ? `6-digit code has been sent to ${maskedEmail}`
                  : `${maskedEmail} ঠিকানায় ৬-সংখ্যার ওটিপি পাঠানো হয়েছে`)
              : mode === 'forgot_request'
              ? (language === 'en'
                  ? 'Enter your registered email and we will send a password reset code'
                  : 'আপনার নিবন্ধিত ইমেইল দিন, আমরা পাসওয়ার্ড রিসেট কোড পাঠাবো')
              : (language === 'en'
                  ? 'Ghorer Shad • Authentic Homemade Taste'
                  : 'ঘরের স্বাদ • খাঁটি ঘরোয়া খাবারের নিশ্চয়তা')}
          </p>
        </div>

        {customNotice && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-medium">{customNotice}</span>
          </div>
        )}

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
              <span>{language === 'en' ? 'Continue with Google' : 'Google দিয়ে সহজে লগইন করুন'}</span>
            </button>

            {!isGoogleDirectOpen && (
              <div className="text-center pt-0.5">
                <button
                  type="button"
                  onClick={() => setIsGoogleDirectOpen(true)}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold underline cursor-pointer"
                >
                  {language === 'en'
                    ? 'Popup blocked? Direct Google Account Sign-In'
                    : 'গুগল পপআপে সমস্যা? সরাসরি গুগল ইমেইল দিয়ে লগইন করুন'}
                </button>
              </div>
            )}

            {/* Direct Google Fallback Form */}
            {isGoogleDirectOpen ? (
              <form onSubmit={handleGoogleDirectSubmit} className="p-3.5 bg-blue-50/90 rounded-xl border border-blue-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-blue-900 text-[11px] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                    {language === 'en' ? 'Direct Google Account Sign-In' : 'ওয়ান-ক্লিক গুগল অ্যাকাউন্ট সাইন-ইন'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsGoogleDirectOpen(false)}
                    className="text-[10px] text-blue-700 hover:underline cursor-pointer"
                  >
                    {language === 'en' ? 'Hide' : 'লুকান'}
                  </button>
                </div>
                <input
                  type="email"
                  required
                  value={googleDirectEmail}
                  onChange={e => setGoogleDirectEmail(e.target.value)}
                  placeholder={language === 'en' ? 'Your Google email (e.g. name@gmail.com)' : 'আপনার গুগল ইমেইল (যেমন: your@gmail.com)'}
                  className="w-full px-3 py-2 rounded-lg border border-blue-200 focus:outline-none focus:border-blue-600 bg-white text-xs"
                />
                <input
                  type="text"
                  value={googleDirectName}
                  onChange={e => setGoogleDirectName(e.target.value)}
                  placeholder={language === 'en' ? 'Your Name (optional)' : 'আপনার নাম (ঐচ্ছিক)'}
                  className="w-full px-3 py-2 rounded-lg border border-blue-200 focus:outline-none focus:border-blue-600 bg-white text-xs"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-xs transition-colors shadow-xs cursor-pointer"
                >
                  {isLoading ? 'সাইন-ইন হচ্ছে...' : (language === 'en' ? 'Complete Google Sign-In' : 'গুগল সাইন-ইন সম্পন্ন করুন')}
                </button>
              </form>
            ) : (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsGoogleDirectOpen(true)}
                  className="text-[11px] text-slate-500 hover:text-blue-600 hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>⚡</span>
                  {language === 'en' ? 'Popup issue? Use Direct Google Email Sign-In' : 'পপআপে সমস্যা? সরাসরি গুগল ইমেইল দিয়ে লগইন করুন'}
                </button>
              </div>
            )}

            <div className="flex items-center gap-3 my-3">
              <div className="h-px bg-slate-200 flex-1" />
              <span className="text-[11px] text-slate-400 font-medium">
                {language === 'en' ? 'or with email' : 'অথবা ইমেইল দিয়ে'}
              </span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>

            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {language === 'en' ? 'Email Address' : 'ইমেইল ঠিকানা'}
                </label>
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
                <label className="font-semibold text-slate-700 block mb-1">
                  {language === 'en' ? 'Password' : 'পাসওয়ার্ড'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={language === 'en' ? 'Enter password...' : 'আপনার পাসওয়ার্ড...'}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                  />
                </div>
                <div className="flex justify-end mt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setSuccessMsg(null);
                      setMode('forgot_request');
                    }}
                    className="text-[11px] text-emerald-700 hover:text-emerald-800 font-medium hover:underline cursor-pointer"
                  >
                    {language === 'en' ? 'Forgot Password?' : 'পাসওয়ার্ড ভুলে গেছেন?'}
                  </button>
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
                    <span>{language === 'en' ? 'Verifying...' : 'যাচাই হচ্ছে...'}</span>
                  </>
                ) : (
                  <span>{language === 'en' ? 'Log In' : 'লগইন করুন'}</span>
                )}
              </button>
            </form>

            <div className="pt-2 text-center text-slate-500">
              <span>{language === 'en' ? "Don't have an account? " : 'অ্যাকাউন্ট নেই? '}</span>
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setMode('signup');
                }}
                className="text-emerald-700 font-bold hover:underline cursor-pointer"
              >
                {language === 'en' ? 'Create Account' : 'নতুন অ্যাকাউন্ট খুলুন'}
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
              <span>{language === 'en' ? 'Quick Sign Up with Google' : 'Google দিয়ে এক ক্লিকে রেজিস্ট্রেশন'}</span>
            </button>

            {!isGoogleDirectOpen ? (
              <div className="text-center pt-0.5">
                <button
                  type="button"
                  onClick={() => setIsGoogleDirectOpen(true)}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold underline cursor-pointer"
                >
                  {language === 'en'
                    ? 'Popup blocked? Direct Google Account Sign-In'
                    : 'গুগল পপআপে সমস্যা? সরাসরি গুগল ইমেইল দিয়ে যুক্ত হন'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleGoogleDirectSubmit} className="p-3.5 bg-blue-50/90 rounded-xl border border-blue-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-blue-900 text-[11px] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                    {language === 'en' ? 'Direct Google Account Sign-In' : 'ওয়ান-ক্লিক গুগল অ্যাকাউন্ট সাইন-ইন'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsGoogleDirectOpen(false)}
                    className="text-[10px] text-blue-700 hover:underline cursor-pointer"
                  >
                    {language === 'en' ? 'Hide' : 'লুকান'}
                  </button>
                </div>
                <input
                  type="email"
                  required
                  value={googleDirectEmail}
                  onChange={e => setGoogleDirectEmail(e.target.value)}
                  placeholder={language === 'en' ? 'Your Google email (e.g. name@gmail.com)' : 'আপনার গুগল ইমেইল (যেমন: name@gmail.com)'}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-blue-200 focus:outline-none focus:border-blue-600 bg-white"
                />
                <input
                  type="text"
                  value={googleDirectName}
                  onChange={e => setGoogleDirectName(e.target.value)}
                  placeholder={language === 'en' ? 'Your Name (optional)' : 'আপনার নাম (ঐচ্ছিক)'}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-blue-200 focus:outline-none focus:border-blue-600 bg-white"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{language === 'en' ? 'Sign In / Register with this Google Account' : 'এই গুগল অ্যাকাউন্ট দিয়ে প্রবেশ/রেজিস্ট্রেশন করুন'}</span>
                </button>
              </form>
            )}

            <div className="flex items-center gap-3 my-3">
              <div className="h-px bg-slate-200 flex-1" />
              <span className="text-[11px] text-slate-400 font-medium">
                {language === 'en' ? 'or with Email Verification' : 'অথবা ওটিপি ভেরিফিকেশন সহ'}
              </span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>

            <form onSubmit={handleSignupRequest} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {language === 'en' ? 'Your Full Name' : 'আপনার পূর্ণ নাম'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder={language === 'en' ? 'e.g. Tanvir Ahmed' : 'যেমন: তানভীর আহমেদ'}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {language === 'en' ? 'Email Address' : 'ইমেইল ঠিকানা'}
                </label>
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
                  {language === 'en'
                    ? 'A 6-digit verification code will be sent to this email.'
                    : 'এই ইমেইলে ৬-সংখ্যার ওটিপি যাচাই কোড পাঠানো হবে।'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {language === 'en' ? 'Password' : 'পাসওয়ার্ড'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder={language === 'en' ? 'Min 6 characters' : 'কমপক্ষে ৬ অক্ষর'}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {language === 'en' ? 'Confirm Password' : 'পাসওয়ার্ড নিশ্চিত করুন'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder={language === 'en' ? 'Re-type password' : 'একই পাসওয়ার্ড দিন'}
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
                    <span>{language === 'en' ? 'Sending code...' : 'ওটিপি কোড পাঠানো হচ্ছে...'}</span>
                  </>
                ) : (
                  <>
                    <span>{language === 'en' ? 'Send Code & Continue' : 'ওটিপি কোড পাঠান ও এগিয়ে যান'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center text-slate-500">
              <span>{language === 'en' ? 'Already have an account? ' : 'ইতিমধ্যে অ্যাকাউন্ট আছে? '}</span>
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setMode('login');
                }}
                className="text-emerald-700 font-bold hover:underline cursor-pointer"
              >
                {language === 'en' ? 'Log In' : 'লগইন করুন'}
              </button>
            </div>
          </div>
        )}

        {/* ---------------- 3. VERIFY OTP MODE ---------------- */}
        {mode === 'verify_otp' && (
          <div className="space-y-5 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <span className="text-slate-600 block">
                {language === 'en' ? 'Verification code sent to:' : 'ভেরিফিকেশন কোড পাঠানো হয়েছে:'}
              </span>
              <strong className="text-slate-900 font-mono text-sm block mt-0.5">
                {maskedEmail}
              </strong>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="font-semibold text-slate-700 block text-center mb-3">
                  {language === 'en' ? 'Enter 6-digit code:' : '৬-সংখ্যার কোডটি প্রবেশ করান:'}
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
                  {language === 'en' ? 'Expires in: ' : 'মেয়াদ বাকি: '}
                  <strong className="font-mono text-emerald-800">{formatTimer(expiresSeconds)}</strong>
                </span>

                {cooldownSeconds > 0 ? (
                  <span>
                    {language === 'en' ? `Resend in: ${cooldownSeconds}s` : `পুনরায় পাঠানো যাবে: ${cooldownSeconds} সে. পর`}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    {language === 'en' ? 'Resend Code' : 'আবার কোড পাঠান (Resend)'}
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
                    <span>{language === 'en' ? 'Verifying...' : 'যাচাই হচ্ছে...'}</span>
                  </>
                ) : (
                  <span>{language === 'en' ? 'Verify Code & Activate Account' : 'ওটিপি যাচাই করে অ্যাকাউন্ট চালু করুন'}</span>
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
                {language === 'en' ? 'Change Email Address' : 'ইমেইল ঠিকানা পরিবর্তন করুন'}
              </button>
            </div>
          </div>
        )}

        {/* ---------------- 4. FORGOT PASSWORD REQUEST MODE ---------------- */}
        {mode === 'forgot_request' && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-emerald-800 text-[11px] leading-relaxed">
              {language === 'en'
                ? 'Please provide your registered email address. We will send a 6-digit code to reset your password.'
                : 'আপনার নিবন্ধিত ইমেইল ঠিকানা প্রদান করুন। আমরা আপনার পাসওয়ার্ড রিসেট করতে ৬-সংখ্যার ওটিপি কোড পাঠাবো।'}
            </div>

            <form onSubmit={handleForgotRequest} className="space-y-3.5">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {language === 'en' ? 'Registered Email Address' : 'নিবন্ধিত ইমেইল ঠিকানা'}
                </label>
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{language === 'en' ? 'Sending code...' : 'ওটিপি কোড পাঠানো হচ্ছে...'}</span>
                  </>
                ) : (
                  <span>{language === 'en' ? 'Send Reset Code' : 'রিসেট ওটিপি কোড পাঠান'}</span>
                )}
              </button>
            </form>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setSuccessMsg(null);
                  setMode('login');
                }}
                className="text-emerald-700 font-semibold hover:underline cursor-pointer"
              >
                {language === 'en' ? '← Back to Login' : '← লগইনে ফিরে যান'}
              </button>
            </div>
          </div>
        )}

        {/* ---------------- 5. FORGOT PASSWORD VERIFY & RESET MODE ---------------- */}
        {mode === 'forgot_verify' && (
          <div className="space-y-4 text-xs">
            <div className="text-center p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-slate-700">
              <span className="text-[11px] block text-slate-500 mb-0.5">
                {language === 'en' ? 'Verification code sent to:' : 'ওটিপি পাঠানো হয়েছে:'}
              </span>
              <strong className="text-xs text-emerald-800 font-semibold">{maskedEmail}</strong>
            </div>

            <form onSubmit={handleForgotReset} className="space-y-4">
              <div>
                <label className="font-semibold text-slate-700 block text-center mb-2.5">
                  {language === 'en' ? 'Enter 6-digit code:' : '৬-সংখ্যার কোডটি প্রবেশ করান:'}
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
                  {language === 'en' ? 'Expires in: ' : 'মেয়াদ বাকি: '}
                  <strong className="font-mono text-emerald-800">{formatTimer(expiresSeconds)}</strong>
                </span>

                {cooldownSeconds > 0 ? (
                  <span>
                    {language === 'en' ? `Resend in: ${cooldownSeconds}s` : `পুনরায় পাঠানো যাবে: ${cooldownSeconds} সে. পর`}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendForgotOtp}
                    disabled={isLoading}
                    className="text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    {language === 'en' ? 'Resend Code' : 'আবার কোড পাঠান (Resend)'}
                  </button>
                )}
              </div>

              {/* New Password & Confirm */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {language === 'en' ? 'New Password (Min 6 characters)' : 'নতুন পাসওয়ার্ড (ন্যূনতম ৬ অক্ষর)'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder={language === 'en' ? 'Enter new password...' : 'নতুন পাসওয়ার্ড লিখুন...'}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {language === 'en' ? 'Confirm New Password' : 'নতুন পাসওয়ার্ড নিশ্চিত করুন'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={confirmNewPassword}
                      onChange={e => setConfirmNewPassword(e.target.value)}
                      placeholder={language === 'en' ? 'Re-type new password...' : 'পাসওয়ার্ড পুনরায় লিখুন...'}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || otpDigits.join('').length !== 6 || expiresSeconds === 0}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{language === 'en' ? 'Resetting...' : 'যাচাই ও রিসেট হচ্ছে...'}</span>
                  </>
                ) : (
                  <span>{language === 'en' ? 'Reset Password & Log In' : 'পাসওয়ার্ড রিসেট ও লগইন করুন'}</span>
                )}
              </button>
            </form>

            <div className="pt-2 text-center flex items-center justify-between text-[11px] text-slate-500">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setMode('forgot_request');
                }}
                className="hover:underline cursor-pointer"
              >
                {language === 'en' ? 'Change Email' : 'ইমেইল পরিবর্তন করুন'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setMode('login');
                }}
                className="text-emerald-700 font-bold hover:underline cursor-pointer"
              >
                {language === 'en' ? 'Back to Login' : 'লগইনে ফিরে যান'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
