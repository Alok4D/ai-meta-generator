import dotenv from 'dotenv';
import connectDB from './app/config/db';

// Load env variables first
dotenv.config();

// Connect to MongoDB
connectDB();

import app from './app/app';

const port = Number(process.env.PORT) || 5000;

app.listen(port, '0.0.0.0', () => {
  console.log(`[server]: Server is running at http://0.0.0.0:${port}`);
});
