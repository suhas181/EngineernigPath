import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary';

/**
 * Uploads a file buffer to Cloudinary in production, or stores locally on disk in development.
 *
 * @param fileBuffer - Buffer containing file data from multer memory storage
 * @param folder - Destination folder name ('profiles' | 'resumes' | 'documents')
 * @param fileName - Original file name for sanitized naming and extension retention
 * @returns Resolves to the permanent secure URL (Cloudinary URL in production, or served localhost URL in dev)
 */
export const uploadToCloudinary = (
  fileBuffer: Buffer,
  folder: string,
  fileName?: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // ── Local Disk Storage Handler (Development / Local Testing) ───────────
    const handleLocalStorage = () => {
      try {
        const isProduction = process.env.NODE_ENV === 'production';

        // In production, warn if relying on ephemeral filesystem
        if (isProduction && isCloudinaryConfigured()) {
          console.warn('[Upload] Cloudinary upload encountered an issue. Falling back to local storage.');
        }

        const uploadsDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const baseName = path.basename(fileName || 'upload_file.pdf');
        const cleanName = baseName.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.{2,}/g, '.');
        const randomSalt = crypto.randomBytes(6).toString('hex');
        const uniqueName = `${Date.now()}_${randomSalt}_${cleanName}`;
        const filePath = path.resolve(uploadsDir, uniqueName);

        // Path traversal guard
        if (!filePath.startsWith(path.resolve(uploadsDir))) {
          return reject(new Error('Invalid filename path traversal detected.'));
        }

        fs.writeFileSync(filePath, fileBuffer);

        const port = process.env.PORT || 5001;
        const host = process.env.BACKEND_URL || `http://localhost:${port}`;
        return resolve(`${host}/uploads/${uniqueName}`);
      } catch (err) {
        return reject(new Error(`Local storage service failed: ${(err as Error).message}`));
      }
    };

    // ── Cloudinary Cloud Storage (Production Path) ─────────────────────────
    if (!isCloudinaryConfigured()) {
      if (process.env.NODE_ENV === 'production') {
        return reject(
          new Error(
            'Cloud storage (Cloudinary) is not configured in production. Ephemeral local storage fallback is disabled to prevent permanent data loss.'
          )
        );
      }
      handleLocalStorage();
      return;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `engineerpath/${folder}`,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error || !result || !result.secure_url) {
          console.error('[Upload] Cloudinary upload stream error:', error?.message || 'Empty result');
          // In development, fall back safely to local storage
          if (process.env.NODE_ENV !== 'production') {
            handleLocalStorage();
          } else {
            reject(new Error(`Cloud storage upload failed: ${error?.message || 'Unknown Cloudinary error'}`));
          }
          return;
        }

        resolve(result.secure_url);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

export default uploadToCloudinary;
