import { Category } from '../entities/Category';

export class CategoryRenamedEvent {
  public readonly occurredAt: Date;

  constructor(
    public readonly category: Category,
    public readonly previousName: string
  ) {
    this.occurredAt = new Date();
    Object.freeze(this);
  }
}
