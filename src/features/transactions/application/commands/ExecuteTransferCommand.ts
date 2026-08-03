export interface ExecuteTransferCommand {
  sourceTransactionId?: string;
  destTransactionId?: string;
  sourceAccountId: string;
  destAccountId: string;
  amount: number;
  currencyCode: string;
  description: string;
  transferGroupId?: string;
  occurredAt?: Date;
  transactionDate?: Date;
}
