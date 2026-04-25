import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';
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
    const tickets = db.collection('support_tickets');

    if (req.method === 'GET') {
      const { userId, admin } = req.query;
      if (admin === 'true') {
        if (!isAdminRequest(req)) {
          return res.status(403).json({ error: 'Unauthorized: Admin access required' });
        }
        const allTickets = await tickets.find({}).sort({ createdAt: -1 }).toArray();
        return res.status(200).json(allTickets.map(ticket => ({
          ...ticket,
          id: ticket._id.toString(),
          _id: undefined,
        })));
      }

      if (!userId || Array.isArray(userId)) {
        return res.status(401).json({ error: 'Please login to access support tickets' });
      }

      const userTickets = await tickets.find({ userId }).sort({ createdAt: -1 }).toArray();
      return res.status(200).json(userTickets.map(ticket => ({
        ...ticket,
        id: ticket._id.toString(),
        _id: undefined,
      })));
    }

    if (req.method === 'POST') {
      const { userId, userName, subject, description, message, date } = req.body;
      if (!userId || !userName || !subject || !message) {
        return res.status(400).json({ error: 'Missing required fields: userId, userName, subject, message' });
      }
      const createdAt = new Date();
      const ticket = {
        userId,
        userName,
        subject,
        description: description || message,
        status: 'open',
        messages: [{ sender: 'user', text: message, date: date || createdAt.toISOString().split('T')[0] }],
        createdAt,
        date: createdAt.toISOString().split('T')[0],
      };
      const result = await tickets.insertOne(ticket);
      return res.status(201).json({
        ...ticket,
        id: result.insertedId.toString(),
      });
    }

    if (req.method === 'PUT') {
      const { id, data } = req.body;
      if (!id || !data || typeof data !== 'object') {
        return res.status(400).json({ error: 'Missing ticket id or data to update' });
      }
      if (!isAdminRequest(req)) {
        return res.status(403).json({ error: 'Unauthorized: Admin access required' });
      }
      const updatePayload: any = {};
      if (data.subject !== undefined) updatePayload.subject = data.subject;
      if (data.description !== undefined) updatePayload.description = data.description;
      if (data.status !== undefined) updatePayload.status = data.status;
      if (Object.keys(updatePayload).length === 0) {
        return res.status(400).json({ error: 'No valid fields provided to update' });
      }
      updatePayload.updatedAt = new Date();
      const result = await tickets.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updatePayload },
        { returnDocument: 'after' }
      );
      if (!result.value) {
        return res.status(404).json({ error: 'Support ticket not found' });
      }
      const updated = result.value;
      return res.status(200).json({
        ...updated,
        id: updated._id.toString(),
      });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'Ticket id is required for deletion' });
      }
      if (!isAdminRequest(req)) {
        return res.status(403).json({ error: 'Unauthorized: Admin access required' });
      }
      const result = await tickets.deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Support ticket not found' });
      }
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Support API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
