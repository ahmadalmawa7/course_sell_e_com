import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('articles');
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Article ID is required' });
    }

    if (req.method === 'GET') {
      let article;
      
      // Try to find by the id field first, then by _id
      if (ObjectId.isValid(id)) {
        article = await collection.findOne({ _id: new ObjectId(id) });
      }
      
      if (!article) {
        article = await collection.findOne({ id });
      }

      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      res.status(200).json({
        ...article,
        id: article._id?.toString() || article.id,
        _id: undefined
      });
      return;
    }

    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('Article detail API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
