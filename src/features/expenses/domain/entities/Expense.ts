import { ExpenseId } from '../value-objects/ExpenseId';
import { ExpenseAmount } from '../value-objects/ExpenseAmount';
import { CurrencyCode } from '../value-objects/CurrencyCode';
import { ExpenseDate } from '../value-objects/ExpenseDate';
import { ExpenseNote } from '../value-objects/ExpenseNote';
import { MerchantName } from '../value-objects/MerchantName';
import { PaymentMethod } from '../value-objects/PaymentMethod';
import { CategoryId } from '../../../categories/domain/value-objects/CategoryId';

export interface ExpenseProps {
  id: ExpenseId;
  categoryId: CategoryId;
  amount: ExpenseAmount;
  currency: CurrencyCode;
  date: ExpenseDate;
  paymentMethod: PaymentMethod;
  note?: ExpenseNote;
  merchant?: MerchantName;
  deletedAt?: Date;
}

export interface UpdateExpenseRequest {
  categoryId?: CategoryId;
  amount?: ExpenseAmount;
  currency?: CurrencyCode;
  date?: ExpenseDate;
  paymentMethod?: PaymentMethod;
  note?: ExpenseNote;
  merchant?: MerchantName;
}

export class Expense {
  public readonly id: ExpenseId;
  public readonly categoryId: CategoryId;
  public readonly amount: ExpenseAmount;
  public readonly currency: CurrencyCode;
  public readonly date: ExpenseDate;
  public readonly paymentMethod: PaymentMethod;
  public readonly note?: ExpenseNote;
  public readonly merchant?: MerchantName;
  public readonly deletedAt?: Date;

  constructor(props: ExpenseProps) {
    this.id = props.id;
    this.categoryId = props.categoryId;
    this.amount = props.amount;
    this.currency = props.currency;
    this.date = props.date;
    this.paymentMethod = props.paymentMethod;
    this.note = props.note;
    this.merchant = props.merchant;
    this.deletedAt = props.deletedAt;
    
    Object.freeze(this);
  }

  public get isDeleted(): boolean {
    return this.deletedAt !== undefined;
  }

  public update(request: UpdateExpenseRequest): Expense {
    if (this.isDeleted) {
      throw new Error('EXPENSE_ALREADY_DELETED');
    }
    return new Expense({
      id: this.id,
      categoryId: request.categoryId ?? this.categoryId,
      amount: request.amount ?? this.amount,
      currency: request.currency ?? this.currency,
      date: request.date ?? this.date,
      paymentMethod: request.paymentMethod ?? this.paymentMethod,
      note: this.resolveOptional(request, 'note', this.note),
      merchant: this.resolveOptional(request, 'merchant', this.merchant),
      deletedAt: this.deletedAt,
    });
  }

  public delete(deletedAt: Date = new Date()): Expense {
    if (this.isDeleted) {
      throw new Error('EXPENSE_ALREADY_DELETED'); // Handled strictly in use case, but protective here
    }
    return new Expense({
      id: this.id,
      categoryId: this.categoryId,
      amount: this.amount,
      currency: this.currency,
      date: this.date,
      paymentMethod: this.paymentMethod,
      note: this.note,
      merchant: this.merchant,
      deletedAt,
    });
  }

  public restore(): Expense {
    if (!this.isDeleted) {
      throw new Error('EXPENSE_NOT_DELETED');
    }
    return new Expense({
      id: this.id,
      categoryId: this.categoryId,
      amount: this.amount,
      currency: this.currency,
      date: this.date,
      paymentMethod: this.paymentMethod,
      note: this.note,
      merchant: this.merchant,
      deletedAt: undefined,
    });
  }

  private resolveOptional<K extends keyof UpdateExpenseRequest>(
    request: UpdateExpenseRequest,
    key: K,
    currentValue: UpdateExpenseRequest[K] | undefined
  ): UpdateExpenseRequest[K] | undefined {
    return key in request ? request[key] : currentValue;
  }
}
