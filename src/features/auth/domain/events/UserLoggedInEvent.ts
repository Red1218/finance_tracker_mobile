import { UserId } from '../value-objects/UserId';
import { EmailAddress } from '../value-objects/EmailAddress';

export class UserLoggedInEvent {
  public readonly eventName = 'UserLoggedInEvent';
  public readonly occurredAt: Date;

  constructor(
    public readonly userId: UserId,
    public readonly email: EmailAddress,
    occurredAt?: Date
  ) {
    this.occurredAt = occurredAt ?? new Date();
    Object.freeze(this);
  }
}
