import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';
import Razorpay from 'razorpay';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME;

// Lazy initialization - will be created when needed
let razorpayInstance: Razorpay | null = null;

function getRazorpayInstance(): Razorpay {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });
  }
  return razorpayInstance;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('=== create-order API called ===', req.method);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { courseId, userId } = req.body;
  console.log('Received:', { courseId, userId });

  if (!courseId || !userId) {
    return res.status(400).json({ success: false, message: 'courseId and userId are required' });
  }

  // Check if Razorpay keys are configured
  console.log('Razorpay Key ID exists:', !!process.env.RAZORPAY_KEY_ID);
  console.log('Razorpay Key Secret exists:', !!process.env.RAZORPAY_KEY_SECRET);
  
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error('Razorpay keys missing in environment');
    return res.status(500).json({ 
      success: false, 
      message: 'Payment gateway not configured. Please contact support.' 
    });
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

    // Check if there's already a pending payment for this course
    const existingPendingPayment = await db.collection('payments').findOne({
      userId: new ObjectId(userId),
      courseId: new ObjectId(courseId),
      status: 'pending'
    });

    if (existingPendingPayment) {
      // Return existing order
      return res.status(200).json({
        success: true,
        orderId: existingPendingPayment.orderId,
        amount: existingPendingPayment.amount,
        currency: existingPendingPayment.currency,
        courseName: course.title,
        userName: user.name,
        userEmail: user.email,
        key: process.env.RAZORPAY_KEY_ID
      });
    }

    // Get course price (in paise - multiply by 100)
    const amountInPaise = Math.round(course.price * 100);

    // Create unique receipt ID (max 40 chars for Razorpay)
    const receiptId = `r_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`.substring(0, 40);

    // Create Razorpay order
    const orderOptions = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptId,
      notes: {
        courseId: courseId,
        userId: userId,
        courseName: course.title,
        userName: user.name,
        userEmail: user.email
      }
    };

    const order = await getRazorpayInstance().orders.create(orderOptions);

    // Save payment record in database
    const paymentRecord = {
      userId: new ObjectId(userId),
      courseId: new ObjectId(courseId),
      amount: course.price,
      amountInPaise: amountInPaise,
      currency: 'INR',
      orderId: order.id,
      receiptId: receiptId,
      status: 'pending',
      paymentId: null,
      signature: null,
      paymentDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      courseName: course.title,
      userName: user.name,
      userEmail: user.email
    };

    await db.collection('payments').insertOne(paymentRecord);

    return res.status(200).json({
      success: true,
      orderId: order.id,
      amount: amountInPaise,
      currency: 'INR',
      courseName: course.title,
      userName: user.name,
      userEmail: user.email,
      key: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error('Create order error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to create order',
      details: error instanceof Error ? error.stack : undefined
    });
  } finally {
    await client.close();
  }
}
