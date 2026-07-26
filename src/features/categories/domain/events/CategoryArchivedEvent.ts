import { Category } from '../entities/Category';

export class CategoryArchivedEvent {
  public readonly occurredAt: Date;

  constructor(public readonly category: Category) {
    this.occurredAt = new Date();
    Object.freeze(this);
  }
}
