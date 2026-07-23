import { TransactionSnapshot } from '../snapshots/TransactionSnapshot';
import { CategorySnapshot } from '../snapshots/CategorySnapshot';
import { CategorySpendSummary } from '../value-objects/CategorySpendSummary';
import { MonetaryAmount } from '../value-objects/MonetaryAmount';
import { ReportingPeriod } from '../value-objects/ReportingPeriod';

export class CategoryBreakdownService {
  /**
   * Derives a ranked list of CategorySpendSummary.
   * INV-006: Categories with zero spend must never appear in the breakdown.
   * INV-007: Proportions across all non-zero categories must sum to exactly 100%.
   */
  public calculateBreakdown(
    categories: CategorySnapshot[],
    transactions: TransactionSnapshot[],
    period: ReportingPeriod,
    baseCurrency: string
  ): CategorySpendSummary[] {
    const spendByCategory = new Map<string, number>();
    let totalSpend = 0;

    for (const tx of transactions) {
      if (!period.contains(tx.occurredAt)) continue;
      if (tx.direction !== 'Expense') continue;
      
      if (tx.amount.currency !== baseCurrency) {
        throw new Error('Transactions must match base currency for breakdown');
      }

      const currentSpend = spendByCategory.get(tx.categoryId) || 0;
      spendByCategory.set(tx.categoryId, currentSpend + tx.amount.amount);
      totalSpend += tx.amount.amount;
    }

    if (totalSpend === 0) {
      return [];
    }

    // Process only categories that have > 0 spend (INV-006)
    const breakdown = Array.from(spendByCategory.entries())
      .filter(([_, amount]) => amount > 0)
      .map(([categoryId, amount]) => {
        // Calculate proportion
        const proportion = (amount / totalSpend) * 100;
        return {
          categoryId,
          amount,
          proportion
        };
      })
      .sort((a, b) => b.amount - a.amount); // Sort descending by amount

    // Ensure they sum to exactly 100 by adjusting the first item for any floating point rounding error (INV-007)
    let currentSum = breakdown.reduce((sum, item) => sum + item.proportion, 0);
    
    return breakdown.map((item, index) => {
      let finalProportion = item.proportion;
      
      // Adjust the largest item (index 0) to guarantee 100% sum
      if (index === 0 && currentSum !== 100 && breakdown.length > 1) {
        finalProportion += (100 - currentSum);
      } else if (breakdown.length === 1) {
        finalProportion = 100;
      }

      // Safeguard bounds
      finalProportion = Math.max(0, Math.min(100, finalProportion));

      return new CategorySpendSummary(
        item.categoryId,
        new MonetaryAmount(item.amount, baseCurrency),
        finalProportion,
        index + 1 // 1-based rank
      );
    });
  }
}
