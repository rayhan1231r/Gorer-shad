export interface Division {
  id: string;
  nameBn: string;
  nameEn: string;
}

export interface District {
  id: string;
  divisionId: string;
  nameBn: string;
  nameEn: string;
  zoneType: 'local' | 'dhaka_city' | 'dhaka_suburb' | 'nationwide';
  defaultCharge: number;
  deliveryTime: string;
}

export const BD_DIVISIONS: Division[] = [
  { id: 'dhaka', nameBn: 'ঢাকা', nameEn: 'Dhaka' },
  { id: 'chattogram', nameBn: 'চট্টগ্রাম', nameEn: 'Chattogram' },
  { id: 'rajshahi', nameBn: 'রাজশাহী', nameEn: 'Rajshahi' },
  { id: 'khulna', nameBn: 'খুলনা', nameEn: 'Khulna' },
  { id: 'barishal', nameBn: 'বরিশাল', nameEn: 'Barishal' },
  { id: 'sylhet', nameBn: 'সিলেট', nameEn: 'Sylhet' },
  { id: 'rangpur', nameBn: 'রংপুর', nameEn: 'Rangpur' },
  { id: 'mymensingh', nameBn: 'ময়মনসিংহ', nameEn: 'Mymensingh' }
];

export const BD_DISTRICTS: District[] = [
  // Dhaka Division
  { id: 'narayanganj', divisionId: 'dhaka', nameBn: 'নারায়ণগঞ্জ (আড়াইহাজার ও সদর)', nameEn: 'Narayanganj', zoneType: 'local', defaultCharge: 40, deliveryTime: '৩০-৬০ মিনিট' },
  { id: 'dhaka-city', divisionId: 'dhaka', nameBn: 'ঢাকা মহানগর (উত্তর ও দক্ষিণ)', nameEn: 'Dhaka City', zoneType: 'dhaka_city', defaultCharge: 80, deliveryTime: '২-৪ ঘন্টা / একই দিন' },
  { id: 'gazipur', divisionId: 'dhaka', nameBn: 'গাজীপুর', nameEn: 'Gazipur', zoneType: 'dhaka_suburb', defaultCharge: 90, deliveryTime: '২৪ ঘন্টা' },
  { id: 'munshiganj', divisionId: 'dhaka', nameBn: 'মুন্সীগঞ্জ', nameEn: 'Munshiganj', zoneType: 'dhaka_suburb', defaultCharge: 90, deliveryTime: '২৪ ঘন্টা' },
  { id: 'manikganj', divisionId: 'dhaka', nameBn: 'মানিকগঞ্জ', nameEn: 'Manikganj', zoneType: 'nationwide', defaultCharge: 110, deliveryTime: '২৪-৪৮ ঘন্টা' },
  { id: 'narsingdi', divisionId: 'dhaka', nameBn: 'নরসিংদী', nameEn: 'Narsingdi', zoneType: 'dhaka_suburb', defaultCharge: 70, deliveryTime: 'একই দিন / ১২ ঘন্টা' },
  { id: 'tangail', divisionId: 'dhaka', nameBn: 'টাঙ্গাইল', nameEn: 'Tangail', zoneType: 'nationwide', defaultCharge: 120, deliveryTime: '১-২ কার্যদিবস' },
  { id: 'faridpur', divisionId: 'dhaka', nameBn: 'ফরিদপুর', nameEn: 'Faridpur', zoneType: 'nationwide', defaultCharge: 120, deliveryTime: '১-২ কার্যদিবস' },
  { id: 'gopalganj', divisionId: 'dhaka', nameBn: 'গোপালগঞ্জ', nameEn: 'Gopalganj', zoneType: 'nationwide', defaultCharge: 120, deliveryTime: '১-২ কার্যদিবস' },
  { id: 'madaripur', divisionId: 'dhaka', nameBn: 'মাদারীপুর', nameEn: 'Madaripur', zoneType: 'nationwide', defaultCharge: 120, deliveryTime: '১-২ কার্যদিবস' },
  { id: 'rajbari', divisionId: 'dhaka', nameBn: 'রাজবাড়ী', nameEn: 'Rajbari', zoneType: 'nationwide', defaultCharge: 120, deliveryTime: '১-২ কার্যদিবস' },
  { id: 'shariatpur', divisionId: 'dhaka', nameBn: 'শরীয়তপুর', nameEn: 'Shariatpur', zoneType: 'nationwide', defaultCharge: 120, deliveryTime: '১-২ কার্যদিবস' },
  { id: 'kishoreganj', divisionId: 'dhaka', nameBn: 'কিশোরগঞ্জ', nameEn: 'Kishoreganj', zoneType: 'nationwide', defaultCharge: 110, deliveryTime: '১-২ কার্যদিবস' },

  // Chattogram Division
  { id: 'chattogram-dist', divisionId: 'chattogram', nameBn: 'চট্টগ্রাম', nameEn: 'Chattogram', zoneType: 'nationwide', defaultCharge: 130, deliveryTime: '১-২ কার্যদিবস' },
  { id: 'coxsbazar', divisionId: 'chattogram', nameBn: 'কক্সবাজার', nameEn: 'Cox\'s Bazar', zoneType: 'nationwide', defaultCharge: 140, deliveryTime: '২ কার্যদিবস' },
  { id: 'cumilla', divisionId: 'chattogram', nameBn: 'কুমিল্লা', nameEn: 'Cumilla', zoneType: 'nationwide', defaultCharge: 110, deliveryTime: '২৪-৪৮ ঘন্টা' },
  { id: 'brahmanbaria', divisionId: 'chattogram', nameBn: 'ব্রাহ্মণবাড়িয়া', nameEn: 'Brahmanbaria', zoneType: 'nationwide', defaultCharge: 100, deliveryTime: '২৪-৪৮ ঘন্টা' },
  { id: 'chandpur', divisionId: 'chattogram', nameBn: 'চাঁদপুর', nameEn: 'Chandpur', zoneType: 'nationwide', defaultCharge: 120, deliveryTime: '১-২ কার্যদিবস' },
  { id: 'noakhali', divisionId: 'chattogram', nameBn: 'নোয়াখালী', nameEn: 'Noakhali', zoneType: 'nationwide', defaultCharge: 130, deliveryTime: '১-২ কার্যদিবস' },
  { id: 'feni', divisionId: 'chattogram', nameBn: 'ফেনী', nameEn: 'Feni', zoneType: 'nationwide', defaultCharge: 120, deliveryTime: '১-২ কার্যদিবস' },
  { id: 'lakshmipur', divisionId: 'chattogram', nameBn: 'লক্ষ্মীপুর', nameEn: 'Lakshmipur', zoneType: 'nationwide', defaultCharge: 130, deliveryTime: '১-২ কার্যদিবস' },
  { id: 'khagrachhari', divisionId: 'chattogram', nameBn: 'খাগড়াছড়ি', nameEn: 'Khagrachhari', zoneType: 'nationwide', defaultCharge: 140, deliveryTime: '২-৩ কার্যদিবস' },
  { id: 'rangamati', divisionId: 'chattogram', nameBn: 'রাঙ্গামাটি', nameEn: 'Rangamati', zoneType: 'nationwide', defaultCharge: 140, deliveryTime: '২-৩ কার্যদিবস' },
  { id: 'bandarban', divisionId: 'chattogram', nameBn: 'বান্দরবান', nameEn: 'Bandarban', zoneType: 'nationwide', defaultCharge: 140, deliveryTime: '২-৩ কার্যদিবস' },

  // Sylhet Division
  { id: 'sylhet-dist', divisionId: 'sylhet', nameBn: 'সিলেট', nameEn: 'Sylhet', zoneType: 'nationwide', defaultCharge: 130, deliveryTime: '১-২ কার্যদিবস' },
  { id: 'moulvibazar', divisionId: 'sylhet', nameBn: 'মৌলভীবাজার', nameEn: 'Moulvibazar', zoneType: 'nationwide', defaultCharge: 130, deliveryTime: '১-২ কার্যদিবস' },
  { id: 'habiganj', divisionId: 'sylhet', nameBn: 'হবিগঞ্জ', nameEn: 'Habiganj', zoneType: 'nationwide', defaultCharge: 120, deliveryTime: '১-২ কার্যদিবস' },
  { id: 'sunamganj', divisionId: 'sylhet', nameBn: 'সুনামগঞ্জ', nameEn: 'Sunamganj', zoneType: 'nationwide', defaultCharge: 130, deliveryTime: '২ কার্যদিবস' },

  // Rajshahi Division
  { id: 'rajshahi-dist', divisionId: 'rajshahi', nameBn: 'রাজশাহী', nameEn: 'Rajshahi', zoneType: 'nationwide', defaultCharge: 130, deliveryTime: '১-২ কার্যদিবস' },
  { id: 'bogra', divisionId: 'rajshahi', nameBn: 'বগুড়া', nameEn: 'Bogura', zoneType: 'nationwide', defaultCharge: 130, deliveryTime: '১-২ কার্যদিবস' },
  { id: 'pabna', divisionId: 'rajshahi', nameBn: 'পাবনা', nameEn: 'Pabna', zoneType: 'nationwide', defaultCharge: 130, deliveryTime: '১-২ কার্যদিবস' },
  { id: 'sirajganj', divisionId: 'rajshahi', nameBn: 'সিরাজগঞ্জ', nameEn: 'Sirajganj', zoneType: 'nationwide', defaultCharge: 120, deliveryTime: '১-২ কার্যদিবস' },
  { id: 'naogaon', divisionId: 'rajshahi', nameBn: 'নওগাঁ', nameEn: 'Naogaon', zoneType: 'nationwide', defaultCharge: 130, deliveryTime: '১-২ কার্যদিবস' },
  { id: 'natore', divisionId: 'rajshahi', nameBn: 'নাটোর', nameEn: 'Natore', zoneType: 'nationwide', defaultCharge: 130, deliveryTime: '১-২ কার্যদিবস' },
  { id: 'chapai-nawabganj', divisionId: 'rajshahi', nameBn: 'চাঁপাইনবাবগঞ্জ', nameEn: 'Chapai Nawabganj', zoneType: 'nationwide', defaultCharge: 140, deliveryTime: '২ কার্যদিবস' },
  { id: 'joypurhat', divisionId: 'rajshahi', nameBn: 'জয়পুরহাট', nameEn: 'Joypurhat', zoneType: 'nationwide', defaultCharge: 130, deliveryTime: '২ কার্যদিবস' },

  // Khulna Division
  { id: 'khulna-dist', divisionId: 'khulna', nameBn: 'খুলনা', nameEn: 'Khulna', zoneType: 'nationwide', defaultCharge: 130, deliveryTime: '১-২ কার্যদিবস' },
  { id: 'jashore', divisionId: 'khulna', nameBn: 'যশোর', nameEn: 'Jashore', zoneType: 'nationwide', defaultCharge: 130, deliveryTime: '১-২ কার্যদিবস' },
  { id: 'kushtia', divisionId: 'khulna', nameBn: 'কুষ্টিয়া', nameEn: 'Kushtia', zoneType: 'nationwide', defaultCharge: 130, deliveryTime: '১-২ কার্যদিবস' },
  { id: 'satkhira', divisionId: 'khulna', nameBn: 'সাতক্ষীরা', nameEn: 'Satkhira', zoneType: 'nationwide', defaultCharge: 130, deliveryTime: '২ কার্যদিবস' },
  { id: 'bagerhat', divisionId: 'khulna', nameBn: 'বাগেরহাট', nameEn: 'Bagerhat', zoneType: 'nationwide', defaultCharge: 130, deliveryTime: '২ কার্যদিবস' },
  { id: 'chuadanga', divisionId: 'khulna', nameBn: 'চুয়াডাঙ্গা', nameEn: 'Chuadanga', zoneType: 'nationwide', defaultCharge: 130, deliveryTime: '২ কার্যদিবস' },
  { id: 'jhenaidah', divisionId: 'khulna', nameBn: 'ঝিনাইদহ', nameEn: 'Jhenaidah', zoneType: 'nationwide', defaultCharge: 130, deliveryTime: '২ কার্যদিবস' },
  { id: 'magura', divisionId: 'khulna', nameBn: 'মাগুরা', nameEn: 'Magura', zoneType: 'nationwide', defaultCharge: 130, deliveryTime: '২ কার্যদিবস' },
  { id: 'meherpur', divisionId: 'khulna', nameBn: 'মেহেরপুর', nameEn: 'Meherpur', zoneType: 'nationwide', defaultCharge: 140, deliveryTime: '২ কার্যদিবস' },
  { id: 'narail', divisionId: 'khulna', nameBn: 'নড়াইল', nameEn: 'Narail', zoneType: 'nationwide', defaultCharge: 130, deliveryTime: '২ কার্যদিবস' },

  // Barishal Division
  { id: 'barishal-dist', divisionId: 'barishal', nameBn: 'বরিশাল', nameEn: 'Barishal', zoneType: 'nationwide', defaultCharge: 130, deliveryTime: '১-২ কার্যদিবস' },
  { id: 'bhola', divisionId: 'barishal', nameBn: 'ভোলা', nameEn: 'Bhola', zoneType: 'nationwide', defaultCharge: 140, deliveryTime: '২ কার্যদিবস' },
  { id: 'patuakhali', divisionId: 'barishal', nameBn: 'পটুয়াখালী', nameEn: 'Patuakhali', zoneType: 'nationwide', defaultCharge: 140, deliveryTime: '২ কার্যদিবস' },
  { id: 'pirojpur', divisionId: 'barishal', nameBn: 'পিরোজপুর', nameEn: 'Pirojpur', zoneType: 'nationwide', defaultCharge: 130, deliveryTime: '২ কার্যদিবস' },
  { id: 'barguna', divisionId: 'barishal', nameBn: 'বরগুনা', nameEn: 'Barguna', zoneType: 'nationwide', defaultCharge: 140, deliveryTime: '২ কার্যদিবস' },
  { id: 'jhalokati', divisionId: 'barishal', nameBn: 'ঝালকাঠি', nameEn: 'Jhalokati', zoneType: 'nationwide', defaultCharge: 130, deliveryTime: '২ কার্যদিবস' },

  // Rangpur Division
  { id: 'rangpur-dist', divisionId: 'rangpur', nameBn: 'রংপুর', nameEn: 'Rangpur', zoneType: 'nationwide', defaultCharge: 130, deliveryTime: '১-২ কার্যদিবস' },
  { id: 'dinajpur', divisionId: 'rangpur', nameBn: 'দিনাজপুর', nameEn: 'Dinajpur', zoneType: 'nationwide', defaultCharge: 140, deliveryTime: '২ কার্যদিবস' },
  { id: 'gaibandha', divisionId: 'rangpur', nameBn: 'গাইবান্ধা', nameEn: 'Gaibandha', zoneType: 'nationwide', defaultCharge: 130, deliveryTime: '২ কার্যদিবস' },
  { id: 'kurigram', divisionId: 'rangpur', nameBn: 'কুড়িগ্রাম', nameEn: 'Kurigram', zoneType: 'nationwide', defaultCharge: 140, deliveryTime: '২ কার্যদিবস' },
  { id: 'lalmonirhat', divisionId: 'rangpur', nameBn: 'লালমনিরহাট', nameEn: 'Lalmonirhat', zoneType: 'nationwide', defaultCharge: 140, deliveryTime: '২ কার্যদিবস' },
  { id: 'nilphamari', divisionId: 'rangpur', nameBn: 'নীলফামারী', nameEn: 'Nilphamari', zoneType: 'nationwide', defaultCharge: 140, deliveryTime: '২ কার্যদিবস' },
  { id: 'panchagarh', divisionId: 'rangpur', nameBn: 'পঞ্চগড়', nameEn: 'Panchagarh', zoneType: 'nationwide', defaultCharge: 150, deliveryTime: '২-৩ কার্যদিবস' },
  { id: 'thakurgaon', divisionId: 'rangpur', nameBn: 'ঠাকুরগাঁও', nameEn: 'Thakurgaon', zoneType: 'nationwide', defaultCharge: 150, deliveryTime: '২-৩ কার্যদিবস' },

  // Mymensingh Division
  { id: 'mymensingh-dist', divisionId: 'mymensingh', nameBn: 'ময়মনসিংহ', nameEn: 'Mymensingh', zoneType: 'nationwide', defaultCharge: 120, deliveryTime: '২৪-৪৮ ঘন্টা' },
  { id: 'jamalpur', divisionId: 'mymensingh', nameBn: 'জামালপুর', nameEn: 'Jamalpur', zoneType: 'nationwide', defaultCharge: 130, deliveryTime: '১-২ কার্যদিবস' },
  { id: 'netrokona', divisionId: 'mymensingh', nameBn: 'নেত্রকোণা', nameEn: 'Netrokona', zoneType: 'nationwide', defaultCharge: 130, deliveryTime: '১-২ কার্যদিবস' },
  { id: 'sherpur', divisionId: 'mymensingh', nameBn: 'শেরপুর', nameEn: 'Sherpur', zoneType: 'nationwide', defaultCharge: 130, deliveryTime: '২ কার্যদিবস' }
];
