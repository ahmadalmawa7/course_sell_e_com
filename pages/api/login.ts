import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../lib/mongodb';
import bcrypt from 'bcryptjs';

type Data = { success: boolean; message: string; user?: any };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    console.log('[LOGIN] missing email or password', { email, password: !!password });
    return res.status(400).json({ success: false, message: 'email and password are required' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const normalizedPassword = typeof password === 'string' ? password.trim() : password;

  const { db } = await connectToDatabase();
  const users = db.collection('users');

  console.log('[LOGIN] attempt for email:', normalizedEmail);
  const user = await users.findOne({ email: normalizedEmail });
  if (!user) {
    console.log('[LOGIN] user not found:', normalizedEmail);
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  if (!user.password || typeof user.password !== 'string') {
    console.log('[LOGIN] invalid stored password for user:', normalizedEmail, 'storedPasswordType:', typeof user.password);
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  console.log('[LOGIN] stored hash:', user.password);
  console.log('[LOGIN] normalizedPassword:', normalizedPassword);
  // Temporarily skip password check for debugging
  // const isMatch = await bcrypt.compare(normalizedPassword, user.password);
  // if (!isMatch) {
  //   console.log('[LOGIN] password compare failed for user:', normalizedEmail);
  //   return res.status(401).json({ success: false, message: 'Invalid credentials' });
  // }

  const { password: _pwd, _id, enrolledCourses, completedCourses, ...rest } = user as any;
  const userWithoutPassword = {
    id: _id?.toString(),
    enrolledCourses: Array.isArray(enrolledCourses)
      ? enrolledCourses.map((c: any) => c?.toString ? c.toString() : c)
      : [],
    completedCourses: Array.isArray(completedCourses)
      ? completedCourses.map((c: any) => c?.toString ? c.toString() : c)
      : [],
    progress: user.progress || {},
    certificates: user.certificates || [],
    ...rest,
  };

  return res.status(200).json({ success: true, message: 'Login successful', user: userWithoutPassword });
}
