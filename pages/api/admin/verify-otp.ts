import crypto from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '../../../lib/mongodb';

type Data = {
  success: boolean;
  message: string;
  token?: string;
  user?: any;
};

const OTP_EXPIRY_TIME = Number(process.env.OTP_EXPIRY_TIME || '300');

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP are required' });
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const normalizedOtp = String(otp).trim();

  const { db } = await connectToDatabase();
  const users = db.collection('users');
  const user = await users.findOne({ email: normalizedEmail });

  if (!user || !user.otpHash || !user.otpExpiry) {
    return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
  }

  const otpExpiry = new Date(user.otpExpiry);
  const attemptsLeft = typeof user.otpAttemptsLeft === 'number' ? user.otpAttemptsLeft : 0;
  const now = new Date();

  if (now > otpExpiry || attemptsLeft <= 0) {
    await users.updateOne(
      { _id: user._id },
      { $unset: { otpHash: '', otpExpiry: '', otpAttemptsLeft: '' } }
    );
    return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
  }

  const match = await bcrypt.compare(normalizedOtp, user.otpHash);
  if (!match) {
    const remaining = Math.max(0, attemptsLeft - 1);
    const update: any = { $set: { otpAttemptsLeft: remaining } };
    if (remaining <= 0) {
      update.$unset = { otpHash: '', otpExpiry: '', otpAttemptsLeft: '' };
    }

    await users.updateOne({ _id: user._id }, update);
    return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
  }

  await users.updateOne(
    { _id: user._id },
    { $unset: { otpHash: '', otpExpiry: '', otpAttemptsLeft: '' } }
  );

  const secret = process.env.JWT_SECRET || '';
  const token = secret
    ? crypto.createHmac('sha256', secret).update(`${normalizedEmail}:${Date.now()}`).digest('hex')
    : crypto.randomBytes(32).toString('hex');

  const safeUser = {
    id: user._id?.toString() || user.id || '',
    name: user.name || 'Admin',
    email: user.email,
    phone: user.phone || '',
    profileImage: user.profileImage || '',
    enrolledCourses: Array.isArray(user.enrolledCourses) ? user.enrolledCourses : [],
    completedCourses: Array.isArray(user.completedCourses) ? user.completedCourses : [],
    progress: user.progress || {},
    certificates: Array.isArray(user.certificates) ? user.certificates : [],
  };

  return res.status(200).json({ success: true, message: 'OTP verified', token, user: safeUser });
}
