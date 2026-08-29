import path from 'path';
import fs from 'fs';
import cloudinary from '../config/cloudinary';

export const uploadToCloudinary = (
  fileBuffer: Buffer,
  folder: string,
  fileName?: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const handleLocalStorage = () => {
      try {
        const uploadsDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const cleanName = (fileName || 'resume_file.pdf').replace(/[^a-zA-Z0-9.-]/g, '_');
        const uniqueName = `${Date.now()}_${cleanName}`;
        const filePath = path.join(uploadsDir, uniqueName);
        fs.writeFileSync(filePath, fileBuffer);

        const port = process.env.PORT || 5001;
        const host = process.env.BACKEND_URL || `http://localhost:${port}`;
        return resolve(`${host}/uploads/${uniqueName}`);
      } catch (err) {
        return reject(new Error('Local storage service failed: ' + (err as Error).message));
      }
    };

    // If Cloudinary credentials are not properly set, fall back to local disk storage
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_CLOUD_NAME === 'your-cloud-name' ||
      process.env.CLOUDINARY_CLOUD_NAME === 'mock-cloud' ||
      !process.env.CLOUDINARY_API_KEY ||
      process.env.CLOUDINARY_API_KEY === 'your-api-key'
    ) {
      handleLocalStorage();
      return;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `engineerpath/${folder}`,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          // Fall back safely to local storage if Cloudinary network upload fails
          handleLocalStorage();
          return;
        }
        if (!result || !result.secure_url) {
          handleLocalStorage();
          return;
        }
        resolve(result.secure_url);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

export default uploadToCloudinary;
