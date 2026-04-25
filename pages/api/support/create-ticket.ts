import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { userId, userName, subject, description } = req.body || {};
    const { db } = await connectToDatabase();

    if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });
    if (!userName || typeof userName !== 'string' || !userName.trim()) return res.status(400).json({ success: false, message: 'userName is required' });
    if (!subject || typeof subject !== 'string' || !subject.trim()) return res.status(400).json({ success: false, message: 'subject is required' });
    if (!description || typeof description !== 'string' || !description.trim()) return res.status(400).json({ success: false, message: 'description is required' });

    const now = new Date();
    const doc: any = {
      userId: String(userId),
      userName: userName.trim(),
      subject: subject.trim(),
      description: description.trim(),
      status: 'open',
      messages: [],
      createdAt: now,
      updatedAt: now,
      date: now.toISOString().split('T')[0],
    };

    const result = await db.collection('support_tickets').insertOne(doc);
    const ticket = {
      id: result.insertedId.toString(),
      userId: doc.userId,
      userName: doc.userName,
      subject: doc.subject,
      description: doc.description,
      status: doc.status,
      messages: doc.messages,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
      date: doc.date,
    };

    return res.status(201).json({ success: true, ticket });
  } catch (err) {
    console.error('create-ticket handler error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
