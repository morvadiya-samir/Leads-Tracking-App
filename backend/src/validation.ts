import { z } from 'zod';

export const LeadStatusEnum = z.enum(['new', 'contacted', 'qualified', 'lost']);
export type LeadStatus = z.infer<typeof LeadStatusEnum>;

export const CreateLeadSchema = z.object({
  name: z.string().trim().min(1, 'Name is required and cannot be empty'),
  email: z.string().trim().min(1, 'Email is required').email('Invalid email address format'),
  phone: z.string().trim().min(3, 'Phone number must be at least 3 characters'),
  status: LeadStatusEnum.optional().default('new'),
});

export const UpdateLeadSchema = z.object({
  name: z.string().trim().min(1, 'Name cannot be empty').optional(),
  email: z.string().trim().email('Invalid email address format').optional(),
  phone: z.string().trim().min(3, 'Phone number must be at least 3 characters').optional(),
  status: LeadStatusEnum.optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field (name, email, phone, status) must be provided to update',
});

export const CreateNoteSchema = z.object({
  content: z.string().trim().min(1, 'Note content is required and cannot be empty'),
});

export const LeadQuerySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  page: z.string().optional().transform(val => (val ? Math.max(1, parseInt(val, 10) || 1) : 1)),
  limit: z.string().optional().transform(val => (val ? Math.min(100, Math.max(1, parseInt(val, 10) || 10)) : 10)),
});
