import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

export const getMyApplications = async (req: any, res: Response, next: NextFunction) => {
  try {
    const applications = await prisma.application.findMany({
      where: { studentId: req.user.id },
      include: { opportunity: true }
    });

    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    next(error);
  }
};

export const getMySavedOpportunities = async (req: any, res: Response, next: NextFunction) => {
  try {
    const saved = await prisma.savedOpportunity.findMany({
      where: { studentId: req.user.id },
      include: { opportunity: true }
    });

    res.status(200).json({ success: true, data: saved });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body; // Can add more fields later

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name }
    });

    const { passwordHash, ...userWithoutPassword } = user;
    res.status(200).json({ success: true, data: userWithoutPassword, message: 'Profile updated' });
  } catch (error) {
    next(error);
  }
};
