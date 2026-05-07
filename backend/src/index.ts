import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './models/database';
import productRoutes from './routes/products';
import stockRoutes from './routes/stock';
import ordersRoutes from './routes/orders';
import 'dotenv/config';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Initialize database and routes
async function startServer() {
  try {
    await initializeDatabase();
    
    // API Routes
    app.use('/api/products', productRoutes);
    app.use('/api/stock', stockRoutes);
    app.use('/api/orders', ordersRoutes);
    
    // Health check
    app.get('/health', (req: Request, res: Response) => {
      res.json({ status: 'healthy' });
    });
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
