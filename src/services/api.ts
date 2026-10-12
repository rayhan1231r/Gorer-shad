import {
  BusinessConfig,
  Category,
  FoodItem,
  DeliveryZone,
  Coupon,
  Order,
  CateringInquiry,
  CustomerRecord,
  FinancialSummary,
  OrderStatus,
  PaymentStatus,
  SmtpConfig,
  CustomerReview,
  AppUser,
  PaymentMethodConfig,
  LeaderboardUser,
  BroadcastEmailPayload,
  HomepageContent,
  GeminiConfig
} from '../types/index.ts';

const API_BASE = '/api';

// Admin & user token management
let currentToken = typeof window !== 'undefined' ? localStorage.getItem('gs_auth_token') || '' : '';

export function setAuthToken(token: string) {
  currentToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('gs_auth_token', token);
    } else {
      localStorage.removeItem('gs_auth_token');
    }
  }
}

export function getAuthToken(): string {
  if (!currentToken && typeof window !== 'undefined') {
    currentToken = localStorage.getItem('gs_auth_token') || '';
  }
  return currentToken;
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth Token
  setToken: setAuthToken,
  getToken: getAuthToken,

  // Business Config
  async getConfig(): Promise<BusinessConfig> {
    const res = await fetch(`${API_BASE}/config`);
    return res.json();
  },
  async updateConfig(updates: Partial<BusinessConfig>): Promise<BusinessConfig> {
    const res = await fetch(`${API_BASE}/config`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update config');
    return res.json();
  },

  // SMTP Settings
  async getSmtpConfig(): Promise<SmtpConfig> {
    const res = await fetch(`${API_BASE}/admin/smtp`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch SMTP settings');
    return res.json();
  },
  async updateSmtpConfig(config: Partial<SmtpConfig>): Promise<SmtpConfig> {
    const res = await fetch(`${API_BASE}/admin/smtp`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error('Failed to update SMTP settings');
    return res.json();
  },
  async testSmtp(testEmail: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/admin/smtp/test`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ testEmail }),
    });
    return res.json();
  },

  // Customer Authentication & OTP
  async signupRequest(payload: { name: string; email: string; password: string; confirmPassword?: string }): Promise<{
    success: boolean;
    maskedEmail: string;
    cooldownSeconds: number;
    emailSent: boolean;
    smtpConfigured: boolean;
    debugNotice?: string;
    error?: string;
  }> {
    const res = await fetch(`${API_BASE}/auth/signup-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Signup request failed');
    return data;
  },

  async signupVerify(email: string, otp: string): Promise<{
    success: boolean;
    message: string;
    user?: AppUser;
    token?: string;
  }> {
    const res = await fetch(`${API_BASE}/auth/signup-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Verification failed');
    if (data.token) setAuthToken(data.token);
    return data;
  },

  async resendOtp(email: string): Promise<{
    success: boolean;
    message: string;
    debugNotice?: string;
    cooldownRemaining?: number;
  }> {
    const res = await fetch(`${API_BASE}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to resend OTP');
    return data;
  },

  async forgotPasswordRequest(email: string): Promise<{
    success: boolean;
    maskedEmail: string;
    cooldownSeconds: number;
    emailSent: boolean;
    smtpConfigured: boolean;
    debugNotice?: string;
  }> {
    const res = await fetch(`${API_BASE}/auth/forgot-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'পাসওয়ার্ড রিসেট ওটিপি পাঠাতে ব্যর্থ হয়েছে');
    return data;
  },

  async forgotPasswordResend(email: string): Promise<{
    success: boolean;
    message: string;
    debugNotice?: string;
    cooldownRemaining?: number;
  }> {
    const res = await fetch(`${API_BASE}/auth/forgot-resend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'ওটিপি পুনরায় পাঠাতে ব্যর্থ হয়েছে');
    return data;
  },

  async forgotPasswordReset(payload: {
    email: string;
    otp: string;
    newPassword: string;
    confirmPassword?: string;
  }): Promise<{
    success: boolean;
    message: string;
    user?: AppUser;
    token?: string;
  }> {
    const res = await fetch(`${API_BASE}/auth/forgot-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'পাসওয়ার্ড রিসেট ব্যর্থ হয়েছে');
    if (data.token) setAuthToken(data.token);
    return data;
  },

  async login(email: string, password: string): Promise<{
    success: boolean;
    user?: AppUser;
    token?: string;
    message?: string;
  }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Login failed');
    if (data.token) setAuthToken(data.token);
    return data;
  },

  async googleAuthSync(user: { uid?: string; email: string; displayName?: string; photoURL?: string }): Promise<{
    success: boolean;
    user: AppUser;
    token: string;
  }> {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Google auth sync failed');
    if (data.token) setAuthToken(data.token);
    return data;
  },

  async getCurrentUser(): Promise<AppUser | null> {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: authHeaders(),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.user || null;
    } catch {
      return null;
    }
  },

  // Customer Reviews
  async getReviews(all = false, foodId?: string): Promise<CustomerReview[]> {
    const params = new URLSearchParams();
    if (all) params.append('all', 'true');
    if (foodId) params.append('foodId', foodId);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/reviews${query}`);
    return res.json();
  },
  async submitReview(review: Partial<CustomerReview>): Promise<CustomerReview> {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    });
    return res.json();
  },
  async approveReview(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/reviews/${id}/approve`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    return res.json();
  },
  async updateReviewStatus(id: string, status: 'approved' | 'hidden' | 'pending'): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/reviews/${id}/status`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    });
    return res.json();
  },
  async reportReview(id: string, reason = 'Inappropriate content'): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/reviews/${id}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    return res.json();
  },
  async resolveReportReview(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/reviews/${id}/resolve-report`, {
      method: 'POST',
      headers: authHeaders(),
    });
    return res.json();
  },
  async deleteReview(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/reviews/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return res.json();
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories`);
    return res.json();
  },
  async saveCategory(category: Category): Promise<Category> {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(category),
    });
    return res.json();
  },
  async deleteCategory(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return res.json();
  },

  // Foods
  async getFoods(category?: string, search?: string): Promise<FoodItem[]> {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (search) params.append('search', search);
    const res = await fetch(`${API_BASE}/foods?${params.toString()}`);
    return res.json();
  },
  async getFoodById(id: string): Promise<FoodItem> {
    const res = await fetch(`${API_BASE}/foods/${id}`);
    if (!res.ok) throw new Error('Food not found');
    return res.json();
  },
  async saveFood(food: FoodItem): Promise<FoodItem> {
    const res = await fetch(`${API_BASE}/foods`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(food),
    });
    return res.json();
  },
  async deleteFood(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/foods/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return res.json();
  },

  // Delivery Zones
  async getDeliveryZones(): Promise<DeliveryZone[]> {
    const res = await fetch(`${API_BASE}/delivery-zones`);
    return res.json();
  },
  async saveDeliveryZone(zone: DeliveryZone): Promise<DeliveryZone> {
    const res = await fetch(`${API_BASE}/delivery-zones`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(zone),
    });
    return res.json();
  },
  async deleteDeliveryZone(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/delivery-zones/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return res.json();
  },

  // Payment Methods
  async getPaymentMethods(all = false): Promise<PaymentMethodConfig[]> {
    const res = await fetch(`${API_BASE}/payment-methods${all ? '?all=true' : ''}`);
    return res.json();
  },
  async savePaymentMethod(pm: PaymentMethodConfig): Promise<PaymentMethodConfig> {
    const res = await fetch(`${API_BASE}/payment-methods`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(pm),
    });
    return res.json();
  },
  async deletePaymentMethod(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/payment-methods/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return res.json();
  },
  async togglePaymentMethod(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/payment-methods/${id}/toggle`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    return res.json();
  },

  // Coupons
  async getCoupons(): Promise<Coupon[]> {
    const res = await fetch(`${API_BASE}/coupons`);
    return res.json();
  },
  async saveCoupon(coupon: Coupon): Promise<Coupon> {
    const res = await fetch(`${API_BASE}/coupons`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(coupon),
    });
    return res.json();
  },
  async validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; discount: number; message: string }> {
    const res = await fetch(`${API_BASE}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal }),
    });
    return res.json();
  },

  // Orders
  async getMyOrders(): Promise<Order[]> {
    const res = await fetch(`${API_BASE}/orders/my-orders`, {
      headers: authHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  },
  async getLeaderboard(): Promise<LeaderboardUser[]> {
    const res = await fetch(`${API_BASE}/leaderboard`, {
      headers: authHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  },
  async getOrders(phone?: string, status?: string): Promise<Order[]> {
    const params = new URLSearchParams();
    if (phone) params.append('phone', phone);
    if (status && status !== 'all') params.append('status', status);
    const res = await fetch(`${API_BASE}/orders?${params.toString()}`, {
      headers: authHeaders(),
    });
    return res.json();
  },
  async getOrder(identifier: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(identifier)}`);
    if (!res.ok) throw new Error('Order not found');
    return res.json();
  },
  async createOrder(orderData: Partial<Order>): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) throw new Error('Failed to create order');
    return res.json();
  },
  async updateOrderStatus(
    id: string,
    status: OrderStatus,
    note?: string,
    additionalUpdates?: {
      assignedDeliveryPerson?: string;
      adminNotes?: string;
      requestedTimeSlot?: string;
      paymentStatus?: PaymentStatus;
      kitchenStatus?: Order['kitchenStatus'];
    }
  ): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status, note, ...additionalUpdates }),
    });
    if (!res.ok) throw new Error('Failed to update order status');
    return res.json();
  },

  async resetOrderCount(confirmationCode: string, mode: 'all' | 'counter_only' = 'all'): Promise<{ success: boolean; message: string; remainingOrdersCount: number }> {
    const res = await fetch(`${API_BASE}/admin/orders/reset`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ confirmationCode, mode }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reset orders');
    return data;
  },

  // Catering
  async getCateringInquiries(): Promise<CateringInquiry[]> {
    const res = await fetch(`${API_BASE}/catering`);
    return res.json();
  },
  async createCateringInquiry(data: Partial<CateringInquiry>): Promise<CateringInquiry> {
    const res = await fetch(`${API_BASE}/catering`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async updateCateringInquiry(id: string, updates: Partial<CateringInquiry>): Promise<CateringInquiry> {
    const res = await fetch(`${API_BASE}/catering/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  // Customers
  async getCustomers(): Promise<CustomerRecord[]> {
    const res = await fetch(`${API_BASE}/customers`, {
      headers: authHeaders(),
    });
    return res.json();
  },
  async toggleBlockCustomer(phone: string, reason?: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/customers/${phone}/block`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ reason }),
    });
    return res.json();
  },

  // Financial & Reports
  async getReports(): Promise<{ summary: FinancialSummary; expenses: { id: string; date: string; title: string; category: string; amount: number }[] }> {
    const res = await fetch(`${API_BASE}/reports`, {
      headers: authHeaders(),
    });
    return res.json();
  },
  async addExpense(title: string, category: string, amount: number) {
    const res = await fetch(`${API_BASE}/expenses`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ title, category, amount }),
    });
    return res.json();
  },

  // Audit Logs
  async getAuditLogs() {
    const res = await fetch(`${API_BASE}/audit-logs`, {
      headers: authHeaders(),
    });
    return res.json();
  },

  // Upload image (returns URL)
  async uploadImage(dataUrl: string, filename?: string): Promise<{ url: string }> {
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl, filename }),
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },

  // Admin login with password
  async adminLogin(password: string, email?: string): Promise<{ success: boolean; token?: string; user?: { role: string; name: string }; message?: string }> {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, email }),
    });
    const data = await res.json();
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  // Server-side verification for Firebase Admin Authentication
  async adminVerifyFirebase(user: { uid: string; email: string; displayName?: string; role?: string }): Promise<{
    success: boolean;
    verified: boolean;
    token?: string;
    user?: AppUser;
    message?: string;
  }> {
    const res = await fetch(`${API_BASE}/admin/verify-firebase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    const data = await res.json();
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  // Verify current token has admin/staff role
  async verifyAdminRole(): Promise<{ success: boolean; verified: boolean; user?: AppUser }> {
    try {
      const res = await fetch(`${API_BASE}/admin/verify-role`, {
        headers: authHeaders(),
      });
      if (!res.ok) return { success: false, verified: false };
      return res.json();
    } catch {
      return { success: false, verified: false };
    }
  },

  // 15. User & Role Management
  async getUsers(): Promise<{ users: AppUser[]; owner: AppUser | null }> {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  async createAdminUser(payload: { name: string; email: string; phone?: string; role: 'admin' | 'subadmin' | 'staff'; password?: string }): Promise<{ success: boolean; user?: AppUser; message?: string }> {
    const res = await fetch(`${API_BASE}/admin/users`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create user');
    return data;
  },

  async updateUserRole(userId: string, role: string): Promise<{ success: boolean; message: string; user?: AppUser }> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update user role');
    return data;
  },

  async transferOwnership(newOwnerEmailOrId: string): Promise<{ success: boolean; message: string; newOwner?: AppUser; previousOwner?: AppUser }> {
    const res = await fetch(`${API_BASE}/admin/transfer-ownership`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ newOwnerEmailOrId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to transfer ownership');
    return data;
  },

  async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete user');
    return data;
  },

  async resetUserPassword(userId: string, password?: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/reset-password`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reset password');
    return data;
  },


  // 16. AI Services
  async askCustomerSupportAi(message: string, history?: { role: 'user' | 'model'; text: string }[]): Promise<{ reply: string; suggestedActions?: { label: string; action: string; targetId?: string }[] }> {
    const res = await fetch(`${API_BASE}/ai/customer-support`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    });
    if (!res.ok) throw new Error('Failed to get AI response');
    return res.json();
  },

  async adminGenerateFoodWithAi(nameBn: string, categoryName: string, spiceLevel?: string): Promise<{
    shortDescBn: string;
    fullDescBn: string;
    portionBn: string;
    suggestedPrice: number;
    prepTimeMinutes: number;
    advanceNoticeRequiredHours?: number;
  }> {
    const res = await fetch(`${API_BASE}/ai/admin-generate-food`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ nameBn, categoryName, spiceLevel }),
    });
    if (!res.ok) throw new Error('Failed to generate food description');
    return res.json();
  },

  async askAdminAi(message: string): Promise<{ reply: string }> {
    const res = await fetch(`${API_BASE}/ai/admin-chat`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error('Failed to get AI advisor response');
    return res.json();
  },

  async updateProfile(updates: {
    name?: string;
    phone?: string;
    addresses?: string[];
    avatarUrl?: string;
    bio?: string;
    dietaryPreferences?: string[];
    currentPassword?: string;
    newPassword?: string;
  }): Promise<{ user?: AppUser; message?: string }> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update profile');
    return data;
  },

  async resetOrders(confirmationCode: string, mode: 'counter_only' | 'all' = 'all'): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/admin/orders/reset`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ confirmationCode, mode }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'অর্ডার রিসেট করতে ব্যর্থ হয়েছে');
    return data;
  },

  // 17. Notifications & Broadcast
  async getNotificationEmails(): Promise<string[]> {
    const res = await fetch(`${API_BASE}/admin/notification-emails`, {
      headers: authHeaders(),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.emails || [];
  },
  async addNotificationEmail(email: string): Promise<{ success: boolean; emails: string[] }> {
    const res = await fetch(`${API_BASE}/admin/notification-emails`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ email }),
    });
    return res.json();
  },
  async deleteNotificationEmail(email: string): Promise<{ success: boolean; emails: string[] }> {
    const res = await fetch(`${API_BASE}/admin/notification-emails/${encodeURIComponent(email)}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return res.json();
  },
  async removeNotificationEmail(email: string): Promise<{ success: boolean; emails: string[] }> {
    return this.deleteNotificationEmail(email);
  },
  async testNotificationEmail(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/admin/notification-emails/test`, {
      method: 'POST',
      headers: authHeaders(),
    });
    return res.json();
  },
  async broadcastEmail(payload: BroadcastEmailPayload): Promise<{ success: boolean; sentCount: number; message: string }> {
    const res = await fetch(`${API_BASE}/admin/broadcast-email`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'ব্রডকাস্ট পাঠাতে ব্যর্থ');
    return data;
  },
  async composeEmailWithAi(prompt: string, tone?: string, foodId?: string): Promise<{ subject: string; headline: string; contentText: string }> {
    const res = await fetch(`${API_BASE}/ai/compose-email`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ prompt, tone, foodId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'এআই ইমেইল তৈরি ব্যর্থ');
    return data;
  },
  async getHomepageContent(): Promise<HomepageContent> {
    const res = await fetch(`${API_BASE}/homepage`);
    if (!res.ok) throw new Error('Failed to load homepage content');
    return res.json();
  },
  async updateHomepageContent(data: Partial<HomepageContent>): Promise<HomepageContent> {
    const res = await fetch(`${API_BASE}/homepage`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update homepage content');
    return res.json();
  },

  // Gemini AI Engine Configuration
  async getGeminiConfig(): Promise<GeminiConfig> {
    const res = await fetch(`${API_BASE}/admin/gemini`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch Gemini configuration');
    return res.json();
  },
  async updateGeminiApiKey(apiKey: string): Promise<GeminiConfig> {
    const res = await fetch(`${API_BASE}/admin/gemini`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ apiKey }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update Gemini API key');
    }
    return res.json();
  },
  async testGeminiApiKey(apiKey?: string): Promise<{ success: boolean; message: string; sampleReply?: string }> {
    const res = await fetch(`${API_BASE}/admin/gemini/test`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ apiKey }),
    });
    return res.json();
  }
};
