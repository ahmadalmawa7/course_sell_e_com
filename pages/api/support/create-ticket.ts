import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { userId, subject, description } = req.body || {};
    const { db } = await connectToDatabase();

    // Basic validation
    if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });
    if (!subject || typeof subject !== 'string' || !subject.trim()) return res.status(400).json({ success: false, message: 'subject is required' });

    // Verify user exists
    let userObjId: any;
    try {
      userObjId = new ObjectId(String(userId));
    } catch (err) {
      return res.status(400).json({ success: false, message: 'invalid userId' });
    }

    const userDoc = await db.collection('users').findOne({ _id: userObjId });
    if (!userDoc) return res.status(400).json({ success: false, message: 'user not found' });

    const doc: any = {
      userId: userObjId,
      userName: userDoc.name || userDoc.fullName || userDoc.email || '',
      enrolledCourses: Array.isArray(userDoc.enrolledCourses) ? userDoc.enrolledCourses : [],
      subject: subject.trim(),
      description: (description && String(description).trim()) || '',
      status: 'open',
      createdAt: new Date(),
      messages: [],
    };

    const result = await db.collection('feedback').insertOne(doc);
    const ticket = { ...doc, _id: result.insertedId.toString(), createdAt: doc.createdAt.toISOString(), userId: userObjId.toString() };

    return res.status(200).json({ success: true, ticket });
  } catch (err) {
    console.error('create-ticket handler error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
