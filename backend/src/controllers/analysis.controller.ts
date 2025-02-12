import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { STATUS } from '../constants/status.js';
import { getAuth } from '@clerk/express';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from 'date-fns';

const prisma = new PrismaClient();

export const expenseOverview = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(STATUS.UNAUTHORIZED).json({ message: 'User not authenticated' });
      console.log('0');
      return;
    }
    // Fetch expense overview grouped by category
    const expenseOverview = await prisma.expense.groupBy({
      by: ['categoryId'],
      where: {
        userId: userId,
        type: 'EXPENSE',
      },
      _sum: {
        amount: true,
      },
    });

    // Fetch category names
    const categories = await prisma.category.findMany({
      where: {
        id: { in: expenseOverview.map((item) => item.categoryId) },
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Map category names to the expense overview
    const transformedData = expenseOverview.map((item) => {
      const category = categories.find((cat) => cat.id === item.categoryId);
      return {
        categoryId: item.categoryId,
        categoryName: category ? category.name : 'Unknown',
        totalAmount: item._sum.amount,
      };
    });

    res.json({ data: transformedData });
  } catch (error) {
    console.error('Error fetching expense overview:', error);
    res.status(STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to fetch expense overview' });
  }
};

export const incomeOverview = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(STATUS.UNAUTHORIZED).json({ message: 'User not authenticated' });
      return;
    }

    // Fetch income overview grouped by category
    const incomeOverview = await prisma.expense.groupBy({
      by: ['categoryId'],
      where: {
        userId: userId,
        type: 'INCOME',
      },
      _sum: {
        amount: true,
      },
    });

    // Fetch category names
    const categories = await prisma.category.findMany({
      where: {
        id: { in: incomeOverview.map((item) => item.categoryId) },
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Map category names to the income overview
    const transformedData = incomeOverview.map((item) => {
      const category = categories.find((cat) => cat.id === item.categoryId);
      return {
        categoryId: item.categoryId,
        categoryName: category ? category.name : 'Unknown',
        totalAmount: item._sum.amount,
      };
    });

    res.json({ data: transformedData });
  } catch (error) {
    console.error('Error fetching income overview:', error);
    res.status(STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to fetch income overview' });
  }
};

export const walletAnalysis = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(STATUS.UNAUTHORIZED).json({ message: 'User not authenticated' });
      return;
    }

    // Fetch all wallets for the user
    const wallets = await prisma.wallet.findMany({
      where: {
        userId: userId,
      },
      include: {
        expenses: {
          select: {
            amount: true,
            type: true,
          },
        },
      },
    });

    // Process the data to calculate total income and expense for each wallet
    const transformedData = wallets.map((wallet) => {
      const totalIncome = wallet.expenses
        .filter((expense) => expense.type === 'INCOME')
        .reduce((sum, expense) => sum + expense.amount.toNumber(), 0);

      const totalExpense = wallet.expenses
        .filter((expense) => expense.type === 'EXPENSE')
        .reduce((sum, expense) => sum + expense.amount.toNumber(), 0);

      return {
        walletId: wallet.id,
        walletName: wallet.name,
        totalIncome,
        totalExpense,
      };
    });

    res.json({ data: transformedData });
  } catch (error) {
    console.error('Error fetching wallet analysis:', error);
    res.status(STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to fetch wallet analysis' });
  }
};

const getDateRange = (period: string, startDate?: Date, endDate?: Date) => {
  const now = new Date(); // Current date and time

  switch (period) {
    case 'daily':
      return { gte: startOfDay(now), lte: endOfDay(now) };

    case 'weekly':
      return { gte: startOfWeek(now), lte: endOfWeek(now) };

    case 'monthly':
      return { gte: startOfMonth(now), lte: endOfMonth(now) };

    case 'yearly':
      return { gte: startOfYear(now), lte: endOfYear(now) };

    case 'custom':
      if (!startDate || !endDate) {
        throw new Error('Custom period requires both startDate and endDate.');
      }
      if (startDate > endDate) {
        throw new Error('Start date cannot be greater than end date.');
      }
      return { gte: startOfDay(startDate), lte: endOfDay(endDate) };

    default:
      throw new Error('Invalid period specified.');
  }
};

// Expense Overview by Period
export const getExpenseOverviewByPeriod = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    const { period, startDate, endDate } = req.query;

    if (!userId) {
      res.status(STATUS.UNAUTHORIZED).json({ message: 'User not authenticated' });
      return;
    }

    // Calculate date range
    const dateRange = getDateRange(
      period as string,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined,
    );

    // Fetch expense overview grouped by category
    const expenseOverview = await prisma.expense.groupBy({
      by: ['categoryId'],
      where: {
        userId: userId,
        type: 'EXPENSE',
        date: dateRange,
      },
      _sum: {
        amount: true,
      },
    });

    // Fetch category names
    const categories = await prisma.category.findMany({
      where: {
        id: { in: expenseOverview.map((item) => item.categoryId) },
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Map category names to the expense overview
    const transformedData = expenseOverview.map((item) => {
      const category = categories.find((cat) => cat.id === item.categoryId);
      return {
        categoryId: item.categoryId,
        categoryName: category ? category.name : 'Unknown',
        totalAmount: item._sum.amount,
      };
    });

    res.json({ data: transformedData });
  } catch (error) {
    console.error('Error fetching expense overview by period:', error);
    res
      .status(STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to fetch expense overview by period' });
  }
};

// Income Overview by Period
export const getIncomeOverviewByPeriod = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    const { period, startDate, endDate } = req.query;

    if (!userId) {
      res.status(STATUS.UNAUTHORIZED).json({ message: 'User not authenticated' });
      return;
    }

    // Calculate date range
    const dateRange = getDateRange(
      period as string,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined,
    );

    // Fetch income overview grouped by category
    const incomeOverview = await prisma.expense.groupBy({
      by: ['categoryId'],
      where: {
        userId: userId,
        type: 'INCOME',
        date: dateRange,
      },
      _sum: {
        amount: true,
      },
    });

    // Fetch category names
    const categories = await prisma.category.findMany({
      where: {
        id: { in: incomeOverview.map((item) => item.categoryId) },
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Map category names to the income overview
    const transformedData = incomeOverview.map((item) => {
      const category = categories.find((cat) => cat.id === item.categoryId);
      return {
        categoryId: item.categoryId,
        categoryName: category ? category.name : 'Unknown',
        totalAmount: item._sum.amount,
      };
    });

    res.json({ data: transformedData });
  } catch (error) {
    console.error('Error fetching income overview by period:', error);
    res
      .status(STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to fetch income overview by period' });
  }
};

// Wallet Analysis by Period
export const getWalletAnalysisByPeriod = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    const { period, startDate, endDate } = req.query;

    if (!userId) {
      res.status(STATUS.UNAUTHORIZED).json({ message: 'User not authenticated' });
      return;
    }

    // Calculate date range
    const dateRange = getDateRange(
      period as string,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined,
    );

    // Fetch all wallets for the user
    const wallets = await prisma.wallet.findMany({
      where: {
        userId: userId,
      },
      include: {
        expenses: {
          where: {
            date: dateRange,
          },
          select: {
            amount: true,
            type: true,
          },
        },
      },
    });

    // Process the data to calculate total income and expense for each wallet
    const transformedData = wallets.map((wallet) => {
      const totalIncome = wallet.expenses
        .filter((expense) => expense.type === 'INCOME')
        .reduce((sum, expense) => sum + expense.amount.toNumber(), 0);

      const totalExpense = wallet.expenses
        .filter((expense) => expense.type === 'EXPENSE')
        .reduce((sum, expense) => sum + expense.amount.toNumber(), 0);

      return {
        walletId: wallet.id,
        walletName: wallet.name,
        totalIncome,
        totalExpense,
      };
    });

    res.json({ data: transformedData });
  } catch (error) {
    console.error('Error fetching wallet analysis by period:', error);
    res
      .status(STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to fetch wallet analysis by period' });
  }
};
