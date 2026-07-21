import { z } from 'zod';
import { BudgetPeriod } from '../../domain/value-objects/BudgetPeriod';

export const createBudgetSchema = z.object({
  categoryId: z.string().nullable().optional(), // null means overall budget
  amount: z.number().positive('Amount must be greater than zero'),
  currencyCode: z.string().min(3).max(3),
  period: z.nativeEnum(BudgetPeriod),
  startDate: z.date(),
  endDate: z.date(),
}).refine(data => data.startDate <= data.endDate, {
  message: 'Start date must be before or equal to end date',
  path: ['endDate'],
});

export const updateBudgetSchema = z.object({
  amount: z.number().positive('Amount must be greater than zero'),
});

export type CreateBudgetFormData = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetFormData = z.infer<typeof updateBudgetSchema>;
