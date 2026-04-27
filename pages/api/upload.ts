import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { uploadToCloudinary } from '../../lib/cloudinary';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let tempFilePath: string | null = null;

  try {
    // Use OS temp directory for temporary file storage
    const tempDir = os.tmpdir();

    const form = new IncomingForm({
      uploadDir: tempDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      multiples: false,
    });

    const [fields, files] = await new Promise<[any, any]>((resolve, reject) => {
      form.parse(req, (err, f, fi) => {
        if (err) reject(err);
        else resolve([f, fi]);
      });
    });

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    tempFilePath = file.filepath;

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf',
      'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-matroska'
    ];
    if (!allowedTypes.includes(file.mimetype || '')) {
      await fs.unlink(file.filepath).catch(() => {});
      return res.status(400).json({ error: 'Invalid file type. Only JPEG, PNG, GIF, WebP, PDF, and common video formats are allowed.' });
    }

    // Determine folder based on type
    const type = (fields.type?.[0] as string) || 'course';
    let folderName = 'uploads';
    
    // Map upload types to Cloudinary folders
    switch (type) {
      case 'profile':
        folderName = 'profiles';
        break;
      case 'course':
        folderName = 'courses';
        break;
      case 'notes':
        folderName = 'notes';
        break;
      case 'articles':
        folderName = 'articles';
        break;
      case 'testimonials':
        folderName = 'testimonials';
        break;
      default:
        folderName = 'uploads';
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(file.filepath, folderName);

    // Clean up temp file
    await fs.unlink(file.filepath).catch(() => {});
    tempFilePath = null;

    // Return the Cloudinary secure URL
    res.status(200).json({ url: result.secure_url });
  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up temp file if it exists
    if (tempFilePath) {
      await fs.unlink(tempFilePath).catch(() => {});
    }
    
    res.status(500).json({ error: 'File upload failed' });
  }
}