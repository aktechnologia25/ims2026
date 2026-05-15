import dotenv from 'dotenv';
import app, { ensureDatabaseInitialized } from './app';

dotenv.config();

const PORT: number = parseInt(process.env.PORT || '3001', 10);

async function startServer() {
  try {
    console.log('Initializing Supabase database...');
    await ensureDatabaseInitialized();
    console.log('Database connected');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Health: http://localhost:${PORT}/health`);
      console.log(`Products: http://localhost:${PORT}/api/products`);
    });
  } catch (error: any) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
