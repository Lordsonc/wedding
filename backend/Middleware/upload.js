import multer from 'multer';
import path from 'path';
import fs from 'fs';

const MAX_FILE_SIZE = 40 * 1024 * 1024; // 40 MB
const MAX_FILES = 10;

const TEMP_DIR = path.join(process.cwd(), 'temp');

// Create temp directory if it doesn't exist
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, TEMP_DIR);
  },

  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;

    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },

  fileFilter: (req, file, cb) => {
    const allowedImageTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ];

    const allowedVideoTypes = [
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'video/x-msvideo',
      'video/mpeg',
    ];

    const allowedTypes = [
      ...allowedImageTypes,
      ...allowedVideoTypes,
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error(
          'Only supported image and video files are allowed.'
        )
      );
    }

    cb(null, true);
  },
});

export const uploadFiles = upload.array('files', MAX_FILES);

export { MAX_FILE_SIZE, MAX_FILES };