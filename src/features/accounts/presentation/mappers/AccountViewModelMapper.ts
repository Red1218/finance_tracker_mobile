import { Account, AccountTypeKind } from '../../domain';
import { AccountDTO } from '../../application/dto/AccountDTO';
import { AccountViewModel } from '../models/AccountViewModel';

export class AccountViewModelMapper {
  private static readonly TYPE_LABEL_MAP: Record<string, string> = {
    [AccountTypeKind.Cash]: 'Cash',
    [AccountTypeKind.Bank]: 'Bank Account',
    [AccountTypeKind.CreditCard]: 'Credit Card',
    [AccountTypeKind.Wallet]: 'Digital Wallet',
  };

  public static mapToViewModel(account: Account | AccountDTO, decimalPrecision = 2): AccountViewModel {
    const isDto = typeof account.id === 'string' && typeof account.name === 'string';

    const idStr = isDto ? (account as AccountDTO).id : (account as Account).id.value;
    const nameStr = isDto ? (account as AccountDTO).name : (account as Account).name.value;
    const typeStr = isDto ? (account as AccountDTO).type : (account as Account).type.kind;
    const currencyStr = isDto ? (account as AccountDTO).currencyCode : (account as Account).currencyCode.value;
    const openingBalanceVal = isDto
      ? (account as AccountDTO).openingBalance
      : (account as Account).openingBalance.value;
    const derivedBalanceVal = isDto
      ? (account as any).derivedBalance ?? (account as AccountDTO).openingBalance
      : (account as Account).openingBalance.value;
    const isDefaultBool = isDto ? (account as AccountDTO).isDefault : (account as Account).isDefault;
    const isArchivedBool = isDto ? (account as AccountDTO).isArchived : (account as Account).isArchived;
    const archivedAtIso = isDto
      ? (account as AccountDTO).archivedAt
      : ((account as Account).archivedAt ? (account as Account).archivedAt!.toISOString() : null);
    const createdAtIso = isDto
      ? (account as AccountDTO).createdAt
      : (account as Account).createdAt.toISOString();

    const formattedOpening = AccountViewModelMapper.formatCurrency(
      openingBalanceVal,
      currencyStr,
      decimalPrecision
    );

    const formattedDerived = AccountViewModelMapper.formatCurrency(
      derivedBalanceVal,
      currencyStr,
      decimalPrecision
    );

    return {
      id: idStr,
      name: nameStr,
      type: typeStr as AccountTypeKind,
      typeLabel: AccountViewModelMapper.TYPE_LABEL_MAP[typeStr] ?? typeStr,
      currencyCode: currencyStr,
      openingBalance: openingBalanceVal,
      formattedOpeningBalance: formattedOpening,
      derivedBalance: derivedBalanceVal,
      formattedDerivedBalance: formattedDerived,
      isDefault: isDefaultBool,
      isArchived: isArchivedBool,
      archivedAt: archivedAtIso,
      createdAt: createdAtIso,
    };
  }

  public static formatCurrency(amount: number, currencyCode: string, precision = 2): string {
    const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    const symbol = currencyCode === 'INR' ? '₹' : `${currencyCode} `;
    const fixedAmount = safeAmount.toLocaleString('en-IN', {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    });
    return `${symbol}${fixedAmount}`;
  }
}
