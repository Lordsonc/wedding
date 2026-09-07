import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import uploadRoutes from './Routes/uploadRoutes.js';
import { errorHandler } from './Middleware/errorHandler.js';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 7000;
const FRONTEND_URL = process.env.FRONTEND_URL;

// ============================================================
// ENVIRONMENT CHECK
// ============================================================

if (!FRONTEND_URL) {
  console.error('ERROR: FRONTEND_URL is missing from .env');
  process.exit(1);
}

console.log('Frontend URL:', FRONTEND_URL);

// ============================================================
// CORS CONFIGURATION
// ============================================================

const allowedOrigins = [
  'https://wedding-1-44h4.onrender.com',
  FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an origin.
      // This allows Postman and server-to-server requests.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error('Blocked CORS origin:', origin);

      return callback(
        new Error(`CORS blocked origin: ${origin}`)
      );
    },

    methods: [
      'GET',
      'POST',
      'OPTIONS',
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization',
    ],

    credentials: false,
  })
);

// ============================================================
// BODY PARSING
// ============================================================

app.use(express.json());

// ============================================================
// HEALTH CHECK
// ============================================================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Google Drive backend is running.',
  });
});

// ============================================================
// UPLOAD ROUTES
// ============================================================

app.use('/api/upload', uploadRoutes);

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use(errorHandler);

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Port: ${PORT}`);
});

