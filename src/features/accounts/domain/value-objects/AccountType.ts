export enum AccountTypeKind {
  Cash = 'CASH',
  Bank = 'BANK',
  CreditCard = 'CREDIT_CARD',
  Wallet = 'WALLET',
}

export class AccountType {
  public readonly kind: AccountTypeKind;

  constructor(kind: AccountTypeKind) {
    this.kind = kind;
    Object.freeze(this);
  }

  public isCredit(): boolean {
    return this.kind === AccountTypeKind.CreditCard;
  }

  public isAsset(): boolean {
    return (
      this.kind === AccountTypeKind.Cash ||
      this.kind === AccountTypeKind.Bank ||
      this.kind === AccountTypeKind.Wallet
    );
  }

  public canHaveNegativeBalance(): boolean {
    // Credit cards or overdraft bank accounts can have negative balance (debt)
    return this.kind === AccountTypeKind.CreditCard || this.kind === AccountTypeKind.Bank;
  }

  public equals(other: AccountType): boolean {
    return this.kind === other.kind;
  }
}
