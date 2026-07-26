export interface TransactionCreatedEvent {
  eventName: 'TransactionCreated';
  transactionId: string;
  accountId: string;
  type: string;
  amount: number;
  currencyCode: string;
  occurredAt: string;
}
