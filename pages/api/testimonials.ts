import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('testimonials');

    if (req.method === 'GET') {
      // Return only approved testimonials sorted by newest
      const items = await collection.find({ status: 'approved' }).sort({ createdAt: -1 }).toArray();
      const mapped = items.map((i: any) => ({
        id: i._id?.toString(),
        name: i.name || 'Anonymous',
        role: i.role || 'Student',
        text: i.message || '',
        rating: i.rating || 5,
        approved: i.status === 'approved',
        date: i.createdAt ? new Date(i.createdAt).toISOString().split('T')[0] : '',
      }));
      res.status(200).json(mapped);
      return;
    }

    if (req.method === 'POST') {
      const { userId, name, rating, message } = req.body;
      if (!rating || !message) return res.status(400).json({ error: 'rating and message are required' });
      const doc = {
        userId: userId || null,
        name: name || 'Anonymous',
        rating: Number(rating),
        message,
        status: 'pending',
        createdAt: new Date(),
      };
      const result = await collection.insertOne(doc);
      const inserted = await collection.findOne({ _id: result.insertedId });
      res.status(201).json({ id: inserted._id.toString(), ...inserted });
      return;
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('Testimonials API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
