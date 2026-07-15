import { BudgetId } from '../value-objects/BudgetId';
import { BudgetAmount } from '../value-objects/BudgetAmount';
import { BudgetPeriod } from '../value-objects/BudgetPeriod';
import { BudgetStatus } from '../value-objects/BudgetStatus';
import { CategoryId } from '../../../categories/domain/value-objects/CategoryId';
import { CurrencyCode } from '../../../expenses/domain/value-objects/CurrencyCode';

export interface BudgetProps {
  id: BudgetId;
  categoryId: CategoryId | null;
  amount: BudgetAmount;
  currency: CurrencyCode;
  period: BudgetPeriod;
  status: BudgetStatus;
  deletedAt: Date | null;
}

export interface UpdateBudgetProps {
  amount?: BudgetAmount;
  status?: BudgetStatus;
  currency?: CurrencyCode;
  deletedAt?: Date | null;
}

export class Budget {
  public readonly id: BudgetId;
  public readonly categoryId: CategoryId | null;
  public readonly amount: BudgetAmount;
  public readonly currency: CurrencyCode;
  public readonly period: BudgetPeriod;
  public readonly status: BudgetStatus;
  public readonly deletedAt: Date | null;

  constructor(props: BudgetProps) {
    this.id = props.id;
    this.categoryId = props.categoryId;
    this.amount = props.amount;
    this.currency = props.currency;
    this.period = props.period;
    this.status = props.status;
    this.deletedAt = props.deletedAt;
    
    Object.freeze(this);
  }

  public update(request: UpdateBudgetProps): Budget {
    return new Budget({
      id: this.id,
      categoryId: this.categoryId,
      amount: request.amount ?? this.amount,
      currency: request.currency ?? this.currency,
      period: this.period,
      status: request.status ?? this.status,
      deletedAt: this.resolveOptional(request, 'deletedAt', this.deletedAt) ?? null,
    });
  }

  public isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  private resolveOptional<K extends keyof UpdateBudgetProps>(
    request: UpdateBudgetProps,
    key: K,
    currentValue: UpdateBudgetProps[K] | undefined
  ): UpdateBudgetProps[K] | undefined {
    return key in request ? request[key] : currentValue;
  }
}
