import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('testimonials');

    if (req.method === 'GET') {
      const items = await collection.find({}).sort({ createdAt: -1 }).toArray();
      const mapped = items.map((i: any) => ({
        id: i._id?.toString(),
        userId: i.userId || null,
        name: i.name || 'Anonymous',
        role: i.role || 'Student',
        message: i.message || '',
        rating: i.rating || 5,
        status: i.status || 'pending',
        createdAt: i.createdAt,
      }));
      res.status(200).json(mapped);
      return;
    }

    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('Admin testimonials error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
