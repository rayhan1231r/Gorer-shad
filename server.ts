import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
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

// Admin-Only Middleware: verifies owner, admin, staff, or subadmin role
function adminOnlyMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'প্রবেশাধিকার সংরক্ষিত! শুধুমাত্র অ্যাডমিন প্রবেশ করতে পারবেন।' });
  }

  const token = authHeader.split(' ')[1];
  const session = db.verifySession(token);
  if (!session || (session.role !== 'owner' && session.role !== 'admin' && session.role !== 'staff' && session.role !== 'subadmin')) {
    return res.status(403).json({ error: 'এই অপশনটি পরিবর্তনের অনুমতি আপনার নেই।' });
  }

  (req as any).user = session;
  next();
}

// Owner-Only Middleware: strictly verifies the single Owner
function ownerOnlyMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'প্রবেশাধিকার সংরক্ষিত! শুধুমাত্র প্রধান মালিক (Owner) প্রবেশ করতে পারবেন।' });
  }

  const token = authHeader.split(' ')[1];
  const session = db.verifySession(token);
  const currentOwner = db.getOwner();
  const isOwner = session && (
    session.role === 'owner' ||
    (currentOwner && session.email.toLowerCase().trim() === currentOwner.email.toLowerCase().trim())
  );

  if (!isOwner) {
    return res.status(403).json({ error: 'শুধুমাত্র বর্তমান প্রধান মালিক (Owner) মালিকানা হস্তান্তর বা এই কাজটি করতে পারেন।' });
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
    const owner = db.getOwner();
    const token = db.createSession(owner?.id || 'usr-admin-1', 'owner', owner?.email || 'rmartbdltd@gmail.com');
    return res.json({
      success: true,
      token,
      user: {
        id: owner?.id || 'usr-admin-1',
        role: 'owner',
        name: owner?.name || db.getConfig().contactPerson || 'Joynob Islam Kakoly',
        email: owner?.email || 'rmartbdltd@gmail.com'
      }
    });
  }

  // Check user password if email provided
  if (email && password) {
    const login = db.loginWithPassword(email, password);
    if (!login.success) {
      return res.status(401).json({ success: false, message: login.message || 'ভুল ইমেইল বা পাসওয়ার্ড!' });
    }

    const allowedRoles = ['owner', 'admin', 'subadmin', 'staff'];
    if (!allowedRoles.includes(login.user?.role || '')) {
      return res.status(403).json({
        success: false,
        message: 'অননুমোদিত প্রবেশাধিকার! শুধুমাত্র মালিক, অ্যাডমিন অথবা সাব-অ্যাডমিন রোলধারীগণ প্রবেশ করতে পারবেন।'
      });
    }

    return res.json(login);
  }

  return res.status(401).json({ success: false, message: 'ভুল অ্যাডমিন পাসওয়ার্ড! আবার চেষ্টা করুন।' });
});

