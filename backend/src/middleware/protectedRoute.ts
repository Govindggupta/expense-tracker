import jwt, { JwtPayload } from 'jsonwebtoken';
import { STATUS } from '../constants/status.js';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface DecodedToken extends JwtPayload {
  userId: string;
}

declare global {
  namespace Express {
    export interface Request {
      user: {
        id: string;
      };
    }
  }
}

export const protectedRoute = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      res.status(STATUS.UNAUTHORIZED).json({ error: 'Unauthorized - No token provided' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;

    if (!decoded) {
      res.status(STATUS.UNAUTHORIZED).json({ error: 'Unauthorized - Invalid Token' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true },
    });

    if (!user) {
      res.status(STATUS.NOT_FOUND).json({ error: 'User not found' });
      return;
    }

    req.user = user;

    next();
  } catch (error: any) {
    console.log('Error in protectRoute middleware', error.message);
    res.status(STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
  }
};
