import jwt from 'jsonwebtoken';
import { Response } from 'express';

export const generateTokenAndSetCookie = (userId: string, res: Response): void => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: '15d',
  });

  res.cookie('jwt', token, {
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days in milliseconds
    httpOnly: true, // Prevent XSS attacks (cross-site scripting attacks)
    sameSite: 'strict', // Prevent CSRF attacks (cross-site request forgery attacks)
    secure: process.env.NODE_ENV !== 'development', // Only use HTTPS in production
  });
};
