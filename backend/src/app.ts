import express, { Express, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { initializeDatabase } from './models/database';
import { requireAuth } from './middleware/auth';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import stockRoutes from './routes/stock';
import ordersRoutes from './routes/orders';

dotenv.config();

const app: Express = express();

let databaseInitPromise: Promise<void> | null = null;

export function ensureDatabaseInitialized(): Promise<void> {
  if (!databaseInitPromise) {
    databaseInitPromise = initializeDatabase().catch((error) => {
      databaseInitPromise = null;
      throw error;
    });
  }

  return databaseInitPromise;
}

app.use(helmet());
app.use(morgan('combined'));
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
        process.env.FRONTEND_URL,
      ].filter(Boolean);

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);

app.use('/api', async (_req: Request, _res: Response, next: NextFunction) => {
  try {
    await ensureDatabaseInitialized();
    next();
  } catch (error) {
    next(error);
  }
});

app.use('/api', requireAuth);
app.use('/api/products', productRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/orders', ordersRoutes);

app.get('/health', async (_req: Request, res: Response) => {
  try {
    await ensureDatabaseInitialized();
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      routes: ['/api/products', '/api/stock', '/api/orders'],
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Senfrost IMS Backend API - Aircon Inventory Management',
    version: '1.0.0',
    docs: '/health',
  });
});

app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err.stack || err);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
  });
});

export default app;
