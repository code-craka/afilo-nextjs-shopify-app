import { Resend } from 'resend';
import { UserCredentials, generateLoginLink } from './credentials-generator';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SubscriptionEmailData {
  credentials: UserCredentials;
  subscriptionId?: string;
  planName: string;
  amount: number;
  billingInterval: 'month' | 'year';
  nextBillingDate: string;
}

/**
 * Send welcome email with credentials after successful payment
 *
 * @param data - Subscription and credential information
 */
export async function sendCredentialsEmail(
  data: SubscriptionEmailData
): Promise<void> {
  const loginLink = generateLoginLink(data.credentials.accountId);

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: white;
    }
    .header {
      background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
      font-weight: 700;
    }
    .header p {
      margin: 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
    }
    .credentials-box {
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      border: 2px solid #0F172A;
      padding: 25px;
      border-radius: 12px;
      margin: 25px 0;
    }
    .credentials-box h3 {
      margin: 0 0 20px 0;
      color: #0F172A;
      font-size: 20px;
      font-weight: 700;
    }
    .credential-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 12px 0;
      padding: 15px;
      background: white;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .credential-label {
      font-weight: 600;
      color: #64748b;
      font-size: 14px;
    }
    .credential-value {
      font-family: 'Courier New', monospace;
      color: #0F172A;
      font-weight: 700;
      font-size: 15px;
      background: #f1f5f9;
      padding: 5px 12px;
      border-radius: 4px;
    }
    .button {
      display: inline-block;
      background: #0F172A;
      color: white;
      padding: 16px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 25px 0;
      transition: background 0.2s;
    }
    .button:hover {
      background: #1E293B;
    }
    .warning {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 16px;
      margin: 25px 0;
      border-radius: 6px;
    }
    .warning strong {
      color: #92400e;
    }
    .section {
      margin: 30px 0;
    }
    .section h3 {
      color: #0F172A;
      font-size: 20px;
      margin: 0 0 15px 0;
      font-weight: 700;
    }
    .details-list {
      background: #f8fafc;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .detail-item {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    .detail-item:last-child {
      border-bottom: none;
    }
    .detail-label {
      color: #64748b;
      font-weight: 500;
    }
    .detail-value {
      color: #0F172A;
      font-weight: 600;
    }
    .steps {
      counter-reset: step-counter;
      list-style: none;
      padding: 0;
    }
    .steps li {
      counter-increment: step-counter;
      margin: 20px 0;
      padding-left: 50px;
      position: relative;
    }
    .steps li::before {
      content: counter(step-counter);
      position: absolute;
      left: 0;
      top: 0;
      width: 35px;
      height: 35px;
      background: #0F172A;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 16px;
    }
    .steps li strong {
      display: block;
      color: #0F172A;
      margin-bottom: 5px;
      font-size: 16px;
    }
    .steps li span {
      color: #64748b;
      font-size: 14px;
    }
    .footer {
      text-align: center;
      color: #64748b;
      font-size: 13px;
      padding: 30px;
      border-top: 1px solid #e2e8f0;
      background: #f8fafc;
    }
    .footer p {
      margin: 8px 0;
    }
    .footer a {
      color: #0F172A;
      text-decoration: none;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to Afilo Enterprise!</h1>
      <p>Your ${data.planName} is now active</p>
    </div>

    <div class="content">
      <p style="font-size: 16px; margin-bottom: 10px;"><strong>Hello,</strong></p>

      <p style="font-size: 15px; line-height: 1.7;">
        Thank you for subscribing to <strong>${data.planName}</strong>! Your payment of
        <strong>$${(data.amount / 100).toFixed(2)}</strong> has been processed successfully.
      </p>

      <p style="font-size: 15px; line-height: 1.7; color: #16a34a; font-weight: 600;">
        ✅ Your account is now active and ready to use!
      </p>

      <div class="credentials-box">
        <h3>🔐 Your Login Credentials</h3>

        <div class="credential-row">
          <span class="credential-label">Email</span>
          <span class="credential-value">${data.credentials.email}</span>
        </div>

        <div class="credential-row">
          <span class="credential-label">Username</span>
          <span class="credential-value">${data.credentials.username}</span>
        </div>

        <div class="credential-row">
          <span class="credential-label">Temporary Password</span>
          <span class="credential-value">${data.credentials.temporaryPassword}</span>
        </div>

        <div class="credential-row">
          <span class="credential-label">Account ID</span>
          <span class="credential-value">${data.credentials.accountId}</span>
        </div>
      </div>

      <div class="warning">
        ⚠️ <strong>Important Security Notice:</strong> Please change your password immediately after your first login. This temporary password should only be used once.
      </div>

      <center>
        <a href="${loginLink}" class="button">🚀 Access Your Account Now</a>
      </center>

      <div class="section">
        <h3>📋 Subscription Details</h3>
        <div class="details-list">
          <div class="detail-item">
            <span class="detail-label">Plan</span>
            <span class="detail-value">${data.planName}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">User Limit</span>
            <span class="detail-value">${data.credentials.userLimit} users</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Billing Amount</span>
            <span class="detail-value">$${(data.amount / 100).toFixed(2)}/${data.billingInterval}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Next Billing Date</span>
            <span class="detail-value">${data.nextBillingDate}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Subscription ID</span>
            <span class="detail-value">${data.subscriptionId}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <h3>🚀 Getting Started</h3>
        <ol class="steps">
          <li>
            <strong>Click the access button above</strong>
            <span>Or visit app.afilo.io and use your credentials</span>
          </li>
          <li>
            <strong>Login with your credentials</strong>
            <span>Use the username and temporary password provided</span>
          </li>
          <li>
            <strong>Change your password</strong>
            <span>Set a secure password that only you know</span>
          </li>
          <li>
            <strong>Complete your profile setup</strong>
            <span>Add your company details and preferences</span>
          </li>
          <li>
            <strong>Start using the platform!</strong>
            <span>Explore features and invite your team members</span>
          </li>
        </ol>
      </div>

      <div class="section">
        <h3>💡 Need Help?</h3>
        <p style="font-size: 15px; line-height: 1.7; margin-bottom: 15px;">
          Our support team is here to assist you 24/7:
        </p>
        <ul style="font-size: 15px; line-height: 2;">
          <li>📧 Email: <a href="mailto:support@afilo.io" style="color: #0F172A; font-weight: 600;">support@afilo.io</a></li>
          <li>📞 Phone: +1 (555) 123-4567</li>
          <li>💬 Live Chat: Available in your dashboard</li>
          <li>📚 Documentation: <a href="https://docs.afilo.io" style="color: #0F172A; font-weight: 600;">docs.afilo.io</a></li>
        </ul>
      </div>

      <div class="footer">
        <p><strong>© 2025 Afilo Enterprise. All rights reserved.</strong></p>
        <p>This is an automated email. Please do not reply to this message.</p>
        <p>To manage your subscription, visit your <a href="${loginLink}">account dashboard</a>.</p>
        <p style="margin-top: 15px; font-size: 12px;">
          If you didn't request this subscription, please contact us immediately at support@afilo.io
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  await resend.emails.send({
    from: 'Afilo Enterprise <noreply@afilo.io>',
    to: data.credentials.email,
    subject: `🎉 Welcome to Afilo - Your ${data.planName} is Active!`,
    html: emailHtml,
  });
}

