import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ success: false, message: 'userId is required' });
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME || undefined);

    // Fetch enrollments with course details
    const enrollments = await db.collection('enrollments')
      .aggregate([
        {
          $match: { userId: new ObjectId(userId) }
        },
        {
          $lookup: {
            from: 'courses',
            localField: 'courseId',
            foreignField: '_id',
            as: 'course'
          }
        },
        {
          $unwind: '$course'
        },
        {
          $project: {
            _id: 1,
            userId: 1,
            courseId: 1,
            status: 1,
            progress: 1,
            completedLectures: 1,
            totalLectures: 1,
            completedLectureIds: 1,
            enrolledAt: 1,
            lastAccessedAt: 1,
            certificate: 1,
            course: {
              _id: 1,
              title: 1,
              category: 1,
              price: 1,
              rating: 1,
              duration: 1,
              modules: 1,
              thumbnail: 1,
              instructor: 1
            }
          }
        }
      ])
      .toArray();

    return res.status(200).json({ 
      success: true, 
      enrollments 
    });

  } catch (error) {
    console.error('Fetch enrollments error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    await client.close();
  }
}
