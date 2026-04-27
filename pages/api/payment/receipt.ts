import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { userId, courseId, paymentId, all } = req.query;
  const isAllQuery = all === 'true';

  if (!userId && !isAllQuery) {
    return res.status(400).json({ success: false, message: 'userId is required unless all=true is provided' });
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = DB_NAME ? client.db(DB_NAME) : client.db();

    const query: any = {};
    if (userId) {
      query.userId = new ObjectId(userId as string);
    }
    if (courseId) {
      query.courseId = new ObjectId(courseId as string);
    }
    if (paymentId) {
      query.paymentId = paymentId as string;
    }
    if (!isAllQuery) {
      query.status = 'success';
    }

    const payments = await db.collection('payments')
      .find(query)
      .sort({ paymentDate: -1, createdAt: -1 })
      .toArray();

    if (!payments || payments.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    const uniqueUserIds = Array.from(new Set(payments.map((payment) => payment.userId?.toString()).filter(Boolean)));
    const uniqueCourseIds = Array.from(new Set(payments.map((payment) => payment.courseId?.toString()).filter(Boolean)));

    const users = uniqueUserIds.length > 0
      ? await db.collection('users').find({ _id: { $in: uniqueUserIds.map((id) => new ObjectId(id)) } }, { projection: { name: 1, email: 1 } }).toArray()
      : [];

    const courses = uniqueCourseIds.length > 0
      ? await db.collection('courses').find({ _id: { $in: uniqueCourseIds.map((id) => new ObjectId(id)) } }, { projection: { title: 1, instructor: 1 } }).toArray()
      : [];

    const enrollments = await db.collection('enrollments').find({
      userId: { $in: uniqueUserIds.map((id) => new ObjectId(id)) },
      courseId: { $in: uniqueCourseIds.map((id) => new ObjectId(id)) }
    }).toArray();

    const userMap = users.reduce((acc: Record<string, any>, user) => {
      if (user._id) acc[user._id.toString()] = user;
      return acc;
    }, {} as Record<string, any>);

    const courseMap = courses.reduce((acc: Record<string, any>, course) => {
      if (course._id) acc[course._id.toString()] = course;
      return acc;
    }, {} as Record<string, any>);

    const enrollmentMap = enrollments.reduce((acc: Record<string, string>, enrollment: any) => {
      if (enrollment.userId && enrollment.courseId) {
        acc[`${enrollment.userId.toString()}_${enrollment.courseId.toString()}`] = enrollment.enrolledAt ? enrollment.enrolledAt.toISOString() : '';
      }
      return acc;
    }, {} as Record<string, string>);

    const paymentReceipts = payments.map((payment) => {
      const user = userMap[payment.userId?.toString()];
      const course = courseMap[payment.courseId?.toString()];
      const paymentDate = payment.paymentDate ? payment.paymentDate.toISOString() : payment.createdAt ? payment.createdAt.toISOString() : null;
      const createdAt = payment.createdAt ? payment.createdAt.toISOString() : null;
      const enrolledAt = enrollmentMap[`${payment.userId?.toString()}_${payment.courseId?.toString()}`] || null;

      return {
        paymentId: payment.paymentId,
        orderId: payment.orderId,
        receiptId: payment.receiptId,
        userId: payment.userId?.toString(),
        courseId: payment.courseId?.toString(),
        userName: user?.name || payment.userName,
        userEmail: user?.email || payment.userEmail,
        courseName: course?.title || payment.courseName,
        instructor: course?.instructor || 'Instructor',
        amount: payment.amount,
        currency: payment.currency,
        paymentDate,
        enrolledAt,
        createdAt,
        status: payment.status,
      };
    });

    return res.status(200).json({
      success: true,
      receipts: paymentReceipts
    });

  } catch (error) {
    console.error('Get receipt error:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get receipt'
    });
  } finally {
    await client.close();
  }
}
