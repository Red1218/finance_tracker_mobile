export interface TransactionDTO {
  id: string;
  accountId: string;
  categoryId: string | null;
  type: string;
  amount: number;
  currencyCode: string;
  description: string;
  transferGroupId: string | null;
  occurredAt: string;
  createdAt: string;
  isArchived: boolean;
  archivedAt: string | null;
}
