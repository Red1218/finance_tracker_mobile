export interface UpcomingBillDTO {
  readonly billId: string;
  readonly billName: string;
  readonly amount: number;
  readonly currencyCode: string;
  readonly nextDueDate: string;
  readonly dueDateLabel: string;
  readonly status: 'Upcoming' | 'DueToday' | 'Overdue';
  readonly urgency: 'critical' | 'high' | 'medium' | 'low';
  readonly categoryId: string | null;
  readonly categoryName: string | null;
  readonly recurrenceType: string;
}