/**
 * Send subscription renewal confirmation
 *
 * @param customerEmail - Customer's email address
 * @param planName - Name of the subscription plan
 * @param amount - Amount charged in cents
 * @param nextBillingDate - Next billing date as formatted string
 */
export async function sendRenewalConfirmationEmail(
  customerEmail: string,
  planName: string,
  amount: number,
  nextBillingDate: string
): Promise<void> {
  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #16a34a; color: white; padding: 30px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
    .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 8px; }
    .details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Subscription Renewed</h1>
    </div>
    <div class="content">
      <p>Your <strong>${planName}</strong> subscription has been renewed successfully.</p>

      <div class="details">
        <div class="detail-row">
          <span>Amount Charged:</span>
          <strong>$${(amount / 100).toFixed(2)}</strong>
        </div>
        <div class="detail-row">
          <span>Next Billing Date:</span>
          <strong>${nextBillingDate}</strong>
        </div>
      </div>

      <p>Thank you for continuing with Afilo Enterprise!</p>
      <p>Your subscription will automatically renew on ${nextBillingDate}.</p>

      <p style="margin-top: 30px; color: #64748b; font-size: 14px;">
        To manage your subscription or update payment methods, visit your
        <a href="https://app.afilo.io/dashboard/billing" style="color: #0F172A;">account dashboard</a>.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  await resend.emails.send({
    from: 'Afilo Enterprise <noreply@afilo.io>',
    to: customerEmail,
    subject: `Subscription Renewed - ${planName}`,
    html: emailHtml,
  });
}

