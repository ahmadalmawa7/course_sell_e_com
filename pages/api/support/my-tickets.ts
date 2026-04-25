import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const userId = Array.isArray(req.query.userId) ? req.query.userId[0] : req.query.userId;
  if (!userId || !String(userId).trim()) {
    return res.status(400).json({ success: false, message: 'userId is required' });
  }

  try {
    const { db } = await connectToDatabase();
    const docs = await db
      .collection('support_tickets')
      .find({ userId: String(userId) })
      .sort({ createdAt: -1 })
      .toArray();

    const tickets = docs.map(d => ({
      _id: d._id.toString(),
      userId: d.userId ? String(d.userId) : '',
      userName: d.userName || '',
      subject: d.subject || '',
      description: d.description || '',
      status: d.status || 'open',
      createdAt: d.createdAt instanceof Date ? d.createdAt.toISOString() : d.createdAt,
      updatedAt: d.updatedAt instanceof Date ? d.updatedAt.toISOString() : d.updatedAt,
      date: d.date || (d.createdAt instanceof Date ? d.createdAt.toISOString().split('T')[0] : ''),
      messages: Array.isArray(d.messages)
        ? d.messages.map((m: any) => ({ sender: m.sender, text: m.text || m.message || '', date: m.date || (m.createdAt instanceof Date ? m.createdAt.toISOString().split('T')[0] : m.createdAt) }))
        : [],
    }));

    return res.status(200).json({ success: true, tickets });
  } catch (err) {
    console.error('support/my-tickets error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
