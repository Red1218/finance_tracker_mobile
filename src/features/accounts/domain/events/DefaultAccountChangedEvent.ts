import { AccountId } from '../value-objects/AccountId';

export class DefaultAccountChangedEvent {
  public readonly eventName = 'DefaultAccountChanged';
  public readonly occurredAt: Date;

  constructor(
    public readonly newDefaultAccountId: AccountId,
    public readonly previousDefaultAccountId: AccountId | null
  ) {
    this.occurredAt = new Date();
    Object.freeze(this);
  }
}
