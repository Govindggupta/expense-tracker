import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import authRoute from './routes/auth.route.js';
import expesesRoute from './routes/expenses.route.js';

const prisma = new PrismaClient();

dotenv.config({
  path: './.env',
});

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/v1/auth', authRoute);
app.use('/v1/expenses', expesesRoute);

app.listen(PORT, async () => {
  try {
    console.log(`Server running on port ${PORT}`);
    await prisma.$connect();
    console.log('Dababase connected');
  } catch (error) {
    console.log('Internal server error: ', error);
  }
});
