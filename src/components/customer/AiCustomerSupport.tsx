import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  X,
  Send,
  Bot,
  User,
  ChevronRight,
  Phone,
  Clock,
  MapPin,
  UtensilsCrossed,
  CheckCircle2,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { BusinessConfig, FoodItem } from '../../types/index.ts';

interface AiCustomerSupportProps {
  config: BusinessConfig;
  onNavigate: (page: string, categoryId?: string) => void;
  foods?: FoodItem[];
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  suggestedActions?: { label: string; action: string; targetId?: string }[];
}

export const AiCustomerSupport: React.FC<AiCustomerSupportProps> = ({
  config,
  onNavigate,
  foods = []
}) => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: language === 'en'
        ? `Hello! Welcome to ${config.brandNameEn}. I am your authentic Bengali food AI assistant. Ask me anything about our freshly cooked menu, 4-6 hours advance ordering rules, delivery zones, or event catering!`
        : `আসসালামু আলাইকুম! ${config.brandNameBn}-এ আপনাকে স্বাগতম। আমি আপনার এআই সহকারী। আজকের তাজা মেনু, অগ্রিম অর্ডারের সময়সীমা, ডেলিভারি এলাকা কিংবা যেকোনো মেহমানদারির ক্যাটারিং সম্পর্কে যেকোনো প্রশ্ন করুন!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        { label: '🍲 আজকের মেনু দেখুন', action: 'VIEW_MENU' },
        { label: '⏰ অর্ডারের নিয়মাবলী', action: 'ASK_HOURS' },
        { label: '🎉 মেহমানদারি ও ক্যাটারিং', action: 'CATERING' }
      ]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const history = messages.slice(-6).map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await api.askCustomerSupportAi(text, history);

      const botMsg: Message = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: res.suggestedActions
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('Customer AI error:', err);
      const fallbackMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: language === 'en'
          ? `Sorry for the delay! For urgent assistance or fast ordering, please call our hotline directly at ${config.phone} or chat on WhatsApp.`
          : `আন্তরিকভাবে দুঃখিত! নেটওয়ার্ক সংযোগে কিছুটা বিলম্ব হচ্ছে। যেকোনো জরুরি প্রশ্ন বা দ্রুত খাবারের জন্য আমাদের কল করুন: ${config.phone} অথবা হোয়াটসঅ্যাপে যোগাযোগ করুন।`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          { label: '💬 হোয়াটসঅ্যাপে কথা বলুন', action: 'WHATSAPP' },
          { label: '🍲 মেনু দেখুন', action: 'VIEW_MENU' }
        ]
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: string) => {
    switch (action) {
      case 'VIEW_MENU':
        onNavigate('menu');
        setIsOpen(false);
        break;
      case 'TRACK_ORDER':
        onNavigate('track');
        setIsOpen(false);
        break;
      case 'CATERING':
        onNavigate('catering');
        setIsOpen(false);
        break;
      case 'WHATSAPP':
        const cleanPhone = config.whatsapp.replace(/[^0-9]/g, '');
        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent('আসসালামু আলাইকুম, ঘরের স্বাদ খাবার অর্ডার সংক্রান্ত তথ্য জানতে চাই।')}`, '_blank');
        break;
      case 'CALL':
        window.location.href = `tel:${config.phone.replace(/[^0-9]/g, '')}`;
        break;
      case 'ASK_HOURS':
        handleSendMessage('খাবার অর্ডারের কতক্ষণ আগে জানাতে হয় এবং ডেলিভারির নিয়ম কি?');
        break;
      default:
        break;
    }
  };

  const quickPrompts = [
    { label: '🍲 আজকের স্পেশাল মেনু কি?', query: 'আজকে কি কি স্পেশাল খাবার পাওয়া যাবে এবং দাম কত?' },
    { label: '⏰ কতক্ষণ আগে অর্ডার দিতে হয়?', query: 'খাবার পাওয়ার জন্য কতক্ষণ আগে অগ্রিম অর্ডার দিতে হবে?' },
    { label: '🚚 আড়াইহাজারে ডেলিভারি চার্জ কত?', query: 'আড়াইহাজার ও আশপাশের এলাকায় ডেলিভারি চার্জ কত এবং কতক্ষণ সময় লাগে?' },
    { label: '🎉 মেহমানদারি ও ক্যাটারিং প্যাকেজ', query: 'পারিবারিক অনুষ্ঠান বা মেহমানদারির জন্য কি কি ক্যাটারিং প্যাকেজ আছে?' },
    { label: '💳 বিকাশ বা নগদে পেমেন্ট', query: 'বিকাশ অথবা নগদে পেমেন্ট করার নিয়ম কি?' }
  ];

  return (
    <div className="fixed bottom-5 right-5 z-40 text-left font-sans print:hidden">
      {/* Launcher Button (When closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 text-white pl-4 pr-5 py-3.5 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-emerald-400/40 cursor-pointer"
          aria-label="ঘরের স্বাদ এআই সহকারী খুলুন"
        >
          {/* Pulsing indicator */}
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400 border border-white"></span>
          </span>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-200" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold leading-tight flex items-center gap-1">
                <span>{config.brandNameBn} এআই</span>
                <span className="bg-amber-400 text-slate-900 text-[9px] px-1.5 py-0.2 rounded-full font-extrabold uppercase">সহায়িকা</span>
              </span>
              <span className="text-[10px] text-emerald-100 font-medium leading-none mt-0.5">
                {language === 'en' ? 'Authentic Food AI Support' : 'খাবার ও অর্ডারের প্রশ্ন করুন'}
              </span>
            </div>
          </div>
        </button>
      )}

      {/* Chat Window (When Open) */}
      {isOpen && (
        <div
          className={`bg-white rounded-3xl shadow-2xl border border-emerald-100 flex flex-col overflow-hidden transition-all duration-300 ${
            isMinimized
              ? 'w-72 h-14'
              : 'w-[92vw] sm:w-[410px] h-[580px] max-h-[82vh]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white px-4 py-3.5 flex items-center justify-between select-none shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20">
                  <Bot className="w-5 h-5 text-emerald-100" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-emerald-800 rounded-full" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  <span>{config.brandNameBn} এআই সহায়িকা</span>
                  <span className="text-[10px] bg-emerald-500/30 text-emerald-100 px-1.5 py-0.2 rounded font-semibold border border-emerald-400/30">
                    Live
                  </span>
                </h3>
                <p className="text-[10px] text-emerald-100/90 leading-tight">
                  {language === 'en' ? 'Instant Bengali Food & Order Guide' : 'খাঁটি বাঙালি খাবার ও অর্ডারের তাৎক্ষণিক উত্তর'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-emerald-100">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:bg-white/15 rounded-lg transition-colors"
                title={isMinimized ? 'বড় করুন' : 'মিনিমাইজ করুন'}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/15 rounded-lg transition-colors"
                title="বন্ধ করুন"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Message History */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/70 text-xs">
                {/* Notice Pill */}
                <div className="bg-emerald-50 border border-emerald-100/80 rounded-2xl p-2.5 text-center text-[11px] text-emerald-900 leading-relaxed shadow-2xs">
                  <div className="flex items-center justify-center gap-1 font-bold mb-0.5 text-emerald-800">
                    <Clock className="w-3.5 h-3.5 text-emerald-700" />
                    <span>অগ্রিম অর্ডারের নিশ্চয়তা</span>
                  </div>
                  <span>খাবারের টাটকা স্বাদ বজায় রাখতে প্রতিটি পদ ৪-৬ ঘণ্টা পূর্বে ফ্রেশ রান্না করা হয়।</span>
                </div>

                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-2xs whitespace-pre-line ${
                        msg.role === 'user'
                          ? 'bg-emerald-700 text-white rounded-br-2xs'
                          : 'bg-white text-slate-800 border border-slate-200/70 rounded-bl-2xs'
                      }`}
                    >
                      {msg.text}
                    </div>

                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                      {msg.timestamp}
                    </span>

                    {/* Action buttons if provided */}
                    {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {msg.suggestedActions.map((act, i) => (
                          <button
                            key={i}
                            onClick={() => handleActionClick(act.action)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100/90 text-emerald-900 border border-emerald-200 hover:bg-emerald-200 active:scale-95 transition-all"
                          >
                            <span>{act.label}</span>
                            <ChevronRight className="w-3 h-3 text-emerald-700" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-2 text-slate-400 text-xs bg-white px-3 py-2 rounded-2xl border border-slate-200/60 w-fit">
                    <Bot className="w-4 h-4 text-emerald-600 animate-bounce" />
                    <span>ঘরের স্বাদ এআই ভাবছে...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts Carousel */}
              <div className="px-3 py-2 bg-white border-t border-slate-100 overflow-x-auto no-scrollbar flex items-center gap-1.5">
                {quickPrompts.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q.query)}
                    disabled={isLoading}
                    className="shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 border border-slate-200/60 transition-colors"
                  >
                    {q.label}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 bg-white border-t border-slate-200/80">
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    placeholder={language === 'en' ? 'Ask anything about menu, catering, delivery...' : 'মেনু, অগ্রিম অর্ডার বা ক্যাটারিং সম্পর্কে লিখুন...'}
                    className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50/50 text-slate-900"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className="p-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white rounded-xl transition-all shadow-xs flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
