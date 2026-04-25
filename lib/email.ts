import nodemailer from 'nodemailer';

// Validate environment variables
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

if (!EMAIL_USER || !EMAIL_PASSWORD) {
  console.error('[Email Config] Missing required environment variables:');
  if (!EMAIL_USER) console.error('  - EMAIL_USER is not set');
  if (!EMAIL_PASSWORD) console.error('  - EMAIL_PASSWORD is not set');
  console.error('[Email Config] Please add these to your .env file');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify transporter configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('[Email Transporter] Verification failed:', error.message);
    console.error('[Email Transporter] Make sure you are using a Gmail App Password, not your regular password');
    console.error('[Email Transporter] Generate one at: https://myaccount.google.com/apppasswords');
  } else {
    console.log('[Email Transporter] Ready to send emails');
  }
});

export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    // Check if email is configured
    if (!EMAIL_USER || !EMAIL_PASSWORD) {
      console.error('[SendWelcomeEmail] Cannot send email - missing configuration');
      return false;
    }

    const mailOptions = {
      from: `"Erudition Infinite" <${EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to Erudition Infinite!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #8B0000 0%, #D4AF37 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Erudition Infinite</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
            <p style="font-size: 16px; color: #333; line-height: 1.6;">Dear ${name},</p>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Welcome to Erudition Infinite! We are thrilled to have you join our learning community.
            </p>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Your account has been successfully created. You can now explore our wide range of courses,
              enroll in your favorite subjects, and start your learning journey with us.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/courses"
                 style="background: #8B0000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Explore Courses
              </a>
            </div>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              If you have any questions or need assistance, feel free to reach out to our support team.
            </p>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Best regards,<br>
              The Erudition Infinite Team
            </p>
          </div>
          <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #666;">
            <p>© 2026 Erudition Infinite. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[SendWelcomeEmail] Email sent successfully to ${email}, MessageId: ${info.messageId}`);
    return true;
  } catch (error: any) {
    console.error('[SendWelcomeEmail] Failed to send email to:', email);
    console.error('[SendWelcomeEmail] Error:', error.message);

    if (error.code === 'EAUTH') {
      console.error('[SendWelcomeEmail] Authentication failed - Check your EMAIL_USER and EMAIL_PASSWORD');
      console.error('[SendWelcomeEmail] For Gmail, use an App Password: https://myaccount.google.com/apppasswords');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('[SendWelcomeEmail] Network error - Check your internet connection');
    }

    return false;
  }
};
