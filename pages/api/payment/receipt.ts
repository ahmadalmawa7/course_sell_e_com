import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { userId, courseId, paymentId } = req.query;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'userId is required' });
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = DB_NAME ? client.db(DB_NAME) : client.db();

    let query: any = {
      userId: new ObjectId(userId as string),
      status: 'success'
    };

    if (courseId) {
      query.courseId = new ObjectId(courseId as string);
    }

    if (paymentId) {
      query.paymentId = paymentId as string;
    }

    // Get payment details
    const payments = await db.collection('payments')
      .find(query)
      .sort({ paymentDate: -1 })
      .toArray();

    if (!payments || payments.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    // Get user details
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId as string) },
      { projection: { name: 1, email: 1 } }
    );

    // Get course details for each payment
    const paymentReceipts = await Promise.all(
      payments.map(async (payment) => {
        const course = await db.collection('courses').findOne(
          { _id: payment.courseId },
          { projection: { title: 1, instructor: 1 } }
        );

        return {
          paymentId: payment.paymentId,
          orderId: payment.orderId,
          receiptId: payment.receiptId,
          userName: user?.name || payment.userName,
          userEmail: user?.email || payment.userEmail,
          courseName: course?.title || payment.courseName,
          instructor: course?.instructor || 'Instructor',
          amount: payment.amount,
          currency: payment.currency,
          paymentDate: payment.paymentDate,
          status: payment.status
        };
      })
    );

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
