import cloudinary from '../config/cloudinary';

export const uploadToCloudinary = (
  fileBuffer: Buffer,
  folder: string,
  fileName?: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Local dev mock fallback if Cloudinary credentials are not set
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_CLOUD_NAME === 'your-cloud-name' ||
      process.env.CLOUDINARY_CLOUD_NAME === 'mock-cloud'
    ) {
      console.log(`[CLOUDINARY MOCK] Uploading file to folder: ${folder}`);
      // Return a placeholder image or a simulated document URL
      if (folder === 'profiles') {
        resolve('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80');
      } else {
        resolve('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
      }
      return;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `engineerpath/${folder}`,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(error);
        }
        if (!result) {
          return reject(new Error('Cloudinary upload result is undefined'));
        }
        resolve(result.secure_url);
      }
    );

    uploadStream.end(fileBuffer);
  });
};
export default uploadToCloudinary;
