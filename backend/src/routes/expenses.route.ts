import express from 'express';
import { protectedRoute } from '../middleware/protectedRoute.js';
import {
  createExpenses,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} from '../controllers/expenses.controller.js';

const router = express.Router();

router.post('/', protectedRoute, createExpenses);
router.get('/', protectedRoute, getAllExpenses);
router.get('/:id', protectedRoute, getExpenseById);
router.put('/:id', protectedRoute, updateExpense);
router.delete('/:id', protectedRoute, deleteExpense);

export default router;
