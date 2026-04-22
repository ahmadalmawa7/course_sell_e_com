import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('courses');

    if (req.method === 'GET') {
      const courses = await collection.find({}).toArray();
      const allLive: any[] = [];
      courses.forEach(course => {
        if (course.liveClasses && Array.isArray(course.liveClasses)) {
          course.liveClasses.forEach((lc: any) => {
            allLive.push({ ...lc, courseId: course._id.toString(), courseName: course.title });
          });
        }
      });
      res.status(200).json(allLive);
      return;
    }

    if (req.method === 'POST') {
      const { courseId, lecture } = req.body;
      if (!courseId || !lecture) return res.status(400).json({ error: 'courseId and lecture are required' });

      try {
        const objectId = new ObjectId(courseId);
        const course = await collection.findOne({ _id: objectId });
        if (!course) return res.status(404).json({ error: 'Course not found' });

        const result = await collection.updateOne(
          { _id: objectId },
          {
            $push: {
              liveClasses: {
                id: lecture.id,
                title: lecture.title,
                instructor: lecture.instructor,
                date: lecture.date,
                time: lecture.time,
                meetLink: lecture.meetLink,
                description: lecture.description || '',
                thumbnail: lecture.thumbnail || '',
              },
            },
            $set: { updatedAt: new Date() },
          }
        );

        if (result.modifiedCount > 0 || result.upsertedCount > 0) {
          const updatedCourse = await collection.findOne({ _id: objectId });
          return res.status(201).json({ message: 'Live class added', lecture, course: updatedCourse });
        }

        return res.status(400).json({ error: 'Failed to add live class' });
      } catch (err) {
        console.error('POST live error', err);
        return res.status(400).json({ error: 'Invalid courseId format' });
      }
    }

    if (req.method === 'PUT') {
      const { courseId, lectureId, lecture } = req.body;
      if (!courseId || !lectureId || !lecture) return res.status(400).json({ error: 'courseId, lectureId and lecture are required' });

      try {
        const objectId = new ObjectId(courseId);
        const result = await collection.updateOne(
          { _id: objectId, 'liveClasses.id': lectureId },
          {
            $set: {
              'liveClasses.$': {
                id: lecture.id,
                title: lecture.title,
                instructor: lecture.instructor,
                date: lecture.date,
                time: lecture.time,
                meetLink: lecture.meetLink,
                description: lecture.description || '',
                thumbnail: lecture.thumbnail || '',
              },
              updatedAt: new Date(),
            },
          }
        );

        if (result.modifiedCount > 0) {
          const updatedCourse = await collection.findOne({ _id: objectId });
          return res.status(200).json({ message: 'Live class updated', lecture, course: updatedCourse });
        }

        return res.status(404).json({ error: 'Course or live class not found' });
      } catch (err) {
        console.error('PUT live error', err);
        return res.status(400).json({ error: 'Invalid courseId format' });
      }
    }

    if (req.method === 'DELETE') {
      const { courseId, lectureId } = req.body;
      if (!courseId || !lectureId) return res.status(400).json({ error: 'courseId and lectureId are required' });

      try {
        const objectId = new ObjectId(courseId);
        const result = await collection.updateOne(
          { _id: objectId },
          { $pull: { liveClasses: { id: lectureId } }, $set: { updatedAt: new Date() } }
        );

        if (result.modifiedCount > 0) {
          const updatedCourse = await collection.findOne({ _id: objectId });
          return res.status(200).json({ message: 'Live class deleted', course: updatedCourse });
        }

        return res.status(404).json({ error: 'Course or live class not found' });
      } catch (err) {
        console.error('DELETE live error', err);
        return res.status(400).json({ error: 'Invalid courseId format' });
      }
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('Live Lectures API error:', error);
    res.status(500).json({ error: 'Internal server error', details: String(error) });
  }
}
