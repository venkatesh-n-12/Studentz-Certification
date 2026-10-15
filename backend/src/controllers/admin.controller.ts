import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

export const getAdminApplications = async (req: any, res: Response, next: NextFunction) => {
  try {
    const opportunityId = req.params.id;

    const opportunity = await prisma.opportunity.findUnique({ where: { id: opportunityId } });
    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }

    if (opportunity.createdById !== req.user.id && req.user.role !== 'OWNER') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const applications = await prisma.application.findMany({
      where: { opportunityId },
      include: { student: { select: { id: true, name: true, email: true } } }
    });

    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    next(error);
  }
};
