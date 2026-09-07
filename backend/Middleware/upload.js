import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';

const MAX_FILE_SIZE = 40 * 1024 * 1024; // 40 MB
const MAX_FILES = 5;

// ======================================================
// TEMPORARY UPLOAD DIRECTORY
// ======================================================

const uploadDirectory = path.join(
  process.cwd(),
  'temp'
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

// ======================================================
// STORAGE
// ======================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(
      file.originalname
    );

    cb(
      null,
      `${randomUUID()}${extension}`
    );
  },
});

// ======================================================
// ALLOWED FILE TYPES
// ======================================================

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
];

// ======================================================
// FILE FILTER
// ======================================================

const fileFilter = (req, file, cb) => {
  const isImage =
    allowedImageTypes.includes(
      file.mimetype
    );

  const isVideo =
    allowedVideoTypes.includes(
      file.mimetype
    );

  if (isImage || isVideo) {
    return cb(null, true);
  }

  return cb(
    new Error(
      'Only JPG, PNG, WebP, GIF, MP4, WebM, MOV and AVI files are allowed.'
    )
  );
};

// ======================================================
// MULTER
// ======================================================

const upload = multer({
  storage,

  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },

  fileFilter,
});

// ======================================================
// ACCEPTED FIELD NAMES
// ======================================================
//
// We accept both singular and plural names:
//
// images / image
// videos / video
//
// This prevents "Unexpected field" errors when
// the frontend/Postman uses either naming style.
// ======================================================

export const uploadFiles = upload.fields([
  {
    name: 'images',
    maxCount: MAX_FILES,
  },

  {
    name: 'image',
    maxCount: MAX_FILES,
  },

  {
    name: 'videos',
    maxCount: MAX_FILES,
  },

  {
    name: 'video',
    maxCount: MAX_FILES,
  },
]);