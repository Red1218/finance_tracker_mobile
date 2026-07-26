export interface CategoryViewModel {
  id: string;
  name: string;
  kind: 'INCOME' | 'EXPENSE';
  isSystem: boolean;
  isArchived: boolean;
  archivedAt: string | null;
  colorHex: string | null;
  iconName: string | null;
}
