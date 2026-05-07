import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';  // Security
import morgan from 'morgan';  // Logging
import dotenv from 'dotenv';
import { initializeDatabase } from './models/database';
import productRoutes from './routes/products';
import stockRoutes from './routes/stock';
import ordersRoutes from './routes/orders';

// Load env early
dotenv.config();

const app: Express = express();
const PORT: number = parseInt(process.env.PORT || '3001', 10);

// Middleware stack
app.use(helmet()); 
app.use(morgan('combined')); 
app.use(cors({ origin: 'http://localhost:3000' })); 
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes - Mounted correctly
app.use('/api/products', productRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/orders', ordersRoutes);

// Health & Root
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    routes: ['/api/products', '/api/stock', '/api/orders']
  });
});

app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'Senfrost IMS Backend API - Aircon Inventory Management',
    version: '1.0.0',
    docs: '/health'
  });
});

// 404 Handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// Centralized Error Handler (last)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message 
  });
});

// Graceful startup
async function startServer() {
  try {
    console.log('Initializing Supabase database...');
    await initializeDatabase();
    console.log('✅ Database connected');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Health: http://localhost:${PORT}/health`);
      console.log(`📦 Products: http://localhost:${PORT}/api/products`);
    });
  } catch (error: any) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();

export default app;