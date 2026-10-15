import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

export const getAdmins = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, name: true, email: true, status: true, createdAt: true }
    });
    res.status(200).json({ success: true, data: admins });
  } catch (error) {
    next(error);
  }
};

export const getAdminRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requests = await prisma.user.findMany({
      where: { role: 'ADMIN', status: 'PENDING' },
      select: { id: true, name: true, email: true, status: true, createdAt: true }
    });
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

export const approveAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admin = await prisma.user.update({
      where: { id: req.params.id },
      data: { status: 'ACTIVE' }
    });
    res.status(200).json({ success: true, message: 'Admin approved successfully' });
  } catch (error) {
    next(error);
  }
};

export const rejectAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admin = await prisma.user.update({
      where: { id: req.params.id },
      data: { status: 'REJECTED' }
    });
    res.status(200).json({ success: true, message: 'Admin rejected successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteAdmin = async (req: any, res: Response, next: NextFunction) => {
  try {
    const adminId = req.params.id;
    const ownerId = req.user.id;
    
    // First reassign all opportunities created by this admin to the owner
    await prisma.opportunity.updateMany({
      where: { createdById: adminId },
      data: { createdById: ownerId }
    });
    
    // Now safe to delete the admin
    await prisma.user.delete({
      where: { id: adminId }
    });
    
    res.status(200).json({ success: true, message: 'Admin deleted successfully' });
  } catch (error) {
    next(error);
  }
};
