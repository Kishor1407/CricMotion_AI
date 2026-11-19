import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore in environments where setServers is restricted
}

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/db';
import { createVideoWorker } from './workers/videoWorker';
import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';
import scheduleRoutes from './routes/scheduleRoutes';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Global Middleware
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Health Check Route
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'CricMotion AI Backend Orchestrator',
    database: 'MongoDB Atlas',
    version: '1.0.0'
  });
});

// Mount Routes
app.use('/v1/auth', authRoutes);
app.use('/v1/projects', projectRoutes);
app.use('/v1/schedule', scheduleRoutes);

// Root API v1 Route
app.get('/v1', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to CricMotion AI API v1',
    endpoints: {
      auth: '/v1/auth',
      projects: '/v1/projects',
      schedule: '/v1/schedule',
      health: '/health'
    }
  });
});

// Central Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start Server and Connect DB
export const startServer = async () => {
  await connectDB();
  
  // WORKER-01: Initialize BullMQ Video Worker
  try {
    createVideoWorker();
    console.log('⚡ BullMQ Video Render Worker initialized and listening on Redis queue.');
  } catch (workerErr: any) {
    console.warn('⚠️ BullMQ Video Worker init note:', workerErr.message);
  }

  return app.listen(PORT, () => {
    console.log(`⚡ CricMotion AI Backend running on port ${PORT}`);
    console.log(`🔗 Health check available at http://localhost:${PORT}/health`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
