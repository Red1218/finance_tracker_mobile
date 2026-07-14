import { ExpenseDomainError } from '../errors/ExpenseDomainError';

export enum PaymentMethodType {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  UPI = 'UPI',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export class PaymentMethod {
  public readonly value: PaymentMethodType;

  constructor(value: PaymentMethodType | string) {
    if (!Object.values(PaymentMethodType).includes(value as PaymentMethodType)) {
      throw new ExpenseDomainError(
        'INVALID_PAYMENT_METHOD',
        `Payment method '${value}' is not supported.`
      );
    }

    this.value = value as PaymentMethodType;
    Object.freeze(this);
  }

  public equals(other: PaymentMethod): boolean {
    return this.value === other.value;
  }
}
