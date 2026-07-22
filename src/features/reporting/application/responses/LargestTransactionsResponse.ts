export interface LargestTransactionItem {
  readonly expenseId: string;
  readonly merchant: string;
  readonly categoryName: string;
  readonly amount: number;
  readonly transactionDate: string;
}

export interface LargestTransactionsResponse {
  readonly items: readonly LargestTransactionItem[];
}
