import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import prisma from './config/db';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (!process.env.DATABASE_URL) {
      console.error(
        '\n======================================================\n' +
        '❌ ERROR: DATABASE_URL environment variable is missing!\n' +
        '👉 On Render: In your Web Service dashboard, go to the "Environment" tab.\n' +
        '   Add a variable named "DATABASE_URL" with your PostgreSQL connection string.\n' +
        '👉 Locally: Ensure backend/.env contains DATABASE_URL=postgresql://...\n' +
        '======================================================\n'
      );
      process.exit(1);
    }

    await prisma.$connect();
    console.log('📦 Database connected successfully');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to database', error);
    process.exit(1);
  }
}

startServer();
