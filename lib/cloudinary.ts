import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error(
    'Please define CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables in .env'
  );
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export interface UploadResult {
  secure_url: string;
  public_id: string;
  url: string;
}

export async function uploadToCloudinary(
  filePath: string,
  folderName: string = 'uploads',
  options: Record<string, any> = {}
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        folder: folderName,
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        resource_type: 'auto',
        transformation: [{ quality: 'auto:good', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            url: result.url,
          });
        } else {
          reject(new Error('Upload failed: No result from Cloudinary'));
        }
      }
    );
  });
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

export function extractPublicIdFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const uploadIndex = pathParts.indexOf('upload');
    if (uploadIndex === -1) return null;
    
    const versionIndex = pathParts.findIndex((part, index) => 
      index > uploadIndex && part.startsWith('v') && /^v\d+$/.test(part)
    );
    
    const startIndex = versionIndex !== -1 ? versionIndex + 1 : uploadIndex + 1;
    const publicIdWithExt = pathParts.slice(startIndex).join('/');
    const lastDotIndex = publicIdWithExt.lastIndexOf('.');
    return lastDotIndex !== -1 ? publicIdWithExt.substring(0, lastDotIndex) : publicIdWithExt;
  } catch {
    return null;
  }
}

export default cloudinary;
