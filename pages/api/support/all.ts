import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    const { db } = await connectToDatabase();
    const docs = await db.collection('feedback').find({}).sort({ createdAt: -1 }).toArray();
    const tickets = docs.map(d => ({
      _id: d._id.toString(),
      userId: d.userId ? d.userId.toString() : null,
      userName: d.userName || '',
      enrolledCourses: Array.isArray(d.enrolledCourses) ? d.enrolledCourses.map((c: any) => String(c)) : [],
      subject: d.subject || '',
      description: d.description || '',
      status: d.status || 'open',
      createdAt: d.createdAt instanceof Date ? d.createdAt.toISOString() : d.createdAt,
      messages: Array.isArray(d.messages) ? d.messages.map((m: any) => ({ sender: m.sender, message: m.message || m.text, createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt })) : [],
    }));
    return res.status(200).json({ success: true, tickets });
  } catch (err) {
    console.error('support/all error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
