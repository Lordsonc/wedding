import express from 'express';
import cors from 'cors';

import uploadRoutes from './Routes/uploadRoutes.js';
import { errorHandler } from './Middleware/errorHandler.js';

const app = express();

// =====================================================
// ENVIRONMENT VARIABLES
// =====================================================

const PORT = process.env.PORT;
const FRONTEND_URL = process.env.FRONTEND_URL;

if (!FRONTEND_URL) {
  console.error(
    'Error: FRONTEND_URL is missing from environment variables.'
  );

  process.exit(1);
}

// =====================================================
// CORS
// =====================================================

app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  })
);

// =====================================================
// JSON
// =====================================================

app.use(express.json());

// =====================================================
// HEALTH CHECK
// =====================================================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Google Drive backend is running.',
  });
});

// =====================================================
// UPLOAD ROUTES
// =====================================================

app.use(
  '/api/upload',
  uploadRoutes
);

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use(errorHandler);

// =====================================================
// START SERVER
// =====================================================

const server = app.listen(
  PORT,
  '0.0.0.0',
  () => {
    console.log(
      `Backend server running on port ${PORT}`
    );
  }
);

// =====================================================
// GRACEFUL SHUTDOWN
// =====================================================

const shutdown = (signal) => {
  console.log(
    `${signal} received. Shutting down server...`
  );

  server.close(() => {
    console.log(
      'Server closed successfully.'
    );

    process.exit(0);
  });
};

process.on('SIGTERM', () => {
  shutdown('SIGTERM');
});

process.on('SIGINT', () => {
  shutdown('SIGINT');
});
