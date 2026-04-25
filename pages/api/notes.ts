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
      const { title, description, courseId, externalLink, uploadedBy, category, fileUrl } = req.body;

      if (!title || !courseId || !uploadedBy) {
        return res.status(400).json({ error: 'Missing required fields: title, courseId, uploadedBy' });
      }
      if (!fileUrl && !externalLink) {
        return res.status(400).json({ error: 'Please provide a file or an external link.' });
      }

      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || process.env.ADMIN_EMAIL || '';
      if (!isAdminRequest(req) || uploadedBy !== adminEmail) {
        return res.status(403).json({ error: 'Unauthorized: Only admin can upload notes' });
      }

      const notesCollection = db.collection('notes');
      const noteCourseId = typeof courseId === 'string' && ObjectId.isValid(courseId) ? new ObjectId(courseId) : courseId;
      const note = {
        title,
        description: description || '',
        courseId: noteCourseId,
        category: category || '',
        externalLink: externalLink || '',
        fileUrl: fileUrl || '',
        uploadedBy,
        createdAt: new Date(),
        uploadDate: new Date().toISOString(),
      };

      const result = await notesCollection.insertOne(note);
      return res.status(201).json({
        id: result.insertedId.toString(),
        message: 'Note uploaded successfully'
      });
    }

    if (req.method === 'PUT') {
      const { id, title, description, courseId, category, externalLink, fileUrl } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Note id is required for update' });
      }

      if (!isAdminRequest(req)) {
        return res.status(403).json({ error: 'Unauthorized: Only admin can update notes' });
      }

      const updatePayload: any = {};
      if (title !== undefined) updatePayload.title = title;
      if (description !== undefined) updatePayload.description = description;
      if (category !== undefined) updatePayload.category = category;
      if (externalLink !== undefined) {
        updatePayload.externalLink = externalLink;
      }
      if (fileUrl !== undefined) {
        updatePayload.fileUrl = fileUrl;
      }
      if (courseId !== undefined) {
        updatePayload.courseId = typeof courseId === 'string' && ObjectId.isValid(courseId) ? new ObjectId(courseId) : courseId;
      }
      if (Object.keys(updatePayload).length === 0) {
        return res.status(400).json({ error: 'No fields provided to update' });
      }
      updatePayload.updatedAt = new Date();

      const result = await db.collection('notes').findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updatePayload },
        { returnDocument: 'after' }
      );

      if (!result.value) {
        return res.status(404).json({ error: 'Note not found' });
      }

      const updatedNote = result.value;
      return res.status(200).json({
        id: updatedNote._id.toString(),
        title: updatedNote.title,
        description: updatedNote.description,
        courseId: updatedNote.courseId?.toString ? updatedNote.courseId.toString() : updatedNote.courseId,
        category: updatedNote.category,
        externalLink: updatedNote.externalLink || updatedNote.link || '',
        fileUrl: updatedNote.fileUrl || '',
        uploadedBy: updatedNote.uploadedBy,
        createdAt: updatedNote.createdAt,
        uploadDate: updatedNote.uploadDate || new Date(updatedNote.createdAt).toISOString(),
      });
    }

    if (req.method === 'GET') {
      const { courseId, userId, admin } = req.query;

      const normalizeNote = (note: any, accessible = false) => ({
        id: note._id.toString(),
        title: note.title,
        description: note.description || '',
        courseId: note.courseId?.toString ? note.courseId.toString() : note.courseId,
        category: note.category || '',
        uploadDate: note.uploadDate || new Date(note.createdAt).toISOString(),
        uploadedBy: note.uploadedBy,
        createdAt: note.createdAt,
        accessible,
        fileUrl: accessible ? note.fileUrl || '' : '',
        externalLink: accessible ? note.externalLink || note.link || '' : '',
        link: accessible ? note.link || '' : '',
      });

      if (admin === 'true') {
        if (!isAdminRequest(req)) {
          return res.status(403).json({ error: 'Unauthorized: Admin access required' });
        }

        const notes = await db.collection('notes').find({}).sort({ createdAt: -1 }).toArray();
        const notesWithIds = notes.map(note => normalizeNote(note, true));
        return res.status(200).json(notesWithIds);
      }

      const enrolledCourseIds: string[] = [];
      const enrollmentsCollection = db.collection('enrollments');
      const usersCollection = db.collection('users');

      const userObjectId = userId && typeof userId === 'string' && ObjectId.isValid(userId) ? new ObjectId(userId) : null;
      if (userObjectId) {
        const enrollments = await enrollmentsCollection.find({ userId: userObjectId }).toArray();
        enrollments.forEach(enrollment => {
          if (enrollment.courseId) {
            enrolledCourseIds.push(enrollment.courseId.toString());
          }
        });

        const userDoc = await usersCollection.findOne({ _id: userObjectId });
        if (Array.isArray(userDoc?.enrolledCourses)) {
          userDoc.enrolledCourses.forEach((course: any) => {
            if (course) enrolledCourseIds.push(course.toString?.() || course);
          });
        }
      }

      const filter: any = {};
      if (courseId && typeof courseId === 'string') {
        filter.courseId = ObjectId.isValid(courseId) ? new ObjectId(courseId) : courseId;
      }

      const notes = await db.collection('notes').find(filter).sort({ createdAt: -1 }).toArray();
      const notesWithIds = notes.map(note => {
        const noteCourseId = note.courseId?.toString ? note.courseId.toString() : note.courseId;
        const accessible = userId && typeof userId === 'string' ? enrolledCourseIds.includes(noteCourseId) : false;
        return normalizeNote(note, accessible);
      });

      return res.status(200).json(notesWithIds);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'Note id is required for deletion' });
      }

      if (!isAdminRequest(req)) {
        return res.status(403).json({ error: 'Unauthorized: Only admin can delete notes' });
      }

      await db.collection('notes').deleteOne({ _id: new ObjectId(id) });
      return res.status(200).json({ message: 'Note deleted successfully' });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('Notes API error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}