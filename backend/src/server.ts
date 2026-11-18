import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';

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

// Root API v1 Route
app.get('/v1', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to CricMotion AI API v1',
    endpoints: {
      auth: '/v1/auth',
      projects: '/v1/projects',
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
  return app.listen(PORT, () => {
    console.log(`⚡ CricMotion AI Backend running on port ${PORT}`);
    console.log(`🔗 Health check available at http://localhost:${PORT}/health`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
