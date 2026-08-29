import { v2 as cloudinary } from 'cloudinary';

/**
 * Checks if Cloudinary is configured with valid production credentials.
 */
export const isCloudinaryConfigured = (): boolean => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  return Boolean(
    cloudName &&
      cloudName.trim() !== '' &&
      cloudName !== 'your-cloud-name' &&
      cloudName !== 'mock-cloud' &&
      apiKey &&
      apiKey.trim() !== '' &&
      apiKey !== 'your-api-key' &&
      apiKey !== 'mock-key' &&
      apiSecret &&
      apiSecret.trim() !== '' &&
      apiSecret !== 'your-api-secret' &&
      apiSecret !== 'mock-secret'
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!.trim(),
    api_key: process.env.CLOUDINARY_API_KEY!.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET!.trim(),
    secure: true,
  });
}

export default cloudinary;
