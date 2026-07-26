export interface TransactionDeletedEvent {
  eventName: 'TransactionDeleted';
  transactionId: string;
  accountId: string;
  occurredAt: string;
}
