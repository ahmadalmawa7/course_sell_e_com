import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '../../../lib/mongodb';
import { sendAdminOtpEmail } from '../../../lib/email';

type Data = {
  success: boolean;
  message: string;
};

const OTP_EXPIRY_TIME = Number(process.env.OTP_EXPIRY_TIME || '300');
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase().trim();
const OTP_ATTEMPTS = 3;

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const normalizedPassword = String(password).trim();

  if (ADMIN_EMAIL && normalizedEmail !== ADMIN_EMAIL) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const { db } = await connectToDatabase();
  const users = db.collection('users');
  let user = await users.findOne({ email: normalizedEmail });

  if (!user) {
    if (ADMIN_EMAIL && normalizedEmail === ADMIN_EMAIL) {
      const hashedPassword = await bcrypt.hash(normalizedPassword, 10);
      const createdUser = {
        name: 'Admin',
        email: normalizedEmail,
        password: hashedPassword,
        createdAt: new Date(),
        role: 'admin',
      };
      const insertResult = await users.insertOne(createdUser);
      user = await users.findOne({ _id: insertResult.insertedId });
    }
  }

  if (!user || !user.password || typeof user.password !== 'string') {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  let passwordMatches = false;
  try {
    passwordMatches = await bcrypt.compare(normalizedPassword, user.password);
  } catch {
    passwordMatches = false;
  }

  if (!passwordMatches) {
    if (normalizedPassword === user.password) {
      const newHash = await bcrypt.hash(normalizedPassword, 10);
      await users.updateOne({ _id: user._id }, { $set: { password: newHash } });
      passwordMatches = true;
    }
  }

  if (!passwordMatches) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
  const otpHash = await bcrypt.hash(otp, 10);
  const otpExpiry = new Date(Date.now() + OTP_EXPIRY_TIME * 1000);

  await users.updateOne(
    { _id: user._id },
    {
      $set: {
        otpHash,
        otpExpiry,
        otpAttemptsLeft: OTP_ATTEMPTS,
      },
      $unset: {
        otpVerified: '',
      },
    }
  );

  const emailSent = await sendAdminOtpEmail(normalizedEmail, otp, OTP_EXPIRY_TIME);
  if (!emailSent) {
    // For development: log OTP to console if email fails
    console.log(`[DEV MODE] Admin OTP for ${normalizedEmail}: ${otp}`);
    return res.status(200).json({ success: true, message: 'Email not configured. Check server console for OTP.' });
  }

  return res.status(200).json({ success: true, message: 'OTP sent. Please verify the code to continue.' });
}