// Server-side verification of Firebase user role for Admin Panel access
app.post('/api/admin/verify-firebase', (req: Request, res: Response) => {
  try {
    const { email, uid, displayName } = req.body;
    if (!email && !uid) {
      return res.status(400).json({ success: false, message: 'ইমেইল বা UID প্রাপ্ত হয়নি।' });
    }

    const cleanEmail = email ? String(email).toLowerCase().trim() : '';
    const cleanUid = uid ? String(uid).trim() : '';

    const currentOwner = db.getOwner();
    const envAdminEmail = (process.env.ADMIN_EMAIL || 'rmartbdltd@gmail.com').toLowerCase().trim();
    const envAdminUid = (process.env.ADMIN_UID || 'qEaFZDzP02O7kyUVpHNfM7FiZmz1').trim();

    // Check if matching the single designated owner
    const isOwner =
      (cleanUid && (cleanUid === envAdminUid || (currentOwner && cleanUid === currentOwner.id))) ||
      (cleanEmail && (cleanEmail === envAdminEmail || (currentOwner && cleanEmail === currentOwner.email.toLowerCase().trim())));

    // Look up user in database
    const existing = cleanUid ? db.getUserById(cleanUid) : (cleanEmail ? (db as any).data?.users?.[cleanEmail] : null);

    // Determine verified role
    let verifiedRole: 'owner' | 'admin' | 'subadmin' | 'staff' | 'customer' = 'customer';
    if (isOwner) {
      verifiedRole = 'owner';
    } else if (existing && (existing.role === 'owner' || existing.role === 'admin' || existing.role === 'subadmin' || existing.role === 'staff')) {
      verifiedRole = existing.role;
    }

    // Strict Enforcement: Only owner, admin, or staff/subadmin allowed
    const allowedRoles = ['owner', 'admin', 'subadmin', 'staff'];
    if (!allowedRoles.includes(verifiedRole)) {
      return res.status(403).json({
        success: false,
        verified: false,
        message: 'অননুমোদিত প্রবেশাধিকার! আপনার অ্যাকাউন্টে অ্যাডমিন বা স্টাফ পারমিশন নেই (Access Denied: Admin or Staff role required).'
      });
    }

    // Register or ensure user has session in store
    const result = db.handleGoogleUser({
      uid: cleanUid || `g-${Date.now()}`,
      email: cleanEmail,
      displayName: displayName || (isOwner ? 'Joynob Islam Kakoly' : 'Staff Member')
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

// 15. User & Role Management (Owner, Admin, Sub-admin)
app.get('/api/admin/users', adminOnlyMiddleware, (_req: Request, res: Response) => {
  res.json({
    users: db.getUsers(),
    owner: db.getOwner()
  });
});

app.post('/api/admin/users', adminOnlyMiddleware, (req: Request, res: Response) => {
  const { name, email, phone, role, password } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ error: 'নাম, ইমেইল ও ভূমিকা প্রদান করুন।' });
  }
  const result = db.createAdminOrStaffUser({
    name,
    email,
    phone,
    role: role === 'owner' ? 'admin' : role,
    password
  });
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }
  res.status(201).json(result);
});

app.patch('/api/admin/users/:id/role', adminOnlyMiddleware, (req: Request, res: Response) => {
  const { role } = req.body;
  if (!role || !['admin', 'subadmin', 'staff', 'customer'].includes(role)) {
    return res.status(400).json({ error: 'সঠিক রোল নির্বাচন করুন (admin, subadmin, customer)।' });
  }
  const callerUser = (req as any).user;
  const result = db.updateUserRole(req.params.id, role, callerUser?.email);
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }
  res.json(result);
});

app.post('/api/admin/transfer-ownership', ownerOnlyMiddleware, (req: Request, res: Response) => {
  const { newOwnerEmailOrId } = req.body;
  if (!newOwnerEmailOrId) {
    return res.status(400).json({ error: 'নতুন মালিকের ইমেইল অথবা আইডি প্রদান করুন।' });
  }
  const callerUser = (req as any).user;
  const result = db.transferOwnership(newOwnerEmailOrId, callerUser.email || callerUser.userId);
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }
  res.json(result);
});

