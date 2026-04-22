import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const { db } = await connectToDatabase();
    const collection = db.collection('testimonials');

    if (req.method === 'DELETE') {
      await collection.deleteOne({ _id: new ObjectId(String(id)) });
      res.status(200).json({ message: 'Deleted' });
      return;
    }

    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('Delete testimonial error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
