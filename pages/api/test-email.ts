import type { NextApiRequest, NextApiResponse } from 'next';
import { sendTestEmail, sendWelcomeEmail } from '../../lib/email';

type Data = { success: boolean; message: string };

/**
 * API endpoint to test email configuration
 * POST /api/test-email
 * Body: { email: string, type: 'test' | 'welcome', name?: string }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  // Check for admin authorization (optional, can be removed for testing)
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const authHeader = req.headers.authorization;
  
  // Simple check - in production, use proper authentication
  if (!authHeader && process.env.NODE_ENV === 'production') {
    console.warn('[TEST EMAIL] Unauthorized attempt to send test email');
  }

  const { email, type = 'test', name = 'Test User' } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email address is required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email format' });
  }

  try {
    console.log(`[TEST EMAIL] Attempting to send ${type} email to: ${email}`);
    console.log(`[TEST EMAIL] SMTP Host: ${process.env.SMTP_HOST || 'smtp.titan.email'}`);
    console.log(`[TEST EMAIL] From: ${process.env.EMAIL_USER}`);

    let result: boolean;

    if (type === 'welcome') {
      result = await sendWelcomeEmail(email, name);
    } else {
      result = await sendTestEmail(email);
    }

    if (result) {
      console.log(`[TEST EMAIL] Successfully sent ${type} email to ${email}`);
      return res.status(200).json({
        success: true,
        message: `${type === 'welcome' ? 'Welcome' : 'Test'} email sent successfully to ${email}`,
      });
    } else {
      console.error(`[TEST EMAIL] Failed to send ${type} email to ${email}`);
      return res.status(500).json({
        success: false,
        message: `Failed to send ${type} email. Check server logs for details.`,
      });
    }
  } catch (error) {
    console.error('[TEST EMAIL] Unexpected error:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
