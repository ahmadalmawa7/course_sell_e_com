import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

function normalizeId(id: any): string | null {
  if (id == null) return null;
  if (typeof id === 'string') return id;
  if (typeof id === 'object' && typeof id.toString === 'function') return id.toString();
  return String(id);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const users = await db.collection('users').find({}, { projection: { password: 0 } }).toArray();

    const courseIds = Array.from(
      new Set(
        users.flatMap((user: any) => {
          const enrolled = Array.isArray(user.enrolledCourses) ? user.enrolledCourses : [];
          const progressIds = user.progress && typeof user.progress === 'object' ? Object.keys(user.progress) : [];
          return [...enrolled, ...progressIds].map(normalizeId).filter(Boolean) as string[];
        })
      )
    );

    let courseDocs: any[] = [];
    if (courseIds.length > 0) {
      const validObjectIds = courseIds.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id));
      const stringIds = courseIds.filter((id) => !ObjectId.isValid(id));
      const query: any = { $or: [] };

      if (validObjectIds.length > 0) query.$or.push({ _id: { $in: validObjectIds } });
      if (stringIds.length > 0) query.$or.push({ id: { $in: stringIds } });

      if (query.$or.length > 0) {
        courseDocs = await db.collection('courses').find(query).toArray();
      }
    }

    const courseMap = courseDocs.reduce((acc: Record<string, any>, course) => {
      if (course._id) acc[course._id.toString()] = course;
      if (course.id) acc[course.id] = course;
      return acc;
    }, {} as Record<string, any>);

    const usersWithCourses = users.map((user: any) => {
      const enrolledCourseIds = Array.isArray(user.enrolledCourses)
        ? user.enrolledCourses.map(normalizeId).filter(Boolean) as string[]
        : [];
      const completedCourseIds = Array.isArray(user.completedCourses)
        ? user.completedCourses.map(normalizeId).filter(Boolean) as string[]
        : [];
      const progress = user.progress && typeof user.progress === 'object' ? user.progress : {};

      const courseDetails = enrolledCourseIds.map((courseId) => {
        const course = courseMap[courseId];
        const status = completedCourseIds.includes(courseId)
          ? 'Completed'
          : progress[courseId] >= 100
          ? 'Completed'
          : Object.prototype.hasOwnProperty.call(progress, courseId)
          ? 'In Progress'
          : 'Active';

        return {
          id: courseId,
          title: course?.title || course?.name || 'Unknown Course',
          status,
        };
      });

      return {
        id: user._id?.toString() || user.id || '',
        name: user.name || user.fullName || '',
        email: user.email || '',
        phone: user.phone || user.contact || user.mobile || '',
        enrolledCount: courseDetails.length,
        courses: courseDetails,
        createdAt: user.createdAt || undefined,
      };
    });

    return res.status(200).json({ success: true, users: usersWithCourses });
  } catch (error) {
    console.error('Users API error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
