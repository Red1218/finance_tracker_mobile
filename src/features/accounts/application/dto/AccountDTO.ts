export interface AccountDTO {
  id: string;
  name: string;
  type: string;
  currencyCode: string;
  openingBalance: number;
  isDefault: boolean;
  isArchived: boolean;
  archivedAt: string | null;
  createdAt: string;
}
