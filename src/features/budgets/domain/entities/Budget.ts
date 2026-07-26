import { BudgetId } from '../value-objects/BudgetId';
import { BudgetAmount } from '../value-objects/BudgetAmount';
import { BudgetPeriod } from '../value-objects/BudgetPeriod';
import { BudgetDomainError } from '../errors/BudgetDomainError';
import { CategoryId } from '../../../categories/domain/value-objects/CategoryId';
import { CurrencyCode } from '../../../expenses/domain/value-objects/CurrencyCode';

export interface BudgetProps {
  id: BudgetId;
  categoryId: CategoryId | null; // null represents Overall Budget
  amount: BudgetAmount;
  currency: CurrencyCode;
  period: BudgetPeriod;
  archivedAt?: Date | null;
}

export class Budget {
  public readonly id: BudgetId;
  public readonly categoryId: CategoryId | null;
  public readonly amount: BudgetAmount;
  public readonly currency: CurrencyCode;
  public readonly period: BudgetPeriod;
  public readonly archivedAt: Date | null;

  constructor(props: BudgetProps) {
    this.id = props.id;
    this.categoryId = props.categoryId;
    this.amount = props.amount;
    this.currency = props.currency;
    this.period = props.period;
    this.archivedAt = props.archivedAt ?? null;

    Object.freeze(this);
  }

  public get isArchived(): boolean {
    return this.archivedAt !== null;
  }

  public get isOverall(): boolean {
    return this.categoryId === null;
  }

  public get startDate(): Date {
    return this.period.startDate;
  }

  public get endDate(): Date {
    return this.period.endDate;
  }

  public static create(props: BudgetProps, categoryIsActive: boolean = true): Budget {
    if (props.categoryId && !categoryIsActive) {
      throw new BudgetDomainError(
        'CATEGORY_INACTIVE',
        'Inactive or archived categories cannot receive new budgets.',
        { categoryId: props.categoryId.value }
      );
    }
    return new Budget(props);
  }

  public updateAmount(newAmount: BudgetAmount, currentDate: Date = new Date()): Budget {
    if (this.isArchived) {
      throw new BudgetDomainError(
        'BUDGET_ALREADY_ARCHIVED',
        'Archived budgets cannot be updated.'
      );
    }

    if (this.isHistorical(currentDate)) {
      throw new BudgetDomainError(
        'HISTORICAL_BUDGET_IMMUTABLE',
        'Historical budgets remain immutable.',
        { budgetId: this.id.value, currentDate: currentDate.toISOString(), endDate: this.endDate.toISOString() }
      );
    }

    return new Budget({
      id: this.id,
      categoryId: this.categoryId,
      amount: newAmount,
      currency: this.currency,
      period: this.period,
      archivedAt: this.archivedAt,
    });
  }

  public archive(archivedAt: Date = new Date()): Budget {
    if (this.isArchived) {
      throw new BudgetDomainError(
        'BUDGET_ALREADY_ARCHIVED',
        'Budget is already archived.'
      );
    }

    return new Budget({
      id: this.id,
      categoryId: this.categoryId,
      amount: this.amount,
      currency: this.currency,
      period: this.period,
      archivedAt,
    });
  }

  public restore(): Budget {
    if (!this.isArchived) {
      throw new BudgetDomainError(
        'BUDGET_NOT_ARCHIVED',
        'Budget is not archived.'
      );
    }

    return new Budget({
      id: this.id,
      categoryId: this.categoryId,
      amount: this.amount,
      currency: this.currency,
      period: this.period,
      archivedAt: null,
    });
  }

  public isHistorical(currentDate: Date = new Date()): boolean {
    return this.period.endDate < currentDate;
  }

  public equals(other: Budget): boolean {
    return this.id.equals(other.id);
  }
}
