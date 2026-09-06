import express from 'express';

import { uploadFiles } from '../Middleware/upload.js';

import {
  uploadImagesToDrive,
} from '../Controllers/uploadController.js';

const router = express.Router();

router.post(
  '/',
  uploadFiles,
  uploadImagesToDrive
);

export default router;