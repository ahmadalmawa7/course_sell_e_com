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

// Titan Email SMTP Configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.titan.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // Use STARTTLS
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // Allow self-signed certificates if needed
  },
});

// Verify transporter configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('[Email Transporter] Verification failed:', error.message || error);
    console.error('[Email Transporter] Check your SMTP credentials and server configuration.');
  } else {
    console.log('[Email Transporter] Email transporter is ready to send messages');
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
      from: `"Erudition Infinite" <${process.env.EMAIL_USER}>`,
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
    console.error('[SendWelcomeEmail] Error:', error instanceof Error ? error.message : error);

    if (error && typeof error === 'object' && 'code' in error) {
      if ((error as any).code === 'EAUTH') {
        console.error('[SendWelcomeEmail] Authentication failed - Check your EMAIL_USER and EMAIL_PASSWORD');
        console.error('[SendWelcomeEmail] For Gmail, use an App Password: https://myaccount.google.com/apppasswords');
      } else if ((error as any).code === 'ENOTFOUND' || (error as any).code === 'ECONNREFUSED') {
        console.error('[SendWelcomeEmail] Network error - Check your internet connection');
      }
    }

    return false;
  }
};

/**
 * Send login notification email to user
 * @param email - User's email address
 * @param name - User's name
 * @param ipAddress - Optional IP address of the login
 * @param device - Optional device information
 */
export const sendLoginNotification = async (email: string, name: string, ipAddress?: string, device?: string) => {
  try {
    const date = new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    const mailOptions = {
      from: `"Erudition Infinite" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'New Login Detected - Erudition Infinite',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #8B0000 0%, #D4AF37 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Login Detected</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
            <p style="font-size: 16px; color: #333; line-height: 1.6;">Dear ${name},</p>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              We detected a new login to your Erudition Infinite account.
            </p>
            <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8B0000;">
              <p style="margin: 5px 0; font-size: 14px;"><strong>Date & Time:</strong> ${date}</p>
              ${ipAddress ? `<p style="margin: 5px 0; font-size: 14px;"><strong>IP Address:</strong> ${ipAddress}</p>` : ''}
              ${device ? `<p style="margin: 5px 0; font-size: 14px;"><strong>Device:</strong> ${device}</p>` : ''}
            </div>
            <p style="font-size: 14px; color: #666; line-height: 1.6;">
              If this was you, you can safely ignore this email. If you did not log in, please contact our support team immediately.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/support" 
                 style="background: #8B0000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Contact Support
              </a>
            </div>
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
    console.log(`[EMAIL SUCCESS] Login notification sent to ${email}`);
    console.log(`[EMAIL INFO] Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send login notification to ${email}`);
    console.error('[EMAIL ERROR] Error details:', error);
    if (error instanceof Error) {
      console.error('[EMAIL ERROR] Error message:', error.message);
    }
    return false;
  }
};

/**
 * Send course enrollment confirmation email
 * @param email - User's email address
 * @param name - User's name
 * @param courseName - Name of the enrolled course
 * @param courseId - Course ID for building course link
 */
export const sendEnrollmentConfirmation = async (email: string, name: string, courseName: string, courseId: string) => {
  try {
    const mailOptions = {
      from: `"Erudition Infinite" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Enrollment Confirmation - ${courseName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #8B0000 0%, #D4AF37 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Enrollment Confirmed!</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
            <p style="font-size: 16px; color: #333; line-height: 1.6;">Dear ${name},</p>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Congratulations! You have successfully enrolled in <strong>${courseName}</strong>.
            </p>
            <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #D4AF37;">
              <p style="margin: 5px 0; font-size: 16px;"><strong>Course:</strong> ${courseName}</p>
              <p style="margin: 5px 0; font-size: 14px; color: #666;">Enrolled on: ${new Date().toLocaleDateString()}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard" 
                 style="background: #8B0000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Go to Dashboard
              </a>
            </div>
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
    console.log(`[EMAIL SUCCESS] Enrollment confirmation sent to ${email}`);
    console.log(`[EMAIL INFO] Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send enrollment confirmation to ${email}`);
    console.error('[EMAIL ERROR] Error details:', error);
    if (error instanceof Error) {
      console.error('[EMAIL ERROR] Error message:', error.message);
    }
    return false;
  }
};

/**
 * Test email configuration - sends a test email
 * @param toEmail - Email address to send test to
 */
export const sendTestEmail = async (toEmail: string) => {
  try {
    const mailOptions = {
      from: `"Erudition Infinite" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: 'Test Email - Erudition Infinite SMTP Configuration',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #8B0000 0%, #D4AF37 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Test Email</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              This is a test email to verify that the Titan Email SMTP configuration is working correctly.
            </p>
            <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8B0000;">
              <p style="margin: 5px 0; font-size: 14px;"><strong>SMTP Host:</strong> ${process.env.SMTP_HOST || 'smtp.titan.email'}</p>
              <p style="margin: 5px 0; font-size: 14px;"><strong>SMTP Port:</strong> ${process.env.SMTP_PORT || '587'}</p>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              If you received this email, your email configuration is working correctly!
            </p>
          </div>
          <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #666;">
            <p>© 2026 Erudition Infinite. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SUCCESS] Test email sent to ${toEmail}`);
    console.log(`[EMAIL INFO] Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send test email to ${toEmail}`);
    console.error('[EMAIL ERROR] Error details:', error);
    return false;
  }
};
