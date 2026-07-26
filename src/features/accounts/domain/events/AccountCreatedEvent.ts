import { AccountId } from '../value-objects/AccountId';

export class AccountCreatedEvent {
  public readonly eventName = 'AccountCreated';
  public readonly occurredAt: Date;

  constructor(public readonly accountId: AccountId, public readonly name: string) {
    this.occurredAt = new Date();
    Object.freeze(this);
  }
}
