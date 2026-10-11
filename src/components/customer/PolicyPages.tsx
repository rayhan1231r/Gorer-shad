import React from 'react';
import { Truck, RotateCcw, HelpCircle, Phone, MessageSquare } from 'lucide-react';
import { BusinessConfig } from '../../types/index.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface PolicyProps {
  pageType: 'about' | 'faq' | 'delivery-policy' | 'refund-policy' | 'privacy-policy' | 'terms';
  config: BusinessConfig;
  onNavigateMenu: () => void;
}

export const PolicyPages: React.FC<PolicyProps> = ({ pageType, config, onNavigateMenu }) => {
  const { language } = useLanguage();

  return (
    <div className="bg-slate-50/60 min-h-screen py-12 text-left">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-10 shadow-xs space-y-8">
          {pageType === 'about' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-5">
                <span className="text-emerald-700 font-semibold text-xs uppercase tracking-wider block mb-1">
                  {language === 'en' ? 'About Us' : 'আমাদের পরিচিতি'}
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {language === 'en'
                    ? `${config.brandNameEn} — ${config.taglineEn}`
                    : `${config.brandNameBn} — ${config.taglineBn}`}
                </h1>
              </div>

              <div className="prose prose-sm text-slate-700 leading-relaxed space-y-4">
                {language === 'en' ? (
                  <>
                    <p>
                      &quot;Ghorer Shad&quot; is not an ordinary commercial restaurant; it is an authentic home-kitchen culinary initiative founded in Araihazar, Narayanganj. Our core belief is that food is not just for sustenance, but a source of good health, happiness, and authentic family love.
                    </p>
                    <p>
                      Under the careful supervision of <strong>{config.contactPerson}</strong>, every single dish is prepared in a clean and hygienic environment. We source fresh vegetables from trusted local farmers, river-fresh fish, and farm-raised desi meat, cooking everything in pure mustard oil and hand-ground spices.
                    </p>
                    <h3 className="text-lg font-bold text-slate-900 pt-2">
                      Our Commitments:
                    </h3>
                    <ul className="space-y-2 list-disc pl-5 text-xs text-slate-600">
                      <li><strong>Never Pre-cooked or Stale:</strong> No dishes are stored in refrigerators and reheated.</li>
                      <li><strong>Cooked Fresh After Order:</strong> Cooking begins on our burners only after your order is confirmed.</li>
                      <li><strong>Safe Food-Grade Packaging:</strong> Packaged in sealed food-grade containers to keep meals hot and sterile.</li>
                    </ul>
                  </>
                ) : (
                  <>
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
                  </>
                )}

                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between text-xs mt-6">
                  <div>
                    <span className="font-bold text-slate-900 block">
                      {language === 'en' ? 'Contact Us Directly' : 'আমাদের সাথে সরাসরি যোগাযোগ করুন'}
                    </span>
                    <span className="text-slate-600">
                      {language === 'en' ? `Phone: ${config.phone} • WhatsApp: ${config.whatsapp}` : `ফোন: ${config.phone} • হোয়াটসঅ্যাপ: ${config.whatsapp}`}
                    </span>
                  </div>
                  <button
                    onClick={onNavigateMenu}
                    className="px-4 py-2 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800 transition-colors cursor-pointer"
                  >
                    {language === 'en' ? 'View Menu' : 'মেনু দেখুন'}
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
                  <span className="font-semibold text-xs uppercase tracking-wider">
                    {language === 'en' ? 'Home Delivery Guidelines' : 'হোম ডেলিভারি নিয়মাবলী'}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {language === 'en' ? 'Delivery Policy & Coverage Areas' : 'ডেলিভারি পলিসি ও সেবা এলাকা'}
                </h1>
              </div>

              <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                {language === 'en' ? (
                  <>
                    <p>
                      1. <strong>Delivery Coverage:</strong> We provide dedicated home delivery across Araihazar Sadar, Gopaldi Pourashava, Duptara, Uchitpur (Meghna Ghat road), Brahmandi, Mahmudpur, Satgram, and Bishnandi. In addition, we deliver across Dhaka City and all districts nationwide via express courier partners.
                    </p>
                    <p>
                      2. <strong>Delivery Charges:</strong> Local delivery fees range from Tk 40 to Tk 80 depending on the union. Delivery is completely FREE if your order reaches the minimum threshold (e.g. Tk 800 or Tk 1000)!
                    </p>
                    <p>
                      3. <strong>Advance Notice Required:</strong> Because all meals are freshly prepared to order with pure ingredients, customers must place orders at least 4 to 6 hours before the desired mealtime.
                    </p>
                    <p>
                      4. <strong>Urgent Delivery:</strong> For urgent requests placed 2-3 hours in advance, preparation is subject to immediate kitchen capacity and rider availability.
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      ১. <strong>ডেলিভারি এলাকা:</strong> আমরা প্রাথমিকভাবে আড়াইহাজার সদর, গোপালদী পৌরসভা, দুপতারা, উচিতপুর (মেঘনা ঘাট সংলগ্ন), ব্রাহ্মন্দী, মাহমুদপুর, সাতগ্রাম ও বিশনন্দী এলাকায় নিজস্ব ডেলিভারি নেটওয়ার্কে সেবা প্রদান করি। এছাড়াও ঢাকা মহানগর ও দেশের সকল জেলায় কুরিয়ার সার্ভিসের মাধ্যমে ডেলিভারি দেওয়া হয়।
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
                  </>
                )}
              </div>
            </div>
          )}

          {pageType === 'refund-policy' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-5">
                <div className="flex items-center gap-2 text-emerald-700 mb-1">
                  <RotateCcw className="w-5 h-5" />
                  <span className="font-semibold text-xs uppercase tracking-wider">
                    {language === 'en' ? 'Cancellation & Refund' : 'বাতিল ও রিফান্ড'}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {language === 'en' ? 'Cancellation & Refund Policy' : 'বাতিল ও রিফান্ড নীতিমালা'}
                </h1>
              </div>

              <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                {language === 'en' ? (
                  <>
                    <p>
                      1. <strong>Order Cancellation:</strong> You may cancel your order by calling us within 30 minutes of placing the order, prior to kitchen preparation.
                    </p>
                    <p>
                      2. <strong>After Preparation Begins:</strong> Because all dishes are freshly prepared and customized specifically for you, orders cannot be cancelled once cooking has started.
                    </p>
                    <p>
                      3. <strong>Quality Guarantee & Discrepancies:</strong> If there is any discrepancy in your order or a legitimate quality issue upon delivery, please photograph the item and message us on WhatsApp (<strong>{config.whatsapp}</strong>) immediately. We will promptly issue an equivalent refund or dispatch a fresh replacement dish.
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      ১. <strong>অর্ডার বাতিল:</strong> খাবার তৈরির কাজ শুরু হওয়ার পূর্বে (অর্ডার প্লেস করার সর্বোচ্চ ৩০ মিনিটের মধ্যে) গ্রাহক ফোন করে অর্ডার বাতিল করতে পারবেন।
                    </p>
                    <p>
                      ২. <strong>রান্না শুরু হওয়ার পর বাতিল:</strong> যেহেতু খাবার স্পেসিফিক গ্রাহকের জন্য ফ্রেশ রান্না হয়, তাই একবার রান্না শুরু হয়ে গেলে অর্ডার বাতিল করা সম্ভব নয়।
                    </p>
                    <p>
                      ৩. <strong>ভুল বা অসন্তোষজনক খাবার:</strong> যদি অর্ডারের কোনো আইটেমে গরমিল থাকে বা মান সংক্রান্ত কোনো বাস্তবিক সমস্যা দেখা যায়, তবে খাবার প্রাপ্তির সাথে সাথে ছবি তুলে আমাদের হোয়াটসঅ্যাপে (<strong>{config.whatsapp}</strong>) অবহিত করলে আমরা দ্রুত সমপরিমাণ রিফান্ড অথবা নতুন খাবার পাঠিয়ে দেব।
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {pageType === 'faq' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-5">
                <div className="flex items-center gap-2 text-emerald-700 mb-1">
                  <HelpCircle className="w-5 h-5" />
                  <span className="font-semibold text-xs uppercase tracking-wider">
                    {language === 'en' ? 'Questions & Answers' : 'জিজ্ঞাসা ও উত্তর'}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {language === 'en' ? 'Frequently Asked Questions' : 'সাধারণ জিজ্ঞাসা'}
                </h1>
              </div>

              <div className="space-y-4 text-xs divide-y divide-slate-100">
                {language === 'en' ? (
                  <>
                    <div className="pt-3">
                      <h4 className="font-bold text-slate-900 text-sm mb-1">Q: Is the food precooked or prepared after I order?</h4>
                      <p className="text-slate-600">A: None of our food is pre-cooked or stored in refrigerators. Every dish is cooked completely fresh after your order is confirmed.</p>
                    </div>
                    <div className="pt-3">
                      <h4 className="font-bold text-slate-900 text-sm mb-1">Q: How do I place an advance order?</h4>
                      <p className="text-slate-600">A: Select your favorite items from the menu, add them to your bag, and select your preferred delivery time at checkout (at least 4 hours in advance). Or call us directly at {config.phone}.</p>
                    </div>
                    <div className="pt-3">
                      <h4 className="font-bold text-slate-900 text-sm mb-1">Q: Can I pay with Cash on Delivery?</h4>
                      <p className="text-slate-600">A: Yes, Cash on Delivery (COD) is available upon receiving your food. We also accept bKash, Nagad, and Rocket mobile payments.</p>
                    </div>
                    <div className="pt-3">
                      <h4 className="font-bold text-slate-900 text-sm mb-1">Q: Can you cater for parties of 50 to 500+ guests?</h4>
                      <p className="text-slate-600">A: Absolutely! Fill out our catering quote request form or call our hotline to customize your menu and pricing.</p>
                    </div>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </div>
          )}

          {pageType === 'privacy-policy' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-5">
                <h1 className="text-2xl font-bold text-slate-900">
                  {language === 'en' ? 'Privacy Policy' : 'গোপনীয়তা নীতিমালা'}
                </h1>
              </div>
              <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                {language === 'en' ? (
                  <p>
                    &quot;Ghorer Shad&quot; ensures the full privacy and confidentiality of your personal information. Customer details collected for order placement (name, phone number, delivery address) are strictly used solely for food delivery and communication. Your data is never sold or disclosed to any third parties.
                  </p>
                ) : (
                  <p>
                    &quot;ঘরের স্বাদ&quot; গ্রাহকদের ব্যক্তিগত তথ্যের সম্পূর্ণ নিরাপত্তা নিশ্চিত করে। অর্ডারের জন্য সংগ্রহকৃত নাম, ফোন নম্বর এবং ঠিকানা শুধুমাত্র খাবার ডেলিভারি ও যোগাযোগ রক্ষার কাজে ব্যবহৃত হয়। কোনো তৃতীয় পক্ষের কাছে আপনার তথ্য কখনোই প্রকাশ বা বিক্রি করা হয় না।
                  </p>
                )}
              </div>
            </div>
          )}

          {pageType === 'terms' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-5">
                <h1 className="text-2xl font-bold text-slate-900">
                  {language === 'en' ? 'Terms & Conditions' : 'শর্তাবলী ও নিয়মাবলী'}
                </h1>
              </div>
              <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                {language === 'en' ? (
                  <p>
                    By using this website, you agree to our advance ordering policy and service terms. In situations involving natural weather disruptions or unforeseen events, delivery times may be slightly adjusted with prompt telephone notification to the customer.
                  </p>
                ) : (
                  <p>
                    ওয়েবসাইট ব্যবহারের মাধ্যমে আপনি আমাদের অগ্রিম অর্ডার পলিসি এবং শর্তাবলীর সাথে একমত পোষণ করছেন। প্রাকৃতিক দুর্যোগ, রাজনৈতিক হরতাল বা অনাকাঙ্ক্ষিত কোনো পরিস্থিতিতে ডেলিভারির সময়সূচীতে সামান্য পরিবর্তন হতে পারে যা গ্রাহককে ফোনে জানিয়ে দেওয়া হবে।
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
