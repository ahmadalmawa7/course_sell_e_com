import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ success: false, message: 'id required' });

  const { db } = await connectToDatabase();

  let query: any;
  try { query = { _id: new ObjectId(String(id)) }; } catch { query = { _id: String(id) }; }

  try {
    if (req.method === 'DELETE') {
      await db.collection('feedback').deleteOne(query as any);
      return res.status(200).json({ success: true });
    }

    if (req.method === 'PUT') {
      const { subject, description, status } = req.body || {};
      const update: any = {};
      if (subject !== undefined) update.subject = subject;
      if (description !== undefined) update.description = description;
      if (status !== undefined) update.status = status;
      if (Object.keys(update).length === 0) return res.status(400).json({ success: false, message: 'no fields' });
      const result = await db.collection('feedback').findOneAndUpdate(query as any, { $set: update }, { returnDocument: 'after' });
      if (!result.value) return res.status(404).json({ success: false, message: 'not found' });
      const t = result.value;
      const ticket = { _id: t._id.toString(), userId: t.userId ? t.userId.toString() : null, subject: t.subject, description: t.description, status: t.status, createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : t.createdAt, messages: t.messages || [] };
      return res.status(200).json({ success: true, ticket });
    }

    return res.status(405).end();
  } catch (err) {
    console.error('support admin [id] error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
