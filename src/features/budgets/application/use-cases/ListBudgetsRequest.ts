export interface ListBudgetsRequest {
  period?: string;
  categoryId?: string | null;
  status?: 'Active' | 'Inactive';
  includeDeleted?: boolean;
}
