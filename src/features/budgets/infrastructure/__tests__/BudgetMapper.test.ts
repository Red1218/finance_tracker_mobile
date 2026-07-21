import { describe, it, expect } from 'vitest';
import { BudgetMapper } from '../mappers/BudgetMapper';
import { BudgetRecord } from '../types/BudgetRecord';
import { Budget, BudgetId, BudgetAmount, BudgetPeriod } from '../../domain';
import { CategoryId } from '../../../categories/domain';
import { CurrencyCode } from '../../../expenses/domain/value-objects/CurrencyCode';

describe('BudgetMapper', () => {
  const mockRecord: BudgetRecord = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    category_id: 'a1234567-b89c-42d3-a456-426614174000',
    amount: 5000,
    currency: 'INR',
    period: 'Monthly',
    start_date: '2026-08-01T00:00:00.000Z',
    end_date: '2026-08-31T23:59:59.000Z',
  };

  const mockBudget = Budget.restore({
    id: new BudgetId(mockRecord.id),
    categoryId: new CategoryId(mockRecord.category_id!),
    amount: new BudgetAmount(mockRecord.amount),
    currency: new CurrencyCode(mockRecord.currency),
    period: BudgetPeriod.Monthly,
    startDate: new Date(mockRecord.start_date),
    endDate: new Date(mockRecord.end_date),
  });

  it('✓ maps from database record to domain entity using restore()', () => {
    const domain = BudgetMapper.toDomain(mockRecord);
    
    expect(domain.id.value).toBe(mockRecord.id);
    expect(domain.categoryId?.value).toBe(mockRecord.category_id);
    expect(domain.amount.value).toBe(mockRecord.amount);
    expect(domain.currency.value).toBe(mockRecord.currency);
    expect(domain.period).toBe(mockRecord.period);
    expect(domain.startDate.toISOString()).toBe(mockRecord.start_date);
    expect(domain.endDate.toISOString()).toBe(mockRecord.end_date);
  });

  it('✓ maps from database record without category to domain entity', () => {
    const noCatRecord = { ...mockRecord, category_id: null };
    const domain = BudgetMapper.toDomain(noCatRecord);
    
    expect(domain.categoryId).toBeNull();
  });

  it('✓ maps from domain entity to persistence record', () => {
    const record = BudgetMapper.toPersistence(mockBudget);
    
    expect(record.id).toBe(mockBudget.id.value);
    expect(record.category_id).toBe(mockBudget.categoryId?.value);
    expect(record.amount).toBe(mockBudget.amount.value);
    expect(record.currency).toBe(mockBudget.currency.value);
    expect(record.period).toBe(mockBudget.period);
    expect(record.start_date).toBe(mockBudget.startDate.toISOString());
    expect(record.end_date).toBe(mockBudget.endDate.toISOString());
  });
});
