import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

function normalizeId(id: any): string | null {
  if (id == null) return null;
  if (typeof id === 'string') return id;
  if (typeof id === 'object' && typeof id.toString === 'function') return id.toString();
  return String(id);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('testimonials');

    if (req.method === 'GET') {
      // Return only approved testimonials sorted by newest (limit to 5)
      const items = await collection.find({ status: 'approved' }).sort({ createdAt: -1 }).limit(5).toArray();

      // Get unique userIds from testimonials
      const userIds = Array.from(new Set(
        items.map((i: any) => normalizeId(i.userId)).filter(Boolean)
      ));

      // Fetch users data for profile images
      const users: any[] = [];
      if (userIds.length > 0) {
        const validObjectIds = userIds.filter((id): id is string => ObjectId.isValid(id as string)).map((id) => new ObjectId(id));
        const stringIds = userIds.filter((id) => !ObjectId.isValid(id as string));
        const query: any = { $or: [] };
        if (validObjectIds.length > 0) query.$or.push({ _id: { $in: validObjectIds } });
        if (stringIds.length > 0) query.$or.push({ id: { $in: stringIds } });
        if (query.$or.length > 0) {
          const userDocs = await db.collection('users').find(query, { projection: { password: 0 } }).toArray();
          users.push(...userDocs);
        }
      }

      // Create user map for quick lookup
      const userMap = users.reduce((acc: Record<string, any>, user) => {
        const id = user._id?.toString() || user.id;
        if (id) acc[id] = user;
        return acc;
      }, {});

      // Get course IDs from enrolled courses of users
      const courseIds = Array.from(new Set(
        users.flatMap((u: any) => {
          const enrolled = Array.isArray(u.enrolledCourses) ? u.enrolledCourses : [];
          return enrolled.map(normalizeId).filter(Boolean);
        })
      ));

      // Fetch courses data
      let courseMap: Record<string, any> = {};
      if (courseIds.length > 0) {
        const validCourseIds = courseIds.filter((id): id is string => ObjectId.isValid(id as string)).map((id) => new ObjectId(id));
        const stringCourseIds = courseIds.filter((id) => !ObjectId.isValid(id as string));
        const query: any = { $or: [] };
        if (validCourseIds.length > 0) query.$or.push({ _id: { $in: validCourseIds } });
        if (stringCourseIds.length > 0) query.$or.push({ id: { $in: stringCourseIds } });
        if (query.$or.length > 0) {
          const courseDocs = await db.collection('courses').find(query).toArray();
          courseMap = courseDocs.reduce((acc: Record<string, any>, course) => {
            if (course._id) acc[course._id.toString()] = course;
            if (course.id) acc[course.id] = course;
            return acc;
          }, {});
        }
      }

      const mapped = items.map((i: any) => {
        const userId = normalizeId(i.userId);
        const user = userId ? userMap[userId] : null;
        const firstCourseId = user?.enrolledCourses?.[0] ? normalizeId(user.enrolledCourses[0]) : null;
        const firstCourse = firstCourseId ? courseMap[firstCourseId] : null;

        return {
          id: i._id?.toString(),
          userId: userId,
          name: i.name || user?.name || 'Anonymous',
          role: i.role || 'Student',
          text: i.message || '',
          rating: i.rating || 5,
          approved: i.status === 'approved',
          date: i.createdAt ? new Date(i.createdAt).toISOString().split('T')[0] : '',
          profileImage: user?.profileImage || null,
          courseName: firstCourse?.title || firstCourse?.name || null,
        };
      });

      res.status(200).json(mapped);
      return;
    }

    if (req.method === 'POST') {
      const { userId, name, rating, message } = req.body;
      if (!rating || !message) return res.status(400).json({ error: 'rating and message are required' });
      const doc = {
        userId: userId || null,
        name: name || 'Anonymous',
        rating: Number(rating),
        message,
        status: 'pending',
        createdAt: new Date(),
      };
      const result = await collection.insertOne(doc);
      const inserted = await collection.findOne({ _id: result.insertedId });
      res.status(201).json({ id: inserted._id.toString(), ...inserted });
      return;
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('Testimonials API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
