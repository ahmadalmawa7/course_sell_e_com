import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

const getAdminCredentials = (req: NextApiRequest) => {
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || process.env.ADMIN_EMAIL || '';
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '';
  const headerEmail = Array.isArray(req.headers['x-admin-email']) ? req.headers['x-admin-email'][0] : req.headers['x-admin-email'];
  const headerPassword = Array.isArray(req.headers['x-admin-password']) ? req.headers['x-admin-password'][0] : req.headers['x-admin-password'];
  return {
    adminEmail,
    adminPassword,
    headerEmail: headerEmail || '',
    headerPassword: headerPassword || '',
  };
};

const isAdminRequest = (req: NextApiRequest) => {
  const { adminEmail, adminPassword, headerEmail, headerPassword } = getAdminCredentials(req);
  if (!adminEmail) return false;
  if (headerEmail !== adminEmail) return false;
  if (adminPassword && headerPassword !== adminPassword) return false;
  return true;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { db } = await connectToDatabase();

    if (req.method === 'POST') {
      const { title, fileUrl, courseId, uploadedBy } = req.body;

      if (!title || !fileUrl || !courseId) {
        return res.status(400).json({ error: 'Missing required fields: title, fileUrl, courseId' });
      }

      // Validate that the course exists
      const course = await db.collection('courses').findOne({
        _id: ObjectId.isValid(courseId) ? new ObjectId(courseId) : courseId
      });

      if (!course) {
        return res.status(400).json({ error: 'Invalid courseId: Course does not exist' });
      }

      const assignmentsCollection = db.collection('assignments');
      const assignmentCourseId = typeof courseId === 'string' && ObjectId.isValid(courseId) ? new ObjectId(courseId) : courseId;
      const assignment = {
        title,
        fileUrl,
        courseId: assignmentCourseId,
        uploadedBy: uploadedBy || 'admin',
        createdAt: new Date(),
      };

      const result = await assignmentsCollection.insertOne(assignment);
      return res.status(201).json({
        id: result.insertedId.toString(),
        message: 'Assignment created successfully'
      });
    }

    if (req.method === 'GET') {
      const { courseId, userId } = req.query;

      if (courseId && typeof courseId === 'string') {
        // Fetch assignments for a specific course
        // Try both ObjectId and string to handle different ID formats
        const assignments = await db.collection('assignments').find({
          $or: [
            { courseId: courseId },
            ObjectId.isValid(courseId) ? { courseId: new ObjectId(courseId) } : null,
          ].filter(Boolean)
        }).sort({ createdAt: -1 }).toArray();

        const assignmentsWithIds = assignments.map(assignment => ({
          ...assignment,
          id: assignment._id.toString(),
          _id: undefined,
          courseId: assignment.courseId?.toString ? assignment.courseId.toString() : assignment.courseId,
        }));

        return res.status(200).json(assignmentsWithIds);
      }

      if (userId && typeof userId === 'string') {
        // Fetch all assignments for courses the user is enrolled in
        const enrolledCourseIds: string[] = [];
        const enrollmentsCollection = db.collection('enrollments');
        const usersCollection = db.collection('users');

        const userObjectId = ObjectId.isValid(userId) ? new ObjectId(userId) : null;

        if (userObjectId) {
          const enrollments = await enrollmentsCollection.find({ userId: userObjectId }).toArray();
          enrollments.forEach(enrollment => {
            if (enrollment.courseId) {
              enrolledCourseIds.push(enrollment.courseId.toString());
            }
          });

          if (enrolledCourseIds.length === 0) {
            const userDoc = await usersCollection.findOne({ _id: userObjectId });
            if (Array.isArray(userDoc?.enrolledCourses)) {
              userDoc.enrolledCourses.forEach((course: any) => {
                enrolledCourseIds.push(course?.toString?.());
              });
            }
          }
        }

        if (enrolledCourseIds.length === 0) {
          return res.status(200).json([]);
        }

        const enrolledCourseObjectIds = enrolledCourseIds
          .filter(id => ObjectId.isValid(id))
          .map(id => new ObjectId(id));

        const assignments = await db.collection('assignments').find({
          $or: [
            { courseId: { $in: enrolledCourseIds } },
            { courseId: { $in: enrolledCourseObjectIds } },
          ],
        }).sort({ createdAt: -1 }).toArray();

        const assignmentsWithIds = assignments.map(assignment => ({
          ...assignment,
          id: assignment._id.toString(),
          _id: undefined,
          courseId: assignment.courseId?.toString ? assignment.courseId.toString() : assignment.courseId,
        }));

        return res.status(200).json(assignmentsWithIds);
      }

      // If no courseId or userId provided, return all assignments (admin only)
      if (!isAdminRequest(req)) {
        return res.status(403).json({ error: 'Unauthorized: Admin access required' });
      }

      const assignments = await db.collection('assignments').find({}).sort({ createdAt: -1 }).toArray();
      const assignmentsWithIds = assignments.map(assignment => ({
        ...assignment,
        id: assignment._id.toString(),
        _id: undefined,
        courseId: assignment.courseId?.toString ? assignment.courseId.toString() : assignment.courseId,
      }));

      return res.status(200).json(assignmentsWithIds);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'Assignment id is required for deletion' });
      }

      await db.collection('assignments').deleteOne({ _id: new ObjectId(id) });
      return res.status(200).json({ message: 'Assignment deleted successfully' });
    }

    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('Assignments API error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
