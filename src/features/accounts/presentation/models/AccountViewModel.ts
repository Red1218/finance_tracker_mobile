import { AccountTypeKind } from '../../domain';

export interface AccountViewModel {
  id: string;
  name: string;
  type: AccountTypeKind;
  typeLabel: string;
  currencyCode: string;
  openingBalance: number;
  formattedOpeningBalance: string;
  derivedBalance: number;
  formattedDerivedBalance: string;
  isDefault: boolean;
  isArchived: boolean;
  archivedAt: string | null;
  createdAt: string;
}
