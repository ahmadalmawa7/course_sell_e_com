import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('enquiries');

    if (req.method === 'GET') {
      const enquiries = await collection.find({}).sort({ createdAt: -1 }).toArray();
      res.status(200).json(enquiries);
      return;
    }

    if (req.method === 'POST') {
      const enquiry = req.body;
      if (!enquiry || !enquiry.name || !enquiry.email || !enquiry.phone) {
        return res.status(400).json({ error: 'Invalid enquiry payload' });
      }
      await collection.insertOne({ ...enquiry, createdAt: new Date(), updatedAt: new Date() });
      const inserted = await collection.findOne({ name: enquiry.name, email: enquiry.email, phone: enquiry.phone }, { sort: { createdAt: -1 } });
      res.status(201).json(inserted);
      return;
    }

    if (req.method === 'PUT') {
      const { id, data } = req.body;
      if (!id || !data) {
        return res.status(400).json({ error: 'id and data are required' });
      }
      await collection.updateOne({ _id: new ObjectId(id) }, { $set: { ...data, updatedAt: new Date() } });
      const updated = await collection.findOne({ _id: new ObjectId(id) });
      res.status(200).json(updated);
      return;
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'id is required' });
      }
      await collection.deleteOne({ _id: new ObjectId(id) });
      res.status(200).json({ message: 'Enquiry deleted' });
      return;
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('Enquiry API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
