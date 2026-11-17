import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Global Middleware
app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'CricMotion AI Backend Orchestrator',
    version: '1.0.0'
  });
});

// Root API v1 Information Route
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

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`⚡ CricMotion AI Backend running on port ${PORT}`);
    console.log(`🔗 Health check available at http://localhost:${PORT}/health`);
  });
}

export default app;
