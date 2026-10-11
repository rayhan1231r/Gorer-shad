import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface WhatsAppButtonProps {
  phone: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ phone }) => {
  const { language } = useLanguage();
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const message = encodeURIComponent(
    language === 'en'
      ? 'Hello! I would like to inquire or place an order for homemade food from Ghorer Shad.'
      : 'আসসালামু আলাইকুম! ঘরের স্বাদ থেকে খাবারের অর্ডার অথবা তথ্য জানতে চাচ্ছি।'
  );
  const url = `https://wa.me/${cleanPhone}?text=${message}`;

  return (
    <aside
      aria-label={language === 'en' ? 'WhatsApp Contact' : 'হোয়াটসঅ্যাপ যোগাযোগ'}
      className="fixed bottom-5 left-5 z-30"
    >
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 group focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 cursor-pointer"
        aria-label={language === 'en' ? 'Contact on WhatsApp' : 'হোয়াটসঅ্যাপে যোগাযোগ করুন'}
      >
        <MessageCircle className="w-5 h-5 fill-white text-emerald-600 group-hover:scale-110 transition-transform" />
        <span className="hidden sm:inline">
          {language === 'en' ? 'Order on WhatsApp' : 'হোয়াটসঅ্যাপে অর্ডার'}
        </span>
      </a>
    </aside>
  );
};
