import { AccountTypeKind } from '../../domain';

export interface CreateAccountCommand {
  id?: string;
  name: string;
  type: AccountTypeKind | string;
  currencyCode?: string;
  openingBalance?: number;
  isDefault?: boolean;
}
