import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    if (req.method !== 'PUT') {
      res.setHeader('Allow', ['PUT']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
    const { db } = await connectToDatabase();
    const collection = db.collection('testimonials');
    await collection.updateOne({ _id: new ObjectId(String(id)) }, { $set: { status: 'approved' } });
    const updated = await collection.findOne({ _id: new ObjectId(String(id)) });
    res.status(200).json({ id: updated._id.toString(), status: updated.status });
  } catch (error) {
    console.error('Approve testimonial error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
