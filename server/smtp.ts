import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
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

  /**
   * Resolve an image file from local path or URL to an inline attachment for reliable email display
   */
  private resolveLogoAttachment(logoUrl?: string): { cid: string; attachment?: { filename: string; path?: string; content?: Buffer; cid: string } } {
    const cid = 'brandlogo@ghorershad';
    const target = logoUrl || '/logo.jpg';

    // If it's a data URL base64 image
    if (target.startsWith('data:image/')) {
      const match = target.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
      if (match) {
        return {
          cid,
          attachment: {
            filename: `logo.${match[1] === 'jpeg' ? 'jpg' : match[1]}`,
            content: Buffer.from(match[2], 'base64'),
            cid,
          },
        };
      }
    }

    // If it starts with /uploads/ or /logo
    let localPath = '';
    if (target.startsWith('/uploads/')) {
      localPath = path.resolve(process.cwd(), target.slice(1));
    } else if (target === '/logo.jpg' || target.endsWith('logo.jpg')) {
      localPath = path.resolve(process.cwd(), 'public', 'logo.jpg');
    } else if (target === '/logo.svg' || target.endsWith('logo.svg')) {
      localPath = path.resolve(process.cwd(), 'public', 'logo.svg');
    } else if (target.startsWith('/')) {
      localPath = path.resolve(process.cwd(), 'public', target.slice(1));
    } else if (fs.existsSync(target)) {
      localPath = path.resolve(target);
    }

    if (localPath && fs.existsSync(localPath)) {
      return {
        cid,
        attachment: {
          filename: path.basename(localPath),
          path: localPath,
          cid,
        },
      };
    }

    // Default fallback to public/logo.jpg
    const defaultLogoPath = path.resolve(process.cwd(), 'public', 'logo.jpg');
    if (fs.existsSync(defaultLogoPath)) {
      return {
        cid,
        attachment: {
          filename: 'logo.jpg',
          path: defaultLogoPath,
          cid,
        },
      };
    }

    return { cid };
  }

  public async testConnection(config: SmtpConfig, testRecipient: string): Promise<{ success: boolean; message: string }> {
    try {
      const transporter = this.createTransporter(config);
      await transporter.verify();

      // Clean sender name: ensure no "R Mart" or "R-Mart"
      const fromName = (config.senderName && !config.senderName.toLowerCase().includes('r-mart') && !config.senderName.toLowerCase().includes('r mart'))
        ? config.senderName
        : 'ঘরের স্বাদ (Ghorer Shad)';
      const fromEmail = config.senderEmail || config.user;

      const { cid, attachment } = this.resolveLogoAttachment(config.logoUrl);
      const attachments = attachment ? [attachment] : [];

      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: testRecipient,
        subject: `[${fromName}] SMTP টেস্ট ইমেইল নিশ্চিতকরণ`,
        attachments,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
            <div style="background: linear-gradient(135deg, #166534 0%, #14532d 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
              <div style="margin: 0 auto 16px; width: 72px; height: 72px; border-radius: 50%; background-color: #ffffff; padding: 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.15); display: inline-block;">
                <img src="cid:${cid}" alt="${fromName}" width="64" height="64" style="width: 64px; height: 64px; border-radius: 50%; object-fit: cover; display: block; border: 0;" />
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">${fromName}</h1>
              <p style="margin: 6px 0 0; font-size: 13px; color: #bbf7d0; font-weight: 500;">সব স্বাদের এক ঠিকানা • আড়াইহাজার, ঢাকা</p>
            </div>
            <div style="padding: 28px 24px; color: #1e293b;">
              <h2 style="color: #166534; font-size: 18px; margin-top: 0; font-weight: 700;">অভিনন্দন! SMTP টেস্ট সফল হয়েছে</h2>
              <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                আপনার কনফিগার করা SMTP সার্ভার সফলভাবে সংযুক্ত হয়েছে এবং ওয়েবসাইটের ব্র্যান্ডেড ইমেইল ডেলিভারি সক্রিয় রয়েছে।
              </p>
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #166534; border-radius: 8px; padding: 14px 16px; margin: 20px 0; font-size: 13px; line-height: 1.6;">
                <strong style="color: #0f172a;">হোস্ট:</strong> <span style="font-family: monospace;">${config.host}</span><br/>
                <strong style="color: #0f172a;">পোর্ট:</strong> <span style="font-family: monospace;">${config.port}</span><br/>
                <strong style="color: #0f172a;">প্রেরকের নাম:</strong> ${fromName}<br/>
                <strong style="color: #0f172a;">প্রেরকের ইমেইল:</strong> ${fromEmail}
              </div>
              <p style="font-size: 12px; color: #64748b; margin-bottom: 0; line-height: 1.5;">
                এই ইমেইলটি <strong>${fromName}</strong> অ্যাডমিন প্যানেল থেকে স্বয়ংক্রিয়ভাবে টেস্টের জন্য পাঠানো হয়েছে।
              </p>
            </div>
            <div style="background-color: #f8fafc; padding: 16px 24px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
              ${fromName} • আড়াইহাজার, নারায়ণগঞ্জ / ঢাকা • ফোন: 01857-220603
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
      // Clean sender name: ensure no "R Mart" or "R-Mart"
      const fromName = (config.senderName && !config.senderName.toLowerCase().includes('r-mart') && !config.senderName.toLowerCase().includes('r mart'))
        ? config.senderName
        : 'ঘরের স্বাদ (Ghorer Shad)';
      const fromEmail = config.senderEmail || config.user;

      const { cid, attachment } = this.resolveLogoAttachment(config.logoUrl);
      const attachments = attachment ? [attachment] : [];

      const subject =
        purpose === 'signup'
          ? `[${fromName}] একাউন্ট ভেরিফিকেশন ওটিপি: ${otpCode}`
          : `[${fromName}] পাসওয়ার্ড রিসেট ওটিপি: ${otpCode}`;

      const instruction =
        purpose === 'signup'
          ? `${fromName}-এ আপনার একাউন্ট সক্রিয় করতে নিচের ৬-সংখ্যার ওটিপি কোডটি ব্যবহার করুন:`
          : 'আপনার পাসওয়ার্ড রিসেট করতে নিচের ৬-সংখ্যার ওটিপি কোডটি ব্যবহার করুন:';

      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 550px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);">
          <div style="background: linear-gradient(135deg, #166534 0%, #14532d 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
            <div style="margin: 0 auto 16px; width: 72px; height: 72px; border-radius: 50%; background-color: #ffffff; padding: 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.15); display: inline-block;">
              <img src="cid:${cid}" alt="${fromName}" width="64" height="64" style="width: 64px; height: 64px; border-radius: 50%; object-fit: cover; display: block; border: 0;" />
            </div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">${fromName}</h1>
            <p style="margin: 4px 0 0; font-size: 13px; color: #bbf7d0; font-weight: 500;">সব স্বাদের এক ঠিকানা • আড়াইহাজার, ঢাকা</p>
          </div>
          <div style="padding: 28px 24px; background-color: #ffffff; text-align: center;">
            <p style="font-size: 15px; color: #334155; margin-top: 0; text-align: left;">
              আসসালামু আলাইকুম <strong>${recipientName || 'গ্রাহক'}</strong>,
            </p>
            <p style="font-size: 14px; color: #475569; text-align: left; line-height: 1.5;">
              ${instruction}
            </p>
            <div style="margin: 24px 0; background-color: #f0fdf4; border: 2px dashed #166534; border-radius: 12px; padding: 20px;">
              <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #166534; font-family: 'Courier New', monospace; display: block;">
                ${otpCode}
              </span>
            </div>
            <p style="font-size: 12px; color: #dc2626; margin: 12px 0 0; font-weight: 600;">
              ⚠️ এই কোডটি আগামী ${config.otpExpirationMinutes || 5} মিনিট কার্যকর থাকবে।
            </p>
            <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-top: 8px;">
              নিরাপত্তার স্বার্থে এই কোডটি কারো সাথে শেয়ার করবেন না। আপনি যদি এই অনুরোধ না করে থাকেন, তবে এটি উপেক্ষা করুন।
            </p>
            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
              ${fromName} • আড়াইহাজার, নারায়ণগঞ্জ / ঢাকা • ফোন: 01857-220603
            </div>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: recipientEmail,
        subject,
        attachments,
        html,
      });

      return { success: true };
    } catch (err: unknown) {
      console.error('Error sending OTP email:', err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      return { success: false, message: errorMsg };
    }
  }

  public async sendNewOrderAdminNotification(
    config: SmtpConfig,
    recipientEmails: string[],
    order: any
  ): Promise<{ success: boolean; sentCount: number }> {
    if (!config.isConfigured || !config.host || !config.user || !config.pass || !recipientEmails.length) {
      return { success: false, sentCount: 0 };
    }

    try {
      const transporter = this.createTransporter(config);
      const fromName = (config.senderName && !config.senderName.toLowerCase().includes('r-mart') && !config.senderName.toLowerCase().includes('r mart'))
        ? config.senderName
        : 'ঘরের স্বাদ (Ghorer Shad)';
      const fromEmail = config.senderEmail || config.user;

      const { cid, attachment } = this.resolveLogoAttachment(config.logoUrl);
      const attachments = attachment ? [attachment] : [];

      const itemsListHtml = (order.items || []).map((it: any) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 8px; font-weight: 600; color: #1e293b;">
            ${it.nameBn || it.nameEn}
            ${it.selectedVariantName ? `<span style="display:block; font-size: 11px; color: #64748b; font-weight: normal;">${it.selectedVariantName}</span>` : ''}
            ${it.selectedAddonsNames?.length ? `<span style="display:block; font-size: 11px; color: #64748b; font-weight: normal;">+ ${it.selectedAddonsNames.join(', ')}</span>` : ''}
          </td>
          <td style="padding: 10px 8px; text-align: center; color: #475569;">× ${it.quantity}</td>
          <td style="padding: 10px 8px; text-align: right; font-weight: 700; color: #166534;">৳${it.itemTotal}</td>
        </tr>
      `).join('');

      const trxInfoHtml = order.paymentTransactionId
        ? `<div style="background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 12px; margin: 16px 0; font-size: 13px; color: #92400e;">
            <strong>💳 ট্রানজেকশন আইডি (TrxID):</strong> <span style="font-family: monospace; font-size: 14px; font-weight: bold;">${order.paymentTransactionId}</span>
            ${order.paymentSenderPhone ? `<br/><strong>📱 প্রেরক মোবাইল:</strong> ${order.paymentSenderPhone}` : ''}
          </div>`
        : '';

      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);">
          <div style="background: linear-gradient(135deg, #166534 0%, #0f3d1f 100%); padding: 24px; text-align: center; color: #ffffff;">
            <div style="margin: 0 auto 12px; width: 60px; height: 60px; border-radius: 50%; background-color: #ffffff; padding: 3px; display: inline-block;">
              <img src="cid:${cid}" alt="${fromName}" width="54" height="54" style="width: 54px; height: 54px; border-radius: 50%; object-fit: cover; display: block; border: 0;" />
            </div>
            <h1 style="margin: 0; font-size: 20px; font-weight: 800;">নতুন অর্ডার প্রাপ্তি নোটিফিকেশন!</h1>
            <p style="margin: 4px 0 0; font-size: 14px; color: #fde68a; font-weight: bold;">অর্ডার নং: ${order.orderNumber} (৳${order.totalAmount})</p>
          </div>
          <div style="padding: 24px; color: #1e293b;">
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 20px; font-size: 13px; line-height: 1.6;">
              <p style="margin: 0 0 6px;"><strong>👤 গ্রাহকের নাম:</strong> ${order.customerName}</p>
              <p style="margin: 0 0 6px;"><strong>📞 ফোন নম্বর:</strong> <a href="tel:${order.customerPhone}" style="color: #166534; font-weight: bold; text-decoration: none;">${order.customerPhone}</a></p>
              ${order.customerEmail ? `<p style="margin: 0 0 6px;"><strong>✉️ ইমেইল:</strong> ${order.customerEmail}</p>` : ''}
              <p style="margin: 0 0 6px;"><strong>📍 ডেলিভারি এলাকা:</strong> ${order.deliveryZoneName}</p>
              <p style="margin: 0 0 6px;"><strong>🏠 সম্পূর্ণ ঠিকানা:</strong> ${order.deliveryAddress}</p>
              ${order.deliveryLandmark ? `<p style="margin: 0 0 6px;"><strong>🚩 ল্যান্ডমার্ক:</strong> ${order.deliveryLandmark}</p>` : ''}
              <p style="margin: 0 0 6px;"><strong>⏰ ডেলিভারি সময়:</strong> ${order.requestedTimeSlot}</p>
              <p style="margin: 0;"><strong>💰 পেমেন্ট পদ্ধতি:</strong> ${order.paymentMethod?.toUpperCase()} (${order.paymentStatus})</p>
            </div>

            ${trxInfoHtml}

            <h3 style="margin: 16px 0 8px; font-size: 14px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">অর্ডারকৃত খাবারের পদ:</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 16px;">
              <thead>
                <tr style="background-color: #f1f5f9; text-align: left; font-size: 12px; color: #475569;">
                  <th style="padding: 8px;">খাবার</th>
                  <th style="padding: 8px; text-align: center;">পরিমাণ</th>
                  <th style="padding: 8px; text-align: right;">মূল্য</th>
                </tr>
              </thead>
              <tbody>
                ${itemsListHtml}
              </tbody>
            </table>

            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px 16px; text-align: right; font-size: 13px; margin-bottom: 20px;">
              <p style="margin: 0 0 4px; color: #475569;">সাবটোটাল: ৳${order.subtotal}</p>
              ${order.discountAmount ? `<p style="margin: 0 0 4px; color: #16a34a;">কুপন ডিসকাউন্ট: -৳${order.discountAmount}</p>` : ''}
              <p style="margin: 0 0 4px; color: #475569;">ডেলিভারি চার্জ: ৳${order.deliveryCharge}</p>
              <p style="margin: 4px 0 0; font-size: 16px; font-weight: 800; color: #166534;">সর্বমোট: ৳${order.totalAmount}</p>
            </div>

            <div style="text-align: center; margin-top: 24px;">
              <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">
                অর্ডারটি প্রক্রিয়া করতে আপনার অ্যাডমিন প্যানেলে লগইন করুন।
              </p>
            </div>
          </div>
          <div style="background-color: #f8fafc; padding: 16px 24px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
            ${fromName} • কিচেন অটোমেশন সিস্টেম
          </div>
        </div>
      `;

      let sentCount = 0;
      for (const recipient of recipientEmails) {
        if (!recipient || !recipient.includes('@')) continue;
        try {
          await transporter.sendMail({
            from: `"${fromName}" <${fromEmail}>`,
            to: recipient.trim(),
            subject: `🔔 [নতুন অর্ডার] ${order.orderNumber} - ৳${order.totalAmount} (${order.customerName})`,
            attachments,
            html,
          });
          sentCount++;
        } catch (mErr) {
          console.warn(`Failed to notify ${recipient}:`, mErr);
        }
      }

      return { success: sentCount > 0, sentCount };
    } catch (err: unknown) {
      console.error('Error sending new order admin notification:', err);
      return { success: false, sentCount: 0 };
    }
  }

  public async sendBroadcastEmail(
    config: SmtpConfig,
    recipientEmails: string[],
    broadcast: {
      subject: string;
      headline: string;
      contentText: string;
      contentHtml?: string;
      foodItem?: any;
      ctaUrl?: string;
    }
  ): Promise<{ success: boolean; sentCount: number }> {
    if (!config.isConfigured || !config.host || !config.user || !config.pass || !recipientEmails.length) {
      return { success: false, sentCount: 0 };
    }

    try {
      const transporter = this.createTransporter(config);
      const fromName = (config.senderName && !config.senderName.toLowerCase().includes('r-mart') && !config.senderName.toLowerCase().includes('r mart'))
        ? config.senderName
        : 'ঘরের স্বাদ (Ghorer Shad)';
      const fromEmail = config.senderEmail || config.user;

      const { cid, attachment } = this.resolveLogoAttachment(config.logoUrl);
      const attachments = attachment ? [attachment] : [];

      const foodPromoHtml = broadcast.foodItem ? `
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin: 20px 0; text-align: left;">
          ${broadcast.foodItem.image ? `<img src="${broadcast.foodItem.image}" alt="${broadcast.foodItem.nameBn}" style="width: 100%; max-height: 220px; object-fit: cover; display: block;" />` : ''}
          <div style="padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <h3 style="margin: 0; font-size: 16px; color: #166534; font-weight: bold;">${broadcast.foodItem.nameBn}</h3>
              <span style="font-size: 16px; font-weight: 800; color: #d97706;">৳${broadcast.foodItem.salePrice || broadcast.foodItem.price}</span>
            </div>
            <p style="font-size: 13px; color: #475569; margin: 8px 0 0; line-height: 1.5;">${broadcast.foodItem.shortDescBn || broadcast.foodItem.fullDescBn || ''}</p>
          </div>
        </div>
      ` : '';

      const bodyContent = broadcast.contentHtml || `
        <div style="font-size: 14px; line-height: 1.7; color: #334155; white-space: pre-line;">
          ${broadcast.contentText}
        </div>
      `;

      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
          <div style="background: linear-gradient(135deg, #166534 0%, #14532d 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
            <div style="margin: 0 auto 16px; width: 72px; height: 72px; border-radius: 50%; background-color: #ffffff; padding: 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.15); display: inline-block;">
              <img src="cid:${cid}" alt="${fromName}" width="64" height="64" style="width: 64px; height: 64px; border-radius: 50%; object-fit: cover; display: block; border: 0;" />
            </div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">${fromName}</h1>
            <p style="margin: 6px 0 0; font-size: 13px; color: #bbf7d0; font-weight: 500;">সব স্বাদের এক ঠিকানা • আড়াইহাজার, ঢাকা</p>
          </div>
          <div style="padding: 28px 24px; color: #1e293b;">
            <h2 style="color: #166534; font-size: 20px; margin-top: 0; font-weight: 800; line-height: 1.4;">
              ${broadcast.headline || broadcast.subject}
            </h2>
            ${bodyContent}
            ${foodPromoHtml}
            <div style="text-align: center; margin: 28px 0 16px;">
              <a href="${broadcast.ctaUrl || 'https://ghorershad.com'}" style="background-color: #166534; color: #ffffff; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 10px; display: inline-block; box-shadow: 0 2px 6px rgba(22,101,52,0.3);">
                🍽️ এখনই মেনু দেখুন ও অর্ডার করুন
              </a>
            </div>
          </div>
          <div style="background-color: #f8fafc; padding: 16px 24px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
            ${fromName} • খাঁটি ঘরোয়া বাঙালি খাবার ও ক্যাটারিং সার্ভিস • আড়াইহাজার, ঢাকা
          </div>
        </div>
      `;

      let sentCount = 0;
      for (const recipient of recipientEmails) {
        if (!recipient || !recipient.includes('@')) continue;
        try {
          await transporter.sendMail({
            from: `"${fromName}" <${fromEmail}>`,
            to: recipient.trim(),
            subject: broadcast.subject,
            attachments,
            html,
          });
          sentCount++;
        } catch (bErr) {
          console.warn(`Failed broadcast to ${recipient}:`, bErr);
        }
      }

      return { success: sentCount > 0, sentCount };
    } catch (err: unknown) {
      console.error('Error sending broadcast email:', err);
      return { success: false, sentCount: 0 };
    }
  }
}

export const smtpService = new SmtpService();

