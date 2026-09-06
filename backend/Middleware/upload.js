import multer from 'multer';
import path from 'path';
import fs from 'fs';

// ==========================================
// CONFIGURATION
// ==========================================

const MAX_FILE_SIZE = 40 * 1024 * 1024; // 40 MB
const MAX_IMAGES = 10;
const MAX_VIDEOS = 5;

// ==========================================
// TEMPORARY UPLOAD DIRECTORY
// ==========================================

const uploadDir = path.resolve('temp');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ==========================================
// DISK STORAGE
// ==========================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    const filename = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${extension}`;

    cb(null, filename);
  },
});

// ==========================================
// ALLOWED FILE TYPES
// ==========================================

const allowedImages = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

const allowedVideos = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
];

// ==========================================
// FILE FILTER
// ==========================================

const fileFilter = (req, file, cb) => {
  if (
    allowedImages.includes(file.mimetype) ||
    allowedVideos.includes(file.mimetype)
  ) {
    return cb(null, true);
  }

  return cb(
    new Error(
      'Invalid file type. Only JPG, PNG, WebP, GIF, MP4, WebM, MOV and AVI files are allowed.'
    )
  );
};

// ==========================================
// MULTER
// ==========================================

const upload = multer({
  storage,

  limits: {
    fileSize: MAX_FILE_SIZE,

    // Total files across images + videos
    files: MAX_IMAGES + MAX_VIDEOS,
  },

  fileFilter,
});

// ==========================================
// ACCEPT BOTH IMAGES AND VIDEOS
// ==========================================

export const uploadFiles = upload.fields([
  {
    name: 'images',
    maxCount: MAX_IMAGES,
  },
  {
    name: 'videos',
    maxCount: MAX_VIDEOS,
  },
]);