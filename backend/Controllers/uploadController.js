import { randomUUID } from 'crypto';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';

import drive from '../Config/googleDrive.js';

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

// Only this many Google Drive uploads run simultaneously.
const MAX_CONCURRENT_UPLOADS = 3;

if (!FOLDER_ID) {
  throw new Error(
    'GOOGLE_DRIVE_FOLDER_ID is missing from environment variables.'
  );
}

// ==========================================
// UPLOAD ONE FILE
// ==========================================

const uploadSingleFile = async (file) => {
  const extension = path.extname(file.originalname);

  const fileName = `${randomUUID()}${extension}`;

  const fileMetadata = {
    name: fileName,
    parents: [FOLDER_ID],
  };

  try {
    const response = await drive.files.create({
      requestBody: fileMetadata,

      media: {
        mimeType: file.mimetype,
        body: fs.createReadStream(file.path),
      },

      fields: 'id,name,mimeType,size,webViewLink',
    });

    return {
      id: response.data.id,
      name: response.data.name,
      originalName: file.originalname,
      mimeType: response.data.mimeType,
      size: response.data.size,
      webViewLink: response.data.webViewLink,
    };
  } finally {
    // Delete temporary file
    try {
      await fsPromises.unlink(file.path);
    } catch (error) {
      console.error(
        `Could not delete temporary file: ${file.path}`,
        error.message
      );
    }
  }
};

// ==========================================
// CONTROLLED CONCURRENCY
// ==========================================

const processUploads = async (files) => {
  const results = new Array(files.length);

  let nextIndex = 0;

  const worker = async () => {
    while (true) {
      const index = nextIndex++;

      if (index >= files.length) {
        break;
      }

      results[index] = await uploadSingleFile(
        files[index]
      );
    }
  };

  const workers = Array.from(
    {
      length: Math.min(
        MAX_CONCURRENT_UPLOADS,
        files.length
      ),
    },
    () => worker()
  );

  await Promise.all(workers);

  return results;
};

// ==========================================
// CONTROLLER
// ==========================================

export const uploadImagesToDrive = async (
  req,
  res,
  next
) => {
  try {
    const imageFiles = req.files?.images || [];
    const videoFiles = req.files?.videos || [];

    const files = [
      ...imageFiles,
      ...videoFiles,
    ];

    // Nothing uploaded
    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        error:
          'No image or video files were provided.',
      });
    }

    console.log(
      `Received ${imageFiles.length} image(s) and ${videoFiles.length} video(s).`
    );

    const uploadedFiles = await processUploads(
      files
    );

    return res.status(201).json({
      success: true,

      message:
        `${uploadedFiles.length} file(s) uploaded successfully.`,

      files: uploadedFiles,
    });
  } catch (error) {
    console.error(
      'Google Drive Upload Error:',
      error
    );

    // Clean up remaining temporary files
    const files = [
      ...(req.files?.images || []),
      ...(req.files?.videos || []),
    ];

    await Promise.all(
      files.map(async (file) => {
        try {
          await fsPromises.unlink(file.path);
        } catch {
          // File may already have been deleted
        }
      })
    );

    next(error);
  }
};