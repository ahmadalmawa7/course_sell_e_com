import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const { db } = await connectToDatabase();
    let query: any = {};
    try {
      query._id = new ObjectId(String(id));
    } catch {
      // fallback: try string matching
      query._id = String(id);
    }

    const ticket = await db.collection('feedback').findOne(query as any);
    if (!ticket) return res.status(404).json({ success: false, message: 'Not found' });

    const out = { ...ticket, _id: ticket._id.toString(), createdAt: ticket.createdAt instanceof Date ? ticket.createdAt.toISOString() : ticket.createdAt };
    return res.status(200).json({ success: true, ticket: out });
  } catch (err) {
    console.error('ticket handler error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
