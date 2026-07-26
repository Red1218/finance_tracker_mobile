import { describe, it, expect } from 'vitest';
import { BudgetSummaryMapper, BudgetSummaryRecord } from '../mappers/BudgetSummaryMapper';

describe('BudgetSummaryMapper', () => {
  const mockSummaryRecord: BudgetSummaryRecord = {
    budget: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      user_id: 'usr-1',
      category_id: null,
      amount: 5000,
      currency_code: 'INR',
      period_type: 'MONTHLY',
      start_date: '2026-08-01T00:00:00.000Z',
      end_date: '2026-08-31T23:59:59.000Z',
      archived_at: null,
    },
    spent_amount: 2500,
  };

  it('maps from database record to projection', () => {
    const projection = BudgetSummaryMapper.toProjection(mockSummaryRecord);
    
    expect(projection.budget.id.value).toBe(mockSummaryRecord.budget.id);
    expect(projection.spentAmount).toBe(mockSummaryRecord.spent_amount);
  });
});
