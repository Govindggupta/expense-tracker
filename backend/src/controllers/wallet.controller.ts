import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { STATUS } from '../constants/status.js';
import { getAuth } from '@clerk/express';

const prisma = new PrismaClient();

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

// Create a new wallet
export const createWallet = async (req: Request, res: Response) => {
  try {
    const { userId, name, balance, currency } = req.body;

    if (!userId || !name) {
      res.status(STATUS.BAD_REQUEST).json({ message: 'User ID and name are required' });
      return;
    }

    const newWallet = await prisma.wallet.create({
      data: {
        userId,
        name,
        balance: balance || 0,
        currency: currency || 'INR',
      },
    });

    res.status(STATUS.CREATED).json({ wallet: newWallet });
  } catch (error) {
    res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error', error });
  }
};

// Fetch all wallets
export const getAllWallets = async (req: Request, res: Response) => {
  try {
    // const { userId } = req.body;
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(STATUS.UNAUTHORIZED).json({ message: 'User not authenticated' });
      return;
    }

    const wallets = await prisma.wallet.findMany({
      where: { userId },
    });

    res.status(STATUS.OK).json({ wallets });
  } catch (error) {
    res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error', error });
  }
};

// Update wallet details
export const updateWallet = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, balance, currency } = req.body;

    const updatedWallet = await prisma.wallet.update({
      where: { id },
      data: { name, balance, currency },
    });

    res.status(STATUS.OK).json({ wallet: updatedWallet });
  } catch (error) {
    res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error', error });
  }
};

// Delete a wallet
export const deleteWallet = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.wallet.delete({
      where: { id },
    });

    res.status(STATUS.OK).json({ message: 'Wallet deleted successfully' });
  } catch (error) {
    res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error', error });
  }
};
