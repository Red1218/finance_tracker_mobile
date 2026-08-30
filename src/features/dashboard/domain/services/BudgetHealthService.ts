import { BudgetSnapshot } from '../snapshots/BudgetSnapshot';
import { TransactionSnapshot } from '../snapshots/TransactionSnapshot';
import { BudgetHealthStatus } from '../value-objects/BudgetHealthStatus';
import { MonetaryAmount } from '../value-objects/MonetaryAmount';
import { ReportingPeriod } from '../value-objects/ReportingPeriod';

export class BudgetHealthService {
  /**
   * Calculates the BudgetHealthStatus for a set of budgets based on transaction history within the period.
   * If no explicit overall budget is defined but category budgets exist, computes a read-only derived aggregate summary.
   */
  public calculateStatus(
    budgets: BudgetSnapshot[],
    transactions: TransactionSnapshot[],
    period: ReportingPeriod
  ): BudgetHealthStatus[] {
    const categoryStatuses = budgets.map((budget) => {
      let consumed = 0;

      for (const tx of transactions) {
        if (!period.contains(tx.occurredAt)) continue;
        if (tx.direction !== 'Expense') continue;

        // If the budget is for a specific category, only include those.
        // If categoryId is undefined, it's a global budget, include all expenses.
        if (budget.categoryId && budget.categoryId !== tx.categoryId) {
          continue;
        }

        if (tx.amount.currency !== budget.limit.currency) {
          throw new Error('Transaction currency must match budget currency');
        }

        consumed += tx.amount.amount;
      }

      return new BudgetHealthStatus(
        'Explicit',
        new MonetaryAmount(consumed, budget.limit.currency),
        budget.limit,
        budget.categoryId,
        budget.id
      );
    });

    const hasExplicitOverall = budgets.some((b) => b.categoryId === undefined);

    if (!hasExplicitOverall && budgets.length > 0) {
      let aggregateLimit = 0;
      let aggregateConsumed = 0;
      const currency = budgets[0].limit.currency;

      const categoryIds = new Set(budgets.map((b) => b.categoryId).filter(Boolean));

      for (const b of budgets) {
        if (b.limit.currency !== currency) {
          throw new Error('Transaction currency must match budget currency');
        }
        aggregateLimit += b.limit.amount;
      }

      for (const tx of transactions) {
        if (!period.contains(tx.occurredAt)) continue;
        if (tx.direction !== 'Expense') continue;
        if (categoryIds.size > 0 && !categoryIds.has(tx.categoryId)) continue;

        if (tx.amount.currency !== currency) {
          throw new Error('Transaction currency must match budget currency');
        }

        aggregateConsumed += tx.amount.amount;
      }

      const derivedOverallStatus = new BudgetHealthStatus(
        'Derived',
        new MonetaryAmount(aggregateConsumed, currency),
        new MonetaryAmount(aggregateLimit, currency),
        undefined,
        undefined
      );

      return [derivedOverallStatus, ...categoryStatuses];
    }

    return categoryStatuses;
  }
}
