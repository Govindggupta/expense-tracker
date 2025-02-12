import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { STATUS } from '../constants/status.js';
import { Decimal } from 'decimal.js';
import { getAuth } from '@clerk/express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

const prisma = new PrismaClient();
// create expense
export const createExpenses = async (req: Request, res: Response) => {
  try {
    const { amount, description, attachmentUrl, categoryId, walletId, type, date } = req.body;
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(STATUS.UNAUTHORIZED).json({ message: 'User not authenticated' });
      return;
    }

    if (!amount || isNaN(Number(amount))) {
      res.status(STATUS.BAD_REQUEST).json({ message: 'Amount is required' });
      return;
    }
    if (!categoryId) {
      res.status(STATUS.BAD_REQUEST).json({ message: 'Category is required' });
      return;
    }
    if (!walletId) {
      res.status(STATUS.BAD_REQUEST).json({ message: 'Wallet is required' });
      return;
    }
    if (!['EXPENSE', 'INCOME'].includes(type)) {
      res.status(STATUS.BAD_REQUEST).json({ message: 'Type must be either EXPENSE or INCOME' });
      return;
    }

    const wallet = await prisma.wallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet) {
      res.status(STATUS.NOT_FOUND).json({ message: 'Wallet not found' });
      return;
    }

    const newBalance =
      type === 'INCOME'
        ? new Decimal(wallet.balance.toString()).add(new Decimal(amount.toString()))
        : new Decimal(wallet.balance.toString()).sub(new Decimal(amount.toString()));

    // if (newBalance.lt(0)) {
    //   return res.status(STATUS.BAD_REQUEST).json({ message: 'Insufficient funds in wallet' });
    // }

    const newExpense = await prisma.expense.create({
      data: {
        userId,
        amount: new Decimal(amount),
        description,
        attachmentUrl,
        categoryId,
        walletId,
        type,
        date: new Date(date),
      },
    });

    await prisma.wallet.update({
      where: { id: walletId },
      data: { balance: newBalance },
    });

    res.status(STATUS.CREATED).json({ expense: newExpense });
  } catch (error) {
    res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error', error });
    return;
  }
};

// Fetch all user expenses
export const getAllExpenses = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(STATUS.UNAUTHORIZED).json({ message: 'User not authenticated' });
      return;
    }

    // Fetch all expenses along with category name
    const expenses = await prisma.expense.findMany({
      where: { userId },
      include: {
        Category: {
          select: {
            name: true,
          },
        },
        Wallet: {
          select: {
            name: true,
          },
        },
      },
    });

    // Modify response to include category name directly
    const formattedExpenses = expenses.map((expense) => ({
      ...expense,
      categoryName: expense.Category?.name,
      walletName: expense.Wallet?.name,
      date: expense.date.toISOString(),
    }));

    res.status(STATUS.OK).json({ expenses: formattedExpenses });
  } catch (error) {
    res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error', error });
  }
};

// Get a single expense
export const getExpenseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

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
    const { amount, description, attachmentUrl, categoryId, userId, walletId, type, date } =
      req.body;

    if (!userId) {
      res.status(STATUS.UNAUTHORIZED).json({ message: 'User not authenticated' });
      return;
    }

    if (!categoryId) {
      res.status(STATUS.BAD_REQUEST).json({ message: 'Category is required' });
      return;
    }

    const existingExpense = await prisma.expense.findUnique({
      where: { id },
    });

    if (!existingExpense) {
      res.status(STATUS.NOT_FOUND).json({ message: 'Expense not found' });
      return;
    }

    const oldWalletId = existingExpense.walletId;
    const oldAmount = existingExpense.amount;
    const oldType = existingExpense.type;

    if (walletId !== oldWalletId || amount !== oldAmount || type !== oldType) {
      const oldWallet = await prisma.wallet.findUnique({
        where: { id: oldWalletId },
      });

      const newWallet = await prisma.wallet.findUnique({
        where: { id: walletId },
      });

      if (!oldWallet || !newWallet) {
        res.status(STATUS.NOT_FOUND).json({ message: 'Wallet not found' });
        return;
      }

      // Revert the old wallet balance
      const revertOldWalletBalance =
        oldType === 'INCOME' ? oldWallet.balance.sub(oldAmount) : oldWallet.balance.add(oldAmount);

      // Apply the new wallet balance
      const applyNewWalletBalance =
        type === 'INCOME' ? newWallet.balance.add(amount) : newWallet.balance.sub(amount);

      await prisma.wallet.update({
        where: { id: oldWalletId },
        data: { balance: revertOldWalletBalance },
      });

      await prisma.wallet.update({
        where: { id: walletId },
        data: { balance: applyNewWalletBalance },
      });
    }

    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: { amount, description, attachmentUrl, categoryId, walletId, type, date },
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

    const existingExpense = await prisma.expense.findUnique({
      where: { id },
    });

    const existingWallet = existingExpense?.walletId;

    if (existingWallet) {
      const wallet = await prisma.wallet.findUnique({
        where: { id: existingWallet },
      });
      if (existingExpense.type === 'INCOME') {
        await prisma.wallet.update({
          where: { id: existingWallet },
          data: { balance: wallet?.balance.sub(existingExpense.amount) },
        });
      } else {
        await prisma.wallet.update({
          where: { id: existingWallet },
          data: { balance: wallet?.balance.add(existingExpense.amount) },
        });
      }
    } else {
      res.status(STATUS.NOT_FOUND).json({ message: 'Expense or wallet not found' });
      return;
    }

    await prisma.expense.delete({
      where: { id },
    });

    res.status(STATUS.OK).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error', error });
  }
};
