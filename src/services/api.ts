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
  AppUser
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
  async getReviews(all = false): Promise<CustomerReview[]> {
    const res = await fetch(`${API_BASE}/reviews${all ? '?all=true' : ''}`);
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
  async getOrders(phone?: string, status?: string): Promise<Order[]> {
    const params = new URLSearchParams();
    if (phone) params.append('phone', phone);
    if (status && status !== 'all') params.append('status', status);
    const res = await fetch(`${API_BASE}/orders?${params.toString()}`);
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

  // Admin login
  async adminLogin(password: string): Promise<{ success: boolean; token?: string; user?: { role: string; name: string }; message?: string }> {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  }
};
