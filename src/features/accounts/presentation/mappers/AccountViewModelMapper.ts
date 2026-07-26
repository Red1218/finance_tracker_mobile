import { Account, AccountTypeKind } from '../../domain';
import { AccountViewModel } from '../models/AccountViewModel';

export class AccountViewModelMapper {
  private static readonly TYPE_LABEL_MAP: Record<AccountTypeKind, string> = {
    [AccountTypeKind.Cash]: 'Cash',
    [AccountTypeKind.Bank]: 'Bank Account',
    [AccountTypeKind.CreditCard]: 'Credit Card',
    [AccountTypeKind.Wallet]: 'Digital Wallet',
  };

  public static mapToViewModel(account: Account, decimalPrecision = 2): AccountViewModel {
    const formattedOpening = AccountViewModelMapper.formatCurrency(
      account.openingBalance.value,
      account.currencyCode.value,
      decimalPrecision
    );

    // Derived balance (Opening Balance + net ledger transactions in future)
    const derivedBalance = account.openingBalance.value;
    const formattedDerived = AccountViewModelMapper.formatCurrency(
      derivedBalance,
      account.currencyCode.value,
      decimalPrecision
    );

    return {
      id: account.id.value,
      name: account.name.value,
      type: account.type.kind,
      typeLabel: AccountViewModelMapper.TYPE_LABEL_MAP[account.type.kind] ?? account.type.kind,
      currencyCode: account.currencyCode.value,
      openingBalance: account.openingBalance.value,
      formattedOpeningBalance: formattedOpening,
      derivedBalance,
      formattedDerivedBalance: formattedDerived,
      isDefault: account.isDefault,
      isArchived: account.isArchived,
      archivedAt: account.archivedAt ? account.archivedAt.toISOString() : null,
      createdAt: account.createdAt.toISOString(),
    };
  }

  public static formatCurrency(amount: number, currencyCode: string, precision = 2): string {
    const symbol = currencyCode === 'INR' ? '₹' : `${currencyCode} `;
    const fixedAmount = amount.toLocaleString('en-IN', {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    });
    return `${symbol}${fixedAmount}`;
  }
}
