export interface CreateIncomeCommand {
  id?: string;
  accountId: string;
  amount: number;
  currencyCode: string;
  description: string;
  categoryId?: string | null;
  occurredAt?: Date;
}
