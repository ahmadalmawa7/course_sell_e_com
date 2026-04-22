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
      const article = await collection.findOne({ _id: new ObjectId(id) });
      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      const comments = article.comments || [];
      res.status(200).json(comments);
      return;
    }

    if (req.method === 'POST') {
      const { userId, userName, text } = req.body;

      if (!userId || !userName || !text) {
        return res.status(400).json({ error: 'User ID, name, and comment text are required' });
      }

      const newComment = {
        id: `cm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        userName,
        text,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date()
      };

      await collection.updateOne(
        { _id: new ObjectId(id) },
        {
          $push: { comments: newComment },
          $set: { updatedAt: new Date() }
        }
      );

      res.status(201).json(newComment);
      return;
    }

    if (req.method === 'PUT') {
      const { commentId, userId, text } = req.body;

      if (!commentId || !userId || !text) {
        return res.status(400).json({ error: 'Comment ID, user ID, and text are required' });
      }

      const article = await collection.findOne({ _id: new ObjectId(id) });
      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      const commentIndex = article.comments?.findIndex((c: any) => c.id === commentId);
      if (commentIndex === -1) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      // Check if user owns the comment
      if (article.comments[commentIndex].userId !== userId) {
        return res.status(403).json({ error: 'You can only edit your own comments' });
      }

      const updatePath = `comments.${commentIndex}.text`;
      await collection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            [updatePath]: text,
            updatedAt: new Date()
          }
        }
      );

      res.status(200).json({ message: 'Comment updated successfully' });
      return;
    }

    if (req.method === 'DELETE') {
      const { commentId, userId, isAdmin } = req.body;

      if (!commentId) {
        return res.status(400).json({ error: 'Comment ID is required' });
      }

      const article = await collection.findOne({ _id: new ObjectId(id) });
      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      const commentIndex = article.comments?.findIndex((c: any) => c.id === commentId);
      if (commentIndex === -1) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      // Check if user owns the comment or is admin
      if (!isAdmin && article.comments[commentIndex].userId !== userId) {
        return res.status(403).json({ error: 'You can only delete your own comments' });
      }

      await collection.updateOne(
        { _id: new ObjectId(id) },
        {
          $pull: { comments: { id: commentId } },
          $set: { updatedAt: new Date() }
        }
      );

      res.status(200).json({ message: 'Comment deleted successfully' });
      return;
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('Article comments API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}