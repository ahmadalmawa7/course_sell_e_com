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
      query.userId = new ObjectId(String(id));
    } catch {
      query.userId = String(id);
    }

    const tickets = await db
      .collection('support_tickets')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    const out = tickets.map(t => ({
      ...t,
      _id: t._id.toString(),
      userName: t.userName || '',
      enrolledCourses: Array.isArray(t.enrolledCourses) ? t.enrolledCourses.map((c: any) => String(c)) : [],
      createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : t.createdAt,
    }));

    return res.status(200).json({ success: true, tickets: out });
  } catch (err) {
    console.error('user-tickets handler error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
