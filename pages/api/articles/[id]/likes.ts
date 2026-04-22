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

    if (req.method === 'POST') {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // Check if user already liked the article
      const article = await collection.findOne({ _id: new ObjectId(id) });
      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      const hasLiked = article.likes?.includes(userId);

      if (hasLiked) {
        // Unlike the article
        await collection.updateOne(
          { _id: new ObjectId(id) },
          { $pull: { likes: userId }, $set: { updatedAt: new Date() } }
        );
        res.status(200).json({ message: 'Article unliked', liked: false });
      } else {
        // Like the article
        await collection.updateOne(
          { _id: new ObjectId(id) },
          { $addToSet: { likes: userId }, $set: { updatedAt: new Date() } }
        );
        res.status(200).json({ message: 'Article liked', liked: true });
      }
      return;
    }

    if (req.method === 'GET') {
      const article = await collection.findOne({ _id: new ObjectId(id) });
      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      res.status(200).json({
        likes: article.likes || [],
        likesCount: article.likes?.length || 0
      });
      return;
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('Article likes API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}