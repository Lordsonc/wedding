import fs from 'fs';
import { randomUUID } from 'crypto';
import drive from '../Config/googleDrive.js';

const FOLDER_ID =
  process.env.GOOGLE_DRIVE_FOLDER_ID;

if (!FOLDER_ID) {
  throw new Error(
    'GOOGLE_DRIVE_FOLDER_ID is missing.'
  );
}

// ======================================================
// GOOGLE DRIVE CONCURRENCY CONTROL
// ======================================================

const MAX_CONCURRENT_UPLOADS = 3;

let activeUploads = 0;

const uploadQueue = [];

// ======================================================
// UPLOAD QUEUE
// ======================================================

const processQueue = () => {
  if (
    activeUploads >=
    MAX_CONCURRENT_UPLOADS
  ) {
    return;
  }

  const item = uploadQueue.shift();

  if (!item) {
    return;
  }

  activeUploads++;

  item.task()
    .then(item.resolve)
    .catch(item.reject)
    .finally(() => {
      activeUploads--;

      processQueue();
    });

  processQueue();
};

const queueUpload = (task) => {
  return new Promise(
    (resolve, reject) => {
      uploadQueue.push({
        task,
        resolve,
        reject,
      });

      processQueue();
    }
  );
};

// ======================================================
// DELETE TEMPORARY FILE
// ======================================================

const deleteTemporaryFile = async (
  filePath
) => {
  try {
    await fs.promises.unlink(
      filePath
    );
  } catch (error) {
    console.error(
      'Unable to delete temporary file:',
      error.message
    );
  }
};

// ======================================================
// UPLOAD ONE FILE TO GOOGLE DRIVE
// ======================================================

const uploadToDrive = async (
  file
) => {
  const fileName =
    `${Date.now()}-${randomUUID()}-${file.originalname}`;

  try {
    const response =
      await drive.files.create({
        requestBody: {
          name: fileName,
          parents: [FOLDER_ID],
        },

        media: {
          mimeType: file.mimetype,

          body: fs.createReadStream(
            file.path
          ),
        },

        fields:
          'id,name,mimeType,size,webViewLink',
      });

    return {
      id: response.data.id,

      name: response.data.name,

      originalName:
        file.originalname,

      mimeType:
        response.data.mimeType,

      size: response.data.size,

      webViewLink:
        response.data.webViewLink,
    };
  } finally {
    // Delete temporary file after
    // Google Drive upload finishes.
    await deleteTemporaryFile(
      file.path
    );
  }
};

// ======================================================
// MAIN CONTROLLER
// ======================================================

export const uploadFilesToDrive =
  async (req, res, next) => {
    try {
      const imageFiles =
        req.files?.images || [];

      const videoFiles =
        req.files?.videos || [];

      const files = [
        ...imageFiles,
        ...videoFiles,
      ];

      // ----------------------------------------------
      // CHECK FILES
      // ----------------------------------------------

      if (files.length === 0) {
        return res.status(400).json({
          success: false,

          error:
            'No image or video files provided.',
        });
      }

      // ----------------------------------------------
      // QUEUE GOOGLE DRIVE UPLOADS
      // ----------------------------------------------

      const uploadPromises =
        files.map((file) =>
          queueUpload(() =>
            uploadToDrive(file)
          )
        );

      const uploadedFiles =
        await Promise.all(
          uploadPromises
        );

      // ----------------------------------------------
      // SUCCESS
      // ----------------------------------------------

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

      next(error);
    }
  };