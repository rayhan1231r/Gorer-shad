import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface LanguageToggleProps {
  variant?: 'header' | 'compact' | 'hero';
  className?: string;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ variant = 'header', className = '' }) => {
  const { language, setLanguage } = useLanguage();

  if (variant === 'hero') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 p-1 bg-white/90 backdrop-blur-xs border border-slate-200/90 rounded-xl shadow-xs text-xs font-semibold ${className}`}
        aria-label={language === 'en' ? 'Language selection' : 'ভাষা নির্বাচন'}
      >
        <Globe className="w-3.5 h-3.5 text-emerald-700 ml-1.5" />
        <button
          type="button"
          onClick={() => setLanguage('bn')}
          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
            language === 'bn'
              ? 'bg-emerald-700 text-white shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
          title={language === 'en' ? 'Switch to Bengali' : 'বাংলা নির্বাচন করুন'}
        >
          বাংলা
        </button>
        <span className="text-slate-300">|</span>
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
            language === 'en'
              ? 'bg-emerald-700 text-white shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
          title={language === 'en' ? 'Switch to English' : 'ইংরেজি নির্বাচন করুন'}
        >
          English
        </button>
      </div>
    );
  }

  // Header and Compact variant
  return (
    <div
      className={`inline-flex items-center p-0.5 bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/80 rounded-lg text-xs font-semibold transition-colors ${className}`}
      title={language === 'en' ? 'Switch language' : 'ভাষা পরিবর্তন করুন'}
      aria-label={language === 'en' ? 'Language switcher' : 'ভাষা পরিবর্তন'}
    >
      <button
        type="button"
        onClick={() => setLanguage('bn')}
        className={`px-2.5 py-1 rounded-md text-xs transition-all cursor-pointer ${
          language === 'bn'
            ? 'bg-emerald-700 text-white shadow-xs font-bold'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        title={language === 'en' ? 'Switch to Bengali' : 'বাংলা নির্বাচন করুন'}
      >
        বাংলা
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 rounded-md text-xs transition-all cursor-pointer ${
          language === 'en'
            ? 'bg-emerald-700 text-white shadow-xs font-bold'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        title={language === 'en' ? 'Switch to English' : 'ইংরেজি নির্বাচন করুন'}
      >
        English
      </button>
    </div>
  );
};
