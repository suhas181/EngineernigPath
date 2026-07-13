import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST || 'smtp.mailtrap.io';
const port = parseInt(process.env.SMTP_PORT || '2525', 10);
const user = process.env.SMTP_USER || '';
const pass = process.env.SMTP_PASS || '';

const transportConfig: any = {
  host,
  port,
};

// Check if credentials are placeholders or empty
const isPlaceholder = (str: string) => !str || str.startsWith('your-smtp-') || str === 'mock-smtp-';
const hasAuth = !isPlaceholder(user) && !isPlaceholder(pass);

if (hasAuth) {
  transportConfig.auth = { user, pass };
}

const transporter = nodemailer.createTransport(transportConfig);

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

export const sendVerificationEmail = async (
  email: string,
  name: string,
  token: string
): Promise<void> => {
  const verificationUrl = `${FRONTEND_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"EngineerPath" <noreply@engineerpath.com>',
    to: email,
    subject: 'Verify your email - EngineerPath',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #3b82f6;">Welcome to EngineerPath, ${name}!</h2>
        <p>Thank you for signing up. Please click the button below to verify your email address and activate your account:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Verify Email Address</a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #6b7280;">${verificationUrl}</p>
        <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #9ca3af;">If you did not create an account, no further action is required.</p>
      </div>
    `,
  };

  try {
    const shouldSend = host !== 'smtp.mailtrap.io' || hasAuth;

    if (!shouldSend) {
      console.log('-----------------------------------------');
      console.log(`[MAIL MOCK] Verification email to ${email}`);
      console.log(`URL: ${verificationUrl}`);
      console.log('-----------------------------------------');
      return;
    }
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending verification email, fallback to console log:', error);
    console.log('-----------------------------------------');
    console.log(`[MAIL FALLBACK] Verification url to ${email}: ${verificationUrl}`);
    console.log('-----------------------------------------');
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  token: string
): Promise<void> => {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"EngineerPath" <noreply@engineerpath.com>',
    to: email,
    subject: 'Reset your password - EngineerPath',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #3b82f6;">Hello, ${name}</h2>
        <p>You requested a password reset. Please click the button below to choose a new password. This link is valid for 1 hour:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>
        <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #9ca3af;">If you did not request this, you can ignore this email safely.</p>
      </div>
    `,
  };

  try {
    const shouldSend = host !== 'smtp.mailtrap.io' || hasAuth;

    if (!shouldSend) {
      console.log('-----------------------------------------');
      console.log(`[MAIL MOCK] Password reset email to ${email}`);
      console.log(`URL: ${resetUrl}`);
      console.log('-----------------------------------------');
      return;
    }
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending password reset email, fallback to console log:', error);
    console.log('-----------------------------------------');
    console.log(`[MAIL FALLBACK] Password reset url to ${email}: ${resetUrl}`);
    console.log('-----------------------------------------');
  }
};
