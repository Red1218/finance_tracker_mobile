export interface TransactionUpdatedEvent {
  eventName: 'TransactionUpdated';
  transactionId: string;
  accountId: string;
  updatedFields: string[];
  occurredAt: string;
}
