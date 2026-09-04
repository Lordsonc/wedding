import { randomUUID } from 'crypto';
import { Readable } from 'stream';
import drive from '../Config/googleDrive.js';

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

if (!FOLDER_ID) {
  throw new Error('GOOGLE_DRIVE_FOLDER_ID is missing from .env');
}

export const uploadImagesToDrive = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No image files provided.',
      });
    }

    const uploadPromises = req.files.map(async (file) => {
      const fileName = `${randomUUID()}-${file.originalname}`;

      const fileMetadata = {
        name: fileName,
        parents: [FOLDER_ID],
      };

      const media = {
        mimeType: file.mimetype,
        body: Readable.from(file.buffer),
      };

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
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    return res.status(201).json({
      success: true,
      message: `${uploadedFiles.length} image(s) uploaded successfully.`,
      files: uploadedFiles,
    });
  } catch (error) {
    console.error('Google Drive Upload Error:', error);

    next(error);
  }
};