export interface CreateCategoryCommand {
  id?: string;
  name: string;
  kind: 'INCOME' | 'EXPENSE';
  colorHex?: string | null;
  iconName?: string | null;
}
