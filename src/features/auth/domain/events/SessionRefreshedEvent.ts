import { UserId } from '../value-objects/UserId';

export class SessionRefreshedEvent {
  public readonly eventName = 'SessionRefreshedEvent';
  public readonly occurredAt: Date;

  constructor(
    public readonly userId: UserId,
    public readonly newExpiresAt: Date,
    occurredAt?: Date
  ) {
    this.occurredAt = occurredAt ?? new Date();
    Object.freeze(this);
  }
}
