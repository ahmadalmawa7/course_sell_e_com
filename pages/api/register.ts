import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../lib/mongodb';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail } from '../../lib/email';

type Data = { success: boolean; message: string; user?: any };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'name, email and password are required' });
  }

  const { db } = await connectToDatabase();
  const users = db.collection('users');

  const existing = await users.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ success: false, message: 'Email already registered' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    createdAt: new Date(),
    enrolledCourses: [],
    completedCourses: [],
    progress: {},
    certificates: [],
  };

  const result = await users.insertOne(newUser);
  const saved = await users.findOne({ _id: result.insertedId }, { projection: { password: 0 } });

  const { password: _pwd, _id, enrolledCourses, completedCourses, ...savedRest } = saved as any;
  const userWithoutPassword = {
    id: _id?.toString(),
    enrolledCourses: Array.isArray(enrolledCourses)
      ? enrolledCourses.map((c: any) => c?.toString ? c.toString() : c)
      : [],
    completedCourses: Array.isArray(completedCourses)
      ? completedCourses.map((c: any) => c?.toString ? c.toString() : c)
      : [],
    progress: saved.progress || {},
    certificates: saved.certificates || [],
    ...savedRest,
  };

  // Send welcome email
  try {
    await sendWelcomeEmail(email.toLowerCase(), name);
  } catch (emailError) {
    console.error('Failed to send welcome email:', emailError);
    // Don't fail registration if email fails
  }

  return res.status(201).json({ success: true, message: 'Registered successfully', user: userWithoutPassword });
}
