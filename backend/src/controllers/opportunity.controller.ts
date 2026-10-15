import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { opportunityQuerySchema, opportunityBodySchema, opportunityUpdateSchema } from '../validators/opportunity.validator';

export const getOpportunities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = opportunityQuerySchema.parse(req.query);
    const { search, category, mode, paymentType, date, startDate, endDate, sort, page = '1', limit = '50' } = query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { organization: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (mode) {
      where.mode = mode;
    }

    if (paymentType) {
      if (paymentType === 'FREE') {
        where.OR = [
          { paymentType: 'FREE' },
          { price: 0 }
        ];
      } else {
        where.paymentType = paymentType;
      }
    }

    if (category !== 'INTERNSHIP') {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      
      if (date === 'Today') {
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        where.startDate = { gte: now, lt: tomorrow };
      } else if (date === 'This Week') {
        const endOfWeek = new Date(now);
        endOfWeek.setDate(now.getDate() + 6);
        where.startDate = { gte: now, lte: endOfWeek };
      } else if (date === 'This Month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        where.startDate = { gte: startOfMonth, lte: endOfMonth };
      } else if (date === 'Upcoming') {
        where.startDate = { gte: now };
      } else if (date === 'Custom Date' && startDate && endDate) {
        where.startDate = { gte: new Date(startDate), lte: new Date(endDate) };
      }
    }

    let orderBy: any = undefined;
    if (sort === 'PriceLowHigh') {
      orderBy = { price: 'asc' };
    } else if (sort === 'PriceHighLow') {
      orderBy = { price: 'desc' };
    } else {
      orderBy = { createdAt: 'desc' };
    }

    const [opportunities, total] = await Promise.all([
      prisma.opportunity.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
      }),
      prisma.opportunity.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: opportunities,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    next(error);
  }
};

export const getOpportunityById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: req.params.id }
    });

    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }

    res.status(200).json({ success: true, data: opportunity });
  } catch (error) {
    next(error);
  }
};

export const createOpportunity = async (req: any, res: Response, next: NextFunction) => {
  try {
    const data = opportunityBodySchema.parse(req.body);
    
    const opportunity = await prisma.opportunity.create({
      data: {
        ...data,
        requirements: data.requirements,
        benefits: data.benefits,
        createdById: req.user.id
      }
    });

    res.status(201).json({ success: true, data: opportunity, message: 'Opportunity created successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateOpportunity = async (req: any, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const data = opportunityUpdateSchema.parse(req.body);

    const existing = await prisma.opportunity.findUnique({ where: { id } });
    
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }

    if (req.user.role === 'ADMIN' && existing.createdById !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only edit opportunities you created' });
    }

    const updateData: any = { ...data };
    if (data.requirements) updateData.requirements = data.requirements;
    if (data.benefits) updateData.benefits = data.benefits;

    const opportunity = await prisma.opportunity.update({
      where: { id },
      data: updateData
    });

    res.status(200).json({ success: true, data: opportunity, message: 'Opportunity updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteOpportunity = async (req: any, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;

    const existing = await prisma.opportunity.findUnique({ where: { id } });
    
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }

    if (req.user.role === 'ADMIN' && existing.createdById !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only delete opportunities you created' });
    }

    await prisma.opportunity.delete({ where: { id } });

    res.status(200).json({ success: true, message: 'Opportunity deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const saveOpportunity = async (req: any, res: Response, next: NextFunction) => {
  try {
    const opportunityId = req.params.id;
    const studentId = req.user.id;

    const existing = await prisma.opportunity.findUnique({ where: { id: opportunityId } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }

    const saved = await prisma.savedOpportunity.findUnique({
      where: { studentId_opportunityId: { studentId, opportunityId } }
    });

    if (saved) {
      return res.status(409).json({ success: false, message: 'Opportunity already saved' });
    }

    await prisma.savedOpportunity.create({
      data: { studentId, opportunityId }
    });

    res.status(201).json({ success: true, message: 'Opportunity saved' });
  } catch (error) {
    next(error);
  }
};

export const unsaveOpportunity = async (req: any, res: Response, next: NextFunction) => {
  try {
    const opportunityId = req.params.id;
    const studentId = req.user.id;

    await prisma.savedOpportunity.delete({
      where: { studentId_opportunityId: { studentId, opportunityId } }
    });

    res.status(200).json({ success: true, message: 'Opportunity unsaved' });
  } catch (error) {
    // If not found, prisma throws P2025. We can just catch and ignore or send a custom message.
    res.status(404).json({ success: false, message: 'Saved opportunity not found' });
  }
};
