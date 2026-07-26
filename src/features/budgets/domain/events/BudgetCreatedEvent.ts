import { Budget } from '../entities/Budget';

export class BudgetCreatedEvent {
  public readonly occurredAt: Date;

  constructor(public readonly budget: Budget) {
    this.occurredAt = new Date();
    Object.freeze(this);
  }
}
