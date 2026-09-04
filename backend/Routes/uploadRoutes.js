import express from 'express';
import { uploadImages } from '../Middleware/upload.js';
import { uploadImagesToDrive } from '../Controllers/uploadController.js';

const router = express.Router();

router.post(
  '/',
  uploadImages,
  uploadImagesToDrive
);

export default router;