import { Budget } from '../entities/Budget';

export class BudgetExceededEvent {
  public readonly occurredAt: Date;

  constructor(
    public readonly budget: Budget,
    public readonly spentAmount: number
  ) {
    this.occurredAt = new Date();
    Object.freeze(this);
  }
}
