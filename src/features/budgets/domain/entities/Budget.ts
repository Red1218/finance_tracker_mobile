import { BudgetId } from '../value-objects/BudgetId';
import { BudgetAmount } from '../value-objects/BudgetAmount';
import { BudgetPeriod } from '../value-objects/BudgetPeriod';
import { BudgetDomainError } from '../errors/BudgetDomainError';
import { CategoryId } from '../../../categories/domain/value-objects/CategoryId';
import { CurrencyCode } from '../../../expenses/domain/value-objects/CurrencyCode';

export interface BudgetProps {
  id: BudgetId;
  categoryId: CategoryId | null; // null means overall budget
  amount: BudgetAmount;
  currency: CurrencyCode;
  period: BudgetPeriod;
  startDate: Date;
  endDate: Date;
}

export class Budget {
  public readonly id: BudgetId;
  public readonly categoryId: CategoryId | null;
  public readonly amount: BudgetAmount;
  public readonly currency: CurrencyCode;
  public readonly period: BudgetPeriod;
  public readonly startDate: Date;
  public readonly endDate: Date;

  private constructor(props: BudgetProps) {
    this.validate(props);

    this.id = props.id;
    this.categoryId = props.categoryId;
    this.amount = props.amount;
    this.currency = props.currency;
    this.period = props.period;
    this.startDate = props.startDate;
    this.endDate = props.endDate;

    Object.freeze(this);
  }

  private validate(props: BudgetProps): void {
    if (props.startDate >= props.endDate) {
      throw new BudgetDomainError(
        'INVALID_DATE_RANGE', 
        'Budget start date must be before end date.'
      );
    }
  }

  public static create(
    props: BudgetProps, 
    categoryIsActive: boolean = true
  ): Budget {
    if (props.categoryId && !categoryIsActive) {
      throw new BudgetDomainError(
        'CATEGORY_INACTIVE',
        'Inactive or archived categories cannot receive new budgets.',
        { categoryId: props.categoryId.value }
      );
    }
    return new Budget(props);
  }

  public static restore(props: BudgetProps): Budget {
    return new Budget(props);
  }

  public updateAmount(newAmount: BudgetAmount, currentDate: Date = new Date()): Budget {
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
      startDate: this.startDate,
      endDate: this.endDate,
    });
  }

  public isHistorical(currentDate: Date = new Date()): boolean {
    return this.endDate < currentDate;
  }

  public equals(other: Budget): boolean {
    return this.id.equals(other.id);
  }
}
