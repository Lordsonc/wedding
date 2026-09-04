import express from 'express';
import cors from 'cors';

import uploadRoutes from './Routes/uploadRoutes.js';
import { errorHandler } from './Middleware/errorHandler.js';

const app = express();

const PORT = process.env.PORT;
const FRONTEND_URL = process.env.FRONTEND_URL;

if (!FRONTEND_URL) {
  console.error('Error: FRONTEND_URL is missing from .env');
  process.exit(1);
}

app.use(
  cors({
    origin: FRONTEND_URL,
  })
);

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Google Drive backend is running.',
  });
});

// Upload routes
app.use('/api/upload', uploadRoutes);

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});