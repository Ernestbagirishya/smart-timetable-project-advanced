// backend/src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';

// Extend the Express Request interface to include a user property
export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  // Authorization header format: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.warn('No access token provided in request');
    return res.status(401).json({ message: 'Access token is required' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // Attach user information to the request object
    next(); // Proceed to the next middleware/controller
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export const requireRole = (role: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }

    next();
  };
};