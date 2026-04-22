import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('courses');

    if (req.method === 'GET') {
      // Get all recorded lectures from all courses
      const courses = await collection.find({}).toArray();
      const allLectures: any[] = [];
      
      courses.forEach(course => {
        if (course.recordedLectures && Array.isArray(course.recordedLectures)) {
          course.recordedLectures.forEach((lecture: any) => {
            allLectures.push({
              ...lecture,
              courseId: course._id.toString(),
              courseName: course.title,
            });
          });
        }
      });
      
      res.status(200).json(allLectures);
      return;
    }

    if (req.method === 'POST') {
      const { courseId, lecture } = req.body;
      
      console.log('POST request:', { courseId, lecture });
      
      if (!courseId || !lecture) {
        return res.status(400).json({ error: 'courseId and lecture are required' });
      }

      try {
        const objectId = new ObjectId(courseId);
        
        // Ensure recordedLectures array exists, initialize if needed
        const course = await collection.findOne({ _id: objectId });
        if (!course) {
          return res.status(404).json({ error: 'Course not found' });
        }

        // Add new lecture to the course's recordedLectures array
        const result = await collection.updateOne(
          { _id: objectId },
          { 
            $push: { 
              recordedLectures: {
                id: lecture.id,
                moduleName: lecture.moduleName,
                lectureTitle: lecture.lectureTitle,
                duration: lecture.duration,
                videoUrl: lecture.videoUrl,
                preview: lecture.preview,
                thumbnail: lecture.thumbnail || '',
                description: lecture.description || ''
              }
            },
            $set: { updatedAt: new Date() }
          }
        );

        console.log('POST result:', result);

        if (result.modifiedCount > 0 || result.upsertedCount > 0) {
          const updatedCourse = await collection.findOne({ _id: objectId });
          res.status(201).json({ message: 'Lecture added successfully', lecture, course: updatedCourse });
        } else {
          res.status(400).json({ error: 'Failed to add lecture' });
        }
      } catch (err) {
        console.error('POST error:', err);
        return res.status(400).json({ error: 'Invalid courseId format' });
      }
      return;
    }

    if (req.method === 'PUT') {
      const { courseId, lectureId, lecture } = req.body;
      
      console.log('PUT request:', { courseId, lectureId, lecture });

      if (!courseId || !lectureId || !lecture) {
        return res.status(400).json({ error: 'courseId, lectureId, and lecture are required' });
      }

      try {
        const objectId = new ObjectId(courseId);
        
        // Update lecture in the course's recordedLectures array
        const result = await collection.updateOne(
          { 
            _id: objectId,
            'recordedLectures.id': lectureId
          },
          { 
            $set: { 
              'recordedLectures.$': {
                id: lecture.id,
                moduleName: lecture.moduleName,
                lectureTitle: lecture.lectureTitle,
                duration: lecture.duration,
                videoUrl: lecture.videoUrl,
                preview: lecture.preview,
                thumbnail: lecture.thumbnail || '',
                description: lecture.description || ''
              },
              updatedAt: new Date()
            }
          }
        );

        console.log('PUT result:', result);

        if (result.modifiedCount > 0) {
          const updatedCourse = await collection.findOne({ _id: objectId });
          res.status(200).json({ message: 'Lecture updated successfully', lecture, course: updatedCourse });
        } else {
          res.status(404).json({ error: 'Course or lecture not found' });
        }
      } catch (err) {
        console.error('PUT error:', err);
        return res.status(400).json({ error: 'Invalid courseId format' });
      }
      return;
    }

    if (req.method === 'DELETE') {
      const { courseId, lectureId } = req.body;
      
      console.log('DELETE request:', { courseId, lectureId });

      if (!courseId || !lectureId) {
        return res.status(400).json({ error: 'courseId and lectureId are required' });
      }

      try {
        const objectId = new ObjectId(courseId);

        // Remove lecture from the course's recordedLectures array
        const result = await collection.updateOne(
          { _id: objectId },
          { 
            $pull: { recordedLectures: { id: lectureId } },
            $set: { updatedAt: new Date() }
          }
        );

        console.log('DELETE result:', result);

        if (result.modifiedCount > 0) {
          const updatedCourse = await collection.findOne({ _id: objectId });
          res.status(200).json({ message: 'Lecture deleted successfully', course: updatedCourse });
        } else {
          res.status(404).json({ error: 'Course or lecture not found' });
        }
      } catch (err) {
        console.error('DELETE error:', err);
        return res.status(400).json({ error: 'Invalid courseId format' });
      }
      return;
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('Recorded Lectures API error:', error);
    res.status(500).json({ error: 'Internal server error', details: String(error) });
  }
}
