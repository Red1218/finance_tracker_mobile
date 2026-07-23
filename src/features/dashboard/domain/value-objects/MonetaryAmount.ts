export class MonetaryAmount {
  constructor(
    public readonly amount: number,
    public readonly currency: string
  ) {
    if (!currency || currency.trim() === '') {
      throw new Error('MonetaryAmount must carry a valid currency code');
    }
  }

  add(other: MonetaryAmount): MonetaryAmount {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add amounts with different currencies');
    }
    return new MonetaryAmount(this.amount + other.amount, this.currency);
  }

  subtract(other: MonetaryAmount): MonetaryAmount {
    if (this.currency !== other.currency) {
      throw new Error('Cannot subtract amounts with different currencies');
    }
    return new MonetaryAmount(this.amount - other.amount, this.currency);
  }

  format(locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: this.currency }).format(this.amount);
  }
}
