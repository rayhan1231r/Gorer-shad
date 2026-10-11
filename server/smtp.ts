import nodemailer from 'nodemailer';
import type { SmtpConfig } from '../src/types/index.ts';

export class SmtpService {
  private createTransporter(config: SmtpConfig) {
    if (!config.host || !config.user || !config.pass) {
      throw new Error('SMTP credentials are incomplete');
    }

    const port = Number(config.port) || 587;
    const isSecure = config.security === 'SSL' || port === 465;

    return nodemailer.createTransport({
      host: config.host,
      port,
      secure: isSecure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      tls: {
        // Do not fail on invalid certs for local/custom mail servers
        rejectUnauthorized: false,
      },
    });
  }

  public async testConnection(config: SmtpConfig, testRecipient: string): Promise<{ success: boolean; message: string }> {
    try {
      const transporter = this.createTransporter(config);
      await transporter.verify();

      const fromName = config.senderName || 'ঘরের স্বাদ (Ghorer Shad)';
      const fromEmail = config.senderEmail || config.user;

      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: testRecipient,
        subject: `[ঘরের স্বাদ] SMTP টেস্ট ইমেইল নিশ্চিতকরণ`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #166534; padding: 24px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 24px;">ঘরের স্বাদ (Ghorer Shad)</h1>
              <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">সব স্বাদের এক ঠিকানা • আড়াইহাজার, ঢাকা</p>
            </div>
            <div style="padding: 24px; background-color: #ffffff; color: #1e293b;">
              <h2 style="color: #166534; font-size: 18px; margin-top: 0;">অভিনন্দন! SMTP সংযোগ সফল হয়েছে</h2>
              <p style="font-size: 14px; line-height: 1.6;">
                আপনার কনফিগার করা SMTP সার্ভার সফলভাবে সংযুক্ত হয়েছে এবং ইমেইল ডেলিভারি সক্রিয় রয়েছে।
              </p>
              <div style="background-color: #f8fafc; border-left: 4px solid #166534; padding: 12px 16px; margin: 16px 0; font-size: 13px;">
                <strong>হোস্ট:</strong> ${config.host}<br/>
                <strong>পোর্ট:</strong> ${config.port}<br/>
                <strong>প্রেরক:</strong> ${fromEmail}
              </div>
              <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">
                এই ইমেইলটি ঘরের স্বাদ অ্যাডমিন প্যানেল থেকে স্বয়ংক্রিয়ভাবে টেস্টের জন্য পাঠানো হয়েছে।
              </p>
            </div>
          </div>
        `,
      });

      return {
        success: true,
        message: `টেস্ট ইমেইল সফলভাবে পাঠানো হয়েছে (${testRecipient})`,
      };
    } catch (err: unknown) {
      console.error('SMTP test error:', err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        message: `SMTP সংযোগ ব্যর্থ হয়েছে: ${errorMsg}. দয়া করে হোস্ট, পোর্ট ও Google App Password যাচাই করুন।`,
      };
    }
  }

  public async sendOtpEmail(
    config: SmtpConfig,
    recipientEmail: string,
    recipientName: string,
    otpCode: string,
    purpose: 'signup' | 'reset_password' = 'signup'
  ): Promise<{ success: boolean; message?: string }> {
    if (!config.isConfigured || !config.host || !config.user || !config.pass) {
      console.warn(`[SMTP Warning] SMTP is not yet configured. Simulated OTP for ${recipientEmail}: ${otpCode}`);
      return {
        success: false,
        message: 'SMTP সার্ভার কনফিগার করা নেই। অনুগ্রহ করে অ্যাডমিন প্যানেলের "Email / SMTP Settings" থেকে সেটআপ করুন।',
      };
    }

    try {
      const transporter = this.createTransporter(config);
      const fromName = config.senderName || 'ঘরের স্বাদ (Ghorer Shad)';
      const fromEmail = config.senderEmail || config.user;

      const subject =
        purpose === 'signup'
          ? `[ঘরের স্বাদ] একাউন্ট ভেরিফিকেশন ওটিপি: ${otpCode}`
          : `[ঘরের স্বাদ] পাসওয়ার্ড রিসেট ওটিপি: ${otpCode}`;

      const title =
        purpose === 'signup'
          ? 'একাউন্ট ভেরিফিকেশন কোড'
          : 'পাসওয়ার্ড রিসেট ভেরিফিকেশন কোড';

      const instruction =
        purpose === 'signup'
          ? 'ঘরের স্বাদ-এ আপনার একাউন্ট সক্রিয় করতে নিচের ৬-সংখ্যার ওটিপি কোডটি ব্যবহার করুন:'
          : 'আপনার পাসওয়ার্ড রিসেট করতে নিচের ৬-সংখ্যার ওটিপি কোডটি ব্যবহার করুন:';

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <div style="background-color: #166534; padding: 24px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px; font-weight: bold;">ঘরের স্বাদ</h1>
            <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">সব স্বাদের এক ঠিকানা • আড়াইহাজার, ঢাকা</p>
          </div>
          <div style="padding: 28px 24px; background-color: #ffffff; text-align: center;">
            <p style="font-size: 15px; color: #334155; margin-top: 0; text-align: left;">
              আসসালামু আলাইকুম <strong>${recipientName || 'গ্রাহক'}</strong>,
            </p>
            <p style="font-size: 14px; color: #475569; text-align: left; line-height: 1.5;">
              ${instruction}
            </p>
            <div style="margin: 24px 0; background-color: #f0fdf4; border: 2px dashed #166534; border-radius: 10px; padding: 18px;">
              <span style="font-size: 34px; font-weight: bold; letter-spacing: 8px; color: #166534; font-family: 'Courier New', monospace;">
                ${otpCode}
              </span>
            </div>
            <p style="font-size: 12px; color: #dc2626; margin: 12px 0 0; font-weight: 500;">
              ⚠️ এই কোডটি আগামী ${config.otpExpirationMinutes || 5} মিনিট কার্যকর থাকবে।
            </p>
            <p style="font-size: 12px; color: #64748b; line-height: 1.4; margin-top: 8px;">
              নিরাপত্তার স্বার্থে এই কোডটি কারো সাথে শেয়ার করবেন না। আপনি যদি এই অনুরোধ না করে থাকেন, তবে এটি উপেক্ষা করুন।
            </p>
            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
              ঘরের স্বাদ • আড়াইহাজার, নারায়ণগঞ্জ / ঢাকা • ফোন: 01857-220603
            </div>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: recipientEmail,
        subject,
        html,
      });

      return { success: true };
    } catch (err: unknown) {
      console.error('Error sending OTP email:', err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      return { success: false, message: errorMsg };
    }
  }
}

export const smtpService = new SmtpService();
