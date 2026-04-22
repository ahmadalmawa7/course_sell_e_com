import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Enable CORS preflight for cross-origin requests if needed.
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    const { db } = await connectToDatabase();
    const collection = db.collection('articles');

    if (req.method === 'GET') {
      // Query params: ?status=approved (filter by status)
      const { status } = req.query;
      const filter: any = {};
      
      if (status && status !== 'all') {
        filter.status = status;
      }

      const articles = await collection.find(filter).sort({ createdAt: -1 }).toArray();
      const articlesWithIds = articles.map(article => ({
        ...article,
        id: article._id.toString(),
        _id: undefined
      }));
      res.status(200).json(articlesWithIds);
      return;
    }

    if (req.method === 'POST') {
      const article = req.body;
      if (!article || !article.title || !article.content || !article.author) {
        return res.status(400).json({ error: 'Invalid article payload' });
      }

      const newArticle = {
        ...article,
        status: article.status || 'pending',
        likes: [],
        comments: [],
        submittedBy: article.submittedBy || 'unknown',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await collection.insertOne(newArticle);
      const inserted = await collection.findOne({ _id: result.insertedId });

      res.status(201).json({
        ...inserted,
        id: inserted._id.toString(),
        _id: undefined
      });
      return;
    }

    if (req.method === 'PUT') {
      const { id, ...updateData } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'id is required' });
      }

      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...updateData, updatedAt: new Date() } }
      );

      const updated = await collection.findOne({ _id: new ObjectId(id) });
      res.status(200).json({
        ...updated,
        id: updated._id.toString(),
        _id: undefined
      });
      return;
    }

    if (req.method === 'PATCH') {
      const { id, status } = req.body;
      if (!id || !status) {
        return res.status(400).json({ error: 'id and status are required' });
      }

      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status, updatedAt: new Date() } }
      );

      const updated = await collection.findOne({ _id: new ObjectId(id) });
      res.status(200).json({
        ...updated,
        id: updated._id.toString(),
        _id: undefined
      });
      return;
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'id is required' });
      }
      await collection.deleteOne({ _id: new ObjectId(id) });
      res.status(200).json({ message: 'Article deleted' });
      return;
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('Articles API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}