import React from 'react';
import { ShieldCheck, Truck, RotateCcw, FileText, HelpCircle, Heart, Phone, MapPin, MessageSquare } from 'lucide-react';
import { BusinessConfig } from '../../types/index.ts';

interface PolicyProps {
  pageType: 'about' | 'faq' | 'delivery-policy' | 'refund-policy' | 'privacy-policy' | 'terms';
  config: BusinessConfig;
  onNavigateMenu: () => void;
}

export const PolicyPages: React.FC<PolicyProps> = ({ pageType, config, onNavigateMenu }) => {
  return (
    <div className="bg-slate-50/60 min-h-screen py-12 text-left">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-10 shadow-xs space-y-8">
          {pageType === 'about' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-5">
                <span className="text-emerald-700 font-semibold text-xs uppercase tracking-wider block mb-1">
                  আমাদের পরিচিতি
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {config.brandNameBn} — {config.taglineBn}
                </h1>
              </div>

              <div className="prose prose-sm text-slate-700 leading-relaxed space-y-4">
                <p>
                  &quot;ঘরের স্বাদ&quot; কোনো গতানুগতিক কমার্শিয়াল রেস্তোরাঁ নয়; এটি নারায়ণগঞ্জের আড়াইহাজারে গড়ে ওঠা একটি খাঁটি ঘরোয়া রন্ধন উদ্যোগ। আমাদের মূল বিশ্বাস হলো: খাবার কেবল উদরপূর্তির জন্য নয়, এটি সুস্বাস্থ্য, মনের তৃপ্তি এবং পরিবারের ভালোবাসার প্রতিফলন।
                </p>

                <p>
                  <strong>{config.contactPerson}</strong>-এর সুনিপুণ তত্ত্বাবধানে প্রতিটি খাবার প্রস্তুত করা হয় সম্পূর্ণ স্বাস্থ্যসম্মত পরিবেশে। আমরা স্থানীয় বিশ্বস্ত কৃষকদের কাছ থেকে তাজা সবজি, নদীর জ্যান্ত মাছ এবং দেশি মাংস সংগ্রহ করে খাঁটি সরিষার তেল ও ঘরে বাটা মশলায় রান্না করি।
                </p>

                <h3 className="text-lg font-bold text-slate-900 pt-2">
                  আমাদের অঙ্গীকার:
                </h3>
                <ul className="space-y-2 list-disc pl-5 text-xs text-slate-600">
                  <li><strong>কখনোই বাসি খাবার নয়:</strong> কোনো রান্না করা তরকারি ফ্রিজে রেখে পুনরায় গরম করে পরিবেশন করা হয় না।</li>
                  <li><strong>অর্ডারের পর তাজা রান্না:</strong> আপনার অর্ডার নিশ্চিত হওয়ার পরই কেবল চুলার আঁচ দেওয়া হয়।</li>
                  <li><strong>নিরাপদ খাদ্য গ্রেড প্যাকেজিং:</strong> খাবার গরম ও জীবাণুমুক্ত রাখতে ফুড-গ্রেড বক্সে পৌঁছে দেওয়া হয়।</li>
                </ul>

                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between text-xs mt-6">
                  <div>
                    <span className="font-bold text-slate-900 block">আমাদের সাথে সরাসরি যোগাযোগ করুন</span>
                    <span className="text-slate-600">ফোন: {config.phone} • হোয়াটসঅ্যাপ: {config.whatsapp}</span>
                  </div>
                  <button
                    onClick={onNavigateMenu}
                    className="px-4 py-2 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800 transition-colors"
                  >
                    মেনু দেখুন
                  </button>
                </div>
              </div>
            </div>
          )}

          {pageType === 'delivery-policy' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-5">
                <div className="flex items-center gap-2 text-emerald-700 mb-1">
                  <Truck className="w-5 h-5" />
                  <span className="font-semibold text-xs uppercase tracking-wider">হোম ডেলিভারি নিয়মাবলী</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900">ডেলিভারি পলিসি ও সেবা এলাকা</h1>
              </div>

              <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                <p>
                  ১. <strong>ডেলিভারি এলাকা:</strong> আমরা প্রাথমিকভাবে আড়াইহাজার সদর, গোপালদী পৌরসভা, দুপতারা, উচিতপুর (মেঘনা ঘাট সংলগ্ন), ব্রাহ্মন্দী, মাহমুদপুর, সাতগ্রাম ও বিশনন্দী এলাকায় নিজস্ব ডেলিভারি নেটওয়ার্কে সেবা প্রদান করি।
                </p>
                <p>
                  ২. <strong>ডেলিভারি চার্জ:</strong> এলাকাভেদে ডেলিভারি চার্জ ৪০ টাকা থেকে ৮০ টাকা পর্যন্ত নির্ধারিত। প্রতিটি এলাকায় ন্যূনতম অর্ডার ভ্যালু (যেমন: ৳৮০০ বা ৳১০০০) অতিক্রম করলে ডেলিভারি সম্পূর্ণ ফ্রি!
                </p>
                <p>
                  ৩. <strong>অগ্রিম সময়সীমা:</strong> যেহেতু খাবার তাজা রান্না হয়, গ্রাহকদেরকে কাঙ্ক্ষিত সময়ের কমপক্ষে ৪-৬ ঘন্টা পূর্বে অর্ডার প্লেস করতে হবে।
                </p>
                <p>
                  ৪. <strong>জরুরি ডেলিভারি:</strong> বিশেষ প্রয়োজনে ২-৩ ঘন্টা পূর্বে ফোন করে অর্ডার দিলে কিচেন ক্যাপাসিটি সাপেক্ষে তা প্রস্তুত করা হতে পারে।
                </p>
              </div>
            </div>
          )}

          {pageType === 'refund-policy' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-5">
                <div className="flex items-center gap-2 text-emerald-700 mb-1">
                  <RotateCcw className="w-5 h-5" />
                  <span className="font-semibold text-xs uppercase tracking-wider">বাতিল ও রিফান্ড</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900">বাতিল ও রিফান্ড নীতি (Refund Policy)</h1>
              </div>

              <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                <p>
                  ১. <strong>অর্ডার বাতিল:</strong> খাবার তৈরির কাজ শুরু হওয়ার পূর্বে (অর্ডার প্লেস করার সর্বোচ্চ ৩০ মিনিটের মধ্যে) গ্রাহক ফোন করে অর্ডার বাতিল করতে পারবেন।
                </p>
                <p>
                  ২. <strong>রান্না শুরু হওয়ার পর বাতিল:</strong> যেহেতু খাবার স্পেসিফিক গ্রাহকের জন্য ফ্রেশ রান্না হয়, তাই একবার রান্না শুরু হয়ে গেলে অর্ডার বাতিল করা সম্ভব নয়।
                </p>
                <p>
                  ৩. <strong>ভুল বা অসন্তোষজনক খাবার:</strong> যদি অর্ডারের কোনো আইটেমে গরমিল থাকে বা মান সংক্রান্ত কোনো বাস্তবিক সমস্যা দেখা যায়, তবে খাবার প্রাপ্তির সাথে সাথে ছবি তুলে আমাদের হোয়াটসঅ্যাপে (<strong>{config.whatsapp}</strong>) অবহিত করলে আমরা দ্রুত সমপরিমাণ রিফান্ড অথবা নতুন খাবার পাঠিয়ে দেব।
                </p>
              </div>
            </div>
          )}

          {pageType === 'faq' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-5">
                <div className="flex items-center gap-2 text-emerald-700 mb-1">
                  <HelpCircle className="w-5 h-5" />
                  <span className="font-semibold text-xs uppercase tracking-wider">জিজ্ঞাসা ও উত্তর</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900">সাধারণ জিজ্ঞাসা (FAQ)</h1>
              </div>

              <div className="space-y-4 text-xs divide-y divide-slate-100">
                <div className="pt-3">
                  <h4 className="font-bold text-slate-900 text-sm mb-1">প্রশ্ন: খাবার কি সবসময় তৈরি থাকে নাকি অর্ডারের পর রান্না হয়?</h4>
                  <p className="text-slate-600">উত্তর: আমাদের কোনো খাবার আগে থেকে রান্না করে ফ্রিজে রাখা হয় না। প্রতিটি খাবার আপনার অর্ডারের পর তাজা ও সম্পূর্ণ ঘরোয়া পদ্ধতিতে রান্না করা হয়।</p>
                </div>

                <div className="pt-3">
                  <h4 className="font-bold text-slate-900 text-sm mb-1">প্রশ্ন: কীভাবে অগ্রিম অর্ডার করতে পারি?</h4>
                  <p className="text-slate-600">উত্তর: ওয়েবসাইটে মেনু থেকে পছন্দের খাবার সিলেক্ট করে ব্যাগে যোগ করুন এবং চেকআউটে আপনার কাঙ্ক্ষিত সময় (কমপক্ষে ৪ ঘন্টা পর) উল্লেখ করুন। অথবা সরাসরি কল করতে পারেন {config.phone} নম্বরে।</p>
                </div>

                <div className="pt-3">
                  <h4 className="font-bold text-slate-900 text-sm mb-1">প্রশ্ন: পেমেন্ট কি ডেলিভারির সময় দেওয়া যাবে?</h4>
                  <p className="text-slate-600">উত্তর: হ্যাঁ, আপনি ক্যাশ অন ডেলিভারিতে খাবার গ্রহণ করার পর মূল্য পরিশোধ করতে পারবেন। এছাড়া বিকাশ, নগদ ও রকেটেও পেমেন্ট গ্রহণযোগ্য।</p>
                </div>

                <div className="pt-3">
                  <h4 className="font-bold text-slate-900 text-sm mb-1">প্রশ্ন: ৫০ থেকে ১০০ জনের অনুষ্ঠানের জন্য ক্যাটারিং নেওয়া যাবে?</h4>
                  <p className="text-slate-600">উত্তর: অবশ্যই! আমাদের ক্যাটারিং পেজ থেকে কোটেশন ফর্ম পূরণ করুন অথবা সরাসরি ফোনে কথা বলে মেনু ঠিক করুন।</p>
                </div>
              </div>
            </div>
          )}

          {pageType === 'privacy-policy' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-5">
                <h1 className="text-2xl font-bold text-slate-900">গোপনীয়তা নীতি (Privacy Policy)</h1>
              </div>
              <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                <p>
                  &quot;ঘরের স্বাদ&quot; গ্রাহকদের ব্যক্তিগত তথ্যের সম্পূর্ণ নিরাপত্তা নিশ্চিত করে। অর্ডারের জন্য সংগ্রহকৃত নাম, ফোন নম্বর এবং ঠিকানা শুধুমাত্র খাবার ডেলিভারি ও যোগাযোগ রক্ষার কাজে ব্যবহৃত হয়। কোনো তৃতীয় পক্ষের কাছে আপনার তথ্য কখনোই প্রকাশ বা বিক্রি করা হয় না।
                </p>
              </div>
            </div>
          )}

          {pageType === 'terms' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-5">
                <h1 className="text-2xl font-bold text-slate-900">শর্তাবলী (Terms & Conditions)</h1>
              </div>
              <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                <p>
                  ওয়েবসাইট ব্যবহারের মাধ্যমে আপনি আমাদের অগ্রিম অর্ডার পলিসি এবং শর্তাবলীর সাথে একমত পোষণ করছেন। প্রাকৃতিক দুর্যোগ, রাজনৈতিক হরতাল বা অনাকাঙ্ক্ষিত কোনো পরিস্থিতিতে ডেলিভারির সময়সূচীতে সামান্য পরিবর্তন হতে পারে যা গ্রাহককে ফোনে জানিয়ে দেওয়া হবে।
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
