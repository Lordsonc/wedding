import express from 'express';
import cors from 'cors';

import uploadRoutes from './Routes/uploadRoutes.js';
import { errorHandler } from './Middleware/errorHandler.js';

const app = express();

const PORT = process.env.PORT;
const FRONTEND_URL = process.env.FRONTEND_URL;

if (!FRONTEND_URL) {
  throw new Error('FRONTEND_URL is missing.');
}

app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  })
);

// Explicitly handle preflight requests
app.options('*', cors());

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

// Error handler MUST be last
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on port ${PORT}`);
});