import express from 'express';
import { requireAuth } from '@clerk/express';
import {
  createExpenses,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  ocrExpenses,
} from '../controllers/expenses.controller.js';

const router = express.Router();

router.post('/', requireAuth(), createExpenses);
router.get('/', requireAuth(), getAllExpenses);
router.get('/:id', requireAuth(), getExpenseById);
router.put('/:id', requireAuth(), updateExpense);
router.delete('/:id', requireAuth(), deleteExpense);
router.post('/ocr', requireAuth(), ocrExpenses);

export default router;
