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
    if (req.method !== 'PATCH') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { ticketId } = req.body;
    if (!ticketId) {
      return res.status(400).json({ error: 'Missing ticketId' });
    }
    if (!isAdminRequest(req)) {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }

    const { db } = await connectToDatabase();
    const tickets = db.collection('support_tickets');
    const result = await tickets.findOneAndUpdate(
      { _id: new ObjectId(ticketId) },
      { $set: { status: 'closed', updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return res.status(404).json({ error: 'Support ticket not found' });
    }

    return res.status(200).json({ ...result.value, id: result.value._id.toString() });
  } catch (error) {
    console.error('Close ticket API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
