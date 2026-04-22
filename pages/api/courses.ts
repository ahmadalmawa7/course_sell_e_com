import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('courses');

    if (req.method === 'GET') {
      const courses = await collection.find({}).toArray();
      res.status(200).json(courses);
      return;
    }

    if (req.method === 'POST') {
      console.log('POST request received:', req.body);
      const course = req.body;
      if (!course || !course.title || !course.category) {
        console.log('Invalid course payload:', course);
        return res.status(400).json({ error: 'Invalid course payload' });
      }
      console.log('Inserting course:', course);
      await collection.insertOne({ ...course, createdAt: new Date(), updatedAt: new Date() });
      const inserted = await collection.findOne({ title: course.title, instructor: course.instructor });
      console.log('Inserted course:', inserted);
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
      res.status(200).json({ message: 'Course deleted' });
      return;
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('Course API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
