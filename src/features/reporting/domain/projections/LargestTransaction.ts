export interface LargestTransaction {
  readonly expenseId: string;
  readonly merchant: string;
  readonly categoryName: string;
  readonly amount: number;
  readonly transactionDate: string;
}
