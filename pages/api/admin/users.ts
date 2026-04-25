import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');
    const enrollmentsCollection = db.collection('enrollments');
    const coursesCollection = db.collection('courses');

    // Fetch all users (excluding password field)
    const users = await usersCollection
      .find({}, { projection: { password: 0 } })
      .toArray();

    // Fetch all courses for name mapping
    const courses = await coursesCollection.find({}).toArray();
    const courseMap = new Map();
    courses.forEach(course => {
      courseMap.set(course._id.toString(), course.title || 'Unknown Course');
    });

    // Enrich user data with enrollment details
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        const userId = user._id.toString();

        // Fetch enrollments for this user
        const userEnrollments = await enrollmentsCollection
          .find({ userId: new ObjectId(userId) })
          .toArray();

        // Map enrollment data
        const enrolledCoursesData = userEnrollments.map(enrollment => {
          const courseId = enrollment.courseId?.toString();
          const courseName = courseMap.get(courseId) || 'Unknown Course';
          const status = enrollment.status || 'In Progress';
          const progress = enrollment.progress || 0;

          // Determine status based on progress and enrollment status
          let displayStatus = 'Pursuing';
          if (status === 'Completed' || progress === 100) {
            displayStatus = 'Completed';
          } else if (status === 'In Progress' || status === 'Active') {
            displayStatus = 'Pursuing';
          } else if (status === 'Pending') {
            displayStatus = 'Pending';
          }

          return {
            courseId,
            courseName,
            status: displayStatus,
            progress,
            enrolledAt: enrollment.enrolledAt,
            lastAccessedAt: enrollment.lastAccessedAt,
          };
        });

        // Calculate overall user status
        let overallStatus = 'Active';
        if (enrolledCoursesData.length === 0) {
          overallStatus = 'No Enrollments';
        } else if (enrolledCoursesData.every(e => e.status === 'Completed')) {
          overallStatus = 'Completed';
        } else if (enrolledCoursesData.some(e => e.status === 'Pending')) {
          overallStatus = 'Pending';
        }

        return {
          id: userId,
          name: user.name || 'Unknown',
          email: user.email || '',
          phone: user.phone || user.contact || 'N/A',
          createdAt: user.createdAt,
          enrolledCoursesCount: enrolledCoursesData.length,
          enrolledCourses: enrolledCoursesData,
          status: overallStatus,
        };
      })
    );

    return res.status(200).json({
      success: true,
      users: enrichedUsers,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
