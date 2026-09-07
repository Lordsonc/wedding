import express from 'express';

import { uploadFiles } from '../Middleware/upload.js';

import {
  uploadFilesToDrive,
} from '../Controllers/uploadController.js';

const router = express.Router();

router.post(
  '/',
  uploadFiles,
  uploadFilesToDrive
);

export default router;