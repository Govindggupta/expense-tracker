import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateTokenAndSetCookie } from '../utils/generateToken.js';
import { STATUS } from '../constants/status.js';

const prisma = new PrismaClient();

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, username, email, password } = req.body;

    if (!firstName || !lastName || !username || !email || !password) {
      res.status(STATUS.BAD_REQUEST).json({ message: 'All fields are required' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(STATUS.BAD_REQUEST).json({ message: 'Invalid email format' });
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      res.status(STATUS.BAD_REQUEST).json({
        message:
          'Password must be at least 8 characters long, include at least one uppercase letter, one number, and one special character',
      });
      return;
    }

    const existingUsername = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (existingUsername) {
      res.status(STATUS.DUPLICATE).json({ message: 'User already exists' });
      return;
    }

    const existingEmail = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingEmail) {
      res.status(STATUS.DUPLICATE).json({ message: 'User already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        username,
        email,
        password: hashedPassword,
      },
    });

    if (createUser) {
      generateTokenAndSetCookie(createUser.id, res);
      res.status(STATUS.CREATED).json({ createUser });
    }
  } catch (error) {
    console.log("reached here");
    res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(STATUS.BAD_REQUEST).json({ message: 'All fields are required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      res.status(STATUS.NOT_FOUND).json({ message: 'User not found' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(STATUS.UNAUTHORIZED).json({ message: 'Invalid Password' });
      return;
    }

    generateTokenAndSetCookie(user.id, res);

    res.status(STATUS.OK).json({ message: 'Login successful', user });
  } catch (error) {
    res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie('jwt');
    res.status(STATUS.OK).json({ message: 'Logout successful' });
  } catch (error) {
    res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error', error });
  }
};

export const getHome = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user?.id,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        password: false,
      },
    });

    if (!user) {
      res.status(STATUS.NOT_FOUND).json({ message: 'User not found' });
      return;
    }

    res.status(STATUS.OK).json({ user });
  } catch (error) {
    res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error', error });
  }
};
