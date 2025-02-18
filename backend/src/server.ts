import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import walletRoute from './routes/wallet.route.js';
import categoryRoute from './routes/category.route.js';
import ExpenseRoute from './routes/expenses.route.js';
import AnalysisRoute from './routes/analysis.route.js';

dotenv.config({
  path: './.env',
});

const prisma = new PrismaClient();
const app = express();

const PORT = process.env.PORT || 5000;

if (!process.env.CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
  console.error('Clerk API keys are missing! Check your .env file.');
  process.exit(1);
}

const allowedOrigins = [
  'http://localhost:8081',
  'http://192.168.29.74:8081',
  'http://192.168.162.222:8081',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/v1/expenses', ExpenseRoute);
app.use('/v1/wallet', walletRoute);
app.use('/v1/category', categoryRoute);
app.use('/v1/analysis', AnalysisRoute)

app.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log(`Server running on port ${PORT}`);
    console.log('Database connected');
  } catch (error) {
    console.error('Internal server error: ', error);
  }
});
