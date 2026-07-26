export interface TransactionViewModel {
  id: string;
  accountId: string;
  categoryId: string | null;
  type: 'EXPENSE' | 'INCOME' | 'TRANSFER_OUT' | 'TRANSFER_IN';
  typeLabel: string; // e.g. "Expense", "Income", "Transfer Out", "Transfer In"
  amount: number;
  formattedAmount: string; // e.g. "-₹500.00", "+₹1,200.00"
  currencyCode: string;
  description: string;
  transferGroupId: string | null;
  transactionDateIso: string;
  formattedDate: string; // e.g. "Jul 25, 2026"
  isVoided: boolean;
  badgeColor: string; // e.g. "#EF4444" (red for expense/transfer-out), "#10B981" (green for income/transfer-in)
}
