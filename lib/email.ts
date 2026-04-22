import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
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

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};
