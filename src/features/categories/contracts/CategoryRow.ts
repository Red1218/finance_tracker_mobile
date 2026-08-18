export interface CategoryRow {
  id: string;
  name: string;
  kind: 'income' | 'expense';
  is_system: boolean;
  archived_at: string | null;
  color_hex?: string | null;
  icon_name?: string | null;
}
