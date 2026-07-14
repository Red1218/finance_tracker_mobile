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

  constructor(props: ExpenseProps) {
    this.id = props.id;
    this.categoryId = props.categoryId;
    this.amount = props.amount;
    this.currency = props.currency;
    this.date = props.date;
    this.paymentMethod = props.paymentMethod;
    this.note = props.note;
    this.merchant = props.merchant;
    
    Object.freeze(this);
  }

  public update(request: UpdateExpenseRequest): Expense {
    return new Expense({
      id: this.id,
      categoryId: request.categoryId ?? this.categoryId,
      amount: request.amount ?? this.amount,
      currency: request.currency ?? this.currency,
      date: request.date ?? this.date,
      paymentMethod: request.paymentMethod ?? this.paymentMethod,
      note: this.resolveOptional(request, 'note', this.note),
      merchant: this.resolveOptional(request, 'merchant', this.merchant),
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
