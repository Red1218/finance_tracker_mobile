export interface UpdateBudgetRequest {
  id: string;
  amount?: number;
  status?: 'Active' | 'Inactive';
  currency?: string;
  deletedAt?: Date | null;
}
