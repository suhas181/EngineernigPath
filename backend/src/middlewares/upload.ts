import multer from 'multer';

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
      'text/plain',
      'text/markdown',
      'text/x-markdown',
    ];

    const lowerName = file.originalname.toLowerCase();
    const isTextFile = lowerName.endsWith('.txt') || lowerName.endsWith('.md') || lowerName.endsWith('.markdown');

    if (allowedMimeTypes.includes(file.mimetype) || isTextFile) {
      cb(null, true);
    } else {
      cb(
        new Error(
          'Invalid file type. Only PDF, DOCX, TXT, and Markdown documents are allowed.'
        )
      );
    }
  },
});
