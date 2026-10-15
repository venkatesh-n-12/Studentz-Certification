import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

export const applyForOpportunity = async (req: any, res: Response, next: NextFunction) => {
  try {
    const opportunityId = req.params.id;
    const studentId = req.user.id;

    const opportunity = await prisma.opportunity.findUnique({ where: { id: opportunityId } });
    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }

    if (new Date() > new Date(opportunity.applicationDeadline)) {
      return res.status(400).json({ success: false, message: 'Application deadline has passed' });
    }

    const existingApplication = await prisma.application.findUnique({
      where: { studentId_opportunityId: { studentId, opportunityId } }
    });

    if (existingApplication) {
      return res.status(409).json({ success: false, message: 'You have already applied for this opportunity' });
    }

    // Check spots if applicable
    if (opportunity.spots) {
      const acceptedCount = await prisma.application.count({
        where: { opportunityId, status: 'ACCEPTED' }
      });
      if (acceptedCount >= opportunity.spots) {
        return res.status(400).json({ success: false, message: 'No spots available' });
      }
    }

    const application = await prisma.application.create({
      data: { studentId, opportunityId }
    });

    res.status(201).json({ success: true, data: application, message: 'Applied successfully' });
  } catch (error) {
    next(error);
  }
};

export const getApplicationById = async (req: any, res: Response, next: NextFunction) => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: { opportunity: true }
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Auth check: student can only see their own, admin/owner can see any (or ones they own)
    if (req.user.role === 'STUDENT' && application.studentId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    if (req.user.role === 'ADMIN' && application.opportunity.createdById !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

export const withdrawApplication = async (req: any, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;

    const application = await prisma.application.findUnique({ where: { id } });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.studentId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only withdraw your own applications' });
    }

    if (application.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: `Cannot withdraw application with status ${application.status}` });
    }

    await prisma.application.update({
      where: { id },
      data: { status: 'WITHDRAWN' }
    });

    res.status(200).json({ success: true, message: 'Application withdrawn successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (req: any, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    if (!['ACCEPTED', 'REJECTED', 'PENDING'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const application = await prisma.application.findUnique({
      where: { id },
      include: { opportunity: true }
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (req.user.role === 'ADMIN' && application.opportunity.createdById !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const updated = await prisma.application.update({
      where: { id },
      data: { status }
    });

    res.status(200).json({ success: true, data: updated, message: 'Application status updated' });
  } catch (error) {
    next(error);
  }
};
