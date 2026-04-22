import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    // Ensure upload directory exists
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    const form = new IncomingForm({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      multiples: false,
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Form parsing error:', err);
        return res.status(500).json({ error: 'File upload failed' });
      }

      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Validate file type
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf',
        'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-matroska'
      ];
      if (!allowedTypes.includes(file.mimetype || '')) {
        await fs.unlink(file.filepath);
        return res.status(400).json({ error: 'Invalid file type. Only JPEG, PNG, GIF, WebP, PDF, and common video formats are allowed.' });
      }

      // Generate a unique filename based on type
      const type = (fields.type?.[0] as string) || 'course';
      const timestamp = Date.now();
      const ext = path.extname(file.originalFilename || 'image.jpg');
      const filename = `${type}-${timestamp}${ext}`;
      const newPath = path.join(uploadDir, filename);

      // Rename the file
      await fs.rename(file.filepath, newPath);

      // Return the public URL
      const url = `/uploads/${filename}`;
      res.status(200).json({ url });
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}