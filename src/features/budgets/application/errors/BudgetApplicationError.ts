import { BudgetDomainError } from '../../domain';

export class BudgetApplicationError extends BudgetDomainError {
  constructor(code: string, message: string) {
    super(code as any, message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BudgetNotFoundError extends BudgetApplicationError {
  constructor(budgetId: string) {
    super('BUDGET_NOT_FOUND', `Budget with ID "${budgetId}" was not found.`);
  }
}

export class BudgetOverlapError extends BudgetApplicationError {
  constructor() {
    super('BUDGET_OVERLAP', 'Active budget with intersecting date range already exists for this scope.');
  }
}

export class HistoricalBudgetImmutableError extends BudgetApplicationError {
  constructor() {
    super('HISTORICAL_BUDGET_IMMUTABLE', 'Historical budgets remain immutable.');
  }
}
