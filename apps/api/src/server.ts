import dotenv from 'dotenv';
import connectDB from './app/config/db';

// Load env variables first
dotenv.config();

// Connect to MongoDB
connectDB();

import app from './app/app';

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
