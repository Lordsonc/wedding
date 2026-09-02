import express from 'express';
import multer from 'multer';
import { google } from 'googleapis';
import cors from 'cors';
import dotenv from 'dotenv';
import { Readable } from 'stream';
import path from 'path';

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

// 1. Configure Multer with 10MB limit per file and image-only filter
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// 2. Auth with Google Drive API (Full drive scope for service accounts)
const auth = new google.auth.GoogleAuth({
  keyFile: path.resolve('./google-service-account.json'),
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

const uploadMultiple = upload.array('images', 5);

// 3. Multiple Images Upload Endpoint
app.post('/api/upload', (req, res, next) => {
  uploadMultiple(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'One or more files exceed the 10MB limit.' });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ error: 'Maximum 5 files allowed per upload.' });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image files provided.' });
    }

    // Map over req.files array and upload each image concurrently
    const uploadPromises = req.files.map((file) => {
      const bufferStream = new Readable();
      bufferStream.push(file.buffer);
      bufferStream.push(null);

      const fileMetaData = {
        name: `${Date.now()}_${file.originalname}`,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
      };

      const media = {
        mimeType: file.mimetype,
        body: bufferStream,
      };

      return drive.files.create({
        requestBody: fileMetaData, // Updated parameter name for API v3
        media: media,
        fields: 'id, name, webViewLink',
      });
    });

    // Wait for all uploads to finish
    const results = await Promise.all(uploadPromises);
    const uploadedFiles = results.map(res => res.data);

    res.status(200).json({
      message: `${uploadedFiles.length} images uploaded successfully!`,
      files: uploadedFiles,
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

const PORT = process.env.PORT;

if (!PORT) {
  console.error("Error: PORT is not defined in .env file.");
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});