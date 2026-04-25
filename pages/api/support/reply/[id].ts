import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { sender, message } = req.body || {};
    const { db } = await connectToDatabase();

    let query: any = {};
    try {
      query._id = new ObjectId(String(id));
    } catch {
      query._id = String(id);
    }

    const newMsg = {
      sender,
      text: message,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date(),
    };
    const result = await db.collection('support_tickets').findOneAndUpdate(
      query as any,
      { $push: { messages: newMsg }, $set: { updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (!result.value) return res.status(404).json({ success: false, message: 'Not found' });

    const ticket = { ...result.value, _id: result.value._id.toString(), createdAt: result.value.createdAt instanceof Date ? result.value.createdAt.toISOString() : result.value.createdAt };
    return res.status(200).json({ success: true, ticket });
  } catch (err) {
    console.error('reply handler error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
