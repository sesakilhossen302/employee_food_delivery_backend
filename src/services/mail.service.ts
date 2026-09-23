import nodemailer, { Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

const getTransporter = (): Transporter | null => {
  if (!transporter) {
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });
      console.log('📧 Gmail SMTP Transporter initialized');
    } else {
      console.log('⚠️ GMAIL_USER / GMAIL_APP_PASSWORD not set in .env. Falling back to console OTP.');
    }
  }
  return transporter;
};

export const sendOtpEmail = async (email: string, otp: string, purpose: string): Promise<boolean> => {
  const mailer = getTransporter();

  // Clean, professional HTML Email Template
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .card { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 36px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .logo { font-size: 24px; font-weight: 900; color: #0284c7; text-align: center; margin-bottom: 8px; }
        .sub { font-size: 13px; color: #64748b; text-align: center; margin-bottom: 24px; }
        .otp-box { background: #f0f9ff; border: 2px dashed #0284c7; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
        .otp-code { font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #0369a1; font-family: monospace; }
        .warning { font-size: 12px; color: #94a3b8; text-align: center; margin-top: 20px; }
        .footer { font-size: 11px; color: #94a3b8; text-align: center; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">⛽ DAKOTA CONVENIENCE STORE</div>
        <div class="sub">Your Verification Security Code</div>
        <p>Hello,</p>
        <p>Use the following 6-digit verification code for your <strong>${purpose.replace('_', ' ')}</strong> request:</p>
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
        </div>
        <p class="warning">⏱️ This code will expire in <strong>5 minutes</strong>. If you did not request this code, please ignore this email.</p>
        <div class="footer">
          © 2026 Dakota Gas Station & Delivery App. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  if (!mailer) {
    console.log(`\n========================================`);
    console.log(`📧 [GMAIL OTP - CONSOLE FALLBACK] To: ${email}`);
    console.log(`🔑 Verification Code: ${otp}`);
    console.log(`🎯 Purpose: ${purpose}`);
    console.log(`========================================\n`);
    return true;
  }

  try {
    await mailer.sendMail({
      from: `"Dakota Store" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Your Dakota Store Verification Code: ${otp}`,
      html: htmlContent,
    });
    console.log(`✅ Gmail OTP sent successfully to: ${email}`);
    return true;
  } catch (error: any) {
    console.error(`❌ Failed to send email via Gmail: ${error.message}`);
    console.log(`🔑 Fallback OTP for ${email}: ${otp}`);
    return true;
  }
};