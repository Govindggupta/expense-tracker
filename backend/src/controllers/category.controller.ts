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

// Fetch all categories (predefined and user-specific)
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(STATUS.UNAUTHORIZED).json({ message: 'User not authenticated' });
      return;
    }

    const categories = await prisma.category.findMany({
      where: {
        OR: [{ userId }],
      },
    });

    res.status(STATUS.OK).json({ categories });
  } catch (error) {
    res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error', error });
  }
};

// Create a new category
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, type } = req.body;
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(STATUS.UNAUTHORIZED).json({ message: 'User not authenticated' });
    }

    const newCategory = await prisma.category.create({
      data: {
        userId: userId as string,
        name,
        type,
      },
    });

    res.status(STATUS.CREATED).json({ category: newCategory });
  } catch (error) {
    res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error', error });
  }
};

// Update a category
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!id) {
      res.status(STATUS.UNAUTHORIZED).json({ message: 'User not authenticated' });
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { name },
    });

    res.status(STATUS.OK).json({ category: updatedCategory });
  } catch (error) {
    res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error', error });
  }
};

// Delete a category
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(STATUS.UNAUTHORIZED).json({ message: 'User not authenticated' });
    }

    await prisma.category.delete({
      where: { id },
    });

    res.status(STATUS.OK).json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error', error });
  }
};
