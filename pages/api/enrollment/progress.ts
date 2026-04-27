import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { userId, courseId, lectureId, completed } = req.body;

  if (!userId || !courseId) {
    return res.status(400).json({ success: false, message: 'userId and courseId are required' });
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME || undefined);

    // Find enrollment
    const enrollment = await db.collection('enrollments').findOne({
      userId: new ObjectId(userId),
      courseId: new ObjectId(courseId)
    });

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    // Update completed lecture IDs if lectureId provided
    let updateData: any = {
      lastAccessedAt: new Date()
    };

    if (lectureId) {
      const completedLectureIds = enrollment.completedLectureIds || [];
      
      if (completed && !completedLectureIds.includes(lectureId)) {
        updateData.$addToSet = { completedLectureIds: lectureId };
        updateData.$inc = { completedLectures: 1 };
      } else if (!completed && completedLectureIds.includes(lectureId)) {
        updateData.$pull = { completedLectureIds: lectureId };
        updateData.$inc = { completedLectures: -1 };
      }

      // Calculate new progress
      const totalLectures = enrollment.totalLectures || 0;
      const newCompletedLectures = completed 
        ? (enrollment.completedLectures || 0) + (completed && !completedLectureIds.includes(lectureId) ? 1 : 0)
        : (enrollment.completedLectures || 0) - (!completed && completedLectureIds.includes(lectureId) ? 1 : 0);
      
      const newProgress = totalLectures > 0 ? Math.round((newCompletedLectures / totalLectures) * 100) : 0;
      updateData.progress = newProgress;

      // Check if completed
      if (newProgress === 100 && enrollment.status !== 'Completed') {
        updateData.status = 'Completed';
        updateData.certificate = `/certificates/${userId}-${courseId}.pdf`;
        updateData.completedAt = new Date();
      }
    } else {
      // Direct progress update
      updateData.progress = req.body.progress || 0;
      if (updateData.progress === 100 && enrollment.status !== 'Completed') {
        updateData.status = 'Completed';
        updateData.certificate = `/certificates/${userId}-${courseId}.pdf`;
        updateData.completedAt = new Date();
      }
    }

    // Update enrollment
    await db.collection('enrollments').updateOne(
      { userId: new ObjectId(userId), courseId: new ObjectId(courseId) },
      updateData
    );

    // Update user's progress
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { [`progress.${courseId}`]: updateData.progress || 0 } }
    );

    // If completed, add to completedCourses
    if (updateData.status === 'Completed') {
      await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { $addToSet: { completedCourses: courseId } }
      );
    }

    // Fetch updated enrollment
    const updatedEnrollment = await db.collection('enrollments').findOne({
      userId: new ObjectId(userId),
      courseId: new ObjectId(courseId)
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Progress updated successfully',
      enrollment: updatedEnrollment
    });

  } catch (error) {
    console.error('Update progress error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    await client.close();
  }
}
