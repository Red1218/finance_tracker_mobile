import { LargestTransaction } from '../../domain';
import { LargestTransactionsResponse, LargestTransactionItem } from '../responses/LargestTransactionsResponse';

export class LargestTransactionsMapper {
  public static toResponse(projections: LargestTransaction[]): LargestTransactionsResponse {
    const items: LargestTransactionItem[] = projections.map((p) => ({
      expenseId: p.expenseId,
      merchant: p.merchant,
      categoryName: p.categoryName,
      amount: p.amount,
      transactionDate: p.transactionDate,
    }));
    return { items };
  }
}
