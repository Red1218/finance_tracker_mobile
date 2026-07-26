import { Budget } from '../entities/Budget';

export class BudgetUpdatedEvent {
  public readonly occurredAt: Date;

  constructor(
    public readonly budget: Budget,
    public readonly previousAmount: number
  ) {
    this.occurredAt = new Date();
    Object.freeze(this);
  }
}
