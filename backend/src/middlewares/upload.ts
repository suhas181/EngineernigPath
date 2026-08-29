import multer from 'multer';

// In-memory buffer storage so files can be processed directly by text extractors / Cloudinary streams
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
      'text/markdown',
      'text/x-markdown',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ];

    const lowerName = file.originalname.toLowerCase();
    const isTextFile =
      lowerName.endsWith('.txt') ||
      lowerName.endsWith('.md') ||
      lowerName.endsWith('.markdown') ||
      lowerName.endsWith('.doc') ||
      lowerName.endsWith('.docx');
    const isImageFile =
      lowerName.endsWith('.jpg') ||
      lowerName.endsWith('.jpeg') ||
      lowerName.endsWith('.png') ||
      lowerName.endsWith('.webp') ||
      lowerName.endsWith('.gif');
    const isPdfFile = lowerName.endsWith('.pdf');

    if (allowedMimeTypes.includes(file.mimetype) || isTextFile || isImageFile || isPdfFile) {
      cb(null, true);
    } else {
      cb(
        new Error(
          'Invalid file type. Supported formats: PDF, DOCX, DOC, TXT, Markdown, and JPEG/PNG/WebP images.'
        )
      );
    }
  },
});

export default upload;
