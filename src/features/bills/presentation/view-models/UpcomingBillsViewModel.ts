export type BillUrgencyLevel = 'critical' | 'high' | 'medium' | 'low';
export type BillPaymentStatus = 'Upcoming' | 'DueToday' | 'Overdue';

export interface UpcomingBillItemViewModel {
  readonly billId: string;
  readonly billName: string;
  readonly formattedAmount: string;
  readonly rawAmount: number;
  readonly currencyCode: string;
  readonly dueDateLabel: string;
  readonly status: BillPaymentStatus;
  readonly urgency: BillUrgencyLevel;
  readonly categoryName: string | null;
  readonly canMarkPaid: boolean;
}

export type SectionLoadingStatus = 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR';

export interface UpcomingBillsSectionState {
  readonly status: SectionLoadingStatus;
  readonly bills: readonly UpcomingBillItemViewModel[];
  readonly errorMessage: string | null;
}
