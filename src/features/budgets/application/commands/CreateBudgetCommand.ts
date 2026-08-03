export interface CreateBudgetCommand {
  id?: string;
  categoryId?: string | null;
  amount: number;
  currencyCode: string;
  periodKind: string;
  startDate: Date;
  endDate: Date;
}
