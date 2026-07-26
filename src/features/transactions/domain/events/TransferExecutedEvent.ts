export interface TransferExecutedEvent {
  eventName: 'TransferExecuted';
  transferGroupId: string;
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  currencyCode: string;
  occurredAt: string;
}
