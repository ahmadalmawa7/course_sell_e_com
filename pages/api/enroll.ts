import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { userId, courseId } = req.body;

  if (!userId || !courseId) {
    return res.status(400).json({ success: false, message: 'userId and courseId are required' });
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = DB_NAME ? client.db(DB_NAME) : client.db();

    // Check if user exists
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if course exists
    const course = await db.collection('courses').findOne({ _id: new ObjectId(courseId) });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check if already enrolled
    const existingEnrollment = await db.collection('enrollments').findOne({
      userId: new ObjectId(userId),
      courseId: new ObjectId(courseId)
    });

    if (existingEnrollment) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
    }

    // Check if course requires payment (price > 0)
    const coursePrice = course.price || 0;
    if (coursePrice > 0) {
      // Check if user has a successful payment for this course
      const successfulPayment = await db.collection('payments').findOne({
        userId: new ObjectId(userId),
        courseId: new ObjectId(courseId),
        status: 'success'
      });

      if (!successfulPayment) {
        return res.status(403).json({
          success: false,
          message: 'Payment required. Please complete the payment to enroll in this course.',
          requiresPayment: true,
          coursePrice: coursePrice
        });
      }
    }

    // Get total lectures from course
    const totalLectures = course.recordedLectures?.length || 0;

    // Check if there's a successful payment to get payment details
    const paymentRecord = await db.collection('payments').findOne({
      userId: new ObjectId(userId),
      courseId: new ObjectId(courseId),
      status: 'success'
    });

    // Create enrollment
    const enrollment: any = {
      userId: new ObjectId(userId),
      courseId: new ObjectId(courseId),
      status: 'In Progress',
      progress: 0,
      completedLectures: 0,
      totalLectures,
      completedLectureIds: [],
      enrolledAt: new Date(),
      lastAccessedAt: new Date(),
      certificate: null
    };

    // Add payment details if available
    if (paymentRecord) {
      enrollment.paymentStatus = 'success';
      enrollment.paymentId = paymentRecord.paymentId;
      enrollment.orderId = paymentRecord.orderId;
      enrollment.amountPaid = paymentRecord.amount;
    } else if (coursePrice === 0) {
      enrollment.paymentStatus = 'success';
      enrollment.amountPaid = 0;
    }

    await db.collection('enrollments').insertOne(enrollment);

    // Update user's enrolledCourses array
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      {
        $addToSet: { enrolledCourses: courseId },
        $set: { [`progress.${courseId}`]: 0 }
      }
    );

    // Increment enrolled students count in course
    await db.collection('courses').updateOne(
      { _id: new ObjectId(courseId) },
      { $inc: { enrolled: 1 } }
    );

    // Fetch updated user
    const updatedUser = await db.collection('users').findOne({ _id: new ObjectId(userId) });

    const userWithoutPassword = {
      ...updatedUser,
      id: updatedUser._id.toString(),
      _id: undefined
    };

    return res.status(200).json({ 
      success: true, 
      message: 'Enrolled successfully',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Enrollment error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    await client.close();
  }
}
