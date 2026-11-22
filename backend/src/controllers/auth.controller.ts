// backend/src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import prisma from '../utils/database';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { authSchema, userCreateSchema } from '../schemas/user';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ZodError } from 'zod';

export const register = async (req: Request, res: Response) => {
  try {
    // 1. Validate input data
    const parsedData = userCreateSchema.safeParse(req.body);
    if (!parsedData.success) {
      const zodError = parsedData.error as ZodError;
      return res
        .status(400)
        .json({ message: 'Invalid input data', errors: zodError });
    }

    const { username, password, fullName, email, role, departmentId, classId } =
      parsedData.data;

    // 2. Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: 'User with this username or email already exists' });
    }

    // 3. Hash the password
    const hashedPassword = await hashPassword(password);

    // 4. Create the user in the database
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        fullName,
        email,
        role,
        departmentId: departmentId || null,
        classId: classId || null,
      },
      // Don't return the password in the response
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // 5. Generate a JWT token
    const token = generateToken(user.id, user.username, user.role);

    // 6. Send success response with token and user info
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res
      .status(500)
      .json({ message: 'Internal server error during registration' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    // 1. Validate input data
    const parsedData = authSchema.safeParse(req.body);
    if (!parsedData.success) {
      const zodError = parsedData.error as ZodError;
      return res
        .status(400)
        .json({ message: 'Invalid input data', errors: zodError });
    }

    const { username, password } = parsedData.data;

    // 2. Find user by username
    const user = await prisma.user.findUnique({
      where: { username },
    });

    // 3. Check if user exists and password is correct
    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // 4. Generate a JWT token
    const token = generateToken(user.id, user.username, user.role);

    // 5. Send success response with token and user info (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Login error:', error);
    res
      .status(500)
      .json({ message: 'Internal server error during login' });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // The user ID is attached to the request by the authenticateToken middleware
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        department: true,
        class: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user profile error:', error);
    res
      .status(500)
      .json({ message: 'Internal server error' });
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash the new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update the password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
