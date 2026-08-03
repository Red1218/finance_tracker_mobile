export interface CategoryDTO {
  id: string;
  name: string;
  kind: string;
  isSystem: boolean;
  isArchived: boolean;
  colorHex: string | null;
  iconName: string | null;
  archivedAt: string | null;
}
