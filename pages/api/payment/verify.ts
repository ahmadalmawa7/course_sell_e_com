import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';
import crypto from 'crypto';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    courseId,
    userId
  } = req.body;

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return res.status(400).json({ 
      success: false, 
      message: 'Payment verification details are required' 
    });
  }

  if (!courseId || !userId) {
    return res.status(400).json({ 
      success: false, 
      message: 'courseId and userId are required' 
    });
  }

  // Check if Razorpay secret is configured
  if (!process.env.RAZORPAY_KEY_SECRET) {
    return res.status(500).json({ 
      success: false, 
      message: 'Payment gateway not configured' 
    });
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = DB_NAME ? client.db(DB_NAME) : client.db();

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      // Update payment status as failed
      await db.collection('payments').updateOne(
        { orderId: razorpay_order_id },
        {
          $set: {
            status: 'failed',
            paymentId: razorpay_payment_id,
            signature: razorpay_signature,
            updatedAt: new Date(),
            failureReason: 'Invalid signature'
          }
        }
      );

      return res.status(400).json({ 
        success: false, 
        message: 'Invalid payment signature' 
      });
    }

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
      // Update payment record but don't create duplicate enrollment
      await db.collection('payments').updateOne(
        { orderId: razorpay_order_id },
        {
          $set: {
            status: 'success',
            paymentId: razorpay_payment_id,
            signature: razorpay_signature,
            paymentDate: new Date(),
            updatedAt: new Date()
          }
        }
      );

      return res.status(200).json({
        success: true,
        message: 'Payment verified. Already enrolled in this course.',
        alreadyEnrolled: true,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id
      });
    }

    // Update payment record as successful
    await db.collection('payments').updateOne(
      { orderId: razorpay_order_id },
      {
        $set: {
          status: 'success',
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
          paymentDate: new Date(),
          updatedAt: new Date()
        }
      }
    );

    // Get total lectures from course
    const totalLectures = course.recordedLectures?.length || 0;

    // Create enrollment
    const enrollment = {
      userId: new ObjectId(userId),
      courseId: new ObjectId(courseId),
      status: 'In Progress',
      progress: 0,
      completedLectures: 0,
      totalLectures,
      completedLectureIds: [],
      enrolledAt: new Date(),
      lastAccessedAt: new Date(),
      certificate: null,
      paymentStatus: 'success',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      amountPaid: course.price
    };

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
      message: 'Payment verified and enrollment successful',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Payment verification error:', error);

    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Payment verification failed'
    });
  } finally {
    await client.close();
  }
}
