import { AccountId } from '../value-objects/AccountId';

export class AccountRestoredEvent {
  public readonly eventName = 'AccountRestored';
  public readonly occurredAt: Date;

  constructor(public readonly accountId: AccountId) {
    this.occurredAt = new Date();
    Object.freeze(this);
  }
}
