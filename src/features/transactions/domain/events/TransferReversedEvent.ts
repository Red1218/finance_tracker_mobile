export interface TransferReversedEvent {
  eventName: 'TransferReversed';
  transferGroupId: string;
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  occurredAt: string;
}
