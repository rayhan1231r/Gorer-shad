import React from 'react';
import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  phone: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ phone }) => {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const message = encodeURIComponent('আসসালামু আলাইকুম! ঘরের স্বাদ থেকে খাবারের অর্ডার/তথ্য জানতে চাচ্ছি।');
  const url = `https://wa.me/${cleanPhone}?text=${message}`;

  return (
    <aside aria-label="হোয়াটসঅ্যাপ যোগাযোগ" className="fixed bottom-6 right-6 z-30">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 group focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        aria-label="হোয়াটসঅ্যাপে যোগাযোগ করুন"
      >
        <MessageCircle className="w-5 h-5 fill-white text-emerald-600 group-hover:scale-110 transition-transform" />
        <span className="hidden sm:inline">হোয়াটসঅ্যাপে অর্ডার</span>
      </a>
    </aside>
  );
};
