import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { userId, courseId } = req.query;

  // Validate required parameters
  if (!userId || !courseId) {
    return res.status(400).json({ 
      success: false, 
      message: 'userId and courseId are required' 
    });
  }

  // Validate ObjectId format
  if (!ObjectId.isValid(userId as string) || !ObjectId.isValid(courseId as string)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid userId or courseId format' 
    });
  }

  try {
    const { db } = await connectToDatabase();
    const enrollmentsCollection = db.collection('enrollments');
    const usersCollection = db.collection('users');

    // Check enrollment in enrollments collection
    const enrollment = await enrollmentsCollection.findOne({
      userId: new ObjectId(userId as string),
      courseId: new ObjectId(courseId as string),
    });

    if (enrollment) {
      return res.status(200).json({
        success: true,
        isEnrolled: true,
        enrollment: {
          id: enrollment._id.toString(),
          userId: enrollment.userId.toString(),
          courseId: enrollment.courseId.toString(),
          status: enrollment.status,
          progress: enrollment.progress || 0,
          enrolledAt: enrollment.enrolledAt,
          completedAt: enrollment.completedAt,
        },
      });
    }

    // Also check user's enrolledCourses array as fallback
    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId as string) },
      { projection: { enrolledCourses: 1 } }
    );

    const isEnrolledInUserDoc = user?.enrolledCourses?.some(
      (id: any) => id.toString() === courseId
    );

    if (isEnrolledInUserDoc) {
      return res.status(200).json({
        success: true,
        isEnrolled: true,
        enrollment: null, // No detailed enrollment record yet
      });
    }

    // Not enrolled
    return res.status(200).json({
      success: true,
      isEnrolled: false,
      enrollment: null,
    });

  } catch (error) {
    console.error('Check enrollment error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}
