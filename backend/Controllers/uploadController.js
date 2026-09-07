import { randomUUID } from 'crypto';
import fs from 'fs';
import drive from '../Config/googleDrive.js';

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

if (!FOLDER_ID) {
  throw new Error('GOOGLE_DRIVE_FOLDER_ID is missing.');
}

// Maximum number of Google Drive uploads happening simultaneously
const MAX_CONCURRENT_UPLOADS = 3;

const uploadSingleFile = async (file) => {
  const fileName = `${randomUUID()}-${file.originalname}`;

  const fileMetadata = {
    name: fileName,
    parents: [FOLDER_ID],
  };

  const media = {
    mimeType: file.mimetype,
    body: fs.createReadStream(file.path),
  };

  try {
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id,name,mimeType,size,webViewLink',
    });

    return {
      id: response.data.id,
      name: response.data.name,
      mimeType: response.data.mimeType,
      size: response.data.size,
      webViewLink: response.data.webViewLink,
    };
  } finally {
    // Delete temporary file after Google Drive upload
    fs.promises.unlink(file.path).catch(() => {});
  }
};

export const uploadFilesToDrive = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files provided.',
      });
    }

    const uploadedFiles = [];

    // Process files in controlled batches
    for (
      let i = 0;
      i < req.files.length;
      i += MAX_CONCURRENT_UPLOADS
    ) {
      const batch = req.files.slice(
        i,
        i + MAX_CONCURRENT_UPLOADS
      );

      const results = await Promise.all(
        batch.map((file) => uploadSingleFile(file))
      );

      uploadedFiles.push(...results);
    }

    return res.status(201).json({
      success: true,
      message: `${uploadedFiles.length} file(s) uploaded successfully.`,
      files: uploadedFiles,
    });
  } catch (error) {
    console.error('Google Drive Upload Error:', error);

    // Clean up remaining temporary files
    if (req.files) {
      await Promise.all(
        req.files.map(async (file) => {
          try {
            await fs.promises.unlink(file.path);
          } catch {
            // File may already have been deleted
          }
        })
      );
    }

    next(error);
  }
};