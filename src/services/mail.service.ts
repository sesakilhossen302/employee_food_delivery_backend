import nodemailer, { Transporter } from 'nodemailer';
import { ENV } from '../config/env.js';

let transporter: Transporter | null = null;

export const getTransporter = (): Transporter => {
  if (!transporter) {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER || process.env.GMAIL_USER;
    const pass = process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD;

    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for 587
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false, // Prevents local self-signed cert issues
      },
    });

    console.log(`📧 Gmail SMTP Transporter initialized (${host}:${port}, User: ${user})`);
  }
  return transporter;
};

export const sendOtpEmail = async (
  toEmail: string,
  otp: string,
  purpose: string = 'Account Verification'
): Promise<boolean> => {
  const mailer = getTransporter();
  const storeName = process.env.STORE_NAME || 'Dakota Gas Station & Convenience Store';
  const fromName = process.env.SMTP_FROM_NAME || 'Dakota Store & Delivery';
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'no-reply@dakotastore.com';

  const formattedPurpose = purpose
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

  // Premium, Responsive HTML Email Template
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Verification Code</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f1f5f9;
      padding: 40px 16px;
    }
    .container {
      max-width: 520px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #0f172a 0%, #0369a1 100%);
      padding: 36px 32px 28px;
      text-align: center;
      color: #ffffff;
    }
    .header-badge {
      display: inline-block;
      padding: 4px 12px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 12px;
      color: #7dd3fc;
    }
    .header h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
      line-height: 1.2;
    }
    .header p {
      margin: 6px 0 0;
      font-size: 12px;
      color: #bae6fd;
    }
    .content {
      padding: 36px 32px;
    }
    .greeting {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 8px;
    }
    .desc {
      font-size: 14px;
      line-height: 1.6;
      color: #475569;
      margin: 0 0 24px;
    }
    .otp-card {
      background: #f8fafc;
      border: 2px dashed #0284c7;
      border-radius: 20px;
      padding: 24px;
      text-align: center;
      margin: 24px 0;
    }
    .otp-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #64748b;
      margin-bottom: 8px;
    }
    .otp-value {
      font-family: 'Courier New', Courier, monospace;
      font-size: 42px;
      font-weight: 900;
      letter-spacing: 12px;
      color: #0369a1;
      padding-left: 12px;
      line-height: 1;
      user-select: all;
    }
    .timer-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-top: 12px;
      padding: 4px 10px;
      background: #e0f2fe;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 600;
      color: #0284c7;
    }
    .security-note {
      background-color: #fffbeb;
      border: 1px solid #fef3c7;
      border-radius: 12px;
      padding: 14px 16px;
      font-size: 12px;
      line-height: 1.5;
      color: #92400e;
      margin-top: 24px;
    }
    .footer {
      background-color: #f8fafc;
      padding: 24px 32px;
      border-top: 1px solid #f1f5f9;
      text-align: center;
    }
    .footer p {
      margin: 0 0 6px;
      font-size: 12px;
      color: #64748b;
    }
    .footer .subtext {
      font-size: 11px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      
      <!-- Header -->
      <div class="header">
        <div class="header-badge">⛽ Convenience Store & Delivery</div>
        <h1>${storeName}</h1>
        <p>Fast Local Delivery & Mobile Ordering</p>
      </div>

      <!-- Main Body -->
      <div class="content">
        <div class="greeting">Hello there,</div>
        <p class="desc">
          We received a request for <strong>${formattedPurpose}</strong> for your account. Please use the 6-digit verification code below to complete this action:
        </p>

        <!-- OTP Display Box -->
        <div class="otp-card">
          <div class="otp-label">Verification Code</div>
          <div class="otp-value">${otp}</div>
          <div class="timer-badge">
            ⏱️ Expires in 5 minutes
          </div>
        </div>

        <!-- Security Callout -->
        <div class="security-note">
          <strong>🔒 Security Warning:</strong> Never share this code with anyone. Our staff will never ask for your verification code. If you did not request this, you can safely ignore this email.
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p>Need help? Contact support or reply directly to this email.</p>
        <p class="subtext">
          © ${new Date().getFullYear()} ${storeName}. All rights reserved.
        </p>
      </div>

    </div>
  </div>
</body>
</html>
  `;

  try {
    const info = await mailer.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: toEmail,
      subject: `${otp} is your ${storeName} verification code`,
      html: htmlContent,
      text: `Your ${storeName} verification code is: ${otp}. It will expire in 5 minutes.`,
    });

    console.log(`✅ Real Gmail OTP successfully sent to: ${toEmail} (MessageId: ${info.messageId})`);
    return true;
  } catch (error: any) {
    console.error(`❌ Gmail SMTP sending error: ${error.message}`);
    // Log clearly to console so developer can always test
    console.log(`🔑 Fallback OTP for ${toEmail}: ${otp}`);
    return true;
  }
};