/**
 * Send subscription cancellation email
 *
 * @param customerEmail - Customer's email address
 * @param planName - Name of the subscription plan
 * @param accessUntilDate - Date when access will end
 */
export async function sendCancellationEmail(
  customerEmail: string,
  planName: string,
  accessUntilDate: string
): Promise<void> {
  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
    .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 8px; }
    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Subscription Cancelled</h1>
    </div>
    <div class="content">
      <p>Your <strong>${planName}</strong> subscription has been cancelled as requested.</p>

      <div class="warning">
        <strong>Access Until:</strong> ${accessUntilDate}
        <p style="margin: 10px 0 0 0;">
          You will continue to have full access to your account until this date.
        </p>
      </div>

      <p>We're sorry to see you go! If you have any feedback about your experience, we'd love to hear from you.</p>

      <p>You can reactivate your subscription anytime by visiting your account dashboard.</p>

      <p style="margin-top: 30px; color: #64748b; font-size: 14px;">
        Questions? Contact us at <a href="mailto:support@afilo.io" style="color: #0F172A;">support@afilo.io</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;

  await resend.emails.send({
    from: 'Afilo Enterprise <noreply@afilo.io>',
    to: customerEmail,
    subject: `Subscription Cancelled - ${planName}`,
    html: emailHtml,
  });
}

/**
 * Send payment failure notification
 *
 * @param customerEmail - Customer's email address
 * @param planName - Name of the subscription plan
 * @param amount - Failed payment amount in cents
 * @param retryDate - Date when payment will be retried
 */
export async function sendPaymentFailedEmail(
  customerEmail: string,
  planName: string,
  amount: number,
  retryDate: string
): Promise<void> {
  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f59e0b; color: white; padding: 30px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
    .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 8px; }
    .button { display: inline-block; background: #0F172A; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Payment Failed</h1>
    </div>
    <div class="content">
      <p>We were unable to process your payment for <strong>${planName}</strong>.</p>

      <p><strong>Amount:</strong> $${(amount / 100).toFixed(2)}</p>
      <p><strong>Next Retry:</strong> ${retryDate}</p>

      <p>Please update your payment method to avoid service interruption.</p>

      <center>
        <a href="https://app.afilo.io/dashboard/billing" class="button">Update Payment Method</a>
      </center>

      <p style="margin-top: 30px; color: #64748b; font-size: 14px;">
        Need help? Contact us at <a href="mailto:support@afilo.io" style="color: #0F172A;">support@afilo.io</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;

  await resend.emails.send({
    from: 'Afilo Enterprise <noreply@afilo.io>',
    to: customerEmail,
    subject: `⚠️ Payment Failed - ${planName}`,
    html: emailHtml,
  });
}
