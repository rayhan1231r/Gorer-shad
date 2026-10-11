export type Language = 'bn' | 'en';

export type OrderStatus =
  | 'placed'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'rejected';

export type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'rocket' | 'bank' | 'upay' | 'card' | string;
export type PaymentStatus = 'pending' | 'verified' | 'paid' | 'failed' | 'refunded';

export interface PaymentMethodConfig {
  id: string;
  nameBn: string;
  nameEn: string;
  type: 'bkash' | 'nagad' | 'rocket' | 'upay' | 'bank' | 'cod' | 'card' | 'other';
  accountType?: 'Personal' | 'Merchant' | 'Agent';
  accountNumber: string;
  chargePercentage?: number;
  instructionsBn?: string;
  instructionsEn?: string;
  isActive: boolean;
  requiresTransactionId: boolean;
  sortOrder: number;
}

export interface FoodVariant {
  id: string;
  nameBn: string;
  nameEn: string;
  additionalPrice: number;
}

export interface FoodAddon {
  id: string;
  nameBn: string;
  nameEn: string;
  price: number;
}

export interface FoodItem {
  id: string;
  sku: string;
  nameBn: string;
  nameEn: string;
  categoryId: string;
  categoryNameBn: string;
  shortDescBn: string;
  fullDescBn: string;
  image: string;
  price: number;
  salePrice?: number;
  portionBn: string;
  portionEn?: string;
  prepTimeMinutes: number;
  spiceLevel?: 'Mild' | 'Medium' | 'Spicy';
  isAvailable: boolean;
  dailyStock: number;
  currentStock: number;
  minOrderQty: number;
  isFeatured: boolean;
  isBestseller: boolean;
  variants: FoodVariant[];
  addons: FoodAddon[];
  ingredientsBn?: string;
  advanceNoticeRequiredHours?: number;
}

export interface Category {
  id: string;
  nameBn: string;
  nameEn: string;
  descriptionBn: string;
  iconName?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface DeliveryZone {
  id: string;
  nameBn: string;
  nameEn: string;
  upazilaOrArea: string;
  division?: string;
  charge: number;
  minOrderAmount: number;
  freeDeliveryThreshold: number;
  estimatedDeliveryMinutes: string;
  isActive: boolean;
  zoneScope?: 'local' | 'dhaka_city' | 'dhaka_suburb' | 'division' | 'nationwide';
  courierPartner?: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  expiresAt: string;
  isActive: boolean;
  usageCount: number;
}

export interface CartItem {
  cartItemId: string;
  foodId: string;
  food: FoodItem;
  quantity: number;
  selectedVariant?: FoodVariant;
  selectedAddons: FoodAddon[];
  specialNotes?: string;
  unitPrice: number;
  itemTotal: number;
}

export interface OrderItem {
  foodId: string;
  sku: string;
  nameBn: string;
  nameEn: string;
  quantity: number;
  selectedVariantName?: string;
  selectedAddonsNames?: string[];
  unitPrice: number;
  itemTotal: number;
  specialNotes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryZoneId: string;
  deliveryZoneName: string;
  deliveryAddress: string;
  deliveryLandmark?: string;
  division?: string;
  district?: string;
  courierPartner?: string;
  paymentMethodTitle?: string;
  requestedDate: string;
  requestedTimeSlot: string;
  isUrgent: boolean;
  customerNotes?: string;
  items: OrderItem[];
  subtotal: number;
  couponCode?: string;
  discountAmount: number;
  deliveryCharge: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentTransactionId?: string;
  orderStatus: OrderStatus;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }[];
  assignedDeliveryPerson?: string;
  adminNotes?: string;
  kitchenStatus?: 'queued' | 'cooking' | 'ready' | 'dispatched';
}

export interface CateringInquiry {
  id: string;
  inquiryNumber: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  guestCount: number;
  eventType: string;
  foodPreferencesBn: string;
  approxBudget?: number;
  additionalNotes?: string;
  status: 'pending' | 'quoted' | 'approved' | 'rejected' | 'converted';
  quotation?: {
    totalEstimatedAmount: number;
    advanceRequired: number;
    advancePaid: number;
    proposedMenu: string;
    validUntil: string;
    notes?: string;
  };
}

export interface CustomerRecord {
  phone: string;
  name: string;
  email?: string;
  firstOrderDate: string;
  lastOrderDate: string;
  totalOrders: number;
  totalSpent: number;
  addresses: string[];
  notes?: string;
  isBlocked: boolean;
  tags: string[];
}

export interface BusinessConfig {
  brandNameBn: string;
  brandNameEn: string;
  taglineBn: string;
  taglineEn: string;
  contactPerson: string;
  phone: string;
  whatsapp: string;
  email: string;
  primaryLocation: string;
  fullAddressBn: string;
  announcementBarBn: string;
  isAnnouncementActive: boolean;
  standardAdvanceHours: number;
  urgentAdvanceHours: number;
  advanceNoticeMessageBn: string;
  openingHoursBn: string;
  currency: string;
  currencySymbol: string;
  bkashNumber: string;
  nagadNumber: string;
  rocketNumber: string;
  bankDetails: string;
  primaryColor?: string;
  accentColor?: string;
}

export interface FinancialSummary {
  todaySales: number;
  todayOrdersCount: number;
  monthSales: number;
  totalRevenue: number;
  totalDeliveryFees: number;
  totalDiscounts: number;
  totalExpenses: number;
  estimatedNetProfit: number;
}

export type UserRole = 'owner' | 'admin' | 'subadmin' | 'staff' | 'customer';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isEmailVerified: boolean;
  provider: 'email_otp' | 'google' | 'password';
  createdAt: string;
  addresses: string[];
}

export interface AiChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp?: string;
  suggestedActions?: { label: string; action: string; targetId?: string }[];
}

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass?: string; // Server only; masked in client response
  isPassSet?: boolean;
  security: 'STARTTLS' | 'SSL' | 'NONE';
  senderEmail: string;
  senderName: string;
  otpExpirationMinutes: number;
  otpResendCooldownSeconds: number;
  maxVerificationAttempts: number;
  isConfigured: boolean;
}

export interface CustomerReview {
  id: string;
  customerId?: string;
  customerName: string;
  customerDisplayName?: string;
  customerEmail?: string;
  foodId?: string;
  productId?: string;
  foodNameBn?: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
  updatedAt?: string;
  isApproved: boolean;
  approvedStatus?: 'approved' | 'pending' | 'hidden';
  isReported?: boolean;
  reportReason?: string;
  isVerifiedPurchase: boolean;
}

export interface HomepageContent {
  heroHeadlineBn: string;
  heroHeadlineEn: string;
  heroSubtitleBn: string;
  heroSubtitleEn: string;
  ctaMenuBtnBn: string;
  ctaCateringBtnBn: string;
  bannerImage?: string;
}
