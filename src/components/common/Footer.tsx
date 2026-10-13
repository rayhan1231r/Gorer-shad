import React from 'react';
import { Phone, MapPin, Clock, MessageSquare, Heart, Lock } from 'lucide-react';
import { BusinessConfig } from '../../types/index.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { BrandLogo } from './BrandLogo.tsx';

interface FooterProps {
  config: BusinessConfig;
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ config, onNavigate }) => {
  const { language } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <BrandLogo
                size="lg"
                logoUrl={config.logoUrl}
                className="ring-2 ring-emerald-500/40 shadow-sm"
                alt={language === 'en' ? config.brandNameEn : config.brandNameBn}
              />
              <div>
                <span className="block text-xl font-bold text-white tracking-tight">
                  {language === 'en' ? config.brandNameEn : config.brandNameBn}
                </span>
                <span className="block text-xs text-emerald-400 font-medium">
                  {language === 'en' ? config.taglineEn : config.taglineBn}
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {language === 'en'
                ? 'Your trusted destination in Araihazar for authentic homemade Bengali meals, fresh fish, desi meat, fast food, family combos, and catering services.'
                : 'আড়াইহাজারের খাঁটি ঘরোয়া বাঙালি খাবার, তাজা মাছ, দেশি মাংস, ফাস্টফুড, ফ্যামিলি কম্বো ও ক্যাটারিং সার্ভিসের বিশ্বস্ত ঠিকানা। প্রতিটি খাবার অর্ডারের পর তাজা রান্না করা হয়।'}
            </p>
            <div className="text-xs text-slate-400">
              {language === 'en' ? 'Proprietor:' : 'পরিচালনায়:'}{' '}
              <span className="text-white font-medium">{config.contactPerson}</span>
            </div>

            {/* Social Media Links */}
            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-300 block mb-2">
                {language === 'en' ? 'Follow Us on Social Media:' : 'সামাজিক মাধ্যমে যুক্ত থাকুন:'}
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {config.facebookUrl && (
                  <a
                    href={config.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-[#1877F2] text-white flex items-center justify-center transition-all hover:scale-105 border border-slate-700"
                    title="Facebook"
                  >
                    <span className="font-bold text-xs">FB</span>
                  </a>
                )}
                {config.youtubeUrl && (
                  <a
                    href={config.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-[#FF0000] text-white flex items-center justify-center transition-all hover:scale-105 border border-slate-700"
                    title="YouTube"
                  >
                    <span className="font-bold text-xs">YT</span>
                  </a>
                )}
                {config.tiktokUrl && (
                  <a
                    href={config.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-black text-white flex items-center justify-center transition-all hover:scale-105 border border-slate-700"
                    title="TikTok"
                  >
                    <span className="font-bold text-xs">TT</span>
                  </a>
                )}
                {config.instagramUrl && (
                  <a
                    href={config.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-gradient-to-tr hover:from-amber-500 hover:to-fuchsia-600 text-white flex items-center justify-center transition-all hover:scale-105 border border-slate-700"
                    title="Instagram"
                  >
                    <span className="font-bold text-xs">IG</span>
                  </a>
                )}
                <a
                  href={`https://wa.me/${config.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-[#25D366] text-white flex items-center justify-center transition-all hover:scale-105 border border-slate-700"
                  title="WhatsApp"
                >
                  <span className="font-bold text-xs">WA</span>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
              {language === 'en' ? 'Contact & Address' : 'যোগাযোগ ও ঠিকানা'}
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  {language === 'en'
                    ? 'Araihazar Bazar Road, Araihazar, Narayanganj / Dhaka, Bangladesh'
                    : config.fullAddressBn}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`tel:${config.phone}`} className="hover:text-white transition-colors">
                  {config.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href={`https://wa.me/${config.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  {language === 'en' ? 'WhatsApp:' : 'হোয়াটসঅ্যাপ:'} {config.whatsapp}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {language === 'en'
                    ? '9:00 AM - 9:00 PM (Daily)'
                    : config.openingHoursBn}
                </span>
              </li>
            </ul>
          </div>

          {/* Quick Links & Service Areas */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
              {language === 'en' ? 'Quick Links' : 'প্রয়োজনীয় লিংক'}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('menu')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  {language === 'en' ? 'Full Food Menu' : 'খাবারের পূর্ণ মেনু'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catering')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  {language === 'en' ? 'Catering & Bulk Orders' : 'ক্যাটারিং ও বড় আয়োজন'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('profile')}
                  className="hover:text-white transition-colors text-left cursor-pointer flex items-center gap-1.5"
                >
                  <span>🏆 {language === 'en' ? 'Customer Profile & Leaderboard' : 'গ্রাহক প্রোফাইল ও লিডারবোর্ড'}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('track')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  {language === 'en' ? 'Order Tracking' : 'অর্ডার ট্র্যাকিং'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('faq')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  {language === 'en' ? 'Frequently Asked Questions' : 'সাধারণ জিজ্ঞাসা'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  {language === 'en' ? 'Our Story & Mission' : 'আমাদের পরিচিতি ও লক্ষ্য'}
                </button>
              </li>
              <li className="pt-1.5 border-t border-slate-800/80">
                <button
                  onClick={() => onNavigate('admin')}
                  className="text-xs text-slate-400 hover:text-amber-400 transition-colors text-left cursor-pointer flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  <span>{language === 'en' ? 'Admin / Staff Login' : 'অ্যাডমিন / স্টাফ লগইন'}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Delivery & Ordering Policy */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
              {language === 'en' ? 'Policies & Terms' : 'নীতিমালা ও শর্তাবলী'}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('delivery-policy')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  {language === 'en' ? 'Delivery Policy & Coverage' : 'ডেলিভারি নীতিমালা'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('refund-policy')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  {language === 'en' ? 'Cancellation & Refund Policy' : 'বাতিল ও রিফান্ড নীতিমালা'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('privacy-policy')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  {language === 'en' ? 'Privacy Policy' : 'গোপনীয়তা নীতিমালা'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('terms')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  {language === 'en' ? 'Terms of Service' : 'ব্যবহারের শর্তাবলী'}
                </button>
              </li>
            </ul>
            <div className="pt-2 text-xs text-slate-400 bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
              <span className="text-emerald-400 font-semibold block mb-1">
                {language === 'en' ? 'Advance Order Policy:' : 'অগ্রিম অর্ডার নীতিমালা:'}
              </span>
              {language === 'en'
                ? 'Please place orders 4-6 hours in advance to guarantee fresh, authentic home cooking.'
                : 'তাজা ও স্বাস্থ্যকর রান্নার নিশ্চয়তার জন্য কমপক্ষে ৪-৬ ঘন্টা পূর্বে অগ্রিম অর্ডার করুন।'}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            {language === 'en'
              ? `© 2026 ${config.brandNameEn} — All rights reserved.`
              : `© ২০২৬ ${config.brandNameBn} — সর্বস্বত্ব সংরক্ষিত।`}
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('admin')}
              className="text-slate-500 hover:text-emerald-400 text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Lock className="w-3 h-3" />
              <span>{language === 'en' ? 'Admin Portal' : 'অ্যাডমিন পোর্টাল'}</span>
            </button>
            <p className="flex items-center gap-1.5">
              <span>
                {language === 'en'
                  ? 'Cooked with passion from Araihazar, Dhaka'
                  : 'আড়াইহাজার, ঢাকা থেকে ভালোবাসা সহকারে প্রস্তুত'}
              </span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
