import { z } from 'zod';

const normalizeCategory = z.preprocess((val) => {
  if (typeof val !== 'string') return val;
  const upper = val.toUpperCase().trim();
  if (upper.startsWith('HACK')) return 'HACKATHON';
  if (upper.startsWith('INTERN')) return 'INTERNSHIP';
  if (upper.startsWith('CERT')) return 'CERTIFICATION';
  if (upper.startsWith('WORK')) return 'WORKSTATION';
  if (upper.startsWith('OTHER') || upper.includes('PROGRAM')) return 'OTHER_PROGRAM';
  return upper;
}, z.enum(['HACKATHON', 'INTERNSHIP', 'CERTIFICATION', 'WORKSTATION', 'OTHER_PROGRAM']).optional());

const normalizeMode = z.preprocess((val) => {
  if (typeof val !== 'string') return val;
  return val.toUpperCase().trim();
}, z.enum(['ONLINE', 'OFFLINE', 'HYBRID']).optional());

const normalizePayment = z.preprocess((val) => {
  if (typeof val !== 'string') return val;
  return val.toUpperCase().trim();
}, z.enum(['UNPAID', 'PAID', 'STIPEND', 'FREE']).optional());

export const opportunityQuerySchema = z.object({
  search: z.string().optional(),
  category: normalizeCategory,
  mode: normalizeMode,
  paymentType: normalizePayment,
  date: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sort: z.enum(['None', 'PriceLowHigh', 'PriceHighLow']).optional(),
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
});

export const opportunityBodySchema = z.object({
  title: z.string().min(2),
  organization: z.string().min(2),
  category: z.enum(['HACKATHON', 'INTERNSHIP', 'CERTIFICATION', 'WORKSTATION', 'OTHER_PROGRAM']),
  subCategory: z.string().optional(),
  description: z.string().min(10),
  requirements: z.array(z.string()),
  benefits: z.array(z.string()),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  applicationDeadline: z.string().datetime(),
  duration: z.string().optional(),
  mode: z.enum(['ONLINE', 'OFFLINE', 'HYBRID']),
  location: z.string().optional(),
  registrationUrl: z.string().url().optional().or(z.literal('')),
  price: z.number().optional(),
  paymentType: z.enum(['UNPAID', 'PAID', 'STIPEND', 'FREE']).optional(),
  certificateAvailable: z.boolean().optional(),
  spots: z.number().int().optional(),
});

export const opportunityUpdateSchema = opportunityBodySchema.partial();