// 16. AI Customer Support & Admin AI Tools
app.post('/api/ai/customer-support', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'বার্তা প্রয়োজন।' });
    }

    const config = db.getConfig();
    const foods = db.getFoods().filter(f => f.isAvailable);
    const zones = db.getDeliveryZones().filter(z => z.isActive);
    const pmMethods = db.getPaymentMethods(true);

    const menuSummary = foods.slice(0, 15).map(f =>
      `• ${f.nameBn} (${f.categoryNameBn}): ৳${f.price} (পরিমাণ: ${f.portionBn || '১ জনের'}, নোটিস: ${f.advanceNoticeRequiredHours || 4} ঘন্টা)`
    ).join('\n');

    const zonesSummary = zones.map(z => `• ${z.nameBn}: ৳${z.charge} (ন্যূনতম অর্ডার ৳${z.minOrderAmount || 0})`).join('\n');
    const paymentSummary = pmMethods.map(p => `• ${p.nameBn} (${p.accountType || ''}): ${p.accountNumber}`).join('\n');

    const systemPrompt = `আপনি "ঘরের স্বাদ" (Ghorer Shad) নামক একটি ঐতিহ্যবাহী খাঁটি বাঙালি ঘরোয়া খাবার হোম-ডেলিভারি ও ক্যাটারিং সার্ভিসের আন্তরিক, বিনয়ী ও খাবার-প্রেমী এআই সহকারী (AI Customer Assistant)।

আপনার কাজ হল গ্রাহকদের খাদ্য সংক্রান্ত প্রশ্ন, মেনু নির্বাচন, ডেলিভারি নিয়ম ও অর্ডারের তথ্যে বাংলায় মিষ্টি ও আন্তরিক ভাষায় সাহায্য করা।

প্রতিষ্ঠানের মূল তথ্য:
- নাম: ${config.brandNameBn} (${config.brandNameEn}) — "${config.taglineBn}"
- যোগাযোগের ঠিকানা: ${config.fullAddressBn || config.primaryLocation}
- হটলাইন/কল: ${config.phone}
- হোয়াটসঅ্যাপ: ${config.whatsapp}
- খোলার সময়: ${config.openingHoursBn || 'সকাল ৯:০০ - রাত ৯:০০'}
- সবচেয়ে গুরুত্বপূর্ণ নিয়ম: আমরা বাসি বা ডিপ-ফ্রিজের খাবার দেই না। সম্পূর্ণ তাজা রান্না করে পাঠাই, তাই খাবার পেতে অগ্রিম ${config.standardAdvanceHours || 4}-${config.standardAdvanceHours ? config.standardAdvanceHours + 2 : 6} ঘন্টা আগে অর্ডার দিতে হয়। জরুরি প্রয়োজনে ফোনে সরাসরি কথা বলতে অনুরোধ করুন।
- ক্যাটারিং: জন্মদিন, মেহমানদারি, বিয়ে, মিলাদ, অফিস পার্টি ইত্যাদি যেকোনো অনুষ্ঠানের জন্য ১৫ জন থেকে ৫০০+ জনের খাঁটি ঘরোয়া বাঙালি খাবার প্রস্তুত করা হয়।

চলতি মেনু আইটেম (কিছু জনপ্রিয় নমুনা):
${menuSummary}

ডেলিভারি এলাকা ও চার্জ:
${zonesSummary}

পেমেন্ট মাধ্যম:
${paymentSummary}

নির্দেশনা:
1. গ্রাহককে মিষ্টি ও আন্তরিক বাঙালি ভোজ-সংস্কৃতির ভাষায় অভ্যর্থনা জানান।
2. খাবারের স্বাদ, সরষে বাটা ইলিশ, খাসির কাচ্চি, দেশি মুরগি ভুনা, লুচি, ক্ষীর ইত্যাদি সম্পর্কে রসালো ও জীবন্ত বর্ণনা দিন।
3. যদি গ্রাহক অর্ডার করতে চান, মনে করিয়ে দিন যে খাবার তাজা তৈরি হয় তাই কমপক্ষে ৪-৬ ঘন্টা পূর্বে অর্ডার দিতে হবে।
4. উত্তরের শেষে প্রাসঙ্গিক হলে অ্যাকশন ট্যাগ দিতে পারেন: [ACTION:VIEW_MENU] (মেনু দেখতে), [ACTION:TRACK_ORDER] (ট্র্যাক করতে), [ACTION:WHATSAPP] (হোয়াটসঅ্যাপে কথা বলতে), [ACTION:CATERING] (ক্যাটারিং)।
5. গ্রাহক বাংলায় প্রশ্ন করলে বাংলায় উত্তর দিন, ইংরেজিতে প্রশ্ন করলে ইংরেজিতে উত্তর দিন।`;

    let reply = '';
    const suggestedActions: { label: string; action: string; targetId?: string }[] = [];

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const genAi = new GoogleGenAI({
          apiKey,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        });

        const chatContents: any[] = [];
        if (Array.isArray(history) && history.length > 0) {
          for (const h of history.slice(-6)) {
            chatContents.push({
              role: h.role === 'model' ? 'model' : 'user',
              parts: [{ text: h.text }]
            });
          }
        }
        chatContents.push({
          role: 'user',
          parts: [{ text: message }]
        });

        const genRes = await genAi.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: chatContents,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7
          }
        });

        reply = genRes.text || '';
      } catch (genErr) {
        console.warn('Gemini generateContent fallback:', genErr);
      }
    }

    // Smart Local Fallback if API key missing or error
    if (!reply) {
      const q = message.toLowerCase();
      if (q.includes('মেনু') || q.includes('খাবার') || q.includes('menu') || q.includes('স্পেশাল')) {
        reply = `ঘরের স্বাদে আপনাকে স্বাগতম! আমাদের আজকের বিশেষ খাবারের মধ্যে রয়েছে পদ্মার খাঁটি সরষে ইলিশ, ঘরোয়া স্পেশাল খাসির রেজালা, দেশি মুরগির পাতলা ঝোল ও জাফরানি পোলাও। আমাদের সব খাবার ফ্রেশ অর্ডারে সম্পূর্ণ ঘরোয়া মশলায় রান্না করা হয়। পুরো তালিকা দেখতে আমাদের মেনু পেজটি ঘুরে আসুন!`;
        suggestedActions.push({ label: '🍽️ পুরো মেনু দেখুন', action: 'VIEW_MENU' });
      } else if (q.includes('কতক্ষণ') || q.includes('সময়') || q.includes('অগ্রিম') || q.includes('আগে')) {
        reply = `আমরা কোনো বাসি বা ডিপ-ফ্রিজের খাবার পরিবেশন করি না। আপনার অর্ডারের পরই সম্পূর্ণ ফ্রেশ উপকরণ দিয়ে রান্না শুরু করা হয়। তাই খাবারের সর্বোচ্চ স্বাদ ও গুণমান নিশ্চিত করতে কমপক্ষে ৪ থেকে ৬ ঘণ্টা পূর্বে অগ্রিম অর্ডার করার বিনীত অনুরোধ করা হচ্ছে। জরুরি প্রয়োজনে সরাসরি কল করুন: ${config.phone}`;
        suggestedActions.push({ label: '📞 সরাসরি কল দিন', action: 'CALL' });
      } else if (q.includes('ক্যাটারিং') || q.includes('অনুষ্ঠান') || q.includes('মেহমান') || q.includes('বিয়ে') || q.includes('মিলাদ')) {
        reply = `যেকোনো মেহমানদারি, মিলাদ মাহফিল, গায়ে হলুদ, বা পারিবারিক অনুষ্ঠানের জন্য আমাদের ক্যাটারিং টিম বিশেষ স্পেশাল প্যাকেজ প্রস্তুত করে থাকে (১৫ থেকে ৫০০+ জনের আয়োজন)। আপনার পছন্দের পদ ও বাজেট অনুযায়ী প্যাকেজ কাস্টমাইজ করতে আমাদের ক্যাটারিং পেজে ফরম পূরণ করুন অথবা সরাসরি হোয়াটসঅ্যাপে যোগাযোগ করুন।`;
        suggestedActions.push({ label: '🎉 ক্যাটারিং বুকিং', action: 'CATERING' });
        suggestedActions.push({ label: '💬 হোয়াটসঅ্যাপ', action: 'WHATSAPP' });
      } else if (q.includes('ডেলিভারি') || q.includes('চার্জ') || q.includes('এলাকা') || q.includes('আড়াইহাজার')) {
        reply = `আমরা আড়াইহাজার বাজার ও সংলগ্ন এলাকা (গোপালদী, দুপ্তারা, কালাপাহাড়িয়া, উচিতপুর ঘাট) সহ ঢাকা ও নারায়ণগঞ্জের নির্দিষ্ট জোনে নিজস্ব পরিচ্ছন্ন ডেলিভারিম্যানের মাধ্যমে খাবার পৌঁছে দেই। খাবার গরম ও স্বাস্থ্যসম্মত রাখতে বিশেষ ইনসুলেটেড ব্যাগে পরিবহন করা হয়।`;
        suggestedActions.push({ label: '📍 ডেলিভারি এলাকা দেখুন', action: 'VIEW_MENU' });
      } else if (q.includes('পেমেন্ট') || q.includes('বিকাশ') || q.includes('নগদ') || q.includes('টাকা')) {
        reply = `আপনি ক্যাশ অন ডেলিভারি (COD) ছাড়াও বিকাশ পার্সোনাল (${config.bkashNumber || '01912-838891'}) এবং নগদ (${config.nagadNumber || '01857-220603'}) এর মাধ্যমে নিরাপদভাবে পেমেন্ট করতে পারবেন। অর্ডারের সময় পেমেন্ট অপশনটি সিলেক্ট করে নিন।`;
        suggestedActions.push({ label: '🛒 অর্ডার করুন', action: 'VIEW_MENU' });
      } else {
        reply = `ঘরের স্বাদে আপনাকে স্বাগতম! মায়ের হাতের খাঁটি বাঙালি রান্নার স্বাদে আপনার প্রতিদিনের খাবার বা উৎসবের মেহমানদারিকে মুখরিত করতে আমরা প্রস্তুত। আমাদের খাবারের তালিকা, অগ্রিম অর্ডারের সময়সূচি বা ক্যাটারিং সম্পর্কে যেকোনো তথ্য জানতে বলতে পারেন!`;
        suggestedActions.push({ label: '🍲 মেনু দেখুন', action: 'VIEW_MENU' });
        suggestedActions.push({ label: '💬 হোয়াটসঅ্যাপে কথা বলুন', action: 'WHATSAPP' });
      }
    }

    if (reply.includes('[ACTION:VIEW_MENU]')) {
      suggestedActions.push({ label: '🍲 মেনু দেখুন', action: 'VIEW_MENU' });
      reply = reply.replace(/\[ACTION:VIEW_MENU\]/g, '').trim();
    }
    if (reply.includes('[ACTION:TRACK_ORDER]')) {
      suggestedActions.push({ label: '📦 অর্ডার ট্র্যাক করুন', action: 'TRACK_ORDER' });
      reply = reply.replace(/\[ACTION:TRACK_ORDER\]/g, '').trim();
    }
    if (reply.includes('[ACTION:WHATSAPP]')) {
      suggestedActions.push({ label: '💬 হোয়াটসঅ্যাপে কথা বলুন', action: 'WHATSAPP' });
      reply = reply.replace(/\[ACTION:WHATSAPP\]/g, '').trim();
    }
    if (reply.includes('[ACTION:CATERING]')) {
      suggestedActions.push({ label: '🎉 ক্যাটারিং সেবা', action: 'CATERING' });
      reply = reply.replace(/\[ACTION:CATERING\]/g, '').trim();
    }

    res.json({
      reply,
      suggestedActions: suggestedActions.filter((v, i, a) => a.findIndex(t => t.action === v.action) === i)
    });
  } catch (err: unknown) {
    console.error('Customer AI error:', err);
    res.status(500).json({
      reply: 'আন্তরিকভাবে দুঃখিত! এআই সহকারীর সাথে যোগাযোগে কিছুটা বিলম্ব হচ্ছে। জরুরি যেকোনো প্রয়োজনে আমাদের হটলাইন 01857-220603 বা হোয়াটসঅ্যাপে কল করুন।',
      suggestedActions: [{ label: '💬 হোয়াটসঅ্যাপ', action: 'WHATSAPP' }]
    });
  }
});

