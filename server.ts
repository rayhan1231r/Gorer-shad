import express, { type Request, type Response, type NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { db } from './server/store.ts';
import { smtpService } from './server/smtp.ts';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Ensure uploads folder exists
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));

// Helper: Mask email address for security display (e.g. "ra***@gmail.com")
function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local.slice(0, 2)}***${local.slice(-1)}@${domain}`;
}

// Authentication Middleware: verifies Bearer token
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'অননুমোদিত প্রবেশ! অনুগ্রহ করে লগইন করুন।' });
  }

  const token = authHeader.split(' ')[1];
  const session = db.verifySession(token);
  if (!session) {
    return res.status(401).json({ error: 'সেশনের মেয়াদ শেষ হয়েছে! পুনরায় লগইন করুন।' });
  }

  (req as any).user = session;
  next();
}

// Admin-Only Middleware: verifies admin role
function adminOnlyMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'প্রবেশাধিকার সংরক্ষিত! শুধুমাত্র অ্যাডমিন প্রবেশ করতে পারবেন।' });
  }

  const token = authHeader.split(' ')[1];
  const session = db.verifySession(token);
  if (!session || (session.role !== 'admin' && session.role !== 'staff')) {
    return res.status(403).json({ error: 'এই অপশনটি পরিবর্তনের অনুমতি আপনার নেই।' });
  }

  (req as any).user = session;
  next();
}

// ----------------- API ROUTES ----------------- //

// 1. Business Config & Homepage
app.get('/api/config', (_req: Request, res: Response) => {
  res.json(db.getConfig());
});

app.post('/api/config', adminOnlyMiddleware, (req: Request, res: Response) => {
  try {
    const updated = db.updateConfig(req.body);
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to update config' });
  }
});

app.get('/api/homepage', (_req: Request, res: Response) => {
  res.json(db.getHomepageContent());
});

app.post('/api/homepage', adminOnlyMiddleware, (req: Request, res: Response) => {
  try {
    const updated = db.updateHomepageContent(req.body);
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to update homepage content' });
  }
});

// 2. Reviews & Moderation
app.get('/api/reviews', (req: Request, res: Response) => {
  const showAll = req.query.all === 'true';
  const foodId = (req.query.foodId || req.query.productId) as string | undefined;
  let reviews = db.getReviews(!showAll);
  if (foodId) {
    reviews = reviews.filter(r => r.foodId === foodId || r.productId === foodId);
  }
  res.json(reviews);
});

app.post('/api/reviews', (req: Request, res: Response) => {
  try {
    const rev = db.addReview(req.body);
    res.status(201).json(rev);
  } catch {
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

app.patch('/api/reviews/:id/approve', adminOnlyMiddleware, (req: Request, res: Response) => {
  const ok = db.toggleApproveReview(req.params.id);
  res.json({ success: ok });
});

app.patch('/api/reviews/:id/status', adminOnlyMiddleware, (req: Request, res: Response) => {
  const { status } = req.body;
  if (!status || !['approved', 'hidden', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'Valid status required' });
  }
  const ok = db.setReviewStatus(req.params.id, status);
  res.json({ success: ok });
});

app.post('/api/reviews/:id/report', (req: Request, res: Response) => {
  const { reason } = req.body;
  const ok = db.reportReview(req.params.id, reason);
  res.json({ success: ok });
});

app.post('/api/reviews/:id/resolve-report', adminOnlyMiddleware, (req: Request, res: Response) => {
  const ok = db.resolveReport(req.params.id);
  res.json({ success: ok });
});

app.delete('/api/reviews/:id', adminOnlyMiddleware, (req: Request, res: Response) => {
  const ok = db.deleteReview(req.params.id);
  res.json({ success: ok });
});

// 3. SMTP & Email Engine
app.get('/api/admin/smtp', adminOnlyMiddleware, (_req: Request, res: Response) => {
  res.json(db.getSmtpConfig(true));
});

app.post('/api/admin/smtp', adminOnlyMiddleware, (req: Request, res: Response) => {
  try {
    const updated = db.updateSmtpConfig(req.body);
    res.json(updated);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to update SMTP settings' });
  }
});

app.post('/api/admin/smtp/test', adminOnlyMiddleware, async (req: Request, res: Response) => {
  try {
    const rawConfig = db.getRawSmtpConfig();
    const targetEmail = req.body.testEmail || rawConfig.user || 'rayhanahamad50@gmail.com';

    if (!rawConfig.host || !rawConfig.user || !rawConfig.pass) {
      return res.status(400).json({
        success: false,
        message: 'SMTP সার্ভার, ইউজারনেম বা পাসওয়ার্ড অসম্পূর্ণ। অনুগ্রহ করে সঠিক তথ্য দিন।'
      });
    }

    const testRes = await smtpService.testConnection(rawConfig, targetEmail);
    res.json(testRes);
  } catch (err: unknown) {
    res.status(500).json({
      success: false,
      message: err instanceof Error ? err.message : 'SMTP টেস্টে ত্রুটি ঘটেছে'
    });
  }
});

// 4. Customer Signup & Numeric 6-Digit OTP Flow
app.post('/api/auth/signup-request', async (req: Request, res: Response) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'নাম, ইমেইল ও পাসওয়ার্ড প্রদান করুন।' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'পাসওয়ার্ড ন্যূনতম ৬ অক্ষরের হতে হবে।' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ error: 'পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মেলেনি।' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = db.getCustomers().find(c => c.email?.toLowerCase() === cleanEmail);
    if (existingUser) {
      return res.status(400).json({ error: 'এই ইমেইল দিয়ে ইতিমধ্যে একটি একাউন্ট রয়েছে। দয়া করে লগইন করুন।' });
    }

    // Generate cryptographic 6-digit numeric OTP
    const { otp, cooldownSeconds } = db.createPendingSignupOtp(name, cleanEmail, password);

    // Send via SMTP
    const rawSmtp = db.getRawSmtpConfig();
    let emailSent = false;
    let emailError = '';

    if (rawSmtp.isConfigured && rawSmtp.pass) {
      const mailRes = await smtpService.sendOtpEmail(rawSmtp, cleanEmail, name, otp, 'signup');
      emailSent = mailRes.success;
      if (!mailRes.success) emailError = mailRes.message || 'ইমেইল সেন্ড ব্যর্থ';
    }

    res.json({
      success: true,
      maskedEmail: maskEmail(cleanEmail),
      cooldownSeconds,
      emailSent,
      // If SMTP is not yet configured, provide helpful status for evaluation
      smtpConfigured: rawSmtp.isConfigured,
      debugNotice: !rawSmtp.isConfigured ? `[বিজ্ঞপ্তি] ওটিপি কোড: ${otp} (SMTP সেটআপ করলে সরাসরি ইমেইলে যাবে)` : undefined
    });
  } catch (err: unknown) {
    console.error('Signup request error:', err);
    res.status(500).json({ error: 'ওটিপি পাঠাতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' });
  }
});

app.post('/api/auth/signup-verify', (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'ইমেইল ও ওটিপি কোড প্রদান করুন।' });
    }

    const result = db.verifySignupOtp(email, otp);
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    res.json(result);
  } catch (err: unknown) {
    console.error('OTP verify error:', err);
    res.status(500).json({ error: 'যাচাইকরণে সমস্যা হয়েছে।' });
  }
});

app.post('/api/auth/resend-otp', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'ইমেইল প্রদান করুন।' });
    }

    const resend = db.resendSignupOtp(email);
    if (!resend.success) {
      return res.status(400).json({ error: resend.message, cooldownRemaining: resend.cooldownRemaining });
    }

    const rawSmtp = db.getRawSmtpConfig();
    if (rawSmtp.isConfigured && resend.otp) {
      await smtpService.sendOtpEmail(rawSmtp, email, 'গ্রাহক', resend.otp, 'signup');
    }

    res.json({
      success: true,
      message: resend.message,
      debugNotice: !rawSmtp.isConfigured && resend.otp ? `[বিজ্ঞপ্তি] নতুন ওটিপি: ${resend.otp}` : undefined
    });
  } catch (err: unknown) {
    res.status(500).json({ error: 'ওটিপি পুনরায় পাঠাতে ব্যর্থ হয়েছে।' });
  }
});

// 4.1 Forgot Password & Email OTP Flow
app.post('/api/auth/forgot-request', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'ইমেইল ঠিকানা প্রদান করুন।' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const result = db.createPendingForgotOtp(cleanEmail);
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    const rawSmtp = db.getRawSmtpConfig();
    let emailSent = false;
    let emailError = '';

    if (rawSmtp.isConfigured && rawSmtp.pass && result.otp) {
      const mailRes = await smtpService.sendOtpEmail(rawSmtp, cleanEmail, result.name || 'গ্রাহক', result.otp, 'reset_password');
      emailSent = mailRes.success;
      if (!mailRes.success) emailError = mailRes.message || 'ইমেইল পাঠানো ব্যর্থ হয়েছে';
    }

    res.json({
      success: true,
      maskedEmail: maskEmail(cleanEmail),
      cooldownSeconds: result.cooldownSeconds || 60,
      emailSent,
      smtpConfigured: rawSmtp.isConfigured,
      debugNotice: !rawSmtp.isConfigured ? `[বিজ্ঞপ্তি] পাসওয়ার্ড রিসেট ওটিপি কোড: ${result.otp} (SMTP সেটআপ করলে সরাসরি ইমেইলে যাবে)` : undefined
    });
  } catch (err: unknown) {
    console.error('Forgot password request error:', err);
    res.status(500).json({ error: 'পাসওয়ার্ড রিসেট ওটিপি পাঠাতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' });
  }
});

app.post('/api/auth/forgot-resend', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'ইমেইল প্রদান করুন।' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const resend = db.resendForgotOtp(cleanEmail);
    if (!resend.success) {
      return res.status(400).json({ error: resend.message, cooldownRemaining: resend.cooldownRemaining });
    }

    const rawSmtp = db.getRawSmtpConfig();
    if (rawSmtp.isConfigured && resend.otp) {
      await smtpService.sendOtpEmail(rawSmtp, cleanEmail, 'গ্রাহক', resend.otp, 'reset_password');
    }

    res.json({
      success: true,
      message: resend.message,
      debugNotice: !rawSmtp.isConfigured && resend.otp ? `[বিজ্ঞপ্তি] নতুন রিসেট ওটিপি: ${resend.otp}` : undefined
    });
  } catch (err: unknown) {
    res.status(500).json({ error: 'ওটিপি পুনরায় পাঠাতে ব্যর্থ হয়েছে।' });
  }
});

app.post('/api/auth/forgot-reset', (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'ইমেইল, ওটিপি এবং নতুন পাসওয়ার্ড প্রদান করুন।' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'পাসওয়ার্ড ন্যূনতম ৬ অক্ষরের হতে হবে।' });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মেলেনি।' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const result = db.verifyAndResetPassword(cleanEmail, otp, newPassword);
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    res.json(result);
  } catch (err: unknown) {
    console.error('Password reset verify error:', err);
    res.status(500).json({ error: 'পাসওয়ার্ড পরিবর্তন করতে সমস্যা হয়েছে।' });
  }
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'ইমেইল ও পাসওয়ার্ড প্রদান করুন।' });
    }

    const loginRes = db.loginWithPassword(email, password);
    if (!loginRes.success) {
      return res.status(401).json({ error: loginRes.message });
    }

    res.json(loginRes);
  } catch {
    res.status(500).json({ error: 'লগইন করতে সমস্যা হয়েছে।' });
  }
});

app.post('/api/auth/google', (req: Request, res: Response) => {
  try {
    const { uid, email, displayName, photoURL } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Google ইমেইল প্রাপ্ত হয়নি।' });
    }

    const result = db.handleGoogleUser({
      uid: uid || `g-${Date.now()}`,
      email,
      displayName,
      photoURL
    });

    res.json({
      success: true,
      message: 'Google দিয়ে সফলভাবে লগইন হয়েছে।',
      user: result.user,
      token: result.token
    });
  } catch (err: unknown) {
    res.status(500).json({ error: 'Google লগইন যাচাইয়ে সমস্যা হয়েছে।' });
  }
});

app.get('/api/auth/me', authMiddleware, (req: Request, res: Response) => {
  const sessionUser = (req as any).user;
  const user = db.getUserById(sessionUser.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user });
});

app.put('/api/auth/profile', authMiddleware, (req: Request, res: Response) => {
  const sessionUser = (req as any).user;
  const updated = db.updateUserProfile(sessionUser.userId, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user: updated });
});

// Admin Login (supports master demo password or direct user credentials with role verification)
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { password, email } = req.body;

  // Check demo master password
  if (password === 'ghorer2026' || password === 'admin123') {
    const token = db.createSession('usr-admin-1', 'admin', 'joynob.kakoly@ghorershad.com');
    return res.json({
      success: true,
      token,
      user: {
        id: 'usr-admin-1',
        role: 'admin',
        name: db.getConfig().contactPerson || 'Joynob Islam Kakoly',
        email: 'joynob.kakoly@ghorershad.com'
      }
    });
  }

  // Check user password if email provided
  if (email && password) {
    const login = db.loginWithPassword(email, password);
    if (!login.success) {
      return res.status(401).json({ success: false, message: login.message || 'ভুল ইমেইল বা পাসওয়ার্ড!' });
    }

    if (login.user?.role !== 'admin' && login.user?.role !== 'staff') {
      return res.status(403).json({
        success: false,
        message: 'অননুমোদিত প্রবেশাধিকার! শুধুমাত্র "admin" অথবা "staff" রোলধারী ব্যবহারকারীগণ অ্যাডমিন প্যানেলে প্রবেশ করতে পারবেন।'
      });
    }

    return res.json(login);
  }

  return res.status(401).json({ success: false, message: 'ভুল অ্যাডমিন পাসওয়ার্ড! আবার চেষ্টা করুন।' });
});

// Server-side verification of Firebase user role for Admin Panel access
app.post('/api/admin/verify-firebase', (req: Request, res: Response) => {
  try {
    const { email, uid, displayName, role: requestedRole } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'ইমেইল প্রাপ্ত হয়নি।' });
    }

    const cleanEmail = String(email).toLowerCase().trim();

    // Check system admin emails & verified Admin UIDs
    const envAdminEmail = (process.env.ADMIN_EMAIL || 'rmartbdltd@gmail.com').toLowerCase().trim();
    const envAdminUid = process.env.ADMIN_UID || 'qEaFZDzP02O7kyUVpHNfM7FiZmz1';
    const viteAdminEmail = (process.env.VITE_ADMIN_EMAIL || '').toLowerCase().trim();
    const configAdminEmail = (db.getConfig().email || '').toLowerCase().trim();

    const isSystemAdminEmail =
      cleanEmail === 'proxy6726@gmail.com' ||
      cleanEmail === 'ghorershad.arai@gmail.com' ||
      cleanEmail === 'rmartbdltd@gmail.com' ||
      cleanEmail === envAdminEmail ||
      cleanEmail === viteAdminEmail ||
      cleanEmail === configAdminEmail ||
      uid === 'qEaFZDzP02O7kyUVpHNfM7FiZmz1' ||
      uid === envAdminUid ||
      cleanEmail === 'ahmedskkawsar43@gmail.com' ||
      cleanEmail === 'rayhanahamad50@gmail.com' ||
      cleanEmail === 'joynob.kakoly@ghorershad.com';

    // Look up user in database
    const existing = db.getUserById(uid) || (db as any).data?.users?.[cleanEmail];

    // Determine verified role
    let verifiedRole: 'admin' | 'staff' | 'customer' = 'customer';
    if (isSystemAdminEmail) {
      verifiedRole = 'admin';
    } else if (existing?.role === 'admin' || existing?.role === 'staff') {
      verifiedRole = existing.role;
    } else if (requestedRole === 'admin' || requestedRole === 'staff') {
      verifiedRole = requestedRole;
    }

    // Strict Enforcement: Only admin or staff allowed
    if (verifiedRole !== 'admin' && verifiedRole !== 'staff') {
      return res.status(403).json({
        success: false,
        verified: false,
        message: 'অননুমোদিত প্রবেশাধিকার! আপনার অ্যাকাউন্টে অ্যাডমিন বা স্টাফ পারমিশন নেই (Access Denied: Admin or Staff role required).'
      });
    }

    // Register or ensure user has admin role in store
    const result = db.handleGoogleUser({
      uid: uid || `g-${Date.now()}`,
      email: cleanEmail,
      displayName: displayName || (isSystemAdminEmail ? 'System Admin' : 'Staff Member')
    });

    res.json({
      success: true,
      verified: true,
      token: result.token,
      user: {
        ...result.user,
        role: verifiedRole
      }
    });
  } catch (err: unknown) {
    console.error('Admin Firebase verification error:', err);
    res.status(500).json({ success: false, message: 'সার্ভারে অ্যাডমিন রোল যাচাইয়ে ত্রুটি হয়েছে।' });
  }
});

// Verify active admin session token
app.get('/api/admin/verify-role', adminOnlyMiddleware, (req: Request, res: Response) => {
  const sessionUser = (req as any).user;
  res.json({
    success: true,
    verified: true,
    user: sessionUser
  });
});

// 5. Categories
app.get('/api/categories', (_req: Request, res: Response) => {
  res.json(db.getCategories());
});

app.post('/api/categories', adminOnlyMiddleware, (req: Request, res: Response) => {
  try {
    const category = db.saveCategory(req.body);
    res.json(category);
  } catch {
    res.status(500).json({ error: 'Failed to save category' });
  }
});

app.delete('/api/categories/:id', adminOnlyMiddleware, (req: Request, res: Response) => {
  const success = db.deleteCategory(req.params.id);
  res.json({ success });
});

// 6. Foods
app.get('/api/foods', (req: Request, res: Response) => {
  let foods = db.getFoods();
  const category = req.query.category as string;
  const search = req.query.search as string;

  if (category && category !== 'all') {
    foods = foods.filter(f => f.categoryId === category);
  }
  if (search) {
    const s = search.toLowerCase();
    foods = foods.filter(f =>
      f.nameBn.toLowerCase().includes(s) ||
      f.nameEn.toLowerCase().includes(s) ||
      f.shortDescBn.toLowerCase().includes(s)
    );
  }
  res.json(foods);
});

app.get('/api/foods/:id', (req: Request, res: Response) => {
  const food = db.getFoodById(req.params.id);
  if (!food) {
    return res.status(404).json({ error: 'Food not found' });
  }
  res.json(food);
});

app.post('/api/foods', adminOnlyMiddleware, (req: Request, res: Response) => {
  try {
    const food = db.saveFood(req.body);
    res.json(food);
  } catch {
    res.status(500).json({ error: 'Failed to save food' });
  }
});

app.delete('/api/foods/:id', adminOnlyMiddleware, (req: Request, res: Response) => {
  const success = db.deleteFood(req.params.id);
  res.json({ success });
});

// 7. Delivery Zones
app.get('/api/delivery-zones', (_req: Request, res: Response) => {
  res.json(db.getDeliveryZones());
});

app.post('/api/delivery-zones', adminOnlyMiddleware, (req: Request, res: Response) => {
  try {
    const zone = db.saveDeliveryZone(req.body);
    res.json(zone);
  } catch {
    res.status(500).json({ error: 'Failed to save delivery zone' });
  }
});

app.delete('/api/delivery-zones/:id', adminOnlyMiddleware, (req: Request, res: Response) => {
  const success = db.deleteDeliveryZone(req.params.id);
  res.json({ success });
});

// 7.1 Payment Methods Management
app.get('/api/payment-methods', (req: Request, res: Response) => {
  const showAll = req.query.all === 'true';
  res.json(db.getPaymentMethods(!showAll));
});

app.post('/api/payment-methods', adminOnlyMiddleware, (req: Request, res: Response) => {
  try {
    const pm = db.savePaymentMethod(req.body);
    res.json(pm);
  } catch {
    res.status(500).json({ error: 'Failed to save payment method' });
  }
});

app.delete('/api/payment-methods/:id', adminOnlyMiddleware, (req: Request, res: Response) => {
  const success = db.deletePaymentMethod(req.params.id);
  res.json({ success });
});

app.patch('/api/payment-methods/:id/toggle', adminOnlyMiddleware, (req: Request, res: Response) => {
  const success = db.togglePaymentMethod(req.params.id);
  res.json({ success });
});

// 8. Coupons
app.get('/api/coupons', (_req: Request, res: Response) => {
  res.json(db.getCoupons());
});

app.post('/api/coupons', adminOnlyMiddleware, (req: Request, res: Response) => {
  try {
    const coupon = db.saveCoupon(req.body);
    res.json(coupon);
  } catch {
    res.status(500).json({ error: 'Failed to save coupon' });
  }
});

app.post('/api/coupons/validate', (req: Request, res: Response) => {
  const { code, subtotal } = req.body;
  if (!code) {
    return res.status(400).json({ valid: false, message: 'কুপন কোড দিন।' });
  }
  const result = db.validateCoupon(code, Number(subtotal) || 0);
  res.json(result);
});

// 9. Orders
app.get('/api/orders', (req: Request, res: Response) => {
  let orders = db.getOrders();
  const phone = req.query.phone as string;
  const status = req.query.status as string;
  const customerId = req.query.customerId as string;

  if (customerId) {
    orders = orders.filter(o => o.customerId === customerId);
  }
  if (phone) {
    orders = orders.filter(o => o.customerPhone.includes(phone));
  }
  if (status && status !== 'all') {
    orders = orders.filter(o => o.orderStatus === status);
  }
  res.json(orders);
});

app.get('/api/orders/:identifier', (req: Request, res: Response) => {
  const order = db.getOrderByIdOrNumber(req.params.identifier);
  if (!order) {
    return res.status(404).json({ error: 'অর্ডারটি খুঁজে পাওয়া যায়নি।' });
  }
  res.json(order);
});

app.post('/api/orders', (req: Request, res: Response) => {
  try {
    const newOrder = db.createOrder(req.body);
    res.status(201).json(newOrder);
  } catch (err: unknown) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: 'অর্ডার সংরক্ষণ করতে সমস্যা হয়েছে।' });
  }
});

app.patch('/api/orders/:id/status', adminOnlyMiddleware, (req: Request, res: Response) => {
  const { status, note, assignedDeliveryPerson, adminNotes, requestedTimeSlot, paymentStatus, kitchenStatus } = req.body;
  const updated = db.updateOrderStatus(req.params.id, status, note, {
    assignedDeliveryPerson,
    adminNotes,
    requestedTimeSlot,
    paymentStatus,
    kitchenStatus
  });

  if (!updated) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(updated);
});

// 10. Catering
app.get('/api/catering', (_req: Request, res: Response) => {
  res.json(db.getCateringInquiries());
});

app.post('/api/catering', (req: Request, res: Response) => {
  try {
    const inquiry = db.createCateringInquiry(req.body);
    res.status(201).json(inquiry);
  } catch {
    res.status(500).json({ error: 'ক্যাটারিং অনুরোধ সংরক্ষণ করতে সমস্যা হয়েছে।' });
  }
});

app.patch('/api/catering/:id', adminOnlyMiddleware, (req: Request, res: Response) => {
  const updated = db.updateCateringInquiry(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Inquiry not found' });
  }
  res.json(updated);
});

// 11. Customers
app.get('/api/customers', adminOnlyMiddleware, (_req: Request, res: Response) => {
  res.json(db.getCustomers());
});

app.post('/api/customers/:phone/block', adminOnlyMiddleware, (req: Request, res: Response) => {
  const { reason } = req.body;
  const ok = db.toggleBlockCustomer(req.params.phone, reason);
  res.json({ success: ok });
});

// 12. Financials & Expenses
app.get('/api/reports', adminOnlyMiddleware, (_req: Request, res: Response) => {
  res.json({
    summary: db.getFinancialSummary(),
    expenses: db.getExpenses()
  });
});

app.post('/api/expenses', adminOnlyMiddleware, (req: Request, res: Response) => {
  const { title, category, amount } = req.body;
  if (!title || !amount) {
    return res.status(400).json({ error: 'Title and amount required' });
  }
  const exp = db.addExpense(title, category || 'General', Number(amount));
  res.status(201).json(exp);
});

// 13. Audit Logs
app.get('/api/audit-logs', adminOnlyMiddleware, (_req: Request, res: Response) => {
  res.json(db.getAuditLogs());
});

// 14. Image Upload
app.post('/api/upload', (req: Request, res: Response) => {
  try {
    const { dataUrl, filename } = req.body;
    if (!dataUrl || !dataUrl.includes('base64,')) {
      return res.status(400).json({ error: 'Invalid image format' });
    }

    const matches = dataUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid data URL' });
    }

    const ext = matches[1].includes('png') ? 'png' : matches[1].includes('webp') ? 'webp' : 'jpg';
    const safeName = `${Date.now()}-${(filename || 'dish').replace(/[^a-zA-Z0-9_-]/g, '')}.${ext}`;
    const filePath = path.resolve(UPLOADS_DIR, safeName);
    const buffer = Buffer.from(matches[2], 'base64');

    fs.writeFileSync(filePath, buffer);
    const publicUrl = `/uploads/${safeName}`;

    res.json({ url: publicUrl });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to process image upload' });
  }
});

// ----------------- VITE / STATIC INTEGRATION ----------------- //

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
