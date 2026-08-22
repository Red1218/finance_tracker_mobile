export type BillPaymentExecutionMode = 'AUTO_CREATE' | 'LINK_EXISTING' | 'UNLINKED';

export interface MarkBillPaidCommand {
  readonly billId: string;
  readonly amount: number;
  readonly currencyCode: string;
  readonly executionMode: BillPaymentExecutionMode;
  readonly transactionId?: string;
  readonly accountId?: string;
  readonly paidAt?: Date;
}