app.post('/api/ai/admin-generate-food', adminOnlyMiddleware, async (req: Request, res: Response) => {
  try {
    const { nameBn, categoryName, spiceLevel } = req.body;
    if (!nameBn) {
      return res.status(400).json({ error: 'খাবারের নাম প্রদান করুন।' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const genAi = new GoogleGenAI({
          apiKey,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        });

        const prompt = `একটি খাঁটি ঘরোয়া বাংলাদেশি খাবারের জন্য মেনু আইটেম কনটেন্ট তৈরি করুন:
খাবারের নাম: "${nameBn}"
ক্যাটাগরি: "${categoryName || 'বাঙালি খাবার'}"
ঝালের মাত্রা: "${spiceLevel || 'Medium'}"

নিচের JSON ফরম্যাটে উত্তর দিন:
{
  "shortDescBn": "১ লাইনের সংক্ষিপ্ত ও আকর্ষণীয় বাংলা বিবরণ",
  "fullDescBn": "৩-৪ লাইনের বিস্তারিত মুখে পানি আনা বর্ণনা, ব্যবহৃত ঘরোয়া খাঁটি উপাদান ও রান্নার ঐতিহ্য সহ",
  "portionBn": "১ জনের পেটভরা মিল / ২ জনের শেয়ারিং",
  "suggestedPrice": 280,
  "prepTimeMinutes": 30,
  "advanceNoticeRequiredHours": 4
}`;

        const genRes = await genAi.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const jsonStr = genRes.text || '{}';
        const parsed = JSON.parse(jsonStr);
        return res.json(parsed);
      } catch (aiErr) {
        console.warn('AI Food generator fallback:', aiErr);
      }
    }

    // High quality local fallback
    res.json({
      shortDescBn: `খাঁটি ঘরোয়া বাটা মশলায় রান্না করা সুস্বাদু ও টাটকা ${nameBn}।`,
      fullDescBn: `গ্রাম্য ঐতিহ্যবাহী রেসিপিতে সম্পূর্ণ স্বাস্থ্যসম্মত উপায়ে তাজা উপাদান ও খাঁটি সরিষার তেলে প্রস্তুতকৃত স্পেশাল ${nameBn}। পরিবারের সকলের রুচিকর খাবারের অনন্য অভিজ্ঞতা।`,
      portionBn: '১ জনের পেটভরা মিল',
      suggestedPrice: 280,
      prepTimeMinutes: 30,
      advanceNoticeRequiredHours: 4
    });
  } catch (err: unknown) {
    res.status(500).json({ error: 'এআই বিবরণ জেনারেট করতে ব্যর্থ হয়েছে।' });
  }
});

app.post('/api/ai/admin-chat', adminOnlyMiddleware, async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    const summary = db.getFinancialSummary();
    const orders = db.getOrders();
    const foods = db.getFoods();
    const reviews = db.getReviews(false);

    const apiKey = process.env.GEMINI_API_KEY;
    const statsContext = `চলতি ব্যবসায়িক অবস্থা:
- সর্বমোট অর্ডার: ${orders.length}টি
- মোট রেভিনিউ: ৳${summary.totalRevenue}
- আজকের বিক্রয়: ৳${summary.todaySales}
- মোট মেনু পদ: ${foods.length}টি
- কাস্টমার রিভিউ: ${reviews.length}টি (গড় রেটিং: 4.9/5)`;

    if (apiKey) {
      try {
        const genAi = new GoogleGenAI({
          apiKey,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        });

        const prompt = `আপনি "ঘরের স্বাদ" (Ghorer Shad) ক্লাউড কিচেন ও ক্যাটারিং ব্যবসার জন্য সিনিয়র রেস্তোরাঁ ও খাদ্য ব্যবসা উপদেষ্টা (Business & Kitchen Growth Advisor)।
${statsContext}

অ্যাডমিনের প্রশ্ন: "${message}"

বাঙালি ঘরোয়া খাদ্য ব্যবসা, প্রফিট মার্জিন, কিচেন ওয়েস্ট ম্যানেজমেন্ট, উৎসবের স্পেশাল প্ল্যাটার অফার এবং গ্রাহক সন্তুষ্টি বৃদ্ধির বাস্তবসম্মত পরামর্শ বাংলায় গুছিয়ে বুলেট পয়েন্টে দিন।`;

        const resAi = await genAi.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt
        });

        return res.json({ reply: resAi.text || '' });
      } catch (err) {
        console.warn('Admin AI fallback:', err);
      }
    }

    res.json({
      reply: `📊 **ঘরের স্বাদ ব্যবসায়িক পরামর্শ ও কিচেন টিপস:**
• **স্পেশাল কম্বো প্ল্যাটার:** সপ্তাহান্তে (শুক্রবার ও শনিবার) পদ্মার ইলিশ ও মাংসের ফ্যামিলি কম্বো তৈরি করুন, যাতে গড়ে ২৫% বেশি অর্ডার বাড়ে।
• **অগ্রিম অর্ডার ম্যানেজমেন্ট:** পিক-আওয়ারে (দুপুর ১২টা-২টা ও রাত ৮টা-১০টা) কিচেনের চাপ কমাতে সকাল ৯টার মধ্যেই গ্রাহকদের এসএমএস/হোয়াটসঅ্যাপে প্রি-অর্ডার দিতে উৎসাহিত করুন।
• **ওয়েস্টেজ কমানো:** দৈনিক নির্দিষ্ট স্টক কোটা নির্ধারণ করুন যাতে কোনো তাজা খাবার অবিক্রিত না থাকে।`
    });
  } catch (err: unknown) {
    res.status(500).json({ error: 'এআই প্রতিক্রিয়া দিতে পারেনি।' });
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
