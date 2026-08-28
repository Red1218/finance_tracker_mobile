import { BudgetSnapshot } from '../snapshots/BudgetSnapshot';
import { TransactionSnapshot } from '../snapshots/TransactionSnapshot';
import { BudgetHealthStatus } from '../value-objects/BudgetHealthStatus';
import { MonetaryAmount } from '../value-objects/MonetaryAmount';
import { ReportingPeriod } from '../value-objects/ReportingPeriod';

export class BudgetHealthService {
  /**
   * Calculates the BudgetHealthStatus for a set of budgets based on transaction history within the period.
   */
  public calculateStatus(
    budgets: BudgetSnapshot[],
    transactions: TransactionSnapshot[],
    period: ReportingPeriod
  ): BudgetHealthStatus[] {
    return budgets.map((budget) => {
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
        budget.id,
        new MonetaryAmount(consumed, budget.limit.currency),
        budget.limit,
        budget.categoryId
      );
    });
  }
}
