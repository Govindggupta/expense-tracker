import express from 'express';
// import { protectedRoute } from '../middleware/protectedRoute.js';
import {
  createExpenses,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} from '../controllers/expenses.controller.js';

const router = express.Router();

router.post('/', createExpenses);
router.get('/', getAllExpenses);
router.get('/:id', getExpenseById);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

export default router;
