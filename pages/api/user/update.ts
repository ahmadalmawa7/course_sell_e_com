import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { userId, ...updateData } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'userId is required' });
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME || 'erudition');

    // Update user
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Fetch updated user
    const updatedUser = await db.collection('users').findOne({ _id: new ObjectId(userId) });

    const userWithoutPassword = {
      ...updatedUser,
      id: updatedUser._id.toString(),
      _id: undefined
    };

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    await client.close();
  }
}