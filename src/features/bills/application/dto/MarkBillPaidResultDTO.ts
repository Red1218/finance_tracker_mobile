export interface MarkBillPaidResultDTO {
  readonly paymentId: string;
  readonly billId: string;
  readonly occurrenceKey: string;
  readonly updatedNextDueDate: string | null;
  readonly isArchived: boolean;
  readonly linkedTransactionId: string | null;
}
