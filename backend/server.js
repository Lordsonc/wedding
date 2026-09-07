import express from 'express';
import cors from 'cors';

import uploadRoutes from './Routes/uploadRoutes.js';

import {
  errorHandler,
} from './Middleware/errorHandler.js';

const app = express();

// ======================================================
// ENVIRONMENT
// ======================================================

const PORT =
  process.env.PORT;

const FRONTEND_URL =
  process.env.FRONTEND_URL;

if (!FRONTEND_URL) {
  throw new Error(
    'FRONTEND_URL is missing from .env'
  );
}

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(
  cors({
    origin: FRONTEND_URL,

    methods: [
      'GET',
      'POST',
      'OPTIONS',
    ],
  })
);

app.use(
  express.json()
);

// ======================================================
// HEALTH CHECK
// ======================================================

app.get(
  '/api/health',
  (req, res) => {
    res.status(200).json({
      success: true,

      message:
        'Google Drive backend is running.',
    });
  }
);

// ======================================================
// UPLOAD ROUTES
// ======================================================

app.use(
  '/api/upload',
  uploadRoutes
);

// ======================================================
// ERROR HANDLER
// ======================================================

app.use(errorHandler);

// ======================================================
// START SERVER
// ======================================================

app.listen(
  PORT,
  '0.0.0.0',
  () => {
    console.log(
      `Backend server running on port ${PORT}`
    );
  }
);