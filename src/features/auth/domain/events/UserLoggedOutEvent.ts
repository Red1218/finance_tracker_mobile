import { UserId } from '../value-objects/UserId';

export class UserLoggedOutEvent {
  public readonly eventName = 'UserLoggedOutEvent';
  public readonly occurredAt: Date;

  constructor(
    public readonly userId: UserId,
    occurredAt?: Date
  ) {
    this.occurredAt = occurredAt ?? new Date();
    Object.freeze(this);
  }
}
