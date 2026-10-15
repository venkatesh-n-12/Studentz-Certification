import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/auth.validator';

export const signup = (role: string) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = signupSchema.parse(req.body);
    
    const existingUser = await prisma.user.findUnique({ where: { email: validatedData.email } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already in use' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validatedData.password, salt);

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        passwordHash,
        role,
        status: role === 'ADMIN' ? 'PENDING' : 'ACTIVE'
      }
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    
    res.status(201).json({
      success: true,
      data: userWithoutPassword,
      message: role === 'ADMIN' ? 'Registration successful. Awaiting owner approval.' : 'Registration successful'
    });
  } catch (error) {
    next(error);
  }
};

export const universalLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ success: false, message: `Account is ${user.status.toLowerCase()}.` });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    const { passwordHash: _, ...userWithoutPassword } = user;
    
    res.status(200).json({
      success: true,
      data: { user: userWithoutPassword, token },
      token, // Also output token directly for frontend compatibility
      message: 'Login successful'
    });
  } catch (error) {
    next(error);
  }
};

export const login = (role: string) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.role !== role) {
      return res.status(403).json({ success: false, message: 'Invalid role for this login endpoint' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ success: false, message: `Account is ${user.status.toLowerCase()}.` });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    const { passwordHash: _, ...userWithoutPassword } = user;
    
    res.status(200).json({
      success: true,
      data: { user: userWithoutPassword, token },
      message: 'Login successful'
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { passwordHash: _, ...userWithoutPassword } = req.user;
    res.status(200).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address'
      });
    }

    // Generate a secure reset token valid for 1 hour
    const resetToken = jwt.sign(
      { id: user.id, email: user.email, purpose: 'password_reset' },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      success: true,
      message: 'Account verified. You can now set your new password.',
      resetToken,
      email: user.email
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, newPassword } = resetPasswordSchema.parse(req.body);
    const { resetToken } = req.body;

    if (resetToken) {
      try {
        const decoded: any = jwt.verify(resetToken, process.env.JWT_SECRET as string);
        if (decoded.email !== email || decoded.purpose !== 'password_reset') {
          return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
        }
      } catch (e) {
        return res.status(400).json({ success: false, message: 'Reset session has expired. Please request again.' });
      }
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { email },
      data: { passwordHash }
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.'
    });
  } catch (error) {
    next(error);
  }
};

