import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import app from './app';
import connectDB from './config/database';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
