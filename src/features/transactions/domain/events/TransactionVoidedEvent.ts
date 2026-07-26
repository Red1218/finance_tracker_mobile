export interface TransactionVoidedEvent {
  eventName: 'TransactionVoided';
  transactionId: string;
  accountId: string;
  occurredAt: string;
}
