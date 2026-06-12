import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import router from './routes';
import fs from 'fs';

const app: Express = express();

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Stripe webhook requires raw body
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());

// Application Routes
app.use('/api', router);

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to AI Meta Generator API' });
});

export default app;
