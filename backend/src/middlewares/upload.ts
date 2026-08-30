import path from 'path';
import multer from 'multer';

// In-memory buffer storage so files can be processed directly by text extractors / Cloudinary streams
const storage = multer.memoryStorage();

// Disallowed dangerous executable / script extensions
const DANGEROUS_EXTENSIONS = new Set([
  '.exe', '.sh', '.bat', '.cmd', '.js', '.mjs', '.cjs', '.ts', '.php',
  '.py', '.bin', '.dll', '.so', '.jar', '.apk', '.vbs', '.ps1', '.html',
  '.htm', '.svg', '.cgi', '.com', '.scr', '.msi', '.wsf', '.pif'
]);

// Allowed safe extensions
const ALLOWED_EXTENSIONS = new Set([
  '.pdf', '.docx', '.doc', '.txt', '.md', '.markdown',
  '.jpg', '.jpeg', '.png', '.webp', '.gif'
]);

// Allowed MIME types
const ALLOWED_MIME_TYPES = new Set([
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
]);

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const originalName = file.originalname || '';
    const ext = path.extname(originalName).toLowerCase();

    // 1. Explicitly reject dangerous executable extensions
    if (DANGEROUS_EXTENSIONS.has(ext)) {
      return cb(new Error('Executable and script files are strictly prohibited.'));
    }

    // 2. Require extension to be in allowed whitelist
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return cb(
        new Error(
          'Invalid file type. Supported formats: PDF, DOCX, DOC, TXT, Markdown, and JPEG/PNG/WebP images.'
        )
      );
    }

    // 3. Verify MIME type
    if (!ALLOWED_MIME_TYPES.has(file.mimetype) && !ext.match(/\.(txt|md|markdown|doc|docx|pdf|jpg|jpeg|png|webp)$/i)) {
      return cb(
        new Error(
          'Invalid MIME type for the uploaded file format.'
        )
      );
    }

    cb(null, true);
  },
});

export default upload;
