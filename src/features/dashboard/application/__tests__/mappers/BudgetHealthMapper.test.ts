import { describe, it, expect } from 'vitest';
import { BudgetHealthMapper } from '../../mappers/BudgetHealthMapper';
import { BudgetHealthStatus } from '../../../domain/value-objects/BudgetHealthStatus';
import { MonetaryAmount } from '../../../domain/value-objects/MonetaryAmount';

describe('BudgetHealthMapper (ADR-025 source contract)', () => {
  it('maps an Explicit category status to a non-overall row carrying its real budgetId semantics', () => {
    const status = new BudgetHealthStatus(
      'Explicit',
      new MonetaryAmount(400, 'INR'),
      new MonetaryAmount(500, 'INR'),
      'cat-1',
      'budget-1'
    );

    const viewModel = BudgetHealthMapper.mapToViewModel([status], { 'cat-1': 'Groceries' });
    const row = viewModel.content![0];

    expect(row.isOverall).toBe(false);
    expect(row.isDerived).toBe(false);
    expect(row.categoryId).toBe('cat-1');
    expect(row.categoryName).toBe('Groceries');
  });

  it('maps an Explicit overall status (categoryId undefined) to an overall, non-derived row', () => {
    const status = new BudgetHealthStatus(
      'Explicit',
      new MonetaryAmount(600, 'INR'),
      new MonetaryAmount(1000, 'INR'),
      undefined,
      'overall-budget-id'
    );

    const viewModel = BudgetHealthMapper.mapToViewModel([status]);
    const row = viewModel.content![0];

    expect(row.isOverall).toBe(true);
    expect(row.isDerived).toBe(false);
    expect(row.categoryName).toBe('Overall');
  });

  it('maps a Derived status to an overall, derived row without ever exposing a budgetId', () => {
    const status = new BudgetHealthStatus(
      'Derived',
      new MonetaryAmount(1000, 'INR'),
      new MonetaryAmount(5150, 'INR')
    );

    const viewModel = BudgetHealthMapper.mapToViewModel([status]);
    const row = viewModel.content![0];

    expect(row.isOverall).toBe(true);
    expect(row.isDerived).toBe(true);
    expect(row.categoryName).toBe('Overall');
    // The mapper must never invent or forward a fake budgetId for a derived row.
    expect((status as any).budgetId).toBeUndefined();
  });

  it('does not rely on any sentinel budgetId string to detect overall/derived rows', () => {
    // Regression guard: previously, isOverall/isDerived detection matched on
    // budgetId === 'overall' | 'global' | 'derived-overall'. The mapper must now
    // derive this purely from `source` and `categoryId`, per ADR-025.
    const explicitCategoryWithUnusualId = new BudgetHealthStatus(
      'Explicit',
      new MonetaryAmount(10, 'INR'),
      new MonetaryAmount(100, 'INR'),
      'cat-x',
      'derived-overall' // an adversarial/unusual real budgetId, must NOT be treated as derived
    );

    const viewModel = BudgetHealthMapper.mapToViewModel([explicitCategoryWithUnusualId]);
    const row = viewModel.content![0];

    expect(row.isOverall).toBe(false);
    expect(row.isDerived).toBe(false);
  });
});
