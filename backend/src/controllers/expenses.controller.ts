import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateTokenAndSetCookie } from '../utils/generateToken.js';
import { STATUS } from '../constants/status.js';

const prisma = new PrismaClient();
// create expense
export const createExpenses = async (req: Request, res: Response) => {
  try {
    const { amount, description, attachmentUrl } = req.body;
    const userId = req.user?.id; // Assuming user ID is attached to the request by middleware

    if (!userId) {
      res.status(STATUS.UNAUTHORIZED).json({ message: 'User not authenticated' });
    }

    if (!amount) {
      res.status(STATUS.BAD_REQUEST).json({ message: 'Amount is required' });
    }

    const newExpense = await prisma.expense.create({
      data: {
        userId,
        amount,
        description,
        attachmentUrl,
      },
    });

    res.status(STATUS.CREATED).json({ expense: newExpense });
  } catch (error) {
    res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error', error });
  }
};

// Fetch all user expenses
export const getAllExpenses = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(STATUS.UNAUTHORIZED).json({ message: 'User not authenticated' });
    }

    const expenses = await prisma.expense.findMany({
      where: { userId },
    });

    res.status(STATUS.OK).json({ expenses });
  } catch (error) {
    res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error', error });
  }
};

// Get a single expense
export const getExpenseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(STATUS.UNAUTHORIZED).json({ message: 'User not authenticated' });
    }

    const expense = await prisma.expense.findUnique({
      where: { id, userId },
    });

    if (!expense) {
      res.status(STATUS.NOT_FOUND).json({ message: 'Expense not found' });
    }

    res.status(STATUS.OK).json({ expense });
  } catch (error) {
    res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error', error });
  }
};

// Edit an expense
export const updateExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, description, attachmentUrl } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(STATUS.UNAUTHORIZED).json({ message: 'User not authenticated' });
    }

    const updatedExpense = await prisma.expense.update({
      where: { id, userId },
      data: { amount, description, attachmentUrl },
    });

    res.status(STATUS.OK).json({ expense: updatedExpense });
  } catch (error) {
    res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error', error });
  }
};

// Delete an expense
export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(STATUS.UNAUTHORIZED).json({ message: 'User not authenticated' });
    }

    await prisma.expense.delete({
      where: { id, userId },
    });

    res.status(STATUS.OK).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error', error });
  }
};